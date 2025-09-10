import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { X, User, Moon, Sun, Monitor, Globe, Bell, Shield, Search, Zap, Image } from 'lucide-react';
import { useApp } from '../src/context/AppContext';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/hooks/useTranslation';
import { LanguageSelector } from './LanguageSelector';
import { SearchRoutingManager } from './SearchRoutingManager';
import { APIKeyManagement } from './APIKeyManagement';
import { ImageGenerationSettings } from './ImageGenerationSettings';
import { LANGUAGE_NAMES, type Language } from '../src/locales';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export function SettingsModal({ isOpen, onClose, initialTab = 'general' }: SettingsModalProps) {
  const { 
    state, 
    updateSettings,
    updateUserApiConfig,
    setUserApiKeys,
    updateSearchConfig,
    toggleSearchCategory
  } = useApp();
  const { theme: currentTheme, setTheme: setGlobalTheme, resolvedTheme } = useTheme();
  const translation = useTranslation();
  const { t, language: currentLanguage, changeLanguage, availableLanguages, isInitialized } = translation;
  
  // Local state for form
  const [theme, setTheme] = useState(currentTheme);
  const [language, setLanguage] = useState(currentLanguage);
  const [notifications, setNotifications] = useState(state.userSettings.notifications.enabled);
  const [desktopNotifications, setDesktopNotifications] = useState(state.userSettings.notifications.desktop);
  const [soundNotifications, setSoundNotifications] = useState(state.userSettings.notifications.sound);
  const [dataCollection, setDataCollection] = useState(state.userSettings.privacy.dataCollection);
  const [analytics, setAnalytics] = useState(state.userSettings.privacy.analytics);
  
  // Language selector state
  const [languageSelectorOpen, setLanguageSelectorOpen] = useState(false);
  
  // API Key management state
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({});
  
  // Update local state when settings change
  useEffect(() => {
    setTheme(currentTheme);
    setLanguage(currentLanguage);
    setNotifications(state.userSettings.notifications.enabled);
    setDesktopNotifications(state.userSettings.notifications.desktop);
    setSoundNotifications(state.userSettings.notifications.sound);
    setDataCollection(state.userSettings.privacy.dataCollection);
    setAnalytics(state.userSettings.privacy.analytics);
  }, [currentTheme, currentLanguage, state.userSettings]);

  const handleSave = () => {
    // 테마 설정을 글로벌 테마 컨텍스트에 적용
    setGlobalTheme(theme);
    
    updateSettings({
      theme,
      language,
      notifications: {
        ...state.userSettings.notifications,
        enabled: notifications,
        desktop: desktopNotifications,
        sound: soundNotifications,
      },
      privacy: {
        ...state.userSettings.privacy,
        dataCollection,
        analytics,
      },
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-medium">설정</DialogTitle>
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
          계정, 테마, 언어, 검색 라우팅, API 키 및 개인정보 설정을 관리할 수 있습니다.
        </DialogDescription>

        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              일반
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              검색 라우팅
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              API 키
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              이미지 생성
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              개인정보
            </TabsTrigger>
          </TabsList>

          {/* 일반 설정 탭 */}
          <TabsContent value="general" className="space-y-6 overflow-y-auto max-h-[60vh]">
            {/* 계정 섹션 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">계정</h3>
              </div>
              <div className="pl-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">프로필 설정</p>
                    <p className="text-sm text-muted-foreground">이름, 이메일 등을 변경할 수 있습니다</p>
                  </div>
                  <Button variant="outline" size="sm">편집</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">구독 관리</p>
                    <p className="text-sm text-muted-foreground">Role GPT 구독을 관리합니다</p>
                  </div>
                  <Button variant="outline" size="sm">관리</Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* 테마 섹션 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">테마</h3>
              </div>
              <div className="pl-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">테마 설정</p>
                    <p className="text-sm text-muted-foreground">
                      현재: {theme === 'system' ? `시스템 (${resolvedTheme === 'dark' ? '다크' : '라이트'})` : theme === 'dark' ? '다크' : '라이트'}
                    </p>
                  </div>
                  <Select value={theme} onValueChange={(value) => {
                    setTheme(value as 'dark' | 'light' | 'system');
                    // 실시간으로 테마 적용
                    setGlobalTheme(value as 'dark' | 'light' | 'system');
                  }}>
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
              </div>
            </div>

            <Separator />

            {/* 언어 섹션 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">언어</h3>
              </div>
              <div className="pl-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">인터페이스 언어</p>
                    <p className="text-sm text-muted-foreground">
                      현재: {LANGUAGE_NAMES[currentLanguage]}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLanguageSelectorOpen(true)}
                  >
                    {LANGUAGE_NAMES[currentLanguage]}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* 알림 섹션 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">알림</h3>
              </div>
              <div className="pl-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">푸시 알림</p>
                    <p className="text-sm text-muted-foreground">새로운 기능이나 업데이트 알림을 받습니다</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">이메일 알림</p>
                    <p className="text-sm text-muted-foreground">중요한 업데이트를 이메일로 받습니다</p>
                  </div>
                  <Switch checked={desktopNotifications} onCheckedChange={setDesktopNotifications} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button onClick={handleSave}>
                저장
              </Button>
            </div>
          </TabsContent>

          {/* 검색 라우팅 탭 */}
          <TabsContent value="search" className="overflow-y-auto max-h-[60vh]">
            <SearchRoutingManager
              onSearch={(response) => {
                console.log('검색 결과:', response);
                // 검색 결과를 콘솔에 표시 (나중에 UI에 통합 가능)
              }}
              userKeys={state.userApiKeys || {}}
              onKeyRequest={(providerId) => {
                // API 키 탭으로 전환
                const tabsList = document.querySelector('[role="tablist"]');
                const apiTab = tabsList?.querySelector('[value="api"]') as HTMLElement;
                if (apiTab) {
                  apiTab.click();
                }
              }}
            />
          </TabsContent>

          {/* API 키 관리 탭 */}
          <TabsContent value="api" className="overflow-y-auto max-h-[60vh]">
            <APIKeyManagement
              apiConfigs={state.userApiKeys || {}}
              onUpdateApiConfig={(providerId, updates) => {
                updateUserApiConfig(providerId, updates);
              }}
              showApiKeys={showApiKeys}
              onToggleApiKeyVisibility={(providerId) => {
                setShowApiKeys(prev => ({
                  ...prev,
                  [providerId]: !prev[providerId]
                }));
              }}
              expandedProviders={expandedProviders}
              onToggleProviderExpanded={(providerId) => {
                setExpandedProviders(prev => ({
                  ...prev,
                  [providerId]: !prev[providerId]
                }));
              }}
            />
          </TabsContent>

          {/* 이미지 생성 탭 */}
          <TabsContent value="image" className="space-y-6 overflow-y-auto max-h-[60vh]">
            <ImageGenerationSettings
              userSettings={state.userSettings}
              apiKeys={state.userApiKeys || {}}
              onUpdateSettings={(updates) => {
                updateSettings(updates);
              }}
              onUpdateApiKeys={(apiKeyUpdates) => {
                setUserApiKeys(apiKeyUpdates);
              }}
            />
          </TabsContent>

          {/* 개인정보 탭 */}
          <TabsContent value="privacy" className="space-y-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">개인정보 및 데이터</h3>
              </div>
              <div className="pl-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">채팅 자동 저장</p>
                    <p className="text-sm text-muted-foreground">채팅 내용을 자동으로 저장합니다</p>
                  </div>
                  <Switch checked={dataCollection} onCheckedChange={setDataCollection} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">사용량 분석</p>
                    <p className="text-sm text-muted-foreground">앱 개선을 위한 익명 사용량 데이터를 수집합니다</p>
                  </div>
                  <Switch checked={analytics} onCheckedChange={setAnalytics} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">데이터 내보내기</p>
                    <p className="text-sm text-muted-foreground">내 채팅 데이터를 다운로드합니다</p>
                  </div>
                  <Button variant="outline" size="sm">다운로드</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-destructive">모든 데이터 삭제</p>
                    <p className="text-sm text-muted-foreground">모든 채팅 기록을 영구적으로 삭제합니다</p>
                  </div>
                  <Button variant="destructive" size="sm">삭제</Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button onClick={handleSave}>
                저장
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      {/* Language Selector Modal */}
      <LanguageSelector
        isOpen={languageSelectorOpen}
        onClose={() => setLanguageSelectorOpen(false)}
        onLanguageSelect={(selectedLang: Language) => {
          changeLanguage(selectedLang);
          setLanguage(selectedLang);
        }}
        currentLanguage={currentLanguage}
      />
    </Dialog>
  );
}