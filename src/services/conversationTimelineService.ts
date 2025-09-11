/**
 * 대화 타임라인 서비스
 * 
 * Role GPT의 차별화 기능 중 하나인 대화 타임라인 시스템
 * - 자동 대화 요약 생성 (10-15턴마다)
 * - 재요약을 통한 장기 기억 관리 (30-50턴마다)
 * - 지능형 리마인더 시스템
 * - 대화 흐름 추적 및 분석
 * 
 * @author Role GPT Team
 * @version 1.0.0
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e3d1d00c`;

export interface ConversationSummary {
  id: string;
  startIndex: number;
  endIndex: number;
  summary: string;
  createdAt: string;
  isConsolidated: boolean;
}

export interface ConversationReminder {
  id: string;
  content: string;
  triggerIndex: number;
  isActive: boolean;
  createdAt: string;
}

export interface ConversationTimeline {
  id: string;
  conversationId: string;
  userId: string;
  summaries: ConversationSummary[];
  reminders: ConversationReminder[];
  settings: {
    summaryInterval: number;
    reminderInterval: number;
    autoConsolidate: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TimelineResponse {
  success: boolean;
  timeline?: ConversationTimeline;
  hasTimeline?: boolean;
  summary?: ConversationSummary;
  reminder?: ConversationReminder;
  message?: string;
}

export interface ReminderCheckResponse {
  success: boolean;
  shouldTrigger: boolean;
  reminders: ConversationReminder[];
  timeline?: {
    summariesCount: number;
    remindersCount: number;
    settings: any;
  };
}

/**
 * 대화 타임라인 서비스 클래스
 */
export class ConversationTimelineService {
  private readonly headers: HeadersInit;

  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    };
  }

  /**
   * 대화 요약 생성
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @param messages - 메시지 배열
   * @param startIndex - 요약 시작 인덱스 (선택사항)
   * @param endIndex - 요약 끝 인덱스 (선택사항)
   * @param summaryType - 요약 유형
   * @returns Promise<TimelineResponse>
   */
  async generateSummary(
    userId: string,
    conversationId: string,
    messages: any[],
    startIndex?: number,
    endIndex?: number,
    summaryType: 'auto' | 'bullet' | 'paragraph' = 'auto'
  ): Promise<TimelineResponse> {
    try {
      console.log('📝 대화 요약 생성:', { 
        userId, 
        conversationId, 
        messagesCount: messages.length,
        summaryType 
      });
      
      const response = await fetch(`${API_BASE_URL}/timeline/summary/generate`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          userId,
          conversationId,
          messages,
          startIndex,
          endIndex,
          summaryType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '대화 요약 생성에 실패했습니다');
      }

      const data = await response.json();
      console.log('✅ 대화 요약 생성 완료');
      
      return data;
    } catch (error) {
      console.error('대화 요약 생성 중 오류:', error);
      throw error;
    }
  }

  /**
   * 리마인더 설정
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @param reminderType - 리마인더 유형
   * @param content - 리마인더 내용 (선택사항)
   * @param triggerCondition - 트리거 조건
   * @param settings - 추가 설정
   * @returns Promise<TimelineResponse>
   */
  async setReminder(
    userId: string,
    conversationId: string,
    reminderType: 'progress' | 'summary' | 'check_in' | 'custom',
    content?: string,
    triggerCondition?: { messageCount: number },
    settings?: any
  ): Promise<TimelineResponse> {
    try {
      console.log('⏰ 리마인더 설정:', { userId, conversationId, reminderType });
      
      const response = await fetch(`${API_BASE_URL}/timeline/reminder/set`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          userId,
          conversationId,
          reminderType,
          content,
          triggerCondition,
          settings
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '리마인더 설정에 실패했습니다');
      }

      const data = await response.json();
      console.log('✅ 리마인더 설정 완료');
      
      return data;
    } catch (error) {
      console.error('리마인더 설정 중 오류:', error);
      throw error;
    }
  }

  /**
   * 전체 타임라인 조회
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @returns Promise<TimelineResponse>
   */
  async getTimeline(userId: string, conversationId: string): Promise<TimelineResponse> {
    try {
      console.log('📊 대화 타임라인 조회:', { userId, conversationId });
      
      const response = await fetch(`${API_BASE_URL}/timeline/${userId}/${conversationId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '대화 타임라인 조회에 실패했습니다');
      }

      const data = await response.json();
      console.log('✅ 대화 타임라인 조회 완료');
      
      return data;
    } catch (error) {
      console.error('대화 타임라인 조회 중 오류:', error);
      throw error;
    }
  }

  /**
   * 리마인더 트리거 확인
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @param currentMessageIndex - 현재 메시지 인덱스
   * @returns Promise<ReminderCheckResponse>
   */
  async checkReminderTrigger(
    userId: string,
    conversationId: string,
    currentMessageIndex: number
  ): Promise<ReminderCheckResponse> {
    try {
      console.log('🔔 리마인더 트리거 확인:', { 
        userId, 
        conversationId, 
        currentMessageIndex 
      });
      
      const response = await fetch(`${API_BASE_URL}/timeline/reminder/check`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          userId,
          conversationId,
          currentMessageIndex
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '리마인더 트리거 확인에 실패했습니다');
      }

      const data = await response.json();
      console.log('✅ 리마인더 트리거 확인 완료:', { 
        shouldTrigger: data.shouldTrigger 
      });
      
      return data;
    } catch (error) {
      console.error('리마인더 트리거 확인 중 오류:', error);
      throw error;
    }
  }

  /**
   * 자동 요약 조건 확인
   * 
   * @param messageCount - 현재 메시지 수
   * @param lastSummaryIndex - 마지막 요약 인덱스
   * @param summaryInterval - 요약 간격 (기본 12턴)
   * @returns boolean
   */
  shouldGenerateAutoSummary(
    messageCount: number,
    lastSummaryIndex: number = -1,
    summaryInterval: number = 12
  ): boolean {
    return messageCount - lastSummaryIndex >= summaryInterval;
  }

  /**
   * 자동 리마인더 조건 확인
   * 
   * @param messageCount - 현재 메시지 수
   * @param reminderInterval - 리마인더 간격 (기본 10턴)
   * @returns boolean
   */
  shouldTriggerAutoReminder(
    messageCount: number,
    reminderInterval: number = 10
  ): boolean {
    return messageCount > 0 && messageCount % reminderInterval === 0;
  }

  /**
   * 타임라인 기반 대화 진행률 계산
   * 
   * @param timeline - 대화 타임라인
   * @param currentMessageCount - 현재 메시지 수
   * @returns 대화 진행률 정보
   */
  calculateConversationProgress(
    timeline: ConversationTimeline,
    currentMessageCount: number
  ): {
    totalSummaries: number;
    totalReminders: number;
    nextSummaryAt: number;
    nextReminderAt: number;
    progressPercentage: number;
  } {
    const summaryInterval = timeline.settings.summaryInterval;
    const reminderInterval = timeline.settings.reminderInterval;
    
    const lastSummaryIndex = timeline.summaries.length > 0 
      ? timeline.summaries[timeline.summaries.length - 1].endIndex 
      : -1;
    
    const nextSummaryAt = lastSummaryIndex + summaryInterval + 1;
    const nextReminderAt = Math.ceil(currentMessageCount / reminderInterval) * reminderInterval;
    
    // 100턴을 기준으로 한 진행률 (임의의 기준)
    const progressPercentage = Math.min((currentMessageCount / 100) * 100, 100);
    
    return {
      totalSummaries: timeline.summaries.length,
      totalReminders: timeline.reminders.length,
      nextSummaryAt,
      nextReminderAt,
      progressPercentage
    };
  }

  /**
   * 타임라인 설정 업데이트
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @param settings - 새로운 설정
   * @returns Promise<TimelineResponse>
   */
  async updateTimelineSettings(
    userId: string,
    conversationId: string,
    settings: Partial<{
      summaryInterval: number;
      reminderInterval: number;
      autoConsolidate: boolean;
    }>
  ): Promise<TimelineResponse> {
    try {
      console.log('⚙️ 타임라인 설정 업데이트:', { userId, conversationId, settings });
      
      // 기존 타임라인 조회
      const currentTimeline = await this.getTimeline(userId, conversationId);
      
      if (!currentTimeline.timeline) {
        throw new Error('타임라인이 존재하지 않습니다');
      }
      
      // 더미 리마인더를 설정하여 설정 업데이트
      return await this.setReminder(
        userId,
        conversationId,
        'custom',
        '설정이 업데이트되었습니다',
        { messageCount: 1 },
        settings
      );
      
    } catch (error) {
      console.error('타임라인 설정 업데이트 중 오류:', error);
      throw error;
    }
  }

  /**
   * 🎯 모드별 제한사항 조회
   * 
   * @param userMode - 사용자 모드
   * @returns Promise<any>
   */
  async getModeLimitations(userMode: 'standard' | 'advanced' | 'expert'): Promise<any> {
    try {
      console.log('📋 모드별 제한사항 조회:', { userMode });
      
      const response = await fetch(`${API_BASE_URL}/timeline/mode-limitations/${userMode}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '모드별 제한사항 조회에 실패했습니다');
      }

      const data = await response.json();
      console.log('✅ 모드별 제한사항 조회 완료');
      
      return data;
    } catch (error) {
      console.error('모드별 제한사항 조회 중 오류:', error);
      throw error;
    }
  }

  /**
   * 🎛️ 타임라인 고급 설정 저장 (모드별 제한 적용)
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @param userMode - 사용자 모드
   * @param settings - 고급 설정
   * @returns Promise<TimelineResponse>
   */
  async saveAdvancedSettings(
    userId: string,
    conversationId: string,
    userMode: 'standard' | 'advanced' | 'expert',
    settings: {
      summaryEnabled?: boolean;
      summaryInterval?: number;
      summaryFormat?: 'bullet' | 'paragraph' | 'sentences' | 'custom';
      reminderEnabled?: boolean;
      reminderInterval?: number;
      autoConsolidate?: boolean;
      consolidationInterval?: number;
    }
  ): Promise<TimelineResponse> {
    try {
      console.log('⚙️ 타임라인 고급 설정 저장:', { 
        userId, 
        conversationId, 
        userMode,
        settings
      });
      
      const response = await fetch(`${API_BASE_URL}/timeline/advanced-settings/save`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          userId,
          conversationId,
          userMode,
          settings
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '타임라인 고급 설정 저장에 실패했습니다');
      }

      const data = await response.json();
      console.log('✅ 타임라인 고급 설정 저장 완료');
      
      return data;
    } catch (error) {
      console.error('타임라인 고급 설정 저장 중 오류:', error);
      throw error;
    }
  }

  /**
   * 🔍 타임라인 고급 설정 조회
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @param userMode - 사용자 모드
   * @returns Promise<any>
   */
  async getAdvancedSettings(
    userId: string,
    conversationId: string,
    userMode: 'standard' | 'advanced' | 'expert'
  ): Promise<any> {
    try {
      console.log('🔍 타임라인 고급 설정 조회:', { userId, conversationId, userMode });
      
      const response = await fetch(`${API_BASE_URL}/timeline/advanced-settings/${userId}/${conversationId}/${userMode}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '타임라인 고급 설정 조회에 실패했습니다');
      }

      const data = await response.json();
      console.log('✅ 타임라인 고급 설정 조회 완료');
      
      return data;
    } catch (error) {
      console.error('타임라인 고급 설정 조회 중 오류:', error);
      throw error;
    }
  }

  /**
   * 🧠 지능형 요약 생성 (모드별 고급 설정 적용)
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @param messages - 메시지 배열
   * @param userMode - 사용자 모드
   * @param forceSettings - 강제 설정 (선택사항)
   * @returns Promise<TimelineResponse>
   */
  async generateIntelligentSummary(
    userId: string,
    conversationId: string,
    messages: any[],
    userMode: 'standard' | 'advanced' | 'expert',
    forceSettings?: any
  ): Promise<TimelineResponse> {
    try {
      console.log('🧠 지능형 요약 생성:', { 
        userId, 
        conversationId, 
        messagesCount: messages.length,
        userMode
      });
      
      const response = await fetch(`${API_BASE_URL}/timeline/intelligent-summary`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          userId,
          conversationId,
          messages,
          userMode,
          forceSettings
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '지능형 요약 생성에 실패했습니다');
      }

      const data = await response.json();
      console.log('✅ 지능형 요약 생성 완료');
      
      return data;
    } catch (error) {
      console.error('지능형 요약 생성 중 오류:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
export const conversationTimelineService = new ConversationTimelineService();

// 편의 함수들
export const generateSummary = (
  userId: string,
  conversationId: string,
  messages: any[],
  startIndex?: number,
  endIndex?: number,
  summaryType?: 'auto' | 'bullet' | 'paragraph'
) => conversationTimelineService.generateSummary(
  userId, conversationId, messages, startIndex, endIndex, summaryType
);

export const setReminder = (
  userId: string,
  conversationId: string,
  reminderType: 'progress' | 'summary' | 'check_in' | 'custom',
  content?: string,
  triggerCondition?: { messageCount: number },
  settings?: any
) => conversationTimelineService.setReminder(
  userId, conversationId, reminderType, content, triggerCondition, settings
);

export const getTimeline = (userId: string, conversationId: string) =>
  conversationTimelineService.getTimeline(userId, conversationId);

export const checkReminderTrigger = (
  userId: string,
  conversationId: string,
  currentMessageIndex: number
) => conversationTimelineService.checkReminderTrigger(userId, conversationId, currentMessageIndex);
