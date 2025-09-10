# 🚀 Stripe 결제 시스템 설정 가이드

Role GPT에 Stripe 결제 시스템이 성공적으로 구현되었습니다! 이제 실제 운영을 위해 다음 단계를 완료하세요.

## 📋 설정 체크리스트

### 1. ✅ Stripe Dashboard에서 제품 및 가격 생성

**Stripe Dashboard → Products → Add Product에서 다음 3개 플랜을 생성하세요:**

#### Standard 플랜
- **제품명**: Role GPT Standard
- **가격**: $9.99/월
- **Type**: Recurring
- **Price ID 복사**: `price_XXXXXXXXXXXXXXXXXXXX`

#### Advanced 플랜  
- **제품명**: Role GPT Advanced
- **가격**: $19.99/월  
- **Type**: Recurring
- **Price ID 복사**: `price_YYYYYYYYYYYYYYYYYYYY`

#### Expert 플랜
- **제품명**: Role GPT Expert
- **가격**: $39.99/월
- **Type**: Recurring  
- **Price ID 복사**: `price_ZZZZZZZZZZZZZZZZZZZZ`

### 2. ✅ 환경변수 설정 

**Vercel Dashboard → Settings → Environment Variables에 다음 값들을 추가하세요:**

```bash
# Stripe API 키들
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price ID들 (Stripe Dashboard에서 생성한 실제 값으로 교체)
VITE_STRIPE_PRICE_STANDARD=price_...
VITE_STRIPE_PRICE_ADVANCED=price_...
VITE_STRIPE_PRICE_EXPERT=price_...

# Supabase 정보 (이미 설정됨)
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. 🔗 웹훅 엔드포인트 설정

**Stripe Dashboard → Developers → Webhooks → Add endpoint:**

**웹훅 URL**: `https://rolegpt.vercel.app/api/stripe-webhook`

> 💡 이 URL은 Vercel API Route를 통해 Supabase 서버리스 함수로 자동 전달됩니다.

**수신할 이벤트들**:
- `checkout.session.completed` ✅
- `invoice.payment_succeeded` ✅
- `customer.subscription.updated` ✅
- `customer.subscription.deleted` ✅
- `invoice.payment_failed` ✅

**웹훅 시크릿 복사**: `whsec_...` → `STRIPE_WEBHOOK_SECRET` 환경변수에 추가

### 4. 📝 Price ID 업데이트

`/src/services/stripeService.ts` 파일에서 실제 Price ID로 교체:

```typescript
export const STRIPE_PRICES = {
  STANDARD: 'price_실제_Standard_ID_여기',
  ADVANCED: 'price_실제_Advanced_ID_여기', 
  EXPERT: 'price_실제_Expert_ID_여기',
} as const;
```

### 5. ✅ Billing Portal 활성화

**Stripe Dashboard → Settings → Billing → Customer portal:**
- **Activate customer portal** 체크
- **Return URL**: `https://yourdomain.com` 

## 🎯 구현된 기능들

### ✅ 결제 플로우
- 3개 플랜 선택 (Standard/Advanced/Expert)
- Stripe Checkout 세션 생성  
- 안전한 결제 처리
- 성공/취소 페이지 리다이렉트

### ✅ 구독 관리
- 실시간 구독 상태 확인
- 자동 갱신 처리
- 결제 실패 처리
- 구독 취소 처리

### ✅ 보안
- 서버리스 함수에서 안전한 처리
- Webhook 서명 검증
- 민감한 키 숨김

### ✅ 사용자 경험
- 직관적인 업그레이드 모달
- 실시간 구독 상태 표시
- 깔끔한 성공/실패 페이지

## 🔧 테스트 방법

### 1. 테스트 모드에서 확인
```bash
# Stripe CLI 설치 후
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 2. 테스트 카드 사용
- **성공**: 4242 4242 4242 4242
- **실패**: 4000 0000 0000 0002

### 3. 웹훅 테스트
```bash
stripe trigger checkout.session.completed
```

## 📊 데이터베이스 스키마

구독 정보는 Supabase KV Store에 저장됩니다:

```typescript
// key: subscription:${userId}
{
  user_id: string,
  customer_id: string,
  subscription_id: string, 
  price_id: string,
  status: 'active' | 'canceled' | 'expired',
  current_period_start: string,
  current_period_end: string,
  created_at: string,
  updated_at: string
}
```

## 🚨 운영 전 필수 확인사항

1. **실제 Price ID 교체** ✅
2. **웹훅 엔드포인트 등록** ✅  
3. **환경변수 설정** ✅
4. **테스트 모드에서 전체 플로우 테스트** ⏳
5. **운영 모드로 전환** ⏳

## 📞 지원

구현된 결제 시스템에 대한 문의사항이 있으시면:
- 기술 문의: 개발팀
- Stripe 관련: Stripe 고객지원

---

**🎉 축하합니다! Role GPT의 Stripe 결제 시스템이 완전히 구현되었습니다!**