/**
 * 이미지 생성 설정 컴포넌트 (컴팩트 버전)
 * 
 * - Google 다중 모델 지원
 * - 컴팩트한 UI
 * - 업그레이드 유도 메시지
 * - 사용자 정의 Provider 추가 지원
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Eye, EyeOff, TestTube, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from "sonner@2.0.3";
import { 
  getAvailableProviders, 
  generateImage,
  ImageGenerationRequest
} from '../src/services/imageGenerationService';

interface ImageGenerationSettingsProps {
  userSettings: any;
  apiKeys: Record<string, any>;
  onUpdateSettings: (updates: any) => void;
  onUpdateApiKeys: (updates: Record<string, any>) => void;
}

// 컴팩트한 Provider 설정
const CORE_PROVIDERS = [
  {
    id: 'craiyon',
    name: 'Craiyon',
    description: '무료 체험',
    type: 'free' as const,
    testable: false // 테스트 버튼 제거
  },
  {
    id: 'dalle',
    name: 'DALL-E 3',
    description: 'OpenAI 고품질',
    type: 'byok' as const,
    apiKeyField: 'openai',
    testable: true
  }
];

// Google 모델들 (동일한 키로 여러 모델)
const GOOGLE_MODELS = [
  { id: 'imagen-3', name: 'Imagen 3.0', description: '최신 모델' },
  { id: 'imagen-2', name: 'Imagen 2.0', description: '표준 모델' },
  { id: 'gemini-2.5-flash-image', name: 'Gemini Flash Image', description: '빠른 생성' }
];

const OTHER_PROVIDERS = [
  {
    id: 'huggingface',
    name: 'Stable Diffusion',
    description: 'HuggingFace 오픈소스',
    type: 'byok' as const,
    apiKeyField: 'huggingface',
    testable: true
  }
];

export function ImageGenerationSettings({ 
  userSettings, 
  apiKeys, 
  onUpdateSettings, 
  onUpdateApiKeys 
}: ImageGenerationSettingsProps) {
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | null>>({});
  const [selectedGoogleModels, setSelectedGoogleModels] = useState<string[]>(
    userSettings.imageGeneration?.googleModels || ['imagen-3']
  );
  const [addingCustomProvider, setAddingCustomProvider] = useState(false);
  const [customProvider, setCustomProvider] = useState({
    name: '',
    endpoint: '',
    apiKey: ''
  });

  const currentImageSettings = userSettings.imageGeneration || {
    defaultSize: '1024x1024',
    defaultStyle: 'natural'
  };

  // API 키 토글
  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  // API 키 업데이트
  const updateApiKey = (field: string, value: string) => {
    onUpdateApiKeys({
      ...apiKeys,
      [field]: value
    });
  };

  // Google 모델 토글
  const toggleGoogleModel = (modelId: string) => {
    const newModels = selectedGoogleModels.includes(modelId)
      ? selectedGoogleModels.filter(id => id !== modelId)
      : [...selectedGoogleModels, modelId];
    
    setSelectedGoogleModels(newModels);
    updateImageSettings({ googleModels: newModels });
  };

  // Provider 테스트
  const testProvider = async (providerId: string) => {
    if (testingProvider) return;
    
    setTestingProvider(providerId);
    setTestResults(prev => ({ ...prev, [providerId]: null }));

    try {
      const request: ImageGenerationRequest = {
        prompt: "test image generation",
        size: '512x512',
        provider: providerId
      };

      await generateImage(request, { apiKeys });
      
      setTestResults(prev => ({ ...prev, [providerId]: 'success' }));
      toast.success('API 연결 테스트 성공!');
    } catch (error) {
      console.error(`${providerId} 테스트 실패:`, error);
      setTestResults(prev => ({ ...prev, [providerId]: 'error' }));
      toast.error('API 연결 테스트 실패');
    } finally {
      setTestingProvider(null);
    }
  };

  // 설정 업데이트
  const updateImageSettings = (updates: any) => {
    onUpdateSettings({
      ...userSettings,
      imageGeneration: {
        ...currentImageSettings,
        ...updates
      }
    });
  };

  // 커스텀 Provider 추가
  const addCustomProvider = () => {
    if (!customProvider.name || !customProvider.endpoint) {
      toast.error('Provider 이름과 엔드포인트를 입력해주세요.');
      return;
    }

    const customProviders = userSettings.customImageProviders || [];
    const newProvider = {
      id: `custom_${Date.now()}`,
      ...customProvider,
      type: 'byok',
      description: '사용자 정의'
    };

    updateImageSettings({
      customImageProviders: [...customProviders, newProvider]
    });

    setCustomProvider({ name: '', endpoint: '', apiKey: '' });
    setAddingCustomProvider(false);
    toast.success('사용자 정의 Provider가 추가되었습니다.');
  };

  const hasGoogleKey = !!apiKeys.google_gemini;

  return (
    <div className="space-y-4">
      {/* 기본 설정 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">기본 해상도</Label>
          <Select 
            value={currentImageSettings.defaultSize} 
            onValueChange={(value) => updateImageSettings({ defaultSize: value })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="512x512">512×512</SelectItem>
              <SelectItem value="1024x1024">1024×1024</SelectItem>
              <SelectItem value="1792x1024">1792×1024</SelectItem>
              <SelectItem value="1024x1792">1024×1792</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">기본 스타일</Label>
          <Select 
            value={currentImageSettings.defaultStyle} 
            onValueChange={(value) => updateImageSettings({ defaultStyle: value })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="natural">자연스러운</SelectItem>
              <SelectItem value="vivid">생생한</SelectItem>
              <SelectItem value="artistic">예술적</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Provider 관리 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">이미지 생성 서비스</h4>
          <Button
            onClick={() => setAddingCustomProvider(true)}
            variant="outline"
            size="sm"
            className="gap-2 h-8"
          >
            <Plus className="w-3 h-3" />
            추가
          </Button>
        </div>

        <div className="space-y-3">
          {/* 무료 체험 */}
          {CORE_PROVIDERS.filter(p => p.type === 'free').map((provider) => (
            <Card key={provider.id} className="border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{provider.name}</span>
                      <Badge variant="default" className="text-xs">무료</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{provider.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* BYOK Provider들 */}
          {CORE_PROVIDERS.filter(p => p.type === 'byok').map((provider) => {
            const hasKey = provider.apiKeyField ? !!apiKeys[provider.apiKeyField] : false;
            const testResult = testResults[provider.id];

            return (
              <Card key={provider.id} className="border">
                <CardContent className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{provider.name}</span>
                        <Badge variant="outline" className="text-xs">BYOK</Badge>
                        {hasKey && (
                          <Badge variant="outline" className="text-xs text-green-600">연결됨</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{provider.description}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {testResult === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {testResult === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                      
                      {provider.testable && hasKey && (
                        <Button
                          onClick={() => testProvider(provider.id)}
                          disabled={testingProvider === provider.id}
                          variant="outline"
                          size="sm"
                          className="h-7 px-2"
                        >
                          {testingProvider === provider.id ? '테스트중' : (
                            <>
                              <TestTube className="w-3 h-3 mr-1" />
                              테스트
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {provider.apiKeyField && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        API 키를 입력하여 {provider.name} 사용하기
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type={showApiKeys[provider.id] ? 'text' : 'password'}
                          value={apiKeys[provider.apiKeyField] || ''}
                          onChange={(e) => updateApiKey(provider.apiKeyField!, e.target.value)}
                          placeholder="API 키 입력"
                          className="text-sm h-8"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => toggleApiKeyVisibility(provider.id)}
                          className="h-8 w-8 p-0"
                        >
                          {showApiKeys[provider.id] ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Google 모델들 */}
          <Card className="border">
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Google 모델들</span>
                    <Badge variant="outline" className="text-xs">BYOK</Badge>
                    {hasGoogleKey && (
                      <Badge variant="outline" className="text-xs text-green-600">연결됨</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Google 다중 이미지 생성 모델</div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Google Gemini API 키로 여러 모델 사용하기
                </Label>
                <div className="flex gap-2">
                  <Input
                    type={showApiKeys.google ? 'text' : 'password'}
                    value={apiKeys.google_gemini || ''}
                    onChange={(e) => updateApiKey('google_gemini', e.target.value)}
                    placeholder="Google Gemini API 키 입력"
                    className="text-sm h-8"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleApiKeyVisibility('google')}
                    className="h-8 w-8 p-0"
                  >
                    {showApiKeys.google ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>

              {hasGoogleKey && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    사용할 Google 모델 선택 ({selectedGoogleModels.length}개 선택됨)
                  </Label>
                  <div className="grid grid-cols-1 gap-1">
                    {GOOGLE_MODELS.map((model) => (
                      <div key={model.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div>
                          <div className="text-sm font-medium">{model.name}</div>
                          <div className="text-xs text-muted-foreground">{model.description}</div>
                        </div>
                        <Switch
                          checked={selectedGoogleModels.includes(model.id)}
                          onCheckedChange={() => toggleGoogleModel(model.id)}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 기타 Provider들 */}
          {OTHER_PROVIDERS.map((provider) => {
            const hasKey = provider.apiKeyField ? !!apiKeys[provider.apiKeyField] : false;
            const testResult = testResults[provider.id];

            return (
              <Card key={provider.id} className="border">
                <CardContent className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{provider.name}</span>
                        <Badge variant="outline" className="text-xs">BYOK</Badge>
                        {hasKey && (
                          <Badge variant="outline" className="text-xs text-green-600">연결됨</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{provider.description}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {testResult === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {testResult === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                      
                      {provider.testable && hasKey && (
                        <Button
                          onClick={() => testProvider(provider.id)}
                          disabled={testingProvider === provider.id}
                          variant="outline"
                          size="sm"
                          className="h-7 px-2"
                        >
                          {testingProvider === provider.id ? '테스트중' : (
                            <>
                              <TestTube className="w-3 h-3 mr-1" />
                              테스트
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {provider.apiKeyField && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        API 키를 입력하여 {provider.name} 사용하기
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type={showApiKeys[provider.id] ? 'text' : 'password'}
                          value={apiKeys[provider.apiKeyField] || ''}
                          onChange={(e) => updateApiKey(provider.apiKeyField!, e.target.value)}
                          placeholder="API 키 입력"
                          className="text-sm h-8"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => toggleApiKeyVisibility(provider.id)}
                          className="h-8 w-8 p-0"
                        >
                          {showApiKeys[provider.id] ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 커스텀 Provider 추가 */}
      {addingCustomProvider && (
        <Card className="border-dashed">
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium">사용자 정의 Provider 추가</h5>
              <Button
                onClick={() => setAddingCustomProvider(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Provider 이름</Label>
                <Input
                  value={customProvider.name}
                  onChange={(e) => setCustomProvider(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: MyProvider"
                  className="text-sm h-8"
                />
              </div>
              <div>
                <Label className="text-xs">API 엔드포인트</Label>
                <Input
                  value={customProvider.endpoint}
                  onChange={(e) => setCustomProvider(prev => ({ ...prev, endpoint: e.target.value }))}
                  placeholder="https://api.example.com"
                  className="text-sm h-8"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-xs">API 키</Label>
              <Input
                type="password"
                value={customProvider.apiKey}
                onChange={(e) => setCustomProvider(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="API 키"
                className="text-sm h-8"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={addCustomProvider} size="sm" className="h-8">
                추가
              </Button>
              <Button 
                onClick={() => setAddingCustomProvider(false)} 
                variant="outline" 
                size="sm" 
                className="h-8"
              >
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}