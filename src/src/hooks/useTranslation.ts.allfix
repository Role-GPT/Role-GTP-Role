import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  translations, 
  Language, 
  DEFAULT_LANGUAGE, 
  SUPPORTED_LANGUAGES, 
  LANGUAGE_NAMES, 
  LANGUAGE_CODES,
  CURATED_VOICES,
  getTranslation,
  getTranslationSafe 
} from '../locales';
import { speechManager } from '../providers/speech';

/**
 * 안전한 번역 함수
 */
function safeTranslate(lang: Language, key: string, replacements: { [key: string]: string | number } = {}): string {
  try {
    // 카테고리.키 형식인지 확인
    if (key.includes('.')) {
      let text = getTranslationSafe(lang, key);
      
      // 변수 치환 처리
      if (typeof text === 'string' && Object.keys(replacements).length > 0) {
        text = text.replace(/{(\w+)}/g, (match, placeholder) => {
          return replacements[placeholder] !== undefined ? String(replacements[placeholder]) : match;
        });
      }
      
      return text;
    }
    
    // 기존 방식: 직접 키 접근
    const langTranslations = translations[lang];
    const defaultTranslations = translations[DEFAULT_LANGUAGE];
    
    // 현재 언어에서 찾기
    let text = (langTranslations as any)?.[key];
    
    // 기본 언어에서 찾기
    if (!text && defaultTranslations) {
      text = (defaultTranslations as any)?.[key];
    }
    
    // 찾을 수 없으면 키 반환
    if (!text) {
      return key; // 키를 그대로 반환 (더 나은 UX)
    }

    // 문자열이면 변수 치환 처리
    if (typeof text === 'string' && Object.keys(replacements).length > 0) {
      text = text.replace(/{(\w+)}/g, (match, placeholder) => {
        return replacements[placeholder] !== undefined ? String(replacements[placeholder]) : match;
      });
    }
    
    return String(text);
  } catch (error) {
    // 번역 오류 시 키를 그대로 반환하여 UI가 깨지지 않도록 함
    return key;
  }
}

/**
 * 브라우저 언어 감지
 */
function detectBrowserLanguage(): Language {
  try {
    if (typeof navigator !== 'undefined' && navigator.language && Array.isArray(SUPPORTED_LANGUAGES)) {
      const browserLang = navigator.language.split('-')[0] as Language;
      return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : DEFAULT_LANGUAGE;
    }
    return DEFAULT_LANGUAGE;
  } catch (error) {
    // 브라우저 언어 감지 실패 시 기본 언어 사용
    return DEFAULT_LANGUAGE;
  }
}

/**
 * 현재 언어 가져오기 (자동 감지 우선)
 */
function getCurrentLanguage(): Language {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // 수동 설정이 있는지 확인
      const isManual = localStorage.getItem('roleGtp_language_manual');
      
      if (isManual) {
        // 수동 설정된 언어 사용
        const savedLang = localStorage.getItem('roleGtp_language');
        if (savedLang && Array.isArray(SUPPORTED_LANGUAGES) && SUPPORTED_LANGUAGES.includes(savedLang as Language)) {
          return savedLang as Language;
        }
      }
    }
    
    // 자동 감지 모드: 브라우저 언어 사용
    const detectedLang = detectBrowserLanguage();
    return detectedLang;
  } catch (error) {
    // localStorage 접근 실패 시 기본 언어 사용
    return DEFAULT_LANGUAGE;
  }
}

/**
 * 언어 설정하기
 */
function setCurrentLanguage(lang: Language) {
  try {
    // localStorage에 저장 (브라우저 환경에서만)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('roleGtp_language', lang);
    }
    
    // DOM 설정 (브라우저 환경에서만)
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = LANGUAGE_CODES[lang] || lang;
    }
  } catch (error) {
    // 언어 설정 실패 시 무시 (메모리에서는 변경됨)
  }
}

export function useTranslation() {
  // AppContext 접근을 더 안전하게 처리
  let appContext;
  try {
    appContext = useApp();
  } catch (error) {
    // AppContext가 아직 초기화되지 않은 경우 기본값 사용
    appContext = { state: null, updateSettings: () => {} };
  }
  
  const { state, updateSettings } = appContext;
  const [currentLang, setCurrentLang] = useState<Language>(DEFAULT_LANGUAGE);
  const [isInitialized, setIsInitialized] = useState(false);

  // 언어 시스템 초기화
  useEffect(() => {
    let mounted = true;
    
    const initializeTranslation = async () => {
      try {
        // 브라우저 환경에서만 초기화
        if (typeof window === 'undefined') {
          if (mounted) {
            setCurrentLang(DEFAULT_LANGUAGE);
            setIsInitialized(true);
          }
          return;
        }
        
        // 현재 언어 설정
        const lang = getCurrentLanguage();
        
        if (mounted) {
          setCurrentLang(lang);
          setIsInitialized(true);
        }
        
      } catch (error) {
        // 초기화 실패 시 기본 언어로 fallback
        if (mounted) {
          setCurrentLang(DEFAULT_LANGUAGE);
          setIsInitialized(true);
        }
      }
    };
    
    initializeTranslation();
    
    return () => {
      mounted = false;
    };
  }, []);

  // 언어 변경 감지
  useEffect(() => {
    if (!isInitialized) return;
    
    const handleLanguageChange = () => {
      try {
        setCurrentLang(getCurrentLanguage());
      } catch (error) {
        // 언어 변경 실패 시 무시 (사용자에게 영향 없음)
      }
    };

    // 브라우저 환경에서만 이벤트 리스너 등록
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('languagechange', handleLanguageChange);
      
      return () => {
        window.removeEventListener('languagechange', handleLanguageChange);
      };
    }
  }, [isInitialized]);

  const t = (key: string, replacements?: { [key: string]: string | number }): string => {
    try {
      if (!isInitialized) {
        // 초기화 전에는 키를 기반으로 한국어 기본값 제공
        const basicTranslations: { [key: string]: string } = {
          'language': '언어',
          'autoDetect': '자동 감지',
          'search': '검색',
          'cancel': '취소',
          'confirm': '확인',
          'save': '저장',
          'settings': '설정',
        };
        return basicTranslations[key] || key;
      }
      return safeTranslate(currentLang, key, replacements);
    } catch (error) {
      // 번역 오류 시 키를 그대로 반환 (사용자에게는 영향 없음)
      return key;
    }
  };

  const changeLanguage = (newLang: Language) => {
    try {
      setCurrentLanguage(newLang);
      setCurrentLang(newLang);
      
      // 음성 매니저 언어 코드 업데이트
      const languageCode = LANGUAGE_CODES[newLang] || newLang;
      speechManager.setLanguageCode(languageCode);
      
      // AppContext의 사용자 설정도 업데이트
      updateSettings({
        language: newLang
      });
    } catch (error) {
      // 언어 변경 실패 시 무시하고 이전 상태 유지
    }
  };

  return {
    t,
    language: currentLang,
    changeLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
    getLanguageDisplayName: (lang: Language) => LANGUAGE_NAMES[lang] || lang,
    getVoicesForLanguage: () => CURATED_VOICES[currentLang] || CURATED_VOICES.en,
    getLanguageCode: () => LANGUAGE_CODES[currentLang] || currentLang,
    isRTL: currentLang === 'hi', // 힌디어는 RTL 지원 필요시
    isInitialized,
  };
}