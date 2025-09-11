/**
 * PubMed E-utilities Service - 의학/생명과학 논문 검색
 * 
 * NCBI PubMed 데이터베이스 검색을 위한 E-utilities API
 * - 의학, 생명과학, 바이오메디컬 논문 검색
 * - 키 없는 무료 API (속도 제한 있음)
 * - 검색, 요약, 원문 메타데이터 제공
 * 
 * @docs https://www.ncbi.nlm.nih.gov/books/NBK25497/
 */

export interface PubMedSearchConfig {
  email?: string; // 권장사항: 이메일 제공 시 더 높은 속도 제한
  tool?: string;  // 애플리케이션 이름
}

export interface PubMedSearchResult {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pubDate: string;
  doi?: string;
  pmc?: string;
  abstract?: string;
  url: string;
  citationCount?: number;
  meshTerms?: string[];
}

export interface PubMedSearchResponse {
  count: number;
  retmax: number;
  retstart: number;
  querykey?: string;
  webenv?: string;
  idlist: string[];
  translationset?: any[];
  translationstack?: any[];
  querytranslation?: string;
}

export interface PubMedSummaryResponse {
  result: {
    uids: string[];
    [pmid: string]: {
      uid: string;
      pubdate: string;
      epubdate: string;
      source: string;
      authors: Array<{
        name: string;
        authtype: string;
        clusterid: string;
      }>;
      title: string;
      sorttitle: string;
      volume: string;
      issue: string;
      pages: string;
      lang: string[];
      nlmuniqueid: string;
      issn: string;
      essn: string;
      pubtype: string[];
      recordstatus: string;
      pubstatus: string;
      articleids: Array<{
        idtype: string;
        idtypen: number;
        value: string;
      }>;
      history: Array<{
        pubstatus: string;
        date: string;
      }>;
      references: any[];
      attributes: string[];
      pmcrefcount: number;
      fulljournalname: string;
      elocationid: string;
      doctype: string;
      srccontriblist: string[];
      booktitle: string;
      medium: string;
      edition: string;
      publisherlocation: string;
      publishername: string;
      srcdate: string;
      reportnumber: string;
      availablefromurl: string;
      locationlabel: string;
      doccontriblist: string[];
      docdate: string;
      bookname: string;
      chapter: string;
      sortpubdate: string;
      sortfirstauthor: string;
      vernaculartitle: string;
    };
  };
}

/**
 * PubMed 검색 실행
 * @param query 검색 쿼리
 * @param config 설정 옵션
 * @param options 검색 옵션
 */
export async function searchPubMed(
  query: string,
  config: PubMedSearchConfig = {},
  options: {
    retmax?: number;
    retstart?: number;
    field?: string;
    reldate?: number; // 최근 N일 이내
    mindate?: string; // YYYY/MM/DD 형식
    maxdate?: string; // YYYY/MM/DD 형식
    datetype?: 'pdat' | 'edat' | 'mdat'; // 날짜 타입
    usehistory?: boolean;
  } = {}
): Promise<PubMedSearchResponse> {
  try {
    const {
      retmax = 20,
      retstart = 0,
      field = 'all',
      reldate,
      mindate,
      maxdate,
      datetype = 'pdat',
      usehistory = false
    } = options;

    const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
    
    const params = new URLSearchParams({
      db: 'pubmed',
      term: query,
      retmode: 'json',
      retmax: retmax.toString(),
      retstart: retstart.toString(),
      field: field,
      datetype: datetype
    });

    if (config.email) {
      params.append('email', config.email);
    }

    if (config.tool) {
      params.append('tool', config.tool);
    }

    if (reldate) {
      params.append('reldate', reldate.toString());
    }

    if (mindate) {
      params.append('mindate', mindate);
    }

    if (maxdate) {
      params.append('maxdate', maxdate);
    }

    if (usehistory) {
      params.append('usehistory', 'y');
    }

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': config.tool || 'RoleGPT-Search/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`PubMed 검색 API 오류 (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.esearchresult.ERROR) {
      throw new Error(`PubMed 검색 오류: ${data.esearchresult.ERROR}`);
    }

    return data.esearchresult;

  } catch (error) {
    console.error('PubMed 검색 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `PubMed 검색 실패: ${error.message}`
        : 'PubMed 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * PubMed 논문 요약 정보 가져오기
 * @param pmids PMID 목록
 * @param config 설정 옵션
 */
export async function getPubMedSummaries(
  pmids: string[],
  config: PubMedSearchConfig = {}
): Promise<PubMedSummaryResponse> {
  try {
    if (pmids.length === 0) {
      throw new Error('PMID 목록이 비어있습니다');
    }

    const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
    
    const params = new URLSearchParams({
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'json'
    });

    if (config.email) {
      params.append('email', config.email);
    }

    if (config.tool) {
      params.append('tool', config.tool);
    }

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': config.tool || 'RoleGPT-Search/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`PubMed 요약 API 오류 (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.esummaryresult && data.esummaryresult.ERROR) {
      throw new Error(`PubMed 요약 오류: ${data.esummaryresult.ERROR}`);
    }

    return data;

  } catch (error) {
    console.error('PubMed 요약 조회 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `PubMed 요약 조회 실패: ${error.message}`
        : 'PubMed 요약 조회 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * PubMed 통합 검색 (검색 + 요약)
 * @param query 검색 쿼리
 * @param config 설정 옵션
 * @param options 검색 옵션
 */
export async function searchPubMedWithSummaries(
  query: string,
  config: PubMedSearchConfig = {},
  options: {
    maxResults?: number;
    includeSummaries?: boolean;
    reldate?: number;
    mindate?: string;
    maxdate?: string;
  } = {}
): Promise<{
  results: PubMedSearchResult[];
  totalCount: number;
  query: string;
  source: 'pubmed';
}> {
  try {
    const {
      maxResults = 10,
      includeSummaries = true,
      reldate,
      mindate,
      maxdate
    } = options;

    // 1단계: 검색 실행
    const searchResponse = await searchPubMed(query, config, {
      retmax: maxResults,
      reldate,
      mindate,
      maxdate
    });

    const pmids = searchResponse.idlist;
    
    if (pmids.length === 0) {
      return {
        results: [],
        totalCount: parseInt(searchResponse.count.toString()),
        query,
        source: 'pubmed'
      };
    }

    // 2단계: 요약 정보 가져오기 (선택적)
    let results: PubMedSearchResult[] = [];
    
    if (includeSummaries) {
      const summaryResponse = await getPubMedSummaries(pmids, config);
      
      results = pmids.map(pmid => {
        const summary = summaryResponse.result[pmid];
        if (!summary) {
          return {
            pmid,
            title: '제목 없음',
            authors: [],
            journal: '저널 정보 없음',
            pubDate: '',
            url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
          };
        }

        const authors = summary.authors?.map(author => author.name) || [];
        const doi = summary.articleids?.find(id => id.idtype === 'doi')?.value;
        const pmc = summary.articleids?.find(id => id.idtype === 'pmc')?.value;

        return {
          pmid,
          title: summary.title || '제목 없음',
          authors,
          journal: summary.fulljournalname || summary.source || '저널 정보 없음',
          pubDate: summary.pubdate || summary.epubdate || '',
          doi,
          pmc,
          url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
        };
      });
    } else {
      // 요약 없이 기본 정보만
      results = pmids.map(pmid => ({
        pmid,
        title: `PMID: ${pmid}`,
        authors: [],
        journal: '저널 정보 없음',
        pubDate: '',
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
      }));
    }

    return {
      results,
      totalCount: parseInt(searchResponse.count.toString()),
      query,
      source: 'pubmed'
    };

  } catch (error) {
    console.error('PubMed 통합 검색 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `PubMed 검색 실패: ${error.message}`
        : 'PubMed 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * PubMed Service 클래스 (다른 서비스와 일관성을 위해)
 */
class PubMedService {
  /**
   * 논문 검색 (searchPubMedWithSummaries를 위한 래퍼)
   */
  async searchPapers(
    query: string, 
    maxResults: number = 10, 
    config: PubMedSearchConfig = {}
  ): Promise<{
    papers: Array<{
      title: string;
      authors: string;
      journal: string;
      year: string;
      url: string;
      pmid: string;
    }>;
    totalCount: number;
    query: string;
  }> {
    try {
      const result = await searchPubMedWithSummaries(query, config, { maxResults });
      
      // 포맷을 aiToolsService에서 기대하는 형태로 변환
      const papers = result.results.map(paper => ({
        title: paper.title,
        authors: paper.authors.join(', '),
        journal: paper.journal,
        year: paper.pubDate ? new Date(paper.pubDate).getFullYear().toString() : '미상',
        url: paper.url,
        pmid: paper.pmid
      }));
      
      return {
        papers,
        totalCount: result.totalCount,
        query: result.query
      };
    } catch (error) {
      console.error('PubMed 논문 검색 오류:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const pubmedService = new PubMedService();

/**
 * PubMed 관련 유틸리티 함수들
 */
export const PubMedUtils = {
  /**
   * PMID에서 DOI URL 생성
   */
  getDOIUrl: (doi: string): string => {
    return doi ? `https://doi.org/${doi}` : '';
  },

  /**
   * PMC URL 생성
   */
  getPMCUrl: (pmc: string): string => {
    return pmc ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmc}/` : '';
  },

  /**
   * 검색 쿼리 빌더
   */
  buildQuery: (terms: {
    keywords?: string[];
    authors?: string[];
    journal?: string;
    title?: string;
    affiliation?: string;
    language?: string;
    publicationType?: string;
  }): string => {
    const queryParts: string[] = [];

    if (terms.keywords) {
      queryParts.push(terms.keywords.join(' AND '));
    }

    if (terms.authors) {
      const authorQueries = terms.authors.map(author => `${author}[Author]`);
      queryParts.push(`(${authorQueries.join(' OR ')})`);
    }

    if (terms.journal) {
      queryParts.push(`${terms.journal}[Journal]`);
    }

    if (terms.title) {
      queryParts.push(`${terms.title}[Title]`);
    }

    if (terms.affiliation) {
      queryParts.push(`${terms.affiliation}[Affiliation]`);
    }

    if (terms.language) {
      queryParts.push(`${terms.language}[Language]`);
    }

    if (terms.publicationType) {
      queryParts.push(`${terms.publicationType}[Publication Type]`);
    }

    return queryParts.join(' AND ');
  },

  /**
   * 날짜 포맷 변환 (YYYY/MM/DD)
   */
  formatDateForPubMed: (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  },

  /**
   * 저자 이름 파싱
   */
  parseAuthorName: (authorString: string): { lastName: string; firstName: string; initials: string } => {
    // "Smith J" 또는 "Smith, John" 형식 파싱
    const parts = authorString.includes(',') 
      ? authorString.split(',').map(p => p.trim())
      : authorString.split(' ');

    if (parts.length >= 2) {
      return {
        lastName: parts[0],
        firstName: parts[1],
        initials: parts[1].charAt(0).toUpperCase()
      };
    }

    return {
      lastName: authorString,
      firstName: '',
      initials: ''
    };
  },

  /**
   * 논문 인용 형식 생성 (APA 스타일)
   */
  generateCitation: (paper: PubMedSearchResult, style: 'apa' | 'mla' | 'chicago' = 'apa'): string => {
    const authors = paper.authors.slice(0, 3).join(', ');
    const moreAuthors = paper.authors.length > 3 ? ', et al.' : '';
    const year = paper.pubDate ? new Date(paper.pubDate).getFullYear() : 'n.d.';

    switch (style) {
      case 'apa':
        return `${authors}${moreAuthors} (${year}). ${paper.title} ${paper.journal}. PMID: ${paper.pmid}`;
      case 'mla':
        return `${authors}${moreAuthors} "${paper.title}" ${paper.journal}, ${year}.`;
      case 'chicago':
        return `${authors}${moreAuthors} "${paper.title}" ${paper.journal} (${year}).`;
      default:
        return `${authors}${moreAuthors} "${paper.title}" ${paper.journal} (${year}). PMID: ${paper.pmid}`;
    }
  }
};

/**
 * 편의 함수들
 */
export const searchPubMedPapers = (query: string, maxResults?: number, config?: PubMedSearchConfig) => 
  pubmedService.searchPapers(query, maxResults, config);
