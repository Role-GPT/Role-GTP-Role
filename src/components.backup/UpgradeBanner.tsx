import React, { useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Crown, X, Zap, Star, ArrowRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UpgradeBannerProps {
  message: string;
  featureType: 'projects' | 'conversations' | 'customRoles' | 'templateRoles' | 'timelineReminder';
  currentMode: 'standard' | 'advanced' | 'expert';
  onUpgrade?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

export function UpgradeBanner({ 
  message, 
  featureType, 
  currentMode, 
  onUpgrade, 
  onDismiss,
  compact = false 
}: UpgradeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleUpgrade = () => {
    onUpgrade?.();
    // TODO: 실제 업그레이드 플로우 연결
    toast.info('업그레이드 기능을 곧 지원할 예정입니다.');
  };

  const getFeatureIcon = () => {
    switch (featureType) {
      case 'projects': return '📁';
      case 'conversations': return '💬';
      case 'customRoles': return '🎭';
      case 'templateRoles': return '📚';
      case 'timelineReminder': return '⏰';
      default: return '✨';
    }
  };

  const getTargetMode = () => {
    if (currentMode === 'standard') return 'Advanced';
    if (currentMode === 'advanced') return 'Expert';
    return 'Premium';
  };

  if (compact) {
    return (
      <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/60 dark:border-blue-800/60 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getFeatureIcon()}</span>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Crown className="h-3 w-3 mr-1" />
              업그레이드
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Alert className="border-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/40 dark:to-purple-950/40">
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{getFeatureIcon()}</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-600" />
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                더 강력한 기능이 필요하신가요?
              </span>
              <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                {currentMode} → {getTargetMode()}
              </Badge>
            </div>
            
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              {message}
            </AlertDescription>
            
            <div className="flex flex-wrap gap-2 text-xs text-blue-700 dark:text-blue-300">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>무제한 프로젝트</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>고급 AI 기능</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                <span>우선 지원</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Crown className="h-4 w-4 mr-2" />
            {getTargetMode()}로 업그레이드
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
}