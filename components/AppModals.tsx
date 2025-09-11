import { RoleGptGallery } from './RoleGptGallery';
import { RoleLibrary } from './RoleLibrary';
import { RoleCategoryModal } from './RoleCategoryModal';
import { SafeSettingsModal } from './SafeSettingsModal';
import { Button } from './ui/button';

import { UserAccountModal } from './UserAccountModal';
import { UpgradeModal } from './UpgradeModal';
import { FaqModal } from './FaqModal';
import { NewProjectPage } from './NewProjectPage';
import { ProjectViewPage } from './ProjectViewPage';
import { ProjectGalleryPage } from './ProjectGalleryPage';
import { ProjectDeleteModal } from './ProjectDeleteModal';
import { IconPickerModal } from './IconPickerModal';
import { ChatBackupModal } from './ChatBackupModal';
import { ChatDeleteModal } from './ChatDeleteModal';
import { ChartGeneratorModal } from './ChartGeneratorModal';
import { ChartDisplayModal } from './ChartDisplayModal';
import { ImageGenerationModal } from './ImageGenerationModal';
import { CanvasViewer } from './CanvasViewer';
import { Toaster } from './ui/sonner';
import { ChartResponse } from '../src/services/chartService';

interface AppModalsProps {
  // Gallery & Library states
  roleGptOpen: boolean;
  setRoleGptOpen: (open: boolean) => void;
  roleLibraryOpen: boolean;
  setRoleLibraryOpen: (open: boolean) => void;
  categoryModalOpen: boolean;
  setCategoryModalOpen: (open: boolean) => void;
  selectedCategory: string;
  categoryButtonPosition?: { x: number; y: number };
  
  // Settings states
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  
  // User account states
  userAccountOpen: boolean;
  setUserAccountOpen: (open: boolean) => void;
  upgradeOpen: boolean;
  setUpgradeOpen: (open: boolean) => void;
  faqOpen: boolean;
  setFaqOpen: (open: boolean) => void;
  
  // Backup states
  chatBackupOpen: boolean;
  setChatBackupOpen: (open: boolean) => void;
  
  // Project states
  newProjectOpen: boolean;
  setNewProjectOpen: (open: boolean) => void;
  projectViewOpen: boolean;
  setProjectViewOpen: (open: boolean) => void;
  projectGalleryOpen: boolean;
  setProjectGalleryOpen: (open: boolean) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  projectDeleteModalOpen: boolean;
  setProjectDeleteModalOpen: (open: boolean) => void;
  projectToDelete: { id: string; title: string } | null;
  setProjectToDelete: (project: { id: string; title: string } | null) => void;
  
  // Icon picker states
  iconPickerOpen: boolean;
  setIconPickerOpen: (open: boolean) => void;
  iconPickerTarget: { type: 'chat' | 'project'; id: string } | null;
  setIconPickerTarget: (target: { type: 'chat' | 'project'; id: string } | null) => void;
  
  // Chat delete states
  chatDeleteModalOpen: boolean;
  setChatDeleteModalOpen: (open: boolean) => void;
  chatToDelete: { id: string; title: string } | null;
  setChatToDelete: (chat: { id: string; title: string } | null) => void;
  
  // Chart states (AI가 내부적으로 사용)
  chartDisplayOpen?: boolean;
  setChartDisplayOpen?: (open: boolean) => void;
  displayedChart?: ChartResponse | null;
  setDisplayedChart?: (chart: ChartResponse | null) => void;
  
  // Image generation states
  imageGenerationOpen?: boolean;
  setImageGenerationOpen?: (open: boolean) => void;
  
  // Canvas viewer states
  canvasViewerOpen?: boolean;
  setCanvasViewerOpen?: (open: boolean) => void;
  currentDocument?: any;
  documents?: any[];
  
  // Handlers
  onRoleSelect: (role: any) => void;
  onChatSelect: (chatId: string) => void;
  onProjectSelect: (projectId: string) => void;
  onProjectViewAll: () => void;
  onProjectDeleteConfirm: () => void;
  onProjectDeleteCancel: () => void;
  onChatDeleteConfirm: () => void;
  onChatDeleteCancel: () => void;
  onIconSelect: (iconName: string) => void;
  onUpdateProject: (projectId: string, updates: any) => void;
  onAddProject: (project: any) => string;
  onDeleteProject: (projectId: string) => void;
  onChatRemoveFromProject: (chatId: string) => void;
  onDropChatToProject: (chatId: string, projectId: string) => void;
  onImportBackup: (backupData: any) => void;
  
  // Data
  state: any;
  sidebarExpanded: boolean;
}

export function AppModals({
  roleGptOpen,
  setRoleGptOpen,
  roleLibraryOpen,
  setRoleLibraryOpen,
  categoryModalOpen,
  setCategoryModalOpen,
  selectedCategory,
  categoryButtonPosition,
  settingsOpen,
  setSettingsOpen,
  userAccountOpen,
  setUserAccountOpen,
  upgradeOpen,
  setUpgradeOpen,
  faqOpen,
  setFaqOpen,
  chatBackupOpen,
  setChatBackupOpen,
  newProjectOpen,
  setNewProjectOpen,
  projectViewOpen,
  setProjectViewOpen,
  projectGalleryOpen,
  setProjectGalleryOpen,
  selectedProjectId,
  setSelectedProjectId,
  projectDeleteModalOpen,
  setProjectDeleteModalOpen,
  projectToDelete,
  setProjectToDelete,
  iconPickerOpen,
  setIconPickerOpen,
  iconPickerTarget,
  setIconPickerTarget,
  chatDeleteModalOpen,
  setChatDeleteModalOpen,
  chatToDelete,
  setChatToDelete,
  chartDisplayOpen = false,
  setChartDisplayOpen = () => {},
  displayedChart = null,
  setDisplayedChart = () => {},
  imageGenerationOpen = false,
  setImageGenerationOpen = () => {},
  canvasViewerOpen = false,
  setCanvasViewerOpen = () => {},
  currentDocument = null,
  documents = [],
  onRoleSelect,
  onChatSelect,
  onProjectSelect,
  onProjectViewAll,
  onProjectDeleteConfirm,
  onProjectDeleteCancel,
  onChatDeleteConfirm,
  onChatDeleteCancel,
  onIconSelect,
  onUpdateProject,
  onAddProject,
  onDeleteProject,
  onChatRemoveFromProject,
  onDropChatToProject,
  onImportBackup,
  state,
  sidebarExpanded
}: AppModalsProps) {
  return (
    <>
      {/* Role GPT Gallery Modal */}
      <RoleGptGallery
        isOpen={roleGptOpen}
        onClose={() => setRoleGptOpen(false)}
        onRoleSelect={onRoleSelect}
        selectedCategory={selectedCategory}
        onOpenLibrary={() => {
          setRoleGptOpen(false);
          setRoleLibraryOpen(true);
        }}
      />

      {/* Role Library Modal */}
      <RoleLibrary
        isOpen={roleLibraryOpen}
        onClose={() => setRoleLibraryOpen(false)}
        onRoleSelect={onRoleSelect}
      />

      {/* Role Category Modal */}
      <RoleCategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        category={selectedCategory}
        onRoleSelect={onRoleSelect}
        buttonPosition={categoryButtonPosition}
      />

      {/* Settings Modal - 더 이상 사용하지 않음. UserAccountModal에 통합됨 */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSettingsOpen(false)} />
          <div className="bg-background p-6 rounded-lg shadow-lg">
            <p className="text-center text-muted-foreground mb-4">
              설정은 이제 계정 메뉴에서 통합 관리됩니다.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                닫기
              </Button>
              <Button onClick={() => {
                setSettingsOpen(false);
                setUserAccountOpen(true);
              }}>
                통합 설정으로 이동
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Account Modal */}
      <UserAccountModal
        isOpen={userAccountOpen}
        onClose={() => setUserAccountOpen(false)}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
      />

      {/* FAQ Modal */}
      <FaqModal
        isOpen={faqOpen}
        onClose={() => setFaqOpen(false)}
      />

      {/* Chat Backup Modal */}
      <ChatBackupModal
        isOpen={chatBackupOpen}
        onClose={() => setChatBackupOpen(false)}
        conversations={state.conversations}
        roles={state.roles}
        projects={state.projects}
        onImportBackup={onImportBackup}
        selectedChatId={state.activeChatId}
      />

      {/* New Project Sidebar */}
      {newProjectOpen && (
        <NewProjectPage
          isOpen={newProjectOpen}
          onClose={() => setNewProjectOpen(false)}
          fromGallery={projectGalleryOpen}
          sidebarExpanded={sidebarExpanded}
          onCreateProject={(projectData) => {
            const existingProject = state.projects.find((p: any) => p.title === projectData.title);
            
            if (existingProject) {
              onUpdateProject(existingProject.id, {
                description: projectData.description,
                guidelines: projectData.guidelines?.join('\n\n') || '',
                lastModified: new Date()
              });
              return existingProject.id;
            } else {
              return onAddProject({
                id: `project_${Date.now()}`,
                title: projectData.title,
                description: projectData.description,
                category: 'general',
                guidelines: projectData.guidelines?.join('\n\n') || '',
                createdAt: new Date(),
                lastModified: new Date(),
                chatCount: 0,
                isPinned: false
              });
            }
          }}
          onDeleteProject={onDeleteProject}
          onDuplicateProject={(projectData) => {
            onAddProject({
              id: `project_${Date.now()}`,
              title: projectData.title,
              description: projectData.description,
              category: 'general',
              guidelines: projectData.guidelines?.join('\n\n') || '',
              createdAt: new Date(),
              lastModified: new Date(),
              chatCount: 0,
              isPinned: false
            });
          }}
        />
      )}

      {/* Project View Page */}
      {projectViewOpen && (
        <ProjectViewPage
          isOpen={projectViewOpen}
          onClose={() => {
            setProjectViewOpen(false);
            setSelectedProjectId(null);
          }}
          project={selectedProjectId ? state.projects.find((p: any) => p.id === selectedProjectId) || null : null}
          projectChats={selectedProjectId ? state.conversations.filter((c: any) => c.projectId === selectedProjectId) : []}
          roles={state.roles}
          onUpdateProject={onUpdateProject}
          onChatSelect={(chatId) => {
            onChatSelect(chatId);
            setProjectViewOpen(false);
            setSelectedProjectId(null);
          }}
          onChatRemoveFromProject={onChatRemoveFromProject}
          onDropChatToProject={onDropChatToProject}
          sidebarExpanded={sidebarExpanded}
        />
      )}

      {/* Project Delete Modal */}
      <ProjectDeleteModal
        isOpen={projectDeleteModalOpen}
        onClose={onProjectDeleteCancel}
        onConfirm={onProjectDeleteConfirm}
        projectTitle={projectToDelete?.title || ''}
      />

      {/* Chat Delete Modal */}
      <ChatDeleteModal
        isOpen={chatDeleteModalOpen}
        onClose={onChatDeleteCancel}
        onConfirm={onChatDeleteConfirm}
        chatTitle={chatToDelete?.title || ''}
      />

      {/* Icon Picker Modal */}
      <IconPickerModal
        isOpen={iconPickerOpen}
        onClose={() => {
          setIconPickerOpen(false);
          setIconPickerTarget(null);
        }}
        onIconSelect={onIconSelect}
        currentIcon={
          iconPickerTarget?.type === 'chat' 
            ? state.conversations.find((c: any) => c.id === iconPickerTarget.id)?.icon
            : iconPickerTarget?.type === 'project'
              ? state.projects.find((p: any) => p.id === iconPickerTarget.id)?.icon
              : undefined
        }
        title={
          iconPickerTarget?.type === 'chat' ? '채팅 아이콘 선택' : '프로젝트 아이콘 선택'
        }
      />



      {/* Chart Display Modal */}
      <ChartDisplayModal
        isOpen={chartDisplayOpen}
        onClose={() => {
          setChartDisplayOpen(false);
          setDisplayedChart(null);
        }}
        chart={displayedChart}
        title="생성된 차트"
        description="데이터 시각화 차트가 성공적으로 생성되었습니다."
        onRegenerate={() => {
          setChartDisplayOpen(false);
          // 차트 재생성은 별도 구현이 필요합니다
          console.log('차트 재생성 요청');
        }}
      />

      {/* Image Generation Modal */}
      <ImageGenerationModal
        isOpen={imageGenerationOpen}
        onClose={() => setImageGenerationOpen(false)}
        userSettings={state.userSettings}
        onImageGenerated={(result) => {
          console.log('이미지 생성 완료:', result);
          // 필요시 추가 처리 로직
        }}
      />

      {/* Canvas Viewer Modal */}
      <CanvasViewer
        isOpen={canvasViewerOpen}
        onClose={() => setCanvasViewerOpen(false)}
        document={currentDocument}
        documents={documents}
        onDocumentSave={(doc) => {
          console.log('문서 저장:', doc);
          // 문서 저장 로직 구현
        }}
        onDocumentDelete={(docId) => {
          console.log('문서 삭제:', docId);
          // 문서 삭제 로직 구현
        }}
        onDocumentDuplicate={(docId) => {
          console.log('문서 복제:', docId);
          // 문서 복제 로직 구현
        }}
        currentChatId={state.activeChatId}
      />

      {/* Toast Notifications */}
      <Toaster />
    </>
  );
}
