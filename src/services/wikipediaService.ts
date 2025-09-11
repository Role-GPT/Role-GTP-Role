/**
 * Wikipedia REST API Service
 * 
 * Wikimedia REST API를 활용한 위키백과 검색 및 요약 서비스
 * - 다국어 지원 (한국어, 영어 등)
 * - 검색, 요약, 본문 가져오기 기능
 * - 초당 200요청 제한 고려한 Rate Limiting
 * 
 * @see https://www.mediawiki.org/wiki/API:REST_API
 */

interface WikipediaSearchResult {
  id: number;
  key: string;
  title: string;
  excerpt: string;
  matched_title?: string;
  description?: string;
  thumbnail?: {
    mimetype: string;
    size?: number;
    width: number;
    height: number;
    duration?: number;
    url: string;
  };
}

interface WikipediaSearchResponse {
  pages: WikipediaSearchResult[];
}

interface WikipediaSummary {
  type: string;
  title: string;
  displaytitle: string;
  namespace: {
    id: number;
    text: string;
  };
  wikibase_item: string;
  titles: {
    canonical: string;
    normalized: string;
    display: string;
  };
  pageid: number;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  lang: string;
  dir: string;
  revision: string;
  tid: string;
  timestamp: string;
  description?: string;
  description_source?: string;
  content_urls: {
    desktop: {
      page: string;
      revisions: string;
      edit: string;
      talk: string;
    };
    mobile: {
      page: string;
      revisions: string;
      edit: string;
      talk: string;
    };
  };
  extract: string;
  extract_html: string;
}

interface WikipediaContent {
  title: string;
  extract: string;
  thumbnail?: string;
  url: string;
  language: string;
}

interface WikipediaError {
  type: string;
  title: string;
  method: string;
  detail: string;
  uri: string;
}

/**
 * 위키백과 API 클라이언트
 */
export class WikipediaService {
  private readonly baseUrl = 'wikipedia.org/w/rest.php/v1';
  private readonly userAgent = 'RoleGPT/1.0 (https://rolegpt.ai; contact@rolegpt.ai)';
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly rateLimit = 200; // 초당 최대 요청 수
  
  /**
   * Rate limiting을 위한 요청 제한 체크
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    
    // 1초가 지났으면 카운터 리셋
    if (now - this.lastRequestTime >= 1000) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }
    
    // 요청 한도 초과시 대기
    if (this.requestCount >= this.rateLimit) {
      const waitTime = 1000 - (now - this.lastRequestTime);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.requestCount = 0;
        this.lastRequestTime = Date.now();
      }
    }
    
    this.requestCount++;
  }

  /**
   * HTTP 요청 실행
   */
  private async makeRequest<T>(url: string): Promise<T> {
    await this.checkRateLimit();
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        type: 'network_error',
        title: 'Network Error',
        detail: `HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(`Wikipedia API Error: ${errorData.detail || response.statusText}`);
    }

    return response.json();
  }

  /**
   * 위키백과에서 키워드 검색
   * 
   * @param query 검색어
   * @param language 언어 코드 (ko, en 등)
   * @param limit 결과 개수 (기본 5개)
   * @returns 검색 결과 리스트
   */
  async search(
    query: string, 
    language: string = 'ko', 
    limit: number = 5
  ): Promise<WikipediaContent[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://${language}.${this.baseUrl}/search/title?q=${encodedQuery}&limit=${limit}`;
      
      console.log('🔍 위키백과 검색:', { query, language, limit, url });
      
      const response = await this.makeRequest<WikipediaSearchResponse>(url);
      
      const results = await Promise.all(
        response.pages.map(async (page) => {
          try {
            // 각 검색 결과에 대해 요약 정보 가져오기
            const summary = await this.getSummary(page.key, language);
            return {
              title: page.title,
              extract: summary.extract || page.excerpt || '',
              thumbnail: summary.thumbnail?.source || page.thumbnail?.url,
              url: summary.content_urls.desktop.page,
              language
            };
          } catch (error) {
            console.warn(`요약 가져오기 실패 (${page.title}):`, error);
            return {
              title: page.title,
              extract: page.excerpt || '',
              thumbnail: page.thumbnail?.url,
              url: `https://${language}.wikipedia.org/wiki/${encodeURIComponent(page.key)}`,
              language
            };
          }
        })
      );
      
      console.log('✅ 위키백과 검색 완료:', results.length, '개 결과');
      return results;
      
    } catch (error) {
      console.error('위키백과 검색 실패:', error);
      throw new Error(`위키백과 검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 특정 문서의 요약 정보 가져오기
   * 
   * @param title 문서 제목
   * @param language 언어 코드
   * @returns 문서 요약
   */
  async getSummary(title: string, language: string = 'ko'): Promise<WikipediaSummary> {
    try {
      const encodedTitle = encodeURIComponent(title);
      const url = `https://${language}.${this.baseUrl}/page/${encodedTitle}/summary`;
      
      console.log('📄 위키백과 요약 가져오기:', { title, language, url });
      
      const summary = await this.makeRequest<WikipediaSummary>(url);
      
      console.log('✅ 위키백과 요약 완료:', summary.title);
      return summary;
      
    } catch (error) {
      console.error('위키백과 요약 가져오기 실패:', error);
      throw new Error(`위키백과 요약을 가져오는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 특정 문서의 전체 HTML 콘텐츠 가져오기
   * 
   * @param title 문서 제목
   * @param language 언어 코드
   * @returns HTML 콘텐츠
   */
  async getHTML(title: string, language: string = 'ko'): Promise<string> {
    try {
      const encodedTitle = encodeURIComponent(title);
      const url = `https://${language}.${this.baseUrl}/page/${encodedTitle}/html`;
      
      console.log('🌐 위키백과 HTML 가져오기:', { title, language, url });
      
      await this.checkRateLimit();
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      console.log('✅ 위키백과 HTML 완료');
      return html;
      
    } catch (error) {
      console.error('위키백과 HTML 가져오기 실패:', error);
      throw new Error(`위키백과 HTML을 가져오는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 다국어 검색 (한국어 + 영어 동시 검색)
   * 
   * @param query 검색어
   * @param limit 각 언어별 결과 개수
   * @returns 통합 검색 결과
   */
  async multiLanguageSearch(query: string, limit: number = 3): Promise<WikipediaContent[]> {
    try {
      console.log('🌍 다국어 위키백과 검색:', { query, limit });
      
      const [koreanResults, englishResults] = await Promise.all([
        this.search(query, 'ko', limit).catch(error => {
          console.warn('한국어 위키백과 검색 실패:', error);
          return [];
        }),
        this.search(query, 'en', limit).catch(error => {
          console.warn('영어 위키백과 검색 실패:', error);
          return [];
        })
      ]);

      // 중복 제거 (제목 기준)
      const allResults = [...koreanResults, ...englishResults];
      const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.title.toLowerCase() === result.title.toLowerCase())
      );

      console.log('✅ 다국어 검색 완료:', {
        korean: koreanResults.length,
        english: englishResults.length,
        unique: uniqueResults.length
      });

      return uniqueResults.slice(0, limit * 2); // 전체 결과 제한
      
    } catch (error) {
      console.error('다국어 위키백과 검색 실패:', error);
      throw new Error(`다국어 위키백과 검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 검색어 제안 (자동완성)
   * 
   * @param query 부분 검색어
   * @param language 언어 코드
   * @returns 제안 키워드 리스트
   */
  async getSuggestions(query: string, language: string = 'ko'): Promise<string[]> {
    try {
      // 검색 결과에서 제목만 추출하여 제안으로 사용
      const results = await this.search(query, language, 10);
      return results.map(result => result.title);
      
    } catch (error) {
      console.error('위키백과 제안 가져오기 실패:', error);
      return [];
    }
  }

  /**
   * 랜덤 문서 가져오기 (둘러보기용)
   * 
   * @param language 언어 코드
   * @returns 랜덤 문서 정보
   */
  async getRandomArticle(language: string = 'ko'): Promise<WikipediaContent | null> {
    try {
      // 인기 주제들 중에서 랜덤 선택
      const popularTopics = [
        '인공지능', '기계학습', '프로그래밍', '과학', '역사', '문화', '예술', '음악', '영화', '책',
        '여행', '요리', '건강', '운동', '자연', '환경', '기술', '철학', '경제', '정치'
      ];
      
      const randomTopic = popularTopics[Math.floor(Math.random() * popularTopics.length)];
      const results = await this.search(randomTopic, language, 1);
      
      return results.length > 0 ? results[0] : null;
      
    } catch (error) {
      console.error('랜덤 위키백과 문서 가져오기 실패:', error);
      return null;
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const wikipediaService = new WikipediaService();

/**
 * 편의 함수들
 */
export const searchWikipedia = (query: string, language?: string, limit?: number) => 
  wikipediaService.search(query, language, limit);

export const getWikipediaSummary = (title: string, language?: string) => 
  wikipediaService.getSummary(title, language);

export const searchWikipediaMultiLang = (query: string, limit?: number) => 
  wikipediaService.multiLanguageSearch(query, limit);
