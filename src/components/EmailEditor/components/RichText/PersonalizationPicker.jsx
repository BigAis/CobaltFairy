// src/components/EmailEditor/components/RichText/PersonalizationPicker.jsx
import React from 'react';

const PersonalizationPicker = ({ onPersonalizationClick }) => {
  const placeholders = [
    { key: 'name', label: 'Name', value: '{{name}}' },
    { key: 'email', label: 'Email', value: '{{email}}' }
  ];

  return (
    <div style={{ 
      position: 'absolute', 
      zIndex: 1080, 
      top: '100%', 
      left: 0,
      background: '#fff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      borderRadius: '8px',
      padding: '8px',
      minWidth: '160px'
    }}>
      <div style={{ 
        marginBottom: '8px', 
        fontSize: '12px', 
        color: '#887D76',
        fontWeight: '500'
      }}>
        Choose personalization:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {placeholders.map((placeholder) => (
          <div
            key={placeholder.key}
            onClick={() => onPersonalizationClick(placeholder.value)}
            style={{
              border: '2px solid #ff635d',
              backgroundColor: '#ffc3ad80',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-block',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#ffc3ad'
              e.target.style.transform = 'scale(1.02)'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#ffc3ad80'
              e.target.style.transform = 'scale(1)'
            }}
          >
            {placeholder.value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalizationPicker;