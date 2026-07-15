"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ImageGallery from '@/components/ImageGallery';
import gsap from 'gsap';
import { useQuery } from '@tanstack/react-query';
import { fetchInventory } from '@/api/inventoryApi';

export default function InventorySlider() {
  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slideDirRef = useRef(1);

  const changeCar = useCallback((newIndex) => {
    if (isTransitioning || cars.length === 0) return;
    setIsTransitioning(true);

    let dir = newIndex > activeIndex ? 1 : -1;
    if (activeIndex === cars.length - 1 && newIndex === 0) dir = 1;
    if (activeIndex === 0 && newIndex === cars.length - 1) dir = -1;
    slideDirRef.current = dir;

    const els = document.querySelectorAll(".inv-animate");
    if (els.length === 0) {
      setActiveIndex(newIndex);
      setIsTransitioning(false);
      return;
    }

    gsap.to(els, {
      opacity: 0,
      x: dir * -60,
      duration: 0.3,
      ease: "power2.in",
      stagger: 0.02,
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
    const els = document.querySelectorAll(".inv-animate");
    if (els.length === 0) {
      setIsTransitioning(false);
      return;
    }
    gsap.fromTo(els, 
      { opacity: 0, x: slideDirRef.current * 60 }, 
      { 
        opacity: 1, x: 0, duration: 0.5, ease: "power2.out", delay: 0.05,
        stagger: 0.03,
        onComplete: () => setIsTransitioning(false)
      }
    );
  }, [activeIndex]);

  if (isLoading || cars.length === 0) return <div className="inventory-slider-container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading inventory...</div>;

  const currentCar = cars[activeIndex];
  let specs = {};
  if (currentCar.specs) {
    if (typeof currentCar.specs === 'object') {
      specs = currentCar.specs;
    } else {
      try { specs = JSON.parse(currentCar.specs); } catch(e) {}
    }
  }
  const descText = (currentCar.desc && currentCar.desc !== 'null') ? currentCar.desc : (specs.variant || currentCar.name);

  return (
    <div className="inventory-slider-container">
      <Link href="/inventory" className="explore-all-link">
        EXPLORE FULL INVENTORY →
      </Link>
      
      <div className="inventory-bg-title">
         <h1 className="inv-animate">{currentCar.name}</h1>
      </div>

      <div className="inv-animate" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <ImageGallery 
          frames={currentCar.frames}
          initialScale={currentCar.scale || 1}
        />
      </div>
      
      <div className="inv-top-bar">
        <div className="inv-top-left inv-animate">
          <p className="inv-car-name">{currentCar.name}</p>
          <h2>{descText}</h2>
        </div>
        <div className="inv-top-right inv-animate">
          <p className="inv-price-label">Est. Price</p>
          <div className="inv-price">{currentCar.price}</div>
        </div>
      </div>

      <div className="inv-bottom-bar">
        <div className="inv-bottom-left inv-animate">
          <div className="inv-specs-row">
            {specs.year && <div className="inv-spec-item"><span>YEAR</span>{specs.year}</div>}
            {specs.fuel && <div className="inv-spec-item"><span>FUEL</span>{specs.fuel}</div>}
            {specs.transmission && <div className="inv-spec-item"><span>TRANS</span>{specs.transmission}</div>}
            {specs.km && <div className="inv-spec-item"><span>KM</span>{specs.km}</div>}
            {specs.engineCC && <div className="inv-spec-item"><span>ENGINE</span>{specs.engineCC} cc</div>}
            {specs.owner && <div className="inv-spec-item"><span>OWNER</span>{specs.owner}</div>}
          </div>
        </div>
        <div className="inv-bottom-right inv-animate">
          {specs.features && specs.features.length > 0 && (
            <div>
              <p className="inv-features-label">Features</p>
              <div className="inv-features-wrap">
                {specs.features.map((feat, i) => (
                  <span key={i} className="inv-feature-badge">{feat}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="inventory-controls">
         <button onClick={prevCar} className="inventory-nav-btn" disabled={isTransitioning} aria-label="Previous car">
           <ChevronLeft size={24} />
         </button>
         <button onClick={nextCar} className="inventory-nav-btn" disabled={isTransitioning} aria-label="Next car">
           <ChevronRight size={24} />
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
      <div style={{ display: 'none' }}>
         {cars[(activeIndex + 1) % cars.length]?.frames?.[0] && <img src={cars[(activeIndex + 1) % cars.length].frames[0]} alt="preload-next" />}
         {cars[(activeIndex - 1 + cars.length) % cars.length]?.frames?.[0] && <img src={cars[(activeIndex - 1 + cars.length) % cars.length].frames[0]} alt="preload-prev" />}
      </div>
    </div>
  );
}
