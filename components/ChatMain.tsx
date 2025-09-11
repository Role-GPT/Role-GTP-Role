import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Copy, MoreHorizontal, Upload, Trash2, Archive, MessageSquare, ChevronLeft, ChevronRight, Search, Plus, RotateCcw, Bookmark, Download, Edit3, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { speechManager } from '../src/providers/speech';
import { toast } from 'sonner';
import { Textarea } from './ui/textarea';
import logo from "/assets/Role GPT Logo.png";
import { useTheme } from '../src/context/ThemeContext';
import { getModeTagInfo } from '../src/utils/trialManager';

const RoleGptLogo = ({ isMobile = false }: { isMobile?: boolean }) => {
  const { resolvedTheme } = useTheme();
  
  // 테마별 로고 스타일링
  const logoFilter = resolvedTheme === 'light' 
    ? 'filter brightness-0' // 라이트 모드: 검정색
    : 'filter brightness-0 invert'; // 다크 모드: 흰색

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative ${isMobile ? 'mb-4' : 'mb-8'}`}>
        <div className={`${isMobile ? 'w-16 h-16' : 'w-24 h-24'} flex items-center justify-center`}>
          <img 
            src={logo} 
            alt="Role GPT Logo" 
            className={`w-full h-full object-contain transition-all duration-300 ${logoFilter}`}
          />
        </div>
      </div>
      <div className="text-center">
        <span className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-light text-foreground tracking-tight`}>Role GPT</span>
      </div>
    </div>
  );
};

// 채팅 헤더 컴포넌트
const ChatHeader = ({ 
  selectedRole, 
  onExport, 
  onSave, 
  onAddToProject, 
  onDelete,
  onArchive,
  onShare,
  onOpenChatDrawer,
  onNewChat,
  isMobile = false,
  projects = [],
  onProjectSelect,
  onNewProject,
  chatTitle,
  currentMode = 'ephemeral'
}: { 
  selectedRole: any; 
  onExport: () => void;
  onSave: () => void;
  onAddToProject: () => void;
  onDelete: () => void;
  onArchive?: () => void;
  onShare?: () => void;
  onOpenChatDrawer?: () => void;
  onNewChat?: () => void;
  isMobile?: boolean;
  projects?: any[];
  onProjectSelect?: (projectId: string) => void;
  onNewProject?: () => void;
  chatTitle?: string;
  currentMode?: string;
}) => {
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 현재 모드의 태그 정보 가져오기
  const modeTag = getModeTagInfo(currentMode);

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
    <div 
      className={`sticky top-0 z-10 bg-background/80 backdrop-blur-sm ${isMobile ? 'px-4 pb-3' : 'px-6 py-3'}`}
      style={isMobile ? {paddingTop: 'max(12px, env(safe-area-inset-top, 0px))'} : {}}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 ml-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-medium text-foreground">{selectedRole?.name || "어시스턴트"}</h1>
              <span className={`
                text-xs px-2 py-0.5 rounded-full text-white font-medium
                bg-gradient-to-r ${modeTag.color} shadow-sm
              `}>
                {modeTag.text}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{selectedRole?.description || "도움이 되는 어시스턴트"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mr-4">
          {/* 새 채팅 버튼 */}
          {onNewChat && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8" 
                  onClick={onNewChat}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>새 대화 시작하기</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onOpenChatDrawer}>
                <MessageSquare className="w-4 h-4 mr-2" />
                대화 관리
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExport}>
                <Upload className="w-4 h-4 mr-2" />
                내보내기
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault();
                  setProjectDropdownOpen(true);
                }}
                className="relative"
              >
                <span className="flex-1">프로젝트에 추가</span>
                <ChevronLeft className="w-3 h-3 ml-1 text-muted-foreground" />
                
                {/* 프로젝트 선택 서브 드롭다운 */}
                {projectDropdownOpen && (
                  <>
                    {/* 오버레이 */}
                    <div 
                      className="fixed inset-0 z-[80]" 
                      onClick={() => {
                        setProjectDropdownOpen(false);
                        setSearchQuery('');
                      }}
                    />
                    
                    {/* 서브 드롭다운 콘텐츠 - 위쪽으로 열림 */}
                    <div className="absolute right-full bottom-0 mr-2 w-80 bg-background border border-border rounded-lg shadow-lg z-[90] overflow-hidden">
                      {/* 헤더 */}
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-sm font-medium">프로젝트에 추가</div>
                        </div>
                        {chatTitle && (
                          <p className="text-xs text-muted-foreground truncate mb-3">
                            {chatTitle}
                          </p>
                        )}
                        
                        {/* 검색창 */}
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                          <Input
                            placeholder="프로젝트 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-8 text-xs"
                          />
                        </div>
                      </div>

                      {/* 새 프로젝트 만들기 버튼 */}
                      <div className="p-2 border-b border-border">
                        <button 
                          onClick={() => {
                            onNewProject?.();
                            setProjectDropdownOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 p-2 rounded hover:bg-accent transition-colors text-left"
                        >
                          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                            <Plus className="w-3 h-3 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium">새 프로젝트 만들기</div>
                            <div className="text-xs text-muted-foreground">
                              새로운 프로젝트를 생성합니다
                            </div>
                          </div>
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>

                      {/* 프로젝트 목록 */}
                      <ScrollArea className="max-h-60">
                        <div className="p-1">
                          {sortedProjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8">
                              {searchQuery ? (
                                <div className="text-center">
                                  <Search className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                                  <div className="text-xs font-medium mb-1">검색 결과가 없습니다</div>
                                  <p className="text-xs text-muted-foreground">
                                    '{searchQuery}'에 대한 프로젝트를 찾을 수 없습니다
                                  </p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <div className="w-6 h-6 bg-muted rounded mx-auto mb-2 flex items-center justify-center">
                                    📁
                                  </div>
                                  <div className="text-xs font-medium mb-1">프로젝트가 없습니다</div>
                                  <p className="text-xs text-muted-foreground">
                                    첫 번째 프로젝트를 만들어보세요
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {sortedProjects.map((project) => (
                                <button
                                  key={project.id}
                                  onClick={() => {
                                    onProjectSelect?.(project.id);
                                    setProjectDropdownOpen(false);
                                    setSearchQuery('');
                                  }}
                                  className="w-full flex items-center gap-3 p-2 rounded hover:bg-accent transition-colors text-left"
                                >
                                  {/* 프로젝트 아이콘 */}
                                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs">
                                    {getCategoryIcon(project.category)}
                                  </div>
                                  
                                  {/* 프로젝트 정보 */}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium truncate">
                                      {project.title}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <MessageSquare className="w-2 h-2" />
                                      <span>{project.chatCount}개</span>
                                      <span>•</span>
                                      <span>{formatDate(project.lastModified)}</span>
                                    </div>
                                  </div>
                                  
                                  {/* 화살표 아이콘 */}
                                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="w-4 h-4 mr-2" />
                아카이브에 보관
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

interface ChatMainProps {
  messages: any[];
  onExampleClick?: (example: string) => void;
  isMobile?: boolean;
  logoOnly?: boolean;
  selectedRole?: {
    name: string;
    description: string;
    prompt: string;
    category: string;
  } | null;
  onExport?: () => void;
  onSave?: () => void;
  onAddToProject?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onShare?: () => void;
  onOpenChatDrawer?: () => void;
  onNewChat?: () => void;
  currentMode?: 'standard' | 'advanced' | 'expert';
  chatId?: string;
  projects?: any[];
  onProjectSelect?: (projectId: string) => void;
  onNewProject?: () => void;
  chatTitle?: string;
  onRegenerateMessage?: (messageId: number) => void;
  onSaveMessage?: (messageId: number) => void;
  onExportMessage?: (messageId: number) => void;
  onEditMessage?: (messageId: number, newText: string) => void;
  onDeleteMessage?: (messageId: number) => void;
}

export function ChatMain({ 
  messages, 
  onExampleClick, 
  isMobile = false, 
  logoOnly = false, 
  selectedRole,
  onExport = () => {},
  onSave = () => {},
  onAddToProject = () => {},
  onDelete = () => {},
  onArchive = () => {},
  onShare = () => {},
  onOpenChatDrawer = () => {},
  onNewChat = () => {},
  currentMode = 'standard',
  chatId = '',
  projects = [],
  onProjectSelect,
  onNewProject,
  chatTitle,
  onRegenerateMessage = () => {},
  onSaveMessage = () => {},
  onExportMessage = () => {},
  onEditMessage = () => {},
  onDeleteMessage = () => {}
}: ChatMainProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showExpandedMessages, setShowExpandedMessages] = useState(false);
  
  // 초기 표시할 메시지 수
  const INITIAL_MESSAGE_COUNT = 10;
  
  // 표시할 메시지 결정
  const displayMessages = showExpandedMessages || messages.length <= INITIAL_MESSAGE_COUNT 
    ? messages 
    : messages.slice(-INITIAL_MESSAGE_COUNT);
  
  // 자동 스크롤 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 메시지가 변경될 때 자동 스크롤
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // 스크롤 위치 감지
  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollToBottom(!isNearBottom && messages.length > 5);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [messages.length]);
  if (messages.length > 0 && selectedRole) {
    return (
      <div className="flex flex-col h-full">
        {/* 채팅 헤더 */}
        <ChatHeader 
          selectedRole={selectedRole}
          onExport={onExport}
          onSave={onSave}
          onAddToProject={onAddToProject}
          onDelete={onDelete}
          onArchive={onArchive}
          onShare={onShare}
          onOpenChatDrawer={onOpenChatDrawer}
          onNewChat={onNewChat}
          isMobile={isMobile}
          projects={projects}
          onProjectSelect={onProjectSelect}
          onNewProject={onNewProject}
          chatTitle={chatTitle}
          currentMode={currentMode}
        />
        
        {/* 메시지 영역 */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 pb-40 scrollbar-thin scrollbar-thumb-border"
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {/* 더보기 버튼 (오래된 메시지가 있을 때) */}
            {!showExpandedMessages && messages.length > INITIAL_MESSAGE_COUNT && (
              <div className="flex justify-center py-4">
                <Button
                  variant="outline"
                  onClick={() => setShowExpandedMessages(true)}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4 rotate-90" />
                  이전 메시지 {messages.length - INITIAL_MESSAGE_COUNT}개 더보기
                </Button>
              </div>
            )}
            
            {displayMessages.map((message, index) => (
              <div key={message.id || index} className={`flex gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/* AI 메시지 레이아웃 */}
                {message.sender === 'ai' && (
                  <>
                    {/* AI 아바타 */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <img 
                        src={logo} 
                        alt="Assistant" 
                        className="w-5 h-5 object-contain filter brightness-0 invert" 
                      />
                    </div>
                    
                    {/* AI 메시지 내용 */}
                    <div className="flex-1 max-w-3xl">
                      <div className="inline-block p-3 rounded-2xl bg-muted/50 text-foreground group relative mb-4">
                        <div className="whitespace-pre-wrap break-words leading-normal text-sm">
                          {message.text || ''}
                        </div>

                        {/* 데스크톱 호버 액션 - AI 메시지 */}
                        {!isMobile && (
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute -bottom-12 left-0 flex gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-2 shadow-xl z-10">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 hover:bg-blue-500/10 hover:text-blue-600 text-muted-foreground rounded-lg transition-all duration-200"
                              onClick={() => onRegenerateMessage(message.id)}
                              title="다시 생성"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 hover:bg-green-500/10 hover:text-green-600 text-muted-foreground rounded-lg transition-all duration-200"
                              onClick={() => {
                                try {
                                  navigator.clipboard.writeText(message.text || '');
                                  toast.success('메시지가 클립보드에 복사되었습니다.');
                                } catch (error) {
                                  toast.error('클립보드 복사에 실패했습니다.');
                                }
                              }}
                              title="복사"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 hover:bg-purple-500/10 hover:text-purple-600 text-muted-foreground rounded-lg transition-all duration-200"
                              onClick={() => {
                                try {
                                  speechManager.speak(message.text || '');
                                  toast.success('음성 재생을 시작합니다.');
                                } catch (error) {
                                  toast.error('음성 재생에 실패했습니다.');
                                }
                              }}
                              title="음성으로 듣기"
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 hover:bg-yellow-500/10 hover:text-yellow-600 text-muted-foreground rounded-lg transition-all duration-200"
                              onClick={() => onSaveMessage(message.id)}
                              title="북마크에 저장"
                            >
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 hover:bg-indigo-500/10 hover:text-indigo-600 text-muted-foreground rounded-lg transition-all duration-200"
                              onClick={() => onExportMessage(message.id)}
                              title="내보내기"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* 사용자 메시지 레이아웃 */}
                {message.sender === 'user' && (
                  <>
                    {/* 사용자 메시지 내용 */}
                    <div className="max-w-[80%]">
                      <div className="inline-block p-3 rounded-2xl bg-primary text-primary-foreground group relative mb-4">
                        <div className="whitespace-pre-wrap break-words leading-normal text-sm">
                          {message.text || ''}
                        </div>

                        {/* 데스크톱 호버 액션 - 사용자 메시지 */}
                        {!isMobile && (
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute -bottom-12 right-0 flex gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-2 shadow-xl z-10">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 hover:bg-green-500/10 hover:text-green-600 text-muted-foreground rounded-lg transition-all duration-200"
                              onClick={() => {
                                try {
                                  navigator.clipboard.writeText(message.text || '');
                                  toast.success('메시지가 클립보드에 복사되었습니다.');
                                } catch (error) {
                                  toast.error('클립보드 복사에 실패했습니다.');
                                }
                              }}
                              title="복사"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 hover:bg-blue-500/10 hover:text-blue-600 text-muted-foreground rounded-lg transition-all duration-200"
                              onClick={() => {
                                // TODO: 편집 기능 구현
                                toast.info('편집 기능은 곧 구현됩니다.');
                              }}
                              title="편집"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 hover:bg-red-500/10 hover:text-red-600 text-muted-foreground rounded-lg transition-all duration-200"
                              onClick={() => onDeleteMessage(message.id)}
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 사용자 아바타 */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {/* 메시지 끝 지점 (자동 스크롤용) */}
            <div ref={messagesEndRef} />
          </div>
          
          {/* 하단으로 스크롤 버튼 */}
          {showScrollToBottom && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-32 right-8 w-10 h-10 bg-background/90 backdrop-blur-sm border border-border rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:bg-accent z-20"
              title="맨 아래로 스크롤"
            >
              <ChevronLeft className="w-4 h-4 -rotate-90 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Grok 스타일 - 완전히 미니멀한 인터페이스
  return (
    <div className="flex flex-col items-center">
      <RoleGptLogo isMobile={isMobile} />
    </div>
  );
}
