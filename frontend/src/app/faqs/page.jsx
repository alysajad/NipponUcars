"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MobileMenu from '@/components/MobileMenu';

const faqsData = [
  {
    category: 'Certification',
    question: 'What is the 203-point inspection?',
    icon: 'verified',
    content: (
      <>
        <div className="h-px bg-outline-variant/20 mb-6"></div>
        <p className="text-secondary leading-relaxed mb-4">
            The Nippon Used Cars 203-point inspection is an industry-leading rigorous assessment performed by master technicians. It covers:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <li className="flex items-center gap-2 text-on-surface-variant"><span className="material-symbols-outlined text-[18px] text-primary">check_circle</span> Engine & Transmission Integrity</li>
            <li className="flex items-center gap-2 text-on-surface-variant"><span className="material-symbols-outlined text-[18px] text-primary">check_circle</span> 360° Structural Chassis Check</li>
            <li className="flex items-center gap-2 text-on-surface-variant"><span className="material-symbols-outlined text-[18px] text-primary">check_circle</span> Advanced Electrical Systems</li>
            <li className="flex items-center gap-2 text-on-surface-variant"><span className="material-symbols-outlined text-[18px] text-primary">check_circle</span> Interior & Safety Restraints</li>
        </ul>
        <div className="bg-surface-container p-4 rounded-lg flex items-center gap-4">
            <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded">PRO</div>
            <span className="text-sm font-bold uppercase tracking-widest">Every car that passes receives a physical digital-verified seal.</span>
        </div>
      </>
    )
  },
  {
    category: 'Selling',
    question: 'How do I sell my car?',
    icon: 'sell',
    content: (
      <>
        <div className="h-px bg-outline-variant/20 mb-6"></div>
        <p className="text-secondary leading-relaxed">
            Selling through Nippon Used Cars is a high-velocity 3-step process designed for professionals. 
            <br/><br/>
            1. <strong>Digital Appraisal:</strong> Submit your VIN and high-res photos for an instant baseline offer.
            <br/>
            2. <strong>Physical Verification:</strong> Our mobile inspectors visit your location to verify condition.
            <br/>
            3. <strong>Instant Payout:</strong> Once certified, funds are transferred via secure bank wire within 24 hours.
        </p>
      </>
    )
  },
  {
    category: 'Certification',
    question: "What does 'Gold Standard' mean?",
    icon: 'workspace_premium',
    content: (
      <>
        <div className="h-px bg-outline-variant/20 mb-6"></div>
        <p className="text-secondary leading-relaxed">
            'Gold Standard' is our tier-one certification reserved only for vehicles with less than 30,000 km, no accident history, and 100% factory-original parts. These vehicles represent the absolute pinnacle of the pre-owned market.
        </p>
      </>
    )
  },
  {
    category: 'Buying',
    question: 'How does the exchange process work?',
    icon: 'swap_horiz',
    content: (
      <>
        <div className="h-px bg-outline-variant/20 mb-6"></div>
        <p className="text-secondary leading-relaxed">
            Our trade-in exchange allows you to use your current vehicle's value directly toward your new Nippon Used Cars purchase. We provide a guaranteed minimum value for any vehicle undergoing our 203-point inspection, simplifying the upgrade path.
        </p>
      </>
    )
  },
  {
    category: 'Warranty',
    question: 'What is covered under the TrustWarranty?',
    icon: 'shield_with_heart',
    content: (
      <>
        <div className="h-px bg-outline-variant/20 mb-6"></div>
        <p className="text-secondary leading-relaxed">
            TrustWarranty provides 2 years or 40,000 km of bumper-to-bumper coverage, including roadside assistance and complimentary rental vehicles during major repairs. It is fully transferable if you decide to sell the vehicle later.
        </p>
      </>
    )
  }
];

const categories = ['All Categories', 'Certification', 'Buying', 'Selling', 'Finance', 'Warranty'];

export default function FAQs() {
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredFaqs = faqsData.filter(f => activeCategory === 'All Categories' || f.category === activeCategory);

  // If active category changes, reset activeIndex to 0
  useEffect(() => {
    setActiveIndex(0);
  }, [activeCategory]);

  return (
    <div className="bg-background text-on-background selection:bg-primary selection:text-white" style={{ fontFamily: 'var(--font-proxima)' }}>
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="flex justify-between items-center h-16 px-margin-desktop max-w-container-max mx-auto">
          <div className="flex items-center gap-2">
            <MobileMenu />
            <Link href="/" className="text-2xl font-bold text-primary tracking-tighter uppercase hover:opacity-80 transition-opacity cursor-pointer" style={{ fontFamily: 'var(--font-sailors)' }}>
              Nippon Used Cars
            </Link>
            <div className="hidden md:flex items-center gap-8 ml-12">
              <Link href="/inventory" className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors">Buy</Link>
              <Link href="/sell" className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors">Sell</Link>
              <Link href="/exchange" className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors">Exchange</Link>
              <Link href="/certified" className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors">Certified</Link>
              <Link href="/about" className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors">About Us</Link>
              <Link href="/contact" className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/inventory" className="bg-primary text-white font-bold px-6 py-2 rounded-[6px] hover:scale-[1.02] transition-all duration-300 uppercase tracking-widest text-sm">
              FIND A CAR
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16 min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[614px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-cover bg-center scale-105 blur-md" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBZuLFHDvpoE48D2zsQs9qVdH3vHZr5tATcjS_zg8XUfplDK2Zyxuu_3NPNMKT4uXqglQ96Lp9DtP5Ye59txs3sOCoetZ3cxWJkr-71d2GQTC4KXUAsLttcVfgMREVRHGXCUZqsU_X6Yv3eR0Geksf6yzlPx24oVz4k0e1z4Z6ITM0WI4DTGXUGidIa6h2nZLj3mCjpa7HhtTsMTuCgIcuNXTVj_DVGU5hGOdUjC8ly22Oz6YqzA1pMoA')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-surface/20 to-surface"></div>
          </div>
          <div className="relative z-10 text-center px-4">
            <div className="bg-white/60 backdrop-blur-md p-12 rounded-[20px] shadow-2xl inline-block max-w-4xl border border-white/30">
              <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4 uppercase tracking-wider" style={{ fontFamily: 'var(--font-sailors)', lineHeight: '1.1' }}>
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-tertiary max-w-2xl mx-auto leading-relaxed">
                Your comprehensive guide to Japan's most trusted certified pre-owned vehicle marketplace. Precision, transparency, and authority in every answer.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Interface */}
        <section className="max-w-[1280px] mx-auto px-margin-desktop py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Category Sidebar */}
            <aside className="lg:col-span-3 space-y-2">
              <div className="text-primary text-sm font-bold uppercase mb-6 tracking-widest px-2">Knowledge Base</div>
              <nav className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-lg px-4 py-3 text-left text-sm font-bold uppercase tracking-widest transition-all duration-200 ${
                      activeCategory === cat 
                      ? 'bg-primary-container text-white' 
                      : 'hover:bg-surface-variant text-on-surface-variant'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
              <div className="mt-12 p-6 bg-surface-container rounded-xl border border-outline-variant">
                <span className="material-symbols-outlined text-primary text-4xl mb-4">support_agent</span>
                <h4 className="text-2xl font-bold text-on-surface mb-2" style={{ fontFamily: 'var(--font-sailors)' }}>Need direct help?</h4>
                <p className="text-secondary mb-6">Our inspection specialists are available 24/7 for expert guidance.</p>
                <Link href="/contact" className="block text-center w-full border-2 border-primary text-primary py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                  Contact Us
                </Link>
              </div>
            </aside>

            {/* FAQ Content */}
            <div className="lg:col-span-9 space-y-6">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <div key={index} className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${activeIndex === index ? 'border-primary' : 'border-outline-variant/30'}`}>
                    <button 
                      className="w-full flex items-center justify-between px-8 py-6 text-left hover:bg-surface-container-low transition-colors group"
                      onClick={() => setActiveIndex(activeIndex === index ? -1 : index)}
                    >
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">{faq.icon}</span>
                        <span className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'var(--font-sailors)' }}>{faq.question}</span>
                      </div>
                      <span className={`material-symbols-outlined transition-transform duration-300 ${activeIndex === index ? 'rotate-180 text-primary' : 'text-gray-400'}`}>expand_more</span>
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out`}
                      style={{ maxHeight: activeIndex === index ? '500px' : '0' }}
                    >
                      <div className="px-8 pb-8 pt-0">
                        {faq.content}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-secondary">
                  No FAQs found for this category.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-inverse-surface py-20">
          <div className="max-w-[1280px] mx-auto px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 uppercase" style={{ fontFamily: 'var(--font-sailors)' }}>Still have questions?</h2>
              <p className="text-lg text-secondary-fixed-dim">Join the thousands of satisfied drivers who trusted Nippon Used Cars for their automotive journey.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/certified/book" className="bg-primary text-white text-center px-10 py-4 rounded-lg text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg">Book Inspection</Link>
              <Link href="/inventory" className="border-2 border-white text-white text-center px-10 py-4 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Browse Inventory</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-inverse-surface text-white border-t border-secondary">
        <div className="max-w-[1280px] mx-auto px-margin-desktop py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tighter" style={{ fontFamily: 'var(--font-sailors)' }}>NIPPON USED CARS</h2>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Redefining excellence in the global pre-owned vehicle market. Precision, transparency, and high-velocity service at every touchpoint.
            </p>
          </div>
          {/* Links Column 1 */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-4">Ecosystem</h4>
            <Link className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors" href="/certified">Certification Process</Link>
            <Link className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors" href="/finance">Finance Solutions</Link>
            <Link className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors" href="/partner">Partner Login</Link>
          </div>
          {/* Links Column 2 */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-4">Legal & Support</h4>
            <Link className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors" href="/privacy">Privacy Policy</Link>
            <Link className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors" href="/terms">Terms of Service</Link>
            <Link className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors" href="/faqs">Support Center</Link>
          </div>
          {/* Copyright Column */}
          <div className="flex flex-col justify-end items-start md:items-end">
            <div className="flex gap-4 mb-6">
              <Link className="text-white/70 hover:text-primary transition-colors" href="#">
                <span className="material-symbols-outlined">share</span>
              </Link>
              <Link className="text-white/70 hover:text-primary transition-colors" href="#">
                <span className="material-symbols-outlined">public</span>
              </Link>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-white/70 text-left md:text-right">
              © 2024 NIPPON USED CARS. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
