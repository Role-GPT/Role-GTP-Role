import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Key, 
  TestTube, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Plus,
  Clock,
  ExternalLink,
  X
} from 'lucide-react';
import { toast } from "sonner";
import { ApiTemplate, UserApiKey, ApiCategory } from '../src/types/apiLibrary';
import { 
  getAllTemplates, 
  getTemplatesByCategory,
  getUserApiKeys, 
  saveUserApiKey, 
  deleteUserApiKey,
  testApiTemplate
} from '../src/utils/apiLibraryManager';

interface PersonalApiKeysProps {
  selectedCategory?: ApiCategory;
}

const CATEGORY_TABS = [
  { value: 'search', label: '검색 & 뉴스', icon: '🔍' },
  { value: 'academic', label: '학술 & 연구', icon: '📚' },
  { value: 'finance', label: '비즈니스 & 금융', icon: '💼' },
  { value: 'media', label: '이미지 & 미디어', icon: '🎨' },
  { value: 'social', label: '소셜 & 개발자', icon: '👨‍💻' },
  { value: 'lifestyle', label: '날씨 & 라이프스타일', icon: '🌤️' },
  { value: 'llm', label: 'LLM 모델', icon: '🤖' }
];

export function PersonalApiKeys({ selectedCategory = 'search' }: PersonalApiKeysProps) {
  const [activeCategory, setActiveCategory] = useState<ApiCategory>(selectedCategory);
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [userKeys, setUserKeys] = useState<Record<string, UserApiKey>>({});
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [testingKeys, setTestingKeys] = useState<Set<string>>(new Set());
  const [newKeys, setNewKeys] = useState<Record<string, Partial<UserApiKey>>>({});

  // 데이터 로드
  const loadData = () => {
    const allTemplates = getAllTemplates();
    setTemplates(allTemplates);
    
    const keys = getUserApiKeys();
    setUserKeys(keys);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setActiveCategory(selectedCategory);
  }, [selectedCategory]);

  // 현재 카테고리의 템플릿들 필터링
  const currentTemplates = templates.filter(template => 
    template.category === activeCategory && !template.keyless
  );

  // API 키 저장
  const handleSaveKey = async (templateId: string) => {
    const newKey = newKeys[templateId];
    if (!newKey?.apiKey?.trim()) {
      toast.error('API 키를 입력해주세요.');
      return;
    }

    const userKey: UserApiKey = {
      templateId,
      apiKey: newKey.apiKey.trim(),
      clientId: newKey.clientId?.trim(),
      clientSecret: newKey.clientSecret?.trim(),
      isActive: true
    };

    const success = saveUserApiKey(templateId, userKey);
    if (success) {
      setUserKeys(prev => ({ ...prev, [templateId]: userKey }));
      setNewKeys(prev => ({ ...prev, [templateId]: {} }));
      toast.success('API 키가 저장되었습니다.');
    } else {
      toast.error('API 키 저장에 실패했습니다.');
    }
  };

  // API 키 삭제
  const handleDeleteKey = (templateId: string) => {
    if (!confirm('이 API 키를 삭제하시겠습니까?')) return;

    const success = deleteUserApiKey(templateId);
    if (success) {
      setUserKeys(prev => {
        const newKeys = { ...prev };
        delete newKeys[templateId];
        return newKeys;
      });
      toast.success('API 키가 삭제되었습니다.');
    } else {
      toast.error('API 키 삭제에 실패했습니다.');
    }
  };

  // API 키 테스트
  const handleTestKey = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    const userKey = userKeys[templateId];
    
    if (!template || !userKey) return;

    setTestingKeys(prev => new Set(prev).add(templateId));

    try {
      const result = await testApiTemplate(template, userKey, 'test');
      
      if (result.success) {
        // 테스트 결과 저장
        const updatedKey = {
          ...userKey,
          lastTested: new Date(),
          testResult: result
        };
        saveUserApiKey(templateId, updatedKey);
        setUserKeys(prev => ({ ...prev, [templateId]: updatedKey }));
        
        toast.success(`${template.name} 테스트 성공! (${result.responseTime}ms)`);
      } else {
        toast.error(`${template.name} 테스트 실패: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      toast.error(`${template.name} 테스트 실패: ${errorMessage}`);
    } finally {
      setTestingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });
    }
  };

  // API 키 표시/숨김 토글
  const toggleKeyVisibility = (templateId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };

  // 새 키 입력 업데이트
  const updateNewKey = (templateId: string, field: keyof UserApiKey, value: string) => {
    setNewKeys(prev => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        [field]: value
      }
    }));
  };

  // API 키 활성/비활성 토글
  const toggleKeyActive = (templateId: string) => {
    const userKey = userKeys[templateId];
    if (!userKey) return;

    const updatedKey = { ...userKey, isActive: !userKey.isActive };
    const success = saveUserApiKey(templateId, updatedKey);
    
    if (success) {
      setUserKeys(prev => ({ ...prev, [templateId]: updatedKey }));
      toast.success(`API 키가 ${updatedKey.isActive ? '활성화' : '비활성화'}되었습니다.`);
    }
  };

  const getTestStatusBadge = (userKey: UserApiKey) => {
    if (!userKey.testResult) {
      return <Badge variant="outline" className="text-xs">미테스트</Badge>;
    }
    
    if (userKey.testResult.success) {
      return <Badge className="text-xs bg-green-500">테스트 통과</Badge>;
    } else {
      return <Badge variant="destructive" className="text-xs">테스트 실패</Badge>;
    }
  };

  const renderApiKeyForm = (template: ApiTemplate) => {
    const userKey = userKeys[template.id];
    const newKey = newKeys[template.id] || {};
    const hasKey = !!userKey;
    const isVisible = visibleKeys.has(template.id);
    const isTesting = testingKeys.has(template.id);

    // 템플릿이 요구하는 인증 필드들 확인
    const requiresClientSecret = template.auth.type === 'Header' && 
      template.headers && 
      Object.values(template.headers).some(header => header.includes('{{CLIENT_SECRET}}'));

    return (
      <Card key={template.id} className={`transition-all ${hasKey ? 'border-green-200 bg-green-50/30' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{template.icon}</span>
              <div>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {template.auth.type} 인증
                  </Badge>
                  {hasKey && getTestStatusBadge(userKey)}
                  {hasKey && (
                    <Switch
                      checked={userKey.isActive}
                      onCheckedChange={() => toggleKeyActive(template.id)}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            </div>
            
            {template.documentation && (
              <Button variant="ghost" size="sm" asChild>
                <a href={template.documentation} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {hasKey ? (
            // 기존 키 표시
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">API 키</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={isVisible ? userKey.apiKey : '••••••••••••••••'}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleKeyVisibility(template.id)}
                  >
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* 개별 키 활성/비활성 토글 */}
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">이 API 키 사용</Label>
                  <p className="text-xs text-muted-foreground">
                    이 키를 대화에서 사용하도록 설정
                  </p>
                </div>
                <Switch
                  checked={userKey.isActive}
                  onCheckedChange={() => toggleKeyActive(template.id)}
                  size="sm"
                />
              </div>

              {userKey.clientId && (
                <div className="space-y-2">
                  <Label className="text-sm">Client ID</Label>
                  <Input
                    value={userKey.clientId}
                    readOnly
                    className="font-mono text-sm"
                  />
                </div>
              )}

              {userKey.lastTested && (
                <div className="text-xs text-muted-foreground">
                  마지막 테스트: {new Date(userKey.lastTested).toLocaleString()}
                  {userKey.testResult?.responseTime && ` (${userKey.testResult.responseTime}ms)`}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleTestKey(template.id)}
                  disabled={isTesting || !userKey.isActive}
                >
                  {isTesting ? (
                    <>
                      <Clock className="w-3 h-3 mr-1 animate-spin" />
                      테스트 중...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-3 h-3 mr-1" />
                      테스트
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteKey(template.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  삭제
                </Button>
              </div>
            </div>
          ) : (
            // 새 키 입력 폼
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">API 키 *</Label>
                <Input
                  type="password"
                  value={newKey.apiKey || ''}
                  onChange={(e) => updateNewKey(template.id, 'apiKey', e.target.value)}
                  placeholder="API 키를 입력하세요"
                />
              </div>

              {/* Client ID 필드 (OAuth 등에서 필요) */}
              {template.auth.type === 'Header' && template.auth.keyName?.toLowerCase().includes('client') && (
                <div className="space-y-2">
                  <Label className="text-sm">Client ID</Label>
                  <Input
                    value={newKey.clientId || ''}
                    onChange={(e) => updateNewKey(template.id, 'clientId', e.target.value)}
                    placeholder="Client ID를 입력하세요"
                  />
                </div>
              )}

              {/* Client Secret 필드 (필요한 경우) */}
              {requiresClientSecret && (
                <div className="space-y-2">
                  <Label className="text-sm">Client Secret</Label>
                  <Input
                    type="password"
                    value={newKey.clientSecret || ''}
                    onChange={(e) => updateNewKey(template.id, 'clientSecret', e.target.value)}
                    placeholder="Client Secret을 입력하세요"
                  />
                </div>
              )}

              {template.description && (
                <p className="text-xs text-muted-foreground">
                  {template.description}
                </p>
              )}

              <Button 
                onClick={() => handleSaveKey(template.id)}
                size="sm"
                disabled={!newKey.apiKey?.trim()}
                className="w-full"
              >
                <Key className="w-3 h-3 mr-1" />
                API 키 저장
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Key className="w-5 h-5" />
            내 키 보관함
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            개인 API 키를 안전하게 저장하고 관리하세요
          </p>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {Object.keys(userKeys).length}개 저장됨
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as ApiCategory)}>
        <TabsList className="grid grid-cols-7 gap-1">
          {CATEGORY_TABS.map(tab => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              className="flex flex-col items-center gap-1 p-2 text-xs"
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORY_TABS.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4 mt-4">
            {currentTemplates.filter(t => t.category === tab.value).length === 0 ? (
              <CustomApiCreator 
                category={tab.value}
                categoryLabel={tab.label}
                onApiCreated={(newTemplate) => {
                  // 로컬 스토리지에 저장
                  try {
                    const existingTemplates = JSON.parse(localStorage.getItem('api-library-templates') || '[]');
                    const allTemplates = [...existingTemplates, newTemplate];
                    localStorage.setItem('api-library-templates', JSON.stringify(allTemplates));
                    
                    // 데이터 다시 로드하여 UI 업데이트
                    loadData();
                  } catch (error) {
                    console.error('Failed to save template to localStorage:', error);
                    toast.error('템플릿 저장 중 오류가 발생했습니다.');
                  }
                }}
              />
            ) : (
              <div className="grid gap-4">
                {currentTemplates
                  .filter(template => template.category === tab.value)
                  .map(template => renderApiKeyForm(template))
                }
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* 안내 메시지 */}
      <div className="bg-muted/50 border border-muted-foreground/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-medium">보안 안내</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• API 키는 브라우저의 안전한 저장소에 암호화되어 저장됩니다</li>
              <li>• 저장된 키는 해당 브라우저에서만 사용 가능합니다</li>
              <li>• 정기적으로 키를 테스트하여 유효성을 확인하세요</li>
              <li>• 사용하지 않는 키는 비활성화하거나 삭제하는 것을 권장합니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// 커스텀 API 생성기 컴포넌트
interface CustomApiCreatorProps {
  category: string;
  categoryLabel: string;
  onApiCreated: (template: any) => void;
}

function CustomApiCreator({ category, categoryLabel, onApiCreated }: CustomApiCreatorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    baseUrl: '',
    method: 'GET',
    headers: '{}',
    responseFormat: 'json',
    extractPath: '$.data'
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.baseUrl) {
      toast.error('API 이름과 Base URL은 필수입니다.');
      return;
    }

    try {
      // 헤더 JSON 유효성 검사
      JSON.parse(newTemplate.headers);
    } catch (error) {
      toast.error('헤더 형식이 올바르지 않습니다. JSON 형식으로 입력해주세요.');
      return;
    }

    const template = {
      id: `custom_${category}_${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      category: category,
      icon: getCategoryIcon(category),
      isCustom: true,
      auth: {
        type: 'Header',
        keyName: 'Authorization',
        keyFormat: 'Bearer {{API_KEY}}'
      },
      endpoint: newTemplate.baseUrl,
      method: newTemplate.method,
      headers: JSON.parse(newTemplate.headers),
      responseFormat: newTemplate.responseFormat,
      extractPath: newTemplate.extractPath,
      createdAt: new Date().toISOString()
    };

    onApiCreated(template);
    toast.success(`${newTemplate.name} API 템플릿이 생성되었습니다!`);
    setIsCreating(false);
    setNewTemplate({
      name: '',
      description: '',
      baseUrl: '',
      method: 'GET',
      headers: '{}',
      responseFormat: 'json',
      extractPath: '$.data'
    });
  };

  const getCategoryIcon = (cat: string) => {
    const iconMap: Record<string, string> = {
      search: '🔍',
      academic: '📚',
      finance: '💼',
      media: '🎨',
      social: '👨‍💻',
      lifestyle: '🌤️',
      llm: '🤖'
    };
    return iconMap[cat] || '🔧';
  };

  if (!isCreating) {
    return (
      <div className="text-center py-8">
        <Key className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-50" />
        <h4 className="font-medium mb-2">{categoryLabel} 카테고리에 API 추가</h4>
        <p className="text-sm text-muted-foreground mb-4">
          이 카테고리에는 아직 템플릿이 없습니다.<br/>
          아래에서 바로 새로운 API를 추가해보세요!
        </p>
        <Button 
          onClick={() => setIsCreating(true)}
          className="mb-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          새 API 템플릿 만들기
        </Button>
        <div className="text-xs text-muted-foreground">
          또는 <strong>API 키 라이브러리</strong>에서 더 자세한 설정이 가능합니다
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium">{categoryLabel} API 추가</h3>
          <p className="text-sm text-muted-foreground">
            새로운 API 템플릿을 만들어 개인 키 보관함에서 사용하세요
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCreating(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* API 이름 */}
        <div>
          <Label htmlFor="apiName">API 이름 *</Label>
          <Input
            id="apiName"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
            placeholder="예: Alpha Vantage Stock API"
          />
        </div>

        {/* API 설명 */}
        <div>
          <Label htmlFor="apiDescription">설명</Label>
          <Input
            id="apiDescription"
            value={newTemplate.description}
            onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
            placeholder="예: 실시간 주식 가격 정보 제공"
          />
        </div>

        {/* Base URL */}
        <div>
          <Label htmlFor="baseUrl">Base URL *</Label>
          <Input
            id="baseUrl"
            value={newTemplate.baseUrl}
            onChange={(e) => setNewTemplate(prev => ({ ...prev, baseUrl: e.target.value }))}
            placeholder="예: https://www.alphavantage.co/query"
          />
        </div>

        {/* HTTP 메서드 */}
        <div>
          <Label htmlFor="method">HTTP 메서드</Label>
          <Select
            value={newTemplate.method}
            onValueChange={(value) => setNewTemplate(prev => ({ ...prev, method: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 헤더 */}
        <div>
          <Label htmlFor="headers">헤더 (JSON 형식)</Label>
          <textarea
            id="headers"
            value={newTemplate.headers}
            onChange={(e) => setNewTemplate(prev => ({ ...prev, headers: e.target.value }))}
            placeholder='{"Content-Type": "application/json", "Authorization": "Bearer {{API_KEY}}"}'
            className="w-full h-20 px-3 py-2 text-sm border border-border rounded-md bg-input-background resize-none font-mono"
          />
        </div>

        {/* 응답에서 데이터 추출 경로 */}
        <div>
          <Label htmlFor="extractPath">데이터 추출 경로 (JSONPath)</Label>
          <Input
            id="extractPath"
            value={newTemplate.extractPath}
            onChange={(e) => setNewTemplate(prev => ({ ...prev, extractPath: e.target.value }))}
            placeholder="예: $.data, $.results[0], $.response.price"
          />
          <p className="text-xs text-muted-foreground mt-1">
            API 응답에서 실제 데이터를 추출할 JSONPath를 입력하세요
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setIsCreating(false)}
          >
            취소
          </Button>
          <Button
            onClick={handleCreateTemplate}
          >
            <Plus className="w-4 h-4 mr-2" />
            템플릿 생성
          </Button>
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 빠른 시작 팁</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>API 키 위치:</strong> 헤더에 {`{{API_KEY}}`} 자리표시자를 사용하세요</li>
              <li>• <strong>JSONPath:</strong> $.data, $.results[0].price 같은 형식으로 입력</li>
              <li>• <strong>테스트:</strong> 생성 후 실제 API 키를 입력해서 테스트 가능</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
