/**
 * 세션 상태 배너 컴포넌트
 */

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Info, AlertCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  BannerType, 
  pickBanner, 
  getBannerConfig, 
  dismissBanner 
} from '../src/utils/bannerManager';
import { getCurrentSession } from '../src/utils/sessionManager';
import { cn } from './ui/utils';

interface SessionBannerProps {
  messageCount: number;
  hasUnsavedChanges: boolean;
  onAction: (action: string) => void;
  className?: string;
}

export function SessionBanner({ 
  messageCount, 
  hasUnsavedChanges, 
  onAction, 
  className 
}: SessionBannerProps) {
  const [currentBanner, setCurrentBanner] = useState<BannerType | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 스토리지 사용량 확인
    const checkQuota = async () => {
      try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          return {
            usage: estimate.usage || 0,
            quota: estimate.quota || 1
          };
        }
      } catch (error) {
        console.warn('Storage quota check failed:', error);
      }
      return { usage: 0, quota: 1 };
    };

    const updateBanner = async () => {
      try {
        const session = getCurrentSession();
        const quota = await checkQuota();
        
        const bannerType = pickBanner({
          mode: session.isEphemeral ? "ephemeral" : session.mode === 'public' ? "public" : "personal",
          messageCount,
          vaultConfigured: session.hasVault,
          unsaved: hasUnsavedChanges,
          quota,
          firstRunSeen: localStorage.getItem("firstRunSeen") === "true",
          byokNoticeSeen: localStorage.getItem("byokNoticeSeen") === "true",
          expiryAt: session.expiresAt ? new Date(session.expiresAt).getTime() : undefined,
          hasPin: session.hasPin,
          isFirstTime: localStorage.getItem("firstTimeUser") === "true"
        });

        setCurrentBanner(bannerType);
        setIsVisible(!!bannerType);
      } catch (error) {
        console.warn('Banner update failed:', error);
        setIsVisible(false);
      }
    };

    updateBanner();
  }, [messageCount, hasUnsavedChanges]);

  const handleAction = (action: string) => {
    if (currentBanner && action === "dismiss") {
      dismissBanner(currentBanner);
      setIsVisible(false);
      setCurrentBanner(null);
    } else {
      onAction(action);
    }
  };

  if (!isVisible || !currentBanner) {
    return null;
  }

  const config = getBannerConfig(currentBanner);
  
  const getIcon = () => {
    switch (config.type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getBorderClass = () => {
    switch (config.type) {
      case 'error':
        return 'border-destructive/50';
      case 'warning':
        return 'border-yellow-500/50';
      case 'info':
        return 'border-blue-500/50';
      default:
        return 'border-border';
    }
  };

  const getBackgroundClass = () => {
    switch (config.type) {
      case 'error':
        return 'bg-destructive/10';
      case 'warning':
        return 'bg-yellow-500/10';
      case 'info':
        return 'bg-blue-500/10';
      default:
        return 'bg-muted/50';
    }
  };

  return (
    <Card 
      className={cn(
        "border-2 transition-all duration-300",
        getBorderClass(),
        getBackgroundClass(),
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {getIcon()}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{config.title}</h4>
                {currentBanner === 'ephemeralMode' && (
                  <Badge variant="outline" className="text-xs">
                    임시
                  </Badge>
                )}
                {currentBanner === 'expirySoon' && (
                  <Badge variant="destructive" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    D-{getCurrentSession().daysRemaining || 0}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{config.message}</p>
            </div>
          </div>
          
          {!config.persistent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction("dismiss")}
              className="h-6 w-6 p-0 hover:bg-background/50"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {config.actions.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {config.actions.map((action, index) => (
              <Button
                key={index}
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                onClick={() => handleAction(action.action)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * 상단 고정 상태 배지 컴포넌트
 */
interface StatusBadgeProps {
  className?: string;
}

export function StatusBadge({ className }: StatusBadgeProps) {
  const [session, setSession] = useState(() => {
    try {
      return getCurrentSession();
    } catch (error) {
      console.warn('Failed to get current session:', error);
      return {
        mode: 'ephemeral' as const,
        isEphemeral: true,
        hasPin: false,
        hasVault: false,
        deviceId: '',
      };
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        setSession(getCurrentSession());
      } catch (error) {
        console.warn('Failed to update session:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!session.isEphemeral && session.mode !== 'public' && !session.daysRemaining) {
    return null;
  }

  const getBadgeText = () => {
    if (session.mode === 'public') {
      return "공용 모드";
    }
    if (session.daysRemaining !== undefined) {
      return `체험 D-${session.daysRemaining}`;
    }
    if (session.isEphemeral) {
      // 첫 시간 사용자에게는 더 친근한 메시지
      const isFirstTime = localStorage.getItem("firstTimeUser") === "true";
      return isFirstTime ? "체험 중" : "임시 채팅";
    }
    return null;
  };

  const badgeText = getBadgeText();
  if (!badgeText) return null;

  const getVariant = () => {
    if (session.mode === 'public') return "destructive";
    if (session.daysRemaining !== undefined && session.daysRemaining <= 1) return "destructive";
    if (session.isEphemeral) return "secondary";
    return "default";
  };

  return (
    <div className={cn("fixed top-4 left-1/2 transform -translate-x-1/2 z-50", className)}>
      <Badge variant={getVariant()} className="px-3 py-1 shadow-lg backdrop-blur-sm">
        {badgeText}
        {session.publicSeat && (
          <span className="ml-2 text-xs opacity-75">
            좌석 {session.publicSeat.seat_no}
          </span>
        )}
      </Badge>
    </div>
  );
}