import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Mode, 
  Decision, 
  CrossModeGuardConfig 
} from '../types';
import { 
  compareModes, 
  getModeLabel, 
  crossModeGuardMessages, 
  interpolateMessage 
} from '../utils/crossModeGuard';

interface UseCrossModeGuardConfig {
  onSwitchChatMode?: (chatId: string, newMode: Mode) => void;
  onCloneRole?: (roleId: string, targetMode: Mode) => Promise<string>; // 새 Role ID 반환
  lang?: 'ko' | 'en';
}

export function useCrossModeGuard(config: UseCrossModeGuardConfig = {}) {
  const { onSwitchChatMode, onCloneRole, lang = 'ko' } = config;
  const [guardConfig, setGuardConfig] = useState<CrossModeGuardConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [onResolve, setOnResolve] = useState<((result: Decision | null) => void) | null>(null);

  const messages = crossModeGuardMessages[lang];

  /**
   * Cross-Mode Guard를 열고 사용자의 결정을 기다림
   */
  const openGuard = useCallback((config: CrossModeGuardConfig): Promise<Decision | null> => {
    return new Promise((resolve) => {
      const comparison = compareModes(config.chatMode, config.roleMode);
      
      // 모드가 같으면 바로 진행
      if (comparison === 'same') {
        resolve({ type: 'proceed' });
        return;
      }

      setGuardConfig(config);
      setOnResolve(() => resolve);
      setIsOpen(true);
    });
  }, []);

  /**
   * 사용자의 결정 처리
   */
  const handleDecision = useCallback(async (decision: Decision) => {
    if (!guardConfig || !onResolve) return;

    const { chatMode, roleMode, chatId, roleId } = guardConfig;
    const values = { 
      chat: getModeLabel(chatMode, lang), 
      role: getModeLabel(roleMode, lang) 
    };

    try {
      switch (decision.type) {
        case 'proceed':
          if (compareModes(chatMode, roleMode) === 'chatHigher') {
            toast.success(interpolateMessage(messages.toast_runAsIs, values));
          }
          break;

        case 'keepChat':
          toast.success(interpolateMessage(messages.toast_downgraded, values));
          break;

        case 'switchChat':
          if (chatId && onSwitchChatMode) {
            onSwitchChatMode(chatId, decision.to);
            toast.success(interpolateMessage(messages.toast_switched, values));
          }
          break;

        case 'cloneRole':
          if (onCloneRole) {
            const newRoleId = await onCloneRole(roleId, decision.to);
            toast.success(interpolateMessage(messages.toast_roleCloned, values));
            // 새로운 Role ID로 decision 업데이트
            decision = { ...decision, roleId: newRoleId } as any;
          }
          break;
      }

      onResolve(decision);
    } catch (error) {
      console.error('Error handling cross-mode decision:', error);
      toast.error('모드 전환 중 오류가 발생했습니다.');
      onResolve(null);
    } finally {
      setIsOpen(false);
      setGuardConfig(null);
      setOnResolve(null);
    }
  }, [guardConfig, onResolve, onSwitchChatMode, onCloneRole, lang, messages]);

  const closeGuard = useCallback(() => {
    setIsOpen(false);
    setGuardConfig(null);
    if (onResolve) {
      onResolve(null);
      setOnResolve(null);
    }
  }, [onResolve]);

  return {
    // Guard 상태
    isOpen,
    guardConfig,
    
    // Guard 제어
    openGuard,
    closeGuard,
    handleDecision,
    
    // 편의 함수들
    checkAndProceed: useCallback(async (config: CrossModeGuardConfig) => {
      const decision = await openGuard(config);
      return decision;
    }, [openGuard])
  };
}
