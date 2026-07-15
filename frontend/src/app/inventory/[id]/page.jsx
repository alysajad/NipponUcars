"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchInventory } from '@/api/inventoryApi';
import ImageGallery from '@/components/ImageGallery';

function getDynamicCarData(carName) {
  const name = (carName || '').toLowerCase();
  
  // Default generic data
  let competitors = [
    { name: "Honda City", price: "Rs. 11.50 Lakh onwards", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098490/inventory/competitors/competitor_asset_2.jpg" },
    { name: "Hyundai Verna", price: "Rs. 10.96 Lakh onwards", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098494/inventory/competitors/competitor_asset_4.jpg" }
  ];
  let reviews = [
    { rating: 5, title: "Great daily driver", text: "Very smooth and reliable.", user: "Amit Sharma", time: "2 weeks ago" },
    { rating: 4, title: "Good value", text: "Maintenance is slightly high but good performance.", user: "Rajesh K.", time: "1 month ago" }
  ];

  if (name.includes("fortuner")) {
    competitors = [
      { name: "Ford Endeavour", price: "Rs. 36.25 Lakh onwards", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098492/inventory/competitors/competitor_asset_3.jpg" },
      { name: "MG Gloster", price: "Rs. 38.80 Lakh onwards", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098485/inventory/competitors/competitor_asset_0.jpg" }
    ];
    reviews = [
      { rating: 5, title: "King of SUVs", text: "Unmatched road presence and reliability.", user: "Vikram Singh", time: "1 week ago" },
      { rating: 5, title: "Tough as nails", text: "Driven 50k kms without a single issue.", user: "Anil D.", time: "2 months ago" }
    ];
  } else if (name.includes("supra")) {
    competitors = [
      { name: "BMW Z4", price: "Rs. 90.90 Lakh onwards", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098492/inventory/competitors/competitor_asset_3.jpg" },
      { name: "Porsche 718", price: "Rs. 1.48 Crore onwards", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098494/inventory/competitors/competitor_asset_4.jpg" }
    ];
    reviews = [
      { rating: 5, title: "Absolute beast", text: "The engine is a masterpiece.", user: "Rahul", time: "3 days ago" },
      { rating: 4, title: "Looks amazing", text: "Gets attention everywhere, slightly stiff ride.", user: "Karan", time: "1 month ago" }
    ];
  } else if (name.includes("thar")) {
    competitors = [
      { name: "Maruti Jimny", price: "Rs. 12.74 Lakh onwards", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098487/inventory/competitors/competitor_asset_1.jpg" },
      { name: "Force Gurkha", price: "Rs. 16.75 Lakh onwards", image: "https://res.cloudinary.com/vdofesxh/image/upload/v1784098492/inventory/competitors/competitor_asset_3.jpg" }
    ];
    reviews = [
      { rating: 5, title: "Best off-roader", text: "Takes on any terrain easily.", user: "Suresh", time: "1 month ago" },
      { rating: 4, title: "Bumpy ride", text: "Great for weekend trips, tough for city commute.", user: "Neha", time: "2 months ago" }
    ];
  }

  return { competitors, reviews };
}

export default function CarDetail({ params }) {
  // Next.js 15+ requires params to be unwrapped if dynamic
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;

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

  const dynamicData = getDynamicCarData(car.name);
  const reviews = dynamicData.reviews;
  const faqs = specs.faqs || [];
  const competitors = dynamicData.competitors;

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
