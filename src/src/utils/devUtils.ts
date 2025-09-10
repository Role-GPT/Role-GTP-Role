// 개발 환경 유틸리티 함수들

/**
 * 개발 환경에서만 콘솔 로그를 출력합니다
 */
export const devLog = (...args: any[]) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.log('[DEV]', ...args);
    }
  } catch (e) {
    // Fallback for environments without import.meta
    console.log('[DEV]', ...args);
  }
};

/**
 * 개발 환경에서만 경고를 출력합니다
 */
export const devWarn = (...args: any[]) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.warn('[DEV WARNING]', ...args);
    }
  } catch (e) {
    // Fallback for environments without import.meta
    console.warn('[DEV WARNING]', ...args);
  }
};

/**
 * 개발 환경에서만 에러를 출력합니다
 */
export const devError = (...args: any[]) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.error('[DEV ERROR]', ...args);
    }
  } catch (e) {
    // Fallback for environments without import.meta
    console.error('[DEV ERROR]', ...args);
  }
};

/**
 * API 호출 에러를 안전하게 처리합니다
 */
export const safeApiCall = async (apiCall: any, fallbackValue: any, errorMessage: string = '') => {
  try {
    return await apiCall();
  } catch (error) {
    devWarn(errorMessage || 'API call failed, using fallback value:', error);
    return fallbackValue;
  }
};

/**
 * 서드파티 서비스가 활성화되어 있는지 확인합니다
 */
export const isServiceEnabled = (serviceName: string): boolean => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const envKey = `VITE_${serviceName.toUpperCase()}_ENABLED`;
      return import.meta.env[envKey] === 'true';
    }
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * 개발 모드인지 확인합니다
 */
export const isDevelopment = (): boolean => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
    }
    return true; // Fallback to development
  } catch (e) {
    return true;
  }
};

/**
 * 에러를 안전하게 무시합니다 (개발 환경에서만)
 */
export const ignoreDevErrors = (fn: () => void) => {
  if (isDevelopment()) {
    try {
      fn();
    } catch (error) {
      devWarn('Ignored development error:', error);
    }
  } else {
    fn();
  }
};