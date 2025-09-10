import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { X, Info, Plus, Trash2, Sparkles, Edit3, Check, X as XIcon } from 'lucide-react';

interface ProjectGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guidelines: string) => void;
  initialGuidelines?: string;
}

export function ProjectGuidelinesModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialGuidelines = '' 
}: ProjectGuidelinesModalProps) {
  const [guidelines, setGuidelines] = useState(initialGuidelines);
  const [guidelinesList, setGuidelinesList] = useState<string[]>(() => {
    // 기존 지침을 줄 바꿈으로 분리하여 배열로 변환
    return initialGuidelines ? initialGuidelines.split('\n').filter(line => line.trim()) : [];
  });
  const [newGuideline, setNewGuideline] = useState('');
  const [editMode, setEditMode] = useState<'text' | 'chips'>('chips');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // 추천 지침 템플릿
  const recommendedGuidelines = [
    "핵심 먼저, 필요하면 자세히 풀어주세요",
    "어려운 용어는 쉬운 말로 함께 설명해주세요", 
    "코드는 바로 실행 가능한 최소 예제로 보여주세요",
    "확실하지 않은 건 추정 말고 확인 질문을 주세요",
    "지침 사항을 조금씩 나누어 전달주면 맥락이 오래가요"
  ];

  if (!isOpen) return null;

  const handleSave = () => {
    const finalGuidelines = editMode === 'chips' 
      ? guidelinesList.join('\n\n')
      : guidelines;
    onSave(finalGuidelines);
    onClose();
  };

  const handleCancel = () => {
    setGuidelines(initialGuidelines);
    setGuidelinesList(initialGuidelines ? initialGuidelines.split('\n').filter(line => line.trim()) : []);
    setNewGuideline('');
    setEditingIndex(null);
    setEditingText('');
    onClose();
  };

  const addGuideline = () => {
    if (newGuideline.trim() && !guidelinesList.includes(newGuideline.trim())) {
      setGuidelinesList([...guidelinesList, newGuideline.trim()]);
      setNewGuideline('');
    }
  };

  const removeGuideline = (index: number) => {
    setGuidelinesList(guidelinesList.filter((_, i) => i !== index));
  };

  const addRecommendedGuideline = (guideline: string) => {
    if (!guidelinesList.includes(guideline)) {
      setGuidelinesList([...guidelinesList, guideline]);
    }
  };

  const switchMode = (mode: 'text' | 'chips') => {
    if (mode === 'text' && editMode === 'chips') {
      // 칩 모드에서 텍스트 모드로 전환
      setGuidelines(guidelinesList.join('\n\n'));
    } else if (mode === 'chips' && editMode === 'text') {
      // 텍스트 모드에서 칩 모드로 전환
      setGuidelinesList(guidelines ? guidelines.split('\n').filter(line => line.trim()) : []);
    }
    setEditMode(mode);
    // 모드 전환 시 편집 상태 초기화
    setEditingIndex(null);
    setEditingText('');
  };

  const startEditGuideline = (index: number) => {
    setEditingIndex(index);
    setEditingText(guidelinesList[index]);
  };

  const saveEditGuideline = () => {
    if (editingIndex !== null && editingText.trim()) {
      // 중복 체크 (현재 편집 중인 항목 제외)
      const isDuplicate = guidelinesList.some((guideline, index) => 
        index !== editingIndex && guideline === editingText.trim()
      );
      
      if (!isDuplicate) {
        const updatedList = [...guidelinesList];
        updatedList[editingIndex] = editingText.trim();
        setGuidelinesList(updatedList);
        setEditingIndex(null);
        setEditingText('');
      }
    }
  };

  const cancelEditGuideline = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditGuideline();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditGuideline();
    }
  };

  return (
    <>
      {/* 오버레이 */}
      <div 
        className="fixed inset-0 z-50 bg-black/30"
        onClick={handleCancel}
      />
      
      {/* 모달 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-background border border-border rounded-lg shadow-2xl max-h-[80vh] flex flex-col">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="font-medium">프로젝트 지침</h2>
                
                {/* 모드 전환 버튼 */}
                <div className="flex bg-muted rounded-lg p-1">
                  <button
                    onClick={() => switchMode('chips')}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      editMode === 'chips' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    항목별
                  </button>
                  <button
                    onClick={() => switchMode('text')}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      editMode === 'text' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    텍스트
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                어시스턴트가 더 잘 도울 수 있게, 아래 중 필요한 것만 편하게 적어주세요. (옵션)
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 콘텐츠 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {editMode === 'chips' ? (
                <>
                  {/* 항목별 지침 관리 */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">지침 항목</label>
                    
                    {/* 새 지침 추가 */}
                    <div className="flex gap-2">
                      <Input
                        value={newGuideline}
                        onChange={(e) => setNewGuideline(e.target.value)}
                        placeholder="새 지침을 입력하세요"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addGuideline();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={addGuideline}
                        size="icon"
                        variant="outline"
                        disabled={!newGuideline.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* 추천 지침 */}
                    {recommendedGuidelines.some(rg => !guidelinesList.includes(rg)) && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">추천 지침</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recommendedGuidelines
                            .filter(rg => !guidelinesList.includes(rg))
                            .map((guideline, index) => (
                              <button
                                key={index}
                                onClick={() => addRecommendedGuideline(guideline)}
                                className="px-2 py-1 text-xs bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md border border-border/50 hover:border-border transition-colors"
                              >
                                + {guideline}
                              </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 현재 지침 목록 */}
                    {guidelinesList.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">현재 지침 ({guidelinesList.length}개)</p>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin">
                          {guidelinesList.map((guideline, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border/50 group"
                            >
                              {editingIndex === index ? (
                                <>
                                  {/* 편집 모드 */}
                                  <Input
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    onKeyDown={handleEditKeyDown}
                                    className="flex-1 text-sm bg-background"
                                    autoFocus
                                  />
                                  <div className="flex gap-1 flex-shrink-0">
                                    <button
                                      onClick={saveEditGuideline}
                                      className="text-green-600 hover:text-green-700 transition-colors"
                                      disabled={!editingText.trim() || editingText.trim() === guideline}
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={cancelEditGuideline}
                                      className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      <XIcon className="w-3 h-3" />
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  {/* 보기 모드 */}
                                  <span className="flex-1 text-sm leading-relaxed">
                                    {guideline}
                                  </span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                                    <button
                                      onClick={() => startEditGuideline(index)}
                                      className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => removeGuideline(index)}
                                      className="text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* 텍스트 모드 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">지침 내용</label>
                    <Textarea
                      value={guidelines}
                      onChange={(e) => setGuidelines(e.target.value)}
                      placeholder="핵심 먼저, 필요하면 자세히 풀어주세요.&#10;&#10;어려운 용어는 쉬운 말로 함께 설명해주세요.&#10;&#10;코드는 바로 실행 가능한 최소 예제로 보여주세요.&#10;&#10;확실하지 않은 건 추정 말고 확인 질문을 주세요.&#10;&#10;지침 사항을 조금씩 나누어 전달주면 맥락이 오래가요."
                      className="min-h-[240px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {guidelines.length} / 2000자
                    </p>
                  </div>
                </>
              )}

              {/* 참고사항 */}
              <div className="mt-6 p-3 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex gap-2 mb-2">
                  <Info className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-medium text-muted-foreground">참고사항</p>
                </div>
                <div className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                  <div>
                    <span className="font-medium text-foreground">목표와 범위:</span> 해도 되는 것 / 하지 말아야 하는 것
                  </div>
                  <div>
                    <span className="font-medium text-foreground">배경 정보:</span> 대상 사용자, 상황, 참고 자료
                  </div>
                  <div>
                    <span className="font-medium text-foreground">원하는 말투·형식:</span> 예) 3문장 요약, 불릿, 코드 포함 등
                  </div>
                  <div>
                    <span className="font-medium text-foreground">추가 요청:</span> 마감, 분량, 금지어 등
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleCancel}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
            >
              저장
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}