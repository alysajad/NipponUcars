import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, CheckCircle, ChevronLeft, Plus, Car } from 'lucide-react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { createListing, publishListing, fetchInventory } from '../api/inventoryApi';

const StatusBadge = ({ status }) => {
  const colors = {
    draft: '#9E9E9E', processing: '#FF9800', published: '#4CAF50', failed: '#F44336'
  };
  return (
    <span style={{ 
      background: colors[status] || '#9E9E9E', color: 'white', padding: '4px 8px', 
      borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'
    }}>
      {status}
    </span>
  );
};

export default function SalesCMS() {
  const [step, setStep] = useState(0); // 0: Dashboard, 1: Details, 2: Upload, 3: Success
  const [carDetails, setCarDetails] = useState({
    name: '', desc: '', price: '', brand: '', location: '', year: '', fuel: '', transmission: '', km: ''
  });
  
  const [listingId, setListingId] = useState(null);
  const REQUIRED_FRAMES = 4;
  const [frames, setFrames] = useState(Array(REQUIRED_FRAMES).fill(null));
  const [currentCaptureFrame, setCurrentCaptureFrame] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const eventSourceRef = useRef(null);

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['inventory'], queryFn: fetchInventory, enabled: step === 0
  });

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCarDetails(prev => ({ ...prev, [name]: value }));
  };

  const startCapture = async () => {
    if (!carDetails.name || !carDetails.price || !carDetails.brand || !carDetails.location) {
      alert("Please fill out basic car details first.");
      return;
    }
    
    // Construct the payload with attributes dict
    const payload = {
      name: carDetails.name,
      desc: carDetails.desc,
      price: carDetails.price,
      specs: "", // Will be overwritten by attributes on backend
      attributes: {
        brand: carDetails.brand,
        location: carDetails.location,
        year: carDetails.year,
        fuel: carDetails.fuel,
        transmission: carDetails.transmission,
        km: carDetails.km
      }
    };
    
    try {
      const listing = await createListing(payload);
      setListingId(listing.id);
      
      const API_URL = import.meta.env.VITE_API_URL;
      const es = new EventSource(`${API_URL}/api/cars/${listing.id}/progress`);
      eventSourceRef.current = es;
      
      es.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.status === 'done') {
          setFrames(prev => {
            const newFrames = [...prev];
            newFrames[data.frame_index] = data.processed_url;
            return newFrames;
          });
          setIsProcessing(false);
        } else if (data.status === 'failed') {
          alert('Frame processing failed: ' + data.error);
          setIsProcessing(false);
        }
      };
      
      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Failed to create listing.");
    }
  };

  const handleFileCapture = async (e) => {
    const file = e.target.files[0];
    if (!file || !listingId) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('files', file);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      await fetch(`${API_URL}/api/cars/${listingId}/frames`, { method: 'POST', body: formData });
      if (currentCaptureFrame < REQUIRED_FRAMES - 1) setCurrentCaptureFrame(prev => prev + 1);
    } catch (err) {
      console.error(err);
      alert("Failed to upload frame.");
      setIsProcessing(false);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePublishCar = async () => {
    if (frames.some(f => f === null)) {
      alert(`Please capture all ${REQUIRED_FRAMES} frames before publishing.`);
      return;
    }
    
    setStep(3);
    try {
      await publishListing(listingId);
      if (eventSourceRef.current) eventSourceRef.current.close();
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setTimeout(() => setStep(0), 2000); // go back to dashboard
    } catch (err) {
      console.error(err);
      alert("Failed to publish car");
      setStep(2);
    }
  };

  const frameLabels = ["Front/Main", "Interior", "Side", "Rear"];

  return (
    <div className="cms-page" style={{ padding: '20px', minHeight: '100vh', background: '#f4f4f4', color: '#333', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => step === 0 ? navigate('/') : setStep(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
          <ChevronLeft /> {step === 0 ? 'Home' : 'Dashboard'}
        </button>
        <h2 style={{ margin: '0 auto', fontSize: '1.2rem' }}>Sales CMS</h2>
      </header>

      {step === 0 && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Inventory Management</h3>
            <button onClick={() => setStep(1)} style={{ ...btnStyle, background: '#E32636', color: 'white', display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px' }}>
              <Plus size={18} /> Add Vehicle
            </button>
          </div>
          
          {isLoading ? <p>Loading...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {inventory.map(car => (
                <div key={car.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #eee', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '80px', height: '60px', borderRadius: '4px', overflow: 'hidden', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {car.frames && car.frames[0] ? (
                        <img src={car.frames[0]} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Car color="#aaa" />
                      )}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#1A3B5C' }}>{car.name}</h4>
                      <span style={{ fontSize: '0.85rem', color: '#666' }}>{car.price}</span>
                    </div>
                  </div>
                  <StatusBadge status={car.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3>Add New Vehicle</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>Enter the vehicle specifications.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input name="name" placeholder="Car Model (e.g., Toyota Hilux)" value={carDetails.name} onChange={handleInputChange} style={{...inputStyle, gridColumn: '1 / -1'}} />
            <input name="price" placeholder="Price (e.g., ₹ 18,20,000)" value={carDetails.price} onChange={handleInputChange} style={{...inputStyle, gridColumn: '1 / -1'}} />
            
            <select name="brand" value={carDetails.brand} onChange={handleInputChange} style={inputStyle}>
              <option value="">Select Brand</option>
              <option value="Toyota">Toyota</option>
              <option value="Honda">Honda</option>
              <option value="Suzuki">Suzuki</option>
            </select>
            
            <select name="location" value={carDetails.location} onChange={handleInputChange} style={inputStyle}>
              <option value="">Select Location</option>
              <option value="Tokyo">Tokyo</option>
              <option value="Osaka">Osaka</option>
              <option value="Yokohama">Yokohama</option>
            </select>

            <input name="year" type="number" placeholder="Year (e.g. 2020)" value={carDetails.year} onChange={handleInputChange} style={inputStyle} />
            <input name="km" type="number" placeholder="Km Driven (e.g. 15000)" value={carDetails.km} onChange={handleInputChange} style={inputStyle} />
            
            <select name="fuel" value={carDetails.fuel} onChange={handleInputChange} style={inputStyle}>
              <option value="">Fuel Type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="EV">EV</option>
            </select>

            <select name="transmission" value={carDetails.transmission} onChange={handleInputChange} style={inputStyle}>
              <option value="">Transmission</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>

            <input name="desc" placeholder="Short Description" value={carDetails.desc} onChange={handleInputChange} style={{...inputStyle, gridColumn: '1 / -1'}} />
            
            <button onClick={startCapture} style={{ ...btnStyle, background: '#E32636', color: 'white', gridColumn: '1 / -1', marginTop: '10px' }}>Proceed to Photo Upload</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h3>Upload Vehicle Photos</h3>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>The background of the first image will be removed automatically.</p>
          
          <div style={{ background: '#f0f0f0', borderRadius: '8px', padding: '15px', margin: '15px 0' }}>
            <h4 style={{ margin: '0', color: '#E32636' }}>Image {currentCaptureFrame + 1} / {REQUIRED_FRAMES}</h4>
            <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>Required: {frameLabels[currentCaptureFrame]}</p>
          </div>
          
          <div style={{ width: '100%', height: '250px', background: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', overflow: 'hidden' }}>
            {isProcessing ? <div className="spinner">Processing via Cloud...</div> : frames[currentCaptureFrame] ? <img src={frames[currentCaptureFrame]} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Camera size={48} color="#ccc" />}
          </div>
          
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileCapture} style={{ display: 'none' }} id="camera-input" />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setCurrentCaptureFrame(Math.max(0, currentCaptureFrame - 1))} disabled={currentCaptureFrame === 0 || isProcessing} style={{ ...btnStyle, flex: 1, background: '#e0e0e0' }}>Prev</button>
            <label htmlFor="camera-input" style={{ ...btnStyle, flex: 2, background: '#E32636', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}><Upload size={18} /> Upload</label>
            <button onClick={() => setCurrentCaptureFrame(Math.min(REQUIRED_FRAMES - 1, currentCaptureFrame + 1))} disabled={currentCaptureFrame === REQUIRED_FRAMES - 1 || isProcessing} style={{ ...btnStyle, flex: 1, background: '#e0e0e0' }}>Skip</button>
          </div>
          
          {frames.filter(f => f !== null).length === REQUIRED_FRAMES && (
            <button onClick={handlePublishCar} style={{ ...btnStyle, background: '#1A3B5C', color: 'white', width: '100%', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><Upload size={18} /> Publish to Inventory</button>
          )}
          
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: `repeat(${REQUIRED_FRAMES}, 1fr)`, gap: '8px' }}>
            {frames.map((f, i) => (
              <div key={i} style={{ aspectRatio: '1', background: f ? '#4CAF50' : '#ddd', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setCurrentCaptureFrame(i)}>
                <span style={{ fontSize: '0.6rem', color: f ? 'white' : '#666', display: 'block', padding: '2px' }}>{frameLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <CheckCircle size={64} color="#4CAF50" />
          <h2 style={{ marginTop: '20px' }}>Car Published!</h2>
          <p>Redirecting to dashboard...</p>
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
