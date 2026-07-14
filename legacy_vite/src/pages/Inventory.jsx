import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Home, MapPin, Gauge, Droplets, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchInventory } from '../api/inventoryApi';

export default function Inventory() {
  const { data: rawCars = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory
  });

  // Safely parse attributes
  const cars = useMemo(() => {
    return rawCars.map(car => {
      let attrs = {};
      try {
        if (car.specs && car.specs.startsWith('{')) {
          attrs = JSON.parse(car.specs);
        }
      } catch(e) {
        // legacy records
      }
      return { ...car, attrs };
    });
  }, [rawCars]);

  const [filters, setFilters] = useState({
    brand: [],
    location: [],
    fuel: []
  });

  // Extract unique filter options
  const uniqueBrands = [...new Set(cars.map(c => c.attrs.brand).filter(Boolean))];
  const uniqueLocations = [...new Set(cars.map(c => c.attrs.location).filter(Boolean))];
  const uniqueFuels = [...new Set(cars.map(c => c.attrs.fuel).filter(Boolean))];

  const handleFilterChange = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  // Filter cars client-side
  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      const b = filters.brand.length === 0 || filters.brand.includes(car.attrs.brand);
      const l = filters.location.length === 0 || filters.location.includes(car.attrs.location);
      const f = filters.fuel.length === 0 || filters.fuel.includes(car.attrs.fuel);
      return b && l && f;
    });
  }, [cars, filters]);

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Inventory...</div>;

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: 'white', padding: '15px 40px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#1A3B5C', margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-sailors)' }}>U-CARS INVENTORY</h1>
        <Link to="/" style={{ color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
          <Home size={18} /> Back Home
        </Link>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, padding: '20px 40px', gap: '30px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Sidebar Filters */}
        <div style={{ width: '250px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: 'fit-content', flexShrink: 0 }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem' }}>Filters</h3>
          
          <FilterSection title="Location" options={uniqueLocations} selected={filters.location} onChange={(val) => handleFilterChange('location', val)} />
          <FilterSection title="Brand" options={uniqueBrands} selected={filters.brand} onChange={(val) => handleFilterChange('brand', val)} />
          <FilterSection title="Fuel Type" options={uniqueFuels} selected={filters.fuel} onChange={(val) => handleFilterChange('fuel', val)} />
          
          {filteredCars.length === 0 && (
            <button 
              onClick={() => setFilters({brand:[], location:[], fuel:[]})} 
              style={{ width: '100%', padding: '10px', background: '#e32636', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Car Grid */}
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 20px 0', color: '#666', fontWeight: 'bold' }}>{filteredCars.length} Used Cars Found</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredCars.map(car => (
              <div key={car.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Image Placeholder with Cloudinary bg removal */}
                <div style={{ height: '200px', background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)', position: 'relative' }}>
                  {car.frames && car.frames[0] ? (
                     <img src={car.frames[0]} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'darken' }} />
                  ) : (
                     <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>No Image</div>
                  )}
                  {car.attrs.location && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#e32636"/> {car.attrs.location}
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '15px' }}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#1a3b5c', fontSize: '1.2rem' }}>{car.attrs.year} {car.name}</h3>
                  <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '0.9rem' }}>{car.desc || "Great condition"}</p>
                  
                  <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px', fontSize: '0.8rem', color: '#555' }}>
                    {car.attrs.km && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Gauge size={14} /> {car.attrs.km} km</span>}
                    {car.attrs.fuel && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Droplets size={14} /> {car.attrs.fuel}</span>}
                    {car.attrs.transmission && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{car.attrs.transmission}</span>}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#222' }}>{car.price}</span>
                    <button style={{ background: 'none', border: 'none', color: '#e32636', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                      View <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, options, selected, onChange }) {
  if (!options || options.length === 0) return null;
  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>{title}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {options.map(opt => (
          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input 
              type="checkbox" 
              checked={selected.includes(opt)} 
              onChange={() => onChange(opt)} 
              style={{ accentColor: '#e32636' }}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}
