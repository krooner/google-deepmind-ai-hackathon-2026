import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Upload,
  RefreshCw,
  AlertTriangle,
  Check,
  FileImage,
} from 'lucide-react';
import type {
  Currency,
  ExtractedItem,
  ExtractionResponse,
  Item,
  ItemCategory,
} from '../types/item.ts';
import { CATEGORY_LABELS } from '../types/item.ts';
import {
  PRODUCT_IMAGES,
  SAMPLE_RECEIPT_PRESETS,
} from '../data/sampleItems.ts';
import {
  findDuplicateItems,
  formatPurchaseMonth,
  validateItemInput,
} from '../utils/inventoryLogic.ts';
import { ReceiptPreviewCard } from './ReceiptPreviewCard.tsx';
import type { RouteView } from './Navbar.tsx';

interface ScanAddViewProps {
  existingItems: Item[];
  initialPresetId?: string;
  onAddItem: (newItem: Item) => void;
  onNavigate: (route: RouteView) => void;
}

export const ScanAddView: React.FC<ScanAddViewProps> = ({
  existingItems,
  initialPresetId,
  onAddItem,
  onNavigate,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const defaultPreset =
    SAMPLE_RECEIPT_PRESETS.find((p) => p.id === initialPresetId) ||
    SAMPLE_RECEIPT_PRESETS[0];

  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(
    defaultPreset.id
  );
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string>(
    defaultPreset.receiptDataUrl
  );
  const [productImageUrl, setProductImageUrl] = useState<string>(
    defaultPreset.productImageUrl
  );
  const [uploadedMimeType, setUploadedMimeType] =
    useState<string>('image/svg+xml');
  const [uploadedFileName, setUploadedFileName] = useState<string>(
    `${defaultPreset.id}.svg`
  );

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisSource, setAnalysisSource] = useState<'gemini' | 'fallback'>(
    'fallback'
  );
  const [fallbackNotice, setFallbackNotice] = useState<string | undefined>(
    undefined
  );

  // Form fields populated by AI extraction
  const [brand, setBrand] = useState<string>(defaultPreset.extracted.brand || '');
  const [name, setName] = useState<string>(defaultPreset.extracted.name || '');
  const [category, setCategory] = useState<ItemCategory>(
    defaultPreset.extracted.category
  );
  const [purchaseDate, setPurchaseDate] = useState<string>(
    defaultPreset.extracted.purchaseDate || '2026-10-15'
  );
  const [price, setPrice] = useState<string>(
    defaultPreset.extracted.price !== null
      ? String(defaultPreset.extracted.price)
      : ''
  );
  const [currency, setCurrency] = useState<Currency>(
    defaultPreset.extracted.currency || 'KRW'
  );
  const [store, setStore] = useState<string>(
    defaultPreset.extracted.store || ''
  );
  const [quantity, setQuantity] = useState<string>(
    String(defaultPreset.extracted.quantity || 1)
  );
  const [note, setNote] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(
    defaultPreset.extracted.confidence
  );
  const [evidence, setEvidence] = useState<string>(
    defaultPreset.extracted.evidence
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const applyExtractedItem = (item: ExtractedItem, prodImg?: string) => {
    setBrand(item.brand || '');
    setName(item.name || '');
    setCategory(item.category || 'other');
    setPurchaseDate(item.purchaseDate || '2026-10-15');
    setPrice(item.price !== null && item.price !== undefined ? String(item.price) : '');
    setCurrency(item.currency || 'KRW');
    setStore(item.store || '');
    setQuantity(String(item.quantity || 1));
    setConfidence(typeof item.confidence === 'number' ? item.confidence : 0.9);
    setEvidence(
      item.evidence || '주문 화면 내 상품명·결제금액·주문일자 영역에서 추출됨'
    );
    if (prodImg) {
      setProductImageUrl(prodImg);
    } else if (item.category === 'clothing') {
      setProductImageUrl(PRODUCT_IMAGES.sneakers);
    } else if (item.category === 'beauty') {
      setProductImageUrl(PRODUCT_IMAGES.beauty);
    } else if (item.category === 'watch_jewelry') {
      setProductImageUrl(PRODUCT_IMAGES.watch);
    } else {
      setProductImageUrl(PRODUCT_IMAGES.tumbler);
    }
    setFormErrors({});
  };

  const runReceiptAnalysis = async (params: {
    imageBase64: string;
    mimeType: string;
    presetId?: string;
    fileName?: string;
    presetProductImg?: string;
  }) => {
    setIsAnalyzing(true);
    setFallbackNotice(undefined);

    try {
      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: params.imageBase64,
          mimeType: params.mimeType,
          presetId: params.presetId,
          fileName: params.fileName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: ExtractionResponse = await response.json();
      const firstItem = data.items?.[0] || SAMPLE_RECEIPT_PRESETS[0].extracted;
      setAnalysisSource(data.source);
      setFallbackNotice(data.fallbackReason);
      applyExtractedItem(firstItem, params.presetProductImg);
    } catch {
      const fallbackPreset =
        SAMPLE_RECEIPT_PRESETS.find((p) => p.id === params.presetId) ||
        SAMPLE_RECEIPT_PRESETS[0];
      setAnalysisSource('fallback');
      setFallbackNotice(
        '네트워크 또는 API 키 제한으로 무신사 주문 완료 샘플 추출 데이터가 채워졌습니다.'
      );
      applyExtractedItem(
        fallbackPreset.extracted,
        fallbackPreset.productImageUrl
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (initialPresetId) {
      const preset = SAMPLE_RECEIPT_PRESETS.find(
        (p) => p.id === initialPresetId
      );
      if (preset) {
        setSelectedPresetId(preset.id);
        setReceiptPreviewUrl(preset.receiptDataUrl);
        setProductImageUrl(preset.productImageUrl);
        setUploadedMimeType('image/svg+xml');
        setUploadedFileName(`${preset.id}.svg`);
        applyExtractedItem(preset.extracted, preset.productImageUrl);
      }
    }
  }, [initialPresetId]);

  const handleSelectPreset = (presetId: string) => {
    const preset = SAMPLE_RECEIPT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setReceiptPreviewUrl(preset.receiptDataUrl);
    setProductImageUrl(preset.productImageUrl);
    setUploadedMimeType('image/svg+xml');
    setUploadedFileName(`${preset.id}.svg`);
    runReceiptAnalysis({
      imageBase64: preset.receiptDataUrl,
      mimeType: 'image/svg+xml',
      presetId: preset.id,
      fileName: `${preset.id}.svg`,
      presetProductImg: preset.productImageUrl,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = String(reader.result || '');
      setSelectedPresetId(undefined);
      setReceiptPreviewUrl(resultUrl);
      setUploadedMimeType(file.type || 'image/png');
      setUploadedFileName(file.name);
      runReceiptAnalysis({
        imageBase64: resultUrl,
        mimeType: file.type || 'image/png',
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const duplicates = findDuplicateItems({ brand, name }, existingItems);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateItemInput({ name, price, quantity });
    if (!validation.valid) {
      setFormErrors(validation.errors);
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
      status: 'new',
      note:
        note.trim() ||
        `AI 주문 화면 스캔으로 등록됨 (${evidence.slice(0, 60)})`,
      imageUrl: productImageUrl,
      receiptImageUrl: receiptPreviewUrl,
      createdAt: new Date().toISOString(),
    };

    onAddItem(newItem);
  };

  const confidencePercent = Math.round((confidence || 0.9) * 100);
  const needsReviewFields: string[] = [];
  if (!brand.trim()) needsReviewFields.push('브랜드');
  if (!purchaseDate.trim()) needsReviewFields.push('구매일');
  if (!price.trim()) needsReviewFields.push('가격');

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => onNavigate({ page: 'add' })}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>추가 방식 선택으로</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
            AI 주문 화면 분석 및 검토
          </h1>
          <p className="text-sm text-zinc-400">
            주문 화면에서 읽은 상품 정보를 확인하고 필요하면 수정한 뒤 내 물건에 추가하세요.
          </p>
        </div>

        {/* Sample Order Screenshot Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {SAMPLE_RECEIPT_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#D4F82A]/15 border-[#D4F82A] text-[#D4F82A]'
                    : 'bg-[#141619] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {preset.badgeText} 샘플
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Grid: Left Receipt Preview / Right Extraction Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Uploaded Order Screen Preview */}
        <div className="lg:col-span-5 bg-[#141619] border border-zinc-800/90 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200">
              업로드한 주문 화면 미리보기
            </h2>
            <span className="text-xs text-zinc-400 font-mono-tabular truncate max-w-[180px]">
              {uploadedFileName}
            </span>
          </div>

          <div className="relative w-full min-h-[360px] bg-[#0C0D0E] border border-zinc-800/80 rounded-lg overflow-hidden flex items-center justify-center">
            {receiptPreviewUrl ? (
              <ReceiptPreviewCard
                receiptUrl={receiptPreviewUrl}
                presetId={selectedPresetId}
                altText="업로드된 주문 확인 화면 미리보기"
              />
            ) : (
              <div className="text-center p-6 text-zinc-500 space-y-2">
                <FileImage className="w-10 h-10 mx-auto stroke-[1.5]" />
                <p className="text-xs">주문 완료 스크린샷을 업로드해 주세요.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-[#0C0D0E]/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
                <RefreshCw className="w-7 h-7 text-[#D4F82A] animate-spin" />
                <p className="text-sm font-semibold text-zinc-100">
                  Gemini Vision이 주문 정보를 읽고 있습니다...
                </p>
                <p className="text-xs text-zinc-400">
                  브랜드, 상품명, 결제금액, 구매일을 추출하는 중입니다.
                </p>
              </div>
            )}
          </div>

          {/* File Upload Input */}
          <div>
            <input
              ref={fileInputRef}
              id="receipt-file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-100 bg-zinc-900 border border-zinc-700/80 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#D4F82A]" />
              <span>내 기기에서 주문 스크린샷 업로드</span>
            </button>
          </div>
        </div>

        {/* Right: AI Extraction Review & Edit Form */}
        <form
          onSubmit={handleSave}
          noValidate
          className="lg:col-span-7 bg-[#141619] border border-zinc-800/90 rounded-xl p-6 sm:p-8 space-y-6"
        >
          {/* AI Confidence & Evidence Summary (Unboxed metadata, hairline border) */}
          <div className="p-4 bg-[#0C0D0E] border border-zinc-800/90 rounded-lg space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="font-semibold text-[#D4F82A] font-mono-tabular">
                  AI 신뢰도 {confidencePercent}%
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {analysisSource === 'gemini'
                    ? 'Gemini 실시간 멀티모달 분석'
                    : '주문완료 화면 구조화 추출 완료'}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {needsReviewFields.length > 0
                    ? `확인 필요: ${needsReviewFields.join(', ')}`
                    : '필수 항목 모두 인식됨'}
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              추출 근거: {evidence}
            </p>
            {fallbackNotice && (
              <p className="text-xs text-zinc-400 pt-1 border-t border-zinc-800/80">
                안내: {fallbackNotice}
              </p>
            )}
          </div>

          {/* Duplicate Detection Warning Banner */}
          {duplicates.length > 0 && (
            <div
              role="status"
              data-testid="duplicate-warning-banner"
              className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-lg flex items-start gap-3"
            >
              <AlertTriangle
                className="w-5 h-5 text-amber-400 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-1.5 text-xs">
                <p className="text-sm font-semibold text-amber-200">
                  이미 비슷한 보유품이 있어요: {duplicates[0].item.name} (
                  {formatPurchaseMonth(duplicates[0].item.purchaseDate)} 구매)
                </p>
                <p className="text-amber-300/80 leading-relaxed">
                  내 선반에 동일한 브랜드·모델로 추정되는 아이템이 등록되어 있습니다. 재구매이거나 다른 사이즈·옵션이라면 그대로 추가하셔도 됩니다.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate({ page: 'detail', itemId: duplicates[0].item.id })
                  }
                  className="text-xs font-semibold text-[#D4F82A] hover:underline underline-offset-4 cursor-pointer"
                >
                  기존 보유품 상세 정보 확인하기 →
                </button>
              </div>
            </div>
          )}

          {/* Extracted Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="scan-brand"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                브랜드
              </label>
              <input
                id="scan-brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="예: Nike, Aesop, Casio"
                className="w-full px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#D4F82A]"
              />
            </div>

            <div>
              <label
                htmlFor="scan-category"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                카테고리
              </label>
              <select
                id="scan-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#D4F82A]"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="scan-name"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                상품명 <span className="text-[#D4F82A]">*</span>
              </label>
              <input
                id="scan-name"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name) {
                    setFormErrors((prev) => ({ ...prev, name: '' }));
                  }
                }}
                placeholder="상품명을 입력하세요"
                className="w-full px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#D4F82A]"
              />
              {formErrors.name && (
                <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="scan-date"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                구매일
              </label>
              <input
                id="scan-date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 font-mono-tabular focus:outline-none focus:border-[#D4F82A]"
              />
            </div>

            <div>
              <label
                htmlFor="scan-store"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                판매처 (구매 플랫폼)
              </label>
              <input
                id="scan-store"
                type="text"
                value={store}
                onChange={(e) => setStore(e.target.value)}
                placeholder="예: 무신사, 올리브영, 29CM"
                className="w-full px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#D4F82A]"
              />
            </div>

            <div>
              <label
                htmlFor="scan-price"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                구매 가격
              </label>
              <div className="flex gap-2">
                <input
                  id="scan-price"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="139000"
                  className="flex-1 px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 font-mono-tabular focus:outline-none focus:border-[#D4F82A]"
                />
                <label htmlFor="scan-currency" className="sr-only">
                  통화 선택
                </label>
                <select
                  id="scan-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-24 px-2.5 py-2.5 text-xs font-mono-tabular bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-[#D4F82A]"
                >
                  <option value="KRW">KRW (원)</option>
                  <option value="USD">USD ($)</option>
                  <option value="OTHER">기타</option>
                </select>
              </div>
              {formErrors.price && (
                <p className="mt-1 text-xs text-red-400">{formErrors.price}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="scan-quantity"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                수량
              </label>
              <input
                id="scan-quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 font-mono-tabular focus:outline-none focus:border-[#D4F82A]"
              />
              {formErrors.quantity && (
                <p className="mt-1 text-xs text-red-400">
                  {formErrors.quantity}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="scan-note"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                보관 위치 · 메모 (선택)
              </label>
              <input
                id="scan-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="예: 드레스룸 2번째 서랍, 보증기간 2028년 10월까지"
                className="w-full px-3.5 py-2.5 text-sm bg-[#0C0D0E] border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#D4F82A]"
              />
            </div>
          </div>

          {/* Bottom Actions: 다시 분석 & 내 물건에 추가 */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() =>
                runReceiptAnalysis({
                  imageBase64: receiptPreviewUrl,
                  mimeType: uploadedMimeType,
                  presetId: selectedPresetId,
                  fileName: uploadedFileName,
                  presetProductImg: productImageUrl,
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-200 bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`}
              />
              <span>다시 분석</span>
            </button>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-[#0C0D0E] bg-[#D4F82A] rounded-lg hover:bg-[#c5e91f] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>내 물건에 추가</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
