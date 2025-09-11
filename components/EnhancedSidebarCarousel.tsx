import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { PLAYGROUND_ROLES } from '../src/constants';

interface EnhancedSidebarCarouselProps {
  onRoleSelect: (role: any) => void;
  isExpanded: boolean;
}

export function EnhancedSidebarCarousel({ onRoleSelect, isExpanded }: EnhancedSidebarCarouselProps) {
  // 기본 상태
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [lastMoveX, setLastMoveX] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [isInertiaScrolling, setIsInertiaScrolling] = useState(false);
  
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const inertiaRef = useRef<number>();
  const hapticTimeoutRef = useRef<NodeJS.Timeout>();

  // 레이아웃 계산 - 간단한 2페이지 접근
  const itemsPerView = isExpanded ? 3 : 1; // 확장시 3개, 축소시 1개
  const maxDisplayRoles = 6; // 사이드바에는 처음 6개만 표시
  const displayRoles = PLAYGROUND_ROLES.slice(0, maxDisplayRoles); // 처음 6개만
  const totalRoles = displayRoles.length; // 6개
  const totalPages = Math.ceil(totalRoles / itemsPerView); // 2페이지 (6÷3=2)
  const maxPageIndex = totalPages - 1; // 1 (마지막 페이지 인덱스: 0,1)
  
  // 현재 페이지 계산 - 엄격한 경계 체크
  const currentPageIndex = Math.min(maxPageIndex, Math.floor(currentIndex / itemsPerView));
  
  // 실제 마지막 인덱스 (3: Role 4,5,6 표시)
  const actualMaxIndex = totalRoles - itemsPerView; // 6 - 3 = 3
  const maxIndex = Math.min(maxPageIndex * itemsPerView, actualMaxIndex); // min(3, 3) = 3

  // 햅틱 피드백 함수
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      // 햅틱 패턴: light(50ms), medium(100ms), heavy(200ms)
      const patterns = {
        light: [50],
        medium: [100],
        heavy: [200]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const handlePrevious = useCallback(() => {
    if (!isExpanded || currentPageIndex <= 0) return;
    setIsAutoPlaying(false);
    const prevPageIndex = Math.max(0, currentPageIndex - 1);
    const newIndex = prevPageIndex * itemsPerView;
    setCurrentIndex(newIndex);
    triggerHaptic('medium');
  }, [isExpanded, itemsPerView, triggerHaptic, currentPageIndex, maxPageIndex]);

  const handleNext = useCallback(() => {
    if (!isExpanded || currentPageIndex >= maxPageIndex) return;
    setIsAutoPlaying(false);
    const nextPageIndex = Math.min(maxPageIndex, currentPageIndex + 1);
    const newIndex = Math.min(maxIndex, nextPageIndex * itemsPerView);
    setCurrentIndex(newIndex);
    triggerHaptic('medium');
  }, [isExpanded, maxPageIndex, itemsPerView, triggerHaptic, currentPageIndex, maxIndex]);



  // 마우스 이벤트 핸들러 - 엄격한 경계가 있는 페이지 단위 드래그
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isExpanded) return;
    
    setIsDragging(false);
    setDragStart(e.pageX);
    setLastMoveX(currentPageIndex);
    setIsAutoPlaying(false);
    triggerHaptic('light');
    e.preventDefault();
  }, [isExpanded, currentPageIndex, triggerHaptic]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragStart === 0 || !isExpanded) return;
    setIsDragging(true);
    const x = e.clientX;
    const walk = (dragStart - x) / 150; // 페이지 단위 드래그 감도
    const newPageIndex = Math.max(0, Math.min(maxPageIndex, Math.round(lastMoveX + walk)));
    const newIndex = Math.min(maxIndex, newPageIndex * itemsPerView);
    setCurrentIndex(newIndex);
  }, [dragStart, lastMoveX, maxPageIndex, itemsPerView, isExpanded, maxIndex]);

  const handleMouseUp = useCallback(() => {
    setDragStart(0);
    setTimeout(() => setIsDragging(false), 100);
  }, []);

  // 터치 이벤트 핸들러 - 엄격한 경계가 있는 페이지 단위 터치
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isExpanded) return;
    
    setIsDragging(false);
    setDragStart(e.touches[0].clientX);
    setLastMoveX(currentPageIndex);
    setIsAutoPlaying(false);
    triggerHaptic('light');
  }, [isExpanded, currentPageIndex, triggerHaptic]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStart === 0 || !isExpanded) return;
    setIsDragging(true);
    const x = e.touches[0].clientX;
    const walk = (dragStart - x) / 150; // 페이지 단위 터치 감도
    const newPageIndex = Math.max(0, Math.min(maxPageIndex, Math.round(lastMoveX + walk)));
    const newIndex = Math.min(maxIndex, newPageIndex * itemsPerView);
    setCurrentIndex(newIndex);
  }, [dragStart, lastMoveX, maxPageIndex, itemsPerView, isExpanded, maxIndex]);

  const handleTouchEnd = useCallback(() => {
    setDragStart(0);
    setTimeout(() => setIsDragging(false), 100);
  }, []);

  // 자동 재생 로직 - 엄격한 경계 체크가 있는 페이지 단위 자동 재생
  useEffect(() => {
    if (isAutoPlaying && isExpanded && totalPages > 1 && !isDragging && currentPageIndex < maxPageIndex && currentIndex < maxIndex) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const currentPage = Math.floor(prev / itemsPerView);
          const nextPageIndex = currentPage + 1;
          if (nextPageIndex >= maxPageIndex || prev >= maxIndex) {
            setIsAutoPlaying(false); // 끝에 도달하면 자동재생 정지
            return Math.min(maxIndex, maxPageIndex * itemsPerView);
          }
          return Math.min(maxIndex, nextPageIndex * itemsPerView);
        });
      }, 7000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, isExpanded, totalPages, itemsPerView, isDragging, maxPageIndex, currentPageIndex, maxIndex, currentIndex]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (hapticTimeoutRef.current) {
        clearTimeout(hapticTimeoutRef.current);
      }
    };
  }, []);

  const handleRoleClick = useCallback((role: typeof PLAYGROUND_ROLES[0]) => {
    if (!isDragging) {
      setIsAutoPlaying(false);
      triggerHaptic('medium');
      onRoleSelect({
        id: role.id,
        name: role.name,
        description: role.description,
        prompt: role.prompt,
        category: role.category,
        avatar: role.avatar,
        keywordIds: [],
        temperature: role.temperature || 0.8,
        maxOutputTokens: role.maxOutputTokens || 2048,
        safetyLevel: role.safetyLevel || 'BLOCK_MEDIUM_AND_ABOVE' as const
      });
    }
  }, [isDragging, triggerHaptic, onRoleSelect]);

  if (!isExpanded) {
    // 축소된 상태에서는 현재 인덱스의 Role 아이콘 표시
    const currentRole = displayRoles[currentIndex % totalRoles];
    return (
      <div className="px-2 py-2">
        <button
          onClick={() => handleRoleClick(currentRole)}
          className="w-full p-2 rounded-lg hover:bg-accent/50 transition-colors group"
          title={currentRole.name}
        >
          <div className="flex items-center justify-center">
            <div className="text-2xl group-hover:scale-110 transition-transform">
              {currentRole.avatar}
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">⭐ 추천</span>
          {/* 더 보기 링크 */}
          <button 
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => {
              // 여기서 Role Library 모달을 열거나 다른 액션 수행
              console.log('더 많은 Role 보기');
            }}
          >
            더보기
          </button>
        </div>
        {isExpanded && totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="w-5 h-5"
              onClick={handlePrevious}
              disabled={currentPageIndex <= 0}
            >
              <ChevronLeft className={`w-3 h-3 ${currentPageIndex <= 0 ? 'opacity-30' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-5 h-5"
              onClick={handleNext}
              disabled={currentPageIndex >= maxPageIndex || currentIndex >= maxIndex}
            >
              <ChevronRight className={`w-3 h-3 ${(currentPageIndex >= maxPageIndex || currentIndex >= maxIndex) ? 'opacity-30' : ''}`} />
            </Button>
          </div>
        )}
      </div>



      {/* 캐러셀 컨테이너 */}
      <div 
        className="overflow-hidden rounded-lg select-none relative"
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
            transform: isExpanded 
              ? `translateX(-${currentPageIndex * 100}%)`
              : 'translateX(0)',
            width: isExpanded 
              ? `${totalPages * 100}%`
              : '100%'
          }}
        >
          {/* Role 아이템들 */}
          {displayRoles.map((role, index) => (
            <div
              key={role.id}
              className="flex-shrink-0 px-1"
              style={{ 
                width: isExpanded 
                  ? `${100 / (totalPages * itemsPerView)}%` 
                  : '100%'
              }}
            >
              <button
                onClick={() => handleRoleClick(role)}
                className="w-full p-2 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors group"
              >
                <div className="flex flex-col items-center text-center space-y-1">
                  {/* 아바타 */}
                  <div className="text-lg group-hover:scale-110 transition-transform">
                    {role.avatar}
                  </div>
                  
                  {/* 이름 */}
                  <div className="text-xs font-medium text-foreground truncate w-full">
                    {role.name.replace(/^[^\s]+\s/, '')} {/* 이모지 제거 */}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 인디케이터 제거 - 더 깔끔한 UI */}
    </div>
  );
}
