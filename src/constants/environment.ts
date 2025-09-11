/**
 * 빌드 안전 환경변수 상수
 * 
 * 모든 환경변수를 빌드 시점에 안전하게 처리하기 위한 상수들
 * typeof나 동적 접근을 피하고 직접적인 값 할당 사용
 */

// 기본값들 (fallback)
const DEFAULT_VALUES = {
  // Supabase 기본값
  SUPABASE_URL: 'https://xechvtzmtxxnvkfedwds.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlY2h2dHptdHh4bnZrZmVkd2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjc0MTcsImV4cCI6MjA3MjgwMzQxN30.9tStOoa2hSIHqlEczX0ucPlJyYBIq-CCat6mThfBDbk',
  SUPABASE_PROJECT_ID: 'xechvtzmtxxnvkfedwds',
  
  // Stripe 기본값
  STRIPE_PRICE_STANDARD: 'price_1QQQQQStandard',
  STRIPE_PRICE_ADVANCED: 'price_2QQQQQAdvanced',
  STRIPE_PRICE_EXPERT: 'price_3QQQQQExpert'
} as const;

// 안전한 환경변수 접근 함수 (try-catch로 보호)
function safeGetEnv(key: string, defaultValue: string): string {
  try {
    // Vite 개발 환경
    if ((globalThis as any).import?.meta?.env?.[key]) {
      return (globalThis as any).import.meta.env[key];
    }
    
    // 런타임 주입 환경변수
    if (typeof window !== 'undefined' && (window as any).__ENV__?.[key]) {
      return (window as any).__ENV__[key];
    }
    
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

// 환경변수 내보내기
export const ENV = {
  // Supabase 설정
  SUPABASE_URL: safeGetEnv('VITE_SUPABASE_URL', DEFAULT_VALUES.SUPABASE_URL),
  SUPABASE_ANON_KEY: safeGetEnv('VITE_SUPABASE_ANON_KEY', DEFAULT_VALUES.SUPABASE_ANON_KEY),
  SUPABASE_PROJECT_ID: safeGetEnv('VITE_SUPABASE_PROJECT_ID', DEFAULT_VALUES.SUPABASE_PROJECT_ID),
  
  // Stripe 설정
  STRIPE_PUBLISHABLE_KEY: safeGetEnv('VITE_STRIPE_PUBLISHABLE_KEY', ''),
  STRIPE_PRICE_STANDARD: safeGetEnv('VITE_STRIPE_PRICE_STANDARD', DEFAULT_VALUES.STRIPE_PRICE_STANDARD),
  STRIPE_PRICE_ADVANCED: safeGetEnv('VITE_STRIPE_PRICE_ADVANCED', DEFAULT_VALUES.STRIPE_PRICE_ADVANCED),
  STRIPE_PRICE_EXPERT: safeGetEnv('VITE_STRIPE_PRICE_EXPERT', DEFAULT_VALUES.STRIPE_PRICE_EXPERT),
  
  // 기타 API 키들
  GOOGLE_GEMINI_API_KEY: safeGetEnv('VITE_GOOGLE_GEMINI_API_KEY', ''),
  NEWS_API_KEY: safeGetEnv('VITE_NEWS_API_KEY', ''),
  NAVER_CLIENT_ID: safeGetEnv('VITE_NAVER_CLIENT_ID', ''),
  NAVER_CLIENT_SECRET: safeGetEnv('VITE_NAVER_CLIENT_SECRET', ''),
  OPENAI_API_KEY: safeGetEnv('VITE_OPENAI_API_KEY', ''),
  ANTHROPIC_API_KEY: safeGetEnv('VITE_ANTHROPIC_API_KEY', '')
} as const;

// Stripe 설정 객체
export const STRIPE_CONFIG = {
  publishableKey: ENV.STRIPE_PUBLISHABLE_KEY,
  prices: {
    standard: ENV.STRIPE_PRICE_STANDARD,
    advanced: ENV.STRIPE_PRICE_ADVANCED,
    expert: ENV.STRIPE_PRICE_EXPERT
  }
} as const;

// Supabase 설정 객체
export const SUPABASE_CONFIG = {
  url: ENV.SUPABASE_URL,
  anonKey: ENV.SUPABASE_ANON_KEY,
  projectId: ENV.SUPABASE_PROJECT_ID
} as const;

// 환경변수 상태 확인
export function getEnvironmentStatus() {
  return {
    supabase: {
      hasUrl: !!ENV.SUPABASE_URL && ENV.SUPABASE_URL !== DEFAULT_VALUES.SUPABASE_URL,
      hasAnonKey: !!ENV.SUPABASE_ANON_KEY && ENV.SUPABASE_ANON_KEY !== DEFAULT_VALUES.SUPABASE_ANON_KEY,
      hasProjectId: !!ENV.SUPABASE_PROJECT_ID && ENV.SUPABASE_PROJECT_ID !== DEFAULT_VALUES.SUPABASE_PROJECT_ID
    },
    stripe: {
      hasPublishableKey: !!ENV.STRIPE_PUBLISHABLE_KEY,
      hasCustomPrices: ENV.STRIPE_PRICE_STANDARD !== DEFAULT_VALUES.STRIPE_PRICE_STANDARD
    },
    apis: {
      hasGemini: !!ENV.GOOGLE_GEMINI_API_KEY,
      hasNews: !!ENV.NEWS_API_KEY,
      hasNaver: !!ENV.NAVER_CLIENT_ID && !!ENV.NAVER_CLIENT_SECRET,
      hasOpenAI: !!ENV.OPENAI_API_KEY,
      hasAnthropic: !!ENV.ANTHROPIC_API_KEY
    }
  };
}

// 개발환경에서 환경변수 상태 로깅
export function logEnvironment() {
  if (typeof window === 'undefined' || !window.location.hostname.includes('localhost')) {
    return;
  }
  
  const status = getEnvironmentStatus();
  
  console.group('🔧 환경변수 상태 (최종 안전 버전)');
  console.log('🔗 Supabase:', status.supabase);
  console.log('💳 Stripe:', status.stripe);
  console.log('🔑 API 키들:', status.apis);
  console.groupEnd();
}

// 전역 디버그 함수
export function setupGlobalDebug() {
  if (typeof window !== 'undefined') {
    (window as any).__env = ENV;
    (window as any).__envStatus = getEnvironmentStatus;
    (window as any).__logEnv = logEnvironment;
  }
}
