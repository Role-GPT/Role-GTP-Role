/**
 * API 키 라이브러리 시스템 타입 정의
 * 
 * BYOK 사용자들을 위한 커스텀 API 템플릿 관리 시스템
 */

export type AuthType = 'None' | 'Header' | 'Query' | 'OAuth';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ApiCategory = 'search' | 'academic' | 'finance' | 'media' | 'social' | 'lifestyle' | 'llm';

export interface ApiTemplate {
  id: string;
  name: string;
  category: ApiCategory;
  icon: string;
  baseUrl: string;
  path: string;
  method: HttpMethod;
  
  // 인증 설정
  auth: {
    type: AuthType;
    keyName?: string;
    prefix?: string; // 예: "Bearer "
  };
  
  // 요청 파라미터
  params?: Record<string, string>; // {{INPUT_TEXT}} 지원
  body?: string; // JSON 템플릿, {{INPUT_TEXT}} 지원
  headers?: Record<string, string>; // {{API_KEY}} 지원
  
  // 응답 매핑 (JSONPath)
  responseMap?: {
    primaryText?: string;
    primaryImage?: string;
  };
  
  // 네트워크 설정
  timeoutMs: number;
  maxRespKB: number;
  
  // 메타 정보
  freeTier: boolean;
  keyless: boolean;
  enabled: boolean;
  
  // 사용자 권한
  isBuiltIn?: boolean; // 기본 제공 템플릿 여부
  userId?: string; // 커스텀 템플릿의 생성자
  
  // 설명 및 문서
  description?: string;
  documentation?: string;
  
  // 테스트 정보
  testEndpoint?: string;
  testParams?: Record<string, string>;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface UserApiKey {
  templateId: string;
  apiKey: string;
  clientId?: string;
  clientSecret?: string;
  isActive: boolean;
  lastTested?: Date;
  testResult?: {
    success: boolean;
    error?: string;
    responseTime?: number;
  };
}

export interface ApiLibraryData {
  templates: ApiTemplate[];
  userKeys: Record<string, UserApiKey>;
  limits: {
    trial: {
      imagePerDay: number;
      weatherPerDay: number;
      scholarPerDay: number;
      searchPerDay: number;
    };
    adminBypassUserIds: string[];
  };
  usage: Record<string, {
    count: number;
    lastUsed: Date;
    resetDate: Date;
  }>;
}

export interface InvokeTemplateArgs {
  templateId: string;
  inputText?: string;
  extra?: any;
}

export interface InvokeTemplateResult {
  text?: string;
  imageB64?: string;
  raw: any;
  responseTime?: number;
  source: string;
}

export interface ApiTemplateFormData {
  name: string;
  category: ApiCategory;
  icon: string;
  baseUrl: string;
  path: string;
  method: HttpMethod;
  authType: AuthType;
  authKeyName?: string;
  authPrefix?: string;
  params: Array<{ key: string; value: string }>;
  headers: Array<{ key: string; value: string }>;
  body?: string;
  primaryTextPath?: string;
  primaryImagePath?: string;
  timeoutMs: number;
  maxRespKB: number;
  freeTier: boolean;
  keyless: boolean;
  description?: string;
  documentation?: string;
}

// 권한 레벨
export type UserPermissionLevel = 'Standard' | 'Advanced' | 'Expert' | 'Admin';

// 카테고리별 토글 상태
export interface CategoryToggleState {
  search: boolean;
  academic: boolean;
  finance: boolean;
  media: boolean;
  social: boolean;
  lifestyle: boolean;
  image: boolean;
}

// 기본 제공 템플릿 프리셋
export const BUILT_IN_TEMPLATES: Partial<ApiTemplate>[] = [
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    category: 'search',
    icon: '📖',
    baseUrl: 'https://en.wikipedia.org',
    path: '/api/rest_v1/page/summary/{{INPUT_TEXT}}',
    method: 'GET',
    auth: { type: 'None' },
    freeTier: true,
    keyless: true,
    responseMap: {
      primaryText: '$.extract'
    },
    timeoutMs: 8000,
    maxRespKB: 512
  },
  {
    id: 'arxiv',
    name: 'arXiv',
    category: 'academic',
    icon: '🔬',
    baseUrl: 'http://export.arxiv.org',
    path: '/api/query',
    method: 'GET',
    auth: { type: 'None' },
    params: { search_query: 'all:{{INPUT_TEXT}}', max_results: '10' },
    freeTier: true,
    keyless: true,
    timeoutMs: 10000,
    maxRespKB: 1024
  },
  {
    id: 'pubmed',
    name: 'PubMed',
    category: 'academic',
    icon: '🏥',
    baseUrl: 'https://eutils.ncbi.nlm.nih.gov',
    path: '/entrez/eutils/esearch.fcgi',
    method: 'GET',
    auth: { type: 'None' },
    params: { db: 'pubmed', term: '{{INPUT_TEXT}}', retmode: 'json' },
    freeTier: true,
    keyless: true,
    timeoutMs: 8000,
    maxRespKB: 512
  },
  {
    id: 'openweather',
    name: 'OpenWeatherMap',
    category: 'lifestyle',
    icon: '🌤️',
    baseUrl: 'https://api.openweathermap.org',
    path: '/data/2.5/weather',
    method: 'GET',
    auth: { type: 'Query', keyName: 'appid' },
    params: { q: '{{INPUT_TEXT}}', units: 'metric', lang: 'kr' },
    responseMap: {
      primaryText: '$.weather[0].description'
    },
    freeTier: false,
    keyless: false,
    timeoutMs: 8000,
    maxRespKB: 256
  },
  {
    id: 'naver_search',
    name: 'Naver Search',
    category: 'search',
    icon: '📰',
    baseUrl: 'https://openapi.naver.com',
    path: '/v1/search/blog.json',
    method: 'GET',
    auth: { type: 'Header', keyName: 'X-Naver-Client-Id' },
    headers: { 'X-Naver-Client-Secret': '{{CLIENT_SECRET}}' },
    params: { query: '{{INPUT_TEXT}}', display: '10' },
    freeTier: false,
    keyless: false,
    timeoutMs: 8000,
    maxRespKB: 512
  },
  {
    id: 'unsplash',
    name: 'Unsplash',
    category: 'media',
    icon: '📸',
    baseUrl: 'https://api.unsplash.com',
    path: '/search/photos',
    method: 'GET',
    auth: { type: 'Header', keyName: 'Authorization', prefix: 'Client-ID ' },
    params: { query: '{{INPUT_TEXT}}', per_page: '10' },
    responseMap: {
      primaryImage: '$.results[0].urls.regular'
    },
    freeTier: false,
    keyless: false,
    timeoutMs: 8000,
    maxRespKB: 1024
  },
  {
    id: 'craiyon',
    name: 'Craiyon',
    category: 'media',
    icon: '🖼️',
    baseUrl: 'https://api.craiyon.com',
    path: '/generate',
    method: 'POST',
    auth: { type: 'None' },
    body: JSON.stringify({ prompt: '{{INPUT_TEXT}}' }),
    headers: { 'Content-Type': 'application/json' },
    freeTier: true,
    keyless: true,
    timeoutMs: 30000,
    maxRespKB: 2048
  },
  {
    id: 'quickchart',
    name: 'QuickChart',
    category: 'media',
    icon: '📊',
    baseUrl: 'https://quickchart.io',
    path: '/chart',
    method: 'GET',
    auth: { type: 'None' },
    params: { 
      chart: '{{CHART_CONFIG}}',
      width: '600',
      height: '400',
      backgroundColor: 'white',
      format: 'png'
    },
    responseMap: {
      primaryImage: '$'
    },
    freeTier: true,
    keyless: true,
    timeoutMs: 10000,
    maxRespKB: 1024,
    description: '차트 및 그래프 생성 서비스'
  },
  {
    id: 'chart_internal',
    name: 'Role GPT 차트 생성기',
    category: 'media',
    icon: '📈',
    baseUrl: 'https://[PROJECT_ID].supabase.co/functions/v1/make-server-e3d1d00c',
    path: '/chart/generate',
    method: 'POST',
    auth: { type: 'Header', keyName: 'Authorization', prefix: 'Bearer ' },
    body: JSON.stringify({ 
      chart: '{{CHART_CONFIG}}',
      width: 800,
      height: 400
    }),
    headers: { 'Content-Type': 'application/json' },
    freeTier: true,
    keyless: true,
    timeoutMs: 15000,
    maxRespKB: 512,
    description: '내장 차트 생성 서비스 (네이버 데이터랩 연동)'
  }
];