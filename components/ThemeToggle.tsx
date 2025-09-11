/**
 * 테마 전환 버튼 컴포넌트
 * 
 * 기능:
 * - 3가지 테마 모드 순환 (시스템 → 라이트 → 다크)
 * - 현재 테마 아이콘 표시
 * - 툴팁으로 다음 테마 미리보기
 * - 부드러운 전환 애니메이션
 */

import React from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useTheme } from '../src/context/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // 테마 순환: system → light → dark → system
  const cycleTheme = () => {
    const themeOrder: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  // 테마별 아이콘 및 라벨
  const getThemeIcon = (themeType: string) => {
    switch (themeType) {
      case 'light':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 6.34L4.93 4.93M19.07 19.07l-1.41-1.41" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'dark':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
          </svg>
        );
      case 'system':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 8h20" stroke="currentColor" strokeWidth="2"/>
            <circle cx="8" cy="14" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 14h4" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      default:
        return null;
    }
  };

  // 다음 테마 예측
  const getNextTheme = () => {
    const themeOrder: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    return themeOrder[nextIndex];
  };

  const getThemeLabel = (themeType: string) => {
    switch (themeType) {
      case 'light':
        return '라이트 모드';
      case 'dark':
        return '다크 모드';
      case 'system':
        return '시스템 설정';
      default:
        return '';
    }
  };

  const nextTheme = getNextTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={cycleTheme}
            className="h-8 w-8 p-0 hover:bg-accent/50 transition-all duration-200"
          >
            <div className="relative">
              {/* 현재 테마 아이콘 */}
              <div className="transition-all duration-300 hover:scale-110">
                {getThemeIcon(theme)}
              </div>
              
              {/* 시스템 모드일 때 실제 테마 표시 */}
              {theme === 'system' && (
                <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-primary/60">
                  <div className="w-full h-full rounded-full flex items-center justify-center text-[6px]">
                    {resolvedTheme === 'dark' ? '🌙' : '☀️'}
                  </div>
                </div>
              )}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="px-3 py-2">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-sm">
              <span>현재: {getThemeLabel(theme)}</span>
              {theme === 'system' && (
                <span className="text-xs text-muted-foreground">
                  ({getThemeLabel(resolvedTheme)})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>클릭하여 변경 →</span>
              <span>{getThemeLabel(nextTheme)}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// 간단한 버전 (툴팁 없이)
export function SimpleThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themeOrder: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '💻';
      default:
        return '💻';
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={cycleTheme}
      className="h-8 w-8 p-0 text-base hover:bg-accent/50"
      title={`현재: ${theme === 'system' ? '시스템 설정' : theme === 'light' ? '라이트 모드' : '다크 모드'}`}
    >
      {getThemeIcon()}
    </Button>
  );
}
