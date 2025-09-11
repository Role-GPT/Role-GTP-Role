/**
 * Search Routing Service - 3단 라우팅 시스템
 * 
 * Role → Category → Source 라우팅 아키텍처
 * - JSON 설정 기반 동적 라우팅
 * - Trial/BYOK 통합 관리
 * - 헬스체크 및 쿼터 관리
 * - 카테고리별 가중치 및 우선순위 제어
 * 
 * @version 1.0
 */

// 설정 스키마 타입 정의
export interface SearchConfig {
  version: string;
  trial: TrialConfig;
  byok: BYOKConfig;
  routing: RoutingConfig;
  categories: CategoryConfig[];
  providers: Record<string, ProviderConfig>;
  role_overrides?: Record<string, RoleOverride>;
}

export interface TrialConfig {
  enabled: boolean;
  per_user_daily: Record<string, number>;
  copy: {
    limit_hit: string;
  };
}

export interface BYOKConfig {
  store: 'browser' | 'server' | 'encrypted';
  encryption: 'local' | 'server' | 'none';
}

export interface RoutingConfig {
  category_policy: 'one_per_category' | 'parallel';
  fallback: 'next_available' | 'none' | 'trial_only';
  timeout_ms: number;
  cache_ttl_sec: Record<string, number>;
}

export interface CategoryConfig {
  id: string;
  label: string;
  enabled: boolean;
  selection: 'weighted' | 'priority' | 'round_robin';
  max_parallel: number;
  providers: string[];
}

export interface ProviderConfig {
  label: string;
  category: string;
  base_url: string;
  key_type: 'none' | 'byok' | 'oauth';
  trial_applies: boolean;
  weight?: number;
  endpoints?: Record<string, string>;
  headers?: Record<string, string>;
  health?: HealthCheckConfig;
  quota?: QuotaConfig;
}

export interface HealthCheckConfig {
  probe: string;
  interval_sec: number;
  timeout_ms?: number;
  retry_count?: number;
}

export interface QuotaConfig {
  provider_daily?: number;
  provider_monthly?: number;
  user_daily?: number;
  user_monthly?: number;
}

export interface RoleOverride {
  enabled_categories?: string[];
  pin?: string[];
  weights?: Record<string, number>;
  disable?: string[];
}

// 검색 요청 및 응답 타입
export interface SearchRequest {
  query: string;
  roleId: string;
  categories?: string[];
  maxResults?: number;
  includeTrialSources?: boolean;
  forceByokOnly?: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  sources_used: string[];
  categories_searched: string[];
  trial_quota_used: Record<string, number>;
  byok_calls_made: number;
  search_time_ms: number;
  fallback_used: boolean;
  errors: SearchError[];
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  category: string;
  confidence: number;
  published_date?: Date;
  image_url?: string;
  metadata?: Record<string, any>;
}

export interface SearchError {
  provider: string;
  category: string;
  error: string;
  is_quota_exceeded: boolean;
  is_health_failed: boolean;
}

// 사용량 추적
export interface UsageTracker {
  daily_trial_usage: Record<string, Record<string, number>>;
  daily_byok_calls: Record<string, number>;
  provider_health: Record<string, ProviderHealth>;
  last_reset_date: string;
}

export interface ProviderHealth {
  is_healthy: boolean;
  last_check: Date;
  consecutive_failures: number;
  last_error?: string;
}

/**
 * 검색 라우팅 서비스 메인 클래스
 */
export class SearchRoutingService {
  private config: SearchConfig;
  private usage: UsageTracker;
  private userKeys: Record<string, any> = {};
  
  constructor(config: SearchConfig) {
    this.config = config;
    this.usage = this.initializeUsage();
    this.startHealthCheckInterval();
  }

  /**
   * 메인 검색 실행 함수
   * Role → Category → Source 3단 라우팅
   */
  async search(request: SearchRequest): Promise<SearchResponse> {
    const startTime = Date.now();
    const results: SearchResult[] = [];
    const sourcesUsed: string[] = [];
    const categoriesSearched: string[] = [];
    const errors: SearchError[] = [];
    let fallbackUsed = false;
    
    try {
      // 1단계: Role 기반 카테고리 필터링
      const enabledCategories = this.getEnabledCategoriesForRole(
        request.roleId, 
        request.categories
      );
      
      if (enabledCategories.length === 0) {
        throw new Error('검색 가능한 카테고리가 없습니다');
      }

      // 2단계: 카테고리별 소스 선택 및 실행
      const searchPromises = enabledCategories.map(async (categoryId) => {
        try {
          const categoryResults = await this.searchCategory(
            categoryId,
            request,
            sourcesUsed
          );
          categoriesSearched.push(categoryId);
          return categoryResults;
        } catch (error) {
          errors.push({
            provider: 'category',
            category: categoryId,
            error: error instanceof Error ? error.message : '알 수 없는 오류',
            is_quota_exceeded: false,
            is_health_failed: false
          });
          return [];
        }
      });

      // 모든 카테고리 검색 완료 대기
      const categoryResults = await Promise.allSettled(searchPromises);
      
      categoryResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(...result.value);
        } else {
          const categoryId = enabledCategories[index];
          errors.push({
            provider: 'category',
            category: categoryId,
            error: result.reason?.message || '카테고리 검색 실패',
            is_quota_exceeded: false,
            is_health_failed: false
          });
        }
      });

      // 3단계: Fallback 처리
      if (results.length === 0 && this.config.routing.fallback === 'next_available') {
        const fallbackResults = await this.executeFallback(request);
        results.push(...fallbackResults.results);
        sourcesUsed.push(...fallbackResults.sources);
        fallbackUsed = true;
      }

      // 결과 정리 및 랭킹
      const finalResults = this.rankAndDeduplicateResults(
        results, 
        request.query,
        request.maxResults || 20
      );

      return {
        results: finalResults,
        sources_used: [...new Set(sourcesUsed)],
        categories_searched: categoriesSearched,
        trial_quota_used: this.getTrialUsageForToday(),
        byok_calls_made: this.getBYOKCallsForToday(),
        search_time_ms: Date.now() - startTime,
        fallback_used,
        errors
      };

    } catch (error) {
      console.error('검색 라우팅 오류:', error);
      
      return {
        results: [],
        sources_used: [],
        categories_searched: [],
        trial_quota_used: {},
        byok_calls_made: 0,
        search_time_ms: Date.now() - startTime,
        fallback_used: false,
        errors: [{
          provider: 'router',
          category: 'system',
          error: error instanceof Error ? error.message : '시스템 오류',
          is_quota_exceeded: false,
          is_health_failed: false
        }]
      };
    }
  }

  /**
   * 특정 카테고리에서 검색 실행
   */
  private async searchCategory(
    categoryId: string,
    request: SearchRequest,
    sourcesUsed: string[]
  ): Promise<SearchResult[]> {
    const category = this.config.categories.find(c => c.id === categoryId);
    if (!category || !category.enabled) {
      throw new Error(`카테고리 '${categoryId}'를 찾을 수 없거나 비활성화됨`);
    }

    // 사용 가능한 소스 필터링
    const availableSources = this.getAvailableSourcesForCategory(category, request);
    
    if (availableSources.length === 0) {
      throw new Error(`카테고리 '${categoryId}'에 사용 가능한 소스가 없음`);
    }

    // 소스 선택 (가중치/우선순위 기반)
    const selectedSources = this.selectSourcesForCategory(category, availableSources);
    
    // 병렬/순차 실행 결정
    const maxParallel = Math.min(category.max_parallel, selectedSources.length);
    const sourcesToExecute = selectedSources.slice(0, maxParallel);

    const results: SearchResult[] = [];
    
    // 소스별 검색 실행
    for (const sourceId of sourcesToExecute) {
      try {
        const sourceResults = await this.executeSourceSearch(
          sourceId,
          request,
          category
        );
        results.push(...sourceResults);
        sourcesUsed.push(sourceId);
        
        // 사용량 추적
        this.trackUsage(sourceId, request);
        
      } catch (error) {
        console.warn(`소스 '${sourceId}' 검색 실패:`, error);
        // 오류는 상위에서 처리하도록 전파하지 않음
      }
    }

    return results;
  }

  /**
   * Role에 따른 카테고리 필터링
   */
  private getEnabledCategoriesForRole(
    roleId: string,
    requestedCategories?: string[]
  ): string[] {
    const roleOverride = this.config.role_overrides?.[roleId];
    
    let enabledCategories = this.config.categories
      .filter(c => c.enabled)
      .map(c => c.id);

    // Role 오버라이드 적용
    if (roleOverride) {
      if (roleOverride.enabled_categories) {
        enabledCategories = enabledCategories.filter(
          c => roleOverride.enabled_categories!.includes(c)
        );
      }
    }

    // 사용자 요청 카테고리 필터링
    if (requestedCategories && requestedCategories.length > 0) {
      enabledCategories = enabledCategories.filter(
        c => requestedCategories.includes(c)
      );
    }

    return enabledCategories;
  }

  /**
   * 카테고리별 사용 가능한 소스 필터링
   * 4가지 조건: 키·쿼터·헬스체크·토글
   */
  private getAvailableSourcesForCategory(
    category: CategoryConfig,
    request: SearchRequest
  ): string[] {
    return category.providers.filter(providerId => {
      const provider = this.config.providers[providerId];
      if (!provider) return false;

      // 1. 토글 체크
      if (!category.enabled) return false;

      // 2. 키 체크
      if (provider.key_type === 'byok') {
        const hasValidKey = this.hasValidKey(providerId);
        if (!hasValidKey && !request.includeTrialSources) return false;
      }

      // 3. 쿼터 체크
      if (!this.hasQuotaRemaining(providerId, provider)) return false;

      // 4. 헬스체크
      if (!this.isProviderHealthy(providerId)) return false;

      return true;
    });
  }

  /**
   * 카테고리별 소스 선택 (가중치/우선순위 기반)
   */
  private selectSourcesForCategory(
    category: CategoryConfig,
    availableSources: string[]
  ): string[] {
    const roleOverride = this.config.role_overrides?.[category.id];
    
    switch (category.selection) {
      case 'weighted':
        return this.selectByWeight(availableSources, roleOverride?.weights);
      
      case 'priority':
        return this.selectByPriority(availableSources, roleOverride?.pin);
      
      case 'round_robin':
        return this.selectByRoundRobin(availableSources);
      
      default:
        return availableSources;
    }
  }

  /**
   * 가중치 기반 소스 선택
   */
  private selectByWeight(
    sources: string[],
    overrideWeights?: Record<string, number>
  ): string[] {
    const weights = sources.map(sourceId => {
      const provider = this.config.providers[sourceId];
      const baseWeight = provider?.weight || 10;
      const overrideWeight = overrideWeights?.[sourceId];
      return overrideWeight !== undefined ? overrideWeight : baseWeight;
    });

    // 가중치에 따른 정렬
    const sourcesWithWeights = sources.map((source, index) => ({
      source,
      weight: weights[index]
    }));

    sourcesWithWeights.sort((a, b) => b.weight - a.weight);
    return sourcesWithWeights.map(item => item.source);
  }

  /**
   * 우선순위 기반 소스 선택
   */
  private selectByPriority(
    sources: string[],
    pinnedSources?: string[]
  ): string[] {
    if (!pinnedSources) return sources;

    // 고정된 소스를 먼저, 나머지는 원래 순서
    const pinned = pinnedSources.filter(s => sources.includes(s));
    const others = sources.filter(s => !pinnedSources.includes(s));
    
    return [...pinned, ...others];
  }

  /**
   * 라운드 로빈 소스 선택
   */
  private selectByRoundRobin(sources: string[]): string[] {
    // 간단한 라운드 로빈 구현 (실제로는 더 복잡한 로직 필요)
    const now = Date.now();
    const index = Math.floor(now / 60000) % sources.length; // 1분마다 순환
    return [sources[index], ...sources.slice(index + 1), ...sources.slice(0, index)];
  }

  /**
   * 개별 소스에서 검색 실행
   */
  private async executeSourceSearch(
    sourceId: string,
    request: SearchRequest,
    category: CategoryConfig
  ): Promise<SearchResult[]> {
    const provider = this.config.providers[sourceId];
    if (!provider) {
      throw new Error(`프로바이더 '${sourceId}'를 찾을 수 없음`);
    }

    // 실제 검색 서비스 호출
    const results = await this.callProviderAPI(sourceId, provider, request);
    
    // 결과를 표준 형식으로 변환
    return results.map(result => ({
      ...result,
      source: sourceId,
      category: category.id,
      confidence: this.calculateConfidence(result, provider)
    }));
  }

  /**
   * 실제 프로바이더 API 호출
   */
  private async callProviderAPI(
    sourceId: string,
    provider: ProviderConfig,
    request: SearchRequest
  ): Promise<Partial<SearchResult>[]> {
    // 기존 검색 서비스들과 연동
    switch (sourceId) {
      case 'wikimedia':
        return this.callWikipediaAPI(request);
      
      case 'bing':
        return this.callBingAPI(request);
      
      case 'google_cse':
        return this.callGoogleCSEAPI(request);
      
      case 'serper':
        return this.callSerperAPI(request);
      
      case 'serpapi':
        return this.callSerpAPI(request);
      
      case 'naver_news':
        return this.callNaverAPI(request, 'news');
      
      case 'naver_blog':
        return this.callNaverAPI(request, 'blog');
      
      case 'arxiv':
        return this.callArxivAPI(request);
      
      case 'pubmed':
        return this.callPubmedAPI(request);
      
      case 'openalex':
        return this.callOpenAlexAPI(request);
      
      case 'semanticscholar':
        return this.callSemanticScholarAPI(request);
      
      default:
        throw new Error(`지원하지 않는 소스: ${sourceId}`);
    }
  }

  /**
   * 기존 검색 서비스들과의 연동 메서드들
   */
  private async callWikipediaAPI(request: SearchRequest): Promise<Partial<SearchResult>[]> {
    try {
      const { searchWikipedia } = await import('./wikipediaService');
      const results = await searchWikipedia(request.query, 3);
      
      return results.map(result => ({
        id: `wiki-${result.title}`,
        title: result.title,
        url: result.url,
        snippet: result.extract,
        confidence: 0.9
      }));
    } catch (error) {
      console.error('Wikipedia API 호출 실패:', error);
      return [];
    }
  }

  private async callBingAPI(request: SearchRequest): Promise<Partial<SearchResult>[]> {
    try {
      const { searchBingUnified } = await import('./bingSearchService');
      const config = this.getBingConfig();
      
      if (!config) throw new Error('Bing API 키가 설정되지 않음');
      
      const results = await searchBingUnified(request.query, config, {
        includeNews: true,
        webCount: 5,
        newsCount: 3
      });
      
      const formatted: Partial<SearchResult>[] = [];
      
      // 웹 결과
      formatted.push(...results.web.map(item => ({
        id: `bing-web-${item.id}`,
        title: item.name,
        url: item.url,
        snippet: item.snippet,
        confidence: 0.8
      })));
      
      // 뉴스 결과
      formatted.push(...results.news.map(item => ({
        id: `bing-news-${item.id}`,
        title: item.name,
        url: item.url,
        snippet: item.description,
        published_date: new Date(item.datePublished),
        confidence: 0.8
      })));
      
      return formatted;
    } catch (error) {
      console.error('Bing API 호출 실패:', error);
      return [];
    }
  }

  private async callGoogleCSEAPI(request: SearchRequest): Promise<Partial<SearchResult>[]> {
    try {
      const { searchGoogleCSEUnified } = await import('./googleCustomSearchService');
      const config = this.getGoogleCSEConfig();
      
      if (!config) throw new Error('Google CSE API 키가 설정되지 않음');
      
      const results = await searchGoogleCSEUnified(request.query, config, {
        includeImages: false,
        webCount: 8
      });
      
      return results.web.map(item => ({
        id: `google-cse-${item.link}`,
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        confidence: 0.9
      }));
    } catch (error) {
      console.error('Google CSE API 호출 실패:', error);
      return [];
    }
  }

  private async callSerperAPI(request: SearchRequest): Promise<Partial<SearchResult>[]> {
    try {
      const { searchSerperUnified } = await import('./serperSearchService');
      const config = this.getSerperConfig();
      
      if (!config) throw new Error('Serper API 키가 설정되지 않음');
      
      const results = await searchSerperUnified(request.query, config, {
        includeNews: true,
        webCount: 6,
        newsCount: 3
      });
      
      const formatted: Partial<SearchResult>[] = [];
      
      // 웹 결과
      formatted.push(...results.web.map(item => ({
        id: `serper-web-${item.position}`,
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        confidence: 0.85
      })));
      
      // 뉴스 결과
      formatted.push(...results.news.map(item => ({
        id: `serper-news-${item.position}`,
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        published_date: new Date(item.date),
        image_url: item.imageUrl,
        confidence: 0.85
      })));
      
      return formatted;
    } catch (error) {
      console.error('Serper API 호출 실패:', error);
      return [];
    }
  }

  private async callSerpAPI(request: SearchRequest): Promise<Partial<SearchResult>[]> {
    try {
      const { searchSerpApiUnified } = await import('./serpApiService');
      const config = this.getSerpAPIConfig();
      
      if (!config) throw new Error('SerpAPI 키가 설정되지 않음');
      
      const results = await searchSerpApiUnified(request.query, config, {
        includeNews: true,
        webCount: 6,
        newsCount: 3
      });
      
      const formatted: Partial<SearchResult>[] = [];
      
      // 웹 결과
      formatted.push(...results.web.map(item => ({
        id: `serpapi-web-${item.position}`,
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        confidence: 0.85
      })));
      
      // 뉴스 결과
      formatted.push(...results.news.map(item => ({
        id: `serpapi-news-${item.position}`,
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        published_date: new Date(item.date),
        image_url: item.thumbnail,
        confidence: 0.85
      })));
      
      return formatted;
    } catch (error) {
      console.error('SerpAPI 호출 실패:', error);
      return [];
    }
  }

  private async callNaverAPI(request: SearchRequest, type: 'news' | 'blog'): Promise<Partial<SearchResult>[]> {
    try {
      const { searchNaver } = await import('./naverService');
      const results = await searchNaver(request.query, {
        display: 5,
        sort: type === 'news' ? 'date' : 'sim'
      }, type);
      
      return results.map(item => ({
        id: `naver-${type}-${item.link}`,
        title: item.title.replace(/<[^>]*>/g, ''),
        url: item.link,
        snippet: item.description.replace(/<[^>]*>/g, ''),
        published_date: new Date(type === 'news' ? item.pubDate : item.postdate),
        confidence: type === 'news' ? 0.8 : 0.7
      }));
    } catch (error) {
      console.error(`Naver ${type} API 호출 실패:`, error);
      return [];
    }
  }

  private async callArxivAPI(request: SearchRequest): Promise<Partial<SearchResult>[]> {
    // arXiv API 호출 구현
    try {
      const response = await fetch(
        `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(request.query)}&start=0&max_results=5`
      );
      
      if (!response.ok) {
        throw new Error(`arXiv API 오류: ${response.status}`);
      }
      
      const xmlText = await response.text();
      // XML 파싱은 간단하게 구현 (실제로는 더 정교한 파싱 필요)
      
      return []; // 임시로 빈 배열 반환
    } catch (error) {
      console.error('arXiv API 호출 실패:', error);
      return [];
    }
  }

  private async callPubmedAPI(request: SearchRequest): Promise<Partial<SearchResult>[]> {
    // PubMed API 호출 구현
    try {
      const response = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&term=${encodeURIComponent(request.query)}&retmax=5`
      );
      
      if (!response.ok) {
        throw new Error(`PubMed API 오류: ${response.status}`);
      }
      
      const data = await response.json();
      
      return []; // 임시로 빈 배열 반환
    } catch (error) {
      console.error('PubMed API 호출 실패:', error);
      return [];
    }
  }

  private async callOpenAlexAPI(request: SearchRequest): Promise<Partial<SearchResult>[]> {
    // OpenAlex API 호출 구현
    try {
      const response = await fetch(
        `https://api.openalex.org/works?search=${encodeURIComponent(request.query)}&per_page=5`,
        {
          headers: {
            'User-Agent': 'RoleGPT (contact@rolegpt.com)'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`OpenAlex API 오류: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.results?.map((work: any) => ({
        id: `openalex-${work.id}`,
        title: work.title,
        url: work.landing_page_url || work.doi,
        snippet: work.abstract || '요약 없음',
        published_date: work.publication_date ? new Date(work.publication_date) : undefined,
        confidence: 0.8
      })) || [];
    } catch (error) {
      console.error('OpenAlex API 호출 실패:', error);
      return [];
    }
  }

  private async callSemanticScholarAPI(request: SearchRequest): Promise<Partial<SearchResult>[]> {
    // Semantic Scholar API 호출 구현
    try {
      const apiKey = this.userKeys['semanticscholar'];
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }
      
      const response = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(request.query)}&limit=5&fields=title,authors,year,url,citationCount`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error(`Semantic Scholar API 오류: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.data?.map((paper: any) => ({
        id: `semantic-${paper.paperId}`,
        title: paper.title,
        url: paper.url,
        snippet: `저자: ${paper.authors?.map((a: any) => a.name).join(', ') || '알 수 없음'} (${paper.year || '연도 미상'}) - 인용: ${paper.citationCount || 0}회`,
        confidence: 0.85
      })) || [];
    } catch (error) {
      console.error('Semantic Scholar API 호출 실패:', error);
      return [];
    }
  }

  /**
   * 유틸리티 및 헬퍼 메서드들
   */
  private hasValidKey(providerId: string): boolean {
    const provider = this.config.providers[providerId];
    if (!provider || provider.key_type === 'none') return true;
    
    return !!this.userKeys[providerId];
  }

  private hasQuotaRemaining(providerId: string, provider: ProviderConfig): boolean {
    if (!provider.trial_applies) return true;
    
    const today = new Date().toISOString().split('T')[0];
    const category = provider.category;
    const todayUsage = this.usage.daily_trial_usage[today]?.[category] || 0;
    const dailyLimit = this.config.trial.per_user_daily[category] || 0;
    
    return todayUsage < dailyLimit;
  }

  private isProviderHealthy(providerId: string): boolean {
    const health = this.usage.provider_health[providerId];
    return health?.is_healthy !== false; // 기본값은 healthy
  }

  private calculateConfidence(result: Partial<SearchResult>, provider: ProviderConfig): number {
    let baseConfidence = 0.7;
    
    // 프로바이더별 기본 신뢰도
    if (provider.weight) {
      baseConfidence = Math.min(0.95, 0.5 + (provider.weight / 100));
    }
    
    return baseConfidence;
  }

  private trackUsage(sourceId: string, request: SearchRequest): void {
    const today = new Date().toISOString().split('T')[0];
    const provider = this.config.providers[sourceId];
    
    if (provider?.trial_applies) {
      if (!this.usage.daily_trial_usage[today]) {
        this.usage.daily_trial_usage[today] = {};
      }
      
      const category = provider.category;
      this.usage.daily_trial_usage[today][category] = 
        (this.usage.daily_trial_usage[today][category] || 0) + 1;
    }
    
    if (provider?.key_type === 'byok') {
      this.usage.daily_byok_calls[today] = 
        (this.usage.daily_byok_calls[today] || 0) + 1;
    }
  }

  private rankAndDeduplicateResults(
    results: SearchResult[],
    query: string,
    maxResults: number
  ): SearchResult[] {
    // 중복 제거 (URL 기준)
    const seen = new Set<string>();
    const deduplicated = results.filter(result => {
      const cleanUrl = result.url?.split('?')[0].toLowerCase();
      if (!cleanUrl || seen.has(cleanUrl)) return false;
      seen.add(cleanUrl);
      return true;
    });
    
    // 관련성 점수 계산 및 정렬
    const ranked = deduplicated
      .map(result => ({
        ...result,
        relevanceScore: this.calculateRelevanceScore(result, query)
      }))
      .sort((a, b) => {
        // 1차: 신뢰도
        if (Math.abs(a.confidence - b.confidence) > 0.1) {
          return b.confidence - a.confidence;
        }
        // 2차: 관련성
        return b.relevanceScore - a.relevanceScore;
      });
    
    return ranked.slice(0, maxResults);
  }

  private calculateRelevanceScore(result: SearchResult, query: string): number {
    const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 1);
    if (queryWords.length === 0) return 0.5;

    const titleMatches = queryWords.filter(word => 
      result.title?.toLowerCase().includes(word)
    ).length;
    
    const snippetMatches = queryWords.filter(word => 
      result.snippet?.toLowerCase().includes(word)
    ).length;

    return (titleMatches * 2 + snippetMatches) / (queryWords.length * 2);
  }

  private async executeFallback(request: SearchRequest): Promise<{
    results: SearchResult[];
    sources: string[];
  }> {
    // Fallback으로 안전한 소스들 사용 (API 키 불필요)
    const fallbackSources = ['wikimedia', 'arxiv', 'openalex'];
    const results: SearchResult[] = [];
    const sources: string[] = [];
    
    for (const sourceId of fallbackSources) {
      try {
        const sourceResults = await this.callProviderAPI(
          sourceId,
          this.config.providers[sourceId],
          request
        );
        
        const formattedResults = sourceResults.map(result => ({
          ...result,
          source: sourceId,
          category: 'fallback',
          confidence: (result.confidence || 0.7) * 0.8 // Fallback 보정
        })) as SearchResult[];
        
        results.push(...formattedResults);
        sources.push(sourceId);
        
        if (results.length >= 5) break; // 충분한 결과 확보 시 중단
      } catch (error) {
        console.warn(`Fallback 소스 '${sourceId}' 실패:`, error);
      }
    }
    
    return { results, sources };
  }

  /**
   * API 키 설정 관련 메서드들
   */
  private getBingConfig() {
    const apiKey = this.userKeys['bing'];
    return apiKey ? { apiKey } : null;
  }

  private getGoogleCSEConfig() {
    const apiKey = this.userKeys['google_cse'];
    const searchEngineId = this.userKeys['google_cse_cx'];
    return (apiKey && searchEngineId) ? { apiKey, searchEngineId } : null;
  }

  private getSerperConfig() {
    const apiKey = this.userKeys['serper'];
    return apiKey ? { apiKey } : null;
  }

  private getSerpAPIConfig() {
    const apiKey = this.userKeys['serpapi'];
    return apiKey ? { apiKey } : null;
  }

  /**
   * 헬스체크 시스템
   */
  private startHealthCheckInterval(): void {
    setInterval(() => {
      this.performHealthChecks();
    }, 5 * 60 * 1000); // 5분마다 헬스체크
  }

  private async performHealthChecks(): Promise<void> {
    const providersToCheck = Object.entries(this.config.providers)
      .filter(([_, provider]) => provider.health);

    for (const [providerId, provider] of providersToCheck) {
      try {
        await this.checkProviderHealth(providerId, provider);
      } catch (error) {
        console.warn(`헬스체크 실패 - ${providerId}:`, error);
      }
    }
  }

  private async checkProviderHealth(
    providerId: string,
    provider: ProviderConfig
  ): Promise<void> {
    if (!provider.health) return;

    const health = this.usage.provider_health[providerId] || {
      is_healthy: true,
      last_check: new Date(),
      consecutive_failures: 0
    };

    try {
      // 간단한 헬스체크 요청
      const response = await fetch(provider.base_url, {
        method: 'HEAD',
        timeout: provider.health.timeout_ms || 5000
      });

      if (response.ok) {
        health.is_healthy = true;
        health.consecutive_failures = 0;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      health.consecutive_failures++;
      health.last_error = error instanceof Error ? error.message : '알 수 없는 오류';
      
      // 3회 연속 실패 시 비정상으로 표시
      if (health.consecutive_failures >= 3) {
        health.is_healthy = false;
      }
    }

    health.last_check = new Date();
    this.usage.provider_health[providerId] = health;
  }

  /**
   * 사용량 추적 메서드들
   */
  private initializeUsage(): UsageTracker {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      daily_trial_usage: {},
      daily_byok_calls: {},
      provider_health: {},
      last_reset_date: today
    };
  }

  private getTrialUsageForToday(): Record<string, number> {
    const today = new Date().toISOString().split('T')[0];
    return this.usage.daily_trial_usage[today] || {};
  }

  private getBYOKCallsForToday(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.usage.daily_byok_calls[today] || 0;
  }

  /**
   * 설정 및 키 관리
   */
  setUserKeys(keys: Record<string, any>): void {
    this.userKeys = { ...keys };
  }

  updateConfig(newConfig: Partial<SearchConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getUsageStats(): UsageTracker {
    return { ...this.usage };
  }

  resetDailyUsage(): void {
    const today = new Date().toISOString().split('T')[0];
    this.usage.daily_trial_usage = {};
    this.usage.daily_byok_calls = {};
    this.usage.last_reset_date = today;
  }
}

// 기본 설정 내보내기
export { DEFAULT_SEARCH_CONFIG } from './searchConfig';
