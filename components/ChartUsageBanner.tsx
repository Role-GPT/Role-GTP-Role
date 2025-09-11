/**
 * 차트 사용량 배너 컴포넌트
 * 
 * 일일 차트 생성 제한 정보를 표시하는 배너
 * - 사용량 진행률 표시
 * - 제한 도달 시 경고 메시지
 * - 초기화 시간 안내
 * 
 * @author Role GPT Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { BarChart3, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ChartUsageManager, ChartUsageInfo } from '../src/utils/chartUsageManager';

interface ChartUsageBannerProps {
  className?: string;
  variant?: 'compact' | 'detailed';
  showResetButton?: boolean; // 개발용
}

/**
 * 차트 사용량 배너 컴포넌트
 */
export function ChartUsageBanner({ 
  className = '', 
  variant = 'compact',
  showResetButton = false 
}: ChartUsageBannerProps) {
  const [usageInfo, setUsageInfo] = useState<ChartUsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 사용량 정보 로드
  useEffect(() => {
    const loadUsageInfo = () => {
      try {
        const info = ChartUsageManager.getUsageInfo();
        setUsageInfo(info);
      } catch (error) {
        console.error('차트 사용량 정보 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsageInfo();

    // 1분마다 업데이트 (자정 초기화 감지용)
    const interval = setInterval(loadUsageInfo, 60000);
    return () => clearInterval(interval);
  }, []);

  // 개발용 리셋 버튼 핸들러
  const handleReset = () => {
    ChartUsageManager.resetUsage();
    const newInfo = ChartUsageManager.getUsageInfo();
    setUsageInfo(newInfo);
  };

  if (isLoading || !usageInfo) {
    return null;
  }

  const progress = ChartUsageManager.getUsageProgress();
  const isNearLimit = progress >= 80;
  const isLimitReached = !usageInfo.canGenerate;

  // Compact 버전
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <BarChart3 className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          차트 생성: {usageInfo.dailyUsage}/{usageInfo.maxDailyUsage}
        </span>
        
        {isLimitReached ? (
          <Badge variant="destructive" className="text-xs">
            한도 초과
          </Badge>
        ) : isNearLimit ? (
          <Badge variant="secondary" className="text-xs">
            거의 한도
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            {usageInfo.remainingUsage}회 남음
          </Badge>
        )}
        
        {showResetButton && (
          <Button size="sm" variant="ghost" onClick={handleReset} className="h-6 px-2 text-xs">
            리셋
          </Button>
        )}
      </div>
    );
  }

  // Detailed 버전
  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <h3 className="font-medium">일일 차트 생성 현황</h3>
            </div>
            
            <div className="flex items-center gap-2">
              {isLimitReached ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              
              <Badge 
                variant={isLimitReached ? "destructive" : isNearLimit ? "secondary" : "outline"}
                className="text-xs"
              >
                {usageInfo.dailyUsage}/{usageInfo.maxDailyUsage} 사용
              </Badge>
            </div>
          </div>

          {/* 진행률 바 */}
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="h-2"
              style={{
                '--progress-background': isLimitReached 
                  ? 'hsl(0 84.2% 60.2%)' 
                  : isNearLimit 
                    ? 'hsl(38 92% 50%)' 
                    : 'hsl(221.2 83.2% 53.3%)'
              } as React.CSSProperties}
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{usageInfo.maxDailyUsage}</span>
            </div>
          </div>

          {/* 상태 메시지 */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isLimitReached 
                ? `${usageInfo.resetTime}에 초기화됩니다`
                : `${usageInfo.remainingUsage}번 더 생성 가능 (${usageInfo.resetTime} 초기화)`
              }
            </span>
          </div>

          {/* 상태별 안내 메시지 */}
          {isLimitReached && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">
                <strong>일일 한도 도달:</strong> 더 많은 차트가 필요하시면 내일 다시 시도해주세요.
              </p>
            </div>
          )}
          
          {isNearLimit && !isLimitReached && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                <strong>한도 임박:</strong> {usageInfo.remainingUsage}번의 차트 생성이 남아있습니다.
              </p>
            </div>
          )}

          {/* 개발용 리셋 버튼 */}
          {showResetButton && (
            <div className="pt-2 border-t">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleReset}
                className="w-full"
              >
                사용량 초기화 (개발용)
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ChartUsageBanner;
