import { useState } from 'react';
import { Paperclip, ChevronUp, ChevronDown, Bot, Sliders } from 'lucide-react';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface BottomActionBarProps {
  onRoleSelectClick?: () => void;
  onCustomizationClick?: () => void;
  onFileAttach?: () => void;
}

export function BottomActionBar({ 
  onRoleSelectClick, 
  onCustomizationClick, 
  onFileAttach 
}: BottomActionBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* 메인 바 */}
        <div className="flex items-center justify-between bg-muted/30 backdrop-blur-md border border-border/30 rounded-2xl px-6 py-2 h-10">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 hover:bg-background/20 rounded-md"
              onClick={onFileAttach}
            >
              <Paperclip className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground">파일 첨부</span>
          </div>
          
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 hover:bg-background/20 rounded-md"
            >
              <span className="text-xs text-muted-foreground mr-1">더 보기</span>
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* 펼침 메뉴 */}
        <CollapsibleContent className="mt-2">
          <div className="bg-muted/30 backdrop-blur-md border border-border/30 rounded-2xl p-3">
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 hover:bg-background/20 rounded-md flex items-center gap-1.5"
                onClick={onRoleSelectClick}
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="text-xs">Role 선택</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 hover:bg-background/20 rounded-md flex items-center gap-1.5"
                onClick={onCustomizationClick}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="text-xs">대화 맞춤 설정</span>
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}