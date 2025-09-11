import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Save, Settings, User, Briefcase, Heart, Lightbulb, Target, GraduationCap, Star, Zap, Shield, Brain, Sparkles, Hash, Plus, X, MessageSquare, Info } from 'lucide-react';
import { useApp } from '../src/context/AppContext';
import { Role, Keyword } from '../src/types';
import { KeywordEditorModal } from './KeywordEditorModal';
import { KeywordDetailModal } from './KeywordDetailModal';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface AdvancedRoleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit?: Role | null;
  onSave?: (role: Role) => void;
  expertMode?: boolean;
}

const categoryIcons = {
  recommended: Star,
  popular: Sparkles,
  lifestyle: Heart,
  creativity: Lightbulb,
  productivity: Target,
  education: GraduationCap,
  expert: Briefcase,
  custom: User
};

const categoryLabels = {
  recommended: '추천',
  popular: '인기',
  lifestyle: '라이프 스타일',
  creativity: '창의성',
  productivity: '생산성',
  education: '학습 및 교육',
  expert: '전문가',
  custom: '사용자 정의'
};

const safetyLevels = {
  BLOCK_NONE: '차단 안함',
  BLOCK_FEW: '일부 차단',
  BLOCK_SOME: '보통 차단',
  BLOCK_MOST: '대부분 차단',
  BLOCK_MEDIUM_AND_ABOVE: '중간 이상 차단',
  BLOCK_LOW_AND_ABOVE: '낮음 이상 차단'
};

export function AdvancedRoleEditModal({
  isOpen,
  onClose,
  roleToEdit,
  onSave,
  expertMode = false
}: AdvancedRoleEditModalProps) {
  const { state, addRole, updateRole, addKeyword: addGlobalKeyword } = useApp();
  const userMode = state.userSettings.mode;
  const maxKeywords = userMode === 'standard' ? 3 : userMode === 'advanced' ? 5 : Infinity;

  // 상태 관리
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>([]);
  const [keywordEditorOpen, setKeywordEditorOpen] = useState(false);
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null);
  const [keywordDetailOpen, setKeywordDetailOpen] = useState(false);
  const [detailKeywordId, setDetailKeywordId] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom' as keyof typeof categoryLabels,
    prompt: '',
    temperature: 0.7,
    maxOutputTokens: 2048,
    safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE' as keyof typeof safetyLevels
  });

  // Role 데이터 초기화
  useEffect(() => {
    if (roleToEdit) {
      setFormData({
        name: roleToEdit.name,
        description: roleToEdit.description,
        category: roleToEdit.category as keyof typeof categoryLabels,
        prompt: roleToEdit.prompt,
        temperature: roleToEdit.temperature || 0.7,
        maxOutputTokens: roleToEdit.maxOutputTokens || 2048,
        safetyLevel: (roleToEdit.safetyLevel as keyof typeof safetyLevels) || 'BLOCK_MEDIUM_AND_ABOVE'
      });
      setSelectedKeywordIds(roleToEdit.keywordIds || []);
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'custom',
        prompt: '',
        temperature: 0.7,
        maxOutputTokens: 2048,
        safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE'
      });
      setSelectedKeywordIds([]);
    }
    setNewKeyword('');
    setActiveTab('basic');
  }, [roleToEdit, isOpen]);

  // 키워드 관리 함수들
  const toggleKeyword = (keywordId: string) => {
    if (selectedKeywordIds.includes(keywordId)) {
      const newSelectedIds = selectedKeywordIds.filter(id => id !== keywordId);
      setSelectedKeywordIds(newSelectedIds);
    } else if (selectedKeywordIds.length < maxKeywords) {
      const newSelectedIds = [...selectedKeywordIds, keywordId];
      setSelectedKeywordIds(newSelectedIds);
    }
  };

  const removeKeyword = (keywordId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const newSelectedIds = selectedKeywordIds.filter(id => id !== keywordId);
    setSelectedKeywordIds(newSelectedIds);
  };

  const handleCreateNewKeyword = () => {
    if (newKeyword.trim()) {
      const newKeywordObj: Keyword = {
        id: `kw_custom_${Date.now()}`,
        name: newKeyword.trim(),
        description: '사용자 정의 키워드',
        category: 'tone',
        isDefault: false,
        createdAt: new Date(),
        usageCount: 0
      };
      
      addGlobalKeyword(newKeywordObj);
      setSelectedKeywordIds([...selectedKeywordIds, newKeywordObj.id]);
      setNewKeyword('');
    }
  };

  const handleEditKeyword = (keywordId: string) => {
    setEditingKeywordId(keywordId);
    setKeywordEditorOpen(true);
  };

  const handleKeywordDetailEdit = (keywordId: string) => {
    setDetailKeywordId(keywordId);
    setKeywordDetailOpen(true);
  };

  const handleSave = () => {
    const roleData: Role = {
      id: roleToEdit?.id || `custom_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      prompt: formData.prompt,
      category: formData.category,
      keywordIds: selectedKeywordIds,
      temperature: formData.temperature,
      maxOutputTokens: formData.maxOutputTokens,
      safetyLevel: formData.safetyLevel,
      isCustom: true,
      createdMode: userMode
    };

    if (roleToEdit) {
      updateRole(roleToEdit.id, roleData);
    } else {
      addRole(roleData);
    }

    if (onSave) {
      onSave(roleData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle>
                {expertMode ? 'Expert' : 'Advanced'} Role {roleToEdit ? '수정' : '만들기'}
              </DialogTitle>
              <DialogDescription>
                {roleToEdit ? '고급 Role 설정을 수정합니다' : '고급 설정으로 새로운 전문가 Role을 만들어보세요'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* 탭 헤더 */}
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              기본 설정
            </TabsTrigger>
            <TabsTrigger value="response" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              응답 방식
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              고급 설정
            </TabsTrigger>
          </TabsList>

          {/* 기본 설정 탭 */}
          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label htmlFor="name">Role 이름</Label>
              <Input
                id="name"
                placeholder="예: 개인 트레이너"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">간단한 설명</Label>
              <Input
                id="description"
                placeholder="예: 운동과 건강 관리를 도와주는 전문가"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category">카테고리</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as keyof typeof categoryLabels })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => {
                    const Icon = categoryIcons[key as keyof typeof categoryIcons];
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prompt">Role 프롬프트</Label>
              <Textarea
                id="prompt"
                placeholder="이 Role이 어떻게 행동해야 하는지 자세히 설명해주세요..."
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                rows={8}
              />
            </div>
          </TabsContent>

          {/* 응답 방식 탭 */}
          <TabsContent value="response" className="space-y-4">
            <div>
              <Label>응답 키워드 선택</Label>
              <p className="text-sm text-muted-foreground mb-3">
                AI가 어떤 스타일로 응답할지 키워드를 선택해주세요. 
                <Badge variant="outline" className="ml-1">
                  최대 {maxKeywords}개
                </Badge>
              </p>

              {/* 선택된 키워드들 */}
              <div className="mb-4">
                <Label className="text-sm font-medium">선택된 키워드 ({selectedKeywordIds.length}/{maxKeywords})</Label>
                <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] p-3 border border-dashed border-border rounded-lg">
                  {selectedKeywordIds.length === 0 ? (
                    <p className="text-sm text-muted-foreground">선택된 키워드가 없습니다.</p>
                  ) : (
                    selectedKeywordIds.map(keywordId => {
                      const keyword = state.masterKeywords.find(k => k.id === keywordId);
                      return keyword ? (
                        <Badge key={keywordId} variant="default" className="gap-1">
                          {keyword.name}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                            onClick={(e) => removeKeyword(keywordId, e)}
                          />
                        </Badge>
                      ) : null;
                    })
                  )}
                </div>
              </div>

              {/* 기본 키워드들 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">기본 키워드</Label>
                <div className="grid grid-cols-3 gap-2">
                  {state.masterKeywords.filter(k => k.isDefault).map(keyword => (
                    <Popover key={keyword.id}>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Button
                            variant={selectedKeywordIds.includes(keyword.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleKeyword(keyword.id)}
                            onDoubleClick={() => handleKeywordDetailEdit(keyword.id)}
                            disabled={!selectedKeywordIds.includes(keyword.id) && selectedKeywordIds.length >= maxKeywords}
                            className="w-full justify-center h-auto py-3 relative group transition-all duration-200"
                            title="더블클릭하여 세부 프롬프트 조정"
                          >
                            <div className="text-center">
                              <div className="font-medium text-sm">{keyword.name}</div>
                              {keyword.detailPrompt && (
                                <div className="w-2 h-2 bg-primary rounded-full absolute -top-1 -right-1"></div>
                              )}
                            </div>
                            <Info className="h-3 w-3 absolute top-1 right-1 opacity-0 group-hover:opacity-60 transition-opacity" />
                          </Button>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-3" side="top" align="center">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">{keyword.name}</h4>
                          <p className="text-sm text-muted-foreground">{keyword.description}</p>
                          {keyword.detailPrompt && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                              <strong>세부 설정:</strong> {keyword.detailPrompt.substring(0, 100)}
                              {keyword.detailPrompt.length > 100 && '...'}
                            </div>
                          )}
                          <p className="text-xs text-primary">더블클릭하여 세부 프롬프트 조정</p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              </div>

              {/* 커스텀 키워드들 */}
              {state.masterKeywords.filter(k => !k.isDefault).length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">커스텀 키워드</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {state.masterKeywords.filter(k => !k.isDefault).map(keyword => (
                      <Popover key={keyword.id}>
                        <PopoverTrigger asChild>
                          <div className="relative">
                            <Button
                              variant={selectedKeywordIds.includes(keyword.id) ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleKeyword(keyword.id)}
                              onDoubleClick={() => handleKeywordDetailEdit(keyword.id)}
                              disabled={!selectedKeywordIds.includes(keyword.id) && selectedKeywordIds.length >= maxKeywords}
                              className="w-full justify-center h-auto py-3 relative group transition-all duration-200"
                              title="더블클릭하여 세부 프롬프트 조정"
                            >
                              <div className="text-center">
                                <div className="font-medium text-sm">{keyword.name}</div>
                                {keyword.detailPrompt && (
                                  <div className="w-2 h-2 bg-primary rounded-full absolute -top-1 -right-1"></div>
                                )}
                              </div>
                              <Settings 
                                className="h-3 w-3 absolute top-1 left-1 opacity-0 group-hover:opacity-60 transition-opacity cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditKeyword(keyword.id);
                                }}
                              />
                              <Info className="h-3 w-3 absolute top-1 right-1 opacity-0 group-hover:opacity-60 transition-opacity" />
                            </Button>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-3" side="top" align="center">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{keyword.name}</h4>
                            <p className="text-sm text-muted-foreground">{keyword.description}</p>
                            {keyword.detailPrompt && (
                              <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                                <strong>세부 설정:</strong> {keyword.detailPrompt.substring(0, 100)}
                                {keyword.detailPrompt.length > 100 && '...'}
                              </div>
                            )}
                            <p className="text-xs text-primary">더블클릭하여 세부 프롬프트 조정</p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                  </div>
                </div>
              )}

              {/* 새 키워드 생성 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">새 키워드 생성</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="키워드 이름 (예: 유머러스, 간결한)"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateNewKeyword()}
                    disabled={selectedKeywordIds.length >= maxKeywords}
                  />
                  <Button 
                    onClick={handleCreateNewKeyword}
                    disabled={!newKeyword.trim() || selectedKeywordIds.length >= maxKeywords}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 모드별 안내문 */}
              {userMode === 'standard' && (
                <div className="mt-6 p-4 bg-blue-50/80 light:bg-blue-100/60 dark:bg-blue-950/30 border border-blue-200/60 light:border-blue-300/80 dark:border-blue-800/60 rounded-lg">
                  <p className="text-sm text-blue-800 light:text-blue-900 dark:text-blue-200">
                    Standard 모드에서는 최대 3개의 키워드를 선택할 수 있습니다. 서로 상반된 키워드를 선택하면 응답의 정확도와 대화 품질이 저하될 수 있습니다.
                  </p>
                </div>
              )}

              {userMode === 'advanced' && (
                <div className="mt-6 p-4 bg-orange-50/80 light:bg-orange-100/60 dark:bg-orange-950/30 border border-orange-200/60 light:border-orange-300/80 dark:border-orange-800/60 rounded-lg">
                  <p className="text-sm text-orange-800 light:text-orange-900 dark:text-orange-200">
                    Advanced 모드에서는 최대 5개의 키워드를 선택할 수 있습니다. 너무 많은 키워드를 적용하거나 상반된 키워드를 선택시 응답의 정확도, 대화의 품질이 저하될 수 있습니다.
                  </p>
                </div>
              )}

              {userMode === 'expert' && (
                <div className="mt-6 p-4 bg-red-50/80 light:bg-red-100/60 dark:bg-red-950/30 border border-red-200/60 light:border-red-300/80 dark:border-red-800/60 rounded-lg">
                  <p className="text-sm text-red-800 light:text-red-900 dark:text-red-200">
                    Expert 모드에서는 키워드 개수 제한이 없지만, 너무 많은 키워드의 설정은 컨텍스트(기억량)에 영향을 미치고 대화 품질 저하의 원인이 될 수 있습니다.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 고급 설정 탭 */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Temperature 설정 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    창의성 (Temperature)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    응답의 창의성과 무작위성을 조절합니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>보수적</span>
                      <span>{formData.temperature}</span>
                      <span>창의적</span>
                    </div>
                    <Slider
                      value={[formData.temperature]}
                      onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
                      max={1.0}
                      min={0.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Max Output Tokens */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    최대 응답 길이
                  </CardTitle>
                  <CardDescription className="text-xs">
                    AI 응답의 최대 토큰 수를 설정합니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>짧음</span>
                      <span>{formData.maxOutputTokens}</span>
                      <span>길음</span>
                    </div>
                    <Slider
                      value={[formData.maxOutputTokens]}
                      onValueChange={([value]) => setFormData({ ...formData, maxOutputTokens: value })}
                      max={4096}
                      min={512}
                      step={256}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Safety Level */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  안전 필터 레벨
                </CardTitle>
                <CardDescription className="text-xs">
                  부적절한 콘텐츠 차단 수준을 설정합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={formData.safetyLevel} 
                  onValueChange={(value) => setFormData({ ...formData, safetyLevel: value as keyof typeof safetyLevels })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(safetyLevels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 액션 버튼들 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={!formData.name.trim() || !formData.prompt.trim()}>
            <Save className="h-4 w-4 mr-2" />
            {roleToEdit ? '수정 완료' : 'Role 만들기'}
          </Button>
        </div>

        {/* 키워드 편집 모달 */}
        <KeywordEditorModal
          isOpen={keywordEditorOpen}
          onClose={() => {
            setKeywordEditorOpen(false);
            setEditingKeywordId(null);
          }}
          keywordId={editingKeywordId}
        />

        {/* 키워드 세부 설정 모달 */}
        <KeywordDetailModal
          isOpen={keywordDetailOpen}
          onClose={() => {
            setKeywordDetailOpen(false);
            setDetailKeywordId(null);
          }}
          keywordId={detailKeywordId}
        />
      </DialogContent>
    </Dialog>
  );
}
