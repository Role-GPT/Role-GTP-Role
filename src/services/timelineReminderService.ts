/**
 * 타임라인 리마인더 서비스 - 서버리스 버전
 * 
 * Role GPT의 차별화 기능을 서버리스 함수로 보안 강화
 * - 서버에서 안전하게 처리되는 대화 요약 및 리마인더
 * - 클라이언트에서는 서버 API 호출만 수행
 * - 브라우저 노출 없이 고유 기능 보호
 */

import { Conversation, ConversationSummary, TimelineReminder, Message } from '../types';
import { TIMELINE_REMINDER_DEFAULTS, MODE_LIMITATIONS } from '../constants';
import { 
  conversationTimelineService, 
  generateSummary, 
  setReminder, 
  getTimeline, 
  checkReminderTrigger 
} from './conversationTimelineService';
import { getCurrentUserId } from './googleService';

/**
 * 대화 요약 생성기 - 서버리스 버전
 */
export class ConversationSummarizer {
  /**
   * 대화 메시지들을 서버에서 요약합니다
   */
  static async generateSummary(
    messages: Message[],
    startIndex: number,
    endIndex: number,
    format: 'paragraph' | 'bullet' | 'sentences' = 'bullet',
    conversationId: string
  ): Promise<string> {
    try {
      const userId = getCurrentUserId();
      
      // 서버리스 함수로 요약 생성 요청
      const response = await generateSummary(
        userId,
        conversationId,
        messages,
        startIndex,
        endIndex,
        format === 'sentences' ? 'paragraph' : format
      );
      
      if (response.success && response.summary) {
        return response.summary.summary;
      }
      
      // 서버 요약 실패 시 클라이언트 폴백
      return this.generateClientSideSummary(messages, startIndex, endIndex, format);
      
    } catch (error) {
      console.warn('서버 요약 생성 실패, 클라이언트 폴백:', error);
      return this.generateClientSideSummary(messages, startIndex, endIndex, format);
    }
  }

  /**
   * 클라이언트 사이드 폴백 요약 생성
   */
  private static generateClientSideSummary(
    messages: Message[],
    startIndex: number,
    endIndex: number,
    format: 'paragraph' | 'bullet' | 'sentences' = 'bullet'
  ): string {
    const messagesToSummarize = messages.slice(startIndex, endIndex + 1);
    
    const userMessages = messagesToSummarize.filter(m => m.sender === 'user');
    const aiMessages = messagesToSummarize.filter(m => m.sender === 'ai');
    
    const topics = this.extractTopics(messagesToSummarize);
    
    switch (format) {
      case 'bullet':
        return this.generateBulletSummary(topics, userMessages.length, aiMessages.length);
      case 'sentences':
        return this.generateSentenceSummary(topics);
      case 'paragraph':
        return this.generateParagraphSummary(topics, userMessages.length, aiMessages.length);
      default:
        return this.generateBulletSummary(topics, userMessages.length, aiMessages.length);
    }
  }

  /**
   * 메시지에서 주요 토픽 추출
   */
  private static extractTopics(messages: Message[]): string[] {
    const topics: string[] = [];
    
    messages.forEach(message => {
      const text = message.text.toLowerCase();
      
      // 간단한 키워드 기반 토픽 추출
      if (text.includes('프로젝트') || text.includes('작업')) {
        topics.push('프로젝트 관련');
      }
      if (text.includes('코딩') || text.includes('개발') || text.includes('프로그래밍')) {
        topics.push('개발 관련');
      }
      if (text.includes('디자인') || text.includes('UI') || text.includes('UX')) {
        topics.push('디자인 관련');
      }
      if (text.includes('학습') || text.includes('공부') || text.includes('교육')) {
        topics.push('학습 관련');
      }
      if (text.includes('문제') || text.includes('해결') || text.includes('도움')) {
        topics.push('문제 해결');
      }
    });
    
    // 중복 제거
    return [...new Set(topics)];
  }

  /**
   * 불릿 포인트 형태 요약 생성
   */
  private static generateBulletSummary(topics: string[], userCount: number, aiCount: number): string {
    let summary = `• 대화 ${userCount + aiCount}턴 진행 (사용자 ${userCount}턴, AI ${aiCount}턴)\n`;
    
    if (topics.length > 0) {
      summary += `• 주요 주제: ${topics.join(', ')}\n`;
    }
    
    summary += `• 요약 생성 시간: ${new Date().toLocaleString('ko-KR')}`;
    
    return summary;
  }

  /**
   * 문장 형태 요약 생성
   */
  private static generateSentenceSummary(topics: string[]): string {
    if (topics.length === 0) {
      return '사용자와 AI 간의 일반적인 대화가 진행되었습니다.';
    }
    
    return `${topics.join(', ')}에 대한 대화가 이루어졌습니다.`;
  }

  /**
   * 문단 형태 요약 생성
   */
  private static generateParagraphSummary(topics: string[], userCount: number, aiCount: number): string {
    let summary = `이 구간에서는 총 ${userCount + aiCount}턴의 대화가 진행되었습니다. `;
    
    if (topics.length > 0) {
      summary += `주요 주제는 ${topics.join(', ')}이었으며, `;
    }
    
    summary += `사용자가 ${userCount}번의 메시지를 보내고 AI가 ${aiCount}번 응답했습니다.`;
    
    return summary;
  }

  /**
   * 여러 요약을 재요약합니다 (요약의 요약)
   */
  static consolidateSummaries(summaries: ConversationSummary[]): string {
    if (summaries.length === 0) return '';
    if (summaries.length === 1) return summaries[0].summary;
    
    const totalMessages = summaries.reduce((sum, s) => 
      sum + (s.endMessageIndex - s.startMessageIndex + 1), 0
    );
    
    const startIndex = summaries[0].startMessageIndex;
    const endIndex = summaries[summaries.length - 1].endMessageIndex;
    
    return `📋 통합 요약 (${startIndex + 1}~${endIndex + 1}번째 메시지, 총 ${totalMessages}턴):\n\n` +
           summaries.map((s, i) => `${i + 1}. ${s.summary}`).join('\n\n');
  }
}

/**
 * 타임라인 리마인더 매니저 - 서버리스 버전
 */
export class TimelineReminderManager {
  /**
   * 새 메시지가 추가될 때 서버에서 요약 및 리마인더 처리
   */
  static async processNewMessage(
    conversation: Conversation,
    messageIndex: number,
    userMode: 'standard' | 'advanced' | 'expert'
  ): Promise<{
    summaries: ConversationSummary[];
    reminders: TimelineReminder[];
    shouldTriggerReminder: boolean;
  }> {
    try {
      const userId = getCurrentUserId();
      const limitations = MODE_LIMITATIONS[userMode];
      const settings = conversation.settings || {};
      
      const summaryInterval = settings.summaryInterval || TIMELINE_REMINDER_DEFAULTS.summaryInterval;
      const reminderInterval = settings.timelineReminderInterval || limitations.timelineReminderMaxInterval;
      
      console.log('🔄 서버리스 타임라인 처리:', {
        conversationId: conversation.id,
        messageIndex,
        userMode,
        summaryInterval,
        reminderInterval
      });

      // 서버에서 리마인더 트리거 확인
      const reminderCheck = await checkReminderTrigger(userId, conversation.id, messageIndex);
      
      // 요약 생성이 필요한지 확인
      const shouldGenerateSummary = this.shouldGenerateSummary(
        messageIndex, 
        summaryInterval, 
        conversation.lastSummaryIndex
      );
      
      let summaries = [...(conversation.summaries || [])];
      let reminders = [...(conversation.timelineReminders || [])];
      
      // 서버에서 요약 생성
      if (shouldGenerateSummary) {
        try {
          const startIndex = (conversation.lastSummaryIndex || -1) + 1;
          const endIndex = messageIndex;
          
          const summaryResponse = await generateSummary(
            userId,
            conversation.id,
            conversation.messages,
            startIndex,
            endIndex,
            settings.summaryFormat || 'auto'
          );
          
          if (summaryResponse.success && summaryResponse.summary) {
            const newSummary: ConversationSummary = {
              id: summaryResponse.summary.id,
              conversationId: conversation.id,
              summary: summaryResponse.summary.summary,
              startMessageIndex: summaryResponse.summary.startIndex,
              endMessageIndex: summaryResponse.summary.endIndex,
              format: settings.summaryFormat || 'bullet',
              createdAt: new Date(),
              isConsolidated: false
            };
            
            summaries.push(newSummary);
          }
        } catch (summaryError) {
          console.warn('서버 요약 생성 실패:', summaryError);
        }
      }
      
      // 리마인더 설정 (아직 없는 경우)
      if (settings.enableTimelineReminder && limitations.timelineReminderConfigurable) {
        const hasActiveReminder = reminders.some(r => r.isActive);
        
        if (!hasActiveReminder && messageIndex >= reminderInterval) {
          try {
            const reminderResponse = await setReminder(
              userId,
              conversation.id,
              'progress',
              undefined,
              { messageCount: reminderInterval }
            );
            
            if (reminderResponse.success && reminderResponse.reminder) {
              const newReminder: TimelineReminder = {
                id: reminderResponse.reminder.id,
                conversationId: conversation.id,
                content: reminderResponse.reminder.content,
                triggerInterval: reminderInterval,
                lastTriggeredAt: messageIndex,
                createdAt: new Date(),
                isActive: true
              };
              
              reminders.push(newReminder);
            }
          } catch (reminderError) {
            console.warn('서버 리마인더 설정 실패:', reminderError);
          }
        }
      }
      
      console.log('✅ 서버리스 타임라인 처리 완료:', {
        summariesCount: summaries.length,
        remindersCount: reminders.length,
        shouldTriggerReminder: reminderCheck.shouldTrigger
      });
      
      return {
        summaries,
        reminders,
        shouldTriggerReminder: reminderCheck.shouldTrigger
      };
      
    } catch (error) {
      console.error('서버리스 타임라인 처리 실패:', error);
      
      // 클라이언트 폴백 처리
      return this.processClientSideMessage(conversation, messageIndex, userMode);
    }
  }

  /**
   * 클라이언트 사이드 폴백 처리
   */
  private static processClientSideMessage(
    conversation: Conversation,
    messageIndex: number,
    userMode: 'standard' | 'advanced' | 'expert'
  ): {
    summaries: ConversationSummary[];
    reminders: TimelineReminder[];
    shouldTriggerReminder: boolean;
  } {
    const limitations = MODE_LIMITATIONS[userMode];
    const settings = conversation.settings || {};
    
    const summaryInterval = settings.summaryInterval || TIMELINE_REMINDER_DEFAULTS.summaryInterval;
    const reminderInterval = settings.timelineReminderInterval || limitations.timelineReminderMaxInterval;
    
    const summaries = [...(conversation.summaries || [])];
    const reminders = [...(conversation.timelineReminders || [])];
    let shouldTriggerReminder = false;
    
    // 1. 클라이언트 사이드 요약 생성 체크
    if (this.shouldGenerateSummary(messageIndex, summaryInterval, conversation.lastSummaryIndex)) {
      const startIndex = (conversation.lastSummaryIndex || -1) + 1;
      const endIndex = messageIndex;
      
      const summary = this.generateClientSideSummary(
        conversation.messages,
        startIndex,
        endIndex,
        settings.summaryFormat || 'bullet'
      );
      
      const newSummary: ConversationSummary = {
        id: `summary_${Date.now()}`,
        conversationId: conversation.id,
        summary,
        startMessageIndex: startIndex,
        endMessageIndex: endIndex,
        format: settings.summaryFormat || 'bullet',
        createdAt: new Date(),
        isConsolidated: false
      };
      
      summaries.push(newSummary);
    }
    
    // 2. 재요약 (통합) 체크
    const consolidationInterval = settings.consolidationInterval || TIMELINE_REMINDER_DEFAULTS.consolidationInterval;
    if (this.shouldConsolidate(messageIndex, consolidationInterval)) {
      const unconsolidatedSummaries = summaries.filter(s => !s.isConsolidated);
      
      if (unconsolidatedSummaries.length >= 3) {
        const consolidatedSummary = ConversationSummarizer.consolidateSummaries(unconsolidatedSummaries);
        
        const newConsolidatedSummary: ConversationSummary = {
          id: `consolidated_${Date.now()}`,
          conversationId: conversation.id,
          summary: consolidatedSummary,
          startMessageIndex: unconsolidatedSummaries[0].startMessageIndex,
          endMessageIndex: unconsolidatedSummaries[unconsolidatedSummaries.length - 1].endMessageIndex,
          format: 'paragraph',
          createdAt: new Date(),
          isConsolidated: true,
          originalSummaries: unconsolidatedSummaries.map(s => s.id)
        };
        
        summaries.push(newConsolidatedSummary);
        
        // 원본 요약들을 통합됨으로 표시
        unconsolidatedSummaries.forEach(s => s.isConsolidated = true);
      }
    }
    
    // 3. 타임라인 리마인더 트리거 체크
    if (settings.enableTimelineReminder && limitations.timelineReminderConfigurable) {
      const activeReminder = reminders.find(r => r.isActive);
      
      if (activeReminder) {
        const lastTriggered = activeReminder.lastTriggeredAt || 0;
        
        if (messageIndex - lastTriggered >= reminderInterval) {
          shouldTriggerReminder = true;
          activeReminder.lastTriggeredAt = messageIndex;
        }
      } else {
        // 첫 번째 리마인더 생성
        const newReminder: TimelineReminder = {
          id: `reminder_${Date.now()}`,
          conversationId: conversation.id,
          content: this.generateReminderContent(summaries),
          triggerInterval: reminderInterval,
          lastTriggeredAt: messageIndex,
          createdAt: new Date(),
          isActive: true
        };
        
        reminders.push(newReminder);
        shouldTriggerReminder = true;
      }
    }
    
    return {
      summaries,
      reminders,
      shouldTriggerReminder
    };
    
    // 1. 요약 생성 체크
    if (this.shouldGenerateSummary(messageIndex, summaryInterval, conversation.lastSummaryIndex)) {
      const startIndex = (conversation.lastSummaryIndex || -1) + 1;
      const endIndex = messageIndex;
      
      const summary = await ConversationSummarizer.generateSummary(
        conversation.messages,
        startIndex,
        endIndex,
        settings.summaryFormat || 'bullet'
      );
      
      const newSummary: ConversationSummary = {
        id: `summary_${Date.now()}`,
        conversationId: conversation.id,
        summary,
        startMessageIndex: startIndex,
        endMessageIndex: endIndex,
        format: settings.summaryFormat || 'bullet',
        createdAt: new Date(),
        isConsolidated: false
      };
      
      summaries.push(newSummary);
    }
    
    // 2. 재요약 (통합) 체크
    if (this.shouldConsolidate(messageIndex, consolidationInterval)) {
      const unconsolidatedSummaries = summaries.filter(s => !s.isConsolidated);
      
      if (unconsolidatedSummaries.length >= 3) {
        const consolidatedSummary = ConversationSummarizer.consolidateSummaries(unconsolidatedSummaries);
        
        const newConsolidatedSummary: ConversationSummary = {
          id: `consolidated_${Date.now()}`,
          conversationId: conversation.id,
          summary: consolidatedSummary,
          startMessageIndex: unconsolidatedSummaries[0].startMessageIndex,
          endMessageIndex: unconsolidatedSummaries[unconsolidatedSummaries.length - 1].endMessageIndex,
          format: 'paragraph',
          createdAt: new Date(),
          isConsolidated: true,
          originalSummaries: unconsolidatedSummaries.map(s => s.id)
        };
        
        summaries.push(newConsolidatedSummary);
        
        // 원본 요약들을 통합됨으로 표시
        unconsolidatedSummaries.forEach(s => s.isConsolidated = true);
      }
    }
    
    // 3. 타임라인 리마인더 트리거 체크
    if (settings.enableTimelineReminder && limitations.timelineReminderConfigurable) {
      const activeReminder = reminders.find(r => r.isActive);
      
      if (activeReminder) {
        const lastTriggered = activeReminder.lastTriggeredAt || 0;
        
        if (messageIndex - lastTriggered >= reminderInterval) {
          shouldTriggerReminder = true;
          activeReminder.lastTriggeredAt = messageIndex;
        }
      } else {
        // 첫 번째 리마인더 생성
        const newReminder: TimelineReminder = {
          id: `reminder_${Date.now()}`,
          conversationId: conversation.id,
          content: this.generateReminderContent(summaries),
          triggerInterval: reminderInterval,
          lastTriggeredAt: messageIndex,
          createdAt: new Date(),
          isActive: true
        };
        
        reminders.push(newReminder);
        shouldTriggerReminder = true;
      }
    }
    
    return {
      summaries,
      reminders,
      shouldTriggerReminder
    };
  }

  /**
   * 요약 생성이 필요한지 확인
   */
  private static shouldGenerateSummary(
    currentIndex: number,
    interval: number,
    lastSummaryIndex?: number
  ): boolean {
    const lastIndex = lastSummaryIndex || -1;
    return currentIndex - lastIndex >= interval;
  }

  /**
   * 재요약이 필요한지 확인
   */
  private static shouldConsolidate(currentIndex: number, interval: number): boolean {
    return currentIndex > 0 && currentIndex % interval === 0;
  }

  /**
   * 리마인더 내용 생성
   */
  private static generateReminderContent(summaries: ConversationSummary[]): string {
    if (summaries.length === 0) {
      return '대화가 시작되었습니다.';
    }
    
    const recentSummary = summaries[summaries.length - 1];
    return `최근 대화 요약: ${recentSummary.summary}`;
  }

  /**
   * 모드별 제한사항 확인
   */
  static checkModeLimitations(
    userMode: 'standard' | 'advanced' | 'expert',
    requestedInterval: number,
    isPaidUser: boolean = false
  ): { allowed: boolean; reason?: string } {
    const limitations = MODE_LIMITATIONS[userMode];
    
    if (userMode === 'standard') {
      if (requestedInterval !== 10) {
        return {
          allowed: false,
          reason: 'Standard 모드에서는 타임라인 리마인더 간격이 10턴으로 고정됩니다.'
        };
      }
    }
    
    if (userMode === 'advanced') {
      if (requestedInterval > 20 && !isPaidUser) {
        return {
          allowed: false,
          reason: '20턴 이후 설정은 유료 회원만 사용 가능합니다. 업그레이드 하시겠습니까?'
        };
      }
      
      if (requestedInterval > limitations.timelineReminderMaxInterval) {
        return {
          allowed: false,
          reason: `Advanced 모드에서는 최대 ${limitations.timelineReminderMaxInterval}턴까지 설정 가능합니다.`
        };
      }
    }
    
    if (requestedInterval > limitations.timelineReminderMaxInterval) {
      return {
        allowed: false,
        reason: `${userMode} 모드에서는 최대 ${limitations.timelineReminderMaxInterval}턴까지 설정 가능합니다.`
      };
    }
    
    return { allowed: true };
  }
}

/**
 * 업그레이드 유도 배너 관리
 */
export class UpgradeBannerManager {
  /**
   * 제한 사항에 도달했을 때 배너 표시 여부 확인
   */
  static shouldShowUpgradeBanner(
    userMode: 'standard' | 'advanced' | 'expert',
    currentCount: number,
    limitType: 'projects' | 'conversations' | 'customRoles' | 'templateRoles'
  ): { show: boolean; message: string } {
    const limitations = MODE_LIMITATIONS[userMode];
    
    let limit: number;
    let featureName: string;
    
    switch (limitType) {
      case 'projects':
        limit = limitations.maxProjects;
        featureName = '프로젝트';
        break;
      case 'conversations':
        limit = limitations.maxConversations;
        featureName = '대화창';
        break;
      case 'customRoles':
        limit = limitations.maxCustomRoles;
        featureName = '커스텀 Role';
        break;
      case 'templateRoles':
        limit = limitations.maxTemplateRoles;
        featureName = '템플릿 Role';
        break;
    }
    
    if (currentCount >= limit) {
      return {
        show: true,
        message: `더 편리하고 강력한 ${featureName} 기능을 사용하려면 업그레이드하세요! 🚀`
      };
    }
    
    // 제한의 80%에 도달하면 미리 알림
    if (currentCount >= Math.floor(limit * 0.8)) {
      return {
        show: true,
        message: `${featureName} 제한 ${limit}개 중 ${currentCount}개 사용 중입니다. 업그레이드로 더 많은 기능을 이용하세요!`
      };
    }
    
    return { show: false, message: '' };
  }
}
