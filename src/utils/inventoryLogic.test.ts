import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSimilarity,
  computeInventoryStats,
  filterAndSearchItems,
  findDuplicateItems,
  formatPrice,
  formatPurchaseMonth,
  validateItemInput,
} from './inventoryLogic.ts';
import type { Item } from '../types/item.ts';

const MOCK_ITEMS: Item[] = [
  {
    id: 'item-1',
    brand: 'Nike',
    name: "Air Force 1 '07 White",
    category: 'clothing',
    purchaseDate: '2025-10-12',
    price: 139000,
    currency: 'KRW',
    store: '무신사',
    quantity: 1,
    status: 'in_use',
    note: '데일리 화이트 스니커즈',
    createdAt: '2025-10-12T09:00:00.000Z',
  },
  {
    id: 'item-2',
    brand: 'Aesop',
    name: '레저렉션 아로마틱 핸드 밤 75mL',
    category: 'beauty',
    purchaseDate: '2026-10-03',
    price: 39000,
    currency: 'KRW',
    store: '올리브영',
    quantity: 1,
    status: 'in_use',
    note: '침대 협탁 보관',
    createdAt: '2026-10-03T12:00:00.000Z',
  },
  {
    id: 'item-3',
    brand: 'Casio',
    name: 'G-MW B5000 풀메탈 실버 디지털 워치',
    category: 'watch_jewelry',
    purchaseDate: '2026-04-19',
    price: 680000,
    currency: 'KRW',
    store: '29CM',
    quantity: 1,
    status: 'stored',
    note: '보증서 박스 내 동봉 (2028.04 만료)',
    createdAt: '2026-04-19T15:30:00.000Z',
  },
];

test('duplicate detection identifies exact and bilingual similar items', () => {
  const exactMatches = findDuplicateItems(
    { brand: 'Nike', name: 'Air Force 1 07' },
    MOCK_ITEMS
  );
  assert.equal(exactMatches.length, 1);
  assert.equal(exactMatches[0].item.id, 'item-1');

  const koreanBrandMatch = findDuplicateItems(
    { brand: '나이키', name: '에어포스 1 07 화이트' },
    MOCK_ITEMS
  );
  assert.equal(koreanBrandMatch.length, 1);
  assert.equal(koreanBrandMatch[0].item.id, 'item-1');

  const nonMatch = findDuplicateItems(
    { brand: 'Le Labo', name: 'Santal 33 Eau de Parfum' },
    MOCK_ITEMS
  );
  assert.equal(nonMatch.length, 0);
});

test('calculateSimilarity returns high score for matching product names', () => {
  const result = calculateSimilarity(
    { brand: 'Aesop', name: '레저렉션 아로마틱 핸드 밤' },
    { brand: '이솝', name: '레저렉션 아로마틱 핸드 밤 75mL' }
  );
  assert.ok(result.score >= 0.75);
  assert.notEqual(result.reason, 'none');
});

test('filterAndSearchItems filters by category, status, and keyword query', () => {
  const clothingOnly = filterAndSearchItems(MOCK_ITEMS, 'clothing', '');
  assert.equal(clothingOnly.length, 1);
  assert.equal(clothingOnly[0].brand, 'Nike');

  const storeSearch = filterAndSearchItems(MOCK_ITEMS, 'all', '올리브영');
  assert.equal(storeSearch.length, 1);
  assert.equal(storeSearch[0].id, 'item-2');

  const storedOnly = filterAndSearchItems(MOCK_ITEMS, 'all', '', 'stored');
  assert.equal(storedOnly.length, 1);
  assert.equal(storedOnly[0].id, 'item-3');
});

test('computeInventoryStats calculates monthly additions and KRW total accurately', () => {
  const stats = computeInventoryStats(MOCK_ITEMS, '2026-10-15T10:00:00.000Z');
  assert.equal(stats.totalCount, 3);
  assert.equal(stats.addedThisMonthCount, 1);
  assert.equal(stats.activeInUseCount, 2);
  assert.equal(stats.totalValueKRW, 139000 + 39000 + 680000);
});

test('validateItemInput enforces required product name and positive numbers', () => {
  const emptyCheck = validateItemInput({ name: '   ', price: 10000, quantity: 1 });
  assert.equal(emptyCheck.valid, false);
  assert.ok(emptyCheck.errors.name);

  const negativePrice = validateItemInput({ name: '테스트 상품', price: -500, quantity: 1 });
  assert.equal(negativePrice.valid, false);
  assert.ok(negativePrice.errors.price);

  const validCheck = validateItemInput({ name: '나이키 에어포스 1', price: 139000, quantity: 1 });
  assert.equal(validCheck.valid, true);
});

test('formatPrice and formatPurchaseMonth format display strings cleanly in KO and EN', () => {
  assert.equal(formatPrice(139000, 'KRW'), '139,000원');
  assert.equal(formatPrice(139000, 'KRW', 'en'), '₩139,000');
  assert.equal(formatPrice(undefined, 'KRW', 'en'), 'Price TBD');
  assert.equal(formatPurchaseMonth('2025-10-12'), '2025.10');
  assert.equal(formatPurchaseMonth(undefined, 'en'), 'Unknown date');

  const emptyEn = validateItemInput({ name: '', price: -10, quantity: 0 }, 'en');
  assert.equal(emptyEn.valid, false);
  assert.equal(emptyEn.errors.name, 'Please enter a product name.');
});


