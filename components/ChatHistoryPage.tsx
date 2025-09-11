import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { ArrowLeft, Search, MessageSquare, Clock, MoreHorizontal, Download, FolderPlus, Trash2, Pin, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface ChatHistoryPageProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory?: Array<{
    id: string;
    title: string;
    role: any;
    messages: any[];
    createdAt: Date;
    lastMessageAt: Date;
    isPinned?: boolean;
  }>;
  onChatSelect?: (chatId: string) => void;
  onChatDelete?: (chatId: string) => void;
  onChatExport?: (chatId: string) => void;
  onChatAddToProject?: (chatId: string) => void;
  onImportChats?: () => void;
  currentChatId?: string;
  roles?: any[];
}

export function ChatHistoryPage({ 
  isOpen, 
  onClose, 
  chatHistory = [], 
  onChatSelect,
  onChatDelete,
  onChatExport,
  onChatAddToProject,
  onImportChats,
  currentChatId,
  roles = []
}: ChatHistoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 필터링
  const filteredChats = chatHistory.filter(chat => {
    if (!searchQuery) return true;
    return chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           chat.messages.some(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // 채팅을 최근 순으로 정렬 (핀된 채팅 우선)
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const getRoleInfo = (roleId: string) => {
    return roles.find(r => r.id === roleId) || { name: '기본 어시스턴트', category: 'general' };
  };

  const getLastMessage = (messages: any[]) => {
    if (messages.length === 0) return '채팅을 시작해보세요';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.text.length > 80 
      ? lastMessage.text.slice(0, 80) + '...' 
      : lastMessage.text;
  };

  const handleChatClick = (chatId: string) => {
    if (onChatSelect) {
      onChatSelect(chatId);
      onClose();
    }
  };

  const handleExport = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChatExport) {
      onChatExport(chatId);
    }
  };

  const handleAddToProject = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChatAddToProject) {
      onChatAddToProject(chatId);
    }
  };

  const handleDelete = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChatDelete) {
      onChatDelete(chatId);
      toast.success('채팅이 삭제되었습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-medium">채팅 히스토리</h1>
            <Badge variant="secondary" className="ml-2">
              {filteredChats.length}개
            </Badge>
          </div>
          
          {onImportChats && (
            <Button 
              variant="outline" 
              onClick={onImportChats}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              대화 가져오기
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="채팅 제목이나 내용으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {sortedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-4" />
            {chatHistory.length === 0 ? (
              <div className="text-center">
                <h3 className="font-medium mb-2">아직 채팅 기록이 없습니다</h3>
                <p className="text-sm">Role을 선택해서 대화를 시작해보세요</p>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="font-medium mb-2">검색 결과가 없습니다</h3>
                <p className="text-sm">다른 키워드로 검색해보세요</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {sortedChats.map((chat) => {
              const role = getRoleInfo(chat.role?.id || '');
              const isCurrent = currentChatId === chat.id;
              
              return (
                <div
                  key={chat.id}
                  className={`group p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                    isCurrent ? 'bg-accent border-primary/50' : 'bg-card border-border'
                  }`}
                  onClick={() => handleChatClick(chat.id)}
                >
                  <div className="flex items-start justify-between">
                    {/* Left Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title and Pin */}
                      <div className="flex items-center gap-2 mb-2">
                        {chat.isPinned && <Pin className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                        <h3 className="font-medium truncate">
                          {chat.title}
                        </h3>
                        {isCurrent && (
                          <Badge variant="default" className="text-xs px-2 py-0 ml-2">
                            현재
                          </Badge>
                        )}
                      </div>
                      
                      {/* Role Badge */}
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                          {role.name}
                        </span>
                      </div>
                      
                      {/* Last Message Preview */}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {getLastMessage(chat.messages)}
                      </p>
                      
                      {/* Meta Info */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(new Date(chat.lastMessageAt))}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {chat.messages.length}개 메시지
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center ml-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="top">
                          <DropdownMenuItem onClick={(e) => handleExport(chat.id, e)}>
                            <Download className="w-4 h-4 mr-2" />
                            내보내기
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleAddToProject(chat.id, e)}>
                            <FolderPlus className="w-4 h-4 mr-2" />
                            프로젝트에 추가
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => handleDelete(chat.id, e)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
