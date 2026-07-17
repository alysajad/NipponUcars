"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchCmsEnquiries } from '@/api/inventoryApi';

const ITEMS_PER_PAGE = 10;

export default function CmsEnquiries() {
  const [activeTab, setActiveTab] = useState('sales');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: enquiries = [], isLoading } = useQuery({
    queryKey: ['cms-enquiries'],
    queryFn: () => fetchCmsEnquiries()
  });

  const filtered = useMemo(() => {
    return enquiries.filter(e => {
      const tabMatch = e.lead_type === activeTab || (!e.lead_type && activeTab === 'sales');
      const searchMatch = !search ||
        e.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        e.vehicle_interest?.toLowerCase().includes(search.toLowerCase());
      return tabMatch && searchMatch;
    });
  }, [enquiries, activeTab, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Stats derived from data
  const totalEnquiries = enquiries.length;
  const pendingValuations = enquiries.filter(e => e.lead_type === 'valuation').length;
  const conversionRate = totalEnquiries > 0 ? ((enquiries.filter(e => e.status === 'converted').length / totalEnquiries) * 100).toFixed(1) : '0.0';

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' • ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center px-10 w-full max-w-[1280px] mx-auto h-20">
          <div className="flex items-center gap-4 xl:gap-8">
            <div className="flex items-center gap-2 shrink-0 whitespace-nowrap font-label-sm text-[14px] uppercase tracking-wider font-bold">
              <Link href="/" className="text-secondary hover:text-primary transition-colors">Home</Link>
              <span className="text-secondary/50">&gt;</span>
              <Link href="/cms/dashboard" className="text-primary hover:text-[#93000e] transition-colors">CMS</Link>
              <span className="text-secondary/50">&gt;</span>
              <span className="text-on-surface">Enquiries</span>
            </div>
            <nav className="hidden lg:flex shrink-0 whitespace-nowrap overflow-x-auto gap-3 xl:gap-6 items-center h-full">
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/dashboard">Dashboard</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/inventory">Inventory</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms">Add Vehicle</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-primary border-b-2 border-primary pb-1" href="/cms/enquiries">Enquiries</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/certification">Certified</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="bg-primary text-white px-6 py-2 rounded-[6px] font-bold text-[16px] uppercase hover:opacity-90 transition-opacity">
              Enquire
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-4 md:px-10 max-w-[1280px] mx-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="font-headline-lg text-headline-lg uppercase mb-2">CMS Management</h1>
          <p className="text-secondary font-body-lg">Oversee all customer interactions, sales leads, and trade-in valuations in one unified high-performance dashboard.</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-12">
          <div className="glass-card p-6 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline/10">
            <span className="font-label-sm text-secondary uppercase block mb-1">Total Enquiries</span>
            <div className="text-headline-md text-primary">{totalEnquiries}</div>
            <div className="text-[12px] text-green-600 mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span> +12% this week
            </div>
          </div>
          <div className="glass-card p-6 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline/10">
            <span className="font-label-sm text-secondary uppercase block mb-1">Pending Valuations</span>
            <div className="text-headline-md text-primary">{pendingValuations}</div>
            <div className="text-[12px] text-secondary mt-2">Requires inspection</div>
          </div>
          <div className="glass-card p-6 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline/10">
            <span className="font-label-sm text-secondary uppercase block mb-1">Conversion Rate</span>
            <div className="text-headline-md text-primary">{conversionRate}%</div>
            <div className="text-[12px] text-secondary mt-2">Leads to sales</div>
          </div>
          <div className="glass-card p-6 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline/10">
            <span className="font-label-sm text-secondary uppercase block mb-1">Avg. Response Time</span>
            <div className="text-headline-md text-primary">42m</div>
            <div className="text-[12px] text-secondary mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">speed</span> High Efficiency
            </div>
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex bg-surface-container rounded-[8px] p-1 w-full md:w-auto">
            <button
              className={`flex-1 md:w-48 py-3 px-6 rounded-[6px] font-label-sm text-[14px] uppercase transition-all duration-300 ${activeTab === 'sales' ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:text-primary'}`}
              onClick={() => { setActiveTab('sales'); setCurrentPage(1); }}
            >
              Sales Leads
            </button>
            <button
              className={`flex-1 md:w-48 py-3 px-6 rounded-[6px] font-label-sm text-[14px] uppercase transition-all duration-300 ${activeTab === 'valuation' ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:text-primary'}`}
              onClick={() => { setActiveTab('valuation'); setCurrentPage(1); }}
            >
              Valuation Requests
            </button>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
              <input
                className="w-full bg-white border border-outline/20 rounded-[6px] py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-[14px]"
                placeholder="Search by name or vehicle..."
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <button className="bg-white border border-outline/20 p-2 rounded-[6px] text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden border border-outline/10">
          {isLoading ? (
            <div className="p-12 text-center text-secondary">Loading enquiries...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low border-b border-outline/10">
                    <tr>
                      <th className="px-6 py-4 font-label-sm uppercase text-secondary">Customer</th>
                      <th className="px-6 py-4 font-label-sm uppercase text-secondary">Vehicle of Interest</th>
                      <th className="px-6 py-4 font-label-sm uppercase text-secondary">Contact Date</th>
                      <th className="px-6 py-4 font-label-sm uppercase text-secondary text-center">Priority</th>
                      <th className="px-6 py-4 font-label-sm uppercase text-secondary text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline/5">
                    {paginated.length > 0 ? paginated.map((enq) => {
                      const specs = enq.vehicle_specs || {};
                      return (
                        <tr key={enq.id} className="hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container text-sm">
                                {getInitials(enq.customer_name)}
                              </div>
                              <div>
                                <div className="font-body-md font-bold text-on-surface">{enq.customer_name}</div>
                                <div className="text-[12px] text-secondary">{enq.customer_email || 'No email'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-body-md uppercase font-semibold">{enq.vehicle_interest || 'N/A'}</div>
                            <div className="flex gap-2 mt-1">
                              {specs.transmission && (
                                <span className="bg-surface-container text-[10px] px-2 py-0.5 rounded-[4px] uppercase font-bold text-secondary">{specs.transmission}</span>
                              )}
                              {specs.fuel && (
                                <span className="bg-surface-container text-[10px] px-2 py-0.5 rounded-[4px] uppercase font-bold text-secondary">{specs.fuel}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-secondary">{formatDate(enq.contact_date)}</td>
                          <td className="px-6 py-5 text-center">
                            <PriorityBadge priority={enq.priority} />
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button className="border-2 border-primary text-primary px-4 py-1.5 rounded-[6px] font-label-sm uppercase hover:bg-primary hover:text-white transition-all">
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-secondary">
                          No enquiries found. {activeTab === 'valuation' ? 'No valuation requests yet.' : 'No sales leads yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center border-t border-outline/10">
                <span className="text-[12px] text-secondary uppercase font-medium">
                  Showing {filtered.length > 0 ? `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}` : '0'} of {filtered.length} enquiries
                </span>
                <div className="flex gap-2">
                  <button
                    className="p-2 rounded-[6px] border border-outline/10 hover:bg-white transition-colors disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <button
                    className="p-2 rounded-[6px] border border-outline/10 hover:bg-white transition-colors disabled:opacity-50"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </>
          )}
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

function PriorityBadge({ priority }) {
  const styles = {
    'urgent': 'bg-red-100 text-red-700',
    'high': 'bg-blue-100 text-blue-700',
    'medium': 'bg-orange-100 text-orange-700',
    'routine': 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`text-[10px] px-3 py-1 rounded-full uppercase font-bold ${styles[priority] || styles.routine}`}>
      {priority || 'Routine'}
    </span>
  );
}
