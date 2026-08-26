import { useEffect, useMemo, useState } from "react";
import { CalendarDays, StickyNote, Search, X, ShieldAlert, Lock, Users, PlusCircle, CalendarClock } from "lucide-react";
import { HubShell } from "../HubShell";
import { HubLink } from "@shared/components/HubLink";
import { useFollowups } from "./useFollowups";
import { MonthCalendar } from "./MonthCalendar";
import { FollowupRow, FollowupForm, PrivacyNotice, fmtDate, toISO, isShared } from "./parts";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

/* 고객 후속 관리 전체 화면.
   허브에는 요약 위젯만 두고, 실제 관리는 여기서 한다.

   뷰를 둘로 나눈다 — 후속 연락은 날짜가 있으니 달력으로, 고객 메모는 날짜·완료
   개념이 없으니 목록으로. 예전에는 한 탭 줄에 섞여 있어 성격이 다른 둘이
   같은 것처럼 보였다. */

const VIEWS = [
  { id: "calendar", label: "후속 연락", icon: CalendarDays },
  { id: "notes", label: "고객 메모", icon: StickyNote },
];

/* 공유 범위 필터 — 지점 공유가 쌓이면 내 것만 보고 싶은 순간이 온다 */
const SCOPE_FILTERS = [
  { id: "all", label: "전체", icon: null },
  { id: "mine", label: "내 기록", icon: Lock },
  { id: "branch", label: "지점 공유", icon: Users },
];

export default function FollowupsPage() {
  const { items, openItems, doneItems, noteItems, summary, add, update, remove, toggleDone } =
    useFollowups();
  const [view, setView] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(() => toISO(new Date()));
  const [showDone, setShowDone] = useState(false);
  const [query, setQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");

  /* 공유 범위 필터를 어느 목록에나 같은 규칙으로 적용한다 */
  const byScope = useMemo(() => {
    if (scopeFilter === "all") return (list) => list;
    const want = scopeFilter === "branch";
    return (list) => list.filter((i) => isShared(i) === want);
  }, [scopeFilter]);

  useEffect(() => {
    const prev = document.title;
    document.title = "일정 관리 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  const q = query.trim();
  const searchResults = useMemo(() => {
    if (!q) return null;
    const matched = items.filter((i) => (i.customerNo || "").includes(q));
    const rank = (i) => (i.type === "note" ? 0 : i.status === "open" ? 1 : 2);
    return matched.sort((a, b) => rank(a) - rank(b) || (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [items, q]);

  /* 옆 목록은 선택한 날짜만이 아니라 예정 전체를 보여 준다.
     날짜를 옮겨 다니지 않아도 할 일이 한눈에 들어와야 한다.
     openItems는 이미 가까운 날짜 → 기한 없음 순으로 정렬돼 온다. */
  const listItems = useMemo(
    () => byScope(showDone ? [...openItems, ...doneItems] : openItems),
    [openItems, doneItems, showDone, byScope]
  );
  const calendarItems = useMemo(() => byScope(items), [items, byScope]);
  const visibleNotes = useMemo(() => byScope(noteItems), [noteItems, byScope]);
  const visibleDone = useMemo(() => byScope(doneItems), [doneItems, byScope]);

  const rowProps = {
    onToggle: toggleDone,
    onUpdate: update,
    onRemove: remove,
    onSearch: (no) => setQuery(no),
  };

  return (
    <HubShell wide>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <HubLink compact className="mb-2" />
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-im-50 text-im-600">
              <CalendarDays className="h-[18px] w-[18px]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              일정 관리
            </h1>
          </div>
          <p className="mt-1.5 max-w-2xl text-[12px] text-slate-500">
            후속 연락 약속과 고객 메모를 고객번호로 기록·검색합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {summary.overdue > 0 && (
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-700">
              지남 {summary.overdue}
            </span>
          )}
          {summary.today > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
              오늘 {summary.today}
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
            예정 {summary.openCount}
          </span>
        </div>
      </div>

      {/* 고객번호 검색 — 두 뷰 어디서든 */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="고객번호로 검색"
          className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-9 text-[13px] focus:border-im-500 focus:outline-none"
        />
        {q && (
          <button
            onClick={() => setQuery("")}
            aria-label="검색 지우기"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {searchResults ? (
        <div className={cn(CARD, "overflow-hidden")}>
          <div className="border-b border-slate-100 px-3 py-2 text-[12px] text-slate-600">
            「<span className="font-bold text-slate-900">{q}</span>」 검색 결과{" "}
            <span className="font-bold text-im-700">{searchResults.length}건</span>
            {searchResults.length > 0 && " — 고객 메모 · 예정 · 완료 순"}
          </div>
          {searchResults.length === 0 ? (
            <p className="px-3 py-8 text-center text-[12.5px] text-slate-400">
              이 고객번호로 남긴 기록이 없습니다.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 py-1">
              {searchResults.map((item) => (
                <FollowupRow key={item.id} item={item} {...rowProps} />
              ))}
            </ul>
          )}
        </div>
      ) : (
        <>
          {/* 뷰 전환 — 후속 연락(날짜 있음) / 고객 메모(날짜 없음) */}
          <div className="mb-3 flex flex-wrap items-center gap-1">
            {VIEWS.map((v) => {
              const Icon = v.icon;
              const on = view === v.id;
              const count = v.id === "calendar" ? summary.openCount : noteItems.length;
              return (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
                    on
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {v.label}
                  <span className={cn("tabular-nums", on ? "text-slate-300" : "text-slate-400")}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* 공유 범위 필터 */}
            <div className="ml-auto inline-flex overflow-hidden rounded-md ring-1 ring-inset ring-slate-200">
              {SCOPE_FILTERS.map((s) => {
                const Icon = s.icon;
                const on = scopeFilter === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setScopeFilter(s.id)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-semibold transition-colors",
                      on
                        ? s.id === "branch"
                          ? "bg-teal-600 text-white"
                          : "bg-slate-700 text-white"
                        : "bg-white text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {view === "calendar" ? (
            <div className="grid gap-3 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <MonthCalendar
                  items={calendarItems}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onMoveItem={(id, followUpDate) => update(id, { followUpDate })}
                />
              </div>

              <div className="space-y-3 lg:col-span-2">
                <div className={cn(CARD, "overflow-hidden")}>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5">
                    <span className="text-[13px] font-bold text-slate-900">
                      전체 목록
                      <span className="ml-1.5 text-[11px] font-medium text-slate-400">
                        가까운 순
                      </span>
                    </span>
                    <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-slate-500">
                      <input
                        type="checkbox"
                        checked={showDone}
                        onChange={(e) => setShowDone(e.target.checked)}
                        className="h-3.5 w-3.5 accent-im-600"
                      />
                      완료 포함
                    </label>
                  </div>
                  {listItems.length === 0 ? (
                    <p className="px-3 py-6 text-center text-[12px] text-slate-400">
                      예정된 후속 연락이 없습니다.
                    </p>
                  ) : (
                    <ul className="max-h-[32rem] divide-y divide-slate-100 overflow-y-auto py-1">
                      {listItems.map((item) => (
                        <FollowupRow
                          key={item.id}
                          item={item}
                          highlight={item.followUpDate === selectedDate}
                          {...rowProps}
                        />
                      ))}
                    </ul>
                  )}
                </div>

                <div className={cn(CARD, "overflow-hidden")}>
                  <div className="flex items-center gap-2 border-b border-slate-100 bg-im-50/50 px-3.5 py-2.5">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-im-600 text-white">
                      <PlusCircle className="h-3.5 w-3.5" />
                    </span>
                    <div className="text-[12.5px] font-bold text-slate-800">
                      <span className="text-im-700">{fmtDate(selectedDate)}</span>에 기록 추가
                    </div>
                  </div>
                  <div className="p-3.5">
                    <FollowupForm onAdd={add} defaultDate={selectedDate} fixedType="followup" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <div className={cn(CARD, "overflow-hidden")}>
                  <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
                    <span className="text-[13px] font-bold text-slate-900">고객 메모</span>
                    <span className="text-[11px] text-slate-400">{visibleNotes.length}건</span>
                  </div>
                  {visibleNotes.length === 0 ? (
                    <p className="px-3 py-8 text-center text-[12.5px] leading-relaxed text-slate-400">
                      기록해 둔 고객 메모가 없습니다.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-100 py-1">
                      {visibleNotes.map((item) => (
                        <FollowupRow key={item.id} item={item} {...rowProps} />
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className={cn(CARD, "overflow-hidden")}>
                  <div className="flex items-center gap-2 border-b border-slate-100 bg-violet-50/50 px-3.5 py-2.5">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-violet-600 text-white">
                      <PlusCircle className="h-3.5 w-3.5" />
                    </span>
                    <div className="text-[12.5px] font-bold text-slate-800">고객 메모 추가</div>
                  </div>
                  <div className="p-3.5">
                    <FollowupForm onAdd={add} fixedType="note" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 완료된 건 */}
          {view === "calendar" && visibleDone.length > 0 && (
            <details className={cn(CARD, "mt-3 overflow-hidden")}>
              <summary className="cursor-pointer px-3 py-2.5 text-[12px] font-bold text-slate-700">
                완료 {visibleDone.length}건
              </summary>
              <ul className="divide-y divide-slate-100 border-t border-slate-100 py-1">
                {visibleDone.map((item) => (
                  <FollowupRow key={item.id} item={item} {...rowProps} />
                ))}
              </ul>
            </details>
          )}
        </>
      )}

      <div className="mt-4 flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50/40 px-3 py-2">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
        <PrivacyNotice />
      </div>
    </HubShell>
  );
}
