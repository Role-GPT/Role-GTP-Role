import { Globe, GraduationCap, Briefcase, Palette, Home } from 'lucide-react';
import { Badge } from './ui/badge';

interface CompactSourceIndicatorProps {
  sourceModes: {
    web: boolean;
    academic: boolean;
    business: boolean;
    culture: boolean;
    lifestyle: boolean;
  };
  className?: string;
}

interface SourceInfo {
  id: string;
  emoji: string;
  name: string;
  icon: any;
  color: string;
}

export function CompactSourceIndicator({ sourceModes, className = '' }: CompactSourceIndicatorProps) {
  const sourceInfos: SourceInfo[] = [
    { id: 'web', emoji: '🌐', name: '웹', icon: Globe, color: 'text-blue-500' },
    { id: 'academic', emoji: '🎓', name: '학문', icon: GraduationCap, color: 'text-purple-500' },
    { id: 'business', emoji: '💼', name: '비즈니스', icon: Briefcase, color: 'text-green-500' },
    { id: 'culture', emoji: '🎭', name: '문화', icon: Palette, color: 'text-pink-500' },
    { id: 'lifestyle', emoji: '🏠', name: '라이프스타일', icon: Home, color: 'text-orange-500' }
  ];

  const activeSources = sourceInfos.filter(source => 
    sourceModes[source.id as keyof typeof sourceModes]
  );

  if (activeSources.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-xs text-muted-foreground mr-1">소스:</span>
      {activeSources.map((source) => (
        <Badge 
          key={source.id} 
          variant="secondary" 
          className="h-5 px-1.5 text-xs flex items-center gap-1"
        >
          <span>{source.emoji}</span>
          <span className="hidden sm:inline">{source.name}</span>
        </Badge>
      ))}
    </div>
  );
}
