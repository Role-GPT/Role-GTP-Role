import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Plus, 
  Search, 
  Settings, 
  Copy, 
  Edit, 
  Trash2, 
  TestTube, 
  Eye, 
  Download, 
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { toast } from "sonner";
import { ApiTemplate, ApiCategory, UserPermissionLevel } from '../src/types/apiLibrary';
import { 
  getAllTemplates, 
  getTemplatesByCategory, 
  deleteCustomTemplate,
  testApiTemplate,
  getUserPermissionLevel,
  canPerformAction,
  exportApiLibrary,
  importApiLibrary
} from '../src/utils/apiLibraryManager';
import { ApiTemplateModal } from './ApiTemplateModal';

interface ApiKeyLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_TABS = [
  { value: 'all', label: '전체', icon: '📁' },
  { value: 'search', label: '검색 & 뉴스', icon: '🔍' },
  { value: 'academic', label: '학술 & 연구', icon: '📚' },
  { value: 'finance', label: '비즈니스 & 금융', icon: '💼' },
  { value: 'media', label: '미디어 & 차트', icon: '🎨' },
  { value: 'social', label: '소셜 & 개발자', icon: '👨‍💻' },
  { value: 'lifestyle', label: '날씨 & 라이프스타일', icon: '🌤️' },
  { value: 'llm', label: 'LLM 모델', icon: '🤖' }
];

export function ApiKeyLibrary({ isOpen, onClose }: ApiKeyLibraryProps) {
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ApiTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLevel, setUserLevel] = useState<UserPermissionLevel>('Standard');
  
  // 모달 상태
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ApiTemplate | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'clone' | 'view'>('view');
  
  // 테스트 상태
  const [testingTemplates, setTestingTemplates] = useState<Set<string>>(new Set());

  // 데이터 로드
  const loadTemplates = () => {
    const allTemplates = getAllTemplates();
    setTemplates(allTemplates);
    setFilteredTemplates(allTemplates);
  };

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setUserLevel(getUserPermissionLevel());
    }
  }, [isOpen]);

  // 필터링
  useEffect(() => {
    let filtered = templates;

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query)
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchQuery]);

  const handleCreateTemplate = () => {
    if (!canPerformAction('create')) {
      toast.error('템플릿 생성 권한이 없습니다. Expert 이상 레벨이 필요합니다.');
      return;
    }

    setSelectedTemplate(undefined);
    setModalMode('create');
    setTemplateModalOpen(true);
  };

  const handleViewTemplate = (template: ApiTemplate) => {
    setSelectedTemplate(template);
    setModalMode('view');
    setTemplateModalOpen(true);
  };

  const handleEditTemplate = (template: ApiTemplate) => {
    if (template.isBuiltIn) {
      toast.error('기본 제공 템플릿은 편집할 수 없습니다. 복제 후 편집해주세요.');
      return;
    }

    if (!canPerformAction('edit')) {
      toast.error('템플릿 편집 권한이 없습니다. Advanced 이상 레벨이 필요합니다.');
      return;
    }

    setSelectedTemplate(template);
    setModalMode('edit');
    setTemplateModalOpen(true);
  };

  const handleCloneTemplate = (template: ApiTemplate) => {
    if (!canPerformAction('clone')) {
      toast.error('템플릿 복제 권한이 없습니다. Advanced 이상 레벨이 필요합니다.');
      return;
    }

    setSelectedTemplate(template);
    setModalMode('clone');
    setTemplateModalOpen(true);
  };

  const handleDeleteTemplate = async (template: ApiTemplate) => {
    if (template.isBuiltIn) {
      toast.error('기본 제공 템플릿은 삭제할 수 없습니다.');
      return;
    }

    if (!canPerformAction('delete')) {
      toast.error('템플릿 삭제 권한이 없습니다. Admin 레벨이 필요합니다.');
      return;
    }

    if (!confirm(`"${template.name}" 템플릿을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    const success = deleteCustomTemplate(template.id);
    if (success) {
      toast.success('템플릿이 삭제되었습니다.');
      loadTemplates();
    } else {
      toast.error('템플릿 삭제에 실패했습니다.');
    }
  };

  const handleTestTemplate = async (template: ApiTemplate) => {
    setTestingTemplates(prev => new Set(prev).add(template.id));

    try {
      const result = await testApiTemplate(template, undefined, 'test');
      
      if (result.success) {
        toast.success(`${template.name} 테스트 성공! (${result.responseTime}ms)`);
      } else {
        toast.error(`${template.name} 테스트 실패: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      toast.error(`${template.name} 테스트 실패: ${errorMessage}`);
    } finally {
      setTestingTemplates(prev => {
        const newSet = new Set(prev);
        newSet.delete(template.id);
        return newSet;
      });
    }
  };

  const handleCopyTemplate = (template: ApiTemplate) => {
    const templateData = {
      name: template.name,
      baseUrl: template.baseUrl,
      path: template.path,
      method: template.method,
      auth: template.auth,
      params: template.params,
      headers: template.headers,
      body: template.body
    };

    navigator.clipboard.writeText(JSON.stringify(templateData, null, 2));
    toast.success('템플릿 설정이 클립보드에 복사되었습니다.');
  };

  const handleExport = () => {
    try {
      const exportData = exportApiLibrary();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `api_library_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('API 라이브러리가 내보내기 되었습니다.');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('내보내기에 실패했습니다.');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = e.target?.result as string;
        const success = importApiLibrary(importData);
        
        if (success) {
          loadTemplates();
          toast.success('API 라이브러리가 가져와졌습니다.');
        } else {
          toast.error('가져오기에 실패했습니다.');
        }
      } catch (error) {
        console.error('Import failed:', error);
        toast.error('잘못된 파일 형식입니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleTemplateSave = (template: ApiTemplate) => {
    loadTemplates();
    setTemplateModalOpen(false);
  };

  const getStatusBadge = (template: ApiTemplate) => {
    if (template.isBuiltIn) {
      return <Badge variant="secondary" className="text-xs">기본 제공</Badge>;
    }
    if (template.keyless) {
      return <Badge variant="default" className="text-xs bg-green-500">키리스</Badge>;
    }
    if (template.freeTier) {
      return <Badge variant="outline" className="text-xs">체험 가능</Badge>;
    }
    return <Badge variant="outline" className="text-xs">BYOK</Badge>;
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: 'bg-blue-500',
      POST: 'bg-green-500', 
      PUT: 'bg-yellow-500',
      PATCH: 'bg-orange-500',
      DELETE: 'bg-red-500'
    };
    
    return (
      <Badge className={`text-xs text-white ${colors[method as keyof typeof colors] || 'bg-gray-500'}`}>
        {method}
      </Badge>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative w-full max-w-7xl h-[90vh] bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold">API 키 라이브러리</h1>
                <p className="text-sm text-muted-foreground">
                  커스텀 API 템플릿 관리 및 설정 ({userLevel} 레벨)
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                내보내기
              </Button>
              
              <div className="relative">
                <Input 
                  type="file" 
                  accept=".json"
                  onChange={handleImport}
                  className="sr-only" 
                  id="import-library"
                />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('import-library')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  가져오기
                </Button>
              </div>
              
              {canPerformAction('create') && (
                <Button onClick={handleCreateTemplate}>
                  <Plus className="w-4 h-4 mr-2" />
                  새 템플릿
                </Button>
              )}
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="flex items-center gap-4 p-6 border-b border-border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="템플릿 검색..."
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">총 {filteredTemplates.length}개</span>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full flex flex-col">
              
              {/* 카테고리 탭 */}
              <div className="px-6 py-3 border-b border-border">
                <TabsList className="grid grid-cols-8 gap-1 h-auto">
                  {CATEGORY_TABS.map(tab => (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value} 
                      className="flex flex-col items-center gap-1 p-3 text-xs"
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* 템플릿 목록 */}
              <div className="flex-1 overflow-y-auto p-6">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">템플릿이 없습니다</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? '검색 조건에 맞는 템플릿이 없습니다' : '이 카테고리에 템플릿이 없습니다'}
                    </p>
                    {canPerformAction('create') && selectedCategory !== 'all' && (
                      <Button onClick={handleCreateTemplate}>
                        <Plus className="w-4 h-4 mr-2" />
                        첫 번째 템플릿 만들기
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map(template => (
                      <Card key={template.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{template.icon}</span>
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-base truncate">{template.name}</CardTitle>
                                <CardDescription className="text-xs">
                                  {CATEGORY_TABS.find(c => c.value === template.category)?.label}
                                </CardDescription>
                              </div>
                            </div>
                            {getStatusBadge(template)}
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="space-y-3">
                            {/* URL 정보 */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {getMethodBadge(template.method)}
                                <span className="text-xs text-muted-foreground truncate">
                                  {template.baseUrl}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {template.path}
                              </p>
                            </div>

                            {/* 설명 */}
                            {template.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {template.description}
                              </p>
                            )}

                            {/* 인증 정보 */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {template.auth.type === 'None' ? '인증 없음' : `${template.auth.type} 인증`}
                              </span>
                              <span className="text-muted-foreground">
                                {template.timeoutMs / 1000}s / {template.maxRespKB}KB
                              </span>
                            </div>

                            {/* 액션 버튼들 */}
                            <div className="flex items-center gap-1 pt-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewTemplate(template)}
                                className="h-7 px-2"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              
                              {(template.keyless || template.freeTier) && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleTestTemplate(template)}
                                  disabled={testingTemplates.has(template.id)}
                                  className="h-7 px-2"
                                >
                                  {testingTemplates.has(template.id) ? (
                                    <Clock className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <TestTube className="w-3 h-3" />
                                  )}
                                </Button>
                              )}
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleCopyTemplate(template)}
                                className="h-7 px-2"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              
                              {canPerformAction('clone') && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleCloneTemplate(template)}
                                  className="h-7 px-2"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              )}
                              
                              {!template.isBuiltIn && canPerformAction('edit') && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditTemplate(template)}
                                  className="h-7 px-2"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              )}
                              
                              {!template.isBuiltIn && canPerformAction('delete') && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteTemplate(template)}
                                  className="h-7 px-2 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* API 템플릿 편집 모달 */}
      <ApiTemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        template={selectedTemplate}
        mode={modalMode}
        onSave={handleTemplateSave}
      />
    </>
  );
}
