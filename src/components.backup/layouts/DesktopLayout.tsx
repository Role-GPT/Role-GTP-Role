import { ChatMain } from '../ChatMain';
import { GrokStyleInput } from '../GrokStyleInput';
import { RoleCarousel } from '../RoleCarousel';
import { RoleCategoryButtons } from '../RoleCategoryButtons';
import { AdvancedCarousel } from '../AdvancedCarousel';

interface DesktopLayoutProps {
  messages: any[];
  selectedRole: any;
  onExampleClick: (example: string) => void;
  onSendMessage: (message: string) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  onRoleSelect: (role: any) => void;
  onCategorySelect: (category: string, buttonPosition?: { x: number; y: number }) => void;
  onWelcomeCardStart?: (prompt: string, roleId: string) => void;
  onImageGenerate?: () => void;
  chatActions: {
    onExport: () => void;
    onSave: () => void;
    onDelete: () => void;
    onArchive: () => void;
    onShare: () => void;
  };
  userSettings: any;
  activeChatId: string;
  projects: any[];
  onProjectSelect: (projectId: string) => void;
  onNewProject: () => void;
  currentChat?: any;
  onAccountModalOpen: () => void;
}

export function DesktopLayout({
  messages,
  selectedRole,
  onExampleClick,
  onSendMessage,
  inputValue,
  onInputChange,
  onRoleSelect,
  onCategorySelect,
  onWelcomeCardStart,
  onImageGenerate,
  chatActions,
  userSettings,
  activeChatId,
  projects,
  onProjectSelect,
  onNewProject,
  currentChat,
  onAccountModalOpen
}: DesktopLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 중앙 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-12 pb-32">
        {/* 로고 영역 */}
        <div className="flex-shrink-0">
          <ChatMain
            messages={messages}
            onExampleClick={onExampleClick}
            isMobile={false}
            selectedRole={selectedRole}
            onExport={chatActions.onExport}
            onSave={chatActions.onSave}
            onAddToProject={() => {}}
            onDelete={chatActions.onDelete}
            onArchive={chatActions.onArchive}
            onShare={chatActions.onShare}
            currentMode={userSettings.mode}
            chatId={activeChatId || ''}
            projects={projects}
            onProjectSelect={onProjectSelect}
            onNewProject={onNewProject}
            chatTitle={currentChat?.title}
          />
        </div>


        {/* 웰컴 카드 캐러셀 - 로고 아래에 위치 */}
        <div className="w-full max-w-3xl px-4">
          <AdvancedCarousel 
            onPromptSelect={(prompt, roleId) => {
              // 기존 동작 (호환성)
              onRoleSelect({ id: roleId });
              onExampleClick(prompt);
            }}
            onStartChat={(prompt, roleId) => {
              // 새로운 ChatGPT 스타일 동작
              if (onWelcomeCardStart) {
                onWelcomeCardStart(prompt, roleId);
              }
            }}
            isMobile={false}
          />
        </div>
        
        {/* 데스크톱 중앙 입력창 */}
        <div className="w-full max-w-4xl px-4">
          <GrokStyleInput
            onSendMessage={onSendMessage}
            value={inputValue}
            onChange={onInputChange}
            isInCenter={true}
            selectedRole={selectedRole}
            onImageGenerate={undefined}
          />
        </div>
        
        {/* 카테고리 버튼들 - 중앙 정렬 */}
        <div className="w-full flex justify-center px-4">
          <RoleCategoryButtons 
            onCategorySelect={onCategorySelect}
            isMobile={false}
          />
        </div>
      </div>
    </div>
  );
}