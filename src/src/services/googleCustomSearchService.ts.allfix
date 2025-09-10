/**
 * Google Custom Search Service - Google Custom Search Engine API
 * 
 * Google의 Custom Search JSON API를 활용한 검색 서비스
 * - 웹 검색
 * - 이미지 검색  
 * - 사이트 내 검색
 * - 프로그래밍 가능한 검색 엔진
 * 
 * BYOK (Bring Your Own Key) 지원
 * 사용자는 API Key와 Search Engine ID(CX) 둘 다 필요
 */

export interface GoogleCSEConfig {
  apiKey: string;
  searchEngineId: string; // CX 파라미터
  endpoint?: string;
  safeSearch?: 'active' | 'high' | 'medium' | 'off';
  language?: string;
  region?: string;
}

export interface GoogleCSEResult {
  kind: string;
  title: string;
  htmlTitle: string;
  link: string;
  displayLink: string;
  snippet: string;
  htmlSnippet: string;
  cacheId?: string;
  formattedUrl: string;
  htmlFormattedUrl: string;
  pagemap?: {
    [key: string]: any;
  };
  fileFormat?: string;
  image?: {
    contextLink: string;
    height: number;
    width: number;
    byteSize: number;
    thumbnailLink: string;
    thumbnailHeight: number;
    thumbnailWidth: number;
  };
}

export interface GoogleCSEResponse {
  kind: string;
  url: {
    type: string;
    template: string;
  };
  queries: {
    request: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
    nextPage?: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
  };
  context: {
    title: string;
  };
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  items?: GoogleCSEResult[];
}

/**
 * Google Custom Search API 웹 검색
 * @param query 검색 쿼리
 * @param config Google CSE 설정
 * @param options 추가 옵션
 */
export async function searchGoogleCSE(
  query: string,
  config: GoogleCSEConfig,
  options: {
    num?: number;
    start?: number;
    searchType?: 'image' | undefined;
    fileType?: string;
    siteSearch?: string;
    dateRestrict?: string;
    sort?: string;
  } = {}
): Promise<GoogleCSEResponse> {
  try {
    const {
      num = 10,
      start = 1,
      searchType,
      fileType,
      siteSearch,
      dateRestrict,
      sort
    } = options;

    const endpoint = config.endpoint || 'https://www.googleapis.com/customsearch/v1';
    
    const params = new URLSearchParams({
      key: config.apiKey,
      cx: config.searchEngineId,
      q: query,
      num: Math.min(num, 10).toString(), // Google CSE는 최대 10개
      start: start.toString(),
      hl: config.language || 'ko',
      gl: config.region || 'kr',
      safe: config.safeSearch || 'medium',
      lr: `lang_${config.language || 'ko'}`
    });

    if (searchType) {
      params.append('searchType', searchType);
    }

    if (fileType) {
      params.append('fileType', fileType);
    }

    if (siteSearch) {
      params.append('siteSearch', siteSearch);
    }

    if (dateRestrict) {
      params.append('dateRestrict', dateRestrict);
    }

    if (sort) {
      params.append('sort', sort);
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
      let errorMessage = `Google CSE API 오류 (${response.status})`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage += `: ${errorData.error.message}`;
        }
      } catch {
        errorMessage += `: ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Google CSE Search 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `Google 커스텀 검색 실패: ${error.message}`
        : 'Google 커스텀 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * Google Custom Search 이미지 검색
 * @param query 검색 쿼리
 * @param config Google CSE 설정
 * @param options 이미지 검색 옵션
 */
export async function searchGoogleCSEImages(
  query: string,
  config: GoogleCSEConfig,
  options: {
    num?: number;
    start?: number;
    imageSize?: 'huge' | 'icon' | 'large' | 'medium' | 'small' | 'xlarge' | 'xxlarge';
    imageType?: 'clipart' | 'face' | 'lineart' | 'stock' | 'photo' | 'animated';
    imageColorType?: 'color' | 'gray' | 'mono' | 'trans';
    imageDominantColor?: 'black' | 'blue' | 'brown' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'white' | 'yellow';
  } = {}
): Promise<GoogleCSEResponse> {
  try {
    const {
      num = 10,
      start = 1,
      imageSize,
      imageType,
      imageColorType,
      imageDominantColor
    } = options;

    const searchOptions: any = {
      num,
      start,
      searchType: 'image' as const
    };

    // 이미지 관련 파라미터들을 URL에 직접 추가
    const params = new URLSearchParams({
      key: config.apiKey,
      cx: config.searchEngineId,
      q: query,
      num: Math.min(num, 10).toString(),
      start: start.toString(),
      hl: config.language || 'ko',
      gl: config.region || 'kr',
      safe: config.safeSearch || 'medium',
      searchType: 'image'
    });

    if (imageSize) params.append('imgSize', imageSize);
    if (imageType) params.append('imgType', imageType);
    if (imageColorType) params.append('imgColorType', imageColorType);
    if (imageDominantColor) params.append('imgDominantColor', imageDominantColor);

    const endpoint = config.endpoint || 'https://www.googleapis.com/customsearch/v1';
    
    const response = await fetch(`${endpoint}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Role-GPT-Search/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google CSE 이미지 검색 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Google CSE Image Search 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `Google 이미지 검색 실패: ${error.message}`
        : 'Google 이미지 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * Google CSE 통합 검색 (웹 + 이미지)
 * @param query 검색 쿼리
 * @param config Google CSE 설정
 * @param options 검색 옵션
 */
export async function searchGoogleCSEUnified(
  query: string,
  config: GoogleCSEConfig,
  options: {
    includeImages?: boolean;
    webCount?: number;
    imageCount?: number;
    siteSearch?: string;
  } = {}
): Promise<{
  web: GoogleCSEResult[];
  images: GoogleCSEResult[];
  query: string;
  source: 'google_cse';
  searchInformation?: any;
}> {
  try {
    const {
      includeImages = false,
      webCount = 8,
      imageCount = 4,
      siteSearch
    } = options;

    // 웹 검색 실행
    const webSearchPromise = searchGoogleCSE(query, config, { 
      num: webCount,
      siteSearch 
    });

    // 이미지 검색 실행 (선택적)
    const imageSearchPromise = includeImages 
      ? searchGoogleCSEImages(query, config, { num: imageCount })
      : Promise.resolve(null);

    const [webResult, imageResult] = await Promise.allSettled([
      webSearchPromise,
      imageSearchPromise
    ]);

    const webPages = webResult.status === 'fulfilled' 
      ? webResult.value.items || []
      : [];

    const imagePages = (imageResult?.status === 'fulfilled' && imageResult.value)
      ? imageResult.value.items || []
      : [];

    const searchInfo = webResult.status === 'fulfilled' 
      ? webResult.value.searchInformation
      : undefined;

    return {
      web: webPages,
      images: imagePages,
      query,
      source: 'google_cse',
      searchInformation: searchInfo
    };

  } catch (error) {
    console.error('Google CSE 통합 검색 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `Google 커스텀 검색 실패: ${error.message}`
        : 'Google 커스텀 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * Google CSE API 키 및 검색 엔진 ID 유효성 검사
 * @param config Google CSE 설정
 */
export async function validateGoogleCSEConfig(config: GoogleCSEConfig): Promise<{
  isValid: boolean;
  error?: string;
}> {
  try {
    // API 키와 CX가 모두 있는지 확인
    if (!config.apiKey || !config.searchEngineId) {
      return {
        isValid: false,
        error: 'API 키와 검색 엔진 ID(CX)가 모두 필요합니다'
      };
    }

    // 간단한 테스트 쿼리로 설정 유효성 검사
    await searchGoogleCSE('test', config, { num: 1 });
    return { isValid: true };
    
  } catch (error) {
    console.warn('Google CSE 설정 검증 실패:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : '설정 검증 실패'
    };
  }
}

/**
 * Google CSE API 할당량 및 사용량 체크
 * Google CSE API는 일일 100회 무료, 그 이후 유료
 */
export async function checkGoogleCSEUsage(config: GoogleCSEConfig): Promise<{
  quotaUser?: string;
  dailyLimit: number;
  estimatedUsed: number;
  resetTime: string;
}> {
  // TODO: Google API Console에서 실제 사용량을 가져오는 로직
  // 현재는 더미 데이터 반환
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return {
    dailyLimit: 100, // Google CSE 무료 할당량
    estimatedUsed: 0,
    resetTime: tomorrow.toISOString()
  };
}

/**
 * Google CSE 관련 유틸리티
 */
export const GoogleCSEUtils = {
  /**
   * 검색 엔진 ID(CX) 유효성 검사
   */
  isValidSearchEngineId: (cx: string): boolean => {
    // Google CSE의 CX 형식: 영숫자와 콜론으로 구성
    return /^[a-zA-Z0-9:]+$/.test(cx) && cx.length > 10;
  },

  /**
   * API 키 형식 유효성 검사
   */
  isValidApiKey: (key: string): boolean => {
    // Google API 키 형식: AIza로 시작하는 39자 문자열
    return /^AIza[0-9A-Za-z-_]{35}$/.test(key);
  },

  /**
   * 검색 결과에서 메타데이터 추출
   */
  extractMetadata: (result: GoogleCSEResult): {
    title: string;
    description: string;
    url: string;
    domain: string;
    hasImage: boolean;
    fileType?: string;
  } => {
    const url = new URL(result.link);
    return {
      title: result.title,
      description: result.snippet,
      url: result.link,
      domain: url.hostname,
      hasImage: !!result.pagemap?.cse_image,
      fileType: result.fileFormat
    };
  },

  /**
   * 검색 결과 중복 제거
   */
  deduplicateResults: (results: GoogleCSEResult[]): GoogleCSEResult[] => {
    const seen = new Set<string>();
    return results.filter(result => {
      const url = result.link.split('?')[0]; // 쿼리 파라미터 제거
      if (seen.has(url)) {
        return false;
      }
      seen.add(url);
      return true;
    });
  },

  /**
   * 검색 결과 관련성 점수 계산
   */
  calculateRelevanceScore: (result: GoogleCSEResult, query: string): number => {
    const queryWords = query.toLowerCase().split(' ');
    const titleMatches = queryWords.filter(word => 
      result.title.toLowerCase().includes(word)
    ).length;
    const snippetMatches = queryWords.filter(word => 
      result.snippet.toLowerCase().includes(word)
    ).length;
    
    return (titleMatches * 2 + snippetMatches) / queryWords.length;
  },

  /**
   * 사이트별 검색 결과 그룹핑
   */
  groupByDomain: (results: GoogleCSEResult[]): Record<string, GoogleCSEResult[]> => {
    return results.reduce((groups, result) => {
      const domain = new URL(result.link).hostname;
      if (!groups[domain]) {
        groups[domain] = [];
      }
      groups[domain].push(result);
      return groups;
    }, {} as Record<string, GoogleCSEResult[]>);
  }
};