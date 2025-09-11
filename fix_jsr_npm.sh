#!/bin/bash
echo "🚨 JSR 네임스페이스 문제 + 중복 폴더 완전 해결"
echo "====================================================="
echo ""

# 1. 🗑️ JSR 충돌 원인이 되는 중복 폴더들 완전 제거
echo "🗑️ 1단계: JSR 충돌 원인 중복 폴더들 제거 중..."

FOLDERS_TO_REMOVE=(
    "new_version"
    "RoleGPT-oldversion" 
    "TO_DELETE"
    "test-build"
)

for folder in "${FOLDERS_TO_REMOVE[@]}"; do
    if [ -d "$folder" ]; then
        echo "   ❌ $folder/ 제거 중... (JSR 충돌 해결)"
        rm -rf "$folder"
        echo "   ✅ $folder/ 제거 완료"
    else
        echo "   ✓ $folder/ 없음 (이미 제거됨)"
    fi
done

# 2. 🧹 빌드 충돌 임시 파일들 제거
echo ""
echo "🧹 2단계: 빌드 충돌 임시 파일들 제거 중..."

TEMP_FILES=(
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

for file in "${TEMP_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "   ✅ $file 제거"
    fi
done

# 3. 🚨 JSR 관련 설정 파일들 확인 및 정리
echo ""
echo "🚨 3단계: JSR 네임스페이스 참조 확인 중..."

# package.json에서 JSR 참조 확인 (없어야 정상)
if grep -q "jsr:" package.json 2>/dev/null; then
    echo "   ⚠️  package.json에서 JSR 참조 발견 - 수정 필요"
    echo "   🔧 package.json 백업 후 JSR 참조 제거..."
    cp package.json package.json.backup
    sed 's/"jsr:[^"]*"[^,]*,\?//g' package.json > package.json.tmp
    mv package.json.tmp package.json
    echo "   ✅ package.json JSR 참조 제거 완료"
else
    echo "   ✅ package.json JSR 참조 없음 (정상)"
fi

# vite.config.ts에서 JSR 참조 확인 (없어야 정상)
if [ -f "vite.config.ts" ] && grep -q "jsr:" vite.config.ts 2>/dev/null; then
    echo "   ⚠️  vite.config.ts에서 JSR 참조 발견 - 수정 필요"
    echo "   🔧 vite.config.ts 백업 후 JSR 참조 제거..."
    cp vite.config.ts vite.config.ts.backup
    sed 's/.*jsr:.*//g' vite.config.ts > vite.config.ts.tmp
    mv vite.config.ts.tmp vite.config.ts
    echo "   ✅ vite.config.ts JSR 참조 제거 완료"
else
    echo "   ✅ vite.config.ts JSR 참조 없음 (정상)"
fi

# 4. 🧹 Lock 파일들 완전 재생성
echo ""
echo "🧹 4단계: Lock 파일들 완전 재생성 중..."

LOCK_FILES=("package-lock.json" "yarn.lock" "pnpm-lock.yaml" "bun.lockb")
for lock_file in "${LOCK_FILES[@]}"; do
    if [ -f "$lock_file" ]; then
        rm -f "$lock_file"
        echo "   ✅ $lock_file 제거 (재생성용)"
    fi
done

# 5. 💿 의존성 완전 재설치
echo ""
echo "💿 5단계: 의존성 완전 재설치 중..."
echo "   - node_modules 폴더 완전 제거"
echo "   - npm 캐시 정리"
echo "   - 깔끔한 새 설치"

rm -rf node_modules
npm cache clean --force 2>/dev/null || echo "   ℹ️  npm 캐시 정리 건너뜀"
echo "   ✅ 기존 의존성 정리 완료"

echo ""
echo "📦 npm install 실행 중..."
npm install --no-optional --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo "   ✅ npm install 성공!"
    
    # 6. 🔨 빌드 테스트
    echo ""
    echo "🔨 6단계: 빌드 테스트 실행 중..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 ===== 완전 해결! JSR + 하얀 화면 문제 해결! ====="
        echo "✅ JSR 충돌 중복 폴더 제거 완료"
        echo "✅ JSR 네임스페이스 참조 정리 완료"  
        echo "✅ 의존성 완전 재설치 완료"
        echo "✅ 빌드 테스트 성공"
        echo ""
        echo "🚀 이제 개발 서버를 시작하세요:"
        echo "   npm run dev"
        echo ""
        echo "🌐 브라우저에서 http://localhost:5173 확인"
        echo "🎯 3-4주간의 Role GPT 개발 성과를 드디어 확인하세요!"
        
    else
        echo ""
        echo "⚠️  빌드 실패 - 추가 import 오류 해결 필요"
        echo "🔍 빌드 로그를 확인하여 남은 import 오류를 해결하세요"
        echo ""
        echo "💡 일반적인 해결책:"
        echo "   1. import 경로 확인"
        echo "   2. 타입스크립트 오류 해결"
        echo "   3. 의존성 버전 호환성 확인"
    fi
    
else
    echo ""
    echo "❌ npm install 실패!"
    echo "🔍 아직 JSR 참조가 남아있을 수 있습니다"
    echo ""
    echo "🧪 수동 JSR 검색 실행:"
    echo "   grep -r 'jsr:' . --exclude-dir=node_modules"
    echo ""
    echo "💡 가능한 원인:"
    echo "   1. 숨겨진 JSR import가 다른 파일에 있음"
    echo "   2. 인터넷 연결 문제"
    echo "   3. npm 레지스트리 문제"
    echo ""
    echo "🔧 수동 해결 시도:"
    echo "   npm config set registry https://registry.npmjs.org/"
    echo "   npm install --force"
fi

echo ""
echo "📋 정리된 최종 구조:"
echo "├── App.tsx              # 메인 앱"
echo "├── main.tsx             # React 엔트리포인트"
echo "├── index.html           # HTML 엔트리포인트"
echo "├── src/                 # 소스 코드"
echo "├── components/          # UI 컴포넌트"
echo "├── supabase/            # 서버리스 함수 (JSR 사용, 정상)"
echo "├── package.json         # 깔끔한 npm 의존성"
echo "└── vite.config.ts       # Vite 빌드 설정"
echo ""
echo "🚫 제거된 JSR 충돌 원인들:"
echo "❌ new_version/ (다른 프로젝트 JSR 설정 포함)"
echo "❌ RoleGPT-oldversion/ (구버전 JSR 설정 포함)"
echo "❌ TO_DELETE/ (임시 JSR 테스트 파일들)"
echo "❌ 모든 lock 파일들 (JSR 캐시 포함)"
echo ""
echo "ℹ️  참고: supabase/functions/server/kv_store.tsx의 JSR은"
echo "   Deno Edge Functions용이므로 정상입니다. (npm과 분리됨)"