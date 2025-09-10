import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Settings, ExternalLink } from 'lucide-react';
import { toast } from "sonner@2.0.3";
import { CategoryToggleState, ApiCategory } from '../src/types/apiLibrary';
import { getUserApiKeys, getAllTemplates } from '../src/utils/apiLibraryManager';

interface CategoryToggleBarProps {
  onToggleChange: (category: ApiCategory, enabled: boolean) => void;
  onSettingsClick: (category: ApiCategory) => void;
  className?: string;
}

const TOGGLE_CATEGORIES = [
  { 
    key: 'search' as ApiCategory, 
    label: '웹', 
    icon: '🌐', 
    description: '웹 검색, 뉴스, 블로그'
  },
  { 
    key: 'academic' as ApiCategory, 
    label: '학문', 
    icon: '🎓', 
    description: '논문, 의학, 과학 연구'
  },
  { 
    key: 'finance' as ApiCategory, 
    label: '비즈', 
    icon: '💼', 
    description: '주식, 경제, 기업 정보'
  },
  { 
    key: 'media' as ApiCategory, 
    label: '문화', 
    icon: '🎭', 
    description: '영화, 음악, 이미지'
  },
  { 
    key: 'lifestyle' as ApiCategory, 
    label: '라이프스타일', 
    icon: '🏠', 
    description: '날씨, 생활 정보'
  },
  { 
    key: 'media' as ApiCategory, 
    label: '이미지', 
    icon: '🖼', 
    description: '이미지 생성 및 검색',
    isImageGeneration: true
  }
];

export function CategoryToggleBar({ 
  onToggleChange, 
  onSettingsClick, 
  className = '' 
}: CategoryToggleBarProps) {
  const [toggleStates, setToggleStates] = useState<CategoryToggleState>({
    search: false,
    academic: false,
    finance: false,
    media: false,
    social: false,
    lifestyle: false,
    image: false
  });

  const [usageCounts, setUsageCounts] = useState<Record<string, { used: number; limit: number }>>({});

  // 사용자 키 및 사용량 정보 로드
  useEffect(() => {
    loadUsageInfo();
  }, []);

  const loadUsageInfo = () => {
    const userKeys = getUserApiKeys();
    const templates = getAllTemplates();
    
    // 각 카테고리별 사용 가능한 API 수 계산
    const counts: Record<string, { used: number; limit: number }> = {};
    
    TOGGLE_CATEGORIES.forEach(category => {
      const categoryTemplates = templates.filter(t => 
        t.category === category.key && (t.keyless || userKeys[t.id])
      );
      
      // 임시로 사용량 계산 (실제로는 localStorage에서 오늘 사용량 가져와야 함)
      const usedToday = Math.floor(Math.random() * 10); // 임시 데이터
      const limit = category.isImageGeneration ? 10 : 20;
      
      counts[category.key] = {
        used: usedToday,
        limit: limit
      };
    });
    
    setUsageCounts(counts);
  };

  const handleToggle = (category: ApiCategory) => {
    const newState = !toggleStates[category];
    
    setToggleStates(prev => ({
      ...prev,
      [category]: newState
    }));
    
    onToggleChange(category, newState);
    
    if (newState) {
      toast.success(`${TOGGLE_CATEGORIES.find(c => c.key === category)?.label} 기능이 활성화되었습니다.`);
    }
  };

  const getToggleVariant = (category: ApiCategory) => {
    if (toggleStates[category]) {
      return 'default';
    }
    return 'outline';
  };

  const getUsageInfo = (categoryKey: string) => {
    const usage = usageCounts[categoryKey];
    if (!usage) return null;
    
    return `${usage.used}/${usage.limit}`;
  };

  const hasConnectedKeys = (categoryKey: ApiCategory) => {
    const userKeys = getUserApiKeys();
    const templates = getAllTemplates();
    
    return templates.some(t => 
      t.category === categoryKey && (t.keyless || userKeys[t.id])
    );
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {TOGGLE_CATEGORIES.map(category => {
        const isActive = toggleStates[category.key];
        const hasKeys = hasConnectedKeys(category.key);
        const usage = getUsageInfo(category.key);
        
        return (
          <div key={category.key} className="flex flex-col items-center">
            <Button
              variant={getToggleVariant(category.key)}
              size="sm"
              onClick={() => handleToggle(category.key)}
              disabled={!hasKeys}
              className="relative"
            >
              <span className="mr-1">{category.icon}</span>
              <span className="hidden sm:inline">{category.label}</span>
              
              {/* 활성 상태 표시 */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </Button>
            
            {/* 사용량 표시 */}
            <div className="flex items-center gap-1 mt-1">
              {usage && (
                <span className="text-xs text-muted-foreground">
                  체험 {usage}
                </span>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSettingsClick(category.key)}
                className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
              >
                [키 연결]
              </Button>
            </div>
          </div>
        );
      })}
      
      {/* 전체 설정 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSettingsClick('search')} // 기본적으로 첫 번째 카테고리로
        className="ml-2"
      >
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  );
}

/**
 * 간단한 토글 버튼 (모바일용)
 */
export function SimpleCategoryToggle({ 
  category, 
  isActive, 
  onToggle, 
  onSettingsClick 
}: {
  category: { key: ApiCategory; label: string; icon: string };
  isActive: boolean;
  onToggle: () => void;
  onSettingsClick: () => void;
}) {
  const userKeys = getUserApiKeys();
  const templates = getAllTemplates();
  
  const hasKeys = templates.some(t => 
    t.category === category.key && (t.keyless || userKeys[t.id])
  );
  
  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant={isActive ? 'default' : 'outline'}
        size="sm"
        onClick={onToggle}
        disabled={!hasKeys}
        className="relative w-12 h-12 p-0"
      >
        <span className="text-lg">{category.icon}</span>
        {isActive && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
        )}
      </Button>
      
      <span className="text-xs text-center">{category.label}</span>
      
      {!hasKeys && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettingsClick}
          className="h-auto p-1 text-xs text-muted-foreground"
        >
          키 연결
        </Button>
      )}
    </div>
  );
}