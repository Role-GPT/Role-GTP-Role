/**
 * 네이버 검색 API 서비스
 * 
 * 네이버 검색 API와 데이터랩 API를 활용한 검색 및 트렌드 분석 서비스
 * - 뉴스, 블로그, 웹문서, 이미지, 쇼핑몰, 전문자료 검색
 * - 검색어 트렌드 분석 (데이터랩)
 * - 통합 검색 기능
 * 
 * @see https://developers.naver.com/docs/serviceapi/search/
 * @see https://developers.naver.com/docs/serviceapi/datalab/
 */

import { projectId, publicAnonKey } from '../../utils/supabase/info';

export interface NaverSearchItem {
  title: string;
  link: string;
  description?: string;
  bloggername?: string;
  bloggerlink?: string;
  postdate?: string;
  pubDate?: string;
  thumbnail?: string;
  lprice?: string;
  hprice?: string;
  mallName?: string;
  productId?: string;
  productType?: string;
  brand?: string;
  maker?: string;
  category1?: string;
  category2?: string;
  category3?: string;
  category4?: string;
}

export interface NaverSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverSearchItem[];
}

export interface NaverDataLabItem {
  period: string;
  ratio: number;
}

export interface NaverDataLabResponse {
  startDate: string;
  endDate: string;
  timeUnit: string;
  results: Array<{
    title: string;
    keywords: string[];
    data: NaverDataLabItem[];
  }>;
}

export interface NaverSearchOptions {
  display?: number; // 검색 결과 출력 건수 (기본값: 10, 최대: 100)
  start?: number;   // 검색 시작 위치 (기본값: 1, 최대: 1000)
  sort?: 'sim' | 'date'; // 정렬 옵션 (sim: 정확도순, date: 날짜순)
}

export interface NaverDataLabOptions {
  startDate?: string;    // 검색 시작 날짜 (YYYY-MM-DD)
  endDate?: string;      // 검색 종료 날짜 (YYYY-MM-DD)
  timeUnit?: 'date' | 'week' | 'month'; // 구간 단위
  device?: '' | 'pc' | 'mo'; // 디바이스 (빈 문자열: 전체)
  ages?: string[];       // 연령대 (1~11)
  gender?: '' | 'm' | 'f'; // 성별 (빈 문자열: 전체)
}

export interface UnifiedSearchResult {
  query: string;
  sources: {
    [key: string]: {
      count?: number;
      items?: any[];
      error?: string;
    };
  };
  timestamp: string;
}

/**
 * 네이버 검색 API 클라이언트
 */
export class NaverService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e3d1d00c`;
  }

  /**
   * HTTP 요청 실행
   */
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(errorData.error || `네이버 API 요청 실패: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 네이버 뉴스 검색
   * 
   * @param query 검색어
   * @param options 검색 옵션
   * @returns 뉴스 검색 결과
   */
  async searchNews(query: string, options: NaverSearchOptions = {}): Promise<NaverSearchResponse> {
    const params = new URLSearchParams({
      query,
      display: String(options.display || 10),
      start: String(options.start || 1),
      sort: options.sort || 'sim'
    });

    console.log('🔍 네이버 뉴스 검색:', { query, options });

    const result = await this.makeRequest<NaverSearchResponse>(`/naver/search/news?${params}`);
    
    console.log('✅ 네이버 뉴스 검색 완료:', result.items.length, '개 결과');
    return result;
  }

  /**
   * 네이버 블로그 검색
   * 
   * @param query 검색어
   * @param options 검색 옵션
   * @returns 블로그 검색 결과
   */
  async searchBlog(query: string, options: NaverSearchOptions = {}): Promise<NaverSearchResponse> {
    const params = new URLSearchParams({
      query,
      display: String(options.display || 10),
      start: String(options.start || 1),
      sort: options.sort || 'sim'
    });

    console.log('🔍 네이버 블로그 검색:', { query, options });

    const result = await this.makeRequest<NaverSearchResponse>(`/naver/search/blog?${params}`);
    
    console.log('✅ 네이버 블로그 검색 완료:', result.items.length, '개 결과');
    return result;
  }

  /**
   * 네이버 웹 문서 검색
   * 
   * @param query 검색어
   * @param options 검색 옵션
   * @returns 웹 문서 검색 결과
   */
  async searchWeb(query: string, options: NaverSearchOptions = {}): Promise<NaverSearchResponse> {
    const params = new URLSearchParams({
      query,
      display: String(options.display || 10),
      start: String(options.start || 1),
      sort: options.sort || 'sim'
    });

    console.log('🔍 네이버 웹 검색:', { query, options });

    const result = await this.makeRequest<NaverSearchResponse>(`/naver/search/webkr?${params}`);
    
    console.log('✅ 네이버 웹 검색 완료:', result.items.length, '개 결과');
    return result;
  }

  /**
   * 네이버 이미지 검색
   * 
   * @param query 검색어
   * @param options 검색 옵션
   * @returns 이미지 검색 결과
   */
  async searchImage(query: string, options: NaverSearchOptions = {}): Promise<NaverSearchResponse> {
    const params = new URLSearchParams({
      query,
      display: String(options.display || 10),
      start: String(options.start || 1),
      sort: options.sort || 'sim'
    });

    console.log('🔍 네이버 이미지 검색:', { query, options });

    const result = await this.makeRequest<NaverSearchResponse>(`/naver/search/image?${params}`);
    
    console.log('✅ 네이버 이미지 검색 완료:', result.items.length, '개 결과');
    return result;
  }

  /**
   * 네이버 쇼핑 검색
   * 
   * @param query 검색어
   * @param options 검색 옵션
   * @returns 쇼핑 검색 결과
   */
  async searchShopping(query: string, options: NaverSearchOptions = {}): Promise<NaverSearchResponse> {
    const params = new URLSearchParams({
      query,
      display: String(options.display || 10),
      start: String(options.start || 1),
      sort: options.sort || 'sim'
    });

    console.log('🔍 네이버 쇼핑 검색:', { query, options });

    const result = await this.makeRequest<NaverSearchResponse>(`/naver/search/shop?${params}`);
    
    console.log('✅ 네이버 쇼핑 검색 완료:', result.items.length, '개 결과');
    return result;
  }

  /**
   * 네이버 전문자료 검색
   * 
   * @param query 검색어
   * @param options 검색 옵션
   * @returns 전문자료 검색 결과
   */
  async searchDoc(query: string, options: NaverSearchOptions = {}): Promise<NaverSearchResponse> {
    const params = new URLSearchParams({
      query,
      display: String(options.display || 10),
      start: String(options.start || 1),
      sort: options.sort || 'sim'
    });

    console.log('🔍 네이버 전문자료 검색:', { query, options });

    const result = await this.makeRequest<NaverSearchResponse>(`/naver/search/doc?${params}`);
    
    console.log('✅ 네이버 전문자료 검색 완료:', result.items.length, '개 결과');
    return result;
  }

  /**
   * 네이버 데이터랩 검색어 트렌드 분석
   * 
   * @param keywords 검색어 배열
   * @param options 분석 옵션
   * @returns 검색어 트렌드 데이터
   */
  async getSearchTrend(keywords: string[], options: NaverDataLabOptions = {}): Promise<NaverDataLabResponse> {
    const requestBody = {
      keywords,
      startDate: options.startDate || '2023-01-01',
      endDate: options.endDate || new Date().toISOString().split('T')[0],
      timeUnit: options.timeUnit || 'month',
      device: options.device || '',
      ages: options.ages || [],
      gender: options.gender || '',
      keywordGroups: [
        {
          groupName: '검색어 트렌드',
          keywords
        }
      ]
    };

    console.log('📊 네이버 데이터랩 트렌드 분석:', { keywords, options });

    const result = await this.makeRequest<NaverDataLabResponse>('/naver/datalab', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
    
    console.log('✅ 네이버 트렌드 분석 완료:', result.results.length, '개 결과');
    return result;
  }

  /**
   * 통합 검색 (위키백과 + 네이버)
   * 
   * @param query 검색어
   * @param sources 검색할 소스들 (기본: wikipedia,naver)
   * @param limit 각 소스별 결과 개수 (기본: 5)
   * @returns 통합 검색 결과
   */
  async unifiedSearch(
    query: string, 
    sources: string = 'wikipedia,naver', 
    limit: number = 5
  ): Promise<UnifiedSearchResult> {
    const params = new URLSearchParams({
      query,
      sources,
      limit: String(limit)
    });

    console.log('🔍 통합 검색:', { query, sources, limit });

    const result = await this.makeRequest<UnifiedSearchResult>(`/search/unified?${params}`);
    
    console.log('✅ 통합 검색 완료:', Object.keys(result.sources));
    return result;
  }

  /**
   * 다중 소스 검색 (병렬 실행)
   * 
   * @param query 검색어
   * @param types 검색 타입들 ['news', 'blog', 'webkr']
   * @param options 검색 옵션
   * @returns 다중 소스 검색 결과
   */
  async multiSearch(
    query: string, 
    types: string[] = ['news', 'blog', 'webkr'], 
    options: NaverSearchOptions = {}
  ): Promise<{ [key: string]: NaverSearchResponse | { error: string } }> {
    console.log('🔍 네이버 다중 검색:', { query, types, options });

    const searches = types.map(async (type) => {
      try {
        let result: NaverSearchResponse;
        switch (type) {
          case 'news':
            result = await this.searchNews(query, options);
            break;
          case 'blog':
            result = await this.searchBlog(query, options);
            break;
          case 'webkr':
            result = await this.searchWeb(query, options);
            break;
          case 'image':
            result = await this.searchImage(query, options);
            break;
          case 'shop':
            result = await this.searchShopping(query, options);
            break;
          case 'doc':
            result = await this.searchDoc(query, options);
            break;
          default:
            throw new Error(`지원하지 않는 검색 타입: ${type}`);
        }
        return { [type]: result };
      } catch (error) {
        console.warn(`네이버 ${type} 검색 실패:`, error);
        return { [type]: { error: error instanceof Error ? error.message : '알 수 없는 오류' } };
      }
    });

    const results = await Promise.all(searches);
    const combinedResults = results.reduce((acc, result) => ({ ...acc, ...result }), {});
    
    console.log('✅ 네이버 다중 검색 완료:', Object.keys(combinedResults));
    return combinedResults;
  }
}

// 싱글톤 인스턴스 내보내기
export const naverService = new NaverService();

/**
 * 편의 함수들
 */
export const searchNaverNews = (query: string, options?: NaverSearchOptions) => 
  naverService.searchNews(query, options);

export const searchNaverBlog = (query: string, options?: NaverSearchOptions) => 
  naverService.searchBlog(query, options);

export const searchNaverWeb = (query: string, options?: NaverSearchOptions) => 
  naverService.searchWeb(query, options);

export const getNaverSearchTrend = (keywords: string[], options?: NaverDataLabOptions) => 
  naverService.getSearchTrend(keywords, options);

export const unifiedSearch = (query: string, sources?: string, limit?: number) => 
  naverService.unifiedSearch(query, sources, limit);