import { useState } from "react";
import { useApp } from "../src/context/AppContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Plus,
  MessageSquare,
  Settings,
  Users,
  Search,
  Edit,
  X,
  FolderPlus,
  MoreHorizontal,
  Edit3,
  Pin,
  Trash,
  Share,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  Palette,
  HelpCircle,
  CreditCard,
} from "lucide-react";
import { IconRenderer } from './IconRenderer';
import logo from "figma:asset/a68fb43a0014b2bfe230e515424245fd48949d41.png";

// 호버 메뉴 버튼 컴포넌트
const HoverMenuButton = ({
  icon: Icon,
  title,
  isExpanded,
  hoverContent,
}: {
  icon: any;
  title: string;
  isExpanded: boolean;
  hoverContent: React.ReactNode;
}) => {
  const [showHover, setShowHover] = useState(false);

  if (!isExpanded) {
    return (
      <div 
        className="relative"
        onMouseEnter={() => setShowHover(true)}
        onMouseLeave={() => setShowHover(false)}
      >
        <button
          className="w-full flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors group relative"
          title={title}
        >
          <Icon className="w-5 h-5" />
        </button>
        
        {showHover && (
          <div className="absolute left-full top-0 ml-2 z-[80]">
            {hoverContent}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowHover(true)}
      onMouseLeave={() => setShowHover(false)}
    >
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors rounded-md"
      >
        <Icon className="w-4 h-4" />
        <span className="text-left">{title}</span>
      </button>
      
      {showHover && (
        <div className="absolute left-full top-0 ml-2 z-[80]">
          {hoverContent}
        </div>
      )}
    </div>
  );
};

// FAQ 호버 콘텐츠
const FAQHoverContent = () => (
  <div className="w-80 bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl p-4">
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
        <HelpCircle className="w-5 h-5 text-primary" />
        <h3 className="font-medium text-foreground">자주 묻는 질문</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-1">🤖 Role GPT란 무엇인가요?</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            특정 역할을 맡은 AI 전문가와 대화할 수 있는 챗봇입니다. 맥락을 완벽하게 기억합니다.
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-foreground mb-1">💬 리마인더는 어떻게 사용하나요?</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            AI가 이전 대화 내용을 기억하여 일관된 상호작용을 제공합니다.
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-foreground mb-1">🔧 프로젝트 기능이란?</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            관련된 채팅들을 그룹화하여 체계적으로 관리할 수 있습니다.
          </p>
        </div>
      </div>
      
      <div className="pt-2 border-t border-border/30">
        <button className="w-full text-xs text-primary hover:text-primary/80 transition-colors">
          더 많은 도움말 보기 →
        </button>
      </div>
    </div>
  </div>
);

// 요금제 호버 콘텐츠
const PricingHoverContent = () => (
  <div className="w-72 bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl p-4">
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
        <CreditCard className="w-5 h-5 text-primary" />
        <h3 className="font-medium text-foreground">요금제</h3>
      </div>
      
      <div className="space-y-3">
        {/* 무료 체험 */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-foreground">🎁 무료 체험</h4>
            <span className="text-xs text-green-500 font-medium">3일 무료</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">내장 Gemini API 사용</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 모든 기능 이용 가능</li>
            <li>• 무제한 채팅</li>
          </ul>
        </div>
        
        {/* 제한된 BYOK */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-foreground">🔑 BYOK 무료</h4>
            <span className="text-xs text-blue-500 font-medium">FREE</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">본인 API 키 사용</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 프로젝트 2개 제한</li>
            <li>• 대화창 10개 제한</li>
          </ul>
        </div>
        
        {/* 프리미엄 */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800/50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-foreground">✨ 프리미엄</h4>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">$9.99</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">1회 결제, 평생 사용</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 무제한 프로젝트</li>
            <li>• 무제한 대화창</li>
            <li>• 모든 고급 기능</li>
          </ul>
        </div>
      </div>
      
      <div className="pt-2 border-t border-border/30">
        <button className="w-full text-xs text-primary hover:text-primary/80 transition-colors">
          자세한 요금제 보기 →
        </button>
      </div>
    </div>
  </div>
);

interface ChatSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  onSettingsClick?: () => void;
  onAccountClick?: () => void;
  onHistoryClick?: () => void;
  onRoleGptClick?: () => void;
  onNewChat?: () => void;
  onNewProject?: () => void;
  onChatSelect?: (chatId: string) => void;
  onSearchClick?: () => void;
  onChatRename?: (chatId: string, newTitle: string) => void;
  onChatPin?: (chatId: string) => void;
  onChatDelete?: (chatId: string) => void;
  onChatExport?: (chatId: string) => void;
  onChatAddToProject?: (chatId: string) => void;
  onChatViewAll?: () => void;
  onChatIconChange?: (chatId: string) => void;
  onProjectSelect?: (projectId: string) => void;
  onProjectRename?: (projectId: string, newTitle: string) => void;
  onProjectViewAll?: () => void;
  onProjectDelete?: (projectId: string) => void;
  onProjectDuplicate?: (projectId: string) => void;
  onProjectIconChange?: (projectId: string) => void;
  chatHistory?: Array<{
    id: string;
    title: string;
    role: any;
    messages: any[];
    createdAt: Date;
    lastMessageAt: Date;
    isPinned?: boolean;
  }>;
  projects?: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    createdAt: Date;
    lastModified: Date;
    chatCount: number;
    isPinned?: boolean;
  }>;
  currentChatId?: string | null;
  isMobile?: boolean;
}

const RoleGptLogo = ({ isExpanded }: { isExpanded: boolean }) => {
  if (!isExpanded) {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <img
          src={logo}
          alt="Role GPT"
          className="w-6 h-6 object-contain filter brightness-0 invert"
        />
      </div>
    );
  }

  return (
    <div className="h-8 w-auto flex items-center gap-3">
      <div className="w-6 h-6 flex items-center justify-center">
        <img
          src={logo}
          alt="Role GPT"
          className="w-full h-full object-contain filter brightness-0 invert"
        />
      </div>
      <span className="text-lg font-medium">Role GPT</span>
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-xs px-2 py-0.5 rounded">
        Plus
      </div>
    </div>
  );
};

const SidebarMenuItem = ({
  icon: Icon,
  children,
  onClick,
  isExpanded,
  tooltip,
}: {
  icon?: any;
  children: React.ReactNode;
  onClick?: () => void;
  isExpanded: boolean;
  tooltip?: string;
}) => {
  if (!isExpanded) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors group relative"
        title={tooltip || (typeof children === "string" ? children : "")}
      >
        {Icon && <Icon className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors rounded-md"
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span className="text-left">{children}</span>
    </button>
  );
};

export function ChatSidebarWithHover(props: ChatSidebarProps) {
  const {
    isExpanded,
    onToggle,
    onSettingsClick,
    onNewChat,
    onRoleGptClick,
    isMobile = false,
  } = props;

  return (
    <>
      {/* Overlay Background when expanded */}
      {isExpanded && (
        <div
          className={`fixed inset-0 z-40 ${isMobile ? "bg-black/30" : "bg-transparent"}`}
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50
        ${isMobile ? "w-[75vw]" : isExpanded ? "w-80" : "w-16"}
        bg-background border-r border-border flex flex-col h-full
        transition-all duration-300 ease-in-out shadow-lg overflow-hidden
      `}
      >
        {/* 전역 스크롤 래퍼 */}
        <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {/* Logo */}
          <div
            className={`${isMobile || isExpanded ? "p-5" : "p-3"} flex items-center ${isMobile || isExpanded ? "justify-start" : "justify-center"} flex-shrink-0`}
          >
            <RoleGptLogo isExpanded={isMobile || isExpanded} />
          </div>

          {/* Main Menu Items */}
          {isMobile || isExpanded ? (
            <div className="px-3 py-2 space-y-1 flex-shrink-0">
              {/* 상단 메뉴 - 핵심 기능들 */}
              <SidebarMenuItem
                icon={Edit}
                isExpanded={true}
                onClick={onNewChat}
              >
                새 채팅
              </SidebarMenuItem>

              <SidebarMenuItem
                icon={Users}
                isExpanded={true}
                onClick={onRoleGptClick}
              >
                Role 갤러리
              </SidebarMenuItem>
            </div>
          ) : (
            <div className="px-2 py-2 space-y-1 flex-shrink-0">
              <SidebarMenuItem
                icon={Edit}
                isExpanded={false}
                tooltip="새 채팅"
                onClick={onNewChat}
              >
                새 채팅
              </SidebarMenuItem>

              <SidebarMenuItem
                icon={Users}
                isExpanded={false}
                tooltip="Role 갤러리"
                onClick={onRoleGptClick}
              >
                Role 갤러리
              </SidebarMenuItem>
            </div>
          )}

          {/* Spacer to push bottom items down */}
          <div className="flex-1"></div>

          {/* 하단 FAQ & 요금제 호버 모달 영역 */}
          {isMobile || isExpanded ? (
            <div className="px-3 py-3 space-y-2 flex-shrink-0 border-t border-border/30">
              <HoverMenuButton
                icon={HelpCircle}
                title="FAQ & 도움말"
                isExpanded={true}
                hoverContent={<FAQHoverContent />}
              />
              <HoverMenuButton
                icon={CreditCard}
                title="요금제"
                isExpanded={true}
                hoverContent={<PricingHoverContent />}
              />
              <SidebarMenuItem
                icon={Settings}
                isExpanded={true}
                onClick={onSettingsClick}
              >
                설정
              </SidebarMenuItem>
            </div>
          ) : (
            <div className="px-2 py-2 space-y-1 flex-shrink-0 border-t border-border/30">
              <HoverMenuButton
                icon={HelpCircle}
                title="FAQ"
                isExpanded={false}
                hoverContent={<FAQHoverContent />}
              />
              <HoverMenuButton
                icon={CreditCard}
                title="요금제"
                isExpanded={false}
                hoverContent={<PricingHoverContent />}
              />
              <SidebarMenuItem
                icon={Settings}
                isExpanded={false}
                tooltip="설정"
                onClick={onSettingsClick}
              >
                설정
              </SidebarMenuItem>
            </div>
          )}
        </div>
      </div>
    </>
  );
}