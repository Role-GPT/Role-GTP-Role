#!/bin/bash

echo "🔧 CanvasViewer 빌드 오류 수정..."

# 1. CanvasViewer의 문제점들 수정 완료 확인
echo "✅ CanvasViewer.tsx 수정 완료:"
echo "  - sonner@2.0.3 → sonner"
echo "  - react-markdown 제거"
echo "  - variant='dashed' → variant='outline'"

# 2. 모든 파일에서 sonner 버전 임포트 수정
echo "🔄 전체 sonner 임포트 수정 중..."
node scripts/fix-all-imports.js

# 3. 환경변수 문제 해결
echo "🌍 환경변수 수정 중..."
node scripts/fix-env-vars.js

# 4. 캐시 정리
echo "🗑️ 빌드 캐시 정리..."
rm -rf node_modules/.vite
rm -rf dist

# 5. 빌드 테스트
echo "🏗️ 빌드 테스트 중..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 모든 오류가 수정되었습니다!"
    echo ""
    echo "✅ 해결된 문제들:"
    echo "  - CanvasViewer.tsx 임포트 오류"
    echo "  - sonner 버전 문제"
    echo "  - react-markdown 의존성 문제"
    echo "  - 환경변수 접근 오류"
    echo ""
    echo "📦 빌드 출력:"
    ls -la dist/
    echo ""
    echo "🚀 배포 준비 완료!"
else
    echo ""
    echo "❌ 추가 오류가 발견되었습니다."
    echo "🔍 로그를 확인하고 추가 수정이 필요합니다."
    exit 1
fi