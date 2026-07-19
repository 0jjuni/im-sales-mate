import { cn } from "@shared/lib/format";

/* 사이드바용 — 오늘 날짜 + 영업일 표시 */
export const DateBadge = () => {
  const now = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = days[now.getDay()];
  const dateStr = `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}`;
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const hour = now.getHours();
  const isBusinessHours = !isWeekend && hour >= 9 && hour < 16;

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 bg-stone-50 rounded-sm border border-stone-100">
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            isBusinessHours ? "bg-emerald-500" : "bg-stone-400"
          )}
        />
        <span className="text-[10px] font-semibold text-stone-700">
          {isBusinessHours ? "영업 중" : isWeekend ? "주말" : "영업 외"}
        </span>
      </div>
      <div className="w-px h-3 bg-stone-200" />
      <span className="text-[10px] text-stone-600 flex-1">
        {dayName} · {dateStr}
      </span>
    </div>
  );
};
