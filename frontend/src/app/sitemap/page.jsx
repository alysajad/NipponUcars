import React from 'react';
import Link from 'next/link';

export default function Sitemap() {
  const links = [
    { title: "Home", path: "/" },
    { title: "Buy/Inventory", path: "/inventory" },
    { title: "Sell Your Car", path: "/sell" },
    { title: "Exchange", path: "/exchange" },
    { title: "Certified Pre-Owned", path: "/certified" },
    { title: "About Us", path: "/about" },
    { title: "Contact Us", path: "/contact" },
    { title: "Enquiry Form", path: "/enquiry" },
    { title: "Store Locator", path: "/locator" },
    { title: "Warranty Policy", path: "/warranty" },
    { title: "Privacy Policy", path: "/privacy" },
    { title: "Terms of Use", path: "/terms" },
    { title: "Cookie Policy", path: "/cookies" },
    { title: "FAQs", path: "/faqs" },
  ];

  return (
    <div className="min-h-screen bg-background text-on-background pt-24 pb-12">
      <div className="max-w-[800px] mx-auto px-10">
        <div className="mb-12">
          <Link href="/" className="text-primary hover:underline font-label-sm uppercase tracking-widest flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Home
          </Link>
          <h1 className="font-headline-lg text-headline-lg uppercase mb-4">Sitemap</h1>
          <p className="text-secondary font-body-lg">Overview of Nippon Used Cars website structure.</p>
        </div>

        <div className="bg-surface-container rounded-xl p-8 border border-outline-variant/30">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10 list-disc pl-6">
            {links.map((link, idx) => (
              <li key={idx}>
                <Link href={link.path} className="text-on-background hover:text-primary transition-colors font-bold uppercase text-sm tracking-wider">
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
