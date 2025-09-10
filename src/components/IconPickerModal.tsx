import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  // Business & Work
  Briefcase, Target, TrendingUp, BarChart3, Users, Building, Presentation,
  Calculator, FileText, Clipboard, PieChart, Award, Trophy, Globe,
  // Creative & Design
  Palette, Brush, Camera, Image, Video, Music, Headphones, Mic, Film,
  Pen, Feather, Layers, Zap, Sparkles, Star, Heart, Crown,
  // Technology & Science
  Monitor, Smartphone, Tablet, Laptop, Cpu, Database, Cloud, Code,
  Bug, Terminal, Wifi, Battery, Bluetooth, Usb, Router, Server,
  // Education & Learning
  BookOpen, GraduationCap, School, Library, Bookmark, FileSpreadsheet,
  NotebookPen, Lightbulb, Brain, TestTube, Microscope,
  // Communication & Social
  MessageCircle, Mail, Phone, Video as VideoCall, Users2, Share,
  ThumbsUp, MessageSquare, Send, AtSign, Megaphone, Radio,
  // Health & Wellness
  Activity, Heart as HeartHealth, Pill, Stethoscope, Apple, Dumbbell,
  Moon, Sun, Leaf, Flower, Mountain,
  // Travel & Transportation
  Plane, Car, Train, Bus, Bike, MapPin, Map, Compass, Luggage,
  Hotel, Ticket, Globe2,
  // Food & Dining
  Coffee, Wine, Utensils, Cookie, Carrot,
  Fish, ShoppingCart,
  // Sports & Recreation
  Gamepad2, Dice1, Waves, Sailboat, Tent, Binoculars,
  // Home & Lifestyle
  Home, Key, Lock, Shield, Umbrella, Gift,
  ShoppingBag, Scissors, Hammer,
  // Nature & Weather
  Cloudy, CloudRain, Snowflake, CloudLightning, Rainbow, Sunrise,
  Sunset, Thermometer, Wind, Droplets,
  // Time & Calendar
  Clock, Calendar, Timer, AlarmClock, Hourglass, Watch, CalendarDays,
  CalendarCheck
} from 'lucide-react';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIconSelect: (iconName: string) => void;
  currentIcon?: string;
  title?: string;
}

// 아이콘 카테고리 정의
const iconCategories = {
  business: {
    name: '업무 & 비즈니스',
    icons: [
      { name: 'briefcase', Icon: Briefcase },
      { name: 'target', Icon: Target },
      { name: 'trending-up', Icon: TrendingUp },
      { name: 'bar-chart-3', Icon: BarChart3 },
      { name: 'users', Icon: Users },
      { name: 'building', Icon: Building },
      { name: 'presentation', Icon: Presentation },
      { name: 'calculator', Icon: Calculator },
      { name: 'file-text', Icon: FileText },
      { name: 'clipboard', Icon: Clipboard },
      { name: 'pie-chart', Icon: PieChart },
      { name: 'award', Icon: Award },
      { name: 'trophy', Icon: Trophy },
      { name: 'globe', Icon: Globe }
    ]
  },
  creative: {
    name: '창의 & 디자인',
    icons: [
      { name: 'palette', Icon: Palette },
      { name: 'brush', Icon: Brush },
      { name: 'camera', Icon: Camera },
      { name: 'image', Icon: Image },
      { name: 'video', Icon: Video },
      { name: 'music', Icon: Music },
      { name: 'headphones', Icon: Headphones },
      { name: 'mic', Icon: Mic },
      { name: 'film', Icon: Film },
      { name: 'pen', Icon: Pen },
      { name: 'feather', Icon: Feather },
      { name: 'layers', Icon: Layers },
      { name: 'zap', Icon: Zap },
      { name: 'sparkles', Icon: Sparkles },
      { name: 'star', Icon: Star },
      { name: 'heart', Icon: Heart },
      { name: 'crown', Icon: Crown }
    ]
  },
  technology: {
    name: '기술 & 과학',
    icons: [
      { name: 'monitor', Icon: Monitor },
      { name: 'smartphone', Icon: Smartphone },
      { name: 'tablet', Icon: Tablet },
      { name: 'laptop', Icon: Laptop },
      { name: 'cpu', Icon: Cpu },
      { name: 'database', Icon: Database },
      { name: 'cloud', Icon: Cloud },
      { name: 'code', Icon: Code },
      { name: 'bug', Icon: Bug },
      { name: 'terminal', Icon: Terminal },
      { name: 'wifi', Icon: Wifi },
      { name: 'battery', Icon: Battery },
      { name: 'bluetooth', Icon: Bluetooth },
      { name: 'usb', Icon: Usb },
      { name: 'router', Icon: Router },
      { name: 'server', Icon: Server }
    ]
  },
  education: {
    name: '교육 & 학습',
    icons: [
      { name: 'book-open', Icon: BookOpen },
      { name: 'graduation-cap', Icon: GraduationCap },
      { name: 'school', Icon: School },
      { name: 'library', Icon: Library },
      { name: 'bookmark', Icon: Bookmark },
      { name: 'file-spreadsheet', Icon: FileSpreadsheet },
      { name: 'notebook-pen', Icon: NotebookPen },
      { name: 'lightbulb', Icon: Lightbulb },
      { name: 'brain', Icon: Brain },
      { name: 'test-tube', Icon: TestTube },
      { name: 'microscope', Icon: Microscope }
    ]
  },
  communication: {
    name: '소통 & 소셜',
    icons: [
      { name: 'message-circle', Icon: MessageCircle },
      { name: 'mail', Icon: Mail },
      { name: 'phone', Icon: Phone },
      { name: 'video-call', Icon: VideoCall },
      { name: 'users-2', Icon: Users2 },
      { name: 'share', Icon: Share },
      { name: 'thumbs-up', Icon: ThumbsUp },
      { name: 'message-square', Icon: MessageSquare },
      { name: 'send', Icon: Send },
      { name: 'at-sign', Icon: AtSign },
      { name: 'megaphone', Icon: Megaphone },
      { name: 'radio', Icon: Radio }
    ]
  },
  lifestyle: {
    name: '라이프스타일',
    icons: [
      { name: 'home', Icon: Home },
      { name: 'coffee', Icon: Coffee },
      { name: 'wine', Icon: Wine },
      { name: 'utensils', Icon: Utensils },
      { name: 'cookie', Icon: Cookie },
      { name: 'carrot', Icon: Carrot },
      { name: 'fish', Icon: Fish },
      { name: 'shopping-cart', Icon: ShoppingCart },
      { name: 'shopping-bag', Icon: ShoppingBag },
      { name: 'gift', Icon: Gift },
      { name: 'key', Icon: Key },
      { name: 'lock', Icon: Lock },
      { name: 'shield', Icon: Shield },
      { name: 'umbrella', Icon: Umbrella },
      { name: 'scissors', Icon: Scissors },
      { name: 'hammer', Icon: Hammer }
    ]
  },
  nature: {
    name: '자연 & 날씨',
    icons: [
      { name: 'leaf', Icon: Leaf },
      { name: 'flower', Icon: Flower },
      { name: 'mountain', Icon: Mountain },
      { name: 'sun', Icon: Sun },
      { name: 'moon', Icon: Moon },
      { name: 'cloudy', Icon: Cloudy },
      { name: 'cloud-rain', Icon: CloudRain },
      { name: 'snowflake', Icon: Snowflake },
      { name: 'cloud-lightning', Icon: CloudLightning },
      { name: 'rainbow', Icon: Rainbow },
      { name: 'sunrise', Icon: Sunrise },
      { name: 'sunset', Icon: Sunset },
      { name: 'thermometer', Icon: Thermometer },
      { name: 'wind', Icon: Wind },
      { name: 'droplets', Icon: Droplets }
    ]
  },
  travel: {
    name: '여행 & 교통',
    icons: [
      { name: 'plane', Icon: Plane },
      { name: 'car', Icon: Car },
      { name: 'train', Icon: Train },
      { name: 'bus', Icon: Bus },
      { name: 'bike', Icon: Bike },
      { name: 'map-pin', Icon: MapPin },
      { name: 'map', Icon: Map },
      { name: 'compass', Icon: Compass },
      { name: 'luggage', Icon: Luggage },
      { name: 'hotel', Icon: Hotel },
      { name: 'ticket', Icon: Ticket },
      { name: 'globe-2', Icon: Globe2 }
    ]
  },
  sports: {
    name: '스포츠 & 레크리에이션',
    icons: [
      { name: 'gamepad-2', Icon: Gamepad2 },
      { name: 'dice-1', Icon: Dice1 },
      { name: 'waves', Icon: Waves },
      { name: 'sailboat', Icon: Sailboat },
      { name: 'tent', Icon: Tent },
      { name: 'binoculars', Icon: Binoculars }
    ]
  },
  time: {
    name: '시간 & 일정',
    icons: [
      { name: 'clock', Icon: Clock },
      { name: 'calendar', Icon: Calendar },
      { name: 'timer', Icon: Timer },
      { name: 'alarm-clock', Icon: AlarmClock },
      { name: 'hourglass', Icon: Hourglass },
      { name: 'watch', Icon: Watch },
      { name: 'calendar-days', Icon: CalendarDays },
      { name: 'calendar-check', Icon: CalendarCheck }
    ]
  }
};

export function IconPickerModal({ isOpen, onClose, onIconSelect, currentIcon, title = "아이콘 선택" }: IconPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof iconCategories>('business');

  // 검색 필터링
  const getFilteredIcons = () => {
    const categoryIcons = iconCategories[selectedCategory].icons;
    if (!searchQuery) return categoryIcons;
    
    return categoryIcons.filter(icon => 
      icon.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleIconSelect = (iconName: string) => {
    onIconSelect(iconName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            카테고리에서 원하는 아이콘을 선택하거나 검색을 통해 찾을 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 검색창 */}
          <div className="relative">
            <Input
              placeholder="아이콘 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4"
            />
          </div>

          {/* 카테고리 선택 */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(iconCategories).map(([key, category]) => (
              <Badge
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                onClick={() => setSelectedCategory(key as keyof typeof iconCategories)}
              >
                {category.name}
              </Badge>
            ))}
          </div>

          {/* 아이콘 그리드 */}
          <ScrollArea className="h-96">
            <div className="grid grid-cols-8 md:grid-cols-12 gap-2 p-2">
              {getFilteredIcons().map((icon) => {
                const IconComponent = icon.Icon;
                const isSelected = currentIcon === icon.name;
                
                return (
                  <button
                    key={icon.name}
                    onClick={() => handleIconSelect(icon.name)}
                    className={`p-3 rounded-lg border transition-all hover:bg-accent hover:scale-110 ${
                      isSelected ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    title={icon.name.replace(/-/g, ' ')}
                  >
                    <IconComponent className="w-5 h-5 mx-auto" />
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}