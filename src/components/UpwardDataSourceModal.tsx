import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Switch } from './ui/switch';
import { toast } from "sonner@2.0.3";
import { cn } from './ui/utils';

interface UpwardDataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceModes: {
    web: boolean;
    news: boolean;
    blog: boolean;
    academic: boolean;
    business: boolean;
    culture: boolean;
    lifestyle: boolean;
  };
  onSourceChange: (source: string, enabled: boolean) => void;
  isAdmin?: boolean;
  triggerRef?: React.RefObject<HTMLElement>;
}

interface SourceConfig {
  id: string;
  name: string;
}

export function UpwardDataSourceModal({ 
  isOpen, 
  onClose, 
  sourceModes, 
  onSourceChange,
  isAdmin = false,
  triggerRef
}: UpwardDataSourceModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  // 데이터 소스 설정 (네이버 통합 버전)
  const sourceConfigs: SourceConfig[] = [
    {
      id: 'web',
      name: '웹'
    },
    {
      id: 'news',
      name: '뉴스'
    },
    {
      id: 'blog',
      name: '블로그'
    },
    {
      id: 'academic',
      name: '학문'
    },
    {
      id: 'business',
      name: '비즈니스'
    },
    {
      id: 'culture',
      name: '문화'
    },
    {
      id: 'lifestyle',
      name: '라이프스타일'
    }
  ];

  const handleSourceToggle = (sourceId: string, enabled: boolean, config: SourceConfig) => {
    onSourceChange(sourceId, enabled);
    toast.success(`${config.name} 소스가 ${enabled ? '활성화' : '비활성화'}되었습니다.`);
  };

  // 모달 위치 계산 (카테고리 모달 스타일)
  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      
      setPosition({
        top: triggerRect.top - 20, // 버튼 위로 올라가도록
        left: triggerRect.left + (triggerRect.width / 2) // 버튼 중앙 기준
      });
    }
  }, [isOpen, triggerRef]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-transparent" 
        onClick={onClose} 
      />
      
      {/* Compact Dropdown - 버튼 위치에 표시 */}
      <div 
        className="fixed z-50"
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
          transform: 'translateX(-50%) translateY(-100%)'
        }}
      >
        <div 
          ref={modalRef}
          className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl p-2 min-w-[280px] max-w-[320px]"
        >
          {/* 헤더 */}
          <div className="px-3 py-2 border-b border-border/30">
            <h3 className="text-sm font-medium text-foreground/90">검색을 위한 소스</h3>
          </div>
          
          {/* 소스 목록 */}
          <div className="space-y-1 py-1">
            {sourceConfigs.map((config) => (
              <div
                key={config.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground/90">
                    {config.name}
                  </span>
                </div>
                
                <Switch
                  checked={sourceModes[config.id as keyof typeof sourceModes]}
                  onCheckedChange={(checked) => handleSourceToggle(config.id, checked, config)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}