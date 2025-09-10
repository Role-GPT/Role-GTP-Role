import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    theme: string;
    language: string;
    autoSave: boolean;
    notificationsEnabled: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        width: '400px',
        maxWidth: '90vw',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#2c3e50' }}>설정</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#95a5a6'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            테마
          </label>
          <select
            value={settings.theme}
            onChange={(e) => onSettingsChange({ ...settings, theme: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="light">밝은 테마</option>
            <option value="dark">어두운 테마</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            언어
          </label>
          <select
            value={settings.language}
            onChange={(e) => onSettingsChange({ ...settings, language: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => onSettingsChange({ ...settings, autoSave: e.target.checked })}
            />
            자동 저장
          </label>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => onSettingsChange({ ...settings, notificationsEnabled: e.target.checked })}
            />
            알림 활성화
          </label>
        </div>

        <div style={{ textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
