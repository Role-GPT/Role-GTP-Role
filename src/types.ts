/**
 * Role GPT 타입 정의
 * 
 * 전체 애플리케이션에서 사용되는 TypeScript 타입들을 정의
 * - 채팅 시스템 타입
 * - Role 템플릿 시스템
 * - 프로젝트 관리
 * - 사용자 설정
 * - AI Provider 통합
 */

/**
 * 채팅 메시지 인터페이스
 * 사용자와 AI 간의 대화 내용을 나타냄
 */
export interface Message {
  id: number;              // 메시지 고유 ID
  text: string;            // 메시지 텍스트 내용
  sender: 'user' | 'ai';   // 발신자 구분
  timestamp: Date;         // 메시지 생성 시간
}

/**
 * Gemini API 응답 파트 (내부 사용)
 */
export interface Part {
  text: string;
}

/**
 * Role 템플릿 인터페이스
 * AI 어시스턴트의 역할과 성격을 정의
 */
export interface Role {
  id: string;                    // Role 고유 ID
  name: string;                  // Role 이름 (예: "개발자", "디자이너")
  description: string;           // Role 설명
  prompt: string;                // 시스템 프롬프트
  category: string;              // 카테고리 (playground, custom 등)
  keywordIds: string[];          // 연관 키워드 ID 목록 - 응답방식 조정용
  keywordDetails?: { [key: string]: string }; // Advanced/Expert용 키워드 세부 설정
  
  // AI 매개변수 설정
  temperature: number;           // AI 창의성 수준 (0.0-1.0)
  maxOutputTokens: number;       // 최대 응답 토큰 수
  safetyLevel: string;           // 안전 필터링 레벨
  
  // 고급 기능 설정 (올드버전에서 복구)
  processImages?: boolean;       // 이미지 처리 활성화
  autoTag?: boolean;            // 자동 태깅 활성화
  useCache?: boolean;           // 캐싱 사용 여부
  useReference?: boolean;       // 참조 자료 사용 여부
  
  // Role 알림 시스템
  reminderOn?: boolean;         // 역할 리마인더 활성화
  reminderInterval?: number;    // 리마인더 간격 (턴 수)
  timelineReminderOn?: boolean; // 타임라인 리마인더 활성화
  timelineReminderInterval?: number; // 타임라인 리마인더 간격
  
  // 메타데이터
  isCustom?: boolean;            // 사용자 생성 Role 여부
  isTemplate?: boolean;          // 템플릿 Role 여부
  isPinned?: boolean;            // 즐겨찾기 여부
  apiConfigId?: string | null;   // 연결된 API 설정 ID
  color?: string;               // Role 표시 색상
  
  // 레거시 필드들
  promptTemplate?: string;       // 프롬프트 템플릿
  responseStyle?: 'standard' | 'detailed' | 'concise'; // 응답 스타일
  personality?: 'professional' | 'friendly' | 'creative'; // 성격 유형
  createdAt?: Date;              // 생성일
  lastUsed?: Date;               // 마지막 사용일
  usageCount?: number;           // 사용 횟수
  createdMode?: Mode;            // Role이 생성된 모드
  keywords?: string[];           // 하위 호환성용 (마이그레이션 시 사용)
}

/**
 * 프로젝트 인터페이스
 * 관련된 채팅들을 주제별로 그룹핑하는 시스템
 */
export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  guidelines?: string;
  memory?: MemoryItem[];
  files?: ProjectFile[];
  createdAt: Date;
  lastModified: Date;
  chatCount: number;
  isPinned?: boolean;
  icon?: string;
}

export interface MemoryItem {
  id: string;
  content: string;
  timestamp: Date;
  importance: 'low' | 'medium' | 'high';
}

/**
 * 대화 요약 인터페이스
 * AI가 생성하는 대화 요약 데이터
 */
export interface ConversationSummary {
  id: string;
  conversationId: string;
  summary: string;                        // 요약 내용
  startMessageIndex: number;              // 요약 시작 메시지 인덱스
  endMessageIndex: number;                // 요약 끝 메시지 인덱스
  format: 'paragraph' | 'bullet' | 'sentences'; // 요약 형태
  createdAt: Date;
  isConsolidated?: boolean;               // 재요약된 것인지 여부
  originalSummaries?: string[];           // 원본 요약들 (재요약인 경우)
}

/**
 * 타임라인 리마인더 인터페이스  
 * 대화 타임라인과 연계된 리마인더 시스템
 */
export interface TimelineReminder {
  id: string;
  conversationId: string;
  content: string;                        // 리마인더 내용
  triggerInterval: number;                // 트리거 간격 (턴 수)
  lastTriggeredAt?: number;               // 마지막 트리거된 메시지 인덱스
  createdAt: Date;
  isActive: boolean;
}

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  roleId: string;
  projectId?: string;
  messages: Message[];
  createdAt: Date;
  lastMessageAt: Date;
  isPinned?: boolean;
  isArchived?: boolean;
  settings?: ConversationSettings;
  icon?: string;
  
  // 📝 타임라인 리마인더 시스템 데이터
  summaries?: ConversationSummary[];      // 대화 요약들
  timelineReminders?: TimelineReminder[]; // 타임라인 리마인더들
  lastSummaryIndex?: number;              // 마지막 요약 생성 위치
  nextSummaryDue?: number;                // 다음 요약 예정 메시지 인덱스
}

export interface ConversationSettings {
  // AI 매개변수
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  
  // 대화 관리
  contextLength?: number;
  enableRoleReminder?: boolean;
  roleReminderInterval?: number;
  
  // 📝 타임라인 리마인더 시스템 (복원 및 강화)
  enableTimelineReminder?: boolean;        // 타임라인 리마인더 활성화 여부
  timelineReminderInterval?: number;       // 타임라인 리마인더 간격 (턴 수: 0-50)
  timelineFormat?: 'relative' | 'absolute' | 'smart';
  timelineSummaryStyle?: 'simple' | 'detailed' | 'contextual';
  enableConversationSummary?: boolean;     // 대화 요약 활성화
  summaryInterval?: number;                // 요약 생성 간격 (10-15턴)
  summaryFormat?: 'paragraph' | 'bullet' | 'sentences'; // 요약 형태
  consolidationInterval?: number;          // 재요약 간격 (30-50턴)
  maxSummaryLength?: number;              // 최대 요약 길이
  
  // 안전 및 필터링
  safetyLevel?: string;
  contentFilter?: boolean;
  enableEmotionDetection?: boolean;
  
  // 응답 스타일
  responseStyle?: 'concise' | 'balanced' | 'detailed';
  enableCodeHighlighting?: boolean;
  enableMarkdownFormatting?: boolean;
  
  // 음성 관련
  enableTextToSpeech?: boolean;
  speechVoice?: string;
  speechSpeed?: number;
  
  // 기타
  systemReminders?: string[];
  customInstructions?: string;
}

export interface Keyword {
  id: string;
  name: string;
  description: string;
  detailPrompt?: string;    // 세부 프롬프트 조정 (Advanced/Expert 전용)
  isDefault?: boolean;      // 기본 키워드 여부 (삭제 불가)
  category: string;         // 키워드 카테고리 (tone, style, format, approach, language)
  isSystem?: boolean;       // 시스템 키워드 여부 (하위 호환성)
  createdAt?: Date;        // 생성일 (선택사항)
  usageCount?: number;     // 사용 횟수 (선택사항)
}

export interface ApiConfiguration {
  provider: 'gemini' | 'openai' | 'anthropic';
  apiKey: string;
  modelName?: string;
  endpoint?: string;
  isDefault?: boolean;
}

export interface APIKey {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'cohere' | 'huggingface' | 'custom';
  key: string;
  endpoint?: string; // for custom APIs
  isDefault: boolean;
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
  modelOptions?: string[]; // available models for this API key
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  apiKeyId: string;
  icon: string;
  description?: string;
  maxTokens?: number;
  features?: string[];
}

/**
 * 사용자 모드별 제한사항 인터페이스
 */
export interface ModeLimitations {
  maxProjects: number;                    // 최대 프로젝트 수
  maxConversations: number;              // 최대 대화창 수  
  maxCustomRoles: number;                // 최대 커스텀 Role 수
  maxTemplateRoles: number;              // 최대 템플릿 Role 라이브러리 보관 수
  canExportChats: boolean;               // 대화 내보내기 가능 여부
  canImportChats: boolean;               // 대화 불러오기 가능 여부
  canDuplicateChats: boolean;            // 대화 복제 가능 여부
  timelineReminderMaxInterval: number;   // 타임라인 리마인더 최대 간격
  timelineReminderConfigurable: boolean; // 타임라인 리마인더 설정 가능 여부
  showTimelineReminderSettings: boolean; // 타임라인 리마인더 설정 UI 표시 여부
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultRole?: string;
  mode: 'standard' | 'advanced' | 'expert'; // Expert 모드 추가
  // Session-related settings
  userMode?: 'ephemeral' | 'personal' | 'public' | 'byok' | 'licensed';
  autoSave?: boolean;
  autoDelete?: boolean;
  sessionTimeout?: number; // minutes
  vaultPath?: string;
  apiConfigurations: ApiConfiguration[];
  apiKeys?: APIKey[]; // 새로운 API 키 관리 시스템
  selectedAiModel?: string; // 현재 선택된 AI 모델 ID
  email?: string;
  isEmailVerified?: boolean;
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    shareUsage: boolean;
  };
  security: {
    twoFactorEnabled?: boolean;
    loginNotifications?: boolean;
    apiKeyEncryption?: boolean;
  };
  speech: {
    enabled: boolean;
    autoPlay: boolean;
    voice: string;
    rate: number;
    pitch: number;
  };
  // AI 매개변수를 별도 속성으로 이동
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  safetyLevel?: string;
  
  ai: {
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    safetyLevel: string;
    streamResponse: boolean;
    useCache: boolean;
  };
}

export interface AppState {
  // Core data
  conversations: Conversation[];
  projects: Project[];
  roles: Role[];
  masterKeywords: Keyword[];
  
  // UI state
  activeChatId: string | null;
  selectedRoleId: string | null;
  sidebarExpanded: boolean;
  
  // Settings
  userSettings: UserSettings;
  
  // API & Search Management
  userApiKeys?: Record<string, {
    apiKey: string;
    alias: string;
    endpoint?: string;
    selectedModels: string[];
    isActive: boolean;
    isCustom?: boolean;
    category?: string;
    secondaryKey?: string;
  }>;
  searchConfig?: {
    enabledCategories: string[];
    providerWeights: Record<string, number>;
    trialUsage: Record<string, number>;
    lastResetDate: string;
  };
  
  // Temporary state
  isLoading: boolean;
  error: string | null;
  isGenerationStopped: boolean;
}

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
  keywordIds: string[];
  temperature: number;
  maxOutputTokens: number;
  safetyLevel: string;
  icon?: string;
  tags?: string[];
  popularity?: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  roleCount: number;
  isPopular?: boolean;
}

// Cross-Mode Guard 시스템 타입들
export type Mode = 'standard' | 'advanced' | 'expert';

export type ModeComparisonResult = 'same' | 'chatLower' | 'chatHigher';

export type Decision =
  | { type: 'proceed' }                 // 그대로 진행
  | { type: 'keepChat' }               // chatLower: 대화창 모드 유지 (다운실행)
  | { type: 'switchChat'; to: Mode }   // chatLower: 대화창 업그레이드
  | { type: 'cloneRole'; to: Mode };   // chatHigher: Role 복사·향상

export interface CrossModeGuardConfig {
  chatMode: Mode;
  roleMode: Mode;
  chatId?: string;
  roleId: string;
  roleName: string;
  lang?: 'ko' | 'en';
}
