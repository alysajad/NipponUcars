"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, CheckCircle, ChevronLeft } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { initCar, uploadFrames, publishCar as publishCarApi, fetchModels, uploadBulkModels } from '@/api/inventoryApi';

const CAR_DATA = {
  "Toyota Fortuner": { variants: ["4x2 MT", "4x2 AT", "4x4 MT", "4x4 AT", "GR-S"], features: ["4WD", "Ventilated Seats", "Touchscreen", "Leather Seats", "Cruise Control"] },
  "Toyota Hilux Revo": { variants: ["Standard", "High", "Prerunner"], features: ["4x4", "Canopy", "Offroad Tires", "Bedliner"] },
  "Toyota Corolla e170": { variants: ["G", "V", "Hybrid"], features: ["Sunroof", "Reverse Camera", "Keyless Entry"] },
  "Toyota Land Cruiser": { variants: ["ZX", "VX", "GR Sport"], features: ["4WD", "360 Camera", "ADAS", "Cool Box", "Rear Entertainment"] },
  "Toyota GR Supra": { variants: ["2.0L", "3.0L", "3.0L Pro"], features: ["RWD", "Sports Exhaust", "Carbon Fiber Trim", "Alcantara Seats"] }
};
export default function SalesCMS() {
  const [step, setStep] = useState(1); // 1: Details, 2: Capture, 3: Processing
  const [carDetails, setCarDetails] = useState({
    name: '', desc: '', price: '',
    year: '', fuel: '', transmission: '', km: '', engineCC: '', owner: '', variant: ''
  });
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState('');
  
  const [frames, setFrames] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  
  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: ['models'],
    queryFn: fetchModels
  });
  
  const queryClient = useQueryClient();
  const router = useRouter();

  const fileInputRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      const selectedModel = models.find(m => m.name === value);
      if (selectedModel) {
        let parsedSpecs = {};
        try { parsedSpecs = JSON.parse(selectedModel.specs || "{}"); } catch(e){}
        setCarDetails(prev => ({
          ...prev,
          name: value,
          model_id: selectedModel.id,
          year: parsedSpecs.year || '',
          fuel: parsedSpecs.fuel || '',
          transmission: parsedSpecs.transmission || '',
          km: parsedSpecs.km || '',
          engineCC: parsedSpecs.engineCC || '',
          owner: parsedSpecs.owner || '',
          variant: parsedSpecs.variant || ''
        }));
        setFeatures(parsedSpecs.features || []);
      } else {
        setCarDetails(prev => ({ ...prev, name: value, model_id: '' }));
      }
    } else {
      setCarDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const addFeature = (e) => {
    e.preventDefault();
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (fToRemove) => {
    setFeatures(features.filter(f => f !== fToRemove));
  };

  const handleProceed = () => {
    if (carDetails.name && carDetails.desc && carDetails.price) {
      setStep(2);
    } else {
      alert("Please fill out basic car details first.");
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploadingBulk(true);
    try {
      await uploadBulkModels(file);
      alert("Models successfully bulk-uploaded!");
      queryClient.invalidateQueries({ queryKey: ['models'] });
    } catch (err) {
      alert("Failed to upload models: " + err.message);
    } finally {
      setIsUploadingBulk(false);
      e.target.value = '';
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect PIN');
    }
  };

  const handleMultiFileCapture = (e) => {
    const files = Array.from(e.target.files);
    const availableSlots = 7 - frames.length;
    const filesToUpload = files.slice(0, availableSlots);
    if (filesToUpload.length === 0) return;

    const localPreviews = filesToUpload.map(file => ({
      url: URL.createObjectURL(file),
      file: file
    }));
    setFrames(prev => [...prev, ...localPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePublish = async () => {
    if (frames.length === 0) {
      alert("Please upload at least one image.");
      return;
    }
    
    setIsProcessing(true);
    try {
        const payload = {
          ...carDetails,
          specs: JSON.stringify({
            brand: (carDetails.name || '').split(' ')[0],
            year: carDetails.year,
            fuel: carDetails.fuel,
            transmission: carDetails.transmission,
            km: carDetails.km,
            engineCC: carDetails.engineCC,
            owner: carDetails.owner,
            variant: carDetails.variant,
            features: features
          })
        };
        
        // 1. Create the inventory row first
        const res = await initCar(payload);
        const newCarId = res.id;
        
        // 2. Upload the frames for background removal
        const formData = new FormData();
        frames.forEach(f => formData.append("files", f.file));
        await uploadFrames(newCarId, formData);
        
        // Background polling
        setUploadProgress({ done: 0, total: frames.length });
        const pollInterval = setInterval(async () => {
            try {
                const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/cars/${newCarId}/status`;
                const response = await fetch(url);
                const data = await response.json();
                
                setUploadProgress({ done: data.total_done, total: data.total_frames });
                
                if (data.status === "done" && data.total_done === data.total_frames) {
                    clearInterval(pollInterval);
                    alert(`Success! The AI has finished processing ${payload.name} and it is now live in the inventory!`);
                    queryClient.invalidateQueries({ queryKey: ['inventory'] });
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        }, 2500);
        
        setStep(3);
        
        // Reset state for next car
        setCarDetails({
          name: '', desc: '', price: '', year: '', fuel: '', transmission: '', km: '', engineCC: '', owner: '', variant: ''
        });
        setFeatures([]);
        setFrames([]);
    } catch (e) {
        alert("Publish failed: " + e.message);
    } finally {
        setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="cms-page" style={{ padding: '20px', minHeight: '100vh', background: '#f4f4f4', color: '#333', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <h2>Sales Portal Login</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Enter the access PIN to continue.</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="password" 
              placeholder="Enter PIN (1234)" 
              value={pin} 
              onChange={(e) => setPin(e.target.value)} 
              style={{...inputStyle, textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.2rem'}} 
            />
            <button type="submit" style={{ ...btnStyle, background: '#E32636', color: 'white' }}>
              Authenticate
            </button>
          </form>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#666', marginTop: '15px', cursor: 'pointer', textDecoration: 'underline' }}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cms-page" style={{ padding: '20px', minHeight: '100vh', background: '#f4f4f4', color: '#333', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
          <ChevronLeft /> Back
        </button>
        <h2 style={{ margin: '0 auto', fontSize: '1.2rem' }}>Sales CMS</h2>
      </header>

      {step === 1 && (
        <>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
            <h3>Admin Dashboard</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>Bulk upload car models (Excel/CSV) to populate the dropdown below.</p>
            <label style={{ ...btnStyle, background: '#1A3B5C', color: 'white', display: 'inline-block', cursor: 'pointer' }}>
              {isUploadingBulk ? "Uploading..." : "Upload Inventory Sheet"}
              <input 
                type="file" 
                accept=".csv, .xlsx, .xls" 
                onChange={handleBulkUpload} 
                style={{ display: 'none' }} 
                disabled={isUploadingBulk}
              />
            </label>
            <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '10px' }}>Requires columns: id, name, specs</p>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>

          <h3>Add New Vehicle</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>Enter the vehicle specifications before uploading images.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              name="name" 
              list="models-list" 
              placeholder="Select or enter vehicle model" 
              value={carDetails.name || ""} 
              onChange={handleInputChange} 
              style={inputStyle}
            />
            <datalist id="models-list">
              {models.map(m => (
                <option key={m.id} value={m.name} />
              ))}
            </datalist>
            {modelsLoading && <span style={{fontSize: '0.8rem', color: '#666'}}>Loading models from database...</span>}
            
            <input name="variant" list="variant-list" placeholder="Variant (e.g., 1.5 SX Opt)" value={carDetails.variant} onChange={handleInputChange} style={inputStyle} />
            <datalist id="variant-list">
              {CAR_DATA[carDetails.name]?.variants?.map(v => <option key={v} value={v} />)}
            </datalist>

            <input name="desc" placeholder="Short Description (e.g., Mint Condition, 1 Owner)" value={carDetails.desc} onChange={handleInputChange} style={inputStyle} />
            <input name="price" placeholder="Price (e.g., ₹ 18,20,000)" value={carDetails.price} onChange={handleInputChange} style={inputStyle} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <select name="year" value={carDetails.year} onChange={handleInputChange} style={inputStyle}>
                <option value="" disabled>Select Year</option>
                {Array.from({length: 30}, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <input name="km" type="number" placeholder="Kilometers (e.g., 21000)" value={carDetails.km} onChange={handleInputChange} style={inputStyle} />
              
              <input name="fuel" list="fuel-list" placeholder="Fuel Type (Petrol/Diesel/EV...)" value={carDetails.fuel} onChange={handleInputChange} style={inputStyle} />
              <datalist id="fuel-list"><option value="Petrol" /><option value="Diesel" /><option value="EV" /><option value="Hybrid" /><option value="CNG" /></datalist>
              
              <input name="transmission" list="trans-list" placeholder="Transmission (Auto/Manual)" value={carDetails.transmission} onChange={handleInputChange} style={inputStyle} />
              <datalist id="trans-list"><option value="Auto" /><option value="Manual" /></datalist>
              
              <input name="engineCC" type="number" placeholder="Engine CC (e.g., 1498)" value={carDetails.engineCC} onChange={handleInputChange} style={inputStyle} />
              
              <input name="owner" list="owner-list" placeholder="Owner (e.g., 1st Owner)" value={carDetails.owner} onChange={handleInputChange} style={inputStyle} />
              <datalist id="owner-list"><option value="1st Owner" /><option value="2nd Owner" /><option value="3rd Owner" /><option value="4th Owner" /><option value="5th Owner" /></datalist>
            </div>

            <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#666' }}>Features</p>
              
              {CAR_DATA[carDetails.name]?.features?.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#888', marginRight: '8px' }}>Suggested:</span>
                  {CAR_DATA[carDetails.name].features.filter(f => !features.includes(f)).map(f => (
                    <button key={f} onClick={(e) => { e.preventDefault(); setFeatures([...features, f]); }} style={{ background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', padding: '2px 8px', fontSize: '0.8rem', cursor: 'pointer', marginRight: '5px' }}>+ {f}</button>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                {features.map((f, i) => (
                  <span key={i} style={{ background: '#E32636', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {f}
                    <button onClick={() => removeFeature(f)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, fontSize: '1rem', lineHeight: 1 }}>&times;</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  value={newFeature} 
                  onChange={e => setNewFeature(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && addFeature(e)}
                  placeholder="Add a feature (e.g., Sunroof)" 
                  style={{...inputStyle, flex: 1, padding: '8px'}} 
                />
                <button onClick={addFeature} style={{ ...btnStyle, background: '#1A3B5C', color: 'white', padding: '8px 15px' }}>Add</button>
              </div>
            </div>
            
            <button onClick={handleProceed} style={{ ...btnStyle, background: '#E32636', color: 'white', marginTop: '10px' }}>
              Proceed to Upload Images
            </button>
          </div>
          </div>
        </>
      )}

      {step === 2 && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h3>Upload Vehicle Images</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>Upload up to 7 high-quality images of the vehicle. Backgrounds will be automatically removed.</p>

          <input 
            type="file" 
            accept="image/*" 
            multiple
            ref={fileInputRef} 
            onChange={handleMultiFileCapture} 
            style={{ display: 'none' }} 
            id="multi-camera-input"
            disabled={frames.length >= 7 || isProcessing}
          />
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
            <label htmlFor="multi-camera-input" style={{ ...btnStyle, background: frames.length >= 7 ? '#ccc' : '#E32636', color: 'white', cursor: frames.length >= 7 ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
              <Camera size={20} /> Select Images ({frames.length}/7)
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {frames.map((f, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                 <img src={f.url} alt={`Preview ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>

          {frames.length > 0 && (
            <button onClick={handlePublish} disabled={isProcessing} style={{ ...btnStyle, background: '#1A3B5C', color: 'white', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
              <Upload size={18} /> {isProcessing ? "Submitting..." : "Submit to Inventory"}
            </button>
          )}
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
          <CheckCircle size={64} color="#4CAF50" />
          <h2 style={{ marginTop: '20px' }}>Car Submitted!</h2>
          <p>It is currently being processed by AI in the background.</p>
          
          {uploadProgress && uploadProgress.total > 0 && (
            <div style={{ width: '100%', maxWidth: '300px', marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>
                <span>Processing frames...</span>
                <span>{uploadProgress.done} / {uploadProgress.total}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%`, height: '100%', background: '#E32636', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}
          
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>You will receive a notification here once it goes live.</p>
          <button onClick={() => { setStep(1); setUploadProgress(null); }} style={{ ...btnStyle, background: '#1A3B5C', color: 'white', marginTop: '20px' }}>
            Add Another Vehicle
          </button>
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
