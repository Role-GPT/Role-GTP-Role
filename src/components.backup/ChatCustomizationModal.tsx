import { useState } from 'react';
import { X, MessageCircle, Sliders, Volume2, Eye, Clock, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';

interface ChatCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatCustomizationModal({ isOpen, onClose }: ChatCustomizationModalProps) {
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([2048]);
  const [responseLength, setResponseLength] = useState('medium');
  const [conversationStyle, setConversationStyle] = useState('balanced');
  const [enableMemory, setEnableMemory] = useState(true);
  const [enableVoice, setEnableVoice] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [customInstructions, setCustomInstructions] = useState('');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            대화 맞춤 설정
          </DialogTitle>
          <DialogDescription>
            AI 응답 스타일, 대화 기능 및 개인 맞춤 설정을 조정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI 응답 설정 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <h3 className="font-medium">AI 응답 설정</h3>
            </div>
            
            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <Label>창의성 수준 (Temperature): {temperature[0]}</Label>
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  낮을수록 일관적이고 예측 가능한 답변, 높을수록 창의적이고 다양한 답변
                </p>
              </div>

              <div className="space-y-2">
                <Label>최대 토큰 수: {maxTokens[0]}</Label>
                <Slider
                  value={maxTokens}
                  onValueChange={setMaxTokens}
                  max={4096}
                  min={256}
                  step={256}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  응답의 최대 길이를 제한합니다
                </p>
              </div>

              <div className="space-y-2">
                <Label>응답 길이 선호도</Label>
                <Select value={responseLength} onValueChange={setResponseLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">짧게 (간결한 답변)</SelectItem>
                    <SelectItem value="medium">보통 (균형잡힌 답변)</SelectItem>
                    <SelectItem value="long">길게 (상세한 답변)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>대화 스타일</Label>
                <Select value={conversationStyle} onValueChange={setConversationStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">공식적</SelectItem>
                    <SelectItem value="balanced">균형잡힌</SelectItem>
                    <SelectItem value="casual">친근한</SelectItem>
                    <SelectItem value="professional">전문적</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* 대화 기능 설정 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <h3 className="font-medium">대화 기능</h3>
            </div>
            
            <div className="space-y-4 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>대화 기록 저장</Label>
                  <p className="text-xs text-muted-foreground">이전 대화 내용을 기억합니다</p>
                </div>
                <Switch checked={enableMemory} onCheckedChange={setEnableMemory} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>음성 응답</Label>
                  <p className="text-xs text-muted-foreground">AI 응답을 음성으로 들을 수 있습니다</p>
                </div>
                <Switch checked={enableVoice} onCheckedChange={setEnableVoice} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>자동 저장</Label>
                  <p className="text-xs text-muted-foreground">대화를 자동으로 저장합니다</p>
                </div>
                <Switch checked={autoSave} onCheckedChange={setAutoSave} />
              </div>
            </div>
          </div>

          <Separator />

          {/* 커스텀 지시사항 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <h3 className="font-medium">커스텀 지시사항</h3>
            </div>
            
            <div className="pl-6">
              <Label>AI에게 특별한 지시사항이 있다면 입력하세요</Label>
              <Textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="예: 항상 한국어로 답변해 주세요. 전문 용어는 쉽게 설명해 주세요."
                className="mt-2 min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-2">
                이 지시사항은 모든 대화에 적용됩니다
              </p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={onClose}>
              설정 저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}