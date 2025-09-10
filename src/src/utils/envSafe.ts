/**
 * 완전히 안전한 환경변수 접근 유틸리티
 * 빌드 시점 에러 없이 Vite 환경변수에 접근
 */

// Vite 환경변수 확인 함수
function hasViteEnv(): boolean {
  try {
    return !!(globalThis as any).import && !!(globalThis as any).import.meta && !!(globalThis as any).import.meta.env;
  } catch {
    try {
      // 직접 import.meta 확인 (런타임에서만)
      return typeof window !== 'undefined' && !!(window as any).importMeta?.env;
    } catch {
      return false;
    }
  }
}

// 안전한 환경변수 가져오기
function getViteEnv(key: string, fallback: string = ''): string {
  try {
    // 방법 1: 직접 접근
    if ((globalThis as any).import?.meta?.env?.[key]) {
      return (globalThis as any).import.meta.env[key];
    }
    
    // 방법 2: window 객체를 통한 접근
    if (typeof window !== 'undefined' && (window as any).importMeta?.env?.[key]) {
      return (window as any).importMeta.env[key];
    }
    
    // 방법 3: 런타임 주입된 환경변수
    if (typeof window !== 'undefined' && (window as any).__ENV__?.[key]) {
      return (window as any).__ENV__[key];
    }
    
    return fallback;
  } catch (error) {
    console.warn(`환경변수 ${key} 접근 실패:`, error);
    return fallback;
  }
}

// Stripe 설정
export function getStripeConfiguration() {
  return {
    publishableKey: getViteEnv('VITE_STRIPE_PUBLISHABLE_KEY', ''),
    prices: {
      standard: getViteEnv('VITE_STRIPE_PRICE_STANDARD', 'price_1QQQQQStandard'),
      advanced: getViteEnv('VITE_STRIPE_PRICE_ADVANCED', 'price_2QQQQQAdvanced'),
      expert: getViteEnv('VITE_STRIPE_PRICE_EXPERT', 'price_3QQQQQExpert')
    }
  };
}

// Supabase 설정
export function getSupabaseConfiguration() {
  return {
    url: getViteEnv('VITE_SUPABASE_URL', 'https://xechvtzmtxxnvkfedwds.supabase.co'),
    anonKey: getViteEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlY2h2dHptdHh4bnZrZmVkd2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjc0MTcsImV4cCI6MjA3MjgwMzQxN30.9tStOoa2hSIHqlEczX0ucPlJyYBIq-CCat6mThfBDbk'),
    projectId: getViteEnv('VITE_SUPABASE_PROJECT_ID', 'xechvtzmtxxnvkfedwds')
  };
}

// 환경변수 상태 확인
export function checkEnvironmentStatus() {
  const hasVite = hasViteEnv();
  const stripe = getStripeConfiguration();
  const supabase = getSupabaseConfiguration();
  
  return {
    viteAvailable: hasVite,
    stripe: {
      hasPublishableKey: !!stripe.publishableKey,
      hasCustomPrices: stripe.prices.standard !== 'price_1QQQQQStandard'
    },
    supabase: {
      hasUrl: !!supabase.url,
      hasAnonKey: !!supabase.anonKey,
      hasProjectId: !!supabase.projectId
    }
  };
}

// 개발환경에서 상태 로깅
export function logEnvironmentStatus() {
  if (typeof window === 'undefined' || window.location.hostname !== 'localhost') {
    return;
  }
  
  const status = checkEnvironmentStatus();
  
  console.group('🔧 환경변수 상태 (안전 모드)');
  console.log('🌍 Vite 환경:', status.viteAvailable ? '✅ 사용가능' : '❌ 사용불가');
  console.log('💳 Stripe 설정:', {
    publishableKey: status.stripe.hasPublishableKey ? '✅ 설정됨' : '❌ 누락',
    customPrices: status.stripe.hasCustomPrices ? '✅ 커스텀' : '⚠️ 기본값'
  });
  console.log('🔗 Supabase 설정:', {
    url: status.supabase.hasUrl ? '✅ 설정됨' : '❌ 누락',
    anonKey: status.supabase.hasAnonKey ? '✅ 설정됨' : '❌ 누락',
    projectId: status.supabase.hasProjectId ? '✅ 설정됨' : '❌ 누락'
  });
  console.groupEnd();
}

// 전역 디버그 함수 노출
export function exposeDebugTools() {
  if (typeof window !== 'undefined') {
    (window as any).__envStatus = checkEnvironmentStatus;
    (window as any).__stripeConfig = getStripeConfiguration;
    (window as any).__supabaseConfig = getSupabaseConfiguration;
    (window as any).__logEnvStatus = logEnvironmentStatus;
  }
}