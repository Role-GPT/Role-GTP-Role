import { useEffect } from 'react';
import { initializeLanguage, getLanguageCode } from '../i18n';
import { speechManager } from '../providers/speech';
import { useApp } from '../context/AppContext';

export function useAppInitialization() {
  const { state, setActiveChat, setSelectedRole } = useApp();

  // 시스템 초기화 (언어, 테마 등)
  useEffect(() => {
    try {
      // 언어 시스템 초기화
      if (typeof initializeLanguage === 'function') {
        initializeLanguage();
        
        // 음성 매니저에 초기 언어 설정 (안전하게)
        try {
          if (typeof getLanguageCode === 'function') {
            const initialLanguageCode = getLanguageCode();
            if (speechManager && typeof speechManager.setLanguageCode === 'function') {
              speechManager.setLanguageCode(initialLanguageCode);
            }
          }
        } catch (error) {
          // 음성 매니저 언어 설정 실패는 무시
        }
      }

      // 테마 초기화
      const savedTheme = state.userSettings.theme;
      const root = document.documentElement;
      
      if (savedTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.className = systemTheme;
        
        // 시스템 테마 변경 감지
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleThemeChange = (e: MediaQueryListEvent) => {
          if (state.userSettings.theme === 'system') {
            root.className = e.matches ? 'dark' : 'light';
          }
        };
        mediaQuery.addEventListener('change', handleThemeChange);
        
        return () => mediaQuery.removeEventListener('change', handleThemeChange);
      } else {
        root.className = savedTheme;
      }
    } catch (error) {
      // 시스템 초기화 오류는 무시하고 계속 진행
    }
  }, [state.userSettings.theme]);

  // 페이지 새로고침이나 새 세션에서 기본값으로 시작
  useEffect(() => {
    const selectedRole = state.selectedRoleId ? state.roles.find(r => r.id === state.selectedRoleId) : null;
    
    if (!state.activeChatId && !selectedRole) {
      // 완전히 새로운 세션으로 시작 - 항상 Buddy를 디폴트로 설정
      setActiveChat(null);
      setSelectedRole('buddy');
    } else if (!state.activeChatId && state.selectedRoleId === 'guide') {
      // 만약 가이드가 선택되어 있다면 Buddy로 변경
      setSelectedRole('buddy');
    }
  }, [state.selectedRoleId, state.activeChatId]);
}