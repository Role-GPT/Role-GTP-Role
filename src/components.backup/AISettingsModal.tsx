import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { X, Settings, Zap, Shield, Cpu } from 'lucide-react';
import { useApp } from '../src/context/AppContext';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  safetyLevel: string;
  streamResponse: boolean;
  useCache: boolean;
}

export function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
  const { state, updateSettings } = useApp();
  
  // AI 설정 상태
  const [aiSettings, setAiSettings] = useState<AISettings>({
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
    streamResponse: true,
    useCache: true,
  });

  // 모델 옵션
  const modelOptions = [
    { value: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: '빠르고 효율적' },
    { value: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental', description: '실험적 기능' },
    { value: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: '고급 추론' },
    { value: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: '균형잡힌 성능' },
  ];

  // 안전 수준 옵션
  const safetyOptions = [
    { value: 'BLOCK_NONE', name: '차단 안함', description: '모든 콘텐츠 허용' },
    { value: 'BLOCK_ONLY_HIGH', name: '높은 위험만', description: '매우 유해한 콘텐츠만 차단' },
    { value: 'BLOCK_MEDIUM_AND_ABOVE', name: '중간 이상 (권장)', description: '적절한 안전 수준' },
    { value: 'BLOCK_LOW_AND_ABOVE', name: '낮은 위험 이상', description: '엄격한 필터링' },
  ];

  // 설정 업데이트
  const updateAISetting = <K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    setAiSettings(prev => ({ ...prev, [key]: value }));
  };

  // 설정 저장
  const handleSave = () => {
    updateSettings({
      ai: aiSettings
    });
    onClose();
  };

  // 기본값으로 리셋
  const handleReset = () => {
    setAiSettings({
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
      streamResponse: true,
      useCache: true,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <DialogTitle className="text-xl font-medium">AI 세부 설정</DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <DialogDescription className="sr-only">
          AI 모델, 생성 매개변수, 안전 설정 등을 세밀하게 조정할 수 있습니다.
        </DialogDescription>

        <div className="space-y-6 py-4">
          {/* 모델 선택 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">모델 설정</h3>
            </div>
            
            <div className="pl-7 space-y-3">
              <div>
                <Label>AI 모델</Label>
                <Select value={aiSettings.model} onValueChange={(value) => updateAISetting('model', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{option.name}</span>
                          <span className="text-sm text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* 생성 설정 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">생성 설정</h3>
            </div>
            
            <div className="pl-7 space-y-4">
              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>창의성 (Temperature)</Label>
                  <span className="text-sm text-muted-foreground">{aiSettings.temperature.toFixed(1)}</span>
                </div>
                <Slider
                  value={[aiSettings.temperature]}
                  onValueChange={([value]) => updateAISetting('temperature', value)}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  낮을수록 일관적이고 예측 가능한 응답, 높을수록 창의적이고 다양한 응답
                </p>
              </div>

              {/* Max Tokens */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>최대 토큰 수</Label>
                  <span className="text-sm text-muted-foreground">{aiSettings.maxTokens}</span>
                </div>
                <Slider
                  value={[aiSettings.maxTokens]}
                  onValueChange={([value]) => updateAISetting('maxTokens', value)}
                  min={256}
                  max={8192}
                  step={256}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  한 번의 응답에서 생성할 수 있는 최대 토큰 수
                </p>
              </div>

              {/* Top P */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>핵심 확률 (Top P)</Label>
                  <span className="text-sm text-muted-foreground">{aiSettings.topP.toFixed(2)}</span>
                </div>
                <Slider
                  value={[aiSettings.topP]}
                  onValueChange={([value]) => updateAISetting('topP', value)}
                  min={0.1}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  낮을수록 보수적인 단어 선택, 높을수록 다양한 표현 사용
                </p>
              </div>

              {/* Frequency Penalty */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>반복 억제</Label>
                  <span className="text-sm text-muted-foreground">{aiSettings.frequencyPenalty.toFixed(2)}</span>
                </div>
                <Slider
                  value={[aiSettings.frequencyPenalty]}
                  onValueChange={([value]) => updateAISetting('frequencyPenalty', value)}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  높을수록 같은 단어 반복을 줄임
                </p>
              </div>

              {/* Presence Penalty */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>주제 다양성</Label>
                  <span className="text-sm text-muted-foreground">{aiSettings.presencePenalty.toFixed(2)}</span>
                </div>
                <Slider
                  value={[aiSettings.presencePenalty]}
                  onValueChange={([value]) => updateAISetting('presencePenalty', value)}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  높을수록 새로운 주제와 아이디어를 더 많이 탐색
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* 안전 설정 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">안전 및 기타 설정</h3>
            </div>
            
            <div className="pl-7 space-y-4">
              <div>
                <Label>안전 수준</Label>
                <Select value={aiSettings.safetyLevel} onValueChange={(value) => updateAISetting('safetyLevel', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {safetyOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{option.name}</span>
                          <span className="text-sm text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>스트리밍 응답</Label>
                  <p className="text-sm text-muted-foreground">
                    응답을 실시간으로 생성하여 보여줍니다
                  </p>
                </div>
                <Switch
                  checked={aiSettings.streamResponse}
                  onCheckedChange={(checked) => updateAISetting('streamResponse', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>캐시 사용</Label>
                  <p className="text-sm text-muted-foreground">
                    동일한 요청에 대해 더 빠른 응답을 제공합니다
                  </p>
                </div>
                <Switch
                  checked={aiSettings.useCache}
                  onCheckedChange={(checked) => updateAISetting('useCache', checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼들 */}
        <div className="flex justify-between gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            기본값으로 리셋
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSave}>
              설정 저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}