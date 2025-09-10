import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { X, Plus, Trash2, TestTube, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from "sonner@2.0.3";
import { ApiTemplate, ApiTemplateFormData, AuthType, HttpMethod, ApiCategory } from '../src/types/apiLibrary';
import { testApiTemplate, saveCustomTemplate } from '../src/utils/apiLibraryManager';

interface ApiTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: ApiTemplate;
  mode: 'create' | 'edit' | 'clone' | 'view';
  onSave: (template: ApiTemplate) => void;
}

const CATEGORY_OPTIONS: { value: ApiCategory; label: string; icon: string }[] = [
  { value: 'search', label: '검색 & 뉴스', icon: '🔍' },
  { value: 'academic', label: '학술 & 연구', icon: '📚' },
  { value: 'finance', label: '비즈니스 & 금융', icon: '💼' },
  { value: 'media', label: '이미지 & 미디어', icon: '🎨' },
  { value: 'social', label: '소셜 & 개발자', icon: '👨‍💻' },
  { value: 'lifestyle', label: '날씨 & 라이프스타일', icon: '🌤️' },
  { value: 'llm', label: 'LLM 모델', icon: '🤖' }
];

const METHOD_OPTIONS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const AUTH_OPTIONS: { value: AuthType; label: string }[] = [
  { value: 'None', label: '인증 없음' },
  { value: 'Header', label: 'Header 인증' },
  { value: 'Query', label: 'Query 파라미터' },
  { value: 'OAuth', label: 'OAuth (곧 지원)' }
];

export function ApiTemplateModal({ 
  isOpen, 
  onClose, 
  template, 
  mode, 
  onSave 
}: ApiTemplateModalProps) {
  const [formData, setFormData] = useState<ApiTemplateFormData>({
    name: '',
    category: 'search',
    icon: '🔧',
    baseUrl: '',
    path: '',
    method: 'GET',
    authType: 'None',
    authKeyName: '',
    authPrefix: '',
    params: [],
    headers: [],
    body: '',
    primaryTextPath: '',
    primaryImagePath: '',
    timeoutMs: 8000,
    maxRespKB: 256,
    freeTier: false,
    keyless: false,
    description: '',
    documentation: ''
  });

  const [isTestingInProgress, setIsTestingInProgress] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string; responseTime?: number } | null>(null);
  const [testInput, setTestInput] = useState('test');

  const isReadOnly = mode === 'view';
  const isCreate = mode === 'create';

  // 템플릿 데이터로 폼 초기화
  useEffect(() => {
    if (template && isOpen) {
      const categoryOption = CATEGORY_OPTIONS.find(opt => opt.value === template.category);
      
      setFormData({
        name: mode === 'clone' ? `${template.name} (복사본)` : template.name,
        category: template.category,
        icon: categoryOption?.icon || template.icon,
        baseUrl: template.baseUrl,
        path: template.path,
        method: template.method,
        authType: template.auth.type,
        authKeyName: template.auth.keyName || '',
        authPrefix: template.auth.prefix || '',
        params: Object.entries(template.params || {}).map(([key, value]) => ({ key, value })),
        headers: Object.entries(template.headers || {}).map(([key, value]) => ({ key, value })),
        body: template.body || '',
        primaryTextPath: template.responseMap?.primaryText || '',
        primaryImagePath: template.responseMap?.primaryImage || '',
        timeoutMs: template.timeoutMs,
        maxRespKB: template.maxRespKB,
        freeTier: template.freeTier,
        keyless: template.keyless,
        description: template.description || '',
        documentation: template.documentation || ''
      });
    } else if (isCreate && isOpen) {
      // 새 템플릿 생성 시 기본값으로 리셋
      setFormData({
        name: '',
        category: 'search',
        icon: '🔧',
        baseUrl: '',
        path: '',
        method: 'GET',
        authType: 'None',
        authKeyName: '',
        authPrefix: '',
        params: [],
        headers: [],
        body: '',
        primaryTextPath: '',
        primaryImagePath: '',
        timeoutMs: 8000,
        maxRespKB: 256,
        freeTier: false,
        keyless: false,
        description: '',
        documentation: ''
      });
    }
  }, [template, mode, isOpen]);

  // 카테고리 변경 시 아이콘 자동 업데이트
  useEffect(() => {
    const categoryOption = CATEGORY_OPTIONS.find(opt => opt.value === formData.category);
    if (categoryOption) {
      setFormData(prev => ({ ...prev, icon: categoryOption.icon }));
    }
  }, [formData.category]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('템플릿 이름을 입력해주세요.');
      return;
    }

    if (!formData.baseUrl.trim()) {
      toast.error('Base URL을 입력해주세요.');
      return;
    }

    // 필수 테스트 통과 체크
    if (!testResult?.success && !isReadOnly) {
      toast.error('템플릿 테스트가 성공해야 저장할 수 있습니다.');
      return;
    }

    try {
      const newTemplate: ApiTemplate = {
        id: mode === 'create' || mode === 'clone' ? `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : template!.id,
        name: formData.name,
        category: formData.category,
        icon: formData.icon,
        baseUrl: formData.baseUrl,
        path: formData.path,
        method: formData.method,
        auth: {
          type: formData.authType,
          keyName: formData.authKeyName || undefined,
          prefix: formData.authPrefix || undefined
        },
        params: formData.params.reduce((acc, { key, value }) => {
          if (key.trim()) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
        headers: formData.headers.reduce((acc, { key, value }) => {
          if (key.trim()) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
        body: formData.body || undefined,
        responseMap: {
          primaryText: formData.primaryTextPath || undefined,
          primaryImage: formData.primaryImagePath || undefined
        },
        timeoutMs: formData.timeoutMs,
        maxRespKB: formData.maxRespKB,
        freeTier: formData.freeTier,
        keyless: formData.keyless,
        enabled: true,
        isBuiltIn: false,
        description: formData.description || undefined,
        documentation: formData.documentation || undefined,
        createdAt: template?.createdAt || new Date(),
        updatedAt: new Date()
      };

      const success = saveCustomTemplate(newTemplate);
      if (success) {
        onSave(newTemplate);
        toast.success(`템플릿이 ${mode === 'create' ? '생성' : '저장'}되었습니다.`);
        onClose();
      } else {
        toast.error('템플릿 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('템플릿 저장 중 오류가 발생했습니다.');
    }
  };

  const handleTest = async () => {
    if (!formData.baseUrl.trim() || !formData.path.trim()) {
      toast.error('Base URL과 Path를 먼저 입력해주세요.');
      return;
    }

    setIsTestingInProgress(true);
    setTestResult(null);

    try {
      // 임시 템플릿 객체 생성
      const tempTemplate: ApiTemplate = {
        id: 'temp_test',
        name: formData.name || 'Test Template',
        category: formData.category,
        icon: formData.icon,
        baseUrl: formData.baseUrl,
        path: formData.path,
        method: formData.method,
        auth: {
          type: formData.authType,
          keyName: formData.authKeyName || undefined,
          prefix: formData.authPrefix || undefined
        },
        params: formData.params.reduce((acc, { key, value }) => {
          if (key.trim()) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
        headers: formData.headers.reduce((acc, { key, value }) => {
          if (key.trim()) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
        body: formData.body || undefined,
        responseMap: {
          primaryText: formData.primaryTextPath || undefined,
          primaryImage: formData.primaryImagePath || undefined
        },
        timeoutMs: formData.timeoutMs,
        maxRespKB: formData.maxRespKB,
        freeTier: formData.freeTier,
        keyless: formData.keyless,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await testApiTemplate(tempTemplate, undefined, testInput);
      setTestResult(result);

      if (result.success) {
        toast.success(`테스트 성공! (응답시간: ${result.responseTime}ms)`);
      } else {
        toast.error(`테스트 실패: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      setTestResult({ success: false, error: errorMessage });
      toast.error(`테스트 실패: ${errorMessage}`);
    } finally {
      setIsTestingInProgress(false);
    }
  };

  const addParam = () => {
    setFormData(prev => ({
      ...prev,
      params: [...prev.params, { key: '', value: '' }]
    }));
  };

  const removeParam = (index: number) => {
    setFormData(prev => ({
      ...prev,
      params: prev.params.filter((_, i) => i !== index)
    }));
  };

  const updateParam = (index: number, field: 'key' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      params: prev.params.map((param, i) => 
        i === index ? { ...param, [field]: value } : param
      )
    }));
  };

  const addHeader = () => {
    setFormData(prev => ({
      ...prev,
      headers: [...prev.headers, { key: '', value: '' }]
    }));
  };

  const removeHeader = (index: number) => {
    setFormData(prev => ({
      ...prev,
      headers: prev.headers.filter((_, i) => i !== index)
    }));
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      headers: prev.headers.map((header, i) => 
        i === index ? { ...header, [field]: value } : header
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-4xl h-[90vh] bg-background border border-border rounded-lg shadow-lg overflow-hidden">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{formData.icon}</span>
            <div>
              <h2 className="text-lg font-semibold">
                {mode === 'create' && 'API 템플릿 생성'}
                {mode === 'edit' && 'API 템플릿 편집'}
                {mode === 'clone' && 'API 템플릿 복제'}
                {mode === 'view' && 'API 템플릿 보기'}
              </h2>
              {formData.name && (
                <p className="text-sm text-muted-foreground">{formData.name}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 테스트 결과 표시 */}
            {testResult && (
              <Badge variant={testResult.success ? "default" : "destructive"} className="text-xs">
                {testResult.success ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    테스트 통과 ({testResult.responseTime}ms)
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    테스트 실패
                  </>
                )}
              </Badge>
            )}
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="request">요청 설정</TabsTrigger>
              <TabsTrigger value="response">응답 매핑</TabsTrigger>
              <TabsTrigger value="advanced">고급 설정</TabsTrigger>
            </TabsList>

            {/* 기본 정보 탭 */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">템플릿 이름 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="예: Google Search API"
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리 *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: ApiCategory) => setFormData(prev => ({ ...prev, category: value }))}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baseUrl">Base URL *</Label>
                  <Input
                    id="baseUrl"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="https://api.example.com"
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="path">Path *</Label>
                  <Input
                    id="path"
                    value={formData.path}
                    onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
                    placeholder="/v1/search?q={{INPUT_TEXT}}"
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">HTTP Method</Label>
                  <Select 
                    value={formData.method} 
                    onValueChange={(value: HttpMethod) => setFormData(prev => ({ ...prev, method: value }))}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {METHOD_OPTIONS.map(method => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authType">인증 방식</Label>
                  <Select 
                    value={formData.authType} 
                    onValueChange={(value: AuthType) => setFormData(prev => ({ ...prev, authType: value }))}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AUTH_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.authType !== 'None' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="authKeyName">인증 키 이름</Label>
                    <Input
                      id="authKeyName"
                      value={formData.authKeyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, authKeyName: e.target.value }))}
                      placeholder="Authorization, X-API-Key 등"
                      disabled={isReadOnly}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="authPrefix">인증 프리픽스</Label>
                    <Input
                      id="authPrefix"
                      value={formData.authPrefix}
                      onChange={(e) => setFormData(prev => ({ ...prev, authPrefix: e.target.value }))}
                      placeholder="Bearer , API-Key 등"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="이 API 템플릿에 대한 설명을 입력하세요"
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>
            </TabsContent>

            {/* 요청 설정 탭 */}
            <TabsContent value="request" className="space-y-4">
              
              {/* 파라미터 설정 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>쿼리 파라미터</Label>
                  {!isReadOnly && (
                    <Button variant="outline" size="sm" onClick={addParam}>
                      <Plus className="w-3 h-3 mr-1" />
                      추가
                    </Button>
                  )}
                </div>
                
                {formData.params.map((param, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={param.key}
                      onChange={(e) => updateParam(index, 'key', e.target.value)}
                      placeholder="파라미터 이름"
                      disabled={isReadOnly}
                    />
                    <Input
                      value={param.value}
                      onChange={(e) => updateParam(index, 'value', e.target.value)}
                      placeholder="값 ({{INPUT_TEXT}} 사용 가능)"
                      disabled={isReadOnly}
                    />
                    {!isReadOnly && (
                      <Button variant="ghost" size="sm" onClick={() => removeParam(index)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              {/* 헤더 설정 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>커스텀 헤더</Label>
                  {!isReadOnly && (
                    <Button variant="outline" size="sm" onClick={addHeader}>
                      <Plus className="w-3 h-3 mr-1" />
                      추가
                    </Button>
                  )}
                </div>
                
                {formData.headers.map((header, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={header.key}
                      onChange={(e) => updateHeader(index, 'key', e.target.value)}
                      placeholder="헤더 이름"
                      disabled={isReadOnly}
                    />
                    <Input
                      value={header.value}
                      onChange={(e) => updateHeader(index, 'value', e.target.value)}
                      placeholder="값 ({{API_KEY}} 사용 가능)"
                      disabled={isReadOnly}
                    />
                    {!isReadOnly && (
                      <Button variant="ghost" size="sm" onClick={() => removeHeader(index)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {['POST', 'PUT', 'PATCH'].includes(formData.method) && (
                <>
                  <Separator />
                  
                  {/* 바디 설정 */}
                  <div className="space-y-2">
                    <Label htmlFor="body">요청 바디 (JSON)</Label>
                    <Textarea
                      id="body"
                      value={formData.body}
                      onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                      placeholder='{"query": "{{INPUT_TEXT}}", "limit": 10}'
                      rows={6}
                      disabled={isReadOnly}
                    />
                    <p className="text-xs text-muted-foreground">
                      {{INPUT_TEXT}}, {{API_KEY}} 등의 변수를 사용할 수 있습니다.
                    </p>
                  </div>
                </>
              )}
            </TabsContent>

            {/* 응답 매핑 탭 */}
            <TabsContent value="response" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryTextPath">텍스트 추출 경로 (JSONPath)</Label>
                  <Input
                    id="primaryTextPath"
                    value={formData.primaryTextPath}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryTextPath: e.target.value }))}
                    placeholder="$.data[0].content"
                    disabled={isReadOnly}
                  />
                  <p className="text-xs text-muted-foreground">
                    응답 JSON에서 텍스트를 추출할 경로를 지정하세요.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryImagePath">이미지 추출 경로 (JSONPath)</Label>
                  <Input
                    id="primaryImagePath"
                    value={formData.primaryImagePath}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryImagePath: e.target.value }))}
                    placeholder="$.data[0].image_url"
                    disabled={isReadOnly}
                  />
                  <p className="text-xs text-muted-foreground">
                    응답 JSON에서 이미지 URL을 추출할 경로를 지정하세요.
                  </p>
                </div>

                <div className="bg-muted/10 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">JSONPath 사용법</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <code>$.data</code> - 루트의 data 필드</li>
                    <li>• <code>$.results[0]</code> - results 배열의 첫 번째 항목</li>
                    <li>• <code>$.items[0].title</code> - 중첩된 객체의 필드</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* 고급 설정 탭 */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeoutMs">타임아웃 (ms)</Label>
                  <Input
                    id="timeoutMs"
                    type="number"
                    value={formData.timeoutMs}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeoutMs: parseInt(e.target.value) || 8000 }))}
                    min={1000}
                    max={60000}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxRespKB">최대 응답 크기 (KB)</Label>
                  <Input
                    id="maxRespKB"
                    type="number"
                    value={formData.maxRespKB}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxRespKB: parseInt(e.target.value) || 256 }))}
                    min={1}
                    max={10240}
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>무료 체험 지원</Label>
                    <p className="text-sm text-muted-foreground">API 키 없이 제한적 체험 가능</p>
                  </div>
                  <Switch
                    checked={formData.freeTier}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, freeTier: checked }))}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>키리스 API</Label>
                    <p className="text-sm text-muted-foreground">API 키가 필요 없는 공개 API</p>
                  </div>
                  <Switch
                    checked={formData.keyless}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, keyless: checked }))}
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentation">문서화 링크</Label>
                <Input
                  id="documentation"
                  value={formData.documentation}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentation: e.target.value }))}
                  placeholder="https://api.example.com/docs"
                  disabled={isReadOnly}
                />
              </div>

              {/* 테스트 섹션 */}
              {!isReadOnly && (
                <>
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label>API 테스트</Label>
                    <div className="flex gap-2">
                      <Input
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        placeholder="테스트용 입력값"
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleTest} 
                        disabled={isTestingInProgress}
                        variant="outline"
                      >
                        {isTestingInProgress ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            테스트 중...
                          </>
                        ) : (
                          <>
                            <TestTube className="w-3 h-3 mr-1" />
                            테스트
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {testResult && !testResult.success && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                        <p className="text-sm text-destructive font-medium">테스트 실패</p>
                        <p className="text-xs text-destructive/80 mt-1">{testResult.error}</p>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      ⚠️ 템플릿을 저장하려면 테스트를 성공해야 합니다.
                    </p>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          {!isReadOnly && (
            <Button 
              onClick={handleSave}
              disabled={!testResult?.success && mode !== 'view'}
            >
              {mode === 'create' ? '생성' : '저장'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}