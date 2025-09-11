import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface CarouselFeatureDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CarouselFeatureDemo({ isOpen, onClose }: CarouselFeatureDemoProps) {
  const [currentDemo, setCurrentDemo] = useState(0);
  
  const features = [
    {
      title: "드래그 진행률 인디케이터",
      description: "실시간으로 드래그 진행 상황을 시각적으로 표시합니다.",
      details: [
        "드래그 중 상단에 진행률 표시",
        "방향 표시 (← 이전 / 다음 →)",
        "실시간 퍼센트 업데이트",
        "부드러운 애니메이션 효과"
      ],
      demonstration: "캐러셀을 드래그하면 상단에 '← 이전 (45%)' 같은 인디케이터가 나타납니다.",
      techDetails: "dragProgress 상태와 threshold 계산을 통해 구현"
    },
    {
      title: "관성 스크롤 효과",
      description: "스와이프 속도에 따른 자연스러운 감속 및 멀티페이지 이동을 지원합니다.",
      details: [
        "스와이프 속도 감지 및 계산",
        "관성에 따른 자동 페이지 이동",
        "점진적 감속 효과 (friction)",
        "빠른 스와이프 시 여러 페이지 넘김"
      ],
      demonstration: "빠르게 스와이프하면 속도에 따라 여러 페이지가 자동으로 넘어갑니다.",
      techDetails: "velocity 추적, requestAnimationFrame을 활용한 물리 시뮬레이션"
    },
    {
      title: "멀티터치 제스처 지원",
      description: "두 손가락을 이용한 확대/축소 제스처를 지원합니다.",
      details: [
        "핀치 줌 (Pinch to Zoom) 지원",
        "두 손가락 거리 계산",
        "0.5x ~ 2x 범위 확대/축소",
        "실시간 스케일 인디케이터 표시"
      ],
      demonstration: "두 손가락으로 캐러셀을 확대/축소할 수 있습니다.",
      techDetails: "TouchList 활용, 두 터치포인트 간 거리 계산으로 스케일 결정"
    }
  ];
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              🚀 고급 캐러셀 UX 기능
              <Badge variant="secondary">Beta</Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 기능 탭 */}
          <div className="flex gap-2 overflow-x-auto">
            {features.map((_, index) => (
              <Button
                key={index}
                variant={currentDemo === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentDemo(index)}
                className="whitespace-nowrap"
              >
                {index + 1}. {features[index].title.split(' ')[0]}
              </Button>
            ))}
          </div>
          
          {/* 현재 선택된 기능 설명 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {features[currentDemo].title}
              </h3>
              <p className="text-muted-foreground">
                {features[currentDemo].description}
              </p>
            </div>
            
            {/* 데모 영역 */}
            <div className="bg-accent/20 rounded-lg p-4 border-l-4 border-primary">
              <h4 className="font-medium mb-2">💡 체험해보세요:</h4>
              <p className="text-sm text-muted-foreground">
                {features[currentDemo].demonstration}
              </p>
            </div>
            
            {/* 기능 상세 */}
            <div>
              <h4 className="font-medium mb-2">주요 기능:</h4>
              <ul className="space-y-1">
                {features[currentDemo].details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* 기술적 구현 */}
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-1">🔧 구현 방식:</h4>
              <p className="text-xs text-muted-foreground">
                {features[currentDemo].techDetails}
              </p>
            </div>
          </div>
          
          {/* 사용법 안내 */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-200">
              📱 사용 방법
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <p><strong>데스크톱:</strong> 마우스로 드래그하여 체험</p>
              <p><strong>모바일:</strong> 손가락으로 스와이프 및 핀치 제스처</p>
              <p><strong>고급:</strong> 빠른 스와이프로 관성 스크롤 체험</p>
            </div>
          </div>
          
          {/* 하단 버튼 */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setCurrentDemo((prev) => (prev - 1 + features.length) % features.length)}
              size="sm"
            >
              ← 이전
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setCurrentDemo((prev) => (prev + 1) % features.length)}
              size="sm"
            >
              다음 →
            </Button>
            <div className="flex-1" />
            <Button onClick={onClose} variant="default">
              체험하러 가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
