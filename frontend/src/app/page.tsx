import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Package,
  ArrowLeftRight,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { DashboardPreview } from '../components/DashboardPreview';
import { Inventory3DAccent } from '../components/Inventory3DAccent';
import { ScrollReveal } from '../components/ScrollReveal';

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171512] flex flex-col font-sans selection:bg-[#EDE4D9] selection:text-[#4E342E]">
      {/* 1. Header and Navigation */}
      <header className="sticky top-0 z-50 bg-[#F8F6F2]/90 backdrop-blur-md border-b border-[#E8E0D6] px-6 sm:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: StockMind Logo & Wordmark */}
          <Link href="/" className="flex items-center group py-0.5" title="StockMind Home">
            <Image
              src="/logo.png"
              alt="StockMind"
              width={140}
              height={32}
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              priority
            />
          </Link>



          {/* Right: Primary Action Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#2D1E18] hover:bg-[#4E342E] rounded-full shadow-xs transition-all hover:gap-2 active:scale-95"
            >
              <span>Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1">
        <section className="relative px-6 sm:px-12 pt-14 sm:pt-20 pb-8 sm:pb-12 max-w-7xl mx-auto">
          {/* Hero Content Stage */}
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in-up">
            {/* 3D Geometric Accent Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#EDE4D9]/60 border border-[#E8E0D6] text-[#4E342E] text-xs font-semibold shadow-xs">
              <div className="w-4 h-4 flex items-center justify-center">
                <Inventory3DAccent size="sm" />
              </div>
              <span>Intelligent Inventory Platform</span>
            </div>

            {/* Headline with Warm Brown Accent */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.03em] text-[#171512] leading-[1.08]">
              Smarter Inventory.<br />
              <span className="text-[#795548]">
                Simpler Operations.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#71685D] leading-relaxed font-normal">
              Manage products, track stock movements, monitor replenishment needs, and spot unusual inventory activity — all from one intuitive workspace.
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm sm:text-base font-semibold text-white bg-[#2D1E18] hover:bg-[#4E342E] rounded-full shadow-md shadow-[#4E342E]/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3.5 text-sm font-semibold text-[#71685D] hover:text-[#171512] transition-colors"
              >
                <span>Explore Features</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 3. Central Dashboard Preview Showcase */}
          <div className="relative mt-8 sm:mt-12 max-w-6xl mx-auto">
            <ScrollReveal delayMs={150} threshold={0.08} className="relative z-10">
              <DashboardPreview />
            </ScrollReveal>
          </div>
        </section>

        {/* 4. Features Section with Scroll-Driven Cascading Reveals */}
        <section id="features" className="px-6 sm:px-12 py-20 bg-white border-y border-[#E8E0D6]">
          <div className="max-w-6xl mx-auto space-y-12">
            <ScrollReveal delayMs={50} threshold={0.15} className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171512]">
                Everything You Need to Manage Inventory
              </h2>
              <p className="text-base text-[#71685D]">
                A single unified workspace designed for accurate stock control, zero shrinkage, and fast decisions.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <ScrollReveal delayMs={100} threshold={0.12}>
                <div className="h-full p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E0D6] space-y-3 hover:border-[#A88970] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E0D6] text-[#795548] flex items-center justify-center shadow-xs">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#171512] text-base">Product Management</h3>
                  <p className="text-xs sm:text-sm text-[#71685D] leading-relaxed">
                    Organise products, categories, suppliers, prices, quantities and reorder thresholds in one place.
                  </p>
                </div>
              </ScrollReveal>

              {/* Feature 2 */}
              <ScrollReveal delayMs={180} threshold={0.12}>
                <div className="h-full p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E0D6] space-y-3 hover:border-[#A88970] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E0D6] text-[#795548] flex items-center justify-center shadow-xs">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#171512] text-base">Stock Movement Tracking</h3>
                  <p className="text-xs sm:text-sm text-[#71685D] leading-relaxed">
                    Record incoming stock, outgoing stock, damaged goods and inventory adjustments with complete audit trails.
                  </p>
                </div>
              </ScrollReveal>

              {/* Feature 3 */}
              <ScrollReveal delayMs={260} threshold={0.12}>
                <div className="h-full p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E0D6] space-y-3 hover:border-[#A88970] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E0D6] text-amber-700 flex items-center justify-center shadow-xs">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#171512] text-base">Inventory Alerts</h3>
                  <p className="text-xs sm:text-sm text-[#71685D] leading-relaxed">
                    Identify low-stock items in real time and review unusual or suspicious stock movements before they impact operations.
                  </p>
                </div>
              </ScrollReveal>

              {/* Feature 4 */}
              <ScrollReveal delayMs={340} threshold={0.12}>
                <div className="h-full p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E0D6] space-y-3 hover:border-[#A88970] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E0D6] text-[#4E342E] flex items-center justify-center shadow-xs">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#171512] text-base">Analytics & Reports</h3>
                  <p className="text-xs sm:text-sm text-[#71685D] leading-relaxed">
                    Understand inventory valuation, category distribution and stock activity, with instant CSV export support.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 5. How It Works Section with Staggered Card Reveals */}
        <section id="how-it-works" className="px-6 sm:px-12 py-20 max-w-5xl mx-auto space-y-12">
          <ScrollReveal delayMs={50} threshold={0.15} className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171512]">
              How It Works
            </h2>
            <p className="text-sm sm:text-base text-[#71685D]">
              Three streamlined steps to effortless stock monitoring.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delayMs={100} threshold={0.12}>
              <div className="h-full bg-white p-6 rounded-2xl border border-[#E8E0D6] shadow-xs space-y-3 hover:border-[#A88970] transition-colors">
                <span className="w-7 h-7 rounded-full bg-[#4E342E] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-[#171512] text-base">Add your products</h3>
                <p className="text-xs sm:text-sm text-[#71685D] leading-relaxed">
                  Set up your catalog with Indian pricing, suppliers, and physical measurement units.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delayMs={200} threshold={0.12}>
              <div className="h-full bg-white p-6 rounded-2xl border border-[#E8E0D6] shadow-xs space-y-3 hover:border-[#A88970] transition-colors">
                <span className="w-7 h-7 rounded-full bg-[#4E342E] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-[#171512] text-base">Record stock movements</h3>
                <p className="text-xs sm:text-sm text-[#71685D] leading-relaxed">
                  Log incoming stock, customer dispatches, and damaged items with validated deductions.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delayMs={300} threshold={0.12}>
              <div className="h-full bg-white p-6 rounded-2xl border border-[#E8E0D6] shadow-xs space-y-3 hover:border-[#A88970] transition-colors">
                <span className="w-7 h-7 rounded-full bg-[#4E342E] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-[#171512] text-base">Monitor inventory & alerts</h3>
                <p className="text-xs sm:text-sm text-[#71685D] leading-relaxed">
                  Receive proactive replenishment warnings and inspect unusual stock fluctuations.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* 7. Refined Footer */}
      <footer className="border-t border-[#E8E0D6] bg-[#FDFCFA] px-6 sm:px-12 py-8 text-xs text-[#71685D]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: StockMind Logo & Name */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="StockMind"
              width={105}
              height={24}
              className="h-5.5 w-auto object-contain opacity-90"
            />
            <span className="text-[#C5BCB1]">•</span>
            <span>Inventory management and anomaly monitoring.</span>
          </div>

          {/* Right: Copyright */}
          <div className="flex items-center gap-4">
            <span>© 2026 StockMind.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
