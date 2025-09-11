import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Globe, GraduationCap, Briefcase, Palette, Home, Database, Settings, ExternalLink } from 'lucide-react';
import { toast } from "sonner";

interface DataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceModes: {
    web: boolean;
    academic: boolean;
    business: boolean;
    culture: boolean;
    lifestyle: boolean;
  };
  onSourceChange: (source: string, enabled: boolean) => void;
  isAdmin?: boolean;
}

interface SourceConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  icon: any;
  color: string;
  trialLimit: { used: number; total: number };
  byokStatus: { connected: boolean; hasKeys: number; totalKeys: number };
  apis: string[];
}

export function EnhancedDataSourceModal({ 
  isOpen, 
  onClose, 
  sourceModes, 
  onSourceChange,
  isAdmin = false 
}: DataSourceModalProps) {
  
  // 데이터 소스 설정 (실제로는 props나 context에서 가져와야 함)
  const sourceConfigs: SourceConfig[] = [
    {
      id: 'web',
      name: '웹',
      emoji: '🌐',
      description: '실시간 인터넷 정보',
      icon: Globe,
      color: 'text-blue-500',
      trialLimit: { used: 5, total: 20 },
      byokStatus: { connected: false, hasKeys: 2, totalKeys: 4 },
      apis: ['Wikipedia', '네이버뉴스', 'NewsAPI', '빅카인즈']
    },
    {
      id: 'academic',
      name: '학문',
      emoji: '🎓',
      description: '논문 및 연구 자료',
      icon: GraduationCap,
      color: 'text-purple-500',
      trialLimit: { used: 3, total: 20 },
      byokStatus: { connected: false, hasKeys: 0, totalKeys: 3 },
      apis: ['arXiv', 'PubMed', 'Semantic Scholar']
    },
    {
      id: 'business',
      name: '비즈니스',
      emoji: '💼',
      description: '경제 및 금융 데이터',
      icon: Briefcase,
      color: 'text-green-500',
      trialLimit: { used: 2, total: 15 },
      byokStatus: { connected: true, hasKeys: 2, totalKeys: 3 },
      apis: ['Yahoo Finance', 'FRED', 'SEC EDGAR']
    },
    {
      id: 'culture',
      name: '문화',
      emoji: '🎭',
      description: '예술 및 엔터테인먼트',
      icon: Palette,
      color: 'text-pink-500',
      trialLimit: { used: 1, total: 15 },
      byokStatus: { connected: false, hasKeys: 0, totalKeys: 3 },
      apis: ['TMDB', 'Open Library', 'Spotify']
    },
    {
      id: 'lifestyle',
      name: '라이프스타일',
      emoji: '🏠',
      description: '생활 및 취미 정보',
      icon: Home,
      color: 'text-orange-500',
      trialLimit: { used: 0, total: 15 },
      byokStatus: { connected: false, hasKeys: 1, totalKeys: 4 },
      apis: ['날씨', 'Unsplash', '공공데이터']
    }
  ];

  const handleSourceToggle = (sourceId: string, enabled: boolean, config: SourceConfig) => {
    // 체험 한도 체크 (관리자나 BYOK 연결된 경우 제외)
    if (!isAdmin && !config.byokStatus.connected && config.trialLimit.used >= config.trialLimit.total && enabled) {
      toast.error('오늘 체험 한도를 모두 사용했습니다. API 키를 연결하면 즉시 이어서 사용할 수 있습니다.');
      return;
    }
    
    onSourceChange(sourceId, enabled);
    toast.success(`${config.name} 소스가 ${enabled ? '활성화' : '비활성화'}되었습니다.`);
  };

  const handleConnectAPI = () => {
    toast.info('설정 > API 키 관리에서 키를 연결하세요.');
    // TODO: 실제로는 API 키 관리 모달을 열어야 함
  };

  const renderStatusBadge = (config: SourceConfig) => {
    if (isAdmin) {
      return <Badge variant="outline" className="text-green-600 border-green-600">무제한</Badge>;
    }
    
    if (config.byokStatus.connected) {
      return <Badge variant="outline" className="text-blue-600 border-blue-600">BYOK 연결됨</Badge>;
    }
    
    const remaining = config.trialLimit.total - config.trialLimit.used;
    if (remaining <= 0) {
      return <Badge variant="destructive">한도 초과</Badge>;
    }
    
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        체험 {remaining}회 남음
      </Badge>
    );
  };

  const renderConnectionInfo = (config: SourceConfig) => {
    if (isAdmin) {
      return <span className="text-green-600 dark:text-green-400">관리자 권한</span>;
    }
    
    if (config.byokStatus.connected) {
      return (
        <span className="text-blue-600 dark:text-blue-400">
          API 키 연결됨 ({config.byokStatus.hasKeys}/{config.byokStatus.totalKeys})
        </span>
      );
    }
    
    if (config.byokStatus.hasKeys > 0) {
      return (
        <span className="text-yellow-600 dark:text-yellow-400">
          부분 연결됨 ({config.byokStatus.hasKeys}/{config.byokStatus.totalKeys})
        </span>
      );
    }
    
    return (
      <div className="flex justify-between items-center">
        <span>{config.apis.join(', ')}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={handleConnectAPI}
        >
          연결
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            데이터 소스 설정
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 mt-4 pr-2">
          {/* 상단 안내 */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            {isAdmin ? (
              <span className="text-green-600 dark:text-green-400">✓ 관리자 권한으로 모든 소스 무제한 사용 가능</span>
            ) : (
              <span>지금은 체험판으로 동작합니다. 개인 API 키를 연결하면 계속 이용할 수 있어요.</span>
            )}
          </div>
          
          {/* 데이터 소스 목록 */}
          <div className="space-y-3">
            {sourceConfigs.map((config) => (
              <div key={config.id} className="border rounded-lg overflow-hidden">
                {/* 메인 토글 영역 */}
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3 flex-1">
                    <config.icon className={`w-5 h-5 ${config.color}`} />
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        <span>{config.emoji} {config.name}</span>
                        {renderStatusBadge(config)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {config.description}
                      </div>
                    </div>
                  </div>
                  
                  <Switch
                    checked={sourceModes[config.id as keyof typeof sourceModes]}
                    onCheckedChange={(checked) => handleSourceToggle(config.id, checked, config)}
                    disabled={!isAdmin && !config.byokStatus.connected && config.trialLimit.used >= config.trialLimit.total}
                  />
                </div>
                
                {/* 하단 상세 정보 */}
                <div className="px-3 pb-3 text-xs text-muted-foreground border-t bg-muted/20">
                  {renderConnectionInfo(config)}
                </div>
              </div>
            ))}
          </div>
          
          {/* 하단 참고사항 */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-1">
            <div><strong>💡 체험 한도:</strong> 3일 무료 체험 사용자에게만 적용됩니다.</div>
            <div><strong>🔑 BYOK 연결:</strong> 설정 &gt; API 키 관리에서 개인 키를 연결하세요.</div>
            <div><strong>📊 출처 표기:</strong> 뉴스 및 이미지 검색 시 자동으로 출처가 표기됩니다.</div>
          </div>
          
          {/* API 키 관리 바로가기 */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">API 키 관리</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  onClose();
                  toast.info('API 키 관리 페이지로 이동합니다.');
                  // TODO: 실제 API 키 관리 모달 열기
                }}
              >
                설정하기
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              개인 API 키를 연결하여 무제한으로 사용하세요.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
