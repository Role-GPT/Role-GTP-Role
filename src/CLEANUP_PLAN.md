# 프로젝트 정리 계획

## 🗑 제거할 파일들 (개발/테스트 코드)

### 루트 레벨 정리
- `MinimalApp.tsx` - 개발용 간소화된 앱
- `SimpleApp.tsx` - 개발용 간단한 앱
- `TestAccountModal.tsx` - 테스트용 컴포넌트
- `complete_sidebar.tsx` - 개발용 사이드바
- `check_chatbar_end.txt` - 임시 체크 파일
- `temp_search.txt` - 임시 검색 파일
- `api/chat.js` - 중복된 API 파일 (pages/api/chat.js와 중복)

### 개발용 컴포넌트 정리
- `components/AdvancedCarouselDemo.tsx` - 데모용
- `components/CarouselFeatureDemo.tsx` - 데모용
- `components/ChatSidebarSimple.tsx` - 개발용
- `components/ChatSidebarWithHover.tsx` - 개발용
- `components/MobileRandomRoleCarousel.tsx` - 미사용

### 테스트 빌드 폴더
- `test-build/` 전체 폴더 - 실험용 코드

### 메타데이터 정리
- `metadata.json` - 개발용 메타데이터

## 📝 주석 추가가 필요한 핵심 파일들

### 1. App.tsx (메인 애플리케이션)
- 전체 앱 구조 설명
- 상태 관리 플로우
- 모달 시스템 설명

### 2. src/context/AppContext.tsx
- 전역 상태 구조
- Context Provider 패턴
- 액션 타입 정의

### 3. src/hooks/useAppHandlers.ts
- 비즈니스 로직 처리
- 이벤트 핸들러 모음
- API 호출 관리

### 4. components/ChatSidebar.tsx
- 사이드바 레이아웃 로직
- 반응형 디자인 구현
- 상태별 렌더링

### 5. components/ChatMain.tsx
- 메인 채팅 영역
- 메시지 렌더링
- 액션 버튼 처리

### 6. src/types.ts
- 전체 타입 정의
- 인터페이스 설명
- 데이터 구조 문서화

## 🔧 TODO 표시가 필요한 미완성 기능들

### 1. 음성 기능
- 음성 입력 구현
- TTS (텍스트→음성) 완성
- 음성 설정 UI

### 2. 파일 첨부 시스템
- 다중 파일 업로드
- 파일 타입 검증
- 미리보기 기능

### 3. 외부 서비스 연동
- Google Drive 연동 완성
- Notion API 통합
- Slack 연동 구현

### 4. 고급 AI 기능
- 이미지 분석 (멀티모달)
- 코드 실행 환경
- 플러그인 시스템

### 5. 협업 기능
- 실시간 공유
- 팀 워크스페이스
- 권한 관리

## 📦 새로운 폴더 구조 제안

```
📁 src/
  ├── components/      # 모든 React 컴포넌트
  │   ├── ui/         # Shadcn UI 컴포넌트
  │   ├── layout/     # 레이아웃 컴포넌트
  │   ├── chat/       # 채팅 관련 컴포넌트
  │   ├── modals/     # 모달 컴포넌트들
  │   └── common/     # 공통 컴포넌트
  ├── hooks/          # 커스텀 훅들
  ├── utils/          # 유틸리티 함수들
  ├── types/          # 타입 정의 파일들
  ├── constants/      # 상수 및 설정
  ├── context/        # React Context
  ├── providers/      # AI Provider 통합
  ├── i18n/          # 다국어 지원
  └── assets/        # 정적 자원

📁 docs/             # 문서화
  ├── API.md         # API 문서
  ├── COMPONENTS.md  # 컴포넌트 가이드
  └── DEPLOYMENT.md  # 배포 가이드

📁 tests/           # 테스트 파일들
  ├── components/
  ├── hooks/
  └── utils/
```

이 계획에 따라 프로젝트를 체계적으로 정리하겠습니다.