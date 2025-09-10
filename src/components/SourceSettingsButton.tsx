import { useState, forwardRef } from 'react';
import { Database } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from './ui/utils';

interface SourceSettingsButtonProps {
  onClick: () => void;
  sourceModes: {
    web: boolean;
    news: boolean;
    blog: boolean;
    academic: boolean;
    business: boolean;
    culture: boolean;
    lifestyle: boolean;
  };
  className?: string;
}

interface SourceInfo {
  id: string;
  name: string;
}

export const SourceSettingsButton = forwardRef<HTMLButtonElement, SourceSettingsButtonProps>(
  ({ onClick, sourceModes, className }, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const sourceInfos: SourceInfo[] = [
    { id: 'web', name: '웹' },
    { id: 'news', name: '뉴스' },
    { id: 'blog', name: '블로그' },
    { id: 'academic', name: '학문' },
    { id: 'business', name: '비즈니스' },
    { id: 'culture', name: '문화' },
    { id: 'lifestyle', name: '라이프스타일' }
  ];

  const activeSources = sourceInfos.filter(source => 
    sourceModes[source.id as keyof typeof sourceModes]
  );

  const hasActiveSources = activeSources.length > 0;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            variant="ghost"
            size="sm"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              'w-9 h-9 p-0 rounded-lg transition-all duration-200',
              'hover:bg-accent hover:scale-105',
              hasActiveSources 
                ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                : 'text-muted-foreground hover:text-foreground',
              className
            )}
          >
            <div className="relative">
              <Database className="w-4 h-4" />
              {hasActiveSources && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
          </Button>
        </TooltipTrigger>
        
        <TooltipContent 
          side="top" 
          align="center"
          className="bg-popover border border-border shadow-lg"
        >
          <div className="space-y-1">
            <div className="text-sm font-medium">검색을 위한 소스</div>
            {hasActiveSources ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>활성화:</span>
                {activeSources.slice(0, 3).map((source, index) => (
                  <span key={source.id}>
                    {source.name}
                    {index < Math.min(activeSources.length - 1, 2) && ', '}
                  </span>
                ))}
                {activeSources.length > 3 && (
                  <span className="text-muted-foreground">외 {activeSources.length - 3}개</span>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">소스가 비활성화됨</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

SourceSettingsButton.displayName = 'SourceSettingsButton';