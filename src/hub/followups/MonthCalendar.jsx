import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Users, Plus } from "lucide-react";
import { ddayOf } from "./useFollowups";
import { toISO, isShared } from "./parts";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

/* 월 달력 — 구글 캘린더처럼 같은 일정은 기간만큼 「하나의 띠」로 이어서 보여 준다.
   날짜를 클릭하거나 드래그(예: 10~11일)하면 그 날짜/기간으로 일정 추가 팝업이 열린다. */

const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const CAT_TAG = { leave: "휴가", training: "연수", branch: "지점" };

const barTone = (item) => {
  if (item.status === "done") return "bg-slate-100 text-slate-400 line-through";
  if (item.category === "leave") return "bg-teal-100 text-teal-800";
  if (item.category === "training") return "bg-indigo-100 text-indigo-800";
  if (item.category === "branch") return "bg-sky-100 text-sky-800";
  const d = ddayOf(item.followUpDate);
  if (d === null) return "bg-slate-100 text-slate-600";
  if (d < 0) return "bg-rose-100 text-rose-700";
  if (d === 0) return "bg-amber-100 text-amber-800";
  return "bg-im-100 text-im-800";
};

const barLabel = (item) => {
  const tag = CAT_TAG[item.category];
  if (tag) return `${tag} ${item.staffName || ""}`.trim();
  return item.memo || item.customerNo || "내용 없음";
};

const rangeOf = (i) => {
  if (i.category === "leave" || i.category === "training" || i.category === "branch") {
    return i.startDate ? { start: i.startDate, end: i.endDate || i.startDate } : null;
  }
  return i.followUpDate ? { start: i.followUpDate, end: i.followUpDate } : null;
};

export function MonthCalendar({ items, onPickRange }) {
  const today = new Date();
  const todayIso = toISO(today);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [drag, setDrag] = useState(null); // { start, end }

  /* 드래그 종료(마우스 업) → 선택 기간으로 추가 팝업 열기 */
  useEffect(() => {
    if (!drag) return;
    const onUp = () => {
      const lo = drag.start <= drag.end ? drag.start : drag.end;
      const hi = drag.start <= drag.end ? drag.end : drag.start;
      onPickRange?.(lo, hi);
      setDrag(null);
    };
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, [drag, onPickRange]);

  const move = (delta) =>
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  const goToday = () => setView({ y: today.getFullYear(), m: today.getMonth() });

  const weeks = useMemo(() => {
    const startDow = new Date(view.y, view.m, 1).getDay();
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const cells = [
      ...Array.from({ length: startDow }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => toISO(new Date(view.y, view.m, i + 1))),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    const out = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [view]);

  const events = useMemo(
    () => items.map((i) => ({ item: i, ...(rangeOf(i) || {}) })).filter((e) => e.start),
    [items]
  );

  const lanesForWeek = (week) => {
    const inWeek = [];
    events.forEach((e) => {
      const idxs = [];
      week.forEach((iso, idx) => {
        if (iso && iso >= e.start && iso <= e.end) idxs.push(idx);
      });
      if (idxs.length) inWeek.push({ ...e, colStart: idxs[0], span: idxs[idxs.length - 1] - idxs[0] + 1 });
    });
    inWeek.sort((a, b) => a.colStart - b.colStart || (a.start < b.start ? -1 : 1));
    const lanes = [];
    inWeek.forEach((e) => {
      let lane = lanes.find((L) => L[L.length - 1].colStart + L[L.length - 1].span <= e.colStart);
      if (!lane) {
        lane = [];
        lanes.push(lane);
      }
      lane.push(e);
    });
    return lanes;
  };

  const inDrag = (iso) => {
    if (!drag || !iso) return false;
    const lo = drag.start <= drag.end ? drag.start : drag.end;
    const hi = drag.start <= drag.end ? drag.end : drag.start;
    return iso >= lo && iso <= hi;
  };

  return (
    <div className={cn(CARD, "select-none overflow-hidden")}>
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
        <div className="flex items-center gap-1">
          <button onClick={() => move(-1)} aria-label="이전 달" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[7.5rem] text-center text-[16.5px] font-bold tabular-nums text-slate-900">
            {view.y}년 {view.m + 1}월
          </span>
          <button onClick={() => move(1)} aria-label="다음 달" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] text-slate-400 sm:inline">날짜 클릭·드래그로 일정 추가</span>
          <button onClick={goToday} className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-im-400 hover:text-im-700">
            오늘
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60">
        {DOW.map((d, i) => (
          <div key={d} className={cn("py-2 text-center text-[11px] font-semibold tracking-wide", i === 0 ? "text-rose-400" : i === 6 ? "text-blue-400" : "text-slate-400")}>
            {d}
          </div>
        ))}
      </div>

      <div>
        {weeks.map((week, wi) => {
          const lanes = lanesForWeek(week);
          return (
            <div key={wi} className="flex min-h-[128px] flex-col border-b border-slate-100 last:border-b-0">
              {/* 날짜 숫자(드래그 선택 영역) */}
              <div className="grid grid-cols-7">
                {week.map((iso, di) => {
                  if (!iso) return <div key={di} className="px-2 pt-1.5" />;
                  const day = Number(iso.slice(8, 10));
                  const dow = new Date(`${iso}T00:00:00`).getDay();
                  const isToday = iso === todayIso;
                  return (
                    <div
                      key={di}
                      onMouseDown={() => setDrag({ start: iso, end: iso })}
                      onMouseEnter={() => setDrag((d) => (d ? { ...d, end: iso } : d))}
                      className={cn(
                        "group flex cursor-pointer items-center justify-between px-2 pt-1.5",
                        inDrag(iso) && "bg-im-100/70"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1 text-[12.5px] tabular-nums",
                          isToday ? "bg-im-600 font-bold text-white" : dow === 0 ? "text-rose-500" : dow === 6 ? "text-blue-500" : "text-slate-700"
                        )}
                      >
                        {day}
                      </span>
                      <Plus className="h-3 w-3 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  );
                })}
              </div>

              {/* 일정 띠(레인) */}
              <div className="flex-1 space-y-1 px-1 pb-2 pt-1">
                {lanes.map((lane, li) => (
                  <div key={li} className="grid grid-cols-7 gap-x-1">
                    {lane.map((e) => {
                      const shared = isShared(e.item);
                      return (
                        <span
                          key={e.item.id}
                          style={{ gridColumn: `${e.colStart + 1} / span ${e.span}` }}
                          title={`${shared ? "[지점 공유] " : ""}${barLabel(e.item)}${e.item.memo ? ` · ${e.item.memo}` : ""}`}
                          className={cn(
                            "truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-tight",
                            barTone(e.item),
                            shared && "border-l-2 border-teal-500"
                          )}
                        >
                          {shared && <Users className="mr-0.5 inline h-2.5 w-2.5 align-[-1px]" />}
                          {barLabel(e.item)}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
