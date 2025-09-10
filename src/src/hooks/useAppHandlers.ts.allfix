import { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { defaultRole } from '../constants/defaultRoles';
import { streamTrialMessage } from '../providers/gemini';
import { Message, Role, Conversation, Project, Mode } from '../types';
import { useCrossModeGuard } from './useCrossModeGuard';
import { toast } from "sonner";
import { 
  rolePersistenceService, 
  saveRolePersistence, 
  getRolePersistence, 
  getActiveRole 
} from '../services/rolePersistenceService';
import { 
  conversationTimelineService,
  generateSummary,
  setReminder,
  checkReminderTrigger 
} from '../services/conversationTimelineService';
import { 
  keywordResponseService,
  saveKeywordSettings,
  getKeywordSettings,
  DEFAULT_KEYWORDS 
} from '../services/keywordResponseService';
import { getCurrentUserId } from '../services/googleService';
import { 
  ServerlessLimitationService,
  validateAction,
  trackUsage,
  getCurrentUsage,
  type LimitationAction,
  type CurrentUsage 
} from '../services/serverlessLimitationService';

export function useAppHandlers() {
  const { 
    state, 
    setActiveChat, 
    setSelectedRole, 
    setSidebarExpanded, 
    setLoading, 
    setError, 
    setGenerationStopped,
    addConversation, 
    updateConversation, 
    deleteConversation, 
    addProject, 
    updateProject, 
    deleteProject, 
    addRole 
  } = useApp();

  const messageIdCounter = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cross-Mode Guard 훅
  const crossModeGuard = useCrossModeGuard({
    onSwitchChatMode: (chatId: string, newMode: Mode) => {
      toast.success(`채팅 모드를 ${newMode}으로 변경했습니다.`);
    },
    onCloneRole: async (roleId: string, targetMode: Mode) => {
      const originalRole = state.roles.find(r => r.id === roleId);
      if (originalRole) {
        const clonedRole: Role = {
          ...originalRole,
          id: `custom_${Date.now()}`,
          name: `${originalRole.name} (${targetMode.toUpperCase()})`,
          category: 'custom',
          isCustom: true,
          isPinned: false
        };
        
        addRole(clonedRole);
        return clonedRole.id;
      }
      throw new Error('Role not found');
    }
  });

  const handleSendMessage = async (message: string, searchResults?: any[]) => {
    if (!message.trim() || state.isLoading) return;

    // 🔐 서버리스 API 호출 제한 검증
    const canProceed = await handleServerlessLimitationCheck('api_call');
    if (!canProceed) {
      return; // 제한에 걸렸으면 중단
    }

    console.log('📝 메시지 전송 시작:', {
      message: message.substring(0, 50) + '...',
      selectedRoleId: state.selectedRoleId,
      activeChatId: state.activeChatId,
      conversationsCount: state.conversations.length
    });

    setLoading(true);
    setGenerationStopped(false);
    
    // 새로운 AbortController 생성
    abortControllerRef.current = new AbortController();
    
    const messageId = ++messageIdCounter.current;
    const selectedRole = state.selectedRoleId ? state.roles.find(r => r.id === state.selectedRoleId) : null;
    
    console.log('🔍 Role 확인:', {
      selectedRoleId: state.selectedRoleId,
      foundRole: selectedRole?.name,
      fallbackToDefault: !selectedRole
    });
    
    // 검색 결과가 있으면 메시지에 포함
    let enhancedMessage = message;
    if (searchResults && searchResults.length > 0) {
      const searchContext = searchResults.map(result => 
        `**${result.title}** (${result.source})\n${result.summary}\n출처: ${result.url || 'N/A'}`
      ).join('\n\n---\n\n');
      
      enhancedMessage = `${message}\n\n## 참고 자료:\n\n${searchContext}`;
      
      console.log('📚 검색 결과가 포함된 메시지:', {
        originalMessage: message,
        searchResultsCount: searchResults.length,
        enhancedLength: enhancedMessage.length
      });
    }
    
    const userMessage: Message = {
      id: messageId,
      text: message, // 사용자에게는 원본 메시지만 표시
      sender: 'user',
      timestamp: new Date()
    };

    if (!state.activeChatId) {
      const newChatId = `chat_${Date.now()}`;
      
      const newConversation: Conversation = {
        id: newChatId,
        title: message.length > 50 ? message.substring(0, 50) + '...' : message,
        roleId: selectedRole?.id || defaultRole.id,
        messages: [userMessage],
        createdAt: new Date(),
        lastMessageAt: new Date()
      };
      
      console.log('💬 새 대화 생성:', {
        chatId: newChatId,
        title: newConversation.title,
        roleId: newConversation.roleId,
        messagesCount: newConversation.messages.length
      });
      
      addConversation(newConversation);
      setActiveChat(newChatId);
      
      console.log('✅ 대화 추가 완료, 활성 채팅 설정됨:', newChatId);
      
      if (!selectedRole) {
        setSelectedRole(defaultRole.id);
        console.log('🔄 기본 Role로 설정:', defaultRole.id);
      }
    } else {
      const currentChat = state.conversations.find(c => c.id === state.activeChatId);
      if (currentChat) {
        updateConversation(state.activeChatId, {
          messages: [...currentChat.messages, userMessage],
          lastMessageAt: new Date()
        });
      }
    }

    try {
      const aiMessageId = ++messageIdCounter.current;
      const aiMessage: Message = {
        id: aiMessageId,
        text: '',
        sender: 'ai',
        timestamp: new Date()
      };

      const activeChat = state.conversations.find(c => c.id === state.activeChatId);
      if (activeChat) {
        updateConversation(state.activeChatId!, {
          messages: [...activeChat.messages, aiMessage]
        });
      }

      let aiResponse = '';
      const roleToUse = selectedRole || defaultRole;
      
      try {
        for await (const chunk of streamTrialMessage(
          roleToUse,
          [...(activeChat?.messages || []), userMessage],
          [{ text: enhancedMessage }], // AI에게는 검색 결과가 포함된 메시지 전달
          abortControllerRef.current?.signal
        )) {
          // 중지 신호 확인
          if (state.isGenerationStopped || abortControllerRef.current?.signal.aborted) {
            console.log('🛑 Generation stopped by user');
            aiResponse += aiResponse ? '\n\n[중지됨]' : '[중지됨]';
            break;
          }
          
          aiResponse += chunk;
          
          const currentActiveChat = state.conversations.find(c => c.id === state.activeChatId);
          if (currentActiveChat) {
            const updatedMessages = currentActiveChat.messages.map(msg => 
              msg.id === aiMessageId ? { ...msg, text: aiResponse } : msg
            );
            updateConversation(state.activeChatId!, {
              messages: updatedMessages,
              lastMessageAt: new Date()
            });
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('🛑 Request aborted by user');
          aiResponse += aiResponse ? '\n\n[중지됨]' : '[중지됨]';
          
          const currentActiveChat = state.conversations.find(c => c.id === state.activeChatId);
          if (currentActiveChat) {
            const updatedMessages = currentActiveChat.messages.map(msg => 
              msg.id === aiMessageId ? { ...msg, text: aiResponse } : msg
            );
            updateConversation(state.activeChatId!, {
              messages: updatedMessages,
              lastMessageAt: new Date()
            });
          }
        } else {
          throw error; // 다른 에러는 다시 던지기
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: ++messageIdCounter.current,
        text: '죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.',
        sender: 'ai',
        timestamp: new Date()
      };

      const activeChat = state.conversations.find(c => c.id === state.activeChatId);
      if (activeChat) {
        updateConversation(state.activeChatId!, {
          messages: [...activeChat.messages, errorMessage]
        });
      }
      
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setGenerationStopped(false);
      abortControllerRef.current = null;
      
      // 🔐 서버리스 API 호출 사용량 추적
      await handleServerlessUsageTracking('api_call', {
        messageLength: message.length,
        roleId: state.selectedRoleId,
        hasSearchResults: !!(searchResults && searchResults.length > 0)
      });
      
      // 🎯 서버리스 타임라인 고급 기능 통합
      try {
        if (state.activeChatId) {
          const currentChat = state.conversations.find(c => c.id === state.activeChatId);
          if (currentChat && currentChat.messages.length > 0) {
            const userId = getCurrentUserId();
            const userMode = state.userSettings.mode as 'standard' | 'advanced' | 'expert';
            const messageIndex = currentChat.messages.length - 1;
            
            // 리마인더 트리거 확인
            await checkReminderTrigger(userId, state.activeChatId, messageIndex);
            
            // 🧠 모드별 지능형 자동 요약 시스템
            const modeLimitations = await conversationTimelineService.getModeLimitations(userMode);
            const limits = modeLimitations.limitations;
            
            // 자동 요약 조건 확인 (모드별 간격 적용)
            const summaryInterval = limits.summaryInterval || 12;
            if (messageIndex > 0 && messageIndex % summaryInterval === 0) {
              console.log(`🧠 모드별 지능형 요약 생성 (${userMode}):`, {
                messageIndex,
                summaryInterval,
                format: limits.availableSummaryFormats[0]
              });
              
              // 지능형 요약 생성 (모드별 설정 적용)
              await conversationTimelineService.generateIntelligentSummary(
                userId,
                state.activeChatId,
                currentChat.messages,
                userMode
              );
            }
            
            // 역할 고정 설정 확인 및 적용
            if (state.selectedRoleId) {
              const persistenceSettings = await getRolePersistence(userId, state.activeChatId);
              if (!persistenceSettings.settings) {
                // 첫 번째 대화에서 역할 고정 설정
                await saveRolePersistence(
                  userId,
                  state.activeChatId,
                  state.selectedRoleId,
                  'conversation',
                  {
                    keywordIds: [],
                    temperature: 0.7,
                    maxOutputTokens: 2048
                  }
                );
                console.log('🎯 역할 고정 설정 자동 생성:', state.selectedRoleId);
              }
            }
          }
        }
      } catch (serverlessError) {
        console.warn('서버리스 고급 기능 처리 중 오류:', serverlessError);
        // 서버리스 기능 오류는 UI에 영향주지 않도록 조용히 처리
      }
    }
  };

  const handleRoleSelect = async (roleData: any) => {
    try {
      console.log('🎯 handleRoleSelect 시작:', roleData);
      
      if (roleData && typeof roleData === 'object' && roleData.id) {
        // Role이 실제로 존재하는지 확인
        const role = state.roles.find(r => r.id === roleData.id);
        if (!role) {
          console.warn(`❌ Role with id ${roleData.id} not found`);
          return false;
        }

        console.log('✅ Role 찾음:', role.name);

        const decision = await crossModeGuard.openGuard({
          chatMode: state.userSettings.mode,
          roleMode: state.userSettings.mode,
          roleId: roleData.id,
          roleName: role.name,
          lang: 'ko'
        });

        console.log('🔄 CrossModeGuard 결과:', decision);

        if (decision) {
          setSelectedRole(roleData.id);
          setActiveChat(null);
          console.log('✅ Role 선택 완료:', roleData.id);
          
          // 서버리스 역할 고정 기능 통합
          try {
            const userId = getCurrentUserId();
            
            // 글로벌 역할 고정 설정 저장 (새 대화에 적용)
            await saveRolePersistence(
              userId,
              null, // 글로벌 설정
              roleData.id,
              'permanent',
              {
                keywordIds: [], // 기본값으로 시작
                temperature: 0.7,
                maxOutputTokens: 2048
              }
            );
            
            console.log('🎯 글로벌 역할 고정 설정 저장:', roleData.id);
            
            // 기본 키워드 설정도 함께 적용
            await saveKeywordSettings(
              userId,
              null, // 글로벌 설정
              roleData.id,
              DEFAULT_KEYWORDS.filter(kw => kw.isActive).slice(0, 3), // 상위 3개 기본 키워드
              'flexible'
            );
            
            console.log('🏷️ 기본 키워드 설정 적용');
            
          } catch (serverlessError) {
            console.warn('역할 고정 서버리스 기능 오류:', serverlessError);
          }
          
          return true;
        }
      }
    } catch (error) {
      console.error('❌ Role 선택 오류:', error);
    }
    return false;
  };

  const handleNewChat = () => {
    setActiveChat(null);
    if (state.userSettings.mode === 'standard') {
      setSelectedRole('guide');
    } else {
      setSelectedRole(null);
    }
    setSidebarExpanded(false);
  };

  const handleChatSelect = (chatId: string) => {
    const chat = state.conversations.find(c => c.id === chatId);
    if (chat) {
      setActiveChat(chatId);
      setSelectedRole(chat.roleId);
      setSidebarExpanded(false);
    }
  };

  const handleNewProject = () => {
    try {
      // 항상 새 프로젝트를 생성하도록 변경
      const newProject: Project = {
        id: `project_${Date.now()}`,
        title: `새 프로젝트 ${state.projects.length + 1}`,
        description: 'AI 어시스턴트와의 정보를 정리하는 프로젝트입니다.',
        category: 'general',
        guidelines: '',
        createdAt: new Date(),
        lastModified: new Date(),
        chatCount: 0,
        isPinned: false
      };
      
      addProject(newProject);
      
      const projectNumber = state.projects.length + 1;
      const isFirst = projectNumber === 1;
      
      toast.success(`${isFirst ? '첫 번째' : ''} 프로젝트 "${newProject.title}"가 생성되었습니다!`);
      return { newProject, openProjectPage: true };
    } catch (error) {
      console.error('프로젝트 생성 오류:', error);
      toast.error('프로젝트 생성 중 오류가 발생했습니다.');
      return {};
    }
  };

  const handleProjectSelectionModalSelect = (projectId: string) => {
    const targetChatId = state.activeChatId;
    if (!targetChatId) {
      toast.error('선택된 채팅이 없습니다.');
      return;
    }

    const project = state.projects.find(p => p.id === projectId);
    if (!project) {
      toast.error('프로젝트를 찾을 수 없습니다.');
      return;
    }

    updateConversation(targetChatId, { projectId: projectId });
    const currentChatCount = state.conversations.filter(c => c.projectId === projectId).length;
    updateProject(projectId, { chatCount: currentChatCount + 1 });
    
    toast.success(`채팅이 "${project.title}" 프로젝트에 추가되었습니다.`);
  };

  const handleProjectSelectionModalNewProject = () => {
    const newProject: Project = {
      id: `project_${Date.now()}`,
      title: '새 프로젝트',
      description: '',
      category: 'general',
      guidelines: '',
      createdAt: new Date(),
      lastModified: new Date(),
      chatCount: 0,
      isPinned: false
    };
    
    addProject(newProject);
    
    const targetChatId = state.activeChatId;
    if (targetChatId) {
      updateConversation(targetChatId, { projectId: newProject.id });
      updateProject(newProject.id, { chatCount: 1 });
      toast.success(`채팅이 "${newProject.title}" 프로젝트에 추가되었습니다.`);
    }
  };

  // 채팅 액션 핸들러들
  const getChatActionHandlers = () => {
    const currentChat = state.conversations.find(c => c.id === state.activeChatId);
    const selectedRole = state.selectedRoleId ? state.roles.find(r => r.id === state.selectedRoleId) : null;

    return {
      handleChatExport: () => {
        if (state.activeChatId && currentChat) {
          const chatData = {
            title: currentChat.title,
            role: selectedRole?.name || '기본 어시스턴트',
            messages: currentChat.messages,
            createdAt: currentChat.createdAt
          };
          
          const dataStr = JSON.stringify(chatData, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${currentChat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
          link.click();
          URL.revokeObjectURL(url);
          
          toast.success('채팅이 내보내기 되었습니다.');
        }
      },

      handleChatSave: () => {
        if (state.activeChatId && currentChat) {
          updateConversation(state.activeChatId, { isPinned: true });
          toast.success('채팅이 즐겨찾기에 저장되었습니다.');
        }
      },

      handleChatDelete: () => {
        if (state.activeChatId) {
          if (confirm('이 채팅을 삭제하시겠습니까?')) {
            deleteConversation(state.activeChatId);
            setActiveChat(null);
            setSelectedRole(null);
            toast.success('채팅이 삭제되었습니다.');
          }
        }
      },

      handleChatArchive: () => {
        if (state.activeChatId && currentChat) {
          const isCurrentlyPinned = currentChat.isPinned;
          updateConversation(state.activeChatId, { isPinned: !isCurrentlyPinned });
          
          if (isCurrentlyPinned) {
            toast.success('채팅이 아카이브에서 제거되었습니다.');
          } else {
            toast.success('채팅이 아카이브에 보관되었습니다.');
          }
        } else {
          toast.error('선택된 채팅이 없습니다.');
        }
      },

      handleChatShare: () => {
        if (state.activeChatId && currentChat) {
          const shareText = `Role GPT 채팅: ${currentChat.title}`;
          
          if (navigator.share) {
            navigator.share({
              title: 'Role GPT 채팅 공유',
              text: shareText,
              url: window.location.href
            }).then(() => {
              toast.success('채팅이 공유되었습니다.');
            }).catch(() => {
              navigator.clipboard.writeText(shareText);
              toast.success('공유 링크가 클립보드에 복사되었습니다.');
            });
          } else {
            navigator.clipboard.writeText(shareText);
            toast.success('공유 링크가 클립보드에 복사되었습니다.');
          }
        }
      }
    };
  };

  // 🔥 새로운 서버리스 기능 핸들러들
  const handleRolePersistenceToggle = async (chatId: string, enable: boolean) => {
    try {
      const userId = getCurrentUserId();
      const currentChat = state.conversations.find(c => c.id === chatId);
      
      if (!currentChat || !currentChat.roleId) {
        toast.error('역할이 설정되지 않은 채팅입니다.');
        return;
      }
      
      if (enable) {
        await saveRolePersistence(
          userId,
          chatId,
          currentChat.roleId,
          'conversation',
          {
            keywordIds: [],
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        );
        toast.success('이 대화에서 역할이 고정되었습니다.');
      } else {
        await saveRolePersistence(userId, chatId, '', 'session', {});
        toast.success('역할 고정이 해제되었습니다.');
      }
    } catch (error) {
      console.error('역할 고정 토글 오류:', error);
      toast.error('역할 고정 설정 중 오류가 발생했습니다.');
    }
  };

  const handleTimelineReminderSetup = async (chatId: string, reminderType: 'progress' | 'summary' | 'check_in') => {
    try {
      const userId = getCurrentUserId();
      
      await setReminder(
        userId,
        chatId,
        reminderType,
        undefined,
        { messageCount: 10 } // 10턴마다 리마인더
      );
      
      toast.success('대화 리마인더가 설정되었습니다.');
    } catch (error) {
      console.error('리마인더 설정 오류:', error);
      toast.error('리마인더 설정 중 오류가 발생했습니다.');
    }
  };

  const handleKeywordResponseSetup = async (chatId: string, keywordIds: string[]) => {
    try {
      const userId = getCurrentUserId();
      const selectedKeywords = DEFAULT_KEYWORDS.filter(kw => keywordIds.includes(kw.id));
      
      await saveKeywordSettings(
        userId,
        chatId,
        state.selectedRoleId || null,
        selectedKeywords,
        'flexible'
      );
      
      toast.success('키워드 응답 설정이 저장되었습니다.');
    } catch (error) {
      console.error('키워드 설정 오류:', error);
      toast.error('키워드 설정 중 오류가 발생했습니다.');
    }
  };

  const handleManualSummaryGeneration = async (chatId: string) => {
    try {
      const userId = getCurrentUserId();
      const currentChat = state.conversations.find(c => c.id === chatId);
      
      if (!currentChat || currentChat.messages.length < 5) {
        toast.error('요약할 메시지가 충분하지 않습니다 (최소 5개 필요).');
        return;
      }
      
      toast.info('대화 요약을 생성하고 있습니다...');
      
      const result = await generateSummary(
        userId,
        chatId,
        currentChat.messages,
        0,
        currentChat.messages.length - 1,
        'bullet'
      );
      
      if (result.success) {
        toast.success('대화 요약이 생성되었습니다.');
        // TODO: 요약 결과를 UI에 표시하는 모달이나 패널 구현
        console.log('📋 생성된 요약:', result.summary);
      }
    } catch (error) {
      console.error('수동 요약 생성 오류:', error);
      toast.error('요약 생성 중 오류가 발생했습니다.');
    }
  };

  // 🎯 타임라인 고급 설정 핸들러 (모드별 제한 적용)
  const handleAdvancedTimelineSettings = async (
    chatId: string, 
    settings: {
      summaryEnabled?: boolean;
      summaryInterval?: number;
      summaryFormat?: 'bullet' | 'paragraph' | 'sentences' | 'custom';
      reminderEnabled?: boolean;
      reminderInterval?: number;
    }
  ) => {
    try {
      const userId = getCurrentUserId();
      const userMode = state.userSettings.mode as 'standard' | 'advanced' | 'expert';
      
      // 모드별 제한사항 먼저 확인
      const limitations = await conversationTimelineService.getModeLimitations(userMode);
      
      if (!limitations.features.summaryControl && settings.summaryInterval) {
        toast.error(`${userMode} 모드에서는 요약 설정을 변경할 수 없습니다.`);
        return;
      }
      
      if (!limitations.features.summaryToggle && settings.summaryEnabled === false) {
        toast.error(`${userMode} 모드에서는 요약을 비활성화할 수 없습니다.`);
        return;
      }
      
      const result = await conversationTimelineService.saveAdvancedSettings(
        userId,
        chatId,
        userMode,
        settings
      );
      
      if (result.success) {
        toast.success('타임라인 고급 설정이 저장되었습니다.');
      }
    } catch (error) {
      console.error('타임라인 고급 설정 오류:', error);
      toast.error('타임라인 고급 설정 중 오류가 발생했습니다.');
    }
  };

  const handleIntelligentSummaryGeneration = async (chatId: string, forceGenerate: boolean = false) => {
    try {
      const userId = getCurrentUserId();
      const userMode = state.userSettings.mode as 'standard' | 'advanced' | 'expert';
      const currentChat = state.conversations.find(c => c.id === chatId);
      
      if (!currentChat || currentChat.messages.length < 5) {
        toast.error('요약할 메시지가 충분하지 않습니다 (최소 5개 필요).');
        return;
      }
      
      toast.info('지능형 요약을 생성하고 있습니다...');
      
      const result = await conversationTimelineService.generateIntelligentSummary(
        userId,
        chatId,
        currentChat.messages,
        userMode,
        forceGenerate ? { summaryEnabled: true } : undefined
      );
      
      if (result.success) {
        if (result.summary) {
          toast.success('지능형 요약이 생성되었습니다.');
          console.log('📋 생성된 지능형 요약:', result.summary);
        } else {
          toast.info(result.message || '요약 생성이 스킵되었습니다.');
        }
      }
    } catch (error) {
      console.error('지능형 요약 생성 오류:', error);
      toast.error('지능형 요약 생성 중 오류가 발생했습니다.');
    }
  };

  // 🔐 서버리스 제한사항 핸들러들
  const handleServerlessLimitationCheck = async (action: LimitationAction): Promise<boolean> => {
    try {
      const userId = getCurrentUserId();
      const userMode = state.userSettings.mode as 'standard' | 'advanced' | 'expert';
      
      console.log('🔐 서버리스 제한사항 확인 시작:', { userId, userMode, action });
      
      // 현재 사용량 조회
      const currentUsageData = await getCurrentUsage(userId);
      console.log('📊 사용량 데이터 확인:', currentUsageData);
      
      const currentUsage = currentUsageData.currentUsage;
      
      // 액션 제한 검증
      const validation = await validateAction(userId, userMode, action, currentUsage);
      console.log('✅ 제한사항 검증 결과:', validation);
      
      if (!validation.allowed) {
        console.warn('🚫 액션 차단됨:', validation.reason);
        toast.error(validation.reason);
        if (validation.upgradeRequired) {
          toast.info('업그레이드하여 더 많은 기능을 이용하세요.');
        }
        return false;
      }
      
      console.log('✅ 액션 허용됨');
      return true;
    } catch (error) {
      console.error('❌ 서버리스 제한사항 확인 실패:', error);
      console.error('📊 에러 컨텍스트:', {
        userId,
        userMode,
        action,
        errorType: error?.constructor?.name,
        errorMessage: error?.message,
        currentUsageData
      });
      
      // 네트워크 에러인 경우 더 구체적인 에러 메시지
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('🌐 서버 연결 실패 - 클라이언트 fallback 로직 사용');
        toast.warning('서버와 연결할 수 없어 로컬 제한사항을 적용합니다.');
        // 서버 연결 실패시 클라이언트에서 기본 제한사항 적용
        return handleClientSideLimitationCheck(action, state.userSettings.mode as 'standard' | 'advanced' | 'expert');
      }
      
      // 기타 오류시 차단 (보안상 안전한 방향)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      toast.error(`제한사항 확인 실패: ${errorMessage}`);
      return false;
    }
  };

  const handleServerlessUsageTracking = async (action: LimitationAction, metadata?: any) => {
    try {
      const userId = getCurrentUserId();
      const userMode = state.userSettings.mode as 'standard' | 'advanced' | 'expert';
      
      console.log('📊 서버리스 사용량 추적 시작:', { userId, userMode, action });
      
      await trackUsage(userId, userMode, action, metadata);
      console.log(`✅ 서버에서 ${action} 사용량 추적 완료`);
    } catch (error) {
      console.warn('❌ 서버리스 사용량 추적 실패:', error);
      // 사용량 추적 실패는 조용히 처리 (사용자 경험에 영향 없음)
      
      // 네트워크 에러인 경우 로컬에서 간단히 추적
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('🔄 로컬 사용량 추적으로 fallback');
        handleLocalUsageTracking(action, metadata);
      }
    }
  };

  // 클라이언트 사이드 제한사항 체크 (서버 연결 실패시 fallback)
  const handleClientSideLimitationCheck = (action: LimitationAction, userMode: 'standard' | 'advanced' | 'expert'): boolean => {
    console.log('🔄 클라이언트 사이드 제한사항 체크:', { action, userMode });
    
    // 기본적인 클라이언트 사이드 제한사항 (보수적으로 설정)
    const clientLimitations = {
      standard: { maxProjects: 2, maxConversations: 10, maxCustomRoles: 6 },
      advanced: { maxProjects: 5, maxConversations: 50, maxCustomRoles: 15 },
      expert: { maxProjects: 20, maxConversations: 200, maxCustomRoles: 50 }
    };
    
    const limits = clientLimitations[userMode] || clientLimitations.standard;
    
    // 현재 로컬 상태 기반으로 제한 검증
    switch (action) {
      case 'create_project':
        const currentProjects = state.projects.length;
        if (currentProjects >= limits.maxProjects) {
          console.warn('🚫 프로젝트 생성 제한 (클라이언트):', { current: currentProjects, max: limits.maxProjects });
          toast.error(`${userMode} 모드에서는 최대 ${limits.maxProjects}개의 프로젝트만 생성할 수 있습니다.`);
          return false;
        }
        break;
        
      case 'create_conversation':
        const currentChats = state.conversations.length;
        if (currentChats >= limits.maxConversations) {
          console.warn('🚫 대화 생성 제한 (클라이언트):', { current: currentChats, max: limits.maxConversations });
          toast.error(`${userMode} 모드에서는 최대 ${limits.maxConversations}개의 대화만 생성할 수 있습니다.`);
          return false;
        }
        break;
        
      case 'create_custom_role':
        const customRoles = state.roles.filter(r => r.isCustom).length;
        if (customRoles >= limits.maxCustomRoles) {
          console.warn('🚫 커스텀 역할 생성 제한 (클라이언트):', { current: customRoles, max: limits.maxCustomRoles });
          toast.error(`${userMode} 모드에서는 최대 ${limits.maxCustomRoles}개의 커스텀 역할만 생성할 수 있습니다.`);
          return false;
        }
        break;
        
      default:
        // 다른 액션들은 기본적으로 허용 (서버 연결 실패시)
        console.log('✅ 기본 액션 허용 (클라이언트 fallback)');
        return true;
    }
    
    console.log('✅ 클라이언트 제한사항 체크 통과');
    return true;
  };

  // 로컬 사용량 추적 (서버 연결 실패시 fallback)
  const handleLocalUsageTracking = (action: LimitationAction, metadata?: any) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const trackingKey = `local_usage_${today}`;
      
      let usage = JSON.parse(localStorage.getItem(trackingKey) || '{}');
      
      switch (action) {
        case 'create_project':
          usage.projects = (usage.projects || 0) + 1;
          break;
        case 'create_conversation':
          usage.conversations = (usage.conversations || 0) + 1;
          break;
        case 'create_custom_role':
          usage.customRoles = (usage.customRoles || 0) + 1;
          break;
        case 'api_call':
          usage.apiCalls = (usage.apiCalls || 0) + 1;
          break;
        case 'export_chat':
          usage.exportedChats = (usage.exportedChats || 0) + 1;
          break;
      }
      
      localStorage.setItem(trackingKey, JSON.stringify(usage));
      console.log('📊 로컬 사용량 추적 완료:', { action, usage });
    } catch (error) {
      console.warn('로컬 사용량 추적 실패:', error);
    }
  };

  // 로컬 사용량 데이터 조회 (서버 연결 실패시 fallback)
  const getLocalUsageData = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const trackingKey = `local_usage_${today}`;
      
      const localUsage = JSON.parse(localStorage.getItem(trackingKey) || '{}');
      
      // 앱 상태와 로컬 스토리지 데이터 결합
      const result = {
        success: true,
        currentUsage: {
          projects: Math.max(state.projects.length, localUsage.projects || 0),
          conversations: Math.max(state.conversations.length, localUsage.conversations || 0),
          customRoles: Math.max(state.roles.filter(r => r.isCustom).length, localUsage.customRoles || 0),
          apiCallsToday: localUsage.apiCalls || 0,
          exportedChats: localUsage.exportedChats || 0
        },
        date: today,
        source: 'local_fallback'
      };
      
      console.log('📊 로컬 사용량 데이터 조회 완료:', result);
      return result;
    } catch (error) {
      console.warn('로컬 사용량 데이터 조회 실패:', error);
      
      // 최종 fallback - 앱 상태만 사용
      return {
        success: true,
        currentUsage: {
          projects: state.projects.length,
          conversations: state.conversations.length,
          customRoles: state.roles.filter(r => r.isCustom).length,
          apiCallsToday: 0,
          exportedChats: 0
        },
        date: new Date().toISOString().split('T')[0],
        source: 'app_state_fallback'
      };
    }
  };

  const getServerlessFeatureHandlers = () => ({
    handleRolePersistenceToggle,
    handleTimelineReminderSetup,
    handleKeywordResponseSetup,
    handleManualSummaryGeneration,
    // 🎯 새로운 고급 기능들
    handleAdvancedTimelineSettings,
    handleIntelligentSummaryGeneration,
    // 🔐 서버리스 제한사항 핸들러들
    handleServerlessLimitationCheck,
    handleServerlessUsageTracking,
    // 모드별 제한사항 확인 (서버리스)
    getModeLimitations: async (userMode: 'standard' | 'advanced' | 'expert') => {
      try {
        return await ServerlessLimitationService.getModeLimitations(userMode);
      } catch (error) {
        console.warn('서버리스 모드별 제한사항 확인 실패:', error);
        return ServerlessLimitationService.getFallbackLimitations();
      }
    },
    // 현재 사용량 조회 (서버리스)
    getCurrentUsage: async () => {
      try {
        const userId = getCurrentUserId();
        console.log('📊 서버에서 사용량 조회 시작:', { userId });
        
        const result = await getCurrentUsage(userId);
        console.log('✅ 서버 사용량 조회 완료:', result);
        
        return result;
      } catch (error) {
        console.error('❌ 서버리스 사용량 조회 실패:', error);
        
        // 네트워크 에러인 경우 로컬 데이터 사용
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.log('🔄 로컬 사용량 데이터로 fallback');
          return getLocalUsageData();
        }
        
        // 기본 fallback 데이터
        return { 
          success: true,
          currentUsage: { 
            projects: state.projects.length, 
            conversations: state.conversations.length, 
            customRoles: state.roles.filter(r => r.isCustom).length, 
            apiCallsToday: 0, 
            exportedChats: 0 
          } 
        };
      }
    },
    // 타임라인 고급 설정 조회
    getAdvancedTimelineSettings: async (chatId: string) => {
      try {
        const userId = getCurrentUserId();
        const userMode = state.userSettings.mode as 'standard' | 'advanced' | 'expert';
        return await conversationTimelineService.getAdvancedSettings(userId, chatId, userMode);
      } catch (error) {
        console.warn('타임라인 고급 설정 조회 실패:', error);
        return null;
      }
    },
    // 역할 고정 상태 확인
    checkRolePersistence: async (chatId: string) => {
      try {
        const userId = getCurrentUserId();
        const result = await getRolePersistence(userId, chatId);
        return result.settings ? result.settings.roleId : null;
      } catch (error) {
        console.warn('역할 고정 상태 확인 실패:', error);
        return null;
      }
    },
    // 키워드 설정 확인
    checkKeywordSettings: async (chatId: string) => {
      try {
        const userId = getCurrentUserId();
        const result = await getKeywordSettings(userId, chatId);
        return result.settings ? result.settings.keywords : [];
      } catch (error) {
        console.warn('키워드 설정 확인 실패:', error);
        return [];
      }
    }
  });

  return {
    handleSendMessage,
    handleRoleSelect,
    handleNewChat,
    handleChatSelect,
    handleNewProject,
    handleProjectSelectionModalSelect,
    handleProjectSelectionModalNewProject,
    getChatActionHandlers,
    updateConversation,
    updateProject,
    deleteProject,
    addProject,
    deleteConversation,
    // 🔥 새로운 서버리스 기능들
    ...getServerlessFeatureHandlers()
  };
}