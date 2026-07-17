"use client";
import React, { useState, useEffect } from 'react';
import { createEnquiry } from '@/api/inventoryApi';
import Link from 'next/link';
import MobileMenu from '@/components/MobileMenu';

export default function ExchangePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Current Vehicle
    currentMake: '',
    currentModel: '',
    currentYear: '',
    currentMileage: '',
    condition: 'Excellent',
    
    // Step 2: Upgrade
    upgradeMake: 'Toyota',
    upgradeModel: '',
    
    // Step 3: Contact
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = (step) => {
    setCurrentStep(step);
    if (window.innerWidth < 768) {
      document.getElementById('exchange-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const validateStep = (stepIdx) => {
    const currentStepDiv = document.getElementById(`step-${stepIdx}`);
    if (currentStepDiv) {
      const inputs = currentStepDiv.querySelectorAll('input, select');
      for (let input of inputs) {
        if (!input.checkValidity()) {
          input.reportValidity();
          return false;
        }
      }
    }
    return true;
  };

  const handleNextStep = (e, nextIdx) => {
    e.preventDefault();
    if (validateStep(currentStep)) nextStep(nextIdx);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    try {
      await createEnquiry({
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        vehicle_interest: `${formData.upgradeMake} ${formData.upgradeModel}`.trim() || 'Any Upgrade',
        lead_type: 'exchange',
        notes: `Trade-in: ${formData.currentYear} ${formData.currentMake} ${formData.currentModel} (${formData.currentMileage}km, ${formData.condition})`,
        vehicle_specs: {
          trade_in_make: formData.currentMake,
          trade_in_model: formData.currentModel,
          trade_in_year: formData.currentYear,
          trade_in_mileage: formData.currentMileage,
          trade_in_condition: formData.condition
        }
      });
      setIsSubmitted(true);
    } catch (err) {
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-background antialiased font-body-md overflow-x-hidden">
      {/* TopNavBar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-gray-200 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-white/80 backdrop-blur-md'}`}>
        <div className="flex justify-between items-center h-16 px-margin-desktop max-w-container-max mx-auto">
          <div className="flex items-center gap-2">
            <MobileMenu />
            <Link href="/" className="text-2xl font-bold text-primary tracking-tighter uppercase font-headline-md hover:opacity-80 transition-opacity cursor-pointer" style={{ fontFamily: 'var(--font-sailors)' }}>
              Toyota U-Trust
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors" href="/inventory">Buy</Link>
            <Link className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors" href="/sell">Sell</Link>
            <Link className="nav-link text-sm font-semibold uppercase tracking-wider text-primary border-b-2 border-primary" href="/exchange">Exchange</Link>
            <Link className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors" href="#">Locations</Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input className="pl-10 pr-4 py-1.5 bg-gray-100 border-none rounded-lg focus:ring-1 focus:ring-primary text-sm outline-none" placeholder="SEARCH INVENTORY" type="text" />
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden bg-surface-container-low">
          <div className="absolute inset-0 z-0">
            <img className="w-full h-full object-cover opacity-80" alt="Sleek luxury car in modern showroom" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJy5JuQMnCAorRrLBYrf9UcPgxvg1RCePhD8qfNTLKwMmwmHKMVusfu0gr6cHiKUh8BF3NZo1E2PragMbA7TpPv474jSPH8TyUZjPC-1VaN8F-uhGPkhWkHjC23Opv0vYZhFR8k5_0wFcHRiT7NlG9i793HNUqvnX5mGI1pnE2isZ8Jm2mOQYIHDjTRCN38gcm-khdieJZTx8_SOh-a9z3Yneb25ywh-88jjYeNytLbX17jpEIDyBl_A"/>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
          </div>
          <div className="relative z-10 w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-20 flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-4 block">Trade-In & Upgrade</span>
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-background uppercase mb-6 leading-tight" style={{ fontFamily: 'var(--font-sailors)' }}>
                Upgrade to Excellence
              </h1>
              <p className="font-body-lg text-body-lg text-secondary mb-8 max-w-lg">
                Exchange your vehicle for a certified Nippon U-Trust car with seamless valuation and immediate credit.
              </p>
              <div className="flex gap-4">
                <button onClick={() => document.getElementById('exchange-form')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-label-bold uppercase rounded-lg px-8 py-3.5 hover:opacity-90 transition-all shadow-md">
                  Start Valuation
                </button>
                <Link href="/inventory" className="border-2 border-primary text-primary font-label-bold uppercase rounded-lg px-8 py-3.5 hover:bg-surface-container-low transition-colors">
                  Browse Inventory
                </Link>
              </div>
            </div>
            {/* Glassmorphism Teaser */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-end">
              <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-xl p-8 shadow-xl w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <h3 className="font-headline-md text-on-surface mb-6 uppercase" style={{ fontFamily: 'var(--font-sailors)' }}>Quick Estimate</h3>
                <form className="space-y-4 relative z-10">
                  <div>
                    <label className="font-label-sm text-secondary mb-1 block uppercase">Vehicle Make</label>
                    <select name="currentMake" value={formData.currentMake} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                      <option value="">Select Make</option>
                      <option value="Toyota">Toyota</option>
                      <option value="Honda">Honda</option>
                      <option value="Nissan">Nissan</option>
                      <option value="Maruti Suzuki">Maruti Suzuki</option>
                      <option value="Hyundai">Hyundai</option>
                      <option value="Tata">Tata</option>
                      <option value="Mahindra">Mahindra</option>
                      <option value="Kia">Kia</option>
                      <option value="Ford">Ford</option>
                      <option value="Volkswagen">Volkswagen</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-label-sm text-secondary mb-1 block uppercase">Registration Year</label>
                    <select name="currentYear" value={formData.currentYear} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                      <option value="">Select Year</option>
                      {Array.from({length: 15}, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <button type="button" onClick={() => document.getElementById('exchange-form')?.scrollIntoView({ behavior: 'smooth' })} className="w-full bg-primary text-white font-label-bold uppercase rounded-lg px-6 py-3.5 mt-4 hover:opacity-90 transition-all shadow-md">
                    Proceed to Exchange
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-24 bg-surface px-margin-mobile md:px-margin-desktop">
          <div className="max-w-max-width mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-md text-on-background uppercase mb-4" style={{ fontFamily: 'var(--font-sailors)' }}>The Exchange Process</h2>
              <p className="text-secondary max-w-2xl mx-auto">Three simple steps to upgrade your vehicle with transparency and fair market pricing.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-surface-container relative group hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-3xl text-primary">calculate</span>
                </div>
                <h3 className="font-headline-md text-on-surface mb-3 text-xl uppercase">1. Instant Valuation</h3>
                <p className="text-secondary text-sm">Provide basic details about your current vehicle for a preliminary fair market estimate instantly online.</p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-sm border border-surface-container relative group hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-3xl text-primary">fact_check</span>
                </div>
                <h3 className="font-headline-md text-on-surface mb-3 text-xl uppercase">2. 203-Point Inspection</h3>
                <p className="text-secondary text-sm">Bring your car to a certified center. Our experts conduct a rigorous technical evaluation to finalize the offer.</p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-sm border border-surface-container relative group hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-3xl text-primary">car_rental</span>
                </div>
                <h3 className="font-headline-md text-on-surface mb-3 text-xl uppercase">3. Seamless Upgrade</h3>
                <p className="text-secondary text-sm">Apply the exact value of your old car directly as credit towards any certified Nippon U-Trust vehicle.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Exchange Form Section */}
        <section className="py-24 bg-white px-margin-mobile md:px-margin-desktop">
          <div className="max-w-max-width mx-auto flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/3">
              <h2 className="font-headline-md text-on-background uppercase mb-6" style={{ fontFamily: 'var(--font-sailors)' }}>Start Your Exchange</h2>
              <p className="text-secondary mb-8">Complete the details to get an accurate evaluation and browse potential upgrades.</p>
              
              {/* Progress Tracker */}
              <div className="space-y-6">
                <div className={`flex items-center gap-4 ${currentStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-surface-container-high text-secondary'} flex items-center justify-center font-bold`}>1</div>
                  <span className={`font-label-sm uppercase tracking-wider ${currentStep >= 1 ? 'text-primary' : 'text-secondary'}`}>Your Vehicle</span>
                </div>
                <div className="w-0.5 h-8 bg-surface-container-high ml-4 -my-4"></div>
                <div className={`flex items-center gap-4 ${currentStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-surface-container-high text-secondary'} flex items-center justify-center font-bold`}>2</div>
                  <span className={`font-label-sm uppercase tracking-wider ${currentStep >= 2 ? 'text-primary' : 'text-secondary'}`}>The Upgrade</span>
                </div>
                <div className="w-0.5 h-8 bg-surface-container-high ml-4 -my-4"></div>
                <div className={`flex items-center gap-4 ${currentStep >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-surface-container-high text-secondary'} flex items-center justify-center font-bold`}>3</div>
                  <span className={`font-label-sm uppercase tracking-wider ${currentStep >= 3 ? 'text-primary' : 'text-secondary'}`}>Contact Details</span>
                </div>
              </div>
            </div>

            <div className="lg:w-2/3">
              <div className="bg-surface rounded-xl p-8 shadow-sm border border-outline-variant/20 relative overflow-hidden" id="exchange-form">
                {isSubmitted ? (
                  <div className="text-center py-16 px-4 animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="material-symbols-outlined text-green-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <h2 className="font-headline-lg text-primary uppercase mb-4" style={{ fontFamily: 'var(--font-sailors)' }}>Thank You!</h2>
                    <p className="font-body-lg text-secondary mb-8">
                      Your exchange request has been successfully received. 
                      Our concierge team will review your vehicle details and call you back shortly.
                    </p>
                    <button 
                      onClick={() => { setIsSubmitted(false); setCurrentStep(1); setFormData({...formData, currentMake: ''}); }}
                      className="bg-primary text-white px-8 py-3 font-label-bold tracking-widest rounded-lg hover:brightness-110 transition-all uppercase shadow-md"
                    >
                      Start Another Exchange
                    </button>
                  </div>
                ) : (
                  <form className="space-y-8" noValidate>
                    {/* Step 1: Current Vehicle */}
                    <div className={`form-step ${currentStep === 1 ? 'block' : 'hidden'}`} id="step-1">
                      <h3 className="font-headline-md text-on-surface mb-6 text-xl uppercase" style={{ fontFamily: 'var(--font-sailors)' }}>Step 1: Current Vehicle Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="font-label-sm text-secondary mb-1 block uppercase">Make</label>
                          <input name="currentMake" value={formData.currentMake} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="e.g. Toyota" type="text" required />
                        </div>
                        <div>
                          <label className="font-label-sm text-secondary mb-1 block uppercase">Model</label>
                          <input name="currentModel" value={formData.currentModel} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="e.g. Camry" type="text" required />
                        </div>
                        <div>
                          <label className="font-label-sm text-secondary mb-1 block uppercase">Year</label>
                          <input name="currentYear" value={formData.currentYear} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="YYYY" type="number" required />
                        </div>
                        <div>
                          <label className="font-label-sm text-secondary mb-1 block uppercase">Mileage (km)</label>
                          <input name="currentMileage" value={formData.currentMileage} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="e.g. 50000" type="number" required />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <label className="font-label-sm text-secondary mb-2 block uppercase">General Condition</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['Excellent', 'Good', 'Fair', 'Poor'].map(cond => (
                              <label key={cond} className="cursor-pointer relative">
                                <input checked={formData.condition === cond} onChange={handleInputChange} className="peer sr-only" name="condition" type="radio" value={cond} />
                                <div className="px-4 py-3 border border-outline-variant rounded-lg text-center font-label-sm uppercase peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all">{cond}</div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 flex justify-end">
                        <button type="button" onClick={(e) => handleNextStep(e, 2)} className="bg-primary text-white font-label-bold uppercase rounded-lg px-8 py-3.5 hover:opacity-90 transition-all shadow-md flex items-center gap-2">
                          Next Step <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>

                    {/* Step 2: The Upgrade */}
                    <div className={`form-step ${currentStep === 2 ? 'block' : 'hidden'}`} id="step-2">
                      <h3 className="font-headline-md text-on-surface mb-6 text-xl uppercase" style={{ fontFamily: 'var(--font-sailors)' }}>Step 2: The Upgrade</h3>
                      <p className="text-sm text-secondary mb-6">What are you looking to exchange this for?</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="font-label-sm text-secondary mb-1 block uppercase">Preferred Make</label>
                          <select name="upgradeMake" value={formData.upgradeMake} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" required>
                            <option>Toyota</option>
                            <option>Lexus</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-label-sm text-secondary mb-1 block uppercase">Preferred Model</label>
                          <input name="upgradeModel" value={formData.upgradeModel} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="e.g. Fortuner (Optional)" type="text" />
                        </div>
                      </div>
                      <div className="mt-8 flex justify-between">
                        <button type="button" onClick={() => nextStep(1)} className="bg-surface-container-high text-secondary font-label-bold uppercase rounded-lg px-8 py-3.5 hover:bg-gray-200 transition-all">Back</button>
                        <button type="button" onClick={(e) => handleNextStep(e, 3)} className="bg-primary text-white font-label-bold uppercase rounded-lg px-8 py-3.5 hover:opacity-90 transition-all shadow-md flex items-center gap-2">
                          Next Step <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>

                    {/* Step 3: Contact Details */}
                    <div className={`form-step ${currentStep === 3 ? 'block' : 'hidden'}`} id="step-3">
                      <h3 className="font-headline-md text-on-surface mb-6 text-xl uppercase" style={{ fontFamily: 'var(--font-sailors)' }}>Step 3: Contact Details</h3>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="font-label-sm text-secondary mb-1 block uppercase">Full Name</label>
                          <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="John Doe" type="text" required />
                        </div>
                        <div>
                          <label className="font-label-sm text-secondary mb-1 block uppercase">Email</label>
                          <input name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="john@example.com" type="email" required />
                        </div>
                        <div>
                          <label className="font-label-sm text-secondary mb-1 block uppercase">Phone Number</label>
                          <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="+91 00000 00000" type="tel" required />
                        </div>
                      </div>
                      <div className="mt-8 flex justify-between">
                        <button type="button" onClick={() => nextStep(2)} className="bg-surface-container-high text-secondary font-label-bold uppercase rounded-lg px-8 py-3.5 hover:bg-gray-200 transition-all">Back</button>
                        <button type="button" disabled={isSubmitting} onClick={handleFinalSubmit} className="bg-primary text-white font-label-bold uppercase rounded-lg px-8 py-3.5 hover:opacity-90 transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                          {isSubmitting ? 'Submitting...' : 'Submit Exchange Request'} <span className="material-symbols-outlined text-sm">check_circle</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-inverse-surface text-white px-margin-mobile md:px-margin-desktop">
          <div className="max-w-max-width mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <h2 className="font-headline-md uppercase mb-8 text-3xl" style={{ fontFamily: 'var(--font-sailors)' }}>Why Exchange with Us?</h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary fill-icon mt-1">verified</span>
                  <div>
                    <h4 className="font-bold mb-1">Fair Market Valuation</h4>
                    <p className="text-gray-400 text-sm">Our algorithms and expert inspectors ensure you get the most accurate and competitive price for your current vehicle.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary fill-icon mt-1">search_check</span>
                  <div>
                    <h4 className="font-bold mb-1">Transparent 203-Point Inspection</h4>
                    <p className="text-gray-400 text-sm">No hidden deductions. We walk you through every aspect of our rigorous technical inspection report.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary fill-icon mt-1">currency_exchange</span>
                  <div>
                    <h4 className="font-bold mb-1">Immediate Credit Application</h4>
                    <p className="text-gray-400 text-sm">The finalized value of your car is instantly applied as a down payment or credit towards your certified upgrade.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl">
                <img className="w-full h-full object-cover" alt="Technician inspecting vehicle" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVIXB-NUt4qM53PWWIRhC-hvPNj79bhUsVZdY81Vfu6bL2HO5Uxzl81cqAy4UFnnw5d9rwoTe-sc3rtkk3qVEREPHif0al41IYk5A6V6G5ulbFlNIGpPANsXXmRg5gZdJzOwCeIS70VfE9mai4wfOrKZJYxwCnym2kx7jWBEsOnq8ANcKyVsexYsTZqVuiSqiF6GXmgxbn0z6UjRR5IlfD8cRVgNCvkRkU8XRUr_PFUK-z_i5Wq_YOkA"/>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-inverse-surface text-white pt-20 pb-10 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-margin-desktop py-12 max-w-container-max mx-auto">
          <div className="col-span-1 md:col-span-1">
            <div className="text-2xl font-bold text-primary mb-6 uppercase tracking-tighter" style={{ fontFamily: 'var(--font-sailors)' }}>Nippon U-Trust</div>
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
        <div className="px-margin-desktop pt-8 max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/10">
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">© 2024 Nippon U-Trust. Certified Excellence.</p>
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
