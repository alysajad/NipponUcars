import React from 'react';
import { Link } from 'react-router-dom';
import LandingCanvas from '../components/LandingCanvas';

export default function Landing() {
  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="app-wrapper">
      <LandingCanvas />
      
      <div className="content-layer">
        <section className="hero-section" id="sec-0">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', zIndex: 10, flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              <span className="text-red">NIPPON</span> U-TRUST
            </div>
            <nav className="main-nav">
              <button className="nav-btn" onClick={() => scrollToSection('sec-1')}>PROCUREMENT</button>
              <button className="nav-btn" onClick={() => scrollToSection('sec-2')}>VALUATION</button>
              <button className="nav-btn" onClick={() => scrollToSection('sec-3')}>WARRANTY</button>
              <Link to="/inventory" className="nav-btn" style={{ color: 'var(--primary-red)', borderColor: 'var(--primary-red)', borderWidth: '2px', borderStyle: 'solid' }}>
                INVENTORY
              </Link>
            </nav>
          </header>
          
          <div className="hero-bottom">
            <div className="hero-text-block">
              <h1 className="sailors-title">TRUST<br/>THE DRIVE.</h1>
              <p>
                Tech-first liquidity meets established brand equity. Experience the next generation of used car procurement.
              </p>
            </div>

            <div className="certified-badge">
               <h3 style={{ fontFamily: 'var(--font-sailors)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>CERTIFIED</h3>
               <p style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.25rem' }}>Premium Toyota Selection</p>
               <p style={{ fontSize: '1rem', marginBottom: 0 }}>Quality <span className="text-red" style={{ fontWeight: 'bold' }}>Guaranteed</span></p>
            </div>
          </div>
        </section>

        <section className="section" id="sec-1" style={{ justifyContent: 'flex-end' }}>
          <div className="section-content">
            <h2 className="section-title">Algorithmic<br/><span className="text-red">Valuation</span></h2>
            <p>Our foundation relies on highly structured, trust-based procurement.</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><strong>203-Point Inspection:</strong> Structural integrity and historical data drive our dynamic depreciation matrices.</li>
              <li><strong>Smart Escrow:</strong> We facilitate direct financial clearing, paying your financier immediately.</li>
              <li><strong>Dual Funnel:</strong> Choose a public listing for margins, or an instant buyout for immediate liquidity.</li>
            </ul>
          </div>
        </section>

        <section className="section" id="sec-2" style={{ justifyContent: 'flex-start' }}>
          <div className="section-content">
            <h2 className="section-title">Seamless<br/>Purchase</h2>
            <p>Experience our step-by-step Educational Avatar pipeline.</p>
            <div className="avatar-steps">
              <div className="avatar-step">
                <div className="step-number">1</div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Discovery</h4>
                  <p style={{ fontSize: '1rem' }}>Explore Red/Blu warranties and OEM parts guarantees.</p>
                </div>
              </div>
              <div className="avatar-step">
                <div className="step-number">2</div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Paperwork Made Simple</h4>
                  <p style={{ fontSize: '1rem' }}>Upload identity documents easily. No hassle.</p>
                </div>
              </div>
              <div className="avatar-step">
                <div className="step-number">3</div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Purchase Timeline</h4>
                  <p style={{ fontSize: '1rem' }}>Day 1: Test Drive &nbsp;|&nbsp; Day 2: Financing &nbsp;|&nbsp; Day 3: Handover</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="section cta-section" id="sec-3" style={{ justifyContent: 'flex-end', paddingBottom: '10rem', minHeight: '60vh' }}>
          <div className="section-content">
            <h2 className="section-title">Ready to <span className="text-red">Explore?</span></h2>
            <p>Check out our premium selection of certified vehicles.</p>
            <Link to="/inventory" className="cta-button">
              SEE INVENTORY
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
