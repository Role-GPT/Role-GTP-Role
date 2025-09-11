/**
 * Role GPT - 메인 애플리케이션 컴포넌트
 * 
 * ChatGPT 스타일의 AI 채팅 인터페이스
 * - Role 기반 AI 어시스턴트와의 대화
 * - 프로젝트 기반 채팅 관리
 * - 반응형 모바일/데스크톱 지원
 * 
 * @author Role GPT Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { devLog, devWarn, isDevelopment } from './src/utils/devUtils';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatMain } from './components/ChatMain';
import { GrokStyleInput } from './components/GrokStyleInput';
import { ProjectGalleryPage } from './components/ProjectGalleryPage';
import { SimpleChatDrawer } from './components/SimpleChatDrawer';
import { ChatHistoryPage } from './components/ChatHistoryPage';
import { AppModals } from './components/AppModals';
import { MobileLayout } from './components/layouts/MobileLayout';
import { DesktopLayout } from './components/layouts/DesktopLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SessionBanner, StatusBadge } from './components/SessionBanner';
import { TrialBanner } from './components/TrialBanner';
import { ModeSelectionModal } from './components/ModeSelectionModal';
import { SafeEnvDiagnostic } from './components/SafeEnvDiagnostic';
import { useIsMobile } from './components/ui/use-mobile';
import { useApp, AppProvider } from './src/context/AppContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { useAppHandlers } from './src/hooks/useAppHandlers';
import { useAppInitialization } from './src/hooks/useAppInitialization';
import { useTranslation } from './src/hooks/useTranslation';
import { Project } from './src/types';
import { UserMode } from './src/types/auth';
import { getCurrentSession, wireEphemeralAutoPurge } from './src/utils/sessionManager';
import { detectEnvironment, logEnvironmentInfo } from './src/utils/environmentDetector';
import { initializeApiLibrary } from './src/utils/initializeApiLibrary';
import { ChartUsageManager } from './src/utils/chartUsageManager';
import { toast } from "sonner";

/**
 * 메인 애플리케이션 컨텐츠 컴포넌트
 * 
 * 전체 앱의 상태와 레이아웃을 관리하는 핵심 컴포넌트
 * - 모바일/데스크톱 반응형 레이아웃
 * - 모달 시스템 관리
 * - 사이드바 상태 제어
 * - 채팅 및 프로젝트 상태 관리
 */
function AppContent() {
  const isMobile = useIsMobile();
  const { 
    state, 
    setSidebarExpanded, 
    setError, 
    setActiveChat, 
    setSelectedRole, 
    addConversation, 
    updateConversation, 
    updateProject, 
    deleteProject, 
    addProject,
    setLoading,
    setGenerationStopped
  } = useApp();
  
  // 언어팩 시스템 초기화
  const translation = useTranslation();
  const { t, isInitialized } = translation;
  
  // Custom hooks
  const {
    handleSendMessage,
    handleRoleSelect,
    handleNewChat,
    handleChatSelect,
    handleNewProject,
    handleProjectSelectionModalSelect,
    handleProjectSelectionModalNewProject,
    getChatActionHandlers,
    deleteConversation,
    // 🔥 새로운 서버리스 기능 핸들러들
    handleRolePersistenceToggle,
    handleTimelineReminderSetup,
    handleKeywordResponseSetup,
    handleManualSummaryGeneration,
    checkRolePersistence,
    checkKeywordSettings,
    // 🎯 모드별 고급 기능들
    handleAdvancedTimelineSettings,
    handleIntelligentSummaryGeneration,
    getModeLimitations,
    getAdvancedTimelineSettings,
    // 🔐 서버리스 제한사항 핸들러들
    handleServerlessLimitationCheck,
    handleServerlessUsageTracking,
    getCurrentUsage
  } = useAppHandlers();
  
  useAppInitialization();

  // 환경 감지 및 초기화
  useEffect(() => {
    try {
      // 최종 안전한 환경변수 상수로 상태 확인
      import('./src/constants/environment').then(({ getEnvironmentStatus, logEnvironment, setupGlobalDebug }) => {
        const status = getEnvironmentStatus();
        logEnvironment();
        
        // 개발 환경에서 전역 진단 함수 노출
        if (isDevelopment()) {
          setupGlobalDebug();
          
          // 서버리스 디버깅 함수 노출
          (window as any).__testServerlessUsage = async () => {
            try {
              const { getCurrentUserId } = await import('./src/services/googleService');
              const { getCurrentUsage } = await import('./src/services/serverlessLimitationService');
              const userId = getCurrentUserId();
              console.log('🧪 서버리스 사용량 테스트:', { userId });
              const result = await getCurrentUsage(userId);
              console.log('✅ 사용량 조회 결과:', result);
              return result;
            } catch (error) {
              console.error('❌ 사용량 테스트 실패:', error);
              return { error };
            }
          };
          
          (window as any).__testServerlessLimitations = async (action = 'create_project') => {
            try {
              const { getCurrentUserId } = await import('./src/services/googleService');
              const { validateAction, getCurrentUsage } = await import('./src/services/serverlessLimitationService');
              const userId = getCurrentUserId();
              const currentUsage = await getCurrentUsage(userId);
              console.log('🧪 서버리스 제한사항 테스트:', { userId, action });
              const result = await validateAction(userId, 'standard', action, currentUsage.currentUsage);
              console.log('✅ 제한사항 검증 결과:', result);
              return result;
            } catch (error) {
              console.error('❌ 제한사항 테스트 실패:', error);
              return { error };
            }
          };
        }
        
        console.log('✅ 환경 설정 검증 완료 (빌드 안전 버전)');
        
        // 서버리스 함수 연결 테스트
        if (isDevelopment()) {
          testServerlessConnection();
        }
      }).catch(error => {
        console.warn('환경 검증 상수 로드 실패:', error);
      });
      
      // 기존 환경변수 검증도 유지 (호환성)
      import('./src/utils/safeEnv').then(({ validateEnvironment, logEnvironmentInfo }) => {
        const envResult = validateEnvironment();
        logEnvironmentInfo();
        
        if (!envResult.isValid) {
          console.warn('⚠️ 환경 설정 문제:', envResult.message);
        }
      }).catch(error => {
        console.warn('기존 환경 검증 유틸리티 로드 실패:', error);
      });
      
      const env = detectEnvironment();
      setEnvironment(env);
      
      // API 라이브러리 초기화
      initializeApiLibrary();
      
      // 개발 환경에서 체험 기간 테스트를 위한 리셋 (한 번만 실행)
      if (isDevelopment() && !localStorage.getItem('trial_reset_done')) {
        const { resetTrial } = require('./src/utils/trialManager');
        resetTrial();
        localStorage.setItem('trial_reset_done', 'true');
        console.log('🔄 체험 기간이 3일로 리셋되었습니다 (D-3부터 시작)');
      }
    } catch (error) {
      console.error('❌ 초기화 중 오류 발생:', error);
    }
  }, []);

  /**
   * 개발용 목업 채팅 생성 함수
   * 
   * Role GPT의 기능을 시연하기 위한 데모 채팅을 생성
   * - AI 메시지 액션 버튼 테스트
   * - UI/UX 검증용
   * - 실제 API 호출 없이 기능 확인
   * 
   * TODO: 프로덕션에서는 제거하거나 개발 모드에서만 활성화
   */
  const generateMockChat = () => {
    const mockChatId = 'mock_chat_demo';
    // Buddy Role을 먼저 찾고, 없으면 guide Role, 마지막으로 첫 번째 Role
    const buddyRole = state.roles.find(r => r.id === 'buddy') || 
                      state.roles.find(r => r.id === 'guide') || 
                      state.roles[0];
    
    const mockMessages = [
      {
        id: 1,
        text: "안녕하세요! Role GPT의 새로운 UI에 대해 질문이 있어요.",
        sender: 'user' as const,
        timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5분 전
      },
      {
        id: 2,
        text: "안녕하세요! Role GPT의 새로운 인터페이스에 대해 궁금한 점이 있으시군요. 무엇을 도와드릴까요?\n\n새로운 UI는 다음과 같은 특징들이 있습니다:\n\n1. **ChatGPT 스타일 인터페이스**: 친숙하고 직관적인 디자인\n2. **반응형 사이드바**: 대화 내역과 Role 관리가 편리\n3. **스마트한 입력창**: 음성 인식, 설정 등 통합 기능\n4. **Role 템플릿 갤러리**: 다양한 전문 역할 선택 가능\n\n구체적으로 어떤 부분에 대해 더 자세히 알고 싶으신가요?",
        sender: 'ai' as const,
        timestamp: new Date(Date.now() - 4 * 60 * 1000) // 4분 전
      },
      {
        id: 3,
        text: "AI 메시지에 대한 액션 기능들은 어떤 것들이 있나요? 예를 들어 메시지를 다시 생성하거나 복사하는 기능 말이에요.",
        sender: 'user' as const,
        timestamp: new Date(Date.now() - 3 * 60 * 1000) // 3분 전
      },
      {
        id: 4,
        text: "좋은 질문이네요! AI 메시지에는 다양한 유용한 액션 기능들이 제공됩니다:\n\n## 🔄 메시지 액션 기능들\n\n### 1. **재생성 (Regenerate)**\n- 같은 질문에 대해 새로운 답변 생성\n- 더 나은 응답을 원할 때 유용\n- 키보드 단축키: `Ctrl + R`\n\n### 2. **복사 (Copy)**\n- 메시지 텍스트를 클립보드에 복사\n- 다른 곳에 붙여넣기 가능\n- 원클릭으로 간편하게 복사\n\n### 3. **음성 재생 (Text-to-Speech)**\n- AI 응답을 음성으로 들을 수 있음\n- 멀티태스킹 시 유용\n- 다양한 음성 옵션 제공\n\n### 4. **저장 및 내보내기**\n- 중요한 답변을 북마크로 저장\n- JSON, Markdown 등 다양한 형식으로 내보내기\n- 프로젝트별 정리 가능\n\n이러한 기능들은 메시지에 마우스를 올리면(hover) 나타나는 액션 버튼들로 쉽게 접근할 수 있습니다. 😊",
        sender: 'ai' as const,
        timestamp: new Date(Date.now() - 1 * 60 * 1000) // 1분 전
      }
    ];

    const mockChat = {
      id: mockChatId,
      title: "Role GPT UI 기능 문의",
      roleId: buddyRole.id,
      messages: mockMessages,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      lastMessageAt: new Date(Date.now() - 1 * 60 * 1000),
      isPinned: false
    };

    // 기존 목업 채팅이 있으면 제거하고 새로 추가
    console.log('🎯 목업 채팅 생성 중...', {
      mockChatId,
      buddyRole: buddyRole?.name,
      buddyRoleId: buddyRole?.id,
      existingRoles: state.roles.map(r => r.id)
    });
    
    const existingConversations = state.conversations.filter(c => c.id !== mockChatId);
    addConversation(mockChat);
    setActiveChat(mockChatId);
    setSelectedRole(buddyRole.id);
    
    console.log('✅ 목업 채팅 생성 완료', {
      conversationCount: state.conversations.length,
      activeChatId: mockChatId,
      selectedRoleId: buddyRole.id
    });
    
    toast.success('목업 채팅이 생성되었습니다! AI 메시지에 마우스를 올려 액션 버튼들을 확인해보세요.');
  };

  // Local state
  const [inputValue, setInputValue] = useState('');
  const [roleGptOpen, setRoleGptOpen] = useState(false);
  const [roleLibraryOpen, setRoleLibraryOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryButtonPosition, setCategoryButtonPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [projectViewOpen, setProjectViewOpen] = useState(false);
  const [projectGalleryOpen, setProjectGalleryOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectDeleteModalOpen, setProjectDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; title: string } | null>(null);
  
  // Chat deletion modal states
  const [chatDeleteModalOpen, setChatDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{ id: string; title: string } | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState<{ type: 'chat' | 'project'; id: string } | null>(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [chatHistoryPageOpen, setChatHistoryPageOpen] = useState(false);
  
  // Chart modal states (AI가 내부적으로 사용)
  const [chartDisplayOpen, setChartDisplayOpen] = useState(false);
  const [displayedChart, setDisplayedChart] = useState<any>(null);
  
  // User account modal states
  const [userAccountOpen, setUserAccountOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  
  // Backup modal state
  const [chatBackupOpen, setChatBackupOpen] = useState(false);
  
  // Session management states
  const [modeSelectionOpen, setModeSelectionOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(getCurrentSession());
  const [messageCount, setMessageCount] = useState(0);
  
  // 환경 감지
  const [environment, setEnvironment] = useState(detectEnvironment());
  
  // 이미지 생성 모달 state
  const [imageGenerationOpen, setImageGenerationOpen] = useState(false);

  // Derived state
  const currentChat = state.conversations.find(c => c.id === state.activeChatId);
  const selectedRole = state.selectedRoleId ? state.roles.find(r => r.id === state.selectedRoleId) : null;
  const messages = currentChat?.messages || [];
  const chatActions = getChatActionHandlers();
  
  // Update message count when messages change
  useEffect(() => {
    setMessageCount(messages.length);
  }, [messages]);

  // 서버리스 함수 연결 테스트 (개발 환경용)
  const testServerlessConnection = async () => {
    try {
      console.group('🔧 서버리스 함수 연결 테스트');
      
      // 1. Health check
      const supabaseInfo = await import('./utils/supabase/info');
      const { projectId, publicAnonKey } = supabaseInfo;
      
      if (!projectId || !publicAnonKey) {
        console.error('❌ Supabase 설정 정보 누락:', { projectId: !!projectId, publicAnonKey: !!publicAnonKey });
        console.groupEnd();
        return;
      }
      
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e3d1d00c`;
      
      console.log('📡 Health check 테스트...');
      const healthResponse = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ Health check 성공:', healthData);
      } else {
        console.error('❌ Health check 실패:', healthResponse.status, healthResponse.statusText);
      }
      
      // 2. 사용량 조회 테스트
      const { getCurrentUserId } = await import('./src/services/googleService');
      const userId = getCurrentUserId();
      
      console.log('📊 사용량 조회 테스트...');
      const usageResponse = await fetch(`${baseUrl}/mode/usage/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        console.log('✅ 사용량 조회 성공:', usageData);
        
        // 3. 제한사항 검증 테스트
        console.log('🔍 제한사항 검증 테스트...');
        const validationResponse = await fetch(`${baseUrl}/mode/validate-action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            userId,
            userMode: 'standard',
            action: 'create_project',
            currentUsage: usageData.currentUsage
          })
        });
        
        if (validationResponse.ok) {
          const validationData = await validationResponse.json();
          console.log('✅ 제한사항 검증 성공:', validationData);
        } else {
          const errorText = await validationResponse.text();
          console.error('❌ 제한사항 검증 실패:', validationResponse.status, validationResponse.statusText, errorText);
        }
      } else {
        const errorText = await usageResponse.text();
        console.error('❌ 사용량 조회 실패:', usageResponse.status, usageResponse.statusText, errorText);
      }
      
      console.groupEnd();
    } catch (error) {
      console.error('❌ 서버리스 함수 연결 테스트 실패:', error);
      console.groupEnd();
    }
  };

  // Initialize session management
  useEffect(() => {
    try {
      const session = getCurrentSession();
      setCurrentSession(session);
      
      // If no mode is set, start with ephemeral mode for seamless experience
      if (!sessionStorage.getItem("user_mode")) {
        sessionStorage.setItem("user_mode", "ephemeral");
        sessionStorage.setItem("mode", "ephemeral");
        // Mark as first-time user for potential welcome flow
        if (!localStorage.getItem("firstTimeUser")) {
          localStorage.setItem("firstTimeUser", "true");
          // 첫 시간 사용자에게는 BYOK 배너를 보이지 않기 위해 임시로 설정
          localStorage.setItem("byokNoticeSeen", "true");
        }
        // Don't show mode selection modal immediately - let users experience the app first
        // setModeSelectionOpen(true) - removed
      }
      
      // Setup ephemeral auto purge
      const cleanup = wireEphemeralAutoPurge(() => {
        return messages.length > 0 && !localStorage.getItem('last_backup');
      });
      
      return cleanup;
    } catch (error) {
      console.warn('Session initialization failed:', error);
    }
  }, []);
  
  // Update session periodically
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        setCurrentSession(getCurrentSession());
      } catch (error) {
        console.warn('Session update failed:', error);
      }
    }, 30000); // 30초마다 업데이트
    
    return () => clearInterval(interval);
  }, []);

  // Effect for mutual exclusive modals
  useEffect(() => {
    if (roleGptOpen || roleLibraryOpen) {
      setNewProjectOpen(false);
      setProjectViewOpen(false);
      setSelectedProjectId(null);
    }
  }, [roleGptOpen, roleLibraryOpen]);

  useEffect(() => {
    if (!state.activeChatId && !selectedRole) {
      setNewProjectOpen(false);
      setProjectViewOpen(false);
      setSelectedProjectId(null);
      setRoleGptOpen(false);
      setRoleLibraryOpen(false);
      setCategoryModalOpen(false);
    }
  }, [state.activeChatId, selectedRole]);

  // Handlers
  const handleExampleClick = (example: string) => {
    setInputValue(example);
  };

  // 웰컴 카드에서 바로 대화 시작하는 핸들러
  const handleWelcomeCardStart = async (prompt: string, roleId: string) => {
    try {
      console.log('🎯 웰컴 카드 클릭됨:', { prompt, roleId });

      // 1. 해당 Role을 찾기
      const targetRole = state.roles.find(r => r.id === roleId);
      const selectedRole = targetRole || state.roles.find(r => r.id === 'buddy') || state.roles[0];
      
      if (!selectedRole) {
        console.error('❌ 사용 가능한 Role이 없습니다');
        toast.error('사용 가능한 역할이 없습니다');
        return;
      }

      console.log('✅ Role 찾음:', { 
        id: selectedRole.id, 
        name: selectedRole.name
      });

      // 2. 즉시 Role 설정 및 대화 시작
      setSelectedRole(selectedRole.id);
      
      // 3. 직접 메시지 전송 (선택된 Role을 명시적으로 사용)
      console.log('📤 메시지 전송 중:', prompt.substring(0, 50) + '...');
      
      // 새로운 대화 생성 (Role이 포함된 상태로)
      const newChatId = `chat_${Date.now()}`;
      const userMessage = {
        id: Date.now(),
        text: prompt,
        sender: 'user' as const,
        timestamp: new Date()
      };
      
      const newConversation = {
        id: newChatId,
        title: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt,
        roleId: selectedRole.id,
        messages: [userMessage],
        createdAt: new Date(),
        lastMessageAt: new Date()
      };
      
      console.log('💬 새 대화 생성:', {
        chatId: newChatId,
        roleId: selectedRole.id,
        roleName: selectedRole.name
      });
      
      addConversation(newConversation);
      setActiveChat(newChatId);
      
      // 4. AI 응답 생성을 위해 기존 handleSendMessage 로직 재사용
      // 하지만 이미 메시지가 추가된 상태이므로 AI 응답만 생성
      await generateAIResponse(newChatId, userMessage, selectedRole);
      
      // 5. 성공 알림
      toast.success(`${selectedRole.name}와 대화를 시작합니다! 🚀`);
      
    } catch (error) {
      console.error('❌ 웰컴 카드 처리 실패:', error);
      toast.error('대화 시작 중 오류가 발생했습니다');
      setInputValue(prompt);
    }
  };

  // AI 응답 생성 함수
  const generateAIResponse = async (chatId: string, userMessage: any, role: any) => {
    setLoading(true);
    setGenerationStopped(false);
    
    try {
      const { streamTrialMessage } = await import('./src/providers/gemini');
      const { defaultRole } = await import('./src/constants/defaultRoles');
      
      const aiMessageId = Date.now() + 1;
      const aiMessage = {
        id: aiMessageId,
        text: '',
        sender: 'ai' as const,
        timestamp: new Date()
      };

      // AI 메시지를 대화에 추가
      let currentChat = state.conversations.find(c => c.id === chatId);
      if (currentChat) {
        console.log('🔄 AI 메시지 초기화:', {
          chatId,
          currentMessagesCount: currentChat.messages.length,
          aiMessageId
        });
        
        updateConversation(chatId, {
          messages: [...currentChat.messages, aiMessage]
        });
      }

      let aiResponse = '';
      const roleToUse = role || defaultRole;
      
      console.log('🤖 AI 응답 생성 시작:', {
        role: roleToUse.name,
        userMessage: userMessage.text.substring(0, 50) + '...',
        messagesBeforeAI: currentChat?.messages.length || 0
      });
      
      // AI 응답 스트리밍
      for await (const chunk of streamTrialMessage(
        roleToUse,
        [userMessage],
        [{ text: userMessage.text }]
      )) {
        if (state.isGenerationStopped) {
          console.log('🛑 Generation stopped by user');
          aiResponse += aiResponse ? '\n\n[중지됨]' : '[중지됨]';
          break;
        }
        
        aiResponse += chunk;
        
        // 실시간으로 메시지 업데이트 - 최신 상태 다시 가져오기
        const latestChat = state.conversations.find(c => c.id === chatId);
        if (latestChat) {
          const updatedMessages = latestChat.messages.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: aiResponse } : msg
          );
          updateConversation(chatId, {
            messages: updatedMessages,
            lastMessageAt: new Date()
          });
        }
        
        // 진행 상황 로그 (너무 많지 않게)
        if (aiResponse.length % 100 === 0) {
          console.log('📝 AI 응답 진행:', {
            chatId,
            responseLength: aiResponse.length,
            latestChatExists: !!latestChat,
            messagesCount: latestChat?.messages.length || 0
          });
        }
      }
      
      console.log('✅ AI 응답 생성 완료:', {
        finalResponseLength: aiResponse.length,
        finalMessagesCount: state.conversations.find(c => c.id === chatId)?.messages.length || 0
      });
      
    } catch (error) {
      console.error('❌ AI 응답 생성 실패:', error);
      
      const errorMessage = {
        id: Date.now() + 2,
        text: '죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.',
        sender: 'ai' as const,
        timestamp: new Date()
      };

      const currentChat = state.conversations.find(c => c.id === chatId);
      if (currentChat) {
        updateConversation(chatId, {
          messages: [...currentChat.messages, errorMessage]
        });
      }
      
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setGenerationStopped(false);
    }
  };

  const handleRoleSelectWithCleanup = async (roleData: any) => {
    await handleRoleSelect(roleData);
    setInputValue('');
    setCategoryModalOpen(false);
    setRoleGptOpen(false);
    setRoleLibraryOpen(false);
    setSelectedCategory('');
    setNewProjectOpen(false);
    setProjectViewOpen(false);
    setSelectedProjectId(null);
  };

  const handleNewProjectWithState = async () => {
    // 🔐 서버리스 프로젝트 생성 제한 확인
    const canCreateProject = await handleServerlessLimitationCheck('create_project');
    if (!canCreateProject) {
      return; // 제한에 걸렸으면 중단
    }
    
    const result = await handleNewProject();
    if (result.newProject && result.openProjectPage) {
      setSelectedProjectId(result.newProject.id);
      setProjectViewOpen(true);
    } else if (result.openNewProjectPage) {
      setNewProjectOpen(true);
    }
  };

  const handleProjectViewAll = () => {
    setProjectGalleryOpen(true);
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setProjectViewOpen(true);
    setSidebarExpanded(false);
  };

  const handleProjectDeleteConfirm = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      toast.success(`프로젝트 "${projectToDelete.title}"이 삭제되었습니다.`);
      setProjectToDelete(null);
    }
    setProjectDeleteModalOpen(false);
  };

  const handleProjectDeleteCancel = () => {
    setProjectDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  // 대화 삭제 확인 핸들러
  const handleChatDeleteRequest = (chatId: string) => {
    const chat = state.conversations.find(c => c.id === chatId);
    if (chat) {
      setChatToDelete({ id: chatId, title: chat.title });
      setChatDeleteModalOpen(true);
    }
  };

  const handleChatDeleteConfirm = () => {
    if (chatToDelete) {
      deleteConversation(chatToDelete.id);
      toast.success(`대화 "${chatToDelete.title}"이 삭제되었습니다.`);
      setChatToDelete(null);
    }
    setChatDeleteModalOpen(false);
  };

  const handleChatDeleteCancel = () => {
    setChatDeleteModalOpen(false);
    setChatToDelete(null);
  };

  const handleChatIconChange = (chatId: string) => {
    setIconPickerTarget({ type: 'chat', id: chatId });
    setIconPickerOpen(true);
  };

  const handleProjectIconChange = (projectId: string) => {
    setIconPickerTarget({ type: 'project', id: projectId });
    setIconPickerOpen(true);
  };

  const handleIconSelect = (iconName: string) => {
    if (iconPickerTarget) {
      if (iconPickerTarget.type === 'chat') {
        updateConversation(iconPickerTarget.id, { icon: iconName });
        toast.success('채팅 아이콘이 변경되었습니다.');
      } else if (iconPickerTarget.type === 'project') {
        updateProject(iconPickerTarget.id, { icon: iconName });
        toast.success('프로젝트 아이콘이 변경되었습니다.');
      }
    }
    setIconPickerOpen(false);
    setIconPickerTarget(null);
  };

  const handleDropChatToProject = (chatId: string, projectId: string) => {
    updateConversation(chatId, { projectId: projectId });
    
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      const projectChatCount = state.conversations.filter(c => c.projectId === projectId).length;
      updateProject(projectId, { chatCount: projectChatCount + 1 });
    }
  };

  const handleChatRemoveFromProject = (chatId: string) => {
    const chat = state.conversations.find(c => c.id === chatId);
    if (chat && chat.projectId) {
      updateConversation(chatId, { projectId: undefined });
      
      const projectChatCount = state.conversations.filter(c => c.projectId === chat.projectId).length;
      updateProject(chat.projectId, { chatCount: Math.max(0, projectChatCount - 1) });
      
      toast.success('채팅이 프로젝트에서 제거되었습니다.');
    }
  };

  // AI 메시지 액션 핸들러들
  const handleRegenerateMessage = (messageId: number) => {
    toast.info('메시지를 다시 생성합니다...');
    // TODO: 실제 재생성 로직 구현
    console.log('Regenerating message:', messageId);
  };

  const handleSaveMessage = (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      // 서버리스 타임라인 기능과 통합
      if (state.activeChatId) {
        handleManualSummaryGeneration(state.activeChatId);
      }
      toast.success('메시지가 북마크에 저장되었습니다.');
      console.log('Saving message to bookmarks:', message);
    }
  };

  const handleExportMessage = (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      const messageData = {
        id: message.id,
        text: message.text,
        sender: message.sender,
        timestamp: message.timestamp,
        chat: currentChat?.title || 'Untitled Chat',
        role: selectedRole?.name || 'Assistant'
      };
      
      const dataStr = JSON.stringify(messageData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `message_${messageId}_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('메시지가 내보내기 되었습니다.');
    }
  };

  // 사용자 메시��� 편집 핸들러
  const handleEditMessage = (messageId: number, newText: string) => {
    if (currentChat) {
      const updatedMessages = currentChat.messages.map(msg => 
        msg.id === messageId ? { ...msg, text: newText } : msg
      );
      updateConversation(currentChat.id, { messages: updatedMessages });
    }
  };

  // 사용자 메시지 삭제 핸들러
  const handleDeleteMessage = (messageId: number) => {
    if (currentChat) {
      const updatedMessages = currentChat.messages.filter(msg => msg.id !== messageId);
      updateConversation(currentChat.id, { messages: updatedMessages });
    }
  };

  // 채팅 복제 핸들러
  const handleChatDuplicate = (chatId: string) => {
    const originalChat = state.conversations.find(c => c.id === chatId);
    if (originalChat) {
      const duplicatedChat = {
        ...originalChat,
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `${originalChat.title} (복사본)`,
        createdAt: new Date(),
        lastMessageAt: new Date(),
        isPinned: false
      };
      addConversation(duplicatedChat);
      toast.success(`채팅이 복제되었습니다: ${duplicatedChat.title}`);
    }
  };

  // 대화만 내보내기 핸들러 (메시지만)
  const handleChatExportMessages = (chatId: string) => {
    const chat = state.conversations.find(c => c.id === chatId);
    if (chat) {
      const messagesData = {
        title: chat.title,
        exportType: 'messages-only',
        exportedAt: new Date().toISOString(),
        messages: chat.messages.map(msg => ({
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp
        }))
      };
      
      const dataStr = JSON.stringify(messagesData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_messages.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('대화가 내보내기 되었습니다.');
    }
  };

  // 백업 가져오기 핸들러
  const handleImportBackup = (backupData: any) => {
    try {
      // 백업 데이터 유효성 검사
      if (!backupData.data || !backupData.data.conversations) {
        throw new Error('유효하지 않은 백업 데이터입니다.');
      }

      const { conversations: backupConversations, roles: backupRoles, projects: backupProjects } = backupData.data;

      // Role 데이터 가져오기 (중복 방지)
      if (backupRoles && backupRoles.length > 0) {
        backupRoles.forEach((role: any) => {
          const existingRole = state.roles.find(r => r.id === role.id);
          if (!existingRole) {
            // TODO: addRole 액션이 있다면 사용, 없다면 임시로 무시
            console.log('새로운 Role을 가져왔습니다:', role.name);
          }
        });
      }

      // Project 데이터 가져오기 (중복 방지)
      if (backupProjects && backupProjects.length > 0) {
        backupProjects.forEach((project: any) => {
          const existingProject = state.projects.find(p => p.id === project.id);
          if (!existingProject) {
            // ID 충돌 방지를 위해 새 ID 생성
            const newProject = {
              ...project,
              id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: `${project.title} (가져옴)`
            };
            addProject(newProject);
          }
        });
      }

      // Conversation 데이터 가져오기 (중복 방지)
      if (backupConversations && backupConversations.length > 0) {
        backupConversations.forEach((conversation: any) => {
          const existingConversation = state.conversations.find(c => c.id === conversation.id);
          if (!existingConversation) {
            // ID 충돌 방지를 위해 새 ID 생성
            const newConversation = {
              ...conversation,
              id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: `${conversation.title} (가져옴)`,
              createdAt: new Date(conversation.createdAt),
              lastMessageAt: new Date(conversation.lastMessageAt)
            };
            addConversation(newConversation);
          }
        });
      }

      const importedChats = backupConversations ? backupConversations.length : 0;
      const importedProjects = backupProjects ? backupProjects.length : 0;
      
      toast.success(`백업을 성공적으로 가져왔습니다! (대화창 ${importedChats}개, 프로젝트 ${importedProjects}개)`);
      
    } catch (error) {
      console.error('백업 가져오기 실패:', error);
      throw error; // 모달에서 처리하도록 에러를 다시 throw
    }
  };

  // Session banner action handler
  const handleBannerAction = (action: string) => {
    switch (action) {
      case 'setupPin':
        // TODO: PIN 설정 모달 열기
        toast.info('PIN 설정 기능을 곧 지원할 예정입니다.');
        break;
      case 'setupVault':
        // TODO: 파일 금고 설정 모달 열기
        toast.info('파일 금고 기능을 곧 지원할 예정입니다.');
        break;
      case 'export':
        setChatBackupOpen(true);
        break;
      case 'cleanup':
        // TODO: 정리 기능 구현
        toast.info('정리 기능을 곧 지원할 예정입니다.');
        break;
      case 'upgrade':
        setUpgradeOpen(true);
        break;
      case 'switchMode':
        setModeSelectionOpen(true);
        break;
      case 'openSettings':
        setUserAccountOpen(true);
        break;
      case 'releaseSeat':
        // TODO: 좌석 반납 기능
        toast.info('좌석 반납 기능을 곧 지원할 예정입니다.');
        break;
      case 'forceClose':
        window.close();
        break;
      default:
        break;
    }
  };

  // Mode selection handler
  const handleModeSelected = (mode: UserMode) => {
    setModeSelectionOpen(false);
    setCurrentSession(getCurrentSession());
    toast.success(`${getModeDisplayName(mode)} 모드로 시작합니다.`);
  };

  const getModeDisplayName = (mode: UserMode): string => {
    switch (mode) {
      case 'personal': return '개인';
      case 'byok': return 'BYOK';
      case 'licensed': return '라이선스';
      case 'public': return '공용';
      case 'ephemeral': return '임시';
      default: return '일반';
    }
  };

  if (projectGalleryOpen) {
    return (
      <ProjectGalleryPage
        isOpen={projectGalleryOpen}
        onClose={() => setProjectGalleryOpen(false)}
        onNewProject={handleNewProjectWithState}
        sidebarExpanded={state.sidebarExpanded}
        projects={state.projects}
        onProjectSelect={handleProjectSelect}
        onProjectRename={(projectId, newTitle) => {
          updateProject(projectId, { title: newTitle });
        }}
        onProjectDelete={(projectId) => {
          const project = state.projects.find(p => p.id === projectId);
          if (project) {
            setProjectToDelete({ id: projectId, title: project.title });
            setProjectDeleteModalOpen(true);
          }
        }}
      />
    );
  }

  if (chatHistoryPageOpen) {
    return (
      <ChatHistoryPage
        isOpen={chatHistoryPageOpen}
        onClose={() => setChatHistoryPageOpen(false)}
        chatHistory={state.conversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          role: state.roles.find(r => r.id === conv.roleId) || null,
          messages: conv.messages,
          createdAt: conv.createdAt,
          lastMessageAt: conv.lastMessageAt,
          isPinned: conv.isPinned
        }))}
        onChatSelect={(chatId) => {
          handleChatSelect(chatId);
          setChatHistoryPageOpen(false);
        }}
        onChatDelete={handleChatDeleteRequest}
        onImportChats={() => setChatBackupOpen(true)}
        onChatExport={(chatId) => {
          const chat = state.conversations.find(c => c.id === chatId);
          if (chat) {
            const role = state.roles.find(r => r.id === chat.roleId);
            const chatData = {
              title: chat.title,
              role: role?.name || '기본 어시스턴트',
              messages: chat.messages,
              createdAt: chat.createdAt
            };
            
            const dataStr = JSON.stringify(chatData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            link.click();
            URL.revokeObjectURL(url);
            
            toast.success('채팅이 내보내기 되었습니다.');
          }
        }}
        onChatAddToProject={() => {
          // TODO: 프로젝트 선택 모달을 여는 로직 구현
          toast.info('프로젝트 선택 기능을 곧 지원할 예정입니다.');
        }}
        currentChatId={state.activeChatId}
        roles={state.roles}
      />
    );
  }

  return (
    <div className={`w-screen bg-background overflow-hidden relative ${isMobile ? 'mobile-screen' : 'h-screen'}`}>
      



      {/* Session Banner - 메시지가 5개 이상일 때만 표시 */}
      {!projectGalleryOpen && !chatHistoryPageOpen && messageCount >= 5 && (
        <div className={`fixed z-40 ${isMobile ? 'bottom-24 left-4 right-4' : 'bottom-28 left-1/2 transform -translate-x-1/2 w-96'}`}>
          <SessionBanner
            messageCount={messageCount}
            hasUnsavedChanges={messages.length > 0 && !localStorage.getItem('last_backup')}
            onAction={handleBannerAction}
          />
        </div>
      )}

      {/* Trial Banner - 메시지가 10개 이상일 때만 표시 */}
      {!projectGalleryOpen && !chatHistoryPageOpen && messageCount >= 10 && (
        <TrialBanner
          messageCount={messageCount}
          isMobile={isMobile}
          onUpgrade={() => setUpgradeOpen(true)}
        />
      )}

      {/* Chat Sidebar */}
      <ChatSidebar
        isExpanded={state.sidebarExpanded}
        onToggle={() => setSidebarExpanded(!state.sidebarExpanded)}
        onAccountClick={() => {/* 드롭다운 토글은 ChatSidebar 내부에서 처리 */}}
        onSettingsClick={() => setUserAccountOpen(true)}
        onUpgradeClick={() => setUpgradeOpen(true)}
        onFaqClick={() => setFaqOpen(true)}
        onLogoutClick={() => {
          // TODO: 로그아웃 로직 구현
          console.log('로그아웃 요청');
          toast.info('로그아웃 기능을 곧 지원할 예정입니다.');
        }}
        onRoleGptClick={() => setRoleGptOpen(true)}
        onRoleLibraryClick={() => setRoleLibraryOpen(true)}
        onNewChat={handleNewChat}
        onCreateMockChat={generateMockChat}
        onNewProject={handleNewProjectWithState}
        onChatSelect={handleChatSelect}
        onSearchClick={() => setSidebarExpanded(true)}
        onChatRename={(chatId, newTitle) => updateConversation(chatId, { title: newTitle })}
        onChatPin={(chatId) => {
          const chat = state.conversations.find(c => c.id === chatId);
          updateConversation(chatId, { isPinned: !chat?.isPinned });
        }}
        onChatDelete={handleChatDeleteRequest}
        onChatExport={(chatId) => {
          const chat = state.conversations.find(c => c.id === chatId);
          if (chat) {
            const role = state.roles.find(r => r.id === chat.roleId);
            const chatData = {
              title: chat.title,
              role: role?.name || '기본 어시스턴트',
              messages: chat.messages,
              createdAt: chat.createdAt,
              roleId: chat.roleId,
              projectId: chat.projectId,
              isPinned: chat.isPinned,
              icon: chat.icon
            };
            
            const dataStr = JSON.stringify(chatData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_full.json`;
            link.click();
            URL.revokeObjectURL(url);
            
            toast.success('대화창이 내보내기 되었습니다.');
          }
        }}
        onChatDuplicate={handleChatDuplicate}
        onChatExportMessages={handleChatExportMessages}
        onChatAddToProject={() => {}}
        onChatIconChange={handleChatIconChange}
        onChatHistoryViewAll={() => setChatHistoryPageOpen(true)}
        onBackupClick={() => setChatBackupOpen(true)}
        onImportClick={() => setChatBackupOpen(true)}
        onProjectSelect={handleProjectSelect}
        onProjectRename={(projectId, newTitle) => updateProject(projectId, { title: newTitle })}
        onProjectViewAll={handleProjectViewAll}
        onProjectDelete={(projectId) => {
          const project = state.projects.find(p => p.id === projectId);
          if (project) {
            setProjectToDelete({ id: projectId, title: project.title });
            setProjectDeleteModalOpen(true);
          }
        }}
        onProjectDuplicate={(projectId) => {
          const originalProject = state.projects.find(p => p.id === projectId);
          if (originalProject) {
            const newProjectId = `project_${Date.now()}`;
            const duplicatedProject: Project = {
              ...originalProject,
              id: newProjectId,
              title: `${originalProject.title} (복사본)`,
              createdAt: new Date(),
              lastModified: new Date(),
              chatCount: 0
            };
            
            // 프로젝트에 속한 모든 채팅창들을 찾아서 복제
            const projectChats = state.conversations.filter(c => c.projectId === projectId);
            let duplicatedChatsCount = 0;
            
            projectChats.forEach(chat => {
              const duplicatedChat = {
                ...chat,
                id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title: `${chat.title} (복사본)`,
                projectId: newProjectId,
                createdAt: new Date(),
                lastMessageAt: new Date(),
                isPinned: false
              };
              addConversation(duplicatedChat);
              duplicatedChatsCount++;
            });
            
            // 복제된 채팅 개수를 반영해서 프로젝트 생성
            duplicatedProject.chatCount = duplicatedChatsCount;
            addProject(duplicatedProject);
            
            toast.success(`프로젝트와 ${duplicatedChatsCount}개 채팅이 복제되었습니다: ${duplicatedProject.title}`);
          }
        }}
        onProjectIconChange={handleProjectIconChange}
        onRoleSelect={handleRoleSelectWithCleanup}
        chatHistory={state.conversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          role: state.roles.find(r => r.id === conv.roleId) || null,
          messages: conv.messages,
          createdAt: conv.createdAt,
          lastMessageAt: conv.lastMessageAt,
          isPinned: conv.isPinned
        }))}
        projects={state.projects}
        currentChatId={state.activeChatId}
        isMobile={isMobile}
        hasMessages={messages.length > 0}
      />

      {/* Main Content */}
      <div className={`w-full h-full flex flex-col transition-all duration-300 ${
        isMobile 
          ? state.sidebarExpanded 
            ? 'opacity-50 pointer-events-none' 
            : (newProjectOpen || projectViewOpen) ? 'opacity-50 pointer-events-none' : ''
          : state.sidebarExpanded 
            ? (newProjectOpen || projectViewOpen) ? 'pl-[544px]' : 'pl-76'
            : (newProjectOpen || projectViewOpen) ? 'pl-[336px]' : 'pl-16'
      }`}>
        {messages.length === 0 ? (
          // Empty chat state
          isMobile ? (
            <MobileLayout
              messages={messages}
              selectedRole={selectedRole}
              onExampleClick={handleExampleClick}
              onSendMessage={handleSendMessage}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onRoleSelect={handleRoleSelectWithCleanup}
              onCategorySelect={(category, buttonPosition) => {
                setSelectedCategory(category);
                setCategoryButtonPosition(buttonPosition);
                setCategoryModalOpen(true);
              }}
              onImageGenerate={() => setImageGenerationOpen(true)}
              chatActions={chatActions}
              userSettings={state.userSettings}
              activeChatId={state.activeChatId || ''}
              projects={state.projects}
              onProjectSelect={handleProjectSelectionModalSelect}
              onNewProject={handleProjectSelectionModalNewProject}
              currentChat={currentChat}
              onAccountModalOpen={() => setUserAccountOpen(true)}
            />
          ) : (
            <DesktopLayout
              messages={messages}
              selectedRole={selectedRole}
              onExampleClick={handleExampleClick}
              onSendMessage={handleSendMessage}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onRoleSelect={handleRoleSelectWithCleanup}
              onCategorySelect={(category, buttonPosition) => {
                setSelectedCategory(category);
                setCategoryButtonPosition(buttonPosition);
                setCategoryModalOpen(true);
              }}
              onWelcomeCardStart={handleWelcomeCardStart}
              onImageGenerate={() => setImageGenerationOpen(true)}
              chatActions={chatActions}
              userSettings={state.userSettings}
              activeChatId={state.activeChatId || ''}
              projects={state.projects}
              onProjectSelect={handleProjectSelectionModalSelect}
              onNewProject={handleProjectSelectionModalNewProject}
              currentChat={currentChat}
              onAccountModalOpen={() => setUserAccountOpen(true)}
            />
          )
        ) : (
          // Chat in progress state
          <div className="flex flex-col h-full relative">
            <div className="flex-1 overflow-hidden">
              <ChatMain
                messages={messages}
                onExampleClick={handleExampleClick}
                isMobile={isMobile}
                selectedRole={selectedRole}
                onExport={chatActions.handleChatExport}
                onSave={chatActions.handleChatSave}
                onAddToProject={() => {}}
                onDelete={chatActions.handleChatDelete}
                onArchive={chatActions.handleChatArchive}
                onShare={chatActions.handleChatShare}
                onOpenChatDrawer={() => setChatDrawerOpen(true)}
                onNewChat={handleNewChat}
                currentMode={state.userSettings.mode}
                chatId={state.activeChatId || ''}
                projects={state.projects}
                onProjectSelect={handleProjectSelectionModalSelect}
                onNewProject={handleProjectSelectionModalNewProject}
                chatTitle={currentChat?.title}
                onRegenerateMessage={handleRegenerateMessage}
                onSaveMessage={handleSaveMessage}
                onExportMessage={handleExportMessage}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                // 🔥 새로운 서버리스 기능 핸들러들
                onToggleRolePersistence={(enable) => {
                  if (state.activeChatId) {
                    handleRolePersistenceToggle(state.activeChatId, enable);
                  }
                }}
                onSetupTimelineReminder={(type) => {
                  if (state.activeChatId) {
                    handleTimelineReminderSetup(state.activeChatId, type);
                  }
                }}
                onGenerateSummary={() => {
                  if (state.activeChatId) {
                    handleManualSummaryGeneration(state.activeChatId);
                  }
                }}
                onSetupKeywordResponse={(keywordIds) => {
                  if (state.activeChatId) {
                    handleKeywordResponseSetup(state.activeChatId, keywordIds);
                  }
                }}
                // 🎯 모드별 고급 기능들
                onAdvancedTimelineSettings={(settings) => {
                  if (state.activeChatId) {
                    handleAdvancedTimelineSettings(state.activeChatId, settings);
                  }
                }}
                onIntelligentSummary={(force) => {
                  if (state.activeChatId) {
                    handleIntelligentSummaryGeneration(state.activeChatId, force);
                  }
                }}
                userMode={state.userSettings.mode}
                onGetModeLimitations={() => getModeLimitations(state.userSettings.mode)}
                onGetAdvancedSettings={() => {
                  if (state.activeChatId) {
                    return getAdvancedTimelineSettings(state.activeChatId);
                  }
                  return Promise.resolve(null);
                }}
              />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 z-10">
              <GrokStyleInput
                onSendMessage={handleSendMessage}
                value={inputValue}
                onChange={setInputValue}
                isInCenter={false}
                selectedRole={selectedRole}
                onImageGenerate={() => setImageGenerationOpen(true)}
              />
            </div>

            <SimpleChatDrawer
              isOpen={chatDrawerOpen}
              onToggle={() => setChatDrawerOpen(!chatDrawerOpen)}
              currentMode={state.userSettings.mode}
              messages={messages}
              chatId={state.activeChatId || ''}
              onSettingsChange={() => {}}
              isMobile={isMobile}
              // 🔥 새로운 서버리스 기능들
              onToggleRolePersistence={(enable) => {
                if (state.activeChatId) {
                  handleRolePersistenceToggle(state.activeChatId, enable);
                }
              }}
              onSetupTimelineReminder={(type) => {
                if (state.activeChatId) {
                  handleTimelineReminderSetup(state.activeChatId, type);
                }
              }}
              onGenerateSummary={() => {
                if (state.activeChatId) {
                  handleManualSummaryGeneration(state.activeChatId);
                }
              }}
              onCheckRolePersistence={() => {
                if (state.activeChatId) {
                  return checkRolePersistence(state.activeChatId);
                }
                return Promise.resolve(null);
              }}
              onCheckKeywordSettings={() => {
                if (state.activeChatId) {
                  return checkKeywordSettings(state.activeChatId);
                }
                return Promise.resolve([]);
              }}
              // 🎯 모드별 고급 기능들
              onAdvancedTimelineSettings={(settings) => {
                if (state.activeChatId) {
                  handleAdvancedTimelineSettings(state.activeChatId, settings);
                }
              }}
              onIntelligentSummary={(force) => {
                if (state.activeChatId) {
                  handleIntelligentSummaryGeneration(state.activeChatId, force);
                }
              }}
              userMode={state.userSettings.mode}
              onGetModeLimitations={() => getModeLimitations(state.userSettings.mode)}
              onGetAdvancedSettings={() => {
                if (state.activeChatId) {
                  return getAdvancedTimelineSettings(state.activeChatId);
                }
                return Promise.resolve(null);
              }}
            />
          </div>
        )}
      </div>

      {/* Mode Selection Modal */}
      {modeSelectionOpen && (
        <ModeSelectionModal
          isOpen={modeSelectionOpen}
          onClose={() => setModeSelectionOpen(false)}
          onModeSelected={handleModeSelected}
        />
      )}



      {/* Sidebar Toggle Buttons */}
      {!isMobile ? (
        <button
          onClick={() => setSidebarExpanded(!state.sidebarExpanded)}
          className={`fixed top-1/2 transform -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-background border border-border shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:bg-accent group ${
            state.sidebarExpanded ? 'left-[280px]' : 'left-[40px]'
          }`}
        >
          <div className={`w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors transform ${
            state.sidebarExpanded ? 'rotate-180' : 'rotate-0'
          } transition-transform duration-300`}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
      ) : (
        !state.sidebarExpanded && (
          <button
            onClick={() => setSidebarExpanded(true)}
            className="fixed left-4 z-50 w-10 h-10 rounded-lg bg-background/80 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-all"
            style={{
              top: 'max(60px, calc(env(safe-area-inset-top, 12px) + 48px))'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )
      )}

      {/* Loading & Error Indicators */}
      {state.isLoading && (
        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-muted/80 backdrop-blur-sm px-4 py-2 rounded-full">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin"></div>
              <span className="text-sm text-foreground/80">응답 생성 중...</span>
            </div>
          </div>
        </div>
      )}

      {state.error && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg max-w-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm">{state.error}</span>
              <button 
                onClick={() => setError(null)}
                className="text-destructive-foreground/80 hover:text-destructive-foreground"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}



      {/* All Modals */}
      <AppModals
        roleGptOpen={roleGptOpen}
        setRoleGptOpen={setRoleGptOpen}
        roleLibraryOpen={roleLibraryOpen}
        setRoleLibraryOpen={setRoleLibraryOpen}
        categoryModalOpen={categoryModalOpen}
        setCategoryModalOpen={setCategoryModalOpen}
        selectedCategory={selectedCategory}
        categoryButtonPosition={categoryButtonPosition}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        userAccountOpen={userAccountOpen}
        setUserAccountOpen={setUserAccountOpen}
        upgradeOpen={upgradeOpen}
        setUpgradeOpen={setUpgradeOpen}
        faqOpen={faqOpen}
        setFaqOpen={setFaqOpen}
        chatBackupOpen={chatBackupOpen}
        setChatBackupOpen={setChatBackupOpen}
        newProjectOpen={newProjectOpen}
        setNewProjectOpen={setNewProjectOpen}
        projectViewOpen={projectViewOpen}
        setProjectViewOpen={setProjectViewOpen}
        projectGalleryOpen={projectGalleryOpen}
        setProjectGalleryOpen={setProjectGalleryOpen}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        projectDeleteModalOpen={projectDeleteModalOpen}
        setProjectDeleteModalOpen={setProjectDeleteModalOpen}
        projectToDelete={projectToDelete}
        setProjectToDelete={setProjectToDelete}
        iconPickerOpen={iconPickerOpen}
        setIconPickerOpen={setIconPickerOpen}
        iconPickerTarget={iconPickerTarget}
        setIconPickerTarget={setIconPickerTarget}
        chatDeleteModalOpen={chatDeleteModalOpen}
        setChatDeleteModalOpen={setChatDeleteModalOpen}
        chatToDelete={chatToDelete}
        setChatToDelete={setChatToDelete}

        chartDisplayOpen={chartDisplayOpen}
        setChartDisplayOpen={setChartDisplayOpen}
        displayedChart={displayedChart}
        setDisplayedChart={setDisplayedChart}
        imageGenerationOpen={imageGenerationOpen}
        setImageGenerationOpen={setImageGenerationOpen}
        onRoleSelect={handleRoleSelectWithCleanup}
        onChatSelect={handleChatSelect}
        onProjectSelect={handleProjectSelect}
        onProjectViewAll={handleProjectViewAll}
        onProjectDeleteConfirm={handleProjectDeleteConfirm}
        onProjectDeleteCancel={handleProjectDeleteCancel}
        onChatDeleteConfirm={handleChatDeleteConfirm}
        onChatDeleteCancel={handleChatDeleteCancel}
        onIconSelect={handleIconSelect}
        onUpdateProject={updateProject}
        onAddProject={addProject}
        onDeleteProject={deleteProject}
        onChatRemoveFromProject={handleChatRemoveFromProject}
        onDropChatToProject={handleDropChatToProject}
        onImportBackup={handleImportBackup}
        state={state}
        sidebarExpanded={state.sidebarExpanded}
      />

      {/* Environment Diagnostic (Development Only) */}
      <SafeEnvDiagnostic />

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}