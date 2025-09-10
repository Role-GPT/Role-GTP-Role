/**
 * Stripe 결제 성공 페이지
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckCircle, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { getSubscriptionStatus, getCurrentUserId, type SubscriptionStatus } from '../src/services/stripeService';
import { toast } from "sonner@2.0.3";

export default function SuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userId = getCurrentUserId();

  useEffect(() => {
    if (session_id) {
      checkPaymentSuccess();
    }
  }, [session_id]);

  const checkPaymentSuccess = async () => {
    try {
      setIsLoading(true);
      
      // 결제 완료 후 서버에서 웹훅 처리 시간을 위해 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const status = await getSubscriptionStatus(userId);
      setSubscriptionStatus(status);
      
      if (status.hasSubscription) {
        toast.success('결제가 완료되었습니다! 🎉');
      }
      
    } catch (error) {
      console.error('결제 확인 실패:', error);
      toast.error('결제 상태를 확인할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
            {isLoading ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <CheckCircle className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-400">
            {isLoading ? '결제 확인 중...' : '결제 완료!'}
          </CardTitle>
          {!isLoading && (
            <p className="text-muted-foreground">
              Role GPT 구독이 성공적으로 활성화되었습니다
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {session_id && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">결제 세션 ID</p>
              <Badge variant="outline" className="font-mono text-xs">
                {session_id}
              </Badge>
            </div>
          )}

          {subscriptionStatus?.hasSubscription && subscriptionStatus.subscription && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <Crown className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-700 dark:text-green-400 mb-1">
                  구독 활성화됨
                </h3>
                <p className="text-sm text-green-600">
                  다음 결제일: {new Date(subscriptionStatus.subscription.currentPeriodEnd).toLocaleDateString('ko-KR')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {subscriptionStatus.subscription.daysRemaining}일 남음
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">이제 사용할 수 있는 기능:</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>무제한 대화 및 프로젝트</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Expert 모드 액세스</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>고급 타임라인 & 요약</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>우선 지원</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleContinue}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              <span>Role GPT 시작하기</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                구독 관리는 설정 메뉴에서 할 수 있습니다
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}