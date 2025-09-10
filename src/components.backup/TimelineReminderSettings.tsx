import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { useApp } from '../src/context/AppContext';
import { ConversationSettings } from '../src/types';
import { TIMELINE_REMINDER_DEFAULTS } from '../src/constants';
import { TimelineReminderManager } from '../src/services/timelineReminderService';
import { ServerlessLimitationService } from '../src/services/serverlessLimitationService';
import { Clock, Zap, Crown, Settings, Info, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TimelineReminderSettingsProps {
  conversationId: string;
  settings?: ConversationSettings;
  onSettingsChange: (settings: Partial<ConversationSettings>) => void;
  compact?: boolean; // Advanced 모드에서는 compact=true
}

export function TimelineReminderSettings({ 
  conversationId, 
  settings = {}, 
  onSettingsChange,
  compact = false 
}: TimelineReminderSettingsProps) {
  const { state } = useApp();
  const userMode = state.userSettings.mode as 'standard' | 'advanced' | 'expert';
  const [limitations, setLimitations] = useState<any>(null);
  const isPaidUser = false; // TODO: 실제 결제 상태 확인
  
  // 🔐 서버리스에서 모드별 제한사항 조회
  useEffect(() => {
    const fetchLimitations = async () => {
      try {
        const limitationsData = await ServerlessLimitationService.getModeLimitations(userMode);
        setLimitations(limitationsData.limitations);
      } catch (error) {
        console.warn('제한사항 조회 실패:', error);
        // 폴백 제한사항 사용
        const fallback = ServerlessLimitationService.getFallbackLimitations();
        setLimitations(fallback.limitations);
      }
    };
    
    fetchLimitations();
  }, [userMode]);
  
  // 🔐 서버리스에서 가져온 제한사항 기반 값들
  const getMaxAllowedInterval = () => {
    if (!limitations) return 10; // 폴백
    return limitations.timelineReminderMaxInterval || 10;
  };
  
  const getActualUsableInterval = () => {
    if (!limitations) return 10; // 폴백
    if (userMode === 'standard') return limitations.timelineReminderMaxInterval || 10;
    if (userMode === 'advanced') return isPaidUser ? limitations.timelineReminderMaxInterval : (limitations.timelineReminderPaidOnlyAfter || 15);
    if (userMode === 'expert') return limitations.timelineReminderMaxInterval || 50;
    return 10;
  };
  
  const maxInterval = getMaxAllowedInterval();
  const maxUsableInterval = getActualUsableInterval();
  
  // 현재 설정값들 (실제 제한 적용)
  const [enableTimelineReminder, setEnableTimelineReminder] = useState(
    userMode === 'expert' && !isPaidUser ? false : (settings.enableTimelineReminder ?? (userMode === 'standard'))
  );
  const [timelineReminderInterval, setTimelineReminderInterval] = useState(
    Math.min(settings.timelineReminderInterval ?? maxInterval, maxInterval)
  );
  const [summaryInterval, setSummaryInterval] = useState(
    settings.summaryInterval ?? TIMELINE_REMINDER_DEFAULTS.summaryInterval
  );
  const [summaryFormat, setSummaryFormat] = useState(
    settings.summaryFormat ?? TIMELINE_REMINDER_DEFAULTS.summaryFormat
  );
  const [consolidationInterval, setConsolidationInterval] = useState(
    settings.consolidationInterval ?? TIMELINE_REMINDER_DEFAULTS.consolidationInterval
  );

  // 🔐 제한사항 로딩 중이거나 Standard 모드에서는 UI 숨김
  if (!limitations) {
    return <div className="text-sm text-muted-foreground">설정을 불러오는 중...</div>;
  }
  
  if (userMode === 'standard' || !limitations.showTimelineReminderSettings) {
    return null;
  }

  // Expert는 모든 기능 표시, Advanced는 부분 제한
  const isExpertLocked = false; // Expert 모드는 잠금 없음 (모든 기능 표시)
  const isAdvancedPartiallyLocked = userMode === 'advanced' && !isPaidUser;

  // 설정 변경 핸들러 (실제 제한 적용)
  const handleSettingsChange = (newSettings: Partial<ConversationSettings>) => {
    // Advanced 모드 부분 잠금 체크 - 15턴 이후 제한
    if (newSettings.timelineReminderInterval && isAdvancedPartiallyLocked) {
      if (newSettings.timelineReminderInterval > 15) {
        toast.error('15턴 이상 설정은 업그레이드가 필요합니다.');
        return;
      }
    }
    
    onSettingsChange(newSettings);
  };

  const handleTimelineReminderToggle = (enabled: boolean) => {
    setEnableTimelineReminder(enabled);
    handleSettingsChange({ enableTimelineReminder: enabled });
  };

  const handleIntervalChange = (interval: number) => {
    // 실제 사용 가능한 최대값으로 제한
    const limitedInterval = Math.min(interval, maxUsableInterval);
    setTimelineReminderInterval(limitedInterval);
    handleSettingsChange({ timelineReminderInterval: limitedInterval });
  };

  const handleSummaryIntervalChange = (interval: number) => {
    setSummaryInterval(interval);
    handleSettingsChange({ summaryInterval: interval });
  };

  const handleSummaryFormatChange = (format: string) => {
    setSummaryFormat(format as any);
    handleSettingsChange({ summaryFormat: format as any });
  };

  const handleConsolidationIntervalChange = (interval: number) => {
    setConsolidationInterval(interval);
    handleSettingsChange({ consolidationInterval: interval });
  };

  const getModeDisplayName = (mode: string) => {
    switch (mode) {
      case 'standard': return 'Standard';
      case 'advanced': return 'Advanced';
      case 'expert': return 'Expert';
      default: return mode;
    }
  };

  const getIntervalColor = (interval: number) => {
    if (userMode === 'advanced' && interval > 20 && !isPaidUser) {
      return 'text-amber-600'; // 유료 구간
    }
    return 'text-foreground';
  };

  if (compact) {
    // Advanced 모드용 간소화된 UI - 깔끔하게 정리
    return (
      <Card className={`border-muted/40 ${isAdvancedPartiallyLocked ? 'opacity-90' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">타임라인 리마인더</CardTitle>
            </div>
            <Switch
              checked={enableTimelineReminder}
              onCheckedChange={handleTimelineReminderToggle}
              disabled={isExpertLocked}
            />
          </div>
        </CardHeader>
        
        {enableTimelineReminder && (
          <CardContent className="pt-0 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground">
                  간격: {timelineReminderInterval}턴 (0-{maxInterval}턴)
                </Label>
                {isAdvancedPartiallyLocked && timelineReminderInterval > 15 && (
                  <Crown className="h-3 w-3 text-amber-500" title="15턴 이상은 업그레이드가 필요합니다" />
                )}
              </div>
              <Slider
                value={[timelineReminderInterval]}
                onValueChange={(value) => handleIntervalChange(value[0])}
                min={0}
                max={maxInterval} // 30턴까지 보여주기 (Advanced)
                step={5}
                className="w-full"
                disabled={false}
              />
              {isAdvancedPartiallyLocked && (
                <div className="text-xs text-muted-foreground">
                  <span>0-15턴 무료 • </span>
                  <span className="text-amber-600">16-30턴 업그레이드 필요</span>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  // Expert 모드용 상세 UI - 모든 기능 표시
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="flex items-center gap-2">
                  타임라인 리마인더 시스템
                </CardTitle>
                <CardDescription>
                  AI가 자동으로 대화를 요약하고 타임라인을 관리합니다
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={enableTimelineReminder}
              onCheckedChange={handleTimelineReminderToggle}
              disabled={false}
            />
          </div>
        </CardHeader>

        {enableTimelineReminder && (
          <CardContent className="space-y-6">
            {/* 타임라인 리마인더 간격 설정 - Expert는 0-50턴 모든 기능 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  리마인더 간격
                </Label>
                <span className="text-sm font-mono">
                  {timelineReminderInterval}턴 (0-{maxInterval}턴)
                </span>
              </div>
              
              <Slider
                value={[timelineReminderInterval]}
                onValueChange={(value) => handleIntervalChange(value[0])}
                min={0}
                max={maxInterval} // Expert: 0-50턴 모든 기능 표시
                step={5}
                className="w-full"
                disabled={false}
              />
            </div>

            {/* 대화 요약 설정 - Expert 모든 기능 */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-green-500" />
                요약 설정
              </Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">생성 간격 (0-50턴)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[summaryInterval]}
                      onValueChange={(value) => handleSummaryIntervalChange(value[0])}
                      min={0}
                      max={50} // Expert: 0-50턴
                      step={1}
                      className="flex-1"
                      disabled={false}
                    />
                    <span className="text-sm font-mono w-8">{summaryInterval}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">형태</Label>
                  <Select
                    value={summaryFormat}
                    onValueChange={handleSummaryFormatChange}
                    disabled={false}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bullet">불릿 포인트</SelectItem>
                      <SelectItem value="sentences">문장형</SelectItem>
                      <SelectItem value="paragraph">문단형</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 재요약 설정 - Expert 모든 기능 */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Info className="h-4 w-4 text-purple-500" />
                재요약 간격 (0-50턴)
              </Label>
              
              <div className="flex items-center gap-2">
                <Slider
                  value={[consolidationInterval]}
                  onValueChange={(value) => handleConsolidationIntervalChange(value[0])}
                  min={0}
                  max={50} // Expert: 0-50턴
                  step={5}
                  className="flex-1"
                  disabled={false}
                />
                <span className="text-sm font-mono w-12">{consolidationInterval}턴</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}