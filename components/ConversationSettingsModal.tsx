import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TimelineReminderSettings } from './TimelineReminderSettings';
import { 
  X, 
  MessageSquare, 
  Brain, 
  Zap, 
  Shield, 
  Clock, 
  Settings,
  Bot,
  Eye,
  EyeOff,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  Target,
  Mic2,
  RotateCcw,
  Download,
  Upload,
  ChevronDown,
  Crown,
  Search,
  Globe,
  BookOpen,
  Building,
  Palette,
  Home,
  TestTube
} from 'lucide-react';
import { useApp } from '../src/context/AppContext';
import { toast } from 'sonner';

// API Providers 정의 - 카테고리별 구분
const BASIC_PROVIDERS = [
  { 
    id: 'rolegpt', 
    name: 'Role GPT (기본)', 
    description: '기본 Role GPT 서비스', 
    icon: '🤖',
    category: 'basic',
    models: [
      { id: 'default', name: 'Role GPT Basic', description: '기본 Role GPT 모델' }
    ]
  }
];

const STANDARD_PROVIDERS = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    description: 'GPT 모델 시리즈', 
    icon: '🧠',
    category: 'standard',
    models: [
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '최신 GPT-4 모델' },
      { id: 'gpt-4', name: 'GPT-4', description: '고성능 범용 모델' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '빠르고 효율적' }
    ]
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    description: 'Claude 모델 시리즈', 
    icon: '🎭',
    category: 'standard',
    models: [
      { id: 'claude-3-opus', name: 'Claude 3 Opus', description: '최고 성능 모델' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: '균형잡힌 성능' },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: '빠른 응답' }
    ]
  },
  { 
    id: 'google', 
    name: 'Google AI', 
    description: 'Gemini 모델 시리즈', 
    icon: '✨',
    category: 'standard',
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro', description: '고성능 분석 모델' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: '멀티모달 모델' }
    ]
  }
];

const ADVANCED_PROVIDERS = [
  { 
    id: 'openrouter', 
    name: 'OpenRouter', 
    description: '다양한 모델 라우터', 
    icon: '🌐',
    category: 'advanced',
    models: [
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: 'via OpenRouter' },
      { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', description: 'via OpenRouter' },
      { id: 'meta-llama/llama-2-70b-chat', name: 'Llama 2 70B', description: 'Meta 모델' },
      { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B', description: 'Mistral 모델' }
    ]
  },
  { 
    id: 'groq', 
    name: 'Groq', 
    description: '초고속 추론 엔진', 
    icon: '⚡',
    category: 'advanced',
    models: [
      { id: 'llama2-70b-4096', name: 'Llama 2 70B', description: '고성능 오픈소스' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Mistral 혼합 모델' },
      { id: 'gemma-7b-it', name: 'Gemma 7B', description: 'Google 오픈소스' }
    ]
  }
];

const PREMIUM_PROVIDERS = [
  { 
    id: 'xai', 
    name: 'xAI (고급)', 
    description: 'Grok 모델 시리즈 - 고급 기능', 
    icon: '🚀',
    category: 'premium',
    isPremium: true,
    models: [
      { id: 'grok-beta', name: 'Grok Beta', description: 'xAI의 최신 모델' },
      { id: 'grok-vision', name: 'Grok Vision', description: '멀티모달 Grok' }
    ]
  },
  { 
    id: 'custom', 
    name: 'Custom API', 
    description: '사용자 정의 엔드포인트', 
    icon: '🔧',
    category: 'premium',
    isPremium: true,
    models: [],
    isCustom: true
  }
];

const ALL_PROVIDERS = [...BASIC_PROVIDERS, ...STANDARD_PROVIDERS, ...ADVANCED_PROVIDERS, ...PREMIUM_PROVIDERS];

interface ConversationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId?: string;
}

export function ConversationSettingsModal({ isOpen, onClose, chatId }: ConversationSettingsModalProps) {
  const { state, updateConversation, updateUserSettings } = useApp();
  
  const [activeTab, setActiveTab] = useState('model');
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  
  // 현재 채팅 및 Role 정보
  const currentChat = chatId ? state.conversations.find(c => c.id === chatId) : null;
  const selectedRole = currentChat ? state.roles.find(r => r.id === currentChat.roleId) : null;
  const userMode = state.userSettings.mode;
  const isStandard = userMode === 'standard';
  const isAdvanced = userMode === 'advanced';
  const isExpert = userMode === 'expert';
  const isPaidUser = false; // TODO: 실제 결제 상태 확인

  // API 카테고리 토글 상태
  const [apiCategoryToggles, setApiCategoryToggles] = useState({
    search: true,      // 웹 검색 - 기본 ON
    academic: false,   // 학술 검색
    finance: false,    // 금융 정보
    media: false,      // 이미지/미디어
    social: false,     // 소셜/개발자
    lifestyle: false,  // 날씨/라이프스타일
  });

  // 대화창별 설정 상태 (대화창에 종속됨)
  const [chatSettings, setChatSettings] = useState({
    // AI 모델 설정
    selectedProvider: 'rolegpt',
    selectedModel: 'default',
    customModelName: '',
    customEndpoint: '',
    
    // 기본 AI 매개변수
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    
    // 대화 설정
    contextLength: isStandard ? 5 : 10,
    enableRoleReminder: !isStandard,
    roleReminderInterval: isStandard ? 15 : isAdvanced ? 10 : 5, // Standard: 15 고정, Advanced: 10, Expert: 5
    enableTimelineReminder: isAdvanced || isExpert,
    timelineFormat: 'relative' as 'relative' | 'absolute' | 'smart',
    timelineSummaryStyle: 'simple' as 'simple' | 'detailed' | 'contextual',
    enableConversationSummary: isExpert,
    summaryInterval: isStandard ? 30 : isAdvanced ? 20 : 15,
    
    // 필터링 및 안전
    safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
    contentFilter: true,
    enableEmotionDetection: false,
    
    // 응답 스타일
    responseStyle: 'balanced' as 'concise' | 'balanced' | 'detailed',
    enableCodeHighlighting: true,
    enableMarkdownFormatting: true,
    
    // 음성 관련
    enableTextToSpeech: false,
    speechVoice: 'alloy',
    speechSpeed: 1.0,
    
    // 대화 타이틀
    chatTitle: currentChat?.title || ''
  });

  // UI 상태
  const [expandedSections, setExpandedSections] = useState({
    basicProviders: true,
    standardProviders: false,
    advancedProviders: false,
    premiumProviders: false
  });

  // API 키 관리
  const [apiConfigs, setApiConfigs] = useState<Record<string, {
    apiKey: string;
    isActive: boolean;
  }>>({});

  // 로컬 스토리지에서 API 설정 로드
  useEffect(() => {
    const savedConfigs = localStorage.getItem('role-gpt-api-configs');
    if (savedConfigs) {
      try {
        const parsed = JSON.parse(savedConfigs);
        const simplifiedConfigs: typeof apiConfigs = {};
        Object.entries(parsed).forEach(([id, config]: [string, any]) => {
          simplifiedConfigs[id] = {
            apiKey: config.apiKey || '',
            isActive: config.isActive || false
          };
        });
        setApiConfigs(simplifiedConfigs);
      } catch (error) {
        console.error('Failed to parse API configs:', error);
      }
    }
  }, []);

  // 모달 열릴 때 현재 대화창의 설정 로드
  useEffect(() => {
    if (isOpen && currentChat) {
      // 대화창 특정 설정이 있다면 로드, 없다면 사용자 기본 설정 사용
      const chatConfig = currentChat.settings || {};
      setChatSettings(prev => ({
        ...prev,
        temperature: chatConfig.temperature || state.userSettings.temperature || 0.7,
        maxTokens: chatConfig.maxTokens || state.userSettings.maxTokens || 2048,
        topP: chatConfig.topP || state.userSettings.topP || 0.9,
        frequencyPenalty: chatConfig.frequencyPenalty || state.userSettings.frequencyPenalty || 0.0,
        presencePenalty: chatConfig.presencePenalty || state.userSettings.presencePenalty || 0.0,
        safetyLevel: chatConfig.safetyLevel || state.userSettings.safetyLevel || 'BLOCK_MEDIUM_AND_ABOVE',
        chatTitle: currentChat.title || '',
        selectedProvider: state.userSettings.selectedAiModel?.split('-')[0] || 'rolegpt',
        selectedModel: state.userSettings.selectedAiModel || 'default',
        // 모드별 기본값 설정
        contextLength: isStandard ? 5 : isAdvanced ? 10 : 20,
        enableRoleReminder: !isStandard,
        roleReminderInterval: isStandard ? 15 : isAdvanced ? 10 : 5, // Standard: 15 고정
        enableTimelineReminder: isAdvanced || isExpert,
        enableConversationSummary: isExpert,
        summaryInterval: isStandard ? 30 : isAdvanced ? 20 : 15,
        timelineSummaryStyle: 'simple' as 'simple' | 'detailed' | 'contextual'
      }));
    }
  }, [isOpen, currentChat, state.userSettings, userMode]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (currentChat) {
      // 대화창별 설정 저장
      updateConversation(currentChat.id, {
        title: chatSettings.chatTitle || currentChat.title,
        settings: {
          temperature: chatSettings.temperature,
          maxTokens: chatSettings.maxTokens,
          topP: chatSettings.topP,
          frequencyPenalty: chatSettings.frequencyPenalty,
          presencePenalty: chatSettings.presencePenalty,
          safetyLevel: chatSettings.safetyLevel,
          contextLength: chatSettings.contextLength,
          enableRoleReminder: chatSettings.enableRoleReminder,
          roleReminderInterval: chatSettings.roleReminderInterval,
          enableTimelineReminder: chatSettings.enableTimelineReminder,
          timelineFormat: chatSettings.timelineFormat,
          enableConversationSummary: chatSettings.enableConversationSummary,
          summaryInterval: chatSettings.summaryInterval,
          timelineSummaryStyle: chatSettings.timelineSummaryStyle,
          contentFilter: chatSettings.contentFilter,
          enableEmotionDetection: chatSettings.enableEmotionDetection,
          responseStyle: chatSettings.responseStyle,
          enableCodeHighlighting: chatSettings.enableCodeHighlighting,
          enableMarkdownFormatting: chatSettings.enableMarkdownFormatting,
          enableTextToSpeech: chatSettings.enableTextToSpeech,
          speechVoice: chatSettings.speechVoice,
          speechSpeed: chatSettings.speechSpeed
        }
      });
    }

    // 사용자 기본 설정도 업데이트
    updateUserSettings({
      selectedAiModel: `${chatSettings.selectedProvider}-${chatSettings.selectedModel}`,
      temperature: chatSettings.temperature,
      maxTokens: chatSettings.maxTokens,
      topP: chatSettings.topP,
      frequencyPenalty: chatSettings.frequencyPenalty,
      presencePenalty: chatSettings.presencePenalty,
      safetyLevel: chatSettings.safetyLevel
    });

    toast.success('대화창 설정이 저장되었습니다.');
    onClose();
  };

  const handleReset = () => {
    if (confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      setChatSettings({
        selectedProvider: 'rolegpt',
        selectedModel: 'default',
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        contextLength: isStandard ? 5 : isAdvanced ? 10 : 20,
        enableRoleReminder: !isStandard,
        roleReminderInterval: isStandard ? 15 : isAdvanced ? 10 : 5,
        enableTimelineReminder: isAdvanced || isExpert,
        timelineFormat: 'relative',
        timelineSummaryStyle: 'simple',
        enableConversationSummary: isExpert,
        summaryInterval: isStandard ? 30 : isAdvanced ? 20 : 15,
        safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
        contentFilter: true,
        enableEmotionDetection: false,
        responseStyle: 'balanced',
        enableCodeHighlighting: true,
        enableMarkdownFormatting: true,
        enableTextToSpeech: false,
        speechVoice: 'alloy',
        speechSpeed: 1.0,
        chatTitle: currentChat?.title || ''
      });
      toast.info('설정이 초기화되었습니다.');
    }
  };

  const updateApiConfig = (providerId: string, updates: Partial<typeof apiConfigs[string]>) => {
    setApiConfigs(prev => {
      const updated = {
        ...prev,
        [providerId]: {
          ...prev[providerId],
          ...updates
        }
      };
      
      // 로컬 스토리지에 저장 (기존 형식 유지)
      const fullConfig = localStorage.getItem('role-gpt-api-configs');
      if (fullConfig) {
        try {
          const parsed = JSON.parse(fullConfig);
          parsed[providerId] = {
            ...parsed[providerId],
            ...updates
          };
          localStorage.setItem('role-gpt-api-configs', JSON.stringify(parsed));
        } catch (error) {
          console.error('Failed to update API config:', error);
        }
      }
      
      return updated;
    });
  };

  const getAvailableModels = () => {
    const provider = ALL_PROVIDERS.find(p => p.id === chatSettings.selectedProvider);
    if (!provider) return [];
    
    // 기본 Role GPT는 항상 사용 가능
    if (provider.id === 'rolegpt') return provider.models;
    
    // 커스텀 모델의 경우
    if (provider.isCustom) {
      return chatSettings.customModelName ? [{ 
        id: 'custom', 
        name: chatSettings.customModelName, 
        description: 'Custom Model' 
      }] : [];
    }
    
    // 다른 provider는 API 키가 있고 활성화된 경우만
    const config = apiConfigs[provider.id];
    return config?.apiKey && config?.isActive ? provider.models : [];
  };

  const availableModels = getAvailableModels();
  const selectedProvider = ALL_PROVIDERS.find(p => p.id === chatSettings.selectedProvider);

  // 턴 수 제한 계산 - 사용자 요청에 따라 수정
  const getMaxTurns = (type: 'context' | 'reminder' | 'summary') => {
    const isPremiumUser = false; // TODO: 실제 프리미엄 상태 확인
    
    switch (type) {
      case 'context':
        return isStandard ? 15 : isPremiumUser ? 50 : 20;
      case 'reminder':
        if (isStandard) return 15; // 고정
        return isAdvanced ? 30 : 50; // Advanced: 30턴까지 보여주고, Expert: 50턴까지
      case 'summary':
        return isStandard ? 30 : isAdvanced ? 20 : 15;
      default:
        return 50;
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" 
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 - SafeSettingsModal과 동일한 스타일 */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-4xl bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* 헤더 - SafeSettingsModal과 동일한 스타일 */}
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">대화창 설정</h2>
              <p className="text-sm text-muted-foreground">
                {currentChat ? `"${currentChat.title}"` : '현재 대화창'} 맞춤 설정
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedRole && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Bot className="w-3 h-3" />
                {selectedRole.name}
              </Badge>
            )}
            <Badge variant="outline" className={
              userMode === 'standard' ? 'border-blue-200 text-blue-600' :
              userMode === 'advanced' ? 'border-orange-200 text-orange-600' :
              'border-purple-200 text-purple-600'
            }>
              {userMode.toUpperCase()} {userMode === 'expert' ? 'PLUS' : '모드'}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-xl hover:bg-muted/50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 고정 레이아웃 - 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-5 bg-muted/30">
              <TabsTrigger value="model" className="data-[state=active]:bg-background">
                <Zap className="w-4 h-4 mr-2" />
                AI 모델
              </TabsTrigger>
              <TabsTrigger value="api-features" className="data-[state=active]:bg-background">
                <Search className="w-4 h-4 mr-2" />
                API 기능
              </TabsTrigger>
              <TabsTrigger value="response" className="data-[state=active]:bg-background">
                <Brain className="w-4 h-4 mr-2" />
                응답 설정
              </TabsTrigger>
              <TabsTrigger value="conversation" className="data-[state=active]:bg-background">
                <Clock className="w-4 h-4 mr-2" />
                대화 관리
              </TabsTrigger>
              <TabsTrigger value="advanced" className="data-[state=active]:bg-background" disabled={isStandard}>
                <Settings className="w-4 h-4 mr-2" />
                고급 설정
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 고정 높이 컨텐츠 영역 */}
          <div className="p-6 h-[60vh] overflow-y-auto scrollbar-thin">
            
            {/* AI 모델 선택 탭 */}
            <TabsContent value="model" className="space-y-6 mt-0">
              {/* 현재 모델 정보 */}
              <Card className="border-border/50 bg-card/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    현재 사용 중인 모델
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">
                        {selectedProvider?.icon}
                      </div>
                      <div>
                        <p className="font-medium">{selectedProvider?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {availableModels.find(m => m.id === chatSettings.selectedModel)?.name || 'Default Model'}
                        </p>
                        {selectedProvider?.isPremium && (
                          <Badge variant="outline" className="mt-1 text-xs bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                            <Crown className="w-3 h-3 mr-1" />
                            고급 모델
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                      <Check className="w-3 h-3 mr-1" />
                      활성
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* AI Provider 선택 - 카테고리별 구분 */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">AI Provider ��택</Label>
                  <p className="text-sm text-muted-foreground mt-1">사용할 AI 서비스를 선택하세요</p>
                </div>

                {/* 기본 Provider (항상 표시) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">기본 서비스</h4>
                    <Badge variant="secondary" className="text-xs">무료</Badge>
                  </div>
                  {BASIC_PROVIDERS.map((provider) => {
                    const isSelected = chatSettings.selectedProvider === provider.id;
                    return (
                      <ProviderCard 
                        key={provider.id} 
                        provider={provider} 
                        isSelected={isSelected}
                        isAvailable={true}
                        apiConfigs={apiConfigs}
                        chatSettings={chatSettings}
                        setChatSettings={setChatSettings}
                        availableModels={availableModels}
                      />
                    );
                  })}
                </div>

                {/* 표준 Provider */}
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSection('standardProviders')}
                    className="flex items-center justify-between w-full p-0 h-auto font-medium text-sm hover:bg-transparent"
                  >
                    <div className="flex items-center gap-2">
                      <span>표준 AI 서비스</span>
                      <Badge variant="outline" className="text-xs">API 키 필요</Badge>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.standardProviders ? 'rotate-180' : ''}`} />
                  </Button>
                  {expandedSections.standardProviders && (
                    <div className="space-y-2 pl-2">
                      {STANDARD_PROVIDERS.map((provider) => {
                        const config = apiConfigs[provider.id];
                        const isAvailable = config?.apiKey && config?.isActive;
                        const isSelected = chatSettings.selectedProvider === provider.id;
                        return (
                          <ProviderCard 
                            key={provider.id} 
                            provider={provider} 
                            isSelected={isSelected}
                            isAvailable={isAvailable}
                            apiConfigs={apiConfigs}
                            chatSettings={chatSettings}
                            setChatSettings={setChatSettings}
                            availableModels={availableModels}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 고급 Provider (Advanced+ 모드에서만) */}
                {!isStandard && (
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      onClick={() => toggleSection('advancedProviders')}
                      className="flex items-center justify-between w-full p-0 h-auto font-medium text-sm hover:bg-transparent"
                    >
                      <div className="flex items-center gap-2">
                        <span>고급 AI 서비스</span>
                        <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Advanced+</Badge>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.advancedProviders ? 'rotate-180' : ''}`} />
                    </Button>
                    {expandedSections.advancedProviders && (
                      <div className="space-y-2 pl-2">
                        {ADVANCED_PROVIDERS.map((provider) => {
                          const config = apiConfigs[provider.id];
                          const isAvailable = config?.apiKey && config?.isActive;
                          const isSelected = chatSettings.selectedProvider === provider.id;
                          return (
                            <ProviderCard 
                              key={provider.id} 
                              provider={provider} 
                              isSelected={isSelected}
                              isAvailable={isAvailable}
                              apiConfigs={apiConfigs}
                              chatSettings={chatSettings}
                              setChatSettings={setChatSettings}
                              availableModels={availableModels}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 프리미엄 Provider (Expert 모드에서만) */}
                {isExpert && (
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      onClick={() => toggleSection('premiumProviders')}
                      className="flex items-center justify-between w-full p-0 h-auto font-medium text-sm hover:bg-transparent"
                    >
                      <div className="flex items-center gap-2">
                        <span>프리미엄 AI 서비스</span>
                        <Badge className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 dark:from-purple-900/30 dark:to-blue-900/30 dark:text-purple-300">
                          <Crown className="w-3 h-3 mr-1" />
                          Expert
                        </Badge>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.premiumProviders ? 'rotate-180' : ''}`} />
                    </Button>
                    {expandedSections.premiumProviders && (
                      <div className="space-y-2 pl-2">
                        {PREMIUM_PROVIDERS.map((provider) => {
                          const config = apiConfigs[provider.id];
                          const isAvailable = provider.isCustom ? true : (config?.apiKey && config?.isActive);
                          const isSelected = chatSettings.selectedProvider === provider.id;
                          return (
                            <ProviderCard 
                              key={provider.id} 
                              provider={provider} 
                              isSelected={isSelected}
                              isAvailable={isAvailable}
                              apiConfigs={apiConfigs}
                              chatSettings={chatSettings}
                              setChatSettings={setChatSettings}
                              availableModels={availableModels}
                              isCustom={provider.isCustom}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* API 키 설정 안내 */}
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">API 키 설정</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        외부 AI 서비스를 사용하려면 먼저 설정에서 해당 Provider의 API 키를 등록해야 합니다.
                        설정 → API 키 탭에서 관리할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* API 기능 탭 - 카테고리별 기능 토글 */}
            <TabsContent value="api-features" className="space-y-6 mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">API 기능 관리</h3>
                  <p className="text-sm text-muted-foreground">
                    AI가 사용할 수 있는 외부 정보 수집 기능을 카테고리별로 관리하세요.
                  </p>
                </div>

                {/* 카테고리별 토글 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 웹 검색 */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-500" />
                          <CardTitle className="text-base">웹 검색</CardTitle>
                        </div>
                        <Switch
                          checked={apiCategoryToggles.search}
                          onCheckedChange={(checked) => setApiCategoryToggles(prev => ({ ...prev, search: checked }))}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        실시간 웹 검색, 뉴스, 블로그 정보
                      </p>
                      <div className="text-xs text-muted-foreground">
                        체험: 30/30 · {apiCategoryToggles.search ? '활성' : '비활성'}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 학술 검색 */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-green-500" />
                          <CardTitle className="text-base">학술 연구</CardTitle>
                        </div>
                        <Switch
                          checked={apiCategoryToggles.academic}
                          onCheckedChange={(checked) => setApiCategoryToggles(prev => ({ ...prev, academic: checked }))}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        논문, 연구자료, 학술 데이터베이스
                      </p>
                      <div className="text-xs text-muted-foreground">
                        체험: 20/20 · {apiCategoryToggles.academic ? '활성' : '비활성'}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 비즈니스 & 금융 */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="w-5 h-5 text-orange-500" />
                          <CardTitle className="text-base">비즈니스 & 금융</CardTitle>
                        </div>
                        <Switch
                          checked={apiCategoryToggles.finance}
                          onCheckedChange={(checked) => setApiCategoryToggles(prev => ({ ...prev, finance: checked }))}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        주식정보, 경제지표, 기업 데이터
                      </p>
                      <div className="text-xs text-muted-foreground">
                        체험: 20/20 · {apiCategoryToggles.finance ? '활성' : '비활성'}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 이미지 & 미디어 */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Palette className="w-5 h-5 text-purple-500" />
                          <CardTitle className="text-base">이미지 & 미디어</CardTitle>
                        </div>
                        <Switch
                          checked={apiCategoryToggles.media}
                          onCheckedChange={(checked) => setApiCategoryToggles(prev => ({ ...prev, media: checked }))}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        이미지 생성, 검색, 미디어 정보
                      </p>
                      <div className="text-xs text-muted-foreground">
                        체험: 10/10 · {apiCategoryToggles.media ? '활성' : '비활성'}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 소셜 & 개발자 */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TestTube className="w-5 h-5 text-cyan-500" />
                          <CardTitle className="text-base">소셜 & 개발자</CardTitle>
                        </div>
                        <Switch
                          checked={apiCategoryToggles.social}
                          onCheckedChange={(checked) => setApiCategoryToggles(prev => ({ ...prev, social: checked }))}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        GitHub, Stack Overflow, 개발자 도구
                      </p>
                      <div className="text-xs text-muted-foreground">
                        체험: 15/15 · {apiCategoryToggles.social ? '활성' : '비활성'}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 라이프스타일 */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Home className="w-5 h-5 text-pink-500" />
                          <CardTitle className="text-base">라이프스타일</CardTitle>
                        </div>
                        <Switch
                          checked={apiCategoryToggles.lifestyle}
                          onCheckedChange={(checked) => setApiCategoryToggles(prev => ({ ...prev, lifestyle: checked }))}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        날씨정보, 생활정보, 공공데이터
                      </p>
                      <div className="text-xs text-muted-foreground">
                        체험: 20/20 · {apiCategoryToggles.lifestyle ? '활성' : '비활성'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 전체 제어 */}
                <Card className="border-dashed border-2 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">전체 API 기능</h4>
                        <p className="text-sm text-muted-foreground">모든 카테고리를 한 번에 제어</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setApiCategoryToggles({
                            search: true,
                            academic: true,
                            finance: true,
                            media: true,
                            social: true,
                            lifestyle: true
                          })}
                        >
                          전체 ON
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setApiCategoryToggles({
                            search: false,
                            academic: false,
                            finance: false,
                            media: false,
                            social: false,
                            lifestyle: false
                          })}
                        >
                          전체 OFF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 안내 메시지 */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">BYOK 모드</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        개인 API 키를 연결하면 무제한으로 사용할 수 있습니다. 
                        <strong> 설정 → 내 키 보관함</strong>에서 키를 등록하고 관리하세요.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 응답 설정 탭 */}
            <TabsContent value="response" className="space-y-6 mt-0">
              {/* 채팅 제목 */}
              <div className="space-y-2">
                <Label htmlFor="chatTitle">대화 제목</Label>
                <Input
                  id="chatTitle"
                  value={chatSettings.chatTitle}
                  onChange={(e) => setChatSettings(prev => ({ ...prev, chatTitle: e.target.value }))}
                  placeholder="대화 제목을 입력하세요"
                />
              </div>

              <Separator className="bg-border/30" />

              {/* AI 매개변수 */}
              <div className="space-y-4">
                <h3 className="text-base font-medium">AI 응답 매개변수</h3>
                
                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>창의성 (Temperature)</Label>
                    <Badge variant="outline">{chatSettings.temperature}</Badge>
                  </div>
                  <Slider
                    value={[chatSettings.temperature]}
                    onValueChange={([value]) => setChatSettings(prev => ({ ...prev, temperature: value }))}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    낮을수록 일관되고 예측 가능한 응답, 높을수록 창의적이고 다양한 응답
                  </p>
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>최대 토큰 수</Label>
                    <Badge variant="outline">{chatSettings.maxTokens}</Badge>
                  </div>
                  <Slider
                    value={[chatSettings.maxTokens]}
                    onValueChange={([value]) => setChatSettings(prev => ({ ...prev, maxTokens: value }))}
                    max={4096}
                    min={256}
                    step={256}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    AI가 생성할 수 있는 최대 응답 길이
                  </p>
                </div>

                {!isStandard && (
                  <>
                    {/* Top P */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>포커스 (Top P)</Label>
                        <Badge variant="outline">{chatSettings.topP}</Badge>
                      </div>
                      <Slider
                        value={[chatSettings.topP]}
                        onValueChange={([value]) => setChatSettings(prev => ({ ...prev, topP: value }))}
                        max={1}
                        min={0}
                        step={0.05}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        낮을수록 더 집중적이고 일관된 응답
                      </p>
                    </div>
                  </>
                )}
              </div>

              <Separator className="bg-border/30" />

              {/* 응답 스타일 */}
              <div className="space-y-3">
                <Label>응답 스타일</Label>
                <Select
                  value={chatSettings.responseStyle}
                  onValueChange={(value) => setChatSettings(prev => ({ ...prev, responseStyle: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">간결함 - 핵심만 요약해서 답변</SelectItem>
                    <SelectItem value="balanced">균형 - 적당한 길이의 상세한 답변</SelectItem>
                    <SelectItem value="detailed">상세함 - 자세하고 포괄적인 답변</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 포맷팅 옵션 */}
              <div className="space-y-3">
                <h4 className="font-medium">포맷팅 옵션</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>마크다운 포맷팅</Label>
                      <p className="text-xs text-muted-foreground">텍스트 강조, 목록 등 서식 지원</p>
                    </div>
                    <Switch
                      checked={chatSettings.enableMarkdownFormatting}
                      onCheckedChange={(checked) => setChatSettings(prev => ({ ...prev, enableMarkdownFormatting: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>코드 하이라이팅</Label>
                      <p className="text-xs text-muted-foreground">코드 블록 문법 강조 표시</p>
                    </div>
                    <Switch
                      checked={chatSettings.enableCodeHighlighting}
                      onCheckedChange={(checked) => setChatSettings(prev => ({ ...prev, enableCodeHighlighting: checked }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 대화 관리 탭 */}
            <TabsContent value="conversation" className="space-y-6 mt-0">
              {/* 컨텍스트 관리 */}
              <div className="space-y-4">
                <h3 className="text-base font-medium">컨텍스트 관리</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>컨텍스트 길이</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{chatSettings.contextLength}개 메시지</Badge>
                      {chatSettings.contextLength > 20 && (
                        <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 dark:from-purple-900/30 dark:to-blue-900/30 dark:text-purple-300">
                          <Crown className="w-3 h-3 mr-1" />
                          프리미엄
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Slider
                    value={[chatSettings.contextLength]}
                    onValueChange={([value]) => setChatSettings(prev => ({ ...prev, contextLength: value }))}
                    max={getMaxTurns('context')}
                    min={3}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    AI가 참조할 이전 메시지의 개수 (많을수록 더 긴 문맥 이해)
                    {isStandard && " • Standard 모드: 최대 15개"}
                    {!isStandard && chatSettings.contextLength > 20 && " • 20개 이상은 프리미엄 기능입니다"}
                  </p>
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* Role 리마인더 - 깔끔하게 정리 */}
              <div className="space-y-4">
                <h3 className="text-base font-medium">Role 리마인더</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Role 리마인더 활성화</Label>
                    <p className="text-xs text-muted-foreground">
                      AI가 해당 역할을 기억할 수 있게 도와줍니다
                    </p>
                  </div>
                  <Switch
                    checked={chatSettings.enableRoleReminder}
                    onCheckedChange={(checked) => setChatSettings(prev => ({ ...prev, enableRoleReminder: checked }))}
                    disabled={isStandard}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>간격</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{chatSettings.roleReminderInterval}턴 (0-{getMaxTurns('reminder')}턴)</Badge>
                      {isStandard && (
                        <Badge variant="secondary" className="text-xs">고정</Badge>
                      )}
                      {!isStandard && isAdvanced && chatSettings.roleReminderInterval > 20 && (
                        <Crown className="h-3 w-3 text-amber-500" title="20턴 이상은 업그레이드가 필요합니다" />
                      )}
                    </div>
                  </div>
                  <Slider
                    value={[chatSettings.roleReminderInterval]}
                    onValueChange={([value]) => {
                      // Advanced 모드에서 20턴 이상 설정 시 제한
                      if (isAdvanced && !isPaidUser && value > 20) {
                        toast.error('20턴 이상 설정은 업그레이드가 필요합니다.');
                        return;
                      }
                      setChatSettings(prev => ({ ...prev, roleReminderInterval: value }));
                    }}
                    max={getMaxTurns('reminder')}
                    min={0}
                    step={1}
                    className="w-full"
                    disabled={isStandard}
                  />
                  {isAdvanced && !isPaidUser && (
                    <div className="text-xs text-muted-foreground">
                      <span>0-20턴 무료 • </span>
                      <span className="text-amber-600">21-30턴 업그레이드 필요</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 타임라인 리마인더 시스템 - 새로운 통합 컴포넌트 */}
              <Separator className="bg-border/30" />
              
              <TimelineReminderSettings
                conversationId={currentChat?.id || ''}
                settings={chatSettings}
                onSettingsChange={(newSettings) => setChatSettings(prev => ({ ...prev, ...newSettings }))}
                compact={isAdvanced} // Advanced 모드에서는 compact=true
              />

              {/* 대화 요약 */}
              {isExpert && (
                <>
                  <Separator className="bg-border/30" />
                  
                  <div className="space-y-4">
                    <h3 className="text-base font-medium flex items-center gap-2">
                      대화 요약 시스템
                      <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 dark:from-purple-900/30 dark:to-blue-900/30 dark:text-purple-300">
                        <Crown className="w-3 h-3 mr-1" />
                        Expert
                      </Badge>
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>자동 대화 요약</Label>
                        <p className="text-xs text-muted-foreground">긴 대화를 자동으로 요약하여 컨텍스트 효율성 증대</p>
                      </div>
                      <Switch
                        checked={chatSettings.enableConversationSummary}
                        onCheckedChange={(checked) => setChatSettings(prev => ({ ...prev, enableConversationSummary: checked }))}
                      />
                    </div>

                    {chatSettings.enableConversationSummary && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>요약 간격</Label>
                          <Badge variant="outline">{chatSettings.summaryInterval}개 메시지마다</Badge>
                        </div>
                        <Slider
                          value={[chatSettings.summaryInterval]}
                          onValueChange={([value]) => setChatSettings(prev => ({ ...prev, summaryInterval: value }))}
                          max={getMaxTurns('summary')}
                          min={5}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </TabsContent>

            {/* 고급 설정 탭 */}
            <TabsContent value="advanced" className="space-y-6 mt-0">
              {isStandard ? (
                <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                  <CardContent className="pt-6 text-center">
                    <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">고급 설정 잠금</h3>
                    <p className="text-muted-foreground mb-4">
                      고급 설정은 Advanced 이상 모드에서 사용할 수 있습니다.
                    </p>
                    <Button variant="outline" onClick={() => toast.info('설정에서 모드를 변경할 수 있습니다.')}>
                      모드 업그레이드 안내
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* 고급 AI 매개변수 */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">고급 AI 매개변수</h3>
                    
                    {/* Frequency Penalty */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>반복 억제 (Frequency Penalty)</Label>
                        <Badge variant="outline">{chatSettings.frequencyPenalty}</Badge>
                      </div>
                      <Slider
                        value={[chatSettings.frequencyPenalty]}
                        onValueChange={([value]) => setChatSettings(prev => ({ ...prev, frequencyPenalty: value }))}
                        max={2}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        높을수록 같은 단어나 구문의 반복을 줄입니다
                      </p>
                    </div>

                    {/* Presence Penalty */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>주제 다양성 (Presence Penalty)</Label>
                        <Badge variant="outline">{chatSettings.presencePenalty}</Badge>
                      </div>
                      <Slider
                        value={[chatSettings.presencePenalty]}
                        onValueChange={([value]) => setChatSettings(prev => ({ ...prev, presencePenalty: value }))}
                        max={2}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        높을수록 더 다양한 주제와 어휘를 사용합니다
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-border/30" />

                  {/* 안전 및 필터링 */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">안전 및 필터링</h3>
                    
                    <div className="space-y-2">
                      <Label>안전 수준</Label>
                      <Select
                        value={chatSettings.safetyLevel}
                        onValueChange={(value) => setChatSettings(prev => ({ ...prev, safetyLevel: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BLOCK_NONE">필터링 없음</SelectItem>
                          <SelectItem value="BLOCK_FEW">최소 필터링</SelectItem>
                          <SelectItem value="BLOCK_SOME">보통 필터링</SelectItem>
                          <SelectItem value="BLOCK_MEDIUM_AND_ABOVE">강화 필터링 (권장)</SelectItem>
                          <SelectItem value="BLOCK_MOST">최대 필터링</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>콘텐츠 필터</Label>
                          <p className="text-xs text-muted-foreground">부적절한 콘텐츠 자동 차단</p>
                        </div>
                        <Switch
                          checked={chatSettings.contentFilter}
                          onCheckedChange={(checked) => setChatSettings(prev => ({ ...prev, contentFilter: checked }))}
                        />
                      </div>

                      {isExpert && (
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>감정 분석</Label>
                            <p className="text-xs text-muted-foreground">대화의 감정 상태 인식 및 대응</p>
                          </div>
                          <Switch
                            checked={chatSettings.enableEmotionDetection}
                            onCheckedChange={(checked) => setChatSettings(prev => ({ ...prev, enableEmotionDetection: checked }))}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-border/30" />

                  {/* 음성 설정 */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">음성 출력</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>AI 응답 음성 읽기</Label>
                        <p className="text-xs text-muted-foreground">AI 응답을 자동으로 음성으로 재생</p>
                      </div>
                      <Switch
                        checked={chatSettings.enableTextToSpeech}
                        onCheckedChange={(checked) => setChatSettings(prev => ({ ...prev, enableTextToSpeech: checked }))}
                      />
                    </div>

                    {chatSettings.enableTextToSpeech && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>음성 선택</Label>
                          <Select
                            value={chatSettings.speechVoice}
                            onValueChange={(value) => setChatSettings(prev => ({ ...prev, speechVoice: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="alloy">Alloy (중성적)</SelectItem>
                              <SelectItem value="echo">Echo (남성적)</SelectItem>
                              <SelectItem value="fable">Fable (여성적)</SelectItem>
                              <SelectItem value="onyx">Onyx (깊은 목��리)</SelectItem>
                              <SelectItem value="nova">Nova (밝은 목소리)</SelectItem>
                              <SelectItem value="shimmer">Shimmer (부드러운 목소리)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>음성 속도</Label>
                            <Badge variant="outline">{chatSettings.speechSpeed}x</Badge>
                          </div>
                          <Slider
                            value={[chatSettings.speechSpeed]}
                            onValueChange={([value]) => setChatSettings(prev => ({ ...prev, speechSpeed: value }))}
                            max={2}
                            min={0.5}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </div>

          {/* 하단 액션 버튼 - SafeSettingsModal과 동일한 스타일 */}
          <div className="flex items-center justify-between p-6 border-t border-border/30 bg-background/50">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                초기화
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info('내보내기 기능을 곧 지원할 예정입니다.')}>
                <Download className="w-4 h-4 mr-2" />
                설정 내보내기
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Check className="w-4 h-4 mr-2" />
                저장
              </Button>
            </div>
          </div>
        </Tabs>
      </div>
    </>
  );
}

// ProviderCard 컴포넌트
interface ProviderCardProps {
  provider: any;
  isSelected: boolean;
  isAvailable: boolean;
  apiConfigs: any;
  chatSettings: any;
  setChatSettings: any;
  availableModels: any[];
  isCustom?: boolean;
}

function ProviderCard({ 
  provider, 
  isSelected, 
  isAvailable, 
  apiConfigs, 
  chatSettings, 
  setChatSettings, 
  availableModels,
  isCustom = false
}: ProviderCardProps) {
  return (
    <div
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'border-primary bg-primary/5'
          : isAvailable
            ? 'border-border/50 hover:border-border bg-card/30 hover:bg-card/50'
            : 'border-border/30 bg-muted/20 opacity-50 cursor-not-allowed'
      }`}
      onClick={() => {
        if (isAvailable) {
          setChatSettings((prev: any) => ({
            ...prev,
            selectedProvider: provider.id,
            selectedModel: provider.models[0]?.id || 'default'
          }));
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-sm">
            {provider.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{provider.name}</h4>
              {isSelected && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  선택됨
                </Badge>
              )}
              {!isAvailable && provider.id !== 'rolegpt' && (
                <Badge variant="secondary" className="text-xs">
                  API 키 필요
                </Badge>
              )}
              {provider.isPremium && (
                <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 dark:from-purple-900/30 dark:to-blue-900/30 dark:text-purple-300 text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  고급
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{provider.description}</p>
          </div>
        </div>
        
        {isSelected && availableModels.length > 1 && (
          <Select
            value={chatSettings.selectedModel}
            onValueChange={(value) => setChatSettings((prev: any) => ({ ...prev, selectedModel: value }))}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Custom 모델 설정 */}
      {isSelected && isCustom && (
        <div className="mt-3 space-y-2 pt-3 border-t border-border/30">
          <Input
            placeholder="커스텀 모델 이름"
            value={chatSettings.customModelName}
            onChange={(e) => setChatSettings((prev: any) => ({ 
              ...prev, 
              customModelName: e.target.value 
            }))}
            className="h-8 text-xs"
          />
          <Input
            placeholder="API 엔드포인트 URL"
            value={chatSettings.customEndpoint}
            onChange={(e) => setChatSettings((prev: any) => ({ 
              ...prev, 
              customEndpoint: e.target.value 
            }))}
            className="h-8 text-xs"
          />
        </div>
      )}
    </div>
  );
}
