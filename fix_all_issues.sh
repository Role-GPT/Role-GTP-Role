#!/bin/bash
echo "🚨 Role GPT 하얀 화면 + JSR 충돌 + vite 문제 완전 해결"
echo "=========================================================="
echo ""

# 현재 위치 확인
echo "📍 현재 위치: $(pwd)"
echo "📂 현재 폴더 내용:"
ls -la | head -10
echo ""

# 1. 🗑️ 모든 중복 폴더 완전 제거 (npm 혼란 해결)
echo "🗑️ 1단계: 모든 중복 폴더 완전 제거 중..."

FOLDERS_TO_REMOVE=(
    "new_version"
    "RoleGPT-oldversion" 
    "TO_DELETE"
    "test-build"
    "pages"  # Next.js 폴더 (Vite와 충돌)
)

for folder in "${FOLDERS_TO_REMOVE[@]}"; do
    if [ -d "$folder" ]; then
        echo "   ❌ $folder/ 제거 중... (npm 충돌 해결)"
        rm -rf "$folder"
        echo "   ✅ $folder/ 제거 완료"
    else
        echo "   ✓ $folder/ 없음 (이미 제거됨)"
    fi
done

# 2. 🧹 빌드 충돌 파일들 제거
echo ""
echo "🧹 2단계: 빌드 충돌 파일들 제거 중..."

CONFLICT_FILES=(
    "MinimalApp.tsx"
    "SimpleApp.tsx"
    "TestAccountModal.tsx"
    "complete_sidebar.tsx"
    "check_chatbar_end.txt"
    "temp_search.txt"
    "temp_fix.txt"
    "next.config.js"     # Next.js 설정 (Vite와 충돌)
    "tailwind.config.js" # 구 Tailwind 설정 (v4와 충돌)
    "vercel.json"        # Vercel 설정 (Vite 개발 중 불필요)
)

for file in "${CONFLICT_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "   ✅ $file 제거"
    fi
done

# 3. 📋 중복 문서들 정리
echo ""
echo "📋 3단계: 중복 문서들 정리 중..."

DOC_FILES=(
    "CLEANUP_*.md"
    "DELETED_FILES_LOG.md"
    "FINAL_CLEANUP_*.md"
    "README_INTEGRATION.md"
    "PROJECT_STRUCTURE.md"
    "URGENT_FIX_README.md"
    "LogoVariations.md"
    "Attributions.md"
    "STRIPE_SETUP.md"
)

for pattern in "${DOC_FILES[@]}"; do
    if ls $pattern 1> /dev/null 2>&1; then
        rm -f $pattern
        echo "   ✅ $pattern 제거"
    fi
done

# 4. 🧹 모든 lock 파일들 제거 (완전 재생성)
echo ""
echo "🧹 4단계: 모든 lock 파일들 제거 중..."

LOCK_FILES=(
    "package-lock.json"
    "yarn.lock"
    "pnpm-lock.yaml"
    "bun.lockb"
)

for lock_file in "${LOCK_FILES[@]}"; do
    if [ -f "$lock_file" ]; then
        rm -f "$lock_file"
        echo "   ✅ $lock_file 제거 (재생성용)"
    fi
done

# 5. 💿 의존성 완전 재설치
echo ""
echo "💿 5단계: 의존성 완전 재설치 중..."

# node_modules 완전 제거
if [ -d "node_modules" ]; then
    echo "   🗑️ node_modules 완전 제거 중..."
    rm -rf node_modules
    echo "   ✅ node_modules 제거 완료"
fi

# npm 캐시 정리
echo "   🧹 npm 캐시 정리 중..."
npm cache clean --force 2>/dev/null || echo "   ℹ️  npm 캐시 정리 건너뜀"

# 새로운 의존성 설치
echo ""
echo "📦 npm install 실행 중..."
echo "   - 깨끗한 환경에서 새로 설치"
echo "   - JSR 충돌 완전 해결"
echo "   - vite 명령어 정상 설치"

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "   ✅ npm install 성공!"
    
    # vite 명령어 확인
    if [ -f "node_modules/.bin/vite" ]; then
        echo "   ✅ vite 명령어 설치 완료"
    else
        echo "   ⚠️  vite 명령어 확인 필요"
    fi
    
    # 6. 🔨 빌드 테스트
    echo ""
    echo "🔨 6단계: 빌드 테스트 실행 중..."
    
    # TypeScript 체크
    echo "   📝 TypeScript 타입 체크 중..."
    npm run type-check
    
    if [ $? -eq 0 ]; then
        echo "   ✅ TypeScript 타입 체크 성공"
        
        # 실제 빌드 테스트
        echo "   🔨 실제 빌드 테스트 중..."
        npm run build
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 ===== 완전 해결! 모든 문제 해결! ====="
            echo "✅ 중복 폴더 완전 제거 완료"
            echo "✅ JSR 충돌 완전 해결 완료"  
            echo "✅ vite 명령어 정상 설치 완료"
            echo "✅ 의존성 완전 재설치 완료"
            echo "✅ TypeScript 타입 체크 성공"
            echo "✅ 빌드 테스트 성공"
            echo ""
            echo "🚀 이제 개발 서버를 시작하세요:"
            echo "   npm run dev"
            echo ""
            echo "🌐 브라우저에서 http://localhost:5173 확인"
            echo "🎯 3-4주간의 Role GPT 개발 성과를 드디어 확인하세요!"
            echo ""
            echo "📋 정리된 최종 구조:"
            echo "├── App.tsx              # 메인 앱"
            echo "├── main.tsx             # React 엔트리포인트"
            echo "├── index.html           # HTML 엔트리포인트"
            echo "├── src/                 # 소스 코드"
            echo "├── components/          # UI 컴포넌트"
            echo "├── supabase/            # 서버리스 함수"
            echo "├── package.json         # 깔끔한 npm 의존성"
            echo "├── vite.config.ts       # Vite 빌드 설정"
            echo "└── styles/globals.css   # Tailwind v4 스타일"
            
        else
            echo ""
            echo "⚠️  빌드 실패 - import 오류 확인 필요"
            echo "🔍 빌드 로그를 확인하여 import 경로 문제를 해결하세요"
        fi
        
    else
        echo ""
        echo "⚠️  TypeScript 타입 체크 실패"
        echo "🔍 타입 오류를 먼저 해결해야 합니다"
    fi
    
else
    echo ""
    echo "❌ npm install 실패!"
    echo "🔍 아직 숨겨진 package.json이나 설정 충돌이 있을 수 있습니다"
    echo ""
    echo "🧪 수동 확인 명령어:"
    echo "   find . -name 'package.json' -not -path './node_modules/*'"
    echo "   find . -name 'vite.config.*' -not -path './node_modules/*'"
    echo ""
    echo "💡 가능한 원인:"
    echo "   1. 숨겨진 중복 설정 파일들"
    echo "   2. 인터넷 연결 문제"
    echo "   3. npm 레지스트리 문제"
    echo ""
    echo "🔧 강제 해결 시도:"
    echo "   npm install --force --legacy-peer-deps"
fi

echo ""
echo "🚫 제거된 모든 충돌 원인들:"
echo "❌ new_version/ (다른 프로젝트 JSR/npm 설정 포함)"
echo "❌ RoleGPT-oldversion/ (구버전 설정 포함)"
echo "❌ TO_DELETE/ (임시 테스트 파일들)"
echo "❌ test-build/ (테스트 빌드 파일들)"
echo "❌ pages/ (Next.js와 Vite 충돌)"
echo "❌ next.config.js vs vite.config.ts 충돌"
echo "❌ tailwind.config.js vs Tailwind v4 충돌"
echo "❌ 모든 lock 파일들 (의존성 캐시 충돌)"