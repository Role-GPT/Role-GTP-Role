export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, currentCustomRoleCount } = req.body || {};
    const MAX_FREE_CUSTOM_ROLES = 2;

    // 유저 플랜은 환경변수에서 가져오기 (없으면 free)
    const plan = (process.env.USER_PLAN || 'free').toLowerCase();

    if (plan === 'premium') {
      return res.json({ canCreate: true });
    }

    const canCreate = Number(currentCustomRoleCount || 0) < MAX_FREE_CUSTOM_ROLES;
    return res.json({ canCreate });
  } catch (e) {
    console.error('check-custom-role-limit error:', e);
    // 서버에서 판단 못하면 일단 허용
    return res.json({ canCreate: true });
  }
}