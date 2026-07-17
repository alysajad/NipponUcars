"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Upload, CheckCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { initCar, uploadFrames, publishCar as publishCarApi, fetchModels, uploadBulkModels, fetchFormSchema } from '@/api/inventoryApi';

export default function CmsAddVehicle() {
  const [step, setStep] = useState(1);
  const [carDetails, setCarDetails] = useState({
    name: '', desc: '', price: '',
    year: '', fuel: '', transmission: '', km: '', engineCC: '', owner: '', variant: '',
    vin: '', stock_id: '', status: 'Available', acquisition_cost: '', color: ''
  });
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [frames, setFrames] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [pin, setPin] = useState('');
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [formSchema, setFormSchema] = useState({ customFields: [], competitors: [], features: [] });

  useEffect(() => {
    fetchFormSchema().then(setFormSchema);
  }, []);


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
        attributes: (formSchema.customFields || []).reduce((acc, field) => { acc[field.name] = carDetails[field.name]; return acc; }, {}),
        specs: JSON.stringify({
          brand: (carDetails.name || '').split(' ')[0],
          year: carDetails.year,
          fuel: carDetails.fuel,
          transmission: carDetails.transmission,
          km: carDetails.km,
          engineCC: carDetails.engineCC,
          owner: carDetails.owner,
          variant: carDetails.variant,
          vin: carDetails.vin,
          stock_id: carDetails.stock_id,
          status: carDetails.status,
          acquisition_cost: carDetails.acquisition_cost,
          color: carDetails.color,
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
      setCarDetails({ name: '', desc: '', price: '', year: '', fuel: '', transmission: '', km: '', engineCC: '', owner: '', variant: '', vin: '', stock_id: '', status: 'Available', acquisition_cost: '', color: '' });
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
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap font-label-sm text-[14px] uppercase tracking-wider font-bold">
            <Link href="/" className="text-secondary hover:text-primary transition-colors">Home</Link>
            <span className="text-secondary/50">&gt;</span>
            <Link href="/cms/dashboard" className="text-primary hover:text-[#93000e] transition-colors">CMS</Link>
            <span className="text-secondary/50">&gt;</span>
            <span className="text-on-surface">Add Vehicle</span>
          </div>
          <nav className="hidden lg:flex shrink-0 whitespace-nowrap overflow-x-auto items-center gap-4 xl:gap-8">
            <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/dashboard">Dashboard</Link>
            <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/inventory">Inventory</Link>
            <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-primary border-b-2 border-primary pb-1" href="/cms">Add Vehicle</Link>
            <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/enquiries">Enquiries</Link>
            <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/certification">Certified</Link>
            <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/settings">Form Editor</Link>
          </nav>
          <div className="flex items-center gap-3 xl:gap-6">
            <Link href="/" className="bg-primary text-on-primary px-8 py-2.5 rounded-[6px] font-bold text-[16px] uppercase tracking-wide hover:bg-[#93000e] transition-all duration-300 active:opacity-80">
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
            <button onClick={() => {
              if (window.confirm("Are you sure you want to discard this draft? All entered details will be lost.")) {
                setStep(1);
                setCarDetails({ name: '', desc: '', price: '', year: '', fuel: '', transmission: '', km: '', engineCC: '', owner: '', variant: '', vin: '', stock_id: '', status: 'Available', acquisition_cost: '', color: '' });
                setFeatures([]);
                setCompetitors([]);
                setReviews([]);
                setFaqs([]);
                setFrames([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }
            }} className="border-2 border-primary text-primary px-6 py-3 rounded-[6px] font-headline-md text-[16px] uppercase tracking-wide hover:bg-surface-container transition-all active:scale-[0.98]">
              Discard Draft
            </button>
          </div>
        </div>

        {step === 1 && (
          <>
            {/* Bulk Upload Card */}
            <div className="bg-white p-6 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] mb-6">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="font-headline-md text-headline-md uppercase">Admin Dashboard</h3>
                 <Link href="/cms/settings" className="border-2 border-primary text-primary px-4 py-2 rounded-[6px] font-headline-md text-[14px] uppercase tracking-wide hover:bg-surface-container transition-all">Form Editor</Link>
              </div>
              <p className="text-secondary font-body-md text-[14px] mb-4">Bulk upload car models (Excel/CSV) to populate the dropdown below.</p>
              <label className="bg-on-background text-on-primary px-6 py-3 rounded-[6px] font-headline-md text-[16px] uppercase tracking-wide hover:bg-secondary transition-all inline-block cursor-pointer active:opacity-80">
                {isUploadingBulk ? "Uploading..." : "Upload Inventory Sheet"}
                <input type="file" accept=".csv, .xlsx, .xls" onChange={handleBulkUpload} style={{ display: 'none' }} disabled={isUploadingBulk} />
              </label>
              <p className="text-[12px] text-secondary mt-2">Requires columns: id, name, specs</p>
            </div>

            {/* Unified Vehicle Form */}
            <div className="bg-white p-6 md:p-8 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <div className="mb-8">
                <h3 className="font-headline-md text-headline-md uppercase mb-2">Add New Vehicle</h3>
                <p className="text-secondary font-body-md text-[14px]">Enter the vehicle specifications and upload images for AI background removal.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left Column - Basic & Technical */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Basic Information */}
                  <div>
                    <h4 className="font-headline-md text-[18px] uppercase border-b border-outline/20 pb-3 mb-5">Basic Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-label-sm uppercase text-secondary mb-2">VIN (Vehicle Identification Number)</label>
                        <input name="vin" placeholder="e.g. JTD..." value={carDetails.vin} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none font-body-md" />
                      </div>
                      <div>
                        <label className="block font-label-sm uppercase text-secondary mb-2">Stock ID</label>
                        <input name="stock_id" placeholder="e.g. STK-1002" value={carDetails.stock_id} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none font-body-md" />
                      </div>
                      <div>
                        <label className="block font-label-sm uppercase text-secondary mb-2">Year</label>
                        <select name="year" value={carDetails.year} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none appearance-none font-body-md">
                          <option value="" disabled>Select Year</option>
                          {Array.from({length: 30}, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-label-sm uppercase text-secondary mb-2">Vehicle Model</label>
                        <input name="name" list="models-list" placeholder="Select or enter vehicle model" value={carDetails.name || ""} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none font-body-md" />
                        <datalist id="models-list">
                          {models.map(m => (
                            <option key={m.id} value={m.name} />
                          ))}
                        </datalist>
                        {modelsLoading && <span className="text-[12px] text-secondary mt-1 block">Loading models...</span>}
                      </div>
                      <div>
                        <label className="block font-label-sm uppercase text-secondary mb-2">Variant / Trim</label>
                        <input name="variant" list="variant-list" placeholder="e.g., 1.5 SX Opt" value={carDetails.variant} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none font-body-md" />
                        <datalist id="variant-list">
                          {/* Dynamic variants not currently in schema, user types manually */}
                        </datalist>
                      </div>
                      <div>
                        <label className="block font-label-sm uppercase text-secondary mb-2">Description</label>
                        <input name="desc" placeholder="e.g., Mint Condition" value={carDetails.desc} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none font-body-md" />
                      </div>
                    </div>
                  </div>

                  {/* Technical Specs */}
                  <div>
                    <h4 className="font-headline-md text-[18px] uppercase border-b border-outline/20 pb-3 mb-5">Technical Specs</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-label-sm uppercase text-secondary mb-2">Engine CC</label>
                        <input name="engineCC" type="number" placeholder="e.g., 1498" value={carDetails.engineCC} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none font-body-md" />
                      </div>
                      <div>
                        <label className="block font-label-sm uppercase text-secondary mb-2">Transmission</label>
                        <input name="transmission" list="trans-list" placeholder="Auto/Manual" value={carDetails.transmission} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none font-body-md" />
                        <datalist id="trans-list"><option value="Auto" /><option value="Manual" /></datalist>
                      </div>
                      <div>
                        <label className="block font-label-sm uppercase text-secondary mb-2">Fuel Type</label>
                        <input name="fuel" list="fuel-list" placeholder="Petrol/Diesel/EV" value={carDetails.fuel} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none font-body-md" />
                        <datalist id="fuel-list"><option value="Petrol" /><option value="Diesel" /><option value="EV" /><option value="Hybrid" /><option value="CNG" /></datalist>
                      </div>
                      <div>
                        <label className="block font-label-sm uppercase text-secondary mb-2">Kilometers</label>
                        <input name="km" type="number" placeholder="e.g., 21000" value={carDetails.km} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none font-body-md" />
                      </div>
                      <div>
                        <label className="block font-label-sm uppercase text-secondary mb-2">Exterior Color</label>
                        <input name="color" placeholder="e.g., Pearl White" value={carDetails.color} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none font-body-md" />
                      </div>
                      <div>
                        <label className="block font-label-sm uppercase text-secondary mb-2">Owner</label>
                        <input name="owner" list="owner-list" placeholder="e.g., 1st Owner" value={carDetails.owner} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none font-body-md" />
                        <datalist id="owner-list"><option value="1st Owner" /><option value="2nd Owner" /><option value="3rd Owner" /><option value="4th Owner" /><option value="5th Owner" /></datalist>
                      </div>
                    </div>
                  </div>
                  {/* Dynamic Custom Fields */}
                  {formSchema.customFields?.length > 0 && (
                    <div className="mt-8">
                      <h4 className="font-headline-md text-[18px] uppercase border-b border-outline/20 pb-3 mb-5">Custom Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {formSchema.customFields.map((field, i) => (
                          <div key={i}>
                            <label className="block font-label-sm uppercase text-secondary mb-2">{field.name}</label>
                            <input name={field.name} type={field.type} value={carDetails[field.name] || ''} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none font-body-md" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  
                  {/* Features & Extras Expandable (Optional) */}
                  <div className="border border-outline/30 p-5 rounded-[8px] bg-surface-container-lowest">
                     <h4 className="font-headline-md text-[16px] uppercase mb-4">Additional Details</h4>
                     
                     <div className="mb-4">
                        <label className="block font-label-sm uppercase text-secondary mb-3">Features</label>
                        {formSchema.features?.length > 0 && (
                          <div className="mb-3">
                            <span className="text-[12px] text-secondary mr-2">Suggested:</span>
                            {formSchema.features.filter(f => !features.includes(f)).map(f => (
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
                     <div className="mb-4 pt-4 border-t border-outline/20">
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
                               const selected = formSchema.competitors.find(c => c.name === e.target.value);
                               if (selected && !competitors.find(c => c.name === selected.name)) {
                                 setCompetitors([...competitors, { ...selected, price: 'Rs. ' }]);
                               }
                               e.target.value = "";
                             }}
                           >
                             <option value="">-- Add Competitor --</option>
                             {(formSchema.competitors || []).map((c, i) => (
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
                     <div className="mb-4 pt-4 border-t border-outline/20">
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
                     <div className="mb-4 pt-4 border-t border-outline/20">
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

                {/* Right Column - Pricing & Visuals */}
                <div className="lg:col-span-5 space-y-8">
                  {/* Pricing & Inventory */}
                  <div>
                    <h4 className="font-headline-md text-[18px] uppercase border-b border-outline/20 pb-3 mb-5">Pricing & Inventory</h4>
                    <div className="space-y-5 bg-surface-container-lowest border border-outline/30 p-5 rounded-[8px]">
                      <div>
                        <label className="block font-label-sm uppercase text-secondary mb-2">Selling Price (INR)</label>
                        <input name="price" placeholder="e.g., 56900" value={carDetails.price} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none font-bold text-[18px] text-primary" />
                      </div>
                      <div>
                        <label className="block font-label-sm uppercase text-secondary mb-2">Acquisition Cost (INR)</label>
                        <input name="acquisition_cost" placeholder="e.g., 45000" value={carDetails.acquisition_cost} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none font-body-md" />
                      </div>
                      <div>
                        <label className="block font-label-sm uppercase text-secondary mb-2">Status</label>
                        <div className="relative">
                          <select name="status" value={carDetails.status} onChange={handleInputChange} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none appearance-none font-bold font-body-md text-on-surface">
                            <option value="Available">Available</option>
                            <option value="Pending Inspection">Pending Inspection</option>
                            <option value="In Prep">In Prep</option>
                            <option value="Sold">Sold</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">expand_more</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Assets */}
                  <div>
                    <h4 className="font-headline-md text-[18px] uppercase border-b border-outline/20 pb-3 mb-5">Visual Assets</h4>
                    <div className="bg-surface-container-lowest border border-outline/30 p-5 rounded-[8px]">
                      <p className="text-secondary font-body-md text-[13px] mb-4">Upload up to 7 high-resolution images. Backgrounds will be removed automatically by AI.</p>
                      
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

                      <label htmlFor="multi-camera-input" className={`w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-[8px] cursor-pointer transition-all ${frames.length >= 7 ? 'bg-surface-container border-outline/30 text-secondary pointer-events-none' : 'bg-primary/5 border-primary text-primary hover:bg-primary/10'}`}>
                        <Upload size={32} className={frames.length >= 7 ? 'text-secondary' : 'text-primary'} />
                        <span className="font-headline-md uppercase tracking-wide text-[14px]">Select Images ({frames.length}/7)</span>
                        <span className="text-[12px] opacity-70">Drag and drop or click to browse</span>
                      </label>

                      {frames.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mt-5">
                          {frames.map((f, i) => (
                            <div key={i} className="relative aspect-square rounded-[8px] overflow-hidden border border-outline/30 shadow-sm">
                              <img src={f.url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="mt-10 pt-6 border-t border-outline/20 flex flex-col sm:flex-row justify-end items-center gap-4">
                <span className="text-[13px] text-secondary font-body-md">Make sure all details are correct before publishing.</span>
                <button onClick={handlePublish} disabled={isProcessing || frames.length === 0} className="w-full sm:w-auto bg-primary text-on-primary px-10 py-3.5 rounded-[6px] font-headline-md text-[16px] uppercase tracking-wide hover:bg-[#93000e] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_10px_rgba(214,0,15,0.2)]">
                  {isProcessing ? "Submitting..." : "Submit to Inventory"}
                </button>
              </div>
            </div>
          </>
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
