import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from './ui/dialog';
import { 
  Download,
  Upload,
  FileText,
  FolderOpen,
  Copy,
  Check,
  X,
  AlertCircle,
  Package,
  Settings,
  MessageSquare,
  User,
  Clock
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { toast } from "sonner@2.0.3";

interface ChatBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: any[];
  roles: any[];
  projects: any[];
  onImportBackup: (backupData: ChatBackupData) => void;
  selectedChatId?: string;
}

interface ChatBackupData {
  version: string;
  exportedAt: string;
  type: 'single' | 'multiple' | 'project';
  data: {
    conversations: any[];
    roles: any[];
    projects?: any[];
    chatDrawerSettings?: any;
    metadata: {
      totalChats: number;
      exportedBy: string;
      originalAppVersion: string;
    };
  };
}

export function ChatBackupModal({ 
  isOpen, 
  onClose, 
  conversations, 
  roles, 
  projects, 
  onImportBackup,
  selectedChatId 
}: ChatBackupModalProps) {
  const [importData, setImportData] = useState('');
  const [backupType, setBackupType] = useState<'single' | 'multiple' | 'project'>('single');
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isValidJson, setIsValidJson] = useState(true);
  const [previewData, setPreviewData] = useState<ChatBackupData | null>(null);

  // 단일 대화창 백업 생성
  const createSingleChatBackup = (chatId: string): ChatBackupData => {
    const conversation = conversations.find(c => c.id === chatId);
    if (!conversation) throw new Error('대화창을 찾을 수 없습니다.');

    const relatedRole = roles.find(r => r.id === conversation.roleId);
    const relatedProject = conversation.projectId ? projects.find(p => p.id === conversation.projectId) : null;

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      type: 'single',
      data: {
        conversations: [conversation],
        roles: relatedRole ? [relatedRole] : [],
        projects: relatedProject ? [relatedProject] : [],
        chatDrawerSettings: {
          // TODO: SimpleChatDrawer 설정이 있다면 여기에 추가
          mode: 'standard', // 기본값
          customSettings: {}
        },
        metadata: {
          totalChats: 1,
          exportedBy: 'Role GPT User',
          originalAppVersion: '1.0.0'
        }
      }
    };
  };

  // 다중 대화창 백업 생성
  const createMultipleChatBackup = (chatIds: string[]): ChatBackupData => {
    const selectedConversations = conversations.filter(c => chatIds.includes(c.id));
    const relatedRoleIds = [...new Set(selectedConversations.map(c => c.roleId))];
    const relatedRoles = roles.filter(r => relatedRoleIds.includes(r.id));
    const relatedProjectIds = [...new Set(selectedConversations.map(c => c.projectId).filter(Boolean))];
    const relatedProjects = projects.filter(p => relatedProjectIds.includes(p.id));

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      type: 'multiple',
      data: {
        conversations: selectedConversations,
        roles: relatedRoles,
        projects: relatedProjects,
        metadata: {
          totalChats: selectedConversations.length,
          exportedBy: 'Role GPT User',
          originalAppVersion: '1.0.0'
        }
      }
    };
  };

  // 프로젝트 백업 생성
  const createProjectBackup = (projectId: string): ChatBackupData => {
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('프로젝트를 찾을 수 없습니다.');

    const projectConversations = conversations.filter(c => c.projectId === projectId);
    const relatedRoleIds = [...new Set(projectConversations.map(c => c.roleId))];
    const relatedRoles = roles.filter(r => relatedRoleIds.includes(r.id));

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      type: 'project',
      data: {
        conversations: projectConversations,
        roles: relatedRoles,
        projects: [project],
        metadata: {
          totalChats: projectConversations.length,
          exportedBy: 'Role GPT User',
          originalAppVersion: '1.0.0'
        }
      }
    };
  };

  // 백업 내보내기
  const handleExportBackup = () => {
    try {
      let backupData: ChatBackupData;

      switch (backupType) {
        case 'single':
          if (!selectedChatId) {
            toast.error('내보낼 대화창을 선택해주세요.');
            return;
          }
          backupData = createSingleChatBackup(selectedChatId);
          break;
        
        case 'multiple':
          if (selectedChats.length === 0) {
            toast.error('내보낼 대화창들을 선택해주세요.');
            return;
          }
          backupData = createMultipleChatBackup(selectedChats);
          break;
        
        case 'project':
          if (!selectedProjectId) {
            toast.error('내보낼 프로젝트를 선택해주세요.');
            return;
          }
          backupData = createProjectBackup(selectedProjectId);
          break;
        
        default:
          throw new Error('올바르지 않은 백업 타입입니다.');
      }

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `rolegpt-backup-${backupType}-${timestamp}.json`;
      link.download = fileName;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('백업이 성공적으로 내보내기 되었습니다.');
      
    } catch (error) {
      console.error('백업 내보내기 실패:', error);
      toast.error('백업 내보내기에 실패했습니다: ' + (error as Error).message);
    }
  };

  // JSON 유효성 검사 및 미리보기
  const handleImportDataChange = (value: string) => {
    setImportData(value);
    
    if (!value.trim()) {
      setIsValidJson(true);
      setPreviewData(null);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      setIsValidJson(true);
      setPreviewData(parsed);
    } catch (error) {
      setIsValidJson(false);
      setPreviewData(null);
    }
  };

  // 백업 가져오기
  const handleImportBackup = () => {
    if (!previewData) {
      toast.error('유효한 백업 데이터를 입력해주세요.');
      return;
    }

    try {
      onImportBackup(previewData);
      toast.success('백업이 성공적으로 가져오기 되었습니다.');
      setImportData('');
      setPreviewData(null);
      onClose();
    } catch (error) {
      console.error('백업 가져오기 실패:', error);
      toast.error('백업 가져오기에 실패했습니다: ' + (error as Error).message);
    }
  };

  // 파일에서 가져오기
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleImportDataChange(content);
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">데이터 내보내기 & 가져오기</DialogTitle>
                <DialogDescription>
                  대화창, 프로젝트, 설정을 안전하게 백업하고 복원하세요
                </DialogDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 rounded-md p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          <Tabs defaultValue="export" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                내보내기
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                가져오기
              </TabsTrigger>
            </TabsList>

            {/* 내보내기 탭 */}
            <TabsContent value="export" className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">내보내기 유형 선택</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant={backupType === 'single' ? 'default' : 'outline'}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setBackupType('single')}
                  >
                    <MessageSquare className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium">대화창 내보내기</div>
                      <div className="text-xs text-muted-foreground">설정과 메시지 모두 포함</div>
                    </div>
                  </Button>

                  <Button
                    variant={backupType === 'multiple' ? 'default' : 'outline'}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setBackupType('multiple')}
                  >
                    <Copy className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium">여러 대화창</div>
                      <div className="text-xs text-muted-foreground">선택한 대화창들 일괄 내보내기</div>
                    </div>
                  </Button>

                  <Button
                    variant={backupType === 'project' ? 'default' : 'outline'}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setBackupType('project')}
                  >
                    <FolderOpen className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium">프로젝트 내보내기</div>
                      <div className="text-xs text-muted-foreground">프로젝트와 모든 대화창</div>
                    </div>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* 백업 대상 선택 */}
              {backupType === 'single' && selectedChatId && (
                <div className="space-y-3">
                  <Label>백업할 대화창</Label>
                  <div className="border rounded-lg p-4 bg-muted/20">
                    {(() => {
                      const chat = conversations.find(c => c.id === selectedChatId);
                      const role = chat ? roles.find(r => r.id === chat.roleId) : null;
                      return chat ? (
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-5 h-5 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">{chat.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Role: {role?.name || '기본'} • 메시지 {chat.messages.length}개
                            </div>
                          </div>
                          <Badge variant="outline">{new Date(chat.createdAt).toLocaleDateString()}</Badge>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">선택된 대화창이 없습니다.</div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {backupType === 'multiple' && (
                <div className="space-y-3">
                  <Label>백업할 대화창들 선택</Label>
                  <ScrollArea className="h-64 border rounded-lg">
                    <div className="p-4 space-y-2">
                      {conversations.map((chat) => {
                        const role = roles.find(r => r.id === chat.roleId);
                        const isSelected = selectedChats.includes(chat.id);
                        return (
                          <div
                            key={chat.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected ? 'bg-primary/10 border-primary' : 'bg-muted/20 hover:bg-muted/40'
                            }`}
                            onClick={() => {
                              setSelectedChats(prev => 
                                isSelected 
                                  ? prev.filter(id => id !== chat.id)
                                  : [...prev, chat.id]
                              );
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                              </div>
                              <MessageSquare className="w-4 h-4 text-muted-foreground" />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{chat.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {role?.name || '기본'} • {chat.messages.length}개 메시지
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {new Date(chat.createdAt).toLocaleDateString()}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  {selectedChats.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {selectedChats.length}개 대화창이 선택되었습니다.
                    </div>
                  )}
                </div>
              )}

              {backupType === 'project' && (
                <div className="space-y-3">
                  <Label>백업할 프로젝트 선택</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {projects.map((project) => {
                      const projectChats = conversations.filter(c => c.projectId === project.id);
                      const isSelected = selectedProjectId === project.id;
                      return (
                        <div
                          key={project.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary/10 border-primary' : 'bg-muted/20 hover:bg-muted/40'
                          }`}
                          onClick={() => setSelectedProjectId(isSelected ? '' : project.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <FolderOpen className="w-5 h-5 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="font-medium">{project.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {projectChats.length}개 대화창 포함
                              </div>
                            </div>
                            <Badge variant="outline">
                              {new Date(project.createdAt).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleExportBackup} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  선택한 항목 내보내기
                </Button>
              </div>
            </TabsContent>

            {/* 가져오기 탭 */}
            <TabsContent value="import" className="space-y-6">
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Upload className="w-4 h-4" />
                    가져오기 안내
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• <strong>대화만 가져오기:</strong> 메시지 내용만 복원됩니다</p>
                    <p>• <strong>대화창 가져오기:</strong> Role, 설정, 프로젝트 정보까지 모두 복원됩니다</p>
                    <p>• 기존 데이터와 중복되는 경우 자동으로 "(가져옴)" 표시가 추가됩니다</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backup-file">파일에서 가져오기</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="backup-file"
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={() => {
                      const input = document.getElementById('backup-file') as HTMLInputElement;
                      if (input) input.value = '';
                      setImportData('');
                      setPreviewData(null);
                    }}>
                      초기화
                    </Button>
                  </div>
                </div>

                <div className="text-center text-muted-foreground">또는</div>

                <div className="space-y-2">
                  <Label htmlFor="backup-text">JSON 텍스트 직접 입력</Label>
                  <Textarea
                    id="backup-text"
                    placeholder="백업 JSON 데이터를 붙여넣기하세요..."
                    value={importData}
                    onChange={(e) => handleImportDataChange(e.target.value)}
                    rows={8}
                    className={`font-mono text-sm ${!isValidJson ? 'border-destructive' : ''}`}
                  />
                  {!isValidJson && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4" />
                      유효하지 않은 JSON 형식입니다.
                    </div>
                  )}
                </div>
              </div>

              {/* 백업 데이터 미리보기 */}
              {previewData && (
                <div className="space-y-4">
                  <Separator />
                  <div className="space-y-3">
                    <Label>백업 데이터 미리보기</Label>
                    <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground">백업 날짜</div>
                            <div className="font-medium">
                              {new Date(previewData.exportedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground">대화창</div>
                            <div className="font-medium">{previewData.data.conversations.length}개</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground">Role</div>
                            <div className="font-medium">{previewData.data.roles.length}개</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground">프로젝트</div>
                            <div className="font-medium">{previewData.data.projects?.length || 0}개</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">포함된 대화창:</div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {previewData.data.conversations.map((chat, index) => (
                            <div key={index} className="text-xs p-2 bg-background rounded border">
                              <div className="font-medium">{chat.title}</div>
                              <div className="text-muted-foreground">
                                {chat.messages.length}개 메시지 • {new Date(chat.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setImportData('');
                  setPreviewData(null);
                }}>
                  초기화
                </Button>
                <Button 
                  onClick={handleImportBackup} 
                  disabled={!previewData}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  데이터 가져오기
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* 하단 안내 */}
        <div className="p-6 pt-0 border-t bg-muted/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
              <AlertCircle className="w-4 h-4" />
              <span>내보낸 파일은 JSON 형식으로 저장되며, 대화 내용을 포함합니다.</span>
            </div>
            <p className="text-xs text-muted-foreground">
              파일을 안전한 곳에 보관하시고, 신뢰할 수 있는 파일만 가져오기하세요.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}