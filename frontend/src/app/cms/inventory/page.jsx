"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCmsInventory, deleteCar, toggleFeaturedCar } from '@/api/inventoryApi';

const ITEMS_PER_PAGE = 10;

export default function CmsInventory() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedMake, setSelectedMake] = useState('All Makes');
  const [selectedPriceRange, setSelectedPriceRange] = useState('Any Price');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const queryClient = useQueryClient();

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteCar,
    onSuccess: () => {
      queryClient.invalidateQueries(['cms-inventory']);
      setOpenDropdownId(null);
      showToast("Vehicle deleted successfully.");
    }
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: toggleFeaturedCar,
    onSuccess: () => {
      queryClient.invalidateQueries(['cms-inventory']);
      setOpenDropdownId(null);
      showToast("Featured status updated successfully.");
    }
  });

  const { data: allCars = [], isLoading } = useQuery({
    queryKey: ['cms-inventory'],
    queryFn: () => fetchCmsInventory({ page: 1, limit: 1000 })
  });

  const makes = useMemo(() => {
    const makeSet = new Set();
    allCars.forEach(car => {
      const specs = parseSpecs(car.specs);
      const make = specs.brand || car.name?.split(' ')[0] || '';
      if (make) makeSet.add(make);
    });
    return ['All Makes', ...Array.from(makeSet).sort()];
  }, [allCars]);

  const filteredCars = useMemo(() => {
    return allCars.filter(car => {
      const specs = parseSpecs(car.specs);
      const nameMatch = !search || car.name?.toLowerCase().includes(search.toLowerCase());
      const makeMatch = selectedMake === 'All Makes' || specs.brand?.toLowerCase() === selectedMake.toLowerCase();
      let priceMatch = true;
      if (selectedPriceRange !== 'Any Price') {
        const numericPrice = parseFloat((car.price || '0').replace(/[^0-9.]/g, ''));
        switch (selectedPriceRange) {
          case 'INR 50k - 100k':
            priceMatch = numericPrice >= 50000 && numericPrice <= 100000;
            break;
          case 'INR 100k - 250k':
            priceMatch = numericPrice >= 100000 && numericPrice <= 250000;
            break;
          case 'INR 250k+':
            priceMatch = numericPrice >= 250000;
            break;
        }
      }
      return nameMatch && makeMatch && priceMatch;
    });
  }, [allCars, search, selectedMake, selectedPriceRange]);

  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);
  const paginatedCars = filteredCars.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = useMemo(() => {
    const totalUnits = allCars.length;
    const certifiedCount = allCars.filter(car => {
      const specs = parseSpecs(car.specs);
      return specs.status === 'Certified';
    }).length;
    const totalValue = allCars.reduce((sum, car) => {
      return sum + parseFloat((car.price || '0').replace(/[^0-9.]/g, '') || 0);
    }, 0);
    const avgDays = 18;
    return {
      totalUnits,
      certifiedPreOwned: certifiedCount,
      inventoryValue: formatCurrency(totalValue),
      avgDaysOnLot: avgDays
    };
  }, [allCars]);

  const clearFilters = () => {
    setSearch('');
    setSelectedMake('All Makes');
    setSelectedPriceRange('Any Price');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col md:flex-row justify-between md:items-center px-4 md:px-10 py-3 md:py-0 w-full max-w-[1280px] mx-auto min-h-[5rem] gap-3 md:gap-0">
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap font-label-sm text-[14px] uppercase tracking-wider font-bold">
            <Link href="/" className="text-secondary hover:text-primary transition-colors">Home</Link>
            <span className="text-secondary/50">&gt;</span>
            <Link href="/cms/dashboard" className="text-primary hover:text-[#93000e] transition-colors">CMS</Link>
            <span className="text-secondary/50">&gt;</span>
            <span className="text-on-surface">Inventory</span>
          </div>
          <nav className="flex shrink-0 whitespace-nowrap overflow-x-auto items-center gap-4 xl:gap-8 w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
            <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/dashboard">Dashboard</Link>
            <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-primary border-b-2 border-primary pb-1" href="/cms/inventory">Inventory</Link>
            <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms">Add Vehicle</Link>
            <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/enquiries">Enquiries</Link>
            <Link className="font-bold text-[12px] xl:text-[14px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors duration-300" href="/cms/certification">Certified</Link>
          </nav>
          {/* Removed Enquire Button */}
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 md:px-10 max-w-[1280px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase text-on-surface">Inventory Management</h1>
            <p className="text-secondary font-body-md">Manage your high-performance fleet and certification records.</p>
          </div>
          <Link href="/cms" className="bg-primary text-on-primary flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] font-headline-md text-[18px] uppercase tracking-wide hover:shadow-lg transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined">add_circle</span>
            Add New Vehicle
          </Link>
        </div>

        {/* Dashboard Bento Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-6 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-l-4 border-primary">
            <p className="text-secondary font-label-sm uppercase mb-1">Total Units</p>
            <h3 className="text-headline-md font-headline-md">{stats.totalUnits}</h3>
          </div>
          <div className="bg-white p-6 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <p className="text-secondary font-label-sm uppercase mb-1">Certified Pre-Owned</p>
            <h3 className="text-headline-md font-headline-md">{stats.certifiedPreOwned}</h3>
          </div>
          <div className="bg-white p-6 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <p className="text-secondary font-label-sm uppercase mb-1">Inventory Value</p>
            <h3 className="text-headline-md font-headline-md">{stats.inventoryValue}</h3>
          </div>
          <div className="bg-white p-6 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <p className="text-secondary font-label-sm uppercase mb-1">Days on Lot (Avg)</p>
            <h3 className="text-headline-md font-headline-md">{stats.avgDaysOnLot}</h3>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-card p-6 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block font-label-sm uppercase text-secondary mb-2">Search Vehicle</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input
                  className="w-full pl-10 pr-4 py-2 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none"
                  placeholder="Model, VIN or ID..."
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
            <div>
              <label className="block font-label-sm uppercase text-secondary mb-2">Make / Brand</label>
              <select
                className="w-full px-4 py-2 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none appearance-none"
                value={selectedMake}
                onChange={(e) => { setSelectedMake(e.target.value); setCurrentPage(1); }}
              >
                {makes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label-sm uppercase text-secondary mb-2">Price Range</label>
              <select
                className="w-full px-4 py-2 border border-outline/30 rounded-[6px] focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none appearance-none"
                value={selectedPriceRange}
                onChange={(e) => { setSelectedPriceRange(e.target.value); setCurrentPage(1); }}
              >
                <option>Any Price</option>
                <option>INR 50k - 100k</option>
                <option>INR 100k - 250k</option>
                <option>INR 250k+</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                className="flex-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm uppercase py-2.5 rounded-[6px] transition-colors"
              >
                Clear Filters
              </button>
              <button className="flex-none bg-on-background text-on-primary px-4 py-2 rounded-[6px] hover:bg-secondary transition-colors">
                <span className="material-symbols-outlined">tune</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden border border-outline-variant/10">
          {isLoading ? (
            <div className="p-12 text-center text-secondary font-body-md">Loading inventory...</div>
          ) : (
            <>
              <div className="overflow-x-auto table-scrollbar">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low border-b border-outline-variant/30">
                    <tr>
                      <th className="px-6 py-4 font-label-sm uppercase text-secondary tracking-wider">
                        <div className="flex items-center gap-1">Vehicle Model <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span></div>
                      </th>
                      <th className="px-6 py-4 font-label-sm uppercase text-secondary tracking-wider">Year</th>
                      <th className="px-6 py-4 font-label-sm uppercase text-secondary tracking-wider">Mileage</th>
                      <th className="px-6 py-4 font-label-sm uppercase text-secondary tracking-wider">Price</th>
                      <th className="px-6 py-4 font-label-sm uppercase text-secondary tracking-wider">Status</th>
                      <th className="px-6 py-4 font-label-sm uppercase text-secondary tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {paginatedCars.length > 0 ? paginatedCars.map((car) => {
                      const specs = parseSpecs(car.specs);
                      const coverImage = car.frames?.[0] || '';
                      const year = specs.year || 'N/A';
                      const mileage = specs.km ? `${specs.km} mi` : 'N/A';
                      const status = specs.status || 'Available';

                      return (
                        <tr key={car.id} className="group transition-colors cursor-pointer" onClick={() => router.push(`/inventory/detail?id=${car.id}`)}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-10 rounded-[4px] bg-surface-container-high overflow-hidden flex-shrink-0">
                                {coverImage ? (
                                  <img className="w-full h-full object-cover" src={coverImage} alt={car.name} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-secondary">
                                    <span className="material-symbols-outlined text-[20px]">directions_car</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-headline-md text-[16px] leading-none mb-1">{car.name}</div>
                                <div className="text-[12px] text-secondary">VIN: {specs.vin || car.id?.slice(-8).toUpperCase()}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-body-md">{year}</td>
                          <td className="px-6 py-4 font-body-md">{mileage}</td>
                          <td className="px-6 py-4 font-headline-md text-[16px] text-primary">{car.price || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <StatusBadge status={status} />
                          </td>
                          <td className="px-6 py-4 text-right relative">
                            <button className="p-2 text-secondary hover:text-primary transition-colors" onClick={(e) => { e.stopPropagation(); router.push(`/cms?edit=${car.id}`); }}>
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button className="p-2 text-secondary hover:text-on-background transition-colors" onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === car.id ? null : car.id);
                              }}>
                              <span className="material-symbols-outlined">more_vert</span>
                            </button>
                            {openDropdownId === car.id && (
                              <div className="absolute right-6 top-12 bg-white shadow-xl border border-outline-variant/30 rounded-lg py-2 z-50 w-48 text-left">
                                <button className="w-full px-4 py-2 text-sm text-secondary hover:bg-surface-container-low hover:text-primary text-left" onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFeaturedMutation.mutate(car.id);
                                }}>
                                  {specs?.is_featured ? 'Remove from Featured' : 'Promote to Featured'}
                                </button>
                                <button className="w-full px-4 py-2 text-sm text-[#D71921] hover:bg-surface-container-low text-left" onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm("Are you sure you want to delete this car?")) {
                                    deleteMutation.mutate(car.id);
                                  }
                                }}>
                                  Delete from Inventory
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-secondary">
                          No vehicles found. Try adjusting your filters or add a new vehicle.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between">
                <span className="text-secondary font-label-sm uppercase">
                  Showing {filteredCars.length > 0 ? `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredCars.length)}` : '0'} of {filteredCars.length} units
                </span>
                <div className="flex gap-2">
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-[6px] border border-outline/30 hover:bg-white transition-colors disabled:opacity-30"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`w-10 h-10 flex items-center justify-center rounded-[6px] border font-headline-md text-[14px] transition-colors ${
                        currentPage === page
                          ? 'border-primary bg-primary text-on-primary'
                          : 'border-outline/30 hover:bg-white'
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 5 && (
                    <span className="w-10 h-10 flex items-center justify-center text-secondary">...</span>
                  )}
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-[6px] border border-outline/30 hover:bg-white transition-colors disabled:opacity-30"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
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
            <div className="font-headline-md text-headline-md text-on-primary uppercase mb-4 tracking-wider">PREMIER AUTO</div>
            <p className="font-label-sm text-label-sm uppercase text-surface-variant">
              © 2024 PREMIER AUTO. ALL RIGHTS RESERVED. HIGH-PERFORMANCE PRE-OWNED.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4 md:justify-end">
            <a className="font-label-sm text-label-sm uppercase text-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm uppercase text-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm uppercase text-surface-variant hover:text-primary transition-colors" href="#">Cookie Policy</a>
            <a className="font-label-sm text-label-sm uppercase text-surface-variant hover:text-primary transition-colors" href="#">Contact Support</a>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-surface-container-highest text-on-surface px-6 py-4 rounded-xl shadow-2xl z-[9999] flex items-center gap-3 border border-outline-variant/30 transition-all duration-300">
          <span className="material-symbols-outlined text-primary">check_circle</span>
          <span className="font-label-md uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

function parseSpecs(specs) {
  if (!specs) return {};
  if (typeof specs === 'object') return specs;
  try { return JSON.parse(specs); } catch(e) { return {}; }
}

function formatCurrency(value) {
  if (value >= 1000000) return `INR ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `INR ${(value / 1000).toFixed(0)}k`;
  return `INR ${value.toFixed(0)}`;
}

function StatusBadge({ status }) {
  const statusStyles = {
    'Certified': 'bg-primary/10 text-primary',
    'Standard': 'bg-secondary/10 text-secondary',
    'Pending Inspection': 'bg-orange-100 text-orange-700',
    'In Prep': 'bg-gray-100 text-gray-700',
    'Available': 'bg-blue-100 text-blue-700',
    'Sold': 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-3 py-1 rounded-[4px] font-label-sm uppercase font-semibold ${statusStyles[status] || 'bg-secondary/10 text-secondary'}`}>
      {status}
    </span>
  );
}
