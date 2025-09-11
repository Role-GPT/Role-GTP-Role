import { useState } from 'react';
import { AlertTriangle, Info, Lightbulb } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Mode, 
  Decision, 
  CrossModeGuardConfig, 
  ModeComparisonResult 
} from '../src/types';
import { 
  compareModes, 
  getModeLabel, 
  crossModeGuardMessages, 
  interpolateMessage 
} from '../src/utils/crossModeGuard';

interface CrossModeGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CrossModeGuardConfig;
  onDecision: (decision: Decision) => void;
}

export function CrossModeGuardModal({ 
  isOpen, 
  onClose, 
  config, 
  onDecision 
}: CrossModeGuardModalProps) {
  const { chatMode, roleMode, roleName, lang = 'ko' } = config;
  const [isProcessing, setIsProcessing] = useState(false);
  
  const comparison = compareModes(chatMode, roleMode);
  const messages = crossModeGuardMessages[lang];
  
  // 모드 라벨
  const chatLabel = getModeLabel(chatMode, lang);
  const roleLabel = getModeLabel(roleMode, lang);
  
  // 메시지 값
  const values = { chat: chatLabel, role: roleLabel };

  const handleDecision = async (decision: Decision) => {
    setIsProcessing(true);
    try {
      onDecision(decision);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  // 아이콘 선택
  const getIcon = () => {
    switch (comparison) {
      case 'same':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'chatLower':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'chatHigher':
        return <Lightbulb className="h-5 w-5 text-green-500" />;
    }
  };

  // 단순 알림 메시지로 변경
  const getTitle = () => {
    return "Role 선택 알림";
  };

  const getBody = () => {
    if (comparison === 'same') {
      return `현재 대화창과 Role이 모두 ${chatLabel} 모드로 설정되어 있습니다.`;
    } else if (comparison === 'chatLower') {
      return `현재 대화창은 ${chatLabel} 모드이지만, 선택한 Role은 ${roleLabel} 모드로 작성되었습니다.\n대화는 현재 ${chatLabel} 모드 기준으로 진행됩니다.`;
    } else {
      return `현재 대화창은 ${chatLabel} 모드이고, 선택한 Role은 ${roleLabel} 모드로 작성되었습니다.\n대화는 현재 ${chatLabel} 모드 기준으로 진행됩니다.`;
    }
  };

  // 단순 알림 형태로 변경 - 모든 경우에 확인 버튼만 표시
  const renderButtons = () => {
    return (
      <Button 
        onClick={() => handleDecision({ type: 'proceed' })}
        disabled={isProcessing}
        className="w-full"
      >
        확인
      </Button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              {/* Role 정보 */}
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{roleName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {chatLabel} 대화창
                    </Badge>
                    <span className="text-muted-foreground text-xs">→</span>
                    <Badge 
                      variant={comparison === 'chatLower' ? 'default' : 'outline'} 
                      className="text-xs"
                    >
                      {roleLabel} Role
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* 메시지 본문 */}
              <div className="text-sm text-foreground whitespace-pre-line">
                {getBody()}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col gap-2">
          {renderButtons()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
