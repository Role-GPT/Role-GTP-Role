/**
 * AI 도구 자동 사용 서비스
 * 
 * AI 응답 중에 필요한 도구들을 자동으로 감지하고 호출하는 시스템
 * - 차트 생성 자동 트리거
 * - 검색 엔진 자동 호출
 * - 학술 논문 검색
 * - 실시간 데이터 조회
 * 
 * @author Role GPT Team
 * @version 1.0.0
 */

import { chartService } from './chartService';
import { wikipediaService } from './wikipediaService';
import { naverService } from './naverService';
import { pubmedService } from './pubmedService';
import { ChartUsageManager } from '../utils/chartUsageManager';

// AI 도구 호출 결과 타입
export interface AIToolResult {
  type: 'chart' | 'search' | 'weather' | 'news' | 'academic';
  success: boolean;
  data?: any;
  error?: string;
  insertPosition?: number; // 응답에서 삽입할 위치
}

// 도구 감지 패턴
export interface ToolDetectionPattern {
  keywords: string[];
  type: 'chart' | 'search' | 'weather' | 'news' | 'academic';
  confidence: number;
  action: string;
}

/**
 * AI 도구 자동 사용 서비스 클래스
 */
export class AIToolsService {
  
  // 도구 감지 패턴 정의
  private static readonly DETECTION_PATTERNS: ToolDetectionPattern[] = [
    // 차트 생성 패턴
    {
      keywords: ['차트', '그래프', '시각화', '데이터 분석', '통계', '트렌드 비교', '검색량', '추이'],
      type: 'chart',
      confidence: 0.8,
      action: 'generateChart'
    },
    {
      keywords: ['chart', 'graph', 'visualization', 'trend', 'comparison', 'statistics'],
      type: 'chart', 
      confidence: 0.8,
      action: 'generateChart'
    },
    
    // 검색 패턴
    {
      keywords: ['검색', '찾아', '알아봐', '정보', '자료', '최신', '뉴스'],
      type: 'search',
      confidence: 0.7,
      action: 'search'
    },
    {
      keywords: ['search', 'find', 'lookup', 'information', 'recent', 'latest'],
      type: 'search',
      confidence: 0.7,
      action: 'search'
    },
    
    // 학술 논문 패턴
    {
      keywords: ['논문', '연구', '학술', '연구결과', '연구자료', '학회', '저널'],
      type: 'academic',
      confidence: 0.9,
      action: 'searchAcademic'
    },
    {
      keywords: ['paper', 'research', 'study', 'academic', 'journal', 'publication'],
      type: 'academic',
      confidence: 0.9,
      action: 'searchAcademic'
    },
    
    // 뉴스 패턴
    {
      keywords: ['뉴스', '최근 소식', '현재 상황', '최신 동향', '사건', '이슈'],
      type: 'news',
      confidence: 0.8,
      action: 'searchNews'
    },
    {
      keywords: ['news', 'recent events', 'latest', 'breaking', 'current'],
      type: 'news',
      confidence: 0.8,
      action: 'searchNews'
    }
  ];

  /**
   * 사용자 메시지에서 필요한 도구들을 감지
   */
  static detectRequiredTools(userMessage: string): ToolDetectionPattern[] {
    const detectedTools: ToolDetectionPattern[] = [];
    const lowerMessage = userMessage.toLowerCase();
    
    for (const pattern of this.DETECTION_PATTERNS) {
      let matchCount = 0;
      let totalKeywords = pattern.keywords.length;
      
      // 키워드 매칭 검사
      for (const keyword of pattern.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          matchCount++;
        }
      }
      
      // 신뢰도 계산
      const actualConfidence = (matchCount / totalKeywords) * pattern.confidence;
      
      // 최소 신뢰도 임계값 (0.3)을 넘으면 감지됨
      if (actualConfidence >= 0.3) {
        detectedTools.push({
          ...pattern,
          confidence: actualConfidence
        });
      }
    }
    
    // 신뢰도 순으로 정렬
    return detectedTools.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 차트 생성 도구 실행
   */
  static async executeChartTool(userMessage: string): Promise<AIToolResult> {
    try {
      // 일일 사용량 체크
      if (!ChartUsageManager.canGenerateChart()) {
        return {
          type: 'chart',
          success: false,
          error: ChartUsageManager.getLimitExceededMessage()
        };
      }

      // 메시지에서 검색어 추출
      const keywords = this.extractKeywordsFromMessage(userMessage);
      
      if (keywords.length === 0) {
        return {
          type: 'chart',
          success: false,
          error: '차트 생성을 위한 키워드를 찾을 수 없습니다.'
        };
      }

      console.log('🔄 AI 자동 차트 생성:', { keywords, userMessage: userMessage.substring(0, 100) });

      // 네이버 데이터랩 기반 트렌드 차트 생성
      const chartResult = await chartService.generateTrendComparison(keywords.slice(0, 5), 12);
      
      // 사용량 증가
      ChartUsageManager.incrementUsage();
      
      return {
        type: 'chart',
        success: true,
        data: {
          chartUrl: chartResult.chartUrl,
          summary: chartResult.summary,
          keywords: keywords
        }
      };

    } catch (error) {
      console.error('AI 차트 생성 실패:', error);
      return {
        type: 'chart',
        success: false,
        error: error instanceof Error ? error.message : '차트 생성 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 검색 도구 실행
   */
  static async executeSearchTool(userMessage: string): Promise<AIToolResult> {
    try {
      // 검색어 추출
      const query = this.extractSearchQuery(userMessage);
      
      if (!query) {
        return {
          type: 'search',
          success: false,
          error: '검색어를 찾을 수 없습니다.'
        };
      }

      console.log('🔍 AI 자동 검색:', { query });

      // Wikipedia 검색 우선 실행 (빠르고 신뢰성 높음)
      const wikiResult = await wikipediaService.searchWikipedia(query);
      
      if (wikiResult.success && wikiResult.results.length > 0) {
        return {
          type: 'search',
          success: true,
          data: {
            source: 'Wikipedia',
            results: wikiResult.results.slice(0, 3), // 상위 3개 결과만
            query: query
          }
        };
      }

      // Wikipedia에서 결과가 없으면 네이버 검색
      const naverResult = await naverService.searchBlog(query, 3);
      
      return {
        type: 'search',
        success: true,
        data: {
          source: 'Naver',
          results: naverResult.items || [],
          query: query
        }
      };

    } catch (error) {
      console.error('AI 검색 실패:', error);
      return {
        type: 'search',
        success: false,
        error: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 학술 논문 검색 도구 실행
   */
  static async executeAcademicTool(userMessage: string): Promise<AIToolResult> {
    try {
      const query = this.extractSearchQuery(userMessage);
      
      if (!query) {
        return {
          type: 'academic',
          success: false,
          error: '검색어를 찾을 수 없습니다.'
        };
      }

      console.log('📚 AI 자동 학술 검색:', { query });

      // PubMed에서 의학/생물학 관련 논문 검색
      const pubmedResult = await pubmedService.searchPapers(query, 5);
      
      return {
        type: 'academic',
        success: true,
        data: {
          source: 'PubMed',
          results: pubmedResult.papers || [],
          query: query,
          totalCount: pubmedResult.totalCount || 0
        }
      };

    } catch (error) {
      console.error('AI 학술 검색 실패:', error);
      return {
        type: 'academic',
        success: false,
        error: error instanceof Error ? error.message : '학술 검색 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 뉴스 검색 도구 실행
   */
  static async executeNewsTool(userMessage: string): Promise<AIToolResult> {
    try {
      const query = this.extractSearchQuery(userMessage);
      
      if (!query) {
        return {
          type: 'news',
          success: false,
          error: '검색어를 찾을 수 없습니다.'
        };
      }

      console.log('📰 AI 자동 뉴스 검색:', { query });

      // 네이버 뉴스 검색
      const newsResult = await naverService.searchNews(query, 5);
      
      return {
        type: 'news',
        success: true,
        data: {
          source: 'Naver News',
          results: newsResult.items || [],
          query: query,
          totalCount: newsResult.total || 0
        }
      };

    } catch (error) {
      console.error('AI 뉴스 검색 실패:', error);
      return {
        type: 'news',
        success: false,
        error: error instanceof Error ? error.message : '뉴스 검색 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 모든 감지된 도구들을 순차적으로 실행
   */
  static async executeDetectedTools(userMessage: string): Promise<AIToolResult[]> {
    const detectedTools = this.detectRequiredTools(userMessage);
    const results: AIToolResult[] = [];

    console.log('🤖 AI 도구 자동 실행:', {
      message: userMessage.substring(0, 100),
      detectedCount: detectedTools.length,
      tools: detectedTools.map(t => ({ type: t.type, confidence: t.confidence }))
    });

    // 감지된 도구들을 신뢰도 순으로 실행 (최대 2개까지)
    for (const tool of detectedTools.slice(0, 2)) {
      let result: AIToolResult;

      try {
        switch (tool.type) {
          case 'chart':
            result = await this.executeChartTool(userMessage);
            break;
          case 'search':
            result = await this.executeSearchTool(userMessage);
            break;
          case 'academic':
            result = await this.executeAcademicTool(userMessage);
            break;
          case 'news':
            result = await this.executeNewsTool(userMessage);
            break;
          default:
            continue;
        }

        results.push(result);
        
        // 성공한 경우 로그 출력
        if (result.success) {
          console.log(`✅ ${tool.type} 도구 실행 성공`);
        }

      } catch (error) {
        console.error(`❌ ${tool.type} 도구 실행 실패:`, error);
        results.push({
          type: tool.type,
          success: false,
          error: error instanceof Error ? error.message : '도구 실행 중 오류가 발생했습니다.'
        });
      }
    }

    return results;
  }

  /**
   * 메시지에서 키워드 추출
   */
  private static extractKeywordsFromMessage(message: string): string[] {
    // 간단한 키워드 추출 로직
    const commonWords = ['의', '을', '를', '이', '가', '에', '는', '은', '과', '와', '로', '으로', '부터', '까지', '에서', '에게', 
                        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by'];
    
    const words = message
      .replace(/[^\w\s가-힣]/g, ' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 1 && !commonWords.includes(word));
    
    // 중복 제거 및 길이 제한
    return [...new Set(words)].slice(0, 5);
  }

  /**
   * 메시지에서 검색 쿼리 추출
   */
  private static extractSearchQuery(message: string): string | null {
    // 검색 관련 패턴 매칭
    const searchPatterns = [
      /검색해줘?\s*(.+?)([.!?]|$)/i,
      /찾아봐?\s*(.+?)([.!?]|$)/i,
      /알아봐?\s*(.+?)([.!?]|$)/i,
      /search\s+(.+?)([.!?]|$)/i,
      /find\s+(.+?)([.!?]|$)/i,
      /에 대해/i,
      /about\s+(.+?)([.!?]|$)/i
    ];

    for (const pattern of searchPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // 패턴이 매칭되지 않으면 전체 메시지에서 키워드 추출
    const keywords = this.extractKeywordsFromMessage(message);
    return keywords.length > 0 ? keywords.slice(0, 3).join(' ') : null;
  }

  /**
   * 도구 결과를 텍스트로 포매팅
   */
  static formatToolResult(result: AIToolResult): string {
    if (!result.success) {
      return `\n\n❌ **${result.type} 도구 오류**: ${result.error}\n`;
    }

    switch (result.type) {
      case 'chart':
        return `\n\n📊 **검색 트렌드 차트**\n![트렌드 차트](${result.data.chartUrl})\n\n**분석 키워드**: ${result.data.keywords.join(', ')}\n**기간**: ${result.data.summary?.period || '최근 12개월'}\n\n`;
        
      case 'search':
        const searchResults = result.data.results.slice(0, 3);
        let searchText = `\n\n🔍 **${result.data.source} 검색 결과** (검색어: ${result.data.query})\n\n`;
        
        searchResults.forEach((item: any, index: number) => {
          if (result.data.source === 'Wikipedia') {
            searchText += `${index + 1}. **${item.title}**\n   ${item.summary}\n   [더 보기](${item.url})\n\n`;
          } else {
            searchText += `${index + 1}. **${item.title?.replace(/<[^>]*>/g, '') || 'Untitled'}**\n   ${(item.description || item.snippet || '').replace(/<[^>]*>/g, '').substring(0, 150)}...\n   [링크](${item.link})\n\n`;
          }
        });
        
        return searchText;
        
      case 'academic':
        const papers = result.data.results.slice(0, 3);
        let academicText = `\n\n📚 **학술 논문 검색** (PubMed, 검색어: ${result.data.query})\n총 ${result.data.totalCount}개 논문 발견\n\n`;
        
        papers.forEach((paper: any, index: number) => {
          academicText += `${index + 1}. **${paper.title}**\n   저자: ${paper.authors}\n   발행: ${paper.journal} (${paper.year})\n   [PubMed](${paper.url})\n\n`;
        });
        
        return academicText;
        
      case 'news':
        const news = result.data.results.slice(0, 3);
        let newsText = `\n\n📰 **뉴스 검색** (검색어: ${result.data.query})\n\n`;
        
        news.forEach((item: any, index: number) => {
          newsText += `${index + 1}. **${item.title?.replace(/<[^>]*>/g, '') || 'Untitled'}**\n   ${(item.description || '').replace(/<[^>]*>/g, '').substring(0, 150)}...\n   발행: ${item.pubDate}\n   [뉴스 보기](${item.link})\n\n`;
        });
        
        return newsText;
        
      default:
        return `\n\n✅ **${result.type} 도구 실행 완료**\n`;
    }
  }

  /**
   * 디버그 정보 출력
   */
  static debugInfo(): void {
    console.group('🔧 AI Tools Service Debug Info');
    console.log('지원 도구 타입:', ['chart', 'search', 'academic', 'news', 'weather']);
    console.log('감지 패턴 수:', this.DETECTION_PATTERNS.length);
    console.log('차트 사용 가능:', ChartUsageManager.canGenerateChart());
    console.log('차트 사용 현황:', ChartUsageManager.getUsageInfo());
    console.groupEnd();
  }
}

// 편의 함수들
export const detectTools = (message: string) => AIToolsService.detectRequiredTools(message);
export const executeTools = (message: string) => AIToolsService.executeDetectedTools(message);
export const formatResult = (result: AIToolResult) => AIToolsService.formatToolResult(result);

export default AIToolsService;