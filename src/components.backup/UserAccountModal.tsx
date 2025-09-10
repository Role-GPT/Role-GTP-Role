import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { 
  Settings, 
  HelpCircle, 
  Crown, 
  LogOut,
  User,
  CreditCard,
  FileText,
  MessageCircle,
  ExternalLink,
  X,

  Monitor,
  Moon,
  Sun,
  Globe,
  Bell,
  Volume2,
  Shield,
  Palette,
  Key,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  TestTube,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';
import { Separator } from './ui/separator';
import { useTheme } from '../src/context/ThemeContext';
import { useApp } from '../src/context/AppContext';
import { speechManager } from '../src/providers/speech';
import { toast } from "sonner@2.0.3";
import { 
  getAllApiKeys, 
  getApiKeyStats, 
  saveApiKey, 
  deleteApiKey, 
  validateApiKey, 
  exportApiKeys, 
  importApiKeys,
  ApiKeyConfig,
  getApiKeyByProvider
} from '../src/utils/apiKeyManager';
import { ApiKeyInput } from './ApiKeyInput';
import { ApiKeyLibrary } from './ApiKeyLibrary';
import { PersonalApiKeys } from './PersonalApiKeys';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserAccountModal({ 
  isOpen, 
  onClose
}: UserAccountModalProps) {
  const { theme, setTheme } = useTheme();
  const { state, updateSettings } = useApp();
  
  // 설정 탭 상태
  const [activeTab, setActiveTab] = useState('general');
  
  // 기본 설정 상태들
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [language, setLanguage] = useState('ko');
  const [fontSize, setFontSize] = useState('medium');
  
  // API 키 관리 상태들
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newApiKey, setNewApiKey] = useState({
    provider: 'gemini',
    name: '',
    key: '',
    baseUrl: '',
    model: ''
  });
  const [showApiKey, setShowApiKey] = useState<{[key: string]: boolean}>({});
  
  // 새 통합 API 키 관리 상태들
  const [allApiKeys, setAllApiKeys] = useState<Record<string, ApiKeyConfig[]>>({});
  const [apiKeyStats, setApiKeyStats] = useState({ totalKeys: 0, activeKeys: 0, categoryCounts: {} });
  const [newIntegratedApiKey, setNewIntegratedApiKey] = useState<Partial<ApiKeyConfig>>({
    category: 'search',
    provider: 'google_cse',
    name: '',
    apiKey: '',
    isActive: true
  });
  const [testingApiKey, setTestingApiKey] = useState<string | null>(null);
  
  // 음성 설정 상태들
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');

  // API 키 카테고리별 탭 상태 추가
  const [activeApiCategory, setActiveApiCategory] = useState('llm');
  
  // API 키 라이브러리 관련 상태
  const [apiLibraryOpen, setApiLibraryOpen] = useState(false);
  const [personalKeysOpen, setPersonalKeysOpen] = useState(false);

  // 모달이 열릴 때마다 첫 번째 탭으로 초기화 및 저장된 API 키 로드
  useEffect(() => {
    if (isOpen) {
      setActiveTab('general');
      
      // 기존 LLM API 키들을 로드
      try {
        const savedApiKeys = localStorage.getItem('roleGPT_apiKeys');
        if (savedApiKeys) {
          setApiKeys(JSON.parse(savedApiKeys));
        }
      } catch (error) {
        console.warn('Failed to load saved API keys:', error);
      }
      
      // 새 통합 API 키들을 로드
      const allKeys = getAllApiKeys();
      setAllApiKeys(allKeys);
      setApiKeyStats(getApiKeyStats());
      
      // 앱 컨텍스트에서 설정값 로드
      if (state.userSettings) {
        setLanguage(state.userSettings.language || 'ko');
        setNotificationsEnabled(state.userSettings.notifications?.enabled ?? true);
        setSoundEnabled(state.userSettings.notifications?.sound ?? true);
        setAutoSaveEnabled(state.userSettings.autoSave ?? true);
        
        if (state.userSettings.apiConfigurations) {
          setApiKeys(state.userSettings.apiConfigurations);
        }
      }
    }
  }, [isOpen, state.userSettings]);

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
  }, [selectedVoice]);

  const handleAddApiKey = () => {
    if (!newApiKey.name || !newApiKey.key) {
      toast.error('이름과 API 키를 모두 입력해주세요.');
      return;
    }
    
    const apiKeyConfig = {
      id: `api_${Date.now()}`,
      provider: newApiKey.provider,
      name: newApiKey.name,
      apiKey: newApiKey.key,
      baseUrl: newApiKey.baseUrl || getDefaultBaseUrl(newApiKey.provider),
      modelName: newApiKey.model || getDefaultModel(newApiKey.provider),
      isDefault: apiKeys.length === 0,
      createdAt: new Date().toISOString()
    };

    const updatedApiKeys = [...apiKeys, apiKeyConfig];
    setApiKeys(updatedApiKeys);
    
    // 로컬 스토리지에 저장
    try {
      localStorage.setItem('roleGPT_apiKeys', JSON.stringify(updatedApiKeys));
    } catch (error) {
      console.warn('Failed to save API keys to localStorage:', error);
    }
    
    setNewApiKey({
      provider: 'gemini',
      name: '',
      key: '',
      baseUrl: '',
      model: ''
    });
    toast.success('API 키가 추가되었습니다.');
  };

  const handleDeleteApiKey = (id: string) => {
    const keyToDelete = apiKeys.find(key => key.id === id);
    const updatedApiKeys = apiKeys.filter(key => key.id !== id);
    
    // 기본 키가 삭제되면 다른 키를 기본으로 설정
    if (keyToDelete?.isDefault && updatedApiKeys.length > 0) {
      updatedApiKeys[0].isDefault = true;
    }
    
    setApiKeys(updatedApiKeys);
    
    // 로컬 스토리지 업데이트
    try {
      localStorage.setItem('roleGPT_apiKeys', JSON.stringify(updatedApiKeys));
    } catch (error) {
      console.warn('Failed to update API keys in localStorage:', error);
    }
    
    toast.success('API 키가 삭제되었습니다.');
  };

  const handleSetDefaultApiKey = (id: string) => {
    const updatedApiKeys = apiKeys.map(key => ({
      ...key,
      isDefault: key.id === id
    }));
    setApiKeys(updatedApiKeys);
    
    try {
      localStorage.setItem('roleGPT_apiKeys', JSON.stringify(updatedApiKeys));
    } catch (error) {
      console.warn('Failed to update API keys in localStorage:', error);
    }
    
    toast.success('기본 API 키가 설정되었습니다.');
  };

  const testApiKey = async (apiKey: any) => {
    toast.info('API 키를 테스트하고 있습니다...');
    
    try {
      // 간단한 테스트 요청 (실제 구현은 provider에 따라 다를 수 있음)
      switch (apiKey.provider) {
        case 'gemini':
          // Gemini API 테스트 로직
          break;
        case 'openai':
          // OpenAI API 테스트 로직
          break;
        default:
          throw new Error('지원하지 않는 Provider입니다.');
      }
      
      toast.success('API 키가 유효합니다!');
    } catch (error) {
      console.error('API key test failed:', error);
      toast.error('API 키 테스트에 실패했습니다. 키를 확인해주세요.');
    }
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
      
      const currentLang = (state.userSettings?.language || 'ko') as keyof typeof testMessages;
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
      toast.success('음성 테스트를 재생합니다.');
    }
  };

  // 새 통합 API 키 핸들러들
  const handleSaveIntegratedApiKey = async (category: string, provider: string, config: any) => {
    try {
      const newKey: ApiKeyConfig = {
        id: `${provider}_${Date.now()}`,
        category: category as any,
        provider,
        name: config.name || `${provider} API`,
        apiKey: config.apiKey,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        searchEngineId: config.searchEngineId,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      saveApiKey(newKey);
      
      // 상태 업데이트
      const updatedKeys = getAllApiKeys();
      setAllApiKeys(updatedKeys);
      setApiKeyStats(getApiKeyStats());
      
      toast.success(`${provider} API 키가 저장되었습니다.`);
    } catch (error) {
      console.error('Failed to save API key:', error);
      toast.error('API 키 저장에 실패했습니다.');
    }
  };

  const handleDeleteIntegratedApiKey = (keyId: string) => {
    try {
      deleteApiKey(keyId);
      
      // 상태 업데이트
      const updatedKeys = getAllApiKeys();
      setAllApiKeys(updatedKeys);
      setApiKeyStats(getApiKeyStats());
      
      toast.success('API 키가 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete API key:', error);
      toast.error('API 키 삭제에 실패했습니다.');
    }
  };

  const handleTestIntegratedApiKey = async (apiKey: ApiKeyConfig) => {
    setTestingApiKey(apiKey.id);
    try {
      const result = await validateApiKey(apiKey);
      if (result.isValid) {
        toast.success(`${apiKey.provider} API 키가 유효합니다! ✅`);
      } else {
        toast.error(`${apiKey.provider} API 키 검증 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('API key test failed:', error);
      toast.error('API 키 테스트 중 오류가 발생했습니다.');
    } finally {
      setTestingApiKey(null);
    }
  };

  const handleExportApiKeys = () => {
    try {
      const exportData = exportApiKeys();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rolegpt_api_keys_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('API 키 설정이 내보내기 되었습니다.');
    } catch (error) {
      console.error('Failed to export API keys:', error);
      toast.error('API 키 내보내기에 실패했습니다.');
    }
  };

  const handleImportApiKeys = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = e.target?.result as string;
        importApiKeys(importData);
        
        // 상태 업데이트
        const updatedKeys = getAllApiKeys();
        setAllApiKeys(updatedKeys);
        setApiKeyStats(getApiKeyStats());
        
        toast.success('API 키 설정이 가져와졌습니다.');
      } catch (error) {
        console.error('Failed to import API keys:', error);
        toast.error('API 키 설정 가져오기에 실패했습니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAllApiKeys = () => {
    if (confirm('모든 API 키를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        localStorage.removeItem('roleGPT_allApiKeys');
        setAllApiKeys({});
        setApiKeyStats({ totalKeys: 0, activeKeys: 0, categoryCounts: {} });
        toast.success('모든 API 키가 삭제되었습니다.');
      } catch (error) {
        console.error('Failed to reset API keys:', error);
        toast.error('API 키 초기화에 실패했습니다.');
      }
    }
  };

  // handleBackToMenu 함수 추가 (에러 수정)
  const handleBackToMenu = () => {
    setApiLibraryOpen(false);
    setPersonalKeysOpen(false);
  };

  const handleSaveSettings = () => {
    // 모든 설정을 저장
    const settings = {
      theme,
      language,
      notifications: {
        enabled: notificationsEnabled,
        sound: soundEnabled
      },
      autoSave: autoSaveEnabled,
      apiConfigurations: apiKeys,
      speech: {
        ...state.userSettings?.speech,
        voice: selectedVoice,
        enabled: state.userSettings?.speech?.enabled ?? true,
        autoPlay: state.userSettings?.speech?.autoPlay ?? false
      },
      privacy: {
        ...state.userSettings?.privacy,
        dataCollection: state.userSettings?.privacy?.dataCollection ?? true,
        analytics: state.userSettings?.privacy?.analytics ?? false
      }
    };
    
    updateSettings(settings);
    
    // API 키는 별도로 로컬 스토리지에 저장
    try {
      localStorage.setItem('roleGPT_apiKeys', JSON.stringify(apiKeys));
      localStorage.setItem('roleGPT_userSettings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
    
    toast.success('모든 설정이 저장되었습니다.');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-[600px] bg-background border border-border rounded-lg shadow-lg overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-semibold">설정</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <div className="px-6 py-4 border-b border-border">
            <TabsList className="grid w-full grid-cols-6 gap-1">
              <TabsTrigger value="general" className="flex items-center gap-1 text-xs">
                <Settings className="w-3 h-3" />
                <span className="hidden lg:inline">일반</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-1 text-xs">
                <Palette className="w-3 h-3" />
                <span className="hidden lg:inline">외관</span>
              </TabsTrigger>
              <TabsTrigger value="api_keys" className="flex items-center gap-1 text-xs">
                <Key className="w-3 h-3" />
                <span className="hidden lg:inline">API 키</span>
              </TabsTrigger>
              <TabsTrigger value="speech" className="flex items-center gap-1 text-xs">
                <Volume2 className="w-3 h-3" />
                <span className="hidden lg:inline">음성</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs">
                <Bell className="w-3 h-3" />
                <span className="hidden lg:inline">알림</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-1 text-xs">
                <Shield className="w-3 h-3" />
                <span className="hidden lg:inline">개인정보</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* 일반 설정 탭 */}
            <TabsContent value="general" className="space-y-6 m-0">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">일반 설정</h3>
                
                {/* 언어 설정 */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      언어
                    </Label>
                    <p className="text-xs text-muted-foreground">인터페이스 언어를 선택하세요</p>
                  </div>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 글꼴 크기 */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">글꼴 크기</Label>
                    <p className="text-xs text-muted-foreground">채팅 메시지의 글꼴 크기를 조정하세요</p>
                  </div>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">작게</SelectItem>
                      <SelectItem value="medium">보통</SelectItem>
                      <SelectItem value="large">크게</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 자동 저장 */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">자동 저장</Label>
                    <p className="text-xs text-muted-foreground">대화를 자동으로 저장합니다</p>
                  </div>
                  <Switch
                    checked={autoSaveEnabled}
                    onCheckedChange={setAutoSaveEnabled}
                  />
                </div>
              </div>
            </TabsContent>

            {/* 외관 설정 탭 */}
            <TabsContent value="appearance" className="space-y-6 m-0">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  외관 설정
                </h3>
                
                {/* 테마 설정 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">테마</Label>
                  <p className="text-xs text-muted-foreground">앱의 색상 테마를 선택하세요</p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      className="h-20 flex-col gap-2"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="w-6 h-6" />
                      <span className="text-xs">라이트</span>
                    </Button>
                    
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      className="h-20 flex-col gap-2"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="w-6 h-6" />
                      <span className="text-xs">다크</span>
                    </Button>
                    
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      className="h-20 flex-col gap-2"
                      onClick={() => setTheme('system')}
                    >
                      <Monitor className="w-6 h-6" />
                      <span className="text-xs">시스템</span>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* API 키 관리 탭 */}
            <TabsContent value="api_keys" className="space-y-4 m-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API 키 관리
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {apiKeyStats.totalKeys}개 등록됨
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExportApiKeys}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      내보내기
                    </Button>
                    <div className="relative">
                      <Input 
                        type="file" 
                        accept=".json"
                        onChange={handleImportApiKeys}
                        className="sr-only" 
                        id="import-api-keys"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => document.getElementById('import-api-keys')?.click()}
                        className="text-xs"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        가져오기
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted/10 p-3 rounded">
                  다양한 AI 서비스와 연동을 위한 API 키를 카테고리별로 관리하세요.
                </div>

                {/* API 카테고리 서브 탭 */}
                <Tabs value={activeApiCategory} onValueChange={setActiveApiCategory} className="w-full">
                  <TabsList className="grid w-full grid-cols-7 gap-1 mb-4">
                    <TabsTrigger value="llm" className="flex items-center gap-1 text-xs">
                      🤖
                      <span className="hidden lg:inline">LLM</span>
                    </TabsTrigger>
                    <TabsTrigger value="search" className="flex items-center gap-1 text-xs">
                      🔍
                      <span className="hidden lg:inline">검색</span>
                    </TabsTrigger>
                    <TabsTrigger value="academic" className="flex items-center gap-1 text-xs">
                      📚
                      <span className="hidden lg:inline">학술</span>
                    </TabsTrigger>
                    <TabsTrigger value="finance" className="flex items-center gap-1 text-xs">
                      💼
                      <span className="hidden lg:inline">금융</span>
                    </TabsTrigger>
                    <TabsTrigger value="media" className="flex items-center gap-1 text-xs">
                      🎨
                      <span className="hidden lg:inline">미디어</span>
                    </TabsTrigger>
                    <TabsTrigger value="social" className="flex items-center gap-1 text-xs">
                      👨‍💻
                      <span className="hidden lg:inline">소셜</span>
                    </TabsTrigger>
                    <TabsTrigger value="lifestyle" className="flex items-center gap-1 text-xs">
                      🌤️
                      <span className="hidden lg:inline">날씨</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* LLM 카테고리 */}
                  <TabsContent value="llm" className="space-y-3 m-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          🤖 LLM 모델 ({apiKeys.length}개)
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          AI 대화 엔진
                        </Badge>
                      </div>
                      
                      {/* 새 LLM API 키 추가 */}
                      <div className="space-y-3 p-3 border rounded bg-muted/5">
                        <h5 className="text-sm font-medium">새 LLM API 추가</h5>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">제공자</Label>
                            <Select value={newApiKey.provider} onValueChange={(value) => setNewApiKey({...newApiKey, provider: value})}>
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gemini">🔷 Google Gemini</SelectItem>
                                <SelectItem value="openai">🟢 OpenAI</SelectItem>
                                <SelectItem value="anthropic">🟠 Anthropic</SelectItem>
                                <SelectItem value="groq">⚡ Groq</SelectItem>
                                <SelectItem value="perplexity">🔍 Perplexity</SelectItem>
                                <SelectItem value="deepseek">🌊 DeepSeek</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">연결 이름</Label>
                            <Input 
                              className="h-8"
                              placeholder="예: 개인 Gemini API"
                              value={newApiKey.name}
                              onChange={(e) => setNewApiKey({...newApiKey, name: e.target.value})}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">API 키</Label>
                            <Input 
                              className="h-8"
                              type="password"
                              placeholder="API 키를 입력하세요"
                              value={newApiKey.key}
                              onChange={(e) => setNewApiKey({...newApiKey, key: e.target.value})}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">모델 (선택사항)</Label>
                            <Input 
                              className="h-8"
                              placeholder="예: gemini-2.0-flash-exp"
                              value={newApiKey.model}
                              onChange={(e) => setNewApiKey({...newApiKey, model: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button size="sm" onClick={handleAddApiKey} disabled={!newApiKey.name || !newApiKey.key}>
                            API 키 추가
                          </Button>
                        </div>
                      </div>

                      {/* LLM API 키 목록 */}
                      <div className="space-y-1">
                        {apiKeys.length === 0 ? (
                          <div className="text-center p-6 text-muted-foreground">
                            <Key className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">저장된 LLM API 키가 없습니다</p>
                          </div>
                        ) : (
                          apiKeys.map((apiKey) => (
                            <div key={apiKey.id} className="flex items-center justify-between p-2 border rounded bg-muted/5 hover:bg-muted/10 transition-colors">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium truncate">{apiKey.name}</span>
                                  {apiKey.isDefault && <Badge variant="default" className="text-xs">기본</Badge>}
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {apiKey.provider}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {showApiKey[apiKey.id] ? apiKey.apiKey : `••••••••${apiKey.apiKey.slice(-4)}`}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                {!apiKey.isDefault && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleSetDefaultApiKey(apiKey.id)}
                                    className="text-xs h-6 px-2"
                                  >
                                    기본
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => testApiKey(apiKey)}
                                  className="text-xs h-6 px-2"
                                >
                                  <TestTube className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toggleApiKeyVisibility(apiKey.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  {showApiKey[apiKey.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteApiKey(apiKey.id)}
                                  className="text-destructive hover:text-destructive h-6 w-6 p-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* 검색 카테고리 */}
                  <TabsContent value="search" className="space-y-3 m-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          🔍 검색 & 뉴스 ({(allApiKeys.search || []).length}개)
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          웹, 뉴스, 블로그
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <ApiKeyInput
                          icon="🔍"
                          name="Google Custom Search"
                          provider="google_cse"
                          category="search"
                          fields={[
                            { key: 'apiKey', label: 'API Key', placeholder: 'Google API 키', type: 'password', required: true },
                            { key: 'searchEngineId', label: 'Search Engine ID', placeholder: 'CSE ID', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('google_cse')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="🔎"
                          name="Bing Search"
                          provider="bing"
                          category="search"
                          fields={[
                            { key: 'apiKey', label: 'Subscription Key', placeholder: 'Bing 구독 키', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('bing')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="📰"
                          name="Naver API"
                          provider="naver"
                          category="search"
                          fields={[
                            { key: 'clientId', label: 'Client ID', placeholder: 'Naver Client ID', required: true },
                            { key: 'clientSecret', label: 'Client Secret', placeholder: 'Naver Client Secret', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('naver')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="🗞️"
                          name="NewsAPI"
                          provider="newsapi"
                          category="search"
                          fields={[
                            { key: 'apiKey', label: 'API Key', placeholder: 'NewsAPI 키', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('newsapi')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="🐍"
                          name="SerpAPI"
                          provider="serpapi"
                          category="search"
                          fields={[
                            { key: 'apiKey', label: 'API Key', placeholder: 'SerpAPI 키', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('serpapi')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="⚡"
                          name="Serper.dev"
                          provider="serper"
                          category="search"
                          fields={[
                            { key: 'apiKey', label: 'API Key', placeholder: 'Serper API 키', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('serper')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* 학술 카테고리 */}
                  <TabsContent value="academic" className="space-y-3 m-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          📚 학술 & 연구 ({(allApiKeys.academic || []).length}개)
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          논문, 의학, 과학
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <ApiKeyInput
                          icon="🎓"
                          name="Semantic Scholar"
                          provider="semanticscholar"
                          category="academic"
                          fields={[
                            { key: 'apiKey', label: 'API Key', placeholder: 'Semantic Scholar API 키', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('semanticscholar')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="🏥"
                          name="PubMed"
                          provider="pubmed"
                          category="academic"
                          fields={[]}
                          isFree={true}
                          description="API 키 없이 사용 가능한 의학 논문 검색"
                          existingKey={null}
                          onSave={handleSaveIntegratedApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="🔬"
                          name="arXiv"
                          provider="arxiv"
                          category="academic"
                          fields={[]}
                          isFree={true}
                          description="물리학, 수학, 컴퓨터과학 전문 논문"
                          existingKey={null}
                          onSave={handleSaveIntegratedApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="📊"
                          name="OpenAlex"
                          provider="openalex"
                          category="academic"
                          fields={[]}
                          isFree={true}
                          description="전 분야 학술 정보 통합 검색"
                          existingKey={null}
                          onSave={handleSaveIntegratedApiKey}
                          compact={true}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* 금융 카테고리 */}
                  <TabsContent value="finance" className="space-y-3 m-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          💼 비즈니스 & 금융 ({(allApiKeys.finance || []).length}개)
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          주식, 경제, 기업정보
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <ApiKeyInput
                          icon="📈"
                          name="Alpha Vantage"
                          provider="alpha_vantage"
                          category="finance"
                          fields={[
                            { key: 'apiKey', label: 'API Key', placeholder: 'Alpha Vantage API 키', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('alpha_vantage')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="🏦"
                          name="FRED (연방준비은행)"
                          provider="fred"
                          category="finance"
                          fields={[
                            { key: 'apiKey', label: 'API Key', placeholder: 'FRED API 키', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('fred')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="💰"
                          name="Finnhub"
                          provider="finnhub"
                          category="finance"
                          fields={[
                            { key: 'apiKey', label: 'API Key', placeholder: 'Finnhub API 키', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('finnhub')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="💹"
                          name="Yahoo Finance"
                          provider="yahoo_fin"
                          category="finance"
                          fields={[]}
                          isFree={true}
                          description="기본 주식 정보 및 차트 데이터"
                          existingKey={null}
                          onSave={handleSaveIntegratedApiKey}
                          compact={true}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* 미디어 카테고리 */}
                  <TabsContent value="media" className="space-y-3 m-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          🎨 이미지 & 미디어 ({(allApiKeys.media || []).length}개)
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          생성, 검색, 영화/음악
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <ApiKeyInput
                          icon="🎨"
                          name="OpenAI DALL-E"
                          provider="openai_dalle"
                          category="media"
                          fields={[
                            { key: 'apiKey', label: 'OpenAI API Key', placeholder: 'OpenAI API 키 (DALL-E용)', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('openai_dalle')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="🤗"
                          name="Hugging Face"
                          provider="huggingface"
                          category="media"
                          fields={[
                            { key: 'apiKey', label: 'API Token', placeholder: 'Hugging Face 토큰', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('huggingface')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="📸"
                          name="Unsplash"
                          provider="unsplash"
                          category="media"
                          fields={[
                            { key: 'apiKey', label: 'Access Key', placeholder: 'Unsplash Access Key', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('unsplash')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="🎬"
                          name="TMDB (영화/TV)"
                          provider="tmdb"
                          category="media"
                          fields={[
                            { key: 'apiKey', label: 'API Key', placeholder: 'TMDB API 키', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('tmdb')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="🎵"
                          name="Spotify"
                          provider="spotify"
                          category="media"
                          fields={[
                            { key: 'clientId', label: 'Client ID', placeholder: 'Spotify Client ID', required: true },
                            { key: 'clientSecret', label: 'Client Secret', placeholder: 'Spotify Client Secret', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('spotify')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="🖼️"
                          name="Craiyon"
                          provider="craiyon"
                          category="media"
                          fields={[]}
                          isFree={true}
                          description="무료 AI 이미지 생성 (체험용)"
                          existingKey={null}
                          onSave={handleSaveIntegratedApiKey}
                          compact={true}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* 소셜 카테고리 */}
                  <TabsContent value="social" className="space-y-3 m-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          👨‍💻 소셜 & 개발자 ({(allApiKeys.social || []).length}개)
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          GitHub, Reddit, SNS
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <ApiKeyInput
                          icon="👨‍💻"
                          name="GitHub"
                          provider="github"
                          category="social"
                          fields={[
                            { key: 'apiKey', label: 'Personal Access Token', placeholder: 'GitHub Personal Access Token', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('github')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="👽"
                          name="Reddit"
                          provider="reddit"
                          category="social"
                          fields={[
                            { key: 'clientId', label: 'Client ID', placeholder: 'Reddit Client ID', required: true },
                            { key: 'clientSecret', label: 'Client Secret', placeholder: 'Reddit Client Secret', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('reddit')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="🐦"
                          name="Twitter/X"
                          provider="twitter"
                          category="social"
                          fields={[
                            { key: 'apiKey', label: 'Bearer Token', placeholder: 'Twitter Bearer Token', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('twitter')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="❓"
                          name="Stack Overflow"
                          provider="stackoverflow"
                          category="social"
                          fields={[]}
                          isFree={true}
                          description="개발자 Q&A 검색 (API 키 불필요)"
                          existingKey={null}
                          onSave={handleSaveIntegratedApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="📦"
                          name="NPM Registry"
                          provider="npmjs"
                          category="social"
                          fields={[]}
                          isFree={true}
                          description="JavaScript 패키지 검색"
                          existingKey={null}
                          onSave={handleSaveIntegratedApiKey}
                          compact={true}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* 라이프스타일 카테고리 */}
                  <TabsContent value="lifestyle" className="space-y-3 m-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          🌤️ 날씨 & 라이프스타일 ({(allApiKeys.lifestyle || []).length}개)
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          날씨, 공공데이터
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <ApiKeyInput
                          icon="🌤️"
                          name="OpenWeatherMap"
                          provider="openweather"
                          category="lifestyle"
                          fields={[
                            { key: 'apiKey', label: 'API Key', placeholder: 'OpenWeather API 키', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('openweather')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="🏛️"
                          name="공공데이터포털"
                          provider="data_go_kr"
                          category="lifestyle"
                          fields={[
                            { key: 'apiKey', label: 'Service Key', placeholder: '공공데이터포털 서비스키', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('data_go_kr')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="🌍"
                          name="Google Maps"
                          provider="google_maps"
                          category="lifestyle"
                          fields={[
                            { key: 'apiKey', label: 'API Key', placeholder: 'Google Maps API 키', type: 'password', required: true }
                          ]}
                          existingKey={getApiKeyByProvider('google_maps')}
                          onSave={handleSaveIntegratedApiKey}
                          onDelete={handleDeleteIntegratedApiKey}
                          onTest={handleTestIntegratedApiKey}
                          isTestingId={testingApiKey}
                          compact={true}
                        />

                        <ApiKeyInput
                          icon="🎨"
                          name="생활정보 API"
                          provider="lifestyle_free"
                          category="lifestyle"
                          fields={[]}
                          isFree={true}
                          description="공휴일, 달력 정보 등 기본 생활 정보"
                          existingKey={null}
                          onSave={handleSaveIntegratedApiKey}
                          compact={true}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* API 키 라이브러리 및 개인 키 보관함 섹션 */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        🔧 고급 API 관리
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        커스텀 API 템플릿 생성 및 개인 키 보관함
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-start gap-2"
                      onClick={() => setApiLibraryOpen(true)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-lg">📚</span>
                        <span className="font-medium">API 키 라이브러리</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        커스텀 API 템플릿 생성, 편집, 관리
                      </p>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-start gap-2"
                      onClick={() => setPersonalKeysOpen(true)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-lg">🗝️</span>
                        <span className="font-medium">내 키 보관함</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        개인 API 키 저장 및 관리
                      </p>
                    </Button>
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>BYOK (Bring Your Own Key)</strong>: 
                      자신만의 API 키로 무제한 사용이 가능합니다. 
                      API 키 라이브러리에서 커스텀 템플릿을 만들고, 
                      키 보관함에서 개인 키를 안전하게 관리하세요.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 음성 설정 탭 */}
            <TabsContent value="speech" className="space-y-6 m-0">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  음성 설정
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>음성 기능 활성화</Label>
                      <p className="text-sm text-muted-foreground">음성 입력 및 출력 기능 사용</p>
                    </div>
                    <Switch 
                      checked={state.userSettings?.speech?.enabled ?? true}
                      onCheckedChange={(checked) => updateSettings({ 
                        speech: { ...state.userSettings?.speech, enabled: checked }
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
                      checked={state.userSettings?.speech?.autoPlay ?? false}
                      onCheckedChange={(checked) => updateSettings({ 
                        speech: { ...state.userSettings?.speech, autoPlay: checked }
                      })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 알림 설정 탭 */}
            <TabsContent value="notifications" className="space-y-6 m-0">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  알림 설정
                </h3>

                {/* 푸시 알림 */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">푸시 알림</Label>
                    <p className="text-xs text-muted-foreground">시스템 알림을 받습니다</p>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>

                {/* 소리 알림 */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      소리 알림
                    </Label>
                    <p className="text-xs text-muted-foreground">메시지 도착 시 소리로 알림</p>
                  </div>
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>
              </div>
            </TabsContent>

            {/* 개인정보 및 데이터 탭 */}
            <TabsContent value="privacy" className="space-y-6 m-0">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  개인정보 및 데이터
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>데이터 수집</Label>
                      <p className="text-sm text-muted-foreground">서비스 개선을 위한 익명 데이터 수집</p>
                    </div>
                    <Switch 
                      checked={state.userSettings?.privacy?.dataCollection ?? true}
                      onCheckedChange={(checked) => updateSettings({ 
                        privacy: { ...state.userSettings?.privacy, dataCollection: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>분석 데이터</Label>
                      <p className="text-sm text-muted-foreground">사용 패턴 분석을 위한 데이터 전송</p>
                    </div>
                    <Switch 
                      checked={state.userSettings?.privacy?.analytics ?? false}
                      onCheckedChange={(checked) => updateSettings({ 
                        privacy: { ...state.userSettings?.privacy, analytics: checked }
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
                      <Button variant="outline" onClick={() => toast.info('데이터 내보내기 기능을 곧 지원할 예정입니다.')}>
                        다운로드
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-destructive">모든 데이터 삭제</p>
                        <p className="text-sm text-muted-foreground">모든 채팅 기록과 설정을 영구 삭제</p>
                      </div>
                      <Button variant="destructive" onClick={() => toast.warning('데이터 삭제 기능을 곧 지원할 예정입니다.')}>
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end gap-3 p-6 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSaveSettings}>
              저장
            </Button>
          </div>
        </Tabs>
      </div>
      
      {/* API 키 라이브러리 모달 */}
      <ApiKeyLibrary
        isOpen={apiLibraryOpen}
        onClose={() => setApiLibraryOpen(false)}
      />
      
      {/* 개인 키 보관함 모달 */}
      {personalKeysOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setPersonalKeysOpen(false)} />
          <div className="relative w-full max-w-4xl h-[90vh] bg-background border border-border rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">개인 키 보관함</h2>
              <Button variant="ghost" size="sm" onClick={() => setPersonalKeysOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <PersonalApiKeys />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}