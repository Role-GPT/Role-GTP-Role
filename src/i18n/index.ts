/**
 * 레거시 i18n 시스템 - 더 이상 사용하지 않음
 * 
 * 새로운 언어팩 시스템(/src/locales)을 사용해주세요.
 * 
 * @deprecated 이 파일은 더 이상 사용되지 않습니다.
 */

// 레거시 i18n 시스템 - 하위 호환성을 위한 기본 함수들
export const i18n = (key: string, replacements = {}) => key;
export const getLanguage = () => 'ko';
export const setLanguage = (lang: string) => {};
export const getSupportedLanguages = () => ['ko'];
export const getLanguageDisplayName = (lang: string) => lang;
export const getVoicesForLanguage = (lang: string) => [];
export const getLanguageCode = (lang: string) => lang;
export const initializeLanguage = () => {};
export const detectBrowserLanguage = () => 'ko';
export const translateUI = () => {};
