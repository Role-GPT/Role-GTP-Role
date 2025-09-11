import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { VisuallyHidden } from './ui/visually-hidden';
import { 
  Save, 
  Brain, 
  Wand2, 
  Settings, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff,
  Sparkles,
  Target,
  Shield,
  Zap,
  MessageSquare,
  Upload,
  Download,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../src/context/AppContext';
import { Role, Mode } from '../src/types';
import { toast } from 'sonner';

interface GrokStyleRoleCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit?: Role | null;
  onSave?: () => void;
}

export function GrokStyleRoleCreator({ isOpen, onClose, roleToEdit, onSave }: GrokStyleRoleCreatorProps) {
  const { state, addRole, updateRole, deleteRole } = useApp();
  
  // 모드별 기능 제한 확인
  const userMode = state.userSettings.mode;
  const isStandard = userMode === 'standard';
  const isAdvanced = userMode === 'advanced';
  const isExpert = userMode === 'expert';

  // 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompt: '',
    category: 'custom',
    temperature: 0.7,
    maxOutputTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
    keywordIds: [] as string[],
    customInstructions: '',
    isPublic: false,
    isPinned: false
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 편집 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (isOpen) {
      if (roleToEdit) {
        setFormData({
          name: roleToEdit.name || '',
          description: roleToEdit.description || '',
          prompt: roleToEdit.prompt || '',
          category: roleToEdit.category || 'custom',
          temperature: roleToEdit.temperature || 0.7,
          maxOutputTokens: roleToEdit.maxOutputTokens || 2048,
          topP: roleToEdit.topP || 0.9,
          frequencyPenalty: roleToEdit.frequencyPenalty || 0.0,
          presencePenalty: roleToEdit.presencePenalty || 0.0,
          safetyLevel: roleToEdit.safetyLevel || 'BLOCK_MEDIUM_AND_ABOVE',
          keywordIds: roleToEdit.keywordIds || [],
          customInstructions: roleToEdit.customInstructions || '',
          isPublic: roleToEdit.isPublic || false,
          isPinned: roleToEdit.isPinned || false
        });
      } else {
        // 새 Role 생성 시 기본값
        setFormData({
          name: '',
          description: '',
          prompt: '',
          category: 'custom',
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.9,
          frequencyPenalty: 0.0,
          presencePenalty: 0.0,
          safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
          keywordIds: [],
          customInstructions: '',
          isPublic: false,
          isPinned: false
        });
      }
      setErrors({});
      setPreviewMode(false);
    }
  }, [isOpen, roleToEdit]);

  // 유효성 검사
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role 이름은 필수입니다';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Role 이름은 최소 2자 이상이어야 합니다';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Role 이름은 50자를 초과할 수 없습니다';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Role 설명은 필수입니다';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Role 설��은 최소 10자 이상이어야 합니다';
    } else if (formData.description.length > 200) {
      newErrors.description = 'Role 설명은 200자를 초과할 수 없습니다';
    }

    if (!formData.prompt.trim()) {
      newErrors.prompt = 'Role 프롬프트는 필수입니다';
    } else if (formData.prompt.length < 20) {
      newErrors.prompt = 'Role 프롬프트는 최소 20자 이상이어야 합니다';
    } else if (formData.prompt.length > 2000) {
      newErrors.prompt = 'Role 프롬프트는 2000자를 초과할 수 없습니다';
    }

    // 기존 Role과 중복 체크
    const existingRole = state.roles.find(r => 
      r.name.toLowerCase() === formData.name.toLowerCase() && 
      (!roleToEdit || r.id !== roleToEdit.id)
    );
    if (existingRole) {
      newErrors.name = '이미 존재하는 Role 이름입니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 저장 핸들러
  const handleSave = () => {
    if (!validateForm()) {
      toast.error('입력 정보를 확인해주세요.');
      return;
    }

    try {
      const roleData: Role = {
        id: roleToEdit?.id || `custom_${Date.now()}`,
        name: formData.name.trim(),
        description: formData.description.trim(),
        prompt: formData.prompt.trim(),
        category: formData.category,
        temperature: formData.temperature,
        maxOutputTokens: formData.maxOutputTokens,
        topP: formData.topP,
        frequencyPenalty: formData.frequencyPenalty,
        presencePenalty: formData.presencePenalty,
        safetyLevel: formData.safetyLevel,
        keywordIds: formData.keywordIds,
        customInstructions: formData.customInstructions,
        isCustom: true,
        isPinned: formData.isPinned,
        isPublic: formData.isPublic,
        createdMode: userMode as Mode,
        createdAt: roleToEdit?.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (roleToEdit) {
        updateRole(roleToEdit.id, roleData);
        toast.success('Role이 성공적으로 수정되었습니다.');
      } else {
        addRole(roleData);
        toast.success('새로운 Role이 생성되었습니다.');
      }

      onSave?.();
      onClose();
    } catch (error) {
      toast.error('Role 저장 중 오류가 발생했습니다.');
      console.error('Role save error:', error);
    }
  };

  // 삭제 핸들러
  const handleDelete = () => {
    if (roleToEdit && confirm(`"${roleToEdit.name}" Role을 삭제하시겠습니까?`)) {
      deleteRole(roleToEdit.id);
      toast.success('Role이 삭제되었습니다.');
      onClose();
    }
  };

  // 복제 핸들러
  const handleDuplicate = () => {
    if (roleToEdit) {
      setFormData({
        ...formData,
        name: `${formData.name} (복사본)`,
        isPinned: false
      });
      toast.info('Role이 복제 모드로 설정되었습니다. 이름을 수정 후 저장하세요.');
    }
  };

  // 내보내기 핸들러
  const handleExport = () => {
    const exportData = {
      role: formData,
      exportedAt: new Date().toISOString(),
      exportedBy: 'Role GPT Creator',
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_role.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Role이 내보내기 되었습니다.');
  };

  // 가져오기 핸들러
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.role) {
              setFormData({
                ...formData,
                ...data.role,
                name: data.role.name + ' (가져옴)'
              });
              toast.success('Role이 성공적으로 가져와졌습니다.');
            } else {
              toast.error('올바르지 않은 Role 파일입니다.');
            }
          } catch (error) {
            toast.error('Role 파일을 읽는데 실패했습니다.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 초기화 핸들러
  const handleReset = () => {
    if (confirm('모든 입력 내용이 초기화됩니다. 계속하시겠습니까?')) {
      setFormData({
        name: '',
        description: '',
        prompt: '',
        category: 'custom',
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
        keywordIds: [],
        customInstructions: '',
        isPublic: false,
        isPinned: false
      });
      setErrors({});
      toast.info('폼이 초기화되었습니다.');
    }
  };

  const isEditMode = !!roleToEdit;
  const canDelete = isEditMode && roleToEdit?.isCustom;
  const canAdvancedFeatures = isAdvanced || isExpert;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {isEditMode ? `"${roleToEdit?.name}" Role 편집` : 'Role 생성'}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              새로운 AI Role을 생성하거나 기존 Role을 편집할 수 있습니다. Role의 성격, 전문성, 응답 스타일을 정의하세요.
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <div className="space-y-6">
          {/* 모드 제한 안내 */}
          {isStandard && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Standard 모드 제한</span>
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  Standard 모드에서는 기본적인 Role 생성 기능만 사용할 수 있습니다.
                  고급 설정은 Advanced 이상 모드에서 사용 가능합니다.
                </p>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <Wand2 className="w-4 h-4" />
                기본 정보
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-1" disabled={isStandard}>
                <Settings className="w-4 h-4" />
                고급 설정
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-1">
                {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                미리보기
              </TabsTrigger>
            </TabsList>

            {/* 기본 정보 탭 */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Role 기본 정보
                  </CardTitle>
                  <CardDescription>
                    Role의 이름, 설명, 그리고 핵심 프롬프트를 정의하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Role 이름 */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Role 이름 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="예: 마케팅 전문가, 코딩 멘토, 영어 선생님"
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  {/* Role 설명 */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Role 설명 *</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="이 Role이 무엇을 도와주는지 간단히 설명하세요"
                      className={errors.description ? 'border-destructive' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formData.description.length}/200자
                    </p>
                  </div>

                  {/* 카테고리 */}
                  <div className="space-y-2">
                    <Label htmlFor="category">카테고리</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">커스텀</SelectItem>
                        <SelectItem value="business">비즈니스</SelectItem>
                        <SelectItem value="creativity">창의성</SelectItem>
                        <SelectItem value="education">교육</SelectItem>
                        <SelectItem value="lifestyle">라이프스타일</SelectItem>
                        <SelectItem value="productivity">생산성</SelectItem>
                        <SelectItem value="expert">전문가</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Role 프롬프트 */}
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Role 프롬프트 *</Label>
                    <Textarea
                      id="prompt"
                      value={formData.prompt}
                      onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                      placeholder="이 Role의 성격, 전문성, 응답 스타일을 자세히 정의하세요..."
                      rows={8}
                      className={errors.prompt ? 'border-destructive' : ''}
                    />
                    {errors.prompt && (
                      <p className="text-sm text-destructive">{errors.prompt}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formData.prompt.length}/2000자
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 고급 설정 탭 */}
            <TabsContent value="advanced" className="space-y-4">
              {canAdvancedFeatures ? (
                <>
                  {/* AI 매개변수 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        AI 매개변수
                      </CardTitle>
                      <CardDescription>
                        Role의 응답 스타일과 창의성을 세밀하게 조정하세요
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Temperature */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>창의성 (Temperature)</Label>
                          <Badge variant="outline">{formData.temperature}</Badge>
                        </div>
                        <Slider
                          value={[formData.temperature]}
                          onValueChange={([value]) => setFormData(prev => ({ ...prev, temperature: value }))}
                          max={2}
                          min={0}
                          step={0.1}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          낮을수록 일관되고 예측 가능한 응답, 높을수록 창의적이고 다양한 응답
                        </p>
                      </div>

                      {/* Max Tokens */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>최대 토큰 수</Label>
                          <Badge variant="outline">{formData.maxOutputTokens}</Badge>
                        </div>
                        <Slider
                          value={[formData.maxOutputTokens]}
                          onValueChange={([value]) => setFormData(prev => ({ ...prev, maxOutputTokens: value }))}
                          max={4096}
                          min={256}
                          step={256}
                          className="w-full"
                        />
                      </div>

                      {/* Top P */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>포커스 (Top P)</Label>
                          <Badge variant="outline">{formData.topP}</Badge>
                        </div>
                        <Slider
                          value={[formData.topP]}
                          onValueChange={([value]) => setFormData(prev => ({ ...prev, topP: value }))}
                          max={1}
                          min={0}
                          step={0.05}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 추가 설정 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        동작 설정
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Custom Instructions */}
                      <div className="space-y-2">
                        <Label>추가 지시사항</Label>
                        <Textarea
                          value={formData.customInstructions}
                          onChange={(e) => setFormData(prev => ({ ...prev, customInstructions: e.target.value }))}
                          placeholder="이 Role에 특별한 제약사항이나 추가 지시사항이 있다면 입력하세요..."
                          rows={3}
                        />
                      </div>

                      {/* Safety Level */}
                      <div className="space-y-2">
                        <Label>안전 수준</Label>
                        <Select
                          value={formData.safetyLevel}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, safetyLevel: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BLOCK_NONE">필터링 없음</SelectItem>
                            <SelectItem value="BLOCK_FEW">최소 필터링</SelectItem>
                            <SelectItem value="BLOCK_SOME">보통 필터링</SelectItem>
                            <SelectItem value="BLOCK_MEDIUM_AND_ABOVE">강화 필터링 (권장)</SelectItem>
                            <SelectItem value="BLOCK_MOST">최대 필터링</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Switches */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>즐겨찾기에 추가</Label>
                            <p className="text-xs text-muted-foreground">
                              이 Role을 즐겨찾기에 추가합니다
                            </p>
                          </div>
                          <Switch
                            checked={formData.isPinned}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPinned: checked }))}
                          />
                        </div>

                        {isExpert && (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>공개 Role로 설정</Label>
                              <p className="text-xs text-muted-foreground">
                                다른 사용자들도 이 Role을 사용할 수 있습니다
                              </p>
                            </div>
                            <Switch
                              checked={formData.isPublic}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="border-muted">
                  <CardContent className="pt-6 text-center">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">고급 설정 잠금</h3>
                    <p className="text-muted-foreground mb-4">
                      고급 AI 매개변수 조정은 Advanced 이상 모드에서 사용할 수 있습니다.
                    </p>
                    <Button variant="outline" onClick={() => toast.info('설정에서 모드를 변경할 수 있습니다.')}>
                      모드 업그레이드 안내
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 미리보기 탭 */}
            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Role 미리보기
                  </CardTitle>
                  <CardDescription>
                    생성된 Role이 어떻게 보일지 미리 확인하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{formData.name || '새 Role'}</h4>
                          <Badge variant="outline" className="text-xs">
                            {formData.category}
                          </Badge>
                          {formData.isPinned && <Badge variant="secondary" className="text-xs">즐겨찾기</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formData.description || '설명이 입력되지 않았습니다.'}
                        </p>
                        {formData.prompt && (
                          <div className="mt-3 p-3 bg-background rounded border text-xs">
                            <p className="font-medium mb-1">프롬프트 내용:</p>
                            <p className="whitespace-pre-wrap">{formData.prompt}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {canAdvancedFeatures && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <Label>AI 매개변수</Label>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>창의성: {formData.temperature}</div>
                          <div>최대 토큰: {formData.maxOutputTokens}</div>
                          <div>포커스: {formData.topP}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>안전 설정</Label>
                        <div className="text-xs text-muted-foreground">
                          {formData.safetyLevel}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* 액션 버튼들 */}
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex gap-2">
              {canAdvancedFeatures && (
                <>
                  <Button variant="outline" size="sm" onClick={handleImport}>
                    <Upload className="w-4 h-4 mr-2" />
                    가져오기
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    내보내기
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                초기화
              </Button>
              {isEditMode && canAdvancedFeatures && (
                <Button variant="outline" size="sm" onClick={handleDuplicate}>
                  <Copy className="w-4 h-4 mr-2" />
                  복제
                </Button>
              )}
              {canDelete && (
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? '저장' : '생성'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
