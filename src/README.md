# Role GPT 

ChatGPT 스타일의 AI 채팅 인터페이스로, 다양한 Role(역할) 템플릿을 통해 특화된 AI 어시스턴트와 대화할 수 있는 웹 애플리케이션입니다.

## 🌟 주요 기능

### 💬 채팅 시스템
- **ChatGPT 스타일 UI**: 직관적이고 친숙한 인터페이스
- **Role 기반 대화**: 20개 이상의 전문 Role 템플릿 (개발자, 디자이너, 마케터 등)
- **실시간 메시지**: 스트리밍 방식의 자연스러운 응답
- **메시지 액션**: 재생성, 복사, 음성 재생, 내보내기 기능

### 🎭 Role 시스템
- **Playground 카테고리**: 20개의 전문 Role 템플릿
- **Buddy Role**: 기본 친근한 어시스턴트
- **Custom Role**: 사용자 정의 Role 생성 및 관리
- **Role 갤러리**: 카테고리별 Role 탐색

### 📁 프로젝트 관리
- **프로젝트 생성**: 주제별 채팅 그룹핑
- **채팅 정리**: 드래그 앤 드롭으로 프로젝트에 추가
- **검색 기능**: 통합 검색으로 프로젝트/채팅 탐색

### 📱 반응형 디자인
- **데스크톱 최적화**: 사이드바 기반 레이아웃
- **모바일 지원**: 터치 친화적 UI
- **다크/라이트 테마**: 자동 테마 전환

### 🔗 확장성
- **파일 첨부**: 문서, 이미지 업로드 지원
- **커넥터 시스템**: Google Drive, Notion 등 외부 서비스 연동
- **API 관리**: 6개 AI Provider 지원 (OpenAI, Anthropic, Google 등)

## 🛠 기술 스택

### Frontend
- **React 18.2.0**: 모던 React Hooks 패턴
- **Next.js 14.0.0**: App Router와 SSR/SSG
- **TypeScript 5.0.0**: 타입 안정성
- **Tailwind CSS 4.0.0**: 유틸리티 우선 스타일링

### UI Components
- **Shadcn/UI**: 재사용 가능한 컴포넌트 라이브러리
- **Lucide React**: 아이콘 시스템
- **Sonner**: 토스트 알림

### AI Integration
- **Google Gemini**: 주요 AI 모델 (`@google/genai`)
- **Multi-Provider 지원**: OpenAI, Anthropic, Google, OpenRouter, Groq, xAI

### State Management
- **React Context**: 전역 상태 관리
- **Custom Hooks**: 비즈니스 로직 분리

### 스타일링
- **Tailwind V4**: 최신 유틸리티 클래스
- **CSS Variables**: 다크/라이트 테마 지원
- **Responsive Design**: 모바일 우선 접근

## 📂 프로젝트 구조

```
📁 components/          # React 컴포넌트
  ├── ui/              # Shadcn UI 컴포넌트
  ├── layouts/         # 레이아웃 컴포넌트
  └── figma/           # Figma 관련 컴포넌트

📁 src/                # 비즈니스 로직
  ├── context/         # React Context
  ├── hooks/           # 커스텀 훅
  ├── types.ts         # TypeScript 타입 정의
  ├── constants/       # 상수 및 기본값
  ├── providers/       # AI Provider 통합
  ├── utils/           # 유틸리티 함수
  └── i18n/           # 다국어 지원

📁 pages/              # Next.js 페이지
  ├── api/            # API 라우트
  ├── _app.tsx        # 앱 설정
  └── index.tsx       # 메인 페이지

📁 styles/             # 스타일 파일
  └── globals.css     # 전역 스타일

📄 App.tsx            # 메인 애플리케이션 컴포넌트
📄 package.json       # 의존성 관리
📄 next.config.js     # Next.js 설정
📄 tsconfig.json      # TypeScript 설정
```

## 🔧 환경 변수

`.env.local` 파일에 다음 변수들을 설정하세요:

```bash
# Google AI Studio API Key
API_KEY=your_google_ai_studio_api_key_here

# 사용자 플랜 설정
USER_PLAN=premium

# 앱 기본 설정
NEXT_PUBLIC_APP_NAME=Role GPT
NEXT_PUBLIC_APP_VERSION=1.0.0

# 기능 토글
NEXT_PUBLIC_SPEECH_ENABLED=true
NEXT_PUBLIC_STATSIG_ENABLED=false
NEXT_PUBLIC_ANALYTICS_ENABLED=false

# AI 기본 설정
NEXT_PUBLIC_DEFAULT_MODEL=gemini-2.5-flash
NEXT_PUBLIC_DEFAULT_TEMPERATURE=0.7

# 개발 모드
NEXT_PUBLIC_DEV_MODE=true
```

## 🚀 시작하기

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
npm start
```

## 📱 사용자 플로우

### 1. 메인 화면
- Role 선택 또는 바로 채팅 시작
- 추천 Role 카로셀에서 빠른 선택
- 최근 채팅 내역 확인

### 2. 채팅 시작
- Role 선택 → 새 채팅 생성
- 입력창에 메시지 작성
- AI 응답 실시간 스트리밍

### 3. 채팅 관리
- 사이드바에서 채팅 내역 관리
- 프로젝트로 채팅 그룹핑
- 검색으로 빠른 탐색

### 4. 고급 기능
- 설정에서 AI Provider 관리
- 파일 첨부로 문서 분석
- 외부 서비스 연동

## 🔌 API 통합

### AI Provider 연결
1. **설정 → API 관리**로 이동
2. 원하는 Provider 선택
3. API 키 입력 및 모델 선택
4. 엔드포인트 설정 (필요시)

### 지원 Provider
- **OpenAI**: GPT-4, GPT-3.5
- **Anthropic**: Claude 3
- **Google**: Gemini Pro/Flash
- **OpenRouter**: 다양한 오픈소스 모델
- **Groq**: 고속 추론
- **xAI**: Grok 모델

## 🛡 에러 처리

### 개발 환경
- 개발 전용 에러 로깅 (`devUtils.ts`)
- 안전한 API 호출 래퍼
- 서드파티 서비스 에러 무시

### 프로덕션 환경
- 사용자 친화적 에러 메시지
- 자동 재시도 메커니즘
- 오프라인 상태 처리

## 💾 데이터 저장

### 로컬 스토리지
- 채팅 내역
- 사용자 설정
- Role 템플릿
- 프로젝트 데이터

### 세션 스토리지
- 임시 상태
- 폼 데이터
- UI 상태

## 🎨 디자인 시스템

### 색상
- **다크 테마**: 기본 어두운 배경
- **라이트 테마**: 선택적 밝은 테마
- **액센트 컬러**: 브랜드 색상 일관성

### 타이포그래피
- **기본 폰트 크기**: 14px
- **반응형 크기**: 디바이스별 최적화
- **가독성 우선**: 높은 대비율

### 컴포넌트
- **일관된 간격**: 8px 기준 그리드
- **둥근 모서리**: 10px 기본 반지름
- **그림자**: 레이어별 깊이 표현

## 🔮 향후 개발 계획

### 단기 (1-2개월)
- [ ] 음성 입력/출력 완성
- [ ] 파일 첨부 고도화
- [ ] 모바일 앱 최적화

### 중기 (3-6개월)
- [ ] 실시간 협업 기능
- [ ] 고급 Role 편집기
- [ ] 플러그인 시스템

### 장기 (6개월+)
- [ ] 멀티모달 지원 (이미지, 비디오)
- [ ] 클라우드 동기화
- [ ] 기업용 기능

## 🤝 기여하기

1. 이슈 등록 또는 기능 제안
2. 포크 후 브랜치 생성
3. 코드 작성 및 테스트
4. Pull Request 제출

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

**Role GPT**로 더 스마트한 AI 대화를 경험해보세요! 🚀