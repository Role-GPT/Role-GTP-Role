import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { X, Search, Plus, FolderPlus, Calendar, MessageSquare, ChevronRight } from 'lucide-react';
import { useIsMobile } from './ui/use-mobile';
import { Project } from '../src/types';

interface ProjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onProjectSelect: (projectId: string) => void;
  onNewProject: () => void;
  chatTitle?: string;
}

export function ProjectSelectionModal({
  isOpen,
  onClose,
  projects,
  onProjectSelect,
  onNewProject,
  chatTitle
}: ProjectSelectionModalProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // 검색 필터링
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 최근 수정일 기준으로 정렬
  const sortedProjects = filteredProjects.sort((a, b) => 
    new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '오늘';
    if (days === 1) return '어제';
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      general: '📁',
      business: '💼',
      creative: '🎨', 
      education: '📚',
      health: '🏥',
      tech: '💻',
      lifestyle: '🌟',
      finance: '💰',
      design: '🎯',
      cooking: '👨‍🍳',
      fitness: '🏋️',
      marketing: '📊',
      mental_health: '🧠',
      photography: '📸'
    };
    return icons[category] || '📁';
  };

  return (
    <>
      {/* 오버레이 - 클릭하면 닫기 */}
      <div 
        className="fixed inset-0 z-[60]"
        onClick={onClose}
      />

      {/* 드롭다운 형태 모달 */}
      <div className={`fixed z-[70] bg-background border border-border rounded-lg shadow-2xl ${
        isMobile 
          ? 'bottom-0 left-0 right-0 max-h-[80vh] rounded-b-none'
          : 'top-16 right-8 w-80 max-h-[500px]'
      }`}>
        {/* 헤더 */}
        <div className={`flex items-center justify-between border-b border-border ${isMobile ? 'p-4' : 'p-4'}`}>
          <div className="flex items-center gap-3">
            <FolderPlus className="w-5 h-5 text-muted-foreground" />
            <div>
              <h2 className="text-base font-medium">프로젝트에 추가</h2>
              {chatTitle && (
                <p className="text-xs text-muted-foreground truncate max-w-64">
                  {chatTitle}
                </p>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 검색창 */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="프로젝트 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-input-background border-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* 새 프로젝트 만들기 버튼 */}
        <div className="p-4 border-b border-border">
          <Button 
            variant="outline" 
            onClick={onNewProject}
            className="w-full justify-start gap-3 h-12"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">새 프로젝트 만들기</div>
              <div className="text-xs text-muted-foreground">
                새로운 프로젝트를 생성합니다
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        {/* 프로젝트 목록 */}
        <ScrollArea className={`${isMobile ? 'max-h-96' : 'max-h-80'}`}>
          <div className="p-2">
            {sortedProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                {searchQuery ? (
                  <div className="text-center">
                    <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium mb-1">검색 결과가 없습니다</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      '{searchQuery}'에 대한 프로젝트를 찾을 수 없습니다
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSearchQuery('')}
                    >
                      검색 초기화
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <FolderPlus className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium mb-1">프로젝트가 없습니다</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      첫 번째 프로젝트를 만들어보세요
                    </p>
                    <Button 
                      onClick={onNewProject}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="w-3 h-3" />
                      새 프로젝트 만들기
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {sortedProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => onProjectSelect(project.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors text-left group"
                  >
                    {/* 프로젝트 아이콘 */}
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                      {getCategoryIcon(project.category)}
                    </div>
                    
                    {/* 프로젝트 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {project.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{project.chatCount}개 채팅</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(project.lastModified)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 화살표 아이콘 */}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
