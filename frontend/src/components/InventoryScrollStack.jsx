"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchInventory } from '@/api/inventoryApi';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function InventoryScrollStack() {
  const { data: cars, isLoading, isError } = useQuery({
    queryKey: ['inventory', 'premium'],
    queryFn: fetchInventory
  });

  const [currentIndex, setCurrentIndex] = useState(0);

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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === premiumCars.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? premiumCars.length - 1 : prev - 1));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', position: 'relative', overflow: 'hidden', padding: '2rem 0' }}>
        
        {/* Navigation Buttons */}
        <button 
          onClick={prevSlide}
          className="slider-arrow"
          style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 50, background: 'var(--pure-white)', border: '1px solid #eee', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}
        >
          <ChevronLeft size={24} color="var(--dark-grey)" />
        </button>

        <button 
          onClick={nextSlide}
          className="slider-arrow"
          style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 50, background: 'var(--pure-white)', border: '1px solid #eee', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}
        >
          <ChevronRight size={24} color="var(--dark-grey)" />
        </button>

        {/* Slider Container */}
        <div style={{ display: 'grid', width: '100%', alignItems: 'center', justifyItems: 'center' }}>
          {premiumCars.map((car, index) => {
            
            // Stacking Logic
            const isCurrent = index === currentIndex;
            const isNext = index > currentIndex;
            const isPrev = index < currentIndex;
            
            // Default styles
            let transform = 'translateX(100%)';
            let opacity = 0;
            let zIndex = 1;

            if (isCurrent) {
              transform = 'translateX(0) scale(1)';
              opacity = 1;
              zIndex = 20;
            } else if (isPrev) {
              // Fade out to the left
              transform = 'translateX(-30%) scale(0.95)';
              opacity = 0;
              zIndex = 10;
            } else if (isNext) {
              // Slide in from right (like a stack)
              transform = 'translateX(100%) scale(1)';
              opacity = 1; // Keep visible while sliding in
              zIndex = 30; // Slide on TOP of current
            }

            return (
              <div 
                key={car.id || index}
                style={{ 
                  gridArea: '1 / 1',
                  width: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease',
                  transform: transform,
                  opacity: isNext ? 1 : opacity, // Ensure next elements in stack are opaque if they are sliding in
                  visibility: (isCurrent || isNext || isPrev) ? 'visible' : 'hidden', // Optimize render
                  zIndex: zIndex,
                  pointerEvents: isCurrent ? 'auto' : 'none',
                  backgroundColor: '#ffffff'
                }}
              >
                
                {/* Title & Price */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <h3 style={{ fontSize: '3rem', fontFamily: 'var(--font-sailors)', color: 'var(--dark-grey)', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {car.name}
                  </h3>
                  <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-red)', margin: '0.5rem 0 0 0' }}>
                    {car.price ? car.price : 'Price on Request'}
                  </p>
                </div>
                
                {/* Center Content: Left Specs - Image - Right Specs */}
                <div className="car-stack-center" style={{ width: '100%' }}>
                  
                  {/* Left Specs */}
                  <div className="car-stack-specs left">
                    <div style={{ background: 'var(--pure-white)', padding: '1.2rem 1.5rem', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', minWidth: '160px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>Mileage</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333' }}>{car.specs?.km || '8,500'} km</span>
                    </div>
                  </div>

                  {/* Car Image */}
                  <div className="car-stack-image">
                    <img 
                      src={car.frames && car.frames.length > 0 ? car.frames[0] : '/placeholder-car.jpg'} 
                      alt={car.name}
                      style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
                    />
                  </div>

                  {/* Right Specs */}
                  <div className="car-stack-specs right">
                    <div style={{ background: 'var(--pure-white)', padding: '1.2rem 1.5rem', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', minWidth: '160px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>Fuel Type</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333' }}>{car.specs?.fuel || 'Petrol'}</span>
                    </div>
                    <div style={{ background: 'var(--pure-white)', padding: '1.2rem 1.5rem', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', minWidth: '160px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>Transmission</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333' }}>{car.specs?.transmission || 'Automatic'}</span>
                    </div>
                  </div>
                  
                </div>

                {/* CTA Button */}
                <div style={{ marginTop: '3rem' }}>
                  <Link 
                    href={`/inventory/detail?id=${car.id}`} 
                    className="cta-button" 
                    style={{ display: 'inline-block', padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '40px', background: 'var(--primary-red)', color: 'white', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(220, 38, 38, 0.2)', transition: 'all 0.3s ease' }}
                  >
                    See Full Details →
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
