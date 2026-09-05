import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Users, Plus } from "lucide-react";
import { ddayOf } from "./useFollowups";
import { toISO, isShared } from "./parts";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

/* 월 달력 — 구글 캘린더처럼 같은 일정은 기간만큼 「하나의 띠」로 이어서 보여 준다.
   날짜 칸을 누르면 그 날짜가 선택되고, 아래 「빠른 기록」에서 해당 날짜로 일정을 추가한다. */

const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const CAT_TAG = { leave: "휴가", training: "연수", branch: "지점" };

/* 띠 색 — 할 일은 D-day, 지점 일정은 유형색 */
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

/* 일정의 시작·종료 ISO (할 일=하루, 지점 일정=기간) */
const rangeOf = (i) => {
  if (i.category === "leave" || i.category === "training" || i.category === "branch") {
    return i.startDate ? { start: i.startDate, end: i.endDate || i.startDate } : null;
  }
  return i.followUpDate ? { start: i.followUpDate, end: i.followUpDate } : null;
};

export function MonthCalendar({ items, selectedDate, onSelectDate }) {
  const today = new Date();
  const todayIso = toISO(today);
  const [view, setView] = useState(() => {
    const base = selectedDate ? new Date(`${selectedDate}T00:00:00`) : today;
    return { y: base.getFullYear(), m: base.getMonth() };
  });

  const move = (delta) =>
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  const goToday = () => {
    setView({ y: today.getFullYear(), m: today.getMonth() });
    onSelectDate(todayIso);
  };

  /* 이 달의 날짜 칸(앞뒤 빈칸 포함)을 주 단위(7칸)로 나눈다 */
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

  /* 날짜별 단일 이벤트(달력에 표시할 것) */
  const events = useMemo(
    () => items.map((i) => ({ item: i, ...(rangeOf(i) || {}) })).filter((e) => e.start),
    [items]
  );

  /* 한 주에 걸치는 이벤트를 레인(겹치지 않게)으로 배치 */
  const lanesForWeek = (week) => {
    const cols = week.map((iso) => iso); // index→iso|null
    const inWeek = [];
    events.forEach((e) => {
      const idxs = [];
      cols.forEach((iso, idx) => {
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

  return (
    <div className={cn(CARD, "overflow-hidden")}>
      {/* 월 이동 */}
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
          <span className="hidden text-[11px] text-slate-400 sm:inline">날짜를 눌러 해당일에 일정 추가</span>
          <button onClick={goToday} className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-im-400 hover:text-im-700">
            오늘
          </button>
        </div>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60">
        {DOW.map((d, i) => (
          <div key={d} className={cn("py-2 text-center text-[11px] font-semibold tracking-wide", i === 0 ? "text-rose-400" : i === 6 ? "text-blue-400" : "text-slate-400")}>
            {d}
          </div>
        ))}
      </div>

      {/* 주 단위 렌더 */}
      <div>
        {weeks.map((week, wi) => {
          const lanes = lanesForWeek(week);
          return (
            <div key={wi} className="border-b border-slate-100 last:border-b-0">
              {/* 날짜 숫자 */}
              <div className="grid grid-cols-7">
                {week.map((iso, di) => {
                  if (!iso) return <div key={di} className="px-2 pt-1.5" />;
                  const day = Number(iso.slice(8, 10));
                  const dow = new Date(`${iso}T00:00:00`).getDay();
                  const isToday = iso === todayIso;
                  const isSel = iso === selectedDate;
                  return (
                    <button
                      key={di}
                      onClick={() => onSelectDate(iso)}
                      className={cn(
                        "group flex items-center justify-between px-2 pt-1.5 text-left",
                        isSel && "bg-im-50/60"
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
                    </button>
                  );
                })}
              </div>

              {/* 일정 띠(레인) */}
              <div className="space-y-1 px-1 pb-2 pt-1">
                {lanes.length === 0 && <div className="h-1" />}
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
