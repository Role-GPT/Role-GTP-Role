#!/bin/bash

# Role GPT 프로젝트 정리 스크립트
# 개발/테스트용 파일들을 제거합니다

echo "🧹 Role GPT 프로젝트 정리를 시작합니다..."

# 개발용 앱 컴포넌트 제거
echo "📱 개발용 앱 컴포넌트 제거 중..."
rm -f MinimalApp.tsx
rm -f SimpleApp.tsx
rm -f TestAccountModal.tsx
rm -f complete_sidebar.tsx

# 임시 파일들 제거
echo "🗑️ 임시 파일들 제거 중..."
rm -f check_chatbar_end.txt
rm -f temp_search.txt
rm -f metadata.json

# 중복 API 파일 제거
echo "🔗 중복 API 파일 제거 중..."
rm -f api/chat.js

# 개발용 컴포넌트 제거
echo "⚛️ 개발용 컴포넌트 제거 중..."
rm -f components/AdvancedCarouselDemo.tsx
rm -f components/CarouselFeatureDemo.tsx
rm -f components/ChatSidebarSimple.tsx
rm -f components/ChatSidebarWithHover.tsx
rm -f components/MobileRandomRoleCarousel.tsx

# 테스트 빌드 폴더 제거
echo "🏗️ 테스트 빌드 폴더 제거 중..."
rm -rf test-build/

# 개발 메타데이터 제거
echo "📋 개발 메타데이터 제거 중..."
rm -f LogoVariations.md
rm -f Attributions.md

echo "✅ 프로젝트 정리 완료!"
echo ""
echo "📊 정리 결과:"
echo "- 개발용 앱 컴포넌트: 4개 제거"
echo "- 임시 파일: 3개 제거"
echo "- 개발용 컴포넌트: 5개 제거"
echo "- 테스트 빌드 폴더: 1개 제거"
echo "- 메타데이터 파일: 2개 제거"
echo ""
echo "🚀 이제 프로덕션 준비가 완료된 깔끔한 프로젝트입니다!"