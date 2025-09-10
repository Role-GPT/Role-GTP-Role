import { useState } from 'react';
import './index.css';

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "안녕하세요! Role GPT입니다.", sender: "bot" },
    { id: 2, text: "무엇을 도와드릴까요?", sender: "bot" }
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { 
        id: Date.now(), 
        text: message, 
        sender: "user" 
      }]);
      setMessage('');
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* 사이드바 */}
      <div style={{
        width: '250px',
        backgroundColor: '#f0f0f0',
        padding: '20px',
        borderRight: '1px solid #ddd'
      }}>
        <h2>Role GPT</h2>
        <p>채팅 기록</p>
      </div>

      {/* 메인 채팅 영역 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 메시지 영역 */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto'
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: msg.sender === 'user' ? '#e3f2fd' : '#f5f5f5',
              borderRadius: '8px',
              maxWidth: '70%',
              marginLeft: msg.sender === 'user' ? 'auto' : '0'
            }}>
              {msg.text}
            </div>
          ))}
        </div>

        {/* 입력 영역 */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #ddd',
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="메시지를 입력하세요..."
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
