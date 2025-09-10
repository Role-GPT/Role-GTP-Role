import { Settings, Sliders } from 'lucide-react';
import { Button } from './ui/button';

interface GrokBottomActionsProps {
  onSettingsClick?: () => void;
  onCustomizationClick?: () => void;
}

export function GrokBottomActions({ onSettingsClick, onCustomizationClick }: GrokBottomActionsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-3 text-muted-foreground hover:text-foreground transition-colors"
        onClick={onSettingsClick}
      >
        <Settings className="w-4 h-4 mr-2" />
        일반 설정
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-3 text-muted-foreground hover:text-foreground transition-colors"
        onClick={onCustomizationClick}
      >
        <Sliders className="w-4 h-4 mr-2" />
        대화 맞춤 설정
      </Button>
    </div>
  );
}