import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { PLAYGROUND_ROLES } from '../src/constants';

interface RoleCarouselProps {
  onRoleSelect: (role: any) => void;
  isMobile?: boolean;
}

export function RoleCarousel({ onRoleSelect, isMobile = false }: RoleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  // 표시할 Role 수 계산
  const itemsPerView = isMobile ? 3 : 5;
  const maxIndex = Math.max(0, PLAYGROUND_ROLES.length - itemsPerView);

  // 자동 재생 로직
  useEffect(() => {
    if (isAutoPlaying && PLAYGROUND_ROLES.length > itemsPerView) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
      }, 7000); // 7초로 적당한 속도 조정
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

  const handleRoleClick = (role: typeof PLAYGROUND_ROLES[0]) => {
    setIsAutoPlaying(false);
    onRoleSelect({
      id: role.id,
      name: role.name,
      description: role.description,
      prompt: role.prompt,
      category: role.category,
      avatar: role.avatar,
      keywordIds: [],
      temperature: 0.8,
      maxOutputTokens: 2048,
      safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE' as const
    });
  };

  // 터치/드래그 지원
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    setIsAutoPlaying(false);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const offset = e.clientX - dragStart;
    setDragOffset(offset);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50;
    if (dragOffset > threshold) {
      handlePrevious();
    } else if (dragOffset < -threshold) {
      handleNext();
    }
    
    setDragOffset(0);
  };

  // 터치 이벤트 핸들러 추가
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const offset = e.touches[0].clientX - dragStart;
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50;
    if (dragOffset > threshold) {
      handlePrevious();
    } else if (dragOffset < -threshold) {
      handleNext();
    }
    
    setDragOffset(0);
  };

  return (
    <div className="relative w-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium">🎭</span>
          <h3 className="font-medium text-foreground">추천 캐릭터</h3>
        </div>
        <div className="flex items-center gap-1">
          {/* 향상된 인디케이터 */}
          {maxIndex > 0 && (
            <div className="flex gap-1.5 mr-2">
              {Array.from({ length: maxIndex + 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentIndex(i);
                    setIsAutoPlaying(false);
                  }}
                  className={`rounded-full transition-all duration-300 hover:scale-110 ${
                    i === currentIndex 
                      ? 'w-4 h-1.5 bg-primary shadow-md' 
                      : 'w-1.5 h-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* 네비게이션 버튼 */}
          {!isMobile && maxIndex > 0 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={handleNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 캐러셀 컨테이너 */}
      <div 
        ref={containerRef}
        className="overflow-hidden rounded-lg cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setDragOffset(0);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-out cursor-pointer"
          style={{
            transform: `translateX(calc(-${currentIndex * (100 / itemsPerView)}% + ${dragOffset}px))`,
            width: `${(PLAYGROUND_ROLES.length / itemsPerView) * 100}%`
          }}
        >
          {PLAYGROUND_ROLES.map((role, index) => (
            <div
              key={role.id}
              className={`flex-shrink-0 px-2`}
              style={{ width: `${100 / PLAYGROUND_ROLES.length}%` }}
            >
              <button
                onClick={() => handleRoleClick(role)}
                className="w-full p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors group"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  {/* 아바타 */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {role.avatar}
                  </div>
                  
                  {/* 이름 */}
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {role.name.replace(/^[^\s]+\s/, '')} {/* 이모지 제거 */}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {role.description}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 모바일용 스와이프 힌트 */}
      {isMobile && PLAYGROUND_ROLES.length > itemsPerView && (
        <div className="flex justify-center mt-2">
          <div className="text-xs text-muted-foreground">
            ← 좌우로 스와이프 →
          </div>
        </div>
      )}
    </div>
  );
}