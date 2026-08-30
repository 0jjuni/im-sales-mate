import { cn } from "@shared/lib/format";

/* 모듈 공용 본문 탭 — 사이드바 대신 상단 밑줄형 탭으로 앱 전체와 통일.
   accent = 모듈 아이덴티티 색(활성 밑줄). Tailwind 정적 클래스라 맵으로 보관. */
const ACTIVE_BORDER = {
  im: "border-im-500",
  amber: "border-amber-500",
  fuchsia: "border-fuchsia-500",
  violet: "border-violet-500",
  sky: "border-sky-500",
  rose: "border-rose-500",
};
const BADGE = {
  im: "bg-im-100 text-im-700",
  amber: "bg-amber-100 text-amber-700",
  fuchsia: "bg-fuchsia-100 text-fuchsia-700",
  violet: "bg-violet-100 text-violet-700",
  sky: "bg-sky-100 text-sky-700",
  rose: "bg-rose-100 text-rose-700",
};

export function ModuleTabs({ items, activeId, onSelect, accent = "im" }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-1 gap-y-0 border-b border-slate-200 print:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const on = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors",
              on ? cn(ACTIVE_BORDER[accent], "text-slate-900") : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {item.label}
            {item.highlight && !on && (
              <span className={cn("rounded-sm px-1 py-0.5 text-[9px] font-bold", BADGE[accent])}>세일즈</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
