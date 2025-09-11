// Mock API for existing projects integration
export default function handler(req, res) {
  // 개발 환경에서는 빈 배열 반환
  if (process.env.NODE_ENV === 'development') {
    return res.status(200).json({
      success: true,
      projects: [],
      message: 'No existing projects found (development mode)'
    });
  }

  // 실제 환경에서는 실제 통합 로직 구현
  res.status(200).json({
    success: true,
    projects: [],
    message: 'Integration service not configured'
  });
}