"use client";
import React, { useState, useEffect } from 'react';
import { createEnquiry } from '@/api/inventoryApi';
import Link from 'next/link';
import MobileMenu from '@/components/MobileMenu';


const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (!d) return dateStr;
  return `${d}/${m}/${y}`;
};

export default function SellPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    regNumber: '',
    mileage: '',
    condition: 'Excellent (Showroom quality)',
    fullName: '',
    email: '',
    phone: '',
    preferredDate: '',
    center: 'Toyota U-Trust Main Hub'
  });

  const handleNextStep = (e, nextIdx) => {
    e.preventDefault();
    const currentStepDiv = document.getElementById(`step-${currentStep}`);
    if (currentStepDiv) {
      const inputs = currentStepDiv.querySelectorAll('input, select');
      let isValid = true;
      for (let input of inputs) {
        if (!input.checkValidity()) {
          input.reportValidity();
          isValid = false;
          break; // Show tooltip for the first invalid input
        }
      }
      if (!isValid) return;
    }
    nextStep(nextIdx);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextStep = (step) => {
    setCurrentStep(step);
    if (window.innerWidth < 768) {
      document.getElementById('valuation-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    const currentStepDiv = document.getElementById(`step-3`);
    if (currentStepDiv) {
      const inputs = currentStepDiv.querySelectorAll('input, select');
      let isValid = true;
      for (let input of inputs) {
        if (!input.checkValidity()) {
          input.reportValidity();
          isValid = false;
          break;
        }
      }
      if (!isValid) return;
    }
    
    setIsSubmitting(true);
    try {
      await createEnquiry({
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        vehicle_interest: formData.regNumber,
        lead_type: 'valuation',
        vehicle_specs: {
          mileage: formData.mileage,
          condition: formData.condition,
          preferred_date: formData.preferredDate,
          center: formData.center
        }
      });
      setIsSubmitted(true);
      setFormData({
        regNumber: '', mileage: '', condition: 'Excellent (Showroom quality)',
        fullName: '', email: '', phone: '', preferredDate: '', center: 'Toyota U-Trust Main Hub'
      });
    } catch (err) {
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className="bg-background text-on-surface selection:bg-primary selection:text-white font-body-md" style={{ fontFamily: 'var(--font-proxima)' }}>
      {/* TopNavBar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-gray-200 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-white/80 backdrop-blur-md'}`}>
        <div className="flex justify-between items-center h-16 px-margin-desktop max-w-container-max mx-auto">
          <Link href="/" className="text-2xl font-bold text-primary tracking-tighter uppercase font-headline-md hover:opacity-80 transition-opacity cursor-pointer" style={{ fontFamily: 'var(--font-sailors)' }}>
            Toyota U-Trust
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors" href="/inventory">Buy</Link>
            <Link className="nav-link text-sm font-semibold uppercase tracking-wider text-primary border-b-2 border-primary" href="/sell">Sell</Link>
            <Link className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors" href="/exchange">Exchange</Link>
            <Link className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors" href="#">Locations</Link>
          </div>
          <div className="flex items-center gap-4">
            <MobileMenu />
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input className="pl-10 pr-4 py-1.5 bg-gray-100 border-none rounded-lg focus:ring-1 focus:ring-primary text-sm outline-none" placeholder="SEARCH INVENTORY" type="text" />
            </div>

          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-white overflow-hidden py-20">
          <div className="max-w-container-max mx-auto px-margin-desktop flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 z-10">
              <span className="inline-block bg-primary px-3 py-1 text-white font-bold text-[10px] uppercase tracking-[0.2em] mb-6">Certified Valuation</span>
              <h1 className="text-5xl md:text-6xl font-bold text-on-surface mb-6 font-headline-xl uppercase" style={{ fontFamily: 'var(--font-sailors)', lineHeight: '1.1' }}>
                Get a Fair Price for Your Toyota Today
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                Three simple steps to a transparent valuation. Backed by Toyota's global standard of trust and excellence.
              </p>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="text-sm font-bold uppercase tracking-tight">Official Certificate</span>
                </div>
                <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                  <span className="text-sm font-bold uppercase tracking-tight">Instant Payout</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative">
              <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden rounded-xl group shadow-2xl">
                <img alt="Toyota Showroom" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://res.cloudinary.com/vdofesxh/image/upload/f_auto,q_auto/v1784191725/utrust_assets/utrust_asset_sell_page_0.jpg" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white/60 backdrop-blur-xl p-6 rounded-xl shadow-xl border border-white/40">
                <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">Valuation Updated</p>
                <p className="text-sm font-medium text-on-surface">2 MINS AGO</p>
              </div>
            </div>
          </div>
        </section>

        {/* Valuation Form Multi-Step Section */}
        <section className="py-20 bg-surface-container-low">
          <div className="max-w-3xl mx-auto px-margin-mobile md:px-0">
            <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-xl shadow-sm relative overflow-hidden">
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                <div className="h-full bg-primary transition-all duration-500 ease-in-out" id="form-progress" style={{ width: `${progress}%` }}></div>
              </div>
              
              {isSubmitted ? (
                <div className="text-center py-16 px-4 animate-fade-in">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-primary text-5xl">check_circle</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold uppercase font-headline-md mb-4 text-on-surface" style={{ fontFamily: 'var(--font-sailors)' }}>Thank You!</h3>
                  <p className="text-lg text-secondary mb-8 max-w-md mx-auto leading-relaxed">
                    Your valuation request has been submitted successfully. Our expert team will review the details and contact you within 24 hours to proceed.
                  </p>
                  <button onClick={() => { setIsSubmitted(false); setCurrentStep(1); }} className="bg-primary text-white px-8 py-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-md">
                    Submit Another Vehicle
                  </button>
                </div>
              ) : (
                <form className="space-y-8" id="valuation-form" noValidate>
                  {/* Step 1: Vehicle Details */}
                <div className={`form-step ${currentStep === 1 ? 'block' : 'hidden'}`} id="step-1">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold">01</span>
                    <h3 className="text-2xl font-bold uppercase font-headline-md" style={{ fontFamily: 'var(--font-sailors)' }}>Vehicle Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-gray-500 focus-within:text-primary transition-colors">Registration Number</label>
                      <input name="regNumber" value={formData.regNumber} onChange={handleInputChange} className="w-full p-4 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xl font-bold uppercase placeholder:normal-case placeholder:font-normal" placeholder="e.g. MH 12 AB 1234" type="text" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-gray-500">Mileage (km)</label>
                      <input name="mileage" value={formData.mileage} onChange={handleInputChange} className="w-full p-4 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Enter kilometers" type="number" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-gray-500">Overall Condition</label>
                      <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full p-4 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none bg-white">
                        <option>Excellent (Showroom quality)</option>
                        <option>Very Good (Minor wear)</option>
                        <option>Good (Regular usage)</option>
                        <option>Fair (Significant wear)</option>
                      </select>
                    </div>
                  </div>
                  <button className="mt-8 w-full md:w-auto bg-primary text-white px-10 py-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2" type="button" onClick={(e) => handleNextStep(e, 2)}>
                    Next Step <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>

                {/* Step 2: Contact Information */}
                <div className={`form-step ${currentStep === 2 ? 'block' : 'hidden'}`} id="step-2">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold">02</span>
                    <h3 className="text-2xl font-bold uppercase font-headline-md" style={{ fontFamily: 'var(--font-sailors)' }}>Contact Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-gray-500">Full Name</label>
                      <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full p-4 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="John Doe" type="text" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-gray-500">Email Address</label>
                      <input name="email" value={formData.email} onChange={handleInputChange} className="w-full p-4 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="john@example.com" type="email" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-gray-500">Phone Number</label>
                      <input name="phone" value={formData.phone} onChange={handleInputChange} pattern="^\+?[0-9\s\-]{10,15}$" title="Enter a valid phone number (e.g. +91 9876543210)" className="w-full p-4 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="+91 00000 00000" type="tel" required />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 mt-8">
                    <button className="w-full md:w-auto bg-gray-100 text-on-surface px-8 py-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-all" onClick={() => nextStep(1)} type="button">
                      Back
                    </button>
                    <button className="w-full md:w-auto flex-grow bg-primary text-white px-10 py-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2" type="button" onClick={(e) => handleNextStep(e, 3)}>
                      Continue to Inspection <span className="material-symbols-outlined text-sm">event_available</span>
                    </button>
                  </div>
                </div>

                {/* Step 3: Scheduling */}
                <div className={`form-step ${currentStep === 3 ? 'block' : 'hidden'}`} id="step-3">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold">03</span>
                    <h3 className="text-2xl font-bold uppercase font-headline-md" style={{ fontFamily: 'var(--font-sailors)' }}>Schedule Inspection</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-6 uppercase tracking-tight">Our certified inspectors will perform a 203-point check to finalize your quote.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-gray-500">Preferred Date</label>
                      <div className="relative">
                        <input name="preferredDate" value={formData.preferredDate} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" type="date" required />
                        <div className={`w-full p-4 border border-gray-200 rounded-lg bg-white flex items-center justify-between transition-all ${formData.preferredDate ? 'focus-within:border-primary focus-within:ring-1 focus-within:ring-primary' : ''}`}>
                          <span className={formData.preferredDate ? "text-gray-900" : "text-gray-400"}>{formatDate(formData.preferredDate) || "DD/MM/YYYY"}</span>
                          <span className="material-symbols-outlined text-gray-400">calendar_month</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-gray-500">Nearest Center</label>
                      <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full p-4 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none bg-white">
                        <option>Toyota U-Trust Main Hub</option>
                        <option>North City Service Center</option>
                        <option>South Plaza Workshop</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 mt-8">
                    <button className="w-full md:w-auto bg-gray-100 text-on-surface px-8 py-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-all" onClick={() => nextStep(2)} type="button">
                      Back
                    </button>
                    <button disabled={isSubmitting} className="w-full md:w-auto flex-grow bg-primary text-white px-10 py-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50" type="button" onClick={handleFinalSubmit}>
                      {isSubmitting ? 'Submitting...' : 'Confirm Valuation Request'} <span className="material-symbols-outlined text-sm">check_circle</span>
                    </button>
                  </div>
                </div>
              </form>
              )}
            </div>
          </div>
        </section>

        {/* Trust Elements */}
        <section className="py-24 bg-white">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-10 mb-16">
              <h2 className="font-headline-lg text-headline-lg uppercase bg-primary text-white px-6 py-3 rounded-lg shadow-sm whitespace-nowrap">The U-Trust Promise</h2>
              <p className="font-body-md text-body-md text-secondary/70 max-w-2xl leading-relaxed">
                Experience a seamless selling process with our core guarantees. We ensure fair pricing, zero hidden costs, and immediate payouts directly to your account.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card 1 */}
              <div className="bg-surface-container-low p-10 rounded-[2.5rem] border border-outline-variant flex justify-between items-center group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 h-64 md:h-72">
                <div className="flex flex-col justify-between h-full z-10">
                  <div>
                    <span className="font-headline-md text-headline-md uppercase bg-white px-4 py-2 rounded-md inline-block shadow-sm text-secondary">Transparent</span>
                    <br/>
                    <span className="font-headline-md text-headline-md uppercase bg-white px-4 py-2 rounded-md inline-block shadow-sm mt-2 text-secondary">Pricing</span>
                  </div>
                  <p className="font-body-md text-sm text-secondary/80 mt-6 leading-relaxed max-w-[80%]">
                    Our algorithmic valuation ensures you get the most accurate, data-driven market price for your Toyota without any low-ball offers.
                  </p>
                </div>
                <div className="w-40 h-40 opacity-80 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center -mr-4">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '100px' }}>analytics</span>
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="bg-secondary p-10 rounded-[2.5rem] border border-secondary flex justify-between items-center group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 h-64 md:h-72">
                <div className="flex flex-col justify-between h-full z-10">
                  <div>
                    <span className="font-headline-md text-headline-md uppercase bg-white text-secondary px-4 py-2 rounded-md inline-block shadow-sm">No Hidden</span>
                    <br/>
                    <span className="font-headline-md text-headline-md uppercase bg-white text-secondary px-4 py-2 rounded-md inline-block shadow-sm mt-2">Fees</span>
                  </div>
                  <p className="font-body-md text-sm text-white/80 mt-6 leading-relaxed max-w-[80%]">
                    What you see is exactly what you get. We cover all transfer costs, inspection charges, and administrative overheads.
                  </p>
                </div>
                <div className="w-40 h-40 opacity-80 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center -mr-4">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '100px' }}>visibility_off</span>
                </div>
              </div>
              
              {/* Card 3 (Spans both columns) */}
              <div className="bg-primary/5 p-10 rounded-[2.5rem] border border-primary/20 flex justify-between items-center group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 h-64 md:h-72 md:col-span-2">
                <div className="flex flex-col justify-between h-full z-10">
                  <div>
                    <span className="font-headline-md text-headline-md uppercase bg-primary text-white px-4 py-2 rounded-md inline-block shadow-sm">Instant</span>
                    <br/>
                    <span className="font-headline-md text-headline-md uppercase bg-primary text-white px-4 py-2 rounded-md inline-block shadow-sm mt-2">Payment</span>
                  </div>
                  <p className="font-body-md text-sm text-primary/80 mt-6 leading-relaxed max-w-[70%]">
                    The moment you hand over the keys, the funds are wired directly to your bank account. No waiting periods, no clearance delays.
                  </p>
                </div>
                <div className="w-40 h-40 opacity-80 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center -mr-4 md:mr-10">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '100px' }}>account_balance_wallet</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Sections Alternating */}
        <section className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-[500px] md:h-auto overflow-hidden">
            <img alt="Toyota Inspection" className="absolute inset-0 w-full h-full object-cover" src="https://res.cloudinary.com/vdofesxh/image/upload/f_auto,q_auto/v1784191727/utrust_assets/utrust_asset_sell_page_1.jpg" />
            <div className="absolute inset-0 bg-primary/10"></div>
          </div>
          <div className="bg-inverse-surface p-16 md:p-24 flex flex-col justify-center text-white">
            <h3 className="text-4xl md:text-5xl font-bold uppercase mb-8 font-headline-lg" style={{ fontFamily: 'var(--font-sailors)', lineHeight: '1.1' }}>Every detail matters.</h3>
            <p className="text-lg opacity-80 mb-10 leading-relaxed">
              Our 203-point inspection is the gold standard for pre-owned vehicles. We look beyond the surface to guarantee safety, performance, and long-term value for every customer.
            </p>
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-lg border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-md">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div>
                  <p className="font-bold text-sm uppercase tracking-wider">Certified Engineers</p>
                  <p className="text-xs opacity-60 uppercase tracking-widest">Trained by Toyota technicians</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-lg border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-md">
                  <span className="material-symbols-outlined">history_edu</span>
                </div>
                <div>
                  <p className="font-bold text-sm uppercase tracking-wider">Service Records Check</p>
                  <p className="text-xs opacity-60 uppercase tracking-widest">Full transparency on vehicle past</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Negative Space Section */}
        <section className="py-32 bg-white">
          <div className="max-w-container-max mx-auto px-margin-desktop flex flex-col md:flex-row-reverse items-center gap-20">
            <div className="w-full md:w-1/2">
              <h2 className="text-5xl font-bold uppercase mb-8 text-on-surface font-headline-xl" style={{ fontFamily: 'var(--font-sailors)', lineHeight: '1.1' }}>Precision Engineering in Every Inspection</h2>
              <p className="text-xl text-gray-500 mb-10 leading-relaxed">We don't just sell cars. We build confidence. Every vehicle that passes through U-Trust undergoes a rigorous physical and digital health check to ensure it meets our heritage of reliability.</p>
              <button className="border-2 border-primary text-primary px-10 py-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Learn About Process</button>
            </div>
            <div className="w-full md:w-1/2">
              <div className="aspect-square bg-surface-container-low rounded-xl flex items-center justify-center p-12">
                <span className="material-symbols-outlined text-[120px] text-primary/20">high_quality</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-inverse-surface text-white pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-margin-desktop py-12 max-w-container-max mx-auto border-b border-white/10">
          <div className="col-span-1 md:col-span-1">
            <div className="text-2xl font-bold text-primary mb-6 uppercase tracking-tighter" style={{ fontFamily: 'var(--font-sailors)' }}>Toyota U-Trust</div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">Reliability and precision in every transaction. Your partner for certified pre-owned excellence.</p>
          </div>
          <div>
            <h5 className="font-bold mb-6 uppercase tracking-widest text-xs">Quick Links</h5>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link className="hover:text-primary transition-colors uppercase tracking-wider" href="#">About U-Trust</Link></li>
              <li><Link className="hover:text-primary transition-colors uppercase tracking-wider" href="#">203-Point Inspection</Link></li>
              <li><Link className="hover:text-primary transition-colors uppercase tracking-wider" href="#">Warranty Policy</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6 uppercase tracking-widest text-xs">Support</h5>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link className="hover:text-primary transition-colors uppercase tracking-wider" href="#">Contact Us</Link></li>
              <li><Link className="hover:text-primary transition-colors uppercase tracking-wider" href="#">Terms of Use</Link></li>
              <li><Link className="hover:text-primary transition-colors uppercase tracking-wider" href="#">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6 uppercase tracking-widest text-xs text-primary">Newsletter</h5>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-6">Stay updated on certified arrivals.</p>
            <div className="flex">
              <input className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none rounded-l-lg text-sm" placeholder="EMAIL ADDRESS" type="email" />
              <button className="bg-primary text-white px-4 rounded-r-lg hover:bg-opacity-90 transition-colors">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
        <div className="px-margin-desktop pt-8 max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">© 2024 Toyota U-Trust. Certified Excellence.</p>
          <div className="flex gap-8 text-gray-500">
            <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">facebook</span>
            <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">public</span>
            <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">play_circle</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
