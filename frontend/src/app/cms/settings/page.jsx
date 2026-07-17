"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchFormSchema, updateFormSchema, fetchModels, addSingleModel } from '@/api/inventoryApi';

export default function FormEditor() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [schema, setSchema] = useState({ customFields: [], competitors: [], features: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('fields');
  
  // Custom Fields state
  const [newField, setNewField] = useState({ name: '', type: 'text' });
  
  // Competitor state
  const [newCompetitor, setNewCompetitor] = useState({ name: '', image: '' });
  
  // Model state
  const [newModel, setNewModel] = useState({ name: '', year: '', fuel: '', transmission: '', km: '', engineCC: '', variant: '' });

  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: ['models'],
    queryFn: fetchModels
  });

  useEffect(() => {
    fetchFormSchema().then(data => {
      setSchema(data);
    });
  }, []);

  const handleSaveSchema = async () => {
    setIsSaving(true);
    try {
      await updateFormSchema(schema);
      alert("Form schema saved successfully!");
    } catch (e) {
      alert("Failed to save schema: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddField = () => {
    if (!newField.name) return;
    setSchema(prev => ({
      ...prev,
      customFields: [...(prev.customFields || []), newField]
    }));
    setNewField({ name: '', type: 'text' });
  };

  const handleRemoveField = (index) => {
    setSchema(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const handleAddCompetitor = () => {
    if (!newCompetitor.name || !newCompetitor.image) return;
    setSchema(prev => ({
      ...prev,
      competitors: [...(prev.competitors || []), newCompetitor]
    }));
    setNewCompetitor({ name: '', image: '' });
  };

  const handleRemoveCompetitor = (index) => {
    setSchema(prev => ({
      ...prev,
      competitors: prev.competitors.filter((_, i) => i !== index)
    }));
  };

  const handleAddModel = async () => {
    if (!newModel.name) return;
    try {
      const payload = {
        name: newModel.name,
        specs: JSON.stringify({
          year: newModel.year,
          fuel: newModel.fuel,
          transmission: newModel.transmission,
          km: newModel.km,
          engineCC: newModel.engineCC,
          variant: newModel.variant
        })
      };
      await addSingleModel(payload);
      alert("Model added to database successfully!");
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setNewModel({ name: '', year: '', fuel: '', transmission: '', km: '', engineCC: '', variant: '' });
    } catch (e) {
      alert("Failed to add model: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col md:flex-row justify-between md:items-center px-4 md:px-10 py-3 md:py-0 w-full max-w-[1280px] mx-auto min-h-[5rem] gap-3 md:gap-0">
          <div className="flex items-center gap-10 xl:gap-16">
            <div className="flex items-center gap-2 shrink-0 whitespace-nowrap font-label-sm text-[14px] uppercase tracking-wider font-bold">
              <Link href="/" className="text-secondary hover:text-primary transition-colors">Home</Link>
              <span className="text-secondary/50">&gt;</span>
              <Link href="/cms/dashboard" className="text-primary hover:text-[#93000e] transition-colors">CMS</Link>
              <span className="text-secondary/50">&gt;</span>
              <span className="text-on-surface">Form Editor</span>
            </div>
            <nav className="flex shrink-0 whitespace-nowrap overflow-x-auto items-center gap-4 xl:gap-8 w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/dashboard">Dashboard</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/inventory">Inventory</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms">Add Vehicle</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/enquiries">Enquiries</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/certification">Certified</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-primary border-b-2 border-primary pb-1" href="/cms/settings">Form Editor</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 md:px-10 max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase text-on-surface">Form Editor</h1>
            <p className="text-secondary font-body-md">Manage dynamic form fields, competitors, and models for the Add Vehicle page.</p>
          </div>
          <button 
            onClick={handleSaveSchema}
            disabled={isSaving}
            className="bg-primary text-on-primary flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] font-headline-md text-[18px] uppercase tracking-wide hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Schema'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-outline/20 pb-2">
          <button onClick={() => setActiveTab('fields')} className={`font-bold uppercase tracking-wider pb-2 ${activeTab === 'fields' ? 'border-b-2 border-primary text-primary' : 'text-secondary'}`}>Custom Fields</button>
          <button onClick={() => setActiveTab('competitors')} className={`font-bold uppercase tracking-wider pb-2 ${activeTab === 'competitors' ? 'border-b-2 border-primary text-primary' : 'text-secondary'}`}>Competitors</button>
          <button onClick={() => setActiveTab('models')} className={`font-bold uppercase tracking-wider pb-2 ${activeTab === 'models' ? 'border-b-2 border-primary text-primary' : 'text-secondary'}`}>Models</button>
        </div>

        {/* Tab Content */}
        <div className="bg-white p-6 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          {activeTab === 'fields' && (
            <div>
              <h2 className="font-headline-md text-[20px] uppercase mb-4">Manage Custom Fields</h2>
              <div className="flex gap-4 mb-6 items-end">
                <div className="flex-1">
                  <label className="block font-label-sm uppercase text-secondary mb-2">Field Name</label>
                  <input value={newField.name} onChange={e => setNewField({...newField, name: e.target.value})} placeholder="e.g., Warranty Status" className="w-full px-4 py-3 border border-outline/30 rounded-[6px] outline-none" />
                </div>
                <div className="w-48">
                  <label className="block font-label-sm uppercase text-secondary mb-2">Field Type</label>
                  <select value={newField.type} onChange={e => setNewField({...newField, type: e.target.value})} className="w-full px-4 py-3 border border-outline/30 rounded-[6px] outline-none">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                  </select>
                </div>
                <button onClick={handleAddField} className="bg-secondary text-white px-6 py-3 rounded-[6px] font-bold uppercase">Add Field</button>
              </div>

              <div className="space-y-3">
                {schema.customFields?.map((f, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border border-outline/20 rounded-[6px] bg-surface-container-lowest">
                    <div>
                      <span className="font-bold text-[16px]">{f.name}</span>
                      <span className="ml-4 text-secondary text-sm uppercase">[{f.type}]</span>
                    </div>
                    <button onClick={() => handleRemoveField(i)} className="text-primary font-bold hover:underline">Remove</button>
                  </div>
                ))}
                {!schema.customFields?.length && <div className="text-secondary">No custom fields added yet.</div>}
              </div>
            </div>
          )}

          {activeTab === 'competitors' && (
            <div>
              <h2 className="font-headline-md text-[20px] uppercase mb-4">Manage Competitors</h2>
              <div className="flex gap-4 mb-6 items-end">
                <div className="flex-1">
                  <label className="block font-label-sm uppercase text-secondary mb-2">Competitor Name</label>
                  <input value={newCompetitor.name} onChange={e => setNewCompetitor({...newCompetitor, name: e.target.value})} placeholder="e.g., Ford Endeavour" className="w-full px-4 py-3 border border-outline/30 rounded-[6px] outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block font-label-sm uppercase text-secondary mb-2">Image URL</label>
                  <input value={newCompetitor.image} onChange={e => setNewCompetitor({...newCompetitor, image: e.target.value})} placeholder="https://..." className="w-full px-4 py-3 border border-outline/30 rounded-[6px] outline-none" />
                </div>
                <button onClick={handleAddCompetitor} className="bg-secondary text-white px-6 py-3 rounded-[6px] font-bold uppercase">Add</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schema.competitors?.map((c, i) => (
                  <div key={i} className="flex gap-4 items-center p-4 border border-outline/20 rounded-[6px] bg-surface-container-lowest">
                    <img src={c.image} alt={c.name} className="w-16 h-12 object-cover rounded-[4px]" />
                    <div className="flex-1 font-bold text-[16px]">{c.name}</div>
                    <button onClick={() => handleRemoveCompetitor(i)} className="text-primary font-bold hover:underline">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div>
              <h2 className="font-headline-md text-[20px] uppercase mb-4">Add Vehicle Model</h2>
              <p className="text-secondary mb-6">Manually add a model to the database for use in the Add Vehicle dropdown.</p>
              
              <div className="space-y-5 max-w-[800px] mb-8">
                <div>
                  <label className="block font-label-sm uppercase text-secondary mb-2">Model Name</label>
                  <input value={newModel.name} onChange={e => setNewModel({...newModel, name: e.target.value})} placeholder="e.g., Nippon Camry Hybrid" className="w-full px-4 py-3 border border-outline/30 rounded-[6px] outline-none" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-sm uppercase text-secondary mb-2">Year</label>
                    <input value={newModel.year} onChange={e => setNewModel({...newModel, year: e.target.value})} placeholder="e.g., 2022" className="w-full px-4 py-3 border border-outline/30 rounded-[6px] outline-none" />
                  </div>
                  <div>
                    <label className="block font-label-sm uppercase text-secondary mb-2">Fuel Type</label>
                    <input value={newModel.fuel} onChange={e => setNewModel({...newModel, fuel: e.target.value})} placeholder="Petrol/Diesel/Hybrid" className="w-full px-4 py-3 border border-outline/30 rounded-[6px] outline-none" />
                  </div>
                  <div>
                    <label className="block font-label-sm uppercase text-secondary mb-2">Transmission</label>
                    <input value={newModel.transmission} onChange={e => setNewModel({...newModel, transmission: e.target.value})} placeholder="Auto/Manual/CVT" className="w-full px-4 py-3 border border-outline/30 rounded-[6px] outline-none" />
                  </div>
                  <div>
                    <label className="block font-label-sm uppercase text-secondary mb-2">Kilometers</label>
                    <input type="number" value={newModel.km} onChange={e => setNewModel({...newModel, km: e.target.value})} placeholder="e.g., 15000" className="w-full px-4 py-3 border border-outline/30 rounded-[6px] outline-none" />
                  </div>
                  <div>
                    <label className="block font-label-sm uppercase text-secondary mb-2">Engine CC</label>
                    <input type="number" value={newModel.engineCC} onChange={e => setNewModel({...newModel, engineCC: e.target.value})} placeholder="e.g., 2998" className="w-full px-4 py-3 border border-outline/30 rounded-[6px] outline-none" />
                  </div>
                  <div>
                    <label className="block font-label-sm uppercase text-secondary mb-2">Variant / Trim</label>
                    <input value={newModel.variant} onChange={e => setNewModel({...newModel, variant: e.target.value})} placeholder="e.g., 3.0L Turbo" className="w-full px-4 py-3 border border-outline/30 rounded-[6px] outline-none" />
                  </div>
                </div>
                
                <button onClick={handleAddModel} className="bg-secondary text-white px-6 py-3 rounded-[6px] font-bold uppercase w-full">Add Model to DB</button>
              </div>

              <h3 className="font-headline-md text-[16px] uppercase mb-4 pt-6 border-t border-outline/20">Existing Models in Database</h3>
              {modelsLoading ? <p>Loading...</p> : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {models.map((m, i) => (
                    <div key={i} className="p-3 bg-surface-container-lowest border border-outline/20 rounded-[6px] text-sm font-bold">{m.name}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
