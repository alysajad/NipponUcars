"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MobileMenu from '@/components/MobileMenu';

export default function AboutPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-surface text-on-surface overflow-x-hidden">
      {/* TopNavBar */}
      <nav
        className={`fixed top-0 w-full z-50 border-b border-outline-variant transition-all duration-300 ${
          scrolled ? 'bg-white shadow-xl h-16' : 'bg-white/95 backdrop-blur-sm h-20'
        }`}
      >
        <div className="flex justify-between items-center h-full px-margin-desktop max-w-[1280px] mx-auto">
          <div className="flex items-center gap-8">
            <MobileMenu />
            <Link href="/" className="font-headline-md text-headline-md font-semibold text-primary uppercase tracking-tight">
              Nippon U-CARS
            </Link>
            <div className="hidden md:flex items-center gap-8 ml-4">
              <Link
                href="/"
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              >
                Buy
              </Link>
              <Link
                href="/sell"
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              >
                Sell
              </Link>
              <Link
                href="/inventory"
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              >
                Inventory
              </Link>
              <Link
                href="/certified"
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              >
                Certification
              </Link>
              <Link
                href="/about"
                className="font-body-md text-body-md text-primary border-b-2 border-primary pb-1"
              >
                About Us
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-on-surface p-2 hover:bg-surface-container-low rounded-full transition-all">
              search
            </button>
            <Link
              href="/inventory"
              className="bg-primary text-on-primary font-label-sm uppercase tracking-wider px-6 py-2 rounded-md hover:brightness-110 active:scale-95 transition-all shadow-md text-label-sm"
            >
              Find a Car
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* ═══════════════════════════════════════════════
            Hero Section
        ═══════════════════════════════════════════════ */}
        <section id="hero" className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAI8u44xewdi4ATqWfMDL3OkOzu08N2wSBbxYNs_drh2xMyMdsxXfZK-Ouo8Y3kZn11wFUBQnujmYmQxweWdRY1S28qa_czIw7x9toABVHLpjM6_WVFFyS4AIn6e7-g4iEcOGvcsyloVErwe6oTR3Ow1WphidtO3SZLjxR_AKdDTgwaJJMPkPY5EHNQyomXbPcXVUA4dywH3tdutcftwkOxYFTgMzXWlkh9LFxyu7HaYDGERqJ73yVWRQ')",
            }}
          />
          <div className="absolute inset-0 bg-black/30 z-10" />
          <div className="relative z-20 glass-card p-10 md:p-16 rounded-[20px] max-w-2xl text-center border border-white/20 shadow-2xl mx-4">
            <h1 className="font-headline-lg text-headline-lg text-on-background uppercase tracking-tight mb-4">
              The <span className="text-primary-container">Gold Standard</span> of Trust
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-lg mx-auto">
              Redefining the premium pre-owned automotive landscape in Japan through meticulous
              engineering and absolute transparency.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/certified"
                className="bg-primary-container text-on-primary px-10 py-4 font-label-sm uppercase tracking-widest text-sm rounded-md hover:brightness-90 active:scale-98 transition-all"
              >
                Our Certification
              </Link>
              <Link
                href="/inventory"
                className="border-2 border-primary-container text-primary-container px-10 py-4 font-label-sm uppercase tracking-widest text-sm rounded-md hover:bg-surface-container-low/20 transition-all"
              >
                View Showroom
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            Brand Story Section
        ═══════════════════════════════════════════════ */}
        <section id="brand-story" className="py-24 bg-surface-container-lowest">
          <div className="max-w-[1280px] mx-auto px-margin-desktop grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-on-scroll">
              <div className="inline-block px-4 py-1 bg-primary/10 text-primary border-l-4 border-primary font-label-sm uppercase tracking-widest text-label-sm">
                Legacy of Excellence
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-background uppercase">
                A Commitment to <br />
                Modern Rigor
              </h2>
              <p className="font-body-lg text-body-lg text-secondary leading-relaxed">
                Nippon U-CARS was born from a singular vision: to eliminate the ambiguity of the
                secondary car market. In an industry where trust is often fragile, we built a fortress
                of transparency. Every vehicle that enters our fleet is a testament to Japanese
                engineering heritage.
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant">
                We don&apos;t just sell cars; we curate mobility solutions for those who demand
                performance without compromise. Our journey is paved with high-velocity innovation and
                professional rigor, ensuring every client drives away with the peace of mind they
                deserve.
              </p>
            </div>
            <div className="relative group animate-on-scroll">
              <div className="absolute -inset-4 bg-primary/5 rounded-2xl rotate-2 transition-transform group-hover:rotate-0" />
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  className="w-full h-full object-cover"
                  alt="A professional automotive engineer inspecting a premium vehicle engine with precision diagnostic tools in a pristine workshop."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJQzKhCpAsBuWlVezFcPZ5D1l88CMw_pUu2yAggdgdnD7nUnTcHwGB4xShpfkwMNnIFTQIwCawVbb-X15uEyN3D6o7_IneEek2cJwfC4XI3famk0p6dlDaFAuW8gz-F0djH6WhGkWqQ4GQxQT_Z51CIhrzoIOTgQZ8d9U1f6_U0nQF0ye1ySoYNut57Z29nTkJG41MlhpcBNOe3G4fL4CinGLOfX0gWjcQsOzhYJbhTtZWnVDjouicIw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            Mission & Vision Cards
        ═══════════════════════════════════════════════ */}
        <section id="mission-vision" className="py-20 bg-surface-container-low">
          <div className="max-w-[1280px] mx-auto px-margin-desktop grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="animate-on-scroll bg-white p-12 rounded-[12px] shadow-sm border border-outline-variant/20 hover:border-primary/30 transition-colors">
              <span className="material-symbols-outlined text-primary text-5xl mb-6 block">flag</span>
              <h3 className="font-headline-md text-headline-md text-on-surface uppercase mb-4 tracking-tight">
                Our Mission
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                To revolutionize the Japanese pre-owned vehicle industry by implementing the
                world&apos;s most comprehensive 203-point inspection system, ensuring absolute
                transparency in pricing, history, and mechanical integrity for every customer.
              </p>
            </div>
            {/* Vision */}
            <div className="animate-on-scroll bg-white p-12 rounded-[12px] shadow-sm border border-outline-variant/20 hover:border-primary/30 transition-colors">
              <span className="material-symbols-outlined text-primary text-5xl mb-6 block">
                visibility
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface uppercase mb-4 tracking-tight">
                Our Vision
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                To become Japan&apos;s most trusted automotive partner, setting a global benchmark for
                premium vehicle certification and creating a seamless, high-performance digital
                ecosystem for car buyers and sellers alike.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            203-Point Inspection Section
        ═══════════════════════════════════════════════ */}
        <section id="certification-protocol" className="py-24 relative overflow-hidden bg-on-background text-surface-container-lowest">
          <div className="max-w-[1280px] mx-auto px-margin-desktop relative z-10">
            <div className="max-w-2xl mb-16 animate-on-scroll">
              <h2 className="font-headline-lg text-headline-lg uppercase mb-6 tracking-tight">
                The 203-Point <br />
                <span className="text-primary-container">Certification Protocol</span>
              </h2>
              <p className="font-body-lg text-body-lg opacity-80">
                Our inspection isn&apos;t a checklist; it&apos;s a forensic analysis. From the
                microscopic structural integrity of the chassis to the nanosecond responsiveness of the
                ECU, no detail is too small.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Braking Systems */}
              <div className="group relative overflow-hidden rounded-xl aspect-square animate-on-scroll">
                <img
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                  alt="Macro close-up of a high-performance ventilated brake disc and red caliper on a premium vehicle."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFS9kdYxU4r1fXcP35GouLDNoFSOaWefBIA_R4b6vj__GJww5KImybqEXb4gRhq33JO4zHxWYiBnNFAwZNK8wPJGFOT6hMuOHRrgnrQpq7AWw8XTuLSQm2Kck2l09wZn7zEt2tMnmpEc80xlnO9Uv4JjCuLaYkN_4yKIv4e93ZyOycMSZ8eR_R_Jnm6t1_m8mlIxwa3CqWZ2meVMun-KVSp_AzUSziLourDXCD5ili1K1OLQQ8NTi3HQ"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                  <h4 className="font-headline-md text-headline-md uppercase">Braking Systems</h4>
                  <p className="text-xs font-label-sm uppercase tracking-widest opacity-60">
                    Phase 01: Safety Control
                  </p>
                </div>
              </div>
              {/* Powertrain Analysis */}
              <div className="group relative overflow-hidden rounded-xl aspect-square animate-on-scroll">
                <img
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                  alt="High-resolution close-up of a modern car engine cylinder head and clean metallic components."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4ScGz2-unLKOMhYuf5GG8WcBiC7W95r491FH7We_Zbx6iMtKiwy7C0TS6SWCETYiAkygJluoR-J_XYHlS9e3FG992X_kuFS7tkib4kA6NLuBRfgz42PgOwNcaYGHM206lSd_0e-4Zb_KapaSQmXSqnxcZFYmrrwwal9RPBcvX2FDkGE4_8iF_um0imBG4zN-vYFtdfkdqMkZKEdWNluaeBu8oJfuTjqPlU638nPknvtj1fkGNaK-HbA"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                  <h4 className="font-headline-md text-headline-md uppercase">Powertrain Analysis</h4>
                  <p className="text-xs font-label-sm uppercase tracking-widest opacity-60">
                    Phase 02: Performance Heart
                  </p>
                </div>
              </div>
              {/* Interior Integrity */}
              <div className="group relative overflow-hidden rounded-xl aspect-square animate-on-scroll">
                <img
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                  alt="Close-up detail of luxury car interior stitching on a premium leather seat with carbon fiber dashboard trim."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXpM8BzdVI9f612MPND0MYUmOoTBqcn4g8DJCEqFa9pmfIrCkVjBPG0hd7mOLawWY9LNoGqrtfY2jrxYFeZtU-_heJFCUh68Dl-FyjCpvnl648D5AElBicIMjPHMnjoXRx4ha3AiGSZg49xZ-FoDdsaeQ0ST9Kw4ZBAv8oa4Bb4dekRS4v-EylET9rijIVfpmRlxl5kSd4MKWycy4YSLg-v2UwN2-zyTFgOUSzMFIOmNXOdv50hYVptg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                  <h4 className="font-headline-md text-headline-md uppercase">Interior Integrity</h4>
                  <p className="text-xs font-label-sm uppercase tracking-widest opacity-60">
                    Phase 03: Luxury Standards
                  </p>
                </div>
              </div>
            </div>
            {/* Inspection category badges */}
            <div className="mt-16 flex flex-wrap gap-4 animate-on-scroll">
              <div className="bg-white/10 border border-white/20 px-6 py-4 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">verified</span>
                <span className="font-label-sm uppercase tracking-wider text-label-sm">
                  Engine &amp; Transmission
                </span>
              </div>
              <div className="bg-white/10 border border-white/20 px-6 py-4 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">shield</span>
                <span className="font-label-sm uppercase tracking-wider text-label-sm">
                  Structure &amp; Safety
                </span>
              </div>
              <div className="bg-white/10 border border-white/20 px-6 py-4 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">electrical_services</span>
                <span className="font-label-sm uppercase tracking-wider text-label-sm">
                  Electronics &amp; Tech
                </span>
              </div>
              <div className="bg-white/10 border border-white/20 px-6 py-4 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-label-sm uppercase tracking-wider text-label-sm">
                  Road Test Verified
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            The U-Trust Promise
        ═══════════════════════════════════════════════ */}
        <section id="utrust-promise" className="py-24 bg-background">
          <div className="max-w-[1280px] mx-auto px-margin-desktop">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="font-headline-lg text-headline-lg uppercase mb-4 tracking-tight">
                The U-Trust Promise
              </h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-6" />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="animate-on-scroll bg-white p-10 rounded-[12px] shadow-sm border border-outline-variant/20 transition-all duration-300 group hover:shadow-[0_10px_40px_-10px_rgba(215,25,33,0.3)] hover:-translate-y-2">
                <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white">
                    payments
                  </span>
                </div>
                <h4 className="font-headline-md text-headline-md uppercase mb-4 tracking-tight">
                  Transparent Pricing
                </h4>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  No hidden fees, no negotiation stress. Our prices are fixed based on real-time market
                  data and the specific condition of the vehicle.
                </p>
              </div>
              {/* Card 2 */}
              <div className="animate-on-scroll bg-white p-10 rounded-[12px] shadow-sm border border-outline-variant/20 transition-all duration-300 group hover:shadow-[0_10px_40px_-10px_rgba(215,25,33,0.3)] hover:-translate-y-2">
                <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white">
                    engineering
                  </span>
                </div>
                <h4 className="font-headline-md text-headline-md uppercase mb-4 tracking-tight">
                  Certified Engineers
                </h4>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Every vehicle is vetted by master technicians with over 15 years of experience in
                  Japanese luxury and performance automotive brands.
                </p>
              </div>
              {/* Card 3 */}
              <div className="animate-on-scroll bg-white p-10 rounded-[12px] shadow-sm border border-outline-variant/20 transition-all duration-300 group hover:shadow-[0_10px_40px_-10px_rgba(215,25,33,0.3)] hover:-translate-y-2">
                <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white">
                    workspace_premium
                  </span>
                </div>
                <h4 className="font-headline-md text-headline-md uppercase mb-4 tracking-tight">
                  Comprehensive Warranty
                </h4>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  We stand behind our work with a 12-month nationwide warranty and 24/7 roadside
                  assistance, because premium service doesn&apos;t end at the sale.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            CTA Section
        ═══════════════════════════════════════════════ */}
        <section id="cta" className="py-24 relative overflow-hidden bg-primary">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(215,25,33,1)_0%,rgba(174,0,18,1)_50%,rgba(215,25,33,1)_100%)] opacity-50" />
          <div className="max-w-[1280px] mx-auto px-margin-desktop relative z-10 text-center animate-on-scroll">
            <h2 className="font-headline-lg text-headline-lg text-white uppercase mb-8 tracking-tight">
              Your Premium Journey Starts Here
            </h2>
            <p className="font-body-lg text-body-lg text-white/90 max-w-2xl mx-auto mb-12">
              Experience the precision of Japanese certification. Whether you&apos;re looking to
              acquire a masterpiece or find a new home for yours, Nippon U-CARS is your partner.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/inventory"
                className="bg-white text-primary px-12 py-5 rounded-lg font-label-sm uppercase tracking-[0.2em] shadow-xl hover:bg-on-primary-container hover:text-primary-container transition-all active:scale-95 text-sm"
              >
                Explore Inventory
              </Link>
              <Link
                href="/sell"
                className="border-2 border-white text-white px-12 py-5 rounded-lg font-label-sm uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95 text-sm"
              >
                Sell Your Car
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════
          Footer
      ═══════════════════════════════════════════════ */}
      <footer className="bg-inverse-surface border-t border-secondary-container/10 w-full py-12">
        <div className="max-w-[1280px] mx-auto px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <div className="font-headline-md text-headline-md text-surface-container-lowest font-bold">
              Nippon U-CARS
            </div>
            <p className="font-body-md text-label-sm text-surface-variant opacity-80">
              © 2024 Nippon U-CARS. All Rights Reserved. Premium Pre-Owned Excellence.
            </p>
          </div>
          <div className="flex gap-8 mt-8 md:mt-0">
            <Link
              href="#"
              className="text-label-sm text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed-dim transition-all"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-label-sm text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed-dim transition-all"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-label-sm text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed-dim transition-all"
            >
              Cookie Policy
            </Link>
            <Link
              href="#"
              className="text-label-sm text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed-dim transition-all"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
