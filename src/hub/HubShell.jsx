import { Settings2, Check } from "lucide-react";
import { GlobalNav } from "@shared/components/GlobalNav";
import { cn } from "@shared/lib/format";

export const HUB_NAME = "iM 세일즈메이트";
export const HUB_SUBTITLE = "상담 옆자리를 지키는 AI 세일즈 파트너";

/* 허브 셸 — 글로벌 상단 네비 + 본문.
   홈(대시보드)은 커스텀 유지, 상단바는 GlobalNav가 담당한다.
   대시보드 편집 버튼만 페이지 액션으로 네비 우측 슬롯에 얹는다.
   wide — 달력처럼 가로가 넓어야 읽히는 화면에서 본문 폭을 넓힌다. */
export function HubShell({ children, editMode = false, onToggleEdit, wide = false }) {
  const container = wide ? "max-w-7xl" : "max-w-6xl";

  const editButton = onToggleEdit ? (
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
      <span className="hidden sm:inline">{editMode ? "편집 완료" : "대시보드 편집"}</span>
    </button>
  ) : null;

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      style={{ fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}
    >
      <GlobalNav right={editButton} />
      <main className={cn("mx-auto px-4 py-6 md:px-8 md:py-8", container)}>{children}</main>
    </div>
  );
}
