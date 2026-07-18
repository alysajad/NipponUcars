"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import MobileMenu from '@/components/MobileMenu';
import { createEnquiry } from '@/api/inventoryApi';

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createEnquiry({
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        lead_type: 'sales',
        notes: formData.message,
        vehicle_interest: 'General Enquiry'
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      alert('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-background text-on-background selection:bg-primary selection:text-white font-body-md" style={{ fontFamily: 'var(--font-proxima)' }}>
      {/* TopNavBar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-gray-200 bg-white/80 backdrop-blur-md`}>
        <div className="flex justify-between items-center h-16 px-margin-desktop max-w-container-max mx-auto">
          <div className="flex items-center gap-2">
            <MobileMenu />
            <Link href="/" className="text-2xl font-bold text-primary tracking-tighter uppercase font-headline-md hover:opacity-80 transition-opacity cursor-pointer" style={{ fontFamily: 'var(--font-sailors)' }}>
              Nippon Used Cars
            </Link>
            <div className="hidden md:flex items-center gap-8 ml-12">
              <Link href="/inventory" className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors">Buy</Link>
              <Link href="/sell" className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors">Sell</Link>
              <Link href="/exchange" className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors">Exchange</Link>
              <Link href="/certified" className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors">Certified</Link>
              <Link href="/about" className="nav-link text-sm font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors">About Us</Link>
              <Link href="/contact" className="nav-link text-sm font-semibold uppercase tracking-wider text-primary border-b-2 border-primary pb-1">Contact</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/inventory" className="bg-primary text-white font-bold px-6 py-2 rounded-[6px] hover:scale-[1.02] transition-all duration-300 uppercase tracking-widest text-sm">
              FIND A CAR
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[614px] min-h-[500px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://res.cloudinary.com/vdofesxh/image/upload/v1784193326/utrust_assets/hero/hero_main_new.jpg')" }}></div>
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="relative z-20 max-w-[1280px] mx-auto px-margin-desktop w-full">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 uppercase tracking-tight" style={{ fontFamily: 'var(--font-sailors)', lineHeight: '1.1' }}>
                CONNECT WITH <span className="text-primary">EXCELLENCE</span>
              </h1>
              <p className="text-white/90 text-lg mb-8 max-w-lg leading-relaxed">
                Experience precision automotive consulting. Our dedicated specialists are standing by to guide you through the premium pre-owned acquisition process.
              </p>
              <div className="flex gap-4">
                <a className="bg-primary text-white px-8 py-4 rounded-[6px] font-bold uppercase tracking-widest hover:bg-opacity-90 transition-colors" href="#contact-form">Enquire Now</a>
                <a className="border-2 border-white text-white px-8 py-4 rounded-[6px] font-bold uppercase tracking-widest hover:bg-white hover:text-on-background transition-all" href="#locations">Our Offices</a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-24 bg-surface-container-low" id="contact-form">
          <div className="max-w-[1280px] mx-auto px-margin-desktop">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Side */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-10">
                  <h2 className="text-3xl font-bold mb-8 uppercase tracking-wide border-l-4 border-primary pl-4" style={{ fontFamily: 'var(--font-sailors)' }}>Direct Inquiry</h2>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-label-sm text-label-sm uppercase text-secondary">Full Name</label>
                        <input name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-[6px] border border-outline bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all" placeholder="Kento Yamazaki" type="text" />
                      </div>
                      <div className="space-y-2">
                        <label className="font-label-sm text-label-sm uppercase text-secondary">Email Address</label>
                        <input name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-[6px] border border-outline bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all" placeholder="k.yamazaki@email.jp" type="email" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-sm text-label-sm uppercase text-secondary">Phone Number</label>
                      <input name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-3 rounded-[6px] border border-outline bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all" placeholder="+81 00 0000 0000" type="tel" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-sm text-label-sm uppercase text-secondary">Message</label>
                      <textarea name="message" value={formData.message} onChange={handleChange} required className="w-full px-4 py-3 rounded-[6px] border border-outline bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-y" placeholder="Tell us about the vehicle or service you are interested in..." rows="5"></textarea>
                    </div>
                    <button disabled={isSubmitting || submitted} className={`w-full text-white py-4 rounded-[6px] font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg ${submitted ? 'bg-green-600' : 'bg-primary'}`} type="submit">
                      {isSubmitting ? 'SENDING...' : submitted ? 'SENT SUCCESSFULLY' : 'SEND MESSAGE'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Concierge Side */}
              <div className="lg:col-span-5 flex flex-col gap-8">
                <div className="bg-inverse-surface text-white p-10 rounded-[12px] flex-1 flex flex-col justify-center">
                  <h3 className="text-3xl font-bold mb-6 uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-sailors)' }}>Concierge Support</h3>
                  <p className="text-white/70 text-lg mb-8 leading-relaxed">
                    Our elite concierge team provides personalized assistance for international shipping, certification verification, and premium financing solutions.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-white scale-125">support_agent</span>
                      <div>
                        <p className="font-label-sm text-label-sm uppercase text-white/70">Hotline</p>
                        <p className="font-headline-md text-xl">+81 (0) 3-1234-5678</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-white scale-125">mail</span>
                      <div>
                        <p className="font-label-sm text-label-sm uppercase text-white/70">General Enquiries</p>
                        <p className="font-headline-md text-xl">concierge@nippon-ucars.jp</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-white scale-125">schedule</span>
                      <div>
                        <p className="font-label-sm text-label-sm uppercase text-white/70">Global Response Hours</p>
                        <p className="font-headline-md text-xl">09:00 - 21:00 JST (MON-SAT)</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-highest p-8 rounded-[12px] border-l-8 border-primary">
                  <h4 className="font-bold uppercase tracking-widest text-sm mb-2 text-primary">Priority Access</h4>
                  <p className="text-on-surface-variant text-sm font-medium">Verified partners and VIP clients please use the dedicated portal for accelerated response times.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Locations Section */}
        <section className="py-24 bg-white" id="locations">
          <div className="max-w-[1280px] mx-auto px-margin-desktop">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold uppercase mb-4 tracking-tighter" style={{ fontFamily: 'var(--font-sailors)' }}>OUR FLAGSHIP <span className="text-primary">CENTERS</span></h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-secondary max-w-2xl mx-auto">Visit our showrooms to experience the pinnacle of automotive engineering and professional appraisal standards.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Tokyo */}
              <div className="group cursor-pointer">
                <div className="relative h-64 overflow-hidden rounded-t-[12px] mb-6">
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110 bg-cover bg-center" style={{ backgroundImage: "url('https://res.cloudinary.com/vdofesxh/image/upload/v1784191725/utrust_assets/utrust_asset_sell_page_0.jpg')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-6">
                    <span className="text-white font-headline-md text-2xl uppercase tracking-widest" style={{ fontFamily: 'var(--font-sailors)' }}>Tokyo HQ</span>
                  </div>
                </div>
                <div className="px-2">
                  <p className="font-body-md text-on-surface-variant mb-4 flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                    1-2-3 Marunouchi, Chiyoda City, Tokyo 100-0005
                  </p>
                  <p className="font-body-md text-on-surface-variant mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">phone</span>
                    +81 3 5555 0123
                  </p>
                  <p className="font-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">access_time</span>
                    10:00 - 19:00 (Daily)
                  </p>
                  <button className="mt-6 w-full py-3 border-2 border-primary text-primary font-bold uppercase tracking-widest text-sm hover:bg-primary hover:text-white transition-all rounded-[6px]">
                    VIEW ON MAP
                  </button>
                </div>
              </div>

              {/* Osaka */}
              <div className="group cursor-pointer">
                <div className="relative h-64 overflow-hidden rounded-t-[12px] mb-6">
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110 bg-cover bg-center" style={{ backgroundImage: "url('https://res.cloudinary.com/vdofesxh/image/upload/v1784191696/utrust_assets/utrust_asset_page_0.jpg')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-6">
                    <span className="text-white font-headline-md text-2xl uppercase tracking-widest" style={{ fontFamily: 'var(--font-sailors)' }}>Osaka West</span>
                  </div>
                </div>
                <div className="px-2">
                  <p className="font-body-md text-on-surface-variant mb-4 flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                    4-5-6 Kita-ku, Osaka 530-0001
                  </p>
                  <p className="font-body-md text-on-surface-variant mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">phone</span>
                    +81 6 6666 7890
                  </p>
                  <p className="font-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">access_time</span>
                    10:00 - 19:00 (Daily)
                  </p>
                  <button className="mt-6 w-full py-3 border-2 border-primary text-primary font-bold uppercase tracking-widest text-sm hover:bg-primary hover:text-white transition-all rounded-[6px]">
                    VIEW ON MAP
                  </button>
                </div>
              </div>

              {/* Nagoya */}
              <div className="group cursor-pointer">
                <div className="relative h-64 overflow-hidden rounded-t-[12px] mb-6">
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110 bg-cover bg-center" style={{ backgroundImage: "url('https://res.cloudinary.com/vdofesxh/image/upload/v1784191727/utrust_assets/utrust_asset_sell_page_1.jpg')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-6">
                    <span className="text-white font-headline-md text-2xl uppercase tracking-widest" style={{ fontFamily: 'var(--font-sailors)' }}>Nagoya East</span>
                  </div>
                </div>
                <div className="px-2">
                  <p className="font-body-md text-on-surface-variant mb-4 flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                    7-8-9 Nakamura-ku, Nagoya 450-0002
                  </p>
                  <p className="font-body-md text-on-surface-variant mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">phone</span>
                    +81 52 123 4567
                  </p>
                  <p className="font-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">access_time</span>
                    09:30 - 18:30 (MON-FRI)
                  </p>
                  <button className="mt-6 w-full py-3 border-2 border-primary text-primary font-bold uppercase tracking-widest text-sm hover:bg-primary hover:text-white transition-all rounded-[6px]">
                    VIEW ON MAP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-primary py-12">
          <div className="max-w-[1280px] mx-auto px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-8">
            <h3 className="text-3xl font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-sailors)' }}>Stay Ahead of the Market</h3>
            <div className="flex w-full md:w-auto max-w-md bg-white p-1 rounded-[8px]">
              <input className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-on-surface border-none" placeholder="Your email address" type="email" />
              <button className="bg-inverse-surface text-white px-6 py-2 rounded-[6px] font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity">SUBSCRIBE</button>
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
            <Link className="font-label-sm text-label-sm uppercase text-white/70 hover:text-white transition-colors" href="/certified">Certification Process</Link>
            <Link className="font-label-sm text-label-sm uppercase text-white/70 hover:text-white transition-colors" href="/finance">Finance Solutions</Link>
            <Link className="font-label-sm text-label-sm uppercase text-white/70 hover:text-white transition-colors" href="/partner">Partner Login</Link>
          </div>
          {/* Links Column 2 */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-4">Legal & Support</h4>
            <Link className="font-label-sm text-label-sm uppercase text-white/70 hover:text-white transition-colors" href="/privacy">Privacy Policy</Link>
            <Link className="font-label-sm text-label-sm uppercase text-white/70 hover:text-white transition-colors" href="/terms">Terms of Service</Link>
            <Link className="font-label-sm text-label-sm uppercase text-white/70 hover:text-white transition-colors" href="/faqs">Support Center</Link>
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
            <p className="font-label-sm text-label-sm uppercase text-white/70 text-left md:text-right">
              © 2024 NIPPON USED CARS. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
