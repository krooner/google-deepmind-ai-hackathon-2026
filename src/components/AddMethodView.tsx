import React from 'react';
import { ScanLine, PenLine, ArrowLeft, ArrowRight } from 'lucide-react';
import { SAMPLE_RECEIPT_PRESETS } from '../data/sampleItems.ts';
import type { RouteView } from './Navbar.tsx';

interface AddMethodViewProps {
  onNavigate: (route: RouteView) => void;
}

export const AddMethodView: React.FC<AddMethodViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onNavigate({ page: 'home' })}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>내 물건 목록으로 돌아가기</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
          새 물건을 어떤 방식으로 등록할까요?
        </h1>
        <p className="text-sm sm:text-base text-zinc-400">
          주문 완료 화면 캡처가 있다면 AI가 브랜드·상품명·가격·구매일을 자동으로 읽어 옵니다.
        </p>
      </div>

      {/* 2 Primary Method Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: AI Scan (Recommended) */}
        <button
          type="button"
          onClick={() => onNavigate({ page: 'scan' })}
          className="group text-left bg-[#141619] border border-[#D4F82A]/50 hover:border-[#D4F82A] rounded-xl p-6 sm:p-8 flex flex-col justify-between gap-6 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4F82A]"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-lg bg-[#D4F82A]/15 text-[#D4F82A] flex items-center justify-center">
                <ScanLine className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#D4F82A] tracking-wide">
                추천 · Gemini Vision
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-zinc-100 group-hover:text-[#D4F82A] transition-colors">
                AI로 주문 화면 읽기
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                무신사, 올리브영, 29CM, 쿠팡, 네이버페이 등 주문 완료 화면이나 이메일 스크린샷을 올리면 상품 정보를 자동으로 구조화합니다.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-[#D4F82A]">
            <span>스크린샷 업로드 또는 샘플 체험하기</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        {/* Card 2: Direct Manual Input */}
        <button
          type="button"
          onClick={() => onNavigate({ page: 'manual' })}
          className="group text-left bg-[#141619] border border-zinc-800/90 hover:border-zinc-600 rounded-xl p-6 sm:p-8 flex flex-col justify-between gap-6 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4F82A]"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-lg bg-zinc-800/80 text-zinc-200 flex items-center justify-center">
                <PenLine className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-zinc-400">
                빠른 수기 등록
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-zinc-100 group-hover:text-white transition-colors">
                직접 입력하기
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                영수증이나 주문 캡처가 없는 오프라인 구매품·선물 받은 물건도 상품명만 입력하면 10초 만에 내 선반에 기록할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-300 group-hover:text-zinc-100">
            <span>직접 입력 폼 열기</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>
      </div>

      {/* Quick Demo Presets Strip */}
      <section className="pt-4 border-t border-zinc-800/80 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-zinc-200">
            준비된 주문 화면 스크린샷으로 10초 데모 체험하기
          </h3>
          <p className="text-xs text-zinc-400">
            스크린샷 파일이 없어도 아래 주문서 샘플을 선택하면 AI 추출 및 중복 구매 감지를 바로 테스트할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_RECEIPT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onNavigate({ page: 'scan', presetId: preset.id })}
              className="text-left p-4 bg-[#141619] border border-zinc-800/90 hover:border-[#D4F82A]/60 rounded-xl transition-colors space-y-1.5 cursor-pointer"
            >
              <p className="text-xs font-medium text-[#D4F82A]">
                {preset.badgeText}
              </p>
              <p className="text-sm font-semibold text-zinc-100 line-clamp-1">
                {preset.label}
              </p>
              <p className="text-xs text-zinc-400 line-clamp-2">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
