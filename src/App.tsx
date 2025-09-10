import { useState } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatMessage } from './components/ChatMessage';
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
  const [currentRole, setCurrentRole] = useState('일반 어시스턴트');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "안녕하세요! Role GPT입니다. 이제 컴포넌트 구조로 개선되었습니다.", 
      sender: "bot", 
      role: "일반 어시스턴트",
      timestamp: new Date()
    }
  ]);

  const roles = [
    '일반 어시스턴트',
    '개발자 도우미', 
    '작문 전문가',
    '언어 선생님',
    '비즈니스 컨설턴트',
    '데이터 분석가',
    '디자인 전문가'
  ];

  const projects: Project[] = [
    { id: '1', name: '새 프로젝트', description: '새로운 대화를 시작합니다' },
    { id: '2', name: '웹 개발 프로젝트', description: 'React 앱 개발 관련 대화' },
    { id: '3', name: '글쓰기 프로젝트', description: '창작 및 편집 작업' }
  ];

  const sendMessage = async () => {
    if (message.trim()) {
      devLog('메시지 전송:', message);
      
      const newMessage: Message = { 
        id: Date.now(), 
        text: message, 
        sender: "user",
        role: currentRole,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setIsLoading(true);
      
      setTimeout(() => {
        const responses = [
          `[${currentRole}로서] 네, ${message}에 대해 자세히 설명드리겠습니다.`,
          `[${currentRole}] 흥미로운 질문이네요. 이 부분을 함께 살펴보겠습니다.`,
          `[${currentRole}] 좋은 접근방법입니다. 단계별로 진행해보시죠.`,
          `[${currentRole}] 이해했습니다. 구체적인 해결책을 제시해드리겠습니다.`
        ];
        
        const botResponse: Message = {
          id: Date.now() + 1,
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: "bot",
          role: currentRole,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
        
        devLog('AI 응답 생성 완료');
      }, 1500);
    }
  };

  const handleNewChat = () => {
    devLog('새 대화 시작');
    setMessages([{ 
      id: Date.now(), 
      text: "새로운 대화를 시작합니다!", 
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
      backgroundColor: '#f8f9fa'
    }}>
      <ChatSidebar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentProject={currentProject}
        setCurrentProject={setCurrentProject}
        projects={projects}
        roles={roles}
        messageCount={messages.length}
        onNewChat={handleNewChat}
      />

      {/* 메인 채팅 영역 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white'
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#2c3e50', fontSize: '20px' }}>
                {currentRole}
              </h3>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
                {currentProject ? `프로젝트: ${currentProject.name}` : '프로젝트가 선택되지 않음'}
              </p>
            </div>
            <div style={{ fontSize: '12px', color: '#95a5a6' }}>
              온라인 • 응답 중 {isLoading ? '...' : ''}
            </div>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          backgroundColor: '#f8f9fa'
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
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                opacity: 0.7
              }}>
                <div style={{ fontSize: '11px', marginBottom: '6px' }}>
                  {currentRole} • 입력 중...
                </div>
                <div>...</div>
              </div>
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #e0e0e0',
          backgroundColor: 'white'
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
                border: '2px solid #e0e0e0',
                borderRadius: '25px',
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8f9fa' : 'white'
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
    </div>
  );
}

export default App;
