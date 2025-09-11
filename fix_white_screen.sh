#!/bin/bash
echo "🚨 Role GPT 하얀 화면 긴급 수술 스크립트"
echo "=================================="
echo ""

# 1. 현재 import 경로 확인
echo "🔍 1. App.tsx import 경로 확인 중..."
if [ -f "App.tsx" ]; then
    echo "✅ App.tsx 존재"
    grep -n "from '\./src/" App.tsx | head -5
else
    echo "❌ App.tsx 파일 없음!"
    exit 1
fi

echo ""

# 2. 실제 파일 존재 확인
echo "🔍 2. 필수 파일들 존재 확인..."
FILES_TO_CHECK=(
    "src/utils/devUtils.ts"
    "src/context/AppContext.tsx"
    "src/hooks/useAppHandlers.ts"
    "src/types.ts"
    "components/ChatSidebar.tsx"
    "components/ChatMain.tsx"
    "styles/globals.css"
)

ALL_EXIST=true
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file 누락!"
        ALL_EXIST=false
    fi
done

if [ "$ALL_EXIST" = false ]; then
    echo ""
    echo "❌ 필수 파일들이 누락되었습니다!"
    echo "복구가 필요합니다."
    exit 1
fi

echo ""
echo "✅ 모든 필수 파일 존재 확인됨"

# 3. 빌드 설정 확인
echo ""
echo "🔍 3. 빌드 설정 확인..."
if [ -f "vite.config.ts" ]; then
    echo "✅ vite.config.ts 존재"
else
    echo "❌ vite.config.ts 누락!"
    exit 1
fi

if [ -f "package.json" ]; then
    echo "✅ package.json 존재"
else
    echo "❌ package.json 누락!"
    exit 1
fi

# 4. 의존성 재설치
echo ""
echo "🔄 4. 의존성 완전 재설치..."
rm -rf node_modules package-lock.json yarn.lock .vite
npm cache clean --force
npm install

# 5. 개발 서버 테스트
echo ""
echo "🚀 5. 개발 서버 테스트 시작..."
echo "잠시 후 브라우저에서 http://localhost:5173 확인하세요"
echo ""
echo "만약 여전히 하얀 화면이 나온다면:"
echo "1. 브라우저 개발자 도구 콘솔 확인"
echo "2. Network 탭에서 파일 로드 실패 확인"
echo "3. Ctrl+C로 중단 후 다시 실행"
echo ""

# 백그라운드에서 개발 서버 시작
npm run dev &
DEV_PID=$!

echo "개발 서버 PID: $DEV_PID"
echo "중단하려면: kill $DEV_PID"
echo ""

# 5초 후 상태 확인
sleep 5

if kill -0 $DEV_PID 2>/dev/null; then
    echo "✅ 개발 서버가 성공적으로 시작되었습니다!"
    echo "🌐 http://localhost:5173 에서 확인하세요"
    echo ""
    echo "하얀 화면이 여전히 나온다면 브라우저 콘솔을 확인하세요."
else
    echo "❌ 개발 서버 시작 실패!"
    echo "npm run dev를 수동으로 실행하여 오류를 확인하세요."
fi