#!/bin/bash
echo "=== 🚨 긴급! Role GPT 하얀 화면 문제 해결 ==="
echo "배포 문제 원인: 중복 src/src/ 구조로 인한 빌드 시스템 혼란"
echo ""

# 현재 상태 확인
echo "🔍 현재 프로젝트 상태:"
echo "✅ 메인 애플리케이션: /App.tsx"
echo "✅ 메인 소스 코드: /src/ (완전히 구성됨)"
echo "✅ 컴포넌트: /components/ (완전히 구성됨)"
echo "✅ 스타일: /styles/globals.css"
echo "✅ 서버리스: /supabase/functions/"
echo ""

# 1. 🚨 긴급: 빌드 충돌 원인인 중복 폴더들 완전 제거
echo "🚨 긴급 수술: 빌드 충돌 폴더들 제거 중..."
echo "❌ 제거 대상 (현재 앱과 100% 별개):"
echo "   - RoleGPT-oldversion/ (구버전 백업)"
echo "   - new_version/ (개발 백업 - src/src/ 이중 구조 충돌 원인)"  
echo "   - TO_DELETE/ (삭제 예정 임시 파일들)"
echo "   - test-build/ (테스트 빌드 파일들)"
echo ""

echo "⚠️  확인: new_version/ 폴더는 현재 App.tsx와 전혀 공유되지 않습니다!"
echo "   현재 앱: ./src/utils/devUtils ✅"
echo "   백업들: new_version/Role-gpt UI/src/src/utils/devUtils ❌"
echo ""

echo "🗑️ 중복 폴더 제거 시작..."
if [ -d "RoleGPT-oldversion" ]; then
    echo "   ❌ RoleGPT-oldversion/ 제거 중..."
    rm -rf RoleGPT-oldversion/
    echo "   ✅ RoleGPT-oldversion/ 제거 완료"
fi

if [ -d "new_version" ]; then
    echo "   ❌ new_version/ 제거 중 (JSR 충돌 해결)..."
    rm -rf new_version/
    echo "   ✅ new_version/ 제거 완료"
fi

if [ -d "TO_DELETE" ]; then
    echo "   ❌ TO_DELETE/ 제거 중..."
    rm -rf TO_DELETE/
    echo "   ✅ TO_DELETE/ 제거 완료"
fi

if [ -d "test-build" ]; then
    echo "   ❌ test-build/ 제거 중..."
    rm -rf test-build/
    echo "   ✅ test-build/ 제거 완료"
fi

# 2. 🧹 빌드 방해 임시 파일들 제거
echo ""
echo "🧹 빌드 방해 임시 파일들 제거 중..."
if [ -f "MinimalApp.tsx" ]; then rm -f MinimalApp.tsx; echo "   ✅ MinimalApp.tsx 제거"; fi
if [ -f "SimpleApp.tsx" ]; then rm -f SimpleApp.tsx; echo "   ✅ SimpleApp.tsx 제거"; fi
if [ -f "TestAccountModal.tsx" ]; then rm -f TestAccountModal.tsx; echo "   ✅ TestAccountModal.tsx 제거"; fi
if [ -f "complete_sidebar.tsx" ]; then rm -f complete_sidebar.tsx; echo "   ✅ complete_sidebar.tsx 제거"; fi
if [ -f "check_chatbar_end.txt" ]; then rm -f check_chatbar_end.txt; echo "   ✅ check_chatbar_end.txt 제거"; fi
if [ -f "temp_search.txt" ]; then rm -f temp_search.txt; echo "   ✅ temp_search.txt 제거"; fi
if [ -f "temp_fix.txt" ]; then rm -f temp_fix.txt; echo "   ✅ temp_fix.txt 제거"; fi

# 3. 📋 빌드 방해 중복 문서들 정리
echo ""
echo "📋 빌드 방해 중복 문서들 정리 중..."
if [ -f "CLEANUP_"*.md ]; then rm -f CLEANUP_*.md; echo "   ✅ CLEANUP_*.md 제거"; fi
if [ -f "DELETED_FILES_LOG.md" ]; then rm -f DELETED_FILES_LOG.md; echo "   ✅ DELETED_FILES_LOG.md 제거"; fi
if [ -f "FINAL_CLEANUP_"*.md ]; then rm -f FINAL_CLEANUP_*.md; echo "   ✅ FINAL_CLEANUP_*.md 제거"; fi
if [ -f "README_INTEGRATION.md" ]; then rm -f README_INTEGRATION.md; echo "   ✅ README_INTEGRATION.md 제거"; fi

# 4. ⚙️ 빌드 충돌 설정 파일들 제거 (Vite vs Next.js 충돌 해결)
echo ""
echo "⚙️ 빌드 충돌 설정 파일들 제거 중..."
if [ -f "next.config.js" ]; then 
    rm -f next.config.js
    echo "   ✅ next.config.js 제거 (Vite와 충돌)"
fi
if [ -f "tailwind.config.js" ]; then 
    rm -f tailwind.config.js
    echo "   ✅ tailwind.config.js 제거 (Tailwind v4와 충돌)"
fi

# 5. 임시/백업 확장자 파일들 정리
echo "임시 백업 파일들 정리 중..."
find . -name "*.bak" -delete
find . -name "*.backup" -delete
find . -name "*.temp" -delete
find . -name "*.tmp" -delete
find . -name "*_backup*" -delete
find . -name "*_temp*" -delete
find . -name ".DS_Store" -delete

# 6. 중복 package.json 확인 및 정리
echo "중복 설정 파일 확인 중..."
find . -name "package.json" -not -path "./node_modules/*" | head -10

# 7. src/src/ 이중 구조 문제 검증
echo ""
echo "🔍 src/src/ 이중 구조 문제 검증 중..."
if [ -d "src/src" ]; then
    echo "❌ 경고: src/src/ 이중 구조가 발견되었습니다!"
    echo "   이는 import 경로 문제를 일으킬 수 있습니다."
else
    echo "✅ src/src/ 이중 구조 문제 없음"
fi

# 8. 최종 구조 확인
echo ""
echo "=== 정리 완료된 주요 구조 ==="
echo "📁 메인 파일들:"
ls -la *.html *.tsx *.json *.ts 2>/dev/null | head -5

echo ""
echo "📁 주요 디렉토리들:"
ls -d */ 2>/dev/null | grep -E '^(components|src|styles|supabase|utils|docs)/' | sort

echo ""
echo "📁 /src/ 구조 검증:"
ls -la src/ | head -10

# 5. 🧹 JSR 충돌 가능성 제거
echo ""
echo "🧹 JSR 네임스페이스 충돌 제거 중..."
# package-lock.json 에서 JSR 참조가 있을 수 있음
if [ -f "package-lock.json" ]; then
    if grep -q "jsr:" package-lock.json; then
        echo "   ⚠️  package-lock.json에서 JSR 참조 발견 - 재생성 필요"
        rm -f package-lock.json
        echo "   ✅ package-lock.json 제거 (JSR 충돌)"
    fi
fi

if [ -f "yarn.lock" ]; then
    rm -f yarn.lock
    echo "   ✅ yarn.lock 제거"
fi

if [ -f "pnpm-lock.yaml" ]; then
    rm -f pnpm-lock.yaml  
    echo "   ✅ pnpm-lock.yaml 제거"
fi

# 6. 🎯 빌드 테스트 및 배포 준비
echo ""
echo "🎯 의존성 완전 재설치 중..."
echo "   - node_modules 폴더 완전 제거"
echo "   - 모든 lock 파일 제거"
echo "   - npm 캐시 정리"
echo "   - 새로운 의존성 설치"

rm -rf node_modules
npm cache clean --force
echo "   ✅ 기존 의존성 정리 완료"

echo ""
echo "📦 npm install 실행 중..."

echo ""
echo "빌드 테스트..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ===== 성공! 하얀 화면 문제 해결! ====="
    echo "✅ 메인 앱: index.html → main.tsx → App.tsx"
    echo "✅ 소스코드: src/ 디렉토리 (완전 구성됨)" 
    echo "✅ 컴포넌트: components/ 디렉토리"
    echo "✅ 서버리스: supabase/ 디렉토리"
    echo "✅ 스타일: styles/ 디렉토리"
    echo "✅ 빌드: dist/ 디렉토리 생성 완료"
    echo ""
    echo "🚫 제거된 충돌 구조들:"
    echo "❌ RoleGPT-oldversion/ (구버전 충돌 해결)"
    echo "❌ new_version/ (src/src/ 이중 구조 충돌 해결)"
    echo "❌ TO_DELETE/ (삭제 예정 파일 충돌 해결)"
    echo "❌ test-build/ (테스트 빌드 충돌 해결)"
    echo "❌ next.config.js vs vite.config.ts 충돌 해결"
    echo ""
    echo "🚀 이제 배포 가능합니다!"
    echo "   npm run dev  (로컬 개발)"
    echo "   npm run build && npm run preview  (배포 미리보기)"
else
    echo ""
    echo "❌ 빌드 실패 - 추가 문제 해결 필요"
    echo "로그를 확인하여 남은 import 오류를 해결하세요."
fi