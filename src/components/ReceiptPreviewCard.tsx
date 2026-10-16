import React from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';

export interface ReceiptMeta {
  platform: string;
  orderNo: string;
  orderDate: string;
  brand: string;
  brandEn?: string;
  productName: string;
  productNameEn?: string;
  optionText: string;
  optionTextEn?: string;
  priceText: string;
  priceTextEn?: string;
  productThumbUrl?: string;
}

export const RECEIPT_META_BY_ID: Record<string, ReceiptMeta> = {
  'musinsa-nike-af1': {
    platform: 'MUSINSA STORE',
    orderNo: '20261015-8849201',
    orderDate: '2026-10-15',
    brand: 'Nike (나이키)',
    brandEn: 'Nike',
    productName: "Nike Air Force 1 '07 Low White",
    productNameEn: "Nike Air Force 1 '07 Low White",
    optionText: '270mm / 화이트 (CW2288-111)',
    optionTextEn: '270mm / White (CW2288-111)',
    priceText: '139,000원',
    priceTextEn: '₩139,000',
    productThumbUrl: '/src/assets/images/item_sneakers_nike_1792126826477.jpg',
  },
  'oliveyoung-aesop-handbalm': {
    platform: 'OLIVE YOUNG',
    orderNo: 'OY-20261014-30912',
    orderDate: '2026-10-14',
    brand: 'Aesop (이솝)',
    brandEn: 'Aesop',
    productName: '레저렉션 아로마틱 핸드 밤 75mL',
    productNameEn: 'Resurrection Aromatique Hand Balm 75mL',
    optionText: '75mL 단품 / 선물포장',
    optionTextEn: '75mL Single / Gift Wrapped',
    priceText: '39,000원',
    priceTextEn: '₩39,000',
    productThumbUrl: '/src/assets/images/item_beauty_aesop_1792126826478.jpg',
  },
  '29cm-stanley-tumbler': {
    platform: '29CM ORDER',
    orderNo: 'ORD-20261015-7741',
    orderDate: '2026-10-15',
    brand: 'Fellow (펠로우)',
    brandEn: 'Fellow',
    productName: '카터 무브 머그 텀블러 16oz 매트블랙',
    productNameEn: 'Carter Move Mug Tumbler 16oz Matte Black',
    optionText: '473mL / 매트블랙',
    optionTextEn: '473mL / Matte Black',
    priceText: '52,000원',
    priceTextEn: '₩52,000',
    productThumbUrl: '/src/assets/images/item_merch_tumbler_1792126826698.jpg',
  },
  'seed-casio-watch-receipt': {
    platform: '29CM ORDER',
    orderNo: 'ORD-20260512-1192',
    orderDate: '2026-05-12',
    brand: 'Casio (카시오)',
    brandEn: 'Casio',
    productName: 'G-MW B5000D-1 풀메탈 실버 디지털 워치',
    productNameEn: 'G-MW B5000D-1 Full Metal Silver Digital Watch',
    optionText: '실버 스테인리스 스틸 / 정품 보증서 포함',
    optionTextEn: 'Silver Stainless Steel / Warranty Card Included',
    priceText: '680,000원',
    priceTextEn: '₩680,000',
    productThumbUrl: '/src/assets/images/item_watch_casio_1792126827185.jpg',
  },
  'seed-stanley-tumbler-receipt': {
    platform: 'NAVER PAY ORDER',
    orderNo: 'NP-20261009-55182',
    orderDate: '2026-10-09',
    brand: 'Stanley (스탠리)',
    brandEn: 'Stanley',
    productName: '퀜처 H2.0 플로우스테이트 텀블러 887mL 차콜',
    productNameEn: 'Quencher H2.0 FlowState Tumbler 887mL Charcoal',
    optionText: '887mL / 차콜 매트',
    optionTextEn: '887mL / Charcoal Matte',
    priceText: '49,000원',
    priceTextEn: '₩49,000',
    productThumbUrl: '/src/assets/images/item_merch_tumbler_1792126826698.jpg',
  },
};

interface ReceiptPreviewCardProps {
  receiptUrl?: string;
  presetId?: string;
  altText?: string;
}

export const ReceiptPreviewCard: React.FC<ReceiptPreviewCardProps> = ({
  receiptUrl,
  presetId,
  altText,
}) => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const resolvedAltText =
    altText ||
    (isEn
      ? 'Uploaded order confirmation preview'
      : '업로드된 주문 확인 화면 미리보기');

  // Resolve structured order receipt if it matches a preset or uses preset:// scheme
  const resolvedPresetKey =
    presetId ||
    (receiptUrl?.startsWith('preset://')
      ? receiptUrl.replace('preset://', '')
      : undefined);

  const meta = resolvedPresetKey
    ? RECEIPT_META_BY_ID[resolvedPresetKey]
    : undefined;

  if (meta) {
    const brandDisplay = isEn ? meta.brandEn || meta.brand : meta.brand;
    const productDisplay = isEn
      ? meta.productNameEn || meta.productName
      : meta.productName;
    const optionDisplay = isEn
      ? meta.optionTextEn || meta.optionText
      : meta.optionText;
    const priceDisplay = isEn
      ? meta.priceTextEn || meta.priceText
      : meta.priceText;

    return (
      <div
        role="img"
        aria-label={resolvedAltText}
        className="w-full bg-[#101216] p-3.5 sm:p-4 flex flex-col justify-between text-left select-none"
      >
        <div className="bg-[#171A20] border border-zinc-800 rounded-xl p-4 space-y-3.5 shadow-inner">
          {/* Store Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <span className="text-sm font-bold tracking-tight text-zinc-100 font-display">
              {meta.platform}
            </span>
            <span className="text-[11px] font-semibold text-[#D4F82A]">
              {isEn ? 'Order Confirmation' : '주문완료 확인서'}
            </span>
          </div>

          {/* Order Confirmation Status */}
          <div className="space-y-0.5">
            <p className="text-[11px] text-zinc-400">
              {isEn
                ? 'Your order has been successfully placed.'
                : '주문이 정상적으로 완료되었습니다.'}
            </p>
            <p className="text-base font-bold text-zinc-100">
              {isEn ? 'Paid · Preparing Shipment' : '결제 완료 · 배송 준비중'}
            </p>
          </div>

          {/* Order Metadata */}
          <div className="py-2 border-y border-zinc-800/80 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">
                {isEn ? 'Order No.' : '주문번호'}
              </span>
              <span className="text-zinc-200 font-mono-tabular">
                {meta.orderNo}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">
                {isEn ? 'Order Date' : '주문일자'}
              </span>
              <span className="text-zinc-200 font-mono-tabular">
                {meta.orderDate}
              </span>
            </div>
          </div>

          {/* Ordered Product Box */}
          <div className="bg-[#111318] border border-zinc-800/90 rounded-lg p-3 space-y-2.5">
            <div className="flex items-start gap-3">
              {meta.productThumbUrl && (
                <img
                  src={meta.productThumbUrl}
                  alt={productDisplay}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-md object-cover shrink-0 border border-zinc-800"
                />
              )}
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#D4F82A]">
                  {brandDisplay}
                </p>
                <p className="text-xs sm:text-sm font-bold text-zinc-100 leading-snug">
                  {productDisplay}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {isEn ? `Option: ${optionDisplay}` : `옵션: ${optionDisplay}`}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between text-xs">
              <span className="text-zinc-400">{isEn ? 'Qty 1' : '수량 1개'}</span>
              <span className="text-sm font-bold text-zinc-100 font-mono-tabular">
                {priceDisplay}
              </span>
            </div>
          </div>

          {/* Total Payment Footer */}
          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              {isEn ? 'Total Paid' : '총 결제금액'}
            </span>
            <span className="text-base sm:text-lg font-bold text-[#D4F82A] font-mono-tabular">
              {priceDisplay}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 text-center pt-2.5">
          {isEn
            ? 'E-Receipt · OneShelf AI Multimodal Scan Source'
            : '전자영수증 · OneShelf AI Multimodal 스캔 원본'}
        </p>
      </div>
    );
  }

  if (receiptUrl) {
    return (
      <img
        src={receiptUrl}
        alt={resolvedAltText}
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain"
      />
    );
  }

  return null;
};
