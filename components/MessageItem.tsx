import { useState } from 'react';
import { Volume2, Copy, RotateCcw, Bookmark, Download, Edit3, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { speechManager } from '../src/providers/speech';
import { toast } from 'sonner';

interface MessageItemProps {
  message: {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
  };
  onRegenerateMessage: (id: number) => void;
  onSaveMessage: (id: number) => void;
  onExportMessage: (id: number) => void;
  onEditMessage: (id: number, text: string) => void;
  onDeleteMessage: (id: number) => void;
  logo: string;
  isMobile: boolean;
}

export const MessageItem = ({ 
  message, 
  onRegenerateMessage, 
  onSaveMessage, 
  onExportMessage, 
  onEditMessage,
  onDeleteMessage,
  logo, 
  isMobile 
}: MessageItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || '');
  const [showActions, setShowActions] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleLongPressStart = () => {
    if (isMobile) {
      const timer = setTimeout(() => {
        setShowActions(true);
        // 햅틱 피드백 (지원되는 경우)
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 500); // 500ms long press
      setLongPressTimer(timer);
    }
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleEdit = () => {
    if (editText.trim() && editText !== message.text) {
      onEditMessage(message.id, editText.trim());
      toast.success('메시지가 수정되었습니다.');
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(message.text || '');
    setIsEditing(false);
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(message.text || '');
      toast.success('메시지가 클립보드에 복사되었습니다.');
    } catch (error) {
      toast.error('클립보드 복사에 실패했습니다.');
    }
    setShowActions(false);
  };

  const handleDelete = () => {
    onDeleteMessage(message.id);
    toast.success('메시지가 삭제되었습니다.');
    setShowActions(false);
  };

  return (
    <div className={`flex gap-4 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* AI 아바타 */}
      {message.sender === 'ai' && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
          <img 
            src={logo} 
            alt="Assistant" 
            className="w-5 h-5 object-contain filter brightness-0 invert" 
          />
        </div>
      )}
      
      <div className={`flex-1 max-w-3xl ${message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
        <div 
          className={`inline-block p-4 rounded-2xl ${
            message.sender === 'user' 
              ? 'bg-primary text-primary-foreground max-w-[80%]' 
              : 'bg-muted/50 text-foreground'
          } group relative mb-6`}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
          onMouseLeave={() => setShowActions(false)}
        >
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[100px] resize-none bg-background/50"
                placeholder="메시지를 입력하세요..."
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-8"
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={handleEdit}
                  className="h-8"
                >
                  저장
                </Button>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words leading-relaxed">
              {message.text || ''}
            </div>
          )}

          {/* 데스크톱 호버 액션 - AI 메시지 */}
          {!isMobile && message.sender === 'ai' && !isEditing && (
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute -bottom-12 left-0 flex gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-2 shadow-xl z-10">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 hover:bg-blue-500/10 hover:text-blue-600 text-muted-foreground rounded-lg transition-all duration-200"
                onClick={() => onRegenerateMessage(message.id)}
                title="다시 생성"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 hover:bg-green-500/10 hover:text-green-600 text-muted-foreground rounded-lg transition-all duration-200"
                onClick={handleCopy}
                title="복사"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 hover:bg-purple-500/10 hover:text-purple-600 text-muted-foreground rounded-lg transition-all duration-200"
                onClick={() => {
                  try {
                    speechManager.speak(message.text || '');
                    toast.success('음성 재생을 시작합니다.');
                  } catch (error) {
                    toast.error('음성 재생에 실패했습니다.');
                  }
                }}
                title="음성으로 듣기"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 hover:bg-yellow-500/10 hover:text-yellow-600 text-muted-foreground rounded-lg transition-all duration-200"
                onClick={() => onSaveMessage(message.id)}
                title="북마크에 저장"
              >
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 hover:bg-indigo-500/10 hover:text-indigo-600 text-muted-foreground rounded-lg transition-all duration-200"
                onClick={() => onExportMessage(message.id)}
                title="내보내기"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* 데스크톱 호버 액션 - 사용자 메시지 */}
          {!isMobile && message.sender === 'user' && !isEditing && (
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute -bottom-12 right-0 flex gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-2 shadow-xl z-10">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 hover:bg-green-500/10 hover:text-green-600 text-muted-foreground rounded-lg transition-all duration-200"
                onClick={handleCopy}
                title="복사"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 hover:bg-blue-500/10 hover:text-blue-600 text-muted-foreground rounded-lg transition-all duration-200"
                onClick={() => setIsEditing(true)}
                title="편집"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 hover:bg-red-500/10 hover:text-red-600 text-muted-foreground rounded-lg transition-all duration-200"
                onClick={handleDelete}
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* 모바일 액션 메뉴 */}
          {isMobile && showActions && (
            <>
              {/* 오버레이 */}
              <div 
                className="fixed inset-0 bg-black/20 z-[100]" 
                onClick={() => setShowActions(false)}
              />
              
              {/* 액션 메뉴 */}
              <div className="fixed bottom-20 left-4 right-4 bg-background border border-border rounded-xl p-4 shadow-xl z-[101]">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="ghost"
                    className="flex flex-col items-center gap-2 h-auto py-3"
                    onClick={handleCopy}
                  >
                    <Copy className="w-5 h-5" />
                    <span className="text-xs">복사</span>
                  </Button>
                  
                  {message.sender === 'user' && (
                    <Button
                      variant="ghost"
                      className="flex flex-col items-center gap-2 h-auto py-3"
                      onClick={() => {
                        setIsEditing(true);
                        setShowActions(false);
                      }}
                    >
                      <Edit3 className="w-5 h-5" />
                      <span className="text-xs">편집</span>
                    </Button>
                  )}
                  
                  {message.sender === 'ai' && (
                    <>
                      <Button
                        variant="ghost"
                        className="flex flex-col items-center gap-2 h-auto py-3"
                        onClick={() => {
                          onRegenerateMessage(message.id);
                          setShowActions(false);
                        }}
                      >
                        <RotateCcw className="w-5 h-5" />
                        <span className="text-xs">재생성</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="flex flex-col items-center gap-2 h-auto py-3"
                        onClick={() => {
                          try {
                            speechManager.speak(message.text || '');
                            toast.success('음성 재생을 시작합니다.');
                            setShowActions(false);
                          } catch (error) {
                            toast.error('음성 재생에 실패했습니다.');
                          }
                        }}
                      >
                        <Volume2 className="w-5 h-5" />
                        <span className="text-xs">음성재생</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="flex flex-col items-center gap-2 h-auto py-3"
                        onClick={() => {
                          onSaveMessage(message.id);
                          setShowActions(false);
                        }}
                      >
                        <Bookmark className="w-5 h-5" />
                        <span className="text-xs">저장</span>
                      </Button>
                    </>
                  )}
                  
                  {message.sender === 'user' && (
                    <Button
                      variant="ghost"
                      className="flex flex-col items-center gap-2 h-auto py-3 text-red-600"
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="text-xs">삭제</span>
                    </Button>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => setShowActions(false)}
                >
                  닫기
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* 사용자 아바타 */}
      {message.sender === 'user' && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-white font-medium text-sm">U</span>
        </div>
      )}
    </div>
  );
};
