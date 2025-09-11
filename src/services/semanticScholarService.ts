/**
 * Semantic Scholar Service - AI 기반 학술 논문 검색
 * 
 * Semantic Scholar API를 활용한 학술 논문 검색 및 분석
 * - AI 기반 논문 추천 및 관련성 분석
 * - 인용 네트워크 및 영향력 분석
 * - 다양한 학문 분야 지원
 * - BYOK (API 키 선택사항, 키 없이도 제한적 사용 가능)
 * 
 * @docs https://api.semanticscholar.org/
 */

export interface SemanticScholarConfig {
  apiKey?: string;
  endpoint?: string;
}

export interface SemanticScholarPaper {
  paperId: string;
  externalIds: {
    MAG?: string;
    DBLP?: string;
    ACL?: string;
    ArXiv?: string;
    DOI?: string;
    CorpusId?: number;
    PubMed?: string;
    PubMedCentral?: string;
  };
  url: string;
  title: string;
  abstract?: string;
  venue: string;
  year?: number;
  referenceCount: number;
  citationCount: number;
  influentialCitationCount: number;
  isOpenAccess: boolean;
  fieldsOfStudy: string[];
  authors: Array<{
    authorId: string;
    name: string;
    url?: string;
    affiliations?: string[];
    homepage?: string;
    paperCount?: number;
    citationCount?: number;
    hIndex?: number;
  }>;
  s2FieldsOfStudy?: Array<{
    category: string;
    source: string;
  }>;
  publicationTypes?: string[];
  publicationDate?: string;
  journal?: {
    name: string;
    volume?: string;
    pages?: string;
  };
  embedding?: {
    model: string;
    vector: number[];
  };
}

export interface SemanticScholarSearchResponse {
  total: number;
  offset: number;
  next?: number;
  data: SemanticScholarPaper[];
}

export interface SemanticScholarAuthor {
  authorId: string;
  externalIds: {
    DBLP?: string[];
    ORCID?: string[];
  };
  url: string;
  name: string;
  aliases: string[];
  affiliations: string[];
  homepage?: string;
  paperCount: number;
  citationCount: number;
  hIndex: number;
  papers?: SemanticScholarPaper[];
}

/**
 * Semantic Scholar 논문 검색
 * @param query 검색 쿼리
 * @param config API 설정
 * @param options 검색 옵션
 */
export async function searchSemanticScholar(
  query: string,
  config: SemanticScholarConfig = {},
  options: {
    limit?: number;
    offset?: number;
    fields?: string[];
    year?: string; // 예: "2019-2023" 또는 "2020"
    venue?: string[];
    fieldsOfStudy?: string[];
    minCitationCount?: number;
    publicationTypes?: string[];
    openAccessPdf?: boolean;
    sort?: 'relevance' | 'citationCount' | 'publicationDate';
  } = {}
): Promise<SemanticScholarSearchResponse> {
  try {
    const {
      limit = 10,
      offset = 0,
      fields = ['paperId', 'title', 'abstract', 'authors', 'venue', 'year', 'citationCount', 'referenceCount', 'fieldsOfStudy', 'url', 'isOpenAccess'],
      year,
      venue,
      fieldsOfStudy,
      minCitationCount,
      publicationTypes,
      openAccessPdf,
      sort = 'relevance'
    } = options;

    const baseUrl = config.endpoint || 'https://api.semanticscholar.org/graph/v1/paper/search';
    
    const params = new URLSearchParams({
      query: query,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: fields.join(',')
    });

    if (year) {
      params.append('year', year);
    }

    if (venue && venue.length > 0) {
      params.append('venue', venue.join(','));
    }

    if (fieldsOfStudy && fieldsOfStudy.length > 0) {
      params.append('fieldsOfStudy', fieldsOfStudy.join(','));
    }

    if (minCitationCount !== undefined) {
      params.append('minCitationCount', minCitationCount.toString());
    }

    if (publicationTypes && publicationTypes.length > 0) {
      params.append('publicationTypes', publicationTypes.join(','));
    }

    if (openAccessPdf !== undefined) {
      params.append('openAccessPdf', openAccessPdf.toString());
    }

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'RoleGPT-Search/1.0'
    };

    if (config.apiKey) {
      headers['x-api-key'] = config.apiKey;
    }

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Semantic Scholar API 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Semantic Scholar 검색 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `Semantic Scholar 검색 실패: ${error.message}`
        : 'Semantic Scholar 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * Semantic Scholar 저자 검색
 * @param query 저자 이름
 * @param config API 설정
 * @param options 검색 옵션
 */
export async function searchSemanticScholarAuthors(
  query: string,
  config: SemanticScholarConfig = {},
  options: {
    limit?: number;
    offset?: number;
    fields?: string[];
  } = {}
): Promise<{
  total: number;
  offset: number;
  next?: number;
  data: SemanticScholarAuthor[];
}> {
  try {
    const {
      limit = 10,
      offset = 0,
      fields = ['authorId', 'name', 'affiliations', 'paperCount', 'citationCount', 'hIndex', 'url']
    } = options;

    const baseUrl = config.endpoint?.replace('/paper/search', '/author/search') || 
                    'https://api.semanticscholar.org/graph/v1/author/search';
    
    const params = new URLSearchParams({
      query: query,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: fields.join(',')
    });

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'RoleGPT-Search/1.0'
    };

    if (config.apiKey) {
      headers['x-api-key'] = config.apiKey;
    }

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Semantic Scholar 저자 검색 API 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Semantic Scholar 저자 검색 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `Semantic Scholar 저자 검색 실패: ${error.message}`
        : 'Semantic Scholar 저자 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * 특정 논문의 상세 정보 조회
 * @param paperId 논문 ID
 * @param config API 설정
 * @param options 조회 옵션
 */
export async function getSemanticScholarPaper(
  paperId: string,
  config: SemanticScholarConfig = {},
  options: {
    fields?: string[];
  } = {}
): Promise<SemanticScholarPaper> {
  try {
    const {
      fields = ['paperId', 'title', 'abstract', 'authors', 'venue', 'year', 'citationCount', 'referenceCount', 'fieldsOfStudy', 'url', 'isOpenAccess', 'influentialCitationCount', 'publicationDate', 'journal']
    } = options;

    const baseUrl = config.endpoint?.replace('/paper/search', '/paper') || 
                    'https://api.semanticscholar.org/graph/v1/paper';
    
    const params = new URLSearchParams({
      fields: fields.join(',')
    });

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'RoleGPT-Search/1.0'
    };

    if (config.apiKey) {
      headers['x-api-key'] = config.apiKey;
    }

    const response = await fetch(`${baseUrl}/${paperId}?${params}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Semantic Scholar 논문 조회 API 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Semantic Scholar 논문 조회 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `Semantic Scholar 논문 조회 실패: ${error.message}`
        : 'Semantic Scholar 논문 조회 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * 논문의 인용 논문 목록 조회
 * @param paperId 논문 ID
 * @param config API 설정
 * @param options 조회 옵션
 */
export async function getSemanticScholarCitations(
  paperId: string,
  config: SemanticScholarConfig = {},
  options: {
    limit?: number;
    offset?: number;
    fields?: string[];
  } = {}
): Promise<{
  offset: number;
  next?: number;
  data: Array<{
    contexts: string[];
    intents: string[];
    citingPaper: SemanticScholarPaper;
  }>;
}> {
  try {
    const {
      limit = 10,
      offset = 0,
      fields = ['citingPaper.paperId', 'citingPaper.title', 'citingPaper.authors', 'citingPaper.year', 'citingPaper.citationCount']
    } = options;

    const baseUrl = config.endpoint?.replace('/paper/search', '/paper') || 
                    'https://api.semanticscholar.org/graph/v1/paper';
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      fields: fields.join(',')
    });

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'RoleGPT-Search/1.0'
    };

    if (config.apiKey) {
      headers['x-api-key'] = config.apiKey;
    }

    const response = await fetch(`${baseUrl}/${paperId}/citations?${params}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Semantic Scholar 인용 조회 API 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Semantic Scholar 인용 조회 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `Semantic Scholar 인용 조회 실패: ${error.message}`
        : 'Semantic Scholar 인용 조회 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * 논문 추천 (유사한 논문 찾기)
 * @param paperId 기준 논문 ID
 * @param config API 설정
 * @param options 추천 옵션
 */
export async function getSemanticScholarRecommendations(
  paperId: string,
  config: SemanticScholarConfig = {},
  options: {
    limit?: number;
    fields?: string[];
  } = {}
): Promise<{
  recommendedPapers: SemanticScholarPaper[];
}> {
  try {
    const {
      limit = 10,
      fields = ['paperId', 'title', 'authors', 'year', 'citationCount', 'url']
    } = options;

    const baseUrl = config.endpoint?.replace('/paper/search', '/recommendations/v1/papers') || 
                    'https://api.semanticscholar.org/recommendations/v1/papers';
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      fields: fields.join(',')
    });

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'RoleGPT-Search/1.0'
    };

    if (config.apiKey) {
      headers['x-api-key'] = config.apiKey;
    }

    const response = await fetch(`${baseUrl}/forpaper/${paperId}?${params}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Semantic Scholar 추천 API 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Semantic Scholar 논문 추천 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `Semantic Scholar 논문 추천 실패: ${error.message}`
        : 'Semantic Scholar 논문 추천 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * Semantic Scholar API 키 유효성 검사
 * @param config API 설정
 */
export async function validateSemanticScholarApiKey(config: SemanticScholarConfig): Promise<{
  isValid: boolean;
  hasKey: boolean;
  error?: string;
}> {
  try {
    // API 키 없이도 사용 가능하므로 키가 없어도 유효함
    if (!config.apiKey) {
      return {
        isValid: true,
        hasKey: false
      };
    }

    // API 키가 있으면 테스트 검색으로 유효성 확인
    await searchSemanticScholar('machine learning', config, { limit: 1 });
    
    return {
      isValid: true,
      hasKey: true
    };

  } catch (error) {
    console.warn('Semantic Scholar API 키 검증 실패:', error);
    return {
      isValid: false,
      hasKey: !!config.apiKey,
      error: error instanceof Error ? error.message : '검증 실패'
    };
  }
}

/**
 * Semantic Scholar 관련 유틸리티
 */
export const SemanticScholarUtils = {
  /**
   * 논문 URL 생성
   */
  getPaperUrl: (paperId: string): string => {
    return `https://www.semanticscholar.org/paper/${paperId}`;
  },

  /**
   * 저자 URL 생성
   */
  getAuthorUrl: (authorId: string): string => {
    return `https://www.semanticscholar.org/author/${authorId}`;
  },

  /**
   * 학문 분야 색상 매핑
   */
  getFieldColor: (field: string): string => {
    const colorMap: Record<string, string> = {
      'Computer Science': '#3B82F6',
      'Mathematics': '#10B981',
      'Physics': '#F59E0B',
      'Biology': '#EF4444',
      'Chemistry': '#8B5CF6',
      'Medicine': '#EC4899',
      'Engineering': '#6B7280',
      'Psychology': '#F97316',
      'Economics': '#14B8A6',
      'Sociology': '#84CC16'
    };
    return colorMap[field] || '#6B7280';
  },

  /**
   * 인용 수에 따른 영향력 레벨 계산
   */
  getImpactLevel: (citationCount: number): {
    level: 'low' | 'medium' | 'high' | 'very-high';
    label: string;
    color: string;
  } => {
    if (citationCount >= 1000) {
      return { level: 'very-high', label: '매우 높음', color: '#DC2626' };
    } else if (citationCount >= 100) {
      return { level: 'high', label: '높음', color: '#EA580C' };
    } else if (citationCount >= 10) {
      return { level: 'medium', label: '보통', color: '#CA8A04' };
    } else {
      return { level: 'low', label: '낮음', color: '#65A30D' };
    }
  },

  /**
   * 논문 메타데이터 정리
   */
  extractMetadata: (paper: SemanticScholarPaper): {
    title: string;
    authors: string;
    venue: string;
    year: string;
    citations: number;
    fields: string[];
    doi?: string;
    isOpenAccess: boolean;
  } => {
    return {
      title: paper.title,
      authors: paper.authors.map(a => a.name).join(', '),
      venue: paper.venue || '출처 없음',
      year: paper.year?.toString() || '연도 미상',
      citations: paper.citationCount,
      fields: paper.fieldsOfStudy || [],
      doi: paper.externalIds?.DOI,
      isOpenAccess: paper.isOpenAccess
    };
  },

  /**
   * 검색 쿼리 최적화
   */
  optimizeQuery: (rawQuery: string): string => {
    // 기본적인 쿼리 정리
    return rawQuery
      .trim()
      .replace(/[^\w\s\-"]/g, ' ') // 특수문자 제거 (따옴표, 하이픈 제외)
      .replace(/\s+/g, ' ') // 연속 공백 제거
      .toLowerCase();
  },

  /**
   * 논문 요약 생성
   */
  generateSummary: (paper: SemanticScholarPaper): string => {
    const metadata = SemanticScholarUtils.extractMetadata(paper);
    const abstract = paper.abstract ? 
      (paper.abstract.length > 200 ? paper.abstract.substring(0, 200) + '...' : paper.abstract) : 
      '초록 없음';
    
    return `${metadata.title} (${metadata.year}) - ${metadata.authors}\n출처: ${metadata.venue}\n인용: ${metadata.citations}회\n\n${abstract}`;
  }
};
