/**
 * Role GPT 전역 상태 관리 - React Context
 * 
 * 애플리케이션의 모든 상태를 중앙에서 관리하는 Context Provider
 * - 채팅 대화 내역 관리 (conversations)
 * - Role 템플릿 시스템 (roles)
 * - 프로젝트 관리 (projects)
 * - 사용자 설정 (userSettings)
 * - UI 상태 (사이드바, 로딩 등)
 * 
 * @pattern Context + useReducer 패턴으로 예측 가능한 상태 관리
 * @storage localStorage 기반 데이터 영속성
 * @performance Helper 함수들로 불필요한 리렌더링 방지
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Conversation, Project, Role, Message, UserSettings, APIKey, Mode, Keyword } from '../types';
import { STORAGE_KEYS, INITIAL_KEYWORDS } from '../constants';
import { speechManager } from '../providers/speech';

// Create essential roles directly to avoid import issues
const BUDDY_ROLE_DIRECT = {
  id: 'buddy',
  name: '👋 Buddy',
  description: '당신의 친근한 AI 친구이자 도우미',
  prompt: `당신은 사용자의 오래된 친구인 Buddy입니다. 자연스럽고 친근한 대화를 나누며, 필요할 때 다른 전문가들을 소개해줍니다.

성격:
- 친근하고 따뜻한 친구 같은 존재
- 사용자의 질문과 고민을 진심으로 들어줍니다
- 과도하게 개입하지 않고, 자연스럽게 도움을 제공합니다
- 필요할 때만 다른 전문가나 기능을 추천합니다

대화 방식:
- 먼저 사용자의 이야기를 듣고 공감해줍니다
- 일반적인 조언이나 정보를 제공할 수 있을 때는 직접 도움을 줍니다
- 전문적인 도움이 필요할 때만 "혹시 이런 전문가와 이야기해보는 건 어때?" 식으로 자연스럽게 제안합니다
- 강요하지 않고, 사용자가 원할 때까지 기다립니다

말투: 친구처럼 편안하고 자연스럽게, 억지로 홍보하지 않는 진솔한 대화`,
  category: 'recommended',
  createdMode: 'standard' as const,
  keywordIds: [],
  temperature: 0.7,
  maxOutputTokens: 2048,
  safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE'
};

const GUIDE_ROLE_DIRECT = {
  id: 'guide',
  name: '🧭 Role GPT 가이드',
  description: 'Role GPT 사용법을 친절하게 안내해드립니다',
  prompt: `당신은 Role GPT의 친절한 가이드입니다. 사용자가 Role GPT를 효과적으로 사용할 수 있도록 도와줍니다.

주요 역할:
- Role GPT의 다양한 기능을 소개합니다
- 전문가 역할(Role)의 활용법을 설명합니다
- 프로젝트 관리 기능을 안내합니다
- 대화 중에 자연스럽게 다른 전문가들을 추천합니다

안내 방식:
- 사용자의 질문에 먼저 답변한 후, 관련된 전문가나 기능을 추천합니다
- 방해되지 않는 선에서 Role GPT의 장점을 어필합니다
- "더 전문적인 도움이 필요하시면 [전문가 이름]과 대화해보세요"와 같이 제안합니다

말투: 친근하고 도움이 되는 어조로, 너무 과하지 않게 기능을 소개합니다.`,
  category: 'guide',
  createdMode: 'standard' as const,
  keywordIds: [],
  temperature: 0.7,
  maxOutputTokens: 2048,
  safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE'
};

// Essential playground roles that are referenced by welcome cards
const PLAYGROUND_ROLES_DIRECT = [
  {
    id: 'mad_scientist',
    name: '🧪 미치광이 과학자',
    description: '황당하지만 논리 있는 실험 아이디어 제안',
    prompt: `당신은 열정적이고 약간 미친 과학자입니다. 모든 문제를 독창적이고 실험적인 관점에서 접근합니다. 

특징:
- 황당하지만 논리적인 실험 아이디어를 제안합니다
- "유레카!", "실험해보자!" 같은 감탄사를 자주 사용합니다
- 일상의 문제를 과학적 실험으로 해결하려 합니다
- 약간 괴짜스럽지만 매우 논리적입니다

말투: 흥미진진하고 열정적이며, 과학 용어를 섞어 사용합니다.`,
    category: 'playground',
    createdMode: 'standard' as const,
    keywordIds: [],
    temperature: 0.8,
    maxOutputTokens: 2048,
    safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  {
    id: 'love_letter_writer',
    name: '💌 연애편지 대필작가',
    description: '감성적인 글을 대신 써주는 사랑의 메신저',
    prompt: `당신은 로맨틱하고 감성적인 연애편지 전문 작가입니다. 마음을 울리는 아름다운 표현으로 사랑을 전달합니다.

특징:
- 진심이 담긴 감성적인 문체를 구사합니다
- 시적이고 아름다운 표현을 사용합니다
- 상대방의 마음을 움직이는 글을 씁니다
- 연애뿐만 아니라 감사 인사, 사과 등도 감동적으로 표현합니다

말투: 부드럽고 따뜻하며, 시적인 표현을 많이 사용합니다.`,
    category: 'playground',
    createdMode: 'standard' as const,
    keywordIds: [],
    temperature: 0.9,
    maxOutputTokens: 2048,
    safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  {
    id: 'dream_interpreter',
    name: '🌙 꿈 해석가',
    description: '사용자의 꿈을 독특하고 철학적으로 해석',
    prompt: `당신은 신비롭고 철학적인 꿈 해석 전문가입니다. 꿈의 상징과 의미를 깊이 있게 분석합니다.

특징:
- 꿈의 상징을 심리학적, 철학적으로 해석합니다
- 몽환적이고 신비로운 분위기를 연출합니다
- Jung의 집단무의식 이론 등을 활용합니다
- 꿈을 통해 내면의 진실을 발견하도록 돕습니다

말투: 신비롭고 철학적이며, 상징적인 표현을 사용합니다.`,
    category: 'playground',
    createdMode: 'standard' as const,
    keywordIds: [],
    temperature: 0.8,
    maxOutputTokens: 2048,
    safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  {
    id: 'philosopher_cat',
    name: '🐱 철학하는 고양이',
    description: '귀여운 말투로 심오한 조언을 주는 반전 캐릭터',
    prompt: `당신은 매우 현명하지만 고양이의 모습을 한 철학자입니다. 귀여운 고양이 말투로 깊이 있는 철학적 통찰을 제공합니다.

특징:
- "냥", "미야옹" 등의 고양이 말투를 사용합니다
- 심오한 철학적 개념을 쉽게 설명합니다
- 일상의 문제를 철학적 관점에서 바라봅니다
- 귀여움과 지혜의 완벽한 조화를 보여줍니다

말투: 고양이처럼 귀엽지만 내용은 매우 철학적이고 심오합니다.`,
    category: 'playground',
    createdMode: 'standard' as const,
    keywordIds: [],
    temperature: 0.8,
    maxOutputTokens: 2048,
    safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  {
    id: 'magic_fortune_teller',
    name: '🪄 마법 점성술사',
    description: '오늘의 운세를 판타지스럽게 풀어내는 예언가',
    prompt: `당신은 신비로운 마법의 힘을 가진 점성술사입니다. 별과 마법을 통해 운세와 조언을 제공합니다.

특징:
- 판타지 세계관의 마법적 표현을 사용합니다
- 별자리, 타로카드, 수정구 등을 언급합니다
- 신비롭고 몽환적인 분위기를 연출합니다
- 희망적이고 긍정적인 메시지를 전달합니다

말투: 신비롭고 마법적이며, 예언자 같은 어조를 사용합니다.`,
    category: 'playground',
    createdMode: 'standard' as const,
    keywordIds: [],
    temperature: 0.8,
    maxOutputTokens: 2048,
    safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  {
    id: 'romantic_drama_writer',
    name: '🎭 로맨틱 드라마 작가',
    description: '현실을 드라마틱하게 각색해주는 작가',
    prompt: `당신은 일상을 드라마틱하고 로맨틱한 스토리로 각색하는 작가입니다. 평범한 순간도 영화 같은 장면으로 만듭니다.

특징:
- 일상적인 상황을 드라마틱하게 묘사합니다
- 로맨틱하고 감성적인 스토리텔링을 합니다
- 영화나 드라마의 명장면을 연상시키는 표현을 사용합니다
- 모든 상황에 극적인 의미를 부여합니다

말투: 드라마틱하고 감성적이며, 영화 대사 같은 표현을 사용합니다.`,
    category: 'playground',
    createdMode: 'standard' as const,
    keywordIds: [],
    temperature: 0.9,
    maxOutputTokens: 2048,
    safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE'
  }
];

// 🏷️ 마스터 키워드 시스템 - 올드버전에서 복구된 INITIAL_KEYWORDS 사용
const MASTER_KEYWORDS: Keyword[] = INITIAL_KEYWORDS.map(kw => ({
  ...kw,
  createdAt: new Date(),
  usageCount: 0,
  isSystem: kw.isDefault // isSystem과 isDefault를 동일하게 처리
}));

// Additional professional roles
const PROFESSIONAL_ROLES_DIRECT = [
  {
    id: 'marketing_strategist',
    name: '마케팅 전략가',
    description: '브랜드 마케팅과 디지털 마케팅 전문가',
    prompt: `당신은 10년 이상의 경험을 가진 마케팅 전략 전문가입니다. 
브랜드 포지셔닝, 디지털 마케팅, 고객 세분화, ROI 최적화에 대한 깊은 지식을 가지고 있습니다.
항상 데이터에 기반한 전략적 조언을 제공하며, 실행 가능한 마케팅 플랜을 제시합니다.`,
    category: 'recommended',
    keywordIds: ['kw_professional', 'kw_detailed', 'kw_analytical'],
    temperature: 0.7,
    maxOutputTokens: 2048,
    safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
    createdMode: 'standard' as const
  },
  {
    id: 'ux_designer',
    name: 'UI/UX 디자이너',
    description: '사용자 경험과 인터페이스 디자인 전문가',
    prompt: `당신은 사용자 중심 디자인 철학을 가진 UI/UX 디자인 전문가입니다.
사용성, 접근성, 시각적 디자인, 사용자 리서치에 대한 전문 지식을 가지고 있습니다.
디자인 결정에 대한 논리적 근거를 제시하고, 사용자 경험을 개선하는 구체적인 방법을 제안합니다.`,
    category: 'recommended',
    keywordIds: ['kw_creative', 'kw_detailed', 'kw_friendly'],
    temperature: 0.8,
    maxOutputTokens: 2048,
    safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
    createdMode: 'standard' as const
  },
  {
    id: 'dev_mentor',
    name: '개발자 멘토',
    description: '시니어 개발자이자 기술 멘토',
    prompt: `당신은 다양한 프로그래밍 언어와 프레임워크에 능숙한 시니어 개발자입니다.
코드 리뷰, 아키텍처 설계, 성능 최적화, 개발 프로세스 개선에 대한 전문성을 가지고 있습니다.
복잡한 기술적 개념을 이해하기 쉽게 설명하고, 실무에 바로 적용할 수 있는 조언을 제공합니다.`,
    category: 'recommended',
    keywordIds: ['kw_professional', 'kw_technical', 'kw_analytical'],
    temperature: 0.6,
    maxOutputTokens: 2048,
    safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
    createdMode: 'standard' as const
  }
];

// Combine all roles
const DEFAULT_ROLES = [
  BUDDY_ROLE_DIRECT,
  GUIDE_ROLE_DIRECT,
  ...PLAYGROUND_ROLES_DIRECT,
  ...PROFESSIONAL_ROLES_DIRECT
];

/**
 * Redux 스타일 액션 타입 정의
 * 모든 상태 변경은 이 액션들을 통해서만 가능
 */
type AppAction =
  | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
  | { type: 'SET_SELECTED_ROLE'; payload: string | null }
  | { type: 'SET_SIDEBAR_EXPANDED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GENERATION_STOPPED'; payload: boolean }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: { id: string; updates: Partial<Conversation> } }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_ROLE'; payload: Role }
  | { type: 'UPDATE_ROLE'; payload: { id: string; updates: Partial<Role> } }
  | { type: 'DELETE_ROLE'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_API_KEY'; payload: APIKey }
  | { type: 'UPDATE_API_KEY'; payload: { id: string; updates: Partial<APIKey> } }
  | { type: 'DELETE_API_KEY'; payload: string }
  | { type: 'SET_SELECTED_AI_MODEL'; payload: string }
  // 🏷️ 키워드 관리 액션들
  | { type: 'ADD_KEYWORD'; payload: Keyword }
  | { type: 'UPDATE_KEYWORD'; payload: { id: string; updates: Partial<Keyword> } }
  | { type: 'DELETE_KEYWORD'; payload: string }
  // 🔑 새로운 API 키 관리 액션들
  | { type: 'UPDATE_USER_API_CONFIG'; payload: { providerId: string; updates: any } }
  | { type: 'SET_USER_API_KEYS'; payload: Record<string, any> }
  // 🔍 검색 설정 액션들
  | { type: 'UPDATE_SEARCH_CONFIG'; payload: any }
  | { type: 'TOGGLE_SEARCH_CATEGORY'; payload: { categoryId: string; enabled: boolean } };

/**
 * 초기 상태 생성 함수
 * 앱 시작 시 기본값들을 설정
 */
const getInitialState = (): AppState => ({
  conversations: [],
  projects: [],
  roles: DEFAULT_ROLES,
  masterKeywords: MASTER_KEYWORDS,
  activeChatId: null,
  selectedRoleId: null,
  sidebarExpanded: false,
  userSettings: {
    theme: 'dark',
    language: 'ko', // 기본값, 실제로는 i18n에서 브라우저 언어 감지
    mode: 'standard', // 기본값을 standard로 설정
    apiConfigurations: [],
    apiKeys: [],
    selectedAiModel: 'default',
    email: '',
    isEmailVerified: false,
    notifications: {
      enabled: true,
      sound: false,
      desktop: true
    },
    privacy: {
      dataCollection: false,
      analytics: false,
      shareUsage: false
    },
    security: {
      twoFactorEnabled: false,
      loginNotifications: true,
      apiKeyEncryption: true
    },
    speech: {
      enabled: true,
      autoPlay: false,
      voice: 'default',
      rate: 1.0,
      pitch: 1.0
    },
    ai: {
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
      streamResponse: true,
      useCache: true
    }
  },
  // 🔑 API 키 관리 (개발용 샘플 포함)
  userApiKeys: {
    // 샘플 데이터 - 개발용
    'openai': {
      apiKey: '',
      alias: 'OpenAI GPT',
      endpoint: 'https://api.openai.com/v1',
      selectedModels: ['gpt-4-turbo', 'gpt-3.5-turbo'],
      isActive: false,
      category: 'llm'
    },
    'google': {
      apiKey: '',
      alias: 'Google Gemini',
      endpoint: 'https://generativelanguage.googleapis.com/v1',
      selectedModels: ['gemini-1.5-pro'],
      isActive: false,
      category: 'llm'
    },
    'alpha-vantage': {
      apiKey: '',
      alias: 'Alpha Vantage Stock Data',
      endpoint: 'https://www.alphavantage.co/query',
      selectedModels: ['quote', 'daily'],
      isActive: false,
      category: 'finance'
    },
    'pubmed': {
      apiKey: '',
      alias: 'PubMed Medical Papers',
      endpoint: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
      selectedModels: ['search', 'summary'],
      isActive: true, // 무료 서비스이므로 기본 활성화
      category: 'academic'
    }
  },
  // 🔍 검색 설정
  searchConfig: {
    enabledCategories: ['web', 'news', 'scholar', 'business', 'culture', 'lifestyle'],
    providerWeights: {
      'pubmed': 35,
      'semanticscholar': 25,
      'alpha_vantage': 45,
      'tmdb': 50,
      'openweather': 50
    },
    trialUsage: {},
    lastResetDate: new Date().toISOString().split('T')[0]
  },
  isLoading: false,
  error: null,
  isGenerationStopped: false
});

/**
 * 메인 리듀서 함수
 * 모든 상태 업데이트 로직을 중앙에서 관리
 * 순수 함수로 작성되어 예측 가능한 상태 변경 보장
 */
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChatId: action.payload };
    
    case 'SET_SELECTED_ROLE':
      return { ...state, selectedRoleId: action.payload };
    
    case 'SET_SIDEBAR_EXPANDED':
      return { ...state, sidebarExpanded: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_GENERATION_STOPPED':
      return { ...state, isGenerationStopped: action.payload };
    
    case 'ADD_CONVERSATION':
      return { 
        ...state, 
        conversations: [action.payload, ...state.conversations] 
      };
    
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id
            ? { ...conv, ...action.payload.updates }
            : conv
        )
      };
    
    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== action.payload),
        activeChatId: state.activeChatId === action.payload ? null : state.activeChatId
      };
    
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [action.payload, ...state.projects]
      };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(proj =>
          proj.id === action.payload.id
            ? { ...proj, ...action.payload.updates }
            : proj
        )
      };
    
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(proj => proj.id !== action.payload)
      };
    
    case 'ADD_ROLE':
      return {
        ...state,
        roles: [...state.roles, action.payload]
      };
    
    case 'UPDATE_ROLE':
      return {
        ...state,
        roles: state.roles.map(role =>
          role.id === action.payload.id
            ? { ...role, ...action.payload.updates }
            : role
        )
      };
    
    case 'DELETE_ROLE':
      return {
        ...state,
        roles: state.roles.filter(role => role.id !== action.payload)
      };
    
    case 'UPDATE_SETTINGS':
      console.log('🔧 설정 업데이트:', action.payload);
      return {
        ...state,
        userSettings: { ...state.userSettings, ...action.payload }
      };
    
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    
    case 'ADD_API_KEY':
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          apiKeys: [...(state.userSettings.apiKeys || []), action.payload]
        }
      };
    
    case 'UPDATE_API_KEY':
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          apiKeys: (state.userSettings.apiKeys || []).map(key =>
            key.id === action.payload.id
              ? { ...key, ...action.payload.updates }
              : key
          )
        }
      };
    
    case 'DELETE_API_KEY':
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          apiKeys: (state.userSettings.apiKeys || []).filter(key => key.id !== action.payload)
        }
      };
    
    case 'SET_SELECTED_AI_MODEL':
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          selectedAiModel: action.payload
        }
      };
    
    // 🏷️ 키워드 관리 케이스들
    case 'ADD_KEYWORD':
      return {
        ...state,
        masterKeywords: [...state.masterKeywords, action.payload]
      };
    
    case 'UPDATE_KEYWORD':
      return {
        ...state,
        masterKeywords: state.masterKeywords.map(kw =>
          kw.id === action.payload.id
            ? { ...kw, ...action.payload.updates }
            : kw
        )
      };
    
    case 'DELETE_KEYWORD':
      return {
        ...state,
        masterKeywords: state.masterKeywords.filter(kw => kw.id !== action.payload)
      };
    
    // 🔑 API 키 관리 케이스들
    case 'UPDATE_USER_API_CONFIG':
      return {
        ...state,
        userApiKeys: {
          ...state.userApiKeys,
          [action.payload.providerId]: {
            ...state.userApiKeys?.[action.payload.providerId],
            ...action.payload.updates
          }
        }
      };
    
    case 'SET_USER_API_KEYS':
      return {
        ...state,
        userApiKeys: action.payload
      };
    
    // 🔍 검색 설정 케이스들
    case 'UPDATE_SEARCH_CONFIG':
      return {
        ...state,
        searchConfig: {
          ...state.searchConfig,
          ...action.payload
        }
      };
    
    case 'TOGGLE_SEARCH_CATEGORY':
      const currentCategories = state.searchConfig?.enabledCategories || [];
      const updatedCategories = action.payload.enabled
        ? [...currentCategories, action.payload.categoryId]
        : currentCategories.filter(id => id !== action.payload.categoryId);
      
      return {
        ...state,
        searchConfig: {
          ...state.searchConfig,
          enabledCategories: updatedCategories
        }
      };
    
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  setActiveChat: (chatId: string | null) => void;
  setSelectedRole: (roleId: string | null) => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setGenerationStopped: (stopped: boolean) => void;
  stopGeneration: () => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addRole: (role: Role) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  // API Key management
  addApiKey: (apiKey: APIKey) => void;
  updateApiKey: (id: string, updates: Partial<APIKey>) => void;
  deleteApiKey: (id: string) => void;
  // 🏷️ 키워드 관리
  addKeyword: (keyword: Keyword) => void;
  updateKeyword: (id: string, updates: Partial<Keyword>) => void;
  deleteKeyword: (id: string) => void;
  setSelectedAiModel: (modelId: string) => void;
  // 🔑 새로운 API 키 관리
  updateUserApiConfig: (providerId: string, updates: any) => void;
  setUserApiKeys: (keys: Record<string, any>) => void;
  // 🔍 검색 설정 관리
  updateSearchConfig: (config: any) => void;
  toggleSearchCategory: (categoryId: string, enabled: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem(STORAGE_KEYS.conversations);
      const savedProjects = localStorage.getItem(STORAGE_KEYS.projects);
      const savedSettings = localStorage.getItem(STORAGE_KEYS.userSettings);
      const savedApiKeys = localStorage.getItem('userApiKeys');
      const savedSearchConfig = localStorage.getItem('searchConfig');
      // 마지막 활성 채팅은 자동으로 불러오지 않음 - 새 세션은 빈 상태로 시작

      const stateUpdates: Partial<AppState> = {};

      if (savedConversations) {
        const conversations = JSON.parse(savedConversations);
        // Restore Date objects
        conversations.forEach((conv: any) => {
          conv.createdAt = new Date(conv.createdAt);
          conv.lastMessageAt = new Date(conv.lastMessageAt);
          if (conv.messages) {
            conv.messages.forEach((msg: any) => {
              msg.timestamp = new Date(msg.timestamp);
            });
          }
        });
        stateUpdates.conversations = conversations;
      }

      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        projects.forEach((proj: any) => {
          proj.createdAt = new Date(proj.createdAt);
          proj.lastModified = new Date(proj.lastModified);
        });
        stateUpdates.projects = projects;
      }

      if (savedSettings) {
        stateUpdates.userSettings = { ...state.userSettings, ...JSON.parse(savedSettings) };
      }

      // 🔑 API 키 설정 로드
      if (savedApiKeys) {
        try {
          const apiKeys = JSON.parse(savedApiKeys);
          stateUpdates.userApiKeys = { ...state.userApiKeys, ...apiKeys };
        } catch (error) {
          console.warn('Failed to parse saved API keys:', error);
        }
      }

      // 🔍 검색 설정 로드
      if (savedSearchConfig) {
        try {
          const searchConfig = JSON.parse(savedSearchConfig);
          stateUpdates.searchConfig = { ...state.searchConfig, ...searchConfig };
        } catch (error) {
          console.warn('Failed to parse saved search config:', error);
        }
      }

      // 새 세션은 항상 빈 상태로 시작
      stateUpdates.activeChatId = null;
      stateUpdates.selectedRoleId = null;

      if (Object.keys(stateUpdates).length > 0) {
        dispatch({ type: 'LOAD_STATE', payload: stateUpdates });
      }
    } catch (error) {
      console.error('Failed to load state from storage:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(state.conversations));
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(state.projects));
      localStorage.setItem(STORAGE_KEYS.userSettings, JSON.stringify(state.userSettings));
      
      // 🔑 API 키 설정 저장
      if (state.userApiKeys) {
        localStorage.setItem('userApiKeys', JSON.stringify(state.userApiKeys));
      }
      
      // 🔍 검색 설정 저장
      if (state.searchConfig) {
        localStorage.setItem('searchConfig', JSON.stringify(state.searchConfig));
      }
      
      if (state.activeChatId) {
        localStorage.setItem(STORAGE_KEYS.lastActiveChat, state.activeChatId);
      }
    } catch (error) {
      console.error('Failed to save state to storage:', error);
    }
  }, [state.conversations, state.projects, state.userSettings, state.userApiKeys, state.searchConfig, state.activeChatId]);

  // Helper functions
  const setActiveChat = (chatId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });
  };

  const setSelectedRole = (roleId: string | null) => {
    dispatch({ type: 'SET_SELECTED_ROLE', payload: roleId });
  };

  const setSidebarExpanded = (expanded: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_EXPANDED', payload: expanded });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setGenerationStopped = (stopped: boolean) => {
    dispatch({ type: 'SET_GENERATION_STOPPED', payload: stopped });
  };

  const stopGeneration = () => {
    console.log('🛑 AI 응답 중지 요청');
    setGenerationStopped(true);
    setLoading(false);
    setError(null);
  };

  const addConversation = (conversation: Conversation) => {
    dispatch({ type: 'ADD_CONVERSATION', payload: conversation });
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    dispatch({ type: 'UPDATE_CONVERSATION', payload: { id, updates } });
  };

  const deleteConversation = (id: string) => {
    dispatch({ type: 'DELETE_CONVERSATION', payload: id });
  };

  const addProject = (project: Project) => {
    dispatch({ type: 'ADD_PROJECT', payload: project });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates } });
  };

  const deleteProject = (id: string) => {
    dispatch({ type: 'DELETE_PROJECT', payload: id });
  };

  const addRole = (role: Role) => {
    dispatch({ type: 'ADD_ROLE', payload: role });
  };

  const updateRole = (id: string, updates: Partial<Role>) => {
    dispatch({ type: 'UPDATE_ROLE', payload: { id, updates } });
  };

  const deleteRole = (id: string) => {
    dispatch({ type: 'DELETE_ROLE', payload: id });
  };

  const updateSettings = (settings: Partial<UserSettings>) => {
    console.log('📝 설정 변경:', settings);
    
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    
    // 언어가 변경되면 음성 인식 언어도 업데이트
    if (settings.language) {
      // 언어 코드 매핑
      const languageCodes: { [key: string]: string } = {
        en: 'en-US',
        ko: 'ko-KR', 
        ja: 'ja-JP',
        es: 'es-ES',
        pt: 'pt-BR',
        hi: 'hi-IN'
      };
      
      const languageCode = languageCodes[settings.language] || 'ko-KR';
      speechManager.setLanguageCode(languageCode);
    }
  };

  // API Key management functions
  const addApiKey = (apiKey: APIKey) => {
    dispatch({ type: 'ADD_API_KEY', payload: apiKey });
  };

  const updateApiKey = (id: string, updates: Partial<APIKey>) => {
    dispatch({ type: 'UPDATE_API_KEY', payload: { id, updates } });
  };

  const deleteApiKey = (id: string) => {
    dispatch({ type: 'DELETE_API_KEY', payload: id });
  };

  const setSelectedAiModel = (modelId: string) => {
    dispatch({ type: 'SET_SELECTED_AI_MODEL', payload: modelId });
  };

  // 🏷️ 키워드 관리 함수들
  const addKeyword = (keyword: Keyword) => {
    dispatch({ type: 'ADD_KEYWORD', payload: keyword });
  };

  const updateKeyword = (id: string, updates: Partial<Keyword>) => {
    dispatch({ type: 'UPDATE_KEYWORD', payload: { id, updates } });
  };

  const deleteKeyword = (id: string) => {
    // 기본 키워드는 삭제할 수 없음
    const keyword = state.masterKeywords.find(kw => kw.id === id);
    if (keyword?.isDefault) {
      console.warn('⚠️ 기본 키워드는 삭제할 수 없습니다:', keyword.name);
      return;
    }
    dispatch({ type: 'DELETE_KEYWORD', payload: id });
  };

  // 🔑 새로운 API 키 관리 함수들
  const updateUserApiConfig = (providerId: string, updates: any) => {
    dispatch({ type: 'UPDATE_USER_API_CONFIG', payload: { providerId, updates } });
  };

  const setUserApiKeys = (keys: Record<string, any>) => {
    dispatch({ type: 'SET_USER_API_KEYS', payload: keys });
  };

  // 🔍 검색 설정 관리 함수들
  const updateSearchConfig = (config: any) => {
    dispatch({ type: 'UPDATE_SEARCH_CONFIG', payload: config });
  };

  const toggleSearchCategory = (categoryId: string, enabled: boolean) => {
    dispatch({ type: 'TOGGLE_SEARCH_CATEGORY', payload: { categoryId, enabled } });
  };

  const value: AppContextType = {
    state,
    dispatch,
    setActiveChat,
    setSelectedRole,
    setSidebarExpanded,
    setLoading,
    setError,
    setGenerationStopped,
    stopGeneration,
    addConversation,
    updateConversation,
    deleteConversation,
    addProject,
    updateProject,
    deleteProject,
    addRole,
    updateRole,
    deleteRole,
    updateSettings,
    addApiKey,
    updateApiKey,
    deleteApiKey,
    setSelectedAiModel,
    addKeyword,
    updateKeyword,
    deleteKeyword,
    updateUserApiConfig,
    setUserApiKeys,
    updateSearchConfig,
    toggleSearchCategory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
