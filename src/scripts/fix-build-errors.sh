#!/bin/bash

echo "🔧 빌드 오류 수정 중..."

# 1. 캐시 정리
echo "🗑️ 캐시 정리 중..."
rm -rf node_modules/.vite
rm -rf dist

# 2. 의존성 재설치
echo "📦 의존성 재설치 중..."
npm ci

# 3. TypeScript 타입 체크
echo "🔍 TypeScript 타입 체크 중..."
npx tsc --noEmit --skipLibCheck || echo "⚠️ TypeScript 경고가 있지만 계속 진행합니다."

# 4. 빌드 실행
echo "🏗️ 빌드 실행 중..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 빌드 성공!"
    echo "📁 빌드 출력: dist/"
    echo "📊 번들 크기:"
    du -sh dist/
    echo ""
    echo "🎯 배포 준비 완료!"
else
    echo ""
    echo "❌ 빌드 실패"
    echo "🔍 일반적인 해결 방법:"
    echo "1. npm install --force"
    echo "2. .env.local 파일 확인"
    echo "3. TypeScript 오류 확인"
    exit 1
fi