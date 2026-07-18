"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TermsOfUse() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollY = window.pageYOffset;
      
      sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 150;
        const sectionId = current.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          setActiveSection(sectionId);
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-background text-on-background transition-colors duration-300 w-full overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-outline-variant bg-surface/80 backdrop-blur-md">
        <div className="max-w-container-max mx-auto px-margin-desktop h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/" className="font-headline-md text-[16px] md:text-headline-md font-semibold text-primary uppercase hover:opacity-80 transition-opacity cursor-pointer tracking-tighter">Nippon Used Cars</Link>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <Link className="hidden md:flex items-center gap-2 font-label-sm text-secondary hover:text-primary transition-colors uppercase tracking-widest" href="/">
              <span className="material-symbols-outlined text-[18px]">home</span>
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-28 overflow-hidden bg-[#0F172A]">
        <div className="absolute inset-0 z-0">
          <img alt="Premium background" className="w-full h-full object-cover opacity-20 grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8YjwJE_aiwsVmNYP4O05cHpAJtNc3IK_D1jWdcBk6EPlB-jEv0B1tb0WiE-BRD3ht_k3h6G43P7F--qxhWRBMOFQ46DXfiIAY8-oSzDVPeSUNa-GG5M-nHGvvt2Z5oZVcy0h2SctJbgH0s1C4yzXWkxOuLQbPD__0YWq9vJl-LMek3tD8qFD55yMG_sOJYvdFXalsbWiNS1c-sOcpgcCamQUCZB7qiMFblaih_FVxtpJmu4nlnggamQ" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F172A]"></div>
        </div>
        <div className="relative z-10 max-w-container-max mx-auto px-margin-desktop text-center">
          <h1 className="font-headline-xl text-headline-xl text-white mb-6 uppercase">Terms of Use</h1>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-container-max mx-auto px-margin-desktop py-20">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <div className="sticky top-32 space-y-4">
              <h3 className="font-label-sm font-bold text-secondary mb-6 tracking-widest uppercase">Table of Contents</h3>
              <nav className="flex flex-col space-y-2">
                {[
                  { id: "acceptance", label: "1. Acceptance of Terms" },
                  { id: "use", label: "2. Use of Site & Services" },
                  { id: "pricing", label: "3. Information & Pricing" },
                  { id: "intellectual", label: "4. Intellectual Property" },
                  { id: "conduct", label: "5. User Conduct" },
                  { id: "liability", label: "6. Limitation of Liability" },
                  { id: "law", label: "7. Governing Law" },
                ].map(item => (
                  <a 
                    key={item.id}
                    href={`#${item.id}`} 
                    className={`px-4 py-3 rounded-lg transition-all font-label-sm uppercase tracking-wider border-l-2 ${activeSection === item.id ? 'bg-primary/10 text-primary border-primary' : 'border-transparent hover:bg-primary/5 hover:text-primary hover:border-primary/50 text-secondary'}`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="mt-12 p-8 bg-surface-container-low rounded-xl border border-outline-variant">
                <p className="font-body-md font-bold mb-3 uppercase text-on-surface">Need assistance?</p>
                <p className="font-body-md text-[14px] text-secondary mb-6">If you have any questions regarding these terms, please contact our legal team.</p>
                <a className="font-label-sm font-bold text-primary hover:underline flex items-center gap-2 uppercase tracking-widest" href="mailto:legal@nipponusedcars.com">
                  Contact Us <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Content Sections */}
          <div className="lg:w-3/4 space-y-24">
            <div className="max-w-4xl">
              <p className="font-body-lg text-body-lg leading-relaxed italic text-secondary">
                Welcome to Nippon Used Cars. These Terms of Use govern your access to and use of our website and services. Please read them carefully before using our platform.
              </p>
            </div>

            <section id="acceptance" className="scroll-mt-40">
              <div className="flex items-center gap-6 mb-8">
                <span className="flex-none w-12 h-12 flex items-center justify-center bg-primary text-white font-headline-md rounded-lg">01</span>
                <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface">Acceptance of Terms</h2>
              </div>
              <div className="bg-surface p-10 rounded-2xl border border-outline-variant shadow-sm">
                <p className="font-body-md text-secondary leading-relaxed mb-6">
                  By accessing and using the Nippon Used Cars website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p className="font-body-md text-secondary leading-relaxed">
                  We reserve the right to change these terms at any time. Your continued use of the site following any such changes constitutes your acceptance of the new Terms of Use.
                </p>
              </div>
            </section>

            <section id="use" className="scroll-mt-40">
              <div className="flex items-center gap-6 mb-8">
                <span className="flex-none w-12 h-12 flex items-center justify-center bg-primary text-white font-headline-md rounded-lg">02</span>
                <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface">Use of Site & Services</h2>
              </div>
              <div className="space-y-6">
                <p className="font-body-md text-secondary leading-relaxed">
                  The services provided by Nippon Used Cars are intended for individuals looking to purchase or sell high-quality used vehicles. You agree to:
                </p>
                <ul className="list-none space-y-4">
                  {[
                    "Provide accurate, current, and complete information when requested.",
                    "Maintain the security of your account credentials.",
                    "Be responsible for all activities that occur under your account."
                  ].map((text, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <span className="material-symbols-outlined text-primary text-2xl mt-0.5">check_circle</span>
                      <span className="font-body-md text-secondary">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section id="pricing" className="scroll-mt-40">
              <div className="flex items-center gap-6 mb-8">
                <span className="flex-none w-12 h-12 flex items-center justify-center bg-primary text-white font-headline-md rounded-lg">03</span>
                <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface">Vehicle Information & Pricing Accuracy</h2>
              </div>
              <div className="bg-primary/5 border-l-[6px] border-primary p-10 rounded-r-2xl">
                <p className="font-body-md text-secondary leading-relaxed mb-6">
                  While we make every effort to ensure the accuracy of the information on our website, errors may occur. Vehicle prices, availability, specifications, and features are subject to change without notice. We reserve the right to correct any pricing errors or omissions at any time.
                </p>
                <p className="font-body-md font-semibold text-on-surface">
                  All vehicles are subject to prior sale. A listing on the website does not guarantee the vehicle is currently available in stock.
                </p>
              </div>
            </section>

            <section id="intellectual" className="scroll-mt-40">
              <div className="flex items-center gap-6 mb-8">
                <span className="flex-none w-12 h-12 flex items-center justify-center bg-primary text-white font-headline-md rounded-lg">04</span>
                <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface">Intellectual Property</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <p className="font-body-md text-secondary leading-relaxed">
                    All content included on this site, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of Nippon Used Cars or its content suppliers and protected by international copyright laws.
                  </p>
                </div>
                <div className="relative rounded-2xl overflow-hidden h-64 md:h-full min-h-[250px]">
                  <img alt="Office space" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaXf-IfkO4rYYfXQ6vDQmfjLKZvh6x506YUcjjQBiNqngeb3U7U0tNFxH9zz9zjQ7l9wT2SOm7hFZYOs9tXas6qZmSK0rCc4x_In0HBITYgmceJUB4lh1bBZRmVtQLd_uYAoXJISL8c9yez9DG5a1cqqpikPOpmK2TIKA0bf4x_tspzHZF0UXuVU5XSAdSISp3DuUIKWHFmsdVQ1uU0LnuPtYc8Di_ZI1UYZn9sUAV8mxcChRLelLp-A" />
                  <div className="absolute inset-0 bg-primary/20"></div>
                </div>
              </div>
            </section>

            <section id="conduct" className="scroll-mt-40">
              <div className="flex items-center gap-6 mb-8">
                <span className="flex-none w-12 h-12 flex items-center justify-center bg-primary text-white font-headline-md rounded-lg">05</span>
                <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface">User Conduct</h2>
              </div>
              <div className="bg-surface p-10 rounded-2xl border border-outline-variant shadow-sm">
                <p className="font-body-md text-secondary mb-8">Users are strictly prohibited from:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { num: "01", title: "MISUSE", desc: "Using the site for any unlawful purpose or to solicit others to perform unlawful acts." },
                    { num: "02", title: "INTERFERENCE", desc: "Attempting to interfere with the proper working of the website or any transaction being conducted." },
                    { num: "03", title: "DATA MINING", desc: "Using any robot, spider, or other automatic device to monitor or copy our web pages or the content contained herein." },
                    { num: "04", title: "IMPERSONATION", desc: "Impersonating any person or entity, or falsely stating your affiliation with a person or entity." }
                  ].map(item => (
                    <div key={item.num} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/50 hover:border-primary/30 transition-colors">
                      <span className="font-label-sm font-bold text-primary block mb-2">{item.num}. {item.title}</span>
                      <p className="font-body-md text-[14px] text-secondary">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="liability" className="scroll-mt-40">
              <div className="flex items-center gap-6 mb-8">
                <span className="flex-none w-12 h-12 flex items-center justify-center bg-primary text-white font-headline-md rounded-lg">06</span>
                <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface">Limitation of Liability</h2>
              </div>
              <div className="max-w-4xl">
                <p className="font-body-md text-secondary leading-relaxed uppercase tracking-wider">
                  In no event shall Nippon Used Cars or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Nippon Used Cars's website, even if Nippon Used Cars or an authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </div>
            </section>

            <section id="law" className="scroll-mt-40 pb-16">
              <div className="flex items-center gap-6 mb-8">
                <span className="flex-none w-12 h-12 flex items-center justify-center bg-primary text-white font-headline-md rounded-lg">07</span>
                <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface">Governing Law</h2>
              </div>
              <div className="bg-[#1a1c1c] text-white p-10 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="font-body-md leading-relaxed text-white/90">
                    Any claim relating to Nippon Used Cars's website shall be governed by the laws of the jurisdiction in which the company is headquartered, without regard to its conflict of law provisions.
                  </p>
                </div>
                <div className="absolute right-[-20px] bottom-[-40px] opacity-10">
                  <span className="material-symbols-outlined" style={{ fontSize: '180px' }}>gavel</span>
                </div>
              </div>
            </section>
            
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-high py-16 border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-margin-desktop text-center">
          <div className="mb-10">
            <Link href="/" className="font-headline-md font-semibold tracking-tighter uppercase text-primary hover:opacity-80 transition-opacity">NIPPON USED CARS</Link>
            <p className="font-label-sm text-secondary mt-3 uppercase tracking-[0.2em]">Global Automotive Excellence</p>
          </div>
          <div className="flex flex-wrap justify-center gap-10 mb-10 font-label-sm font-bold uppercase tracking-wider">
            <Link className="text-secondary hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
            <Link className="text-secondary hover:text-primary transition-colors" href="/cookies">Cookie Policy</Link>
            <Link className="text-secondary hover:text-primary transition-colors" href="/contact">Contact Support</Link>
          </div>
          <p className="font-label-sm text-secondary/60">© 2024 Nippon Used Cars. All rights reserved. Registered Trademark.</p>
        </div>
      </footer>
    </div>
  );
}
