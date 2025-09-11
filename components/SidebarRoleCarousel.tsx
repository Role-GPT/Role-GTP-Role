import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { PLAYGROUND_ROLES } from '../src/constants';
import { useApp } from '../src/context/AppContext';

interface SidebarRoleCarouselProps {
  onRoleSelect: (role: any) => void;
  isExpanded: boolean;
}

export function SidebarRoleCarousel({ onRoleSelect, isExpanded }: SidebarRoleCarouselProps) {
  // 모든 상태를 최상단에 선언
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false); // 자동재생 비활성화
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragProgress, setDragProgress] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [lastMoveX, setLastMoveX] = useState(0);
  const [isInertiaScrolling, setIsInertiaScrolling] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const inertiaRef = useRef<number>();

  // 표시할 Role 수 계산 - 사이드바에서는 3개씩 1줄로 표시
  const itemsPerView = isExpanded ? 3 : 1;
  
  // 9개 Role 구성: 플래이그라운드 3개 + 전체 Role에서 6개
  const playgroundRoles = PLAYGROUND_ROLES.slice(0, 3); // 첫 3개 플래이그라운드 Role
  
  // state.roles에서 추천/인기 카테고리 Role 6개 선택 (플래이그라운드 제외)
  const { state } = useApp();
  const generalRoles = state.roles
    .filter(role => 
      (role.category === 'recommended' || role.category === 'popular') && 
      role.category !== 'playground'
    )
    .slice(0, 6);
  
  // 총 9개 Role 조합 (플래이그라운드 3개 + 일반 6개)
  const displayRoles = [
    ...playgroundRoles.map(role => ({
      ...role,
      temperature: role.temperature || 0.8,
      maxOutputTokens: role.maxOutputTokens || 2048,
      safetyLevel: role.safetyLevel || 'BLOCK_MEDIUM_AND_ABOVE' as const
    })),
    ...generalRoles
  ];
  
  const totalPages = Math.ceil(displayRoles.length / itemsPerView);
  const maxIndex = Math.max(0, totalPages - 1);

  const handlePrevious = () => {
    console.log('🔄 Previous clicked:', { currentIndex, maxIndex });
    setIsAutoPlaying(false);
    setCurrentIndex(prev => {
      const newIndex = prev <= 0 ? maxIndex : prev - 1;
      console.log('📍 Index changed:', prev, '→', newIndex);
      return newIndex;
    });
  };

  const handleNext = () => {
    console.log('🔄 Next clicked:', { currentIndex, maxIndex });
    setIsAutoPlaying(false);
    setCurrentIndex(prev => {
      const newIndex = prev >= maxIndex ? 0 : prev + 1;
      console.log('📍 Index changed:', prev, '→', newIndex);
      return newIndex;
    });
  };

  // 자동 재생 로직 (완전 비활성화)
  useEffect(() => {
    // 자동 재생 완전 비활성화
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (inertiaRef.current) {
        cancelAnimationFrame(inertiaRef.current);
      }
    };
  }, []);

  const handleRoleClick = (role: any) => {
    if (!isDragging) {
      setIsAutoPlaying(false);
      onRoleSelect({
        id: role.id,
        name: role.name,
        description: role.description,
        prompt: role.prompt,
        category: role.category,
        avatar: role.avatar,
        keywordIds: role.keywordIds || [],
        temperature: role.temperature || 0.8,
        maxOutputTokens: role.maxOutputTokens || 2048,
        safetyLevel: role.safetyLevel || 'BLOCK_MEDIUM_AND_ABOVE' as const
      });
    }
  };

  // 관성 스크롤 구현
  const startInertiaScroll = (initialVelocity: number) => {
    if (Math.abs(initialVelocity) < 0.5) return;
    
    setIsInertiaScrolling(true);
    let currentVel = initialVelocity;
    const friction = 0.95;
    let currentIdx = currentIndex;
    
    const inertiaStep = () => {
      currentVel *= friction;
      
      if (Math.abs(currentVel) > 2) {
        if (currentVel > 0 && currentIdx > 0) {
          currentIdx--;
          setCurrentIndex(currentIdx);
          currentVel *= 0.7;
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
  };

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isInertiaScrolling) return;
    
    setIsDragging(false);
    setDragStart(e.clientX);
    setLastMoveTime(Date.now());
    setLastMoveX(e.clientX);
    setIsAutoPlaying(false);
    setDragProgress(0);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart === 0) return;
    setIsDragging(true);
    const offset = e.clientX - dragStart;
    setDragOffset(offset);
    
    const progress = Math.max(-1, Math.min(1, offset / 150)); // 감도 150px 유지
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
    if (dragStart === 0) return;
    
    const threshold = 150; // 감도 150px 유지
    console.log('🖱️ Mouse drag end:', { dragOffset, threshold, willChange: Math.abs(dragOffset) > threshold });
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        console.log('👈 Dragged RIGHT → Going PREVIOUS');
        handlePrevious();
      } else {
        console.log('👉 Dragged LEFT → Going NEXT');
        handleNext();
      }
    } else {
      console.log('🚫 Drag not enough, staying at current index');
    }
    
    // 관성 스크롤 시작
    if (Math.abs(velocity) > 1) {
      startInertiaScroll(velocity);
    }
    
    setDragStart(0);
    setDragOffset(0);
    setDragProgress(0);
    setTimeout(() => setIsDragging(false), 100);
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isInertiaScrolling) return;
    
    setIsDragging(false);
    setDragStart(e.touches[0].clientX);
    setLastMoveTime(Date.now());
    setLastMoveX(e.touches[0].clientX);
    setIsAutoPlaying(false);
    setDragProgress(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart === 0) return;
    setIsDragging(true);
    const offset = e.touches[0].clientX - dragStart;
    setDragOffset(offset);
    
    const progress = Math.max(-1, Math.min(1, offset / 150)); // 감도 150px 유지
    setDragProgress(progress);
    
    // 속도 계산
    const now = Date.now();
    const timeDelta = now - lastMoveTime;
    if (timeDelta > 0) {
      const vel = (e.touches[0].clientX - lastMoveX) / timeDelta * 10;
      setVelocity(vel);
      setLastMoveTime(now);
      setLastMoveX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (dragStart === 0) return;
    
    const threshold = 150; // 감도 150px 유지
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
    }
    
    // 관성 스크롤 시작
    if (Math.abs(velocity) > 1) {
      startInertiaScroll(velocity);
    }
    
    setDragStart(0);
    setDragOffset(0);
    setDragProgress(0);
    setTimeout(() => setIsDragging(false), 100);
  };

  if (!isExpanded) {
    // 축소된 상태에서는 첫 번째 Role만 표시
    const currentRole = displayRoles[currentIndex * itemsPerView] || displayRoles[0];
    return (
      <div className="flex flex-col items-center gap-2 p-2">
        <div className="text-xs text-muted-foreground">추천</div>
        <button
          onClick={() => handleRoleClick(currentRole)}
          className="w-10 h-10 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors group flex items-center justify-center"
        >
          <div className="text-lg group-hover:scale-110 transition-transform">
            {currentRole.avatar}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="px-2 py-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">⭐ 추천 Role</h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              className="h-6 w-6 p-0 hover:bg-accent/50"
              disabled={isInertiaScrolling}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="h-6 w-6 p-0 hover:bg-accent/50"
              disabled={isInertiaScrolling}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* 캐러셀 컨테이너 */}
      <div 
        ref={containerRef}
        className="relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${dragProgress * 20}%))`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          {Array.from({ length: totalPages }, (_, pageIndex) => (
            <div
              key={pageIndex}
              className="flex-shrink-0 flex gap-1 p-0.5 w-full"
            >
              {displayRoles.slice(pageIndex * itemsPerView, (pageIndex + 1) * itemsPerView).map((role) => (
                <div key={role.id} className="flex-1 min-w-0">
                  <button
                    onClick={() => handleRoleClick(role)}
                    className="w-full h-12 px-1 py-0.5 rounded border border-border bg-card hover:bg-accent/50 transition-colors group text-center flex flex-col items-center justify-center"
                  >
                    {/* 아바타 */}
                    <div className="text-sm group-hover:scale-110 transition-transform">
                      {role.avatar}
                    </div>
                    
                    {/* 이름 */}
                    <div className="text-[8px] font-medium text-foreground truncate w-full leading-none text-center">
                      {role.name.replace(/^[^\s]+\s/, '')} {/* 이모지 제거 */}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 페이지 인디케이터 - 모바일에서 하단 여백 추가 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-2 mb-2 md:mb-0">
          {Array.from({ length: totalPages }, (_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-foreground' 
                  : 'bg-muted-foreground/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
