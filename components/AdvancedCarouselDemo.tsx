import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AdvancedCarouselDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdvancedCarouselDemo({ isOpen, onClose }: AdvancedCarouselDemoProps) {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [hapticSupported, setHapticSupported] = useState(false);
  
  useEffect(() => {
    setHapticSupported('vibrate' in navigator);
  }, []);
  
  const features = [
    {
      id: 'haptic',
      title: "햅틱 피드백",
      icon: "📳",
      description: "드래그와 페이지 전환 시 진동으로 피드백을 제공합니다.",
      details: [
        "드래그 시작 시 가벼운 진동 (50ms)",
        "페이지 전환 시 중간 진동 (100ms)", 
        "완전한 페이지 전환 시 강한 진동 (200ms)",
        "관성 스크롤 중 지속적인 가벼운 진동"
      ],
      demonstration: "캐러셀을 드래그하거나 페이지를 넘기면 햅틱 피드백을 느낄 수 있습니다.",
      techDetails: "Navigator.vibrate() API를 활용하여 패턴별 진동 구현",
      supported: hapticSupported
    },
    {
      id: 'preview',
      title: "드래그 중 미리보기",
      icon: "👀",
      description: "드래그할 때 다음/이전 페이지를 살짝 보여줍니다.",
      details: [
        "30% 이상 드래그 시 미리보기 활성화",
        "최대 30% 오프셋으로 다음 페이지 표시",
        "드래그 진행도에 따른 투명도 조절",
        "실시간 미리보기 상태 표시 👀"
      ],
      demonstration: "캐러셀을 절반 이상 드래그하면 다음 페이지가 살짝 보입니다.",
      techDetails: "transform translateX와 opacity를 조합한 실시간 미리보기",
      supported: true
    },
    {
      id: 'infinite',
      title: "무한 스크롤 모드",
      icon: "∞",
      description: "마지막 페이지에서 첫 번째 페이지로 순환하는 모드입니다.",
      details: [
        "마지막 페이지 → 첫 번째 페이지 자동 순환",
        "첫 번째 페이지 → 마지막 페이지 역순환",
        "관성 스크롤에서도 무한 순환 지원",
        "ON/OFF 토글 버튼으로 제어 가능"
      ],
      demonstration: "무한 스크롤을 켜면 끝에서 처음으로 자연스럽게 연결됩니다.",
      techDetails: "modulo 연산을 활용한 인덱스 정규화 알고리즘",
      supported: true
    },
    {
      id: 'inertia',
      title: "관성 스크롤 향상",
      icon: "🚀",
      description: "물리 엔진 기반의 자연스러운 관성 스크롤입니다.",
      details: [
        "속도 기반 멀티페이지 이동",
        "물리 시뮬레이션 (마찰 계수 0.95)",
        "페이지 전환 시 속도 감소 효과",
        "관성 상태 실시간 표시 🚀"
      ],
      demonstration: "빠르게 스와이프하면 여러 페이지를 자동으로 넘어갑니다.",
      techDetails: "requestAnimationFrame과 물리 시뮬레이션 조합",
      supported: true
    }
  ];
  
  const triggerDemoHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [50],
        medium: [100], 
        heavy: [200]
      };
      navigator.vibrate(patterns[type]);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              🚀 고급 캐러셀 UX 기능
              <Badge variant="secondary">v2.0</Badge>
              <Badge variant="outline" className="text-green-600 border-green-600">
                20개 Role
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            네이티브 앱 수준의 고급 인터랙션을 제공하는 캐러셀입니다
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">20</div>
              <div className="text-xs text-blue-800 dark:text-blue-300">총 Role</div>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">7</div>
              <div className="text-xs text-green-800 dark:text-green-300">페이지</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">4</div>
              <div className="text-xs text-purple-800 dark:text-purple-300">고급 기능</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {hapticSupported ? '✓' : '✗'}
              </div>
              <div className="text-xs text-orange-800 dark:text-orange-300">햅틱 지원</div>
            </div>
          </div>

          {/* 기능 탭 */}
          <Tabs defaultValue="haptic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {features.map((feature) => (
                <TabsTrigger 
                  key={feature.id} 
                  value={feature.id}
                  className="flex items-center gap-1 text-xs"
                >
                  <span>{feature.icon}</span>
                  <span className="hidden sm:inline">{feature.title.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {features.map((feature) => (
              <TabsContent key={feature.id} value={feature.id} className="mt-4">
                <div className="space-y-4">
                  {/* 기능 헤더 */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="text-2xl">{feature.icon}</span>
                      {feature.title}
                      {!feature.supported && (
                        <Badge variant="destructive" className="text-xs">
                          미지원
                        </Badge>
                      )}
                    </h3>
                    
                    {/* 햅틱 테스트 버튼 */}
                    {feature.id === 'haptic' && hapticSupported && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => triggerDemoHaptic('light')}>
                          가벼움
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => triggerDemoHaptic('medium')}>
                          중간
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => triggerDemoHaptic('heavy')}>
                          강함
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                  
                  {/* 데모 영역 */}
                  <div className="bg-accent/20 rounded-lg p-4 border-l-4 border-primary">
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      💡 체험해보세요:
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.demonstration}
                    </p>
                  </div>
                  
                  {/* 기능 상세 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">주요 기능:</h4>
                      <ul className="space-y-1">
                        {feature.details.map((detail, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-1 text-xs">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">🔧 구현 방식:</h4>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">
                          {feature.techDetails}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          {/* 사용법 종합 안내 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4">
            <h4 className="font-medium mb-3 text-blue-900 dark:text-blue-200 flex items-center gap-2">
              📱 종합 사용 방법
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">데스크톱</h5>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• 마우스 드래그로 페이지 이동</li>
                  <li>• 빠른 드래그로 관성 스크롤</li>
                  <li>• ∞ 버튼으로 무한 스크롤 토글</li>
                  <li>• 드래그 중 진행률 확인</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-2">모바일</h5>
                <ul className="space-y-1 text-purple-700 dark:text-purple-300">
                  <li>• 손가락 스와이프로 페이지 이동</li>
                  <li>• 햅틱 피드백으로 터치 확인</li>
                  <li>• 두 손가락으로 확대/축소</li>
                  <li>• 미리보기로 다음 페이지 확인</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 성능 정보 */}
          <div className="bg-gray-50 dark:bg-gray-950/20 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-200">
              ⚡ 성능 최적화
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600 dark:text-gray-400">
              <div>requestAnimationFrame 활용</div>
              <div>디바운스된 햅틱 피드백</div>
              <div>메모리 효율적인 상태 관리</div>
              <div>부드러운 60fps 애니메이션</div>
            </div>
          </div>
          
          {/* 하단 액션 버튼 */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              총 20개 Role • 7페이지 • 고급 UX 기능
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                📖 문서 보기
              </Button>
              <Button onClick={onClose} variant="default">
                체험하러 가기 🚀
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
