/**
 * Unified Data Source Service
 * 
 * 다양한 데이터 소스를 통합 관리하는 서비스
 * - 위키백과 검색
 * - 네이버 검색 (뉴스, 블로그, 웹문서)
 * - 학술 논문 검색 (arXiv, PubMed 등)
 * - 비즈니스 데이터 (금융, 경제 등)
 * - 문화 콘텐츠 (영화, 음악 등)
 * - 라이프스타일 (날씨, 여행 등)
 * 
 * @version 2.0.0
 */

import { wikipediaService, WikipediaContent } from './wikipediaService';
import { naverService, NaverSearchItem, NaverSearchResponse } from './naverService';
import { chartService, ChartResponse, DataLabChartOptions } from './chartService';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export interface DataSourceResult {
  id: string;
  title: string;
  content: string;
  summary: string;
  url?: string;
  thumbnail?: string;
  source: DataSourceType;
  language: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export type DataSourceType = 'web' | 'news' | 'blog' | 'academic' | 'business' | 'culture' | 'lifestyle';

export interface DataSourceConfig {
  enabled: boolean;
  priority: number; // 1-10, 높을수록 우선순위
  maxResults: number;
}

export interface SearchOptions {
  sources: Partial<Record<DataSourceType, DataSourceConfig>>;
  language?: string;
  maxTotalResults?: number;
  includeImages?: boolean;
  timeout?: number; // ms
}

/**
 * 통합 데이터 소스 관리 클래스
 */
export class DataSourceService {
  private defaultConfig: Record<DataSourceType, DataSourceConfig> = {
    web: { enabled: true, priority: 8, maxResults: 5 },
    news: { enabled: true, priority: 7, maxResults: 4 },
    blog: { enabled: false, priority: 6, maxResults: 3 },
    academic: { enabled: false, priority: 5, maxResults: 3 },
    business: { enabled: false, priority: 4, maxResults: 3 },
    culture: { enabled: false, priority: 3, maxResults: 3 },
    lifestyle: { enabled: false, priority: 2, maxResults: 3 }
  };

  /**
   * 통합 검색 실행
   * 
   * @param query 검색어
   * @param options 검색 옵션
   * @returns 통합 검색 결과
   */
  async search(query: string, options: SearchOptions): Promise<DataSourceResult[]> {
    const startTime = Date.now();
    console.log('🔍 통합 검색 시작:', { query, options });

    try {
      const allResults: DataSourceResult[] = [];
      const searchPromises: Promise<DataSourceResult[]>[] = [];

      // 활성화된 소스별로 검색 실행
      for (const [sourceType, config] of Object.entries(options.sources)) {
        if (config?.enabled) {
          const searchPromise = this.searchBySource(
            query, 
            sourceType as DataSourceType, 
            config,
            options.language || 'ko'
          );
          searchPromises.push(searchPromise);
        }
      }

      // 모든 검색을 병렬로 실행 (타임아웃 적용)
      const timeout = options.timeout || 10000; // 기본 10초
      const results = await Promise.allSettled(
        searchPromises.map(promise => 
          Promise.race([
            promise,
            new Promise<DataSourceResult[]>((_, reject) => 
              setTimeout(() => reject(new Error('Search timeout')), timeout)
            )
          ])
        )
      );

      // 성공한 검색 결과만 수집
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allResults.push(...result.value);
        } else {
          const sourceType = Object.keys(options.sources)[index];
          console.warn(`${sourceType} 검색 실패:`, result.reason);
        }
      });

      // 우선순위 및 관련성에 따라 정렬
      const sortedResults = this.sortResults(allResults, query, options.sources);
      
      // 최대 결과 수 제한
      const maxResults = options.maxTotalResults || 15;
      const finalResults = sortedResults.slice(0, maxResults);

      const duration = Date.now() - startTime;
      console.log('✅ 통합 검색 완료:', {
        query,
        totalResults: finalResults.length,
        duration: `${duration}ms`,
        sources: Object.keys(options.sources).filter(s => options.sources[s as DataSourceType]?.enabled)
      });

      return finalResults;

    } catch (error) {
      console.error('통합 검색 실패:', error);
      throw new Error(`검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 소스별 검색 실행
   */
  private async searchBySource(
    query: string, 
    sourceType: DataSourceType, 
    config: DataSourceConfig,
    language: string
  ): Promise<DataSourceResult[]> {
    try {
      console.log(`🔍 ${sourceType} 검색 시작:`, { query, config });

      switch (sourceType) {
        case 'web':
          return await this.searchWeb(query, config, language);
        
        case 'news':
          return await this.searchNews(query, config, language);
        
        case 'blog':
          return await this.searchBlog(query, config, language);
        
        case 'academic':
          return await this.searchAcademic(query, config, language);
        
        case 'business':
          return await this.searchBusiness(query, config, language);
        
        case 'culture':
          return await this.searchCulture(query, config, language);
        
        case 'lifestyle':
          return await this.searchLifestyle(query, config, language);
        
        default:
          console.warn('지원하지 않는 소스 타입:', sourceType);
          return [];
      }
    } catch (error) {
      console.error(`${sourceType} 검색 오류:`, error);
      return [];
    }
  }

  /**
   * 웹 검색 (위키백과 포함)
   */
  private async searchWeb(query: string, config: DataSourceConfig, language: string): Promise<DataSourceResult[]> {
    try {
      // 위키백과 검색만 사용 (NewsAPI 제거)
      console.log('🔍 위키백과 검색:', { query, language, limit: config.maxResults });
      const wikipediaResults = await wikipediaService.search(query, language, config.maxResults);
      
      return wikipediaResults.map((result, index) => ({
        id: `wikipedia_${Date.now()}_${index}`,
        title: result.title,
        content: result.extract,
        summary: result.extract.slice(0, 200) + (result.extract.length > 200 ? '...' : ''),
        url: result.url,
        thumbnail: result.thumbnail,
        source: 'web' as const,
        language: result.language,
        timestamp: new Date(),
        metadata: {
          provider: 'Wikipedia',
          confidence: this.calculateRelevance(query, result.title, result.extract)
        }
      }));

    } catch (error) {
      console.error('웹 검색 실패:', error);
      return [];
    }
  }

  /**
   * 뉴스 검색 (NewsAPI + 네이버 뉴스)
   */
  private async searchNews(query: string, config: DataSourceConfig, language: string): Promise<DataSourceResult[]> {
    try {
      console.log('🔍 뉴스 검색:', { query, language, limit: config.maxResults });
      const results: DataSourceResult[] = [];

      // NewsAPI 검색 (영어 및 다국어)
      if (language === 'en' || language === 'auto') {
        try {
          const newsApiResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e3d1d00c/news/search?query=${encodeURIComponent(query)}&language=${language}&pageSize=${Math.min(config.maxResults, 10)}`, {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
          });

          if (newsApiResponse.ok) {
            const newsApiData = await newsApiResponse.json();
            const newsApiResults = (newsApiData.articles || []).map((article: any, index: number) => ({
              id: `newsapi_${Date.now()}_${index}`,
              title: article.title || '',
              content: article.description || article.content || '',
              summary: (article.description || '').slice(0, 200) + ((article.description || '').length > 200 ? '...' : ''),
              url: article.url,
              thumbnail: article.urlToImage,
              source: 'news' as const,
              language: 'en',
              timestamp: new Date(article.publishedAt || Date.now()),
              metadata: {
                provider: 'NewsAPI',
                source: article.source?.name || 'Unknown',
                publishedAt: article.publishedAt,
                confidence: this.calculateRelevance(query, article.title || '', article.description || '')
              }
            }));
            results.push(...newsApiResults);
          }
        } catch (newsApiError) {
          console.warn('NewsAPI 검색 실패:', newsApiError);
        }
      }

      // 네이버 뉴스 검색 (한국어)
      if (language === 'ko' || language === 'auto') {
        try {
          const naverNews = await naverService.searchNews(query, { 
            display: Math.min(config.maxResults, 10),
            sort: 'date' // 최신순
          });
          
          const naverResults = naverNews.items.map((item, index) => ({
            id: `naver_news_${Date.now()}_${index}`,
            title: item.title,
            content: item.description || '',
            summary: (item.description || '').slice(0, 200) + ((item.description || '').length > 200 ? '...' : ''),
            url: item.link,
            thumbnail: undefined,
            source: 'news' as const,
            language: 'ko',
            timestamp: new Date(),
            metadata: {
              provider: 'Naver News',
              pubDate: item.pubDate,
              confidence: this.calculateRelevance(query, item.title, item.description || '')
            }
          }));
          results.push(...naverResults);
        } catch (naverError) {
          console.warn('네이버 뉴스 검색 실패:', naverError);
        }
      }

      console.log(`✅ 뉴스 검색 완료: ${results.length}개 결과`);
      return results.slice(0, config.maxResults);

    } catch (error) {
      console.error('뉴스 검색 실패:', error);
      return [];
    }
  }

  /**
   * 블로그 검색 (네이버 블로그)
   */
  private async searchBlog(query: string, config: DataSourceConfig, language: string): Promise<DataSourceResult[]> {
    try {
      const naverBlog = await naverService.searchBlog(query, { 
        display: config.maxResults,
        sort: 'sim' // 정확도순
      });
      
      return naverBlog.items.map((item, index) => ({
        id: `naver_blog_${Date.now()}_${index}`,
        title: item.title,
        content: item.description || '',
        summary: (item.description || '').slice(0, 200) + ((item.description || '').length > 200 ? '...' : ''),
        url: item.link,
        thumbnail: undefined,
        source: 'blog' as const,
        language: 'ko',
        timestamp: new Date(),
        metadata: {
          provider: 'Naver Blog',
          bloggername: item.bloggername,
          bloggerlink: item.bloggerlink,
          postdate: item.postdate,
          confidence: this.calculateRelevance(query, item.title, item.description || '')
        }
      }));

    } catch (error) {
      console.error('블로그 검색 실패:', error);
      return [];
    }
  }

  /**
   * 학술 검색 (향후 arXiv, PubMed 등 추가)
   */
  private async searchAcademic(query: string, config: DataSourceConfig, language: string): Promise<DataSourceResult[]> {
    // TODO: arXiv, PubMed, Google Scholar API 연동
    console.log('학술 검색은 개발 중입니다.');
    return [];
  }

  /**
   * 비즈니스 검색 (향후 Yahoo Finance, FRED 등 추가)
   */
  private async searchBusiness(query: string, config: DataSourceConfig, language: string): Promise<DataSourceResult[]> {
    // TODO: Yahoo Finance, FRED, SEC EDGAR API 연동
    console.log('비즈니스 검색은 개발 중입니다.');
    return [];
  }

  /**
   * 문화 검색 (향후 TMDB, Spotify 등 추가)
   */
  private async searchCulture(query: string, config: DataSourceConfig, language: string): Promise<DataSourceResult[]> {
    // TODO: TMDB, Open Library, Spotify API 연동
    console.log('문화 검색은 개발 중입니다.');
    return [];
  }

  /**
   * 라이프스타일 검색 (향후 날씨, 여행 등 추가)
   */
  private async searchLifestyle(query: string, config: DataSourceConfig, language: string): Promise<DataSourceResult[]> {
    // TODO: Weather API, Travel API, Recipe API 연동
    console.log('라이프스타일 검색은 개발 중입니다.');
    return [];
  }

  /**
   * 검색 결과 정렬 (관련성 + 소스 우선순위)
   */
  private sortResults(
    results: DataSourceResult[], 
    query: string, 
    sources: Partial<Record<DataSourceType, DataSourceConfig>>
  ): DataSourceResult[] {
    return results.sort((a, b) => {
      // 소스 우선순위
      const priorityA = sources[a.source]?.priority || 1;
      const priorityB = sources[b.source]?.priority || 1;
      
      // 관련성 점수
      const relevanceA = this.calculateRelevance(query, a.title, a.content);
      const relevanceB = this.calculateRelevance(query, b.title, b.content);
      
      // 최종 점수 = (소스 우선순위 * 0.3) + (관련성 * 0.7)
      const scoreA = (priorityA * 0.3) + (relevanceA * 0.7);
      const scoreB = (priorityB * 0.3) + (relevanceB * 0.7);
      
      return scoreB - scoreA; // 높은 점수부터
    });
  }

  /**
   * 검색어와 콘텐츠 간의 관련성 계산 (간단한 휴리스틱)
   */
  private calculateRelevance(query: string, title: string, content: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const titleWords = title.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);
    
    let score = 0;
    
    // 제목에서 일치하는 단어 (가중치 높음)
    queryWords.forEach(word => {
      if (titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))) {
        score += 10;
      }
    });
    
    // 내용에서 일치하는 단어
    queryWords.forEach(word => {
      const matches = contentWords.filter(contentWord => 
        contentWord.includes(word) || word.includes(contentWord)
      );
      score += matches.length * 2;
    });
    
    // 정확한 문구 매치 (보너스)
    if (title.toLowerCase().includes(query.toLowerCase())) {
      score += 20;
    }
    if (content.toLowerCase().includes(query.toLowerCase())) {
      score += 5;
    }
    
    return Math.min(score, 100); // 최대 100점
  }

  /**
   * 기본 설정으로 검색 (간편 함수)
   */
  async quickSearch(query: string, enabledSources: DataSourceType[] = ['web']): Promise<DataSourceResult[]> {
    const sources: Partial<Record<DataSourceType, DataSourceConfig>> = {};
    
    enabledSources.forEach(sourceType => {
      sources[sourceType] = { ...this.defaultConfig[sourceType], enabled: true };
    });

    return this.search(query, { sources });
  }

  /**
   * 소스 설정 업데이트
   */
  updateSourceConfig(sourceType: DataSourceType, config: Partial<DataSourceConfig>) {
    this.defaultConfig[sourceType] = { ...this.defaultConfig[sourceType], ...config };
  }

  /**
   * 현재 소스 설정 가져오기
   */
  getSourceConfig(sourceType: DataSourceType): DataSourceConfig {
    return { ...this.defaultConfig[sourceType] };
  }
}

// 싱글톤 인스턴스
export const dataSourceService = new DataSourceService();

/**
 * 편의 함수들
 */
export const searchAllSources = (query: string, options?: SearchOptions) => 
  dataSourceService.search(query, options || { sources: { web: { enabled: true, priority: 8, maxResults: 5 } } });

export const searchWeb = (query: string, language?: string) => 
  dataSourceService.quickSearch(query, ['web']);

export const searchNews = (query: string, language?: string) => 
  dataSourceService.quickSearch(query, ['news']);

export const searchBlog = (query: string, language?: string) => 
  dataSourceService.quickSearch(query, ['blog']);

export const searchAcademic = (query: string, language?: string) => 
  dataSourceService.quickSearch(query, ['academic']);

export const searchBusiness = (query: string, language?: string) => 
  dataSourceService.quickSearch(query, ['business']);

export const searchWithNaverIntegration = (query: string, language?: string) => 
  dataSourceService.quickSearch(query, ['web', 'news', 'blog']);

/**
 * 차트 및 시각화 관련 편의 함수들
 */

/**
 * 검색어 트렌드 차트 생성
 * 
 * @param keywords 검색어 목록
 * @param months 조회할 개월 수 (기본 12개월)
 * @returns 생성된 트렌드 차트
 */
export const generateTrendChart = (keywords: string[], months: number = 12): Promise<ChartResponse> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - months);

  return chartService.generateDataLabChart({
    keywords,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    timeUnit: "month",
    chartType: "line",
    width: 800,
    height: 400
  });
};

/**
 * 검색 결과 분포 차트 생성
 * 
 * @param searchResults 검색 결과 데이터
 * @returns 소스별 분포 파이 차트
 */
export const generateSearchDistributionChart = async (searchResults: DataSourceResult[]): Promise<ChartResponse> => {
  // 소스별 결과 개수 집계
  const sourceCount: Record<string, number> = {};
  const sourceLabels: Record<string, string> = {
    web: '웹 (위키백과)',
    news: '뉴스',
    blog: '블로그',
    academic: '학술',
    business: '비즈니스',
    culture: '문화',
    lifestyle: '라이프스타일'
  };

  searchResults.forEach(result => {
    const label = sourceLabels[result.source] || result.source;
    sourceCount[label] = (sourceCount[label] || 0) + 1;
  });

  const labels = Object.keys(sourceCount);
  const values = Object.values(sourceCount);

  return chartService.generateSimplePieChart(
    '검색 결과 소스별 분포',
    labels,
    values,
    { width: 500, height: 400 }
  );
};

/**
 * 검색 결과 관련성 점수 차트 생성
 * 
 * @param searchResults 검색 결과 데이터
 * @param query 검색어
 * @returns 관련성 점수 막대 차트
 */
export const generateRelevanceChart = async (searchResults: DataSourceResult[], query: string): Promise<ChartResponse> => {
  // 상위 10개 결과의 관련성 점수
  const topResults = searchResults.slice(0, 10);
  const labels = topResults.map(result => 
    result.title.length > 20 ? result.title.slice(0, 20) + '...' : result.title
  );
  const values = topResults.map(result => 
    result.metadata?.confidence || 0
  );

  return chartService.generateSimpleBarChart(
    `검색 결과 관련성 점수 (검색어: ${query})`,
    labels,
    values,
    { width: 800, height: 400 }
  );
};

/**
 * DataSourceService에 차트 기능을 추가하는 확장 클래스
 */
export class EnhancedDataSourceService extends DataSourceService {
  /**
   * 검색과 동시에 트렌드 차트 생성
   * 
   * @param query 검색어
   * @param options 검색 옵션
   * @param generateChart 차트 생성 여부
   * @returns 검색 결과와 차트 데이터
   */
  async searchWithChart(
    query: string, 
    options: SearchOptions, 
    generateChart: boolean = true
  ): Promise<{
    results: DataSourceResult[];
    trendChart?: ChartResponse;
    distributionChart?: ChartResponse;
    relevanceChart?: ChartResponse;
  }> {
    console.log('🔍📊 검색 + 차트 생성 시작:', { query, generateChart });

    // 1. 일반 검색 실행
    const results = await this.search(query, options);

    if (!generateChart) {
      return { results };
    }

    try {
      // 2. 병렬로 차트들 생성
      const chartPromises = [];

      // 트렌드 차트 (단일 검색어인 경우)
      if (query.split(' ').length <= 2) { // 간단한 검색어인 경우만
        chartPromises.push(
          generateTrendChart([query], 6).catch(error => {
            console.warn('트렌드 차트 생성 실패:', error);
            return null;
          })
        );
      } else {
        chartPromises.push(Promise.resolve(null));
      }

      // 분포 차트
      chartPromises.push(
        generateSearchDistributionChart(results).catch(error => {
          console.warn('분포 차트 생성 실패:', error);
          return null;
        })
      );

      // 관련성 차트
      chartPromises.push(
        generateRelevanceChart(results, query).catch(error => {
          console.warn('관련성 차트 생성 실패:', error);
          return null;
        })
      );

      const [trendChart, distributionChart, relevanceChart] = await Promise.all(chartPromises);

      console.log('✅ 검색 + 차트 생성 완료:', {
        resultsCount: results.length,
        haseTrendChart: !!trendChart,
        hasDistributionChart: !!distributionChart,
        hasRelevanceChart: !!relevanceChart
      });

      return {
        results,
        trendChart: trendChart || undefined,
        distributionChart: distributionChart || undefined,
        relevanceChart: relevanceChart || undefined
      };

    } catch (error) {
      console.error('차트 생성 중 오류:', error);
      // 차트 생성 실패해도 검색 결과는 반환
      return { results };
    }
  }

  /**
   * 여러 검색어 트렌드 비교 분석
   * 
   * @param keywords 비교할 검색어들
   * @param months 조회 기간 (개월)
   * @returns 트렌드 비교 차트와 요약
   */
  async analyzeTrends(keywords: string[], months: number = 12): Promise<{
    chart: ChartResponse;
    summary: {
      topKeyword: string;
      averageSearchVolume: Record<string, number>;
      trendDirection: Record<string, 'rising' | 'falling' | 'stable'>;
    };
  }> {
    console.log('📊 트렌드 분석 시작:', { keywords, months });

    const chart = await chartService.generateDataLabChart({
      keywords,
      startDate: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      timeUnit: "month",
      chartType: "line",
      width: 900,
      height: 500
    });

    // 간단한 트렌드 분석 (실제로는 rawData를 분석해야 함)
    const summary = {
      topKeyword: keywords[0], // 임시로 첫 번째 키워드
      averageSearchVolume: keywords.reduce((acc, keyword) => {
        acc[keyword] = Math.floor(Math.random() * 100); // 임시 데이터
        return acc;
      }, {} as Record<string, number>),
      trendDirection: keywords.reduce((acc, keyword) => {
        const directions: ('rising' | 'falling' | 'stable')[] = ['rising', 'falling', 'stable'];
        acc[keyword] = directions[Math.floor(Math.random() * 3)]; // 임시 데이터
        return acc;
      }, {} as Record<string, 'rising' | 'falling' | 'stable'>)
    };

    console.log('✅ 트렌드 분석 완료:', summary);

    return { chart, summary };
  }
}

// 확장된 데이터 소스 서비스 인스턴스
export const enhancedDataSourceService = new EnhancedDataSourceService();
