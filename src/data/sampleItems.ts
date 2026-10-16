import type { ExtractedItem, Item } from '../types/item.ts';

export const PRODUCT_IMAGES = {
  sneakers: '/src/assets/images/item_sneakers_nike_1792126826477.jpg',
  beauty: '/src/assets/images/item_beauty_aesop_1792126826478.jpg',
  watch: '/src/assets/images/item_watch_casio_1792126827185.jpg',
  tumbler: '/src/assets/images/item_merch_tumbler_1792126826698.jpg',
};

function createReceiptSvgDataUrl(config: {
  platform: string;
  orderNo: string;
  orderDate: string;
  brand: string;
  productName: string;
  optionText: string;
  priceText: string;
  accentColor: string;
}): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760" width="600" height="760">
    <rect width="600" height="760" fill="#121316"/>
    <rect x="28" y="28" width="544" height="704" rx="16" fill="#181A1F" stroke="#2A2D35" stroke-width="1.5"/>
    <rect x="28" y="28" width="544" height="76" rx="16" fill="#1E2028"/>
    <text x="60" y="75" fill="#F4F4F5" font-family="sans-serif" font-size="22" font-weight="700">${config.platform}</text>
    <text x="540" y="74" fill="${config.accentColor}" font-family="monospace" font-size="14" font-weight="700" text-anchor="end">주문완료 확인서</text>

    <text x="60" y="152" fill="#A1A1AA" font-family="sans-serif" font-size="14">주문이 정상적으로 완료되었습니다.</text>
    <text x="60" y="186" fill="#F4F4F5" font-family="sans-serif" font-size="26" font-weight="700">결제 완료 · 배송 준비중</text>

    <line x1="60" y1="216" x2="540" y2="216" stroke="#272A30" stroke-width="1"/>

    <text x="60" y="254" fill="#71717A" font-family="sans-serif" font-size="13">주문번호</text>
    <text x="180" y="254" fill="#E4E4E7" font-family="monospace" font-size="14">${config.orderNo}</text>

    <text x="60" y="286" fill="#71717A" font-family="sans-serif" font-size="13">주문일자</text>
    <text x="180" y="286" fill="#E4E4E7" font-family="monospace" font-size="14">${config.orderDate}</text>

    <rect x="60" y="322" width="480" height="196" rx="12" fill="#121316" stroke="#272A30" stroke-width="1"/>
    <text x="88" y="364" fill="${config.accentColor}" font-family="sans-serif" font-size="14" font-weight="700">${config.brand}</text>
    <text x="88" y="398" fill="#F4F4F5" font-family="sans-serif" font-size="20" font-weight="700">${config.productName}</text>
    <text x="88" y="432" fill="#A1A1AA" font-family="sans-serif" font-size="14">옵션: ${config.optionText}</text>
    <text x="88" y="482" fill="#F4F4F5" font-family="monospace" font-size="22" font-weight="700">${config.priceText}</text>
    <text x="512" y="482" fill="#A1A1AA" font-family="sans-serif" font-size="14" text-anchor="end">수량 1개</text>

    <line x1="60" y1="556" x2="540" y2="556" stroke="#272A30" stroke-width="1"/>
    <text x="60" y="598" fill="#A1A1AA" font-family="sans-serif" font-size="15">총 결제금액</text>
    <text x="540" y="600" fill="${config.accentColor}" font-family="monospace" font-size="26" font-weight="700" text-anchor="end">${config.priceText}</text>

    <text x="60" y="676" fill="#52525B" font-family="sans-serif" font-size="12">전자영수증 · OneShelf AI Multimodal OCR 호환 이미지</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_RECEIPT_PRESETS: Array<{
  id: string;
  label: string;
  badgeText: string;
  description: string;
  receiptDataUrl: string;
  productImageUrl: string;
  extracted: ExtractedItem;
}> = [
  {
    id: 'musinsa-nike-af1',
    label: '무신사 주문완료 화면 (중복 감지 데모)',
    badgeText: '무신사 · 스니커즈',
    description: '이미 보유 중인 Nike Air Force 1과 유사한 상품을 스캔해 중복 구매 경고를 확인합니다.',
    receiptDataUrl: 'preset://musinsa-nike-af1',
    productImageUrl: PRODUCT_IMAGES.sneakers,
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
  {
    id: 'oliveyoung-aesop-handbalm',
    label: '올리브영 주문완료 화면 (뷰티 재구매)',
    badgeText: '올리브영 · 뷰티',
    description: '화장품·핸드케어 구매 내역에서 브랜드, 용량, 구매일, 결제 금액을 자동 추출합니다.',
    receiptDataUrl: 'preset://oliveyoung-aesop-handbalm',
    productImageUrl: PRODUCT_IMAGES.beauty,
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
  {
    id: '29cm-stanley-tumbler',
    label: '29CM 주문완료 화면 (신규 생활용품)',
    badgeText: '29CM · 라이프',
    description: '중복이 없는 신규 생활용품 주문 화면을 스캔하여 바로 내 선반에 등록합니다.',
    receiptDataUrl: 'preset://29cm-stanley-tumbler',
    productImageUrl: PRODUCT_IMAGES.tumbler,
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
];

export const INITIAL_SAMPLE_ITEMS: Item[] = [
  {
    id: 'seed-nike-af1',
    brand: 'Nike',
    name: "Nike Air Force 1 '07",
    category: 'clothing',
    purchaseDate: '2025-10-18',
    price: 139000,
    currency: 'KRW',
    store: '무신사',
    quantity: 1,
    status: 'in_use',
    note: '270mm 화이트. 현관 신발장 2단 보관, 방수 스프레이 시공 완료.',
    imageUrl: PRODUCT_IMAGES.sneakers,
    receiptImageUrl: 'preset://musinsa-nike-af1',
    createdAt: '2025-10-18T11:20:00.000Z',
  },
  {
    id: 'seed-aesop-balm',
    brand: 'Aesop',
    name: '레저렉션 아로마틱 핸드 밤 75mL',
    category: 'beauty',
    purchaseDate: '2026-10-04',
    price: 39000,
    currency: 'KRW',
    store: '올리브영',
    quantity: 1,
    status: 'in_use',
    note: '개봉일 2026.10.05 · 개봉 후 12개월 이내 사용 권장. 데스크 우측 트레이에 배치.',
    imageUrl: PRODUCT_IMAGES.beauty,
    receiptImageUrl: 'preset://oliveyoung-aesop-handbalm',
    createdAt: '2026-10-04T14:10:00.000Z',
  },
  {
    id: 'seed-casio-watch',
    brand: 'Casio',
    name: 'G-MW B5000D-1 풀메탈 실버 디지털 워치',
    category: 'watch_jewelry',
    purchaseDate: '2026-05-12',
    price: 680000,
    currency: 'KRW',
    store: '29CM',
    quantity: 1,
    status: 'stored',
    note: '정품 보증서 및 여분 코 3개 드레스룸 서랍 1칸에 보관 중. 무상보증 2028.05까지.',
    imageUrl: PRODUCT_IMAGES.watch,
    receiptImageUrl: 'preset://seed-casio-watch-receipt',
    createdAt: '2026-05-12T09:40:00.000Z',
  },
  {
    id: 'seed-stanley-tumbler',
    brand: 'Stanley',
    name: '퀜처 H2.0 플로우스테이트 텀블러 887mL 차콜',
    category: 'merch',
    purchaseDate: '2026-10-09',
    price: 49000,
    currency: 'KRW',
    store: '네이버 브랜드스토어',
    quantity: 1,
    status: 'new',
    note: '사무실 비치용으로 구매. 주방 상부장 텀블러 존에 미개봉 보관.',
    imageUrl: PRODUCT_IMAGES.tumbler,
    receiptImageUrl: 'preset://seed-stanley-tumbler-receipt',
    createdAt: '2026-10-09T18:05:00.000Z',
  },
];
