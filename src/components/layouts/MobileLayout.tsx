import { ChatMain } from '../ChatMain';
import { GrokStyleInput } from '../GrokStyleInput';
import { RoleCarousel } from '../RoleCarousel';
import { RoleCategoryButtons } from '../RoleCategoryButtons';
import { AdvancedCarousel } from '../AdvancedCarousel';
import { MobileRandomRoleCarousel } from '../MobileRandomRoleCarousel';
import { FUN_ROLES } from '../../src/constants';

interface MobileLayoutProps {
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

export function MobileLayout({
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
}: MobileLayoutProps) {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 pb-20">
        <div className="flex flex-col items-center space-y-6">
          <ChatMain
            messages={messages}
            onExampleClick={onExampleClick}
            isMobile={true}
            logoOnly={true}
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
          
          <div className="text-center px-4 max-w-sm">
            <p className="text-sm text-muted-foreground/80 font-light leading-relaxed">
              맞춤형 롤플레이를 체험하세요,<br />
              어시스턴트가 당신을 완벽하게 기억합니다.
            </p>
          </div>
        </div>
        
        <div className="w-full px-4">
          {/* 새로운 랜덤 롤 캐러셀 - 타이틀 없이 */}
          <MobileRandomRoleCarousel onRoleSelect={onRoleSelect} />
        </div>
        
        {/* 모바일 하단 고정 입력창 위에 웰컴 카드 - 위치 조정 */}
        <div className="fixed bottom-44 left-0 right-0 px-4 z-5">
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl border border-border/20 p-3 pb-3">
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
              isMobile={true}
            />
          </div>
        </div>
      </div>
      
      {/* 모바일 하단 고정 입력창 */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-10">
        <GrokStyleInput
          onSendMessage={onSendMessage}
          value={inputValue}
          onChange={onInputChange}
          isInCenter={false}
          selectedRole={selectedRole}
          onImageGenerate={undefined}
        />
      </div>
    </>
  );
}