import React, { useState } from 'react';
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import type { Currency, Item, ItemCategory, ItemStatus } from '../types/item.ts';
import { PRODUCT_IMAGES } from '../data/sampleItems.ts';
import {
  findDuplicateItems,
  formatPurchaseMonth,
  validateItemInput,
} from '../utils/inventoryLogic.ts';
import type { RouteView } from './Navbar.tsx';
import {
  CATEGORY_LABELS_BY_LANG,
  STATUS_LABELS_BY_LANG,
  useLanguage,
} from '../i18n/LanguageContext.tsx';

interface ManualAddViewProps {
  existingItems: Item[];
  onAddItem: (newItem: Item) => void;
  onNavigate: (route: RouteView) => void;
}

export const ManualAddView: React.FC<ManualAddViewProps> = ({
  existingItems,
  onAddItem,
  onNavigate,
}) => {
  const { lang, localizeItem } = useLanguage();
  const isEn = lang === 'en';
  const categoryLabels = CATEGORY_LABELS_BY_LANG[lang];
  const statusLabels = STATUS_LABELS_BY_LANG[lang];

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ItemCategory>('clothing');
  const [status, setStatus] = useState<ItemStatus>('new');
  const [purchaseDate, setPurchaseDate] = useState('2026-10-15');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>('KRW');
  const [store, setStore] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const duplicates = findDuplicateItems({ brand, name }, existingItems);

  const getCategoryDefaultImage = (cat: ItemCategory): string => {
    switch (cat) {
      case 'clothing':
        return PRODUCT_IMAGES.sneakers;
      case 'beauty':
        return PRODUCT_IMAGES.beauty;
      case 'watch_jewelry':
        return PRODUCT_IMAGES.watch;
      default:
        return PRODUCT_IMAGES.tumbler;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateItemInput({ name, price, quantity }, lang);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const newItem: Item = {
      id: `item-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim() || undefined,
      category,
      purchaseDate: purchaseDate || undefined,
      price: price.trim() !== '' ? Number(price) : undefined,
      currency,
      store: store.trim() || undefined,
      quantity: Number(quantity) || 1,
      status,
      note: note.trim() || undefined,
      imageUrl: getCategoryDefaultImage(category),
      createdAt: new Date().toISOString(),
    };

    onAddItem(newItem);
  };

  return (
    <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => onNavigate({ page: 'add' })}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isEn ? 'Back to Add Methods' : '추가 방식 선택으로'}</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
          {isEn ? 'Add Item Manually' : '직접 입력하여 내 물건 추가'}
        </h1>
        <p className="text-sm text-zinc-400">
          {isEn
            ? 'Only the product name is required—fill in any other details you know.'
            : '상품명만 필수로 입력하고 나머지 정보는 알고 있는 범위에서만 기록하세요.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-[#141619] border border-zinc-800/90 rounded-xl p-6 sm:p-8 space-y-6"
      >
        {duplicates.length > 0 && (
          <div
            role="status"
            className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-lg flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="text-sm font-semibold text-amber-200">
                {isEn
                  ? `Similar item already on your shelf: ${localizeItem(duplicates[0].item).name} (Purchased ${formatPurchaseMonth(duplicates[0].item.purchaseDate, lang)})`
                  : `이미 비슷한 보유품이 있어요: ${localizeItem(duplicates[0].item).name} (${formatPurchaseMonth(duplicates[0].item.purchaseDate, lang)} 구매)`}
              </p>
              <p className="text-amber-300/80">
                {isEn
                  ? 'Check if this might be a duplicate purchase. You can still save it if you wish.'
                  : '중복 구매가 아닌지 확인해 보세요. 원하시면 그대로 저장할 수 있습니다.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label
              htmlFor="manual-name"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              {isEn ? 'Product Name (Required)' : '상품명 (필수)'}{' '}
              <span className="text-[#D4F82A]">*</span>
            </label>
            <input
              id="manual-name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder={
                isEn
                  ? 'e.g., Le Labo Santal 33 Eau de Parfum 50mL'
                  : '예: 르라보 상탈 33 오 드 퍼퓸 50mL'
              }
              className="w-full px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#D4F82A]"
            />
            {errors.name && (
              <p role="alert" className="mt-1.5 text-xs text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="manual-brand"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              {isEn ? 'Brand (Optional)' : '브랜드 (선택)'}
            </label>
            <input
              id="manual-brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder={
                isEn ? 'e.g., Le Labo, Nike, Apple' : '예: Le Labo, Nike, Apple'
              }
              className="w-full px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#D4F82A]"
            />
          </div>

          <div>
            <label
              htmlFor="manual-category"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              {isEn ? 'Category' : '카테고리'}
            </label>
            <select
              id="manual-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#D4F82A]"
            >
              {Object.entries(categoryLabels).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="manual-date"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              {isEn ? 'Purchase Date (Optional)' : '구매일 (선택)'}
            </label>
            <input
              id="manual-date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 font-mono-tabular focus:outline-none focus:border-[#D4F82A]"
            />
          </div>

          <div>
            <label
              htmlFor="manual-status"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              {isEn ? 'Current Status' : '현재 상태'}
            </label>
            <select
              id="manual-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ItemStatus)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#D4F82A]"
            >
              {Object.entries(statusLabels).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="manual-price"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              {isEn ? 'Price (Optional)' : '가격 (선택)'}
            </label>
            <div className="flex gap-2">
              <input
                id="manual-price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={isEn ? 'Enter amount' : '금액 입력'}
                className="flex-1 px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 font-mono-tabular focus:outline-none focus:border-[#D4F82A]"
              />
              <label htmlFor="manual-currency" className="sr-only">
                {isEn ? 'Currency' : '통화'}
              </label>
              <select
                id="manual-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-24 px-2.5 py-2.5 text-xs font-mono-tabular bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-200"
              >
                <option value="KRW">KRW</option>
                <option value="USD">USD</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            {errors.price && (
              <p className="mt-1 text-xs text-red-400">{errors.price}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="manual-store"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              {isEn ? 'Store (Optional)' : '구매처 (선택)'}
            </label>
            <input
              id="manual-store"
              type="text"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder={
                isEn
                  ? 'e.g., Flagship Store, Musinsa, Amazon'
                  : '예: 가로수길 플래그십 스토어, 카카오톡 선물하기'
              }
              className="w-full px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#D4F82A]"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="manual-note"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              {isEn
                ? 'Note (storage location, warranty, purpose, etc.)'
                : '메모 (보관 위치, 보증 기간, 사용 목적 등)'}
            </label>
            <textarea
              id="manual-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                isEn
                  ? 'e.g., Stored in right vanity drawer, expires 2028.03'
                  : '예: 침실 화장대 우측 칸 보관, 유통기한 2028.03까지'
              }
              className="w-full px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#D4F82A]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate({ page: 'home' })}
            className="px-4 py-2.5 text-xs font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {isEn ? 'Cancel' : '취소'}
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-[#0C0D0E] bg-[#D4F82A] rounded-lg hover:bg-[#c5e91f] transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{isEn ? 'Save to My Shelf' : '내 물건에 저장'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
