# 🧹 Role GPT 최종 정리 계획

## 🗑️ 즉시 삭제 대상 폴더/파일

### 📁 전체 폴더 삭제
```bash
# 옛날 버전 및 백업 폴더들
rm -rf RoleGPT-oldversion/
rm -rf TO_DELETE/
rm -rf new_version/
rm -rf test-build/

# 개발 중 생성된 임시 폴더들
rm -rf temp_files/ (만약 있다면)
rm -rf backup/ (만약 있다면)
```

### 📄 루트 파일 삭제
```bash
# 테스트/개발용 파일들
rm MinimalApp.tsx
rm SimpleApp.tsx  
rm TestAccountModal.tsx

# 임시 텍스트 파일들
rm check_chatbar_end.txt
rm complete_sidebar.tsx
rm temp_search.txt
rm temp_fix.txt

# 중복/불필요 문서들
rm CLEANUP_INSTRUCTIONS.md
rm CLEANUP_PLAN.md
rm DELETED_FILES_LOG.md
rm FINAL_CLEANUP_GUIDE.md
rm FINAL_CLEANUP_PLAN.md
rm README_INTEGRATION.md
```

### 🔧 API 폴더 정리
```bash
# 불필요한 API 파일들 (pages/api/ 내부)
rm pages/api/hello.js
rm pages/api/verify-payment.js
rm pages/api/check-custom-role-limit.js
rm pages/api/check-project-limit.js
```

## ✅ 유지할 중요 파일들

### 🔥 핵심 애플리케이션
```
/App.tsx                        # 메인 앱
/package.json                   # 의존성
/tsconfig.json                  # TypeScript 설정
/next.config.js                 # Next.js 설정
/tailwind.config.js             # Tailwind 설정
```

### 📁 필수 폴더 구조
```
/src/                           # 소스 코드
/components/                    # React 컴포넌트
/styles/                        # 스타일 파일
/docs/                          # 문서 (새로 생성됨)
/utils/                         # 유틸리티
/supabase/                      # 백엔드
/imports/                       # 피그마 임포트
```

### 📚 중요 문서들
```
/README.md                      # 프로젝트 메인 문서
/metadata.json                  # 메타데이터
/Guidelines.md                  # 개발 가이드라인
/Attributions.md               # 라이선스 정보
/LogoVariations.md             # 로고 가이드
```

## 🔍 절대경로 확인 완료

### ✅ 검증된 상대경로들
- **App.tsx**: 모든 import가 `./`로 시작하는 상대경로 ✅
- **컴포넌트들**: `./components/`, `./src/` 사용 ✅  
- **유틸리티**: `./src/utils/`, `./src/hooks/` 사용 ✅
- **ShadCN**: `./components/ui/` 사용 ✅

### 🎯 예외 허용 경로들
- `figma:asset/`: 피그마 전용 경로 (수정 불필요)
- `sonner@2.0.3`: 특정 버전 지정 (정상)
- `react-hook-form@7.55.0`: 특정 버전 지정 (정상)

## 📋 정리 후 파일 구조

```
Role-GPT/
├── App.tsx                     # 메인 애플리케이션
├── package.json               
├── README.md                   
├── metadata.json
├── Guidelines.md
├── Attributions.md
├── LogoVariations.md
├── 
├── src/                        # 소스 코드
│   ├── constants/
│   ├── context/
│   ├── hooks/
│   ├── i18n/
│   ├── locales/
│   ├── providers/
│   ├── services/
│   ├── types/
│   └── utils/
│
├── components/                 # React 컴포넌트
│   ├── layouts/
│   ├── figma/
│   ├── ui/
│   └── [기타 컴포넌트들]
│
├── styles/                     # 스타일
│   └── globals.css
│
├── docs/                       # 기술 문서
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── TECHNICAL_FEATURES_STATUS.md  
│   ├── DEVELOPER_HANDOVER.md
│   ├── COMPONENTS.md
│   ├── DEPLOYMENT.md
│   ├── DEVELOPER_GUIDE.md
│   └── TECHNICAL_GUIDE.md
│
├── utils/                      # 유틸리티
│   └── supabase/
│
├── supabase/                   # 백엔드
│   └── functions/
│
├── imports/                    # 피그마 임포트
├── pages/                      # Next.js 페이지
└── [설정 파일들]
```

## 🚀 정리 후 확인사항

### 1. 🔧 기능 테스트
- [ ] 애플리케이션 정상 로딩
- [ ] 웰컴카드에서 대화 시작
- [ ] AI 응답 정상 생성
- [ ] 사이드바 동작
- [ ] 모달들 정상 작동
- [ ] 언어 변경 동작
- [ ] 테마 변경 동작

### 2. 📱 반응형 테스트
- [ ] 모바일 화면 정상
- [ ] 태블릿 화면 정상  
- [ ] 데스크톱 화면 정상
- [ ] 사이드바 반응형 동작

### 3. 🔑 기능별 테스트
- [ ] Role 선택 및 변경
- [ ] 프로젝트 생성/관리
- [ ] 채팅 백업/복원
- [ ] API 키 관리
- [ ] 이미지 생성
- [ ] 차트 생성

### 4. 🌐 다국어 테스트
- [ ] 한국어 (기본)
- [ ] 영어
- [ ] 일본어  
- [ ] 스페인어
- [ ] 포르투갈어
- [ ] 힌디어

## 📊 정리 전후 비교

### 정리 전
- **총 파일 수**: ~500+ 파일
- **폴더 수**: ~50+ 폴더
- **디스크 사용량**: ~200MB+
- **불필요 파일**: 많음

### 정리 후 (예상)
- **총 파일 수**: ~300 파일
- **폴더 수**: ~25 폴더  
- **디스크 사용량**: ~100MB
- **불필요 파일**: 없음

## ⚠️ 정리 시 주의사항

### 🚫 절대 삭제 금지
- `/supabase/functions/server/kv_store.tsx`
- `/utils/supabase/info.tsx`
- `/components/figma/ImageWithFallback.tsx`
- 모든 `/components/ui/` ShadCN 컴포넌트들

### 🔍 확인 후 삭제
- 중복된 이름의 파일이 있을 때 최신 버전 확인
- import 구문에서 참조되는 파일인지 확인
- 환경 설정 파일들의 필요성 확인

### 💾 백업 권장
정리 작업 전에 전체 프로젝트 백업 생성:
```bash
cp -r . ../Role-GPT-backup-$(date +%Y%m%d)
```

## 🎯 정리 완료 후 작업

1. **기능 테스트**: 전체 기능 동작 확인
2. **성능 측정**: 로딩 시간, 메모리 사용량 확인  
3. **배포 준비**: 환경변수 및 설정 확인
4. **문서 업데이트**: README 및 기술 문서 최종 확인

---

이 계획에 따라 정리하면 깔끔하고 유지보수하기 좋은 프로젝트 구조가 완성됩니다.