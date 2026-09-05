import { useEffect, useMemo, useState } from "react";
import { CalendarDays, List, Search, X, ShieldAlert, PlusCircle, Users } from "lucide-react";
import { HubShell } from "../HubShell";
import { useFollowups, ddayOf } from "./useFollowups";
import { MonthCalendar } from "./MonthCalendar";
import { FollowupRow, FollowupForm, PrivacyNotice, fmtDate, toISO } from "./parts";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

/* 고객 후속 관리 — 실용 중심. 기본은 긴급도별 목록, 필요하면 달력으로 전환.
   유형: 고객 연락(고객번호·메모) / 휴가·연수(지점 공유 일정). */

const TONE = { rose: "text-rose-600", amber: "text-amber-600", im: "text-im-700", slate: "text-slate-600", violet: "text-violet-600", teal: "text-teal-600" };

const isStaffItem = (i) => i.category === "leave" || i.category === "training";

const Group = ({ title, tone, items, rowProps }) => {
  if (items.length === 0) return null;
  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2">
        <span className={cn("text-[12.5px] font-bold", TONE[tone])}>{title}</span>
        <span className="text-[11px] font-semibold tabular-nums text-slate-400">{items.length}</span>
      </div>
      <ul className="divide-y divide-slate-100 py-1">
        {items.map((item) => (
          <FollowupRow key={item.id} item={item} {...rowProps} />
        ))}
      </ul>
    </div>
  );
};

export default function FollowupsPage() {
  const { items, add, update, remove, toggleDone } = useFollowups();
  const [tab, setTab] = useState("list"); // list | calendar
  const [query, setQuery] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => toISO(new Date()));

  useEffect(() => {
    const prev = document.title;
    document.title = "일정 관리 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  const rowProps = { onToggle: toggleDone, onUpdate: update, onRemove: remove, onSearch: (no) => setQuery(no) };

  const q = query.trim();
  const searchResults = useMemo(() => {
    if (!q) return null;
    return items
      .filter((i) => (i.customerNo || "").includes(q))
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [items, q]);

  const { groups, staffOpen, doneItems, summary } = useMemo(() => {
    const open = items.filter((i) => i.status === "open");
    const staff = open.filter(isStaffItem).sort((a, b) => (a.followUpDate || "").localeCompare(b.followUpDate || ""));
    const cust = open.filter((i) => !isStaffItem(i));
    const dated = cust.filter((i) => i.followUpDate).sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));
    const undated = cust.filter((i) => !i.followUpDate).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    const g = { overdue: [], today: [], week: [], later: [] };
    let overdue = 0, today = 0;
    dated.forEach((i) => {
      const d = ddayOf(i.followUpDate);
      if (d < 0) { g.overdue.push(i); overdue++; }
      else if (d === 0) { g.today.push(i); today++; }
      else if (d <= 7) g.week.push(i);
      else g.later.push(i);
    });
    const done = items.filter((i) => i.status === "done" && !isStaffItem(i)).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return {
      groups: { ...g, memo: undated },
      staffOpen: staff,
      doneItems: done,
      summary: { overdue, today, openCount: cust.length },
    };
  }, [items]);

  const hasCustomer =
    groups.overdue.length + groups.today.length + groups.week.length + groups.later.length + groups.memo.length > 0;

  return (
    <HubShell wide={tab === "calendar"}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-im-50 text-im-600">
            <CalendarDays className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">일정 관리</h1>
            <p className="mt-0.5 text-[12px] text-slate-500">후속 연락·고객 메모와 지점 일정(휴가·연수)을 관리합니다.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {summary.overdue > 0 && (
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-700">지남 {summary.overdue}</span>
          )}
          {summary.today > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">오늘 {summary.today}</span>
          )}
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">예정 {summary.openCount}</span>
        </div>
      </div>

      {/* 빠른 기록 */}
      <div className={cn(CARD, "mb-4 overflow-hidden")}>
        <div className="flex items-center gap-2 border-b border-slate-100 bg-im-50/50 px-3.5 py-2.5">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-im-600 text-white">
            <PlusCircle className="h-3.5 w-3.5" />
          </span>
          <span className="text-[12.5px] font-bold text-slate-800">빠른 기록</span>
          {tab === "calendar" && (
            <span className="text-[11px] text-slate-400">
              선택한 날짜: <span className="font-semibold text-im-700">{fmtDate(selectedDate)}</span>
            </span>
          )}
        </div>
        <div className="p-3.5">
          <FollowupForm onAdd={add} defaultDate={tab === "calendar" ? selectedDate : ""} />
        </div>
      </div>

      {/* 뷰 토글 + 검색 */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex overflow-hidden rounded-md ring-1 ring-inset ring-slate-200">
          {[
            { id: "list", label: "목록", icon: List },
            { id: "calendar", label: "달력", icon: CalendarDays },
          ].map((v) => {
            const Icon = v.icon;
            const on = tab === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setTab(v.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
                  on ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:text-slate-800"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {v.label}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-0 flex-1">
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
      </div>

      {searchResults ? (
        <div className={cn(CARD, "overflow-hidden")}>
          <div className="border-b border-slate-100 px-3.5 py-2 text-[12px] text-slate-600">
            「<span className="font-bold text-slate-900">{q}</span>」 검색 결과{" "}
            <span className="font-bold text-im-700">{searchResults.length}건</span>
          </div>
          {searchResults.length === 0 ? (
            <p className="px-3 py-8 text-center text-[12.5px] text-slate-400">이 고객번호로 남긴 기록이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-slate-100 py-1">
              {searchResults.map((item) => (
                <FollowupRow key={item.id} item={item} {...rowProps} />
              ))}
            </ul>
          )}
        </div>
      ) : tab === "calendar" ? (
        <div className="space-y-3">
          <MonthCalendar
            items={items}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onMoveItem={(id, followUpDate) => update(id, { followUpDate })}
          />
          {staffOpen.length > 0 && (
            <Group title="지점 일정 (휴가·연수)" tone="teal" items={staffOpen} rowProps={rowProps} />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <Group title="지남" tone="rose" items={groups.overdue} rowProps={rowProps} />
          <Group title="오늘" tone="amber" items={groups.today} rowProps={rowProps} />
          <Group title="이번 주" tone="im" items={groups.week} rowProps={rowProps} />
          <Group title="예정" tone="slate" items={groups.later} rowProps={rowProps} />
          <Group title="기한 없음" tone="violet" items={groups.memo} rowProps={rowProps} />
          <Group title="지점 일정 (휴가·연수)" tone="teal" items={staffOpen} rowProps={rowProps} />

          {!hasCustomer && staffOpen.length === 0 && (
            <p className={cn(CARD, "px-4 py-14 text-center text-[13px] text-slate-400")}>
              기록된 일정이 없습니다. 위 「빠른 기록」으로 첫 일정을 남겨보세요.
            </p>
          )}

          {doneItems.length > 0 && (
            <details className={cn(CARD, "overflow-hidden")} open={showDone} onToggle={(e) => setShowDone(e.currentTarget.open)}>
              <summary className="cursor-pointer px-3.5 py-2.5 text-[12px] font-bold text-slate-600">완료 {doneItems.length}건</summary>
              <ul className="divide-y divide-slate-100 border-t border-slate-100 py-1">
                {doneItems.map((item) => (
                  <FollowupRow key={item.id} item={item} {...rowProps} />
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <div className="mt-4 flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50/40 px-3 py-2">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
        <PrivacyNotice />
      </div>
    </HubShell>
  );
}
