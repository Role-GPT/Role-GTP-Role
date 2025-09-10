import { Heart, Lightbulb, Target, GraduationCap, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { useApp } from '../src/context/AppContext';

interface RoleCategoryButtonsProps {
  onCategorySelect: (category: string, buttonPosition?: { x: number; y: number }) => void;
  isMobile?: boolean;
}

// 기본 카테고리 - state.ts의 실제 카테고리와 매칭
const categories = [
  { id: 'recommended', name: '추천', icon: Briefcase },
  { id: 'playground', name: 'Playground', icon: '🎭' },
  { id: 'lifestyle', name: '라이프 스타일', icon: Heart },
  { id: 'creativity', name: '창의성', icon: Lightbulb },
  { id: 'productivity', name: '생산성', icon: Target },
  { id: 'education', name: '학습 및 교육', icon: GraduationCap },
];

export function RoleCategoryButtons({ onCategorySelect, isMobile = false }: RoleCategoryButtonsProps) {
  const handleCategoryClick = (categoryId: string, event: React.MouseEvent) => {
    // 버튼의 위치 정보를 함께 전달
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const buttonPosition = {
      x: rect.left + rect.width / 2,
      y: rect.top
    };
    onCategorySelect(categoryId, buttonPosition);
  };
  
  if (isMobile) {
    // 모바일 레이아웃: 3+3 형태
    const firstRow = categories.slice(0, 3);
    const secondRow = categories.slice(3, 6);
    
    return (
      <div className="w-full max-w-sm mx-auto space-y-3">
        {/* 첫 번째 줄: 3개 */}
        <div className="grid grid-cols-3 gap-3">
          {firstRow.map((category) => {
            const Icon = category.icon;
            
            return (
              <Button
                key={category.id}
                variant="outline"
                className="h-12 px-3 rounded-xl bg-muted/20 hover:bg-muted/40 border-border/20 hover:border-border/40 transition-all duration-200 text-xs flex flex-col items-center justify-center gap-1"
                onClick={(e) => handleCategoryClick(category.id, e)}
              >
                {typeof Icon === 'string' ? (
                  <span className="text-base">{Icon}</span>
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span className="font-normal text-center leading-tight">{category.name}</span>
              </Button>
            );
          })}
        </div>
        
        {/* 두 번째 줄: 3개 */}
        <div className="grid grid-cols-3 gap-3">
          {secondRow.map((category) => {
            const Icon = category.icon;
            
            return (
              <Button
                key={category.id}
                variant="outline"
                className="h-12 px-3 rounded-xl bg-muted/20 hover:bg-muted/40 border-border/20 hover:border-border/40 transition-all duration-200 text-xs flex flex-col items-center justify-center gap-1"
                onClick={(e) => handleCategoryClick(category.id, e)}
              >
                {typeof Icon === 'string' ? (
                  <span className="text-base">{Icon}</span>
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span className="font-normal text-center leading-tight">{category.name}</span>
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  // 데스크톱 레이아웃 - 1줄 배치, 강화된 라운드형 테두리
  return (
    <div className="flex items-center justify-center gap-2 max-w-5xl">
      {categories.map((category) => {
        const Icon = category.icon;
        
        return (
          <Button
            key={category.id}
            variant="outline"
            className="h-9 px-3 min-w-[100px] rounded-full bg-muted/20 hover:bg-muted/40 border-2 border-border/50 hover:border-border/70 transition-all duration-200 text-sm font-normal shadow-sm hover:shadow-md"
            onClick={(e) => handleCategoryClick(category.id, e)}
          >
            {typeof Icon === 'string' ? (
              <span className="text-sm mr-1.5">{Icon}</span>
            ) : (
              <Icon className="w-3.5 h-3.5 mr-1.5" />
            )}
            <span className="truncate">{category.name}</span>
          </Button>
        );
      })}
    </div>
  );
}