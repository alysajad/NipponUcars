import React from 'react';
import Link from 'next/link';

export default function StoreLocator() {
  return (
    <div className="min-h-screen bg-background text-on-background pt-24 pb-12">
      <div className="max-w-[1000px] mx-auto px-10">
        <div className="mb-12 text-center">
          <Link href="/" className="text-primary hover:underline font-label-sm uppercase tracking-widest flex items-center justify-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Home
          </Link>
          <h1 className="font-headline-lg text-headline-lg uppercase mb-4">Store Locator</h1>
          <p className="text-secondary font-body-lg">Find a Nippon Used Cars dealership near you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-xl border border-outline-variant/30 flex flex-col justify-center">
            <h2 className="font-headline-md text-headline-md text-primary uppercase mb-4">Main Showroom</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-secondary mt-1">location_on</span>
                <div>
                  <h3 className="font-bold text-on-background uppercase mb-1">Address</h3>
                  <p className="text-surface-variant font-body-md">
                    123 Auto Dealer Blvd<br />
                    Motor City, MC 90210
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-secondary mt-1">schedule</span>
                <div>
                  <h3 className="font-bold text-on-background uppercase mb-1">Hours of Operation</h3>
                  <ul className="text-surface-variant font-body-md space-y-1">
                    <li className="flex justify-between w-48"><span>Mon - Fri:</span> <span>9:00 AM - 8:00 PM</span></li>
                    <li className="flex justify-between w-48"><span>Saturday:</span> <span>9:00 AM - 6:00 PM</span></li>
                    <li className="flex justify-between w-48"><span>Sunday:</span> <span>10:00 AM - 5:00 PM</span></li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-secondary mt-1">call</span>
                <div>
                  <h3 className="font-bold text-on-background uppercase mb-1">Contact</h3>
                  <p className="text-surface-variant font-body-md">
                    Sales: (555) 123-4567<br />
                    Service: (555) 987-6543
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button className="bg-primary text-white px-6 py-3 rounded uppercase font-label-sm tracking-widest hover:bg-secondary transition-colors w-full sm:w-auto">
                Get Directions
              </button>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl overflow-hidden min-h-[400px] relative border border-outline-variant/30 flex items-center justify-center">
            {/* Placeholder for actual Google Maps embed */}
            <div className="text-center p-6">
              <span className="material-symbols-outlined text-[64px] text-secondary mb-4 opacity-50">map</span>
              <p className="text-secondary font-body-lg uppercase tracking-wider">Interactive Map Loading...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
