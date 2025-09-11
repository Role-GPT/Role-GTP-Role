import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getCurrentSession } from '../src/utils/sessionManager';
import { useTheme } from '../src/context/ThemeContext';

interface TrialBannerProps {
  /**
   * 대화 메시지 수 (0일 때만 표시)
   */
  messageCount: number;
  
  /**
   * 모바일 여부
   */
  isMobile: boolean;
  
  /**
   * 업그레이드 모달 열기 핸들러
   */
  onUpgrade: () => void;
  
  /**
   * 배너 닫기 핸들러 (세션 동안 숨김)
   */
  onDismiss?: () => void;
}

export function TrialBanner({ 
  messageCount, 
  isMobile, 
  onUpgrade, 
  onDismiss 
}: TrialBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentSession, setCurrentSession] = useState(getCurrentSession());
  const { theme } = useTheme();

  // 세션 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSession(getCurrentSession());
    }, 10000); // 10초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  // 표시 조건 확인 - Free, BYOK Free 상태일 때만
  useEffect(() => {
    const shouldShow = (
      messageCount === 0 && // 대화 시작 전에만
      (currentSession?.mode === 'ephemeral' || currentSession?.mode === 'byok') && // Free/BYOK 모드일 때만
      !isDismissed && // 닫지 않았을 때만
      !sessionStorage.getItem('trial_banner_dismissed') // 세션에서 닫지 않았을 때만
    );
    
    setIsVisible(shouldShow);
  }, [messageCount, currentSession?.mode, isDismissed]);

  // 배너 닫기
  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('trial_banner_dismissed', 'true');
    onDismiss?.();
  };

  // 업그레이드 클릭
  const handleUpgrade = () => {
    onUpgrade();
  };

  // 현재 모드에 따른 상태 태그 반환
  const getModeStatusBadge = () => {
    if (currentSession?.mode === 'ephemeral') {
      return 'Free';
    } else if (currentSession?.mode === 'byok') {
      return 'BYOK Free';
    }
    return 'Free';
  };

  // 테마별 배경 스타일
  const getThemeStyles = () => {
    const isDark = theme === 'dark';
    
    return {
      background: isDark 
        ? 'bg-gradient-to-r from-slate-800/90 to-gray-800/90' 
        : 'bg-gradient-to-r from-blue-50/95 to-indigo-50/95',
      border: isDark 
        ? 'border-white/10' 
        : 'border-gray-200/50',
      text: isDark 
        ? 'text-white' 
        : 'text-gray-900',
      textSecondary: isDark 
        ? 'text-white/70' 
        : 'text-gray-600',
      closeButton: isDark 
        ? 'bg-black/50 hover:bg-black/70 text-white/80' 
        : 'bg-white/80 hover:bg-white text-gray-600'
    };
  };

  const themeStyles = getThemeStyles();

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: isMobile ? -20 : 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: isMobile ? -20 : 20 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30 
        }}
        className={`
          fixed z-50 
          ${isMobile 
            ? 'top-6 right-4 max-w-[250px]' 
            : 'bottom-6 right-6 max-w-[280px]'
          }
        `}
      >
        <div className="relative">
          {/* 메인 배너 */}
          <div className={`${themeStyles.background} backdrop-blur-xl border ${themeStyles.border} rounded-xl p-3 shadow-2xl`}>
            {/* 닫기 버튼 */}
            <button
              onClick={handleDismiss}
              className={`absolute -top-1 -right-1 w-5 h-5 ${themeStyles.closeButton} backdrop-blur-sm rounded-full flex items-center justify-center transition-colors`}
            >
              <X className="w-3 h-3" />
            </button>

            {/* 헤더 */}
            <div className="flex items-center gap-2 mb-2">
              <div className="relative">
                <Sparkles className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <motion.div
                  className={`absolute inset-0 w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`${isMobile ? 'text-sm' : 'text-sm'} font-semibold ${themeStyles.text}`}>
                    Role GPT
                  </h3>
                  <Badge 
                    variant="secondary" 
                    className={`${isMobile ? 'text-xs px-1 py-0.5' : 'text-xs px-1.5 py-0.5'} ${
                      theme === 'dark' 
                        ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' 
                        : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}
                  >
                    {getModeStatusBadge()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 설명 */}
            <p className={`text-xs ${themeStyles.textSecondary} mb-3 leading-relaxed`}>
              업그레이드하여 보다 강력한 기능들을 사용해보세요.
            </p>

            {/* 액션 버튼들 */}
            <div className="flex gap-2">
              <Button
                onClick={handleUpgrade}
                size="sm"
                className={`flex-1 h-7 bg-gradient-to-r ${
                  theme === 'dark' 
                    ? 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                    : 'from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                } text-white border-0 shadow-lg text-xs px-3`}
              >
                <Crown className="w-3 h-3 mr-1" />
                업그레이드
              </Button>
            </div>

            {/* 장식적 그라데이션 */}
            <div className={`absolute inset-0 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-blue-500/5 to-indigo-500/5' 
                : 'bg-gradient-to-r from-blue-100/30 to-indigo-100/30'
            } pointer-events-none`} />
            
            {/* 반짝이는 효과 */}
            <motion.div
              className={`absolute top-2 right-8 w-1 h-1 rounded-full ${
                theme === 'dark' ? 'bg-blue-300' : 'bg-blue-500'
              }`}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: 0
              }}
            />
            <motion.div
              className={`absolute bottom-3 left-6 w-1 h-1 rounded-full ${
                theme === 'dark' ? 'bg-indigo-300' : 'bg-indigo-500'
              }`}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: 0.7
              }}
            />
          </div>

          {/* 그림자 효과 */}
          <div className={`absolute inset-0 -z-10 ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-blue-600/10 to-indigo-600/10' 
              : 'bg-gradient-to-r from-blue-200/30 to-indigo-200/30'
          } blur-xl rounded-xl transform scale-110`} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
