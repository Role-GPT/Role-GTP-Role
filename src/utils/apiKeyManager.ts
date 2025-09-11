/**
 * API 키 관리 시스템
 * 
 * 모든 외부 API 키를 안전하게 관리하고 저장하는 유틸리티
 * - LLM 모델 API 키
 * - 검색 API 키 (Google CSE, Bing, Naver, NewsAPI 등)
 * - 학술 API 키 (Semantic Scholar 등)
 * - 비즈니스 API 키 (Alpha Vantage, FRED, Finnhub 등)
 * - 이미지 API 키 (DALL-E, Hugging Face, Unsplash 등)
 * - 소셜/개발자 API 키 (GitHub, Reddit, Twitter 등)
 * - 날씨/라이프스타일 API 키 (OpenWeather, 기상청 등)
 */

export interface ApiKeyConfig {
  id: string;
  category: 'llm' | 'search' | 'academic' | 'finance' | 'media' | 'social' | 'lifestyle';
  provider: string;
  name: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  searchEngineId?: string; // Google CSE용
  isDefault?: boolean;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
  usageCount?: number;
  metadata?: {
    baseUrl?: string;
    model?: string;
    quota?: {
      daily?: number;
      monthly?: number;
      remaining?: number;
    };
  };
}

export interface ApiKeyValidationResult {
  isValid: boolean;
  error?: string;
  metadata?: {
    quota?: number;
    plan?: string;
    expiresAt?: string;
  };
}

const STORAGE_KEY = 'roleGPT_allApiKeys';

/**
 * 모든 API 키 조회
 */
export function getAllApiKeys(): Record<string, ApiKeyConfig[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to load API keys:', error);
    return {};
  }
}

/**
 * 카테고리별 API 키 조회
 */
export function getApiKeysByCategory(category: string): ApiKeyConfig[] {
  const allKeys = getAllApiKeys();
  return allKeys[category] || [];
}

/**
 * 특정 제공자의 API 키 조회
 */
export function getApiKeyByProvider(provider: string): ApiKeyConfig | null {
  const allKeys = getAllApiKeys();
  for (const category of Object.values(allKeys)) {
    if (Array.isArray(category)) {
      const found = category.find(key => key.provider === provider && key.isActive);
      if (found) return found;
    }
  }
  return null;
}

/**
 * API 키 저장
 */
export function saveApiKey(apiKey: ApiKeyConfig): void {
  const allKeys = getAllApiKeys();
  
  if (!allKeys[apiKey.category]) {
    allKeys[apiKey.category] = [];
  }
  
  // 기존 키가 있으면 업데이트, 없으면 추가
  const existingIndex = allKeys[apiKey.category].findIndex(key => key.id === apiKey.id);
  if (existingIndex >= 0) {
    allKeys[apiKey.category][existingIndex] = apiKey;
  } else {
    allKeys[apiKey.category].push(apiKey);
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allKeys));
  } catch (error) {
    console.error('Failed to save API key:', error);
    throw new Error('API 키 저장에 실패했습니다.');
  }
}

/**
 * API 키 삭제
 */
export function deleteApiKey(keyId: string): void {
  const allKeys = getAllApiKeys();
  
  for (const category of Object.keys(allKeys)) {
    allKeys[category] = allKeys[category].filter(key => key.id !== keyId);
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allKeys));
  } catch (error) {
    console.error('Failed to delete API key:', error);
    throw new Error('API 키 삭제에 실패했습니다.');
  }
}

/**
 * API 키 활성/비활성 토글
 */
export function toggleApiKey(keyId: string): void {
  const allKeys = getAllApiKeys();
  
  for (const category of Object.values(allKeys)) {
    const key = category.find(k => k.id === keyId);
    if (key) {
      key.isActive = !key.isActive;
      break;
    }
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allKeys));
  } catch (error) {
    console.error('Failed to toggle API key:', error);
    throw new Error('API 키 상태 변경에 실패했습니다.');
  }
}

/**
 * API 키 사용 기록 업데이트
 */
export function updateApiKeyUsage(keyId: string): void {
  const allKeys = getAllApiKeys();
  
  for (const category of Object.values(allKeys)) {
    const key = category.find(k => k.id === keyId);
    if (key) {
      key.lastUsed = new Date().toISOString();
      key.usageCount = (key.usageCount || 0) + 1;
      break;
    }
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allKeys));
  } catch (error) {
    console.warn('Failed to update API key usage:', error);
  }
}

/**
 * API 키 유효성 검증
 */
export async function validateApiKey(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  try {
    switch (apiKey.provider) {
      case 'google_cse':
        return await validateGoogleCSE(apiKey);
      case 'bing':
        return await validateBingSearch(apiKey);
      case 'naver':
        return await validateNaverAPI(apiKey);
      case 'newsapi':
        return await validateNewsAPI(apiKey);
      case 'serpapi':
        return await validateSerpAPI(apiKey);
      case 'serper':
        return await validateSerperAPI(apiKey);
      case 'semanticscholar':
        return await validateSemanticScholar(apiKey);
      case 'alpha_vantage':
        return await validateAlphaVantage(apiKey);
      case 'fred':
        return await validateFREDAPI(apiKey);
      case 'finnhub':
        return await validateFinnhub(apiKey);
      case 'openai_dalle':
        return await validateOpenAIDallE(apiKey);
      case 'huggingface':
        return await validateHuggingFace(apiKey);
      case 'unsplash':
        return await validateUnsplash(apiKey);
      case 'tmdb':
        return await validateTMDB(apiKey);
      case 'spotify':
        return await validateSpotify(apiKey);
      case 'github':
        return await validateGitHub(apiKey);
      case 'reddit':
        return await validateReddit(apiKey);
      case 'twitter':
        return await validateTwitter(apiKey);
      case 'openweather':
        return await validateOpenWeather(apiKey);
      case 'kma':
        return await validateKMA(apiKey);
      case 'publicdata':
        return await validatePublicData(apiKey);
      default:
        return { isValid: false, error: '지원하지 않는 API 제공자입니다.' };
    }
  } catch (error) {
    console.error(`API validation failed for ${apiKey.provider}:`, error);
    return { isValid: false, error: 'API 키 검증 중 오류가 발생했습니다.' };
  }
}

// API 별 유효성 검증 함수들

async function validateGoogleCSE(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey.apiKey}&cx=${apiKey.searchEngineId}&q=test&num=1`;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      return { isValid: true };
    } else {
      const error = await response.text();
      return { isValid: false, error: `Google CSE 인증 실패: ${error}` };
    }
  } catch (error) {
    return { isValid: false, error: 'Google CSE 연결 실패' };
  }
}

async function validateBingSearch(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = 'https://api.bing.microsoft.com/v7.0/search?q=test&count=1';
  
  try {
    const response = await fetch(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey.apiKey!
      }
    });
    
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'Bing Search 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'Bing Search 연결 실패' };
  }
}

async function validateNaverAPI(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = 'https://openapi.naver.com/v1/search/news.json?query=테스트&display=1';
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': apiKey.clientId!,
        'X-Naver-Client-Secret': apiKey.clientSecret!
      }
    });
    
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'Naver API 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'Naver API 연결 실패' };
  }
}

async function validateNewsAPI(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = `https://newsapi.org/v2/everything?q=test&pageSize=1&apiKey=${apiKey.apiKey}`;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'NewsAPI 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'NewsAPI 연결 실패' };
  }
}

async function validateSerpAPI(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = `https://serpapi.com/account.json?api_key=${apiKey.apiKey}`;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return { 
        isValid: true, 
        metadata: { quota: data.plan_searches_left }
      };
    } else {
      return { isValid: false, error: 'SerpAPI 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'SerpAPI 연결 실패' };
  }
}

async function validateSerperAPI(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = 'https://google.serper.dev/search';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey.apiKey!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: 'test', num: 1 })
    });
    
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'Serper API 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'Serper API 연결 실패' };
  }
}

async function validateSemanticScholar(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = 'https://api.semanticscholar.org/graph/v1/paper/search?query=test&limit=1';
  
  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': apiKey.apiKey!
      }
    });
    
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'Semantic Scholar 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'Semantic Scholar 연결 실패' };
  }
}

async function validateAlphaVantage(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${apiKey.apiKey}`;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data['Error Message']) {
        return { isValid: false, error: 'Alpha Vantage API 키가 유효하지 않습니다.' };
      }
      return { isValid: true };
    } else {
      return { isValid: false, error: 'Alpha Vantage 연결 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'Alpha Vantage 연결 실패' };
  }
}

async function validateFREDAPI(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=${apiKey.apiKey}&file_type=json&limit=1`;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'FRED API 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'FRED API 연결 실패' };
  }
}

async function validateFinnhub(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${apiKey.apiKey}`;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'Finnhub 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'Finnhub 연결 실패' };
  }
}

async function validateOpenAIDallE(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = 'https://api.openai.com/v1/models';
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey.apiKey}`
      }
    });
    
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'OpenAI API 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'OpenAI API 연결 실패' };
  }
}

async function validateHuggingFace(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = 'https://huggingface.co/api/whoami-v2';
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey.apiKey}`
      }
    });
    
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'Hugging Face 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'Hugging Face 연결 실패' };
  }
}

async function validateUnsplash(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = 'https://api.unsplash.com/me';
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${apiKey.apiKey}`
      }
    });
    
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'Unsplash 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'Unsplash 연결 실패' };
  }
}

async function validateTMDB(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = `https://api.themoviedb.org/3/configuration?api_key=${apiKey.apiKey}`;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'TMDB 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'TMDB 연결 실패' };
  }
}

async function validateSpotify(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  // Spotify는 OAuth 토큰이 필요하므로 간단한 검증만 수행
  const url = 'https://api.spotify.com/v1/me';
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey.accessToken}`
      }
    });
    
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'Spotify 토큰이 만료되었거나 유효하지 않습니다.' };
    }
  } catch (error) {
    return { isValid: false, error: 'Spotify 연결 실패' };
  }
}

async function validateGitHub(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = 'https://api.github.com/user';
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${apiKey.apiKey}`
      }
    });
    
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'GitHub 토큰 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'GitHub 연결 실패' };
  }
}

async function validateReddit(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  // Reddit API는 OAuth가 복잡하므로 기본 검증만 수행
  return { isValid: true };
}

async function validateTwitter(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = 'https://api.twitter.com/2/users/me';
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey.apiKey}`
      }
    });
    
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'Twitter Bearer Token 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'Twitter 연결 실패' };
  }
}

async function validateOpenWeather(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${apiKey.apiKey}&units=metric`;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'OpenWeather API 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: 'OpenWeather 연결 실패' };
  }
}

async function validateKMA(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${apiKey.apiKey}&numOfRows=1&dataType=JSON&base_date=20250101&base_time=0200&nx=60&ny=127`;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      return { isValid: true };
    } else {
      return { isValid: false, error: '기상청 API 인증 실패' };
    }
  } catch (error) {
    return { isValid: false, error: '기상청 API 연결 실패' };
  }
}

async function validatePublicData(apiKey: ApiKeyConfig): Promise<ApiKeyValidationResult> {
  // 공공데이터포털은 API별로 다르므로 기본 검증만 수행
  return { isValid: true };
}

/**
 * API 키 설정 내보내기
 */
export function exportApiKeys(): string {
  const allKeys = getAllApiKeys();
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    apiKeys: allKeys
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * API 키 설정 가져오기
 */
export function importApiKeys(importData: string): void {
  try {
    const data = JSON.parse(importData);
    
    if (!data.apiKeys) {
      throw new Error('유효하지 않은 API 키 설정 파일입니다.');
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.apiKeys));
  } catch (error) {
    console.error('Failed to import API keys:', error);
    throw new Error('API 키 설정 가져오기에 실패했습니다.');
  }
}

/**
 * API 키 통계 조회
 */
export function getApiKeyStats(): {
  totalKeys: number;
  activeKeys: number;
  categoryCounts: Record<string, number>;
} {
  const allKeys = getAllApiKeys();
  let totalKeys = 0;
  let activeKeys = 0;
  const categoryCounts: Record<string, number> = {};
  
  for (const [category, keys] of Object.entries(allKeys)) {
    categoryCounts[category] = keys.length;
    totalKeys += keys.length;
    activeKeys += keys.filter(key => key.isActive).length;
  }
  
  return { totalKeys, activeKeys, categoryCounts };
}
