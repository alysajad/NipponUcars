"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchCmsDashboard, fetchCmsInventory } from '@/api/inventoryApi';

export default function CmsDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ['cms-dashboard'],
    queryFn: fetchCmsDashboard
  });

  const { data: inventoryData, isLoading: invLoading } = useQuery({
    queryKey: ['cms-inventory', { page: 1, limit: 10 }],
    queryFn: () => fetchCmsInventory({ page: 1, limit: 10 })
  });

  const stats = dashboard?.stats || {
    totalInventory: 0,
    pendingCerts: 0,
    newEnquiries: 0,
    monthlySales: 0
  };

  const recentActivity = dashboard?.recentActivity || [];
  const tasks = dashboard?.tasks || [];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col md:flex-row justify-between md:items-center px-4 md:px-10 py-3 md:py-0 w-full max-w-[1280px] mx-auto min-h-[5rem] gap-3 md:gap-0">
          <div className="flex items-center gap-10 xl:gap-16">
            <div className="flex items-center gap-2 shrink-0 whitespace-nowrap font-label-sm text-[14px] uppercase tracking-wider font-bold">
              <Link href="/" className="text-secondary hover:text-primary transition-colors">Home</Link>
              <span className="text-secondary/50">&gt;</span>
              <Link href="/cms/dashboard" className="text-primary hover:text-[#93000e] transition-colors">CMS</Link>
              <span className="text-secondary/50">&gt;</span>
              <span className="text-on-surface">Dashboard</span>
            </div>
            <nav className="flex shrink-0 whitespace-nowrap overflow-x-auto gap-3 xl:gap-6 items-center h-full w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-primary border-b-2 border-primary pb-1" href="/cms/dashboard">Dashboard</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/inventory">Inventory</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms">Add Vehicle</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/enquiries">Enquiries</Link>
              <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/certification">Certified</Link>
            </nav>
          </div>
          {/* Removed Enquire Button */}
        </div>
      </header>

      <main className="pt-24 pb-12 min-h-screen">
        <div className="max-w-[1280px] mx-auto px-10">
          {/* Dashboard Header & Quick Actions */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
            <div>
              <h1 className="font-headline-lg text-headline-lg uppercase text-on-background">CMS Dashboard</h1>
              <p className="font-body-md text-body-md text-secondary">Manage your inventory, certifications, and enquiries in real-time.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/cms" className="flex items-center gap-2 bg-on-background text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors group">
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span className="font-label-sm text-label-sm uppercase tracking-widest">Add Vehicle</span>
              </Link>

            </div>
          </div>

          {/* Bento Grid Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
            {/* Total Inventory */}
            <div className="glass-card p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-l-4 border-primary">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-primary text-[32px]">garage</span>
                <span className="text-green-600 font-bold text-xs">+12% vs LW</span>
              </div>
              <h3 className="font-label-sm text-label-sm uppercase text-secondary mb-1">Total Inventory</h3>
              <p className="font-headline-lg text-headline-lg text-on-background">{stats.totalInventory}</p>
            </div>

            {/* Pending Certifications */}
            <div className="glass-card p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-l-4 border-on-background">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-on-background text-[32px]">verified_user</span>
                <span className="text-red-600 font-bold text-xs">High Priority</span>
              </div>
              <h3 className="font-label-sm text-label-sm uppercase text-secondary mb-1">Pending Certs</h3>
              <p className="font-headline-lg text-headline-lg text-on-background">{stats.pendingCerts}</p>
            </div>

            {/* New Enquiries */}
            <div className="glass-card p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-l-4 border-primary">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-primary text-[32px]">contact_support</span>
                <span className="bg-primary text-white px-2 py-0.5 rounded text-[10px] font-bold">NEW</span>
              </div>
              <h3 className="font-label-sm text-label-sm uppercase text-secondary mb-1">New Enquiries</h3>
              <p className="font-headline-lg text-headline-lg text-on-background">{stats.newEnquiries}</p>
            </div>

            {/* Monthly Sales */}
            <div className="glass-card p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-l-4 border-on-background">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-on-background text-[32px]">payments</span>
                <span className="text-green-600 font-bold text-xs">On Track</span>
              </div>
              <h3 className="font-label-sm text-label-sm uppercase text-secondary mb-1">Monthly Sales</h3>
              <p className="font-headline-lg text-headline-lg text-on-background">{stats.monthlySales}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Recent Activity Table */}
            <div className="lg:col-span-2 glass-card rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
                <h2 className="font-headline-md text-headline-md uppercase">Recent Activity</h2>
                <Link href="/cms/inventory" className="text-primary font-label-sm text-label-sm uppercase hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low font-label-sm text-label-sm uppercase text-secondary">
                    <tr>
                      <th className="px-6 py-4">Vehicle Detail</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {recentActivity.length > 0 ? recentActivity.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low transition-colors cursor-pointer" onClick={() => router.push(`/inventory/detail?id=${item.id}`)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-surface-variant rounded overflow-hidden flex-shrink-0">
                              {item.image ? (
                                <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-secondary">
                                  <span className="material-symbols-outlined">directions_car</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-on-background uppercase text-sm">{item.name}</div>
                              <div className="text-xs text-secondary">Stock: #{item.id?.slice(-6).toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 font-bold text-on-background">{item.price || 'N/A'}</td>
                        <td className="px-6 py-4 text-xs text-secondary">{item.dateAdded || 'N/A'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-secondary">No recent activity yet. Add vehicles to get started.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              </div>
            </div>

            {/* Quick Actions Panel & Tasks */}
            <div className="flex flex-col gap-5">
              {/* Quick Search / Filter Card */}
              <div className="glass-card p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <h3 className="font-headline-md text-headline-md uppercase mb-4">Quick Find</h3>
                <div className="relative mb-4">
                  <input
                    className="w-full border-outline bg-white rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Enter stock ID or Model..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute right-3 top-3 text-secondary">search</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/cms/inventory?status=pending" className="bg-surface-container-low px-3 py-1 rounded text-[10px] font-bold uppercase text-on-surface hover:bg-primary hover:text-white cursor-pointer transition-colors">Pending</Link>
                  <Link href="/cms/inventory?status=sold" className="bg-surface-container-low px-3 py-1 rounded text-[10px] font-bold uppercase text-on-surface hover:bg-primary hover:text-white cursor-pointer transition-colors">Sold</Link>
                  <Link href="/cms/inventory?status=certified" className="bg-surface-container-low px-3 py-1 rounded text-[10px] font-bold uppercase text-on-surface hover:bg-primary hover:text-white cursor-pointer transition-colors">Certified</Link>
                </div>
              </div>

              {/* Today's Tasks */}
              <div className="glass-card p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <h3 className="font-headline-md text-headline-md uppercase mb-4">Today's Tasks</h3>
                <div className="space-y-4">
                  {tasks.length > 0 ? tasks.map((task, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer border-l-2 border-primary">
                      <div className="bg-primary/10 p-2 rounded">
                        <span className="material-symbols-outlined text-primary">{task.icon || 'car_repair'}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm uppercase">{task.title}</p>
                        <p className="text-xs text-secondary">{task.subtitle}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-secondary text-sm">No tasks for today.</div>
                  )}
                </div>
              </div>

              {/* Promotional Card */}
              <div className="relative overflow-hidden rounded-xl h-48 group shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <img className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://res.cloudinary.com/vdofesxh/image/upload/v1784098492/inventory/competitors/competitor_asset_3.jpg" alt="Campaign" />
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 to-transparent flex flex-col justify-end p-6">
                  <h4 className="text-white font-headline-md text-headline-md uppercase">Winter Campaign</h4>
                  <p className="text-white/80 text-xs font-label-sm uppercase mb-3">Performance Maintenance Drive</p>
                  <button className="w-fit bg-primary text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:opacity-90">Manage Ads</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-on-background w-full py-12 px-10 border-t border-outline-variant/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[1280px] mx-auto items-center">
          <div className="flex flex-col gap-4">
            <span className="font-headline-md text-headline-md text-on-primary uppercase tracking-wider font-bold">PREMIER AUTO</span>
            <p className="font-label-sm text-label-sm uppercase text-surface-variant max-w-md opacity-80">
              © 2024 PREMIER AUTO. ALL RIGHTS RESERVED. HIGH-PERFORMANCE PRE-OWNED. NIPPON USED CARS CERTIFIED CMS SYSTEM.
            </p>
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

function StatusBadge({ status }) {
  const statusStyles = {
    'Certified': 'bg-green-100 text-green-700',
    'Pending Inspection': 'bg-orange-100 text-orange-700',
    'In Prep': 'bg-gray-100 text-gray-700',
    'Available': 'bg-blue-100 text-blue-700',
    'Sold': 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status || 'N/A'}
    </span>
  );
}
