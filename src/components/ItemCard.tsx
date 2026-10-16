import React, { useState } from 'react';
import { Package } from 'lucide-react';
import type { Item } from '../types/item.ts';
import { formatPrice } from '../utils/inventoryLogic.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';

interface ItemCardProps {
  item: Item;
  onSelect: (id: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onSelect }) => {
  const { lang, getCategoryLabel, getStatusLabel, localizeItem } = useLanguage();
  const isEn = lang === 'en';
  const displayItem = localizeItem(item);

  const [imgError, setImgError] = useState(false);
  const displayImage = displayItem.imageUrl || displayItem.receiptImageUrl;

  const statusColorClass =
    displayItem.status === 'in_use'
      ? 'text-[#D4F82A]'
      : displayItem.status === 'new'
      ? 'text-emerald-400'
      : displayItem.status === 'stored'
      ? 'text-zinc-300'
      : 'text-zinc-500';

  return (
    <article className="group bg-[#141619] border border-zinc-800/90 rounded-xl overflow-hidden transition-transform duration-150 hover:-translate-y-0.5 hover:border-zinc-700 flex flex-col">
      <button
        type="button"
        onClick={() => onSelect(displayItem.id)}
        aria-label={
          isEn
            ? `View details for ${displayItem.brand ? `${displayItem.brand} ` : ''}${displayItem.name}`
            : `${displayItem.brand ? `${displayItem.brand} ` : ''}${displayItem.name} 상세 보기`
        }
        className="text-left flex-1 flex flex-col cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4F82A]"
      >
        {/* 4:3 Image Container with Zero-Broken-Image Fallback */}
        <div className="relative w-full aspect-[4/3] bg-[#1A1D22] overflow-hidden border-b border-zinc-800/60">
          {displayImage && !imgError ? (
            <img
              src={displayImage}
              alt={`${displayItem.brand || ''} ${displayItem.name}`.trim()}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#181B20] to-[#111317] text-zinc-500">
              <Package className="w-8 h-8 mb-2 stroke-[1.5] text-zinc-400" aria-hidden="true" />
              <span className="text-xs text-zinc-400 text-center line-clamp-1">
                {displayItem.brand || getCategoryLabel(displayItem.category)}
              </span>
            </div>
          )}
        </div>

        {/* Card Content — Zero-Pill Unboxed Metadata with Typographic Separators */}
        <div className="p-5 flex-1 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
              <span className="font-medium text-zinc-300 truncate max-w-[140px]">
                {displayItem.brand || (isEn ? 'Unbranded' : '브랜드 미기재')}
              </span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">{getCategoryLabel(displayItem.category)}</span>
              {displayItem.store && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate max-w-[90px]">{displayItem.store}</span>
                </>
              )}
            </div>

            <h3 className="text-base font-semibold text-zinc-100 leading-snug line-clamp-2 group-hover:text-[#D4F82A] transition-colors">
              {displayItem.name}
            </h3>
          </div>

          <div className="pt-3 border-t border-zinc-800/70 flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-zinc-100 font-mono-tabular">
              {formatPrice(displayItem.price, displayItem.currency, lang)}
            </span>

            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono-tabular whitespace-nowrap">
              <span>{displayItem.purchaseDate || (isEn ? 'Unknown date' : '날짜 미상')}</span>
              <span aria-hidden="true">·</span>
              <span className={`font-sans font-medium ${statusColorClass}`}>
                {getStatusLabel(displayItem.status)}
              </span>
            </div>
          </div>
        </div>
      </button>
    </article>
  );
};
