import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useApp } from '../src/context/AppContext';
import { Keyword } from '../src/types';
import { KEYWORD_CATEGORIES } from '../src/constants';
import { toast } from 'sonner@2.0.3';

interface KeywordEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  keywordId?: string | null; // null이면 새 키워드 생성
}

export function KeywordEditorModal({ isOpen, onClose, keywordId }: KeywordEditorModalProps) {
  const { state, addKeyword, updateKeyword } = useApp();
  
  // 편집할 키워드 찾기
  const keyword = keywordId ? state.masterKeywords.find(kw => kw.id === keywordId) : null;
  const isEditing = !!keyword;
  const isDefaultKeyword = keyword?.isDefault;
  
  // 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'tone'
  });
  
  // 키워드 데이터로 폼 초기화
  useEffect(() => {
    if (isEditing && keyword) {
      setFormData({
        name: keyword.name,
        description: keyword.description,
        category: keyword.category
      });
    } else {
      // 새 키워드일 때 폼 초기화
      setFormData({
        name: '',
        description: '',
        category: 'tone'
      });
    }
  }, [isEditing, keyword, isOpen]);
  
  // 폼 필드 업데이트
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // 저장 처리
  const handleSave = () => {
    const { name, description, category } = formData;
    
    // 유효성 검사
    if (!name.trim()) {
      toast.error('키워드 이름을 입력해주세요.');
      return;
    }
    
    if (!description.trim()) {
      toast.error('키워드 설명을 입력해주세요.');
      return;
    }
    
    // 중복 이름 검사 (편집 중인 키워드 제외)
    const existingKeyword = state.masterKeywords.find(
      kw => kw.name === name.trim() && kw.id !== keywordId
    );
    
    if (existingKeyword) {
      toast.error('이미 존재하는 키워드 이름입니다.');
      return;
    }
    
    if (isEditing && keyword) {
      // 기존 키워드 수정
      updateKeyword(keyword.id, {
        name: name.trim(),
        description: description.trim(),
        category
      });
      toast.success(`키워드 "${name}"이 수정되었습니다.`);
    } else {
      // 새 키워드 생성
      const newKeyword: Keyword = {
        id: `kw_custom_${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        category,
        isDefault: false,
        createdAt: new Date(),
        usageCount: 0
      };
      
      addKeyword(newKeyword);
      toast.success(`키워드 "${name}"이 생성되었습니다.`);
    }
    
    onClose();
  };
  
  // 취소 처리
  const handleCancel = () => {
    onClose();
  };
  
  // 카테고리 표시명 매핑
  const getCategoryLabel = (category: string) => {
    const categoryLabels: { [key: string]: string } = {
      tone: '말투/어조',
      style: '스타일',
      format: '형식/구조',
      approach: '접근방식',
      language: '언어'
    };
    return categoryLabels[category] || category;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '키워드 편집' : '새 키워드 생성'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 키워드 이름 */}
          <div className="space-y-2">
            <Label htmlFor="keyword-name">
              키워드 이름 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="keyword-name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="예: Professional, Friendly"
              disabled={isDefaultKeyword} // 기본 키워드는 이름 변경 불가
            />
            {isDefaultKeyword && (
              <p className="text-xs text-muted-foreground">
                기본 키워드의 이름은 변경할 수 없습니다.
              </p>
            )}
          </div>
          
          {/* 키워드 설명 */}
          <div className="space-y-2">
            <Label htmlFor="keyword-description">
              설명 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="keyword-description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="이 키워드가 어떤 응답 방식을 만드는지 설명해주세요..."
              rows={3}
            />
          </div>
          
          {/* 카테고리 */}
          <div className="space-y-2">
            <Label>카테고리</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => updateField('category', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(KEYWORD_CATEGORIES).map(category => (
                  <SelectItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 기본 키워드 표시 */}
          {isDefaultKeyword && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">기본 키워드</Badge>
              <span className="text-xs text-muted-foreground">
                삭제할 수 없는 시스템 키워드입니다
              </span>
            </div>
          )}
          
          {/* 액션 버튼 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              취소
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? '수정' : '생성'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}