// components/IconRenderer.tsx
import {
    // Business & Work
    Briefcase, Target, TrendingUp, BarChart3, Users, Building, Presentation,
    Calculator, FileText, Clipboard, PieChart, Award, Trophy, Globe,
    // Creative & Design
    Palette, Brush, Camera, Image, Video as VideoCall, Music, Headphones, Mic, Film,
    Pen, Feather, Layers, Zap, Sparkles, Star, Heart, Crown, Gift,
    // Technology & Science
    Monitor, Smartphone, Tablet, Laptop, Cpu, Database, Cloud, Code,
    Bug, Terminal, Wifi, Battery, Bluetooth, Usb, Router, Server,
    // Education & Learning
    BookOpen, GraduationCap, School, Library, Bookmark, FileSpreadsheet,
    NotebookPen, Lightbulb, Brain, TestTube, Microscope,
    // Communication & Social
    MessageCircle, Mail, Phone, Users2, Share, ThumbsUp, MessageSquare, Send,
    AtSign, Megaphone, Radio,
    // Health & Wellness / Nature & Lifestyle (혼합)
    Activity, Pill, Stethoscope, Apple, Dumbbell, Moon, Sun, Leaf, Flower, Mountain,
    // Travel & Transportation
    Plane, Car, Train, Bus, Bike, MapPin, Map, Compass, Luggage, Hotel, Ticket, Globe2,
    // Food & Dining
    Coffee, Wine, Utensils, Cookie, Carrot, Fish, ShoppingCart, ShoppingBag,
    // Sports & Recreation
    Gamepad2, Dice1, Waves, Sailboat, Tent, Binoculars,
    // Home & Lifestyle
    Home, Key, Lock, Shield, Umbrella, Scissors, Hammer,
    // Nature & Weather
    Cloudy, CloudRain, Snowflake, CloudLightning, Rainbow, Sunrise, Sunset,
    Thermometer, Wind, Droplets,
    // Time & Calendar
    Clock, Calendar, Timer, AlarmClock, Hourglass, Watch, CalendarDays, CalendarCheck,
    // Default fallbacks
    FolderPlus
} from 'lucide-react';

// 아이콘 매핑
const iconMap: Record<string, any> = {
    // Business & Work
    'briefcase': Briefcase,
    'target': Target,
    'trending-up': TrendingUp,
    'bar-chart-3': BarChart3,
    'users': Users,
    'building': Building,
    'presentation': Presentation,
    'calculator': Calculator,
    'file-text': FileText,
    'clipboard': Clipboard,
    'pie-chart': PieChart,
    'award': Award,
    'trophy': Trophy,
    'globe': Globe,

    // Creative & Design
    'palette': Palette,
    'brush': Brush,
    'camera': Camera,
    'image': Image,
    'video-call': VideoCall,
    'music': Music,
    'headphones': Headphones,
    'mic': Mic,
    'film': Film,
    'pen': Pen,
    'feather': Feather,
    'layers': Layers,
    'zap': Zap,
    'sparkles': Sparkles,
    'star': Star,
    'heart': Heart,
    'crown': Crown,
    'gift': Gift,

    // Technology & Science
    'monitor': Monitor,
    'smartphone': Smartphone,
    'tablet': Tablet,
    'laptop': Laptop,
    'cpu': Cpu,
    'database': Database,
    'cloud': Cloud,
    'code': Code,
    'bug': Bug,
    'terminal': Terminal,
    'wifi': Wifi,
    'battery': Battery,
    'bluetooth': Bluetooth,
    'usb': Usb,
    'router': Router,
    'server': Server,

    // Education & Learning
    'book-open': BookOpen,
    'graduation-cap': GraduationCap,
    'school': School,
    'library': Library,
    'bookmark': Bookmark,
    'file-spreadsheet': FileSpreadsheet,
    'notebook-pen': NotebookPen,
    'lightbulb': Lightbulb,
    'brain': Brain,
    'test-tube': TestTube,
    'microscope': Microscope,

    // Communication & Social
    'message-circle': MessageCircle,
    'mail': Mail,
    'phone': Phone,
    'users-2': Users2,
    'share': Share,
    'thumbs-up': ThumbsUp,
    'message-square': MessageSquare,
    'send': Send,
    'at-sign': AtSign,
    'megaphone': Megaphone,
    'radio': Radio,

    // Nature & Lifestyle
    'leaf': Leaf,
    'flower': Flower,
    'mountain': Mountain,
    'sun': Sun,
    'moon': Moon,
    'cloudy': Cloudy,
    'cloud-rain': CloudRain,
    'snowflake': Snowflake,
    'cloud-lightning': CloudLightning,
    'rainbow': Rainbow,
    'sunrise': Sunrise,
    'sunset': Sunset,
    'thermometer': Thermometer,
    'wind': Wind,
    'droplets': Droplets,

    // Travel & Transportation
    'plane': Plane,
    'car': Car,
    'train': Train,
    'bus': Bus,
    'bike': Bike,
    'map-pin': MapPin,
    'map': Map,
    'compass': Compass,
    'luggage': Luggage,
    'hotel': Hotel,
    'ticket': Ticket,
    'globe-2': Globe2,

    // Food & Dining
    'coffee': Coffee,
    'wine': Wine,
    'utensils': Utensils,
    'cookie': Cookie,
    'carrot': Carrot,
    'fish': Fish,
    'shopping-cart': ShoppingCart,
    'shopping-bag': ShoppingBag,

    // Home & Lifestyle
    'home': Home,
    'key': Key,
    'lock': Lock,
    'shield': Shield,
    'umbrella': Umbrella,
    'scissors': Scissors,
    'hammer': Hammer,

    // Sports & Recreation
    'gamepad-2': Gamepad2,
    'dice-1': Dice1,
    'waves': Waves,
    'sailboat': Sailboat,
    'tent': Tent,
    'binoculars': Binoculars,

    // Time & Calendar
    'clock': Clock,
    'calendar': Calendar,
    'timer': Timer,
    'alarm-clock': AlarmClock,
    'hourglass': Hourglass,
    'watch': Watch,
    'calendar-days': CalendarDays,
    'calendar-check': CalendarCheck,

    // Default
    'folder-plus': FolderPlus,
};

interface IconRendererProps {
    iconName?: string;
    className?: string;
    fallback?: string;
}

export function IconRenderer({
    iconName,
    className = 'w-4 h-4',
    fallback = 'folder-plus',
}: IconRendererProps) {
    const iconKey = iconName || fallback;
    const IconComponent = iconMap[iconKey] || iconMap[fallback] || FolderPlus;
    return <IconComponent className={className} />;
}

export function hasIcon(iconName: string): boolean {
    return iconName in iconMap;
}

export function getAllIconNames(): string[] {
    return Object.keys(iconMap);
}
