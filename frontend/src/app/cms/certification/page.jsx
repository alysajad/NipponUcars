"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchCmsCertifications, fetchCmsEnquiries } from '@/api/inventoryApi';

const ITEMS_PER_PAGE = 10;

export default function CmsCertification() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: certifications = [], isLoading: isLoadingCerts } = useQuery({
    queryKey: ['cms-certifications'],
    queryFn: fetchCmsCertifications
  });

  const { data: enquiries = [], isLoading: isLoadingEnquiries } = useQuery({
    queryKey: ['cms-enquiries', 'inspection'],
    queryFn: () => fetchCmsEnquiries('inspection')
  });

  const isLoading = isLoadingCerts || isLoadingEnquiries;

  const combinedCertifications = useMemo(() => {
    const mappedEnquiries = enquiries.map(enq => {
      const vinMatch = enq.notes?.match(/VIN:\s*([^\n]+)/);
      const vin = vinMatch ? vinMatch[1].trim() : 'N/A';
      return {
        id: enq.id,
        vehicle_name: enq.vehicle_interest || 'Unknown Vehicle',
        vin: vin !== 'N/A' ? vin : undefined,
        technician: 'Pending Assignment',
        points_checked: 0,
        total_points: 203,
        stage: 'inspection',
        status: 'pending',
        isEnquiry: true
      };
    });
    return [...mappedEnquiries, ...certifications];
  }, [certifications, enquiries]);

  const filtered = useMemo(() => {
    if (!search) return combinedCertifications;
    const q = search.toLowerCase();
    return combinedCertifications.filter(c =>
      c.vehicle_name?.toLowerCase().includes(q) ||
      c.vin?.toLowerCase().includes(q) ||
      c.technician?.toLowerCase().includes(q)
    );
  }, [combinedCertifications, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Stats
  const totalInProcess = combinedCertifications.filter(c => c.status === 'in-progress' || c.status === 'pending').length;
  const stageInspection = combinedCertifications.filter(c => c.stage === 'inspection').length;
  const stageRefurbishment = combinedCertifications.filter(c => c.stage === 'refurbishment').length;
  const stageFinalAudit = combinedCertifications.filter(c => c.stage === 'final-audit').length;

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col md:flex-row justify-between md:items-center px-4 md:px-10 py-3 md:py-0 w-full max-w-[1280px] mx-auto min-h-[5rem] gap-3 md:gap-0">
          <div className="flex items-center gap-10 xl:gap-16">
            <div className="flex items-center gap-2 shrink-0 whitespace-nowrap font-label-sm text-[14px] uppercase tracking-wider font-bold">
              <Link href="/" className="text-secondary hover:text-primary transition-colors">Home</Link>
              <span className="text-secondary/50">&gt;</span>
              <Link href="/cms/dashboard" className="text-primary hover:text-[#93000e] transition-colors">CMS</Link>
              <span className="text-secondary/50">&gt;</span>
              <span className="text-on-surface">Certification</span>
            </div>
            <nav className="flex shrink-0 whitespace-nowrap overflow-x-auto gap-3 xl:gap-6 items-center h-full w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/dashboard">Dashboard</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/inventory">Inventory</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms">Add Vehicle</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/enquiries">Enquiries</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-primary border-b-2 border-primary pb-1" href="/cms/certification">Certified</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-4 md:px-10 max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-headline-lg text-headline-lg uppercase mb-2">Certification Pipeline</h1>
          <p className="text-secondary font-body-lg">Managing the 203-point inspection and refurbishment protocols.</p>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-12">
          <div className="glass-card p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col justify-between">
            <span className="font-label-sm text-label-sm uppercase text-secondary">Total In-Process</span>
            <div className="flex items-end justify-between mt-4">
              <span className="text-4xl font-bold text-primary">{String(totalInProcess).padStart(2, '0')}</span>
              <span className="material-symbols-outlined text-primary text-3xl">directions_car</span>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col justify-between border-l-4 border-primary">
            <span className="font-label-sm text-label-sm uppercase text-secondary">Stage 1: Inspection</span>
            <div className="flex items-end justify-between mt-4">
              <span className="text-4xl font-bold text-on-background">{String(stageInspection).padStart(2, '0')}</span>
              <span className="material-symbols-outlined text-secondary text-3xl">fact_check</span>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col justify-between border-l-4 border-[#525556]">
            <span className="font-label-sm text-label-sm uppercase text-secondary">Stage 2: Refurbishment</span>
            <div className="flex items-end justify-between mt-4">
              <span className="text-4xl font-bold text-on-background">{String(stageRefurbishment).padStart(2, '0')}</span>
              <span className="material-symbols-outlined text-secondary text-3xl">build</span>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col justify-between border-l-4 border-green-600">
            <span className="font-label-sm text-label-sm uppercase text-secondary">Stage 3: Final Audit</span>
            <div className="flex items-end justify-between mt-4">
              <span className="text-4xl font-bold text-on-background">{String(stageFinalAudit).padStart(2, '0')}</span>
              <span className="material-symbols-outlined text-secondary text-3xl">verified</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          {/* Controls */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40">
            <div className="relative w-full md:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-white border border-outline rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md text-body-md"
                placeholder="Search VIN, Model or Technician..."
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-outline rounded-[6px] bg-white font-label-sm text-label-sm uppercase hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-sm">filter_list</span> Filter
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container-highest border-b border-outline-variant/30 font-label-sm text-label-sm uppercase text-secondary">
            <div className="col-span-3">Vehicle Details</div>
            <div className="col-span-2">Technician</div>
            <div className="col-span-4">Certification Progress</div>
            <div className="col-span-2">Stage</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Table Body */}
          {isLoading ? (
            <div className="p-12 text-center text-secondary">Loading certifications...</div>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {paginated.length > 0 ? paginated.map((cert) => {
                const pct = cert.total_points > 0 ? Math.round((cert.points_checked / cert.total_points) * 100) : 0;
                const barColor = pct >= 90 ? 'bg-green-600' : 'bg-primary';

                return (
                  <div key={cert.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-8 md:py-6 items-center hover:bg-white/50 transition-colors">
                    {/* Vehicle */}
                    <div className="col-span-3 flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-secondary">directions_car</span>
                      </div>
                      <div>
                        <div className="font-headline-md text-[18px] uppercase leading-tight">{cert.vehicle_name}</div>
                        <div className="font-label-sm text-[10px] text-secondary tracking-tighter">VIN: {cert.vin || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Technician */}
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary">person</span>
                      </div>
                      <span className="font-body-md text-body-md">{cert.technician}</span>
                    </div>

                    {/* Progress */}
                    <div className="col-span-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-label-sm text-[11px] text-secondary">{cert.points_checked} / {cert.total_points} Points Checked</span>
                        <span className="font-label-sm text-[11px] font-bold text-primary">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {/* Stage */}
                    <div className="col-span-2">
                      <StageBadge stage={cert.stage} />
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 text-right">
                      <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors">more_vert</button>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-12 text-center text-secondary">No certifications in the pipeline. Start a new inspection to begin.</div>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 bg-white/40 border-t border-outline-variant/20 flex justify-between items-center">
            <span className="font-label-sm text-label-sm text-secondary">
              Showing {filtered.length > 0 ? `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}` : '0'} of {filtered.length} Units
            </span>
            <div className="flex gap-2">
              <button
                className="w-8 h-8 flex items-center justify-center border border-outline rounded-[4px] hover:bg-surface-container transition-colors disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`w-8 h-8 flex items-center justify-center border rounded-[4px] font-label-sm transition-colors ${
                    currentPage === page
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline hover:bg-surface-container'
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="w-8 h-8 flex items-center justify-center border border-outline rounded-[4px] hover:bg-surface-container transition-colors disabled:opacity-50"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-on-background w-full py-12 px-10 border-t border-outline-variant/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[1280px] mx-auto items-center">
          <div>
            <div className="font-headline-md text-headline-md text-on-primary mb-2">PREMIER AUTO</div>
            <p className="font-label-sm text-label-sm uppercase text-surface-variant">© 2024 PREMIER AUTO. ALL RIGHTS RESERVED. HIGH-PERFORMANCE PRE-OWNED.</p>
          </div>
          <div className="flex flex-wrap md:justify-end gap-x-8 gap-y-4">
            <a className="font-label-sm text-label-sm uppercase text-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm uppercase text-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm uppercase text-surface-variant hover:text-primary transition-colors" href="#">Cookie Policy</a>
            <a className="font-label-sm text-label-sm uppercase text-surface-variant hover:text-primary transition-colors" href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StageBadge({ stage }) {
  const stageConfig = {
    'inspection': { bg: 'bg-primary-container text-on-primary-container', dot: 'bg-white animate-pulse', label: 'Inspection' },
    'refurbishment': { bg: 'bg-surface-container text-secondary', dot: 'bg-[#525556]', label: 'Refurbishment' },
    'final-audit': { bg: 'bg-green-100 text-green-800', dot: 'bg-green-600', label: 'Final Audit' },
  };
  const cfg = stageConfig[stage] || stageConfig.inspection;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-[11px] uppercase font-semibold ${cfg.bg}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} /> {cfg.label}
    </span>
  );
}
