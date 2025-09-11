import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Search, FolderPlus, MoreHorizontal, Edit3, Trash, ChevronLeft, Plus, Calendar, MessageSquare } from 'lucide-react';
import { useIsMobile } from './ui/use-mobile';

interface ProjectGalleryPageProps {
  isOpen: boolean;
  onClose: () => void;
  onNewProject: () => void;
  sidebarExpanded?: boolean;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    createdAt: Date;
    lastModified: Date;
    chatCount: number;
    isPinned?: boolean;
  }>;
  onProjectSelect?: (projectId: string) => void;
  onProjectRename?: (projectId: string, newTitle: string) => void;
  onProjectDelete?: (projectId: string) => void;
}

const ProjectCard = ({
  project,
  onSelect,
  onRename,
  onDelete
}: {
  project: {
    id: string;
    title: string;
    description: string;
    category: string;
    createdAt: Date;
    lastModified: Date;
    chatCount: number;
    isPinned?: boolean;
  };
  onSelect?: (projectId: string) => void;
  onRename?: (projectId: string, newTitle: string) => void;
  onDelete?: (projectId: string) => void;
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(project.title);
  const [showMenu, setShowMenu] = useState(false);

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

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== project.title) {
      onRename?.(project.id, newTitle.trim());
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setNewTitle(project.title);
      setIsRenaming(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '오늘';
    if (days === 1) return '어제';
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  if (isRenaming) {
    return (
      <div className="group bg-card border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
            {getCategoryIcon(project.category)}
          </div>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="flex-1 font-medium border-none bg-transparent focus:ring-0 focus:border-none p-0"
            autoFocus
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group bg-card border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors cursor-pointer relative"
      onClick={() => onSelect?.(project.id)}
    >
      {/* 상단 아이콘과 메뉴 */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
          {getCategoryIcon(project.category)}
        </div>
        
        {/* Options menu - only visible on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-accent text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          
          {/* Custom dropdown menu */}
          {showMenu && (
            <>
              {/* Overlay to close menu */}
              <div 
                className="fixed inset-0 z-[60]" 
                onClick={() => setShowMenu(false)}
              />
              
              {/* Menu content - 위쪽으로 열림 */}
              <div className="absolute right-0 bottom-full mb-1 w-44 bg-background border border-border rounded-lg shadow-lg z-[70] py-1">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-foreground text-left transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsRenaming(true);
                    setNewTitle(project.title);
                    setShowMenu(false);
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                  이름 바꾸기
                </button>
                
                <div className="border-t border-border my-1"></div>
                
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-destructive text-left transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete?.(project.id);
                    setShowMenu(false);
                  }}
                >
                  <Trash className="w-4 h-4" />
                  삭제
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 프로젝트 제목 */}
      <div className="mb-2">
        <h3 className="font-medium text-foreground truncate">
          {project.title}
        </h3>
      </div>

      {/* 하단 메타데이터 */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3 h-3" />
          <span>{project.chatCount}개 채팅</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(project.lastModified)}</span>
        </div>
      </div>
    </div>
  );
};

export function ProjectGalleryPage({
  isOpen,
  onClose,
  onNewProject,
  sidebarExpanded = false,
  projects,
  onProjectSelect,
  onProjectRename,
  onProjectDelete
}: ProjectGalleryPageProps) {
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

  return (
    <div className={`h-screen w-screen bg-background overflow-hidden ${isMobile ? '' : sidebarExpanded ? 'pl-76' : 'pl-16'} transition-all duration-300`}>
      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col h-full">
        {/* 헤더 */}
        <div 
          className={`flex items-center justify-between border-b border-border ${isMobile ? 'px-4 pb-4' : 'p-6'}`}
          style={isMobile ? {paddingTop: 'max(16px, env(safe-area-inset-top, 0px))'} : {}}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">프로젝트</h1>
              <p className="text-sm text-muted-foreground">
                {projects.length}개의 프로젝트
              </p>
            </div>
          </div>

          {/* 오른쪽 액션 버튼들 */}
          <div className="flex items-center gap-3">
            {/* 검색창 - 모바일에서는 축소 */}
            <div className={`relative ${isMobile ? 'w-32' : 'w-64'}`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isMobile ? "검색..." : "프로젝트 검색..."}
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

            {/* 추가 버튼 */}
            <Button onClick={onNewProject} className="gap-2" size={isMobile ? "sm" : "default"}>
              <Plus className="w-4 h-4" />
              {!isMobile && "추가"}
            </Button>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-4' : 'p-8'}`}>
          {sortedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96">
              {searchQuery ? (
                <div className="text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>검색 결과가 없습니다</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    '{searchQuery}'에 대한 검색 결과가 없습니다
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery('')} size={isMobile ? "sm" : "default"}>
                    검색 초기화
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <FolderPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>아직 프로젝트가 없습니다</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    첫 번째 프로젝트를 만들어서 시작해보세요
                  </p>
                  <Button onClick={onNewProject} className="gap-2" size={isMobile ? "sm" : "default"}>
                    <Plus className="w-4 h-4" />
                    새 프로젝트 만들기
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'}`}>
              {sortedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={onProjectSelect}
                  onRename={onProjectRename}
                  onDelete={onProjectDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
