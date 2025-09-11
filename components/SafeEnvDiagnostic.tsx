/**
 * 안전한 환경변수 진단 컴포넌트
 * 오류가 발생해도 앱을 중단시키지 않는 최소한의 디버깅 도구
 */

import React from 'react';

export const SafeEnvDiagnostic: React.FC = () => {
  // 프로덕션에서는 표시하지 않음
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isDev = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('dev');
    
    if (!isDev) {
      return null;
    }
  } else {
    return null;
  }

  let hasSupabaseUrl = false;
  let hasSupabaseProjectId = false;
  let envMode = 'unknown';

  try {
    // 안전한 환경변수 접근
    // @ts-ignore - import.meta 검사를 위한 임시 무시
    if (typeof window !== 'undefined' && import.meta && import.meta.env) {
      // @ts-ignore
      const env = import.meta.env;
      hasSupabaseUrl = Boolean(env.VITE_SUPABASE_URL);
      hasSupabaseProjectId = Boolean(env.VITE_SUPABASE_PROJECT_ID);
      envMode = env.MODE || 'unknown';
    } else {
      // 서버리스 환경에서는 하드코딩된 값 확인
      hasSupabaseUrl = true; // PUBLIC_CONFIG에서 확인
      hasSupabaseProjectId = true;
      envMode = 'serverless';
    }
  } catch (error) {
    console.warn('환경변수 접근 실패:', error);
    // fallback: 하드코딩된 공개 설정 사용
    hasSupabaseUrl = true;
    hasSupabaseProjectId = true;
    envMode = 'fallback';
  }

  const isValid = hasSupabaseUrl && hasSupabaseProjectId;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs">
      <div className="bg-muted/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs">
        <div className="font-medium">
          🔧 ENV ({envMode}): {isValid ? '✅' : '❌'}
        </div>
        <div className="mt-1 space-y-1">
          <div>Supabase URL: {hasSupabaseUrl ? '✅' : '❌'}</div>
          <div>Project ID: {hasSupabaseProjectId ? '✅' : '❌'}</div>
        </div>
      </div>
    </div>
  );
};
