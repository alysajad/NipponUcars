"use client";
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchInventory, createEnquiry } from '@/api/inventoryApi';


const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (!d) return dateStr;
  return `${d}/${m}/${y}`;
};

export default function EnquiryPage() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen text-lg">Loading...</div>}>
      <EnquiryContent />
    </React.Suspense>
  );
}

function EnquiryContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory
  });

  const car = useMemo(() => cars.find(c => c.id === id), [cars, id]);

  const [formStatus, setFormStatus] = useState('idle');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Select City',
    preferredDate: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    setTimeout(() => {
      setFormStatus('success');
      setTimeout(() => {
        setFormStatus('idle');
      }, 3000);
    }, 1500);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-lg font-bold uppercase tracking-widest text-primary font-headline-md" style={{ fontFamily: 'var(--font-sailors)' }}>Loading...</div>;
  }

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-3xl font-bold uppercase mb-4 text-secondary font-headline-xl" style={{ fontFamily: 'var(--font-sailors)' }}>Car Not Found</h2>
        <Link href="/inventory" className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest hover:brightness-110 transition-all">Back to Inventory</Link>
      </div>
    );
  }

  let specs = {};
  try {
    specs = typeof car.specs === 'object' ? car.specs : JSON.parse(car.specs);
  } catch(e) {}

  const coverImage = car.frames && car.frames.length > 0 ? car.frames[0] : '/placeholder-car.jpg';

  return (
    <div className="bg-background text-on-surface font-body-md" style={{ fontFamily: 'var(--font-proxima)' }}>
      {/* TopNavBar Component */}
      <header className="sticky top-0 w-full z-50 flex justify-between items-center h-20 px-margin-desktop max-w-container-max mx-auto bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="text-2xl font-bold text-primary uppercase font-headline-md" style={{ fontFamily: 'var(--font-sailors)' }}>
            Toyota U-Trust
        </div>
        <nav className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors" href="/inventory">Buy</Link>
            <Link className="text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors" href="/sell">Sell</Link>
            <Link className="text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors" href="/exchange">Exchange</Link>
            <Link className="text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors" href="#">Locations</Link>
        </nav>
        <div className="flex items-center gap-6">
            <button className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all active:scale-95 duration-100 hover:brightness-110 shadow-md">
                Enquire Now
            </button>
        </div>
      </header>

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        {/* Hero/Context Section: Car Summary */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
            <div className="md:col-span-7 overflow-hidden relative group flex items-center justify-center">
                <img className="w-full max-h-[400px] md:max-h-[500px] object-contain group-hover:scale-105 transition-transform duration-700 p-4" src={coverImage} alt={car.name} />
            </div>
            
            <div className="md:col-span-5 flex flex-col justify-center gap-6">
                <div className="flex flex-col gap-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-secondary text-white w-fit rounded-sm font-bold text-xs uppercase tracking-widest shadow-sm">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        CERTIFIED PRE-OWNED
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight uppercase font-headline-xl" style={{ fontFamily: 'var(--font-sailors)' }}>{car.name}</h1>
                    <div className="flex items-center gap-4">
                        <p className="text-2xl font-bold text-primary">{car.price || 'Make Offer'}</p>
                        <span className="h-6 w-px bg-gray-300"></span>
                        <p className="text-lg text-gray-500 font-medium">{specs.year || '2023'} Model</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-3 p-4 bg-surface-container-low border border-gray-200 rounded-lg shadow-sm">
                        <span className="material-symbols-outlined text-secondary text-2xl">speed</span>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mileage</p>
                            <p className="font-bold text-sm text-secondary">{specs.km || 'N/A'} km</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-surface-container-low border border-gray-200 rounded-lg shadow-sm">
                        <span className="material-symbols-outlined text-secondary text-2xl">local_gas_station</span>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fuel Type</p>
                            <p className="font-bold text-sm text-secondary">{specs.fuel || 'Petrol'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-surface-container-low border border-gray-200 rounded-lg shadow-sm">
                        <span className="material-symbols-outlined text-secondary text-2xl">settings</span>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transmission</p>
                            <p className="font-bold text-sm text-secondary">{specs.transmission || 'Auto'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-surface-container-low border border-gray-200 rounded-lg shadow-sm">
                        <span className="material-symbols-outlined text-secondary text-2xl">group</span>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ownership</p>
                            <p className="font-bold text-sm text-secondary">1st Owner</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Enquiry Form Section */}
        <section className="max-w-3xl mx-auto py-12">
            <div className="bg-white p-8 md:p-12 shadow-sm border border-gray-200 rounded-xl relative overflow-hidden">
                {/* Branding Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-2 uppercase font-headline-lg text-secondary" style={{ fontFamily: 'var(--font-sailors)' }}>Enquire Now</h2>
                    <p className="text-gray-500 font-medium">Experience automotive excellence with a personalized consultation.</p>
                </div>
                
                                {formStatus === 'success' ? (
                  <div className="text-center py-16 px-4 animate-fade-in">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="material-symbols-outlined text-primary text-5xl">check_circle</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold uppercase font-headline-md mb-4 text-secondary" style={{ fontFamily: 'var(--font-sailors)' }}>Thank You!</h3>
                    <p className="text-lg text-secondary mb-8 max-w-md mx-auto leading-relaxed">
                      Your enquiry for the {car.name} has been successfully sent. Our expert team will review your details and contact you within 24 hours.
                    </p>
                    <button onClick={() => { setFormStatus('idle'); setFormData({ fullName: '', phone: '', email: '', city: 'Select City', preferredDate: '', message: '' }); }} className="bg-primary text-white px-8 py-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-md">
                      Submit Another Enquiry
                    </button>
                  </div>
                ) : (
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    {/* Name & Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-sm text-secondary uppercase tracking-wider">Full Name</label>
                            <input name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium" placeholder="Enter your full name" type="text" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-sm text-secondary uppercase tracking-wider">Mobile Number</label>
                            <input name="phone" value={formData.phone} onChange={handleInputChange} pattern="^\+?[0-9\s\-]{10,15}$" title="Enter a valid phone number (e.g. +91 9876543210)" required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium" placeholder="+91 00000 00000" type="tel" />
                        </div>
                    </div>
                    
                    {/* Email & City */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-sm text-secondary uppercase tracking-wider">Email Address</label>
                            <input name="email" value={formData.email} onChange={handleInputChange} required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium" placeholder="example@email.com" type="email" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-sm text-secondary uppercase tracking-wider">City</label>
                            <select name="city" value={formData.city} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none font-medium">
                                <option>Select City</option>
                                <option>Mumbai</option>
                                <option>Delhi</option>
                                <option>Bangalore</option>
                                <option>Chennai</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Date Picker */}
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm text-secondary uppercase tracking-wider">Preferred Date for Test Drive</label>
                        <div className="relative">
                          <input name="preferredDate" value={formData.preferredDate} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" type="date" required />
                          <div className={`w-full p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between transition-all ${formData.preferredDate ? 'focus-within:border-primary focus-within:ring-1 focus-within:ring-primary' : ''}`}>
                            <span className={formData.preferredDate ? "text-gray-900 font-medium" : "text-gray-400 font-medium"}>{formatDate(formData.preferredDate) || "DD/MM/YYYY"}</span>
                            <span className="material-symbols-outlined text-gray-400">calendar_month</span>
                          </div>
                        </div>
                    </div>
                    
                    {/* Message Box */}
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm text-secondary uppercase tracking-wider">Message (Optional)</label>
                        <textarea name="message" value={formData.message} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium" placeholder="Mention any specific requirements or questions..." rows={4}></textarea>
                    </div>
                    
                    {/* Trust Signals Overlay */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-surface-container-low border border-gray-200 rounded-lg mt-2">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                            <p className="text-sm font-medium text-gray-600 leading-snug">Our specialist will contact you within 24 hours.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                            <p className="text-sm font-medium text-gray-600 leading-snug">203-point inspection guaranteed on all vehicles.</p>
                        </div>
                    </div>
                    
                    {/* Submit CTA */}
                    <button 
                      disabled={formStatus !== 'idle'}
                      className={`w-full text-white font-bold text-sm py-5 mt-4 uppercase tracking-widest rounded-lg transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 ${
                        formStatus === 'success' ? 'bg-green-600' : 'bg-primary hover:brightness-110'
                      }`} 
                      type="submit"
                    >
                        {formStatus === 'idle' && "Submit Enquiry"}
                        {formStatus === 'submitting' && (
                          <>
                            Processing... <span className="animate-spin material-symbols-outlined">sync</span>
                          </>
                        )}
                        {formStatus === 'success' && "Enquiry Sent Successfully"}
                    </button>
                </form>
                )}
            </div>
        </section>
      </main>

      {/* Footer Component */}
      <footer className="w-full py-12 px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-6 bg-secondary text-white border-t border-gray-800 mt-auto">
        <div className="flex flex-col gap-4 text-center md:text-left">
            <div className="text-2xl font-black text-primary uppercase font-headline-md" style={{ fontFamily: 'var(--font-sailors)' }}>Toyota U-Trust</div>
            <p className="text-sm text-gray-400 max-w-sm">
                © 2024 Toyota U-Trust. Certified Pre-Owned Excellence. All rights reserved.
            </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
            <a className="text-sm text-gray-400 hover:text-white transition-all uppercase tracking-wider font-medium" href="#">Privacy Policy</a>
            <a className="text-sm text-gray-400 hover:text-white transition-all uppercase tracking-wider font-medium" href="#">Terms of Service</a>
            <a className="text-sm text-gray-400 hover:text-white transition-all uppercase tracking-wider font-medium" href="#">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}
