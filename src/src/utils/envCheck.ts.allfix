/**
 * 런타임 환경변수 체크 유틸리티
 * 개발 중 환경변수 문제를 쉽게 디버깅하기 위한 도구
 */

export interface EnvCheckResult {
  isValid: boolean;
  missing: string[];
  available: string[];
  values: Record<string, string>;
}

export function checkEnvironmentVariables(): EnvCheckResult {
  // 환경변수 접근 가능 여부 체크
  let env: any = null;
  
  try {
    // Vite 환경에서 직접 import.meta.env 접근
    // @ts-ignore - import.meta 검사를 위한 임시 무시
    if (typeof window !== 'undefined' && import.meta && import.meta.env) {
      // @ts-ignore
      env = import.meta.env;
    }
  } catch (error) {
    console.warn('환경변수 접근 중 오류:', error);
  }
  
  if (!env) {
    // 클라이언트에서 환경변수에 접근할 수 없는 경우
    // 서버리스 아키텍처에서는 정상적인 상황
    return {
      isValid: true, // 서버리스에서는 클라이언트가 환경변수에 접근하지 않는 것이 정상
      missing: [],
      available: ['server-only-mode'],
      values: { mode: 'serverless' }
    };
  }

  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PROJECT_ID'
  ];

  const optionalVars = [
    'VITE_SUPABASE_ANON_KEY',
    'VITE_GOOGLE_GEMINI_API_KEY',
    'VITE_NEWS_API_KEY',
    'VITE_NAVER_CLIENT_ID',
    'VITE_NAVER_CLIENT_SECRET'
  ];

  const missing: string[] = [];
  const available: string[] = [];
  const values: Record<string, string> = {};

  try {
    // 필수 환경변수 체크
    for (const varName of requiredVars) {
      const value = env[varName];
      if (value) {
        available.push(varName);
        values[varName] = String(value).substring(0, 20) + '...';
      } else {
        missing.push(varName);
      }
    }

    // 선택적 환경변수 체크
    for (const varName of optionalVars) {
      const value = env[varName];
      if (value) {
        available.push(varName);
        values[varName] = String(value).substring(0, 20) + '...';
      }
    }
  } catch (error) {
    console.error('환경변수 체크 중 오류:', error);
    return {
      isValid: false,
      missing: ['Error accessing environment variables'],
      available: [],
      values: {}
    };
  }

  return {
    isValid: missing.length === 0,
    missing,
    available,
    values
  };
}

export function logEnvironmentStatus(): void {
  const result = checkEnvironmentVariables();
  
  console.group('🌍 환경변수 상태 체크');
  console.log('✅ 사용 가능:', result.available);
  
  if (result.missing.length > 0) {
    console.warn('❌ 누락됨:', result.missing);
  }
  
  console.log('📋 값 (일부):', result.values);
  
  try {
    // @ts-ignore - import.meta 검사를 위한 임시 무시
    if (typeof window !== 'undefined' && import.meta && import.meta.env) {
      // @ts-ignore
      const env = import.meta.env;
      console.log('🔧 모드:', env.MODE);
      console.log('🏗️ DEV:', env.DEV);
      console.log('🏭 PROD:', env.PROD);
    } else {
      console.log('🏗️ 서버리스 모드: 환경변수는 서버에서만 접근');
    }
  } catch (error) {
    console.warn('환경정보 접근 중 오류:', error);
  }
  
  console.groupEnd();
}

export function getSupabaseConfig() {
  try {
    // Vite 환경에서 직접 import.meta.env 접근
    // @ts-ignore - import.meta 검사를 위한 임시 무시
    if (typeof window !== 'undefined' && import.meta && import.meta.env) {
      // @ts-ignore
      const env = import.meta.env;
      return {
        url: env.VITE_SUPABASE_URL || '',
        anonKey: env.VITE_SUPABASE_ANON_KEY || '',
        projectId: env.VITE_SUPABASE_PROJECT_ID || ''
      };
    }
  } catch (error) {
    console.warn('Supabase 설정 접근 중 오류:', error);
  }
  
  // 서버리스 환경에서는 하드코딩된 공개 정보 사용
  // 이는 /utils/supabase/info.tsx에서 가져온 정보와 동일
  return {
    url: 'https://xechvtzmtxxnvkfedwds.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlY2h2dHptdHh4bnZrZmVkd2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjc0MTcsImV4cCI6MjA3MjgwMzQxN30.9tStOoa2hSIHqlEczX0ucPlJyYBIq-CCat6mThfBDbk',
    projectId: 'xechvtzmtxxnvkfedwds'
  };
}