# 📋 최종 파일 정리 계획

## 🎯 정리 목표
새 버전을 기준으로 파일들을 통합하고 불필요한 중복 파일들을 제거하여 깔끔한 프로젝트 구조 만들기

## 🗂 현재 상황 분석

### ✅ 유지할 핵심 파일들
```
/App.tsx ✅ (이미 개선됨 - generateMockChat 복원 완료)
/src/ ✅ (핵심 로직들)
/components/ ✅ (UI 컴포넌트들)  
/styles/globals.css ✅ (테마 시스템)
/components/ui/ ✅ (shadcn 컴포넌트들)
```

### ❌ 삭제할 불필요한 파일들

#### 1. 새 버전 관련 파일들
- `/new_version/` 전체 폴더 (통합 완료 후 삭제)

#### 2. 개발/테스트용 임시 파일들
- `/MinimalApp.tsx`
- `/SimpleApp.tsx` 
- `/TestAccountModal.tsx`
- `/complete_sidebar.tsx`
- `/check_chatbar_end.txt`
- `/temp_search.txt`
- `/test-build/` 폴더

#### 3. 문서/정보 파일들 (선택적 삭제)
- `/Attributions.md`
- `/CLEANUP_PLAN.md`
- `/LogoVariations.md`
- `/metadata.json`

#### 4. 설정 파일들 (중복/미사용)
- `/next.config.js` (루트에 있는 것)
- `/tailwind.config.js` (루트에 있는 것)

## 🔄 통합 작업 순서

1. **새 버전 검토 완료** ✅
2. **핵심 개선사항 적용** ✅ (generateMockChat 복원됨)
3. **불필요한 파일 삭제** ⬅️ 현재 단계
4. **최종 구조 확인**
5. **테스트 및 마무리**

## 📁 최종 목표 구조
```
프로젝트 루트/
├── App.tsx                    # 메인 애플리케이션
├── src/                       # 핵심 로직
├── components/                # UI 컴포넌트
├── styles/                    # 스타일 시트
├── docs/                      # 문서
├── pages/                     # API/페이지 (Next.js)
├── imports/                   # Figma 리소스
└── 기타 필수 설정 파일들
```

정리 시작! 🚀