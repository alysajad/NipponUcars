"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import ImageViewer360 from '@/components/ImageViewer360';
import gsap from 'gsap';

import { useQuery } from '@tanstack/react-query';
import { fetchInventory } from '@/api/inventoryApi';

export default function Inventory() {
  const { data: cars = [], isLoading: isReady } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [slideDir, setSlideDir] = useState(1);

  const changeCar = useCallback((newIndex) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    let dir = newIndex > activeIndex ? 1 : -1;
    if (activeIndex === cars.length - 1 && newIndex === 0) dir = 1;
    if (activeIndex === 0 && newIndex === cars.length - 1) dir = -1;
    setSlideDir(dir);

    gsap.to(".fade-content", {
      opacity: 0,
      x: dir * -80,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => {
        setActiveIndex(newIndex);
      }
    });
  }, [isTransitioning, activeIndex, cars.length]);

  const nextCar = useCallback(() => {
    if (cars.length > 0) changeCar((activeIndex + 1) % cars.length);
  }, [activeIndex, changeCar, cars]);
  
  const prevCar = useCallback(() => {
    if (cars.length > 0) changeCar((activeIndex - 1 + cars.length) % cars.length);
  }, [activeIndex, changeCar, cars]);

  useEffect(() => {
    gsap.fromTo(".fade-content", 
      { opacity: 0, x: slideDir * 80 }, 
      { 
        opacity: 1, x: 0, duration: 0.6, ease: "power2.out", delay: 0.05,
        onComplete: () => setIsTransitioning(false)
      }
    );
  }, [activeIndex]); // Re-run animation when activeIndex updates

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextCar();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevCar();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nextCar, prevCar]);

  if (isReady || cars.length === 0) return <div>Loading...</div>;

  const currentCar = cars[activeIndex];
  let specs = {};
  try {
    specs = JSON.parse(currentCar.specs || "{}");
  } catch(e) {
    // leave empty
  }

  return (
    <div className="inventory-page">
      <Link href="/" className="inventory-back-link">
        <Home size={20} /> BACK TO HOME
      </Link>
      
      <div className="inventory-bg-title">
         <h1 className="fade-content">{currentCar.name}</h1>
      </div>

      <div className="fade-content" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <ImageViewer360 
          folderPath={`/cars/${currentCar.id}`} 
          activeIndex={activeIndex} 
          initialScale={currentCar.scale}
          customFrames={currentCar.frames}
        />
      </div>
      
      {/* TOP LEFT: Title & Price */}
      <div className="inventory-panel tl fade-content">
        <h2>{currentCar.desc && currentCar.desc !== 'null' ? currentCar.desc : specs.variant}</h2>
        <div style={{ marginTop: '1rem' }}>
           <span className="panel-label">EST. PRICE</span>
           <div className="price-tag">{currentCar.price}</div>
        </div>
      </div>

      {/* BOTTOM LEFT: Key Features */}
      <div className="inventory-panel bl fade-content">
        {specs.features && specs.features.length > 0 && (
          <div>
            <span className="panel-label">KEY FEATURES</span>
            <div className="features-wrap">
              {specs.features.map((feat, i) => (
                <span key={i} className="feature-badge">{feat}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TOP RIGHT: Basic Specs */}
      <div className="inventory-panel tr fade-content">
        <div className="specs-grid-2x2">
          <div className="spec-box"><span>YEAR</span>{specs.year || 'N/A'}</div>
          <div className="spec-box"><span>FUEL</span>{specs.fuel || 'N/A'}</div>
          <div className="spec-box"><span>TRANS</span>{specs.transmission || 'N/A'}</div>
          <div className="spec-box"><span>DRIVEN</span>{specs.km ? `${specs.km} km` : 'N/A'}</div>
        </div>
      </div>

      {/* BOTTOM RIGHT: Tech Specs */}
      <div className="inventory-panel br fade-content">
         <div className="specs-grid-2x2 right-align">
            <div className="spec-box"><span>ENGINE</span>{specs.engineCC ? `${specs.engineCC} cc` : 'N/A'}</div>
            <div className="spec-box"><span>CLEARANCE</span>{specs.groundClearance ? `${specs.groundClearance} mm` : 'N/A'}</div>
            <div className="spec-box"><span>BOOT SPACE</span>{specs.bootSpace ? `${specs.bootSpace} L` : 'N/A'}</div>
            <div className="spec-box"><span>MILEAGE</span>{specs.mileage ? `${specs.mileage} kmpl` : 'N/A'}</div>
         </div>
      </div>

      <div className="inventory-controls">
         <button onClick={prevCar} className="inventory-nav-btn" disabled={isTransitioning} aria-label="Previous car">
           <ChevronLeft size={28} />
         </button>
         <button onClick={nextCar} className="inventory-nav-btn" disabled={isTransitioning} aria-label="Next car">
           <ChevronRight size={28} />
         </button>
      </div>

      <div className="inventory-dots">
        {cars.map((_, idx) => (
          <button
            key={idx}
            className={`inventory-dot ${idx === activeIndex ? 'active' : ''}`}
            onClick={() => changeCar(idx)}
            aria-label={`View ${cars[idx].name}`}
          />
        ))}
      </div>
    </div>
  );
}
