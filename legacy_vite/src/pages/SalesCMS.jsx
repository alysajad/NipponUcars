import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, CheckCircle, ChevronLeft } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publishCar } from '../api/inventoryApi';
import { removeBackground } from '@imgly/background-removal';

const CaptureGuide = ({ frame }) => {
  const angle = frame * 10;
  
  return (
    <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 15px' }}>
      {/* Car Top-Down View */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '36px',
        height: '76px',
        background: '#1A3B5C',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        {/* Headlights (indicates front pointing UP) */}
        <div style={{ position: 'absolute', top: '2px', left: '4px', width: '6px', height: '4px', background: '#FFF', borderRadius: '2px' }} />
        <div style={{ position: 'absolute', top: '2px', right: '4px', width: '6px', height: '4px', background: '#FFF', borderRadius: '2px' }} />
        {/* Windshield */}
        <div style={{ position: 'absolute', top: '15px', left: '4px', right: '4px', height: '15px', background: '#87CEEB', borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
        {/* Rear window */}
        <div style={{ position: 'absolute', bottom: '8px', left: '6px', right: '6px', height: '8px', background: '#87CEEB', borderRadius: '0 0 2px 2px', opacity: 0.8 }} />
      </div>
      
      {/* Rotating Camera Indicator */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        transform: `rotate(${angle}deg)`,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-' + angle + 'deg)', // Keep icon upright
          background: '#E32636',
          borderRadius: '50%',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(227,38,54,0.5)',
          zIndex: 10
        }}>
          <Camera size={16} color="white" />
        </div>
        {/* Line pointing to car */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '2px',
          height: '24px',
          background: 'rgba(227,38,54,0.5)'
        }} />
      </div>
    </div>
  );
};

export default function SalesCMS() {
  const [step, setStep] = useState(1); // 1: Details, 2: Capture, 3: Processing
  const [carDetails, setCarDetails] = useState({
    name: '', desc: '', specs: '', price: ''
  });
  
  const [frames, setFrames] = useState(Array(36).fill(null));
  const [currentCaptureFrame, setCurrentCaptureFrame] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const publishMutation = useMutation({
    mutationFn: publishCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      navigate('/inventory');
    },
    onError: (error) => {
      console.error(error);
      alert("Failed to publish car");
      setStep(2); // Go back to capture step if it fails
    }
  });
  const fileInputRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCarDetails(prev => ({ ...prev, [name]: value }));
  };

  const startCapture = () => {
    if (carDetails.name && carDetails.desc && carDetails.price) {
      setStep(2);
    } else {
      alert("Please fill out basic car details first.");
    }
  };

  // Helper to process image: remove background and composite on white
  const processImage = async (file) => {
    try {
      // Create object URL from file
      const imageUrl = URL.createObjectURL(file);
      
      // Perform background removal (returns a Blob)
      const transparentBlob = await removeBackground(imageUrl);
      
      // Convert to Image to draw on canvas
      const img = new Image();
      const transparentUrl = URL.createObjectURL(transparentBlob);
      
      return new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          // Fill pure white background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw the transparent car on top
          ctx.drawImage(img, 0, 0);
          
          // Save as JPEG to base64
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          resolve(dataUrl);
        };
        img.src = transparentUrl;
      });
    } catch (err) {
      console.error("Error processing image:", err);
      return null;
    }
  };

  const handleFileCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    
    // Process the image
    const processedBase64 = await processImage(file);
    
    if (processedBase64) {
      const newFrames = [...frames];
      newFrames[currentCaptureFrame] = processedBase64;
      setFrames(newFrames);
      
      if (currentCaptureFrame < 35) {
        setCurrentCaptureFrame(prev => prev + 1);
      }
    }
    
    setIsProcessing(false);
    // Reset file input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const publishCar = async () => {
    if (frames.some(f => f === null)) {
      alert("Please capture all 36 frames before publishing.");
      return;
    }
    
    setStep(3); // Show publishing state
    
    const newCar = {
      id: `custom_${Date.now()}`,
      name: carDetails.name.toUpperCase(),
      desc: carDetails.desc,
      specs: carDetails.specs,
      price: carDetails.price,
      scale: 1.0,
      frames: frames // Store the base64 frames directly in the object
    };

    publishMutation.mutate(newCar);
  };

  // Helper to guide the salesman
  const getCaptureInstruction = () => {
    if (currentCaptureFrame === 0) return "Direct Front";
    if (currentCaptureFrame === 9) return "Right Side Profile";
    if (currentCaptureFrame === 18) return "Direct Rear";
    if (currentCaptureFrame === 27) return "Left Side Profile";
    return `Move 10 degrees right (Angle ${currentCaptureFrame * 10}°)`;
  };

  return (
    <div className="cms-page" style={{ padding: '20px', minHeight: '100vh', background: '#f4f4f4', color: '#333', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
          <ChevronLeft /> Back
        </button>
        <h2 style={{ margin: '0 auto', fontSize: '1.2rem' }}>Sales CMS</h2>
      </header>

      {step === 1 && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3>Add New Vehicle</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>Enter the vehicle specifications before starting the 360° capture.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input name="name" placeholder="Car Name (e.g., Corolla e170)" value={carDetails.name} onChange={handleInputChange} style={inputStyle} />
            <input name="desc" placeholder="Short Description" value={carDetails.desc} onChange={handleInputChange} style={inputStyle} />
            <input name="specs" placeholder="Specs (e.g., 1.8L Hybrid | 121 BHP)" value={carDetails.specs} onChange={handleInputChange} style={inputStyle} />
            <input name="price" placeholder="Price (e.g., ₹ 18,20,000)" value={carDetails.price} onChange={handleInputChange} style={inputStyle} />
            
            <button onClick={startCapture} style={{ ...btnStyle, background: '#E32636', color: 'white', marginTop: '10px' }}>
              Proceed to Capture
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h3>360° Image Capture</h3>
          <div style={{ background: '#f0f0f0', borderRadius: '8px', padding: '15px', margin: '15px 0' }}>
            <CaptureGuide frame={currentCaptureFrame} />
            <h4 style={{ margin: '0 0 5px 0', color: '#E32636' }}>Frame {currentCaptureFrame + 1} / 36</h4>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{getCaptureInstruction()}</p>
          </div>

          <div style={{ width: '100%', height: '250px', background: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', overflow: 'hidden' }}>
            {isProcessing ? (
              <div className="spinner">Processing & Removing Background...</div>
            ) : frames[currentCaptureFrame] ? (
              <img src={frames[currentCaptureFrame]} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <Camera size={48} color="#ccc" />
            )}
          </div>

          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={fileInputRef} 
            onChange={handleFileCapture} 
            style={{ display: 'none' }} 
            id="camera-input"
          />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setCurrentCaptureFrame(Math.max(0, currentCaptureFrame - 1))} disabled={currentCaptureFrame === 0 || isProcessing} style={{ ...btnStyle, flex: 1, background: '#e0e0e0' }}>
              Previous
            </button>
            <label htmlFor="camera-input" style={{ ...btnStyle, flex: 2, background: '#E32636', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
              <Camera size={18} /> Capture
            </label>
            <button onClick={() => setCurrentCaptureFrame(Math.min(35, currentCaptureFrame + 1))} disabled={currentCaptureFrame === 35 || isProcessing} style={{ ...btnStyle, flex: 1, background: '#e0e0e0' }}>
              Skip
            </button>
          </div>

          {frames.filter(f => f !== null).length === 36 && (
            <button onClick={publishCar} style={{ ...btnStyle, background: '#1A3B5C', color: 'white', width: '100%', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <Upload size={18} /> Publish to Inventory
            </button>
          )}
          
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '4px' }}>
            {frames.map((f, i) => (
              <div key={i} style={{ aspectRatio: '1', background: f ? '#4CAF50' : '#ddd', borderRadius: '2px', cursor: 'pointer' }} onClick={() => setCurrentCaptureFrame(i)} />
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <CheckCircle size={64} color="#4CAF50" />
          <h2 style={{ marginTop: '20px' }}>Car Published!</h2>
          <p>Redirecting to inventory...</p>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box'
};

const btnStyle = {
  padding: '12px', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'
};
