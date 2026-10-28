"use client";

import React, { useState, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  AlertTriangle,
  BarChart3,
  Search,
  Bell,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import { InteractiveAnalyticsChart } from './InteractiveAnalyticsChart';

export const DashboardPreview: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Small, refined tilt: max ±1.5 degrees
    const rotateX = ((y - centerY) / centerY) * -1.5;
    const rotateY = ((x - centerX) / centerX) * 1.5;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div className="perspective-container w-full max-w-6xl mx-auto">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(1.006)`
            : 'rotateX(0deg) rotateY(0deg) scale(1)',
          transition: isHovered ? 'transform 0.15s ease-out' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="rounded-2xl sm:rounded-3xl border border-[#E8E0D6] bg-white shadow-2xl shadow-[#4E342E]/5 overflow-hidden transform-gpu will-change-transform"
      >
        {/* Top Window Chrome Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#E8E0D6] flex items-center justify-between bg-[#FDFCFA]">
          <div className="flex items-center gap-3">
            {/* Window Dots in subtle warm grey */}
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E8E0D6]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#E8E0D6]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#E8E0D6]" />
            </div>
            <div className="h-4 w-px bg-[#E8E0D6] mx-1 hidden sm:block" />
            <span className="text-xs font-semibold text-[#171512] hidden sm:inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              StockMind Operational Workspace
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 text-[#71685D] absolute left-2.5 top-2" />
              <div className="w-48 pl-8 pr-3 py-1 text-xs text-[#71685D] bg-[#F8F6F2] border border-[#E8E0D6] rounded-lg">
                Search inventory...
              </div>
            </div>
            <div className="p-1.5 text-[#71685D] hover:text-[#171512] rounded-lg relative">
              <Bell className="w-4 h-4" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 absolute top-1 right-1" />
            </div>
            <div className="w-6 h-6 rounded-full bg-[#4E342E] text-white text-[11px] font-bold flex items-center justify-center">
              IN
            </div>
          </div>
        </div>

        {/* Dashboard Shell Body */}
        <div className="flex min-h-[440px] sm:min-h-[500px]">
          {/* Mini Sidebar in Muted Surface */}
          <aside className="w-14 sm:w-16 border-r border-[#E8E0D6] py-4 flex flex-col items-center justify-between shrink-0 bg-[#F8F6F2]">
            <div className="space-y-3.5 flex flex-col items-center">
              {/* Active Tab: Dark Brown */}
              <div className="w-9 h-9 rounded-xl bg-[#4E342E] text-white flex items-center justify-center shadow-xs">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div className="w-9 h-9 rounded-xl text-[#71685D] hover:text-[#171512] hover:bg-[#EDE4D9]/60 flex items-center justify-center transition-colors">
                <Package className="w-4 h-4" />
              </div>
              <div className="w-9 h-9 rounded-xl text-[#71685D] hover:text-[#171512] hover:bg-[#EDE4D9]/60 flex items-center justify-center transition-colors">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <div className="w-9 h-9 rounded-xl text-[#71685D] hover:text-[#171512] hover:bg-[#EDE4D9]/60 flex items-center justify-center transition-colors">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="w-9 h-9 rounded-xl text-[#71685D] hover:text-[#171512] hover:bg-[#EDE4D9]/60 flex items-center justify-center transition-colors">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#EDE4D9] text-[#4E342E] flex items-center justify-center text-xs font-mono font-bold">
              ₹
            </div>
          </aside>

          {/* Main Dashboard Canvas */}
          <div className="flex-1 p-4 sm:p-6 bg-white space-y-5 overflow-hidden">
            {/* Top KPI Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Metric 1: Valuation */}
              <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-xl border border-[#E8E0D6]">
                <div className="flex items-center justify-between text-[#71685D] text-[11px] font-medium">
                  <span>Total Valuation</span>
                  <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                    +8.5%
                  </span>
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-[#171512] mt-1 font-mono tracking-tight">
                  ₹18,45,200
                </div>
                <p className="text-[10px] text-[#71685D] mt-0.5">Price × quantity portfolio asset</p>
              </div>

              {/* Metric 2: Tracked SKUs */}
              <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-xl border border-[#E8E0D6]">
                <div className="flex items-center justify-between text-[#71685D] text-[11px] font-medium">
                  <span>Tracked SKUs</span>
                  <span className="text-[#4E342E] bg-[#EDE4D9] px-1.5 py-0.5 rounded text-[10px] font-bold">
                    6 Categories
                  </span>
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-[#171512] mt-1">
                  40 Products
                </div>
                <p className="text-[10px] text-[#71685D] mt-0.5">All items catalogued & monitored</p>
              </div>

              {/* Metric 3: Low Stock */}
              <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-xl border border-amber-200/90">
                <div className="flex items-center justify-between text-[#71685D] text-[11px] font-medium">
                  <span>Low Stock Alert</span>
                  <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                    Action
                  </span>
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-amber-700 mt-1 font-mono">
                  3 Products
                </div>
                <p className="text-[10px] text-amber-800 mt-0.5 font-medium">At or below reorder limit</p>
              </div>

              {/* Metric 4: Movement Health */}
              <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-xl border border-[#E8E0D6]">
                <div className="flex items-center justify-between text-[#71685D] text-[11px] font-medium">
                  <span>Movement Health</span>
                  <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" /> Optimal
                  </span>
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-[#171512] mt-1">
                  0 Critical
                </div>
                <p className="text-[10px] text-[#71685D] mt-0.5">All stock ledgers balanced</p>
              </div>
            </div>

            {/* Split Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column (2 Cols): Valuation Trend Chart & Replenishment Priority */}
              <div className="lg:col-span-2 space-y-4">
                {/* Interactive Area Chart (Stock Activity Overview in Warm Brown) */}
                <InteractiveAnalyticsChart
                  compact={true}
                  showSeriesControls={true}
                  title="Inventory Activity & Valuation"
                  subtitle="Interactive inflow vs. dispatch trajectory with real-time hovering & pinning"
                />

                {/* Priority Replenishment Table */}
                <div className="bg-white p-4 rounded-xl border border-[#E8E0D6] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#171512]">Replenishment Priority</h4>
                      <p className="text-[10px] text-[#71685D]">Items requiring supplier purchase orders</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#4E342E] bg-[#EDE4D9] px-2 py-0.5 rounded">
                      Live Thresholds
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[10px] uppercase text-[#71685D] border-b border-[#E8E0D6] pb-1">
                          <th className="pb-1.5 font-semibold">Product</th>
                          <th className="pb-1.5 font-semibold">Stock</th>
                          <th className="pb-1.5 font-semibold">Reorder Lvl</th>
                          <th className="pb-1.5 font-semibold text-right">Suggested Order</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3EEE7]">
                        <tr className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-2 font-medium text-[#171512]">
                            <div>Amul Pasteurised Butter 500g</div>
                            <span className="text-[9px] font-mono text-[#71685D]">Dairy</span>
                          </td>
                          <td className="py-2 font-bold font-mono text-rose-600">8 packets</td>
                          <td className="py-2 font-mono text-[#71685D]">20 packets</td>
                          <td className="py-2 text-right">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F3EEE7] text-[#4E342E] border border-[#E8E0D6] font-mono">
                              +52 packets
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-2 font-medium text-[#171512]">
                            <div>Dell UltraSharp 27" 4K Monitor</div>
                            <span className="text-[9px] font-mono text-[#71685D]">Electronics</span>
                          </td>
                          <td className="py-2 font-bold font-mono text-rose-600">2 pcs</td>
                          <td className="py-2 font-mono text-[#71685D]">5 pcs</td>
                          <td className="py-2 text-right">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F3EEE7] text-[#4E342E] border border-[#E8E0D6] font-mono">
                              +13 pcs
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-2 font-medium text-[#171512]">
                            <div>Epigamia Greek Yogurt 400g</div>
                            <span className="text-[9px] font-mono text-[#71685D]">Dairy</span>
                          </td>
                          <td className="py-2 font-bold font-mono text-rose-600">4 tubs</td>
                          <td className="py-2 font-mono text-[#71685D]">10 tubs</td>
                          <td className="py-2 text-right">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F3EEE7] text-[#4E342E] border border-[#E8E0D6] font-mono">
                              +26 tubs
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column (1 Col): Category Distribution & Recent Movements */}
              <div className="space-y-4">
                {/* Category Valuation Breakdown - Mathematically Consistent */}
                <div className="bg-white p-4 rounded-xl border border-[#E8E0D6] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#171512]">Category Distribution</h4>
                    <span className="text-[10px] font-mono text-[#71685D]">Portfolio Share</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#171512] font-medium">Electronics</span>
                        <span className="font-mono font-bold text-[#171512]">₹11,45,000 (62%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#EDE4D9] rounded-full overflow-hidden">
                        <div className="h-full bg-[#4E342E] rounded-full" style={{ width: '62%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#171512] font-medium">Groceries</span>
                        <span className="font-mono font-bold text-[#171512]">₹2,85,000 (15%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#EDE4D9] rounded-full overflow-hidden">
                        <div className="h-full bg-[#795548] rounded-full" style={{ width: '15%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#171512] font-medium">Hardware & Tools</span>
                        <span className="font-mono font-bold text-[#171512]">₹1,79,200 (10%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#EDE4D9] rounded-full overflow-hidden">
                        <div className="h-full bg-[#A88970] rounded-full" style={{ width: '10%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#171512] font-medium">Dairy Products</span>
                        <span className="font-mono font-bold text-[#171512]">₹1,24,000 (7%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#EDE4D9] rounded-full overflow-hidden">
                        <div className="h-full bg-[#C7A992] rounded-full" style={{ width: '7%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#171512] font-medium">Office Supplies</span>
                        <span className="font-mono font-bold text-[#171512]">₹1,12,000 (6%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#EDE4D9] rounded-full overflow-hidden">
                        <div className="h-full bg-[#D7CCC8] rounded-full" style={{ width: '6%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Movement Activity Feed */}
                <div className="bg-white p-4 rounded-xl border border-[#E8E0D6] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#171512]">Recent Movements</h4>
                    <span className="text-[10px] text-[#71685D]">Ledger Feed</span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5] border border-[#E8E0D6]">
                      <div>
                        <div className="font-semibold text-[#171512]">Amul Taaza Milk 1L</div>
                        <div className="text-[9px] text-[#71685D]">Depot consignment PO-8842</div>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 text-xs">+40 L</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5] border border-[#E8E0D6]">
                      <div>
                        <div className="font-semibold text-[#171512]">Tata Toor Dal 1kg</div>
                        <div className="text-[9px] text-[#71685D]">Store Indiranagar dispatch</div>
                      </div>
                      <span className="font-mono font-bold text-[#71685D] text-xs">-10 kg</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5] border border-[#E8E0D6]">
                      <div>
                        <div className="font-semibold text-[#171512]">JK Copier Paper A4</div>
                        <div className="text-[9px] text-[#71685D]">Physical audit reconciliation</div>
                      </div>
                      <span className="font-mono font-bold text-[#4E342E] text-xs">+5 cases</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
