/**
 * Google OAuth 콜백 페이지
 * 
 * Google OAuth 인증 완료 후 리디렉션되는 페이지
 * - 인증 코드 처리
 * - 토큰 교환
 * - 메인 앱으로 결과 전달
 * 
 * @author Role GPT Team
 * @version 1.0.0
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { handleGoogleCallback } from '../../src/services/googleService';

export default function OAuth2Callback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('인증 처리 중...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const { code, state, error } = router.query;

        // 에러가 있는 경우
        if (error) {
          setStatus('error');
          setMessage(`인증 오류: ${error}`);
          return;
        }

        // 코드와 state가 없는 경우
        if (!code || !state) {
          setStatus('error');
          setMessage('인증 코드 또는 state가 없습니다.');
          return;
        }

        // 부모 창에 메시지 전송 (팝업 모드)
        if (window.opener) {
          setMessage('인증 완료! 창을 닫는 중...');
          
          // 부모 창에 성공 메시지 전송
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            code: code as string,
            state: state as string
          }, window.location.origin);
          
          // 팝업 창 닫기
          window.close();
          return;
        }

        // 일반 페이지 모드 (팝업이 아닌 경우)
        const user = await handleGoogleCallback(code as string, state as string);
        
        setStatus('success');
        setMessage(`인증 완료! ${user.email}으로 연결되었습니다.`);
        
        // 3초 후 메인 페이지로 이동
        setTimeout(() => {
          router.push('/');
        }, 3000);

      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : '인증 처리 중 오류가 발생했습니다.');
      }
    };

    // 라우터가 준비되면 처리 시작
    if (router.isReady) {
      processCallback();
    }
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          {/* 로고 */}
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>

          {/* 상태별 아이콘 */}
          <div className="mb-4">
            {status === 'loading' && (
              <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
            )}
            {status === 'error' && (
              <AlertCircle className="w-12 h-12 mx-auto text-red-600" />
            )}
          </div>

          {/* 제목 */}
          <h1 className="text-2xl font-bold mb-2">
            {status === 'loading' && 'Google 인증 처리 중'}
            {status === 'success' && '인증 완료!'}
            {status === 'error' && '인증 실패'}
          </h1>

          {/* 메시지 */}
          <p className="text-muted-foreground mb-6">
            {message}
          </p>

          {/* 상태별 추가 정보 */}
          {status === 'success' && (
            <div className="text-sm text-muted-foreground">
              <p>곧 메인 페이지로 이동합니다...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full border border-border rounded-lg px-4 py-2 hover:bg-accent transition-colors"
              >
                메인 페이지로 이동
              </button>
            </div>
          )}
        </div>

        {/* 하단 정보 */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Role GPT Google 연동</p>
          <p>안전한 OAuth 2.0 인증</p>
        </div>
      </div>
    </div>
  );
}