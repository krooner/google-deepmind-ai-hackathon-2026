import React from 'react';
import { Plus } from 'lucide-react';

export type RouteView =
  | { page: 'home' }
  | { page: 'add' }
  | { page: 'scan'; presetId?: string }
  | { page: 'manual' }
  | { page: 'detail'; itemId: string };

interface NavbarProps {
  currentRoute: RouteView;
  onNavigate: (route: RouteView) => void;
  onResetSamples: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onResetSamples,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0C0D0E]/95 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate({ page: 'home' });
          }}
          className="text-xl font-bold tracking-tight text-[#F4F4F5] font-display whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#D4F82A]"
        >
          OneShelf
        </a>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav
          aria-label="주요 메뉴"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400"
        >
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate({ page: 'home' });
            }}
            className={`hover:text-zinc-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              currentRoute.page === 'home' ? 'text-zinc-100 underline' : ''
            }`}
          >
            내 물건
          </a>
          <a
            href="#/add/scan"
            onClick={(e) => {
              e.preventDefault();
              onNavigate({ page: 'scan' });
            }}
            className={`hover:text-zinc-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              currentRoute.page === 'scan' ? 'text-zinc-100 underline' : ''
            }`}
          >
            주문 화면 스캔
          </a>
          <a
            href="#/add/manual"
            onClick={(e) => {
              e.preventDefault();
              onNavigate({ page: 'manual' });
            }}
            className={`hover:text-zinc-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              currentRoute.page === 'manual' ? 'text-zinc-100 underline' : ''
            }`}
          >
            직접 입력
          </a>
          <button
            type="button"
            onClick={onResetSamples}
            className="hover:text-zinc-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            샘플 데이터 복원
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onNavigate({ page: 'add' })}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#0C0D0E] bg-[#D4F82A] rounded-lg hover:bg-[#c5e91f] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4F82A]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            <span>추가</span>
          </button>
        </div>
      </div>
    </header>
  );
};
