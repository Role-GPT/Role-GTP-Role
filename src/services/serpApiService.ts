/**
 * SerpAPI Service - Google SERP JSON API
 * 
 * SerpAPI의 실시간 Google 검색 결과 API
 * - 웹 검색 (Google Search)
 * - 뉴스 검색 (Google News)
 * - 이미지 검색 (Google Images)
 * - 학술 검색 (Google Scholar)
 * - 쇼핑 검색 (Google Shopping)
 * - 지도 검색 (Google Maps)
 * 
 * BYOK (Bring Your Own Key) 지원
 */

export interface SerpApiConfig {
  apiKey: string;
  endpoint?: string;
}

export interface SerpApiResult {
  position: number;
  title: string;
  link: string;
  displayed_link: string;
  snippet: string;
  cached_page_link?: string;
  related_pages_link?: string;
  date?: string;
}

export interface SerpApiNewsResult {
  position: number;
  title: string;
  link: string;
  source: string;
  date: string;
  snippet: string;
  thumbnail?: string;
}

export interface SerpApiImageResult {
  position: number;
  title: string;
  link: string;
  source: string;
  original: string;
  original_width: number;
  original_height: number;
  thumbnail: string;
  thumbnail_width: number;
  thumbnail_height: number;
}

export interface SerpApiResponse {
  search_metadata: {
    id: string;
    status: string;
    json_endpoint: string;
    created_at: string;
    processed_at: string;
    google_url: string;
    raw_html_file: string;
    total_time_taken: number;
  };
  search_parameters: {
    engine: string;
    q: string;
    location_requested?: string;
    location_used?: string;
    google_domain: string;
    hl: string;
    gl: string;
    device?: string;
    num?: number;
    start?: number;
  };
  search_information?: {
    organic_results_state: string;
    query_displayed: string;
    total_results: number;
    time_taken_displayed: number;
  };
  answer_box?: {
    type: string;
    result: string;
    source: {
      name: string;
      link: string;
    };
  };
  knowledge_graph?: {
    title: string;
    type: string;
    description: string;
    source: {
      name: string;
      link: string;
    };
    thumbnail?: string;
  };
  organic_results?: SerpApiResult[];
  people_also_ask?: Array<{
    question: string;
    snippet: string;
    title: string;
    link: string;
  }>;
  related_searches?: Array<{
    query: string;
    link: string;
  }>;
  news_results?: SerpApiNewsResult[];
  images_results?: SerpApiImageResult[];
}

/**
 * SerpAPI 웹 검색
 * @param query 검색 쿼리
 * @param config SerpAPI 설정
 * @param options 추가 옵션
 */
export async function searchSerpApi(
  query: string,
  config: SerpApiConfig,
  options: {
    num?: number;
    start?: number;
    hl?: string;
    gl?: string;
    location?: string;
    device?: 'desktop' | 'mobile' | 'tablet';
    safe?: 'active' | 'off';
    filter?: '0' | '1'; // 중복 결과 필터링
    tbs?: string; // 시간 범위 등 고급 필터
  } = {}
): Promise<SerpApiResponse> {
  try {
    const {
      num = 10,
      start = 0,
      hl = 'ko',
      gl = 'kr',
      location,
      device = 'desktop',
      safe = 'off',
      filter = '1',
      tbs
    } = options;

    const endpoint = config.endpoint || 'https://serpapi.com/search.json';
    
    const params = new URLSearchParams({
      engine: 'google',
      q: query,
      api_key: config.apiKey,
      num: num.toString(),
      start: start.toString(),
      hl,
      gl,
      device,
      safe,
      filter
    });

    if (location) {
      params.append('location', location);
    }

    if (tbs) {
      params.append('tbs', tbs);
    }

    const response = await fetch(`${endpoint}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Role-GPT-Search/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SerpAPI 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // SerpAPI 에러 체크
    if (data.error) {
      throw new Error(`SerpAPI 에러: ${data.error}`);
    }

    return data;

  } catch (error) {
    console.error('SerpAPI Search 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `SerpAPI 검색 실패: ${error.message}`
        : 'SerpAPI 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * SerpAPI 뉴스 검색
 * @param query 검색 쿼리
 * @param config SerpAPI 설정
 * @param options 뉴스 검색 옵션
 */
export async function searchSerpApiNews(
  query: string,
  config: SerpApiConfig,
  options: {
    num?: number;
    hl?: string;
    gl?: string;
    tbm?: 'nws'; // 뉴스 모드
    tbs?: string; // 시간 필터: qdr:d (일), qdr:w (주), qdr:m (월)
  } = {}
): Promise<SerpApiResponse> {
  try {
    const {
      num = 10,
      hl = 'ko',
      gl = 'kr',
      tbs
    } = options;

    const endpoint = config.endpoint || 'https://serpapi.com/search.json';
    
    const params = new URLSearchParams({
      engine: 'google',
      q: query,
      api_key: config.apiKey,
      tbm: 'nws', // 뉴스 모드
      num: num.toString(),
      hl,
      gl
    });

    if (tbs) {
      params.append('tbs', tbs);
    }

    const response = await fetch(`${endpoint}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Role-GPT-Search/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SerpAPI News 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`SerpAPI News 에러: ${data.error}`);
    }

    return data;

  } catch (error) {
    console.error('SerpAPI News Search 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `SerpAPI 뉴스 검색 실패: ${error.message}`
        : 'SerpAPI 뉴스 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * SerpAPI 이미지 검색
 * @param query 검색 쿼리
 * @param config SerpAPI 설정
 * @param options 이미지 검색 옵션
 */
export async function searchSerpApiImages(
  query: string,
  config: SerpApiConfig,
  options: {
    num?: number;
    hl?: string;
    gl?: string;
    ijn?: number; // 이미지 페이지 번호
    tbs?: string; // 이미지 크기, 색상 등 필터
  } = {}
): Promise<SerpApiResponse> {
  try {
    const {
      num = 20,
      hl = 'ko',
      gl = 'kr',
      ijn = 0,
      tbs
    } = options;

    const endpoint = config.endpoint || 'https://serpapi.com/search.json';
    
    const params = new URLSearchParams({
      engine: 'google',
      q: query,
      api_key: config.apiKey,
      tbm: 'isch', // 이미지 모드
      num: num.toString(),
      hl,
      gl,
      ijn: ijn.toString()
    });

    if (tbs) {
      params.append('tbs', tbs);
    }

    const response = await fetch(`${endpoint}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Role-GPT-Search/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SerpAPI Images 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`SerpAPI Images 에러: ${data.error}`);
    }

    return data;

  } catch (error) {
    console.error('SerpAPI Images Search 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `SerpAPI 이미지 검색 실패: ${error.message}`
        : 'SerpAPI 이미지 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * SerpAPI 학술 검색 (Google Scholar)
 * @param query 검색 쿼리
 * @param config SerpAPI 설정
 * @param options 학술 검색 옵션
 */
export async function searchSerpApiScholar(
  query: string,
  config: SerpApiConfig,
  options: {
    num?: number;
    start?: number;
    hl?: string;
    as_ylo?: number; // 시작 연도
    as_yhi?: number; // 끝 연도
    scisbd?: '1' | '2'; // 정렬 (1: 관련성, 2: 날짜)
  } = {}
): Promise<SerpApiResponse> {
  try {
    const {
      num = 10,
      start = 0,
      hl = 'ko',
      as_ylo,
      as_yhi,
      scisbd = '1'
    } = options;

    const endpoint = config.endpoint || 'https://serpapi.com/search.json';
    
    const params = new URLSearchParams({
      engine: 'google_scholar',
      q: query,
      api_key: config.apiKey,
      num: num.toString(),
      start: start.toString(),
      hl,
      scisbd
    });

    if (as_ylo) {
      params.append('as_ylo', as_ylo.toString());
    }

    if (as_yhi) {
      params.append('as_yhi', as_yhi.toString());
    }

    const response = await fetch(`${endpoint}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Role-GPT-Search/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SerpAPI Scholar 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`SerpAPI Scholar 에러: ${data.error}`);
    }

    return data;

  } catch (error) {
    console.error('SerpAPI Scholar Search 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `SerpAPI 학술 검색 실패: ${error.message}`
        : 'SerpAPI 학술 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * SerpAPI 통합 검색
 * @param query 검색 쿼리
 * @param config SerpAPI 설정
 * @param options 검색 옵션
 */
export async function searchSerpApiUnified(
  query: string,
  config: SerpApiConfig,
  options: {
    includeNews?: boolean;
    includeImages?: boolean;
    includeScholar?: boolean;
    webCount?: number;
    newsCount?: number;
    imageCount?: number;
    scholarCount?: number;
  } = {}
): Promise<{
  web: SerpApiResult[];
  news: SerpApiNewsResult[];
  images: SerpApiImageResult[];
  scholar: any[];
  answerBox?: any;
  knowledgeGraph?: any;
  peopleAlsoAsk?: any[];
  query: string;
  source: 'serpapi';
}> {
  try {
    const {
      includeNews = true,
      includeImages = false,
      includeScholar = false,
      webCount = 6,
      newsCount = 3,
      imageCount = 4,
      scholarCount = 3
    } = options;

    // 병렬로 여러 검색 실행
    const promises: Promise<any>[] = [
      searchSerpApi(query, config, { num: webCount })
    ];

    if (includeNews) {
      promises.push(
        searchSerpApiNews(query, config, { num: newsCount })
      );
    }

    if (includeImages) {
      promises.push(
        searchSerpApiImages(query, config, { num: imageCount })
      );
    }

    if (includeScholar) {
      promises.push(
        searchSerpApiScholar(query, config, { num: scholarCount })
      );
    }

    const results = await Promise.allSettled(promises);
    
    const webResult = results[0];
    const newsResult = results[1];
    const imageResult = results[2];
    const scholarResult = results[3];

    const webData = webResult.status === 'fulfilled' ? webResult.value : {};
    const newsData = (includeNews && newsResult?.status === 'fulfilled') ? newsResult.value : {};
    const imageData = (includeImages && imageResult?.status === 'fulfilled') ? imageResult.value : {};
    const scholarData = (includeScholar && scholarResult?.status === 'fulfilled') ? scholarResult.value : {};

    return {
      web: webData.organic_results || [],
      news: newsData.news_results || [],
      images: imageData.images_results || [],
      scholar: scholarData.organic_results || [],
      answerBox: webData.answer_box,
      knowledgeGraph: webData.knowledge_graph,
      peopleAlsoAsk: webData.people_also_ask,
      query,
      source: 'serpapi'
    };

  } catch (error) {
    console.error('SerpAPI 통합 검색 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `SerpAPI 검색 실패: ${error.message}`
        : 'SerpAPI 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * SerpAPI 키 유효성 검사
 * @param config SerpAPI 설정
 */
export async function validateSerpApiKey(config: SerpApiConfig): Promise<{
  isValid: boolean;
  accountInfo?: {
    plan: string;
    searches_left: number;
    searches_used_today: number;
  };
  error?: string;
}> {
  try {
    // Account API를 사용해서 키 정보 확인
    const accountEndpoint = config.endpoint?.replace('/search.json', '/account.json') ||
                           'https://serpapi.com/account.json';
    
    const response = await fetch(`${accountEndpoint}?api_key=${config.apiKey}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Role-GPT-Search/1.0'
      }
    });

    if (!response.ok) {
      return {
        isValid: false,
        error: `SerpAPI 키 검증 실패 (${response.status})`
      };
    }

    const data = await response.json();
    
    if (data.error) {
      return {
        isValid: false,
        error: data.error
      };
    }

    return {
      isValid: true,
      accountInfo: {
        plan: data.plan || 'Free',
        searches_left: data.searches_left || 0,
        searches_used_today: data.searches_used_today || 0
      }
    };

  } catch (error) {
    console.warn('SerpAPI 키 검증 실패:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : '검증 실패'
    };
  }
}

/**
 * SerpAPI 관련 유틸리티
 */
export const SerpApiUtils = {
  /**
   * 시간 필터 생성
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
   * 이미지 크기 필터 생성
   */
  createImageSizeFilter: (size: 'large' | 'medium' | 'icon'): string => {
    const filters = {
      large: 'isz:l',
      medium: 'isz:m',
      icon: 'isz:i'
    };
    return filters[size] || 'isz:m';
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
   * 검색 결과 품질 점수 계산
   */
  calculateQualityScore: (result: SerpApiResult, query: string): number => {
    const queryWords = query.toLowerCase().split(' ');
    
    // 제목 매칭
    const titleMatches = queryWords.filter(word => 
      result.title.toLowerCase().includes(word)
    ).length;
    
    // 스니펫 매칭
    const snippetMatches = queryWords.filter(word => 
      result.snippet.toLowerCase().includes(word)
    ).length;
    
    // 위치 점수 (상위일수록 높음)
    const positionScore = Math.max(0, (10 - result.position) / 10);
    
    // 신뢰할 수 있는 도메인 보너스
    const domain = this.extractDomain(result.link);
    const trustedDomains = ['wikipedia.org', 'gov.kr', 'edu', 'ac.kr'];
    const domainBonus = trustedDomains.some(trusted => domain.includes(trusted)) ? 0.2 : 0;
    
    const baseScore = (titleMatches * 2 + snippetMatches + positionScore) / (queryWords.length + 1);
    return Math.min(1, baseScore + domainBonus);
  },

  /**
   * 답변 박스 정보 구조화
   */
  structureAnswerBox: (answerBox: any): {
    type: string;
    answer: string;
    source: string;
    confidence: number;
  } | null => {
    if (!answerBox) return null;

    return {
      type: answerBox.type || 'unknown',
      answer: answerBox.result || '',
      source: answerBox.source?.link || '',
      confidence: answerBox.type === 'featured_snippet' ? 0.9 : 0.7
    };
  }
};
