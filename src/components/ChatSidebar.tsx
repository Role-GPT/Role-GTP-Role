import React from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
}

interface ChatSidebarProps {
  currentRole: string;
  setCurrentRole: (role: string) => void;
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  projects: Project[];
  roles: string[];
  messageCount: number;
  onNewChat: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  currentRole,
  setCurrentRole,
  currentProject,
  setCurrentProject,
  projects,
  roles,
  messageCount,
  onNewChat
}) => {
  return (
    <div style={{
      width: '320px',
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto'
    }}>
      <h2 style={{ margin: '0 0 30px 0', fontSize: '28px', fontWeight: '600' }}>
        Role GPT
      </h2>
      
      {/* 프로젝트 선택 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '12px', opacity: 0.8, textTransform: 'uppercase' }}>
          프로젝트
        </h3>
        <select 
          value={currentProject?.id || ''}
          onChange={(e) => {
            const project = projects.find(p => p.id === e.target.value);
            setCurrentProject(project || null);
          }}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#34495e',
            color: 'white',
            fontSize: '14px'
          }}
        >
          <option value="">프로젝트 선택</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
        {currentProject && (
          <p style={{ fontSize: '12px', opacity: 0.7, margin: '8px 0 0 0' }}>
            {currentProject.description}
          </p>
        )}
      </div>

      {/* 역할 선택 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '12px', opacity: 0.8, textTransform: 'uppercase' }}>
          AI 역할
        </h3>
        <select 
          value={currentRole}
          onChange={(e) => setCurrentRole(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#34495e',
            color: 'white',
            fontSize: '14px'
          }}
        >
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* 통계 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '12px', opacity: 0.8, textTransform: 'uppercase' }}>
          대화 통계
        </h3>
        <div style={{ fontSize: '13px', opacity: 0.7, lineHeight: '1.5' }}>
          <div>총 메시지: {messageCount}개</div>
          <div>현재 세션: {Math.floor(messageCount / 2)}턴</div>
          <div>활성 역할: {currentRole}</div>
        </div>
      </div>

      {/* 새 대화 버튼 */}
      <button
        onClick={onNewChat}
        style={{
          padding: '12px',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          marginTop: 'auto'
        }}
      >
        새 대화 시작
      </button>
    </div>
  );
};
