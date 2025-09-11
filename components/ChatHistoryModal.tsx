import { useState } from 'react';
import { X, Search, MessageSquare, Calendar, Clock, ChevronRight, Star, StarOff, Download, Trash2, Archive, MoreHorizontal, Copy, Edit3 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: any[];
  onChatSelect: (chatId: string) => void;
  onChatDelete: (chatId: string) => void;
  onChatRename: (chatId: string, newTitle: string) => void;
  onChatPin: (chatId: string) => void;
  onChatExport: (chatId: string) => void;
  currentChatId?: string;
  roles: any[];
}

export function ChatHistoryModal({
  isOpen,
  onClose,
  chatHistory,
  onChatSelect,
  onChatDelete,
  onChatRename,
  onChatPin,
  onChatExport,
  currentChatId,
  roles
}: ChatHistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pinned' | 'today' | 'week' | 'month'>('all');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // 날짜 필터링 함수
  const filterByDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    switch (selectedFilter) {
      case 'today':
        return diffDays === 0;
      case 'week':
        return diffDays <= 7;
      case 'month':
        return diffDays <= 30;
      case 'pinned':
        return true; // pinned 필터는 별도로 처리
      default:
        return true;
    }
  };

  // 채팅 필터링 및 정렬
  const filteredChats = chatHistory
    .filter(chat => {
      // 검색어 필터링
      const matchesSearch = !searchQuery || 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.messages.some((msg: any) => msg.text.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // 핀 필터링
      const matchesPin = selectedFilter !== 'pinned' || chat.isPinned;
      
      // 날짜 필터링
      const matchesDate = filterByDate(new Date(chat.lastMessageAt || chat.createdAt));
      
      return matchesSearch && matchesPin && matchesDate;
    })
    .sort((a, b) => {
      // 핀된 채팅을 먼저, 그 다음 최근 메시지 순
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime();
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

  const handleEditStart = (chat: any) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleEditSave = () => {
    if (editingChatId && editingTitle.trim()) {
      onChatRename(editingChatId, editingTitle.trim());
      toast.success('채팅 제목이 변경되었습니다.');
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleEditCancel = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case 'today': return '오늘';
      case 'week': return '이번 주';
      case 'month': return '이번 달';
      case 'pinned': return '즐겨찾기';
      default: return '전체';
    }
  };

  const getRoleInfo = (roleId: string) => {
    return roles.find(r => r.id === roleId) || { name: '기본 어시스턴트', category: 'general' };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5" />
            채팅 히스토리
            <Badge variant="secondary" className="ml-2">
              {filteredChats.length}개
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full px-6 pb-6">
          {/* 검색 및 필터 */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="채팅 제목이나 내용으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* 필터 버튼들 */}
            <div className="flex gap-2">
              {['all', 'pinned', 'today', 'week', 'month'].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter as any)}
                  className="whitespace-nowrap"
                >
                  {getFilterLabel(filter)}
                </Button>
              ))}
            </div>
          </div>

          {/* 채팅 목록 */}
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">검색 결과가 없습니다</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? `"${searchQuery}"에 대한 채팅을 찾을 수 없습니다` : '해당 기간의 채팅이 없습니다'}
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const role = getRoleInfo(chat.roleId);
                  const isEditing = editingChatId === chat.id;
                  const isCurrent = currentChatId === chat.id;
                  
                  return (
                    <div
                      key={chat.id}
                      className={`group p-4 rounded-lg border transition-all duration-200 hover:bg-accent/50 ${
                        isCurrent ? 'bg-accent border-primary/50' : 'border-border'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* 채팅 정보 */}
                        <div className="flex-1 min-w-0">
                          {/* 제목 */}
                          {isEditing ? (
                            <div className="flex gap-2 mb-2">
                              <Input
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                className="h-8"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleEditSave();
                                  if (e.key === 'Escape') handleEditCancel();
                                }}
                                autoFocus
                              />
                              <Button size="sm" onClick={handleEditSave}>저장</Button>
                              <Button size="sm" variant="outline" onClick={handleEditCancel}>취소</Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mb-2">
                              {chat.isPinned && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                              <h3 
                                className="font-medium truncate cursor-pointer hover:text-primary"
                                onClick={() => {
                                  onChatSelect(chat.id);
                                  onClose();
                                }}
                              >
                                {chat.title}
                              </h3>
                              {isCurrent && (
                                <Badge variant="default" className="text-xs px-2 py-0">
                                  현재
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Role 및 메타데이터 */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>{role.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(new Date(chat.lastMessageAt || chat.createdAt))}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{chat.messages.length}개 메시지</span>
                            </div>
                          </div>
                          
                          {/* 마지막 메시지 미리보기 */}
                          {chat.messages.length > 0 && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {chat.messages[chat.messages.length - 1].text}
                            </p>
                          )}
                        </div>

                        {/* 액션 버튼들 */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => {
                              onChatSelect(chat.id);
                              onClose();
                            }}
                            title="채팅 열기"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-8 h-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditStart(chat)}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                제목 수정
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onChatPin(chat.id)}>
                                {chat.isPinned ? (
                                  <>
                                    <StarOff className="w-4 h-4 mr-2" />
                                    즐겨찾기 해제
                                  </>
                                ) : (
                                  <>
                                    <Star className="w-4 h-4 mr-2" />
                                    즐겨찾기 추가
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onChatExport(chat.id)}>
                                <Download className="w-4 h-4 mr-2" />
                                내보내기
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onChatDelete(chat.id)}
                                className="text-destructive"
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
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
