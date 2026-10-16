export type ItemCategory = 'clothing' | 'beauty' | 'watch_jewelry' | 'merch' | 'other';

export type ItemStatus = 'new' | 'in_use' | 'stored' | 'archived';

export type Currency = 'KRW' | 'USD' | 'OTHER';

export type Item = {
  id: string;
  name: string;
  brand?: string;
  category: ItemCategory;
  purchaseDate?: string;
  price?: number;
  currency: Currency;
  store?: string;
  quantity: number;
  status: ItemStatus;
  note?: string;
  imageUrl?: string;
  receiptImageUrl?: string;
  createdAt: string;
};

export type ExtractedItem = {
  brand: string | null;
  name: string | null;
  category: ItemCategory;
  purchaseDate: string | null;
  price: number | null;
  currency: Currency;
  store: string | null;
  quantity: number;
  confidence: number;
  evidence: string;
};

export type ExtractionResponse = {
  items: ExtractedItem[];
  source: 'gemini' | 'fallback';
  fallbackReason?: string;
};

export type DuplicateMatch = {
  item: Item;
  similarity: number;
  reason: 'exact' | 'similar';
};

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  clothing: '의류',
  beauty: '뷰티',
  watch_jewelry: '시계·주얼리',
  merch: '생활용품',
  other: '기타',
};

export const STATUS_LABELS: Record<ItemStatus, string> = {
  new: '새것',
  in_use: '사용 중',
  stored: '보관',
  archived: '처분함',
};
