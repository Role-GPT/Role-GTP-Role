// AdvancedSettingsModal.tsx - 더 이상 사용하지 않음
// UserAccountModal.tsx에 모든 기능이 통합되었습니다.
// 
// 통합된 기능:
// - API 키 관리
// - 음성 설정
// - 개인정보 설정
// - 기본 설정들 (일반/외관/알림)
// 
// 이 파일은 참조용으로만 남겨두었습니다.

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { X, Settings, Key, Globe, Volume2, Shield, User, CreditCard, Bell, Trash2, Edit, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../src/context/AppContext';
import { speechManager } from '../src/providers/speech';

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export function AdvancedSettingsModal({ isOpen, onClose, defaultTab = 'account' }: AdvancedSettingsModalProps) {
  console.warn('AdvancedSettingsModal는 더 이상 사용되지 않습니다. UserAccountModal을 사용하세요.');
  
  if (isOpen) {
    onClose();
    return null;
  }
  const { state, updateSettings } = useApp();
  
  // 로컬 설정 상태
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newApiKey, setNewApiKey] = useState({
    provider: 'gemini',
    name: '',
    key: '',
    baseUrl: '',
    model: ''
  });
  const [showApiKey, setShowApiKey] = useState<{[key: string]: boolean}>({});
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');

  // 음성 목록 로드
  useEffect(() => {
    if (speechManager.isSynthesisSupported()) {
      const loadVoices = () => {
        // 현재 언어에 최적화된 음성 목록 가져오기
        const currentLangVoices = speechManager.getVoicesForCurrentLanguage();
        const allVoices = speechManager.getVoices();
        
        // 현재 언어 음성을 우선으로, 전체 음성을 보조로 설정
        const voiceList = currentLangVoices.length > 0 ? currentLangVoices : allVoices;
        setVoices(voiceList);
        
        if (voiceList.length > 0 && !selectedVoice) {
          setSelectedVoice(voiceList[0].name);
        }
      };
      
      loadVoices();
      // 음성 목록이 비동기 로드될 수 있음
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleAddApiKey = () => {
    if (!newApiKey.name || !newApiKey.key) return;
    
    const apiKeyConfig = {
      id: `api_${Date.now()}`,
      provider: newApiKey.provider,
      name: newApiKey.name,
      apiKey: newApiKey.key,
      baseUrl: newApiKey.baseUrl || getDefaultBaseUrl(newApiKey.provider),
      modelName: newApiKey.model || getDefaultModel(newApiKey.provider),
      isDefault: apiKeys.length === 0
    };

    setApiKeys([...apiKeys, apiKeyConfig]);
    setNewApiKey({
      provider: 'gemini',
      name: '',
      key: '',
      baseUrl: '',
      model: ''
    });
  };

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getDefaultBaseUrl = (provider: string) => {
    const defaults: {[key: string]: string} = {
      gemini: 'https://generativelanguage.googleapis.com',
      openai: 'https://api.openai.com/v1',
      anthropic: 'https://api.anthropic.com/v1',
      groq: 'https://api.groq.com/openai/v1',
      perplexity: 'https://api.perplexity.ai',
      deepseek: 'https://api.deepseek.com/v1'
    };
    return defaults[provider] || '';
  };

  const getDefaultModel = (provider: string) => {
    const defaults: {[key: string]: string} = {
      gemini: 'gemini-2.5-flash',
      openai: 'gpt-4o',
      anthropic: 'claude-3-sonnet-20240229',
      groq: 'llama3-8b-8192',
      perplexity: 'llama-3-sonar-small-32k-online',
      deepseek: 'deepseek-chat'
    };
    return defaults[provider] || '';
  };

  const testVoice = () => {
    if (selectedVoice) {
      // 현재 언어에 맞는 테스트 문장 사용
      const testMessages = {
        ko: "안녕하세요! Role GTP의 음성 테스트입니다.",
        en: "Hello! This is a voice test for Role GTP.",
        ja: "こんにちは！Role GTPの音声テストです。",
        es: "¡Hola! Esta es una prueba de voz para Role GTP.",
        pt: "Olá! Este é um teste de voz para Role GTP.",
        hi: "नमस्ते! यह Role GTP के लिए एक आवाज परीक्षण है।"
      };
      
      const currentLang = state.userSettings.language as keyof typeof testMessages;
      const testMessage = testMessages[currentLang] || testMessages.ko;
      
      // 현재 언어에 맞는 언어 코드 사용
      const languageCodes: { [key: string]: string } = {
        en: 'en-US',
        ko: 'ko-KR', 
        ja: 'ja-JP',
        es: 'es-ES',
        pt: 'pt-BR',
        hi: 'hi-IN'
      };
      
      const languageCode = languageCodes[currentLang] || 'ko-KR';
      speechManager.speak(testMessage, languageCode);
    }
  };

  const handleSave = () => {
    updateSettings({
      apiConfigurations: apiKeys,
      speech: {
        ...state.userSettings.speech,
        voice: selectedVoice
      }
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-medium">고급 설정</DialogTitle>
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
          고급 설정에서 계정, API 키, 음성, 구독 플랜 및 개인정보 설정을 관리할 수 있습니다.
        </DialogDescription>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">계정</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">API</span>
            </TabsTrigger>
            <TabsTrigger value="speech" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">음성</span>
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">플랜</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">개인정보</span>
            </TabsTrigger>
          </TabsList>

          {/* 계정 탭 */}
          <TabsContent value="account" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">계정 정보</h3>
              <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">게스트 모드</p>
                    <p className="text-sm text-muted-foreground">로그인하지 않은 상태입니다</p>
                  </div>
                  <Badge variant="secondary">Guest</Badge>
                </div>
                <div className="flex gap-2">
                  <Button>Google로 로그인</Button>
                  <Button variant="outline">계정 만들기</Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">일반 설정</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>테마</Label>
                    <p className="text-sm text-muted-foreground">인터페이스 테마 설정</p>
                  </div>
                  <Select value={state.userSettings.theme} onValueChange={(value) => updateSettings({ theme: value })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">라이트</SelectItem>
                      <SelectItem value="dark">다크</SelectItem>
                      <SelectItem value="system">시스템</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>언어</Label>
                    <p className="text-sm text-muted-foreground">인터페이스 언어</p>
                  </div>
                  <Select value={state.userSettings.language} onValueChange={(value) => updateSettings({ language: value })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* API 키 관리 탭 */}
          <TabsContent value="api" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">API 키 관리</h3>
                <Badge variant="outline">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {apiKeys.length}개 연결됨
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
                <p>개인 API 키를 추가하여 더 많은 모델과 기능을 사용하세요. 키는 안전하게 브라우저에만 저장됩니다.</p>
              </div>

              {/* 새 API 키 추가 */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">새 API 키 추가</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>제공자</Label>
                    <Select value={newApiKey.provider} onValueChange={(value) => setNewApiKey({...newApiKey, provider: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini">Google Gemini</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="groq">Groq</SelectItem>
                        <SelectItem value="perplexity">Perplexity</SelectItem>
                        <SelectItem value="deepseek">DeepSeek</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>연결 이름</Label>
                    <Input 
                      placeholder="예: 개인 Gemini API"
                      value={newApiKey.name}
                      onChange={(e) => setNewApiKey({...newApiKey, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>API 키</Label>
                    <Input 
                      type="password"
                      placeholder="API 키를 입력하세요"
                      value={newApiKey.key}
                      onChange={(e) => setNewApiKey({...newApiKey, key: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleAddApiKey} disabled={!newApiKey.name || !newApiKey.key}>
                    API 키 추가
                  </Button>
                </div>
              </div>

              {/* 저장된 API 키 목록 */}
              <div className="space-y-3">
                <h4 className="font-medium">저장된 API 키</h4>
                {apiKeys.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>저장된 API 키가 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {apiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{apiKey.name}</p>
                            {apiKey.isDefault && <Badge variant="default" className="text-xs">기본</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {apiKey.provider} • {showApiKey[apiKey.id] ? apiKey.apiKey : `••••••••${apiKey.apiKey.slice(-4)}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => toggleApiKeyVisibility(apiKey.id)}
                          >
                            {showApiKey[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteApiKey(apiKey.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 음성 설정 탭 */}
          <TabsContent value="speech" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">음성 설정</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>음성 기능 활성화</Label>
                    <p className="text-sm text-muted-foreground">음성 입력 및 출력 기능 사용</p>
                  </div>
                  <Switch 
                    checked={state.userSettings.speech?.enabled ?? true}
                    onCheckedChange={(checked) => updateSettings({ 
                      speech: { ...state.userSettings.speech, enabled: checked }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>음성 선택</Label>
                  <div className="flex gap-2">
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="음성을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map((voice, index) => (
                          <SelectItem key={index} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={testVoice}>
                      테스트
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI 응답을 읽어줄 음성을 선택하세요
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>자동 재생</Label>
                    <p className="text-sm text-muted-foreground">AI 응답을 자동으로 음성으로 재생</p>
                  </div>
                  <Switch 
                    checked={state.userSettings.speech?.autoPlay ?? false}
                    onCheckedChange={(checked) => updateSettings({ 
                      speech: { ...state.userSettings.speech, autoPlay: checked }
                    })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 플랜 탭 */}
          <TabsContent value="plan" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">구독 플랜</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Free</h4>
                    <Badge variant="secondary">현재 플랜</Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 개인 API 키 사용</li>
                    <li>• 프로젝트 2개 제한</li>
                    <li>• 커스텀 Role 2개 제한</li>
                    <li>• 기본 기능</li>
                  </ul>
                </div>

                <div className="p-4 border-2 border-primary rounded-lg relative">
                  <div className="absolute -top-3 left-4">
                    <Badge>추천</Badge>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Premium</h4>
                    <span className="text-lg font-bold">$9.99/월</span>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li>• 무제한 프로젝트</li>
                    <li>• 무제한 커스텀 Role</li>
                    <li>• 고급 AI 설정</li>
                    <li>• 우선 지원</li>
                  </ul>
                  <Button className="w-full">업그레이드</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 개인정보 탭 */}
          <TabsContent value="privacy" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">개인정보 및 데이터</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>데이터 수집</Label>
                    <p className="text-sm text-muted-foreground">서비스 개선을 위한 익명 데이터 수집</p>
                  </div>
                  <Switch 
                    checked={state.userSettings.privacy.dataCollection}
                    onCheckedChange={(checked) => updateSettings({ 
                      privacy: { ...state.userSettings.privacy, dataCollection: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>분석 데이터</Label>
                    <p className="text-sm text-muted-foreground">사용 패턴 분석을 위한 데이터 전송</p>
                  </div>
                  <Switch 
                    checked={state.userSettings.privacy.analytics}
                    onCheckedChange={(checked) => updateSettings({ 
                      privacy: { ...state.userSettings.privacy, analytics: checked }
                    })}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">데이터 관리</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">데이터 내보내기</p>
                      <p className="text-sm text-muted-foreground">모든 채팅 기록과 설정을 다운로드</p>
                    </div>
                    <Button variant="outline">다운로드</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-destructive">모든 데이터 삭제</p>
                      <p className="text-sm text-muted-foreground">모든 채팅 기록과 설정을 영구 삭제</p>
                    </div>
                    <Button variant="destructive">삭제</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave}>
            설정 저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
