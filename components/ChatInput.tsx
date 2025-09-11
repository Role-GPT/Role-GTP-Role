import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Mic, Image as ImageIcon, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  value?: string;
  onChange?: (value: string) => void;
}

export function ChatInput({ onSendMessage, value, onChange }: ChatInputProps) {
  const [internalMessage, setInternalMessage] = useState('');
  const message = value !== undefined ? value : internalMessage;
  const setMessage = onChange || setInternalMessage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      if (onChange) {
        onChange('');
      } else {
        setMessage('');
      }
    }
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-3 bg-muted rounded-2xl px-5 py-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-9 h-9 hover:bg-accent rounded-xl"
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-9 h-9 hover:bg-accent rounded-xl"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
            
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground text-base"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className={`w-9 h-9 rounded-xl transition-colors ${
                message.trim() 
                  ? 'bg-foreground text-background hover:bg-foreground/90' 
                  : 'hover:bg-accent'
              }`}
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
