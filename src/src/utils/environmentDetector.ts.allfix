/**
 * 환경 감지 및 데모 모드 유틸리티
 * 
 * Figma Make, 개발 환경, 프로덕션 환경을 감지하여
 * 적절한 모드로 동작하도록 설정
 */

export interface EnvironmentInfo {
  isFigmaMake: boolean;
  isProduction: boolean;
  isDevelopment: boolean;
  supportsNetworking: boolean;
  supportsBackend: boolean;
  shouldUseDemoMode: boolean;
}

/**
 * 현재 실행 환경을 감지합니다
 */
export function detectEnvironment(): EnvironmentInfo {
  // Figma Make 환경 감지
  const isFigmaMake = 
    // URL 체크
    window.location.hostname.includes('figma.com') ||
    window.location.hostname.includes('figma') ||
    // User Agent 체크
    navigator.userAgent.includes('Figma') ||
    // 특정 Figma Make 속성 체크
    window.hasOwnProperty('figma') ||
    // iframe 내부인지 체크 (Figma Make는 iframe에서 실행됨)
    window.self !== window.top ||
    // 네트워크 제한 환경 체크
    !window.fetch;

  // 개발/프로덕션 환경 감지
  const isDevelopment = 
    process.env.NODE_ENV === 'development' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('127.0.0.1');

  const isProduction = !isDevelopment && !isFigmaMake;

  // 네트워킹 지원 여부
  const supportsNetworking = !isFigmaMake && typeof fetch !== 'undefined';

  // 백엔드 지원 여부  
  const supportsBackend = supportsNetworking && isProduction;

  // 데모 모드 사용 여부
  const shouldUseDemoMode = isFigmaMake || !supportsNetworking;

  return {
    isFigmaMake,
    isProduction,
    isDevelopment,
    supportsNetworking,
    supportsBackend,
    shouldUseDemoMode
  };
}

/**
 * 환경 정보를 콘솔에 출력 (디버깅용)
 */
export function logEnvironmentInfo() {
  const env = detectEnvironment();
  
  console.log('🌍 환경 감지 결과:', {
    '📍 실행 환경': env.isFigmaMake ? 'Figma Make' : 
                    env.isDevelopment ? '개발' : '프로덕션',
    '🌐 네트워킹': env.supportsNetworking ? '지원' : '제한됨',  
    '🔗 백엔드': env.supportsBackend ? '연결 가능' : '연결 불가',
    '🎭 데모 모드': env.shouldUseDemoMode ? '활성화' : '비활성화',
    '🔍 상세 정보': {
      hostname: window.location.hostname,
      userAgent: navigator.userAgent.substring(0, 100),
      isIframe: window.self !== window.top,
      hasFetch: typeof fetch !== 'undefined'
    }
  });

  return env;
}

/**
 * 글로벌 환경 변수로 설정
 */
export const ENV = detectEnvironment();

// 초기화 시 환경 정보 출력
if (typeof window !== 'undefined') {
  logEnvironmentInfo();
}