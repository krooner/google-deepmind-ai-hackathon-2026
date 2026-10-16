import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trash2, Check, Package, ReceiptText } from 'lucide-react';
import type { Item, ItemCategory, ItemStatus } from '../types/item.ts';
import { formatPrice } from '../utils/inventoryLogic.ts';
import { ReceiptPreviewCard } from './ReceiptPreviewCard.tsx';
import type { RouteView } from './Navbar.tsx';
import {
  CATEGORY_LABELS_BY_LANG,
  useLanguage,
} from '../i18n/LanguageContext.tsx';

interface ItemDetailViewProps {
  item?: Item;
  onUpdateItem: (updated: Item) => void;
  onDeleteItem: (id: string) => void;
  onNavigate: (route: RouteView) => void;
}

const STATUS_OPTIONS: ItemStatus[] = ['new', 'in_use', 'stored', 'archived'];

export const ItemDetailView: React.FC<ItemDetailViewProps> = ({
  item,
  onUpdateItem,
  onDeleteItem,
  onNavigate,
}) => {
  const { lang, getCategoryLabel, getStatusLabel, localizeItem } =
    useLanguage();
  const isEn = lang === 'en';

  if (!item) {
    return (
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-14 text-center space-y-4">
        <p className="text-base text-zinc-300">
          {isEn
            ? 'Could not find the requested item.'
            : '찾으시는 물건 정보를 찾을 수 없습니다.'}
        </p>
        <button
          type="button"
          onClick={() => onNavigate({ page: 'home' })}
          className="px-4 py-2 text-xs font-semibold text-[#0C0D0E] bg-[#D4F82A] rounded-lg cursor-pointer"
        >
          {isEn ? 'Back to My Shelf' : '내 물건 목록으로 돌아가기'}
        </button>
      </div>
    );
  }

  const localized = localizeItem(item);

  const [activeMediaTab, setActiveMediaTab] = useState<'product' | 'receipt'>(
    'product'
  );
  const [status, setStatus] = useState<ItemStatus>(localized.status);
  const [note, setNote] = useState<string>(localized.note || '');
  const [brand, setBrand] = useState<string>(localized.brand || '');
  const [name, setName] = useState<string>(localized.name);
  const [category, setCategory] = useState<ItemCategory>(localized.category);
  const [purchaseDate, setPurchaseDate] = useState<string>(
    localized.purchaseDate || ''
  );
  const [store, setStore] = useState<string>(localized.store || '');
  const [price, setPrice] = useState<string>(
    localized.price !== undefined ? String(localized.price) : ''
  );
  const [isEditingMeta, setIsEditingMeta] = useState<boolean>(false);
  const [confirmingDelete, setConfirmingDelete] = useState<boolean>(false);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);

  useEffect(() => {
    const loc = localizeItem(item);
    setStatus(loc.status);
    setNote(loc.note || '');
    setBrand(loc.brand || '');
    setName(loc.name);
    setCategory(loc.category);
    setPurchaseDate(loc.purchaseDate || '');
    setStore(loc.store || '');
    setPrice(loc.price !== undefined ? String(loc.price) : '');
  }, [lang, item.id]);

  const handleStatusChange = (nextStatus: ItemStatus) => {
    setStatus(nextStatus);
    onUpdateItem({
      ...item,
      status: nextStatus,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1800);
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onUpdateItem({
      ...item,
      name: name.trim(),
      brand: brand.trim() || undefined,
      category,
      purchaseDate: purchaseDate || undefined,
      store: store.trim() || undefined,
      price: price.trim() !== '' ? Number(price) : undefined,
      status,
      note: note.trim() || undefined,
    });
    setIsEditingMeta(false);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1800);
  };

  const currentMediaUrl =
    activeMediaTab === 'receipt' && localized.receiptImageUrl
      ? localized.receiptImageUrl
      : localized.imageUrl || localized.receiptImageUrl;

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Top Navigation Back Link */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onNavigate({ page: 'home' })}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isEn ? 'Back to My Shelf' : '내 물건 목록으로'}</span>
        </button>

        {savedFeedback && (
          <span
            role="status"
            className="text-xs font-medium text-[#D4F82A] flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            {isEn
              ? 'Changes saved to your shelf'
              : '변경사항이 내 선반에 저장되었습니다'}
          </span>
        )}
      </div>

      {/* Main 2-Column Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Product Image / Original Order Screenshot Toggle */}
        <div className="lg:col-span-5 bg-[#141619] border border-zinc-800/90 rounded-xl p-5 space-y-4">
          {localized.receiptImageUrl && (
            <div
              role="group"
              aria-label={isEn ? 'Switch image view' : '이미지 보기 전환'}
              className="grid grid-cols-2 gap-1 p-1 bg-[#0C0D0E] border border-zinc-800 rounded-lg"
            >
              <button
                type="button"
                onClick={() => setActiveMediaTab('product')}
                className={`inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeMediaTab === 'product'
                    ? 'bg-[#D4F82A] text-[#0C0D0E] font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>{isEn ? 'Product Image' : '대표 이미지'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaTab('receipt')}
                className={`inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeMediaTab === 'receipt'
                    ? 'bg-[#D4F82A] text-[#0C0D0E] font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ReceiptText className="w-3.5 h-3.5" />
                <span>{isEn ? 'Order Screen' : '원본 주문 화면'}</span>
              </button>
            </div>
          )}

          <div
            className={`w-full ${
              activeMediaTab === 'receipt' ? 'min-h-[360px]' : 'aspect-[4/3]'
            } bg-[#0C0D0E] border border-zinc-800/80 rounded-lg overflow-hidden flex items-center justify-center`}
          >
            {activeMediaTab === 'receipt' && localized.receiptImageUrl ? (
              <ReceiptPreviewCard
                receiptUrl={localized.receiptImageUrl}
                altText={
                  isEn
                    ? `${localized.name} original order screen`
                    : `${localized.name} 원본 주문 화면`
                }
              />
            ) : currentMediaUrl ? (
              <img
                src={currentMediaUrl}
                alt={
                  isEn
                    ? `${localized.name} product image`
                    : `${localized.name} 대표 이미지`
                }
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-8 text-zinc-500">
                <Package className="w-10 h-10 mx-auto mb-2 stroke-[1.5]" />
                <p className="text-xs">
                  {isEn ? 'No image available' : '등록된 이미지가 없습니다'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Item Metadata, Status Selector, Memo & Actions */}
        <div className="lg:col-span-7 bg-[#141619] border border-zinc-800/90 rounded-xl p-6 sm:p-8 space-y-6">
          {/* Header Metadata */}
          <div className="space-y-2 border-b border-zinc-800/80 pb-5">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="font-semibold text-[#D4F82A]">
                {localized.brand || (isEn ? 'No Brand' : '브랜드 미기재')}
              </span>
              <span aria-hidden="true">·</span>
              <span>{getCategoryLabel(localized.category)}</span>
              <span aria-hidden="true">·</span>
              <span>
                {localized.store || (isEn ? 'Store Unspecified' : '구매처 미기재')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100">
              {localized.name}
            </h1>

            <div className="pt-2 flex flex-wrap items-baseline gap-4">
              <span className="text-2xl font-bold text-zinc-100 font-mono-tabular">
                {formatPrice(localized.price, localized.currency, lang)}
              </span>
              <span className="text-xs text-zinc-400 font-mono-tabular">
                {isEn
                  ? `Purchased: ${localized.purchaseDate || 'Unspecified'} · Qty ${localized.quantity}`
                  : `구매일: ${localized.purchaseDate || '미기재'} · 수량 ${localized.quantity}개`}
              </span>
            </div>
          </div>

          {/* Interactive Status Selector: 새것, 사용 중, 보관, 처분함 */}
          <div className="space-y-2.5">
            <label className="block text-xs font-medium text-zinc-300">
              {isEn ? 'Ownership Status' : '보유 상태 선택'}
            </label>
            <div
              role="group"
              aria-label={isEn ? 'Ownership Status' : '보유 상태 선택'}
              className="grid grid-cols-4 gap-2 p-1 bg-[#0C0D0E] border border-zinc-800 rounded-lg"
            >
              {STATUS_OPTIONS.map((st) => {
                const isSelected = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#D4F82A] text-[#0C0D0E] font-semibold'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    {getStatusLabel(st)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Memo & Optional Metadata Edit Form */}
          <form onSubmit={handleSaveDetails} className="space-y-5">
            <div>
              <label
                htmlFor="detail-note"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                {isEn
                  ? 'Personal Note (Purpose, storage location, warranty, etc.)'
                  : '개인 메모 (사용 목적, 보관 위치, 보증 기간 등)'}
              </label>
              <textarea
                id="detail-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  isEn
                    ? 'Jot down storage location, warranty expiration date, or sizing notes.'
                    : '보관 위치나 AS 보증 만료일, 사이즈 체감 등을 메모해 두세요.'
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#D4F82A]"
              />
            </div>

            {isEditingMeta && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
                <div>
                  <label
                    htmlFor="edit-brand"
                    className="block text-xs text-zinc-400 mb-1"
                  >
                    {isEn ? 'Brand' : '브랜드'}
                  </label>
                  <input
                    id="edit-brand"
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-category"
                    className="block text-xs text-zinc-400 mb-1"
                  >
                    {isEn ? 'Category' : '카테고리'}
                  </label>
                  <select
                    id="edit-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ItemCategory)}
                    className="w-full px-3 py-2 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100"
                  >
                    {Object.entries(CATEGORY_LABELS_BY_LANG[lang]).map(
                      ([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="edit-name"
                    className="block text-xs text-zinc-400 mb-1"
                  >
                    {isEn ? 'Product Name' : '상품명'}
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-date"
                    className="block text-xs text-zinc-400 mb-1"
                  >
                    {isEn ? 'Purchase Date' : '구매일'}
                  </label>
                  <input
                    id="edit-date"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 font-mono-tabular"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-price"
                    className="block text-xs text-zinc-400 mb-1"
                  >
                    {isEn ? 'Price (KRW)' : '가격 (KRW)'}
                  </label>
                  <input
                    id="edit-price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 font-mono-tabular"
                  />
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {!confirmingDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-400 bg-red-950/20 border border-red-900/40 rounded-lg hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Delete' : '삭제'}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors cursor-pointer"
                    >
                      {isEn ? 'Confirm Delete' : '정말 삭제하기'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      className="px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      {isEn ? 'Cancel' : '취소'}
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsEditingMeta((prev) => !prev)}
                  className="px-3.5 py-2 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {isEditingMeta
                    ? isEn
                      ? 'Hide Details'
                      : '상세 항목 접기'
                    : isEn
                      ? 'Edit Item Info'
                      : '상품 정보 수정'}
                </button>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-[#0C0D0E] bg-[#D4F82A] rounded-lg hover:bg-[#c5e91f] transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {isEn ? 'Save Note & Changes' : '메모 및 변경사항 저장'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

