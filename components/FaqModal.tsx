import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from './ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  ExternalLink,
  Bot,
  CreditCard,
  Shield,
  Settings,
  Sparkles,
  X
} from 'lucide-react';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQ_CATEGORIES = [
  {
    id: 'general',
    name: '일반',
    icon: HelpCircle,
    questions: [
      {
        id: 'what-is-role-gpt',
        question: 'Role GPT는 무엇인가요?',
        answer: 'Role GPT는 다양한 전문 역할을 수행할 수 있는 AI 어시스턴트입니다. 작가, 개발자, 마케터, 교사 등 24개 이상의 전문 Role 템플릿을 제공하여 각 분야에 특화된 도움을 받을 수 있습니다.'
      },
      {
        id: 'how-to-start',
        question: '어떻게 시작하나요?',
        answer: '1. 원하는 Role을 선택하거나 새로운 채팅을 시작합니다.\n2. 질문이나 요청사항을 입력합니다.\n3. AI가 선택한 Role에 맞춰 전문적인 답변을 제공합니다.\n\n무료 계정으로도 기본 기능을 사용할 수 있습니다.'
      },
      {
        id: 'free-vs-paid',
        question: '무료 버전과 유료 버전의 차이점은 무엇인가요?',
        answer: '**무료 버전:**\n- GPT-3.5 제한적 사용\n- 일일 20회 대화 제한\n- 기본 Role 템플릿 5개\n\n**Plus 버전 ($20/월):**\n- GPT-4 무제한 사용\n- 무제한 대화\n- 모든 Role 템플릿 (24개+)\n- 음성 AI 지원\n- 프로젝트 관리 기능'
      }
    ]
  },
  {
    id: 'features',
    name: '기능',
    icon: Sparkles,
    questions: [
      {
        id: 'role-templates',
        question: 'Role 템플릿은 어떤 것들이 있나요?',
        answer: '현재 24개 이상의 전문 Role을 제공합니다:\n\n**창작 분야:** 작가, 시나리오 작가, 콘텐츠 크리에이터\n**기술 분야:** 개발자, 데이터 분석가, UI/UX 디자이너\n**비즈니스:** 마케터, 전략 기획자, 프로젝트 매니저\n**교육:** 교사, 연구원, 학습 코치\n**기타:** 번역가, 상담사, 요리 전문가 등'
      },
      {
        id: 'voice-features',
        question: '음성 기능은 어떻게 사용하나요?',
        answer: 'Plus 이상 구독자는 음성 기능을 사용할 수 있습니다:\n\n1. **음성 입력:** 마이크 버튼을 클릭하여 음성으로 질문\n2. **음성 출력:** AI 답변을 음성으로 들을 수 있음\n3. **다국어 지원:** 한국어, 영어, 일본어, 스페인어, 포르투갈어, 힌디어\n\n설정에서 음성 속도와 음색을 조절할 수 있습니다.'
      },
      {
        id: 'project-management',
        question: '프로젝트 관리 기능이란 무엇인가요?',
        answer: '프로젝트 기능을 통해 관련된 채팅들을 체계적으로 관리할 수 있습니다:\n\n- **채팅 그룹화:** 관련 대화들을 프로젝트별로 묶어 관리\n- **프로젝트 노트:** 중요한 정보와 가이드라인 저장\n- **협업:** 팀 멤버들과 프로젝트 공유 (Pro 플랜)\n- **내보내기:** 전체 프로젝트를 다양한 형식으로 내보내기'
      }
    ]
  },
  {
    id: 'billing',
    name: '결제 & 구독',
    icon: CreditCard,
    questions: [
      {
        id: 'payment-methods',
        question: '어떤 결제 방법을 지원하나요?',
        answer: '안전하고 편리한 결제를 위해 Stripe를 통해 다음 결제 방법을 지원합니다:\n\n- **신용카드:** Visa, Mastercard, American Express\n- **직불카드:** 대부분의 국가 직불카드\n- **디지털 지갑:** Apple Pay, Google Pay\n- **은행 계좌:** 일부 국가에서 직접 계좌 이체\n\n모든 결제 정보는 PCI DSS 준수 환경에서 안전하게 처리됩니다.'
      },
      {
        id: 'refund-policy',
        question: '환불 정책은 어떻게 되나요?',
        answer: '**30일 환불 보장:**\n- 구독 후 30일 이내 100% 환불 가능\n- 사용량에 관계없이 전액 환불\n- 환불 요청은 고객지원팀에 연락\n\n**구독 취소:**\n- 언제든지 구독 취소 가능\n- 취소 후에도 결제 기간 종료까지 서비스 이용 가능\n- 자동 갱신 없음'
      },
      {
        id: 'upgrade-downgrade',
        question: '플랜 변경은 어떻게 하나요?',
        answer: '**업그레이드:**\n- 즉시 적용되며 차액만 결제\n- 기존 사용 기간은 새 플랜에 포함\n\n**다운그레이드:**\n- 다음 청구 주기부터 적용\n- 현재 기간 동안은 기존 플랜 혜택 유지\n\n설정 > 계정 > 구독 관리에서 변경할 수 있습니다.'
      }
    ]
  },
  {
    id: 'technical',
    name: '기술 지원',
    icon: Settings,
    questions: [
      {
        id: 'api-integration',
        question: 'API는 어떻게 설정하나요?',
        answer: 'Role GPT는 다양한 AI 제공업체의 API를 지원합니다:\n\n**지원 제공업체:**\n- OpenAI (GPT-4, GPT-3.5)\n- Anthropic (Claude)\n- Google (Gemini)\n- OpenRouter, Groq, xAI\n\n**설정 방법:**\n1. 설정 > API 키 탭 이동\n2. 원하는 제공업체 선택\n3. API 키 입력 및 엔드포인트 설정\n4. 모델 선택 및 활성화'
      },
      {
        id: 'data-privacy',
        question: '데이터는 어떻게 보호되나요?',
        answer: '**데이터 보안:**\n- 모든 데이터는 암호화되어 전송 및 저장\n- 개인정보는 GDPR 및 CCPA 준수\n- 정기적인 보안 감사 실시\n\n**데이터 사용:**\n- 대화 내용은 AI 모델 학습에 사용되지 않음\n- 사용자 동의 없이 제3자와 공유하지 않음\n- 언제든지 데이터 삭제 요청 가능'
      },
      {
        id: 'troubleshooting',
        question: '문제가 발생했을 때는 어떻게 하나요?',
        answer: '**일반적인 해결 방법:**\n\n1. **새로고침:** 브라우저 새로고침 시도\n2. **캐시 삭제:** 브라우저 캐시 및 쿠키 삭제\n3. **다른 브라우저:** Chrome, Firefox, Safari 등 다른 브라우저 사용\n\n**지속적인 문제:**\n- 고객지원팀에 문의 (support@rolegpt.com)\n- 디스코드 커뮤니티 참여\n- FAQ에서 유사한 문제 검색'
      }
    ]
  }
];

export function FaqModal({ isOpen, onClose }: FaqModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');

  const filteredQuestions = FAQ_CATEGORIES.find(cat => cat.id === selectedCategory)?.questions.filter(
    q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
         q.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0">
        {/* 헤더 */}
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <HelpCircle className="w-6 h-6 text-blue-500" />
                자주 묻는 질문 (FAQ)
              </DialogTitle>
              <DialogDescription>
                Role GPT 사용에 대한 궁금한 점을 해결해보세요
              </DialogDescription>
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

        <div className="flex h-[600px]">
          {/* 사이드바 - 카테고리 */}
          <div className="w-64 border-r bg-muted/20 p-4">
            <div className="space-y-2">
              {FAQ_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start h-10"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {category.name}
                  </Button>
                );
              })}
            </div>

            {/* 연락처 */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium text-sm mb-2">추가 도움이 필요하신가요?</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start h-8">
                  <MessageCircle className="w-3 h-3 mr-2" />
                  라이브 채팅
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-8">
                  <ExternalLink className="w-3 h-3 mr-2" />
                  커뮤니티
                </Button>
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1 flex flex-col">
            {/* 검색 */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="질문 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* FAQ 리스트 */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-lg">
                  {FAQ_CATEGORIES.find(cat => cat.id === selectedCategory)?.name} 
                  <span className="text-muted-foreground ml-2">
                    ({filteredQuestions.length}개 질문)
                  </span>
                </h3>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {filteredQuestions.map((question) => (
                  <AccordionItem key={question.id} value={question.id}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      {question.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground whitespace-pre-line">
                      {question.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredQuestions.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">검색 결과가 없습니다</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    다른 키워드로 검색하거나 고객지원팀에 문의해주세요.
                  </p>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    고객지원 문의
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
