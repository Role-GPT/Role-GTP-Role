import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Input } from './ui/input';
import { toast } from "sonner";
import { 
  Clock, 
  Archive, 
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Plus,
  Lock,
  Code2,
  File,
  BarChart3,
  Edit2,
  Trash2,
  Copy,
  Download,
  MoreHorizontal,
  Folder,
  User
} from 'lucide-react';

interface SimpleChatDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  currentMode: 'standard' | 'advanced' | 'expert';
  messages: any[];
  chatId: string;
  onSettingsChange?: (settings: any) => void;
  isMobile?: boolean;
}

export function SimpleChatDrawer({ 
  isOpen, 
  onToggle, 
  currentMode, 
  messages,
  chatId,
  onSettingsChange,
  isMobile = false
}: SimpleChatDrawerProps) {
  const [activeTab, setActiveTab] = useState('talk');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // 편집 및 삭제 상태
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'single' | 'all';
    itemId?: string;
    itemTitle?: string;
  }>({ isOpen: false, type: 'single' });
  
  // 고급 설정 상태들
  const [documentGeneration, setDocumentGeneration] = useState(true);
  const [versionControl, setVersionControl] = useState(false);
  const [quickSystem, setQuickSystem] = useState(true);
  const [autoSummary, setAutoSummary] = useState(true);
  const [compressionCycle, setCompressionCycle] = useState([15]);
  const [compressionMethod, setCompressionMethod] = useState('간단한 요약');
  const [compressionLength, setCompressionLength] = useState([5]);
  
  // 모드별 기능 제한
  const isAdvancedMode = currentMode === 'advanced' || currentMode === 'expert';
  const isExpertMode = currentMode === 'expert';
  
  // Mock 데이터 - useState로 실제 상태 관리
  const [mockArtifacts, setMockArtifacts] = useState([
    {
      id: '1',
      title: '프로젝트 관리 가이드라인',
      type: '텍스트',
      wordCount: 1250,
      icon: FileText,
      color: 'text-blue-400',
      createdAt: '2분 전',
      content: '프로젝트 관리의 핵심은 명확한 목표 설정과 체계적인 계획 수립입니다...'
    },
    {
      id: '2', 
      title: 'TypeScript 설정 코드',
      type: '코드',
      wordCount: 89,
      icon: Code2,
      color: 'text-green-400',
      createdAt: '5분 전',
      content: '{\n  "compilerOptions": {\n    "target": "ES2020",\n    "module": "ESNext"\n  }\n}'
    },
    {
      id: '3',
      title: '활성 진행 리포트',
      type: '리포트',
      wordCount: 890,
      icon: BarChart3,
      color: 'text-purple-400',
      createdAt: '10분 전',
      content: '현재 프로젝트 진행률: 73%\n완료된 작업: 15개\n남은 작업: 6개...'
    }
  ]);

  const [mockTimelineData, setMockTimelineData] = useState([
    {
      id: '1',
      turnRange: '1-15',
      timeAgo: '33분 전',
      summary: '사용자가 프로젝트 관리에 대해 문의했습니다. 팀 협업 도구와 워크플로우 최적화 방법에 대해 논의했습니다.',
      fullContent: '사용자가 프로젝트 관리에 대해 문의했습니다. 팀 협업 도구와 워크플로우 최적화 방법에 대해 논의했으며, Notion과 Slack 통합 방안에 대해 제안했습니다. 또한 애자일 방법론 도입과 스프린트 계획에 대해서도 상세히 다뤘습니다.'
    },
    {
      id: '2',
      turnRange: '16-30', 
      timeAgo: '18분 전',
      summary: '코딩 스타일 가이드라인과 리뷰툴에 대해 논의했습니다.',
      fullContent: '코딩 스타일 가이드라인과 코드 리뷰 도구에 대해 상세히 논의했습니다. ESLint, Prettier 설정 방법과 GitHub Actions를 통한 자동화 워크플로우 구축 방안에 대해 설명했습니다.'
    }
  ]);

  const [mockArchives, setMockArchives] = useState([
    {
      id: '1',
      title: '중요한 회의 내용',
      type: '사용자 저장',
      createdAt: '1시간 전',
      content: '2025년 Q1 로드맵 회의에서 논의된 주요 사항들과 액션 아이템들...',
      icon: User,
      color: 'text-amber-400'
    },
    {
      id: '2',
      title: '기술 스택 결정사항',
      type: '수동 입력',
      createdAt: '3시간 전',
      content: 'React 18, TypeScript 5.0, Tailwind CSS v4 선택 근거와 마이그레이션 계획...',
      icon: Folder,
      color: 'text-indigo-400'
    }
  ]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // 액션 핸들러들
  const handleEdit = (id: string, currentText: string) => {
    setEditingItem(id);
    setEditingText(currentText);
  };

  const handleSaveEdit = (id: string) => {
    // 실제 편집 저장 로직 구현
    if (activeTab === 'talk') {
      setMockTimelineData(prev => prev.map(item => 
        item.id === id 
          ? { ...item, summary: editingText, fullContent: editingText }
          : item
      ));
    } else if (activeTab === 'artifacts') {
      setMockArtifacts(prev => prev.map(item => 
        item.id === id 
          ? { ...item, content: editingText }
          : item
      ));
    } else if (activeTab === 'archive') {
      setMockArchives(prev => prev.map(item => 
        item.id === id 
          ? { ...item, content: editingText }
          : item
      ));
    }
    
    toast.success('내용이 수정되었습니다.');
    setEditingItem(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditingText('');
  };

  const handleCopy = (text: string, title: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`"${title}" 내용이 클립보드에 복사되었습니다.`);
    }).catch(() => {
      toast.error('복사에 실패했습니다.');
    });
  };

  const handleExport = (item: any, type: string) => {
    const content = item.content || item.summary || item.fullContent;
    const title = item.title || `${type} ${item.id}`;
    
    // 파일 타입 결정 로직
    let fileExtension = '.md';
    let mimeType = 'text/markdown';
    let exportContent = content;
    
    // 아티팩트의 경우 타입에 따라 확장자 결정
    if (type === 'artifact') {
      if (item.type === '코드') {
        // 코드 내용을 분석해서 언어 결정
        if (content.includes('function') || content.includes('const ') || content.includes('import ')) {
          fileExtension = '.js';
          mimeType = 'text/javascript';
        } else if (content.includes('def ') || content.includes('import ') || content.includes('print(')) {
          fileExtension = '.py';
          mimeType = 'text/x-python';
        } else if (content.includes('class ') || content.includes('public ') || content.includes('package ')) {
          fileExtension = '.java';
          mimeType = 'text/x-java-source';
        } else if (content.includes('#include') || content.includes('int main')) {
          fileExtension = '.cpp';
          mimeType = 'text/x-c++src';
        } else if (content.includes('<!DOCTYPE') || content.includes('<html')) {
          fileExtension = '.html';
          mimeType = 'text/html';
        } else if (content.includes('{') && content.includes('"compilerOptions"')) {
          fileExtension = '.json';
          mimeType = 'application/json';
        } else {
          fileExtension = '.txt';
          mimeType = 'text/plain';
        }
      } else {
        // 일반 텍스트는 .md로
        fileExtension = '.md';
        mimeType = 'text/markdown';
        
        // 마크다운 형식으로 구성
        exportContent = `# ${title}\n\n**타입**: ${item.type}\n**생성일**: ${item.createdAt}\n**단어 수**: ${item.wordCount || 0}자\n\n---\n\n${content}`;
      }
    } else if (type === 'timeline') {
      // 타임라인은 마크다운으로
      fileExtension = '.md';
      mimeType = 'text/markdown';
      exportContent = `# 대화 요약 - 턴 ${item.turnRange}\n\n**시간**: ${item.timeAgo}\n\n## 요약\n${item.summary}\n\n## 전체 내용\n${item.fullContent}`;
    } else if (type === 'archive') {
      // 아카이브는 텍스트로
      fileExtension = '.txt';
      mimeType = 'text/plain';
      exportContent = `${title}\n\n타입: ${item.type}\n생성일: ${item.createdAt}\n\n${content}`;
    }

    // 파일 다운로드
    const dataBlob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9가-힣]/gi, '_').toLowerCase()}${fileExtension}`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success(`"${title}"이 ${fileExtension} 파일로 내보내기 되었습니다.`);
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'single',
      itemId: id,
      itemTitle: title
    });
  };

  const handleDeleteAll = () => {
    setDeleteConfirm({
      isOpen: true,
      type: 'all'
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.type === 'single' && deleteConfirm.itemId) {
      // 개별 삭제 로직
      if (activeTab === 'talk') {
        setMockTimelineData(prev => prev.filter(item => item.id !== deleteConfirm.itemId));
      } else if (activeTab === 'artifacts') {
        setMockArtifacts(prev => prev.filter(item => item.id !== deleteConfirm.itemId));
      } else if (activeTab === 'archive') {
        setMockArchives(prev => prev.filter(item => item.id !== deleteConfirm.itemId));
      }
      toast.success(`"${deleteConfirm.itemTitle}"이 삭제되었습니다.`);
    } else if (deleteConfirm.type === 'all') {
      // 전체 삭제 로직
      if (activeTab === 'talk') {
        setMockTimelineData([]);
      } else if (activeTab === 'artifacts') {
        setMockArtifacts([]);
      } else if (activeTab === 'archive') {
        setMockArchives([]);
      }
      toast.success(`모든 ${activeTab === 'talk' ? '대화 요약' : activeTab === 'artifacts' ? '아티팩트' : '아카이브'}가 삭제되었습니다.`);
    }
    setDeleteConfirm({ isOpen: false, type: 'single' });
  };

  const handleExportAll = () => {
    const currentData = activeTab === 'talk' ? mockTimelineData 
      : activeTab === 'artifacts' ? mockArtifacts 
      : mockArchives;

    const tabName = activeTab === 'talk' ? '대화 요약' : activeTab === 'artifacts' ? '아티팩트' : '아카이브';
    const date = new Date().toISOString().split('T')[0];
    
    // 마크다운 형식으로 전체 내보내기
    let exportContent = `# ${tabName} 전체 내보내기\n\n**내보내기 일시**: ${new Date().toLocaleString('ko-KR')}\n**총 항목 수**: ${currentData.length}개\n\n---\n\n`;
    
    currentData.forEach((item, index) => {
      exportContent += `## ${index + 1}. `;
      
      if (activeTab === 'talk') {
        exportContent += `턴 ${item.turnRange} (${item.timeAgo})\n\n`;
        exportContent += `**요약**: ${item.summary}\n\n`;
        exportContent += `**전체 내용**: ${item.fullContent}\n\n`;
      } else if (activeTab === 'artifacts') {
        exportContent += `${item.title}\n\n`;
        exportContent += `**타입**: ${item.type}\n`;
        exportContent += `**단어 수**: ${item.wordCount}자\n`;
        exportContent += `**생성일**: ${item.createdAt}\n\n`;
        exportContent += `**내용**:\n\`\`\`\n${item.content}\n\`\`\`\n\n`;
      } else {
        exportContent += `${item.title}\n\n`;
        exportContent += `**타입**: ${item.type}\n`;
        exportContent += `**생성일**: ${item.createdAt}\n\n`;
        exportContent += `**내용**: ${item.content}\n\n`;
      }
      
      exportContent += '---\n\n';
    });

    const dataBlob = new Blob([exportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab}_all_${date}.md`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success(`모든 ${tabName}가 마크다운 파일로 내보내기 되었습니다.`);
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

      {/* 드로어 패널 - 초컴팩트한 디자인 */}
      <div className={`fixed right-0 top-0 h-full ${isMobile ? 'w-full' : 'w-[266px]'} bg-background border-l border-border/40 shadow-2xl transform transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* 헤더 - 매우 컴팩트 */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/30">
            <h2 className="text-sm font-medium text-foreground">대화 관리</h2>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-xs px-1.5 py-0" style={{ fontSize: '9px' }}>
                {currentMode.toUpperCase()}
              </Badge>
              <Button onClick={onToggle} variant="ghost" size="icon" className="w-6 h-6 hover:bg-muted/50">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex px-3 pt-2 pb-1.5">
            <div className="relative w-full">
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-5 h-5 flex-shrink-0 hover:bg-muted/50"
                  onClick={() => {
                    const tabs = ['talk', 'artifacts', 'archive'];
                    const currentIndex = tabs.indexOf(activeTab);
                    const newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                    setActiveTab(tabs[newIndex]);
                  }}
                >
                  <ChevronLeft className="w-2.5 h-2.5" />
                </Button>

                <div className="flex flex-1 rounded bg-muted/30 p-0.5 min-w-0 overflow-hidden">
                  {(() => {
                    const tabs = [
                      { id: 'talk', icon: Clock, label: 'Talk' },
                      { id: 'artifacts', icon: FileText, label: 'Arti' },
                      { id: 'archive', icon: Archive, label: 'Arch' }
                    ];
                    
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                    const visibleTabs = [
                      tabs[currentIndex],
                      tabs[(currentIndex + 1) % tabs.length]
                    ];

                    return visibleTabs.map((tab, index) => {
                      const isActive = tab.id === activeTab;
                      const Icon = tab.icon;
                      
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded text-xs font-medium transition-all duration-200 min-w-0 ${
                            isActive
                              ? 'bg-background text-foreground shadow-sm border border-border/20' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                          }`}
                          style={{ fontSize: '10px' }}
                        >
                          <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{tab.label}</span>
                        </button>
                      );
                    });
                  })()}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="w-5 h-5 flex-shrink-0 hover:bg-muted/50"
                  onClick={() => {
                    const tabs = ['talk', 'artifacts', 'archive'];
                    const currentIndex = tabs.indexOf(activeTab);
                    const newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                    setActiveTab(tabs[newIndex]);
                  }}
                >
                  <ChevronRight className="w-2.5 h-2.5" />
                </Button>
              </div>

              <div className="flex justify-center mt-1 gap-0.5">
                {['talk', 'artifacts', 'archive'].map((tab) => (
                  <div
                    key={tab}
                    className={`w-1 h-1 rounded-full transition-all duration-200 ${
                      activeTab === tab 
                        ? 'bg-foreground' 
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'talk' && (
              <>
                <div className="px-2.5 py-1.5 space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border">
                  {/* 타임라인 요약 섹션 */}
                  <div className="bg-muted/20 border border-border/30 rounded p-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {!isAdvancedMode ? (
                          <Lock className="w-3 h-3 text-amber-500" />
                        ) : (
                          <Clock className="w-3 h-3 text-green-500" />
                        )}
                        <span className="text-xs font-medium text-foreground">타임라인 요약</span>
                      </div>
                      <Badge className={`px-1 py-0 ${
                        isAdvancedMode 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`} style={{ fontSize: '9px' }}>
                        {isAdvancedMode ? '활성' : 'Locked'}
                      </Badge>
                    </div>
                    
                    {isAdvancedMode && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">자동 요약</span>
                          <Switch 
                            checked={autoSummary} 
                            onCheckedChange={setAutoSummary}
                            className="scale-75"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs">압축 주기</span>
                            <span className="text-xs text-muted-foreground">{compressionCycle[0]}턴</span>
                          </div>
                          <Slider
                            value={compressionCycle}
                            onValueChange={setCompressionCycle}
                            max={30}
                            min={5}
                            step={5}
                            className="w-full h-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 대화 요약 목록 */}
                  <div className="space-y-2">
                    {mockTimelineData.map((item) => (
                      <div key={item.id} className="bg-muted/20 border border-border/30 rounded">
                        <div className="p-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-medium text-foreground" style={{ fontSize: '10px' }}>
                              턴 {item.turnRange}
                            </span>
                            <div className="flex items-center gap-0.5">
                              <span className="text-muted-foreground" style={{ fontSize: '9px' }}>{item.timeAgo}</span>
                              <div className="flex items-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleExpanded(item.id)}
                                  className="w-4 h-4 hover:bg-muted/50"
                                >
                                  {expandedItems.has(item.id) ? 
                                    <ChevronUp className="w-2.5 h-2.5" /> : 
                                    <ChevronDown className="w-2.5 h-2.5" />
                                  }
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="w-4 h-4 hover:bg-muted/50"
                                  onClick={() => handleEdit(item.id, expandedItems.has(item.id) ? item.fullContent : item.summary)}
                                >
                                  <Edit2 className="w-2 h-2" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="w-4 h-4 hover:bg-muted/50"
                                  onClick={() => handleCopy(expandedItems.has(item.id) ? item.fullContent : item.summary, `턴 ${item.turnRange}`)}
                                >
                                  <Copy className="w-2 h-2" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="w-4 h-4 hover:bg-muted/50"
                                  onClick={() => handleExport(item, 'timeline')}
                                >
                                  <Download className="w-2 h-2" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="w-4 h-4 hover:bg-muted/50"
                                  onClick={() => handleDelete(item.id, `턴 ${item.turnRange}`)}
                                >
                                  <Trash2 className="w-2 h-2" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {editingItem === item.id ? (
                            <div className="space-y-1.5">
                              <Input
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="text-xs h-6"
                                style={{ fontSize: '10px' }}
                              />
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-5 px-2"
                                  style={{ fontSize: '9px' }}
                                  onClick={() => handleSaveEdit(item.id)}
                                >
                                  저장
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 px-2"
                                  style={{ fontSize: '9px' }}
                                  onClick={handleCancelEdit}
                                >
                                  취소
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-foreground/90 leading-relaxed" style={{ fontSize: '10px' }}>
                              {expandedItems.has(item.id) ? item.fullContent : item.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 하단 일괄 액션 버튼 */}
                <div className="px-2.5 py-2 border-t border-border/30">
                  <div className="flex gap-1.5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-6" 
                      style={{ fontSize: '10px' }}
                      onClick={handleExportAll}
                    >
                      <Download className="w-2.5 h-2.5 mr-1" />
                      전체 내보내기
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-6" 
                      style={{ fontSize: '10px' }}
                      onClick={handleDeleteAll}
                    >
                      <Trash2 className="w-2.5 h-2.5 mr-1" />
                      전체 삭제
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(open) => !open && setDeleteConfirm({ isOpen: false, type: 'single' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteConfirm.type === 'single' 
                ? `"${deleteConfirm.itemTitle}" 삭제` 
                : `모든 ${activeTab === 'talk' ? '대화 요약' : activeTab === 'artifacts' ? '아티팩트' : '아카이브'} 삭제`
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm.type === 'single' 
                ? '이 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.' 
                : '모든 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm({ isOpen: false, type: 'single' })}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}