import { useState } from 'react';
import { AccountModal } from './components/AccountModal';
import { AppProvider } from './src/context/AppContext';

export default function TestAccountModal() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <AppProvider>
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-medium text-foreground">AccountModal 테스트</h1>
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            AccountModal 열기
          </button>
        </div>
        
        <AccountModal
          open={isOpen}
          onOpenChange={setIsOpen}
        />
      </div>
    </AppProvider>
  );
}