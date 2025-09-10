/**
 * 환경변수 안전 접근 유틸리티
 * Vite에서 환경변수가 undefined일 때 안전하게 처리
 */

export const getEnvVar = (key: keyof ImportMetaEnv, defaultValue: string = ""): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const value = import.meta.env[key];
      return value || defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.warn(`환경변수 ${key} 접근 실패:`, error);
    return defaultValue;
  }
};

// Supabase 환경변수
export const getSupabaseUrl = () => getEnvVar('VITE_SUPABASE_URL', 'https://xechvtzmtxxnvkfedwds.supabase.co');
export const getSupabaseAnonKey = () => getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlY2h2dHptdHh4bnZrZmVkd2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjc0MTcsImV4cCI6MjA3MjgwMzQxN30.9tStOoa2hSIHqlEczX0ucPlJyYBIq-CCat6mThfBDbk');
export const getSupabaseProjectId = () => getEnvVar('VITE_SUPABASE_PROJECT_ID', 'xechvtzmtxxnvkfedwds');

// Google 환경변수
export const getGoogleGeminiApiKey = () => getEnvVar('VITE_GOOGLE_GEMINI_API_KEY', '');
export const getGoogleClientId = () => getEnvVar('VITE_GOOGLE_CLIENT_ID', '');

// 검색 API 환경변수
export const getNewsApiKey = () => getEnvVar('VITE_NEWS_API_KEY', '');
export const getNaverClientId = () => getEnvVar('VITE_NAVER_CLIENT_ID', '');
export const getNaverClientSecret = () => getEnvVar('VITE_NAVER_CLIENT_SECRET', '');

// 개발 모드 확인
export const isDevelopment = () => {
  try {
    return import.meta.env.DEV || import.meta.env.MODE === 'development';
  } catch {
    return true; // fallback to development
  }
};

export const isProduction = () => {
  try {
    return import.meta.env.PROD || import.meta.env.MODE === 'production';
  } catch {
    return false;
  }
};

// 환경변수 유효성 검사
export const validateEnvironment = () => {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PROJECT_ID'
  ] as const;
  
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    if (!getEnvVar(varName)) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    console.warn('누락된 환경변수:', missing);
    return false;
  }
  
  return true;
};

// 환경변수 디버깅 정보
export const getEnvironmentInfo = () => {
  return {
    mode: import.meta.env?.MODE || 'unknown',
    dev: import.meta.env?.DEV || false,
    prod: import.meta.env?.PROD || false,
    supabaseUrl: getSupabaseUrl().substring(0, 30) + '...',
    supabaseProjectId: getSupabaseProjectId(),
    hasAnonKey: !!getSupabaseAnonKey(),
    hasGeminiKey: !!getGoogleGeminiApiKey(),
    timestamp: new Date().toISOString()
  };
};