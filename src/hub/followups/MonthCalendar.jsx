import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ddayOf } from "./useFollowups";
import { toISO } from "./parts";
import { cn } from "@shared/lib/format";

/* 월 달력 — 날짜 칸 안에 예정 건을 직접 보여 준다.
   허브의 미니 캘린더는 점만 찍지만, 관리 화면에서는 무슨 건인지 바로 읽혀야 한다. */

const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const MAX_VISIBLE = 3; // 칸 안에 직접 보여 줄 건수. 넘으면 「+n건」

/* 예정 건의 상태별 색 — 목록의 D-day 배지와 같은 규칙 */
const itemTone = (item) => {
  if (item.status === "done") return "bg-slate-100 text-slate-400 line-through";
  const d = ddayOf(item.followUpDate);
  if (d === null) return "bg-slate-100 text-slate-600";
  if (d < 0) return "bg-rose-100 text-rose-700";
  if (d === 0) return "bg-amber-100 text-amber-800";
  return "bg-im-100 text-im-800";
};

export function MonthCalendar({ items, selectedDate, onSelectDate }) {
  const today = new Date();
  const todayIso = toISO(today);
  const [view, setView] = useState(() => {
    const base = selectedDate ? new Date(`${selectedDate}T00:00:00`) : today;
    return { y: base.getFullYear(), m: base.getMonth() };
  });

  /* 날짜(ISO) → 그날의 건 목록 */
  const byDate = useMemo(() => {
    const map = {};
    items.forEach((i) => {
      if (i.type === "note" || !i.followUpDate) return;
      (map[i.followUpDate] ||= []).push(i);
    });
    /* 같은 날 안에서는 예정 먼저, 완료를 뒤로 */
    Object.values(map).forEach((list) =>
      list.sort((a, b) => (a.status === b.status ? 0 : a.status === "done" ? 1 : -1))
    );
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

  /* 앞 공백(전월) + 이번 달 + 뒤 공백(다음 달) — 6주 그리드로 높이를 고정 */
  const startDow = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: startDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {/* 월 이동 */}
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => move(-1)}
            aria-label="이전 달"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[7rem] text-center text-[15px] font-bold tabular-nums text-slate-900">
            {view.y}년 {view.m + 1}월
          </span>
          <button
            onClick={() => move(1)}
            aria-label="다음 달"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={goToday}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-im-400 hover:text-im-700"
        >
          오늘
        </button>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={cn(
              "py-1.5 text-center text-[11px] font-bold",
              i === 0 ? "text-rose-500" : i === 6 ? "text-blue-500" : "text-slate-500"
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 칸 */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e${idx}`} className="min-h-[92px] bg-slate-50/40" />;
          const iso = toISO(new Date(view.y, view.m, day));
          const list = byDate[iso] ?? [];
          const isToday = iso === todayIso;
          const isSelected = iso === selectedDate;
          const dow = new Date(view.y, view.m, day).getDay();

          return (
            <button
              key={iso}
              onClick={() => onSelectDate(iso)}
              className={cn(
                "min-h-[92px] border-b border-r border-slate-100 p-1.5 text-left align-top transition-colors",
                isSelected ? "bg-im-50/70 ring-1 ring-inset ring-im-400" : "hover:bg-slate-50"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[11px] tabular-nums",
                  isToday
                    ? "bg-im-600 font-bold text-white"
                    : dow === 0
                    ? "text-rose-500"
                    : dow === 6
                    ? "text-blue-500"
                    : "text-slate-700"
                )}
              >
                {day}
              </span>

              <span className="mt-1 block space-y-0.5">
                {list.slice(0, MAX_VISIBLE).map((it) => (
                  <span
                    key={it.id}
                    title={`${it.customerNo || "(번호 미기재)"} · ${it.memo}`}
                    className={cn(
                      "block truncate rounded-sm px-1 py-0.5 text-[10px] font-medium leading-tight",
                      itemTone(it)
                    )}
                  >
                    {it.customerNo || "번호 미기재"}
                    {it.memo ? ` ${it.memo}` : ""}
                  </span>
                ))}
                {list.length > MAX_VISIBLE && (
                  <span className="block px-1 text-[10px] font-semibold text-slate-500">
                    +{list.length - MAX_VISIBLE}건
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
