import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ProjectDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectTitle: string;
}

export function ProjectDeleteModal({ isOpen, onClose, onConfirm, projectTitle }: ProjectDeleteModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left">프로젝트 삭제</DialogTitle>
          <DialogDescription className="text-left">
            <span className="font-medium">"{projectTitle}"</span> 프로젝트를 정말 삭제하시겠습니까?
            <br />
            <span className="text-muted-foreground/80 text-sm mt-1 block">
              이 작업은 되돌릴 수 없습니다.
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            variant="outline"
            onClick={handleConfirm}
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            삭제
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
