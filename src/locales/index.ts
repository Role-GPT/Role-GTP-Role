/**
 * 언어팩 시스템 메인 엔트리포인트
 * 
 * 각 언어별로 폴더가 분리되어 관리됩니다:
 * - ko/ : 한국어 (완전 번역)
 * - en/ : 영어 (완전 번역)
 * - ja/ : 일본어 (기본 구조만)
 * - es/ : 스페인어 (기본 구조만)
 * - pt/ : 포르투갈어 (기본 구조만)
 * - hi/ : 힌디어 (기본 구조만)
 */

import { ko } from './ko';
import { en } from './en';
import { ja } from './ja';
import { es } from './es';
import { pt } from './pt';
import { hi } from './hi';

export type Language = 'ko' | 'en' | 'ja' | 'es' | 'pt' | 'hi';

export const translations = {
  ko,
  en,
  ja,
  es,
  pt,
  hi,
} as const;

// 언어별 최적화된 음성 목록
export const CURATED_VOICES = {
  'ko': ['Yuna', 'Google 한국의', 'Microsoft Heami - Korean (Korea)'],
  'en': ['Samantha', 'Alex', 'Google US English', 'Microsoft Zira - English (United States)', 'Daniel', 'Google UK English Female', 'Microsoft Hazel - English (United Kingdom)'],
  'ja': ['Kyoko', 'Google 日本語', 'Microsoft Ayumi - Japanese (Japan)'],
  'es': ['Monica', 'Google español', 'Microsoft Helena - Spanish (Spain)', 'Paulina', 'Google español de Estados Unidos'],
  'pt': ['Joana', 'Google português do Brasil', 'Microsoft Daniel - Portuguese (Brazil)', 'Luciana'],
  'hi': ['Lekha', 'Google हिन्दी', 'Microsoft Kalpana - Hindi (India)', 'Veena']
};

// 기본 언어는 한국어로 설정
export const DEFAULT_LANGUAGE: Language = 'ko';

// 지원되는 모든 언어 목록
export const SUPPORTED_LANGUAGES: Language[] = ['ko', 'en', 'ja', 'es', 'pt', 'hi'];

// 언어별 표시명 (네이티브 이름)
export const LANGUAGE_NAMES = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  es: 'Español',
  pt: 'Português',
  hi: 'हिन्दी',
} as const;

// 언어별 코드 (음성 인식/합성용)
export const LANGUAGE_CODES = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  es: 'es-ES',
  pt: 'pt-BR',
  hi: 'hi-IN',
} as const;

export type TranslationKey = keyof typeof ko;

// 현재 언어별로 사용 가능한 번역 가져오기
export function getTranslation(lang: Language, category: string, key: string): string {
  try {
    const langTranslations = translations[lang];
    const defaultTranslations = translations[DEFAULT_LANGUAGE];
    
    // 현재 언어에서 찾기
    if (langTranslations && langTranslations[category] && langTranslations[category][key]) {
      return langTranslations[category][key];
    }
    
    // 기본 언어에서 찾기
    if (defaultTranslations && defaultTranslations[category] && defaultTranslations[category][key]) {
      return defaultTranslations[category][key];
    }
    
    // 찾을 수 없으면 키 반환
    return `[${category}.${key}]`;
  } catch (error) {
    // 번역 오류 시 키를 형식화하여 반환
    return `[${category}.${key}]`;
  }
}

// 안전한 번역 가져오기 (카테고리.키 형식 지원)
export function getTranslationSafe(lang: Language, keyPath: string): string {
  try {
    const parts = keyPath.split('.');
    if (parts.length !== 2) {
      // 잘못된 키 형식인 경우
      return `[${keyPath}]`;
    }
    
    const [category, key] = parts;
    return getTranslation(lang, category, key);
  } catch (error) {
    // 번역 오류 시 키를 그대로 반환
    return `[${keyPath}]`;
  }
}
