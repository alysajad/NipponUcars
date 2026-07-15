"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchInventory } from '@/api/inventoryApi';
import Link from 'next/link';
import ScrollStack, { ScrollStackItem } from './ScrollStack';

export default function InventoryScrollStack() {
  const { data: cars, isLoading, isError } = useQuery({
    queryKey: ['inventory', 'premium'],
    queryFn: fetchInventory
  });

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '2rem 0', backgroundColor: '#ffffff' }}>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        <ScrollStack 
          useWindowScroll={true}
          itemDistance={600}
          itemScale={0.03}
          itemStackDistance={40}
          stackPosition="15%"
          scaleEndPosition="5%"
          baseScale={0.85}
          scaleDuration={0.5}
        >
          {premiumCars.map((car, index) => (
            <ScrollStackItem key={car.id || index}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                
                {/* Title & Price */}
                <div style={{ textAlign: 'center', marginBottom: '3rem', zIndex: 10 }}>
                  <h3 style={{ fontSize: '3rem', fontFamily: 'var(--font-sailors)', color: 'var(--dark-grey)', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {car.name}
                  </h3>
                  <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-red)', margin: '0.5rem 0 0 0' }}>
                    {car.price ? car.price : 'Price on Request'}
                  </p>
                </div>
                
                {/* Center Content: Left Specs - Image - Right Specs */}
                <div className="car-stack-center" style={{ zIndex: 10 }}>
                  
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
                <div style={{ marginTop: '3rem', zIndex: 10 }}>
                  <Link 
                    href={`/inventory/${car.id}`} 
                    className="cta-button" 
                    style={{ display: 'inline-block', padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '40px', background: 'var(--primary-red)', color: 'white', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(220, 38, 38, 0.2)', transition: 'all 0.3s ease' }}
                  >
                    See Full Details →
                  </Link>
                </div>

              </div>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>
    </div>
  );
}
