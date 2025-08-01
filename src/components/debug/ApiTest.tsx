import React from 'react';

const ApiTest: React.FC = () => {
  console.log('🔍 ApiTest component is rendering!');
  console.log('VITE_API_BASE:', import.meta.env.VITE_API_BASE);
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      padding: '20px', 
      backgroundColor: '#ff0000', 
      color: 'white',
      border: '3px solid #ffffff',
      borderRadius: '8px',
      zIndex: 9999,
      fontSize: '16px',
      fontWeight: 'bold'
    }}>
      🔍 COMPONENTE DE PRUEBA VISIBLE
      <br />
      API Base: {import.meta.env.VITE_API_BASE || 'No configurado'}
    </div>
  );
};

export default ApiTest;