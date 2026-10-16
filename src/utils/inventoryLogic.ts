import type { Currency, DuplicateMatch, Item, ItemCategory, ItemStatus } from '../types/item.ts';

const BRAND_SYNONYMS: Record<string, string> = {
  나이키: 'nike',
  이솝: 'aesop',
  카시오: 'casio',
  스탠리: 'stanley',
  애플: 'apple',
  르라보: 'lelabo',
  무신사스탠다드: 'musinsastandard',
  아디다스: 'adidas',
  뉴발란스: 'newbalance',
  에어포스: 'airforce',
  에어포스1: 'airforce1',
  레저렉션: 'resurrection',
  아로마틱: 'aromatique',
  '핸드 밤': 'hand balm',
  핸드밤: 'handbalm',
  퀜처: 'quencher',
  텀블러: 'tumbler',
};

export function normalizeText(text?: string | null): string {
  if (!text) return '';
  let lowered = text.toLowerCase().trim();
  for (const [kor, eng] of Object.entries(BRAND_SYNONYMS)) {
    lowered = lowered.replaceAll(kor, eng);
  }
  return lowered
    .replace(/['"’‘`()[\]\-_/.·,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeItem(brand?: string | null, name?: string | null): string[] {
  const combined = `${normalizeText(brand)} ${normalizeText(name)}`.trim();
  if (!combined) return [];
  const rawTokens = combined.split(' ').filter((t) => t.length > 0);
  // Deduplicate tokens
  return Array.from(new Set(rawTokens));
}

export function calculateSimilarity(
  candidate: { brand?: string | null; name?: string | null },
  existing: { brand?: string | null; name?: string | null }
): { score: number; reason: 'exact' | 'similar' | 'none' } {
  const candNorm = `${normalizeText(candidate.brand)} ${normalizeText(candidate.name)}`.trim();
  const existNorm = `${normalizeText(existing.brand)} ${normalizeText(existing.name)}`.trim();

  if (!candNorm || !existNorm) {
    return { score: 0, reason: 'none' };
  }

  if (candNorm === existNorm) {
    return { score: 1, reason: 'exact' };
  }

  const candNameNorm = normalizeText(candidate.name).replace(/\s+/g, '');
  const existNameNorm = normalizeText(existing.name).replace(/\s+/g, '');
  if (candNameNorm.length >= 4 && existNameNorm.length >= 4) {
    if (candNameNorm === existNameNorm) {
      return { score: 0.95, reason: 'exact' };
    }
    if (candNameNorm.includes(existNameNorm) || existNameNorm.includes(candNameNorm)) {
      return { score: 0.82, reason: 'similar' };
    }
  }

  const candTokens = tokenizeItem(candidate.brand, candidate.name);
  const existTokens = tokenizeItem(existing.brand, existing.name);

  if (candTokens.length === 0 || existTokens.length === 0) {
    return { score: 0, reason: 'none' };
  }

  let matched = 0;
  for (const ct of candTokens) {
    if (
      existTokens.some(
        (et) => et === ct || (ct.length >= 3 && et.length >= 3 && (et.includes(ct) || ct.includes(et)))
      )
    ) {
      matched += 1;
    }
  }

  const denominator = Math.min(candTokens.length, existTokens.length);
  const overlapRatio = matched / denominator;

  if (overlapRatio >= 0.85 && matched >= 2) {
    return { score: Number(overlapRatio.toFixed(2)), reason: 'exact' };
  }
  if (overlapRatio >= 0.5 && matched >= 2) {
    return { score: Number(overlapRatio.toFixed(2)), reason: 'similar' };
  }

  return { score: Number(overlapRatio.toFixed(2)), reason: 'none' };
}

export function findDuplicateItems(
  candidate: { brand?: string | null; name?: string | null },
  existingItems: Item[],
  excludeId?: string
): DuplicateMatch[] {
  if (!candidate.name || !candidate.name.trim()) return [];

  const matches: DuplicateMatch[] = [];
  for (const item of existingItems) {
    if (excludeId && item.id === excludeId) continue;
    if (item.status === 'archived') continue;

    const { score, reason } = calculateSimilarity(candidate, item);
    if (reason !== 'none' && score >= 0.5) {
      matches.push({
        item,
        similarity: score,
        reason,
      });
    }
  }

  return matches.sort((a, b) => b.similarity - a.similarity);
}

export function filterAndSearchItems(
  items: Item[],
  category: ItemCategory | 'all',
  query: string,
  statusFilter: ItemStatus | 'all' = 'all'
): Item[] {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    if (category !== 'all' && item.category !== category) {
      return false;
    }
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    const searchable = [
      item.name,
      item.brand || '',
      item.store || '',
      item.note || '',
      item.purchaseDate || '',
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(normalizedQuery);
  });
}

export function computeInventoryStats(items: Item[], referenceDateIso?: string) {
  const refPrefix = (referenceDateIso || new Date().toISOString()).slice(0, 7); // YYYY-MM
  const totalCount = items.length;

  const addedThisMonthCount = items.filter((item) => {
    const createdPrefix = item.createdAt ? item.createdAt.slice(0, 7) : '';
    const purchasePrefix = item.purchaseDate ? item.purchaseDate.slice(0, 7) : '';
    return createdPrefix === refPrefix || purchasePrefix === refPrefix;
  }).length;

  const activeInUseCount = items.filter((item) => item.status === 'in_use').length;

  const totalValueKRW = items.reduce((acc, item) => {
    if (!item.price || item.status === 'archived') return acc;
    const rate = item.currency === 'USD' ? 1380 : 1;
    return acc + item.price * (item.quantity || 1) * rate;
  }, 0);

  return {
    totalCount,
    addedThisMonthCount,
    activeInUseCount,
    totalValueKRW,
  };
}

export function validateItemInput(
  input: {
    name?: string | null;
    price?: number | string | null;
    quantity?: number | string | null;
  },
  lang: 'ko' | 'en' = 'ko'
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!input.name || !input.name.trim()) {
    errors.name =
      lang === 'en' ? 'Please enter a product name.' : '상품명을 입력해 주세요.';
  }

  if (input.price !== undefined && input.price !== null && input.price !== '') {
    const numericPrice = typeof input.price === 'string' ? Number(input.price) : input.price;
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      errors.price =
        lang === 'en'
          ? 'Price must be a number of 0 or greater.'
          : '가격은 0 이상의 숫자여야 합니다.';
    }
  }

  if (input.quantity !== undefined && input.quantity !== null && input.quantity !== '') {
    const numericQty = typeof input.quantity === 'string' ? Number(input.quantity) : input.quantity;
    if (Number.isNaN(numericQty) || numericQty < 1 || !Number.isInteger(numericQty)) {
      errors.quantity =
        lang === 'en'
          ? 'Quantity must be an integer of 1 or greater.'
          : '수량은 1 이상의 정수여야 합니다.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatPrice(
  price?: number | null,
  currency: Currency = 'KRW',
  lang: 'ko' | 'en' = 'ko'
): string {
  if (price === undefined || price === null || Number.isNaN(price)) {
    return lang === 'en' ? 'Price TBD' : '가격 미정';
  }
  if (currency === 'KRW') {
    return lang === 'en'
      ? `₩${price.toLocaleString('en-US')}`
      : `${price.toLocaleString('ko-KR')}원`;
  }
  if (currency === 'USD') {
    return `$${price.toLocaleString('en-US')}`;
  }
  return `${price.toLocaleString(lang === 'en' ? 'en-US' : 'ko-KR')} ${currency}`;
}

export function formatPurchaseMonth(
  dateStr?: string | null,
  lang: 'ko' | 'en' = 'ko'
): string {
  if (!dateStr) return lang === 'en' ? 'Unknown date' : '구매일 미상';
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[1]}`;
  }
  return dateStr;
}
