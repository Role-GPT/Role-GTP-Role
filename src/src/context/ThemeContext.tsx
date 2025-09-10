/**
 * 테마 컨텍스트 - 다크/라이트/시스템 모드 관리
 * 
 * 기능:
 * - 테마 상태 관리 (dark, light, system)
 * - 시스템 설정 자동 감지
 * - localStorage 저장/복원
 * - CSS 클래스 자동 적용
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light'; // 실제로 적용된 테마
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  // 시스템 테마 감지
  const getSystemTheme = (): 'dark' | 'light' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // 서버 사이드에서는 기본값
  };

  // 실제 테마 계산
  const calculateResolvedTheme = (currentTheme: Theme): 'dark' | 'light' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // 테마 설정 함수
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // localStorage에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('role-gpt-theme', newTheme);
    }

    // 실제 테마 업데이트
    const resolved = calculateResolvedTheme(newTheme);
    setResolvedTheme(resolved);
    
    // CSS 클래스 적용
    applyTheme(resolved);
  };

  // CSS 클래스 적용
  const applyTheme = (resolved: 'dark' | 'light') => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      if (resolved === 'light') {
        root.classList.add('light');
      } else {
        root.classList.remove('light');
      }
    }
  };

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    // localStorage에서 저장된 테마 복원
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('role-gpt-theme') as Theme;
      const initialTheme = savedTheme || 'system';
      
      setThemeState(initialTheme);
      const resolved = calculateResolvedTheme(initialTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    }
  }, []);

  // 시스템 테마 변경 감지
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };

    // 이벤트 리스너 추가
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // 정리
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}