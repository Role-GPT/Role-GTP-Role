import { useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  return (
    <div style={{padding: '20px', fontFamily: 'Arial, sans-serif'}}>
      <h1>Role GPT</h1>
      <div style={{marginBottom: '10px'}}>
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          style={{padding: '10px', width: '300px'}}
        />
      </div>
      <div>입력한 메시지: {message}</div>
      <p>곧 전체 Role GPT 기능이 추가됩니다...</p>
    </div>
  );
}

export default App;
