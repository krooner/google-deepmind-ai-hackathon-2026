/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import type { Item, ItemCategory, ItemStatus } from './types/item.ts';
import {
  loadItemsFromStorage,
  resetToSampleItems,
  saveItemsToStorage,
} from './utils/storage.ts';
import { Navbar, type RouteView } from './components/Navbar.tsx';
import { HomeView } from './components/HomeView.tsx';
import { AddMethodView } from './components/AddMethodView.tsx';
import { ScanAddView } from './components/ScanAddView.tsx';
import { ManualAddView } from './components/ManualAddView.tsx';
import { ItemDetailView } from './components/ItemDetailView.tsx';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext.tsx';

function parseHashToRoute(hash: string): RouteView {
  const clean = hash.replace(/^#/, '') || '/';
  if (clean === '/add') return { page: 'add' };
  if (clean.startsWith('/add/scan')) {
    const queryIdx = clean.indexOf('?');
    if (queryIdx !== -1) {
      const params = new URLSearchParams(clean.slice(queryIdx));
      const presetId = params.get('preset') || undefined;
      return { page: 'scan', presetId };
    }
    return { page: 'scan' };
  }
  if (clean === '/add/manual') return { page: 'manual' };
  if (clean.startsWith('/items/')) {
    const itemId = clean.replace('/items/', '').trim();
    return { page: 'detail', itemId };
  }
  return { page: 'home' };
}

function routeToHash(route: RouteView): string {
  switch (route.page) {
    case 'home':
      return '#/';
    case 'add':
      return '#/add';
    case 'scan':
      return route.presetId
        ? `#/add/scan?preset=${encodeURIComponent(route.presetId)}`
        : '#/add/scan';
    case 'manual':
      return '#/add/manual';
    case 'detail':
      return `#/items/${encodeURIComponent(route.itemId)}`;
  }
}

function AppContent() {
  const { lang, localizeItem } = useLanguage();
  const isEn = lang === 'en';
  const [items, setItems] = useState<Item[]>(() => loadItemsFromStorage());
  const [route, setRoute] = useState<RouteView>(() =>
    typeof window !== 'undefined'
      ? parseHashToRoute(window.location.hash)
      : { page: 'home' }
  );

  const [selectedCategory, setSelectedCategory] = useState<
    ItemCategory | 'all'
  >('all');
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | 'all'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHashToRoute(window.location.hash));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (nextRoute: RouteView) => {
    const nextHash = routeToHash(nextRoute);
    if (typeof window !== 'undefined' && window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
    setRoute(nextRoute);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const showBanner = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => {
      setBannerMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const handleAddItem = (newItem: Item) => {
    const updated = [newItem, ...items];
    setItems(updated);
    saveItemsToStorage(updated);
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSearchQuery('');
    showBanner(
      isEn
        ? `'${newItem.name}' has been added to your shelf.`
        : `'${newItem.name}' 아이템이 내 물건 목록에 추가되었습니다.`
    );
    navigate({ page: 'home' });
  };

  const handleUpdateItem = (updatedItem: Item) => {
    const updated = items.map((it) =>
      it.id === updatedItem.id ? updatedItem : it
    );
    setItems(updated);
    saveItemsToStorage(updated);
  };

  const handleDeleteItem = (id: string) => {
    const target = items.find((it) => it.id === id);
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    saveItemsToStorage(updated);
    if (target) {
      const displayName = localizeItem(target).name;
      showBanner(
        isEn
          ? `'${displayName}' has been deleted.`
          : `'${displayName}' 아이템이 삭제되었습니다.`
      );
    }
    navigate({ page: 'home' });
  };

  const handleResetSamples = () => {
    const restored = resetToSampleItems();
    setItems(restored);
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSearchQuery('');
    showBanner(
      isEn
        ? '4 default sample items have been restored.'
        : '기본 샘플 보유품 4개가 복원되었습니다.'
    );
    navigate({ page: 'home' });
  };

  const activeDetailItem =
    route.page === 'detail'
      ? items.find((it) => it.id === route.itemId)
      : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#0C0D0E] text-[#F4F4F5]">
      <Navbar
        currentRoute={route}
        onNavigate={navigate}
        onResetSamples={handleResetSamples}
      />

      {bannerMessage && (
        <div
          role="status"
          className="bg-[#141619] border-b border-[#D4F82A]/40 px-4 py-2.5 text-center text-xs font-medium text-[#D4F82A]"
        >
          {bannerMessage}
        </div>
      )}

      <main className="flex-1">
        {route.page === 'home' && (
          <HomeView
            items={items}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNavigate={navigate}
            onResetSamples={handleResetSamples}
          />
        )}

        {route.page === 'add' && <AddMethodView onNavigate={navigate} />}

        {route.page === 'scan' && (
          <ScanAddView
            existingItems={items}
            initialPresetId={route.presetId}
            onAddItem={handleAddItem}
            onNavigate={navigate}
          />
        )}

        {route.page === 'manual' && (
          <ManualAddView
            existingItems={items}
            onAddItem={handleAddItem}
            onNavigate={navigate}
          />
        )}

        {route.page === 'detail' && (
          <ItemDetailView
            item={activeDetailItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onNavigate={navigate}
          />
        )}
      </main>

      <footer className="border-t border-zinc-900 py-6 mt-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            {isEn
              ? 'OneShelf — Turn scattered purchase receipts into your personal shelf'
              : 'OneShelf — 플랫폼에 갇힌 구매 기록을 내 물건 목록으로'}
          </p>
          <p>
            {isEn
              ? 'All inventory data is safely stored in your browser local storage.'
              : '모든 보유품 데이터는 브라우저 로컬 스토리지에 안전하게 보관됩니다.'}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

