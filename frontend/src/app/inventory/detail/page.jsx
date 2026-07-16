"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchInventory } from '@/api/inventoryApi';
import ImageGallery from '@/components/ImageGallery';


import { useSearchParams } from 'next/navigation';

export default function CarDetailPage() {
  return (
    <React.Suspense fallback={<div className="detail-page-container flex items-center justify-center min-h-screen">Loading details...</div>}>
      <CarDetail />
    </React.Suspense>
  );
}

function CarDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory
  });

  const car = useMemo(() => cars.find(c => c.id === id), [cars, id]);

  if (isLoading) {
    return <div className="detail-page-container flex items-center justify-center min-h-screen">Loading details...</div>;
  }

  if (!car) {
    return (
      <div className="detail-page-container flex flex-col items-center justify-center min-h-screen">
        <h2>Car Not Found</h2>
        <Link href="/inventory" className="cta-button mt-4">Back to Inventory</Link>
      </div>
    );
  }

  let specs = {};
  try {
    specs = typeof car.specs === 'object' ? car.specs : JSON.parse(car.specs);
  } catch(e) {}

  const variantText = (car.desc && car.desc !== 'null') ? car.desc : (specs.variant || 'Premium Selection');
  const coverImage = car.frames && car.frames.length > 0 ? car.frames[0] : '/placeholder-car.jpg';

  const reviews = specs.reviews || [];
  const faqs = specs.faqs || [];
  const competitors = specs.competitors || [];

  return (
    <div className="detail-page-container">
      <header className="detail-header-nav">
        <Link href="/inventory" className="nav-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> BACK TO INVENTORY
        </Link>
        <Link href="/" className="nav-btn">
          <Home size={18} /> HOME
        </Link>
      </header>

      <main className="detail-main-layout">
        
        {/* HERO SECTION */}
        <section className="detail-hero-section">
          <div className="detail-image-gallery">
            {car.frames && car.frames.length > 1 ? (
              <ImageGallery frames={car.frames} initialScale={1} />
            ) : (
              <img src={coverImage} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            )}
          </div>
          <div className="detail-hero-info">
            <h1 style={{ fontSize: '2.5rem', margin: 0, fontFamily: 'var(--font-sailors)' }}>{car.name}</h1>
            <p style={{ fontSize: '1.2rem', color: '#666', marginTop: '0.5rem' }}>{variantText}</p>
            
            <div className="detail-price">
              {car.price ? car.price : 'Price on Request'}
            </div>
            
            <div className="detail-grid-specs">
              <div className="detail-grid-item">
                <span>YEAR</span>
                <strong>{specs.year || '2023'}</strong>
              </div>
              <div className="detail-grid-item">
                <span>FUEL</span>
                <strong>{specs.fuel || 'Petrol'}</strong>
              </div>
              <div className="detail-grid-item">
                <span>TRANSMISSION</span>
                <strong>{specs.transmission || 'Automatic'}</strong>
              </div>
              <div className="detail-grid-item">
                <span>KILOMETERS</span>
                <strong>{specs.km || '8,500'}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* PRICE REVIEWS MODULE */}
        {reviews.length > 0 && (
          <section className="detail-module">
            <h2>Price Reviews for {car.name}</h2>
            <div className="reviews-list">
              {reviews.map((r, i) => (
                <div key={i} className="review-item">
                  <div className="review-rating">
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </div>
                  <div className="review-title">{r.title}</div>
                  <div className="review-text">{r.text}</div>
                  <div className="review-author">{r.user} • {r.time}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* COMPETITORS MODULE */}
        {competitors.length > 0 && (
          <section className="detail-module">
            <h2>Prices of {car.name}'s Competitors</h2>
            <div className="competitor-list">
              {competitors.map((comp, i) => (
                <div key={i} className="competitor-card">
                  <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
                    <img src={comp.image} alt={comp.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                  </div>
                  <div className="competitor-card-info">
                    <h4>{comp.name}</h4>
                    <p style={{ color: 'var(--primary-red)', fontWeight: 'bold' }}>{comp.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQS MODULE */}
        {faqs.length > 0 && (
          <section className="detail-module">
            <h2>FAQs</h2>
            <div className="faqs-list">
              {faqs.map((faq, i) => (
                <div key={i} className="faq-item">
                  <div className="faq-q">Q: {faq.q}</div>
                  <div className="faq-a">{faq.a}</div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
