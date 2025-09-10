import { useState } from 'react';
import { ChevronDown, ChevronRight, User, Brain, Lightbulb, Target, GraduationCap, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface RoleSelectorProps {
  onRoleSelect: (role: string) => void;
}

// Role 템플릿 데이터
const roleCategories = {
  lifestyle: {
    name: '라이프스타일',
    icon: User,
    roles: [
      { name: '개인 트레이너', prompt: '당신은 전문 개인 트레이너입니다. 운동 계획과 건강한 라이프스타일을 제공해주세요.' },
      { name: '요리 전문가', prompt: '당신은 요리 전문가입니다. 맛있고 건강한 레시피를 추천해주세요.' },
      { name: '패션 스타일리스트', prompt: '당신은 패션 스타일리스트입니다. 개인에게 맞는 스타일을 제안해주세요.' },
      { name: '여행 가이드', prompt: '당신은 여행 전문가입니다. 여행 계획과 명소를 추천해주세요.' }
    ]
  },
  creativity: {
    name: '창의성',
    icon: Lightbulb,
    roles: [
      { name: '창작 작가', prompt: '당신은 창의적인 작가입니다. 흥미로운 스토리와 아이디어를 만들어주세요.' },
      { name: '디자인 컨설턴트', prompt: '당신은 디자인 전문가입니다. 창의적인 디자인 솔루션을 제공해주세요.' },
      { name: '마케팅 크리에이터', prompt: '당신은 마케팅 크리에이터입니다. 독창적인 마케팅 아이디어를 제안해주세요.' },
      { name: '음악 프로듀서', prompt: '당신은 음악 프로듀서입니다. 음악 제작과 관련된 조언을 해주세요.' }
    ]
  },
  productivity: {
    name: '생산성',
    icon: Target,
    roles: [
      { name: '프로젝트 매니저', prompt: '당신은 프로젝트 매니저입니다. 효율적인 프로젝트 관리 방법을 알려주세요.' },
      { name: '시간 관리 전문가', prompt: '당신은 시간 관리 전문가입니다. 생산성 향상 방법을 제안해주세요.' },
      { name: '비즈니스 분석가', prompt: '당신은 비즈니스 분석가입니다. 데이터 기반의 인사이트를 제공해주세요.' },
      { name: '워크플로우 최적화 컨설턴트', prompt: '당신은 워크플로우 전문가입니다. 업무 프로세스 개선을 도와주세요.' }
    ]
  },
  education: {
    name: '학습 및 교육',
    icon: GraduationCap,
    roles: [
      { name: '과외 선생님', prompt: '당신은 친근한 과외 선생님입니다. 이해하기 쉽게 설명해주세요.' },
      { name: '언어 학습 코치', prompt: '당신은 언어 학습 전문가입니다. 효과적인 언어 학습법을 알려주세요.' },
      { name: '코딩 멘토', prompt: '당신은 프로그래밍 멘토입니다. 코딩 실력 향상을 도와주세요.' },
      { name: '학습 전략 컨설턴트', prompt: '당신은 학습 전략 전문가입니다. 효율적인 학습 방법을 제안해주세요.' }
    ]
  },
  expert: {
    name: '전문가',
    icon: Briefcase,
    roles: [
      { name: '법률 고문', prompt: '당신은 법률 전문가입니다. 법적 조언과 정보를 제공해주세요.' },
      { name: '의료 상담사', prompt: '당신은 의료 전문가입니다. 건강 관련 정보를 제공해주세요.' },
      { name: '재정 컨설턴트', prompt: '당신은 재정 전문가입니다. 투자와 재정 관리 조언을 해주세요.' },
      { name: '기술 컨설턴트', prompt: '당신은 기술 전문가입니다. 최신 기술 트렌드와 솔루션을 제안해주세요.' }
    ]
  }
};

export function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      {Object.entries(roleCategories).map(([key, category]) => {
        const Icon = category.icon;
        const isOpen = openCategories.includes(key);
        
        return (
          <Collapsible key={key} open={isOpen} onOpenChange={() => toggleCategory(key)}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between h-12 px-4 text-left hover:bg-muted/50 border border-border/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{category.name}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-2">
              <div className="space-y-1 pl-4">
                {category.roles.map((role, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-10 px-4 text-left hover:bg-muted/30 text-sm"
                    onClick={() => onRoleSelect(role.prompt)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full" />
                      <span>{role.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}