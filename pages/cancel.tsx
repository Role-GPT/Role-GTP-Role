/**
 * Stripe 결제 취소 페이지
 */

import { useRouter } from 'next/router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { XCircle, ArrowLeft, CreditCard, HelpCircle } from 'lucide-react';

export default function CancelPage() {
  const router = useRouter();

  const handleBackToApp = () => {
    router.push('/');
  };

  const handleTryAgain = () => {
    router.push('/?upgrade=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-700 dark:text-red-400">
            결제 취소됨
          </CardTitle>
          <p className="text-muted-foreground">
            결제가 취소되었습니다. 언제든지 다시 시도할 수 있습니다.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                결제가 완료되지 않았습니다
              </h3>
              <p className="text-sm text-red-600">
                현재 체험판으로 계속 사용하거나 나중에 업그레이드할 수 있습니다.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">체험판으로 계속하기:</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span>3일 무료 체험 계속 사용</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  <span>언제든지 업그레이드 가능</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleTryAgain}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              다시 업그레이드하기
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleBackToApp}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              체험판으로 계속하기
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                결제 관련 문의: support@rolegpt.com
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}