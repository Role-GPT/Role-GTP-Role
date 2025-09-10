import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { X, FolderPlus, ChevronLeft, MoreHorizontal, Edit3, Copy, Trash, Settings, FileText, MessageSquare, Folder, File, Image, Video, Music, Archive, Send, Paperclip, Mic, Plus } from 'lucide-react';
import { toast } from "sonner";
import { ProjectGuidelinesModal } from './ProjectGuidelinesModal';
import { FileAttachmentModal } from './FileAttachmentModal';
import { ScrollArea } from './ui/scroll-area';
import { useIsMobile } from './ui/use-mobile';

interface NewProjectPageProps {
  isOpen: boolean;
  onClose: () => void;
  fromGallery?: boolean; // 갤러리에서 열렸는지 여부
  sidebarExpanded?: boolean; // 사이드바 확장 상태
  onCreateProject: (projectData: {
    title: string;
    description: string;
    guidelines?: string[];
  }) => Promise<string> | string; // 프로젝트 ID 반환
  onDeleteProject?: (projectId: string) => void;
  onDuplicateProject?: (projectData: {
    title: string;
    description: string;
    guidelines?: string[];
  }) => void;
}

export function NewProjectPage({ isOpen, onClose, fromGallery = false, sidebarExpanded = false, onCreateProject, onDeleteProject, onDuplicateProject }: NewProjectPageProps) {
  const isMobile = useIsMobile();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [guideline, setGuideline] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [tempProjectId, setTempProjectId] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('새 프로젝트');
  const [showMenu, setShowMenu] = useState(false);
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState(false);
  const [draggedChats, setDraggedChats] = useState<Array<{id: string, title: string, timestamp: Date}>>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileAttachmentModalOpen, setFileAttachmentModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{id: string, name: string, type: string, size: number, timestamp: Date}>>([]);

  // 컴포넌트가 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setEditTitle('새 프로젝트');
      setIsEditingTitle(false);
      setHasChanges(false);
      setDraggedChats([]);
      setIsDragOver(false);
      setFileAttachmentModalOpen(false);
      setUploadedFiles([]);
    }
  }, [isOpen]);

  // 자동 저장 로직 - 의미있는 변경사항이 있을 때만 저장
  useEffect(() => {
    if (isOpen && hasChanges && !tempProjectId) {
      // 의미있는 변경사항이 있는지 확인
      const shouldAutoSave = 
        (editTitle.trim() && editTitle.trim() !== '새 프로젝트') ||
        description.trim() ||
        guideline.trim() ||
        uploadedFiles.length > 0 ||
        draggedChats.length > 0;

      if (shouldAutoSave) {
        const timeoutId = setTimeout(async () => {
          await createProjectImmediately();
        }, 2000); // 2초 후 자동 저장

        return () => clearTimeout(timeoutId);
      }
    }
  }, [editTitle, description, guideline, uploadedFiles, draggedChats, hasChanges, isOpen, tempProjectId]);

  if (!isOpen) return null;

  const handleInputChange = (field: 'description' | 'guideline', value: string) => {
    if (field === 'description') {
      setDescription(value);
      setHasChanges(true);
    }
    if (field === 'guideline') {
      setGuideline(value);
      setHasChanges(true);
    }
  };

  const handleGuidelinesSave = (newGuidelines: string) => {
    setGuideline(newGuidelines);
    setHasChanges(true);
    
    // 지침이 추가되면 프로젝트 생성
    if (newGuidelines.trim()) {
      createProjectImmediately();
    }
  };

  const handleDuplicate = () => {
    try {
      const finalTitle = `${editTitle.trim() || '새 프로젝트'} (복사본)`;
      
      onDuplicateProject?.({
        title: finalTitle,
        description: description.trim(),
        guidelines: guideline.trim() ? [guideline.trim()] : []
      });
      
      toast.success('프로젝트가 복제되었습니다.');
      setShowMenu(false);
    } catch (error) {
      console.error('Duplicate error:', error);
      toast.error('복제 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = () => {
    if (tempProjectId && onDeleteProject) {
      onDeleteProject(tempProjectId);
      toast.success('프로젝트가 삭제되었습니다.');
      handleClose();
    }
    setShowMenu(false);
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (editTitle.trim()) {
      if (editTitle.trim() !== (title || '새 프로젝트')) {
        setTitle(editTitle.trim());
        setHasChanges(true);
        
        // 제목이 "새 프로젝트"가 아닌 다른 이름으로 변경되면 즉시 프로젝트 생성
        if (editTitle.trim() !== '새 프로젝트') {
          createProjectImmediately();
        }
      }
    } else {
      setEditTitle('새 프로젝트');
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(title || '새 프로젝트');
      setIsEditingTitle(false);
    }
  };

  const handleSave = () => {
    try {
      // 제목이 비어있으면 "새 프로젝트"로 설정
      const finalTitle = editTitle.trim() || '새 프로젝트';
      
      onCreateProject({
        title: finalTitle,
        description: description.trim(),
        guidelines: guideline.trim() ? [guideline.trim()] : []
      });
      
      toast.success('프로젝트가 저장되었습니다.');
      handleClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    }
  };

  // 즉시 프로젝트 생성 함수
  const createProjectImmediately = async () => {
    // 이미 프로젝트가 생성되었거나 생성 중이면 중복 실행 방지
    if (tempProjectId || isAutoSaving) {
      return tempProjectId;
    }

    try {
      setIsAutoSaving(true);
      
      const finalTitle = editTitle.trim() || '새 프로젝트';
      
      const projectId = await onCreateProject({
        title: finalTitle,
        description: description.trim(),
        guidelines: guideline.trim() ? [guideline.trim()] : []
      });
      
      if (typeof projectId === 'string') {
        setTempProjectId(projectId);
      }
      
      setHasChanges(false);
      setIsAutoSaving(false);
      
      return projectId;
    } catch (error) {
      console.error('Project creation error:', error);
      setIsAutoSaving(false);
      return null;
    }
  };

  const handleClose = async () => {
    try {
      // 변경사항이 있거나 의미있는 내용이 있으면 저장
      const shouldSave = 
        hasChanges || 
        (editTitle.trim() && editTitle.trim() !== '새 프로젝트') ||
        description.trim() ||
        guideline.trim() ||
        uploadedFiles.length > 0 ||
        draggedChats.length > 0;

      if (shouldSave && !tempProjectId) {
        // 아직 프로젝트가 생성되지 않았다면 생성
        await createProjectImmediately();
        toast.success('프로젝트가 저장되었습니다.');
      } else if (!shouldSave && tempProjectId && onDeleteProject) {
        // 의미있는 변경사항이 없으면 임시 프로젝트 삭제
        onDeleteProject(tempProjectId);
      }
    } catch (error) {
      console.error('Close error:', error);
    }
    
    // 상태 초기화
    setTitle('');
    setEditTitle('새 프로젝트');
    setIsEditingTitle(false);
    setDescription('');
    setGuideline('');
    setHasChanges(false);
    setIsAutoSaving(false);
    setTempProjectId(null);
    setShowMenu(false);
    setGuidelinesModalOpen(false);
    setDraggedChats([]);
    setIsDragOver(false);
    setFileAttachmentModalOpen(false);
    setUploadedFiles([]);
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // 실제로 영역을 벗어났는지 확인
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // 새 대화창 추가
    const newChat = {
      id: `chat_${Date.now()}`,
      title: '새 대화',
      timestamp: new Date()
    };
    
    setDraggedChats(prev => [...prev, newChat]);
    setHasChanges(true);
    
    // 대화가 추가되면 프로젝트 생성
    createProjectImmediately();
    
    toast.success('새 대화가 추가되었습니다.');
  };

  const removeDraggedChat = (chatId: string) => {
    setDraggedChats(prev => prev.filter(chat => chat.id !== chatId));
  };

  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files).map(file => ({
      id: `file_${Date.now()}_${Math.random()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      timestamp: new Date()
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setHasChanges(true);
    
    // 파일이 업로드되면 프로젝트 생성
    createProjectImmediately();
  };

  const handleTextAdd = (text: string) => {
    const textFile = {
      id: `text_${Date.now()}`,
      name: `텍스트_${new Date().toLocaleTimeString()}`,
      type: 'text/plain',
      size: text.length,
      timestamp: new Date()
    };
    
    setUploadedFiles(prev => [...prev, textFile]);
    setHasChanges(true);
    
    // 텍스트가 추가되면 프로젝트 생성
    createProjectImmediately();
  };

  const handleGoogleDriveConnect = () => {
    // Google Drive 연결 로직 (실제로는 OAuth 인증 필요)
    console.log('Google Drive 연결 시작');
  };

  const removeUploadedFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setHasChanges(true);
  };

  const handleCancel = async () => {
    // 변경사항이 없으면 임시 프로젝트 삭제
    if (tempProjectId && onDeleteProject) {
      const shouldSave = 
        (editTitle.trim() && editTitle.trim() !== '새 프로젝트') ||
        description.trim() ||
        guideline.trim() ||
        uploadedFiles.length > 0 ||
        draggedChats.length > 0;

      if (!shouldSave) {
        onDeleteProject(tempProjectId);
      }
    }
    
    // 상태 초기화하고 닫기
    setTitle('');
    setEditTitle('새 프로젝트');
    setIsEditingTitle(false);
    setDescription('');
    setGuideline('');
    setHasChanges(false);
    setIsAutoSaving(false);
    setTempProjectId(null);
    setShowMenu(false);
    setGuidelinesModalOpen(false);
    setDraggedChats([]);
    setIsDragOver(false);
    setFileAttachmentModalOpen(false);
    setUploadedFiles([]);
    onClose();
  };

  return (
    <>
      {/* 모바일에서만 오버레이 */}
      {isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black/30"
          onClick={handleCancel}
        />
      )}
      
      {/* 사이드바 - 연결형 레이아웃 최적화 */}
      <div className={`fixed ${isMobile ? 'inset-0' : `top-0 ${sidebarExpanded ? 'left-76' : 'left-16'} h-full w-68`} z-50 bg-background ${sidebarExpanded ? 'border-l-0' : ''} border-r border-border flex flex-col shadow-2xl transition-all duration-300`}>
        {/* 헤더 */}
        <div 
          className={`flex items-center justify-between border-b border-border ${isMobile ? 'px-4 pb-4' : 'p-4'}`}
          style={isMobile ? {paddingTop: 'max(16px, env(safe-area-inset-top, 0px))'} : {}}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FolderPlus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            
            {/* 편집 가능한 제목 */}
            {isEditingTitle ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="font-medium h-auto py-0 border-none bg-transparent focus:ring-0 focus:border-none px-0"
                autoFocus
              />
            ) : (
              <button
                onClick={handleTitleEdit}
                className="font-medium text-left hover:text-muted-foreground transition-colors truncate"
              >
                {editTitle || '새 프로젝트'}
              </button>
            )}
            
            {isAutoSaving && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2 flex-shrink-0">
                <div className="w-3 h-3 border border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                저장 중...
              </div>
            )}
          </div>
          
          {/* 더보기 메뉴 */}
          <div className="flex items-center gap-1">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMenu(!showMenu)}
                className="h-8 w-8 flex-shrink-0"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
              
              {/* 더보기 메뉴 드롭다운 */}
              {showMenu && (
                <>
                  {/* 오버레이 */}
                  <div 
                    className="fixed inset-0 z-[60]" 
                    onClick={() => setShowMenu(false)}
                  />
                  
                  {/* 메뉴 콘텐츠 */}
                  <div className="absolute right-0 top-full mt-1 w-44 bg-background border border-border rounded-md shadow-lg z-[70] py-1">
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-foreground text-left transition-colors"
                      onClick={() => {
                        setIsEditingTitle(true);
                        setEditTitle(editTitle || '새 프로젝트');
                        setShowMenu(false);
                      }}
                    >
                      <Edit3 className="w-4 h-4" />
                      이름 바꾸기
                    </button>

                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-foreground text-left transition-colors"
                      onClick={handleDuplicate}
                    >
                      <Copy className="w-4 h-4" />
                      복제
                    </button>
                    
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-destructive text-left transition-colors"
                      onClick={handleDelete}
                    >
                      <Trash className="w-4 h-4" />
                      삭제
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8 flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 파일 탭 헤더 */}
        <div className="flex border-b border-border">
          <div className="flex-1 flex items-center gap-2 px-4 py-3">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">파일</span>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* 지침 설정 (최상단) */}
          <div className="space-y-4">
            <label className="text-sm font-medium">지침</label>
            <Button
              variant="outline"
              onClick={() => setGuidelinesModalOpen(true)}
              className="w-full justify-start h-auto py-4"
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

          {/* 파일 영역 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">파일</label>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFileAttachmentModalOpen(true)}
                className="h-8 w-8"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {uploadedFiles.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <Folder className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">
                    이 프로젝트에 참여하는 Assistant가 해당 컨텐츠에 액세스할 수 있습니다.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 px-3 py-2.5 bg-muted/30 rounded-lg group"
                  >
                    {file.type.startsWith('image/') ? (
                      <Image className="w-4 h-4 text-muted-foreground" />
                    ) : file.type === 'text/plain' ? (
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    ) : file.type.includes('zip') || file.type.includes('archive') ? (
                      <Archive className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <File className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm flex-1 truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {file.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <button
                      onClick={() => removeUploadedFile(file.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 대화 추가 영역 */}
          <div className="space-y-4">
            <label className="text-sm font-medium">대화</label>
            
            {/* 드래그 앤 드롭 영역 */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border'
              }`}
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-muted rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* 추가된 대화 목록 */}
            {draggedChats.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">추가된 대화 ({draggedChats.length}개)</p>
                {draggedChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-center gap-3 px-3 py-2.5 bg-muted/30 rounded-lg group"
                  >
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm flex-1">{chat.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {chat.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <button
                      onClick={() => removeDraggedChat(chat.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 지침 설정 모달 */}
        <ProjectGuidelinesModal
          isOpen={guidelinesModalOpen}
          onClose={() => setGuidelinesModalOpen(false)}
          onSave={handleGuidelinesSave}
          initialGuidelines={guideline}
        />

        {/* 파일 첨부 모달 */}
        <FileAttachmentModal
          isOpen={fileAttachmentModalOpen}
          onClose={() => setFileAttachmentModalOpen(false)}
          onFileUpload={handleFileUpload}
          onTextAdd={handleTextAdd}
          onGoogleDriveConnect={handleGoogleDriveConnect}
        />

      </div>
    </>
  );
}