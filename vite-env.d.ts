/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase 필수 환경변수
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_PROJECT_ID: string
  
  // Google 서비스 환경변수
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_GOOGLE_CLIENT_SECRET?: string
  readonly VITE_GOOGLE_GEMINI_API_KEY?: string
  
  // 검색 API 환경변수
  readonly VITE_NEWS_API_KEY?: string
  readonly VITE_NAVER_CLIENT_ID?: string
  readonly VITE_NAVER_CLIENT_SECRET?: string
  
  // BYOK API 키들 (선택사항)
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_ANTHROPIC_API_KEY?: string
  
  // Stripe 결제 시스템
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string
  readonly VITE_STRIPE_PRICE_STANDARD?: string
  readonly VITE_STRIPE_PRICE_ADVANCED?: string
  readonly VITE_STRIPE_PRICE_EXPERT?: string
  
  // 기타 설정
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 글로벌 환경변수 타입 확장 (런타임 주입용)
declare global {
  interface Window {
    __ENV__?: Partial<ImportMetaEnv>;
    __checkEnvHealth?: () => any;
    __getStripeConfig?: () => any;
    __getSupabaseConfig?: () => any;
    __logEnvStatus?: () => void;
  }
  
  var __ENV__: Partial<ImportMetaEnv> | undefined;
}