/**
 * Bing Search Service - Microsoft Bing 검색 API 통합
 * 
 * Azure Cognitive Services의 Bing Search API를 활용한 웹 검색
 * - 웹 검색 API (Web Search)
 * - 뉴스 검색 API (News Search)
 * - 이미지 검색 API (Image Search)
 * - 동영상 검색 API (Video Search)
 * 
 * BYOK (Bring Your Own Key) 지원
 */

export interface BingSearchConfig {
  apiKey: string;
  endpoint?: string;
  market?: string;
  safeSearch?: 'Off' | 'Moderate' | 'Strict';
  freshness?: 'Day' | 'Week' | 'Month';
}

export interface BingWebSearchResult {
  id: string;
  name: string;
  url: string;
  displayUrl: string;
  snippet: string;
  dateLastCrawled?: string;
  language?: string;
  isNavigational?: boolean;
}

export interface BingNewsSearchResult {
  id: string;
  name: string;
  url: string;
  description: string;
  provider: Array<{
    name: string;
    image?: {
      thumbnail: {
        contentUrl: string;
        width: number;
        height: number;
      };
    };
  }>;
  datePublished: string;
  category?: string;
  about?: Array<{
    readLink: string;
    name: string;
  }>;
}

export interface BingSearchResponse<T> {
  _type: string;
  queryContext: {
    originalQuery: string;
    alteredQuery?: string;
  };
  webPages?: {
    value: T[];
    totalEstimatedMatches: number;
  };
  news?: {
    value: T[];
    totalEstimatedMatches: number;
  };
  relatedSearches?: {
    value: Array<{
      text: string;
      displayText: string;
      webSearchUrl: string;
    }>;
  };
}

/**
 * Bing Web Search API
 * @param query 검색 쿼리
 * @param config Bing API 설정
 * @param options 추가 옵션
 */
export async function searchBingWeb(
  query: string,
  config: BingSearchConfig,
  options: {
    count?: number;
    offset?: number;
    language?: string;
    region?: string;
  } = {}
): Promise<BingSearchResponse<BingWebSearchResult>> {
  try {
    const {
      count = 10,
      offset = 0,
      language = 'ko',
      region = 'KR'
    } = options;

    const endpoint = config.endpoint || 'https://api.bing.microsoft.com/v7.0/search';
    
    const params = new URLSearchParams({
      q: query,
      mkt: config.market || `${language}-${region}`,
      count: count.toString(),
      offset: offset.toString(),
      safesearch: config.safeSearch || 'Moderate',
      responseFilter: 'Webpages',
      textDecorations: 'true',
      textFormat: 'HTML'
    });

    if (config.freshness) {
      params.append('freshness', config.freshness);
    }

    const response = await fetch(`${endpoint}?${params}`, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
        'Accept': 'application/json',
        'User-Agent': 'Role-GPT-Search/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bing Search API 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Bing Web Search 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `Bing 웹 검색 실패: ${error.message}`
        : 'Bing 웹 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * Bing News Search API
 * @param query 검색 쿼리
 * @param config Bing API 설정
 * @param options 추가 옵션
 */
export async function searchBingNews(
  query: string,
  config: BingSearchConfig,
  options: {
    count?: number;
    offset?: number;
    category?: string;
    sortBy?: 'Date' | 'Relevance';
    since?: string;
  } = {}
): Promise<BingSearchResponse<BingNewsSearchResult>> {
  try {
    const {
      count = 10,
      offset = 0,
      category,
      sortBy = 'Relevance',
      since
    } = options;

    const endpoint = config.endpoint?.replace('/search', '/news/search') || 
                    'https://api.bing.microsoft.com/v7.0/news/search';
    
    const params = new URLSearchParams({
      q: query,
      mkt: config.market || 'ko-KR',
      count: count.toString(),
      offset: offset.toString(),
      safeSearch: config.safeSearch || 'Moderate',
      sortBy,
      textDecorations: 'true',
      textFormat: 'HTML'
    });

    if (category) {
      params.append('category', category);
    }

    if (since) {
      params.append('since', since);
    }

    if (config.freshness) {
      params.append('freshness', config.freshness);
    }

    const response = await fetch(`${endpoint}?${params}`, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
        'Accept': 'application/json',
        'User-Agent': 'Role-GPT-Search/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bing News API 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Bing News Search 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `Bing 뉴스 검색 실패: ${error.message}`
        : 'Bing 뉴스 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * Bing Search 기본 통합 검색 (웹 + 뉴스)
 * @param query 검색 쿼리
 * @param config Bing API 설정
 * @param options 검색 옵션
 */
export async function searchBingUnified(
  query: string,
  config: BingSearchConfig,
  options: {
    includeNews?: boolean;
    webCount?: number;
    newsCount?: number;
  } = {}
): Promise<{
  web: BingWebSearchResult[];
  news: BingNewsSearchResult[];
  query: string;
  source: 'bing';
}> {
  try {
    const {
      includeNews = true,
      webCount = 5,
      newsCount = 3
    } = options;

    // 병렬로 웹 검색과 뉴스 검색 실행
    const promises: Promise<any>[] = [
      searchBingWeb(query, config, { count: webCount })
    ];

    if (includeNews) {
      promises.push(
        searchBingNews(query, config, { count: newsCount })
      );
    }

    const results = await Promise.allSettled(promises);
    
    const webResult = results[0];
    const newsResult = results[1];

    const webPages = webResult.status === 'fulfilled' 
      ? webResult.value.webPages?.value || []
      : [];

    const newsPages = (includeNews && newsResult?.status === 'fulfilled')
      ? newsResult.value.news?.value || []
      : [];

    return {
      web: webPages,
      news: newsPages,
      query,
      source: 'bing'
    };

  } catch (error) {
    console.error('Bing 통합 검색 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `Bing 검색 실패: ${error.message}`
        : 'Bing 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * Bing API 키 유효성 검사
 * @param config Bing API 설정
 */
export async function validateBingApiKey(config: BingSearchConfig): Promise<boolean> {
  try {
    // 간단한 테스트 쿼리로 API 키 유효성 검사
    await searchBingWeb('test', config, { count: 1 });
    return true;
  } catch (error) {
    console.warn('Bing API 키 검증 실패:', error);
    return false;
  }
}

/**
 * Bing Search 사용량 체크 (Quota 확인)
 * 실제로는 Bing API에서 제공하는 사용량 API가 있다면 연동
 */
export async function checkBingUsage(config: BingSearchConfig): Promise<{
  total: number;
  used: number;
  remaining: number;
  resetDate?: string;
}> {
  // TODO: 실제 Bing API 사용량 체크 로직
  // 현재는 더미 데이터 반환
  return {
    total: 1000,
    used: 0,
    remaining: 1000,
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
}

/**
 * Bing Search 관련 유틸리티
 */
export const BingSearchUtils = {
  /**
   * 검색 결과에서 HTML 태그 제거
   */
  stripHtmlTags: (text: string): string => {
    return text.replace(/<[^>]*>/g, '');
  },

  /**
   * Bing 날짜 문자열을 Date 객체로 변환
   */
  parseDate: (dateString: string): Date => {
    return new Date(dateString);
  },

  /**
   * 검색 결과 URL 유효성 검사
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 검색 결과 점수 계산 (관련성 기반)
   */
  calculateRelevanceScore: (result: BingWebSearchResult, query: string): number => {
    const queryWords = query.toLowerCase().split(' ');
    const titleMatches = queryWords.filter(word => 
      result.name.toLowerCase().includes(word)
    ).length;
    const snippetMatches = queryWords.filter(word => 
      result.snippet.toLowerCase().includes(word)
    ).length;
    
    return (titleMatches * 2 + snippetMatches) / queryWords.length;
  }
};
