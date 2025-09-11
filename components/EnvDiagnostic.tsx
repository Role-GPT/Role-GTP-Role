/**
 * 환경변수 진단 컴포넌트
 * 개발 중 환경변수 문제를 쉽게 디버깅하기 위한 도구
 */

import React from 'react';

export const EnvDiagnostic: React.FC = () => {
  try {
    // 환경변수 안전하게 체크
    const isEnvAvailable = typeof import !== 'undefined' && import.meta && import.meta.env;
    
    // 프로덕션에서는 표시하지 않음
    if (!isEnvAvailable) {
      return null;
    }

    if (import.meta.env?.PROD) {
      return null;
    }
  } catch (error) {
    console.warn('EnvDiagnostic 초기화 오류:', error);
    return null;
  }

  // 안전하게 환경변수 체크
  const checkEnvironmentVariables = () => {
    const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PROJECT_ID'];
    const optionalVars = ['VITE_SUPABASE_ANON_KEY', 'VITE_GOOGLE_GEMINI_API_KEY'];
    
    const missing: string[] = [];
    const available: string[] = [];
    const values: Record<string, string> = {};

    // 필수 환경변수 체크
    for (const varName of requiredVars) {
      const value = import.meta.env[varName as keyof ImportMetaEnv];
      if (value) {
        available.push(varName);
        values[varName] = String(value).substring(0, 20) + '...';
      } else {
        missing.push(varName);
      }
    }

    // 선택적 환경변수 체크
    for (const varName of optionalVars) {
      const value = import.meta.env[varName as keyof ImportMetaEnv];
      if (value) {
        available.push(varName);
        values[varName] = String(value).substring(0, 20) + '...';
      }
    }

    return {
      isValid: missing.length === 0,
      missing,
      available,
      values
    };
  };

  const getSupabaseConfig = () => {
    return {
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID
    };
  };

  let envResult;
  let supabaseConfig;
  
  try {
    envResult = checkEnvironmentVariables();
    supabaseConfig = getSupabaseConfig();
  } catch (error) {
    console.error('환경변수 진단 중 오류:', error);
    return null;
  }

  try {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-md">
        <details className="bg-muted/90 backdrop-blur-sm border border-border rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-sm">
            🔧 환경변수 진단 ({envResult.isValid ? '✅' : '❌'})
          </summary>
          
          <div className="mt-2 space-y-2 text-xs">
            <div>
              <strong>모드:</strong> {import.meta.env?.MODE || 'unknown'}
            </div>
            
            <div>
              <strong>Supabase 설정:</strong>
              <ul className="ml-4 mt-1">
                <li>URL: {supabaseConfig.url ? '✅' : '❌'}</li>
                <li>Project ID: {supabaseConfig.projectId ? '✅' : '❌'}</li>
                <li>Anon Key: {supabaseConfig.anonKey ? '✅' : '❌'}</li>
              </ul>
            </div>

            {envResult.missing.length > 0 && (
              <div>
                <strong className="text-destructive">누락된 변수:</strong>
                <ul className="ml-4 mt-1">
                  {envResult.missing.map(varName => (
                    <li key={varName} className="text-destructive">❌ {varName}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <strong className="text-muted-foreground">사용 가능한 변수:</strong>
              <ul className="ml-4 mt-1">
                {envResult.available.map(varName => (
                  <li key={varName} className="text-muted-foreground">✅ {varName}</li>
                ))}
              </ul>
            </div>
          </div>
        </details>
      </div>
    );
  } catch (renderError) {
    console.error('EnvDiagnostic 렌더링 오류:', renderError);
    return null;
  }
};
