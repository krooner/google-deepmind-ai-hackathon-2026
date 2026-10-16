import React from 'react';
import { Search, ScanLine, Plus, RotateCcw, X } from 'lucide-react';
import type { Item, ItemCategory, ItemStatus } from '../types/item.ts';
import { CATEGORY_LABELS, STATUS_LABELS } from '../types/item.ts';
import {
  computeInventoryStats,
  filterAndSearchItems,
  formatPrice,
} from '../utils/inventoryLogic.ts';
import { ItemCard } from './ItemCard.tsx';
import type { RouteView } from './Navbar.tsx';

interface HomeViewProps {
  items: Item[];
  selectedCategory: ItemCategory | 'all';
  onSelectCategory: (cat: ItemCategory | 'all') => void;
  selectedStatus: ItemStatus | 'all';
  onSelectStatus: (status: ItemStatus | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigate: (route: RouteView) => void;
  onResetSamples: () => void;
}

const CATEGORY_TABS: Array<{ key: ItemCategory | 'all'; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'clothing', label: CATEGORY_LABELS.clothing },
  { key: 'beauty', label: CATEGORY_LABELS.beauty },
  { key: 'watch_jewelry', label: CATEGORY_LABELS.watch_jewelry },
  { key: 'merch', label: CATEGORY_LABELS.merch },
  { key: 'other', label: CATEGORY_LABELS.other },
];

const STATUS_TABS: Array<{ key: ItemStatus | 'all'; label: string }> = [
  { key: 'all', label: '모든 상태' },
  { key: 'new', label: STATUS_LABELS.new },
  { key: 'in_use', label: STATUS_LABELS.in_use },
  { key: 'stored', label: STATUS_LABELS.stored },
  { key: 'archived', label: STATUS_LABELS.archived },
];

export const HomeView: React.FC<HomeViewProps> = ({
  items,
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  onNavigate,
  onResetSamples,
}) => {
  const stats = computeInventoryStats(items, '2026-10-15T12:00:00.000Z');
  const filteredItems = filterAndSearchItems(
    items,
    selectedCategory,
    searchQuery,
    selectedStatus
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Hero & Summary Strip */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-[#D4F82A] tracking-wide">
              개인 구매·보유품 통합 아카이브
            </p>
            <h1
              className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-100"
              style={{ textWrap: 'balance' }}
            >
              쇼핑몰마다 흩어진 구매 내역, 내 선반 한곳에서 확인하세요
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              주문 완료 스크린샷 한 장이면 AI가 브랜드·상품명·구매일·가격을 읽고 중복 구매 여부까지 알려줍니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate({ page: 'scan' })}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0C0D0E] bg-[#D4F82A] rounded-lg hover:bg-[#c5e91f] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ScanLine className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
              <span>주문 화면 추가</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate({ page: 'manual' })}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-200 bg-[#141619] border border-zinc-800 rounded-lg hover:bg-zinc-800/80 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>직접 추가</span>
            </button>
          </div>
        </div>

        {/* 4-Column Summary Metrics Strip (Single-level flat border, tabular numerals) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 bg-[#141619] border border-zinc-800/90 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/80">
          <div className="p-4 sm:p-5">
            <p className="text-xs text-zinc-400 mb-1">내 물건 전체</p>
            <p
              data-testid="stat-total-count"
              className="text-xl sm:text-2xl font-bold text-zinc-100 font-mono-tabular"
            >
              내 물건 {stats.totalCount}개
            </p>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-xs text-zinc-400 mb-1">최근 기록</p>
            <p
              data-testid="stat-monthly-count"
              className="text-xl sm:text-2xl font-bold text-[#D4F82A] font-mono-tabular"
            >
              이번 달 추가 {stats.addedThisMonthCount}개
            </p>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-xs text-zinc-400 mb-1">현재 활용도</p>
            <p className="text-xl sm:text-2xl font-bold text-zinc-100 font-mono-tabular">
              사용 중 {stats.activeInUseCount}개
            </p>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-xs text-zinc-400 mb-1">보유 물품 합산가 (처분 제외)</p>
            <p className="text-xl sm:text-2xl font-bold text-zinc-100 font-mono-tabular">
              {formatPrice(stats.totalValueKRW, 'KRW')}
            </p>
          </div>
        </div>
      </section>

      {/* Filter & Search Toolbar */}
      <section aria-label="카테고리 필터 및 검색" className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Interactive Category Filter Segmented Control */}
          <div
            role="group"
            aria-label="카테고리 필터"
            className="flex items-center gap-1 p-1 bg-[#141619] border border-zinc-800/90 rounded-lg overflow-x-auto"
          >
            {CATEGORY_TABS.map((tab) => {
              const active = selectedCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onSelectCategory(tab.key)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#D4F82A] text-[#0C0D0E] font-semibold'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Input & Status Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <label htmlFor="inventory-search" className="sr-only">
                내 물건 검색
              </label>
              <Search
                className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="inventory-search"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="상품명, 브랜드, 판매처, 메모 검색..."
                className="w-full pl-10 pr-9 py-2 text-sm bg-[#141619] border border-zinc-800/90 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#D4F82A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="검색어 지우기"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="shrink-0">
              <label htmlFor="status-filter" className="sr-only">
                상태별 보기
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => onSelectStatus(e.target.value as ItemStatus | 'all')}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium bg-[#141619] border border-zinc-800/90 rounded-lg text-zinc-300 focus:outline-none focus:border-[#D4F82A] cursor-pointer"
              >
                {STATUS_TABS.map((st) => (
                  <option key={st.key} value={st.key}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Items Grid or Empty State */}
      {items.length === 0 ? (
        <section className="bg-[#141619] border border-zinc-800/90 rounded-xl p-10 sm:p-14 text-center space-y-5">
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-zinc-100">
              첫 주문 화면을 올려 내 물건 목록을 시작하세요.
            </h2>
            <p className="text-sm text-zinc-400">
              무신사, 29CM, 올리브영, 네이버페이 등 어떤 쇼핑몰의 주문 완료 화면이든 스크린샷 한 장으로 정리할 수 있습니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate({ page: 'scan' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#0C0D0E] bg-[#D4F82A] rounded-lg hover:bg-[#c5e91f] transition-colors cursor-pointer"
            >
              <ScanLine className="w-4 h-4" />
              <span>AI로 주문 화면 읽기</span>
            </button>
            <button
              type="button"
              onClick={onResetSamples}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>샘플 아이템 4개 불러오기</span>
            </button>
          </div>
        </section>
      ) : filteredItems.length === 0 ? (
        <section className="bg-[#141619] border border-zinc-800/90 rounded-xl p-10 text-center space-y-4">
          <p className="text-base font-medium text-zinc-200">
            조건에 맞는 보유품이 없습니다.
          </p>
          <p className="text-sm text-zinc-400">
            선택한 카테고리나 검색어를 초기화하고 전체 목록을 확인해 보세요.
          </p>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('all');
              onSelectStatus('all');
              onSearchChange('');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0C0D0E] bg-[#D4F82A] rounded-lg hover:bg-[#c5e91f] transition-colors cursor-pointer"
          >
            필터 및 검색 초기화
          </button>
        </section>
      ) : (
        <section aria-label="보유품 목록">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onSelect={(id) => onNavigate({ page: 'detail', itemId: id })}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
