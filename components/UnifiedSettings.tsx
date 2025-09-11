import { useState } from 'react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  X, 
  User, 
  Settings, 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  Shield, 
  Zap, 
  Crown,
  Download,
  Trash2,
  Volume2,
  Mic,
  Camera,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

interface UnifiedSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UnifiedSettings({ isOpen, onClose }: UnifiedSettingsProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('korean');
  const [autoSave, setAutoSave] = useState(true);
  const [voiceInput, setVoiceInput] = useState(false);
  const [responseSpeed, setResponseSpeed] = useState([1]);
  const [creativity, setCreativity] = useState([0.7]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex">
      {/* Settings Sidebar */}
      <div className="w-80 bg-muted/30 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">설정</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <User className="h-4 w-4 mr-3" />
              계정
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-3" />
              일반
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Moon className="h-4 w-4 mr-3" />
              테마
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Zap className="h-4 w-4 mr-3" />
              모델 설정
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Globe className="h-4 w-4 mr-3" />
              언어
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="h-4 w-4 mr-3" />
              알림
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-3" />
              개인정보
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <ExternalLink className="h-4 w-4 mr-3" />
              업데이트 & FAQ
            </Button>
          </div>
        </div>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="h-5 w-5" />
                프로필 & 계정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl">김</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">김사용자</h3>
                  <p className="text-sm text-muted-foreground">user@example.com</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Crown className="h-3 w-3 mr-1" />
                      Plus
                    </Badge>
                  </div>
                </div>
                <Button variant="outline">프로필 편집</Button>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">구독 정보</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">플랜</span>
                      <span>Role GPT Plus</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">월 요금</span>
                      <span>$20.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">다음 결제일</span>
                      <span>2024.09.31</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">이번 달 사용량</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">메시지</span>
                      <span>142 / 무제한</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">이미지 생성</span>
                      <span>8 / 50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">파일 업로드</span>
                      <span>15 / 무제한</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Model Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Zap className="h-5 w-5" />
                AI 모델 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">응답 속도</label>
                  <Slider
                    value={responseSpeed}
                    onValueChange={setResponseSpeed}
                    max={2}
                    min={0.1}
                    step={0.1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>느림</span>
                    <span>보통</span>
                    <span>빠름</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">창의성 수준</label>
                  <Slider
                    value={creativity}
                    onValueChange={setCreativity}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>보수적</span>
                    <span>균형</span>
                    <span>창의적</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">음성 입력</p>
                    <p className="text-sm text-muted-foreground">마이크를 통한 음성 명령</p>
                  </div>
                  <Switch checked={voiceInput} onCheckedChange={setVoiceInput} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">자동 저장</p>
                    <p className="text-sm text-muted-foreground">채팅 내용을 자동으로 저장</p>
                  </div>
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme & Language */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Moon className="h-5 w-5" />
                테마 & 언어
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">다크 모드</p>
                      <p className="text-sm text-muted-foreground">어두운 테마 사용</p>
                    </div>
                    <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                  </div>
                </div>
                
                <div>
                  <label className="font-medium block mb-2">언어 설정</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="korean">한국어</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="japanese">日本語</SelectItem>
                      <SelectItem value="chinese">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Bell className="h-5 w-5" />
                알림 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">푸시 알림</p>
                  <p className="text-sm text-muted-foreground">새로운 기능 및 업데이트 알림</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">이메일 알림</p>
                  <p className="text-sm text-muted-foreground">중요한 업데이트를 이메일로 수신</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">소리 알림</p>
                  <p className="text-sm text-muted-foreground">응답 완료 시 알림음</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="h-5 w-5" />
                개인정보 & 데이터
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">데이터 내보내기</p>
                      <p className="text-sm text-muted-foreground">채팅 기록 다운로드</p>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 border-destructive hover:bg-destructive hover:text-destructive-foreground">
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">데이터 삭제</p>
                      <p className="text-sm text-muted-foreground">모든 채팅 기록 삭제</p>
                    </div>
                  </div>
                </Button>
              </div>
              
              <Separator />
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• 개인정보 처리방침에 따라 데이터가 보호됩니다</p>
                <p>• 채팅 내용은 서비스 개선 목적으로만 사용됩니다</p>
                <p>• 언제든지 계정 삭제 및 데이터 완전 삭제가 가능합니다</p>
              </div>
            </CardContent>
          </Card>

          {/* 업데이트 & FAQ 섹션 추가 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5" />
                업데이트 & FAQ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">업데이트 확인</p>
                      <p className="text-sm text-muted-foreground">최신 버전 확인 및 설치</p>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-4">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">도움말 & FAQ</p>
                      <p className="text-sm text-muted-foreground">자주 묻는 질문과 사용법</p>
                    </div>
                  </div>
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">현재 버전</span>
                  <span className="text-sm font-medium">v2.1.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">마지막 업데이트</span>
                  <span className="text-sm font-medium">2024.09.01</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">다음 업데이트</span>
                  <span className="text-sm font-medium text-blue-600">곧 출시 예정</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <div className="flex gap-3">
              <Button variant="outline">
                기본값으로 재설정
              </Button>
              <Button onClick={onClose}>
                저장
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
