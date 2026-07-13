import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import ImageViewer360 from '../components/ImageViewer360';
import gsap from 'gsap';

import { useQuery } from '@tanstack/react-query';
import { fetchInventory } from '../api/inventoryApi';

export default function Inventory() {
  const { data: cars = [], isLoading: isReady } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const changeCar = useCallback((newIndex) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    gsap.to(".fade-content", {
      opacity: 0,
      y: -10,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setActiveIndex(newIndex);
      }
    });
  }, [isTransitioning]);

  const nextCar = useCallback(() => {
    if (cars.length > 0) changeCar((activeIndex + 1) % cars.length);
  }, [activeIndex, changeCar, cars]);
  
  const prevCar = useCallback(() => {
    if (cars.length > 0) changeCar((activeIndex - 1 + cars.length) % cars.length);
  }, [activeIndex, changeCar, cars]);

  useEffect(() => {
    gsap.fromTo(".fade-content", 
      { opacity: 0, y: 15 }, 
      { 
        opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.15,
        onComplete: () => setIsTransitioning(false)
      }
    );
  }, [activeIndex]);

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

  return (
    <div className="inventory-page">
      <Link to="/" className="inventory-back-link">
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
      
      <div className="inventory-info-panel">
        <h2 className="fade-content">{currentCar.desc}</h2>
        <div className="inventory-specs fade-content">
          <div>
             <span>SPECS</span>
             {currentCar.specs}
          </div>
          <div>
             <span>EST. PRICE</span>
             {currentCar.price}
          </div>
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
