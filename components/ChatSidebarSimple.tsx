import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Plus,
  MessageSquare,
  Settings,
  Users,
  Search,
  MoreHorizontal,
  Edit3,
  Trash2,
  Pin,
  X,
  Menu,
  ChevronLeft,
} from "lucide-react";
import logo from "@/assets/role-gpt-logo.svg";

interface ChatSidebarSimpleProps {
  isExpanded: boolean;
  onToggle: () => void;
  onSettingsClick?: () => void;
  onRoleGptClick?: () => void;
  onNewChat?: () => void;
  onChatSelect?: (chatId: string) => void;
  onChatRename?: (chatId: string, newTitle: string) => void;
  onChatPin?: (chatId: string) => void;
  onChatDelete?: (chatId: string) => void;
  chatHistory?: Array<{
    id: string;
    title: string;
    role: any;
    messages: any[];
    createdAt: Date;
    lastMessageAt: Date;
    isPinned?: boolean;
  }>;
  currentChatId?: string | null;
  isMobile?: boolean;
}

const ChatItem = ({
  chat,
  isActive,
  onSelect,
  onRename,
  onPin,
  onDelete,
}: {
  chat: any;
  isActive: boolean;
  onSelect: (chatId: string) => void;
  onRename?: (chatId: string, newTitle: string) => void;
  onPin?: (chatId: string) => void;
  onDelete?: (chatId: string) => void;
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title);
  const [showMenu, setShowMenu] = useState(false);

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== chat.title) {
      onRename?.(chat.id, newTitle.trim());
    }
    setIsRenaming(false);
  };

  if (isRenaming) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") {
              setNewTitle(chat.title);
              setIsRenaming(false);
            }
          }}
          className="flex-1 text-sm h-auto py-1 border-none bg-transparent focus:ring-0"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="group relative">
      <button
        onClick={() => onSelect(chat.id)}
        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted/50 ${
          isActive ? "bg-muted text-foreground" : "text-muted-foreground"
        }`}
      >
        <MessageSquare className="w-4 h-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm font-medium">{chat.title}</div>
          {chat.role && (
            <div className="text-xs text-muted-foreground truncate">
              {chat.role.name}
            </div>
          )}
        </div>
        {chat.isPinned && <Pin className="w-3 h-3 text-yellow-500" />}
      </button>

      {/* 호버 메뉴 */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-40 bg-background border border-border rounded-lg shadow-lg z-50 py-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                onClick={() => {
                  setIsRenaming(true);
                  setShowMenu(false);
                }}
              >
                <Edit3 className="w-4 h-4" />
                이름 변경
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                onClick={() => {
                  onPin?.(chat.id);
                  setShowMenu(false);
                }}
              >
                <Pin className="w-4 h-4" />
                {chat.isPinned ? "핀 해제" : "핀 고정"}
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-destructive"
                onClick={() => {
                  onDelete?.(chat.id);
                  setShowMenu(false);
                }}
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export function ChatSidebarSimple({
  isExpanded,
  onToggle,
  onSettingsClick,
  onRoleGptClick,
  onNewChat,
  onChatSelect,
  onChatRename,
  onChatPin,
  onChatDelete,
  chatHistory = [],
  currentChatId,
  isMobile = false,
}: ChatSidebarSimpleProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      {/* 모바일 오버레이 */}
      {isExpanded && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={onToggle}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-background border-r border-border flex flex-col transition-all duration-300 ${
          isMobile ? "w-[280px]" : isExpanded ? "w-64" : "w-16"
        }`}
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-border">
          {isExpanded || isMobile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Role GPT"
                  className="w-6 h-6 object-contain filter brightness-0 invert"
                />
                <span className="font-semibold text-lg">Role GPT</span>
              </div>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="w-8 h-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <img
                src={logo}
                alt="Role GPT"
                className="w-6 h-6 object-contain filter brightness-0 invert"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="w-8 h-8"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {isExpanded || isMobile ? (
          <>
            {/* 새 채팅 버튼 */}
            <div className="p-4">
              <Button
                onClick={onNewChat}
                className="w-full justify-start gap-3 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                새 채팅
              </Button>
            </div>

            {/* 검색 */}
            <div className="px-4 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="채팅 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 bg-muted/50 border-0"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 채팅 목록 */}
            <div className="flex-1 px-4 pb-4 overflow-y-auto">
              <div className="space-y-1">
                {chatHistory
                  .filter((chat) =>
                    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .sort((a, b) => {
                    if (a.isPinned && !b.isPinned) return -1;
                    if (!a.isPinned && b.isPinned) return 1;
                    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
                  })
                  .map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === currentChatId}
                      onSelect={onChatSelect!}
                      onRename={onChatRename}
                      onPin={onChatPin}
                      onDelete={onChatDelete}
                    />
                  ))}
              </div>
            </div>

            {/* 하단 메뉴 */}
            <div className="p-4 border-t border-border">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  onClick={onRoleGptClick}
                  className="w-full justify-start gap-3"
                >
                  <Users className="w-4 h-4" />
                  Role 갤러리
                </Button>
                <Button
                  variant="ghost"
                  onClick={onSettingsClick}
                  className="w-full justify-start gap-3"
                >
                  <Settings className="w-4 h-4" />
                  설정
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* 축소된 사이드바 */
          <div className="flex flex-col items-center py-4 space-y-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              title="새 채팅"
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRoleGptClick}
              title="Role 갤러리"
            >
              <Users className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              title="설정"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
