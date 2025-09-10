/**
 * 캔버스 뷰어
 * 
 * Claude Articles와 유사한 문서 아티팩트 뷰어
 * - Markdown/JSON 기반 문서 렌더링
 * - 문서 편집 및 버전 관리
 * - 내보내기 및 공유 기능
 * - 대화와 분리된 문서 보관함
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { toast } from "sonner";
import { ImageWithFallback } from './figma/ImageWithFallback';

// 문서 타입 정의
export interface DocumentSection {
  h: string;              // 헤더
  body: string;           // 본문 (Markdown)
  figure?: {              // 선택적 이미지/차트
    url: string;
    caption?: string;
    type?: 'image' | 'chart' | 'diagram';
  };
}

export interface DocumentArtifact {
  id: string;
  type: 'doc';
  title: string;
  sections: DocumentSection[];
  meta: {
    source: 'web' | 'user' | 'ai';
    tags: string[];
    model?: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface CanvasViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document?: DocumentArtifact;
  documents: DocumentArtifact[];
  onDocumentSave: (doc: DocumentArtifact) => void;
  onDocumentDelete: (docId: string) => void;
  onDocumentDuplicate: (docId: string) => void;
  currentChatId?: string;
}

// 문서 템플릿
const DOCUMENT_TEMPLATES = [
  {
    id: 'report',
    name: '보고서',
    icon: '📄',
    sections: [
      { h: '요약', body: '이 문서의 주요 내용을 요약합니다.' },
      { h: '배경', body: '배경 정보와 컨텍스트를 설명합니다.' },
      { h: '분석', body: '데이터 분석 및 주요 발견사항을 제시합니다.' },
      { h: '결론', body: '결론 및 권장사항을 제시합니다.' }
    ]
  },
  {
    id: 'meeting',
    name: '회의록',
    icon: '📝',
    sections: [
      { h: '회의 정보', body: '일시, 참석자, 장소 등 회의 기본 정보' },
      { h: '안건', body: '주요 논의 안건들' },
      { h: '결정사항', body: '회의에서 결정된 사항들' },
      { h: '액션 아이템', body: '후속 조치가 필요한 항목들' }
    ]
  },
  {
    id: 'research',
    name: '연구 노트',
    icon: '🔬',
    sections: [
      { h: '연구 질문', body: '해결하고자 하는 연구 질문' },
      { h: '방법론', body: '사용된 연구 방법과 접근법' },
      { h: '데이터', body: '수집된 데이터와 관찰 결과' },
      { h: '인사이트', body: '도출된 인사이트와 시사점' }
    ]
  }
];

export function CanvasViewer({ 
  isOpen, 
  onClose, 
  document: initialDocument, 
  documents, 
  onDocumentSave,
  onDocumentDelete,
  onDocumentDuplicate,
  currentChatId 
}: CanvasViewerProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'library'>('editor');
  const [currentDocument, setCurrentDocument] = useState<DocumentArtifact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  // 초기 문서 설정
  useEffect(() => {
    if (initialDocument) {
      setCurrentDocument(initialDocument);
      setSelectedDocumentId(initialDocument.id);
      setActiveTab('editor');
    } else if (documents.length > 0) {
      setCurrentDocument(documents[0]);
      setSelectedDocumentId(documents[0].id);
      setActiveTab('library');
    }
  }, [initialDocument, documents]);

  // 새 문서 생성
  const createNewDocument = (template?: typeof DOCUMENT_TEMPLATES[0]) => {
    const newDoc: DocumentArtifact = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'doc',
      title: template ? `새 ${template.name}` : '새 문서',
      sections: template ? template.sections : [
        { h: '제목', body: '여기에 내용을 작성하세요.' }
      ],
      meta: {
        source: 'user',
        tags: [],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    setCurrentDocument(newDoc);
    setSelectedDocumentId(newDoc.id);
    setIsEditing(true);
    setActiveTab('editor');
  };

  // 문서 저장
  const handleSaveDocument = () => {
    if (!currentDocument) return;

    const updatedDoc = {
      ...currentDocument,
      meta: {
        ...currentDocument.meta,
        updatedAt: new Date(),
        version: currentDocument.meta.version + 1
      }
    };

    onDocumentSave(updatedDoc);
    setCurrentDocument(updatedDoc);
    setIsEditing(false);
    toast.success('문서가 저장되었습니다.');
  };

  // 섹션 업데이트
  const updateSection = (index: number, field: 'h' | 'body', value: string) => {
    if (!currentDocument) return;

    const updatedSections = [...currentDocument.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value
    };

    setCurrentDocument({
      ...currentDocument,
      sections: updatedSections
    });
  };

  // 섹션 추가
  const addSection = () => {
    if (!currentDocument) return;

    const newSection: DocumentSection = {
      h: '새 섹션',
      body: '내용을 입력하세요.'
    };

    setCurrentDocument({
      ...currentDocument,
      sections: [...currentDocument.sections, newSection]
    });
  };

  // 섹션 삭제
  const removeSection = (index: number) => {
    if (!currentDocument || currentDocument.sections.length <= 1) return;

    const updatedSections = currentDocument.sections.filter((_, i) => i !== index);
    setCurrentDocument({
      ...currentDocument,
      sections: updatedSections
    });
  };

  // 문서 내보내기
  const exportDocument = (format: 'md' | 'json' | 'pdf') => {
    if (!currentDocument) return;

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'md':
        content = `# ${currentDocument.title}\n\n`;
        content += currentDocument.sections.map(section => 
          `## ${section.h}\n\n${section.body}\n\n`
        ).join('');
        filename = `${currentDocument.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        mimeType = 'text/markdown';
        break;

      case 'json':
        content = JSON.stringify(currentDocument, null, 2);
        filename = `${currentDocument.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        mimeType = 'application/json';
        break;

      case 'pdf':
        // PDF 내보내기는 추후 구현 (html2pdf 등 라이브러리 필요)
        toast.info('PDF 내보내기는 곧 지원할 예정입니다.');
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`문서가 ${format.toUpperCase()} 형식으로 내보내기되었습니다.`);
  };

  // 문서 복제
  const duplicateDocument = () => {
    if (!currentDocument) return;

    const duplicatedDoc: DocumentArtifact = {
      ...currentDocument,
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `${currentDocument.title} (복사본)`,
      meta: {
        ...currentDocument.meta,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    onDocumentDuplicate(duplicatedDoc.id);
    setCurrentDocument(duplicatedDoc);
    setSelectedDocumentId(duplicatedDoc.id);
    toast.success('문서가 복제되었습니다.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              📋 캔버스 뷰어
              {currentDocument && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-base font-normal">{currentDocument.title}</span>
                  <Badge variant="outline">v{currentDocument.meta.version}</Badge>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {currentDocument && (
                <>
                  {isEditing ? (
                    <>
                      <Button onClick={handleSaveDocument} size="sm">
                        저장
                      </Button>
                      <Button 
                        onClick={() => setIsEditing(false)} 
                        variant="outline" 
                        size="sm"
                      >
                        취소
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} size="sm">
                      편집
                    </Button>
                  )}
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor">편집기</TabsTrigger>
            <TabsTrigger value="preview">미리보기</TabsTrigger>
            <TabsTrigger value="library">문서함</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            {currentDocument ? (
              <div className="space-y-6">
                {/* 문서 제목 */}
                <div className="space-y-2">
                  <Label>문서 제목</Label>
                  {isEditing ? (
                    <Input
                      value={currentDocument.title}
                      onChange={(e) => setCurrentDocument({
                        ...currentDocument,
                        title: e.target.value
                      })}
                      className="text-lg font-medium"
                    />
                  ) : (
                    <h1 className="text-lg font-medium">{currentDocument.title}</h1>
                  )}
                </div>

                {/* 문서 섹션들 */}
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4 pr-4">
                    {currentDocument.sections.map((section, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            {isEditing ? (
                              <Input
                                value={section.h}
                                onChange={(e) => updateSection(index, 'h', e.target.value)}
                                className="font-medium"
                                placeholder="섹션 제목"
                              />
                            ) : (
                              <CardTitle className="text-base">{section.h}</CardTitle>
                            )}
                            
                            {isEditing && (
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => removeSection(index)}
                                  variant="ghost"
                                  size="sm"
                                  disabled={currentDocument.sections.length <= 1}
                                >
                                  삭제
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {isEditing ? (
                            <Textarea
                              value={section.body}
                              onChange={(e) => updateSection(index, 'body', e.target.value)}
                              placeholder="내용을 입력하세요..."
                              rows={4}
                              className="resize-none"
                            />
                          ) : (
                            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                              {section.body}
                            </div>
                          )}
                          
                          {section.figure && (
                            <div className="mt-4">
                              <ImageWithFallback
                                src={section.figure.url}
                                alt={section.figure.caption || '첨부 이미지'}
                                className="max-w-full h-auto rounded border"
                              />
                              {section.figure.caption && (
                                <p className="text-xs text-muted-foreground mt-1 text-center">
                                  {section.figure.caption}
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {isEditing && (
                      <Button
                        onClick={addSection}
                        variant="outline"
                        className="w-full border-dashed"
                      >
                        + 섹션 추가
                      </Button>
                    )}
                  </div>
                </ScrollArea>

                {/* 문서 메타데이터 */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Badge variant="outline">
                    {currentDocument.meta.source}
                  </Badge>
                  <Badge variant="outline">
                    {new Date(currentDocument.meta.updatedAt).toLocaleDateString()}
                  </Badge>
                  {currentDocument.meta.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground">문서를 선택하거나 새로 만들어주세요.</p>
                
                <div className="space-y-3">
                  <Button onClick={() => createNewDocument()}>
                    새 문서 만들기
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">또는 템플릿 선택:</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {DOCUMENT_TEMPLATES.map((template) => (
                      <Button
                        key={template.id}
                        onClick={() => createNewDocument(template)}
                        variant="outline"
                        size="sm"
                      >
                        {template.icon} {template.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {currentDocument ? (
              <div className="space-y-6">
                <div className="text-center border-b pb-4">
                  <h1 className="text-2xl font-bold">{currentDocument.title}</h1>
                  <p className="text-sm text-muted-foreground mt-2">
                    v{currentDocument.meta.version} • {new Date(currentDocument.meta.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <ScrollArea className="h-[500px]">
                  <div className="space-y-6 pr-4">
                    {currentDocument.sections.map((section, index) => (
                      <div key={index} className="space-y-3">
                        <h2 className="text-lg font-semibold border-b pb-1">
                          {section.h}
                        </h2>
                        <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                          {section.body}
                        </div>
                        
                        {section.figure && (
                          <div className="flex justify-center">
                            <div className="text-center">
                              <ImageWithFallback
                                src={section.figure.url}
                                alt={section.figure.caption || '첨부 이미지'}
                                className="max-w-full h-auto rounded border"
                              />
                              {section.figure.caption && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {section.figure.caption}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={() => exportDocument('md')} variant="outline" size="sm">
                    Markdown 내보내기
                  </Button>
                  <Button onClick={() => exportDocument('json')} variant="outline" size="sm">
                    JSON 내보내기
                  </Button>
                  <Button onClick={() => exportDocument('pdf')} variant="outline" size="sm">
                    PDF 내보내기
                  </Button>
                  <Button onClick={duplicateDocument} variant="outline" size="sm">
                    복제
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">미리볼 문서가 없습니다.</p>
                <Button
                  onClick={() => setActiveTab('editor')}
                  variant="outline"
                  className="mt-4"
                >
                  문서 만들기
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="library" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">문서 보관함</h3>
              <Button onClick={() => createNewDocument()} size="sm">
                새 문서
              </Button>
            </div>

            {documents.length > 0 ? (
              <ScrollArea className="h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                  {documents.map((doc) => (
                    <Card 
                      key={doc.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedDocumentId === doc.id ? 'ring-2 ring-primary' : 'hover:bg-accent'
                      }`}
                      onClick={() => {
                        setCurrentDocument(doc);
                        setSelectedDocumentId(doc.id);
                        setActiveTab('editor');
                      }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm line-clamp-1">
                            {doc.title}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            v{doc.meta.version}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">
                          {doc.sections.length}개 섹션 • {new Date(doc.meta.updatedAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {doc.sections[0]?.body || '내용 없음'}
                        </p>
                        
                        <div className="flex gap-1 mt-2">
                          <Badge variant={doc.meta.source === 'ai' ? 'default' : 'secondary'} className="text-xs">
                            {doc.meta.source}
                          </Badge>
                          {doc.meta.tags.slice(0, 2).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">저장된 문서가 없습니다.</p>
                <div className="space-y-2 mt-4">
                  <Button onClick={() => createNewDocument()}>
                    첫 번째 문서 만들기
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    AI와의 대화에서 문서 형식의 답변을 받으면 자동으로 여기에 저장됩니다.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}