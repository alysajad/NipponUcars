import React from 'react';
import Link from 'next/link';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background text-on-background pt-24 pb-12">
      <div className="max-w-[800px] mx-auto px-10">
        <div className="mb-12">
          <Link href="/" className="text-primary hover:underline font-label-sm uppercase tracking-widest flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Home
          </Link>
          <h1 className="font-headline-lg text-headline-lg uppercase mb-4">Terms of Use</h1>
          <p className="text-secondary font-body-lg">Effective Date: {new Date().getFullYear()}</p>
        </div>

        <div className="space-y-8 font-body-md text-surface-variant">
          <section>
            <h2 className="font-headline-md text-headline-md text-on-background uppercase mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using the Nippon Used Cars website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md text-on-background uppercase mb-4">2. Vehicle Information & Availability</h2>
            <p className="mb-4">
              While we make every effort to ensure the accuracy of the information on our website, errors may occur. Vehicle prices, availability, specifications, and features are subject to change without notice. We reserve the right to correct any pricing errors or omissions at any time.
            </p>
            <p className="mb-4">
              All vehicles are subject to prior sale. A listing on the website does not guarantee the vehicle is currently available in stock.
            </p>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md text-on-background uppercase mb-4">3. Intellectual Property</h2>
            <p className="mb-4">
              All content included on this site, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of Nippon Used Cars or its content suppliers and protected by international copyright laws.
            </p>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md text-on-background uppercase mb-4">4. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall Nippon Used Cars or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Nippon Used Cars's website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
