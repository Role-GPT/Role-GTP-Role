/**
 * Unified Search Service - 통합 검색 시스템
 * 
 * 모든 검색 엔진 API를 통합 관리하는 서비스
 * - 자동 Fallback 시스템
 * - 결과 융합 및 중복 제거
 * - 사용자 설정 기반 라우팅
 * - BYOK (Bring Your Own Key) 지원
 * 
 * 지원하는 검색 엔진:
 * - 네이버 (기본 내장)
 * - Wikipedia (기본 내장)
 * - Bing Search (BYOK)
 * - Google Custom Search (BYOK)
 * - Serper.dev (BYOK)
 * - SerpAPI (BYOK)
 */

import { naverService } from './naverService';
import { searchWikipedia } from './wikipediaService';
import { 
  searchBingUnified, 
  BingSearchConfig,
  validateBingApiKey 
} from './bingSearchService';
import { 
  searchGoogleCSEUnified, 
  GoogleCSEConfig,
  validateGoogleCSEConfig 
} from './googleCustomSearchService';
import { 
  searchSerperUnified, 
  SerperConfig,
  validateSerperApiKey 
} from './serperSearchService';
import { 
  searchSerpApiUnified, 
  SerpApiConfig,
  validateSerpApiKey 
} from './serpApiService';

export interface SearchProvider {
  id: string;
  name: string;
  type: 'builtin' | 'byok';
  category: 'general' | 'news' | 'academic' | 'local';
  isEnabled: boolean;
  priority: number; // 1-10 (높을수록 우선)
  config?: any;
  lastUsed?: Date;
  errorCount?: number;
  successRate?: number;
}

export interface UnifiedSearchConfig {
  providers: SearchProvider[];
  maxResults: number;
  timeout: number; // ms
  enableFallback: boolean;
  deduplication: boolean;
  aggregateResults: boolean;
}

export interface UnifiedSearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  provider: string;
  confidence: number;
  publishedDate?: Date;
  imageUrl?: string;
  domain: string;
  type: 'web' | 'news' | 'image' | 'academic';
}

export interface SearchResponse {
  results: UnifiedSearchResult[];
  query: string;
  providers: string[];
  totalResults: number;
  searchTime: number;
  fallbackUsed: boolean;
  errors: Array<{
    provider: string;
    error: string;
  }>;
}

/**
 * 기본 검색 제공자 구성
 */
export const DEFAULT_SEARCH_PROVIDERS: SearchProvider[] = [
  {
    id: 'naver',
    name: '네이버',
    type: 'builtin',
    category: 'general',
    isEnabled: true,
    priority: 8
  },
  {
    id: 'wikipedia',
    name: '위키백과',
    type: 'builtin', 
    category: 'academic',
    isEnabled: true,
    priority: 7
  },
  {
    id: 'bing',
    name: 'Bing Search',
    type: 'byok',
    category: 'general',
    isEnabled: false,
    priority: 6
  },
  {
    id: 'google_cse',
    name: 'Google Custom Search',
    type: 'byok',
    category: 'general',
    isEnabled: false,
    priority: 9
  },
  {
    id: 'serper',
    name: 'Serper.dev',
    type: 'byok',
    category: 'general',
    isEnabled: false,
    priority: 8
  },
  {
    id: 'serpapi',
    name: 'SerpAPI',
    type: 'byok',
    category: 'general',
    isEnabled: false,
    priority: 7
  }
];

/**
 * 통합 검색 서비스 클래스
 */
export class UnifiedSearchService {
  private config: UnifiedSearchConfig;
  private providers: Map<string, SearchProvider>;

  constructor(config?: Partial<UnifiedSearchConfig>) {
    this.config = {
      providers: DEFAULT_SEARCH_PROVIDERS,
      maxResults: 20,
      timeout: 10000,
      enableFallback: true,
      deduplication: true,
      aggregateResults: true,
      ...config
    };

    this.providers = new Map(
      this.config.providers.map(p => [p.id, p])
    );
  }

  /**
   * 통합 검색 실행
   */
  async search(
    query: string,
    options: {
      categories?: string[];
      maxResults?: number;
      includeNews?: boolean;
      includeImages?: boolean;
      preferredProviders?: string[];
    } = {}
  ): Promise<SearchResponse> {
    const startTime = Date.now();
    const {
      categories = ['general'],
      maxResults = this.config.maxResults,
      includeNews = true,
      includeImages = false,
      preferredProviders = []
    } = options;

    const results: UnifiedSearchResult[] = [];
    const usedProviders: string[] = [];
    const errors: Array<{ provider: string; error: string }> = [];
    let fallbackUsed = false;

    // 사용할 검색 제공자 선별
    const enabledProviders = this.getEnabledProviders(categories, preferredProviders);
    
    if (enabledProviders.length === 0) {
      throw new Error('사용 가능한 검색 제공자가 없습니다. API 키를 설정해주세요.');
    }

    // 병렬 검색 실행
    const searchPromises = enabledProviders.map(async (provider) => {
      try {
        const providerResults = await this.searchWithProvider(
          provider, 
          query, 
          { includeNews, includeImages }
        );
        usedProviders.push(provider.name);
        return providerResults;
      } catch (error) {
        console.warn(`${provider.name} 검색 실패:`, error);
        errors.push({
          provider: provider.name,
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
        
        // 오류 카운트 증가
        provider.errorCount = (provider.errorCount || 0) + 1;
        
        return [];
      }
    });

    // 모든 검색 완료 대기 (타임아웃 포함)
    const allResults = await Promise.allSettled(
      searchPromises.map(p => 
        Promise.race([
          p,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('타임아웃')), this.config.timeout)
          )
        ])
      )
    );

    // 결과 수집
    allResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        results.push(...result.value);
      } else if (result.status === 'rejected') {
        const provider = enabledProviders[index];
        errors.push({
          provider: provider.name,
          error: result.reason?.message || '타임아웃 또는 오류'
        });
      }
    });

    // Fallback 로직
    if (results.length === 0 && this.config.enableFallback) {
      fallbackUsed = true;
      const fallbackResults = await this.fallbackSearch(query);
      results.push(...fallbackResults);
    }

    // 결과 후처리
    let finalResults = results;
    
    if (this.config.deduplication) {
      finalResults = this.deduplicateResults(finalResults);
    }

    if (this.config.aggregateResults) {
      finalResults = this.sortAndRankResults(finalResults, query);
    }

    // 최대 결과 수 제한
    finalResults = finalResults.slice(0, maxResults);

    const searchTime = Date.now() - startTime;

    return {
      results: finalResults,
      query,
      providers: usedProviders,
      totalResults: finalResults.length,
      searchTime,
      fallbackUsed,
      errors
    };
  }

  /**
   * 개별 검색 제공자로 검색
   */
  private async searchWithProvider(
    provider: SearchProvider,
    query: string,
    options: { includeNews?: boolean; includeImages?: boolean }
  ): Promise<UnifiedSearchResult[]> {
    const results: UnifiedSearchResult[] = [];

    switch (provider.id) {
      case 'naver':
        const naverResults = await this.searchNaver(query, options);
        results.push(...naverResults);
        break;

      case 'wikipedia':
        const wikiResults = await this.searchWikipedia(query);
        results.push(...wikiResults);
        break;

      case 'bing':
        if (provider.config?.apiKey) {
          const bingResults = await this.searchBing(query, provider.config, options);
          results.push(...bingResults);
        }
        break;

      case 'google_cse':
        if (provider.config?.apiKey && provider.config?.searchEngineId) {
          const googleResults = await this.searchGoogleCSE(query, provider.config, options);
          results.push(...googleResults);
        }
        break;

      case 'serper':
        if (provider.config?.apiKey) {
          const serperResults = await this.searchSerper(query, provider.config, options);
          results.push(...serperResults);
        }
        break;

      case 'serpapi':
        if (provider.config?.apiKey) {
          const serpApiResults = await this.searchSerpApi(query, provider.config, options);
          results.push(...serpApiResults);
        }
        break;

      default:
        console.warn(`지원하지 않는 검색 제공자: ${provider.id}`);
    }

    // 제공자별 결과에 메타데이터 추가
    return results.map(result => ({
      ...result,
      provider: provider.name,
      confidence: this.calculateProviderConfidence(provider, result)
    }));
  }

  /**
   * 네이버 검색
   */
  private async searchNaver(
    query: string, 
    options: { includeNews?: boolean; includeImages?: boolean }
  ): Promise<UnifiedSearchResult[]> {
    const results: UnifiedSearchResult[] = [];

    try {
      // 웹 검색 (뉴스 포함)
      if (options.includeNews) {
        const newsResults = await naverService.searchNews(query, {
          display: 5,
          sort: 'date'
        });

        results.push(...newsResults.items.map(item => ({
          id: `naver-news-${item.link}`,
          title: item.title.replace(/<[^>]*>/g, ''),
          url: item.link,
          snippet: item.description?.replace(/<[^>]*>/g, '') || '',
          source: 'naver',
          provider: '네이버',
          confidence: 0.8,
          publishedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          domain: new URL(item.link).hostname,
          type: 'news' as const
        })));
      }

      // 블로그 검색
      const blogResults = await naverService.searchBlog(query, {
        display: 5,
        sort: 'sim'
      });

      results.push(...blogResults.items.map(item => ({
        id: `naver-blog-${item.link}`,
        title: item.title.replace(/<[^>]*>/g, ''),
        url: item.link,
        snippet: item.description?.replace(/<[^>]*>/g, '') || '',
        source: 'naver',
        provider: '네이버',
        confidence: 0.7,
        publishedDate: item.postdate ? new Date(item.postdate) : new Date(),
        domain: new URL(item.link).hostname,
        type: 'web' as const
      })));

    } catch (error) {
      console.error('네이버 검색 오류:', error);
    }

    return results;
  }

  /**
   * 위키백과 검색
   */
  private async searchWikipedia(query: string): Promise<UnifiedSearchResult[]> {
    try {
      const wikiResults = await searchWikipedia(query, 3);
      
      return wikiResults.map(item => ({
        id: `wiki-${item.title}`,
        title: item.title,
        url: item.url,
        snippet: item.extract,
        source: 'wikipedia',
        provider: '위키백과',
        confidence: 0.9,
        domain: 'wikipedia.org',
        type: 'academic' as const
      }));
    } catch (error) {
      console.error('위키백과 검색 오류:', error);
      return [];
    }
  }

  /**
   * Bing 검색
   */
  private async searchBing(
    query: string,
    config: BingSearchConfig,
    options: { includeNews?: boolean; includeImages?: boolean }
  ): Promise<UnifiedSearchResult[]> {
    try {
      const bingResults = await searchBingUnified(query, config, {
        includeNews: options.includeNews,
        webCount: 5,
        newsCount: 3
      });

      const results: UnifiedSearchResult[] = [];

      // 웹 결과
      results.push(...bingResults.web.map(item => ({
        id: `bing-web-${item.id}`,
        title: item.name,
        url: item.url,
        snippet: item.snippet,
        source: 'bing',
        provider: 'Bing',
        confidence: 0.8,
        domain: item.displayUrl,
        type: 'web' as const
      })));

      // 뉴스 결과
      if (options.includeNews) {
        results.push(...bingResults.news.map(item => ({
          id: `bing-news-${item.id}`,
          title: item.name,
          url: item.url,
          snippet: item.description,
          source: 'bing',
          provider: 'Bing',
          confidence: 0.8,
          publishedDate: new Date(item.datePublished),
          domain: new URL(item.url).hostname,
          type: 'news' as const
        })));
      }

      return results;
    } catch (error) {
      console.error('Bing 검색 오류:', error);
      return [];
    }
  }

  /**
   * Google Custom Search
   */
  private async searchGoogleCSE(
    query: string,
    config: GoogleCSEConfig,
    options: { includeNews?: boolean; includeImages?: boolean }
  ): Promise<UnifiedSearchResult[]> {
    try {
      const googleResults = await searchGoogleCSEUnified(query, config, {
        includeImages: options.includeImages,
        webCount: 8,
        imageCount: 4
      });

      const results: UnifiedSearchResult[] = [];

      // 웹 결과
      results.push(...googleResults.web.map(item => ({
        id: `google-cse-${item.link}`,
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        source: 'google_cse',
        provider: 'Google CSE',
        confidence: 0.9,
        domain: item.displayLink,
        type: 'web' as const
      })));

      // 이미지 결과
      if (options.includeImages) {
        results.push(...googleResults.images.map(item => ({
          id: `google-cse-img-${item.link}`,
          title: item.title,
          url: item.link,
          snippet: item.snippet || '',
          source: 'google_cse',
          provider: 'Google CSE',
          confidence: 0.8,
          imageUrl: item.image?.thumbnailLink,
          domain: item.displayLink,
          type: 'image' as const
        })));
      }

      return results;
    } catch (error) {
      console.error('Google CSE 검색 오류:', error);
      return [];
    }
  }

  /**
   * Serper 검색
   */
  private async searchSerper(
    query: string,
    config: SerperConfig,
    options: { includeNews?: boolean; includeImages?: boolean }
  ): Promise<UnifiedSearchResult[]> {
    try {
      const serperResults = await searchSerperUnified(query, config, {
        includeNews: options.includeNews,
        includeImages: options.includeImages,
        webCount: 6,
        newsCount: 3,
        imageCount: 4
      });

      const results: UnifiedSearchResult[] = [];

      // 웹 결과
      results.push(...serperResults.web.map(item => ({
        id: `serper-web-${item.position}`,
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        source: 'serper',
        provider: 'Serper',
        confidence: 0.85,
        domain: new URL(item.link).hostname,
        type: 'web' as const
      })));

      // 뉴스 결과
      if (options.includeNews) {
        results.push(...serperResults.news.map(item => ({
          id: `serper-news-${item.position}`,
          title: item.title,
          url: item.link,
          snippet: item.snippet,
          source: 'serper',
          provider: 'Serper',
          confidence: 0.85,
          publishedDate: new Date(item.date),
          imageUrl: item.imageUrl,
          domain: new URL(item.link).hostname,
          type: 'news' as const
        })));
      }

      return results;
    } catch (error) {
      console.error('Serper 검색 오류:', error);
      return [];
    }
  }

  /**
   * SerpAPI 검색
   */
  private async searchSerpApi(
    query: string,
    config: SerpApiConfig,
    options: { includeNews?: boolean; includeImages?: boolean }
  ): Promise<UnifiedSearchResult[]> {
    try {
      const serpApiResults = await searchSerpApiUnified(query, config, {
        includeNews: options.includeNews,
        includeImages: options.includeImages,
        webCount: 6,
        newsCount: 3,
        imageCount: 4
      });

      const results: UnifiedSearchResult[] = [];

      // 웹 결과
      results.push(...serpApiResults.web.map(item => ({
        id: `serpapi-web-${item.position}`,
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        source: 'serpapi',
        provider: 'SerpAPI',
        confidence: 0.85,
        domain: item.displayed_link,
        type: 'web' as const
      })));

      // 뉴스 결과
      if (options.includeNews) {
        results.push(...serpApiResults.news.map(item => ({
          id: `serpapi-news-${item.position}`,
          title: item.title,
          url: item.link,
          snippet: item.snippet,
          source: 'serpapi',
          provider: 'SerpAPI',
          confidence: 0.85,
          publishedDate: new Date(item.date),
          imageUrl: item.thumbnail,
          domain: new URL(item.link).hostname,
          type: 'news' as const
        })));
      }

      return results;
    } catch (error) {
      console.error('SerpAPI 검색 오류:', error);
      return [];
    }
  }

  /**
   * Fallback 검색 (기본 내장 서비스만 사용)
   */
  private async fallbackSearch(query: string): Promise<UnifiedSearchResult[]> {
    const results: UnifiedSearchResult[] = [];

    try {
      // 위키백과는 항상 사용 가능
      const wikiResults = await this.searchWikipedia(query);
      results.push(...wikiResults);
    } catch (error) {
      console.warn('Fallback 검색도 실패:', error);
    }

    return results;
  }

  /**
   * 사용 가능한 검색 제공자 필터링
   */
  private getEnabledProviders(
    categories: string[], 
    preferredProviders: string[]
  ): SearchProvider[] {
    let providers = Array.from(this.providers.values())
      .filter(p => p.isEnabled)
      .filter(p => categories.includes(p.category) || categories.includes('general'));

    // 선호 제공자가 있으면 우선 적용
    if (preferredProviders.length > 0) {
      const preferred = providers.filter(p => preferredProviders.includes(p.id));
      const others = providers.filter(p => !preferredProviders.includes(p.id));
      providers = [...preferred, ...others];
    }

    // 우선순위로 정렬
    providers.sort((a, b) => b.priority - a.priority);

    return providers;
  }

  /**
   * 결과 중복 제거
   */
  private deduplicateResults(results: UnifiedSearchResult[]): UnifiedSearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      // URL 기준으로 중복 제거 (쿼리 파라미터 제거)
      const cleanUrl = result.url.split('?')[0].toLowerCase();
      if (seen.has(cleanUrl)) {
        return false;
      }
      seen.add(cleanUrl);
      return true;
    });
  }

  /**
   * 결과 정렬 및 랭킹
   */
  private sortAndRankResults(
    results: UnifiedSearchResult[], 
    query: string
  ): UnifiedSearchResult[] {
    return results
      .map(result => ({
        ...result,
        relevanceScore: this.calculateRelevanceScore(result, query)
      }))
      .sort((a, b) => {
        // 1차: 신뢰도 점수
        if (Math.abs(a.confidence - b.confidence) > 0.1) {
          return b.confidence - a.confidence;
        }
        // 2차: 관련성 점수
        return b.relevanceScore - a.relevanceScore;
      });
  }

  /**
   * 관련성 점수 계산
   */
  private calculateRelevanceScore(result: UnifiedSearchResult, query: string): number {
    const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 1);
    if (queryWords.length === 0) return 0.5;

    const titleMatches = queryWords.filter(word => 
      result.title.toLowerCase().includes(word)
    ).length;
    
    const snippetMatches = queryWords.filter(word => 
      result.snippet.toLowerCase().includes(word)
    ).length;

    return (titleMatches * 2 + snippetMatches) / (queryWords.length * 2);
  }

  /**
   * 제공자별 신뢰도 계산
   */
  private calculateProviderConfidence(
    provider: SearchProvider, 
    result: UnifiedSearchResult
  ): number {
    let baseConfidence = result.confidence || 0.7;

    // 제공자별 기본 신뢰도 조정
    const providerBonus = {
      'wikipedia': 0.1,
      'google_cse': 0.05,
      'serper': 0.03,
      'serpapi': 0.03,
      'bing': 0.02,
      'naver': 0.02
    };

    baseConfidence += providerBonus[provider.id as keyof typeof providerBonus] || 0;

    // 성공률에 따른 조정
    if (provider.successRate) {
      baseConfidence *= provider.successRate;
    }

    return Math.min(1, Math.max(0, baseConfidence));
  }

  /**
   * 검색 제공자 설정 업데이트
   */
  updateProvider(providerId: string, updates: Partial<SearchProvider>): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      Object.assign(provider, updates);
      provider.lastUsed = new Date();
    }
  }

  /**
   * 검색 제공자 활성화/비활성화
   */
  toggleProvider(providerId: string, enabled: boolean): void {
    this.updateProvider(providerId, { isEnabled: enabled });
  }

  /**
   * API 키 설정
   */
  setProviderConfig(providerId: string, config: any): void {
    this.updateProvider(providerId, { config });
  }

  /**
   * 검색 제공자 상태 확인
   */
  async validateProviders(): Promise<Record<string, { isValid: boolean; error?: string }>> {
    const results: Record<string, { isValid: boolean; error?: string }> = {};

    for (const provider of this.providers.values()) {
      if (!provider.isEnabled || provider.type === 'builtin') {
        results[provider.id] = { isValid: true };
        continue;
      }

      try {
        let isValid = false;

        switch (provider.id) {
          case 'bing':
            isValid = await validateBingApiKey(provider.config);
            break;
          case 'google_cse':
            const googleResult = await validateGoogleCSEConfig(provider.config);
            isValid = googleResult.isValid;
            if (!isValid) results[provider.id] = { isValid: false, error: googleResult.error };
            break;
          case 'serper':
            isValid = await validateSerperApiKey(provider.config);
            break;
          case 'serpapi':
            const serpApiResult = await validateSerpApiKey(provider.config);
            isValid = serpApiResult.isValid;
            if (!isValid) results[provider.id] = { isValid: false, error: serpApiResult.error };
            break;
        }

        if (results[provider.id]) continue; // 이미 에러가 설정된 경우
        results[provider.id] = { isValid };

      } catch (error) {
        results[provider.id] = {
          isValid: false,
          error: error instanceof Error ? error.message : '검증 실패'
        };
      }
    }

    return results;
  }

  /**
   * 검색 통계 조회
   */
  getSearchStats(): {
    totalProviders: number;
    enabledProviders: number;
    builtinProviders: number;
    byokProviders: number;
    lastValidated?: Date;
  } {
    const providers = Array.from(this.providers.values());
    
    return {
      totalProviders: providers.length,
      enabledProviders: providers.filter(p => p.isEnabled).length,
      builtinProviders: providers.filter(p => p.type === 'builtin').length,
      byokProviders: providers.filter(p => p.type === 'byok').length,
      lastValidated: providers
        .map(p => p.lastUsed)
        .filter(Boolean)
        .sort((a, b) => b!.getTime() - a!.getTime())[0]
    };
  }
}

// 기본 인스턴스 생성
export const unifiedSearchService = new UnifiedSearchService();

// 편의 함수들
export async function searchUnified(
  query: string,
  options?: {
    maxResults?: number;
    includeNews?: boolean;
    includeImages?: boolean;
    preferredProviders?: string[];
  }
): Promise<SearchResponse> {
  return unifiedSearchService.search(query, options);
}

export function configureSearchProvider(
  providerId: string,
  config: any
): void {
  unifiedSearchService.setProviderConfig(providerId, config);
  unifiedSearchService.toggleProvider(providerId, true);
}

export async function validateAllProviders(): Promise<Record<string, { isValid: boolean; error?: string }>> {
  return unifiedSearchService.validateProviders();
}