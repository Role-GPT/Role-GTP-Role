import React from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  role: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div style={{
      marginBottom: '20px',
      display: 'flex',
      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
    }}>
      <div style={{
        maxWidth: '75%',
        padding: '14px 18px',
        borderRadius: '20px',
        backgroundColor: message.sender === 'user' ? '#007bff' : 'white',
        color: message.sender === 'user' ? 'white' : '#333',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative'
      }}>
        {message.sender === 'bot' && (
          <div style={{ 
            fontSize: '11px', 
            opacity: 0.7, 
            marginBottom: '6px',
            fontWeight: '500'
          }}>
            {message.role} • {message.timestamp.toLocaleTimeString()}
          </div>
        )}
        <div style={{ lineHeight: '1.4' }}>{message.text}</div>
        {message.sender === 'user' && (
          <div style={{ 
            fontSize: '10px', 
            opacity: 0.8, 
            marginTop: '4px',
            textAlign: 'right'
          }}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};
