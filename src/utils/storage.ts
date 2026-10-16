import type { Item } from '../types/item.ts';
import { INITIAL_SAMPLE_ITEMS } from '../data/sampleItems.ts';

const STORAGE_KEY = 'oneshelf_inventory_items_v2';
const INITIALIZED_KEY = 'oneshelf_initialized_v2';

export function loadItemsFromStorage(): Item[] {
  if (typeof window === 'undefined') {
    return INITIAL_SAMPLE_ITEMS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const initialized = window.localStorage.getItem(INITIALIZED_KEY);

    if (!initialized || !raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_ITEMS));
      window.localStorage.setItem(INITIALIZED_KEY, 'true');
      return INITIAL_SAMPLE_ITEMS;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item: Item) => ({
        ...item,
        imageUrl: item.imageUrl?.replace(/^\/src\/assets\/images\//, '/images/'),
        receiptImageUrl: item.receiptImageUrl?.replace(/^\/src\/assets\/images\//, '/images/'),
      }));
    }
    return INITIAL_SAMPLE_ITEMS;
  } catch (err) {
    console.warn('Failed to read localStorage, using sample items:', err);
    return INITIAL_SAMPLE_ITEMS;
  }
}

export function saveItemsToStorage(items: Item[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.localStorage.setItem(INITIALIZED_KEY, 'true');
  } catch (err) {
    console.warn('Failed to write items to localStorage:', err);
  }
}

export function resetToSampleItems(): Item[] {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_ITEMS));
    window.localStorage.setItem(INITIALIZED_KEY, 'true');
  }
  return INITIAL_SAMPLE_ITEMS;
}
