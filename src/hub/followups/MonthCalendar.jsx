import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  pointerWithin,
} from "@dnd-kit/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ddayOf } from "./useFollowups";
import { toISO, fmtDate } from "./parts";
import { cn } from "@shared/lib/format";

/* 월 달력 — 날짜 칸 안에 예정 건을 직접 보여 주고, 끌어서 다른 날짜로 옮길 수 있다.
   창구에서 「이건 다음 주로」가 잦은데 목록을 열어 날짜를 고르는 것보다 끌어 옮기는 편이 빠르다.
   키보드·터치 환경을 위해 목록의 연락일 버튼(미루기 패널)도 그대로 둔다. */

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

const itemLabel = (it) => it.memo || it.customerNo || "내용 없음";

/* 칸 안의 띠 하나 — 끌어서 다른 날짜로 옮긴다 */
const ItemBar = ({ item }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id });
  return (
    <span
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={`${item.customerNo || "(번호 미기재)"} · ${item.memo}\n끌어서 날짜 변경`}
      className={cn(
        "block cursor-grab truncate rounded-sm px-1 py-0.5 text-[10px] font-medium leading-tight active:cursor-grabbing",
        itemTone(item),
        isDragging && "opacity-30"
      )}
    >
      {itemLabel(item)}
    </span>
  );
};

/* 날짜 칸 — 띠를 받는 자리 */
const DayCell = ({ iso, day, dow, list, isToday, isSelected, onSelect }) => {
  const { setNodeRef, isOver } = useDroppable({ id: iso });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onSelect(iso)}
      className={cn(
        "min-h-[92px] cursor-pointer border-b border-r border-slate-100 p-1.5 transition-colors",
        isOver
          ? "bg-im-100/80 ring-1 ring-inset ring-im-500"
          : isSelected
          ? "bg-im-50/70 ring-1 ring-inset ring-im-400"
          : "hover:bg-slate-50"
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
        {/* 칸이 좁아 메모만 보여 준다. 고객번호는 옆 목록에서 확인·복사한다 */}
        {list.slice(0, MAX_VISIBLE).map((it) => (
          <ItemBar key={it.id} item={it} />
        ))}
        {list.length > MAX_VISIBLE && (
          <span className="block px-1 text-[10px] font-semibold text-slate-500">
            +{list.length - MAX_VISIBLE}건
          </span>
        )}
      </span>
    </div>
  );
};

export function MonthCalendar({ items, selectedDate, onSelectDate, onMoveItem }) {
  const today = new Date();
  const todayIso = toISO(today);
  const [view, setView] = useState(() => {
    const base = selectedDate ? new Date(`${selectedDate}T00:00:00`) : today;
    return { y: base.getFullYear(), m: base.getMonth() };
  });
  const [dragging, setDragging] = useState(null);

  /* 끌기 시작 전 약간의 이동을 요구해야 칸 클릭(날짜 선택)과 섞이지 않는다 */
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  /* 날짜(ISO) → 그날의 건 목록 */
  const byDate = useMemo(() => {
    const map = {};
    items.forEach((i) => {
      if (i.type === "note" || !i.followUpDate) return;
      (map[i.followUpDate] ||= []).push(i);
    });
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

  const startDow = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: startDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const handleDragEnd = ({ active, over }) => {
    setDragging(null);
    if (!over) return;
    const item = items.find((i) => i.id === active.id);
    if (!item || item.followUpDate === over.id) return;
    onMoveItem?.(active.id, over.id);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={({ active }) => setDragging(items.find((i) => i.id === active.id) ?? null)}
      onDragCancel={() => setDragging(null)}
      onDragEnd={handleDragEnd}
    >
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
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-slate-400 sm:inline">
              띠를 끌어 날짜를 옮길 수 있습니다
            </span>
            <button
              onClick={goToday}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-im-400 hover:text-im-700"
            >
              오늘
            </button>
          </div>
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
            if (day === null)
              return <div key={`e${idx}`} className="min-h-[92px] bg-slate-50/40" />;
            const cellDate = new Date(view.y, view.m, day);
            const iso = toISO(cellDate);
            return (
              <DayCell
                key={iso}
                iso={iso}
                day={day}
                dow={cellDate.getDay()}
                list={byDate[iso] ?? []}
                isToday={iso === todayIso}
                isSelected={iso === selectedDate}
                onSelect={onSelectDate}
              />
            );
          })}
        </div>
      </div>

      {/* 끌고 있는 띠 */}
      <DragOverlay dropAnimation={null}>
        {dragging && (
          <span
            className={cn(
              "block max-w-[12rem] truncate rounded-sm px-1.5 py-1 text-[10px] font-medium leading-tight shadow-lg",
              itemTone(dragging)
            )}
          >
            {itemLabel(dragging)}
          </span>
        )}
      </DragOverlay>
    </DndContext>
  );
}
