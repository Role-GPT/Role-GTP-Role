/**
 * ChatDeleteModal - 대화 삭제 확인 모달 컴포넌트
 * 
 * 프로젝트 삭제 모달과 동일한 디자인으로 일관성 유지
 * - 실수 방지를 위한 확인 절차
 * - 위험한 작업에 대한 시각적 경고
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Trash2, MessageSquare } from 'lucide-react';

interface ChatDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chatTitle: string;
}

export function ChatDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  chatTitle
}: ChatDeleteModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-destructive" />
            </div>
            대화 삭제
          </DialogTitle>
          <DialogDescription>
            선택한 대화를 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            "{chatTitle}" 대화를 정말 삭제하시겠습니까?
          </p>
          <p className="text-xs text-muted-foreground">
            이 작업은 되돌릴 수 없습니다.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="px-4"
          >
            취소
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            className="px-4 gap-2"
          >
            <Trash2 className="w-4 h-4" />
            삭제
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
