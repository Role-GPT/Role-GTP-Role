// Mock API for plugin batch operations
export default function handler(req, res) {
  if (req.method === 'POST') {
    // 플러그인 배치 작업 처리
    const { operations } = req.body;
    
    // 개발 환경에서는 성공 응답 반환
    return res.status(200).json({
      success: true,
      results: operations?.map((op, index) => ({
        id: index,
        status: 'completed',
        operation: op
      })) || [],
      message: 'Batch operations completed (mock)'
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}