import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ddayOf } from "../followups/useFollowups";
import { cn } from "@shared/lib/format";

/* 후속 관리 미니 캘린더 — 연락일이 잡힌 메모를 날짜 위에 점으로 표시한다.
   점 색은 목록의 D-day 뱃지와 동일 규칙(지남=rose, 오늘=amber, 예정=mint).
   날짜를 누르면 그 날짜의 메모만 목록에 표시되고, 새 메모의 연락일로도 채워진다. */

const pad = (n) => String(n).padStart(2, "0");
const isoOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/* D-day → 점 색 (open 항목만 표시) */
const dotCls = (dateIso) => {
  const d = ddayOf(dateIso);
  if (d === null) return "bg-slate-300";
  if (d < 0) return "bg-rose-500";
  if (d === 0) return "bg-amber-500";
  return "bg-im-500";
};

export function FollowupCalendar({ items, selectedDate, onSelectDate }) {
  const today = new Date();
  const todayIso = isoOf(today.getFullYear(), today.getMonth(), today.getDate());
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });

  /* 날짜(ISO) → 예정(open) 메모 건수 */
  const marks = useMemo(() => {
    const map = {};
    items.forEach((i) => {
      if (!i.followUpDate || i.status !== "open") return;
      map[i.followUpDate] = (map[i.followUpDate] ?? 0) + 1;
    });
    return map;
  }, [items]);

  const move = (delta) =>
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const goToday = () => {
    setView({ y: today.getFullYear(), m: today.getMonth() });
    onSelectDate(todayIso);
  };

  /* 앞쪽 공백(전월 자리) + 이번 달 날짜 */
  const startDow = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: startDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      {/* 월 이동 헤더 */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] font-bold tabular-nums text-slate-800">
          {view.y}년 {view.m + 1}월
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={goToday}
            title="오늘로 이동"
            className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-im-700"
          >
            오늘
          </button>
          <button
            onClick={() => move(-1)}
            title="이전 달"
            className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => move(1)}
            title="다음 달"
            className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={cn(
              "py-0.5 text-center text-[9px] font-bold",
              i === 0 ? "text-rose-400" : i === 6 ? "text-blue-400" : "text-slate-400"
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e${idx}`} />;
          const iso = isoOf(view.y, view.m, day);
          const count = marks[iso] ?? 0;
          const isToday = iso === todayIso;
          const isSelected = iso === selectedDate;
          return (
            <button
              key={iso}
              onClick={() => onSelectDate(iso)}
              title={count > 0 ? `예정 메모 ${count}건` : undefined}
              className={cn(
                "flex h-9 flex-col items-center justify-center gap-0.5 rounded-md text-[11px] tabular-nums transition-colors",
                isSelected
                  ? "bg-im-600 font-bold text-white"
                  : isToday
                  ? "bg-im-50 font-bold text-im-700 hover:bg-im-100"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              {day}
              {/* 예정 메모 점 — 최대 3개 */}
              <span className="flex h-1 items-center gap-0.5">
                {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 w-1 rounded-full",
                      isSelected ? "bg-white" : dotCls(iso)
                    )}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">
        날짜를 누르면 해당 날짜의 메모만 보이고, 새 메모의 연락일로 입력됩니다. 다시 누르면 해제.
      </p>
    </div>
  );
}
