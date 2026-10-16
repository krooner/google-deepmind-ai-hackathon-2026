import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ExtractedItem, Item, ItemCategory, ItemStatus } from '../types/item.ts';

export type Language = 'ko' | 'en';

const LANGUAGE_STORAGE_KEY = 'oneshelf_language';

export const CATEGORY_LABELS_BY_LANG: Record<Language, Record<ItemCategory, string>> = {
  ko: {
    clothing: '의류',
    beauty: '뷰티',
    watch_jewelry: '시계·주얼리',
    merch: '생활용품',
    other: '기타',
  },
  en: {
    clothing: 'Clothing',
    beauty: 'Beauty',
    watch_jewelry: 'Watches & Jewelry',
    merch: 'Lifestyle',
    other: 'Other',
  },
};

export const STATUS_LABELS_BY_LANG: Record<Language, Record<ItemStatus, string>> = {
  ko: {
    new: '새것',
    in_use: '사용 중',
    stored: '보관',
    archived: '처분함',
  },
  en: {
    new: 'New',
    in_use: 'In Use',
    stored: 'Stored',
    archived: 'Archived',
  },
};

interface SeedTranslation {
  name: Record<Language, string>;
  store: Record<Language, string>;
  note: Record<Language, string>;
}

const SEED_ITEM_TRANSLATIONS: Record<string, SeedTranslation> = {
  'seed-nike-af1': {
    name: {
      ko: "Nike Air Force 1 '07",
      en: "Nike Air Force 1 '07",
    },
    store: {
      ko: '무신사',
      en: 'Musinsa',
    },
    note: {
      ko: '270mm 화이트. 현관 신발장 2단 보관, 방수 스프레이 시공 완료.',
      en: '270mm White. Stored on 2nd shelf of entryway shoe rack, waterproof spray applied.',
    },
  },
  'seed-aesop-balm': {
    name: {
      ko: '레저렉션 아로마틱 핸드 밤 75mL',
      en: 'Resurrection Aromatique Hand Balm 75mL',
    },
    store: {
      ko: '올리브영',
      en: 'Olive Young',
    },
    note: {
      ko: '개봉일 2026.10.05 · 개봉 후 12개월 이내 사용 권장. 데스크 우측 트레이에 배치.',
      en: 'Opened 2026.10.05 · Recommended use within 12 months. Placed on right desk tray.',
    },
  },
  'seed-casio-watch': {
    name: {
      ko: 'G-MW B5000D-1 풀메탈 실버 디지털 워치',
      en: 'G-MW B5000D-1 Full Metal Silver Digital Watch',
    },
    store: {
      ko: '29CM',
      en: '29CM',
    },
    note: {
      ko: '정품 보증서 및 여분 코 3개 드레스룸 서랍 1칸에 보관 중. 무상보증 2028.05까지.',
      en: 'Authentic warranty card & 3 extra links stored in dressing room drawer #1. Warranty until 2028.05.',
    },
  },
  'seed-stanley-tumbler': {
    name: {
      ko: '퀜처 H2.0 플로우스테이트 텀블러 887mL 차콜',
      en: 'Quencher H2.0 FlowState Tumbler 887mL Charcoal',
    },
    store: {
      ko: '네이버 브랜드스토어',
      en: 'Naver Brand Store',
    },
    note: {
      ko: '사무실 비치용으로 구매. 주방 상부장 텀블러 존에 미개봉 보관.',
      en: 'Purchased for office desk use. Stored unopened in upper kitchen cabinet tumbler zone.',
    },
  },
};

export interface PresetTranslation {
  label: string;
  badgeText: string;
  description: string;
  extracted: ExtractedItem;
}

export const PRESET_TRANSLATIONS: Record<string, Record<Language, PresetTranslation>> = {
  'musinsa-nike-af1': {
    ko: {
      label: '무신사 주문완료 화면 (중복 감지 데모)',
      badgeText: '무신사 · 스니커즈',
      description: '이미 보유 중인 Nike Air Force 1과 유사한 상품을 스캔해 중복 구매 경고를 확인합니다.',
      extracted: {
        brand: 'Nike',
        name: "Nike Air Force 1 '07 Low White",
        category: 'clothing',
        purchaseDate: '2026-10-15',
        price: 139000,
        currency: 'KRW',
        store: '무신사',
        quantity: 1,
        confidence: 0.96,
        evidence: "상단 'MUSINSA STORE' 헤더, 주문일자 '2026-10-15', 상품명 'Nike Air Force 1 '07 Low White', 결제금액 '139,000원' 확인",
      },
    },
    en: {
      label: 'Musinsa Order Screen (Duplicate Alert Demo)',
      badgeText: 'Musinsa · Sneakers',
      description: 'Scan an item similar to the Nike Air Force 1 already on your shelf to test duplicate purchase detection.',
      extracted: {
        brand: 'Nike',
        name: "Nike Air Force 1 '07 Low White",
        category: 'clothing',
        purchaseDate: '2026-10-15',
        price: 139000,
        currency: 'KRW',
        store: 'Musinsa',
        quantity: 1,
        confidence: 0.96,
        evidence: "Verified top 'MUSINSA STORE' header, order date '2026-10-15', product 'Nike Air Force 1 '07 Low White', and total '₩139,000'",
      },
    },
  },
  'oliveyoung-aesop-handbalm': {
    ko: {
      label: '올리브영 주문완료 화면 (뷰티 재구매)',
      badgeText: '올리브영 · 뷰티',
      description: '화장품·핸드케어 구매 내역에서 브랜드, 용량, 구매일, 결제 금액을 자동 추출합니다.',
      extracted: {
        brand: 'Aesop',
        name: '레저렉션 아로마틱 핸드 밤 75mL',
        category: 'beauty',
        purchaseDate: '2026-10-14',
        price: 39000,
        currency: 'KRW',
        store: '올리브영',
        quantity: 1,
        confidence: 0.95,
        evidence: "'OLIVE YOUNG' 주문확인서에서 브랜드 'Aesop', 상품명 '레저렉션 아로마틱 핸드 밤 75mL', 금액 '39,000원' 추출",
      },
    },
    en: {
      label: 'Olive Young Order Screen (Beauty Repurchase)',
      badgeText: 'Olive Young · Beauty',
      description: 'Automatically extract brand, volume, purchase date, and payment amount from beauty order history.',
      extracted: {
        brand: 'Aesop',
        name: 'Resurrection Aromatique Hand Balm 75mL',
        category: 'beauty',
        purchaseDate: '2026-10-14',
        price: 39000,
        currency: 'KRW',
        store: 'Olive Young',
        quantity: 1,
        confidence: 0.95,
        evidence: "Extracted brand 'Aesop', product 'Resurrection Aromatique Hand Balm 75mL', and amount '₩39,000' from 'OLIVE YOUNG' confirmation",
      },
    },
  },
  '29cm-stanley-tumbler': {
    ko: {
      label: '29CM 주문완료 화면 (신규 생활용품)',
      badgeText: '29CM · 라이프',
      description: '중복이 없는 신규 생활용품 주문 화면을 스캔하여 바로 내 선반에 등록합니다.',
      extracted: {
        brand: 'Fellow',
        name: '카터 무브 머그 텀블러 16oz 매트블랙',
        category: 'merch',
        purchaseDate: '2026-10-15',
        price: 52000,
        currency: 'KRW',
        store: '29CM',
        quantity: 1,
        confidence: 0.94,
        evidence: "'29CM ORDER' 화면 내 브랜드 'Fellow', 상품명 '카터 무브 머그 텀블러 16oz 매트블랙', 결제금액 '52,000원' 확인",
      },
    },
    en: {
      label: '29CM Order Screen (New Lifestyle Item)',
      badgeText: '29CM · Lifestyle',
      description: 'Scan a brand-new lifestyle purchase with no duplicates and add it directly to your shelf.',
      extracted: {
        brand: 'Fellow',
        name: 'Carter Move Mug Tumbler 16oz Matte Black',
        category: 'merch',
        purchaseDate: '2026-10-15',
        price: 52000,
        currency: 'KRW',
        store: '29CM',
        quantity: 1,
        confidence: 0.94,
        evidence: "Verified brand 'Fellow', product 'Carter Move Mug Tumbler 16oz Matte Black', and payment '₩52,000' in '29CM ORDER' screen",
      },
    },
  },
};

export function localizeItem(item: Item, lang: Language): Item {
  const seed = SEED_ITEM_TRANSLATIONS[item.id];
  if (!seed) return item;

  const otherLang: Language = lang === 'ko' ? 'en' : 'ko';
  const name = item.name === seed.name[otherLang] ? seed.name[lang] : item.name;
  const store = item.store === seed.store[otherLang] ? seed.store[lang] : item.store;
  const note = item.note === seed.note[otherLang] ? seed.note[lang] : item.note;

  return {
    ...item,
    name,
    store,
    note,
  };
}

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  getCategoryLabel: (cat: ItemCategory) => string;
  getStatusLabel: (status: ItemStatus) => string;
  localizeItem: (item: Item) => Item;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function loadInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ko';
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'en' || saved === 'ko') {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return 'ko';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => loadInitialLanguage());

  const setLang = (next: Language) => {
    setLangState(next);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      } catch {
        // ignore storage errors
      }
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.title =
        lang === 'en'
          ? 'OneShelf — Personal Purchase & Inventory Archive'
          : 'OneShelf — 구매·보유품 통합 관리';
    }
  }, [lang]);

  const value: LanguageContextValue = {
    lang,
    setLang,
    getCategoryLabel: (cat: ItemCategory) => CATEGORY_LABELS_BY_LANG[lang][cat],
    getStatusLabel: (status: ItemStatus) => STATUS_LABELS_BY_LANG[lang][status],
    localizeItem: (item: Item) => localizeItem(item, lang),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
