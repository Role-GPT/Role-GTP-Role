export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, currentProjectCount } = req.body || {};
    const MAX_FREE_PROJECTS = 2;

    const plan = (process.env.USER_PLAN || 'free').toLowerCase();

    if (plan === 'premium') {
      return res.json({ canCreate: true });
    }

    const canCreate = Number(currentProjectCount || 0) < MAX_FREE_PROJECTS;
    return res.json({ canCreate });
  } catch (e) {
    console.error('check-project-limit error:', e);
    return res.json({ canCreate: true });
  }
}