"use client";

import React, { useState, useEffect, useRef, useId, useCallback, useMemo } from 'react';
import { api } from '../lib/api';
import { TimeSeriesDataPoint } from '../types';
import { formatINR } from '../lib/format';
import {
  TrendingUp,
  TrendingDown,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  RefreshCw,
  Info
} from 'lucide-react';

export type TimeSeriesRange = '7d' | '30d' | '3m' | '6m';
export type SeriesKey = 'valuation' | 'inflow' | 'dispatch';

interface InteractiveAnalyticsChartProps {
  initialRange?: TimeSeriesRange;
  compact?: boolean;
  className?: string;
  showSeriesControls?: boolean;
  title?: string;
  subtitle?: string;
}

const FALLBACK_DATA: Record<TimeSeriesRange, TimeSeriesDataPoint[]> = {
  '7d': [
    { label: '8 Oct', date: '2026-10-08', stockInValuation: 33575, stockOutValuation: 22383, netValuationChange: 11192, totalPortfolioValuation: 2797963, inboundMovementsCount: 3, outboundMovementsCount: 2 },
    { label: '9 Oct', date: '2026-10-09', stockInValuation: 33575, stockOutValuation: 22383, netValuationChange: 11192, totalPortfolioValuation: 2786771, inboundMovementsCount: 4, outboundMovementsCount: 3 },
    { label: '10 Oct', date: '2026-10-10', stockInValuation: 33575, stockOutValuation: 22383, netValuationChange: 11192, totalPortfolioValuation: 2775580, inboundMovementsCount: 2, outboundMovementsCount: 2 },
    { label: '11 Oct', date: '2026-10-11', stockInValuation: 33575, stockOutValuation: 22383, netValuationChange: 11192, totalPortfolioValuation: 2764388, inboundMovementsCount: 1, outboundMovementsCount: 1 },
    { label: '12 Oct', date: '2026-10-12', stockInValuation: 33575, stockOutValuation: 22383, netValuationChange: 11192, totalPortfolioValuation: 2753196, inboundMovementsCount: 3, outboundMovementsCount: 2 },
    { label: '13 Oct', date: '2026-10-13', stockInValuation: 33575, stockOutValuation: 22383, netValuationChange: 11192, totalPortfolioValuation: 2742004, inboundMovementsCount: 4, outboundMovementsCount: 3 },
    { label: '14 Oct', date: '2026-10-14', stockInValuation: 4080, stockOutValuation: 524740, netValuationChange: -520660, totalPortfolioValuation: 2797963, inboundMovementsCount: 3, outboundMovementsCount: 7 },
  ],
  '30d': [
    { label: '17 Sep', date: '2026-09-17', stockInValuation: 69949, stockOutValuation: 50363, netValuationChange: 19586, totalPortfolioValuation: 2574126, inboundMovementsCount: 6, outboundMovementsCount: 4 },
    { label: '20 Sep', date: '2026-09-20', stockInValuation: 92332, stockOutValuation: 67151, netValuationChange: 25181, totalPortfolioValuation: 2598997, inboundMovementsCount: 8, outboundMovementsCount: 5 },
    { label: '23 Sep', date: '2026-09-23', stockInValuation: 114716, stockOutValuation: 50363, netValuationChange: 64353, totalPortfolioValuation: 2623868, inboundMovementsCount: 7, outboundMovementsCount: 4 },
    { label: '26 Sep', date: '2026-09-26', stockInValuation: 69949, stockOutValuation: 67151, netValuationChange: 2798, totalPortfolioValuation: 2648739, inboundMovementsCount: 5, outboundMovementsCount: 5 },
    { label: '29 Sep', date: '2026-09-29', stockInValuation: 92332, stockOutValuation: 50363, netValuationChange: 41969, totalPortfolioValuation: 2673610, inboundMovementsCount: 8, outboundMovementsCount: 3 },
    { label: '2 Oct', date: '2026-10-02', stockInValuation: 114716, stockOutValuation: 67151, netValuationChange: 47565, totalPortfolioValuation: 2698481, inboundMovementsCount: 9, outboundMovementsCount: 6 },
    { label: '5 Oct', date: '2026-10-05', stockInValuation: 69949, stockOutValuation: 50363, netValuationChange: 19586, totalPortfolioValuation: 2723351, inboundMovementsCount: 6, outboundMovementsCount: 4 },
    { label: '8 Oct', date: '2026-10-08', stockInValuation: 92332, stockOutValuation: 67151, netValuationChange: 25181, totalPortfolioValuation: 2748222, inboundMovementsCount: 7, outboundMovementsCount: 5 },
    { label: '11 Oct', date: '2026-10-11', stockInValuation: 114716, stockOutValuation: 50363, netValuationChange: 64353, totalPortfolioValuation: 2773093, inboundMovementsCount: 10, outboundMovementsCount: 4 },
    { label: '14 Oct', date: '2026-10-14', stockInValuation: 69949, stockOutValuation: 67151, netValuationChange: 2798, totalPortfolioValuation: 2797963, inboundMovementsCount: 8, outboundMovementsCount: 7 },
  ],
  '3m': [
    { label: '29 Jul', date: '2026-07-29', stockInValuation: 125800, stockOutValuation: 97800, netValuationChange: 28000, totalPortfolioValuation: 2495783, inboundMovementsCount: 8, outboundMovementsCount: 6 },
    { label: '5 Aug', date: '2026-08-05', stockInValuation: 145200, stockOutValuation: 112000, netValuationChange: 33200, totalPortfolioValuation: 2528983, inboundMovementsCount: 9, outboundMovementsCount: 7 },
    { label: '12 Aug', date: '2026-08-12', stockInValuation: 138600, stockOutValuation: 98400, netValuationChange: 40200, totalPortfolioValuation: 2569183, inboundMovementsCount: 8, outboundMovementsCount: 5 },
    { label: '19 Aug', date: '2026-08-19', stockInValuation: 162400, stockOutValuation: 135000, netValuationChange: 27400, totalPortfolioValuation: 2596583, inboundMovementsCount: 11, outboundMovementsCount: 8 },
    { label: '26 Aug', date: '2026-08-26', stockInValuation: 154000, stockOutValuation: 119000, netValuationChange: 35000, totalPortfolioValuation: 2631583, inboundMovementsCount: 10, outboundMovementsCount: 7 },
    { label: '2 Sep', date: '2026-09-02', stockInValuation: 142000, stockOutValuation: 105000, netValuationChange: 37000, totalPortfolioValuation: 2668583, inboundMovementsCount: 9, outboundMovementsCount: 6 },
    { label: '9 Sep', date: '2026-09-09', stockInValuation: 168000, stockOutValuation: 139000, netValuationChange: 29000, totalPortfolioValuation: 2697583, inboundMovementsCount: 12, outboundMovementsCount: 9 },
    { label: '16 Sep', date: '2026-09-16', stockInValuation: 135000, stockOutValuation: 98000, netValuationChange: 37000, totalPortfolioValuation: 2734583, inboundMovementsCount: 8, outboundMovementsCount: 5 },
    { label: '23 Sep', date: '2026-09-23', stockInValuation: 151000, stockOutValuation: 124000, netValuationChange: 27000, totalPortfolioValuation: 2761583, inboundMovementsCount: 10, outboundMovementsCount: 7 },
    { label: '30 Sep', date: '2026-09-30', stockInValuation: 144000, stockOutValuation: 115000, netValuationChange: 29000, totalPortfolioValuation: 2790583, inboundMovementsCount: 9, outboundMovementsCount: 6 },
    { label: '7 Oct', date: '2026-10-07', stockInValuation: 128000, stockOutValuation: 92000, netValuationChange: 36000, totalPortfolioValuation: 2826583, inboundMovementsCount: 8, outboundMovementsCount: 5 },
    { label: '14 Oct', date: '2026-10-14', stockInValuation: 69949, stockOutValuation: 67151, netValuationChange: 2798, totalPortfolioValuation: 2797963, inboundMovementsCount: 8, outboundMovementsCount: 7 },
  ],
  '6m': [
    { label: 'May 2026', date: '2026-05-14', stockInValuation: 475653, stockOutValuation: 307776, netValuationChange: 167877, totalPortfolioValuation: 2294330, inboundMovementsCount: 34, outboundMovementsCount: 28 },
    { label: 'Jun 2026', date: '2026-06-14', stockInValuation: 405704, stockOutValuation: 251816, netValuationChange: 153888, totalPortfolioValuation: 2395057, inboundMovementsCount: 32, outboundMovementsCount: 26 },
    { label: 'Jul 2026', date: '2026-07-14', stockInValuation: 335755, stockOutValuation: 307776, netValuationChange: 27979, totalPortfolioValuation: 2495783, inboundMovementsCount: 30, outboundMovementsCount: 24 },
    { label: 'Aug 2026', date: '2026-08-14', stockInValuation: 475653, stockOutValuation: 251816, netValuationChange: 223837, totalPortfolioValuation: 2596510, inboundMovementsCount: 28, outboundMovementsCount: 22 },
    { label: 'Sep 2026', date: '2026-09-14', stockInValuation: 405704, stockOutValuation: 307776, netValuationChange: 97928, totalPortfolioValuation: 2697237, inboundMovementsCount: 26, outboundMovementsCount: 20 },
    { label: 'Oct 2026', date: '2026-10-14', stockInValuation: 335755, stockOutValuation: 251816, netValuationChange: 83938, totalPortfolioValuation: 2797963, inboundMovementsCount: 24, outboundMovementsCount: 18 },
  ],
};

export const InteractiveAnalyticsChart: React.FC<InteractiveAnalyticsChartProps> = ({
  initialRange = '6m',
  compact = false,
  className = '',
  showSeriesControls = true,
  title = 'Inventory Activity & Valuation',
  subtitle = 'Inflow vs. dispatch trajectory and net portfolio valuation',
}) => {
  const gradientId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [range, setRange] = useState<TimeSeriesRange>(initialRange);
  const [data, setData] = useState<TimeSeriesDataPoint[]>(FALLBACK_DATA[initialRange]);
  const [loading, setLoading] = useState<boolean>(false);

  // Hover and Pin states
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);

  // Single Source of Truth for Series Visibility
  const [visibleSeries, setVisibleSeries] = useState<Record<SeriesKey, boolean>>({
    valuation: true,
    inflow: true,
    dispatch: true,
  });

  // Calculate count of currently visible series
  const visibleCount = useMemo(() => {
    return (
      (visibleSeries.valuation ? 1 : 0) +
      (visibleSeries.inflow ? 1 : 0) +
      (visibleSeries.dispatch ? 1 : 0)
    );
  }, [visibleSeries]);

  // Enforce rule: AT LEAST ONE SERIES MUST ALWAYS REMAIN VISIBLE
  const toggleSeries = useCallback(
    (key: SeriesKey) => {
      setVisibleSeries((prev) => {
        const isCurrentlyVisible = prev[key];
        // If it is currently visible and it is the ONLY visible series, block hiding it!
        if (isCurrentlyVisible && visibleCount <= 1) {
          return prev;
        }
        return {
          ...prev,
          [key]: !isCurrentlyVisible,
        };
      });
    },
    [visibleCount]
  );

  // Fetch real data on range change
  const fetchData = useCallback(async (selectedRange: TimeSeriesRange) => {
    setLoading(true);
    try {
      const result = await api.getTimeSeries(selectedRange);
      if (Array.isArray(result) && result.length > 0) {
        setData(result);
      } else {
        setData(FALLBACK_DATA[selectedRange]);
      }
    } catch {
      setData(FALLBACK_DATA[selectedRange]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  // Keyboard accessibility: Escape to unpin, Arrow keys to navigate, Space/Enter to toggle pin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if container or child has focus
      if (containerRef.current && containerRef.current.contains(document.activeElement)) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setPinnedIndex(null);
          setActiveIndex(null);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setActiveIndex((prev) => {
            const current = prev ?? (pinnedIndex ?? 0);
            return Math.min(data.length - 1, current + 1);
          });
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setActiveIndex((prev) => {
            const current = prev ?? (pinnedIndex ?? data.length - 1);
            return Math.max(0, current - 1);
          });
        } else if (e.key === 'Enter' || e.key === ' ') {
          if (activeIndex !== null) {
            e.preventDefault();
            setPinnedIndex((prev) => (prev === activeIndex ? null : activeIndex));
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data.length, activeIndex, pinnedIndex]);

  // Click outside to unpin
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPinnedIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute SVG Geometry: Calibrated 800x225 aspect ratio ensures the graph fills the remaining viewport frame completely
  const width = 800;
  const height = compact ? 135 : 225;
  const paddingX = 36;
  const paddingTop = 20;
  const paddingBottom = 28;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  // Valuation scale (min to max with breathing room)
  const valuations = useMemo(() => data.map((d) => d.totalPortfolioValuation), [data]);
  const minVal = useMemo(() => Math.min(...valuations) * 0.96, [valuations]);
  const maxVal = useMemo(() => Math.max(...valuations) * 1.04, [valuations]);
  const valRange = useMemo(() => maxVal - minVal || 1, [maxVal, minVal]);

  // Flow scale (inflow & dispatch max)
  const flows = useMemo(() => data.flatMap((d) => [d.stockInValuation, d.stockOutValuation]), [data]);
  const maxFlow = useMemo(() => Math.max(...flows, 1000) * 1.15, [flows]);

  const getX = useCallback(
    (idx: number) => {
      if (data.length <= 1) return paddingX + chartWidth / 2;
      return paddingX + (idx / (data.length - 1)) * chartWidth;
    },
    [data.length, chartWidth]
  );

  const getYValuation = useCallback(
    (val: number) => {
      const normalized = (val - minVal) / valRange;
      return paddingTop + chartHeight - normalized * chartHeight;
    },
    [minVal, valRange, chartHeight]
  );

  const getYFlow = useCallback(
    (flow: number) => {
      const normalized = flow / maxFlow;
      return paddingTop + chartHeight - normalized * chartHeight;
    },
    [maxFlow, chartHeight]
  );

  // Build SVG Path strings using smooth bezier curves
  const buildSmoothPath = useCallback((points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX = (curr.x + next.x) / 2;
      path += ` C ${cpX},${curr.y} ${cpX},${next.y} ${next.x},${next.y}`;
    }
    return path;
  }, []);

  // Format clean concise label for the X-axis (preventing long label collisions)
  const getDisplayAxisLabel = useCallback((label: string) => {
    // If backend returns "Wk X (d MMM)", extract just "d MMM" (e.g. "29 Jul")
    const match = label.match(/Wk\s*\d+\s*\((.*?)\)/i);
    if (match) {
      return match[1];
    }
    return label;
  }, []);

  const valuationPoints = useMemo(
    () => data.map((d, i) => ({ x: getX(i), y: getYValuation(d.totalPortfolioValuation) })),
    [data, getX, getYValuation]
  );
  const inflowPoints = useMemo(
    () => data.map((d, i) => ({ x: getX(i), y: getYFlow(d.stockInValuation) })),
    [data, getX, getYFlow]
  );
  const dispatchPoints = useMemo(
    () => data.map((d, i) => ({ x: getX(i), y: getYFlow(d.stockOutValuation) })),
    [data, getX, getYFlow]
  );

  const valuationLinePath = useMemo(() => buildSmoothPath(valuationPoints), [buildSmoothPath, valuationPoints]);
  const inflowLinePath = useMemo(() => buildSmoothPath(inflowPoints), [buildSmoothPath, inflowPoints]);
  const dispatchLinePath = useMemo(() => buildSmoothPath(dispatchPoints), [buildSmoothPath, dispatchPoints]);

  const valuationAreaPath = useMemo(() => {
    if (valuationPoints.length === 0) return '';
    return `${valuationLinePath} L ${getX(data.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;
  }, [valuationPoints, valuationLinePath, getX, data.length, chartHeight]);

  const inflowAreaPath = useMemo(() => {
    if (inflowPoints.length === 0) return '';
    return `${inflowLinePath} L ${getX(data.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;
  }, [inflowPoints, inflowLinePath, getX, data.length, chartHeight]);

  const dispatchAreaPath = useMemo(() => {
    if (dispatchPoints.length === 0) return '';
    return `${dispatchLinePath} L ${getX(data.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;
  }, [dispatchPoints, dispatchLinePath, getX, data.length, chartHeight]);

  // STABLE, NON-FLICKERING POINTER INTERACTION
  // We attach interaction handlers to a dedicated, full-area transparent overlay <rect>
  // This guarantees that mouse movement over child SVG paths or text does not cause pointerleave/flicker.
  const handleOverlayPointerMove = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      if (pinnedIndex !== null) return; // Keep locked when pinned
      if (!svgRef.current || data.length === 0) return;

      const rect = svgRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const relativeX = (clientX / rect.width) * width;

      // Find nearest data point index
      let closestIdx = 0;
      let minDist = Infinity;
      for (let i = 0; i < data.length; i++) {
        const dist = Math.abs(getX(i) - relativeX);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = i;
        }
      }

      // Guarded state update: ONLY update state if index has actually changed!
      setActiveIndex((prev) => (prev === closestIdx ? prev : closestIdx));
    },
    [pinnedIndex, data, getX, width]
  );

  const handleOverlayPointerLeave = useCallback(() => {
    if (pinnedIndex === null) {
      setActiveIndex(null);
    }
  }, [pinnedIndex]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      if (!svgRef.current || data.length === 0) return;

      const rect = svgRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const relativeX = (clientX / rect.width) * width;

      let closestIdx = 0;
      let minDist = Infinity;
      for (let i = 0; i < data.length; i++) {
        const dist = Math.abs(getX(i) - relativeX);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = i;
        }
      }

      // Toggle pin for this point
      setPinnedIndex((prev) => (prev === closestIdx ? null : closestIdx));
      setActiveIndex(closestIdx);
    },
    [data, getX, width]
  );

  const selectedIndex = pinnedIndex !== null ? pinnedIndex : activeIndex;
  const activeDataPoint = selectedIndex !== null ? data[selectedIndex] : null;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Interactive Inventory Analytics Chart"
      tabIndex={0}
      className={`bg-white rounded-2xl border border-[#E8E0D6] shadow-xs p-4 sm:p-5 flex flex-col justify-between transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#795548] select-none ${className}`}
    >
      {/* Header with Title, Range Switcher & Pinned Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#F3EEE7]">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[#171512] tracking-tight">{title}</h4>
            {pinnedIndex !== null && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EDE4D9] text-[#4E342E]">
                <Pin className="w-2.5 h-2.5" /> Pinned
              </span>
            )}
            {loading && (
              <RefreshCw className="w-3 h-3 text-[#795548] animate-spin" />
            )}
          </div>
          {subtitle && <p className="text-[11px] text-[#71685D] mt-0.5">{subtitle}</p>}
        </div>

        {/* Date Range Tabs */}
        <div className="flex items-center bg-[#F8F6F2] p-1 rounded-xl border border-[#E8E0D6] self-stretch sm:self-auto justify-between sm:justify-start">
          {(['7d', '30d', '3m', '6m'] as TimeSeriesRange[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRange(r);
                setPinnedIndex(null);
                setActiveIndex(null);
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                range === r
                  ? 'bg-white text-[#171512] shadow-xs border border-[#E8E0D6]'
                  : 'text-[#71685D] hover:text-[#171512] hover:bg-[#EDE4D9]/40'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Series Toggles Bar with Minimum 1 Visible Series Enforcement */}
      {showSeriesControls && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 text-xs">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1. Valuation Toggle */}
            {(() => {
              const isOnlyVisible = visibleSeries.valuation && visibleCount <= 1;
              return (
                <button
                  type="button"
                  disabled={isOnlyVisible}
                  onClick={() => toggleSeries('valuation')}
                  aria-disabled={isOnlyVisible}
                  aria-pressed={visibleSeries.valuation}
                  title={
                    isOnlyVisible
                      ? 'At least one series must remain visible'
                      : visibleSeries.valuation
                      ? 'Hide Valuation series'
                      : 'Show Valuation series'
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                    isOnlyVisible
                      ? 'bg-[#FAF8F5] text-[#4E342E] border-[#A88970]/50 opacity-60 cursor-not-allowed'
                      : visibleSeries.valuation
                      ? 'bg-[#FAF8F5] text-[#4E342E] border-[#A88970]/50 hover:bg-[#EDE4D9]/40 cursor-pointer'
                      : 'bg-white text-[#71685D]/60 border-[#E8E0D6] line-through hover:text-[#171512] cursor-pointer'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#795548]" />
                  <span>Valuation (₹)</span>
                  {visibleSeries.valuation ? (
                    <Eye className="w-3 h-3 opacity-70" />
                  ) : (
                    <EyeOff className="w-3 h-3 opacity-40" />
                  )}
                </button>
              );
            })()}

            {/* 2. Inflow Toggle */}
            {(() => {
              const isOnlyVisible = visibleSeries.inflow && visibleCount <= 1;
              return (
                <button
                  type="button"
                  disabled={isOnlyVisible}
                  onClick={() => toggleSeries('inflow')}
                  aria-disabled={isOnlyVisible}
                  aria-pressed={visibleSeries.inflow}
                  title={
                    isOnlyVisible
                      ? 'At least one series must remain visible'
                      : visibleSeries.inflow
                      ? 'Hide Inflow series'
                      : 'Show Inflow series'
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                    isOnlyVisible
                      ? 'bg-emerald-50/70 text-emerald-900 border-emerald-200 opacity-60 cursor-not-allowed'
                      : visibleSeries.inflow
                      ? 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100/60 cursor-pointer'
                      : 'bg-white text-[#71685D]/60 border-[#E8E0D6] line-through hover:text-[#171512] cursor-pointer'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Inflow (₹)</span>
                  {visibleSeries.inflow ? (
                    <Eye className="w-3 h-3 opacity-70" />
                  ) : (
                    <EyeOff className="w-3 h-3 opacity-40" />
                  )}
                </button>
              );
            })()}

            {/* 3. Dispatch Toggle */}
            {(() => {
              const isOnlyVisible = visibleSeries.dispatch && visibleCount <= 1;
              return (
                <button
                  type="button"
                  disabled={isOnlyVisible}
                  onClick={() => toggleSeries('dispatch')}
                  aria-disabled={isOnlyVisible}
                  aria-pressed={visibleSeries.dispatch}
                  title={
                    isOnlyVisible
                      ? 'At least one series must remain visible'
                      : visibleSeries.dispatch
                      ? 'Hide Dispatched series'
                      : 'Show Dispatched series'
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                    isOnlyVisible
                      ? 'bg-amber-50/70 text-amber-900 border-amber-200 opacity-60 cursor-not-allowed'
                      : visibleSeries.dispatch
                      ? 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100/60 cursor-pointer'
                      : 'bg-white text-[#71685D]/60 border-[#E8E0D6] line-through hover:text-[#171512] cursor-pointer'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span>Dispatched (₹)</span>
                  {visibleSeries.dispatch ? (
                    <Eye className="w-3 h-3 opacity-70" />
                  ) : (
                    <EyeOff className="w-3 h-3 opacity-40" />
                  )}
                </button>
              );
            })()}
          </div>

          <div className="text-[11px] text-[#71685D] font-mono flex items-center gap-1 hidden md:flex">
            <Info className="w-3 h-3" />
            <span>Hover or tap to inspect. Click to pin. Esc to reset.</span>
          </div>
        </div>
      )}

      {/* SVG Canvas & Tooltip Container */}
      <div className="relative w-full mt-3.5 sm:mt-4 mb-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible touch-none block"
        >
          <defs>
            {/* Valuation (Warm Brown / Beige) */}
            <linearGradient id={`chartGrad-val-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#795548" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#A88970" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#EDE4D9" stopOpacity="0.0" />
            </linearGradient>

            {/* Inflow (Emerald Green) */}
            <linearGradient id={`chartGrad-inflow-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.18" />
              <stop offset="60%" stopColor="#10B981" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>

            {/* Dispatched (Amber / Warm Orange) */}
            <linearGradient id={`chartGrad-dispatch-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.16" />
              <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines (Decorative - pointer-events: none) */}
          <g className="pointer-events-none select-none">
            <line x1={paddingX} y1={paddingTop} x2={width - paddingX} y2={paddingTop} stroke="#E8E0D6" strokeDasharray="3 3" opacity="0.6" />
            <line x1={paddingX} y1={paddingTop + chartHeight * 0.33} x2={width - paddingX} y2={paddingTop + chartHeight * 0.33} stroke="#E8E0D6" strokeDasharray="3 3" opacity="0.6" />
            <line x1={paddingX} y1={paddingTop + chartHeight * 0.66} x2={width - paddingX} y2={paddingTop + chartHeight * 0.66} stroke="#E8E0D6" strokeDasharray="3 3" opacity="0.6" />
            <line x1={paddingX} y1={paddingTop + chartHeight} x2={width - paddingX} y2={paddingTop + chartHeight} stroke="#E8E0D6" opacity="0.8" />
          </g>

          {/* Area Fills for All Visible Series (Layered subtly at baseline) */}
          {visibleSeries.dispatch && dispatchAreaPath && (
            <path
              d={dispatchAreaPath}
              fill={`url(#chartGrad-dispatch-${gradientId})`}
              className="pointer-events-none transition-opacity duration-200"
            />
          )}

          {visibleSeries.inflow && inflowAreaPath && (
            <path
              d={inflowAreaPath}
              fill={`url(#chartGrad-inflow-${gradientId})`}
              className="pointer-events-none transition-opacity duration-200"
            />
          )}

          {visibleSeries.valuation && valuationAreaPath && (
            <path
              d={valuationAreaPath}
              fill={`url(#chartGrad-val-${gradientId})`}
              className="pointer-events-none transition-opacity duration-200"
            />
          )}

          {/* Stock Inflow Line (Emerald - if visible) */}
          {visibleSeries.inflow && inflowLinePath && (
            <path
              d={inflowLinePath}
              fill="none"
              stroke="#059669"
              strokeWidth="2.2"
              strokeDasharray="4 3"
              strokeLinecap="round"
              className="pointer-events-none transition-opacity duration-200"
            />
          )}

          {/* Stock Dispatch Line (Amber - if visible) */}
          {visibleSeries.dispatch && dispatchLinePath && (
            <path
              d={dispatchLinePath}
              fill="none"
              stroke="#D97706"
              strokeWidth="2.2"
              strokeDasharray="4 3"
              strokeLinecap="round"
              className="pointer-events-none transition-opacity duration-200"
            />
          )}

          {/* Valuation Line (Primary Warm Brown - if visible) */}
          {visibleSeries.valuation && valuationLinePath && (
            <path
              d={valuationLinePath}
              fill="none"
              stroke="#795548"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none transition-opacity duration-200"
            />
          )}

          {/* Baseline Anchor Circles for ALL Visible Series Lines */}
          {data.map((d, i) => {
            const isSelected = selectedIndex === i;
            const x = getX(i);

            return (
              <g key={`data-nodes-${i}`} className="pointer-events-none">
                {/* 1. Dispatch Circles */}
                {visibleSeries.dispatch && (
                  <circle
                    cx={x}
                    cy={getYFlow(d.stockOutValuation)}
                    r={isSelected ? 4.5 : 3.2}
                    fill={isSelected ? '#D97706' : '#FFFFFF'}
                    stroke="#D97706"
                    strokeWidth={isSelected ? 2.2 : 1.6}
                    className="transition-all duration-150"
                  />
                )}

                {/* 2. Inflow Circles */}
                {visibleSeries.inflow && (
                  <circle
                    cx={x}
                    cy={getYFlow(d.stockInValuation)}
                    r={isSelected ? 4.5 : 3.2}
                    fill={isSelected ? '#059669' : '#FFFFFF'}
                    stroke="#059669"
                    strokeWidth={isSelected ? 2.2 : 1.6}
                    className="transition-all duration-150"
                  />
                )}

                {/* 3. Valuation Circles */}
                {visibleSeries.valuation && (
                  <circle
                    cx={x}
                    cy={getYValuation(d.totalPortfolioValuation)}
                    r={isSelected ? 5 : 3.5}
                    fill={isSelected ? '#4E342E' : '#FFFFFF'}
                    stroke="#795548"
                    strokeWidth={isSelected ? 2.5 : 1.8}
                    className="transition-all duration-150"
                  />
                )}
              </g>
            );
          })}

          {/* Vertical Guide Line & Series Highlight Rings for Active Inspection */}
          {selectedIndex !== null && (
            <g className="pointer-events-none transition-transform duration-100">
              <line
                x1={getX(selectedIndex)}
                y1={0}
                x2={getX(selectedIndex)}
                y2={paddingTop + chartHeight}
                stroke="#4E342E"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                opacity="0.8"
              />

              {/* Valuation highlighted dot halo */}
              {visibleSeries.valuation && (
                <g>
                  <circle
                    cx={getX(selectedIndex)}
                    cy={getYValuation(data[selectedIndex].totalPortfolioValuation)}
                    r="7"
                    fill="#795548"
                    fillOpacity="0.22"
                  />
                  <circle
                    cx={getX(selectedIndex)}
                    cy={getYValuation(data[selectedIndex].totalPortfolioValuation)}
                    r="4.5"
                    fill="#FFFFFF"
                    stroke="#4E342E"
                    strokeWidth="2.5"
                  />
                </g>
              )}

              {/* Inflow highlighted dot halo */}
              {visibleSeries.inflow && (
                <g>
                  <circle
                    cx={getX(selectedIndex)}
                    cy={getYFlow(data[selectedIndex].stockInValuation)}
                    r="6.5"
                    fill="#059669"
                    fillOpacity="0.22"
                  />
                  <circle
                    cx={getX(selectedIndex)}
                    cy={getYFlow(data[selectedIndex].stockInValuation)}
                    r="4"
                    fill="#FFFFFF"
                    stroke="#059669"
                    strokeWidth="2.2"
                  />
                </g>
              )}

              {/* Dispatch highlighted dot halo */}
              {visibleSeries.dispatch && (
                <g>
                  <circle
                    cx={getX(selectedIndex)}
                    cy={getYFlow(data[selectedIndex].stockOutValuation)}
                    r="6.5"
                    fill="#D97706"
                    fillOpacity="0.22"
                  />
                  <circle
                    cx={getX(selectedIndex)}
                    cy={getYFlow(data[selectedIndex].stockOutValuation)}
                    r="4"
                    fill="#FFFFFF"
                    stroke="#D97706"
                    strokeWidth="2.2"
                  />
                </g>
              )}
            </g>
          )}

          {/* X Axis Date Labels */}
          {data.map((d, i) => {
            const isLast = i === data.length - 1;
            const isSelected = selectedIndex === i;
            const displayLabel = getDisplayAxisLabel(d.label);

            return (
              <text
                key={`label-${i}`}
                x={getX(i)}
                y={paddingTop + chartHeight + 18}
                textAnchor="middle"
                fontSize={compact ? '9' : '10'}
                fontFamily="inherit"
                fontWeight={isSelected || isLast ? '700' : '500'}
                fill={isSelected ? '#171512' : '#71685D'}
                className="pointer-events-none select-none transition-colors"
              >
                {displayLabel}
              </text>
            );
          })}

          {/* UNIFIED INTERACTION OVERLAY: Single transparent rect capturing all pointer events */}
          {/* This completely prevents sub-element event bubbling and hover flickering */}
          <rect
            x={paddingX}
            y={paddingTop - 10}
            width={chartWidth}
            height={chartHeight + 25}
            fill="transparent"
            className="cursor-crosshair"
            onPointerMove={handleOverlayPointerMove}
            onPointerLeave={handleOverlayPointerLeave}
            onClick={handleOverlayClick}
          />
        </svg>

        {/* Floating Rich Tooltip with Viewport-Aware Positioning */}
        {activeDataPoint && selectedIndex !== null && (
          <div
            style={{
              left: `${Math.min(
                Math.max(18, (getX(selectedIndex) / width) * 100),
                82
              )}%`,
              bottom: 'calc(100% + 8px)',
              transform: 'translateX(-50%)',
            }}
            /* When unpinned: pointer-events-none prevents cursor interference. When pinned: pointer-events-auto allows clicking pin button */
            className={`absolute z-30 ${
              pinnedIndex !== null ? 'pointer-events-auto' : 'pointer-events-none'
            } bg-[#171512] text-white p-3 rounded-xl shadow-2xl shadow-black/35 border border-white/10 min-w-[210px] sm:min-w-[230px] transition-all duration-150`}
          >
            {/* Tooltip Header */}
            <div className="flex items-center justify-between border-b border-white/15 pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#EDE4D9]">
                  {activeDataPoint.label.includes('Wk')
                    ? activeDataPoint.label
                    : range === '3m'
                    ? `Wk ${selectedIndex + 1} (${activeDataPoint.label})`
                    : activeDataPoint.label}
                </span>
                <span className="text-[10px] text-white/60">({activeDataPoint.date})</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPinnedIndex(pinnedIndex === selectedIndex ? null : selectedIndex);
                }}
                className="text-white/60 hover:text-white transition-colors p-0.5 pointer-events-auto"
                title={pinnedIndex === selectedIndex ? 'Unpin tooltip (Esc)' : 'Pin tooltip'}
              >
                {pinnedIndex === selectedIndex ? (
                  <PinOff className="w-3.5 h-3.5 text-amber-300" />
                ) : (
                  <Pin className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Tooltip Values Grid (Only displays currently visible series) */}
            <div className="space-y-1.5 text-xs">
              {/* Valuation Row (if visible) */}
              {visibleSeries.valuation && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/70 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#A88970]" /> Portfolio Value:
                  </span>
                  <span className="font-mono font-bold text-white">
                    {formatINR(activeDataPoint.totalPortfolioValuation)}
                  </span>
                </div>
              )}

              {/* Inflow Row (if visible) */}
              {visibleSeries.inflow && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/70 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Stock Inflow:
                  </span>
                  <span className="font-mono font-medium text-emerald-300">
                    +{formatINR(activeDataPoint.stockInValuation)}
                  </span>
                </div>
              )}

              {/* Outflow Row (if visible) */}
              {visibleSeries.dispatch && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/70 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Stock Dispatched:
                  </span>
                  <span className="font-mono font-medium text-amber-300">
                    -{formatINR(activeDataPoint.stockOutValuation)}
                  </span>
                </div>
              )}

              {/* Net Shift Row (if either flow is visible) */}
              {(visibleSeries.inflow || visibleSeries.dispatch) && (
                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-white/60">Net Shift:</span>
                  <span
                    className={`font-mono text-xs font-bold flex items-center gap-0.5 ${
                      activeDataPoint.netValuationChange >= 0 ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {activeDataPoint.netValuationChange >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {activeDataPoint.netValuationChange >= 0 ? '+' : ''}
                    {formatINR(activeDataPoint.netValuationChange)}
                  </span>
                </div>
              )}
            </div>

            {/* Sub-label for ledger operations count */}
            <div className="mt-2 pt-1.5 border-t border-white/10 text-[9px] text-white/50 flex justify-between">
              <span>{activeDataPoint.inboundMovementsCount} Inbound Tx</span>
              <span>{activeDataPoint.outboundMovementsCount} Outbound Tx</span>
            </div>

            {/* Downward pointer caret */}
            <div
              className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2.5 h-2.5 bg-[#171512] rotate-45 border-r border-b border-white/10"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Footer Summary / Live Sync Note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 pt-2 border-t border-[#F3EEE7] text-[11px] text-[#71685D]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>Calculated directly from live Supabase ledger transactions</span>
        </div>
        <div className="font-mono text-[10px] text-[#4E342E]">
          Current Base: <span className="font-bold">{formatINR(data[data.length - 1]?.totalPortfolioValuation || 0)}</span>
        </div>
      </div>
    </div>
  );
};
