/**
 * Stripe 웹훅 처리 서버리스 함수
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const stripeWebhookApp = new Hono();

// Stripe 서명 검증
async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const elements = signature.split(',');
    const timestamp = elements.find(element => element.startsWith('t='))?.substring(2);
    const stripeSignature = elements.find(element => element.startsWith('v1='))?.substring(3);
    
    if (!timestamp || !stripeSignature) {
      return false;
    }

    const payload = timestamp + '.' + body;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature_bytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(signature_bytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return expectedSignature === stripeSignature;
  } catch (error) {
    console.error('서명 검증 오류:', error);
    return false;
  }
}

// 웹훅 이벤트 처리
stripeWebhookApp.post('/webhook', async (c) => {
  try {
    const signature = c.req.header('stripe-signature');
    const body = await c.req.text();
    
    if (!signature) {
      return c.json({ error: 'Stripe 서명이 없습니다' }, 400);
    }

    const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!STRIPE_WEBHOOK_SECRET) {
      return c.json({ error: 'Webhook 시크릿이 설정되지 않았습니다' }, 500);
    }

    // 서명 검증
    const isValid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);
    if (!isValid) {
      console.error('유효하지 않은 Stripe 서명');
      return c.json({ error: '유효하지 않은 서명' }, 401);
    }

    const event = JSON.parse(body);
    console.log('🎯 Stripe 웹훅 이벤트 수신:', event.type);

    // 이벤트 타입별 처리
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      default:
        console.log('처리되지 않은 이벤트 타입:', event.type);
    }

    return c.json({ received: true });

  } catch (error) {
    console.error('웹훅 처리 중 오류:', error);
    return c.json({ error: '웹훅 처리 중 오류가 발생했습니다' }, 500);
  }
});

// 체크아웃 완료 처리
async function handleCheckoutCompleted(session: any) {
  try {
    const userId = session.metadata?.user_id;
    const priceId = session.metadata?.price_id;
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    
    if (!userId) {
      console.warn('체크아웃 세션에 사용자 ID가 없음:', session.id);
      return;
    }

    // 구독 정보 저장
    const subscriptionData = {
      user_id: userId,
      customer_id: customerId,
      subscription_id: subscriptionId,
      price_id: priceId,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`subscription:${userId}`, subscriptionData);
    await kv.set(`customer:${customerId}`, { user_id: userId, customer_id: customerId });
    
    console.log('✅ 구독 생성 완료:', userId, subscriptionId);
    
    // 사용자 모드 업데이트 (licensed로 변경)
    await kv.set(`user_mode:${userId}`, 'licensed');
    
  } catch (error) {
    console.error('체크아웃 완료 처리 오류:', error);
  }
}

// 결제 성공 처리
async function handlePaymentSucceeded(invoice: any) {
  try {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;
    
    // 고객 정보 조회
    const customerData = await kv.get(`customer:${customerId}`);
    if (!customerData) {
      console.warn('고객 정보를 찾을 수 없음:', customerId);
      return;
    }

    const userId = customerData.user_id;
    
    // 구독 상태 업데이트
    const subscriptionData = await kv.get(`subscription:${userId}`);
    if (subscriptionData) {
      subscriptionData.status = 'active';
      subscriptionData.current_period_start = new Date(invoice.period_start * 1000).toISOString();
      subscriptionData.current_period_end = new Date(invoice.period_end * 1000).toISOString();
      subscriptionData.updated_at = new Date().toISOString();
      
      await kv.set(`subscription:${userId}`, subscriptionData);
      console.log('✅ 결제 성공 - 구독 갱신:', userId);
    }
    
  } catch (error) {
    console.error('결제 성공 처리 오류:', error);
  }
}

// 구독 업데이트 처리
async function handleSubscriptionUpdated(subscription: any) {
  try {
    const customerId = subscription.customer;
    
    // 고객 정보 조회
    const customerData = await kv.get(`customer:${customerId}`);
    if (!customerData) {
      console.warn('고객 정보를 찾을 수 없음:', customerId);
      return;
    }

    const userId = customerData.user_id;
    
    // 구독 정보 업데이트
    const subscriptionData = await kv.get(`subscription:${userId}`) || {};
    subscriptionData.status = subscription.status;
    subscriptionData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString();
    subscriptionData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
    subscriptionData.updated_at = new Date().toISOString();
    
    await kv.set(`subscription:${userId}`, subscriptionData);
    
    // 사용자 모드 업데이트
    const userMode = subscription.status === 'active' ? 'licensed' : 'ephemeral';
    await kv.set(`user_mode:${userId}`, userMode);
    
    console.log('✅ 구독 업데이트:', userId, subscription.status);
    
  } catch (error) {
    console.error('구독 업데이트 처리 오류:', error);
  }
}

// 구독 취소 처리
async function handleSubscriptionDeleted(subscription: any) {
  try {
    const customerId = subscription.customer;
    
    // 고객 정보 조회
    const customerData = await kv.get(`customer:${customerId}`);
    if (!customerData) {
      console.warn('고객 정보를 찾을 수 없음:', customerId);
      return;
    }

    const userId = customerData.user_id;
    
    // 구독 상태 업데이트
    const subscriptionData = await kv.get(`subscription:${userId}`);
    if (subscriptionData) {
      subscriptionData.status = 'canceled';
      subscriptionData.updated_at = new Date().toISOString();
      subscriptionData.canceled_at = new Date().toISOString();
      
      await kv.set(`subscription:${userId}`, subscriptionData);
    }
    
    // 사용자 모드를 기본으로 변경
    await kv.set(`user_mode:${userId}`, 'ephemeral');
    
    console.log('✅ 구독 취소:', userId);
    
  } catch (error) {
    console.error('구독 취소 처리 오류:', error);
  }
}

// 결제 실패 처리
async function handlePaymentFailed(invoice: any) {
  try {
    const customerId = invoice.customer;
    
    // 고객 정보 조회
    const customerData = await kv.get(`customer:${customerId}`);
    if (!customerData) {
      console.warn('고객 정보를 찾을 수 없음:', customerId);
      return;
    }

    const userId = customerData.user_id;
    
    // 결제 실패 로그 저장
    const failureData = {
      user_id: userId,
      customer_id: customerId,
      invoice_id: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      failed_at: new Date().toISOString(),
      next_payment_attempt: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000).toISOString() : null
    };
    
    await kv.set(`payment_failure:${userId}:${Date.now()}`, failureData);
    
    console.log('⚠️ 결제 실패:', userId, invoice.id);
    
  } catch (error) {
    console.error('결제 실패 처리 오류:', error);
  }
}

export { stripeWebhookApp };