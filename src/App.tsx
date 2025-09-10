import { useState } from 'react';
import './index.css';

function App() {
  const [message, setMessage] = useState('');
  const [currentRole, setCurrentRole] = useState('일반 어시스턴트');
  const [messages, setMessages] = useState([
    { id: 1, text: "안녕하세요! Role GPT입니다.", sender: "bot", role: "일반 어시스턴트" },
    { id: 2, text: "저는 다양한 역할로 변신할 수 있습니다. 어떤 도움이 필요하신가요?", sender: "bot", role: "일반 어시스턴트" }
  ]);

  const roles = [
    '일반 어시스턴트',
    '개발자 도우미',
    '작문 전문가',
    '언어 선생님',
    '비즈니스 컨설턴트'
  ];

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = { 
        id: Date.now(), 
        text: message, 
        sender: "user",
        role: currentRole
      };
      
      setMessages([...messages, newMessage]);
      
      // 간단한 자동 응답
      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          text: `[${currentRole}로서] ${message}에 대해 도움을 드리겠습니다.`,
          sender: "bot",
          role: currentRole
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
      
      setMessage('');
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f8f9fa'
    }}>
      {/* 사이드바 */}
      <div style={{
        width: '280px',
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px' }}>Role GPT</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '10px', opacity: 0.8 }}>현재 역할</h3>
          <select 
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#34495e',
              color: 'white'
            }}
          >
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', marginBottom: '10px', opacity: 0.8 }}>최근 대화</h3>
          <div style={{ fontSize: '14px', opacity: 0.6 }}>
            • 새로운 대화
          </div>
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white'
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>
            {currentRole}와 대화 중
          </h3>
        </div>

        {/* 메시지 영역 */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          backgroundColor: '#f8f9fa'
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              marginBottom: '15px',
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: msg.sender === 'user' ? '#007bff' : 'white',
                color: msg.sender === 'user' ? 'white' : '#333',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                {msg.sender === 'bot' && (
                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
                    {msg.role}
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* 입력 영역 */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #e0e0e0',
          backgroundColor: 'white'
        }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`${currentRole}에게 메시지를 보내세요...`}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '25px',
                outline: 'none',
                fontSize: '14px'
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
