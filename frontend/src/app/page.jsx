"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-surface text-on-surface">
      {/* TopNavBar */}
      <nav className={`fixed top-0 w-full z-50 border-b border-outline-variant transition-all duration-300 ${scrolled ? 'bg-white shadow-xl' : 'bg-white/95 backdrop-blur-sm'}`}>
        <div className="flex justify-between items-center h-20 px-margin-desktop max-w-container-max mx-auto">
          <div className="flex items-center gap-stack-lg">
            <span className="font-headline-md text-headline-md font-semibold text-primary uppercase">Nippon U-Trust</span>
            <div className="hidden md:flex items-center gap-8 ml-12">
              <Link href="#" className="nav-link font-label-bold text-label-bold uppercase text-primary relative after:content-[''] after:absolute after:w-full after:h-[2px] after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-primary">Buy</Link>
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

      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCpB0-ancLEaMoIOupmai5HG_HjVk68k5k0HIZvX-E5nrN7WHsbiuw-MANNzYvP1TwNKL1w53q314d32FgzQTaMFHuK17BIBqO5bOLx4HIM08f999ivP-CKaLveAEVJ4h5DNNIyHzDAlYNi8VWGd10Ou5CNVkwFqwsBTDVP0ypqwSLSUv8V2xcne0DVRHGuaBrBEmW-GyrrmizaH95v4FAQBRo9KfX-gRezClZ8V5GETizziAbKHOV7qw')" }}></div>
          <div className="absolute inset-0 hero-gradient" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)' }}></div>
        </div>
        <div className="relative z-10 w-full px-margin-desktop max-w-container-max mx-auto">
          <div className="max-w-3xl text-white">
            <h1 className="font-headline-xl text-headline-xl mb-stack-md uppercase">
              The Gold Standard in <br/><span className="text-primary">Pre-Owned Cars</span>
            </h1>
            <p className="font-body-lg text-body-lg mb-10 text-white opacity-90 max-w-xl">
              Experience peace of mind with Toyota's manufacturer-certified pre-owned vehicles. Each car undergoes a rigorous 203-point inspection for absolute quality.
            </p>
            
            {/* Search Tool (Glassmorphism) */}
            <div className="glass-effect p-2 rounded-xl flex flex-col md:flex-row gap-2 items-stretch md:items-center" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
              <div className="flex-1 px-6 py-3 border-b md:border-b-0 md:border-r border-black/10">
                <label className="block font-label-sm text-secondary uppercase mb-1 opacity-70">Model</label>
                <select className="w-full bg-transparent border-none focus:ring-0 font-label-bold text-secondary p-0 uppercase outline-none">
                  <option>All Models</option>
                  <option>Fortuner</option>
                  <option>Corolla</option>
                  <option>Camry</option>
                </select>
              </div>
              <div className="flex-1 px-6 py-3 border-b md:border-b-0 md:border-r border-black/10">
                <label className="block font-label-sm text-secondary uppercase mb-1 opacity-70">Budget</label>
                <select className="w-full bg-transparent border-none focus:ring-0 font-label-bold text-secondary p-0 uppercase outline-none">
                  <option>Any Price</option>
                  <option>Under $15k</option>
                  <option>$15k - $30k</option>
                  <option>Over $30k</option>
                </select>
              </div>
              <div className="flex-1 px-6 py-3">
                <label className="block font-label-sm text-secondary uppercase mb-1 opacity-70">Body Type</label>
                <select className="w-full bg-transparent border-none focus:ring-0 font-label-bold text-secondary p-0 uppercase outline-none">
                  <option>All Types</option>
                  <option>SUV</option>
                  <option>Sedan</option>
                  <option>Hatchback</option>
                </select>
              </div>
              <button className="bg-primary text-white font-label-bold text-label-bold px-12 py-5 uppercase rounded-lg flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-lg">
                <span className="material-symbols-outlined font-bold">search</span> Search
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* The U-Trust Advantage Section */}
      <section className="py-24 bg-white">
        <div className="px-margin-desktop max-w-container-max mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-10 mb-16">
            <h2 className="font-headline-lg text-headline-lg uppercase bg-primary text-white px-6 py-3 rounded-lg shadow-sm whitespace-nowrap">The Toyota Promise</h2>
            <p className="font-body-md text-body-md text-secondary/70 max-w-2xl leading-relaxed">
              At Toyota U-Trust, we offer a range of advantages to help you buy and sell with confidence. These include our comprehensive evaluation, manufacturer-backed warranties, and fully transparent history.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="bg-surface-container-low p-10 rounded-[2.5rem] border border-outline-variant flex justify-between items-center group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 h-64 md:h-72">
              <div className="flex flex-col justify-between h-full z-10">
                <div>
                  <span className="font-headline-md text-headline-md uppercase bg-white px-4 py-2 rounded-md inline-block shadow-sm text-secondary">203-Point</span>
                  <br/>
                  <span className="font-headline-md text-headline-md uppercase bg-white px-4 py-2 rounded-md inline-block shadow-sm mt-2 text-secondary">Inspection</span>
                </div>
                <Link href="#" className="flex items-center gap-3 font-label-bold text-label-bold uppercase mt-auto text-secondary group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined bg-white text-secondary group-hover:text-white group-hover:bg-primary transition-colors rounded-full p-2 shadow-sm">arrow_outward</span>
                  Learn More
                </Link>
              </div>
              <div className="w-40 h-40 opacity-80 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center -mr-4">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '100px' }}>assignment_turned_in</span>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="bg-secondary p-10 rounded-[2.5rem] border border-secondary flex justify-between items-center group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 h-64 md:h-72">
              <div className="flex flex-col justify-between h-full z-10">
                <div>
                  <span className="font-headline-md text-headline-md uppercase bg-white text-secondary px-4 py-2 rounded-md inline-block shadow-sm">Comprehensive</span>
                  <br/>
                  <span className="font-headline-md text-headline-md uppercase bg-white text-secondary px-4 py-2 rounded-md inline-block shadow-sm mt-2">Warranty</span>
                </div>
                <Link href="#" className="flex items-center gap-3 font-label-bold text-label-bold uppercase mt-auto text-white group-hover:text-gray-300 transition-colors">
                  <span className="material-symbols-outlined bg-white/20 backdrop-blur-md text-white group-hover:bg-white group-hover:text-secondary transition-colors rounded-full p-2 shadow-sm">arrow_outward</span>
                  Learn More
                </Link>
              </div>
              <div className="w-40 h-40 opacity-80 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center -mr-4">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '100px' }}>verified_user</span>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className="bg-primary/5 p-10 rounded-[2.5rem] border border-primary/20 flex justify-between items-center group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 h-64 md:h-72">
              <div className="flex flex-col justify-between h-full z-10">
                <div>
                  <span className="font-headline-md text-headline-md uppercase bg-primary text-white px-4 py-2 rounded-md inline-block shadow-sm">Transparent</span>
                  <br/>
                  <span className="font-headline-md text-headline-md uppercase bg-primary text-white px-4 py-2 rounded-md inline-block shadow-sm mt-2">History</span>
                </div>
                <Link href="#" className="flex items-center gap-3 font-label-bold text-label-bold uppercase mt-auto text-primary group-hover:brightness-110 transition-colors">
                  <span className="material-symbols-outlined bg-primary text-white group-hover:bg-white group-hover:text-primary transition-colors rounded-full p-2 shadow-sm">arrow_outward</span>
                  Learn More
                </Link>
              </div>
              <div className="w-40 h-40 opacity-80 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center -mr-4">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '100px' }}>history</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-secondary p-10 rounded-[2.5rem] border border-secondary flex justify-between items-center group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 h-64 md:h-72">
              <div className="flex flex-col justify-between h-full z-10">
                <div>
                  <span className="font-headline-md text-headline-md uppercase bg-white text-secondary px-4 py-2 rounded-md inline-block shadow-sm">Flexible</span>
                  <br/>
                  <span className="font-headline-md text-headline-md uppercase bg-white text-secondary px-4 py-2 rounded-md inline-block shadow-sm mt-2">Financing</span>
                </div>
                <Link href="#" className="flex items-center gap-3 font-label-bold text-label-bold uppercase mt-auto text-white group-hover:text-gray-300 transition-colors">
                  <span className="material-symbols-outlined bg-white/20 backdrop-blur-md text-white group-hover:bg-white group-hover:text-secondary transition-colors rounded-full p-2 shadow-sm">arrow_outward</span>
                  Learn More
                </Link>
              </div>
              <div className="w-40 h-40 opacity-80 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center -mr-4">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '100px' }}>account_balance</span>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-surface-container-low p-10 rounded-[2.5rem] border border-outline-variant flex justify-between items-center group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 h-64 md:h-72">
              <div className="flex flex-col justify-between h-full z-10">
                <div>
                  <span className="font-headline-md text-headline-md uppercase bg-white px-4 py-2 rounded-md inline-block shadow-sm text-secondary">Roadside</span>
                  <br/>
                  <span className="font-headline-md text-headline-md uppercase bg-white px-4 py-2 rounded-md inline-block shadow-sm mt-2 text-secondary">Assistance</span>
                </div>
                <Link href="#" className="flex items-center gap-3 font-label-bold text-label-bold uppercase mt-auto text-secondary group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined bg-white text-secondary group-hover:text-white group-hover:bg-primary transition-colors rounded-full p-2 shadow-sm">arrow_outward</span>
                  Learn More
                </Link>
              </div>
              <div className="w-40 h-40 opacity-80 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center -mr-4">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '100px' }}>car_crash</span>
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-primary/5 p-10 rounded-[2.5rem] border border-primary/20 flex justify-between items-center group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 h-64 md:h-72">
              <div className="flex flex-col justify-between h-full z-10">
                <div>
                  <span className="font-headline-md text-headline-md uppercase bg-primary text-white px-4 py-2 rounded-md inline-block shadow-sm">Instant</span>
                  <br/>
                  <span className="font-headline-md text-headline-md uppercase bg-primary text-white px-4 py-2 rounded-md inline-block shadow-sm mt-2">Valuation</span>
                </div>
                <Link href="#" className="flex items-center gap-3 font-label-bold text-label-bold uppercase mt-auto text-primary group-hover:brightness-110 transition-colors">
                  <span className="material-symbols-outlined bg-primary text-white group-hover:bg-white group-hover:text-primary transition-colors rounded-full p-2 shadow-sm">arrow_outward</span>
                  Learn More
                </Link>
              </div>
              <div className="w-40 h-40 opacity-80 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center -mr-4">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '100px' }}>sell</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars Grid */}
      <section className="py-24 bg-white">
        <div className="px-margin-desktop max-w-container-max mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 border-b border-outline-variant pb-6">
            <div>
              <span className="text-primary font-label-bold text-label-bold tracking-[0.2em] uppercase">Handpicked Selection</span>
              <h2 className="font-headline-lg text-headline-lg mt-2 uppercase text-secondary">Featured Toyota Certified</h2>
            </div>
            <Link href="/inventory" className="flex items-center gap-2 font-label-bold text-label-bold text-primary group uppercase mt-4 md:mt-0">
              VIEW ALL INVENTORY <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: Fortuner */}
            <article className="bg-white rounded-xl card-hover overflow-hidden border border-outline-variant transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(215,25,33,0.15)] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <div className="relative h-72 overflow-hidden">
                <img className="w-full h-full object-cover" alt="A professional studio photography shot of a pristine white Toyota Fortuner SUV." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAw4bAkTzDm4fWcUENbEqq5j5qA00ioryYTdGgDRLGxSk81hExyJTFI6Ve1SRRwpjgBk_w4m8QnRddIvXpmREkutmQnCPcMrb9buxtwnwT_48UrwCSE_sh5Lz5D_nPdiTrUDAtk2H7_HMehuclfby9FUwLdJvAlf9StSQPxRlpw4rXanVmcxCyI7gzO5jqD3TWS2eyR3VK6XyYPcTXvO7gGyQ8JKrFBmjgldcM0D_z9Hh5JxnAUSBeNuQ" />
                <div className="absolute top-4 left-4">
                  <span className="text-secondary text-[11px] font-bold px-4 py-1.5 uppercase tracking-widest flex items-center gap-2 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Certified
                  </span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-headline-md text-headline-md uppercase">Toyota Fortuner</h4>
                    <p className="text-secondary/50 font-label-sm uppercase tracking-wider">2.8L Diesel AT 4x4</p>
                  </div>
                  <p className="font-headline-md text-headline-md text-primary">$38,900</p>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-8 py-4 border-y border-outline-variant">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-secondary/40 block mb-1">calendar_today</span>
                    <span className="font-label-bold text-secondary">2021</span>
                  </div>
                  <div className="text-center border-x border-outline-variant">
                    <span className="material-symbols-outlined text-secondary/40 block mb-1">speed</span>
                    <span className="font-label-bold text-secondary">32k km</span>
                  </div>
                  <div className="text-center">
                    <span className="material-symbols-outlined text-secondary/40 block mb-1">settings</span>
                    <span className="font-label-bold text-secondary">Auto</span>
                  </div>
                </div>
                <button className="w-full bg-primary text-white font-label-bold text-label-bold py-4 uppercase rounded-lg hover:brightness-110 transition-all shadow-md">
                  View Details
                </button>
              </div>
            </article>

            {/* Card 2: Corolla */}
            <article className="bg-white rounded-xl card-hover overflow-hidden border border-outline-variant transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(215,25,33,0.15)] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <div className="relative h-72 overflow-hidden">
                <img className="w-full h-full object-cover" alt="A studio photograph of a vibrant red Toyota Corolla sedan." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCX10ruREuMzSMLzoIHgvDUm3kmvpCciXgEu-lJhA7M2UsZX9MLWc7gBPrBb-QzzmH3razheucHfaodqYUB6IBt7dE7u5stFW8ghOKC5J_Vk6i1zEOkYnX9_6SIgyju8zx4ccLQB2Lfn6lKfVFMc7QdfqIvyjwLJBMEoxrTgoDk7PfLu1JYpFizuyWlc_CXGXVD5aIO1fN-MTirhCb2ejwQw59TkvE9yYyNX3vGqxcfj1ip220mYHs2w" />
                <div className="absolute top-4 left-4">
                  <span className="text-secondary text-[11px] font-bold px-4 py-1.5 uppercase tracking-widest flex items-center gap-2 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Certified
                  </span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-headline-md text-headline-md uppercase">Toyota Corolla</h4>
                    <p className="text-secondary/50 font-label-sm uppercase tracking-wider">1.8L Hybrid Premium</p>
                  </div>
                  <p className="font-headline-md text-headline-md text-primary">$24,500</p>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-8 py-4 border-y border-outline-variant">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-secondary/40 block mb-1">calendar_today</span>
                    <span className="font-label-bold text-secondary">2022</span>
                  </div>
                  <div className="text-center border-x border-outline-variant">
                    <span className="material-symbols-outlined text-secondary/40 block mb-1">speed</span>
                    <span className="font-label-bold text-secondary">15k km</span>
                  </div>
                  <div className="text-center">
                    <span className="material-symbols-outlined text-secondary/40 block mb-1">local_gas_station</span>
                    <span className="font-label-bold text-secondary">Hybrid</span>
                  </div>
                </div>
                <button className="w-full bg-primary text-white font-label-bold text-label-bold py-4 uppercase rounded-lg hover:brightness-110 transition-all shadow-md">
                  View Details
                </button>
              </div>
            </article>

            {/* Card 3: Camry */}
            <article className="bg-white rounded-xl card-hover overflow-hidden border border-outline-variant transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(215,25,33,0.15)] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <div className="relative h-72 overflow-hidden">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCGFxoh2mneaobBv6WPVob_UJbAC59RJ3Yla86l1M6s63t0atLMVb_Sxy4HV9ADWgq24_IJcnlAdSDzG55nBTsHTqacfOjv6rnZ-XQ6N1y3xaWwZwpQh7oLv5V42oYfK--1Q6VvY7zYRy_DK3Mrb364kgBw5m8qRVX7MZxlmjucByYyC1TgtFQk24CmxLNtL4ukg_3cd5ZQfnlP6JqXur4nwqFl_JGbC1TtmF-xDQ5X3dSZzQWkqh1-4Q')" }}></div>
                <div className="absolute top-4 left-4">
                  <span className="text-secondary text-[11px] font-bold px-4 py-1.5 uppercase tracking-widest flex items-center gap-2 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Certified
                  </span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-headline-md text-headline-md uppercase">Toyota Camry</h4>
                    <p className="text-secondary/50 font-label-sm uppercase tracking-wider">2.5L Luxury Sedan</p>
                  </div>
                  <p className="font-headline-md text-headline-md text-primary">$31,200</p>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-8 py-4 border-y border-outline-variant">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-secondary/40 block mb-1">calendar_today</span>
                    <span className="font-label-bold text-secondary">2020</span>
                  </div>
                  <div className="text-center border-x border-outline-variant">
                    <span className="material-symbols-outlined text-secondary/40 block mb-1">speed</span>
                    <span className="font-label-bold text-secondary">28k km</span>
                  </div>
                  <div className="text-center">
                    <span className="material-symbols-outlined text-secondary/40 block mb-1">settings</span>
                    <span className="font-label-bold text-secondary">Auto</span>
                  </div>
                </div>
                <button className="w-full bg-primary text-white font-label-bold text-label-bold py-4 uppercase rounded-lg hover:brightness-110 transition-all shadow-md">
                  View Details
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Sell/Exchange CTA */}
      <section className="py-32 relative overflow-hidden bg-secondary">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10 px-margin-desktop max-w-container-max mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="font-headline-xl text-headline-xl text-white mb-6 uppercase">Looking to Sell or Exchange?</h2>
              <p className="font-body-lg text-body-lg text-white opacity-70">
                Upgrade your drive effortlessly. Get a transparent valuation for your current car in minutes and trade it in for a certified Toyota of your choice.
              </p>
            </div>
            <div>
              <Link href="/sell" className="inline-block bg-primary text-white font-headline-md text-headline-md px-16 py-8 uppercase tracking-widest rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-2xl">
                Get Valuation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-margin-desktop py-24 max-w-container-max mx-auto">
          <div className="space-y-8">
            <span className="font-headline-md text-headline-md text-white font-semibold uppercase">Toyota U-Trust</span>
            <p className="font-body-md text-body-md opacity-60 max-w-xs">
              The trusted name for manufacturer-certified pre-owned Toyotas. Reliability you can count on, value you can trust.
            </p>
            <div className="flex gap-4">
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
