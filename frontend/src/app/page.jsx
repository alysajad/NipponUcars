"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MobileMenu from '@/components/MobileMenu';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedCars } from '@/api/inventoryApi';

function parseSpecs(specs) {
  if (!specs) return {};
  if (typeof specs === 'object') return specs;
  try { return JSON.parse(specs); } catch(e) { return {}; }
}

const reorderForCenter = (arr) => {
  if (!arr || arr.length === 0) return [];
  const result = new Array(arr.length);
  const mid = Math.floor((arr.length - 1) / 2);
  let left = mid - 1;
  let right = mid + 1;
  result[mid] = arr[0];
  
  for (let i = 1; i < arr.length; i++) {
    if (i % 2 !== 0) {
      result[right++] = arr[i];
    } else {
      result[left--] = arr[i];
    }
  }
  return result;
};

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Search State
  const [searchModel, setSearchModel] = useState('');
  const [searchBudget, setSearchBudget] = useState('');
  const [searchBodyType, setSearchBodyType] = useState('');
  const router = useRouter();

  const { data: featuredCars = [], isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['featured-cars'],
    queryFn: fetchFeaturedCars
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchModel) params.append('model', searchModel);
    if (searchBudget) params.append('budget', searchBudget);
    if (searchBodyType) params.append('bodyType', searchBodyType);
    router.push(`/inventory?${params.toString()}`);
  };

  return (
    <div className="bg-surface text-on-surface w-full overflow-x-hidden">
      {/* TopNavBar */}
      <nav className={`fixed top-0 w-full z-50 border-b border-outline-variant transition-all duration-300 ${scrolled ? 'bg-white shadow-xl' : 'bg-white/95 backdrop-blur-sm'}`}>
        <div className="flex justify-between items-center h-20 px-margin-desktop max-w-container-max mx-auto">
          <div className="flex items-center gap-stack-lg">
            <MobileMenu />
            <Link href="/" className="font-headline-md text-headline-md font-semibold text-primary uppercase hover:opacity-80 transition-opacity cursor-pointer">Nippon U-CARS</Link>
            <div className="hidden md:flex items-center gap-8 ml-12">
              <Link href="#" className="nav-link font-label-bold text-label-bold uppercase text-primary relative after:content-[''] after:absolute after:w-full after:h-[2px] after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-primary">Buy</Link>
              <Link href="/sell" className="nav-link font-label-bold text-label-bold uppercase text-on-surface hover:text-primary relative after:content-[''] after:absolute after:w-0 hover:after:w-full after:h-[2px] after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-primary after:transition-all after:duration-300">Sell</Link>
              <Link href="/exchange" className="nav-link font-label-bold text-label-bold uppercase text-on-surface hover:text-primary relative after:content-[''] after:absolute after:w-0 hover:after:w-full after:h-[2px] after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-primary after:transition-all after:duration-300">Exchange</Link>
              <Link href="/inventory" className="nav-link font-label-bold text-label-bold uppercase text-on-surface hover:text-primary relative after:content-[''] after:absolute after:w-0 hover:after:w-full after:h-[2px] after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-primary after:transition-all after:duration-300">Inventory</Link>
              <Link href="/about" className="nav-link font-label-bold text-label-bold uppercase text-on-surface hover:text-primary relative after:content-[''] after:absolute after:w-0 hover:after:w-full after:h-[2px] after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-primary after:transition-all after:duration-300">About Us</Link>
            </div>
          </div>
          <div className="flex items-center gap-stack-md">
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: "url('https://res.cloudinary.com/vdofesxh/image/upload/f_auto,q_auto/v1784193326/utrust_assets/hero/hero_main_new.jpg')" }}></div>
          <div className="absolute inset-0 hero-gradient" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)' }}></div>
        </div>
        <div className="relative z-10 w-full px-margin-desktop max-w-container-max mx-auto">
          <div className="max-w-3xl text-white">
            <h1 className="font-headline-xl text-headline-xl mb-stack-md uppercase">
              The Gold Standard in <br/><span className="text-primary">Pre-Owned Cars</span>
            </h1>
            <p className="font-body-lg text-body-lg mb-10 text-white opacity-90 max-w-xl">
              Experience peace of mind with Nippon's certified pre-owned vehicles. Each car undergoes a rigorous 203-point inspection for absolute quality.
            </p>
            
            {/* Search Tool (Glassmorphism) */}
            <div className="glass-effect p-2 rounded-xl flex flex-col md:flex-row gap-2 items-stretch md:items-center" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
              <div className="flex-1 px-6 py-3 border-b md:border-b-0 md:border-r border-black/10">
                <label className="block font-label-sm text-secondary uppercase mb-1 opacity-70">Model</label>
                <select value={searchModel} onChange={(e) => setSearchModel(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 font-label-bold text-secondary p-0 uppercase outline-none">
                  <option value="">All Models</option>
                  <option value="Fortuner">Fortuner</option>
                  <option value="Corolla">Corolla</option>
                  <option value="Camry">Camry</option>
                  <option value="Hilux">Hilux</option>
                  <option value="Innova">Innova</option>
                  <option value="Supra">Supra</option>
                </select>
              </div>
              <div className="flex-1 px-6 py-3 border-b md:border-b-0 md:border-r border-black/10">
                <label className="block font-label-sm text-secondary uppercase mb-1 opacity-70">Budget</label>
                <select value={searchBudget} onChange={(e) => setSearchBudget(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 font-label-bold text-secondary p-0 uppercase outline-none">
                  <option value="">Any Price</option>
                  <option value="0-10">Under ₹10 Lakh</option>
                  <option value="10-25">₹10 Lakh - ₹25 Lakh</option>
                  <option value="25-200">Over ₹25 Lakh</option>
                </select>
              </div>
              <div className="flex-1 px-6 py-3">
                <label className="block font-label-sm text-secondary uppercase mb-1 opacity-70">Body Type</label>
                <select value={searchBodyType} onChange={(e) => setSearchBodyType(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 font-label-bold text-secondary p-0 uppercase outline-none">
                  <option value="">All Types</option>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                </select>
              </div>
              <button onClick={handleSearch} className="bg-primary text-white font-label-bold text-label-bold px-6 py-4 md:px-12 md:py-5 uppercase rounded-lg flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-lg">
                <span className="material-symbols-outlined font-bold">search</span> Search
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Infinite Marquee Strip */}
      <div className="w-full overflow-hidden bg-surface border-b border-outline-variant py-6 flex items-center relative">
        <div className="flex animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className="flex items-center space-x-12 px-6">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/5 rounded-full p-2 text-[24px]">verified</span>
                <span className="font-bold text-[16px] uppercase tracking-wide text-secondary">Certified Pre-Owned</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
              
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/5 rounded-full p-2 text-[24px]">assignment_turned_in</span>
                <span className="font-bold text-[16px] uppercase tracking-wide text-secondary">203-Point Inspection</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-outline-variant"></div>

              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/5 rounded-full p-2 text-[24px]">sell</span>
                <span className="font-bold text-[16px] uppercase tracking-wide text-secondary">Instant Valuation</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-outline-variant"></div>

              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/5 rounded-full p-2 text-[24px]">analytics</span>
                <span className="font-bold text-[16px] uppercase tracking-wide text-secondary">Fair Market Price</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-outline-variant"></div>

              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/5 rounded-full p-2 text-[24px]">account_balance</span>
                <span className="font-bold text-[16px] uppercase tracking-wide text-secondary">Easy Financing</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-outline-variant"></div>

              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/5 rounded-full p-2 text-[24px]">visibility_off</span>
                <span className="font-bold text-[16px] uppercase tracking-wide text-secondary">No Hidden Fees</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-outline-variant"></div>

              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/5 rounded-full p-2 text-[24px]">local_shipping</span>
                <span className="font-bold text-[16px] uppercase tracking-wide text-secondary">Doorstep Delivery</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-outline-variant"></div>

              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/5 rounded-full p-2 text-[24px]">verified_user</span>
                <span className="font-bold text-[16px] uppercase tracking-wide text-secondary">1-Year Warranty</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-outline-variant"></div>

              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/5 rounded-full p-2 text-[24px]">swap_horiz</span>
                <span className="font-bold text-[16px] uppercase tracking-wide text-secondary">Easy Exchange</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-outline-variant"></div>

              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/5 rounded-full p-2 text-[24px]">directions_car</span>
                <span className="font-bold text-[16px] uppercase tracking-wide text-secondary">Test Drive Anywhere</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
            </div>
          ))}
        </div>
      </div>
      {/* The U-CARS Advantage Section */}
      <section className="pt-10 pb-24 bg-white">
        <div className="px-4 md:px-8 w-full max-w-full mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 mb-16">
            <h2 className="font-headline-lg text-headline-md md:text-headline-lg uppercase bg-primary text-white px-6 py-3 rounded-lg shadow-sm whitespace-normal md:whitespace-nowrap text-center md:text-left w-full md:w-auto">The Nippon Promise</h2>
            <p className="font-body-md text-body-md text-secondary/70 max-w-2xl leading-relaxed">
              At Nippon U-CARS, we offer a range of advantages to help you buy and sell with confidence. These include our comprehensive evaluation, manufacturer-backed warranties, and fully transparent history.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-surface-container-low p-10 rounded-[2.5rem] border border-outline-variant flex justify-between items-center group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 h-64 md:h-72">
              <div className="flex flex-col justify-between h-full z-10">
                <div>
                  <span className="font-headline-md text-headline-md uppercase bg-white px-4 py-2 rounded-md inline-block shadow-sm text-secondary">203-Point</span>
                  <br/>
                  <span className="font-headline-md text-headline-md uppercase bg-white px-4 py-2 rounded-md inline-block shadow-sm mt-2 text-secondary">Inspection</span>
                </div>
                <Link href="/about#certification-protocol" className="flex items-center gap-3 font-label-bold text-label-bold uppercase mt-auto text-secondary group-hover:text-primary transition-colors">
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
                <Link href="/about#ucars-promise" className="flex items-center gap-3 font-label-bold text-label-bold uppercase mt-auto text-white group-hover:text-gray-300 transition-colors">
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
                <Link href="/about#brand-story" className="flex items-center gap-3 font-label-bold text-label-bold uppercase mt-auto text-primary group-hover:brightness-110 transition-colors">
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
                <Link href="/about#ucars-promise" className="flex items-center gap-3 font-label-bold text-label-bold uppercase mt-auto text-white group-hover:text-gray-300 transition-colors">
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
                <Link href="/about#ucars-promise" className="flex items-center gap-3 font-label-bold text-label-bold uppercase mt-auto text-secondary group-hover:text-primary transition-colors">
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
                <Link href="/sell" className="flex items-center gap-3 font-label-bold text-label-bold uppercase mt-auto text-primary group-hover:brightness-110 transition-colors">
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
        <div className="px-4 md:px-8 w-full max-w-full mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 border-b border-outline-variant pb-6">
            <div>
              <span className="text-primary font-label-bold text-label-bold tracking-[0.2em] uppercase">Handpicked Selection</span>
              <h2 className="font-headline-lg text-headline-lg mt-2 uppercase text-secondary">Featured Nippon Certified</h2>
            </div>
            <Link href="/inventory" className="flex items-center gap-2 font-label-bold text-label-bold text-primary group uppercase mt-4 md:mt-0">
              VIEW ALL INVENTORY <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {isLoadingFeatured ? (
              // Skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <article key={i} className="bg-white rounded-xl overflow-hidden border border-outline-variant animate-pulse h-[450px] w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.333rem)] xl:w-[calc(20%-1.6rem)]">
                  <div className="w-full h-72 bg-surface-container-high" />
                  <div className="p-8"><div className="h-4 bg-surface-container-high mb-4 w-1/2" /></div>
                </article>
              ))
            ) : featuredCars.length > 0 ? (
              reorderForCenter(featuredCars).map(car => {
                const specs = parseSpecs(car.specs);
                const coverImage = car.frames?.[0] || 'https://res.cloudinary.com/vdofesxh/image/upload/f_auto,q_auto/v1784191696/utrust_assets/utrust_asset_page_0.jpg';
                return (
                  <article key={car.id} className="bg-white rounded-xl card-hover overflow-hidden border border-outline-variant transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(215,25,33,0.15)] shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.333rem)] xl:w-[calc(20%-1.6rem)] flex-shrink-0">
                    <div className="relative h-72 overflow-hidden bg-surface-container-low">
                      <img className="w-full h-full object-contain p-4" alt={car.name} src={coverImage} />
                      <div className="absolute top-4 left-4">
                        <span className="text-secondary text-[11px] font-bold px-4 py-1.5 uppercase tracking-widest flex items-center gap-2 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                          <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                          Certified
                        </span>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col h-[calc(100%-18rem)]">
                      <div className="flex flex-col xl:flex-row justify-between items-start gap-2 xl:gap-4 mb-6">
                        <div className="flex-1">
                          <h4 className="font-headline-md text-headline-md uppercase">{car.name}</h4>
                          <p className="text-secondary/50 font-label-sm uppercase tracking-wider">{specs.engine || specs.brand || ''}</p>
                        </div>
                        <p className="font-headline-md text-headline-md text-primary whitespace-nowrap">{car.price || 'N/A'}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-8 py-4 border-y border-outline-variant mt-auto">
                        <div className="text-center">
                          <span className="material-symbols-outlined text-secondary/40 block mb-1">calendar_today</span>
                          <span className="font-label-bold text-secondary">{specs.year || 'N/A'}</span>
                        </div>
                        <div className="text-center border-x border-outline-variant">
                          <span className="material-symbols-outlined text-secondary/40 block mb-1">speed</span>
                          <span className="font-label-bold text-secondary">{specs.km ? `${specs.km} km` : 'N/A'}</span>
                        </div>
                        <div className="text-center">
                          <span className="material-symbols-outlined text-secondary/40 block mb-1">settings</span>
                          <span className="font-label-bold text-secondary">{specs.transmission || 'Auto'}</span>
                        </div>
                      </div>
                      <Link href={`/inventory/detail?id=${car.id}`} className="w-full bg-primary text-white font-label-bold text-label-bold py-4 uppercase rounded-lg hover:brightness-110 transition-all shadow-md block text-center">
                        View Details
                      </Link>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-secondary/50 font-label-bold uppercase tracking-widest">
                No featured cars available.
              </div>
            )}
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
                Upgrade your drive effortlessly. Get a transparent valuation for your current car in minutes and trade it in for a certified car of your choice.
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
            <span className="font-headline-md text-headline-md text-white font-semibold uppercase">Nippon U-CARS</span>
            <p className="font-body-md text-body-md opacity-60 max-w-xs">
              The trusted name for certified pre-owned cars. Reliability you can count on, value you can trust.
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
              <li><Link href="#" className="font-body-md text-body-md text-white/60 hover:text-primary transition-colors">About U-CARS</Link></li>
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
          <span className="font-body-md text-body-md text-white/40">© 2024 Nippon U-CARS. All Rights Reserved. Certified Excellence.</span>
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
