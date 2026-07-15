"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchInventory } from '@/api/inventoryApi';

export default function InventoryList() {
  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory
  });

  const [selectedModels, setSelectedModels] = useState([]);
  const [budgetRange, setBudgetRange] = useState({ min: 0, max: 200 }); // In Lakhs
  const [ageRange, setAgeRange] = useState({ min: 0, max: 15 }); // In Years
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const toggleModel = (model) => {
    setSelectedModels(prev => 
      prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]
    );
  };

  const filteredCars = cars.filter(car => {
    // Basic model match
    const modelMatch = selectedModels.length === 0 || selectedModels.some(m => car.name.toLowerCase().includes(m.toLowerCase()));
    
    let specs = {};
    try { specs = typeof car.specs === 'object' ? car.specs : JSON.parse(car.specs); } catch(e) {}

    // Parse price to Lakhs roughly for dummy filtering
    let priceInLakhs = 0;
    if (car.price) {
      const numericPrice = parseFloat(car.price.replace(/,/g, ''));
      if (!isNaN(numericPrice)) priceInLakhs = numericPrice / 100000;
    }
    const budgetMatch = priceInLakhs >= budgetRange.min && priceInLakhs <= budgetRange.max;

    // Parse Age (current year - manufacturing year)
    let carAge = 0; // Default to new if no year
    if (specs.year) {
      const yearStr = String(specs.year).replace(/\D/g, '');
      const yearNum = parseInt(yearStr, 10);
      if (!isNaN(yearNum)) {
        carAge = new Date().getFullYear() - yearNum;
      }
    }
    const ageMatch = carAge >= ageRange.min && carAge <= ageRange.max;

    return modelMatch && budgetMatch && ageMatch;
  });

  // Models list for checkboxes based on dummy data
  const availableModels = ["Fortuner", "Hilux", "Corolla", "Safari", "Supra", "Thar", "Nexon", "Creta", "City", "Seltos", "Slavia", "Innova"];

  return (
    <div className="inventory-list-page" style={{ minHeight: '100vh', background: 'var(--light-grey)' }}>
      <style>{`
        .multi-range::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: var(--primary-red);
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
          cursor: pointer;
        }
        .multi-range::-moz-range-thumb {
          pointer-events: auto;
          width: 18px;
          height: 18px;
          background: var(--primary-red);
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
          cursor: pointer;
        }
        .mobile-filter-btn {
          display: none !important;
        }
        .mobile-filter-close {
          display: none !important;
        }
        .inventory-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.5);
          z-index: 999;
          backdrop-filter: blur(4px);
        }
        @media (max-width: 768px) {
          .inventory-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 85%;
            max-width: 350px;
            height: 100%;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            overflow-y: auto;
            border-radius: 0 !important;
            box-shadow: 5px 0 25px rgba(0,0,0,0.1);
          }
          .inventory-sidebar.open {
            transform: translateX(0);
          }
          .mobile-filter-btn {
            display: flex !important;
          }
          .mobile-filter-close {
            display: block !important;
          }
          .inventory-overlay.open {
            display: block;
          }
          .inventory-layout {
            padding: 1rem !important;
          }
        }
      `}</style>
      <header className="inventory-header" style={{ padding: '1.5rem 4rem', background: 'var(--pure-white)', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-sailors)', fontSize: '2rem', margin: 0 }}><span className="text-red">U-Trust</span> Used Cars</h1>
          <p style={{ color: '#888', margin: 0, fontSize: '0.9rem', marginTop: '0.2rem' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={e => e.target.style.color='var(--primary-red)'} onMouseOut={e => e.target.style.color='inherit'}>Home</Link> 
            <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 4px' }} /> 
            <Link href="/inventory" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={e => e.target.style.color='var(--primary-red)'} onMouseOut={e => e.target.style.color='inherit'}>Used Cars</Link> 
            <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 4px' }} /> 
            <span style={{ color: 'var(--dark-grey)', fontWeight: 'bold' }}>All India</span>
          </p>
        </div>
        <Link href="/" className="cta-button" style={{ margin: 0, padding: '0.6rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Home size={16} /> BACK TO HOME
        </Link>
      </header>

      <div className="inventory-layout" style={{ display: 'flex', gap: '2rem', padding: '2rem 2rem', maxWidth: '100%', margin: '0', flexWrap: 'wrap' }}>
        
        <div className={`inventory-overlay ${isMobileFilterOpen ? 'open' : ''}`} onClick={() => setIsMobileFilterOpen(false)} />

        {/* Left Sidebar Filters */}
        <aside className={`inventory-sidebar ${isMobileFilterOpen ? 'open' : ''}`} style={{ width: '280px', flexShrink: 0, background: 'var(--pure-white)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              Filters
            </h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button onClick={() => {setSelectedModels([]); setBudgetRange({min:0, max:200})}} style={{ background: 'none', border: 'none', color: 'var(--primary-red)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>Clear All</button>
              <button className="mobile-filter-close" onClick={() => setIsMobileFilterOpen(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', lineHeight: 0.5, cursor: 'pointer', color: '#888' }}>&times;</button>
            </div>
          </div>
          
          {/* Seller Type Mock */}
          <div className="filter-group" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #eee' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--dark-grey)' }}>Seller Type</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--primary-red)' }} /> Cars From Dealer Partners <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#999' }}>(1233)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--primary-red)' }} /> Direct Owner Cars <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#999' }}>(2956)</span>
              </label>
            </div>
          </div>

          {/* City Mock */}
          <div className="filter-group" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #eee' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--dark-grey)' }}>City</h4>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input type="text" placeholder="India" style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.9rem' }} />
              <span style={{ position: 'absolute', right: '10px', top: '10px', color: '#999' }}>🔍</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Popular Cities</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Coimbatore'].map(c => (
                <button key={c} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '20px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#555', cursor: 'pointer' }}>{c}</button>
              ))}
              <button style={{ background: '#fff', border: '1px solid var(--primary-red)', color: 'var(--primary-red)', borderRadius: '20px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer' }}>All Cities</button>
            </div>
          </div>
          
          <div className="filter-group" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #eee' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--dark-grey)' }}>Budget (Lakh)</h4>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <input type="number" value={budgetRange.min} onChange={(e) => setBudgetRange({...budgetRange, min: Number(e.target.value)})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
               <span>-</span>
               <input type="number" value={budgetRange.max} onChange={(e) => setBudgetRange({...budgetRange, max: Number(e.target.value)})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
          </div>

          <div className="filter-group" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--dark-grey)' }}>Make / Model</h4>
              <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>^</span>
            </div>
            <input type="text" placeholder="Search Make / Model" style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.9rem', marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Popular Brands</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '200px', overflowY: 'auto' }}>
              {availableModels.map(model => (
                <label key={model} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}>
                  <input type="checkbox" checked={selectedModels.includes(model)} onChange={() => toggleModel(model)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary-red)' }} />
                  {model} <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#999' }}>(+)</span>
                </label>
              ))}
            </div>
          </div>

          {/* Car Age Filter */}
          <div className="filter-group" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #eee' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--dark-grey)' }}>Car Age (Year)</h4>
            
            <div style={{ position: 'relative', height: '20px', width: '100%', marginTop: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
              <input 
                type="range" min="0" max="15" value={ageRange.min} 
                onChange={(e) => setAgeRange(prev => ({...prev, min: Math.min(Number(e.target.value), prev.max - 1)}))}
                style={{ position: 'absolute', width: '100%', pointerEvents: 'none', zIndex: 3, appearance: 'none', background: 'transparent' }} 
                className="multi-range"
              />
              <input 
                type="range" min="0" max="15" value={ageRange.max} 
                onChange={(e) => setAgeRange(prev => ({...prev, max: Math.max(Number(e.target.value), prev.min + 1)}))}
                style={{ position: 'absolute', width: '100%', pointerEvents: 'none', zIndex: 4, appearance: 'none', background: 'transparent' }} 
                className="multi-range"
              />
              <div style={{ position: 'absolute', left: 0, right: 0, height: '4px', background: '#e0e0e0', borderRadius: '2px', zIndex: 1 }} />
              <div style={{ position: 'absolute', left: `${(ageRange.min/15)*100}%`, right: `${100 - (ageRange.max/15)*100}%`, height: '4px', background: 'var(--primary-red)', borderRadius: '2px', zIndex: 2 }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#999', marginBottom: '1rem' }}>
               <span>0 Year</span>
               <span>15+ Year</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <input type="number" value={ageRange.min} onChange={(e) => setAgeRange(prev => ({...prev, min: Math.min(Number(e.target.value), prev.max)}))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', textAlign: 'center' }} />
               <span>-</span>
               <input type="number" value={ageRange.max} onChange={(e) => setAgeRange(prev => ({...prev, max: Math.max(Number(e.target.value), prev.min)}))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', textAlign: 'center' }} />
            </div>
          </div>

          {/* Fuel Mock */}
          <div className="filter-group" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--dark-grey)' }}>Fuel</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--primary-red)' }} /> Petrol <span style={{ color: '#999', fontSize: '0.8rem', marginLeft: 'auto' }}>(2909)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--primary-red)' }} /> Diesel <span style={{ color: '#999', fontSize: '0.8rem', marginLeft: 'auto' }}>(1220)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--primary-red)' }} /> CNG <span style={{ color: '#999', fontSize: '0.8rem', marginLeft: 'auto' }}>(345)</span>
              </label>
            </div>
          </div>

        </aside>

        {/* Right Main Grid */}
        <main className="inventory-main" style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--dark-grey)' }}>{filteredCars.length} Used Cars in India</h2>
            <button 
              className="mobile-filter-btn"
              onClick={() => setIsMobileFilterOpen(true)}
              style={{ background: 'var(--pure-white)', border: '1px solid #ddd', padding: '0.5rem 1rem', borderRadius: '8px', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--dark-grey)', cursor: 'pointer' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              Filters
            </button>
          </div>
          
          {isLoading ? (
            <div className="showcase-loading">Loading inventory...</div>
          ) : filteredCars.length > 0 ? (
            <div className="showcase-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {filteredCars.map((car) => {
                let specs = {};
                try { specs = typeof car.specs === 'object' ? car.specs : JSON.parse(car.specs); } catch(e) { }
                const coverImage = car.frames && car.frames.length > 0 ? car.frames[0] : '/placeholder-car.jpg';
                const descText = (car.desc && car.desc !== 'null') ? car.desc : (specs.variant || 'Premium Selection');
                
                return (
                  <Link href={`/inventory/detail?id=${car.id}`} style={{ textDecoration: 'none', color: 'inherit' }} key={car.id}>
                    <div className="showcase-card" style={{ width: '100%', maxWidth: '100%', minWidth: '0', display: 'block', height: '100%' }}>
                      <div className="showcase-img-wrap" style={{ height: '160px', background: '#f8f8f8', padding: '0.5rem' }}>
                        <img src={coverImage} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                      <div className="showcase-card-content" style={{ padding: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--dark-grey)' }}>{car.name}</h3>
                        <p className="car-variant" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>
                          {specs.km || 'N/A'} km | {specs.fuel || 'Petrol'} | {specs.transmission || 'Auto'}
                        </p>
                        
                        <div className="car-price-row" style={{ borderTop: '1px dashed #eee', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="car-price" style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--dark-grey)' }}>{car.price ? `${car.price}` : 'Make Offer'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                          <button style={{ flex: '1', padding: '0.75rem 0.5rem', background: 'transparent', color: 'var(--primary-red)', border: '1px solid var(--primary-red)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}>
                            Car Details
                          </button>
                          <button style={{ flex: '1.5', padding: '0.75rem 0.5rem', background: 'var(--primary-red)', color: 'white', border: '1px solid var(--primary-red)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.3s' }}>
                            Get Seller Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="showcase-empty" style={{ background: 'var(--pure-white)', padding: '3rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #eee' }}>
              No vehicles match your filters. Try clearing them to see more cars.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
