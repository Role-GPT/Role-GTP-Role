/**
 * 모드 선택 모달 컴포넌트
 */

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Zap, 
  Key, 
  Mail, 
  Users, 
  Clock, 
  Shield, 
  Database,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { UserMode } from '../src/types/auth';
import { setUserMode } from '../src/utils/sessionManager';
import { cn } from './ui/utils';

interface ModeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModeSelected: (mode: UserMode) => void;
}

type Step = 'mode-selection' | 'quick-trial' | 'byok-setup' | 'existing-user' | 'guest-setup';

export function ModeSelectionModal({ 
  isOpen, 
  onClose, 
  onModeSelected 
}: ModeSelectionModalProps) {
  const [step, setStep] = useState<Step>('mode-selection');
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [email, setEmail] = useState('');
  const [classroomCode, setClassroomCode] = useState('');

  const handleModeSelect = (mode: UserMode) => {
    setUserMode(mode);
    
    switch (mode) {
      case 'personal':
        setStep('quick-trial');
        break;
      case 'byok':
        setStep('byok-setup');
        break;
      case 'licensed':
        setStep('existing-user');
        break;
      case 'public':
        setStep('guest-setup');
        break;
      default:
        onModeSelected(mode);
    }
  };

  const handleQuickTrialComplete = () => {
    if (nickname.length >= 2 && pin.length >= 4) {
      // TODO: PIN 저장 로직
      localStorage.setItem('user_nickname', nickname);
      localStorage.setItem('has_pin', 'true');
      onModeSelected('personal');
    }
  };

  const handleByokComplete = () => {
    if (apiKey.trim()) {
      // TODO: API 키 저장 로직
      localStorage.setItem('byok_configured', 'true');
      onModeSelected('byok');
    }
  };

  const handleExistingUserComplete = () => {
    if (email.trim()) {
      // TODO: 이메일 확인 로직
      onModeSelected('licensed');
    }
  };

  const handleGuestComplete = () => {
    if (classroomCode.trim()) {
      // TODO: 좌석 할당 로직
      onModeSelected('public');
    } else {
      // 일반 게스트 모드
      onModeSelected('ephemeral');
    }
  };

  const renderModeSelection = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-lg font-semibold">어떻게 시작하시겠어요?</h3>
        <p className="text-sm text-muted-foreground">
          사용 방식을 선택해주세요. 나중에 설정에서 변경할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-3">
        {/* 빠른 체험 */}
        <Card 
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => handleModeSelect('personal')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-base">빠르게 체험</CardTitle>
                  <CardDescription className="text-sm">
                    3일간 무료 체험
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary">추천</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>닉네임 + PIN 설정</span>
              <span>•</span>
              <span>로컬 저장</span>
            </div>
          </CardContent>
        </Card>

        {/* BYOK */}
        <Card 
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => handleModeSelect('byok')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-base">BYOK로 시작</CardTitle>
                <CardDescription className="text-sm">
                  본인의 API 키 사용
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>API 키 입력</span>
              <span>•</span>
              <span>무제한 사용</span>
            </div>
          </CardContent>
        </Card>

        {/* 기존 회원 */}
        <Card 
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => handleModeSelect('licensed')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-base">이미 회원</CardTitle>
                <CardDescription className="text-sm">
                  결제 완료한 사용자
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
              <span>이메일 인증</span>
              <span>•</span>
              <span>라이선스 확인</span>
            </div>
          </CardContent>
        </Card>

        {/* 게스트 모드 */}
        <Card 
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => handleModeSelect('public')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-base">게스트 모드</CardTitle>
                <CardDescription className="text-sm">
                  공용 PC 권장
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="w-4 h-4" />
              <span>임시 사용</span>
              <span>•</span>
              <span>종료 시 삭제</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Database className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p><strong>개인정보 보호:</strong> 대화는 서버에 저장되지 않습니다.</p>
            <p><strong>데이터 이동:</strong> 파일로 내보내기/불러오기를 지원합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuickTrial = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-lg font-semibold">3일 체험 시작</h3>
        <p className="text-sm text-muted-foreground">
          닉네임과 PIN을 설정하여 안전하게 대화를 보관하세요.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="nickname">닉네임 (2~10자)</Label>
          <Input
            id="nickname"
            placeholder="사용할 닉네임을 입력하세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={10}
          />
        </div>

        <div>
          <Label htmlFor="pin">잠금 PIN (4~6자리)</Label>
          <Input
            id="pin"
            type="password"
            placeholder="숫자 4~6자리"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p><strong>체험 혜택:</strong> 3일간 모든 기능 무료 사용</p>
              <p><strong>데이터:</strong> 이 기기에만 암호화되어 저장</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={() => setStep('mode-selection')} className="flex-1">
          뒤로
        </Button>
        <Button 
          onClick={handleQuickTrialComplete}
          disabled={nickname.length < 2 || pin.length < 4}
          className="flex-1"
        >
          체험 시작
        </Button>
      </div>
    </div>
  );

  const renderByokSetup = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-lg font-semibold">API 키로 시작</h3>
        <p className="text-sm text-muted-foreground">
          본인의 API 키를 사용하여 무제한으로 이용하세요.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="apikey">API 키</Label>
          <Input
            id="apikey"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="email-optional">이메일 (선택사항)</Label>
          <Input
            id="email-optional"
            type="email"
            placeholder="영수증 및 라이선스 확인용"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-700 dark:text-green-300">
              <p><strong>완전한 제어:</strong> 키는 로컬에만 저장됩니다</p>
              <p><strong>내보내기:</strong> 기본적으로 키는 파일에 포함되지 않습니다</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={() => setStep('mode-selection')} className="flex-1">
          뒤로
        </Button>
        <Button 
          onClick={handleByokComplete}
          disabled={!apiKey.trim()}
          className="flex-1"
        >
          시작하기
        </Button>
      </div>
    </div>
  );

  const renderExistingUser = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-lg font-semibold">기존 회원 로그인</h3>
        <p className="text-sm text-muted-foreground">
          이메일로 라이선스를 확인합니다.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="member-email">이메일</Label>
          <Input
            id="member-email"
            type="email"
            placeholder="구매 시 사용한 이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-purple-700 dark:text-purple-300">
              <p><strong>인증 방식:</strong> 이메일로 확인 링크를 보내드립니다</p>
              <p><strong>데이터 동기화:</strong> 라이선스 확인만 하며, 대화는 로컬에 저장</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={() => setStep('mode-selection')} className="flex-1">
          뒤로
        </Button>
        <Button 
          onClick={handleExistingUserComplete}
          disabled={!email.trim()}
          className="flex-1"
        >
          확인 메일 발송
        </Button>
      </div>
    </div>
  );

  const renderGuestSetup = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-lg font-semibold">게스트 모드</h3>
        <p className="text-sm text-muted-foreground">
          임시 사용 또는 교실 코드를 입력하세요.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="classroom-code">교실 코드 (선택사항)</Label>
          <Input
            id="classroom-code"
            placeholder="ABCD-1234"
            value={classroomCode}
            onChange={(e) => setClassroomCode(e.target.value.toUpperCase())}
          />
          <p className="text-xs text-muted-foreground mt-1">
            코드가 없으면 일반 게스트 모드로 시작됩니다.
          </p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-orange-700 dark:text-orange-300">
              <p><strong>주의:</strong> 창을 닫으면 모든 대화가 삭제됩니다</p>
              <p><strong>권장:</strong> 공용 PC에서만 사용하고, 종료 전 내보내기하세요</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={() => setStep('mode-selection')} className="flex-1">
          뒤로
        </Button>
        <Button onClick={handleGuestComplete} className="flex-1">
          {classroomCode ? '좌석 할당' : '게스트 시작'}
        </Button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 'mode-selection':
        return renderModeSelection();
      case 'quick-trial':
        return renderQuickTrial();
      case 'byok-setup':
        return renderByokSetup();
      case 'existing-user':
        return renderExistingUser();
      case 'guest-setup':
        return renderGuestSetup();
      default:
        return renderModeSelection();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Role GPT</DialogTitle>
          <DialogDescription className="text-center">
            사용 방식을 선택하여 시작하세요
          </DialogDescription>
        </DialogHeader>
        
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
