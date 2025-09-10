import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  X, 
  Upload, 
  FileText, 
  Image, 
  File, 
  Cloud, 
  Paperclip,
  Plus,
  Check,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface FileAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileAttach?: (files: File[]) => void;
  onTextAttach?: (title: string, content: string) => void;
  onDriveConnect?: () => void;
  onConnectorFileSelect?: (connector: string, files: any[]) => void;
}

export function FileAttachmentModal({ 
  isOpen, 
  onClose, 
  onFileAttach, 
  onTextAttach, 
  onDriveConnect,
  onConnectorFileSelect 
}: FileAttachmentModalProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'text' | 'connectors' | 'drive'>('file');
  const [dragOver, setDragOver] = useState(false);
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // 커넥터 상태 (실제로는 설정에서 가져와야 함)
  const [connectorStatus] = useState<Record<string, boolean>>({
    'gdrive': true,
    'gmail': true,
    'gdocs': false,
    'notion': false,
    'slack': false
  });

  if (!isOpen) return null;

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      // 10MB 제한
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}은 10MB를 초과합니다.`);
        return false;
      }
      return true;
    });

    setAttachedFiles(prev => [...prev, ...validFiles]);
    
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length}개 파일이 추가되었습니다.`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleTextSave = () => {
    if (!textTitle.trim() || !textContent.trim()) {
      toast.error('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    onTextAttach?.(textTitle, textContent);
    setTextTitle('');
    setTextContent('');
    toast.success('텍스트가 첨부되었습니다.');
    onClose();
  };

  const handleFileAttach = () => {
    if (attachedFiles.length === 0) {
      toast.error('첨부할 파일을 선택해주세요.');
      return;
    }
    
    onFileAttach?.(attachedFiles);
    setAttachedFiles([]);
    toast.success('파일이 첨부되었습니다.');
    onClose();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.includes('text') || file.name.endsWith('.txt')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]" 
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-2xl bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
              <Paperclip className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">첨부하기</h2>
              <p className="text-sm text-muted-foreground">파일, 텍스트, 클라우드 서비스 연결</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-xl hover:bg-muted/50"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-border/30 bg-muted/20">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'file'
                ? 'text-primary border-b-2 border-primary bg-background/50'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              파일 업로드
            </div>
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'text'
                ? 'text-primary border-b-2 border-primary bg-background/50'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              텍스트 추가
            </div>
          </button>
          <button
            onClick={() => setActiveTab('connectors')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'connectors'
                ? 'text-primary border-b-2 border-primary bg-background/50'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              커넥터
            </div>
          </button>
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'drive'
                ? 'text-primary border-b-2 border-primary bg-background/50'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Cloud className="w-4 h-4" />
              클라우드 연결
            </div>
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6">
          {/* 파일 업로드 탭 */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              {/* 드래그 앤 드롭 영역 */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragOver
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-border/50 hover:border-border'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">파일을 드래그하여 업로드</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  또는 아래 버튼을 클릭하여 파일을 선택하세요
                </p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,.txt,.pdf,.doc,.docx,.json"
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="mb-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  파일 선택
                </Button>
                <p className="text-xs text-muted-foreground">
                  지원 형식: 이미지, 텍스트, PDF, 문서 (최대 10MB)
                </p>
              </div>

              {/* 첨부된 파일 목록 */}
              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>첨부된 파일 ({attachedFiles.length}개)</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file)}
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  취소
                </Button>
                <Button onClick={handleFileAttach} disabled={attachedFiles.length === 0}>
                  <Check className="w-4 h-4 mr-2" />
                  첨부하기
                </Button>
              </div>
            </div>
          )}

          {/* 텍스트 추가 탭 */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-medium">텍스트 내용 추가</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="text-title">제목</Label>
                  <Input
                    id="text-title"
                    placeholder="텍스트 제목을 입력하세요"
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="text-content">내용</Label>
                  <Textarea
                    id="text-content"
                    placeholder="장문의 텍스트나 참고 자료를 붙여넣으세요..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="mt-1 min-h-[200px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {textContent.length} 문자 / 제한 없음
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">활용 팁</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• 긴 문서나 참고 자료를 미리 입력해두고 참조할 수 있습니다</li>
                      <li>• 반복적으로 사용하는 템플릿이나 가이드라인 저장에 유용합니다</li>
                      <li>• AI가 해당 내용을 맥락으로 활용하여 더 정확한 답변을 제공합니다</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  취소
                </Button>
                <Button onClick={handleTextSave} disabled={!textTitle.trim() || !textContent.trim()}>
                  <Check className="w-4 h-4 mr-2" />
                  추가하기
                </Button>
              </div>
            </div>
          )}

          {/* 커넥터 탭 */}
          {activeTab === 'connectors' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-primary" />
                <h3 className="font-medium">연결된 서비스에서 가져오기</h3>
              </div>

              {/* 연결된 서비스들 */}
              <div className="space-y-3">
                {/* Google Drive */}
                {connectorStatus.gdrive && (
                  <div className="p-4 border border-border/50 rounded-xl hover:border-border transition-colors bg-card/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                            <path d="M12.01 2L5.68 10.09H11.05L17.38 2H12.01Z" fill="currentColor"/>
                            <path d="M5.68 10.09L2 15.91H7.37L11.05 10.09H5.68Z" fill="currentColor"/>
                            <path d="M11.05 10.09L7.37 15.91H18.32L22 10.09H11.05Z" fill="currentColor"/>
                            <path d="M18.32 15.91L12.01 22L22 15.91H18.32Z" fill="currentColor"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Google Drive</h4>
                          <p className="text-sm text-muted-foreground">파일과 폴더에서 선택</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          // 임시 목업 데이터
                          const mockFiles = [
                            { id: '1', name: 'Project_Plan.pdf', type: 'application/pdf', size: '2.5MB' },
                            { id: '2', name: 'Meeting_Notes.docx', type: 'application/docx', size: '1.2MB' },
                            { id: '3', name: 'Budget_2024.xlsx', type: 'application/xlsx', size: '890KB' }
                          ];
                          onConnectorFileSelect?.('gdrive', mockFiles);
                          toast.success('Google Drive에서 파일을 가져왔습니다.');
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        파일 선택
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      마지막 동기화: 2분 전 • 연결됨
                    </div>
                  </div>
                )}

                {/* Gmail */}
                {connectorStatus.gmail && (
                  <div className="p-4 border border-border/50 rounded-xl hover:border-border transition-colors bg-card/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819l6.545 4.91 6.545-4.91h3.819A1.636 1.636 0 0 1 24 5.457z"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Gmail</h4>
                          <p className="text-sm text-muted-foreground">이메일과 첨부파일에서 선택</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          // 임시 목업 데이터
                          const mockEmails = [
                            { id: '1', subject: '회의 자료', attachments: ['slides.pptx'], date: '2024-01-10' },
                            { id: '2', subject: '분기별 보고서', attachments: ['report_Q4.pdf'], date: '2024-01-09' },
                            { id: '3', subject: '계약서 검토', attachments: ['contract.docx'], date: '2024-01-08' }
                          ];
                          onConnectorFileSelect?.('gmail', mockEmails);
                          toast.success('Gmail에서 이메일을 가져왔습니다.');
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        이메일 선택
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      마지막 동기화: 5분 전 • 연결됨
                    </div>
                  </div>
                )}

                {/* 연결되지 않은 서비스들 */}
                {!connectorStatus.gdocs && (
                  <div className="p-4 border border-border/50 rounded-xl bg-muted/10 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-muted-foreground">Google 문서</h4>
                          <p className="text-sm text-muted-foreground">연결되지 않음</p>
                        </div>
                      </div>
                      <Button variant="outline" disabled>
                        연결 필요
                      </Button>
                    </div>
                  </div>
                )}

                {!connectorStatus.notion && (
                  <div className="p-4 border border-border/50 rounded-xl bg-muted/10 opacity-40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.934zm14.337.748c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933l3.269-.186z"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-muted-foreground">Notion</h4>
                          <p className="text-sm text-muted-foreground">곧 지원 예정</p>
                        </div>
                      </div>
                      <Badge variant="secondary">개발 중</Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* 안내 문구 */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">커넥터 사용 팁</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• 설정에서 서비스를 먼저 연결하면 여기서 바로 파일을 가져올 수 있습니다</li>
                      <li>• 연결된 서비스의 파일들은 실시간으로 동기화됩니다</li>
                      <li>• 각 서비스별로 권한 관리가 별도로 가능합니다</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 클라우드 연결 탭 */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Cloud className="w-5 h-5 text-primary" />
                <h3 className="font-medium">클라우드 서비스 연결</h3>
              </div>

              <div className="space-y-3">
                {/* Google Drive */}
                <div className="p-4 border border-border/50 rounded-xl hover:border-border transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                          <path d="M12.01 2L5.68 10.09H11.05L17.38 2H12.01Z" fill="#4285F4"/>
                          <path d="M5.68 10.09L2 15.91H7.37L11.05 10.09H5.68Z" fill="#34A853"/>
                          <path d="M11.05 10.09L7.37 15.91H18.32L22 10.09H11.05Z" fill="#FBBC05"/>
                          <path d="M18.32 15.91L12.01 22L22 15.91H18.32Z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Google Drive</h4>
                        <p className="text-sm text-muted-foreground">
                          드라이브의 문서와 파일에 접근
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        onDriveConnect?.();
                        toast.info('Google Drive 연결 기능을 곧 지원할 예정입니다.');
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      연결하기
                    </Button>
                  </div>
                </div>

                {/* OneDrive */}
                <div className="p-4 border border-border/50 rounded-xl hover:border-border transition-colors opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0078D4">
                          <path d="M17.5 2.5C15.8 2.5 14.4 3.9 14.4 5.6C14.4 5.7 14.4 5.8 14.4 5.9C13.5 4.7 12.1 4 10.5 4C7.5 4 5 6.5 5 9.5C5 9.8 5 10.1 5.1 10.4C3.4 11.1 2.2 12.8 2.2 14.8C2.2 17.4 4.3 19.5 6.9 19.5H17.5C20.5 19.5 23 17 23 14S20.5 8.5 17.5 8.5C17.5 8.5 17.5 8.5 17.5 8.5C17.5 5.5 17.5 2.5 17.5 2.5Z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Microsoft OneDrive</h4>
                        <p className="text-sm text-muted-foreground">
                          OneDrive 파일 및 Office 문서 접근
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">곧 지원</Badge>
                  </div>
                </div>

                {/* Dropbox */}
                <div className="p-4 border border-border/50 rounded-xl hover:border-border transition-colors opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0061FF">
                          <path d="M6 2L12 6L6 10L0 6L6 2ZM18 2L24 6L18 10L12 6L18 2ZM0 14L6 10L12 14L6 18L0 14ZM12 14L18 10L24 14L18 18L12 14ZM6 22L12 18L18 22L12 26L6 22Z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Dropbox</h4>
                        <p className="text-sm text-muted-foreground">
                          Dropbox 폴더 및 파일 접근
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">곧 지원</Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">개발 중인 기능</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      클라우드 서비스 연결 기능은 현재 개발 중입니다. 
                      곧 Google Drive를 시작으로 다양한 클라우드 서비스를 지원할 예정입니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}