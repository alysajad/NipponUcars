import React from 'react';
import Link from 'next/link';

export default function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-background text-on-background pt-24 pb-12">
      <div className="max-w-[800px] mx-auto px-10">
        <div className="mb-12">
          <Link href="/" className="text-primary hover:underline font-label-sm uppercase tracking-widest flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Home
          </Link>
          <h1 className="font-headline-lg text-headline-lg uppercase mb-4">Cookie Policy</h1>
          <p className="text-secondary font-body-lg">Effective Date: {new Date().getFullYear()}</p>
        </div>

        <div className="space-y-8 font-body-md text-surface-variant">
          <section>
            <h2 className="font-headline-md text-headline-md text-on-background uppercase mb-4">1. What are Cookies?</h2>
            <p className="mb-4">
              Cookies are small pieces of data, stored in text files, that are stored on your computer or other device when websites are loaded in a browser. They are widely used to "remember" you and your preferences, either for a single visit (through a "session cookie") or for multiple repeat visits (using a "persistent cookie").
            </p>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md text-on-background uppercase mb-4">2. How We Use Cookies</h2>
            <p className="mb-4">We use cookies for a number of different purposes. Some cookies are necessary for technical reasons; some enable a personalized experience for both visitors and registered users; and some allow the display of advertising from selected third party networks.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> These cookies are required for the website to function correctly.</li>
              <li><strong>Performance & Analytics Cookies:</strong> These collect information about how visitors use a website, for instance, which pages visitors go to most often.</li>
              <li><strong>Functionality Cookies:</strong> These allow the website to remember choices you make (such as your user name, language or the region you are in).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md text-on-background uppercase mb-4">3. Managing Cookies</h2>
            <p className="mb-4">
              You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. If you do this, however, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
