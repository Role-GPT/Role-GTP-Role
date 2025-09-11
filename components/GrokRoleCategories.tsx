import { useState } from 'react';
import { ChevronDown, User, Lightbulb, Target, GraduationCap, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface GrokRoleCategoriesProps {
  onRoleSelect: (role: string) => void;
}

const roleCategories = [
  {
    id: 'lifestyle',
    name: '라이프스타일',
    icon: User,
    roles: ['개인 트레이너', '요리 전문가', '패션 스타일리스트', '여행 가이드']
  },
  {
    id: 'creativity', 
    name: '창의성',
    icon: Lightbulb,
    roles: ['창작 작가', '디자인 컨설턴트', '마케팅 크리에이터', '음악 프로듀서']
  },
  {
    id: 'productivity',
    name: '생산성', 
    icon: Target,
    roles: ['프로젝트 매니저', '시간 관리 전문가', '비즈니스 분석가', '워크플로우 컨설턴트']
  },
  {
    id: 'education',
    name: '학습 및 교육',
    icon: GraduationCap, 
    roles: ['과외 선생님', '언어 학습 코치', '코딩 멘토', '학습 전략 컨설턴트']
  },
  {
    id: 'expert',
    name: '전문가',
    icon: Briefcase,
    roles: ['법률 고문', '의료 상담사', '재정 컨설턴트', '기술 컨설턴트']
  }
];

export function GrokRoleCategories({ onRoleSelect }: GrokRoleCategoriesProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-1">
      {roleCategories.map((category) => {
        const Icon = category.icon;
        const isOpen = openCategory === category.id;
        
        return (
          <Collapsible key={category.id} open={isOpen} onOpenChange={() => toggleCategory(category.id)}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between h-8 px-3 text-sm hover:bg-muted/20 rounded-md text-muted-foreground hover:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-normal">{category.name}</span>
                </div>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-1">
              <div className="grid grid-cols-2 gap-1 pl-6 pb-2">
                {category.roles.map((role, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="h-7 px-2 text-xs justify-start hover:bg-muted/15 text-muted-foreground hover:text-foreground rounded-sm"
                    onClick={() => onRoleSelect(`당신은 ${role}입니다. 전문적인 조언을 제공해주세요.`)}
                  >
                    {role}
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
