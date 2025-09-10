/**
 * Serper.dev Search Service - Google SERP JSON API
 * 
 * Serper.dev의 실시간 Google 검색 결과 API
 * - 웹 검색 (Google Search Results)
 * - 뉴스 검색 (Google News)
 * - 이미지 검색 (Google Images)
 * - 동영상 검색 (Google Videos)
 * - 학술 검색 (Google Scholar)
 * 
 * BYOK (Bring Your Own Key) 지원
 */

export interface SerperConfig {
  apiKey: string;
  endpoint?: string;
}

export interface SerperResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  date?: string;
  sitelinks?: Array<{
    title: string;
    link: string;
  }>;
  rating?: number;
  ratingCount?: number;
  priceRange?: string;
}

export interface SerperNewsResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  date: string;
  source: string;
  imageUrl?: string;
}

export interface SerperImageResult {
  position: number;
  title: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  thumbnailUrl: string;
  source: string;
  link: string;
}

export interface SerperResponse {
  searchParameters: {
    q: string;
    gl: string;
    hl: string;
    num: number;
    type?: string;
  };
  searchInformation?: {
    totalResults: string;
    timeTaken: number;
    originalQuery: string;
  };
  answerBox?: {
    snippet: string;
    snippetHighlighted: string[];
    title: string;
    link: string;
  };
  knowledgeGraph?: {
    title: string;
    type: string;
    description: string;
    descriptionSource: string;
    imageUrl?: string;
    attributes?: Record<string, string>;
  };
  organic?: SerperResult[];
  peopleAlsoAsk?: Array<{
    question: string;
    snippet: string;
    title: string;
    link: string;
  }>;
  relatedSearches?: Array<{
    query: string;
  }>;
  news?: SerperNewsResult[];
  images?: SerperImageResult[];
}

/**
 * Serper.dev 웹 검색
 * @param query 검색 쿼리
 * @param config Serper API 설정
 * @param options 추가 옵션
 */
export async function searchSerperWeb(
  query: string,
  config: SerperConfig,
  options: {
    num?: number;
    page?: number;
    gl?: string;
    hl?: string;
    location?: string;
    autocorrect?: boolean;
    tbs?: string;
  } = {}
): Promise<SerperResponse> {
  try {
    const {
      num = 10,
      page = 1,
      gl = 'kr',
      hl = 'ko',
      location,
      autocorrect = true,
      tbs
    } = options;

    const endpoint = config.endpoint || 'https://google.serper.dev/search';
    
    const requestBody: any = {
      q: query,
      gl,
      hl,
      num,
      page,
      autocorrect
    };

    if (location) {
      requestBody.location = location;
    }

    if (tbs) {
      requestBody.tbs = tbs;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-API-KEY': config.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'Role-GPT-Search/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Serper API 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Serper Web Search 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `Serper 웹 검색 실패: ${error.message}`
        : 'Serper 웹 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * Serper.dev 뉴스 검색
 * @param query 검색 쿼리
 * @param config Serper API 설정
 * @param options 뉴스 검색 옵션
 */
export async function searchSerperNews(
  query: string,
  config: SerperConfig,
  options: {
    num?: number;
    page?: number;
    gl?: string;
    hl?: string;
    tbs?: string; // 시간 필터: qdr:d (일), qdr:w (주), qdr:m (월), qdr:y (년)
  } = {}
): Promise<SerperResponse> {
  try {
    const {
      num = 10,
      page = 1,
      gl = 'kr',
      hl = 'ko',
      tbs
    } = options;

    const endpoint = config.endpoint?.replace('/search', '/news') || 
                    'https://google.serper.dev/news';
    
    const requestBody: any = {
      q: query,
      gl,
      hl,
      num,
      page
    };

    if (tbs) {
      requestBody.tbs = tbs;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-API-KEY': config.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'Role-GPT-Search/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Serper News API 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Serper News Search 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `Serper 뉴스 검색 실패: ${error.message}`
        : 'Serper 뉴스 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * Serper.dev 이미지 검색
 * @param query 검색 쿼리
 * @param config Serper API 설정
 * @param options 이미지 검색 옵션
 */
export async function searchSerperImages(
  query: string,
  config: SerperConfig,
  options: {
    num?: number;
    page?: number;
    gl?: string;
    hl?: string;
    tbs?: string;
  } = {}
): Promise<SerperResponse> {
  try {
    const {
      num = 10,
      page = 1,
      gl = 'kr',
      hl = 'ko',
      tbs
    } = options;

    const endpoint = config.endpoint?.replace('/search', '/images') || 
                    'https://google.serper.dev/images';
    
    const requestBody: any = {
      q: query,
      gl,
      hl,
      num,
      page
    };

    if (tbs) {
      requestBody.tbs = tbs;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-API-KEY': config.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'Role-GPT-Search/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Serper Images API 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Serper Images Search 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `Serper 이미지 검색 실패: ${error.message}`
        : 'Serper 이미지 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * Serper.dev 통합 검색 (웹 + 뉴스)
 * @param query 검색 쿼리
 * @param config Serper API 설정
 * @param options 검색 옵션
 */
export async function searchSerperUnified(
  query: string,
  config: SerperConfig,
  options: {
    includeNews?: boolean;
    includeImages?: boolean;
    webCount?: number;
    newsCount?: number;
    imageCount?: number;
  } = {}
): Promise<{
  web: SerperResult[];
  news: SerperNewsResult[];
  images: SerperImageResult[];
  answerBox?: any;
  knowledgeGraph?: any;
  peopleAlsoAsk?: any[];
  query: string;
  source: 'serper';
}> {
  try {
    const {
      includeNews = true,
      includeImages = false,
      webCount = 6,
      newsCount = 3,
      imageCount = 4
    } = options;

    // 병렬로 여러 검색 실행
    const promises: Promise<any>[] = [
      searchSerperWeb(query, config, { num: webCount })
    ];

    if (includeNews) {
      promises.push(
        searchSerperNews(query, config, { num: newsCount })
      );
    }

    if (includeImages) {
      promises.push(
        searchSerperImages(query, config, { num: imageCount })
      );
    }

    const results = await Promise.allSettled(promises);
    
    const webResult = results[0];
    const newsResult = results[1];
    const imageResult = results[2];

    const webData = webResult.status === 'fulfilled' ? webResult.value : {};
    const newsData = (includeNews && newsResult?.status === 'fulfilled') ? newsResult.value : {};
    const imageData = (includeImages && imageResult?.status === 'fulfilled') ? imageResult.value : {};

    return {
      web: webData.organic || [],
      news: newsData.news || [],
      images: imageData.images || [],
      answerBox: webData.answerBox,
      knowledgeGraph: webData.knowledgeGraph,
      peopleAlsoAsk: webData.peopleAlsoAsk,
      query,
      source: 'serper'
    };

  } catch (error) {
    console.error('Serper 통합 검색 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `Serper 검색 실패: ${error.message}`
        : 'Serper 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * Serper API 키 유효성 검사
 * @param config Serper API 설정
 */
export async function validateSerperApiKey(config: SerperConfig): Promise<boolean> {
  try {
    // 간단한 테스트 쿼리로 API 키 유효성 검사
    await searchSerperWeb('test', config, { num: 1 });
    return true;
  } catch (error) {
    console.warn('Serper API 키 검증 실패:', error);
    return false;
  }
}

/**
 * Serper API 사용량 체크
 * Serper.dev는 월 2,500회 무료, 그 이후 유료
 */
export async function checkSerperUsage(config: SerperConfig): Promise<{
  plan: string;
  monthlyLimit: number;
  used: number;
  remaining: number;
  resetDate: string;
}> {
  // TODO: Serper API에서 실제 사용량을 가져오는 로직
  // 현재는 더미 데이터 반환
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
  return {
    plan: 'Free',
    monthlyLimit: 2500,
    used: 0,
    remaining: 2500,
    resetDate: nextMonth.toISOString()
  };
}

/**
 * Serper 관련 유틸리티
 */
export const SerperUtils = {
  /**
   * 시간 필터 생성 (Google의 tbs 파라미터)
   */
  createTimeFilter: (period: 'hour' | 'day' | 'week' | 'month' | 'year'): string => {
    const filters = {
      hour: 'qdr:h',
      day: 'qdr:d',
      week: 'qdr:w',
      month: 'qdr:m',
      year: 'qdr:y'
    };
    return filters[period] || 'qdr:d';
  },

  /**
   * 검색 결과에서 도메인 추출
   */
  extractDomain: (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  },

  /**
   * 검색 결과 필터링 (스팸, 중복 제거)
   */
  filterResults: (results: SerperResult[]): SerperResult[] => {
    const seen = new Set<string>();
    return results.filter(result => {
      // URL 중복 체크
      const cleanUrl = result.link.split('?')[0];
      if (seen.has(cleanUrl)) {
        return false;
      }
      seen.add(cleanUrl);

      // 기본적인 스팸 필터링
      const spamIndicators = ['fake', 'scam', 'virus', 'malware'];
      const titleLower = result.title.toLowerCase();
      const snippetLower = result.snippet.toLowerCase();
      
      return !spamIndicators.some(indicator => 
        titleLower.includes(indicator) || snippetLower.includes(indicator)
      );
    });
  },

  /**
   * 답변 박스에서 핵심 정보 추출
   */
  extractAnswerBoxInfo: (answerBox: any): {
    answer: string;
    source: string;
    confidence: number;
  } | null => {
    if (!answerBox) return null;

    return {
      answer: answerBox.snippet || '',
      source: answerBox.link || '',
      confidence: answerBox.title ? 0.8 : 0.6 // 제목이 있으면 높은 신뢰도
    };
  },

  /**
   * 지식 그래프에서 엔티티 정보 추출
   */
  extractKnowledgeGraphInfo: (knowledgeGraph: any): {
    title: string;
    type: string;
    description: string;
    attributes: Record<string, string>;
    imageUrl?: string;
  } | null => {
    if (!knowledgeGraph) return null;

    return {
      title: knowledgeGraph.title || '',
      type: knowledgeGraph.type || '',
      description: knowledgeGraph.description || '',
      attributes: knowledgeGraph.attributes || {},
      imageUrl: knowledgeGraph.imageUrl
    };
  },

  /**
   * 검색 결과 관련성 점수 계산
   */
  calculateRelevanceScore: (result: SerperResult, query: string): number => {
    const queryWords = query.toLowerCase().split(' ');
    const titleMatches = queryWords.filter(word => 
      result.title.toLowerCase().includes(word)
    ).length;
    const snippetMatches = queryWords.filter(word => 
      result.snippet.toLowerCase().includes(word)
    ).length;
    
    // 위치 점수 (상위 결과일수록 높은 점수)
    const positionScore = Math.max(0, (10 - result.position) / 10);
    
    return (titleMatches * 2 + snippetMatches + positionScore) / (queryWords.length + 1);
  }
};