import { useState, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { PLAYGROUND_ROLES } from '../src/constants';

interface MobileRandomRoleCarouselProps {
  onRoleSelect: (roleData: any) => void;
}

export function MobileRandomRoleCarousel({ onRoleSelect }: MobileRandomRoleCarouselProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 전체 PLAYGROUND_ROLES를 사용 (5-10개)
  const allRoles = PLAYGROUND_ROLES;

  const handleRoleClick = (role: any) => {
    if (!isDragging) {
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
    }
  };

  // 드래그 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(false);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startX === 0) return;
    e.preventDefault();
    setIsDragging(true);
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setStartX(0);
    setTimeout(() => setIsDragging(false), 100);
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(false);
    setStartX(e.touches[0].clientX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX === 0) return;
    setIsDragging(true);
    const x = e.touches[0].clientX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchEnd = () => {
    setStartX(0);
    setTimeout(() => setIsDragging(false), 100);
  };

  return (
    <div className="relative bg-muted/10 rounded-xl p-3 border border-border/20 mx-auto w-fit">
      {/* 3개만 보이는 스크롤 가능한 아바타 컨테이너 */}
      <div 
        className="relative overflow-hidden"
        style={{ width: '168px' }} // 정확히 3개: 48px * 3 + 12px * 2 = 168px
      >
        <div 
          ref={containerRef}
          className="flex gap-3 overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing select-none transition-transform duration-200"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* 랜덤 롤 아바타들 */}
          {allRoles.map((role, index) => (
            <button
              key={role.id}
              onClick={() => handleRoleClick(role)}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center text-base hover:scale-105 transition-all duration-200 border border-border/30 hover:border-border/50 shadow-sm hover:shadow-md active:scale-95"
              style={{ 
                pointerEvents: isDragging ? 'none' : 'auto'
              }}
            >
              {role.avatar}
            </button>
          ))}
          
          {/* ">" 표시 - 더 많은 Role이 있다는 힌트 */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center border border-border/30 opacity-60">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>
      
      {/* 드래그 힌트 */}
      <div className="flex justify-center mt-3">
        <div className="text-xs text-muted-foreground/60">
          ← 좌우로 스와이프하여 더 많은 Role 보기 →
        </div>
      </div>
    </div>
  );
}