import React from 'react';
import { Heart, Lightbulb, Target, GraduationCap, Briefcase, Dumbbell, ChefHat, Coffee, Palette, Camera, Scissors, FileText, Calculator, Zap, BookOpen, Stethoscope, Brain, TrendingUp, Code, Gavel, Building2, Wrench, FlaskConical } from 'lucide-react';
import { useApp } from '../src/context/AppContext';

// 역할 아이콘 매핑 (Expert 모드 카테고리 포함)
const getRoleIcon = (roleId: string, category: string) => {
  const iconMap: { [key: string]: any } = {
    // 비즈니스
    'marketing_strategist': Briefcase,
    'business_analyst': Calculator,
    'sales_expert': Target,
    'hr_specialist': Briefcase,
    
    // 디자인/창의성
    'ux_designer': Camera,
    'creative_director': Lightbulb,
    'graphic_designer': Palette,
    'writer': FileText,
    'musician': Camera,
    'photographer': Camera,
    'video_editor': Scissors,
    
    // 개발
    'dev_mentor': FileText,
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
    
    // Expert 모드 전문 카테고리 아이콘
    'senior_doctor': Stethoscope,
    'specialist_surgeon': Stethoscope,
    'clinical_researcher': FlaskConical,
    'corporate_lawyer': Gavel,
    'patent_attorney': Gavel,
    'contract_specialist': Gavel,
    'investment_banker': TrendingUp,
    'financial_analyst': Calculator,
    'quantitative_researcher': Calculator,
    'senior_developer': Code,
    'ai_engineer': Brain,
    'systems_architect': Wrench,
    'senior_designer': Palette,
    'brand_strategist': Building2,
    'design_director': Lightbulb,
    'management_consultant': Building2,
    'strategy_consultant': Target,
    'operations_consultant': Wrench,
    'mechanical_engineer': Wrench,
    'software_engineer': Code,
    'data_engineer': Calculator,
    'research_scientist': FlaskConical,
    'academic_researcher': BookOpen,
    'lab_researcher': FlaskConical,
    'data_scientist': Calculator,
    'business_analyst_expert': TrendingUp,
    'market_researcher': Target,
    'clinical_psychologist': Brain,
    'cognitive_scientist': Brain,
    'behavioral_analyst': Brain,
    
    // 기타
    'content_creator': Camera
  };
  
  return iconMap[roleId] || Briefcase;
};

interface RoleCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  onRoleSelect: (roleData: any) => void;
  buttonPosition?: { x: number; y: number }; // 클릭한 버튼의 위치
}

export function RoleCategoryModal({ isOpen, onClose, category, onRoleSelect, buttonPosition }: RoleCategoryModalProps) {
  const { state } = useApp();
  
  if (!isOpen || !category) return null;

  // 실제 state.roles에서 카테고리별 Role들을 가져옵니다
  // 디버깅을 위해 로그 추가
  console.log('🔍 카테고리별 Role 필터링:', {
    category,
    totalRoles: state.roles.length,
    allCategories: [...new Set(state.roles.map(r => r.category))],
    filteredRoles: state.roles.filter(role => role.category === category).length
  });
  
  const categoryRoles = state.roles.filter(role => role.category === category);
  
  // 만약 해당 카테고리에 Role이 없다면, 유사한 카테고리를 찾아 매핑
  if (categoryRoles.length === 0) {
    let fallbackRoles: typeof state.roles = [];
    
    if (category === 'recommended') {
      fallbackRoles = state.roles.filter(role => 
        role.category === 'recommended' || role.category === 'popular'
      );
    } else if (category === 'lifestyle') {
      fallbackRoles = state.roles.filter(role => role.category === 'lifestyle');
    } else if (category === 'creativity') {
      fallbackRoles = state.roles.filter(role => role.category === 'creativity');
    } else if (category === 'productivity') {
      fallbackRoles = state.roles.filter(role => role.category === 'productivity');
    } else if (category === 'education') {
      fallbackRoles = state.roles.filter(role => role.category === 'education');
    }
    
    if (fallbackRoles.length > 0) {
      return renderModal(fallbackRoles);
    }
  }
  
  return renderModal(categoryRoles);
  
  function renderModal(roles: typeof state.roles) {
    // Fun 카테고리와 Playground 카테고리인 경우 랜덤으로 5개만 선택
    let displayRoles = roles;
    if (category === 'fun' || category === 'playground') {
      const shuffled = [...roles].sort(() => Math.random() - 0.5);
      displayRoles = shuffled.slice(0, Math.min(5, shuffled.length));
    }

    const handleRoleClick = (role: any) => {
      onRoleSelect(role);
      onClose();
    };

    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={onClose} 
        />
        
        {/* Compact Dropdown - 버튼 위치에 표시 */}
        <div 
          className="fixed z-50"
          style={{
            left: buttonPosition ? `${buttonPosition.x}px` : '50%',
            top: buttonPosition ? `${buttonPosition.y - 20}px` : '50%',
            transform: buttonPosition ? 'translateX(-50%) translateY(-100%)' : 'translate(-50%, -50%)'
          }}
        >
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl p-2 min-w-[280px] max-w-[320px]">
            {roles.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p className="text-sm">이 카테고리에 등록된 역할이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {displayRoles.map((role) => {
                  const RoleIcon = getRoleIcon(role.id, role.category);
                  const showIcon = category !== 'fun'; // Fun 카테고리에서는 아이콘 숨김
                  
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleClick(role)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-200 text-left group"
                    >
                      {showIcon && (
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/40 group-hover:bg-muted/60 transition-colors">
                          <RoleIcon className="w-4 h-4 text-foreground/80" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground block">
                          {role.name}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {role.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
}