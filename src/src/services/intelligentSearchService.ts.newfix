/**
 * Intelligent Search Service
 * 
 * AI가 대화 내용을 분석하여 필요한 경우에만 자동으로 소스 검색을 실행하는 서비스
 * 
 * @version 1.0.0
 */

import { dataSourceService, DataSourceResult, DataSourceType } from './dataSourceService';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface SearchDecision {
  shouldSearch: boolean;
  searchQuery?: string;
  relevantSources: DataSourceType[];
  reasoning: string;
}

interface SearchContext {
  userMessage: string;
  conversationHistory: string[];
  currentRole?: string;
  userPreferences?: {
    searchEnabled: boolean;
    preferredSources: DataSourceType[];
    searchFrequency: 'always' | 'auto' | 'never';
  };
}

/**
 * AI 기반 지능형 검색 서비스
 */
export class IntelligentSearchService {
  private readonly AI_DECISION_PROMPTS = {
    SEARCH_ANALYSIS: `
당신은 사용자의 질문을 분석하여 외부 검색이 필요한지 판단하는 AI입니다.

다음 기준으로 검색 필요성을 판단하세요:

**검색이 필요한 경우:**
- 최신 뉴스, 트렌드, 사건에 대한 질문
- 특정 날짜의 사건이나 정보
- 실시간 데이터나 통계
- 특정 인물, 회사, 제품에 대한 최신 정보
- 학술적 정보나 연구 결과
- 기술적 문제 해결이나 튜토리얼
- 여행, 날씨, 레시피 등 실용적 정보

**검색이 불필요한 경우:**
- 일반적인 대화나 인사
- 개인적인 감정이나 의견 표현
- 창의적 글쓰기나 스토리텔링
- 단순한 계산이나 논리적 추론
- 일반적인 상식이나 기본 지식
- 개념 설명이나 정의

응답 형식 (JSON):
{
  "shouldSearch": boolean,
  "searchQuery": "검색에 사용할 키워드",
  "relevantSources": ["web", "news", "blog", "academic"],
  "reasoning": "판단 근거"
}
`,

    SOURCE_SELECTION: `
검색어와 질문 유형에 따라 가장 적절한 데이터 소스를 선택하세요:

**소스별 특징:**
- web: 위키백과, 일반적인 정보, 개념 설명
- news: 최신 뉴스, 사건, 트렌드
- blog: 개인 경험, 리뷰, 팁
- academic: 학술 논문, 연구 자료
- business: 경제, 금융, 기업 정보
- culture: 영화, 음악, 예술, 엔터테인먼트
- lifestyle: 여행, 음식, 건강, 라이프스타일

우선순위에 따라 최대 3개까지 선택하세요.
`
  };

  /**
   * AI가 검색 필요성을 판단
   */
  async decideSearchNeed(context: SearchContext): Promise<SearchDecision> {
    try {
      console.log('🤖 AI 검색 판단 시작:', {
        message: context.userMessage.substring(0, 100) + '...',
        historyLength: context.conversationHistory.length,
        role: context.currentRole
      });

      // 사용자 설정 확인
      if (context.userPreferences?.searchFrequency === 'never') {
        return {
          shouldSearch: false,
          relevantSources: [],
          reasoning: '사용자가 검색을 비활성화했습니다.'
        };
      }

      if (context.userPreferences?.searchFrequency === 'always') {
        return {
          shouldSearch: true,
          searchQuery: this.extractSearchQuery(context.userMessage),
          relevantSources: context.userPreferences.preferredSources || ['web', 'news'],
          reasoning: '사용자가 항상 검색을 활성화했습니다.'
        };
      }

      // AI 판단 요청
      const analysisPrompt = `
${this.AI_DECISION_PROMPTS.SEARCH_ANALYSIS}

**분석할 질문:** "${context.userMessage}"

**대화 맥락:** ${context.conversationHistory.slice(-3).join(' → ')}

**현재 역할:** ${context.currentRole || '일반 AI'}

위 정보를 바탕으로 검색 필요성을 판단하고 JSON으로 응답하세요.
`;

      const decision = await this.queryAI(analysisPrompt);
      
      console.log('🎯 AI 검색 판단 결과:', decision);
      
      return decision;

    } catch (error) {
      console.error('AI 검색 판단 실패:', error);
      
      // 폴백: 간단한 키워드 기반 판단
      const fallbackDecision = this.fallbackSearchDecision(context.userMessage);
      console.log('🔄 폴백 검색 판단:', fallbackDecision);
      
      return fallbackDecision;
    }
  }

  /**
   * 지능형 검색 실행
   */
  async intelligentSearch(context: SearchContext): Promise<{
    searchResults: DataSourceResult[];
    searchDecision: SearchDecision;
    searchSummary?: string;
  }> {
    console.log('🔍🤖 지능형 검색 시작');

    // 1. AI가 검색 필요성 판단
    const searchDecision = await this.decideSearchNeed(context);

    if (!searchDecision.shouldSearch) {
      return {
        searchResults: [],
        searchDecision,
      };
    }

    try {
      // 2. 검색 실행
      const searchQuery = searchDecision.searchQuery || this.extractSearchQuery(context.userMessage);
      const sources: Record<DataSourceType, any> = {};

      searchDecision.relevantSources.forEach(sourceType => {
        sources[sourceType] = {
          enabled: true,
          priority: this.getSourcePriority(sourceType),
          maxResults: 3
        };
      });

      console.log('🔍 지능형 검색 실행:', {
        query: searchQuery,
        sources: searchDecision.relevantSources
      });

      const searchResults = await dataSourceService.search(searchQuery, {
        sources,
        language: this.detectLanguage(context.userMessage),
        maxTotalResults: 8,
        timeout: 8000
      });

      // 3. 검색 결과 요약 생성
      let searchSummary = undefined;
      if (searchResults.length > 0) {
        searchSummary = await this.generateSearchSummary(searchQuery, searchResults);
      }

      console.log('✅ 지능형 검색 완료:', {
        resultsCount: searchResults.length,
        hasSummary: !!searchSummary
      });

      return {
        searchResults,
        searchDecision,
        searchSummary
      };

    } catch (error) {
      console.error('지능형 검색 실행 실패:', error);
      return {
        searchResults: [],
        searchDecision: {
          ...searchDecision,
          reasoning: `검색 실행 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        }
      };
    }
  }

  /**
   * AI에게 질의
   */
  private async queryAI(prompt: string): Promise<SearchDecision> {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e3d1d00c/ai/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: {
          id: 'search-analyzer',
          name: '검색 분석기',
          prompt: '당신은 검색 필요성을 판단하는 AI입니다. JSON 형식으로 정확하게 응답하세요.',
          temperature: 0.3,
          maxOutputTokens: 1024,
          safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
          keywordIds: []
        },
        history: [],
        newUserParts: [{ text: prompt }],
        project: null,
        masterKeywords: []
      })
    });

    if (!response.ok) {
      throw new Error(`AI 응답 실패: ${response.status}`);
    }

    // 스트리밍 응답 처리
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('응답 스트림을 읽을 수 없습니다');
    }

    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          if (data && data !== '[DONE]') {
            try {
              const text = JSON.parse(data);
              fullResponse += text;
            } catch (e) {
              // JSON 파싱 실패 시 무시
            }
          }
        }
      }
    }

    // JSON 응답 파싱 시도
    try {
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('AI 응답 JSON 파싱 실패:', fullResponse);
    }

    // JSON 파싱 실패 시 폴백
    return this.fallbackSearchDecision(fullResponse);
  }

  /**
   * 폴백 검색 판단 (키워드 기반)
   */
  private fallbackSearchDecision(message: string): SearchDecision {
    const lowerMessage = message.toLowerCase();
    
    // 검색이 필요한 키워드들
    const newsKeywords = ['뉴스', '사건', '최신', '오늘', '어제', '현재', '트렌드', 'news', 'breaking', 'latest'];
    const factKeywords = ['사실', '정보', '데이터', '통계', '연구', '조사', '발표', 'facts', 'data', 'research'];
    const howtoKeywords = ['방법', '어떻게', '튜토리얼', '가이드', 'how to', 'tutorial', 'guide'];
    const searchKeywords = ['찾아줘', '검색', '알려줘', '알아봐', 'search', 'find', 'look up'];

    const hasNewsKeywords = newsKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasFactKeywords = factKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasHowtoKeywords = howtoKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasSearchKeywords = searchKeywords.some(keyword => lowerMessage.includes(keyword));

    if (hasNewsKeywords || hasFactKeywords || hasHowtoKeywords || hasSearchKeywords) {
      const sources: DataSourceType[] = [];
      
      if (hasNewsKeywords) sources.push('news');
      if (hasFactKeywords) sources.push('web', 'academic');
      if (hasHowtoKeywords) sources.push('web', 'blog');
      if (hasSearchKeywords && sources.length === 0) sources.push('web');

      return {
        shouldSearch: true,
        searchQuery: this.extractSearchQuery(message),
        relevantSources: sources.length > 0 ? sources : ['web'],
        reasoning: '키워드 기반 폴백 판단: 검색이 필요한 키워드 감지됨'
      };
    }

    return {
      shouldSearch: false,
      relevantSources: [],
      reasoning: '키워드 기반 폴백 판단: 검색 불필요'
    };
  }

  /**
   * 메시지에서 검색어 추출
   */
  private extractSearchQuery(message: string): string {
    // 질문 형식 제거
    let query = message
      .replace(/^(어떻게|어떤|언제|왜|무엇|누가|어디서|얼마나)\s+/i, '')
      .replace(/\?+$/g, '')
      .replace(/해줘|알려줘|찾아줘|검색해줘$/i, '')
      .trim();

    // 불용어 제거 (간단버전)
    const stopWords = ['그런데', '그래서', '그리고', '하지만', '근데', '그냥', '좀', '잘', '많이'];
    stopWords.forEach(word => {
      query = query.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
    });

    return query.trim() || message.trim();
  }

  /**
   * 언어 감지
   */
  private detectLanguage(text: string): string {
    const koreanChars = text.match(/[가-힣]/g);
    const englishChars = text.match(/[a-zA-Z]/g);
    
    if (koreanChars && koreanChars.length > (englishChars?.length || 0)) {
      return 'ko';
    } else if (englishChars && englishChars.length > 0) {
      return 'en';
    }
    
    return 'auto';
  }

  /**
   * 소스별 우선순위
   */
  private getSourcePriority(sourceType: DataSourceType): number {
    const priorities = {
      news: 9,
      web: 8,
      academic: 7,
      blog: 6,
      business: 5,
      culture: 4,
      lifestyle: 3
    };
    
    return priorities[sourceType] || 1;
  }

  /**
   * 검색 결과 요약 생성
   */
  private async generateSearchSummary(query: string, results: DataSourceResult[]): Promise<string> {
    try {
      const sourcesInfo = results.slice(0, 5).map(result => 
        `${result.title}: ${result.summary}`
      ).join('\n\n');

      const summaryPrompt = `다음 검색 결과들을 바탕으로 "${query}"에 대한 간결하고 정확한 요약을 2-3문장으로 작성하세요:

${sourcesInfo}

요약 시 다음 사항을 지켜주세요:
- 핵심 정보만 간략하게
- 출처는 명시하지 말고 내용에 집중
- 객관적이고 중립적인 톤`;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e3d1d00c/ai/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: {
            id: 'summarizer',
            name: '요약기',
            prompt: '당신은 검색 결과를 요약하는 AI입니다. 간결하고 정확한 요약을 제공하세요.',
            temperature: 0.3,
            maxOutputTokens: 512,
            safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
            keywordIds: []
          },
          history: [],
          newUserParts: [{ text: summaryPrompt }],
          project: null,
          masterKeywords: []
        })
      });

      if (!response.ok) {
        throw new Error(`요약 생성 실패: ${response.status}`);
      }

      // 스트리밍 응답 처리
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('요약 응답 스트림을 읽을 수 없습니다');
      }

      const decoder = new TextDecoder();
      let summary = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data && data !== '[DONE]') {
              try {
                const text = JSON.parse(data);
                summary += text;
              } catch (e) {
                // JSON 파싱 실패 시 무시
              }
            }
          }
        }
      }

      return summary.trim();

    } catch (error) {
      console.warn('검색 결과 요약 생성 실패:', error);
      return `"${query}"에 대한 ${results.length}개의 관련 정보를 찾았습니다.`;
    }
  }
}

// 싱글톤 인스턴스
export const intelligentSearchService = new IntelligentSearchService();

// 편의 함수
export const performIntelligentSearch = async (
  userMessage: string,
  conversationHistory: string[] = [],
  currentRole?: string,
  userPreferences?: {
    searchEnabled: boolean;
    preferredSources: DataSourceType[];
    searchFrequency: 'always' | 'auto' | 'never';
  }
) => {
  return intelligentSearchService.intelligentSearch({
    userMessage,
    conversationHistory,
    currentRole,
    userPreferences
  });
};