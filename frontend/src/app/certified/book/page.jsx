"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MobileMenu from '@/components/MobileMenu';

export default function BookInspection() {
  const [scrolled, setScrolled] = useState(false);
  const [timeSlot, setTimeSlot] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'processing', 'confirmed'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '2024',
    vin: '',
    serviceCenter: 'Tokyo Central Flagship Center',
    date: '',
    fullName: '',
    phone: '',
    email: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('processing');
    
    try {
      const payload = {
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        vehicle_interest: `${formData.year} ${formData.make} ${formData.model}`,
        priority: "high",
        lead_type: "inspection",
        notes: `Inspection Booking\nVIN: ${formData.vin || 'N/A'}\nService Center: ${formData.serviceCenter}\nDate: ${formData.date}\nTime: ${timeSlot}`
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/cms/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to submit");
      setStatus('confirmed');
    } catch (err) {
      console.error(err);
      setStatus('idle');
      alert("Failed to book inspection. Please try again.");
    }
  };

  return (
    <div className="bg-surface text-on-surface">
      {/* TopNavBar */}
      <nav className={`fixed top-0 w-full z-50 border-b border-outline-variant transition-all duration-300 ${scrolled ? 'bg-white shadow-xl' : 'bg-white/95 backdrop-blur-sm'}`}>
        <div className="flex justify-between items-center h-20 px-margin-desktop max-w-container-max mx-auto">
          <div className="flex items-center gap-stack-lg">
            <Link href="/" className="font-headline-md text-headline-md font-semibold text-primary uppercase hover:opacity-80 transition-opacity cursor-pointer">Nippon U-Trust</Link>
            <div className="hidden md:flex items-center gap-8 ml-12">
              <Link href="#" className="nav-link font-label-bold text-label-bold uppercase text-on-surface hover:text-primary relative after:content-[''] after:absolute after:w-0 hover:after:w-full after:h-[2px] after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-primary after:transition-all after:duration-300">Buy</Link>
              <Link href="/sell" className="nav-link font-label-bold text-label-bold uppercase text-on-surface hover:text-primary relative after:content-[''] after:absolute after:w-0 hover:after:w-full after:h-[2px] after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-primary after:transition-all after:duration-300">Sell</Link>
              <Link href="/exchange" className="nav-link font-label-bold text-label-bold uppercase text-on-surface hover:text-primary relative after:content-[''] after:absolute after:w-0 hover:after:w-full after:h-[2px] after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-primary after:transition-all after:duration-300">Exchange</Link>
              <Link href="/inventory" className="nav-link font-label-bold text-label-bold uppercase text-on-surface hover:text-primary relative after:content-[''] after:absolute after:w-0 hover:after:w-full after:h-[2px] after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-primary after:transition-all after:duration-300">Inventory</Link>
            </div>
          </div>
          <div className="flex items-center gap-stack-md">
            <MobileMenu />
            <button className="material-symbols-outlined text-on-surface p-2 hover:bg-surface-container-low rounded-full transition-all">search</button>

          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[450px] md:h-[550px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA-qP1Qz-vnqYZojZy3EwnzaWt5f7QRaRHueFoaUrMziyfmrflTqfx8APq8hFvLFLl-WI-HXvQ3hPtseugTpQQJyTDW1foGv64P2D6JX84NIjuluI2wdPcHIDPA4hPIUjwQz58KgLRa38dWNFUXZkWWCC3LQjnAUD_O1pE6vLG1k3Tq42LiAXLEF9C9av57dcf8FX9HTRxA4GQ0s6YuEI1LezWM_iZNuo7mkMZG_VU-ngVqh0V6Doi92A')" }}></div>
            <div className="absolute inset-0 bg-on-background/40"></div>
          </div>
          <div className="relative z-10 max-w-[1280px] mx-auto px-margin-desktop w-full">
            <div className="max-w-2xl p-10 rounded-xl shadow-2xl animate-fade-in-up" style={{ background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
              <span className="inline-block bg-primary text-on-primary px-3 py-1 font-label-sm uppercase mb-4 tracking-tighter rounded-[4px]">Certified Pre-Owned</span>
              <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase mb-6 leading-none">
                  BOOK YOUR <span className="text-primary">203-POINT</span> INSPECTION
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
                  The ultimate forensic evaluation for pre-owned vehicles. Secure your peace of mind with the industry's most rigorous mechanical and aesthetic certification.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="max-w-[1280px] mx-auto px-margin-desktop py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20">
              {status === 'confirmed' ? (
                <div className="text-center py-16 px-4 animate-fade-in-up">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-green-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <h2 className="font-headline-lg text-primary uppercase mb-4">Thank You!</h2>
                  <p className="font-body-lg text-secondary mb-8">
                    Your inspection booking request has been successfully received. 
                    Our concierge team will review your details and call you back shortly to confirm your appointment and make you feel right at home with Nippon U-Trust.
                  </p>
                  <Link 
                    href="/inventory"
                    className="inline-block bg-primary text-white px-8 py-3 font-label-bold tracking-widest rounded-lg hover:brightness-110 transition-all uppercase shadow-md"
                  >
                    Browse Inventory
                  </Link>
                </div>
              ) : (
                <form className="space-y-8" onSubmit={handleSubmit}>
                {/* Step 1: Vehicle Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <label className="font-label-sm uppercase text-secondary group-focus-within:text-primary transition-colors">Make</label>
                    <input name="make" value={formData.make} onChange={handleInputChange} className="w-full border-outline-variant/40 rounded-[6px] focus:ring-primary focus:border-primary uppercase px-4 py-3 font-body-md" placeholder="e.g. LEXUS" type="text" required/>
                  </div>
                  <div className="space-y-2 group">
                    <label className="font-label-sm uppercase text-secondary group-focus-within:text-primary transition-colors">Model</label>
                    <input name="model" value={formData.model} onChange={handleInputChange} className="w-full border-outline-variant/40 rounded-[6px] focus:ring-primary focus:border-primary uppercase px-4 py-3 font-body-md" placeholder="e.g. LS 500" type="text" required/>
                  </div>
                  <div className="space-y-2 group">
                    <label className="font-label-sm uppercase text-secondary group-focus-within:text-primary transition-colors">Year</label>
                    <select name="year" value={formData.year} onChange={handleInputChange} className="w-full border-outline-variant/40 rounded-[6px] focus:ring-primary focus:border-primary px-4 py-3 font-body-md">
                      <option>2024</option>
                      <option>2023</option>
                      <option>2022</option>
                      <option>2021</option>
                    </select>
                  </div>
                  <div className="space-y-2 group">
                    <label className="font-label-sm uppercase text-secondary group-focus-within:text-primary transition-colors">VIN (Chassis Number)</label>
                    <input name="vin" value={formData.vin} onChange={handleInputChange} className="w-full border-outline-variant/40 rounded-[6px] focus:ring-primary focus:border-primary uppercase px-4 py-3 font-body-md" placeholder="17-CHARACTER IDENTIFIER" type="text"/>
                  </div>
                </div>

                {/* Step 2: Service Center */}
                <div className="space-y-2 group">
                  <label className="font-label-sm uppercase text-secondary group-focus-within:text-primary transition-colors">Preferred Service Center</label>
                  <select name="serviceCenter" value={formData.serviceCenter} onChange={handleInputChange} className="w-full border-outline-variant/40 rounded-[6px] focus:ring-primary focus:border-primary px-4 py-3 font-body-md">
                    <option>Tokyo Central Flagship Center</option>
                    <option>Yokohama Performance Hub</option>
                    <option>Osaka Technical Center</option>
                    <option>Nagoya Excellence Station</option>
                  </select>
                </div>

                {/* Step 3: Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <label className="font-label-sm uppercase text-secondary group-focus-within:text-primary transition-colors">Date Selection</label>
                    <input name="date" value={formData.date} onChange={handleInputChange} className="w-full border-outline-variant/40 rounded-[6px] focus:ring-primary focus:border-primary px-4 py-3 font-body-md" type="date" required/>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm uppercase text-secondary">Time Slot</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map(time => (
                        <button 
                          key={time}
                          type="button" 
                          onClick={() => setTimeSlot(time)}
                          className={`border rounded-[6px] py-2 text-center font-label-sm transition-colors ${timeSlot === time ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/40 hover:border-primary hover:text-primary'}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 4: Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/20">
                  <div className="space-y-2 group">
                    <label className="font-label-sm uppercase text-secondary group-focus-within:text-primary transition-colors">Full Name</label>
                    <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full border-outline-variant/40 rounded-[6px] focus:ring-primary focus:border-primary px-4 py-3 font-body-md" type="text" required/>
                  </div>
                  <div className="space-y-2 group">
                    <label className="font-label-sm uppercase text-secondary group-focus-within:text-primary transition-colors">Phone Number</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border-outline-variant/40 rounded-[6px] focus:ring-primary focus:border-primary px-4 py-3 font-body-md" type="tel" required/>
                  </div>
                  <div className="md:col-span-2 space-y-2 group">
                    <label className="font-label-sm uppercase text-secondary group-focus-within:text-primary transition-colors">Email Address</label>
                    <input name="email" value={formData.email} onChange={handleInputChange} className="w-full border-outline-variant/40 rounded-[6px] focus:ring-primary focus:border-primary px-4 py-3 font-body-md" type="email" required/>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input className="text-primary border-outline-variant rounded focus:ring-primary" id="terms" type="checkbox" required/>
                  <label className="font-label-sm text-secondary uppercase" htmlFor="terms">I agree to the terms of service and data privacy policy.</label>
                </div>

                <button 
                  disabled={status !== 'idle' || !timeSlot}
                  className={`w-full py-4 rounded-[6px] font-headline-md uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
                    status === 'confirmed' ? 'bg-green-600 text-white' : 'bg-primary text-on-primary hover:brightness-90'
                  }`} 
                  type="submit"
                >
                  {status === 'idle' && 'CONFIRM BOOKING'}
                  {status === 'processing' && 'PROCESSING...'}
                  {status === 'confirmed' && 'BOOKING CONFIRMED'}
                </button>
              </form>
              )}
            </div>

            {/* Sidebar Info Section */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="bg-inverse-surface text-surface-container-lowest p-8 rounded-xl space-y-8">
                <h3 className="font-headline-md uppercase border-b border-surface-container-low/20 pb-4">Certification Benefits</h3>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  <div>
                    <h4 className="font-body-lg font-bold uppercase mb-1">The Gold Standard Seal</h4>
                    <p className="text-secondary-fixed-dim text-sm opacity-80 font-body-md">Our signature stamp of excellence awarded only to vehicles passing the full 203-point diagnostic.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                  </div>
                  <div>
                    <h4 className="font-body-lg font-bold uppercase mb-1">12-Month Warranty</h4>
                    <p className="text-secondary-fixed-dim text-sm opacity-80 font-body-md">Uncompromising coverage on all major mechanical and electrical systems for one full year.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                  </div>
                  <div>
                    <h4 className="font-body-lg font-bold uppercase mb-1">Increased Resale Value</h4>
                    <p className="text-secondary-fixed-dim text-sm opacity-80 font-body-md">Official NIPPON U-TRUST certification significantly boosts your vehicle's market appeal.</p>
                  </div>
                </div>
              </div>

              {/* Help Card */}
              <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/30">
                <h4 className="font-headline-md uppercase mb-4">Need Assistance?</h4>
                <p className="font-body-md text-secondary mb-6">Our concierge team is available 24/7 to help you with your booking or technical questions.</p>
                <div className="flex items-center gap-3 text-primary font-bold">
                  <span className="material-symbols-outlined">call</span>
                  <span>0800-NIPPON-TRUST</span>
                </div>
              </div>

              {/* Testimonial */}
              <div className="relative p-8 rounded-xl overflow-hidden bg-white shadow-sm border border-outline-variant/10">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-6xl">format_quote</span>
                </div>
                <p className="italic text-on-surface-variant font-body-md mb-4 relative z-10">
                    "The inspection was incredibly thorough. They found minor issues I hadn't noticed and corrected them, giving me absolute confidence in my purchase."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-container"></div>
                  <div>
                    <p className="font-bold text-sm uppercase">Takeshi Yamamoto</p>
                    <p className="text-xs text-secondary">Verified Owner</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Process Transparency Section */}
        <section className="bg-surface-container-high py-20">
          <div className="max-w-[1280px] mx-auto px-margin-desktop">
            <h2 className="font-headline-lg text-center uppercase mb-16">The Inspection <span className="text-primary">Ecosystem</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center group cursor-default">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary text-4xl">enable</span>
                </div>
                <h5 className="font-headline-md uppercase mb-3">Mechanical Rigor</h5>
                <p className="font-body-md text-secondary">Every piston, belt, and fluid is scrutinized under industrial laboratory conditions.</p>
              </div>
              <div className="text-center group cursor-default">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary text-4xl">scanner</span>
                </div>
                <h5 className="font-headline-md uppercase mb-3">Digital Diagnostics</h5>
                <p className="font-body-md text-secondary">Deep-level ECU scanning to ensure electronic integrity and historical fault clearance.</p>
              </div>
              <div className="text-center group cursor-default">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary text-4xl">brush</span>
                </div>
                <h5 className="font-headline-md uppercase mb-3">Aesthetic Forensic</h5>
                <p className="font-body-md text-secondary">Paint thickness analysis and structural alignment checks for collision history transparency.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer from certified page */}
      <footer className="bg-secondary text-white py-20 mt-auto">
        <div className="px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <span className="font-headline-md text-headline-md text-white font-semibold uppercase">Toyota U-Trust</span>
            <p className="font-body-md text-body-md opacity-60 max-w-xs mt-4">
              The trusted name for manufacturer-certified pre-owned Toyotas. Reliability you can count on, value you can trust.
            </p>
            <div className="flex gap-4 mt-6">
              <Link href="#" className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-full hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-base">public</span>
              </Link>
              <Link href="#" className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-full hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-base">alternate_email</span>
              </Link>
              <Link href="#" className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-full hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-base">share</span>
              </Link>
            </div>
          </div>
          <div>
            <h5 className="font-label-bold text-label-bold uppercase mb-8 text-primary tracking-widest">Services</h5>
            <ul className="space-y-4">
              <li><Link href="#" className="font-body-md text-body-md text-white/60 hover:text-primary transition-colors">About U-Trust</Link></li>
              <li><Link href="#" className="font-body-md text-body-md text-white/60 hover:text-primary transition-colors">203-Point Inspection</Link></li>
              <li><Link href="#" className="font-body-md text-body-md text-white/60 hover:text-primary transition-colors">Warranty Policy</Link></li>
              <li><Link href="#" className="font-body-md text-body-md text-white/60 hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-label-bold text-label-bold uppercase mb-8 text-primary tracking-widest">Support</h5>
            <ul className="space-y-4">
              <li><Link href="#" className="font-body-md text-body-md text-white/60 hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="font-body-md text-body-md text-white/60 hover:text-primary transition-colors">Terms of Use</Link></li>
              <li><Link href="#" className="font-body-md text-body-md text-white/60 hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link href="#" className="font-body-md text-body-md text-white/60 hover:text-primary transition-colors">Store Locator</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-label-bold text-label-bold uppercase mb-8 text-primary tracking-widest">Subscribe</h5>
            <p className="font-body-md text-body-md text-white/60 mb-6">Stay updated on new inventory arrivals.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Enter your email" className="bg-white/5 border border-white/10 focus:ring-1 focus:ring-primary text-white w-full px-6 py-3 font-body-md rounded-lg outline-none" />
              <button className="bg-primary text-white p-3 rounded-lg hover:brightness-110 transition-all">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 py-10 px-margin-desktop max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-body-md text-body-md text-white/40">© 2024 Toyota U-Trust. All Rights Reserved. Certified Excellence.</span>
          <div className="flex gap-10 text-white/40 text-[11px] font-bold uppercase tracking-[0.2em]">
            <Link href="#" className="hover:text-primary transition-colors">Legal</Link>
            <Link href="#" className="hover:text-primary transition-colors">Sitemap</Link>
            <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
