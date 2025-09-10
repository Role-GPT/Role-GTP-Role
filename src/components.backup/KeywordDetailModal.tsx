import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useApp } from '../src/context/AppContext';
import { Keyword } from '../src/types';
import { toast } from 'sonner@2.0.3';
import { Info, Lightbulb, Save, RotateCcw } from 'lucide-react';

interface KeywordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  keywordId: string | null;
}

export function KeywordDetailModal({ isOpen, onClose, keywordId }: KeywordDetailModalProps) {
  const { state, updateKeyword } = useApp();
  
  // 편집할 키워드 찾기
  const keyword = keywordId ? state.masterKeywords.find(kw => kw.id === keywordId) : null;
  const userMode = state.userSettings.mode;
  
  // 글자 수 제한 설정
  const maxLength = userMode === 'advanced' ? 50 : 150; // Advanced 50자, Expert 150자
  const isStandardMode = userMode === 'standard';
  
  // 폼 상태
  const [detailPrompt, setDetailPrompt] = useState('');
  
  // 키워드 데이터로 폼 초기화
  useEffect(() => {
    if (keyword) {
      setDetailPrompt(keyword.detailPrompt || '');
    } else {
      setDetailPrompt('');
    }
  }, [keyword, isOpen]);
  
  // 저장 처리
  const handleSave = () => {
    if (!keyword) return;
    
    // 글자 수 검사
    if (detailPrompt.length > maxLength) {
      toast.error(`세부 프롬프트는 ${maxLength}자를 초과할 수 없습니다.`);
      return;
    }
    
    // 키워드 업데이트
    updateKeyword(keyword.id, {
      detailPrompt: detailPrompt.trim() || undefined
    });
    
    toast.success(`키워드 "${keyword.name}"의 세부 설정이 저장되었습니다.`);
    onClose();
  };
  
  // 초기화 처리
  const handleReset = () => {
    setDetailPrompt('');
  };
  
  // Standard 모드 접근 불가
  if (isStandardMode) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              기능 제한
            </DialogTitle>
            <DialogDescription>
              키워드 세부 프롬프트 조정은 Advanced 또는 Expert 모드에서만 사용할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/80 light:bg-blue-100/60 dark:bg-blue-950/30 border border-blue-200/60 light:border-blue-300/80 dark:border-blue-800/60 rounded-lg">
              <p className="text-sm text-blue-800 light:text-blue-900 dark:text-blue-200">
                Standard 모드에서는 기본 키워드 설정만 사용할 수 있습니다. 더 세밀한 프롬프트 조정을 원하시면 설정에서 모드를 변경해주세요.
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={onClose}>확인</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (!keyword) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            키워드 세부 프롬프트 조정
          </DialogTitle>
          <DialogDescription>
            "{keyword.name}" 키워드의 응답 방식을 더욱 세밀하게 조정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 키워드 정보 표시 */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{keyword.name}</Badge>
              {keyword.isDefault && (
                <Badge variant="secondary">기본 키워드</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{keyword.description}</p>
          </div>
          
          {/* 세부 프롬프트 입력 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="detail-prompt" className="text-base font-medium">
                세부 프롬프트 설정
              </Label>
              <span className="text-sm text-muted-foreground">
                {detailPrompt.length}/{maxLength}자
              </span>
            </div>
            
            <Textarea
              id="detail-prompt"
              value={detailPrompt}
              onChange={(e) => setDetailPrompt(e.target.value)}
              placeholder={`이 키워드로 AI가 응답할 때 추가로 고려해야 할 세부 지침을 입력하세요...

예시:
- "${keyword.name}" 스타일로 응답할 때 특별히 주의할 점
- 구체적인 응답 형식이나 구조
- 사용해야 할 특정 표현이나 피해야 할 표현
- 응답의 길이나 구성에 대한 세부 지침`}
              rows={8}
              className={detailPrompt.length > maxLength ? 'border-destructive' : ''}
            />
            
            {detailPrompt.length > maxLength && (
              <p className="text-sm text-destructive">
                {userMode === 'advanced' ? 'Advanced 모드' : 'Expert 모드'}에서는 최대 {maxLength}자까지 입력 가능합니다.
              </p>
            )}
          </div>
          

          
          {/* 액션 버튼 */}
          <div className="flex justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              초기화
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button 
                onClick={handleSave}
                disabled={detailPrompt.length > maxLength}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                저장
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}