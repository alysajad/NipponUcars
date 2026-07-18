"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.prose-section div[id]');
      const scrollY = window.pageYOffset;
      
      let current = "";
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 150)) {
          current = section.getAttribute('id');
        }
      });
      setActiveSection(current);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-surface text-on-surface transition-colors duration-300 w-full overflow-x-hidden">
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

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[400px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-cover bg-center opacity-20 scale-105 transition-transform duration-1000 hover:scale-100" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-wu5P6njlens7r_QP5gsh6R4mmr6Y7J-sxhyGZD08x9TtlXqkSWsrewk-1lE7mGXphDkfyE34xy9VCkx9Hxh4lrdZRkIavSut1V9v22lnn17otU7ToTO2avnBfSd4LIIalUQ3X3TyNM43TLin1bY6srhIqEUiXyWGR4gK3fWSpIp5XtMDQ_o_n_O_dBcRCytL3Xr2WwjucnZPkcnSPnSsep9BPd0-YJ17onXlAgFE3cNqCnh-1DHRYA')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-surface/0 via-surface/80 to-surface"></div>
          </div>
          <div className="relative z-10 max-w-container-max mx-auto px-margin-desktop w-full">
            <div className="flex flex-col items-start gap-4">
              <h1 className="font-headline-xl text-headline-xl md:text-[64px] uppercase text-on-surface">Privacy Policy</h1>
              <div className="flex items-center gap-6 mt-2">
                <p className="font-body-lg text-body-lg text-primary font-bold uppercase tracking-widest">Effective Date: 2026</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-container-max mx-auto px-margin-desktop pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3 sticky top-28 hidden lg:block">
              <nav className="flex flex-col gap-1 border-l-2 border-surface-container">
                {[
                  { id: "introduction", label: "1. Introduction" },
                  { id: "data-collection", label: "2. Data Collection" },
                  { id: "usage", label: "3. How We Use Data" },
                  { id: "security", label: "4. Data Security" },
                ].map(item => (
                  <a 
                    key={item.id}
                    href={`#${item.id}`} 
                    className={`pl-6 py-3 font-label-sm uppercase tracking-widest transition-all border-l-2 -ml-[2px] ${
                      activeSection === item.id 
                        ? 'text-primary border-primary font-bold' 
                        : 'text-secondary border-transparent hover:border-primary hover:text-primary font-semibold'
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Main Content Body */}
            <div className="lg:col-span-9 bg-white p-8 md:p-12 rounded-[12px] shadow-sm border border-outline-variant prose-section">
              
              <div className="mb-16 scroll-mt-32" id="introduction">
                <h2 className="font-headline-md text-headline-md uppercase text-primary border-b-2 border-primary/10 pb-4 mb-6">Introduction</h2>
                <p className="font-body-lg text-body-lg text-on-surface leading-relaxed mb-6">
                  Welcome to Nippon Used Cars. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
                </p>
                <p className="font-body-md text-body-md text-secondary">
                  By accessing or using our services, you acknowledge that you have read and understood this Privacy Policy. We regularly review our compliance with international data protection standards to ensure your information remains secure.
                </p>
              </div>

              <div className="mb-16 scroll-mt-32" id="data-collection">
                <h2 className="font-headline-md text-headline-md uppercase text-primary border-b-2 border-primary/10 pb-4 mb-6">The Data We Collect</h2>
                <p className="font-body-md text-body-md mb-8 text-on-surface">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="p-6 rounded-[12px] bg-surface-container-low border border-outline-variant group hover:border-primary transition-colors">
                    <div className="flex items-center gap-3 mb-3 text-primary">
                      <span className="material-symbols-outlined text-[24px]">person</span>
                      <h3 className="font-label-sm font-bold uppercase tracking-wider">Identity Data</h3>
                    </div>
                    <p className="font-body-md text-[14px] text-secondary">Includes first name, last name, username or similar identifier.</p>
                  </div>
                  
                  <div className="p-6 rounded-[12px] bg-surface-container-low border border-outline-variant group hover:border-primary transition-colors">
                    <div className="flex items-center gap-3 mb-3 text-primary">
                      <span className="material-symbols-outlined text-[24px]">contact_page</span>
                      <h3 className="font-label-sm font-bold uppercase tracking-wider">Contact Data</h3>
                    </div>
                    <p className="font-body-md text-[14px] text-secondary">Includes billing address, delivery address, email address and telephone numbers.</p>
                  </div>
                  
                  <div className="p-6 rounded-[12px] bg-surface-container-low border border-outline-variant group hover:border-primary transition-colors">
                    <div className="flex items-center gap-3 mb-3 text-primary">
                      <span className="material-symbols-outlined text-[24px]">settings_ethernet</span>
                      <h3 className="font-label-sm font-bold uppercase tracking-wider">Technical Data</h3>
                    </div>
                    <p className="font-body-md text-[14px] text-secondary">Includes IP address, login data, browser type and version, time zone setting and location.</p>
                  </div>
                  
                  <div className="p-6 rounded-[12px] bg-surface-container-low border border-outline-variant group hover:border-primary transition-colors">
                    <div className="flex items-center gap-3 mb-3 text-primary">
                      <span className="material-symbols-outlined text-[24px]">analytics</span>
                      <h3 className="font-label-sm font-bold uppercase tracking-wider">Usage Data</h3>
                    </div>
                    <p className="font-body-md text-[14px] text-secondary">Includes information about how you use our website, products and services.</p>
                  </div>
                  
                </div>
              </div>

              <div className="mb-16 scroll-mt-32" id="usage">
                <h2 className="font-headline-md text-headline-md uppercase text-primary border-b-2 border-primary/10 pb-4 mb-6">How We Use Your Data</h2>
                <p className="font-body-md text-body-md mb-8 text-on-surface">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                <ul className="space-y-4">
                  {[
                    "To register you as a new customer and manage your profile settings.",
                    "To process and deliver your order, including managing payments, fees, and charges.",
                    "To manage our relationship with you which will include notifying you about changes to our terms or privacy policy.",
                    "To use data analytics to improve our website, products/services, marketing, customer relationships and experiences."
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="bg-primary/10 text-primary p-1 rounded-full shrink-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </span>
                      <span className="font-body-md text-body-md text-secondary">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-8 scroll-mt-32" id="security">
                <h2 className="font-headline-md text-headline-md uppercase text-primary border-b-2 border-primary/10 pb-4 mb-6">Data Security</h2>
                <div className="bg-surface-container-low p-8 rounded-[12px] border-l-4 border-primary">
                  <p className="font-body-lg text-body-lg font-semibold mb-4 italic text-on-surface">"Your safety is our benchmark."</p>
                  <p className="font-body-md text-body-md text-secondary leading-relaxed">
                    We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
                  </p>
                </div>
              </div>


            </div>
          </div>
        </section>
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
