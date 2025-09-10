import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from './ui/dialog';
import { 
  Crown, 
  Check, 
  Zap, 
  Brain, 
  Bot,
  Clock,
  Shield,
  Sparkles,
  X,
  Star,
  Key,
  Infinity,
  Calendar,
  Heart
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from "sonner@2.0.3";
import { 
  redirectToCheckout, 
  getSubscriptionStatus,
  getCurrentUserId,
  PLANS,
  type SubscriptionStatus 
} from '../src/services/stripeService';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRIAL_FEATURES = [
  '1일 메시지 30건',
  '대화창 최대 10개',
  '프로젝트 폴더 최대 2개',
  'Standard & Advanced 모드',
  '3일간 무료 체험'
];

const TRIAL_LIMITATIONS = [
  'Expert 모드 사용 불가',
  'API 키 연결 불가',
  '제한된 AI 모델 액세스'
];

const BYOK_FREE_FEATURES = [
  '체험판과 동일한 제한사항',
  '자신의 API 키 사용 (BYOK)',
  'OpenAI, Anthropic, Google 등 지원',
  '영구 무료 사용',
  'Standard & Advanced 모드'
];

const PREMIUM_FEATURES = [
  '평생 무료 사용 (일회성 $9.99)',
  'BYOK (Bring Your Own Key)',
  '모든 제한사항 해제',
  'Expert 모드 사용 가능',
  'Role GPT v1.0 평생 액세스',
  '무제한 메시지',
  '무제한 대화창',
  '무제한 프로젝트',
  '모든 AI 모델 지원',
  '우선 고객지원'
];

const MONTHLY_FEATURES = [
  '월 $9.99 구독 (미구현)',
  '서비스 제공자 AI 제공',
  '모든 제한사항 해제',
  'Expert 모드 사용 가능',
  '무제한 메시지',
  '무제한 대화창',
  '무제한 프로젝트',
  '최신 AI 모델 자동 지원',
  '24/7 고객지원',
  '클라우드 동기화'
];

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const userId = getCurrentUserId();

  // 구독 상태 확인
  useEffect(() => {
    if (isOpen) {
      checkSubscriptionStatus();
    }
  }, [isOpen]);

  const checkSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      const status = await getSubscriptionStatus(userId);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('구독 상태 확인 실패:', error);
      toast.error('구독 상태를 확인할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (planType: 'standard' | 'advanced' | 'expert') => {
    try {
      setIsPurchasing(true);
      
      const plan = PLANS[planType.toUpperCase() as keyof typeof PLANS];
      if (!plan) {
        throw new Error('잘못된 플랜입니다.');
      }

      toast.info('결제 페이지로 이동합니다...');
      
      await redirectToCheckout(
        plan.priceId,
        userId,
        // 이메일이 있다면 추가 (선택적)
      );
      
    } catch (error) {
      console.error('결제 시작 실패:', error);
      toast.error('결제를 시작할 수 없습니다. 다시 시도해주세요.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        {/* 헤더 */}
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="text-center mx-auto">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-amber-500" />
                <DialogTitle className="text-2xl font-bold">Role GPT 요금제</DialogTitle>
              </div>
              <p className="text-muted-foreground">현재 체험판을 사용 중입니다 (2일 남음)</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 rounded-md p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="current">현재 상태</TabsTrigger>
              <TabsTrigger value="upgrade">업그레이드 옵션</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-6">
              {/* 현재 체험판 상태 */}
              <div className="border rounded-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">체험판 (Free Trial)</h3>
                      <Badge className="bg-green-500 text-white">현재 사용 중</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">3일간 무료로 Role GPT를 체험할 수 있습니다</p>
                    
                    {/* 사용량 표시 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                        <div className="text-sm text-muted-foreground">오늘 메시지</div>
                        <div className="text-lg font-bold">12 / 30</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '40%'}}></div>
                        </div>
                      </div>
                      <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                        <div className="text-sm text-muted-foreground">대화창</div>
                        <div className="text-lg font-bold">3 / 10</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '30%'}}></div>
                        </div>
                      </div>
                      <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                        <div className="text-sm text-muted-foreground">프로젝트</div>
                        <div className="text-lg font-bold">1 / 2</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '50%'}}></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium mb-2">포함된 기능:</h4>
                      {TRIAL_FEATURES.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 체험 종료 후 안내 */}
              <div className="border rounded-lg p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">체험 종료 후 → BYOK FREE</h3>
                    <p className="text-muted-foreground mb-4">체험판 3일 후 자동으로 BYOK FREE 플랜으로 전환됩니다</p>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium mb-2">BYOK FREE 특징:</h4>
                      {BYOK_FREE_FEATURES.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-amber-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upgrade" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Standard 플랜 */}
                <div className="border rounded-xl p-4 bg-card">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Standard</h3>
                    <div className="mb-2">
                      <span className="text-2xl font-bold">{PLANS.STANDARD.price}</span>
                      <span className="text-muted-foreground text-sm">/{PLANS.STANDARD.interval}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {PLANS.STANDARD.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                        <span className="text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    onClick={() => handlePurchase('standard')}
                    disabled={isPurchasing || isLoading}
                  >
                    {isPurchasing ? '결제 중...' : 'Standard 선택'}
                  </Button>
                </div>

                {/* Advanced 플랜 */}
                <div className="relative border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-1 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      추천
                    </Badge>
                  </div>

                  <div className="text-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mx-auto mb-3">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Advanced</h3>
                    <div className="mb-2">
                      <span className="text-2xl font-bold">{PLANS.ADVANCED.price}</span>
                      <span className="text-muted-foreground text-sm">/{PLANS.ADVANCED.interval}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {PLANS.ADVANCED.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-purple-500 mt-1 flex-shrink-0" />
                        <span className="text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full h-9 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm"
                    onClick={() => handlePurchase('advanced')}
                    disabled={isPurchasing || isLoading}
                  >
                    {isPurchasing ? '결제 중...' : 'Advanced 선택'}
                  </Button>
                </div>

                {/* Expert 플랜 */}
                <div className="border rounded-xl p-4 bg-card relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 transform rotate-12 translate-x-4 -translate-y-4 opacity-20"></div>
                  
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Expert</h3>
                    <div className="mb-2">
                      <span className="text-2xl font-bold">{PLANS.EXPERT.price}</span>
                      <span className="text-muted-foreground text-sm">/{PLANS.EXPERT.interval}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {PLANS.EXPERT.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" />
                        <span className="text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full h-9 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm"
                    onClick={() => handlePurchase('expert')}
                    disabled={isPurchasing || isLoading}
                  >
                    {isPurchasing ? '결제 중...' : 'Expert 선택'}
                  </Button>
                </div>
              </div>

              {/* 플랜 비교표 */}
              <div className="border rounded-lg p-6 bg-muted/20">
                <h3 className="text-lg font-bold mb-4 text-center">플랜 비교</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">기능</th>
                        <th className="text-center py-2">체험판</th>
                        <th className="text-center py-2">BYOK FREE</th>
                        <th className="text-center py-2">프리미엄</th>
                        <th className="text-center py-2">월정액</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      <tr className="border-b">
                        <td className="py-2">일일 메시지</td>
                        <td className="text-center py-2">30건</td>
                        <td className="text-center py-2">30건</td>
                        <td className="text-center py-2 text-green-600">무제한</td>
                        <td className="text-center py-2 text-green-600">무제한</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">대화창</td>
                        <td className="text-center py-2">최대 10개</td>
                        <td className="text-center py-2">최대 10개</td>
                        <td className="text-center py-2 text-green-600">무제한</td>
                        <td className="text-center py-2 text-green-600">무제한</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">프로젝트</td>
                        <td className="text-center py-2">최대 2개</td>
                        <td className="text-center py-2">최대 2개</td>
                        <td className="text-center py-2 text-green-600">무제한</td>
                        <td className="text-center py-2 text-green-600">무제한</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Expert 모드</td>
                        <td className="text-center py-2">❌</td>
                        <td className="text-center py-2">❌</td>
                        <td className="text-center py-2 text-green-600">✅</td>
                        <td className="text-center py-2 text-green-600">✅</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">API 키 사용</td>
                        <td className="text-center py-2">❌</td>
                        <td className="text-center py-2 text-green-600">✅</td>
                        <td className="text-center py-2 text-green-600">✅</td>
                        <td className="text-center py-2">❌</td>
                      </tr>
                      <tr>
                        <td className="py-2">사용 기간</td>
                        <td className="text-center py-2">3일</td>
                        <td className="text-center py-2 text-green-600">영구</td>
                        <td className="text-center py-2 text-green-600">��생</td>
                        <td className="text-center py-2">구독 중</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* 하단 안내 */}
        <div className="p-6 pt-0 border-t bg-muted/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
              <Shield className="w-4 h-4" />
              <span>안전한 결제 · 30일 환불 보장 · 언제든지 플랜 변경 가능</span>
            </div>
            <p className="text-xs text-muted-foreground">
              결제는 Stripe를 통해 안전하게 처리됩니다. 문의사항이 있으시면 support@rolegpt.com으로 연락주세요.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}