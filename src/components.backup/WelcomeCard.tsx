import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MessageSquare, Download, Sparkles, RefreshCw } from 'lucide-react';
import { useApp } from '../src/context/AppContext';
import { Role } from '../src/types';
import { detectEnvironment } from '../src/utils/environmentDetector';
import { toast } from 'sonner';

interface WelcomeCardProps {
  onRoleSelect: (role: Role) => void;
  onStartChat: (role: Role) => void;
}

export function WelcomeCard({ onRoleSelect, onStartChat }: WelcomeCardProps) {
  const { state } = useApp();
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [environment] = useState(detectEnvironment());

  // 모드별 기능 확인
  const userMode = state.userSettings.mode;
  const isStandard = userMode === 'standard';
  const isAdvanced = userMode === 'advanced';
  const isExpert = userMode === 'expert';

  // 추천/인기 Role들만 필터링
  const availableRoles = state.roles.filter(role => 
    role.category === 'recommended' || 
    role.category === 'popular' || 
    role.category === 'lifestyle' ||
    role.category === 'creativity' ||
    role.category === 'productivity' ||
    role.category === 'education' ||
    role.category === 'expert'
  );

  // 랜덤 Role 선택
  const getRandomRole = () => {
    if (availableRoles.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * availableRoles.length);
    return availableRoles[randomIndex];
  };

  // 컴포넌트 마운트 시 랜덤 Role 설정
  useEffect(() => {
    const randomRole = getRandomRole();
    setCurrentRole(randomRole);
  }, []);

  // 새로운 랜덤 Role로 변경
  const handleRefresh = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const newRole = getRandomRole();
      setCurrentRole(newRole);
      setIsAnimating(false);
    }, 300);
  };

  // Role 내보내기
  const handleExportRole = () => {
    if (!currentRole) return;

    const roleData = {
      name: currentRole.name,
      description: currentRole.description,
      prompt: currentRole.prompt,
      category: currentRole.category,
      keywordIds: currentRole.keywordIds,
      temperature: currentRole.temperature,
      maxOutputTokens: currentRole.maxOutputTokens,
      safetyLevel: currentRole.safetyLevel,
      exportedAt: new Date().toISOString(),
      exportedFrom: 'Role GPT Welcomecard'
    };

    const dataStr = JSON.stringify(roleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentRole.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_role.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success(`"${currentRole.name}" Role이 내보내기 되었습니다.`);
  };

  // 대화 시작
  const handleStartChat = () => {
    if (!currentRole) return;
    
    if (environment.shouldUseDemoMode) {
      toast.info('🎭 데모 모드: AI 응답을 시뮬레이션합니다', { duration: 2000 });
    }
    
    onStartChat(currentRole);
  };

  // Role 선택 (갤러리로 이동)
  const handleSelectRole = () => {
    if (!currentRole) return;
    onRoleSelect(currentRole);
  };

  if (!currentRole) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">랜덤 Role 로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  // 카테고리별 색상
  const getCategoryColor = (category: string) => {
    const colors = {
      'recommended': 'bg-purple-500',
      'popular': 'bg-blue-500',
      'lifestyle': 'bg-green-500',
      'creativity': 'bg-yellow-500',
      'productivity': 'bg-indigo-500',
      'education': 'bg-orange-500',
      'expert': 'bg-red-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const getCategoryName = (category: string) => {
    const names = {
      'recommended': '추천',
      'popular': '인기',
      'lifestyle': '라이프스타일',
      'creativity': '창의성',
      'productivity': '생산성',
      'education': '교육',
      'expert': '전문가'
    };
    return names[category as keyof typeof names] || category;
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-background to-muted/30 border shadow-lg mx-[10px] my-[0px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">
              {localStorage.getItem("firstTimeUser") === "true" 
                ? "Role GPT와 첫 대화를 시작해보세요" 
                : "오늘의 추천 Role"
              }
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="h-8 w-8 hover:bg-background/50"
            disabled={isAnimating}
          >
            <RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Role 정보 */}
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 ${getCategoryColor(currentRole.category)} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <span className="text-white font-bold text-sm">
                {currentRole.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-1">{currentRole.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {getCategoryName(currentRole.category)}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {currentRole.description}
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-2">
          {/* Standard: 대화하기만 */}
          {isStandard && (
            <Button 
              onClick={handleStartChat}
              className="w-full"
              size="lg"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              대화하기
            </Button>
          )}

          {/* Advanced: 대화하기 + 내보내기 */}
          {isAdvanced && (
            <div className="flex gap-2">
              <Button 
                onClick={handleStartChat}
                className="flex-1"
                size="lg"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                대화하기
              </Button>
              <Button 
                onClick={handleExportRole}
                variant="outline"
                size="lg"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Expert: 전체 기능 */}
          {isExpert && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button 
                  onClick={handleStartChat}
                  className="flex-1"
                  size="lg"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  대화하기
                </Button>
                <Button 
                  onClick={handleExportRole}
                  variant="outline"
                  size="lg"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                onClick={handleSelectRole}
                variant="secondary"
                className="w-full"
                size="sm"
              >
                Role 갤러리에서 보기
              </Button>
            </div>
          )}
        </div>

        {/* 모드별 기능 안내 */}
        {isStandard && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Advanced 모드에서 Role 내보내기 기능을 이용하세요
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}