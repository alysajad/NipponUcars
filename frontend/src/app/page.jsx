"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LandingCanvas from '@/components/LandingCanvas';

export default function Landing() {
  const router = useRouter();
  const [currentCarIndex, setCurrentCarIndex] = React.useState(0);

  const heroCars = [
    { name: 'Toyota Hilux Ultra', price: '₹ 38,00,000', specs: '2.8L Diesel | 4x4 | Automatic' },
    { name: 'Toyota Fortuner', price: '₹ 45,00,000', specs: '2.8L Diesel | 4x4 | Automatic' },
    { name: 'Toyota Corolla', price: '₹ 20,00,000', specs: '1.8L Hybrid | Automatic' },
    { name: 'Tata Safari', price: '₹ 25,00,000', specs: '2.0L Diesel | Automatic' },
  ];

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setCurrentCarIndex((prev) => (prev + 1) % heroCars.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentCarIndex((prev) => (prev - 1 + heroCars.length) % heroCars.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="app-wrapper">
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideInRight 0.4s ease-out forwards;
        }
      `}</style>
      <LandingCanvas activeModelIndex={currentCarIndex} />
      
      <div className="content-layer">
        {/* Hero */}
        <section className="hero-section" id="sec-0">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', zIndex: 10, flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              <span className="text-red">NIPPON</span> U-TRUST
            </div>
            <nav className="main-nav">
              <button className="nav-btn" onClick={() => scrollToSection('sec-1')}>PROCUREMENT</button>
              <button className="nav-btn" onClick={() => scrollToSection('sec-2')}>PURCHASE</button>
              <button className="nav-btn" onClick={() => scrollToSection('sec-3')}>WARRANTY</button>
              <Link href="/inventory" className="nav-btn" style={{ color: 'var(--primary-red)', borderColor: 'var(--primary-red)', borderWidth: '2px', borderStyle: 'solid' }}>
                INVENTORY
              </Link>
            </nav>
          </header>
          
          <div className="hero-bottom">
            <div className="hero-text-block">
              <h1 className="sailors-title">TRUST<br/>THE DRIVE.</h1>
              <p>
                Nippon U-Trust brings you Toyota-certified pre-owned vehicles with complete transparency, warranty coverage, and hassle-free ownership transfer.
              </p>
            </div>

            <div key={currentCarIndex} className="animate-slide-in" style={{ background: 'var(--pure-white)', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', width: '350px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--primary-red)' }}>FEATURED</span>
                <span style={{ color: '#888' }}>{currentCarIndex + 1} / {heroCars.length}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-sailors)', fontSize: '2rem', marginBottom: '0.5rem', lineHeight: '1.1' }}>{heroCars[currentCarIndex].name}</h3>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--dark-grey)' }}>{heroCars[currentCarIndex].price}</p>
              <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{heroCars[currentCarIndex].specs}</p>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setCurrentCarIndex((prev) => (prev - 1 + heroCars.length) % heroCars.length)} style={{ padding: '0.5rem 1rem', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--dark-grey)', fontSize: '1.2rem' }}>←</button>
                <button onClick={() => setCurrentCarIndex((prev) => (prev + 1) % heroCars.length)} style={{ padding: '0.5rem 1rem', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--dark-grey)', fontSize: '1.2rem' }}>→</button>
                <Link href="/inventory" style={{ flex: 1, padding: '0.5rem', background: 'var(--primary-red)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', textDecoration: 'none', textAlign: 'center', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>View Details</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Procurement & Valuation */}
        <section className="section" id="sec-1" style={{ justifyContent: 'flex-end' }}>
          <div className="section-content">
            <h2 className="section-title">Algorithmic<br/><span className="text-red">Valuation</span></h2>
            <p>Every vehicle in the Nippon U-Trust network undergoes a rigorous, data-driven assessment before it reaches you.</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><strong>203-Point Inspection:</strong> Structural integrity, mechanical health, and historical data drive our depreciation matrices. No guesswork.</li>
              <li><strong>Smart Escrow:</strong> We facilitate direct financial clearing — paying your financier immediately upon deal closure.</li>
              <li><strong>Dual Funnel:</strong> Choose a public listing for maximum margins, or an instant buyout for immediate liquidity.</li>
              <li><strong>Transparent History:</strong> Full service records, accident history, and ownership timeline verified through RTO databases.</li>
            </ul>
          </div>
        </section>

        {/* Seamless Purchase */}
        <section className="section" id="sec-2" style={{ justifyContent: 'flex-start' }}>
          <div className="section-content">
            <h2 className="section-title">Seamless<br/>Purchase</h2>
            <p>From the showroom floor to your driveway in three simple steps.</p>
            <div className="avatar-steps">
              <div className="avatar-step">
                <div className="step-number">1</div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Discovery & Inspection</h4>
                  <p style={{ fontSize: '1rem' }}>Browse our certified inventory online. Every car comes with a detailed inspection report, 360° view, and verified history.</p>
                </div>
              </div>
              <div className="avatar-step">
                <div className="step-number">2</div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Test Drive & Financing</h4>
                  <p style={{ fontSize: '1rem' }}>Visit any Nippon U-Trust centre for a test drive. Get instant financing options from partner banks at competitive rates.</p>
                </div>
              </div>
              <div className="avatar-step">
                <div className="step-number">3</div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Handover & Warranty</h4>
                  <p style={{ fontSize: '1rem' }}>Complete RC transfer, insurance renewal, and receive your U-Trust warranty — all handled by us within 72 hours.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Warranty */}
        <section className="section" id="sec-3" style={{ justifyContent: 'flex-end' }}>
          <div className="section-content">
            <h2 className="section-title"><span className="text-red">U-Trust</span><br/>Warranty</h2>
            <p>Every U-Trust certified vehicle comes with comprehensive warranty coverage, giving you complete peace of mind.</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><strong>Engine & Transmission:</strong> Up to 1-year coverage on powertrain components with genuine Toyota parts.</li>
              <li><strong>Electrical Systems:</strong> Full coverage on electrical harness, ECU, and infotainment systems.</li>
              <li><strong>Roadside Assistance:</strong> 24/7 pan-India roadside support including towing, battery jump-start, and flat tyre service.</li>
              <li><strong>Free Service:</strong> Complimentary first service at any authorized Toyota service centre after purchase.</li>
            </ul>
          </div>
        </section>

        {/* Explore Inventory CTA */}
        <section className="section" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '50vh', textAlign: 'center' }}>
          <div className="section-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <h2 className="section-title">Ready to find your perfect drive?</h2>
            <Link href="/inventory" className="cta-button" style={{ padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '40px', background: 'var(--primary-red)', color: 'white', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(220, 38, 38, 0.2)', transition: 'all 0.3s ease', display: 'inline-block' }}>
              Explore Full Inventory →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
