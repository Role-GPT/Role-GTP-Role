import { useState } from 'react';
import { ChevronDown, Bot, Settings, Sliders, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ChatControlsProps {
  onSettingsClick?: () => void;
  onCustomizationClick?: () => void;
}

// Assistant 옵션들
const assistantOptions = [
  { value: 'role-gpt', label: 'Role GPT', description: '역할 기반 AI 어시스턴트' },
  { value: 'general', label: '일반 어시스턴트', description: '범용 AI 어시스턴트' },
  { value: 'creative', label: '창의 전문가', description: '창의적 작업에 특화' },
  { value: 'analytical', label: '분석 전문가', description: '데이터 분석에 특화' },
];

export function ChatControls({ onSettingsClick, onCustomizationClick }: ChatControlsProps) {
  const [selectedAssistant, setSelectedAssistant] = useState('role-gpt');

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Assistant 선택 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bot className="h-4 w-4" />
          <span>Assistant 선택</span>
        </div>
        <div className="flex-1">
          <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
            <SelectTrigger className="w-full h-10 bg-input-background border-border/50">
              <SelectValue placeholder="Assistant를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {assistantOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 대화 맞춤 설정 */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 justify-start gap-2 h-10 bg-input-background border-border/50 hover:bg-muted/50"
          onClick={onSettingsClick}
        >
          <Settings className="h-4 w-4" />
          <span>일반 설정</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex-1 justify-start gap-2 h-10 bg-input-background border-border/50 hover:bg-muted/50"
          onClick={onCustomizationClick}
        >
          <Sliders className="h-4 w-4" />
          <span>대화 맞춤 설정</span>
        </Button>
      </div>
    </div>
  );
}