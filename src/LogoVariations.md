# Role GPT 로고 가이드

## 선택된 로고

**기하학적 방패형 로고**를 메인 브랜드 로고로 선택했습니다.

### 로고 정보
- **파일**: `figma:asset/a68fb43a0014b2bfe230e515424245fd48949d41.png`
- **디자인**: 기하학적 방패형 모양의 모던한 디자인
- **특징**: 프로페셔널하고 신뢰감 있는 느낌, Role GPT의 안정성과 전문성을 표현

### 사용 위치
1. **메인 화면 중앙 로고** (24x24px)
2. **사이드바 헤더** (6x6px)  
3. **채팅 메시지 아바타** (4x4px)
4. **모든 앱 버전** (SimpleApp, MinimalApp 포함)

## 구현 방법

```tsx
import logo from "figma:asset/a68fb43a0014b2bfe230e515424245fd48949d41.png";

// 사용 예시
<img 
  src={logo} 
  alt="Role GPT Logo" 
  className="w-full h-full object-contain filter brightness-0 invert"
/>
```

## 스타일링 가이드

- **다크 테마**: `filter brightness-0 invert` 클래스 사용 (흰색으로 표시)
- **라이트 테마**: 필터 없이 사용 (원본 색상)
- **크기**: 용도에 따라 w-24 h-24 (메인), w-6 h-6 (사이드바), w-4 h-4 (아바타)
- **반응성**: `object-contain`으로 비율 유지