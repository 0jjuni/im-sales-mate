import { Building2, Settings2, Check, CalendarDays } from "lucide-react";
import { cn } from "@shared/lib/format";

/* 서비스명 미정 — 확정되면 이 상수만 변경하면 전체에 반영된다. */
export const HUB_NAME = "SalesBridge";
export const HUB_SUBTITLE = "PB·VM 상품 상담 허브";

const Brand = () => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-im-500 to-im-700 shadow-sm">
      <Building2 className="h-5 w-5 text-white" />
    </div>
    <div className="min-w-0 leading-tight">
      <div className="text-[14px] font-black text-slate-900">{HUB_NAME}</div>
      <div className="text-[10px] text-slate-500">{HUB_SUBTITLE}</div>
    </div>
  </div>
);

const TodayBadge = () => {
  const now = new Date();
  const day = ["일", "월", "화", "수", "목", "금", "토"][now.getDay()];
  return (
    <span className="hidden items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 sm:inline-flex">
      <CalendarDays className="h-3.5 w-3.5" />
      {now.getMonth() + 1}. {now.getDate()} ({day})
    </span>
  );
};

/* 허브 상단바 — 단일 스크롤 대시보드라 네비게이션 탭 없이
   브랜드 + 오늘 날짜 + 대시보드 편집만 남긴 미니멀 헤더.
   (섹션이 별도 라우트로 분리되면 그때 탭/메뉴를 다시 검토) */
export function HubShell({ children, editMode = false, onToggleEdit }) {
  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      style={{ fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}
    >
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="h-1 bg-gradient-to-r from-im-500 via-im-400 to-im-lime" />
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          <Brand />
          <div className="flex items-center gap-2">
            <TodayBadge />
            {onToggleEdit && (
              <button
                onClick={onToggleEdit}
                className={cn(
                  "flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  editMode
                    ? "border-im-500 bg-im-500 text-white hover:bg-im-600"
                    : "border-slate-300 bg-white text-slate-600 hover:border-im-400 hover:text-im-700"
                )}
              >
                {editMode ? <Check className="h-3.5 w-3.5" /> : <Settings2 className="h-3.5 w-3.5" />}
                {editMode ? "편집 완료" : "대시보드 편집"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
