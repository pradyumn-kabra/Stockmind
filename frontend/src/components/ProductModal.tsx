"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Product, ProductRequest, ProductType, Supplier } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductRequest) => Promise<void>;
  product?: Product | null;
  suppliers: Supplier[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  suppliers,
}) => {
  const isEditing = !!product;

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [productType, setProductType] = useState<ProductType>('STANDARD');
  const [price, setPrice] = useState('0.00');
  const [quantity, setQuantity] = useState('0');
  const [unit, setUnit] = useState('units');
  const [reorderLevel, setReorderLevel] = useState('10');
  const [supplierId, setSupplierId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState('12');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setId(product.id);
      setName(product.name);
      setCategory(product.category);
      setProductType(product.productType);
      setPrice(String(product.price));
      setQuantity(String(product.quantity));
      setUnit(product.unit || 'units');
      setReorderLevel(String(product.reorderLevel));
      setSupplierId(product.supplierId || '');
      setExpiryDate(product.expiryDate || '');
      setWarrantyMonths(product.warrantyMonths !== undefined ? String(product.warrantyMonths) : '12');
    } else {
      setId('P-' + Math.floor(1000 + Math.random() * 9000));
      setName('');
      setCategory('Electronics');
      setProductType('STANDARD');
      setPrice('499.00');
      setQuantity('25');
      setUnit('pcs');
      setReorderLevel('10');
      setSupplierId(suppliers.length > 0 ? suppliers[0].id : '');
      setExpiryDate('');
      setWarrantyMonths('12');
    }
    setError(null);
  }, [product, isOpen, suppliers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(price);
    const qtyNum = parseInt(quantity, 10);
    const reorderNum = parseInt(reorderLevel, 10);

    if (!name.trim()) {
      setError('Product name cannot be empty.');
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a valid positive number.');
      return;
    }
    if (isNaN(qtyNum) || qtyNum < 0) {
      setError('Quantity must be a positive integer.');
      return;
    }
    if (productType === 'PERISHABLE' && !expiryDate) {
      setError('Expiry date is mandatory for perishable products.');
      return;
    }

    const payload: ProductRequest = {
      id: id.trim(),
      name: name.trim(),
      category: category.trim(),
      productType,
      price: priceNum,
      quantity: qtyNum,
      unit: unit.trim() || 'units',
      reorderLevel: reorderNum,
      supplierId: supplierId ? supplierId.trim() : undefined,
      expiryDate: productType === 'PERISHABLE' && expiryDate ? expiryDate : undefined,
      warrantyMonths: productType === 'ELECTRONIC' ? parseInt(warrantyMonths, 10) : undefined,
    };

    try {
      setIsSubmitting(true);
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {isEditing ? `Edit Product — ${product?.id}` : 'Create New Product'}
            </h3>
            <p className="text-xs text-slate-500">
              {isEditing ? 'Update catalog details & reorder thresholds' : 'Enter unique product metadata and assign vendor'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product ID / SKU *</label>
              <input
                type="text"
                disabled={isEditing}
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#795548] disabled:bg-slate-100 disabled:text-slate-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Type *</label>
              <select
                disabled={isEditing}
                value={productType}
                onChange={(e) => setProductType(e.target.value as ProductType)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#795548] disabled:bg-slate-100"
              >
                <option value="STANDARD">STANDARD (General Goods)</option>
                <option value="PERISHABLE">PERISHABLE (Food / Medical)</option>
                <option value="ELECTRONIC">ELECTRONIC (Appliances / Tech)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ergonomic Office Chair"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#795548]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Office, Dairy, Electronics"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#795548]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Association</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#795548]"
              >
                <option value="">-- No Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#795548] font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Quantity *</label>
              <input
                type="number"
                min="0"
                disabled={isEditing}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#795548] disabled:bg-slate-100 font-mono"
                required
              />
              {isEditing && (
                <p className="text-[10px] text-slate-400 mt-0.5">Use Movement tab to alter.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#795548] bg-white"
                required
              >
                <option value="pcs">pcs (Pieces)</option>
                <option value="kg">kg (Kilograms)</option>
                <option value="L">L (Litres)</option>
                <option value="packets">packets</option>
                <option value="boxes">boxes</option>
                <option value="bags">bags</option>
                <option value="loaves">loaves</option>
                <option value="tubs">tubs</option>
                <option value="sets">sets</option>
                <option value="kits">kits</option>
                <option value="pairs">pairs</option>
                <option value="reels">reels</option>
                <option value="units">units</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Min *</label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#795548] font-mono"
                required
              />
            </div>
          </div>

          {/* Dynamic Subclass Fields */}
          {productType === 'PERISHABLE' && (
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
              <label className="block text-xs font-bold text-amber-900">Expiry Date (Perishable Item) *</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                required
              />
              <p className="text-[11px] text-amber-700">StockMind will track shelf-life and flag expiration alerts.</p>
            </div>
          )}

          {productType === 'ELECTRONIC' && (
            <div className="p-3 bg-[#F3EEE7]/60 border border-[#E8E0D6] rounded-xl space-y-1">
              <label className="block text-xs font-bold text-[#4E342E]">Warranty Coverage (Months) *</label>
              <input
                type="number"
                min="0"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#C7A992] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#795548] bg-white font-mono"
                required
              />
              <p className="text-[11px] text-[#5D4037]">Manufacturer warranty span for RMA and support tracking.</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
