"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CmsAddRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/cms');
  }, [router]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-secondary font-body-md">Redirecting to Add Vehicle...</div>
    </div>
  );
}
