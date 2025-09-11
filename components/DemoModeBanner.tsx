/**
 * 데모 모드 배너 컴포넌트
 * 
 * Figma Make 환경에서 실제 AI가 아닌 시뮬레이션을 사용하고 있음을 알리는 배너
 */

import { useState } from 'react';
import { X, Info, Code, Zap } from 'lucide-react';

interface DemoModeBannerProps {
  isVisible?: boolean;
  onDismiss?: () => void;
}

export function DemoModeBanner({ isVisible = true, onDismiss }: DemoModeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!isVisible || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100000] bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="font-medium text-sm">데모 모드</span>
          </div>
          
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-sm opacity-90">
              <Code className="w-3 h-3" />
              <span>Figma Make 환경</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-sm opacity-90">
              <Info className="w-3 h-3" />
              <span>AI 응답 시뮬레이션 중</span>
            </div>
          </div>

          <div className="text-xs opacity-80 hidden md:block">
            실제 배포 시에는 진짜 AI가 동작합니다
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 transition-colors"
          aria-label="배너 닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * 간단한 데모 모드 인디케이터 (우측 상단 고정)
 */
export function DemoModeIndicator() {
  return (
    <div className="fixed top-4 right-4 z-[99999] bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5">
      <Zap className="w-3 h-3" />
      <span>데모 모드</span>
    </div>
  );
}
