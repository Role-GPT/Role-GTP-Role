import { useState } from 'react';
import { X, Check, Crown, Zap, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'free' | 'premium'>('trial');

  if (!isOpen) return null;

  const plans = [
    {
      id: 'trial',
      name: '무료 체험',
      price: '무료',
      duration: '3일',
      description: '모든 기능을 3일간 무료로 체험',
      features: [
        '내장 Gemini API 사용',
        '프로젝트 무제한 생성',
        '커스텀 Role 무제한 생성',
        '대화창 무제한',
        '모든 Expert 모드 기능',
        '프리미엄 Role 템플릿 접근'
      ],
      current: true,
      badge: '현재 플랜'
    },
    {
      id: 'free',
      name: 'Free BYOK',
      price: '무료',
      duration: '영구',
      description: '자신의 API 키로 제한된 기능 사용',
      features: [
        '자신의 API 키 사용 (Gemini/OpenAI/Claude)',
        '프로젝트 2개 제한',
        '대화창 10개 제한',
        'Standard & Advanced 모드',
        '기본 Role 템플릿',
        '삭제 시 새로 생성 가능'
      ],
      current: false,
      badge: null
    },
    {
      id: 'premium',
      name: 'Premium BYOK',
      price: '$9.99',
      duration: '1회 결제',
      description: '모든 제한 해제된 완전한 경험',
      features: [
        '자신의 API 키 사용',
        '프로젝트 무제한 생성',
        '커스텀 Role 무제한 생성',
        '대화창 무제한',
        '모든 Expert 모드 기능',
        '프리미엄 Role 템플릿 접근',
        '우선 지원',
        '향후 모든 업데이트 포함'
      ],
      current: false,
      badge: '추천',
      popular: true
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 콘텐츠 */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-xl shadow-xl m-4">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-medium">요금제 선택</h2>
              <p className="text-muted-foreground mt-1">
                당신에게 맞는 Role GPT 플랜을 선택하세요
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 요금제 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 border rounded-xl transition-all cursor-pointer ${
                  plan.popular 
                    ? 'border-primary bg-primary/5 scale-105' 
                    : selectedPlan === plan.id
                      ? 'border-primary bg-accent/20'
                      : 'border-border hover:border-border/80'
                }`}
                onClick={() => setSelectedPlan(plan.id as any)}
              >
                {/* 배지 */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge 
                      className={`px-3 py-1 ${
                        plan.popular 
                          ? 'bg-primary text-primary-foreground' 
                          : plan.current
                            ? 'bg-green-600 text-white'
                            : 'bg-muted'
                      }`}
                    >
                      {plan.current && <Crown className="w-3 h-3 mr-1" />}
                      {plan.popular && <Star className="w-3 h-3 mr-1" />}
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                {/* 플랜 정보 */}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.duration && (
                      <span className="text-muted-foreground ml-1">/ {plan.duration}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                {/* 기능 목록 */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground/90">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* 액션 버튼 */}
                <div className="mt-auto">
                  {plan.current ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      현재 사용 중
                    </Button>
                  ) : plan.id === 'free' ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Free BYOK 플랜으로 전환
                        console.log('Switch to Free BYOK');
                      }}
                    >
                      체험 후 자동 전환
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-primary hover:bg-primary/90' 
                          : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: 결제 프로세스 시작
                        console.log('Start payment for', plan.id);
                      }}
                    >
                      {plan.popular && <Zap className="w-4 h-4 mr-2" />}
                      지금 구매하기
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 하단 정보 */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg">
            <div className="text-sm space-y-2">
              <p className="font-medium">📋 BYOK (Bring Your Own Key)란?</p>
              <p className="text-muted-foreground">
                자신의 OpenAI, Google Gemini, Anthropic Claude API 키를 사용하여 Role GPT를 이용하는 방식입니다. 
                API 비용은 각 제공업체에 직접 지불하며, Role GPT는 플랫폼 사용료만 받습니다.
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span>🔒 안전한 결제</span>
                <span>💳 1회 결제</span>
                <span>🔄 환불 보장 (7일)</span>
                <span>📞 24/7 지원</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}