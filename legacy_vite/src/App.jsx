import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Inventory from './pages/Inventory';
import SalesCMS from './pages/SalesCMS';
import { MessageCircle, Camera } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/cms" element={<SalesCMS />} />
      </Routes>
      <div className="chatbot-fab" title="AI Lead Capture & Support">
        <MessageCircle size={28} />
      </div>
      
      {location.pathname !== '/cms' && (
        <div 
          className="chatbot-fab" 
          style={{ bottom: '90px', background: '#1A3B5C' }} 
          title="Sales CMS: Add Vehicle"
          onClick={() => navigate('/cms')}
        >
          <Camera size={28} />
        </div>
      )}
    </>
  );
}

export default App;
