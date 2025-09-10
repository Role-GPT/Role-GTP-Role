import { useState } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatMessage } from './components/ChatMessage';
import { SettingsModal } from './components/SettingsModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ROLES, DEFAULT_SETTINGS } from './utils/constants';
import { devLog } from './utils/devUtils';
import './index.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  role: string;
  timestamp: Date;
}

interface Project {
  id: string;
  name: string;
  description: string;
}

function App() {
  const [message, setMessage] = useState('');
  const [currentRole, setCurrentRole] = useLocalStorage('currentRole', '일반 어시스턴트');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useLocalStorage('appSettings', DEFAULT_SETTINGS);
  const [messages, setMessages] = useLocalStorage<Message[]>('chatMessages', [
    { 
      id: 1, 
      text: "안녕하세요! Role GPT입니다. 이제 설정 저장과 더 많은 기능이 추가되었습니다.", 
      sender: "bot", 
      role: "일반 어시스턴트",
      timestamp: new Date()
    }
  ]);

  const projects: Project[] = [
    { id: '1', name: '새 프로젝트', description: '새로운 대화를 시작합니다' },
    { id: '2', name: '웹 개발 프로젝트', description: 'React 앱 개발 관련 대화' },
    { id: '3', name: '글쓰기 프로젝트', description: '창작 및 편집 작업' },
    { id: '4', name: 'AI 연구 프로젝트', description: '인공지능 관련 연구' },
    { id: '5', name: '비즈니스 기획', description: '사업 계획 및 전략 수립' }
  ];

  const sendMessage = async () => {
    if (message.trim()) {
      devLog('메시지 전송:', message, '역할:', currentRole);
      
      const newMessage: Message = { 
        id: Date.now(), 
        text: message, 
        sender: "user",
        role: currentRole,
        timestamp: new Date()
      };
      
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setMessage('');
      setIsLoading(true);
      
      setTimeout(() => {
        const responses = [
          `[${currentRole}로서] 네, ${message}에 대해 자세히 설명드리겠습니다.`,
          `[${currentRole}] 흥미로운 질문이네요. 이 부분을 함께 살펴보겠습니다.`,
          `[${currentRole}] 좋은 접근방법입니다. 단계별로 진행해보시죠.`,
          `[${currentRole}] 이해했습니다. 구체적인 해결책을 제시해드리겠습니다.`,
          `[${currentRole}] 이 주제에 대해 더 깊이 있게 논의해보겠습니다.`
        ];
        
        const botResponse: Message = {
          id: Date.now() + 1,
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: "bot",
          role: currentRole,
          timestamp: new Date()
        };
        
        const finalMessages = [...updatedMessages, botResponse];
        setMessages(finalMessages);
        setIsLoading(false);
        
        devLog('AI 응답 생성 완료');
      }, 1200 + Math.random() * 800); // 더 자연스러운 응답 시간
    }
  };

  const handleNewChat = () => {
    devLog('새 대화 시작');
    setMessages([{ 
      id: Date.now(), 
      text: `안녕하세요! 저는 ${currentRole}입니다. 무엇을 도와드릴까요?`, 
      sender: "bot", 
      role: currentRole,
      timestamp: new Date()
    }]);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: settings.theme === 'dark' ? '#1a1a1a' : '#f8f9fa'
    }}>
      <ChatSidebar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentProject={currentProject}
        setCurrentProject={setCurrentProject}
        projects={projects}
        roles={ROLES}
        messageCount={messages.length}
        onNewChat={handleNewChat}
      />

      {/* 메인 채팅 영역 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: settings.theme === 'dark' ? '#2d2d2d' : 'white'
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '20px',
          borderBottom: `1px solid ${settings.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
          backgroundColor: settings.theme === 'dark' ? '#2d2d2d' : 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ 
                margin: '0 0 4px 0', 
                color: settings.theme === 'dark' ? '#ffffff' : '#2c3e50', 
                fontSize: '20px' 
              }}>
                {currentRole}
              </h3>
              <p style={{ 
                margin: 0, 
                color: settings.theme === 'dark' ? '#b0b0b0' : '#7f8c8d', 
                fontSize: '14px' 
              }}>
                {currentProject ? `프로젝트: ${currentProject.name}` : '프로젝트가 선택되지 않음'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setShowSettings(true)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${settings.theme === 'dark' ? '#404040' : '#ddd'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: settings.theme === 'dark' ? '#ffffff' : '#666'
                }}
              >
                설정
              </button>
              <div style={{ 
                fontSize: '12px', 
                color: settings.theme === 'dark' ? '#b0b0b0' : '#95a5a6' 
              }}>
                온라인 • {isLoading ? '입력 중...' : '대기 중'}
              </div>
            </div>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          backgroundColor: settings.theme === 'dark' ? '#1a1a1a' : '#f8f9fa'
        }}>
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '14px 18px',
                borderRadius: '20px',
                backgroundColor: settings.theme === 'dark' ? '#404040' : 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                opacity: 0.7
              }}>
                <div style={{ 
                  fontSize: '11px', 
                  marginBottom: '6px',
                  color: settings.theme === 'dark' ? '#b0b0b0' : '#666'
                }}>
                  {currentRole} • 입력 중...
                </div>
                <div style={{ color: settings.theme === 'dark' ? '#ffffff' : '#333' }}>
                  ...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <div style={{
          padding: '20px',
          borderTop: `1px solid ${settings.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
          backgroundColor: settings.theme === 'dark' ? '#2d2d2d' : 'white'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
              placeholder={`${currentRole}에게 메시지를 보내세요...`}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '14px 18px',
                border: `2px solid ${settings.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
                borderRadius: '25px',
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading 
                  ? (settings.theme === 'dark' ? '#1a1a1a' : '#f8f9fa') 
                  : (settings.theme === 'dark' ? '#404040' : 'white'),
                color: settings.theme === 'dark' ? '#ffffff' : '#333'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !message.trim()}
              style={{
                padding: '14px 28px',
                backgroundColor: isLoading || !message.trim() ? '#95a5a6' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: isLoading || !message.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                minWidth: '80px'
              }}
            >
              {isLoading ? '...' : '전송'}
            </button>
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
}

export default App;
