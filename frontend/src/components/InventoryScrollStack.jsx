"use client";

import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchInventory } from '@/api/inventoryApi';
import Link from 'next/link';
import CircularGallery from './CircularGallery';

export default function InventoryScrollStack() {
  const { data: cars, isLoading, isError } = useQuery({
    queryKey: ['inventory', 'premium'],
    queryFn: fetchInventory
  });
  
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryRef = useRef(null);

  if (isLoading) {
    return (
      <div className="scroll-stack-wrapper flex items-center justify-center" style={{ height: '500px' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (isError || !cars) {
    return (
      <div className="scroll-stack-wrapper flex items-center justify-center" style={{ height: '500px' }}>
        <p>Failed to load premium inventory.</p>
      </div>
    );
  }

  const premiumCars = cars.slice(0, 8);
  const galleryItems = premiumCars.map(car => ({
    image: car.frames && car.frames.length > 0 ? car.frames[0] : '/placeholder-car.jpg',
    text: car.name || 'Car'
  }));

  const activeCar = premiumCars[activeIndex] || premiumCars[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '2rem 0', background: 'var(--pure-white)' }}>
      
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', zIndex: 10 }}>
        {activeCar && (
          <>
            <h3 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-sailors)', color: 'var(--dark-grey)', margin: 0 }}>
              {activeCar.name}
            </h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-red)', margin: 0 }}>
              {activeCar.price ? activeCar.price : 'Price on Request'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
               <span style={{ background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', color: '#555', border: '1px solid #ddd' }}>
                 {activeCar.specs?.km || '8,500'} km
               </span>
               <span style={{ background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', color: '#555', border: '1px solid #ddd' }}>
                 {activeCar.specs?.fuel || 'Petrol'}
               </span>
               <span style={{ background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', color: '#555', border: '1px solid #ddd' }}>
                 {activeCar.specs?.transmission || 'Automatic'}
               </span>
            </div>
            <Link 
              href={`/inventory/${activeCar.id}`} 
              className="cta-button" 
              style={{ marginTop: '0.5rem', padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '30px' }}
            >
              See Full Details →
            </Link>
          </>
        )}
      </div>

      <div style={{ width: '100%', height: '500px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Left Arrow Button */}
        <button 
          onClick={() => galleryRef.current?.prev()} 
          style={{ position: 'absolute', left: '2rem', zIndex: 20, width: '50px', height: '50px', borderRadius: '50%', background: 'var(--pure-white)', border: '2px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', color: 'var(--primary-red)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
          <CircularGallery 
            ref={galleryRef}
            items={galleryItems} 
            bend={0} 
            textColor="#ffffff" 
            borderRadius={0.05}
            onActiveChange={setActiveIndex} 
          />
        </div>

        {/* Right Arrow Button */}
        <button 
          onClick={() => galleryRef.current?.next()} 
          style={{ position: 'absolute', right: '2rem', zIndex: 20, width: '50px', height: '50px', borderRadius: '50%', background: 'var(--pure-white)', border: '2px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', color: 'var(--primary-red)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>

      </div>
    </div>
  );
}
