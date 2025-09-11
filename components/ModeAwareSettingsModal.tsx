import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { X, User, Edit3, Check, Crown, Lock, Trash2, Download, Globe, Volume2, Palette, Settings2 } from 'lucide-react';
import { useApp } from '../src/context/AppContext';
import { speechManager } from '../src/providers/speech';
import { toast } from "sonner";

interface ModeAwareSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

// 지원 언어 목록
const supportedLanguages = [
  { code: 'auto', name: '자동 감지', nativeName: 'Auto-detect' },
  { code: 'ko', name: '한국어', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: '일본어', nativeName: '日本語' },
  { code: 'es', name: '스페인어', nativeName: 'Español' },
  { code: 'pt', name: '포르투갈어', nativeName: 'Português' },
  { code: 'hi', name: '힌디어', nativeName: 'हिन्दी' }
];

export function ModeAwareSettingsModal({ isOpen, onClose, defaultTab = 'account' }: ModeAwareSettingsModalProps) {
  const { state, updateSettings } = useApp();
  
  // 로컬 설정 상태
  const [localSettings, setLocalSettings] = useState(state.userSettings);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState('User12345');
  
  // 사용자 계정 상태
  const [userAccount, setUserAccount] = useState({
    username: 'User12345',
    email: 'example@gmail.com',
    profileImage: null,
    connectedAccounts: {
      google: false,
      facebook: false,
      github: false
    },
    plan: 'trial',
    trialDaysLeft: 2
  });

  useEffect(() => {
    setLocalSettings(state.userSettings);
  }, [state.userSettings]);

  // 테마 변경 핸들러
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setLocalSettings(prev => ({ ...prev, theme }));
    
    // 실제 테마 적용
    const root = document.documentElement;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.className = systemTheme;
    } else {
      root.className = theme;
    }
    
    updateSettings({ ...localSettings, theme });
    toast.success('테마가 변경되었습니다.');
  };

  // 언어 변경 핸들러
  const handleLanguageChange = (languageCode: string) => {
    setLocalSettings(prev => ({ ...prev, language: languageCode }));
    updateSettings({ ...localSettings, language: languageCode });
    
    // 음성 언어도 함께 변경
    if (speechManager && languageCode !== 'auto') {
      speechManager.setLanguageCode(languageCode);
    }
    
    toast.success('언어가 변경되었습니다.');
  };

  // AI 음성 설정 핸들러
  const handleVoiceToggle = (enabled: boolean) => {
    setLocalSettings(prev => ({ 
      ...prev, 
      speech: { ...prev.speech, enabled } 
    }));
    
    if (speechManager) {
      if (enabled) {
        speechManager.setLanguageCode(localSettings.language === 'auto' ? 'ko' : localSettings.language);
        toast.success('AI 음성이 활성화되었습니다.');
      } else {
        toast.success('AI 음성이 비활성화되었습니다.');
      }
    }
    
    updateSettings({ 
      ...localSettings, 
      speech: { ...localSettings.speech, enabled } 
    });
  };

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleUsernameEdit = () => {
    setTempUsername(userAccount.username);
    setIsEditingUsername(true);
  };

  const handleUsernameCancel = () => {
    setTempUsername(userAccount.username);
    setIsEditingUsername(false);
  };

  const handleUsernameSave = () => {
    setUserAccount(prev => ({ ...prev, username: tempUsername }));
    setIsEditingUsername(false);
    toast.success('사용자명이 변경되었습니다.');
  };

  const handleConnectAccount = (provider: string) => {
    // OAuth 플로우 시뮬레이션
    setUserAccount(prev => ({
      ...prev,
      connectedAccounts: {
        ...prev.connectedAccounts,
        [provider]: !prev.connectedAccounts[provider as keyof typeof prev.connectedAccounts]
      }
    }));
    
    const isConnecting = !userAccount.connectedAccounts[provider as keyof typeof userAccount.connectedAccounts];
    toast.success(`${provider}이 ${isConnecting ? '연결' : '연결 해제'}되었습니다.`);
  };

  const handleDataExport = () => {
    // 사용자 데이터 내보내기
    const userData = {
      account: userAccount,
      settings: localSettings,
      conversations: state.conversations,
      projects: state.projects
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'role-gpt-data.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('데이터가 내보내기되었습니다.');
  };

  const handleDataDelete = () => {
    if (confirm('모든 채팅 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      // 대화 기록 삭제 로직
      toast.success('채팅 기록이 삭제되었습니다.');
    }
  };

  const handleAccountDelete = () => {
    if (confirm('계정을 삭제하시겠습니까? 모든 데이터가 영구적으로 삭제됩니다.')) {
      // 계정 삭제 로직
      toast.success('계정 삭제 요청이 접수되었습니다.');
    }
  };

  console.log('ModeAwareSettingsModal render:', { isOpen, state: !!state });

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden bg-background border border-border rounded-xl">
        <DialogHeader className="flex flex-row items-center justify-between pb-0">
          <DialogTitle className="text-lg font-medium">설정</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <DialogDescription className="sr-only">
          사용자 계정, 언어, AI 설정, 보안 및 맞춤설정을 관리할 수 있습니다.
        </DialogDescription>

        <div className="overflow-y-auto max-h-[70vh] space-y-6 pr-2">
          {/* 계정 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={userAccount.profileImage || undefined} />
                <AvatarFallback className="text-base bg-muted">
                  {userAccount.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {isEditingUsername ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        className="h-8 text-sm"
                        placeholder="사용자명"
                      />
                      <Button size="sm" onClick={handleUsernameSave} className="h-8 w-8 p-0">
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleUsernameCancel} className="h-8 w-8 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{userAccount.username}</span>
                      <Button size="sm" variant="ghost" onClick={handleUsernameEdit} className="h-8 w-8 p-0">
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{userAccount.email}</p>
              </div>
              <Button variant="outline" size="sm">
                관리
              </Button>
            </div>
          </div>

          <Separator />

          {/* 계정 연결 */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              계정 연결
            </h3>
            
            <div className="space-y-3">
              {/* Gmail */}
              <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-medium">G</span>
                  </div>
                  <div>
                    <p className="font-medium">Gmail</p>
                    <p className="text-sm text-muted-foreground">
                      {userAccount.connectedAccounts.google ? userAccount.email : '연결되지 않음'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={userAccount.connectedAccounts.google ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleConnectAccount('google')}
                >
                  {userAccount.connectedAccounts.google ? '연결됨' : '연결'}
                </Button>
              </div>

              {/* Facebook */}
              <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-medium">f</span>
                  </div>
                  <div>
                    <p className="font-medium">Facebook</p>
                    <p className="text-sm text-muted-foreground">
                      {userAccount.connectedAccounts.facebook ? '연결됨' : '연결되지 않음'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={userAccount.connectedAccounts.facebook ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleConnectAccount('facebook')}
                >
                  {userAccount.connectedAccounts.facebook ? '연결됨' : '연결'}
                </Button>
              </div>

              {/* GitHub */}
              <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-white dark:text-gray-900 text-xs font-medium">Gh</span>
                  </div>
                  <div>
                    <p className="font-medium">Github</p>
                    <p className="text-sm text-muted-foreground">
                      {userAccount.connectedAccounts.github ? '연결됨' : '연결되지 않음'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={userAccount.connectedAccounts.github ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleConnectAccount('github')}
                >
                  {userAccount.connectedAccounts.github ? '연결됨' : '연결'}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* 언어 설정 */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              언어
            </h3>
            <div className="space-y-2">
              <Label>인터페이스 언어</Label>
              <Select value={localSettings.language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* AI 음성 설정 */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              AI 음성
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <Label>음성 응답</Label>
                <p className="text-sm text-muted-foreground">AI 응답을 음성으로 들려줍니다</p>
              </div>
              <Switch
                checked={localSettings.speech?.enabled || false}
                onCheckedChange={handleVoiceToggle}
              />
            </div>
          </div>

          <Separator />

          {/* 외관 설정 */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              외관
            </h3>
            <div className="space-y-2">
              <Label>테마</Label>
              <Select value={localSettings.theme} onValueChange={handleThemeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">라이트</SelectItem>
                  <SelectItem value="dark">다크</SelectItem>
                  <SelectItem value="system">시스템</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>메시지 버블</Label>
                  <p className="text-sm text-muted-foreground">대화형 버블 스타일 사용</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>타이핑 애니메이션</Label>
                  <p className="text-sm text-muted-foreground">응답 생성 중 타이핑 효과</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <Separator />

          {/* 맞춤설정 및 보안 */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              맞춤설정 및 보안
            </h3>
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Lock className="w-4 h-4 mr-3" />
                API 보관 라이브러리
              </Button>
              
              <Button variant="outline" className="w-full justify-start" onClick={handleDataExport}>
                <Download className="w-4 h-4 mr-3" />
                계정 데이터 내보내기
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={handleDataDelete}
              >
                <Trash2 className="w-4 h-4 mr-3" />
                대화 기록 삭제
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={handleAccountDelete}
              >
                <Trash2 className="w-4 h-4 mr-3" />
                계정 삭제
              </Button>
            </div>
          </div>
        </div>

        {/* 하단 요금제 배너 */}
        {userAccount.plan === 'trial' && (
          <div className="border-t border-border pt-4 mt-4">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 rounded-full p-2">
                    <Crown className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">체험판</p>
                    <p className="text-xs text-muted-foreground">
                      {userAccount.trialDaysLeft}일 남음 • 무제한 기능 체험
                    </p>
                  </div>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  업그레이드
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave}>
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
