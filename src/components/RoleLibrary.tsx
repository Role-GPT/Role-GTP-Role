import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Search, Plus, Edit, Star, Trash2, Download, Upload, Copy, BookOpen, Users, Target, Lightbulb, GraduationCap, Briefcase, Heart, Code, Settings } from 'lucide-react';
import { useApp } from '../src/context/AppContext';
import { Role, Mode } from '../src/types';
import { StandardRoleEditModal } from './StandardRoleEditModal';
import { AdvancedRoleEditModal } from './AdvancedRoleEditModal';
import { GrokStyleRoleCreator } from './GrokStyleRoleCreator';
import { CrossModeGuardModal } from './CrossModeGuardModal';
import { useIsMobile } from './ui/use-mobile';
import { useCrossModeGuard } from '../src/hooks/useCrossModeGuard';
import { toast } from 'sonner';

// 역할 아이콘 매핑
const getRoleIcon = (roleId: string, category: string) => {
  const iconMap: { [key: string]: any } = {
    // 비즈니스
    'marketing_strategist': Briefcase,
    'business_analyst': Target,
    'sales_expert': Target,
    'hr_specialist': Users,
    
    // 디자인/창의성
    'ux_designer': Lightbulb,
    'creative_director': Lightbulb,
    'graphic_designer': Lightbulb,
    'writer': BookOpen,
    'musician': Heart,
    'photographer': Lightbulb,
    'video_editor': Lightbulb,
    
    // 개발
    'dev_mentor': Code,
    'automation_specialist': Code,
    
    // 라이프스타일
    'fitness_coach': Heart,
    'nutrition_expert': Heart,
    'life_coach': Target,
    'travel_planner': Heart,
    'cooking_chef': Heart,
    
    // 생산성
    'project_manager': Target,
    'productivity_expert': Target,
    
    // 교육
    'language_teacher': GraduationCap,
    'study_advisor': BookOpen,
    'career_counselor': Briefcase,
    
    // 전문가
    'legal_advisor': Briefcase,
    'financial_advisor': Briefcase,
    'medical_advisor': Heart,
    
    // 기타
    'content_creator': Lightbulb
  };
  
  return iconMap[roleId] || Briefcase;
};

// 역할 색상 매핑
const getRoleColor = (category: string) => {
  const colorMap: { [key: string]: string } = {
    'custom': 'bg-purple-500',
    'imported': 'bg-blue-500',
    'recommended': 'bg-green-500',
    'popular': 'bg-orange-500',
    'lifestyle': 'bg-pink-500',
    'creativity': 'bg-yellow-500',
    'productivity': 'bg-indigo-500',
    'education': 'bg-teal-500',
    'expert': 'bg-red-500',
    'business': 'bg-gray-600',
    'design': 'bg-purple-600',
    'development': 'bg-cyan-500'
  };
  
  return colorMap[category] || 'bg-gray-500';
};

interface RoleLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelect: (roleData: any) => void;
}

export function RoleLibrary({ isOpen, onClose, onRoleSelect }: RoleLibraryProps) {
  const { state, addRole, updateRole, deleteRole, updateUserSettings } = useApp();
  const isMobile = useIsMobile();
  
  // 모드별 기능 제한 확인
  const userMode = state.userSettings.mode;
  const isStandard = userMode === 'standard';
  const isAdvanced = userMode === 'advanced';
  const isExpert = userMode === 'expert';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'custom' | 'imported' | 'favorites'>('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [roleMode, setRoleMode] = useState<Mode>(userMode); // 라이브러리에서는 별도 모드 관리

  // Cross-Mode Guard 훅
  const crossModeGuard = useCrossModeGuard({
    onSwitchChatMode: (chatId: string, newMode: Mode) => {
      // 현재 대화창의 모드를 변경하는 로직은 나중에 구현
      console.log('Switch chat mode:', chatId, newMode);
    },
    onCloneRole: async (roleId: string, targetMode: Mode) => {
      // Role을 새로운 모드로 복사하는 로직
      const originalRole = state.roles.find(r => r.id === roleId);
      if (originalRole) {
        const clonedRole: Role = {
          ...originalRole,
          id: `custom_${Date.now()}`,
          name: `${originalRole.name} (${targetMode.toUpperCase()})`,
          category: 'custom',
          isCustom: true,
          isPinned: false
        };
        
        addRole(clonedRole);
        return clonedRole.id;
      }
      throw new Error('Role not found');
    }
  });

  // 사용자 Role들만 필터링 (커스텀 + 가져온 Role들)
  const userRoles = state.roles.filter(role => 
    role.isCustom || 
    role.category === 'custom' || 
    role.category === 'imported'
  );

  const filteredRoles = userRoles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    switch (selectedCategory) {
      case 'custom':
        matchesCategory = role.isCustom || role.category === 'custom';
        break;
      case 'imported':
        matchesCategory = role.category === 'imported';
        break;
      case 'favorites':
        matchesCategory = role.isPinned || false;
        break;
      case 'all':
      default:
        matchesCategory = true;
        break;
    }
    
    return matchesSearch && matchesCategory;
  });

  // Role 라이브러리 슬롯 제한 (나중에 구현)
  const maxLibraryRoles = isStandard ? 5 : isAdvanced ? 15 : -1; // Expert는 무제한
  const canCreateRole = isExpert || (userRoles.length < maxLibraryRoles);

  const handleRoleClick = async (role: Role) => {
    // Cross-Mode Guard 체크
    const decision = await crossModeGuard.openGuard({
      chatMode: userMode,
      roleMode: roleMode,
      roleId: role.id,
      roleName: role.name,
      lang: 'ko'
    });

    if (decision) {
      onRoleSelect(role);
      onClose();
    }
  };

  const handleEditRole = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    setRoleToEdit(role);
    setEditModalOpen(true);
  };

  const handleCreateRole = () => {
    if (!isExpert && userRoles.length >= maxLibraryRoles) {
      toast.error(`${userMode.toUpperCase()} 모드에서는 최대 ${maxLibraryRoles}개의 Role만 저장할 수 있습니다.`);
      return;
    }
    setRoleToEdit(null);
    setEditModalOpen(true);
  };

  const handleDeleteRole = (roleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const role = state.roles.find(r => r.id === roleId);
    if (role && confirm(`"${role.name}" Role을 삭제하시겠습니까?`)) {
      deleteRole(roleId);
      toast.success('Role이 삭제되었습니다.');
    }
  };

  const handleToggleFavorite = (roleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const role = state.roles.find(r => r.id === roleId);
    if (role) {
      updateRole(roleId, { isPinned: !role.isPinned });
      toast.success(role.isPinned ? '즐겨찾기에서 제거했습니다.' : '즐겨찾기에 추가했습니다.');
    }
  };

  const handleExportRole = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    const roleData = {
      name: role.name,
      description: role.description,
      prompt: role.prompt,
      category: role.category,
      keywordIds: role.keywordIds,
      temperature: role.temperature,
      maxOutputTokens: role.maxOutputTokens,
      safetyLevel: role.safetyLevel,
      exportedAt: new Date().toISOString(),
      exportedFrom: 'Role GPT Library'
    };

    const dataStr = JSON.stringify(roleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${role.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_role.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success(`"${role.name}" Role이 내보내기 되었습니다.`);
  };

  const handleImportRole = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const roleData = JSON.parse(e.target?.result as string);
            const newRole: Role = {
              id: `imported_${Date.now()}`,
              name: roleData.name || '가져온 Role',
              description: roleData.description || '',
              prompt: roleData.prompt || '',
              category: 'imported',
              keywordIds: roleData.keywordIds || [],
              temperature: roleData.temperature || 0.7,
              maxOutputTokens: roleData.maxOutputTokens || 2048,
              safetyLevel: roleData.safetyLevel || 'BLOCK_MEDIUM_AND_ABOVE',
              isCustom: true,
              isPinned: false
            };
            
            addRole(newRole);
            toast.success('Role이 성공적으로 가져와졌습니다.');
          } catch (error) {
            toast.error('Role 파일을 읽는데 실패했습니다.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleDuplicateRole = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicatedRole: Role = {
      ...role,
      id: `custom_${Date.now()}`,
      name: `${role.name} (복사본)`,
      category: 'custom',
      isCustom: true,
      isPinned: false
    };
    
    addRole(duplicatedRole);
    toast.success('Role이 복제되었습니다.');
  };

  const handleSelectRole = (roleId: string) => {
    const newSelected = selectedRoles.includes(roleId)
      ? selectedRoles.filter(id => id !== roleId)
      : [...selectedRoles, roleId];
    setSelectedRoles(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedRoles.length === 0) return;
    
    if (confirm(`선택한 ${selectedRoles.length}개의 Role을 삭제하시겠습니까?`)) {
      selectedRoles.forEach(roleId => deleteRole(roleId));
      setSelectedRoles([]);
      toast.success('선택한 Role들이 삭제되었습니다.');
    }
  };

  const handleBulkExport = () => {
    if (selectedRoles.length === 0) return;
    
    const rolesToExport = selectedRoles.map(roleId => 
      state.roles.find(r => r.id === roleId)
    ).filter(Boolean);
    
    const exportData = {
      roles: rolesToExport,
      exportedAt: new Date().toISOString(),
      exportedFrom: 'Role GPT Library'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `role_library_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success(`${selectedRoles.length}개의 Role이 내보내기 되었습니다.`);
  };

  const renderRoleCard = (role: Role) => {
    const IconComponent = getRoleIcon(role.id, role.category);
    const colorClass = getRoleColor(role.category);
    const isSelected = selectedRoles.includes(role.id);
    
    return (
      <Card 
        key={role.id} 
        className={`cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] group relative ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => handleRoleClick(role)}
      >
        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
          {/* 선택 체크박스 (Expert 모드에서만) */}
          {isExpert && (
            <div 
              className="absolute top-2 left-2 z-10"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectRole(role.id);
              }}
            >
              <input 
                type="checkbox" 
                checked={isSelected}
                onChange={() => {}}
                className="w-4 h-4"
              />
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {/* 즐겨찾기 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => handleToggleFavorite(role.id, e)}
            >
              <Star className={`h-3 w-3 ${role.isPinned ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            
            {/* 편집 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => handleEditRole(role, e)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            
            {/* 복제 */}
            {isAdvanced && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => handleDuplicateRole(role, e)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
            
            {/* 내보내기 */}
            {isAdvanced && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => handleExportRole(role, e)}
              >
                <Download className="h-3 w-3" />
              </Button>
            )}
            
            {/* 삭제 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={(e) => handleDeleteRole(role.id, e)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          {/* 아이콘 */}
          <div className={`w-6 h-6 ${colorClass} rounded-md flex items-center justify-center mb-2 flex-shrink-0`}>
            <IconComponent className="h-3 w-3 text-white" />
          </div>
          
          {/* Role 정보 */}
          <h3 className={`font-medium ${isMobile ? 'text-sm mb-1' : 'text-sm mb-1'}`}>{role.name}</h3>
          <p className={`text-muted-foreground line-clamp-2 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {role.description}
          </p>
          
          {/* 카테고리 배지 */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {role.category === 'custom' ? '커스텀' : 
               role.category === 'imported' ? '가져옴' : 
               role.category}
            </Badge>
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
            {role.isPinned && (
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
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
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-purple-500" />
              <h1 className={`font-medium ${isMobile ? 'text-lg' : 'text-xl'}`}>내 Role 라이브러리</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 가져오기 버튼 */}
            {isAdvanced && (
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "default"}
                onClick={handleImportRole}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isMobile ? "가져오기" : "Role 가져오기"}
              </Button>
            )}
          </div>
        </div>

        <div className={`${isMobile ? 'px-3 pb-3' : 'px-4 pb-4'}`}>
          {!isMobile && (
            <p className="text-center text-muted-foreground mb-6">
              나만의 전문가 Role을 만들고 관리하세요<br/>
              <span className="text-sm">Gallery에서 가져온 Role들도 여기서 커스터마이징할 수 있습니다</span>
            </p>
          )}
          
          {/* Search */}
          <div className={`relative ${isMobile ? 'mb-3' : 'mb-4'}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Role 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${isMobile ? 'h-9' : ''}`}
            />
          </div>
          
          {/* Category Filters */}
          <div className={`flex gap-2 flex-wrap ${isMobile ? 'justify-start' : 'justify-center'}`}>
            <Button 
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setSelectedCategory('all')}
            >
              전체 ({userRoles.length})
            </Button>
            <Button 
              variant={selectedCategory === 'custom' ? 'default' : 'outline'}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setSelectedCategory('custom')}
            >
              커스텀 ({userRoles.filter(r => r.isCustom || r.category === 'custom').length})
            </Button>
            <Button 
              variant={selectedCategory === 'imported' ? 'default' : 'outline'}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setSelectedCategory('imported')}
            >
              가져옴 ({userRoles.filter(r => r.category === 'imported').length})
            </Button>
            <Button 
              variant={selectedCategory === 'favorites' ? 'default' : 'outline'}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setSelectedCategory('favorites')}
            >
              즐겨찾기 ({userRoles.filter(r => r.isPinned).length})
            </Button>
          </div>
          
          {/* 새 Role 만들기 버튼 - 카테고리 필터 아래로 이동 */}
          <div className="flex justify-end mt-3">
            <Button 
              onClick={handleCreateRole} 
              size={isMobile ? "sm" : "default"}
              disabled={!canCreateRole}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isMobile ? "새 Role" : "새 Role 만들기"}
            </Button>
          </div>
          
          {/* 대량 작업 버튼들 (Expert 모드에서만) */}
          {isExpert && selectedRoles.length > 0 && (
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBulkExport}
              >
                <Download className="h-4 w-4 mr-2" />
                선택 내보내기 ({selectedRoles.length})
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                선택 삭제
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-6'}`}>
        <div className={`${isMobile ? '' : 'max-w-6xl mx-auto'}`}>
          {filteredRoles.length > 0 ? (
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
              {filteredRoles.map((role) => renderRoleCard(role))}
            </div>
          ) : (
            <div className="text-center py-12">
              {userRoles.length === 0 ? (
                <div className="space-y-4">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">Role 라이브러리가 비어있습니다</h3>
                    <p className="text-muted-foreground mt-2">
                      새로운 Role을 만들거나 Gallery에서 가져와보세요
                    </p>
                  </div>
                  <Button onClick={handleCreateRole}>
                    <Plus className="h-4 w-4 mr-2" />
                    첫 번째 Role 만들기
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground">검색 결과가 없습니다</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    전체 보기
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Role Editor Modal - 모드에 따라 다른 모달 사용 */}
      {isStandard ? (
        <StandardRoleEditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setRoleToEdit(null);
          }}
          roleToEdit={roleToEdit}
          onSave={() => {
            setEditModalOpen(false);
            setRoleToEdit(null);
          }}
        />
      ) : isAdvanced ? (
        <AdvancedRoleEditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setRoleToEdit(null);
          }}
          roleToEdit={roleToEdit}
          onSave={() => {
            setEditModalOpen(false);
            setRoleToEdit(null);
          }}
        />
      ) : (
        <AdvancedRoleEditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setRoleToEdit(null);
          }}
          roleToEdit={roleToEdit}
          expertMode={true}
          onSave={() => {
            setEditModalOpen(false);
            setRoleToEdit(null);
          }}
        />
      )}

      {/* Cross-Mode Guard Modal */}
      {crossModeGuard.guardConfig && (
        <CrossModeGuardModal
          isOpen={crossModeGuard.isOpen}
          onClose={crossModeGuard.closeGuard}
          config={crossModeGuard.guardConfig}
          onDecision={crossModeGuard.handleDecision}
        />
      )}
    </div>
  );
}