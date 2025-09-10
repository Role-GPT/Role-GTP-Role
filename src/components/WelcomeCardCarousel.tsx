import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { WELCOME_CARDS } from '../src/constants';

interface WelcomeCardCarouselProps {
  onPromptSelect: (prompt: string, roleId: string) => void;
  onStartChat?: (prompt: string, roleId: string) => void;
  isMobile?: boolean;
}

export function WelcomeCardCarousel({ onPromptSelect, onStartChat, isMobile = false }: WelcomeCardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 랜덤하게 섞인 카드들 - 전체 카드 사용
  const [shuffledCards] = useState(() => {
    const shuffled = [...WELCOME_CARDS].sort(() => Math.random() - 0.5);
    return shuffled; // 전체 카드 사용 (5개)
  });

  // 표시할 카드 수 계산 - 모바일에서 3개, 데스크톱에서 3개
  const itemsPerView = isMobile ? 3 : 3;
  const maxIndex = Math.max(0, shuffledCards.length - itemsPerView);

  // 자동 재생 설정 - 매우 느린 속도 (12초)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isAutoPlaying && shuffledCards.length > itemsPerView) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 8000); // 8초로 적당히 느리게 설정
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, maxIndex, itemsPerView]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleCardClick = (card: typeof WELCOME_CARDS[0]) => {
    if (!isDragging) {
      // ChatGPT 스타일: 카드 클릭하면 바로 대화 시작
      if (onStartChat) {
        onStartChat(card.prompt, card.roleId);
      } else {
        onPromptSelect(card.prompt, card.roleId);
      }
    }
  };

  // 개선된 드래그 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(false);
    setStartX(e.pageX);
    setScrollLeft(currentIndex);
    setIsAutoPlaying(false);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startX === 0) return;
    setIsDragging(true);
    const x = e.pageX;
    const walk = (startX - x) / 100; // 드래그 감도 더 개선
    const newIndex = Math.max(0, Math.min(maxIndex, Math.round(scrollLeft + walk)));
    setCurrentIndex(newIndex);
  };

  const handleMouseUp = () => {
    setStartX(0);
    setTimeout(() => setIsDragging(false), 100);
  };

  // 개선된 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(false);
    setStartX(e.touches[0].clientX);
    setScrollLeft(currentIndex);
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX === 0) return;
    setIsDragging(true);
    const x = e.touches[0].clientX;
    const walk = (startX - x) / 100; // 드래그 감도 더 개선
    const newIndex = Math.max(0, Math.min(maxIndex, Math.round(scrollLeft + walk)));
    setCurrentIndex(newIndex);
  };

  const handleTouchEnd = () => {
    setStartX(0);
    setTimeout(() => setIsDragging(false), 100);
  };

  return (
    <div className="relative w-full">
      {/* 웹에서는 상단 화살표 제거, 대신 하단에 인디케이터 표시 */}

      {/* 캐러셀 컨테이너 - 드래그 지원 */}
      <div 
        className="overflow-hidden rounded-lg select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className={`flex transition-transform ${isDragging ? 'duration-0' : 'duration-500'} ease-in-out`}
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            width: `${(shuffledCards.length / itemsPerView) * 100}%`
          }}
        >
          {shuffledCards.map((card, index) => (
            <div
              key={card.id}
              className={`flex-shrink-0 ${isMobile ? 'px-0' : 'px-2'}`}
              style={{ width: `${100 / shuffledCards.length}%` }}
            >
              <Card 
                className={`cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] group border-border/50 hover:border-border/80 ${isMobile ? 'min-h-[56px]' : 'min-h-[100px]'}`}
                onClick={() => handleCardClick(card)}
              >
                <CardContent className={isMobile ? "p-2.5" : "p-4"}>
                  {/* 모바일에서 액션 텍스트 포함한 크기로 조정 */}
                  <div className={`space-y-1 flex flex-col justify-between ${isMobile ? 'h-11' : 'h-16'}`}>
                    <div className="space-y-1">
                      <h4 className={`font-medium text-foreground line-clamp-1 ${isMobile ? 'text-[11px] leading-tight' : 'text-sm'}`}>
                        {card.title}
                      </h4>
                      
                      {!isMobile && (
                        <p className={`text-muted-foreground/80 line-clamp-2 text-xs`}>
                          {card.description}
                        </p>
                      )}
                      
                      {/* 모바일에서만 액션 텍스트 표시 */}
                      {isMobile && (
                        <p className={`text-primary/80 line-clamp-2 text-[10px] leading-tight`}>
                          {card.actionText}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* 향상된 인디케이터 - 모바일과 데스크톱 모두 표시 */}
      {maxIndex > 0 && (
        <div className={`flex justify-center gap-2 ${isMobile ? 'mt-4 mb-0' : 'mt-4'}`}>
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                setIsAutoPlaying(false);
              }}
              className={`relative rounded-full transition-all duration-300 hover:scale-110 ${
                i === currentIndex 
                  ? 'w-6 h-2 bg-primary shadow-md' 
                  : 'w-2 h-2 bg-muted-foreground/40 hover:bg-muted-foreground/60'
              }`}
            >
              {/* 활성 인디케이터에 그라데이션 효과 */}
              {i === currentIndex && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/80 to-primary animate-pulse" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}