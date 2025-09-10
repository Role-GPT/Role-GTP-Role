/**
 * API 라이브러리 관리 유틸리티
 * 
 * 템플릿 저장, 로드, API 호출 등 핵심 기능들
 */

import { 
  ApiTemplate, 
  UserApiKey, 
  ApiLibraryData, 
  InvokeTemplateArgs, 
  InvokeTemplateResult, 
  BUILT_IN_TEMPLATES,
  UserPermissionLevel 
} from '../types/apiLibrary';

const STORAGE_KEYS = {
  TEMPLATES: 'roleGPT_apiTemplates',
  USER_KEYS: 'roleGPT_userApiKeys',
  USAGE: 'roleGPT_apiUsage',
  LIMITS: 'roleGPT_apiLimits'
};

/**
 * 기본 제공 템플릿들을 완전한 ApiTemplate 형태로 변환
 */
export function getBuiltInTemplates(): ApiTemplate[] {
  return BUILT_IN_TEMPLATES.map((template, index) => ({
    ...template,
    id: template.id || `builtin_${index}`,
    name: template.name || 'Unknown Template',
    category: template.category || 'search',
    icon: template.icon || '🔧',
    baseUrl: template.baseUrl || '',
    path: template.path || '',
    method: template.method || 'GET',
    auth: template.auth || { type: 'None' },
    timeoutMs: template.timeoutMs || 8000,
    maxRespKB: template.maxRespKB || 256,
    freeTier: template.freeTier ?? true,
    keyless: template.keyless ?? true,
    enabled: true,
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  } as ApiTemplate));
}

/**
 * 모든 API 템플릿 로드 (내장 + 커스텀)
 */
export function getAllTemplates(): ApiTemplate[] {
  try {
    const builtInTemplates = getBuiltInTemplates();
    const customTemplatesStr = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    const customTemplates: ApiTemplate[] = customTemplatesStr ? JSON.parse(customTemplatesStr) : [];
    
    return [...builtInTemplates, ...customTemplates];
  } catch (error) {
    console.error('Failed to load templates:', error);
    return getBuiltInTemplates();
  }
}

/**
 * 카테고리별 템플릿 조회
 */
export function getTemplatesByCategory(category: string): ApiTemplate[] {
  return getAllTemplates().filter(template => template.category === category && template.enabled);
}

/**
 * 특정 템플릿 조회
 */
export function getTemplate(templateId: string): ApiTemplate | null {
  return getAllTemplates().find(template => template.id === templateId) || null;
}

/**
 * 커스텀 템플릿 저장
 */
export function saveCustomTemplate(template: ApiTemplate): boolean {
  try {
    const customTemplatesStr = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    const customTemplates: ApiTemplate[] = customTemplatesStr ? JSON.parse(customTemplatesStr) : [];
    
    const existingIndex = customTemplates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      customTemplates[existingIndex] = { ...template, updatedAt: new Date() };
    } else {
      customTemplates.push({ ...template, createdAt: new Date(), updatedAt: new Date() });
    }
    
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(customTemplates));
    return true;
  } catch (error) {
    console.error('Failed to save template:', error);
    return false;
  }
}

/**
 * 커스텀 템플릿 삭제
 */
export function deleteCustomTemplate(templateId: string): boolean {
  try {
    const customTemplatesStr = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    const customTemplates: ApiTemplate[] = customTemplatesStr ? JSON.parse(customTemplatesStr) : [];
    
    const filteredTemplates = customTemplates.filter(t => t.id !== templateId);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filteredTemplates));
    return true;
  } catch (error) {
    console.error('Failed to delete template:', error);
    return false;
  }
}

/**
 * 사용자 API 키 로드
 */
export function getUserApiKeys(): Record<string, UserApiKey> {
  try {
    const userKeysStr = localStorage.getItem(STORAGE_KEYS.USER_KEYS);
    return userKeysStr ? JSON.parse(userKeysStr) : {};
  } catch (error) {
    console.error('Failed to load user API keys:', error);
    return {};
  }
}

/**
 * 사용자 API 키 저장
 */
export function saveUserApiKey(templateId: string, apiKey: UserApiKey): boolean {
  try {
    const userKeys = getUserApiKeys();
    userKeys[templateId] = { ...apiKey, templateId };
    localStorage.setItem(STORAGE_KEYS.USER_KEYS, JSON.stringify(userKeys));
    return true;
  } catch (error) {
    console.error('Failed to save user API key:', error);
    return false;
  }
}

/**
 * 사용자 API 키 삭제
 */
export function deleteUserApiKey(templateId: string): boolean {
  try {
    const userKeys = getUserApiKeys();
    delete userKeys[templateId];
    localStorage.setItem(STORAGE_KEYS.USER_KEYS, JSON.stringify(userKeys));
    return true;
  } catch (error) {
    console.error('Failed to delete user API key:', error);
    return false;
  }
}

/**
 * 템플릿 문자열 치환 ({{INPUT_TEXT}}, {{API_KEY}} 등)
 */
export function replaceTemplateVars(
  template: string, 
  vars: Record<string, string>
): string {
  let result = template;
  
  Object.entries(vars).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  });
  
  return result;
}

/**
 * API 템플릿 테스트 호출
 */
export async function testApiTemplate(
  template: ApiTemplate, 
  userKey?: UserApiKey, 
  testInput: string = 'test'
): Promise<{ success: boolean; error?: string; responseTime?: number }> {
  const startTime = Date.now();
  
  try {
    const result = await invokeTemplate({
      templateId: template.id,
      inputText: testInput
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      success: true,
      responseTime
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * API 템플릿 호출 (메인 인터페이스)
 */
export async function invokeTemplate(args: InvokeTemplateArgs): Promise<InvokeTemplateResult> {
  const { templateId, inputText = '', extra = {} } = args;
  
  // 1) 템플릿 조회
  const template = getTemplate(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }
  
  // 2) 사용자 키 병합
  const userKeys = getUserApiKeys();
  const userKey = userKeys[templateId];
  
  if (!template.keyless && !userKey?.apiKey) {
    throw new Error(`API key required for template: ${template.name}`);
  }
  
  // 3) 사용량 체크
  if (!checkUsageLimit(template)) {
    throw new Error(`Usage limit exceeded for ${template.name}`);
  }
  
  // 4) URL/헤더/바디 구성
  const vars: Record<string, string> = {
    INPUT_TEXT: inputText,
    API_KEY: userKey?.apiKey || '',
    CLIENT_ID: userKey?.clientId || '',
    CLIENT_SECRET: userKey?.clientSecret || '',
    ...extra
  };
  
  const url = replaceTemplateVars(`${template.baseUrl}${template.path}`, vars);
  
  const headers: Record<string, string> = {
    'User-Agent': 'RoleGPT/1.0',
    ...template.headers
  };
  
  // 인증 헤더 처리
  if (template.auth.type === 'Header' && template.auth.keyName && userKey?.apiKey) {
    const prefix = template.auth.prefix || '';
    headers[template.auth.keyName] = `${prefix}${userKey.apiKey}`;
  }
  
  // 헤더 템플릿 변수 치환
  Object.keys(headers).forEach(key => {
    headers[key] = replaceTemplateVars(headers[key], vars);
  });
  
  // 쿼리 파라미터 처리
  const urlObj = new URL(url);
  if (template.params) {
    Object.entries(template.params).forEach(([key, value]) => {
      urlObj.searchParams.set(key, replaceTemplateVars(value, vars));
    });
  }
  
  // 인증 쿼리 파라미터 처리
  if (template.auth.type === 'Query' && template.auth.keyName && userKey?.apiKey) {
    urlObj.searchParams.set(template.auth.keyName, userKey.apiKey);
  }
  
  // 바디 구성
  let body: string | undefined;
  if (template.body && ['POST', 'PUT', 'PATCH'].includes(template.method)) {
    body = replaceTemplateVars(template.body, vars);
  }
  
  // 5) fetch + timeout/size 가드
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), template.timeoutMs);
  
  try {
    const response = await fetch(urlObj.toString(), {
      method: template.method,
      headers,
      body,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // 크기 제한 체크
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > template.maxRespKB * 1024) {
      throw new Error(`Response too large: ${contentLength} bytes`);
    }
    
    const rawResponse = await response.json();
    
    // 6) responseMap으로 추출
    let text: string | undefined;
    let imageB64: string | undefined;
    
    if (template.responseMap?.primaryText) {
      text = extractJsonPath(rawResponse, template.responseMap.primaryText);
    }
    
    if (template.responseMap?.primaryImage) {
      imageB64 = extractJsonPath(rawResponse, template.responseMap.primaryImage);
    }
    
    // 사용량 기록
    recordUsage(templateId);
    
    return {
      text,
      imageB64,
      raw: rawResponse,
      responseTime: Date.now() - Date.now(),
      source: template.name
    };
    
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * JSONPath 간단 구현 ($.path.to.value 형태만 지원)
 */
function extractJsonPath(obj: any, path: string): string | undefined {
  if (!path.startsWith('$.')) return undefined;
  
  const keys = path.slice(2).split('.');
  let current = obj;
  
  for (const key of keys) {
    if (key.includes('[') && key.includes(']')) {
      // 배열 인덱스 처리 (예: items[0])
      const [arrayKey, indexStr] = key.split('[');
      const index = parseInt(indexStr.replace(']', ''));
      current = current?.[arrayKey]?.[index];
    } else {
      current = current?.[key];
    }
    
    if (current === undefined) return undefined;
  }
  
  return typeof current === 'string' ? current : JSON.stringify(current);
}

/**
 * 사용량 제한 체크
 */
function checkUsageLimit(template: ApiTemplate): boolean {
  // 키리스 무료 서비스의 경우 일일 제한 적용
  if (template.keyless && template.freeTier) {
    const usage = getUsageCount(template.id);
    const limits = getUsageLimits();
    
    switch (template.category) {
      case 'media':
        return usage < limits.trial.imagePerDay;
      case 'lifestyle':
        return usage < limits.trial.weatherPerDay;
      case 'academic':
        return usage < limits.trial.scholarPerDay;
      case 'search':
        return usage < limits.trial.searchPerDay;
      default:
        return usage < 20; // 기본 제한
    }
  }
  
  // 사용자 키가 있는 경우 제한 없음
  return true;
}

/**
 * 사용량 기록
 */
function recordUsage(templateId: string): void {
  try {
    const usageStr = localStorage.getItem(STORAGE_KEYS.USAGE);
    const usage = usageStr ? JSON.parse(usageStr) : {};
    
    const today = new Date().toDateString();
    const key = `${templateId}_${today}`;
    
    usage[key] = (usage[key] || 0) + 1;
    
    localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(usage));
  } catch (error) {
    console.error('Failed to record usage:', error);
  }
}

/**
 * 오늘 사용량 조회
 */
function getUsageCount(templateId: string): number {
  try {
    const usageStr = localStorage.getItem(STORAGE_KEYS.USAGE);
    const usage = usageStr ? JSON.parse(usageStr) : {};
    
    const today = new Date().toDateString();
    const key = `${templateId}_${today}`;
    
    return usage[key] || 0;
  } catch (error) {
    console.error('Failed to get usage count:', error);
    return 0;
  }
}

/**
 * 사용량 제한 설정 조회
 */
function getUsageLimits() {
  return {
    trial: {
      imagePerDay: 10,
      weatherPerDay: 20,
      scholarPerDay: 20,
      searchPerDay: 30
    },
    adminBypassUserIds: ['admin']
  };
}

/**
 * 사용자 권한 레벨 조회
 */
export function getUserPermissionLevel(): UserPermissionLevel {
  // TODO: 실제 사용자 권한 시스템과 연동
  const userLevel = localStorage.getItem('userPermissionLevel');
  return (userLevel as UserPermissionLevel) || 'Standard';
}

/**
 * 권한에 따른 액션 가능 여부 체크
 */
export function canPerformAction(action: 'view' | 'clone' | 'edit' | 'create' | 'delete'): boolean {
  const level = getUserPermissionLevel();
  
  switch (action) {
    case 'view':
      return true; // 모든 사용자
    case 'clone':
      return ['Advanced', 'Expert', 'Admin'].includes(level);
    case 'edit':
      return ['Advanced', 'Expert', 'Admin'].includes(level);
    case 'create':
      return ['Expert', 'Admin'].includes(level);
    case 'delete':
      return level === 'Admin';
    default:
      return false;
  }
}

/**
 * 내보내기/가져오기
 */
export function exportApiLibrary(): string {
  const data: ApiLibraryData = {
    templates: getAllTemplates().filter(t => !t.isBuiltIn),
    userKeys: getUserApiKeys(),
    limits: getUsageLimits(),
    usage: {}
  };
  
  return JSON.stringify(data, null, 2);
}

export function importApiLibrary(dataStr: string): boolean {
  try {
    const data: ApiLibraryData = JSON.parse(dataStr);
    
    // 커스텀 템플릿 병합
    if (data.templates) {
      const existingCustom = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPLATES) || '[]');
      const mergedTemplates = [...existingCustom];
      
      data.templates.forEach(template => {
        const existingIndex = mergedTemplates.findIndex(t => t.id === template.id);
        if (existingIndex >= 0) {
          mergedTemplates[existingIndex] = template;
        } else {
          mergedTemplates.push(template);
        }
      });
      
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(mergedTemplates));
    }
    
    // 사용자 키 병합
    if (data.userKeys) {
      const existingKeys = getUserApiKeys();
      const mergedKeys = { ...existingKeys, ...data.userKeys };
      localStorage.setItem(STORAGE_KEYS.USER_KEYS, JSON.stringify(mergedKeys));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to import API library:', error);
    return false;
  }
}