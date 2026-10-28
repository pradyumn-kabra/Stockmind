/**
 * Centralized Indian Localization & Currency Utilities for StockMind
 */

export const formatINR = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatINRCompact = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumberIN = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-IN').format(value);
};
