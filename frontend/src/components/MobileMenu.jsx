"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center ml-4">
      <button onClick={() => setIsOpen(true)} className="p-2 text-primary hover:bg-gray-100 rounded-lg transition-colors">
        <span className="material-symbols-outlined text-3xl">menu</span>
      </button>
      
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity" 
          onClick={() => setIsOpen(false)} 
        />
      )}
      
      {/* Side Slider */}
      <div className={`fixed top-0 right-0 h-full w-3/4 max-w-sm bg-white shadow-2xl z-[110] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <span className="font-headline-md text-primary font-bold tracking-tighter uppercase" style={{ fontFamily: 'var(--font-sailors)' }}>MENU</span>
          <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>
        <div className="flex flex-col gap-6 p-8">
          <Link href="/inventory" onClick={() => setIsOpen(false)} className="font-label-bold uppercase text-lg tracking-wider text-secondary hover:text-primary">Buy</Link>
          <Link href="/sell" onClick={() => setIsOpen(false)} className="font-label-bold uppercase text-lg tracking-wider text-secondary hover:text-primary">Sell</Link>
          <Link href="/exchange" onClick={() => setIsOpen(false)} className="font-label-bold uppercase text-lg tracking-wider text-secondary hover:text-primary">Exchange</Link>
          <Link href="/certified" onClick={() => setIsOpen(false)} className="font-label-bold uppercase text-lg tracking-wider text-secondary hover:text-primary">Certified</Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="font-label-bold uppercase text-lg tracking-wider text-secondary hover:text-primary">About Us</Link>
        </div>
      </div>
    </div>
  );
}
