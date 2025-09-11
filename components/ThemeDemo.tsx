/**
 * 테마 데모 컴포넌트
 * 
 * 테마 전환 기능을 쉽게 테스트할 수 있는 플로팅 버튼
 * 개발/테스트용으로 화면 우측 하단에 표시
 */

import React from 'react';
import { Button } from './ui/button';
import { useTheme } from '../src/context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeDemo() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const cycleTheme = () => {
    const order: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];
    const currentIndex = order.indexOf(theme);
    const nextIndex = (currentIndex + 1) % order.length;
    setTheme(order[nextIndex]);
  };

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <div className="bg-background/90 backdrop-blur-sm border border-border rounded-xl p-4 shadow-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-medium text-center">
            <div>테마 테스트</div>
            <div className="text-muted-foreground">
              {theme === 'system' ? `시스템 (${resolvedTheme})` : theme}
            </div>
            {/* 현재 배경색 미리보기 */}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-4 h-4 rounded border border-border bg-background"></div>
              <div className="w-4 h-4 rounded border border-border bg-card"></div>
              <div className="w-4 h-4 rounded border border-border bg-muted"></div>
            </div>
            {/* 로고 색상 미리보기 */}
            <div className="text-xs text-muted-foreground mt-1">
              로고: {resolvedTheme === 'light' ? '검정색' : '흰색'}
            </div>
          </div>
          
          <Button
            onClick={cycleTheme}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 min-w-[100px]"
          >
            {getIcon()}
            <span className="capitalize">{theme}</span>
          </Button>
          
          <div className="flex gap-1">
            <Button
              onClick={() => setTheme('light')}
              variant={theme === 'light' ? 'default' : 'ghost'}
              size="sm"
              className="p-2"
            >
              <Sun className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => setTheme('dark')}
              variant={theme === 'dark' ? 'default' : 'ghost'}
              size="sm"
              className="p-2"
            >
              <Moon className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => setTheme('system')}
              variant={theme === 'system' ? 'default' : 'ghost'}
              size="sm"
              className="p-2"
            >
              <Monitor className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
