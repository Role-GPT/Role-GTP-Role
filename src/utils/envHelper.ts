/**
 * 안전한 환경변수 접근 유틸리티
 * 
 * Vite의 import.meta.env가 undefined인 경우에도 
 * 안전하게 환경변수에 접근할 수 있도록 도와주는 유틸리티
 */

export interface EnvironmentVariables {
  // Supabase
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_PROJECT_ID?: string;
  
  // Stripe
  VITE_STRIPE_PUBLISHABLE_KEY?: string;
  VITE_STRIPE_PRICE_STANDARD?: string;
  VITE_STRIPE_PRICE_ADVANCED?: string;
  VITE_STRIPE_PRICE_EXPERT?: string;
  
  // Google
  VITE_GOOGLE_CLIENT_ID?: string;
  VITE_GOOGLE_CLIENT_SECRET?: string;
  VITE_GOOGLE_GEMINI_API_KEY?: string;
  
  // Other APIs
  VITE_NEWS_API_KEY?: string;
  VITE_NAVER_CLIENT_ID?: string;
  VITE_NAVER_CLIENT_SECRET?: string;
  VITE_OPENAI_API_KEY?: string;
  VITE_ANTHROPIC_API_KEY?: string;
}

/**
 * 환경변수를 안전하게 가져오는 함수
 */
export function getEnvironmentVariable(key: keyof EnvironmentVariables, fallback?: string): string | undefined {
  try {
    // 1. Vite import.meta.env 시도
    if (import.meta && import.meta.env) {
      const value = import.meta.env[key];
      if (value) return value;
    }
    
    // 2. window 객체에서 시도 (브라우저 환경에서 런타임 주입된 경우)
    if (typeof window !== 'undefined' && (window as any).__ENV__) {
      const value = (window as any).__ENV__[key];
      if (value) return value;
    }
    
    // 3. globalThis에서 시도
    if (typeof globalThis !== 'undefined' && (globalThis as any).__ENV__) {
      const value = (globalThis as any).__ENV__[key];
      if (value) return value;
    }
    
    // 4. fallback 반환
    return fallback;
    
  } catch (error) {
    console.warn(`환경변수 ${key} 접근 실패:`, error);
    return fallback;
  }
}

/**
 * Stripe 관련 환경변수들을 가져오는 함수
 */
export function getStripeConfig() {
  return {
    publishableKey: getEnvironmentVariable('VITE_STRIPE_PUBLISHABLE_KEY'),
    prices: {
      standard: getEnvironmentVariable('VITE_STRIPE_PRICE_STANDARD', 'price_1QQQQQStandard'),
      advanced: getEnvironmentVariable('VITE_STRIPE_PRICE_ADVANCED', 'price_2QQQQQAdvanced'),
      expert: getEnvironmentVariable('VITE_STRIPE_PRICE_EXPERT', 'price_3QQQQQExpert')
    }
  };
}

/**
 * Supabase 관련 환경변수들을 가져오는 함수
 */
export function getSupabaseConfig() {
  return {
    url: getEnvironmentVariable('VITE_SUPABASE_URL', 'https://xechvtzmtxxnvkfedwds.supabase.co'),
    anonKey: getEnvironmentVariable('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlY2h2dHptdHh4bnZrZmVkd2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjc0MTcsImV4cCI6MjA3MjgwMzQxN30.9tStOoa2hSIHqlEczX0ucPlJyYBIq-CCat6mThfBDbk'),
    projectId: getEnvironmentVariable('VITE_SUPABASE_PROJECT_ID', 'xechvtzmtxxnvkfedwds')
  };
}

/**
 * 환경변수 로딩 상태 확인
 */
export function checkEnvironmentHealth() {
  let isViteEnvAvailable = false;
  
  try {
    isViteEnvAvailable = Boolean(import.meta && import.meta.env);
  } catch (error) {
    isViteEnvAvailable = false;
  }
  
  const requiredVars: (keyof EnvironmentVariables)[] = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_PROJECT_ID'
  ];
  
  const missingVars: string[] = [];
  const availableVars: string[] = [];
  
  requiredVars.forEach(varName => {
    const value = getEnvironmentVariable(varName);
    if (value) {
      availableVars.push(varName);
    } else {
      missingVars.push(varName);
    }
  });
  
  return {
    isViteEnvAvailable,
    hasRequiredVars: missingVars.length === 0,
    missingVars,
    availableVars
  };
}

/**
 * 전역 환경변수 진단 함수 (브라우저 콘솔에서 사용)
 */
export function exposeGlobalEnvChecker(): void {
  if (typeof window !== 'undefined') {
    (window as any).__checkEnvHealth = checkEnvironmentHealth;
    (window as any).__getStripeConfig = getStripeConfig;
    (window as any).__getSupabaseConfig = getSupabaseConfig;
    (window as any).__logEnvStatus = logEnvironmentStatus;
  }
}

/**
 * 개발 환경에서 환경변수 상태를 로그로 출력
 */
export function logEnvironmentStatus(): void {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return; // 프로덕션에서는 로그 생략
  }
  
  const health = checkEnvironmentHealth();
  
  console.group('🔧 환경변수 상태');
  console.log('🌍 Vite 환경:', health.isViteEnvAvailable ? '✅ 사용가능' : '❌ 사용불가');
  console.log('📋 필수 변수:', health.hasRequiredVars ? '✅ 모두 설정됨' : '❌ 누락됨');
  
  if (health.availableVars.length > 0) {
    console.log('✅ 설정된 변수:', health.availableVars);
  }
  
  if (health.missingVars.length > 0) {
    console.warn('❌ 누락된 변수:', health.missingVars);
  }
  
  // Stripe 설정 상태
  const stripeConfig = getStripeConfig();
  console.log('💳 Stripe 설정:', {
    publishableKey: stripeConfig.publishableKey ? '✅ 설정됨' : '❌ 누락',
    prices: {
      standard: stripeConfig.prices.standard !== 'price_1QQQQQStandard' ? '✅ 커스텀' : '⚠️ 기본값',
      advanced: stripeConfig.prices.advanced !== 'price_2QQQQQAdvanced' ? '✅ 커스텀' : '⚠️ 기본값',
      expert: stripeConfig.prices.expert !== 'price_3QQQQQExpert' ? '✅ 커스텀' : '⚠️ 기본값'
    }
  });
  
  console.groupEnd();
}
