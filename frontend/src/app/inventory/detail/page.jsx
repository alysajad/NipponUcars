"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchInventory } from '@/api/inventoryApi';
import ImageGallery from '@/components/ImageGallery';
import { useSearchParams } from 'next/navigation';

export default function CarDetailPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-secondary">Loading details...</div>}>
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
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-secondary font-body-md">Loading details...</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <h2 className="font-headline-md text-headline-md uppercase mb-4">Car Not Found</h2>
        <Link href="/inventory" className="bg-primary text-on-primary px-6 py-3 rounded-[6px] font-headline-md text-[16px] uppercase tracking-wide hover:bg-[#93000e] transition-all">
          Back to Inventory
        </Link>
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
  const features = specs.features || [];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center px-10 w-full max-w-[1280px] mx-auto h-20">
          <div className="font-headline-md text-headline-md font-bold text-primary uppercase tracking-wider">PREMIER AUTO</div>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="font-headline-md text-headline-md uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/inventory">Inventory</Link>
            <Link className="font-headline-md text-headline-md uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/sell">Sell</Link>
            <Link className="font-headline-md text-headline-md uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/certified">Certified</Link>
            <Link className="font-headline-md text-headline-md uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/enquiry?id={car.id}">Finance</Link>
            <Link className="font-headline-md text-headline-md uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/">About</Link>
          </nav>
          <div className="flex items-center gap-6">
            <Link href="/" className="bg-primary text-on-primary px-8 py-2.5 rounded-[6px] font-headline-md text-[16px] uppercase tracking-wide hover:bg-[#93000e] transition-all duration-300 active:opacity-80">
              Enquire
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 md:px-10 max-w-[1280px] mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <p className="font-label-sm text-label-sm uppercase text-secondary">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/inventory" className="hover:text-primary transition-colors">Inventory</Link>
            <span className="mx-2">/</span>
            <span className="text-on-background">{car.name}</span>
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden mb-8">
          <div className="flex flex-col lg:flex-row">
            {/* Image Gallery */}
            <div className="flex-[1.5] bg-surface-container-low min-h-[400px] flex items-center justify-center relative">
              {car.frames && car.frames.length > 1 ? (
                <ImageGallery frames={car.frames} initialScale={1} />
              ) : (
                <img src={coverImage} alt={car.name} className="w-full h-full object-contain" />
              )}
            </div>

            {/* Vehicle Info */}
            <div className="flex-1 p-8 flex flex-col justify-center">
              <p className="font-label-sm text-label-sm uppercase text-secondary mb-2">{variantText}</p>
              <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase text-on-background mb-2">{car.name}</h1>

              <div className="text-headline-md font-headline-md text-primary mb-6">
                {car.price ? car.price : 'Price on Request'}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-low p-3 rounded-[8px]">
                  <span className="block text-[12px] text-secondary uppercase mb-1">Year</span>
                  <strong className="text-[16px] text-on-background">{specs.year || 'N/A'}</strong>
                </div>
                <div className="bg-surface-container-low p-3 rounded-[8px]">
                  <span className="block text-[12px] text-secondary uppercase mb-1">Fuel</span>
                  <strong className="text-[16px] text-on-background">{specs.fuel || 'N/A'}</strong>
                </div>
                <div className="bg-surface-container-low p-3 rounded-[8px]">
                  <span className="block text-[12px] text-secondary uppercase mb-1">Transmission</span>
                  <strong className="text-[16px] text-on-background">{specs.transmission || 'N/A'}</strong>
                </div>
                <div className="bg-surface-container-low p-3 rounded-[8px]">
                  <span className="block text-[12px] text-secondary uppercase mb-1">Kilometers</span>
                  <strong className="text-[16px] text-on-background">{specs.km || 'N/A'}</strong>
                </div>
              </div>

              {features.length > 0 && (
                <div className="mt-6">
                  <p className="font-label-sm text-label-sm uppercase text-secondary mb-2 text-right">Features</p>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {features.map((f, i) => (
                      <span key={i} className="border border-primary/30 text-primary px-3 py-1 rounded-full text-[12px] font-bold">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex gap-3">
                <Link href={`/enquiry?id=${car.id}`} className="flex-1 bg-primary text-on-primary py-3 rounded-[6px] font-headline-md text-[16px] uppercase tracking-wide text-center hover:bg-[#93000e] transition-all active:opacity-80">
                  Enquire Now
                </Link>
                <Link href="/inventory" className="flex-1 border-2 border-primary text-primary py-3 rounded-[6px] font-headline-md text-[16px] uppercase tracking-wide text-center hover:bg-surface-container transition-all active:opacity-80">
                  Back to Inventory
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Module */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 mb-8">
            <h2 className="font-headline-md text-headline-md uppercase mb-6 pb-3 border-b-2 border-primary inline-block">Price Reviews</h2>
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <div key={i} className="border-b border-outline-variant/20 pb-4 last:border-b-0 last:pb-0">
                  <div className="text-[#FFB800] mb-1">
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </div>
                  <div className="font-bold text-[16px] mb-1">{r.title}</div>
                  <div className="text-secondary mb-1">{r.text}</div>
                  <div className="text-[12px] text-secondary">{r.user} • {r.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competitors Module */}
        {competitors.length > 0 && (
          <div className="bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 mb-8">
            <h2 className="font-headline-md text-headline-md uppercase mb-6 pb-3 border-b-2 border-primary inline-block">Competitor Prices</h2>
            <div className="flex flex-wrap gap-6">
              {competitors.map((comp, i) => (
                <div key={i} className="flex-[0_1_280px] border border-outline-variant/20 rounded-[12px] overflow-hidden text-center">
                  {comp.image && (
                    <div className="w-full h-[160px] bg-surface overflow-hidden">
                      <img src={comp.image} alt={comp.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-headline-md text-[16px] mb-2">{comp.name}</h4>
                    <p className="text-primary font-bold">{comp.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs Module */}
        {faqs.length > 0 && (
          <div className="bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 mb-8">
            <h2 className="font-headline-md text-headline-md uppercase mb-6 pb-3 border-b-2 border-primary inline-block">FAQs</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-outline-variant/20 pb-4 last:border-b-0 last:pb-0">
                  <div className="font-bold text-[16px] text-on-background mb-1">Q: {faq.q}</div>
                  <div className="text-secondary">A: {faq.a}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-on-background w-full py-12 px-10 border-t border-outline-variant/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[1280px] mx-auto items-center">
          <div className="flex flex-col gap-4">
            <span className="font-headline-md text-headline-md text-on-primary uppercase tracking-wider font-bold">PREMIER AUTO</span>
            <p className="font-label-sm text-label-sm uppercase text-surface-variant max-w-md opacity-80">
              © 2024 PREMIER AUTO. ALL RIGHTS RESERVED. HIGH-PERFORMANCE PRE-OWNED.
            </p>
          </div>
          <div className="flex flex-wrap md:justify-end gap-x-8 gap-y-4">
            <a className="font-label-sm text-label-sm uppercase text-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm uppercase text-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm uppercase text-surface-variant hover:text-primary transition-colors" href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
