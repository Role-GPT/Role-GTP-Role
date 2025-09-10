import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { 
  Clock, 
  Archive, 
  FileText, 
  Code, 
  FileCheck, 
  Settings, 
  Download, 
  Tag, 
  Calendar,
  RotateCcw,
  Lock,
  Unlock,
  Eye,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Edit3,
  Copy,
  Trash2,
  Plus,
  Save,
  List,
  Grid,
  MoreHorizontal,
  FolderOpen,
  BookOpen
} from 'lucide-react';

// 타임라인 요약 항목 타입
interface TimelineSummary {
  id: string;
  timestamp: Date;
  timeTag: string;
  turnRange: string;
  summary: string;
  compressed?: boolean;
  originalSummaries?: string[];
  isExpanded?: boolean;
}

// 아티팩트 항목 타입
interface Artifact {
  id: string;
  title: string;
  type: 'document' | 'code' | 'report' | 'outline';
  content: string;
  createdAt: Date;
  version: number;
  tags: string[];
  wordCount: number;
  isExpanded?: boolean;
}

// 아카이브 항목 타입 (사용자 직접 저장)
interface ArchiveItem {
  id: string;
  title: string;
  content: string;
  type: 'user-saved' | 'manual';
  createdAt: Date;
  source?: string; // 어떤 대화에서 저장했는지
  isExpanded?: boolean;
}

// 모드별 설정 타입
interface TalkDrawerSettings {
  enabled: boolean;
  readonly: boolean;
  canModify: boolean;
  compressionCycle: number;
  reminderCycle: number;
  compressionMethod: 'simple' | 'detailed' | 'contextual';
  compressionStrength: number;
}

interface ArtifactSettings {
  enabled: boolean;
  readonly: boolean;
  canModify: boolean;
  maxWordCount: number;
  maxFileSize: number;
  allowedTypes: ('document' | 'code' | 'report' | 'outline')[];
  versionControl: boolean;
  tagging: boolean;
  export: boolean;
}

interface ArchiveSettings {
  enabled: boolean;
  canModify: boolean;
  maxItems: number;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  currentMode: 'standard' | 'advanced' | 'expert';
  messages: any[];
  chatId: string;
  onSettingsChange?: (settings: any) => void;
  isMobile?: boolean;
}

export function ChatDrawer({ 
  isOpen, 
  onToggle, 
  currentMode, 
  messages,
  chatId,
  onSettingsChange,
  isMobile = false
}: ChatDrawerProps) {
  const [activeTab, setActiveTab] = useState('timeline');
  const [tabOffset, setTabOffset] = useState(0); // 슬라이드 오프셋
  
  // 확인 다이얼로그 상태
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  // Mock 데이터
  const [timelineSummaries, setTimelineSummaries] = useState<TimelineSummary[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      timeTag: '2025-09-03 14:00:15',
      turnRange: '1-15',
      summary: '사용자가 프로젝트 관리에 대해 문의했습니다. 팀 협업 도구와 워크플로우 최적화 방법에 대해 논의했으며, Notion과 Slack 통합 방안을 제안했습니다.',
      compressed: false,
      isExpanded: false
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      timeTag: '2025-09-03 14:15:30',
      turnRange: '16-30',
      summary: '코딩 스타일 가이드라인과 리팩토링 전략에 대해 상세히 설명했습니다. TypeScript 도입과 ESLint 설정 방법을 공유했습니다.',
      compressed: false,
      isExpanded: false
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      timeTag: '2025-09-03 14:25:45',
      turnRange: '1-30 (압축)',
      summary: '프로젝트 관리 및 코딩 표준화에 대한 종합적인 논의. 팀 협업 최적화와 개발 워크플로우 개선 방안 제시.',
      compressed: true,
      originalSummaries: ['프로젝트 관리 논의', '코딩 스타일 가이드'],
      isExpanded: false
    }
  ]);

  const [artifacts, setArtifacts] = useState<Artifact[]>([
    {
      id: '1',
      title: '프로젝트 관리 가이드라인',
      type: 'document',
      content: '# 프로젝트 관리 가이드라인\n\n## 개요\n효율적인 프로젝트 관리를 위한 핵심 원칙과 방법론을 소개합니다.\n\n## 주요 원칙\n1. 명확한 목표 설정\n2. 효과적인 커뮤니케이션\n3. 리스크 관리\n4. 지속적인 모니터링\n\n## 도구 및 방법론\n- Agile/Scrum 방법론 적용\n- 프로젝트 관리 도구 활용\n- 정기적인 회의 및 보고',
      createdAt: new Date(Date.now() - 1000 * 60 * 20),
      version: 1,
      tags: ['프로젝트', '관리', '가이드'],
      wordCount: 1250,
      isExpanded: false
    },
    {
      id: '2',
      title: 'TypeScript 설정 코드',
      type: 'code',
      content: '// tsconfig.json\n{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "ESNext",\n    "moduleResolution": "node",\n    "strict": true,\n    "esModuleInterop": true,\n    "skipLibCheck": true,\n    "forceConsistentCasingInFileNames": true,\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "noEmit": true,\n    "jsx": "react-jsx"\n  },\n  "include": ["src/**/*"],\n  "exclude": ["node_modules"]\n}',
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
      version: 2,
      tags: ['TypeScript', '설정', '개발'],
      wordCount: 89,
      isExpanded: false
    },
    {
      id: '3',
      title: '월간 진행 리포트',
      type: 'report',
      content: '# 2025년 9월 진행 리포트\n\n## 주요 성과\n- 목표 달성률: 85%\n- 완료된 태스크: 42개\n- 진행 중인 태스크: 18개\n\n## 주요 마일스톤\n1. 사용자 인터페이스 개선 완료\n2. 백엔드 API 최적화\n3. 보안 강화 작업\n\n## 향후 계획\n- 성능 최적화\n- 사용자 피드백 반영\n- 추가 기능 개발',
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
      version: 1,
      tags: ['리포트', '진행상황', '성과'],
      wordCount: 890,
      isExpanded: false
    }
  ]);

  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([
    {
      id: '1',
      title: '중요한 회의 내용 요약',
      content: '오늘 팀 회의에서 논의된 주요 안건들을 정리했습니다.\n\n1. Q4 목표 설정\n2. 새로운 기능 개발 계획\n3. 리소스 배분 전략\n\n각 항목에 대한 구체적인 실행 계획과 담당자를 배정했습니다.',
      type: 'user-saved',
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
      source: '팀 회의 대화',
      isExpanded: false
    },
    {
      id: '2',
      title: '개발 가이드라인 메모',
      content: '개발팀에서 합의한 코딩 컨벤션과 베스트 프랙티스를 정리했습니다.\n\n- 변수명은 camelCase 사용\n- 함수는 동사로 시작\n- 주석은 JSDoc 형식\n- 테스트 커버리지 80% 이상 유지',
      type: 'manual',
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
      isExpanded: false
    }
  ]);

  // 모드별 설정
  const [talkSettings, setTalkSettings] = useState<TalkDrawerSettings>({
    enabled: true,
    readonly: currentMode === 'standard',
    canModify: true,
    compressionCycle: 15,
    reminderCycle: 3,
    compressionMethod: 'simple',
    compressionStrength: 5
  });

  const [artifactSettings, setArtifactSettings] = useState<ArtifactSettings>({
    enabled: true,
    readonly: currentMode === 'standard',
    canModify: true,
    maxWordCount: currentMode === 'standard' ? 1000 : currentMode === 'advanced' ? 2000 : -1,
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: currentMode === 'standard' 
      ? ['document'] 
      : currentMode === 'advanced' 
        ? ['document', 'code', 'report'] 
        : ['document', 'code', 'report', 'outline'],
    versionControl: currentMode === 'expert',
    tagging: currentMode !== 'standard',
    export: currentMode !== 'standard'
  });

  const [archiveSettings] = useState<ArchiveSettings>({
    enabled: true,
    canModify: true,
    maxItems: currentMode === 'standard' ? 10 : currentMode === 'advanced' ? 25 : -1
  });

  // 탭 정의
  const tabs = [
    { id: 'timeline', label: 'Talk 서랍', icon: Clock },
    { id: 'artifacts', label: 'Artifacts', icon: Archive },
    { id: 'archive', label: 'Archive', icon: FolderOpen }
  ];

  // 슬라이드 탭 네비게이션
  const handleTabSlide = (direction: 'left' | 'right') => {
    if (direction === 'left' && tabOffset > 0) {
      setTabOffset(tabOffset - 1);
    } else if (direction === 'right' && tabOffset < tabs.length - 2) {
      setTabOffset(tabOffset + 1);
    }
  };

  const getVisibleTabs = () => {
    return tabs.slice(tabOffset, tabOffset + 2);
  };

  // 헬퍼 함수들
  const getStatusIcon = (enabled: boolean, readonly: boolean) => {
    if (!enabled) return <X className="w-4 h-4 text-muted-foreground" />;
    if (readonly) return <Lock className="w-4 h-4 text-yellow-500" />;
    return <Unlock className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = (enabled: boolean, readonly: boolean) => {
    if (!enabled) return 'Disabled';
    if (readonly) return 'Locked';
    return 'Enabled';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return date.toLocaleDateString();
  };

  const getArtifactIcon = (type: Artifact['type']) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4" />;
      case 'code': return <Code className="w-4 h-4" />;
      case 'report': return <FileCheck className="w-4 h-4" />;
      case 'outline': return <Archive className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getArtifactTypeColor = (type: Artifact['type']) => {
    switch (type) {
      case 'document': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'code': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'report': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'outline': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  // 토글 및 액션 함수들
  const toggleSummaryExpand = (summaryId: string) => {
    setTimelineSummaries(prev => 
      prev.map(summary => 
        summary.id === summaryId 
          ? { ...summary, isExpanded: !summary.isExpanded }
          : summary
      )
    );
  };

  const toggleArtifactExpand = (artifactId: string) => {
    setArtifacts(prev => 
      prev.map(artifact => 
        artifact.id === artifactId 
          ? { ...artifact, isExpanded: !artifact.isExpanded }
          : artifact
      )
    );
  };

  const toggleArchiveExpand = (archiveId: string) => {
    setArchiveItems(prev => 
      prev.map(item => 
        item.id === archiveId 
          ? { ...item, isExpanded: !item.isExpanded }
          : item
      )
    );
  };

  const handleSummaryAction = (summaryId: string, action: 'edit' | 'delete' | 'copy' | 'export') => {
    const summary = timelineSummaries.find(s => s.id === summaryId);
    if (!summary) return;

    switch (action) {
      case 'edit':
        const newSummary = prompt('요약 내용을 수정하세요:', summary.summary);
        if (newSummary && newSummary.trim()) {
          setTimelineSummaries(prev => 
            prev.map(s => s.id === summaryId ? { ...s, summary: newSummary.trim() } : s)
          );
        }
        break;
      case 'delete':
        setConfirmDialog({
          open: true,
          title: '요약 삭제',
          description: '이 요약을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
          onConfirm: () => {
            setTimelineSummaries(prev => prev.filter(s => s.id !== summaryId));
            setConfirmDialog(prev => ({ ...prev, open: false }));
          }
        });
        break;
      case 'copy':
        navigator.clipboard.writeText(summary.summary);
        break;
      case 'export':
        setConfirmDialog({
          open: true,
          title: '요약 내보내기',
          description: '이 요약을 JSON 파일로 내보내시겠습니까?',
          onConfirm: () => {
            const data = {
              timeTag: summary.timeTag,
              turnRange: summary.turnRange,
              summary: summary.summary,
              timestamp: summary.timestamp
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `talk_summary_${summary.timeTag.replace(/[:\s]/g, '_')}.json`;
            link.click();
            URL.revokeObjectURL(url);
            setConfirmDialog(prev => ({ ...prev, open: false }));
          }
        });
        break;
    }
  };

  const handleArtifactAction = (artifactId: string, action: 'edit' | 'delete' | 'copy' | 'export') => {
    const artifact = artifacts.find(a => a.id === artifactId);
    if (!artifact) return;

    switch (action) {
      case 'edit':
        const newTitle = prompt('문서 제목을 수정하세요:', artifact.title);
        if (newTitle && newTitle.trim()) {
          setArtifacts(prev => 
            prev.map(a => a.id === artifactId ? { ...a, title: newTitle.trim() } : a)
          );
        }
        break;
      case 'delete':
        setConfirmDialog({
          open: true,
          title: '문서 삭제',
          description: `"${artifact.title}" 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
          onConfirm: () => {
            setArtifacts(prev => prev.filter(a => a.id !== artifactId));
            setConfirmDialog(prev => ({ ...prev, open: false }));
          }
        });
        break;
      case 'copy':
        navigator.clipboard.writeText(artifact.content);
        break;
      case 'export':
        setConfirmDialog({
          open: true,
          title: '문서 내보내기',
          description: `"${artifact.title}" 문서를 파일로 내보내시겠습니까?`,
          onConfirm: () => {
            const blob = new Blob([artifact.content], { 
              type: artifact.type === 'code' ? 'text/plain' : 'text/markdown' 
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${artifact.title.replace(/[^a-z0-9]/gi, '_')}.${artifact.type === 'code' ? 'txt' : 'md'}`;
            link.click();
            URL.revokeObjectURL(url);
            setConfirmDialog(prev => ({ ...prev, open: false }));
          }
        });
        break;
    }
  };

  const handleArchiveAction = (archiveId: string, action: 'edit' | 'delete' | 'copy' | 'export') => {
    const item = archiveItems.find(a => a.id === archiveId);
    if (!item) return;

    switch (action) {
      case 'edit':
        const newTitle = prompt('제목을 수정하세요:', item.title);
        if (newTitle && newTitle.trim()) {
          setArchiveItems(prev => 
            prev.map(a => a.id === archiveId ? { ...a, title: newTitle.trim() } : a)
          );
        }
        break;
      case 'delete':
        setConfirmDialog({
          open: true,
          title: '항목 삭제',
          description: `"${item.title}" 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
          onConfirm: () => {
            setArchiveItems(prev => prev.filter(a => a.id !== archiveId));
            setConfirmDialog(prev => ({ ...prev, open: false }));
          }
        });
        break;
      case 'copy':
        navigator.clipboard.writeText(item.content);
        break;
      case 'export':
        setConfirmDialog({
          open: true,
          title: '항목 내보내기',
          description: `"${item.title}" 항목을 파일로 내보내시겠습니까?`,
          onConfirm: () => {
            const blob = new Blob([item.content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${item.title.replace(/[^a-z0-9]/gi, '_')}.md`;
            link.click();
            URL.revokeObjectURL(url);
            setConfirmDialog(prev => ({ ...prev, open: false }));
          }
        });
        break;
    }
  };

  // 전체 액션 함수들
  const handleAllTimelineExport = () => {
    setConfirmDialog({
      open: true,
      title: '전체 타임라인 내보내기',
      description: '모든 타임라인 요약을 하나의 파일로 내보내시겠습니까?',
      onConfirm: () => {
        const allData = {
          chatId,
          exportedAt: new Date().toISOString(),
          summaries: timelineSummaries
        };
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `timeline_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const handleAllTimelineDelete = () => {
    setConfirmDialog({
      open: true,
      title: '전체 타임라인 삭제',
      description: '모든 타임라인 요약을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      onConfirm: () => {
        setTimelineSummaries([]);
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const handleAllArtifactsExport = () => {
    setConfirmDialog({
      open: true,
      title: '전체 문서 내보내기',
      description: '모든 문서를 하나의 아카이브로 내보내시겠습니까?',
      onConfirm: () => {
        const allData = {
          chatId,
          exportedAt: new Date().toISOString(),
          artifacts: artifacts
        };
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `artifacts_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const handleAllArtifactsDelete = () => {
    setConfirmDialog({
      open: true,
      title: '전체 문서 삭제',
      description: '모든 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      onConfirm: () => {
        setArtifacts([]);
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const handleAllArchiveExport = () => {
    setConfirmDialog({
      open: true,
      title: '전체 아카이브 내보내기',
      description: '모든 아카이브 항목을 하나의 파일로 내보내시겠습니까?',
      onConfirm: () => {
        const allData = {
          chatId,
          exportedAt: new Date().toISOString(),
          archiveItems: archiveItems
        };
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `archive_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const handleAllArchiveDelete = () => {
    setConfirmDialog({
      open: true,
      title: '전체 아카이브 삭제',
      description: '모든 아카이브 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      onConfirm: () => {
        setArchiveItems([]);
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const calculateTotalSize = () => {
    const artifactSize = artifacts.reduce((total, artifact) => total + (artifact.content.length * 2), 0);
    const archiveSize = archiveItems.reduce((total, item) => total + (item.content.length * 2), 0);
    return artifactSize + archiveSize;
  };

  return (
    <>
      {/* 토글 버튼 */}
      <Button
        onClick={onToggle}
        variant="ghost"
        size="icon"
        className="fixed right-4 top-20 z-50 w-10 h-10 rounded-lg bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:bg-accent transition-all"
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </Button>

      {/* 드로어 패널 */}
      <div className={`fixed right-0 top-0 h-full ${isMobile ? 'w-full' : 'w-80'} bg-background border-l border-border shadow-lg transform transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-medium">대화 관리</h2>
            <Button onClick={onToggle} variant="ghost" size="icon" className="w-8 h-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 슬라이드 탭 시스템 */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              {/* 슬라이드 탭 네비게이션 */}
              <div className="flex items-center mx-4 mt-4">
                {/* 왼쪽 화살표 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 mr-2"
                  onClick={() => handleTabSlide('left')}
                  disabled={tabOffset === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {/* 탭 목록 (2개만 표시) */}
                <div className="flex-1 grid grid-cols-2 bg-muted rounded-lg p-1">
                  {getVisibleTabs().map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <tab.icon className="w-3 h-3" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </div>
                
                {/* 오른쪽 화살표 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 ml-2"
                  onClick={() => handleTabSlide('right')}
                  disabled={tabOffset >= tabs.length - 2}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Talk 서랍 탭 */}
              <TabsContent value="timeline" className="flex-1 overflow-hidden mt-4">
                <div className="px-4 pb-4 h-full flex flex-col">
                  {/* 상태 및 설정 */}
                  <Card className="mb-4">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {getStatusIcon(talkSettings.enabled, talkSettings.readonly)}
                          타임라인 요약
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {getStatusText(talkSettings.enabled, talkSettings.readonly)}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {currentMode === 'standard' && '자동 요약이 활성화되어 있습니다 (항상 ON)'}
                        {currentMode === 'advanced' && '압축 주기와 리마인더를 조정할 수 있습니다'}
                        {currentMode === 'expert' && '모든 압축 옵션을 커스터마이징할 수 있습니다'}
                      </CardDescription>
                    </CardHeader>
                    {(currentMode === 'advanced' || currentMode === 'expert') && (
                      <CardContent className="space-y-3">
                        {currentMode !== 'standard' && (
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium">자동 요약</label>
                            <Switch 
                              checked={talkSettings.enabled}
                              onCheckedChange={(checked) => setTalkSettings(prev => ({ ...prev, enabled: checked }))}
                            />
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <label className="text-xs font-medium">압축 주기 ({talkSettings.compressionCycle}턴)</label>
                          <Slider 
                            value={[talkSettings.compressionCycle]}
                            onValueChange={([value]) => setTalkSettings(prev => ({ ...prev, compressionCycle: value }))}
                            min={10}
                            max={30}
                            step={5}
                            disabled={!talkSettings.enabled}
                          />
                        </div>

                        {currentMode === 'expert' && (
                          <>
                            <div className="space-y-2">
                              <label className="text-xs font-medium">압축 방식</label>
                              <Select 
                                value={talkSettings.compressionMethod}
                                onValueChange={(value: any) => setTalkSettings(prev => ({ ...prev, compressionMethod: value }))}
                                disabled={!talkSettings.enabled}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="simple">간단한 요약</SelectItem>
                                  <SelectItem value="detailed">상세한 요약</SelectItem>
                                  <SelectItem value="contextual">맥락 중심 요약</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium">압축 강도 ({talkSettings.compressionStrength}/10)</label>
                              <Slider 
                                value={[talkSettings.compressionStrength]}
                                onValueChange={([value]) => setTalkSettings(prev => ({ ...prev, compressionStrength: value }))}
                                min={1}
                                max={10}
                                step={1}
                                disabled={!talkSettings.enabled}
                              />
                            </div>
                          </>
                        )}
                      </CardContent>
                    )}
                  </Card>

                  {/* 타임라인 목록 - 압축 리스트 형태 */}
                  <div className="flex-1 overflow-y-auto space-y-2">
                    <div className="text-xs text-muted-foreground mb-2 px-1">
                      {timelineSummaries.length}개의 요약
                    </div>
                    
                    {timelineSummaries.map((summary) => (
                      <div key={summary.id} className="group border border-border rounded-lg p-3 hover:shadow-sm transition-shadow">
                        {/* 압축된 헤더 */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              턴 {summary.turnRange}
                            </Badge>
                            {summary.compressed && (
                              <Badge variant="secondary" className="text-xs flex items-center gap-1 flex-shrink-0">
                                <RotateCcw className="w-3 h-3" />
                                압축됨
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground/70 font-mono truncate">
                              {summary.timeTag}
                            </span>
                          </div>
                          
                          {/* 액션 버튼들 */}
                          {talkSettings.canModify && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6"
                                onClick={() => handleSummaryAction(summary.id, 'edit')}
                                title="편집"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6"
                                onClick={() => handleSummaryAction(summary.id, 'copy')}
                                title="복사"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6"
                                onClick={() => handleSummaryAction(summary.id, 'export')}
                                title="내보내기"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6 text-destructive hover:text-destructive"
                                onClick={() => handleSummaryAction(summary.id, 'delete')}
                                title="삭제"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* 펼침/축소 가능한 내용 */}
                        <Collapsible open={summary.isExpanded} onOpenChange={() => toggleSummaryExpand(summary.id)}>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                              <p className={`text-sm leading-relaxed text-left ${summary.isExpanded ? '' : 'line-clamp-2'}`}>
                                {summary.summary}
                              </p>
                              {summary.isExpanded ? (
                                <ChevronUp className="w-4 h-4 ml-2 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="space-y-2">
                            {summary.originalSummaries && (
                              <div className="mt-2 pt-2 border-t border-border">
                                <p className="text-xs text-muted-foreground mb-2">
                                  원본 요약 {summary.originalSummaries.length}개를 압축함:
                                </p>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  {summary.originalSummaries.map((originalSummary, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-muted-foreground/50">•</span>
                                      <span>{originalSummary}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>생성 시각: {formatTimeAgo(summary.timestamp)}</span>
                              <span>압축 {summary.compressed ? '완료' : '대기'}</span>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ))}
                  </div>

                  {/* 전체 액션 버튼들 - 하단 고정 */}
                  {timelineSummaries.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 flex items-center gap-2 text-xs"
                          onClick={handleAllTimelineExport}
                        >
                          <Download className="w-3 h-3" />
                          전체 내보내기
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 flex items-center gap-2 text-xs text-destructive hover:text-destructive"
                          onClick={handleAllTimelineDelete}
                        >
                          <Trash2 className="w-3 h-3" />
                          전체 삭제
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Artifacts 탭 */}
              <TabsContent value="artifacts" className="flex-1 overflow-hidden mt-4">
                <div className="px-4 pb-4 h-full flex flex-col">
                  {/* 상태 및 설정 */}
                  <Card className="mb-4">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {getStatusIcon(artifactSettings.enabled, artifactSettings.readonly)}
                          문서 보관함
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {artifacts.length}개 문서
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {currentMode === 'standard' && `문서당 최대 ${artifactSettings.maxWordCount.toLocaleString()}자 제한`}
                        {currentMode === 'advanced' && `카테고리 선택 가능, 최대 ${artifactSettings.maxWordCount.toLocaleString()}자`}
                        {currentMode === 'expert' && '무제한 생성, 버전 관리 및 내보내기 지원'}
                      </CardDescription>
                    </CardHeader>
                    {(currentMode === 'advanced' || currentMode === 'expert') && (
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium">문서 생성</label>
                          <Switch 
                            checked={artifactSettings.enabled}
                            onCheckedChange={(checked) => setArtifactSettings(prev => ({ ...prev, enabled: checked }))}
                          />
                        </div>
                        
                        {currentMode === 'expert' && (
                          <>
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium">버전 관리</label>
                              <Switch 
                                checked={artifactSettings.versionControl}
                                onCheckedChange={(checked) => setArtifactSettings(prev => ({ ...prev, versionControl: checked }))}
                                disabled={!artifactSettings.enabled}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium">태그 시스템</label>
                              <Switch 
                                checked={artifactSettings.tagging}
                                onCheckedChange={(checked) => setArtifactSettings(prev => ({ ...prev, tagging: checked }))}
                                disabled={!artifactSettings.enabled}
                              />
                            </div>
                          </>
                        )}
                      </CardContent>
                    )}
                  </Card>

                  {/* 아티팩트 목록 - 압축 리스트 형태 */}
                  <div className="flex-1 overflow-y-auto space-y-2">
                    <div className="text-xs text-muted-foreground mb-2 px-1">
                      {artifacts.length}개의 문서
                    </div>
                    
                    {artifacts.map((artifact) => (
                      <div key={artifact.id} className="group border border-border rounded-lg p-3 hover:shadow-sm transition-shadow">
                        {/* 압축된 헤더 */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getArtifactIcon(artifact.type)}
                            <span className="font-medium text-sm truncate">{artifact.title}</span>
                            {artifactSettings.versionControl && (
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                v{artifact.version}
                              </Badge>
                            )}
                          </div>
                          
                          {/* 액션 버튼들 */}
                          {artifactSettings.canModify && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6"
                                onClick={() => handleArtifactAction(artifact.id, 'edit')}
                                title="편집"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6"
                                onClick={() => handleArtifactAction(artifact.id, 'copy')}
                                title="복사"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              {artifactSettings.export && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-6 h-6"
                                  onClick={() => handleArtifactAction(artifact.id, 'export')}
                                  title="내보내기"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6 text-destructive hover:text-destructive"
                                onClick={() => handleArtifactAction(artifact.id, 'delete')}
                                title="삭제"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* 메타 정보 */}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs ${getArtifactTypeColor(artifact.type)}`}>
                            {artifact.type === 'document' && '문서'}
                            {artifact.type === 'code' && '코드'}
                            {artifact.type === 'report' && '리포트'}
                            {artifact.type === 'outline' && '아웃라인'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {artifact.wordCount.toLocaleString()}자
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(artifact.createdAt)}
                          </span>
                        </div>

                        {/* 태그 */}
                        {artifactSettings.tagging && artifact.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {artifact.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {artifact.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{artifact.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* 펼침/축소 가능한 내용 */}
                        <Collapsible open={artifact.isExpanded} onOpenChange={() => toggleArtifactExpand(artifact.id)}>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                              <p className={`text-sm leading-relaxed text-left ${artifact.isExpanded ? '' : 'line-clamp-2'}`}>
                                {artifact.content}
                              </p>
                              {artifact.isExpanded ? (
                                <ChevronUp className="w-4 h-4 ml-2 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="space-y-2">
                            <div className="mt-2 pt-2 border-t border-border">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>버전: {artifact.version}</span>
                                <span>생성일: {formatTimeAgo(artifact.createdAt)}</span>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ))}
                  </div>

                  {/* 전체 액션 버튼들 - 하단 고정 */}
                  {artifacts.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 flex items-center gap-2 text-xs"
                          onClick={handleAllArtifactsExport}
                        >
                          <Download className="w-3 h-3" />
                          전체 내보내기
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 flex items-center gap-2 text-xs text-destructive hover:text-destructive"
                          onClick={handleAllArtifactsDelete}
                        >
                          <Trash2 className="w-3 h-3" />
                          전체 삭제
                        </Button>
                      </div>
                      
                      {/* 용량 표시 */}
                      <div className="mt-2 pt-2 text-xs text-muted-foreground/60 border-t border-border">
                        사용량: {(calculateTotalSize() / (1024 * 1024)).toFixed(1)}MB / 5MB
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Archive 탭 */}
              <TabsContent value="archive" className="flex-1 overflow-hidden mt-4">
                <div className="px-4 pb-4 h-full flex flex-col">
                  {/* 상태 및 설정 */}
                  <Card className="mb-4">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-green-500" />
                          아카이브
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {archiveItems.length}개 항목
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => {
                              // 사용자 직접 저장 모달 열기
                              const content = prompt('저장할 내용을 입력하세요:');
                              if (content && content.trim()) {
                                const newItem: ArchiveItem = {
                                  id: `archive_${Date.now()}`,
                                  title: `수동 저장 ${new Date().toLocaleDateString()}`,
                                  content: content.trim(),
                                  type: 'manual',
                                  createdAt: new Date(),
                                  isExpanded: false
                                };
                                setArchiveItems(prev => [newItem, ...prev]);
                              }
                            }}
                            title="새 항목 추가"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-xs">
                        {currentMode === 'standard' && `최대 ${archiveSettings.maxItems}개 항목 저장 가능`}
                        {currentMode === 'advanced' && `최대 ${archiveSettings.maxItems}개 항목, 태그 및 분류 가능`}
                        {currentMode === 'expert' && '무제한 저장, 고급 검색 및 필터링 지원'}
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {/* 아카이브 목록 - 압축 리스트 형태 */}
                  <div className="flex-1 overflow-y-auto space-y-2">
                    <div className="text-xs text-muted-foreground mb-2 px-1">
                      {archiveItems.length}개의 저장된 항목
                    </div>
                    
                    {archiveItems.map((item) => (
                      <div key={item.id} className="group border border-border rounded-lg p-3 hover:shadow-sm transition-shadow">
                        {/* 압축된 헤더 */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <BookOpen className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium text-sm truncate">{item.title}</span>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {item.type === 'user-saved' ? '대화저장' : '수동입력'}
                            </Badge>
                          </div>
                          
                          {/* 액션 버튼들 */}
                          {archiveSettings.canModify && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6"
                                onClick={() => handleArchiveAction(item.id, 'edit')}
                                title="편집"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6"
                                onClick={() => handleArchiveAction(item.id, 'copy')}
                                title="복사"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6"
                                onClick={() => handleArchiveAction(item.id, 'export')}
                                title="내보내기"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6 text-destructive hover:text-destructive"
                                onClick={() => handleArchiveAction(item.id, 'delete')}
                                title="삭제"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* 메타 정보 */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(item.createdAt)}
                          </span>
                          {item.source && (
                            <span className="text-xs text-muted-foreground">
                              출처: {item.source}
                            </span>
                          )}
                        </div>

                        {/* 펼침/축소 가능한 내용 */}
                        <Collapsible open={item.isExpanded} onOpenChange={() => toggleArchiveExpand(item.id)}>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                              <p className={`text-sm leading-relaxed text-left ${item.isExpanded ? '' : 'line-clamp-2'}`}>
                                {item.content}
                              </p>
                              {item.isExpanded ? (
                                <ChevronUp className="w-4 h-4 ml-2 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="space-y-2">
                            <div className="mt-2 pt-2 border-t border-border">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>타입: {item.type === 'user-saved' ? '대화에서 저장' : '직접 입력'}</span>
                                <span>저장일: {formatTimeAgo(item.createdAt)}</span>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ))}
                  </div>

                  {/* 전체 액션 버튼들 - 하단 고정 */}
                  {archiveItems.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 flex items-center gap-2 text-xs"
                          onClick={handleAllArchiveExport}
                        >
                          <Download className="w-3 h-3" />
                          전체 내보내기
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 flex items-center gap-2 text-xs text-destructive hover:text-destructive"
                          onClick={handleAllArchiveDelete}
                        >
                          <Trash2 className="w-3 h-3" />
                          전체 삭제
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* 드로어 오버레이 (모바일용) */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={onToggle}
        />
      )}

      {/* 확인 다이얼로그 */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog.onConfirm}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}