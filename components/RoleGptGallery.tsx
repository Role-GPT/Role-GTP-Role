import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ArrowLeft, Search, Star, Briefcase, BookOpen, Code, Heart, Gamepad, Camera, Music, Zap, Users, Target, Lightbulb, GraduationCap, Coffee, Dumbbell, Palette, Calculator, Brain, Mic, Scissors, ChefHat, Stethoscope, FileText, Plus, Edit, Menu, Lock, Download, MessageSquare, Play, ArrowRight, Bookmark } from 'lucide-react';
import { useApp } from '../src/context/AppContext';
import { Role } from '../src/types';
import { StandardRoleEditModal } from './StandardRoleEditModal';
import { AdvancedRoleEditModal } from './AdvancedRoleEditModal';
import { GrokStyleRoleCreator } from './GrokStyleRoleCreator';
import { useIsMobile } from './ui/use-mobile';

// 역할 아이콘 매핑
const getRoleIcon = (roleId: string, category: string) => {
  const iconMap: { [key: string]: any } = {
    // 비즈니스
    'marketing_strategist': Briefcase,
    'business_analyst': Calculator,
    'sales_expert': Target,
    'hr_specialist': Users,
    
    // 디자인/창의성
    'ux_designer': Camera,
    'creative_director': Lightbulb,
    'graphic_designer': Palette,
    'writer': FileText,
    'musician': Music,
    'photographer': Camera,
    'video_editor': Scissors,
    
    // 개발
    'dev_mentor': Code,
    'automation_specialist': Zap,
    
    // 라이프스타일
    'fitness_coach': Dumbbell,
    'nutrition_expert': Heart,
    'life_coach': Target,
    'travel_planner': Camera,
    'cooking_chef': ChefHat,
    
    // 생산성
    'project_manager': FileText,
    'productivity_expert': Target,
    
    // 교육
    'language_teacher': GraduationCap,
    'study_advisor': BookOpen,
    'career_counselor': Briefcase,
    
    // 전문가
    'legal_advisor': FileText,
    'financial_advisor': Calculator,
    'medical_advisor': Stethoscope,
    
    // 기타
    'content_creator': Camera
  };
  
  return iconMap[roleId] || Briefcase;
};

// 역할 색상 매핑
const getRoleColor = (category: string) => {
  const colorMap: { [key: string]: string } = {
    'recommended': 'bg-purple-500',
    'playground': 'bg-pink-500',
    'popular': 'bg-blue-500',
    'lifestyle': 'bg-green-500',
    'creativity': 'bg-yellow-500',
    'productivity': 'bg-indigo-500',
    'education': 'bg-orange-500',
    'expert': 'bg-red-500',
    'business': 'bg-purple-600',
    'design': 'bg-pink-500',
    'development': 'bg-cyan-500',
    'custom': 'bg-gray-500',
    'guide': 'bg-teal-500'
  };
  
  return colorMap[category] || 'bg-gray-500';
};

interface RoleGptGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelect: (roleData: any) => void;
  selectedCategory?: string;
  onOpenLibrary?: () => void;
}

export function RoleGptGallery({ isOpen, onClose, onRoleSelect, selectedCategory: propSelectedCategory, onOpenLibrary }: RoleGptGalleryProps) {
  const { state, addRole } = useApp();
  const isMobile = useIsMobile();
  
  // 모드별 기능 제한 확인
  const userMode = state.userSettings.mode;
  const isStandard = userMode === 'standard';
  const isAdvanced = userMode === 'advanced';
  const isExpert = userMode === 'expert';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'recommended' | 'playground' | 'popular' | 'lifestyle' | 'creativity' | 'productivity' | 'education' | 'expert' | 'custom'>(
    propSelectedCategory as any || 'all'
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  // propSelectedCategory가 변경되면 selectedCategory 업데이트
  React.useEffect(() => {
    if (propSelectedCategory) {
      setSelectedCategory(propSelectedCategory as any);
    }
  }, [propSelectedCategory]);

  const filteredRoles = state.roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || role.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const recommendedRoles = filteredRoles.filter(role => role.category === 'recommended');
  const playgroundRoles = filteredRoles.filter(role => role.category === 'playground');
  const popularRoles = filteredRoles.filter(role => role.category === 'popular');
  const lifestyleRoles = filteredRoles.filter(role => role.category === 'lifestyle');
  const creativityRoles = filteredRoles.filter(role => role.category === 'creativity');
  const productivityRoles = filteredRoles.filter(role => role.category === 'productivity');
  const educationRoles = filteredRoles.filter(role => role.category === 'education');
  const expertRoles = filteredRoles.filter(role => role.category === 'expert');
  const customRoles = filteredRoles.filter(role => role.category === 'custom' || role.isCustom);

  // Role 라이브러리 슬롯 제한
  const maxCustomRoles = isStandard ? 2 : isAdvanced ? 10 : -1; // Expert는 무제한
  const canCreateRole = isExpert || (customRoles.length < maxCustomRoles);

  const handleRoleClick = (role: Role) => {
    // Role Gallery에서는 클릭 시 아무 동작하지 않음
    // 대신 호버 시 나타나는 액션 버튼들을 사용
  };

  const handleStartChat = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    onRoleSelect(role);
    onClose();
  };

  const handleEditRole = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    setRoleToEdit(role);
    setEditModalOpen(true);
  };

  const handleCreateRole = () => {
    if (!isExpert && customRoles.length >= maxCustomRoles) {
      alert(`${userMode.toUpperCase()} 모드에서는 최대 ${maxCustomRoles}개의 커스텀 Role만 만들 수 있습니다.`);
      return;
    }
    setRoleToEdit(null);
    setEditModalOpen(true);
  };

  const handleAddToLibrary = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 라이브러리 슬롯 제한 확인
    const userRoles = state.roles.filter(r => r.isCustom || r.category === 'custom' || r.category === 'imported');
    const maxLibraryRoles = isStandard ? 5 : isAdvanced ? 15 : -1; // Expert는 무제한
    
    if (!isExpert && userRoles.length >= maxLibraryRoles) {
      alert(`${userMode.toUpperCase()} 모드에서는 최대 ${maxLibraryRoles}개의 Role만 라이브러리에 저장할 수 있습니다.`);
      return;
    }
    
    // 이미 라이브러리에 있는지 확인
    const existingRole = state.roles.find(r => r.name === role.name && (r.isCustom || r.category === 'imported'));
    if (existingRole) {
      alert('이미 라이브러리에 저장된 Role입니다.');
      return;
    }
    
    // 새로운 Role을 라이브러리에 추가
    const newRole: Role = {
      ...role,
      id: `imported_${Date.now()}`,
      category: 'imported',
      isCustom: true,
      isPinned: false,
      createdMode: role.createdMode || userMode // 기존 모드가 있으면 유지, 없으면 현재 모드
    };
    
    addRole(newRole);
    alert(`"${role.name}" Role이 라이브러리에 추가되었습니다.`);
  };

  const renderRoleCard = (role: Role, index?: number) => {
    const IconComponent = getRoleIcon(role.id, role.category);
    const colorClass = getRoleColor(role.category);
    
    return (
      <Card 
        key={role.id} 
        className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group relative border-border/50 hover:border-border/80"
        onClick={() => handleRoleClick(role)}
      >
        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
          {/* 새로운 액션 버튼들 - 우상단에 세련된 아이콘들 */}
          <TooltipProvider>
            <div className={`absolute top-2 right-2 flex gap-1.5 z-10 transition-all duration-200 ${
              isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              {/* 라이브러리에 추가 버튼 (모든 모드에서 표시) */}
              {!role.isCustom && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-background/90 hover:bg-background text-foreground border border-border/50 hover:border-border backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
                      onClick={(e) => handleAddToLibrary(role, e)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p>Role 라이브러리에 추가</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* 커스텀 Role 편집 버튼 (Standard 모드 제외) */}
              {role.isCustom && !isStandard && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-background/90 hover:bg-background text-foreground border border-border/50 hover:border-border backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
                      onClick={(e) => handleEditRole(role, e)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p>Role 편집</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* 대화 ���작 버튼 - 모든 모드에서 표시 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    className="h-7 w-7 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={(e) => handleStartChat(role, e)}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p>바로 대화하기</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
          {index !== undefined && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs">
                #{index + 1}
              </Badge>
            </div>
          )}
          {/* 모든 환경에서 작은 아이콘 표시 */}
          <div className={`w-6 h-6 ${colorClass} rounded-md flex items-center justify-center mb-2 flex-shrink-0`}>
            <IconComponent className="h-3 w-3 text-white" />
          </div>
          <h3 className={`font-medium ${isMobile ? 'text-sm mb-1' : 'text-sm mb-1'}`}>{role.name}</h3>
          <p className={`text-muted-foreground line-clamp-2 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {role.description}
          </p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {role.isCustom && (
              <Badge variant="outline" className="text-xs">
                커스텀
              </Badge>
            )}
            {role.createdMode && (
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  role.createdMode === 'standard' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  role.createdMode === 'advanced' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}
              >
                {role.createdMode.toUpperCase()}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0">
        <div 
          className={`flex items-center justify-between ${isMobile ? 'px-3 pb-3' : 'p-4'}`}
          style={isMobile ? {paddingTop: 'max(12px, env(safe-area-inset-top, 0px))'} : {}}
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {/* 모바일에서는 로고 숨기기 */}
            <div className="flex items-center gap-3">
              <h1 className={`font-medium ${isMobile ? 'text-lg' : 'text-xl'}`}>Role 갤러리</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={onOpenLibrary} 
              size={isMobile ? "sm" : "default"}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {isMobile ? "내 라이브러리" : "내 Role 라이브러리"}
            </Button>

          </div>
        </div>

        <div className={`${isMobile ? 'px-3 pb-3' : 'px-4 pb-4'}`}>
          {!isMobile && (
            <div className="text-center mb-6">
              <p className="text-muted-foreground">
                다양한 스페셜리스트 역할을 선택하여 일관된 전문 상담을 받아보세요<br/>
                <span className="text-sm">Role GPT는 선택한 역할을 기억하고 유지합니다</span>
              </p>
              {isStandard && (
                <p className="text-muted-foreground text-xs mt-2 opacity-75">
                  💡 Standard 모드에서는 최대 5개의 Role을 라이브러리에 저장할 수 있습니다
                </p>
              )}
            </div>
          )}
          
          {/* Search */}
          <div className={`relative ${isMobile ? 'mb-3' : 'mb-4'}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="역할 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${isMobile ? 'h-9' : ''}`}
            />
          </div>
          
          {/* Category Filters - 모바일에서는 2행으로 배치 */}
          <div className={`flex gap-2 flex-wrap ${isMobile ? 'justify-start' : 'justify-center'}`}>
            <Button 
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setSelectedCategory('all')}
            >
              전체
            </Button>
            <Button 
              variant={selectedCategory === 'recommended' ? 'default' : 'outline'}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setSelectedCategory('recommended')}
            >
              추천
            </Button>
            <Button 
              variant={selectedCategory === 'playground' ? 'default' : 'outline'}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setSelectedCategory('playground')}
            >
              🎭 Playground
            </Button>
            <Button 
              variant={selectedCategory === 'popular' ? 'default' : 'outline'}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setSelectedCategory('popular')}
            >
              인기
            </Button>
            <Button 
              variant={selectedCategory === 'lifestyle' ? 'default' : 'outline'}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setSelectedCategory('lifestyle')}
            >
              라이프 스타일
            </Button>
            <Button 
              variant={selectedCategory === 'creativity' ? 'default' : 'outline'}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setSelectedCategory('creativity')}
            >
              창의성
            </Button>
            <Button 
              variant={selectedCategory === 'productivity' ? 'default' : 'outline'}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setSelectedCategory('productivity')}
            >
              생산성
            </Button>
            <Button 
              variant={selectedCategory === 'education' ? 'default' : 'outline'}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setSelectedCategory('education')}
            >
              {isMobile ? '교육' : '학습 및 교육'}
            </Button>
            <Button 
              variant={selectedCategory === 'expert' ? 'default' : 'outline'}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setSelectedCategory('expert')}
            >
              스페셜리스트
            </Button>
            <Button 
              variant={selectedCategory === 'custom' ? 'default' : 'outline'}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setSelectedCategory('custom')}
            >
              커스텀
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-6'}`}>
        <div className={`${isMobile ? '' : 'max-w-6xl mx-auto'} space-y-${isMobile ? '6' : '8'}`}>
          {/* Custom Roles Section */}
          {(selectedCategory === 'all' || selectedCategory === 'custom') && customRoles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                {!isMobile && <Users className="h-4 w-4 text-gray-500" />}
                <h2 className={`font-medium ${isMobile ? 'text-base' : 'text-base'}`}>내가 만든 Role</h2>
                <Badge variant="secondary" className="text-xs">
                  {customRoles.length}개
                </Badge>
              </div>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                {customRoles.map((role) => renderRoleCard(role))}
              </div>
            </div>
          )}

          {/* Recommended Section */}
          {(selectedCategory === 'all' || selectedCategory === 'recommended') && recommendedRoles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                {!isMobile && <Star className="h-4 w-4 text-yellow-500" />}
                <h2 className={`font-medium ${isMobile ? 'text-base' : 'text-base'}`}>추천 역할</h2>
              </div>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                {recommendedRoles.map((role) => renderRoleCard(role))}
              </div>
            </div>
          )}

          {/* Fun Section */}
          {(selectedCategory === 'all' || selectedCategory === 'playground') && playgroundRoles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🎭</span>
                <h2 className={`font-medium ${isMobile ? 'text-base' : 'text-base'}`}>Playground 캐릭터</h2>
                {!isMobile && (
                  <Badge variant="secondary" className="text-xs">
                    재미있고 창의적인 역할들
                  </Badge>
                )}
              </div>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                {playgroundRoles.map((role) => renderRoleCard(role))}
              </div>
            </div>
          )}

          {/* Popular Section */}
          {(selectedCategory === 'all' || selectedCategory === 'popular') && popularRoles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                {!isMobile && <Zap className="h-4 w-4 text-blue-500" />}
                <h2 className={`font-medium ${isMobile ? 'text-base' : 'text-base'}`}>인기 역할</h2>
                {!isMobile && (
                  <Badge variant="secondary" className="text-xs">
                    커뮤니티에서 가장 인기있는 역할
                  </Badge>
                )}
              </div>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                {popularRoles.map((role, index) => renderRoleCard(role, index))}
              </div>
            </div>
          )}

          {/* Lifestyle Section */}
          {(selectedCategory === 'all' || selectedCategory === 'lifestyle') && lifestyleRoles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                {!isMobile && <Heart className="h-4 w-4 text-rose-500" />}
                <h2 className={`font-medium ${isMobile ? 'text-base' : 'text-base'}`}>라이프 스타일</h2>
              </div>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                {lifestyleRoles.map((role) => renderRoleCard(role))}
              </div>
            </div>
          )}

          {/* Creativity Section */}
          {(selectedCategory === 'all' || selectedCategory === 'creativity') && creativityRoles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                {!isMobile && <Lightbulb className="h-4 w-4 text-yellow-500" />}
                <h2 className={`font-medium ${isMobile ? 'text-base' : 'text-base'}`}>창의성</h2>
              </div>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                {creativityRoles.map((role) => renderRoleCard(role))}
              </div>
            </div>
          )}

          {/* Productivity Section */}
          {(selectedCategory === 'all' || selectedCategory === 'productivity') && productivityRoles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                {!isMobile && <Target className="h-4 w-4 text-blue-500" />}
                <h2 className={`font-medium ${isMobile ? 'text-base' : 'text-base'}`}>생산성</h2>
              </div>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                {productivityRoles.map((role) => renderRoleCard(role))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {(selectedCategory === 'all' || selectedCategory === 'education') && educationRoles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                {!isMobile && <GraduationCap className="h-4 w-4 text-indigo-500" />}
                <h2 className={`font-medium ${isMobile ? 'text-base' : 'text-base'}`}>{isMobile ? '교육' : '학습 및 교육'}</h2>
              </div>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                {educationRoles.map((role) => renderRoleCard(role))}
              </div>
            </div>
          )}

          {/* Expert Section */}
          {(selectedCategory === 'all' || selectedCategory === 'expert') && expertRoles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                {!isMobile && <Briefcase className="h-4 w-4 text-purple-500" />}
                <h2 className={`font-medium ${isMobile ? 'text-base' : 'text-base'}`}>스페셜리스트</h2>
              </div>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                {expertRoles.map((role) => renderRoleCard(role))}
              </div>
            </div>
          )}

          {filteredRoles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* Grok Style Role Creator/Editor */}
      <GrokStyleRoleCreator
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        roleToEdit={roleToEdit}
        onSave={() => setEditModalOpen(false)}
      />
    </div>
  );
}
