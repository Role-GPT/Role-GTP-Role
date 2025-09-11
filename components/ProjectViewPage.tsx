import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { X, ChevronLeft, MoreHorizontal, Edit3, Settings, MessageSquare, Calendar, Users, FileText, Folder, Image, Archive, File } from 'lucide-react';
import { toast } from "sonner";
import { ProjectGuidelinesModal } from './ProjectGuidelinesModal';
import { Project, Conversation, Role } from '../src/types';
import { useIsMobile } from './ui/use-mobile';

interface ProjectViewPageProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  projectChats: Conversation[];
  roles: Role[];
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  onChatSelect: (chatId: string) => void;
  onChatRemoveFromProject: (chatId: string) => void;
  onDropChatToProject: (chatId: string, projectId: string) => void;
  sidebarExpanded?: boolean;
}

export function ProjectViewPage({
  isOpen,
  onClose,
  project,
  projectChats,
  roles,
  onUpdateProject,
  onChatSelect,
  onChatRemoveFromProject,
  onDropChatToProject,
  sidebarExpanded = false
}: ProjectViewPageProps) {
  const isMobile = useIsMobile();
  const [editTitle, setEditTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [description, setDescription] = useState('');
  const [guideline, setGuideline] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // 프로젝트가 변경될 때마다 상태 초기화
  useEffect(() => {
    if (project) {
      setEditTitle(project.title);
      setDescription(project.description || '');
      setGuideline(project.guidelines || '');
      setIsEditingTitle(false);
      setShowMenu(false);
      setGuidelinesModalOpen(false);
      setIsDragOver(false);
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleTitleSave = () => {
    if (editTitle.trim() && editTitle !== project.title) {
      onUpdateProject(project.id, { title: editTitle.trim() });
      toast.success('프로젝트 제목이 변경되었습니다.');
    }
    setIsEditingTitle(false);
  };

  const handleGuidelinesSave = (newGuidelines: string) => {
    setGuideline(newGuidelines);
    onUpdateProject(project.id, { guidelines: newGuidelines });
    toast.success('프로젝트 지침이 저장되었습니다.');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const dragData = e.dataTransfer.getData('text/plain');
    if (dragData.startsWith('chat_')) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const chatId = e.dataTransfer.getData('text/plain');
    if (chatId.startsWith('chat_')) {
      onDropChatToProject(chatId, project.id);
      toast.success('채팅이 프로젝트에 추가되었습니다.');
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <>
      {/* 모바일에서만 오버레이 */}
      {isMobile && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose} 
        />
      )}

      {/* 프로젝트 뷰 패널 - 연결형 레이아웃 최적화 */}
      <div className={`fixed top-0 ${isMobile ? 'left-0 w-full' : `${sidebarExpanded ? 'left-76' : 'left-16'} w-68`} h-full bg-background ${sidebarExpanded ? 'border-l-0' : ''} border-r border-border z-50 flex flex-col transition-all duration-300`}>
        {/* 헤더 */}
        <div 
          className={`flex items-center gap-3 border-b border-border ${isMobile ? 'px-4 pb-3' : 'px-4 py-3'}`}
          style={isMobile ? {paddingTop: 'max(12px, env(safe-area-inset-top, 0px))'} : {}}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleSave();
                  } else if (e.key === 'Escape') {
                    setEditTitle(project.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="h-7 text-sm font-medium"
                autoFocus
              />
            ) : (
              <h2 
                className="text-sm font-medium truncate cursor-pointer hover:text-muted-foreground transition-colors"
                onClick={() => setIsEditingTitle(true)}
              >
                {project.title}
              </h2>
            )}
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
              className="h-8 w-8"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-10">
                <div className="p-1">
                  <button
                    onClick={() => {
                      setIsEditingTitle(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded"
                  >
                    <Edit3 className="w-3 h-3" />
                    이름 변경
                  </button>
                  <button
                    onClick={() => {
                      setGuidelinesModalOpen(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded"
                  >
                    <Settings className="w-3 h-3" />
                    지침 편집
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 프로젝트 정보 */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {/* 프로젝트 메타데이터 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>생성일: {project.createdAt.toLocaleDateString('ko-KR')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>채팅 {projectChats.length}개</span>
                </div>
                {project.lastModified && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>수정일: {formatDate(project.lastModified)}</span>
                  </div>
                )}
              </div>

              {/* 설명 */}
              {description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">설명</label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              )}

              {/* 지침 */}
              <div className="space-y-3">
                <label className="text-sm font-medium">지침</label>
                <Button
                  variant="outline"
                  onClick={() => setGuidelinesModalOpen(true)}
                  className="w-full justify-start h-auto py-3"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  <div className="text-left flex-1">
                    <div className="font-medium">프로젝트 지침 설정</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      AI 어시스턴트에게 필요한 정보를 알려주세요
                    </div>
                    {guideline && (
                      <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {guideline.slice(0, 100)}{guideline.length > 100 ? '...' : ''}
                      </div>
                    )}
                  </div>
                </Button>
              </div>

              {/* 파일 */}
              <div className="space-y-3">
                <label className="text-sm font-medium">파일</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-3 bg-muted rounded-lg flex items-center justify-center">
                      <Folder className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      아직 업로드된 파일이 없습니다
                    </p>
                  </div>
                </div>
              </div>

              {/* 대화 목록 */}
              <div className="space-y-3">
                <label className="text-sm font-medium">대화 ({projectChats.length}개)</label>
                
                {/* 드래그 앤 드롭 영역 */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                    isDragOver 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-muted rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      채팅을 여기로 드래그하여 추가
                    </p>
                  </div>
                </div>

                {/* 프로젝트 내 채팅 목록 */}
                {projectChats.length > 0 && (
                  <div className="space-y-2">
                    {projectChats.map((chat) => {
                      const role = roles.find(r => r.id === chat.roleId);
                      return (
                        <div
                          key={chat.id}
                          className="flex items-center gap-3 px-3 py-2.5 bg-muted/30 rounded-lg group cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => onChatSelect(chat.id)}
                        >
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{chat.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {role?.name || '어시스턴트'} • {formatDate(chat.lastMessageAt)}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onChatRemoveFromProject(chat.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* 지침 설정 모달 */}
      <ProjectGuidelinesModal
        isOpen={guidelinesModalOpen}
        onClose={() => setGuidelinesModalOpen(false)}
        onSave={handleGuidelinesSave}
        initialGuidelines={guideline}
      />
    </>
  );
}
