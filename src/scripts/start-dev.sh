#!/bin/bash

echo "🚀 Role GPT 개발 서버 시작..."
echo ""

# 1. 환경변수 파일 확인
if [ ! -f ".env.local" ]; then
    echo "📄 .env.local 파일이 없습니다. 예제 파일에서 복사합니다..."
    cp .env.local.example .env.local
    echo "✅ .env.local 파일이 생성되었습니다."
    echo "⚠️  필요한 환경변수를 설정해주세요!"
fi

# 2. 의존성 확인
if [ ! -d "node_modules" ]; then
    echo "📦 의존성을 설치합니다..."
    npm install
fi

# 3. TypeScript 타입 체크 (선택사항)
echo "🔍 TypeScript 타입 체크 중..."
npx tsc --noEmit --skipLibCheck || echo "⚠️ TypeScript 오류가 있지만 계속 진행합니다."

# 4. 환경변수 검증
echo "🌍 환경변수 검증 중..."
node -e "
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL=');
  const hasSupabaseProjectId = envContent.includes('VITE_SUPABASE_PROJECT_ID=');
  
  console.log('✅ 환경변수 상태:');
  console.log('  - VITE_SUPABASE_URL:', hasSupabaseUrl ? '설정됨' : '❌ 누락');
  console.log('  - VITE_SUPABASE_PROJECT_ID:', hasSupabaseProjectId ? '설정됨' : '❌ 누락');
  
  if (!hasSupabaseUrl || !hasSupabaseProjectId) {
    console.log('');
    console.log('⚠️  .env.local 파일에 필수 환경변수를 설정해주세요:');
    console.log('   VITE_SUPABASE_URL=https://thlaqsnvekvwvyasjthj.supabase.co');
    console.log('   VITE_SUPABASE_PROJECT_ID=thlaqsnvekvwvyasjthj');
  }
} catch (error) {
  console.log('❌ 환경변수 파일 읽기 실패:', error.message);
}
"

echo ""
echo "🎯 개발 서버를 시작합니다..."
echo "   URL: http://localhost:5173"
echo "   개발자 도구에서 환경변수 로그를 확인하세요."
echo ""

# 5. 개발 서버 시작
npm run dev