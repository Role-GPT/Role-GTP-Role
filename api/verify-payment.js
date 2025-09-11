export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // USER_PLAN 환경변수로 간단히 결제 여부 판단
    const plan = (process.env.USER_PLAN || 'free').toLowerCase();
    const isPaid = plan === 'premium';

    return res.json({ isPaid, plan });
  } catch (e) {
    console.error('verify-payment error:', e);
    return res.json({ isPaid: false, plan: 'free' });
  }
}