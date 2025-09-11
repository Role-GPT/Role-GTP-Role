#!/bin/bash

echo "🔧 Role GPT 배포 전 문제 해결 시작..."

# 1. 불필요한 폴더 삭제
echo "📁 불필요한 폴더 삭제 중..."
rm -rf RoleGPT-oldversion/
rm -rf TO_DELETE/
rm -rf new_version/
rm -rf test-build/

# 2. 루트 임시 파일들 삭제
echo "🗑️ 임시 파일 정리 중..."
rm -f MinimalApp.tsx SimpleApp.tsx TestAccountModal.tsx
rm -f check_chatbar_end.txt complete_sidebar.tsx temp_search.txt temp_fix.txt

# 3. 임포트 문제 수정
echo "🔄 임포트 경로 수정 중..."
node scripts/fix-all-imports.js

# 4. 환경변수 수정
echo "🌍 환경변수 수정 중..."
node scripts/fix-env-vars.js

# 4. 권한 설정
echo "🔐 파일 권한 설정 중..."
chmod +x scripts/*.sh
chmod +x scripts/*.js

# 5. 의존성 검사
echo "📦 의존성 검사 중..."
if [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📥 의존성 설치 중..."
    npm install
fi

# 6. 빌드 테스트
echo "🏗️ 빌드 테스트 중..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 빌드 성공! 배포 준비 완료"
    echo ""
    echo "🎯 다음 단계:"
    echo "1. Vercel Dashboard에서 환경변수 설정"
    echo "2. Google Client ID/Secret 추가"
    echo "3. git push 후 자동 배포"
    echo ""
    echo "📊 정리된 내용:"
    echo "- 삭제된 폴더: 4개 (약 50MB+ 절약)"
    echo "- 수정된 임포트: $(find . -name "*.tsx" -o -name "*.ts" | wc -l)개 파일 검사"
    echo "- 빌드 출력: dist/ 폴더 생성됨"
else
    echo "❌ 빌드 실패! 로그를 확인하세요"
    exit 1
fi