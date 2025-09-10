/**
 * 통합 API 서비스
 * 
 * API 키 라이브러리의 템플릿들을 사용하여 실제 API 호출 수행
 */

import { 
  ApiTemplate, 
  ApiCategory, 
  InvokeTemplateArgs, 
  InvokeTemplateResult 
} from '../types/apiLibrary';
import { 
  getAllTemplates, 
  getTemplatesByCategory, 
  getUserApiKeys, 
  invokeTemplate 
} from '../utils/apiLibraryManager';

/**
 * 카테고리별 API 호출
 */
export async function searchByCategory(
  category: ApiCategory, 
  query: string,
  options: {
    preferUserKeys?: boolean;
    maxResults?: number;
    timeout?: number;
  } = {}
): Promise<InvokeTemplateResult[]> {
  const { preferUserKeys = true, maxResults = 3, timeout = 10000 } = options;
  
  // 해당 카테고리의 활성 템플릿들 가져오기
  const templates = getTemplatesByCategory(category);
  const userKeys = getUserApiKeys();
  
  // 우선순위: 사용자 키가 있는 템플릿 > 키리스 템플릿 > 무료 체험 템플릿
  const sortedTemplates = templates.sort((a, b) => {
    const aHasUserKey = !!userKeys[a.id]?.isActive;
    const bHasUserKey = !!userKeys[b.id]?.isActive;
    
    if (preferUserKeys) {
      if (aHasUserKey && !bHasUserKey) return -1;
      if (!aHasUserKey && bHasUserKey) return 1;
    }
    
    if (a.keyless && !b.keyless) return -1;
    if (!a.keyless && b.keyless) return 1;
    
    if (a.freeTier && !b.freeTier) return -1;
    if (!a.freeTier && b.freeTier) return 1;
    
    return 0;
  });

  const results: InvokeTemplateResult[] = [];
  const errors: string[] = [];
  
  // 병렬로 API 호출 (최대 maxResults 개까지)
  const promises = sortedTemplates
    .slice(0, maxResults)
    .map(async (template) => {
      try {
        const result = await Promise.race([
          invokeTemplate({ templateId: template.id, inputText: query }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ]);
        
        return { ...result, templateId: template.id, templateName: template.name };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${template.name}: ${errorMessage}`);
        return null;
      }
    });

  const settledResults = await Promise.allSettled(promises);
  
  settledResults.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      results.push(result.value);
    }
  });

  // 로깅
  console.log(`[${category}] Query: "${query}", Results: ${results.length}, Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.warn(`[${category}] Errors:`, errors);
  }

  return results;
}

/**
 * 이미지 생성 전용 함수
 */
export async function generateImage(
  prompt: string,
  options: {
    preferUserKeys?: boolean;
    style?: string;
    size?: string;
  } = {}
): Promise<InvokeTemplateResult | null> {
  const { preferUserKeys = true } = options;
  
  const templates = getTemplatesByCategory('media').filter(t => 
    t.name.toLowerCase().includes('image') || 
    t.name.toLowerCase().includes('dall') ||
    t.name.toLowerCase().includes('craiyon') ||
    t.description?.toLowerCase().includes('image')
  );
  
  const userKeys = getUserApiKeys();
  
  // 우선순위: BYOK > 무료 체험
  const sortedTemplates = templates.sort((a, b) => {
    const aHasUserKey = !!userKeys[a.id]?.isActive;
    const bHasUserKey = !!userKeys[b.id]?.isActive;
    
    if (preferUserKeys) {
      if (aHasUserKey && !bHasUserKey) return -1;
      if (!aHasUserKey && bHasUserKey) return 1;
    }
    
    // Gemini Imagen (BYOK) 우선
    if (a.name.toLowerCase().includes('gemini') && !b.name.toLowerCase().includes('gemini')) return -1;
    if (!a.name.toLowerCase().includes('gemini') && b.name.toLowerCase().includes('gemini')) return 1;
    
    // Craiyon (무료) 후순위
    if (a.name.toLowerCase().includes('craiyon') && !b.name.toLowerCase().includes('craiyon')) return 1;
    if (!a.name.toLowerCase().includes('craiyon') && b.name.toLowerCase().includes('craiyon')) return -1;
    
    return 0;
  });

  // 첫 번째 사용 가능한 템플릿으로 이미지 생성
  for (const template of sortedTemplates) {
    try {
      const result = await invokeTemplate({ 
        templateId: template.id, 
        inputText: prompt,
        extra: { style: options.style, size: options.size }
      });
      
      return { ...result, templateId: template.id, templateName: template.name };
    } catch (error) {
      console.warn(`Image generation failed with ${template.name}:`, error);
      continue;
    }
  }

  throw new Error('모든 이미지 생성 서비스를 사용할 수 없습니다. API 키를 확인하세요.');
}

/**
 * 스마트 검색 (여러 카테고리 통합)
 */
export async function smartSearch(
  query: string,
  options: {
    categories?: ApiCategory[];
    maxResultsPerCategory?: number;
    totalMaxResults?: number;
  } = {}
): Promise<{
  results: InvokeTemplateResult[];
  categories: Record<ApiCategory, InvokeTemplateResult[]>;
}> {
  const { 
    categories = ['search', 'academic', 'finance'], 
    maxResultsPerCategory = 2,
    totalMaxResults = 6 
  } = options;

  const categoryResults: Record<ApiCategory, InvokeTemplateResult[]> = {} as any;
  const allResults: InvokeTemplateResult[] = [];

  // 각 카테고리별로 검색 수행
  const promises = categories.map(async (category) => {
    try {
      const results = await searchByCategory(category, query, {
        maxResults: maxResultsPerCategory,
        timeout: 8000
      });
      
      categoryResults[category] = results;
      allResults.push(...results);
    } catch (error) {
      console.warn(`Smart search failed for category ${category}:`, error);
      categoryResults[category] = [];
    }
  });

  await Promise.allSettled(promises);

  // 결과 제한 및 정렬
  const limitedResults = allResults
    .sort((a, b) => {
      // 응답 시간 기준 정렬 (빠른 것 우선)
      return (a.responseTime || 0) - (b.responseTime || 0);
    })
    .slice(0, totalMaxResults);

  return {
    results: limitedResults,
    categories: categoryResults
  };
}

/**
 * 실시간 데이터 조회 (주식, 날씨 등)
 */
export async function getRealTimeData(
  type: 'weather' | 'stock' | 'news',
  query: string
): Promise<InvokeTemplateResult | null> {
  const categoryMap = {
    weather: 'lifestyle' as ApiCategory,
    stock: 'finance' as ApiCategory,
    news: 'search' as ApiCategory
  };

  const category = categoryMap[type];
  const results = await searchByCategory(category, query, { maxResults: 1 });
  
  return results[0] || null;
}

/**
 * 사용량 및 제한 체크
 */
export async function checkUsageLimits(): Promise<{
  categories: Record<ApiCategory, {
    available: boolean;
    used: number;
    limit: number;
    resetDate: Date;
  }>;
  canUseImageGeneration: boolean;
  canUseSearch: boolean;
}> {
  // 실제 구현에서는 localStorage에서 오늘 사용량을 가져와야 함
  const today = new Date().toDateString();
  
  const mockUsage = {
    search: { used: 5, limit: 30 },
    academic: { used: 2, limit: 20 },
    finance: { used: 1, limit: 20 },
    media: { used: 3, limit: 10 },
    social: { used: 0, limit: 15 },
    lifestyle: { used: 2, limit: 20 },
    llm: { used: 0, limit: 100 }
  };

  const categories = Object.entries(mockUsage).reduce((acc, [key, value]) => {
    acc[key as ApiCategory] = {
      available: value.used < value.limit,
      used: value.used,
      limit: value.limit,
      resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 내일
    };
    return acc;
  }, {} as any);

  return {
    categories,
    canUseImageGeneration: categories.media.available,
    canUseSearch: categories.search.available
  };
}

/**
 * API 키 상태 확인
 */
export function getApiKeyStatus(): {
  hasUserKeys: boolean;
  keysByCategory: Record<ApiCategory, {
    total: number;
    connected: number;
    working: number;
  }>;
  recommendations: string[];
} {
  const templates = getAllTemplates();
  const userKeys = getUserApiKeys();
  
  const keysByCategory = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = { total: 0, connected: 0, working: 0 };
    }
    
    acc[template.category].total++;
    
    const userKey = userKeys[template.id];
    if (userKey) {
      acc[template.category].connected++;
      if (userKey.isActive && userKey.testResult?.success) {
        acc[template.category].working++;
      }
    } else if (template.keyless) {
      acc[template.category].connected++;
      acc[template.category].working++;
    }
    
    return acc;
  }, {} as any);

  const hasUserKeys = Object.keys(userKeys).length > 0;
  
  const recommendations: string[] = [];
  
  if (!hasUserKeys) {
    recommendations.push('개인 API 키를 추가하면 무제한으로 이용할 수 있습니다.');
  }
  
  Object.entries(keysByCategory).forEach(([category, stats]) => {
    if (stats.connected === 0) {
      recommendations.push(`${category} 카테고리에 API 키를 추가해보세요.`);
    } else if (stats.working < stats.connected) {
      recommendations.push(`${category} 카테고리의 일부 API 키를 테스트해보세요.`);
    }
  });

  return {
    hasUserKeys,
    keysByCategory,
    recommendations
  };
}