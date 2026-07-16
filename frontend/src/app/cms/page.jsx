"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Upload, CheckCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { initCar, uploadFrames, publishCar as publishCarApi, fetchModels, uploadBulkModels } from '@/api/inventoryApi';

const CAR_DATA = {
  "Toyota Fortuner": { variants: ["4x2 MT", "4x2 AT", "4x4 MT", "4x4 AT", "GR-S"], features: ["4WD", "Ventilated Seats", "Touchscreen", "Leather Seats", "Cruise Control"] },
  "Toyota Hilux Revo": { variants: ["Standard", "High", "Prerunner"], features: ["4x4", "Canopy", "Offroad Tires", "Bedliner"] },
  "Toyota Corolla e170": { variants: ["G", "V", "Hybrid"], features: ["Sunroof", "Reverse Camera", "Keyless Entry"] },
  "Toyota Land Cruiser": { variants: ["ZX", "VX", "GR Sport"], features: ["4WD", "360 Camera", "ADAS", "Cool Box", "Rear Entertainment"] },
  "Toyota GR Supra": { variants: ["2.0L", "3.0L", "3.0L Pro"], features: ["RWD", "Sports Exhaust", "Carbon Fiber Trim", "Alcantara Seats"] }
};

const COMPETITORS_DATA = [
  { name: "Ford Endeavour", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098492/inventory/competitors/competitor_asset_3.jpg" },
  { name: "MG Gloster", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098485/inventory/competitors/competitor_asset_0.jpg" },
  { name: "Honda City", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098490/inventory/competitors/competitor_asset_2.jpg" },
  { name: "Hyundai Verna", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098494/inventory/competitors/competitor_asset_4.jpg" },
  { name: "BMW Z4", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098492/inventory/competitors/competitor_asset_3.jpg" },
  { name: "Porsche 718", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098494/inventory/competitors/competitor_asset_4.jpg" },
  { name: "Maruti Jimny", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098487/inventory/competitors/competitor_asset_1.jpg" },
  { name: "Force Gurkha", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098492/inventory/competitors/competitor_asset_3.jpg" }
];

export default function CmsAddVehicle() {
  const [step, setStep] = useState(1);
  const [carDetails, setCarDetails] = useState({
    name: '', desc: '', price: '',
    year: '', fuel: '', transmission: '', km: '', engineCC: '', owner: '', variant: ''
  });
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [faqs, setFaqs] = useState([]);
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
          features: features,
          competitors: competitors,
          reviews: reviews,
          faqs: faqs
        })
      };
      const res = await initCar(payload);
      const newCarId = res.id;
      const formData = new FormData();
      frames.forEach(f => formData.append("files", f.file));
      await uploadFrames(newCarId, formData);
      setUploadProgress({ done: 0, total: frames.length });
      const pollInterval = setInterval(async () => {
        try {
          const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/cars/${newCarId}/status`;
          const response = await fetch(url);
          const data = await response.json();
          setUploadProgress({ done: data.total_done, total: data.total_frames });
          if (data.status === "done" && data.total_done === data.total_frames) {
            clearInterval(pollInterval);
            try {
              await publishCarApi(newCarId);
              alert(`Success! ${payload.name} is now live in the inventory!`);
              queryClient.invalidateQueries({ queryKey: ['inventory'] });
            } catch (publishErr) {
              alert("Processing finished but failed to publish: " + publishErr.message);
            }
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 30000);
      setStep(3);
      setCarDetails({ name: '', desc: '', price: '', year: '', fuel: '', transmission: '', km: '', engineCC: '', owner: '', variant: '' });
      setFeatures([]);
      setCompetitors([]);
      setReviews([]);
      setFaqs([]);
      setFrames([]);
    } catch (e) {
      alert("Publish failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-center max-w-[400px] w-full">
          <h2 className="font-headline-md text-headline-md uppercase mb-2">Sales Portal Login</h2>
          <p className="text-secondary font-body-md mb-6">Enter the access PIN to continue.</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Enter PIN (1234)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 border border-outline/30 rounded-[6px] text-center tracking-[0.5rem] text-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
            <button type="submit" className="w-full bg-primary text-on-primary px-6 py-3 rounded-[6px] font-headline-md text-[18px] uppercase tracking-wide hover:bg-[#93000e] transition-all active:opacity-80">
              Authenticate
            </button>
          </form>
          <Link href="/" className="inline-block mt-4 text-secondary hover:text-primary transition-colors text-sm underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center px-10 w-full max-w-[1280px] mx-auto h-20">
          <div className="flex items-center gap-2 font-label-sm text-[14px] uppercase tracking-wider font-bold">
            <Link href="/" className="text-secondary hover:text-primary transition-colors">Home</Link>
            <span className="text-secondary/50">&gt;</span>
            <Link href="/cms/dashboard" className="text-primary hover:text-[#93000e] transition-colors">CMS</Link>
            <span className="text-secondary/50">&gt;</span>
            <span className="text-on-surface">Add Vehicle</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="font-headline-md text-headline-md uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/dashboard">Dashboard</Link>
            <Link className="font-headline-md text-headline-md uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/inventory">Inventory</Link>
            <Link className="font-headline-md text-headline-md uppercase tracking-wider text-primary border-b-2 border-primary pb-1" href="/cms">Add Vehicle</Link>
            <Link className="font-headline-md text-headline-md uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/certified">Certified</Link>
            <Link className="font-headline-md text-headline-md uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/">Sell</Link>
          </nav>
          <div className="flex items-center gap-6">
            <Link href="/" className="bg-primary text-on-primary px-8 py-2.5 rounded-[6px] font-headline-md text-[16px] uppercase tracking-wide hover:bg-[#93000e] transition-all duration-300 active:opacity-80">
              Enquire
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 md:px-10 max-w-[1280px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="font-label-sm text-label-sm uppercase text-secondary mb-1">
              <Link href="/cms/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
              <span className="mx-2">/</span>
              <span>Add New Vehicle</span>
            </p>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase text-on-surface">Vehicle Onboarding</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="border-2 border-primary text-primary px-6 py-3 rounded-[6px] font-headline-md text-[16px] uppercase tracking-wide hover:bg-surface-container transition-all active:scale-[0.98]">
              Discard Draft
            </button>
          </div>
        </div>

        {step === 1 && (
          <>
            {/* Bulk Upload Card */}
            <div className="bg-white p-6 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] mb-6">
              <h3 className="font-headline-md text-headline-md uppercase mb-2">Admin Dashboard</h3>
              <p className="text-secondary font-body-md text-[14px] mb-4">Bulk upload car models (Excel/CSV) to populate the dropdown below.</p>
              <label className="bg-on-background text-on-primary px-6 py-3 rounded-[6px] font-headline-md text-[16px] uppercase tracking-wide hover:bg-secondary transition-all inline-block cursor-pointer active:opacity-80">
                {isUploadingBulk ? "Uploading..." : "Upload Inventory Sheet"}
                <input type="file" accept=".csv, .xlsx, .xls" onChange={handleBulkUpload} style={{ display: 'none' }} disabled={isUploadingBulk} />
              </label>
              <p className="text-[12px] text-secondary mt-2">Requires columns: id, name, specs</p>
            </div>

            {/* Vehicle Form */}
            <div className="bg-white p-6 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <h3 className="font-headline-md text-headline-md uppercase mb-2">Add New Vehicle</h3>
              <p className="text-secondary font-body-md text-[14px] mb-6">Enter the vehicle specifications before uploading images.</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-label-sm uppercase text-secondary mb-2">Vehicle Model</label>
                    <input
                      name="name"
                      list="models-list"
                      placeholder="Select or enter vehicle model"
                      value={carDetails.name || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none"
                    />
                    <datalist id="models-list">
                      {models.map(m => (
                        <option key={m.id} value={m.name} />
                      ))}
                    </datalist>
                    {modelsLoading && <span className="text-[12px] text-secondary">Loading models from database...</span>}
                  </div>

                  <div>
                    <label className="block font-label-sm uppercase text-secondary mb-2">Variant</label>
                    <input name="variant" list="variant-list" placeholder="e.g., 1.5 SX Opt" value={carDetails.variant} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none" />
                    <datalist id="variant-list">
                      {CAR_DATA[carDetails.name]?.variants?.map(v => <option key={v} value={v} />)}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-label-sm uppercase text-secondary mb-2">Description</label>
                    <input name="desc" placeholder="e.g., Mint Condition, 1 Owner" value={carDetails.desc} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none" />
                  </div>

                  <div>
                    <label className="block font-label-sm uppercase text-secondary mb-2">Price (USD)</label>
                    <input name="price" placeholder="e.g., $56,900" value={carDetails.price} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-sm uppercase text-secondary mb-2">Year</label>
                      <select name="year" value={carDetails.year} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none appearance-none">
                        <option value="" disabled>Select Year</option>
                        {Array.from({length: 30}, (_, i) => new Date().getFullYear() - i).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-label-sm uppercase text-secondary mb-2">Kilometers</label>
                      <input name="km" type="number" placeholder="e.g., 21000" value={carDetails.km} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-sm uppercase text-secondary mb-2">Fuel Type</label>
                      <input name="fuel" list="fuel-list" placeholder="Petrol/Diesel/EV" value={carDetails.fuel} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none" />
                      <datalist id="fuel-list"><option value="Petrol" /><option value="Diesel" /><option value="EV" /><option value="Hybrid" /><option value="CNG" /></datalist>
                    </div>
                    <div>
                      <label className="block font-label-sm uppercase text-secondary mb-2">Transmission</label>
                      <input name="transmission" list="trans-list" placeholder="Auto/Manual" value={carDetails.transmission} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none" />
                      <datalist id="trans-list"><option value="Auto" /><option value="Manual" /></datalist>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-sm uppercase text-secondary mb-2">Engine CC</label>
                      <input name="engineCC" type="number" placeholder="e.g., 1498" value={carDetails.engineCC} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none" />
                    </div>
                    <div>
                      <label className="block font-label-sm uppercase text-secondary mb-2">Owner</label>
                      <input name="owner" list="owner-list" placeholder="e.g., 1st Owner" value={carDetails.owner} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none" />
                      <datalist id="owner-list"><option value="1st Owner" /><option value="2nd Owner" /><option value="3rd Owner" /><option value="4th Owner" /><option value="5th Owner" /></datalist>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Features */}
                  <div className="border border-outline/30 p-4 rounded-[6px]">
                    <label className="block font-label-sm uppercase text-secondary mb-3">Features</label>
                    {CAR_DATA[carDetails.name]?.features?.length > 0 && (
                      <div className="mb-3">
                        <span className="text-[12px] text-secondary mr-2">Suggested:</span>
                        {CAR_DATA[carDetails.name].features.filter(f => !features.includes(f)).map(f => (
                          <button key={f} onClick={(e) => { e.preventDefault(); setFeatures([...features, f]); }} className="bg-surface-container-low border border-outline/30 rounded-[4px] px-2 py-1 text-[12px] cursor-pointer mr-1 mb-1 hover:bg-primary hover:text-white transition-colors">+ {f}</button>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {features.map((f, i) => (
                        <span key={i} className="bg-primary text-white px-3 py-1 rounded-[4px] text-[12px] flex items-center gap-1">
                          {f}
                          <button onClick={() => removeFeature(f)} className="bg-transparent border-none text-white cursor-pointer p-0 text-[16px] leading-none hover:opacity-70">&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={newFeature}
                        onChange={e => setNewFeature(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addFeature(e)}
                        placeholder="Add a feature"
                        className="flex-1 px-3 py-2 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none text-[14px]"
                      />
                      <button onClick={addFeature} className="bg-on-background text-on-primary px-4 py-2 rounded-[6px] font-headline-md text-[14px] uppercase hover:bg-secondary transition-colors">Add</button>
                    </div>
                  </div>

                  {/* Competitors */}
                  <div className="border border-outline/30 p-4 rounded-[6px]">
                    <label className="block font-label-sm uppercase text-secondary mb-3">Competitors (Max 2)</label>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {competitors.map((comp, i) => (
                        <div key={i} className="bg-surface-container-low border border-outline/30 p-3 rounded-[6px] w-full">
                          <div className="flex justify-between mb-2">
                            <strong className="text-[14px]">{comp.name}</strong>
                            <button onClick={() => setCompetitors(competitors.filter((_, idx) => idx !== i))} className="bg-transparent border-none text-primary cursor-pointer p-0 text-[16px] hover:opacity-70">&times;</button>
                          </div>
                          {comp.image && <img src={comp.image} alt={comp.name} className="w-full h-[80px] object-cover rounded-[4px] mb-2" />}
                          <div className="text-[12px] text-secondary">{comp.price}</div>
                        </div>
                      ))}
                    </div>
                    {competitors.length < 2 && (
                      <div className="flex flex-col gap-2">
                        <select
                          className="w-full px-4 py-2 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none appearance-none"
                          onChange={(e) => {
                            const selected = COMPETITORS_DATA.find(c => c.name === e.target.value);
                            if (selected && !competitors.find(c => c.name === selected.name)) {
                              setCompetitors([...competitors, { ...selected, price: 'Rs. ' }]);
                            }
                            e.target.value = "";
                          }}
                        >
                          <option value="">-- Add Competitor --</option>
                          {COMPETITORS_DATA.map((c, i) => (
                            <option key={i} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                        {competitors.length > 0 && (
                          <input
                            className="w-full px-3 py-2 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none text-[14px]"
                            placeholder={`Price for ${competitors[competitors.length-1].name}`}
                            value={competitors[competitors.length-1].price}
                            onChange={(e) => {
                              const newComps = [...competitors];
                              newComps[newComps.length-1].price = e.target.value;
                              setCompetitors(newComps);
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Reviews */}
                  <div className="border border-outline/30 p-4 rounded-[6px]">
                    <label className="block font-label-sm uppercase text-secondary mb-3">Reviews</label>
                    <div className="flex flex-col gap-2 mb-3">
                      {reviews.map((r, i) => (
                        <div key={i} className="bg-surface-container-low border border-outline/30 p-3 rounded-[6px] text-[12px]">
                          <div className="flex justify-between">
                            <strong>{r.title} ({r.rating}★)</strong>
                            <button onClick={() => setReviews(reviews.filter((_, idx) => idx !== i))} className="bg-transparent border-none text-primary cursor-pointer p-0 text-[16px] hover:opacity-70">&times;</button>
                          </div>
                          <p className="my-1">{r.text}</p>
                          <small className="text-secondary">- {r.user}, {r.time}</small>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input id="rev-title" placeholder="Title" className="flex-[2] px-3 py-2 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none text-[14px]" />
                        <input id="rev-rating" type="number" placeholder="Rating (1-5)" min="1" max="5" className="flex-1 px-3 py-2 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none text-[14px]" />
                      </div>
                      <input id="rev-text" placeholder="Review Text" className="w-full px-3 py-2 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none text-[14px]" />
                      <div className="flex gap-2">
                        <input id="rev-user" placeholder="User Name" className="flex-1 px-3 py-2 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none text-[14px]" />
                        <input id="rev-time" placeholder="Time (e.g. 1 week ago)" className="flex-1 px-3 py-2 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none text-[14px]" />
                        <button onClick={(e) => {
                          e.preventDefault();
                          const title = document.getElementById('rev-title').value;
                          const rating = document.getElementById('rev-rating').value;
                          const text = document.getElementById('rev-text').value;
                          const user = document.getElementById('rev-user').value;
                          const time = document.getElementById('rev-time').value;
                          if(title && rating && text && user) {
                            setReviews([...reviews, { title, rating: parseInt(rating), text, user, time }]);
                            document.getElementById('rev-title').value = '';
                            document.getElementById('rev-rating').value = '';
                            document.getElementById('rev-text').value = '';
                            document.getElementById('rev-user').value = '';
                            document.getElementById('rev-time').value = '';
                          }
                        }} className="bg-on-background text-on-primary px-4 py-2 rounded-[6px] font-headline-md text-[14px] uppercase hover:bg-secondary transition-colors">Add</button>
                      </div>
                    </div>
                  </div>

                  {/* FAQs */}
                  <div className="border border-outline/30 p-4 rounded-[6px]">
                    <label className="block font-label-sm uppercase text-secondary mb-3">FAQs</label>
                    <div className="flex flex-col gap-2 mb-3">
                      {faqs.map((faq, i) => (
                        <div key={i} className="bg-surface-container-low border border-outline/30 p-3 rounded-[6px] text-[12px]">
                          <div className="flex justify-between">
                            <strong>Q: {faq.q}</strong>
                            <button onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))} className="bg-transparent border-none text-primary cursor-pointer p-0 text-[16px] hover:opacity-70">&times;</button>
                          </div>
                          <p className="my-1">A: {faq.a}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input id="faq-q" placeholder="Question" className="w-full px-3 py-2 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none text-[14px]" />
                      <div className="flex gap-2">
                        <input id="faq-a" placeholder="Answer" className="flex-[3] px-3 py-2 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none text-[14px]" />
                        <button onClick={(e) => {
                          e.preventDefault();
                          const q = document.getElementById('faq-q').value;
                          const a = document.getElementById('faq-a').value;
                          if(q && a) {
                            setFaqs([...faqs, { q, a }]);
                            document.getElementById('faq-q').value = '';
                            document.getElementById('faq-a').value = '';
                          }
                        }} className="flex-1 bg-on-background text-on-primary px-4 py-2 rounded-[6px] font-headline-md text-[14px] uppercase hover:bg-secondary transition-colors">Add FAQ</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button onClick={handleProceed} className="w-full bg-primary text-on-primary px-6 py-3 rounded-[6px] font-headline-md text-[18px] uppercase tracking-wide hover:bg-[#93000e] transition-all active:opacity-80">
                  Proceed to Upload Images
                </button>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="bg-white p-8 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-center">
            <h3 className="font-headline-md text-headline-md uppercase mb-2">Upload Vehicle Images</h3>
            <p className="text-secondary font-body-md mb-6">Upload up to 7 high-quality images. Backgrounds will be automatically removed.</p>

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

            <div className="flex gap-4 justify-center mb-6">
              <label htmlFor="multi-camera-input" className={`flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] font-headline-md text-[16px] uppercase tracking-wide cursor-pointer transition-all active:opacity-80 ${frames.length >= 7 ? 'bg-surface-container-high text-secondary' : 'bg-primary text-on-primary hover:bg-[#93000e]'}`}>
                <Camera size={20} /> Select Images ({frames.length}/7)
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6 max-w-[600px] mx-auto">
              {frames.map((f, i) => (
                <div key={i} className="relative aspect-square rounded-[8px] overflow-hidden border border-outline/30">
                  <img src={f.url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {frames.length > 0 && (
              <button onClick={handlePublish} disabled={isProcessing} className="w-full bg-on-background text-on-primary px-6 py-3 rounded-[6px] font-headline-md text-[18px] uppercase tracking-wide hover:bg-secondary transition-all flex items-center justify-center gap-2 active:opacity-80 disabled:opacity-50">
                <Upload size={18} /> {isProcessing ? "Submitting..." : "Submit to Inventory"}
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle size={64} className="text-green-500 mb-4" />
            <h2 className="font-headline-md text-headline-md uppercase mb-2">Car Submitted!</h2>
            <p className="text-secondary font-body-md mb-4">It is currently being processed by AI in the background.</p>

            {uploadProgress && uploadProgress.total > 0 && (
              <div className="w-full max-w-[300px] mb-4">
                <div className="flex justify-between text-[12px] text-secondary mb-1">
                  <span>Processing frames...</span>
                  <span>{uploadProgress.done} / {uploadProgress.total}</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }} />
                </div>
              </div>
            )}

            <p className="text-[14px] text-secondary mb-4">You will receive a notification once it goes live.</p>
            <button onClick={() => { setStep(1); setUploadProgress(null); }} className="bg-on-background text-on-primary px-6 py-3 rounded-[6px] font-headline-md text-[16px] uppercase tracking-wide hover:bg-secondary transition-all active:opacity-80">
              Add Another Vehicle
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
