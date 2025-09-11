export default function handler(req, res) {
  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.API_KEY);
  res.json({ ok: true, hasKey });
}