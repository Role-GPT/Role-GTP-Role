/**
 * 안전한 환경변수 접근 유틸리티
 * 서버리스 아키텍처에서 클라이언트/서버 분리 보안을 고려한 설계
 */

// 공개 정보 (클라이언트에서 안전하게 사용 가능)
export const PUBLIC_CONFIG = {
  SUPABASE_URL: 'https://xechvtzmtxxnvkfedwds.supabase.co',
  SUPABASE_PROJECT_ID: 'xechvtzmtxxnvkfedwds',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlY2h2dHptdHh4bnZrZmVkd2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjc0MTcsImV4cCI6MjA3MjgwMzQxN30.9tStOoa2hSIHqlEczX0ucPlJyYBIq-CCat6mThfBDbk',
  APP_NAME: 'Role GPT',
  APP_VERSION: '1.0.0',
  DEFAULT_MODEL: 'gemini-2.5-flash',
  DEFAULT_TEMPERATURE: 0.7,
  // Stripe 공개 키 (클라이언트에서 사용 가능)
  STRIPE_PUBLISHABLE_KEY: null, // 런타임에서 가져옴
  STRIPE_PRICES: {
    STANDARD: null, // 런타임에서 가져옴
    ADVANCED: null, // 런타임에서 가져옴
    EXPERT: null // 런타임에서 가져옴
  }
} as const;

/**
 * 안전한 환경변수 가져오기 함수
 * 클라이언트에서는 공개 설정만 반환
 */
export function getSafeEnv(key: keyof typeof PUBLIC_CONFIG): string {
  return PUBLIC_CONFIG[key];
}

/**
 * 런타임에서 Stripe 설정 가져오기
 */
export function getStripeClientConfig() {
  try {
    // Vite import.meta.env 확인
    if (import.meta && import.meta.env) {
      return {
        publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || null,
        prices: {
          standard: import.meta.env.VITE_STRIPE_PRICE_STANDARD || null,
          advanced: import.meta.env.VITE_STRIPE_PRICE_ADVANCED || null,
          expert: import.meta.env.VITE_STRIPE_PRICE_EXPERT || null
        }
      };
    }
    
    // fallback
    return {
      publishableKey: null,
      prices: {
        standard: null,
        advanced: null,
        expert: null
      }
    };
  } catch (error) {
    console.warn('Stripe 설정 가져오기 실패:', error);
    return {
      publishableKey: null,
      prices: {
        standard: null,
        advanced: null,
        expert: null
      }
    };
  }
}

/**
 * Supabase 클라이언트 설정 가져오기
 */
export function getSupabaseClientConfig() {
  return {
    url: PUBLIC_CONFIG.SUPABASE_URL,
    anonKey: PUBLIC_CONFIG.SUPABASE_ANON_KEY,
    projectId: PUBLIC_CONFIG.SUPABASE_PROJECT_ID
  };
}

/**
 * 환경변수 유효성 검사
 * 서버리스 환경에서는 항상 true 반환 (공개 설정 사용)
 */
export function validateEnvironment(): { isValid: boolean; message: string } {
  const requiredValues = [
    PUBLIC_CONFIG.SUPABASE_URL,
    PUBLIC_CONFIG.SUPABASE_PROJECT_ID,
    PUBLIC_CONFIG.SUPABASE_ANON_KEY
  ];

  const hasAllRequired = requiredValues.every(value => value && value.length > 0);

  if (!hasAllRequired) {
    return {
      isValid: false,
      message: '필수 Supabase 설정이 누락되었습니다.'
    };
  }

  return {
    isValid: true,
    message: '환경 설정이 유효합니다.'
  };
}

/**
 * 개발 모드 감지
 */
export function isDevelopment(): boolean {
  try {
    // @ts-ignore - import.meta 검사를 위한 임시 무시
    if (typeof window !== 'undefined' && import.meta && import.meta.env) {
      // @ts-ignore
      return import.meta.env.DEV === true;
    }
  } catch (error) {
    // ignore
  }
  
  // fallback: localhost 확인
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('repl.co');
  }
  
  return false;
}

/**
 * 프로덕션 모드 감지
 */
export function isProduction(): boolean {
  try {
    // @ts-ignore - import.meta 검사를 위한 임시 무시
    if (typeof window !== 'undefined' && import.meta && import.meta.env) {
      // @ts-ignore
      return import.meta.env.PROD === true;
    }
  } catch (error) {
    // ignore
  }
  
  return !isDevelopment();
}

/**
 * 환경 정보 로깅 (개발 모드에서만)
 */
export function logEnvironmentInfo(): void {
  if (!isDevelopment()) return;

  console.group('🔧 환경 정보');
  console.log('🌍 모드:', isDevelopment() ? 'Development' : 'Production');
  console.log('🔗 Supabase URL:', PUBLIC_CONFIG.SUPABASE_URL);
  console.log('🆔 Project ID:', PUBLIC_CONFIG.SUPABASE_PROJECT_ID);
  console.log('🔑 Anon Key:', PUBLIC_CONFIG.SUPABASE_ANON_KEY.substring(0, 20) + '...');
  console.log('📱 App:', PUBLIC_CONFIG.APP_NAME, 'v' + PUBLIC_CONFIG.APP_VERSION);
  
  const validation = validateEnvironment();
  if (validation.isValid) {
    console.log('✅', validation.message);
  } else {
    console.warn('❌', validation.message);
  }
  
  console.groupEnd();
}