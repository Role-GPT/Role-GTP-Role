/**
 * 역할 고정 (Role Persistence) 서비스
 * 
 * Role GPT의 차별화 기능 중 하나인 역할 고정 시스템
 * - 특정 역할로 대화를 지속적으로 유지
 * - 세션, 대화별, 영구 고정 옵션
 * - 키워드 설정 및 맞춤 인스트럭션 지원
 * 
 * @author Role GPT Team
 * @version 1.0.0
 */

import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e3d1d00c`;

export interface RolePersistenceSettings {
  userId: string;
  conversationId: string;
  roleId: string;
  persistenceType: 'session' | 'conversation' | 'permanent';
  settings: {
    keywordIds: string[];
    temperature: number;
    maxOutputTokens: number;
    safetyLevel: string;
    customInstructions?: string;
  };
  createdAt: string;
  lastUsedAt: string;
}

export interface RolePersistenceResponse {
  success: boolean;
  settings?: RolePersistenceSettings;
  isGlobal?: boolean;
  message?: string;
}

/**
 * Role Persistence 서비스 클래스
 */
export class RolePersistenceService {
  private readonly headers: HeadersInit;

  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    };
  }

  /**
   * 역할 고정 설정 저장
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID (선택사항, 없으면 글로벌 설정)
   * @param roleId - 고정할 역할 ID
   * @param persistenceType - 고정 유형
   * @param settings - 역할 설정
   * @returns Promise<RolePersistenceResponse>
   */
  async saveRolePersistence(
    userId: string,
    conversationId: string | null,
    roleId: string,
    persistenceType: 'session' | 'conversation' | 'permanent',
    settings: {
      keywordIds?: string[];
      temperature?: number;
      maxOutputTokens?: number;
      safetyLevel?: string;
      customInstructions?: string;
    }
  ): Promise<RolePersistenceResponse> {
    try {
      console.log('💾 역할 고정 설정 저장:', { userId, roleId, persistenceType });
      
      const response = await fetch(`${API_BASE_URL}/role/persistence/save`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          userId,
          conversationId,
          roleId,
          persistenceType,
          settings: {
            keywordIds: settings.keywordIds || [],
            temperature: settings.temperature || 0.7,
            maxOutputTokens: settings.maxOutputTokens || 2048,
            safetyLevel: settings.safetyLevel || 'BLOCK_MEDIUM_AND_ABOVE',
            customInstructions: settings.customInstructions || ''
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '역할 고정 설정 저장에 실패했습니다');
      }

      const data = await response.json();
      console.log('✅ 역할 고정 설정 저장 완료');
      
      return data;
    } catch (error) {
      console.error('역할 고정 설정 저장 중 오류:', error);
      throw error;
    }
  }

  /**
   * 역할 고정 설정 조회
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @returns Promise<RolePersistenceResponse>
   */
  async getRolePersistence(
    userId: string,
    conversationId: string
  ): Promise<RolePersistenceResponse> {
    try {
      console.log('🔍 역할 고정 설정 조회:', { userId, conversationId });
      
      const response = await fetch(`${API_BASE_URL}/role/persistence/${userId}/${conversationId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '역할 고정 설정 조회에 실패했습니다');
      }

      const data = await response.json();
      console.log('✅ 역할 고정 설정 조회 완료:', data.settings ? '설정 있음' : '설정 없음');
      
      return data;
    } catch (error) {
      console.error('역할 고정 설정 조회 중 오류:', error);
      throw error;
    }
  }

  /**
   * 역할 고정 해제
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @returns Promise<boolean>
   */
  async clearRolePersistence(userId: string, conversationId: string): Promise<boolean> {
    try {
      console.log('🗑️ 역할 고정 해제:', { userId, conversationId });
      
      // 빈 설정으로 저장하여 해제
      const response = await this.saveRolePersistence(
        userId,
        conversationId,
        '',
        'session',
        {}
      );
      
      console.log('✅ 역할 고정 해제 완료');
      return response.success;
    } catch (error) {
      console.error('역할 고정 해제 중 오류:', error);
      return false;
    }
  }

  /**
   * 현재 활성 역할 확인
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @returns Promise<string | null>
   */
  async getActiveRole(userId: string, conversationId: string): Promise<string | null> {
    try {
      const persistence = await this.getRolePersistence(userId, conversationId);
      
      if (persistence.success && persistence.settings) {
        return persistence.settings.roleId;
      }
      
      return null;
    } catch (error) {
      console.error('활성 역할 확인 중 오류:', error);
      return null;
    }
  }

  /**
   * 역할 고정 유형별 설정 확인
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @returns Promise<'session' | 'conversation' | 'permanent' | null>
   */
  async getPersistenceType(
    userId: string, 
    conversationId: string
  ): Promise<'session' | 'conversation' | 'permanent' | null> {
    try {
      const persistence = await this.getRolePersistence(userId, conversationId);
      
      if (persistence.success && persistence.settings) {
        return persistence.settings.persistenceType;
      }
      
      return null;
    } catch (error) {
      console.error('역할 고정 유형 확인 중 오류:', error);
      return null;
    }
  }

  /**
   * 역할별 맞춤 설정 적용
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @param roleId - 역할 ID
   * @param customSettings - 맞춤 설정
   * @returns Promise<RolePersistenceResponse>
   */
  async applyCustomRoleSettings(
    userId: string,
    conversationId: string,
    roleId: string,
    customSettings: {
      temperature?: number;
      maxOutputTokens?: number;
      keywordIds?: string[];
      customInstructions?: string;
    }
  ): Promise<RolePersistenceResponse> {
    try {
      console.log('⚙️ 역할별 맞춤 설정 적용:', { userId, roleId });
      
      return await this.saveRolePersistence(
        userId,
        conversationId,
        roleId,
        'conversation',
        {
          temperature: customSettings.temperature || 0.7,
          maxOutputTokens: customSettings.maxOutputTokens || 2048,
          keywordIds: customSettings.keywordIds || [],
          customInstructions: customSettings.customInstructions || '',
          safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      );
    } catch (error) {
      console.error('역할별 맞춤 설정 적용 중 오류:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
export const rolePersistenceService = new RolePersistenceService();

// 편의 함수들
export const saveRolePersistence = (
  userId: string,
  conversationId: string | null,
  roleId: string,
  persistenceType: 'session' | 'conversation' | 'permanent',
  settings: any
) => rolePersistenceService.saveRolePersistence(userId, conversationId, roleId, persistenceType, settings);

export const getRolePersistence = (userId: string, conversationId: string) =>
  rolePersistenceService.getRolePersistence(userId, conversationId);

export const clearRolePersistence = (userId: string, conversationId: string) =>
  rolePersistenceService.clearRolePersistence(userId, conversationId);

export const getActiveRole = (userId: string, conversationId: string) =>
  rolePersistenceService.getActiveRole(userId, conversationId);

export const applyCustomRoleSettings = (
  userId: string,
  conversationId: string,
  roleId: string,
  customSettings: any
) => rolePersistenceService.applyCustomRoleSettings(userId, conversationId, roleId, customSettings);