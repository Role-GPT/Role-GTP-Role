import { useState, useRef, useEffect } from 'react';
import { PLAYGROUND_ROLES } from '../src/constants';

interface SidebarRoleCarouselScrollProps {
  onRoleSelect: (role: any) => void;
  isExpanded: boolean;
}

export function SidebarRoleCarouselScroll({ onRoleSelect, isExpanded }: SidebarRoleCarouselScrollProps) {
  const handleRoleClick = (role: typeof PLAYGROUND_ROLES[0]) => {
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
  };

  if (!isExpanded) {
    // 축소된 상태에서는 첫 번째 Role만 표시
    const currentRole = PLAYGROUND_ROLES[0];
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
    <div className="px-3 py-1.5">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">🎭 추천</span>
        </div>
      </div>

      {/* 스크롤 가능한 그리드 컨테이너 */}
      <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {PLAYGROUND_ROLES.slice(0, 18).map((role) => ( // 18개만 표시 (6줄)
            <button
              key={role.id}
              onClick={() => handleRoleClick(role)}
              className="p-1 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors group text-center"
            >
              <div className="flex flex-col items-center space-y-0.5">
                {/* 아바타 */}
                <div className="text-xs group-hover:scale-110 transition-transform">
                  {role.avatar}
                </div>
                
                {/* 이름 */}
                <div className="text-[9px] font-medium text-foreground truncate w-full leading-tight">
                  {role.name.replace(/^[^\s]+\s/, '')} {/* 이모지 제거 */}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}