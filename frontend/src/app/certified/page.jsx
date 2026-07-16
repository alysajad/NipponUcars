"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Certified() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Micro-interactions for glass panels
    const handleMouseMove = (e) => {
        const glassElements = document.querySelectorAll('.glass-panel');
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        glassElements.forEach(el => {
            el.style.transform = `translate(${(x - 0.5) * 10}px, ${(y - 0.5) * 10}px)`;
        });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-surface text-on-surface">
      {/* TopNavBar */}
      <nav className={`fixed top-0 w-full z-50 border-b border-outline-variant transition-all duration-300 ${scrolled ? 'bg-white shadow-xl' : 'bg-white/95 backdrop-blur-sm'}`}>
        <div className="flex justify-between items-center h-20 px-margin-desktop max-w-container-max mx-auto">
          <div className="flex items-center gap-stack-lg">
            <span className="font-headline-md text-headline-md font-semibold text-primary uppercase">Nippon U-Trust</span>
            <div className="hidden md:flex items-center gap-8 ml-12">
              <Link href="#" className="nav-link font-label-bold text-label-bold uppercase text-on-surface hover:text-primary relative after:content-[''] after:absolute after:w-0 hover:after:w-full after:h-[2px] after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-primary after:transition-all after:duration-300">Buy</Link>
              <Link href="/sell" className="nav-link font-label-bold text-label-bold uppercase text-on-surface hover:text-primary relative after:content-[''] after:absolute after:w-0 hover:after:w-full after:h-[2px] after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-primary after:transition-all after:duration-300">Sell</Link>
              <Link href="#" className="nav-link font-label-bold text-label-bold uppercase text-on-surface hover:text-primary relative after:content-[''] after:absolute after:w-0 hover:after:w-full after:h-[2px] after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-primary after:transition-all after:duration-300">Exchange</Link>
              <Link href="/inventory" className="nav-link font-label-bold text-label-bold uppercase text-on-surface hover:text-primary relative after:content-[''] after:absolute after:w-0 hover:after:w-full after:h-[2px] after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-primary after:transition-all after:duration-300">Inventory</Link>
            </div>
          </div>
          <div className="flex items-center gap-stack-md">
            <button className="material-symbols-outlined text-on-surface p-2 hover:bg-surface-container-low rounded-full transition-all">search</button>
            <button className="bg-primary text-on-primary font-label-bold text-label-bold px-8 py-3 uppercase tracking-widest rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md">
                LOGIN
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center overflow-hidden">
            <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://res.cloudinary.com/vdofesxh/image/upload/f_auto,q_auto/v1784191716/utrust_assets/utrust_asset_certified_page_2.jpg')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
            <div className="w-full max-w-container-max mx-auto px-margin-desktop relative z-10">
                <div className="glass-panel p-8 md:p-12 max-w-2xl rounded-xl border border-white/20 shadow-2xl transition-transform duration-200" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)' }}>
                    <span className="inline-block px-4 py-1.5 bg-primary text-white font-label-bold text-label-bold tracking-widest mb-6 rounded-md uppercase shadow-sm">Certified Pre-Owned</span>
                    <h1 className="font-headline-lg text-headline-lg-mobile md:text-[56px] text-on-surface uppercase mb-6 leading-none">
                        The Ultimate Seal <br/>of Approval
                    </h1>
                    <p className="font-body-lg text-body-lg text-secondary mb-10 leading-relaxed font-medium">
                        Experience precision and peace of mind with the industry's most rigorous certification standard. Every vehicle undergoes a forensic evaluation by our certified master technicians.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="bg-primary text-white px-8 py-4 font-label-bold text-[16px] tracking-widest rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md uppercase">Book an Inspection</button>
                        <button className="border-2 border-primary text-primary px-8 py-4 font-label-bold text-[16px] tracking-widest rounded-lg hover:bg-white/50 active:scale-95 transition-all shadow-sm uppercase">Learn More</button>
                    </div>
                </div>
            </div>
        </section>

        {/* The 203-Point Inspection */}
        <section className="py-24 bg-surface">
            <div className="max-w-container-max mx-auto px-margin-desktop">
                <div className="text-center mb-16">
                    <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase mb-6">The 203-Point Inspection</h2>
                    <p className="max-w-3xl mx-auto font-body-lg text-body-lg text-secondary">
                        Our comprehensive diagnostic process leaves no bolt unturned. We evaluate every mechanical, aesthetic, and electronic component to ensure uncompromising quality.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Braking */}
                    <div className="group relative h-[450px] overflow-hidden rounded-2xl cursor-pointer shadow-xl">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://res.cloudinary.com/vdofesxh/image/upload/f_auto,q_auto/v1784191710/utrust_assets/utrust_asset_certified_page_0.jpg')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 p-8 w-full transform transition-transform duration-300 group-hover:-translate-y-4">
                            <div className="flex items-center gap-4 mb-3">
                                <span className="material-symbols-outlined text-primary text-4xl">minor_crash</span>
                                <h3 className="font-headline-md text-headline-md text-white uppercase tracking-wide">Braking System</h3>
                            </div>
                            <p className="text-white/80 font-body-md text-body-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 h-0 group-hover:h-auto overflow-hidden">
                                Testing pad thickness, rotor integrity, and hydraulic pressure for maximum stopping power.
                            </p>
                        </div>
                    </div>
                    
                    {/* Powertrain */}
                    <div className="group relative h-[450px] overflow-hidden rounded-2xl cursor-pointer shadow-xl">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://res.cloudinary.com/vdofesxh/image/upload/f_auto,q_auto/v1784191722/utrust_assets/utrust_asset_certified_page_3.jpg')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 p-8 w-full transform transition-transform duration-300 group-hover:-translate-y-4">
                            <div className="flex items-center gap-4 mb-3">
                                <span className="material-symbols-outlined text-primary text-4xl">settings_input_component</span>
                                <h3 className="font-headline-md text-headline-md text-white uppercase tracking-wide">Powertrain</h3>
                            </div>
                            <p className="text-white/80 font-body-md text-body-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 h-0 group-hover:h-auto overflow-hidden">
                                Full diagnostic analysis of engine performance, transmission fluid quality, and drive shafts.
                            </p>
                        </div>
                    </div>
                    
                    {/* Interior */}
                    <div className="group relative h-[450px] overflow-hidden rounded-2xl cursor-pointer shadow-xl">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://res.cloudinary.com/vdofesxh/image/upload/f_auto,q_auto/v1784191713/utrust_assets/utrust_asset_certified_page_1.jpg')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 p-8 w-full transform transition-transform duration-300 group-hover:-translate-y-4">
                            <div className="flex items-center gap-4 mb-3">
                                <span className="material-symbols-outlined text-primary text-4xl">chair_alt</span>
                                <h3 className="font-headline-md text-headline-md text-white uppercase tracking-wide">Interior & Tech</h3>
                            </div>
                            <p className="text-white/80 font-body-md text-body-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 h-0 group-hover:h-auto overflow-hidden">
                                Rigorous checking of upholstery, infotainment systems, climate control, and safety electronics.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Benefits of Certification */}
        <section className="py-24 bg-surface-container-low">
            <div className="max-w-container-max mx-auto px-margin-desktop">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="font-headline-lg text-headline-lg-mobile md:text-[56px] leading-[1.1] text-on-surface uppercase mb-6">Unmatched Protection</h2>
                        <p className="font-body-lg text-body-lg text-secondary leading-relaxed">Our certification isn't just a sticker; it's a commitment to your long-term satisfaction and safety on the road.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Warranty */}
                    <div className="bg-white p-12 rounded-2xl shadow-lg border-t-4 border-primary group hover:-translate-y-2 transition-all duration-300">
                        <span className="material-symbols-outlined text-primary text-5xl mb-8">verified_user</span>
                        <h4 className="font-headline-md text-headline-md uppercase mb-4 text-on-surface tracking-wide">12-Month Warranty</h4>
                        <p className="text-secondary font-body-md text-body-md leading-relaxed">Comprehensive coverage for major components, giving you total peace of mind for the first year of ownership.</p>
                    </div>
                    
                    {/* Roadside */}
                    <div className="bg-white p-12 rounded-2xl shadow-lg border-t-4 border-primary group hover:-translate-y-2 transition-all duration-300">
                        <span className="material-symbols-outlined text-primary text-5xl mb-8">support_agent</span>
                        <h4 className="font-headline-md text-headline-md uppercase mb-4 text-on-surface tracking-wide">24/7 Roadside</h4>
                        <p className="text-secondary font-body-md text-body-md leading-relaxed">Wherever you are in Japan, help is just a phone call away. Towing, battery jump-starts, and emergency fuel delivery.</p>
                    </div>
                    
                    {/* Resale */}
                    <div className="bg-white p-12 rounded-2xl shadow-lg border-t-4 border-primary group hover:-translate-y-2 transition-all duration-300">
                        <span className="material-symbols-outlined text-primary text-5xl mb-8">trending_up</span>
                        <h4 className="font-headline-md text-headline-md uppercase mb-4 text-on-surface tracking-wide">High Resale Value</h4>
                        <p className="text-secondary font-body-md text-body-md leading-relaxed">A Nippon U-Trust certificate is a transferable asset that significantly increases the market value of your vehicle.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* The Certification Journey */}
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-container-max mx-auto px-margin-desktop">
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-center uppercase mb-24">The Certification Journey</h2>
                
                <div className="relative">
                    {/* Progress Line (Desktop) */}
                    <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-[2px] bg-outline-variant"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-headline-md text-[24px] mb-8 ring-[10px] ring-white shadow-lg group-hover:scale-110 transition-transform">01</div>
                            <h5 className="font-headline-md text-[24px] uppercase mb-4 text-on-surface">Deep Inspection</h5>
                            <p className="text-secondary font-body-md text-body-md px-4 leading-relaxed">Our master technicians conduct the 203-point exhaustive diagnostic.</p>
                        </div>
                        
                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-headline-md text-[24px] mb-8 ring-[10px] ring-white shadow-lg group-hover:scale-110 transition-transform">02</div>
                            <h5 className="font-headline-md text-[24px] uppercase mb-4 text-on-surface">Refurbishment</h5>
                            <p className="text-secondary font-body-md text-body-md px-4 leading-relaxed">Any component failing to meet our strict criteria is replaced with genuine parts.</p>
                        </div>
                        
                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-headline-md text-[24px] mb-8 ring-[10px] ring-white shadow-lg group-hover:scale-110 transition-transform">03</div>
                            <h5 className="font-headline-md text-[24px] uppercase mb-4 text-on-surface">Certification</h5>
                            <p className="text-secondary font-body-md text-body-md px-4 leading-relaxed">The final quality audit is performed and the official seal is awarded.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary"></div>
            {/* Overlay pattern for texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]"></div>

            <div className="max-w-container-max mx-auto px-margin-desktop relative z-10 text-center">
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-[56px] text-white uppercase mb-10 drop-shadow-md">Ready to Elevate Your Standard?</h2>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <button className="bg-white text-primary font-label-bold tracking-widest text-[16px] px-12 py-5 rounded-lg hover:bg-surface-container-low transition-colors uppercase shadow-xl hover:-translate-y-1">Find Your Certified Car</button>
                    <button className="bg-transparent border-2 border-white text-white font-label-bold tracking-widest text-[16px] px-12 py-5 rounded-lg hover:bg-white/10 transition-colors uppercase shadow-xl hover:-translate-y-1">Book an Inspection</button>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
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
