/**
 * API 라이브러리 초기 데이터 설정
 */

import { ApiTemplate, BUILT_IN_TEMPLATES } from '../types/apiLibrary';
import { saveCustomTemplate } from './apiLibraryManager';

/**
 * 기본 제공 템플릿들을 초기화
 */
export function initializeBuiltInTemplates(): void {
  const builtInTemplates: ApiTemplate[] = BUILT_IN_TEMPLATES.map((template, index) => ({
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

  console.log('✅ Built-in API templates initialized:', builtInTemplates.length);
}

/**
 * 샘플 커스텀 템플릿 생성 (데모용)
 */
export function createSampleCustomTemplates(): void {
  // localStorage에 이미 커스텀 템플릿이 있으면 스킵
  const existingTemplates = localStorage.getItem('roleGPT_apiTemplates');
  if (existingTemplates) {
    console.log('🔄 Custom templates already exist, skipping sample creation');
    return;
  }

  const sampleTemplates: ApiTemplate[] = [
    {
      id: 'custom_sample_1',
      name: 'JSONPlaceholder Posts',
      category: 'social',
      icon: '📝',
      description: '샘플 블로그 포스트 데이터 조회',
      baseUrl: 'https://jsonplaceholder.typicode.com',
      path: '/posts',
      method: 'GET',
      auth: { type: 'None' },
      params: { userId: '1' },
      headers: {},
      responseMap: {
        primaryText: '$.title'
      },
      timeoutMs: 5000,
      maxRespKB: 128,
      freeTier: true,
      keyless: true,
      enabled: true,
      isBuiltIn: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'custom_sample_2', 
      name: 'Cat Facts API',
      category: 'lifestyle',
      icon: '🐱',
      description: '고양이에 관한 재미있는 사실들',
      baseUrl: 'https://catfact.ninja',
      path: '/fact',
      method: 'GET',
      auth: { type: 'None' },
      responseMap: {
        primaryText: '$.fact'
      },
      timeoutMs: 5000,
      maxRespKB: 64,
      freeTier: true,
      keyless: true,
      enabled: true,
      isBuiltIn: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // 샘플 템플릿들 저장
  sampleTemplates.forEach(template => {
    saveCustomTemplate(template);
  });

  console.log('✅ Sample custom templates created:', sampleTemplates.length);
}

/**
 * API 라이브러리 전체 초기화
 */
export function initializeApiLibrary(): void {
  try {
    console.log('🚀 Initializing API Library...');
    
    initializeBuiltInTemplates();
    createSampleCustomTemplates();
    
    // 기본 사용량 제한 설정
    const defaultLimits = {
      trial: {
        imagePerDay: 10,
        weatherPerDay: 20,
        scholarPerDay: 20,
        searchPerDay: 30
      },
      adminBypassUserIds: ['admin']
    };
    
    if (!localStorage.getItem('roleGPT_apiLimits')) {
      localStorage.setItem('roleGPT_apiLimits', JSON.stringify(defaultLimits));
    }
    
    console.log('🎉 API Library initialization complete!');
  } catch (error) {
    console.error('❌ API Library initialization failed:', error);
  }
}