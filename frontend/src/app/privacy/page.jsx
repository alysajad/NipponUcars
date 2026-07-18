import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-on-background pt-24 pb-12">
      <div className="max-w-[800px] mx-auto px-10">
        <div className="mb-12">
          <Link href="/" className="text-primary hover:underline font-label-sm uppercase tracking-widest flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Home
          </Link>
          <h1 className="font-headline-lg text-headline-lg uppercase mb-4">Privacy Policy</h1>
          <p className="text-secondary font-body-lg">Effective Date: {new Date().getFullYear()}</p>
        </div>

        <div className="space-y-8 font-body-md text-surface-variant">
          <section>
            <h2 className="font-headline-md text-headline-md text-on-background uppercase mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to Nippon Used Cars. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
            </p>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md text-on-background uppercase mb-4">2. The Data We Collect</h2>
            <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
              <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md text-on-background uppercase mb-4">3. How We Use Your Data</h2>
            <p className="mb-4">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To register you as a new customer.</li>
              <li>To process and deliver your order, including managing payments and collections.</li>
              <li>To manage our relationship with you.</li>
              <li>To improve our website, products/services, marketing, and customer relationships.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md text-on-background uppercase mb-4">4. Data Security</h2>
            <p className="mb-4">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
