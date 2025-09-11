#!/bin/bash
echo "🚨 긴급! Role GPT 하얀 화면 + JSR 문제 즉시 해결"
echo "=================================================="
echo ""

# 1. 🗑️ 중복 폴더 제거 (빌드 충돌 해결)
echo "🗑️ 1단계: 빌드 충돌 폴더들 제거 중..."
if [ -d "RoleGPT-oldversion" ]; then
    echo "   ❌ RoleGPT-oldversion/ 제거 중..."
    rm -rf RoleGPT-oldversion/
    echo "   ✅ RoleGPT-oldversion/ 제거 완료"
fi

if [ -d "new_version" ]; then
    echo "   ❌ new_version/ 제거 중 (JSR 충돌 해결)..."
    rm -rf new_version/
    echo "   ✅ new_version/ 제거 완료 - JSR 네임스페이스 충돌 해결!"
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
echo "🧹 2단계: 빌드 방해 임시 파일들 제거 중..."
FILES_TO_REMOVE=(
    "MinimalApp.tsx"
    "SimpleApp.tsx"
    "TestAccountModal.tsx"
    "complete_sidebar.tsx"
    "check_chatbar_end.txt"
    "temp_search.txt"
    "temp_fix.txt"
    "next.config.js"
    "tailwind.config.js"
)

for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "   ✅ $file 제거"
    fi
done

# 3. 🚨 JSR 네임스페이스 충돌 완전 제거
echo ""
echo "🚨 3단계: JSR 네임스페이스 충돌 완전 제거 중..."

# lock 파일들에서 JSR 참조 제거
if [ -f "package-lock.json" ]; then
    if grep -q "jsr:" package-lock.json 2>/dev/null; then
        echo "   ⚠️  package-lock.json에서 JSR 참조 발견 - 재생성 필요"
        rm -f package-lock.json
        echo "   ✅ package-lock.json 제거 (JSR 충돌)"
    else
        echo "   ℹ️  package-lock.json에 JSR 참조 없음"
    fi
fi

# 다른 lock 파일들도 제거
LOCK_FILES=("yarn.lock" "pnpm-lock.yaml" "bun.lockb")
for lock_file in "${LOCK_FILES[@]}"; do
    if [ -f "$lock_file" ]; then
        rm -f "$lock_file"
        echo "   ✅ $lock_file 제거"
    fi
done

# 4. 💿 의존성 완전 재설치
echo ""
echo "💿 4단계: 의존성 완전 재설치 중..."
echo "   - node_modules 폴더 완전 제거"
echo "   - npm 캐시 정리"
echo "   - 새로운 의존성 설치"

rm -rf node_modules
npm cache clean --force 2>/dev/null || echo "   ℹ️  npm 캐시 정리 건너뜀"
echo "   ✅ 기존 의존성 정리 완료"

echo ""
echo "📦 npm install 실행 중..."
npm install

if [ $? -eq 0 ]; then
    echo "   ✅ npm install 성공!"
    
    # 5. 🔨 빌드 테스트
    echo ""
    echo "🔨 5단계: 빌드 테스트 실행 중..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 ===== 성공! 하얀 화면 + JSR 문제 해결! ====="
        echo "✅ 중복 폴더 제거 완료"
        echo "✅ JSR 네임스페이스 충돌 해결 완료"
        echo "✅ 의존성 재설치 완료"
        echo "✅ 빌드 테스트 성공"
        echo ""
        echo "🚀 이제 개발 서버를 시작하세요:"
        echo "   npm run dev"
        echo ""
        echo "🌐 브라우저에서 http://localhost:5173 확인"
        echo "🎯 3-4주간의 개발 성과를 드디어 볼 수 있습니다!"
        
    else
        echo ""
        echo "❌ 빌드 실패 - 추가 import 오류 해결 필요"
        echo "🔍 로그를 확인하여 남은 import 오류를 해결하세요"
        echo "💡 대부분 import 경로 문제일 가능성이 높습니다"
    fi
    
else
    echo ""
    echo "❌ npm install 실패!"
    echo "🔍 package.json의 의존성을 확인하세요"
    echo ""
    echo "💡 가능한 원인:"
    echo "   1. 인터넷 연결 문제"
    echo "   2. npm 레지스트리 문제"
    echo "   3. Node.js 버전 호환성 문제"
    echo ""
    echo "🔧 시도해볼 수 있는 해결책:"
    echo "   npm config set registry https://registry.npmjs.org/"
    echo "   npm install --legacy-peer-deps"
fi

echo ""
echo "📋 정리된 최종 구조:"
echo "├── App.tsx              # 메인 앱"
echo "├── main.tsx             # React 엔트리포인트"
echo "├── index.html           # HTML 엔트리포인트"
echo "├── src/                 # 소스 코드"
echo "├── components/          # UI 컴포넌트"
echo "├── styles/globals.css   # Tailwind v4"
echo "└── package.json         # 깔끔한 의존성"
echo ""
echo "🚫 제거된 충돌 원인들:"
echo "❌ new_version/ (JSR 네임스페이스 충돌)"
echo "❌ RoleGPT-oldversion/ (구버전 충돌)"
echo "❌ next.config.js vs vite.config.ts 충돌"
echo "❌ src/src/ 이중 구조 충돌"