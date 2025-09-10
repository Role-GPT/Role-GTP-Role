/**
 * 이미지 생성 모달 (컴팩트 버전)
 * 
 * 간소화된 UI로 빠른 이미지 생성 지원
 * - Google 다중 모델 지원
 * - 컴팩트한 Provider 선택
 * - 개선된 오류 처리
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { toast } from "sonner@2.0.3";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Plus, Download, Copy, RotateCcw, ExternalLink, Settings, Trash2 } from 'lucide-react';
import { 
  generateImage, 
  getAvailableProviders, 
  getDailyUsage, 
  getImageHistory, 
  addToImageHistory,
  clearImageHistory,
  ImageGenerationRequest,
  ImageGenerationResult,
  ImageHistoryItem 
} from '../src/services/imageGenerationService';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSettings: any;
  onImageGenerated?: (result: ImageGenerationResult) => void;
}

// 컴팩트한 사이즈 프리셋
const SIZES = [
  { id: '512x512', name: '512×512' },
  { id: '1024x1024', name: '1024×1024' },
  { id: '1792x1024', name: '1792×1024' },
  { id: '1024x1792', name: '1024×1792' }
];

const STYLES = [
  { id: 'natural', name: '자연스러운' },
  { id: 'vivid', name: '생생한' },
  { id: 'artistic', name: '예술적' }
];

export function ImageGenerationModal({ isOpen, onClose, userSettings, onImageGenerated }: ImageGenerationModalProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [selectedStyle, setSelectedStyle] = useState('natural');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('generate');
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [generatedImage, setGeneratedImage] = useState<ImageGenerationResult | null>(null);

  const availableProviders = getAvailableProviders(userSettings);
  const dailyUsage = getDailyUsage();

  useEffect(() => {
    if (isOpen) {
      setHistory(getImageHistory());
      
      // 기본 Provider 설정 (BYOK 우선, 없으면 무료)
      const preferredProvider = availableProviders.find(p => p.isAvailable && p.type === 'byok') 
                               || availableProviders.find(p => p.isAvailable);
      if (preferredProvider) {
        setSelectedProvider(preferredProvider.id);
      }
    }
  }, [isOpen, availableProviders]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('이미지 설명을 입력해주세요.');
      return;
    }

    const provider = availableProviders.find(p => p.id === selectedProvider);
    if (!provider?.isAvailable) {
      toast.error('선택된 서비스를 사용할 수 없습니다. API 키를 확인해주세요.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedImage(null);

    try {
      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 800);

      const request: ImageGenerationRequest = {
        prompt: prompt.trim(),
        size: selectedSize as any,
        style: selectedStyle as any,
        provider: selectedProvider
      };

      const result = await generateImage(request, userSettings);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);

      addToImageHistory(result);
      setHistory(getImageHistory());
      setGeneratedImage(result);
      setActiveTab('result');

      if (onImageGenerated) {
        onImageGenerated(result);
      }

      toast.success('이미지가 생성되었습니다! 🎨');

    } catch (error) {
      console.error('이미지 생성 실패:', error);
      setGenerationProgress(0);
      
      if (error instanceof Error) {
        if (error.message.includes('실패했습니다') || error.message.includes('한도')) {
          toast.error('Error: 더 나은 이미지 품질과 무제한 생성을 원하시나요?', {
            action: {
              label: '업그레이드',
              onClick: () => {
                onClose();
                // 설정 모달로 이동하여 API 키 입력 유도
              }
            },
            duration: 5000
          });
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else {
        toast.error('Error: 이미지 생성 중 오류가 발생했습니다.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string, prompt: string) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `generated_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('이미지가 다운로드되었습니다.');
    } catch (error) {
      toast.error('다운로드에 실패했습니다.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              🎨 이미지 생성
            </span>
          </DialogTitle>
          <DialogDescription>
            AI를 사용하여 텍스트 설명으로부터 이미지를 생성합니다.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">생성</TabsTrigger>
            <TabsTrigger value="result">결과</TabsTrigger>
            <TabsTrigger value="history">히스토리</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 mt-4">
            {/* Provider 선택 */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                이미지 생성 서비스 선택
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableProviders.map((provider) => (
                  <Card 
                    key={provider.id}
                    className={`cursor-pointer transition-all border-2 ${
                      selectedProvider === provider.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    } ${!provider.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => provider.isAvailable && setSelectedProvider(provider.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-sm">{provider.name}</div>
                        <Badge variant={provider.type === 'free' ? 'default' : 'outline'} className="text-xs">
                          {provider.type === 'free' ? '무료' : 'BYOK'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{provider.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 프롬프트 입력 */}
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-sm text-muted-foreground">
                생성하고 싶은 이미지를 설명해주세요
              </Label>
              <Textarea
                id="prompt"
                placeholder="예: 아름다운 일몰이 있는 산 풍경, 고화질, 사실적"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* 옵션 설정 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">해상도</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">스타일</Label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        {style.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 생성 버튼 */}
            <div className="space-y-3">
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>생성 중...</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} />
                </div>
              )}
              
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || !selectedProvider}
                className="w-full h-11"
                size="lg"
              >
                {isGenerating ? '생성 중...' : '🎨 이미지 생성'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="result" className="space-y-4 mt-4">
            {generatedImage ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <ImageWithFallback
                    src={generatedImage.imageUrl}
                    alt={generatedImage.prompt}
                    className="max-w-full h-auto rounded-lg border"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                  <span>Provider: {generatedImage.provider}</span>
                  <span>크기: {generatedImage.size}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleDownload(generatedImage.imageUrl, generatedImage.prompt)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    다운로드
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedImage.imageUrl);
                      toast.success('URL이 복사되었습니다.');
                    }}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    URL 복사
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    setPrompt(generatedImage.prompt);
                    setActiveTab('generate');
                  }}
                  variant="outline"
                  className="w-full gap-2"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  다시 생성
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-2">🖼️</div>
                <p>생성된 이미지가 없습니다</p>
                <Button
                  onClick={() => setActiveTab('generate')}
                  variant="outline"
                  className="mt-4"
                  size="sm"
                >
                  이미지 생성하기
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">생성 히스토리</h4>
              {history.length > 0 && (
                <Button 
                  onClick={() => {
                    clearImageHistory();
                    setHistory([]);
                    toast.success('히스토리가 삭제되었습니다.');
                  }} 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  전체 삭제
                </Button>
              )}
            </div>

            {history.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {history.slice(0, 12).map((item) => (
                  <Card key={item.id} className="cursor-pointer hover:bg-accent transition-colors group">
                    <CardContent className="p-2">
                      <div className="aspect-square mb-2">
                        <ImageWithFallback
                          src={item.imageUrl}
                          alt={item.prompt}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                        {item.prompt}
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {item.provider}
                        </Badge>
                        <Button
                          onClick={() => {
                            setPrompt(item.prompt);
                            setActiveTab('generate');
                          }}
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-2">📸</div>
                <p>히스토리가 없습니다</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}