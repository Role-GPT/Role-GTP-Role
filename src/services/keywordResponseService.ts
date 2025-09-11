/**
 * 키워드 응답 설정 서비스
 * 
 * Role GPT의 차별화 기능 중 하나인 키워드 기반 응답 시스템
 * - AI 응답에 특정 키워드나 스타일 강제 적용
 * - 카테고리별 키워드 관리 (어조, 스타일, 형태, 접근법 등)
 * - 응답 모드 설정 (엄격, 유연, 적응형)
 * - 대화별, 역할별 키워드 설정 지원
 * 
 * @author Role GPT Team
 * @version 1.0.0
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e3d1d00c`;

export interface KeywordDefinition {
  id: string;
  name: string;
  description: string;
  category: 'tone' | 'style' | 'format' | 'approach' | 'language' | 'custom';
  priority: number;
  isActive: boolean;
  detailPrompt?: string; // 세부 프롬프트 지시사항
}

export interface KeywordResponseSettings {
  userId: string;
  conversationId?: string;
  roleId?: string;
  keywords: KeywordDefinition[];
  responseMode: 'strict' | 'flexible' | 'adaptive';
  createdAt: string;
  updatedAt: string;
}

export interface KeywordResponse {
  success: boolean;
  settings?: KeywordResponseSettings;
  hasSettings?: boolean;
  message?: string;
}

// 기본 키워드 정의
export const DEFAULT_KEYWORDS: KeywordDefinition[] = [
  {
    id: 'kw_professional',
    name: '전문적',
    description: '전문가 관점에서 심층적이고 신뢰할 수 있는 정보를 제공합니다',
    category: 'tone',
    priority: 1,
    isActive: true,
    detailPrompt: '구체적인 데이터와 출처를 포함하여 응답하세요'
  },
  {
    id: 'kw_friendly',
    name: '친근한',
    description: '따뜻하고 부드러운 어조로 사용자를 격려하고 지원합니다',
    category: 'tone',
    priority: 2,
    isActive: true
  },
  {
    id: 'kw_creative',
    name: '창의적',
    description: '독창적이고 상상력 넘치는 아이디어를 기존 틀 밖에서 제안합니다',
    category: 'approach',
    priority: 3,
    isActive: true
  },
  {
    id: 'kw_technical',
    name: '기술적',
    description: '정확한 기술 용어와 데이터를 사용하여 복잡한 개념을 명확하게 설명합니다',
    category: 'style',
    priority: 4,
    isActive: true
  },
  {
    id: 'kw_concise',
    name: '간결한',
    description: '핵심 정보에 집중하여 간결하고 명확하게 응답합니다',
    category: 'format',
    priority: 5,
    isActive: true
  },
  {
    id: 'kw_detailed',
    name: '상세한',
    description: '배경 정보와 구체적인 예시를 포함하여 풍부한 정보를 제공합니다',
    category: 'format',
    priority: 6,
    isActive: true
  },
  {
    id: 'kw_encouraging',
    name: '격려하는',
    description: '사용자의 의견을 긍정하고 자신감을 키워주는 방식으로 참여합니다',
    category: 'tone',
    priority: 7,
    isActive: true
  },
  {
    id: 'kw_analytical',
    name: '분석적',
    description: '정보를 논리적이고 체계적으로 분석하여 장단점과 인과관계를 설명합니다',
    category: 'approach',
    priority: 8,
    isActive: true
  }
];

/**
 * 키워드 응답 설정 서비스 클래스
 */
export class KeywordResponseService {
  private readonly headers: HeadersInit;

  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    };
  }

  /**
   * 키워드 응답 설정 저장
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID (선택사항)
   * @param roleId - 역할 ID (선택사항)
   * @param keywords - 키워드 배열
   * @param responseMode - 응답 모드
   * @returns Promise<KeywordResponse>
   */
  async saveKeywordSettings(
    userId: string,
    conversationId: string | null,
    roleId: string | null,
    keywords: KeywordDefinition[],
    responseMode: 'strict' | 'flexible' | 'adaptive' = 'flexible'
  ): Promise<KeywordResponse> {
    try {
      console.log('🏷️ 키워드 응답 설정 저장:', { 
        userId, 
        conversationId, 
        roleId,
        keywordsCount: keywords.length,
        responseMode
      });
      
      const response = await fetch(`${API_BASE_URL}/keywords/response/save`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          userId,
          conversationId,
          roleId,
          keywords,
          responseMode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '키워드 응답 설정 저장에 실패했습니다');
      }

      const data = await response.json();
      console.log('✅ 키워드 응답 설정 저장 완료');
      
      return data;
    } catch (error) {
      console.error('키워드 응답 설정 저장 중 오류:', error);
      throw error;
    }
  }

  /**
   * 키워드 응답 설정 조회
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @returns Promise<KeywordResponse>
   */
  async getKeywordSettings(
    userId: string,
    conversationId: string
  ): Promise<KeywordResponse> {
    try {
      console.log('🔍 키워드 응답 설정 조회:', { userId, conversationId });
      
      const response = await fetch(`${API_BASE_URL}/keywords/response/${userId}/${conversationId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '키워드 응답 설정 조회에 실패했습니다');
      }

      const data = await response.json();
      console.log('✅ 키워드 응답 설정 조회 완료:', data.hasSettings ? '설정 있음' : '설정 없음');
      
      return data;
    } catch (error) {
      console.error('키워드 응답 설정 조회 중 오류:', error);
      throw error;
    }
  }

  /**
   * 기본 키워드 설정 적용
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @param selectedKeywordIds - 선택된 키워드 ID 배열
   * @returns Promise<KeywordResponse>
   */
  async applyDefaultKeywords(
    userId: string,
    conversationId: string,
    selectedKeywordIds: string[]
  ): Promise<KeywordResponse> {
    try {
      console.log('📋 기본 키워드 설정 적용:', { userId, conversationId, selectedKeywordIds });
      
      const selectedKeywords = DEFAULT_KEYWORDS.filter(kw => 
        selectedKeywordIds.includes(kw.id)
      );
      
      if (selectedKeywords.length === 0) {
        throw new Error('선택된 키워드가 없습니다');
      }
      
      return await this.saveKeywordSettings(
        userId,
        conversationId,
        null,
        selectedKeywords,
        'flexible'
      );
    } catch (error) {
      console.error('기본 키워드 설정 적용 중 오류:', error);
      throw error;
    }
  }

  /**
   * 커스텀 키워드 추가
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @param customKeyword - 커스텀 키워드 정의
   * @returns Promise<KeywordResponse>
   */
  async addCustomKeyword(
    userId: string,
    conversationId: string,
    customKeyword: Omit<KeywordDefinition, 'id' | 'priority'>
  ): Promise<KeywordResponse> {
    try {
      console.log('➕ 커스텀 키워드 추가:', { userId, conversationId, keyword: customKeyword.name });
      
      // 기존 설정 조회
      const currentSettings = await this.getKeywordSettings(userId, conversationId);
      const existingKeywords = currentSettings.settings?.keywords || [];
      
      // 새 키워드 생성
      const newKeyword: KeywordDefinition = {
        ...customKeyword,
        id: `kw_custom_${Date.now()}`,
        priority: existingKeywords.length + 1,
        category: customKeyword.category || 'custom'
      };
      
      // 기존 키워드와 합쳐서 저장
      const updatedKeywords = [...existingKeywords, newKeyword];
      
      return await this.saveKeywordSettings(
        userId,
        conversationId,
        currentSettings.settings?.roleId || null,
        updatedKeywords,
        currentSettings.settings?.responseMode || 'flexible'
      );
    } catch (error) {
      console.error('커스텀 키워드 추가 중 오류:', error);
      throw error;
    }
  }

  /**
   * 키워드 우선순위 업데이트
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @param keywordPriorities - 키워드 ID와 우선순위 매핑
   * @returns Promise<KeywordResponse>
   */
  async updateKeywordPriorities(
    userId: string,
    conversationId: string,
    keywordPriorities: { [keywordId: string]: number }
  ): Promise<KeywordResponse> {
    try {
      console.log('🔄 키워드 우선순위 업데이트:', { userId, conversationId });
      
      // 기존 설정 조회
      const currentSettings = await this.getKeywordSettings(userId, conversationId);
      if (!currentSettings.settings) {
        throw new Error('기존 키워드 설정이 없습니다');
      }
      
      // 우선순위 업데이트
      const updatedKeywords = currentSettings.settings.keywords.map(keyword => ({
        ...keyword,
        priority: keywordPriorities[keyword.id] || keyword.priority
      }));
      
      // 우선순위 순으로 정렬
      updatedKeywords.sort((a, b) => a.priority - b.priority);
      
      return await this.saveKeywordSettings(
        userId,
        conversationId,
        currentSettings.settings.roleId || null,
        updatedKeywords,
        currentSettings.settings.responseMode
      );
    } catch (error) {
      console.error('키워드 우선순위 업데이트 중 오류:', error);
      throw error;
    }
  }

  /**
   * 키워드 활성화/비활성화
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @param keywordId - 키워드 ID
   * @param isActive - 활성화 여부
   * @returns Promise<KeywordResponse>
   */
  async toggleKeyword(
    userId: string,
    conversationId: string,
    keywordId: string,
    isActive: boolean
  ): Promise<KeywordResponse> {
    try {
      console.log('🔀 키워드 토글:', { userId, conversationId, keywordId, isActive });
      
      // 기존 설정 조회
      const currentSettings = await this.getKeywordSettings(userId, conversationId);
      if (!currentSettings.settings) {
        throw new Error('기존 키워드 설정이 없습니다');
      }
      
      // 키워드 활성화 상태 업데이트
      const updatedKeywords = currentSettings.settings.keywords.map(keyword =>
        keyword.id === keywordId ? { ...keyword, isActive } : keyword
      );
      
      return await this.saveKeywordSettings(
        userId,
        conversationId,
        currentSettings.settings.roleId || null,
        updatedKeywords,
        currentSettings.settings.responseMode
      );
    } catch (error) {
      console.error('키워드 토글 중 오류:', error);
      throw error;
    }
  }

  /**
   * 응답 모드 변경
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @param responseMode - 새로운 응답 모드
   * @returns Promise<KeywordResponse>
   */
  async changeResponseMode(
    userId: string,
    conversationId: string,
    responseMode: 'strict' | 'flexible' | 'adaptive'
  ): Promise<KeywordResponse> {
    try {
      console.log('🎛️ 응답 모드 변경:', { userId, conversationId, responseMode });
      
      // 기존 설정 조회
      const currentSettings = await this.getKeywordSettings(userId, conversationId);
      if (!currentSettings.settings) {
        throw new Error('기존 키워드 설정이 없습니다');
      }
      
      return await this.saveKeywordSettings(
        userId,
        conversationId,
        currentSettings.settings.roleId || null,
        currentSettings.settings.keywords,
        responseMode
      );
    } catch (error) {
      console.error('응답 모드 변경 중 오류:', error);
      throw error;
    }
  }

  /**
   * 키워드 설정 초기화
   * 
   * @param userId - 사용자 ID
   * @param conversationId - 대화 ID
   * @returns Promise<KeywordResponse>
   */
  async resetKeywordSettings(
    userId: string,
    conversationId: string
  ): Promise<KeywordResponse> {
    try {
      console.log('🔄 키워드 설정 초기화:', { userId, conversationId });
      
      // 기본 키워드로 재설정
      return await this.saveKeywordSettings(
        userId,
        conversationId,
        null,
        DEFAULT_KEYWORDS.filter(kw => kw.isActive),
        'flexible'
      );
    } catch (error) {
      console.error('키워드 설정 초기화 중 오류:', error);
      throw error;
    }
  }

  /**
   * 키워드 기반 프롬프트 생성
   * 
   * @param keywords - 활성 키워드 배열
   * @param responseMode - 응답 모드
   * @returns 키워드 기반 프롬프트 문자열
   */
  generateKeywordPrompt(
    keywords: KeywordDefinition[],
    responseMode: 'strict' | 'flexible' | 'adaptive' = 'flexible'
  ): string {
    const activeKeywords = keywords
      .filter(kw => kw.isActive)
      .sort((a, b) => a.priority - b.priority);
    
    if (activeKeywords.length === 0) {
      return '';
    }
    
    let prompt = '\n\n[KEYWORD RESPONSE SETTINGS]\n';
    
    switch (responseMode) {
      case 'strict':
        prompt += '다음 키워드들을 반드시 모두 적용하여 응답하세요:\n';
        break;
      case 'flexible':
        prompt += '다음 키워드들을 적절히 고려하여 응답하세요:\n';
        break;
      case 'adaptive':
        prompt += '다음 키워드들을 상황에 맞게 선택적으로 적용하여 응답하세요:\n';
        break;
    }
    
    activeKeywords.forEach(keyword => {
      prompt += `- ${keyword.name}: ${keyword.description}\n`;
      if (keyword.detailPrompt) {
        prompt += `  상세 지침: ${keyword.detailPrompt}\n`;
      }
    });
    
    return prompt;
  }
}

// 싱글톤 인스턴스
export const keywordResponseService = new KeywordResponseService();

// 편의 함수들
export const saveKeywordSettings = (
  userId: string,
  conversationId: string | null,
  roleId: string | null,
  keywords: KeywordDefinition[],
  responseMode?: 'strict' | 'flexible' | 'adaptive'
) => keywordResponseService.saveKeywordSettings(userId, conversationId, roleId, keywords, responseMode);

export const getKeywordSettings = (userId: string, conversationId: string) =>
  keywordResponseService.getKeywordSettings(userId, conversationId);

export const applyDefaultKeywords = (userId: string, conversationId: string, selectedKeywordIds: string[]) =>
  keywordResponseService.applyDefaultKeywords(userId, conversationId, selectedKeywordIds);

export const addCustomKeyword = (
  userId: string,
  conversationId: string,
  customKeyword: Omit<KeywordDefinition, 'id' | 'priority'>
) => keywordResponseService.addCustomKeyword(userId, conversationId, customKeyword);
