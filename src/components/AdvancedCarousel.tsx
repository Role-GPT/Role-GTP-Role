import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { WELCOME_CARDS } from '../src/constants';

interface AdvancedCarouselProps {
  onPromptSelect: (prompt: string, roleId: string) => void;
  onStartChat?: (prompt: string, roleId: string) => void;
  isMobile?: boolean;
}

export function AdvancedCarousel({ onPromptSelect, onStartChat, isMobile = false }: AdvancedCarouselProps) {
  // Basic state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Advanced interaction state
  const [dragProgress, setDragProgress] = useState(0); // 드래그 진행률 (-1 to 1)
  const [velocity, setVelocity] = useState(0); // 관성 스크롤을 위한 속도
  const [isInertiaScrolling, setIsInertiaScrolling] = useState(false);
  
  // Drag tracking
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [lastMoveX, setLastMoveX] = useState(0);
  
  // Multi-touch support
  const [touches, setTouches] = useState<TouchList | null>(null);
  const [initialDistance, setInitialDistance] = useState(0);
  const [scale, setScale] = useState(1);
  
  // Enhanced features
  const [infiniteScroll, setInfiniteScroll] = useState(true);
  const [previewOffset, setPreviewOffset] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const inertiaRef = useRef<number>();
  const hapticTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Constants
  const [shuffledCards] = useState(() => {
    // For first-time users, show cards in order for consistency
    const isFirstTime = localStorage.getItem("firstTimeUser") === "true";
    if (isFirstTime) {
      return [...WELCOME_CARDS];
    }
    // For returning users, shuffle for variety
    const shuffled = [...WELCOME_CARDS].sort(() => Math.random() - 0.5);
    return shuffled;
  });
  
  const itemsPerView = isMobile ? 3 : 3;
  const totalPages = Math.ceil(shuffledCards.length / itemsPerView);
  const maxIndex = infiniteScroll ? totalPages : Math.max(0, totalPages - 1);
  
  // 카드가 없으면 빈 상태 표시
  if (shuffledCards.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <p className="text-muted-foreground text-sm">웰컴 카드를 불러오는 중...</p>
      </div>
    );
  }
  const dragThreshold = 100; // 페이지 전환을 위한 최소 드래그 거리
  
  // 햅틱 피드백 함수
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [50],
        medium: [100],
        heavy: [200]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // 디바운스된 햅틱 피드백
  const debouncedHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (hapticTimeoutRef.current) clearTimeout(hapticTimeoutRef.current);
    hapticTimeoutRef.current = setTimeout(() => triggerHaptic(type), 10);
  }, [triggerHaptic]);

  // 페이지 인덱스 정규화 (무한 스크롤 지원)
  const normalizeIndex = useCallback((index: number) => {
    if (!infiniteScroll) {
      return Math.max(0, Math.min(maxIndex, index));
    }
    return ((index % totalPages) + totalPages) % totalPages;
  }, [infiniteScroll, maxIndex, totalPages]);
  
  // 두 터치 포인트 사이의 거리 계산
  const getDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);
  
  // 관성 스크롤 구현
  const startInertiaScroll = useCallback((initialVelocity: number) => {
    if (Math.abs(initialVelocity) < 0.5) return; // 너무 느리면 관성 스크롤 안함
    
    setIsInertiaScrolling(true);
    let currentVel = initialVelocity;
    const friction = 0.95; // 마찰 계수
    let currentIdx = currentIndex;
    
    const inertiaStep = () => {
      currentVel *= friction;
      
      // 속도가 충분히 클 때 페이지 전환
      if (Math.abs(currentVel) > 2) {
        if (currentVel > 0 && currentIdx > 0) {
          currentIdx--;
          setCurrentIndex(currentIdx);
          currentVel *= 0.7; // 페이지 전환 시 속도 감소
        } else if (currentVel < 0 && currentIdx < maxIndex) {
          currentIdx++;
          setCurrentIndex(currentIdx);
          currentVel *= 0.7;
        }
      }
      
      if (Math.abs(currentVel) > 0.1) {
        inertiaRef.current = requestAnimationFrame(inertiaStep);
      } else {
        setIsInertiaScrolling(false);
      }
    };
    
    inertiaRef.current = requestAnimationFrame(inertiaStep);
  }, [currentIndex, maxIndex]);
  
  // Auto-play
  useEffect(() => {
    if (isAutoPlaying && shuffledCards.length > itemsPerView && !isDragging && !isInertiaScrolling) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
      }, 6000);
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, maxIndex, itemsPerView, isDragging, isInertiaScrolling]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (inertiaRef.current) {
        cancelAnimationFrame(inertiaRef.current);
      }
      if (hapticTimeoutRef.current) {
        clearTimeout(hapticTimeoutRef.current);
      }
    };
  }, []);
  
  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isInertiaScrolling) return;
    
    setIsDragging(false);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    setLastMoveTime(Date.now());
    setLastMoveX(e.clientX);
    setIsAutoPlaying(false);
    setDragProgress(0);
    e.preventDefault();
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (startX === 0) return;
    
    setIsDragging(true);
    setCurrentX(e.clientX);
    
    const deltaX = e.clientX - startX;
    const progress = Math.max(-1, Math.min(1, deltaX / dragThreshold));
    setDragProgress(progress);
    
    // 속도 계산
    const now = Date.now();
    const timeDelta = now - lastMoveTime;
    if (timeDelta > 0) {
      const vel = (e.clientX - lastMoveX) / timeDelta * 10;
      setVelocity(vel);
      setLastMoveTime(now);
      setLastMoveX(e.clientX);
    }
  };
  
  const handleMouseUp = () => {
    if (startX === 0) return;
    
    const deltaX = currentX - startX;
    
    // 드래그 거리에 따른 페이지 전환
    if (Math.abs(deltaX) > dragThreshold / 2) {
      if (deltaX > 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (deltaX < 0 && currentIndex < maxIndex) {
        setCurrentIndex(prev => prev + 1);
      }
    }
    
    // 관성 스크롤 시작
    if (Math.abs(velocity) > 1) {
      startInertiaScroll(velocity);
    }
    
    // 상태 초기화
    setStartX(0);
    setCurrentX(0);
    setDragProgress(0);
    setTimeout(() => setIsDragging(false), 100);
  };
  
  // Touch handlers with multi-touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isInertiaScrolling) return;
    
    const touches = e.touches;
    setTouches(touches);
    
    if (touches.length === 1) {
      // Single touch - normal dragging
      setIsDragging(false);
      setStartX(touches[0].clientX);
      setCurrentX(touches[0].clientX);
      setLastMoveTime(Date.now());
      setLastMoveX(touches[0].clientX);
      setIsAutoPlaying(false);
      setDragProgress(0);
    } else if (touches.length === 2) {
      // Multi-touch - pinch gesture
      const distance = getDistance(touches);
      setInitialDistance(distance);
      setScale(1);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    const touches = e.touches;
    
    if (touches.length === 1 && startX !== 0) {
      // Single touch dragging
      setIsDragging(true);
      setCurrentX(touches[0].clientX);
      
      const deltaX = touches[0].clientX - startX;
      const progress = Math.max(-1, Math.min(1, deltaX / dragThreshold));
      setDragProgress(progress);
      
      // 속도 계산
      const now = Date.now();
      const timeDelta = now - lastMoveTime;
      if (timeDelta > 0) {
        const vel = (touches[0].clientX - lastMoveX) / timeDelta * 10;
        setVelocity(vel);
        setLastMoveTime(now);
        setLastMoveX(touches[0].clientX);
      }
    } else if (touches.length === 2 && initialDistance > 0) {
      // Pinch gesture
      const distance = getDistance(touches);
      const newScale = distance / initialDistance;
      setScale(Math.max(0.5, Math.min(2, newScale))); // 0.5x ~ 2x 범위로 제한
      e.preventDefault(); // 브라우저 기본 줌 방지
    }
  };
  
  const handleTouchEnd = () => {
    if (startX === 0) return;
    
    const deltaX = currentX - startX;
    
    // 드래그 거리에 따른 페이지 전환
    if (Math.abs(deltaX) > dragThreshold / 2) {
      if (deltaX > 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (deltaX < 0 && currentIndex < maxIndex) {
        setCurrentIndex(prev => prev + 1);
      }
    }
    
    // 관성 스크롤 시작
    if (Math.abs(velocity) > 1) {
      startInertiaScroll(velocity);
    }
    
    // 상태 초기화
    setStartX(0);
    setCurrentX(0);
    setDragProgress(0);
    setTouches(null);
    setInitialDistance(0);
    setScale(1);
    setTimeout(() => setIsDragging(false), 100);
  };
  
  const handleCardClick = (card: typeof WELCOME_CARDS[0]) => {
    if (!isDragging && !isInertiaScrolling) {
      // ChatGPT 스타일: 카드 클릭하면 바로 대화 시작
      if (onStartChat) {
        onStartChat(card.prompt, card.roleId);
      } else {
        onPromptSelect(card.prompt, card.roleId);
      }
    }
  };
  
  return (
    <div className="relative w-full">
      {/* 캐러셀 컨테이너 */}
      <div 
        ref={containerRef}
        className="overflow-hidden rounded-lg select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          transition: isDragging || isInertiaScrolling ? 'none' : 'transform 0.3s ease'
        }}
      >
        <div 
          className={`flex transition-transform ${
            isDragging || isInertiaScrolling ? 'duration-0' : 'duration-500'
          } ease-in-out`}
          style={{
            transform: `translateX(calc(-${currentIndex * (100 / itemsPerView)}% + ${dragProgress * 30}px))`,
            width: `${(shuffledCards.length / itemsPerView) * 100}%`
          }}
        >
          {shuffledCards.map((card, index) => (
            <div
              key={card.id}
              className={`flex-shrink-0 ${isMobile ? 'px-0' : 'px-2'} transition-opacity duration-300`}
              style={{ 
                width: `${100 / shuffledCards.length}%`,
                opacity: isDragging ? 0.8 : 1
              }}
            >
              <Card 
                className={`cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] group border-border/50 hover:border-border/80 ${
                  isMobile ? 'min-h-[44px]' : 'min-h-[80px]'
                }`}
                onClick={() => handleCardClick(card)}
              >
                <CardContent className={isMobile ? "p-2" : "p-3"}>
                  <div className={`space-y-1 flex flex-col justify-between ${isMobile ? 'h-9' : 'h-12'}`}>
                    <div className="space-y-1">
                      <h4 className={`font-medium text-foreground line-clamp-1 ${isMobile ? 'text-[10px] leading-tight' : 'text-sm'}`}>
                        {card.title}
                      </h4>
                      
                      {!isMobile && (
                        <p className="text-muted-foreground/80 line-clamp-2 text-xs">
                          {card.description}
                        </p>
                      )}
                      
                      {isMobile && (
                        <p className="text-primary/80 line-clamp-2 text-[9px] leading-tight">
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
      
      {/* 향상된 인디케이터 */}
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