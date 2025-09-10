import { useState, useEffect } from 'react';
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
import { toast } from "sonner@2.0.3";

interface SimpleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export function SimpleSettingsModal({ isOpen, onClose }: SimpleSettingsModalProps) {
  const { state, updateSettings } = useApp();
  
  // 로컬 설정 상태
  const [localSettings, setLocalSettings] = useState(state.userSettings);
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

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100]" 
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg max-h-[90vh] overflow-hidden bg-background border border-border rounded-xl shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-medium">설정</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 컨텐츠 */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6">
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
                      <Button size="sm" onClick={() => setIsEditingUsername(false)} className="h-8 w-8 p-0">
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditingUsername(false)} className="h-8 w-8 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{userAccount.username}</span>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditingUsername(true)} className="h-8 w-8 p-0">
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
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-2 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave}>
            저장
          </Button>
        </div>
      </div>
    </>
  );
}