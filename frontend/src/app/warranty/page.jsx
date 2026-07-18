import React from 'react';
import Link from 'next/link';

export default function WarrantyPolicy() {
  return (
    <div className="min-h-screen bg-background text-on-background pt-24 pb-12">
      <div className="max-w-[800px] mx-auto px-10">
        <div className="mb-12">
          <Link href="/" className="text-primary hover:underline font-label-sm uppercase tracking-widest flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Home
          </Link>
          <h1 className="font-headline-lg text-headline-lg uppercase mb-4">Warranty Policy</h1>
          <p className="text-secondary font-body-lg">Effective Date: {new Date().getFullYear()}</p>
        </div>

        <div className="space-y-8 font-body-md text-surface-variant">
          <section>
            <h2 className="font-headline-md text-headline-md text-on-background uppercase mb-4">1. Coverage Overview</h2>
            <p className="mb-4">
              Nippon Used Cars is committed to your peace of mind. Every Certified Pre-Owned vehicle comes with a complimentary 90-day or 3,000-mile limited powertrain warranty, whichever comes first. This warranty covers major engine and transmission components that fail under normal use.
            </p>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md text-on-background uppercase mb-4">2. What Is Covered</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Engine:</strong> All internally lubricated parts, engine block, cylinder heads, water pump, and oil pump.</li>
              <li><strong>Transmission:</strong> Transmission case and all internally lubricated parts, torque converter.</li>
              <li><strong>Drive Axle:</strong> Front and rear drive axle housings and all internally lubricated parts.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md text-on-background uppercase mb-4">3. What Is Not Covered (Exclusions)</h2>
            <p className="mb-4">Our limited warranty does not cover the following:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Normal wear and tear items (e.g., brake pads, rotors, tires, wiper blades, belts, hoses, filters).</li>
              <li>Routine maintenance services (e.g., oil changes, alignments, fluid top-offs).</li>
              <li>Cosmetic damage, paint, glass, and interior upholstery.</li>
              <li>Damage resulting from accidents, negligence, abuse, off-road use, or lack of proper maintenance.</li>
              <li>Vehicles sold "As-Is" (which will be clearly marked at the time of sale).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md text-on-background uppercase mb-4">4. How to Make a Claim</h2>
            <p className="mb-4">
              If you experience a mechanical issue covered under this warranty, please contact our Service Department immediately at <strong>1-800-NIPPON-CARS</strong>. Do not proceed with unauthorized repairs, as this may void your warranty. All repairs must be performed at an authorized service center.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
