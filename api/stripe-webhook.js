/**
 * Stripe 웹훅 핸들러 (Vercel API Route)
 * 
 * Stripe 웹훅을 받아서 Supabase 서버리스 함수로 전달
 */

export default async function handler(req, res) {
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🎯 Stripe 웹훅 수신:', {
      method: req.method,
      headers: {
        'stripe-signature': req.headers['stripe-signature'] ? '✅ 있음' : '❌ 없음',
        'content-type': req.headers['content-type']
      }
    });

    // Stripe 서명 헤더 확인
    const stripeSignature = req.headers['stripe-signature'];
    if (!stripeSignature) {
      console.error('❌ Stripe 서명 헤더가 없음');
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    // 요청 본문을 raw string으로 가져오기
    let body = '';
    if (typeof req.body === 'string') {
      body = req.body;
    } else if (Buffer.isBuffer(req.body)) {
      body = req.body.toString();
    } else {
      body = JSON.stringify(req.body);
    }

    console.log('📦 웹훅 데이터:', {
      bodyType: typeof req.body,
      bodyLength: body.length,
      signature: stripeSignature.substring(0, 20) + '...'
    });

    // Supabase 서버리스 함수 URL 구성
    const SUPABASE_PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID || process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!SUPABASE_PROJECT_ID || !SUPABASE_ANON_KEY) {
      console.error('❌ Supabase 환경변수가 설정되지 않음');
      return res.status(500).json({ error: 'Supabase configuration missing' });
    }

    const supabaseWebhookUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-e3d1d00c/stripe/webhook`;
    
    console.log('🔄 Supabase 서버리스 함수로 전달:', supabaseWebhookUrl);

    // Supabase 서버리스 함수로 웹훅 전달
    const supabaseResponse = await fetch(supabaseWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'stripe-signature': stripeSignature
      },
      body: body
    });

    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();
      console.error('❌ Supabase 서버리스 함수 에러:', {
        status: supabaseResponse.status,
        error: errorText
      });
      return res.status(supabaseResponse.status).json({ 
        error: 'Supabase webhook processing failed',
        details: errorText
      });
    }

    const result = await supabaseResponse.json();
    console.log('✅ 웹훅 처리 완료:', result);

    // Stripe에게 성공 응답
    res.status(200).json({ received: true, processed: true });

  } catch (error) {
    console.error('❌ 웹훅 처리 중 오류:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      details: error.message 
    });
  }
}

// Next.js API 설정
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
}