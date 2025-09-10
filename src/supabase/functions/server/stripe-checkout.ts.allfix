/**
 * Stripe 체크아웃 세션 생성 서버리스 함수
 */

import { Hono } from 'npm:hono';

const stripeCheckoutApp = new Hono();

// Stripe 체크아웃 세션 생성
stripeCheckoutApp.post('/create-checkout-session', async (c) => {
  try {
    const { priceId, userId, email, successUrl, cancelUrl } = await c.req.json();
    
    if (!priceId) {
      return c.json({ error: 'Price ID가 필요합니다' }, 400);
    }

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe 설정이 완료되지 않았습니다' }, 500);
    }

    // Stripe 세션 생성 요청
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'success_url': successUrl || `${c.req.header('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': cancelUrl || `${c.req.header('origin')}/cancel`,
        'customer_email': email || '',
        'metadata[user_id]': userId || '',
        'metadata[price_id]': priceId,
        'allow_promotion_codes': 'true',
        'automatic_tax[enabled]': 'false'
      })
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.json();
      console.error('Stripe 체크아웃 세션 생성 오류:', error);
      return c.json({ error: '결제 세션 생성에 실패했습니다' }, 500);
    }

    const session = await stripeResponse.json();
    
    console.log('✅ Stripe 체크아웃 세션 생성 완료:', session.id);
    
    return c.json({
      sessionId: session.id,
      url: session.url,
      success: true
    });

  } catch (error) {
    console.error('체크아웃 세션 생성 중 오류:', error);
    return c.json({ error: '결제 세션 생성 중 오류가 발생했습니다' }, 500);
  }
});

// Stripe 고객 포털 세션 생성 (구독 관리)
stripeCheckoutApp.post('/create-portal-session', async (c) => {
  try {
    const { customerId, returnUrl } = await c.req.json();
    
    if (!customerId) {
      return c.json({ error: 'Customer ID가 필요합니다' }, 400);
    }

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe 설정이 완료되지 않았습니다' }, 500);
    }

    // Stripe 포털 세션 생성 요청
    const stripeResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'customer': customerId,
        'return_url': returnUrl || c.req.header('origin')
      })
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.json();
      console.error('Stripe 포털 세션 생성 오류:', error);
      return c.json({ error: '구독 관리 포털 생성에 실패했습니다' }, 500);
    }

    const session = await stripeResponse.json();
    
    console.log('✅ Stripe 포털 세션 생성 완료:', session.id);
    
    return c.json({
      url: session.url,
      success: true
    });

  } catch (error) {
    console.error('포털 세션 생성 중 오류:', error);
    return c.json({ error: '구독 관리 포털 생성 중 오류가 발생했습니다' }, 500);
  }
});

export { stripeCheckoutApp };