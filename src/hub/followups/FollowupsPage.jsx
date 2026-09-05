import { useEffect, useMemo, useState } from "react";
import { CalendarDays, List, Search, X, ShieldAlert, PlusCircle } from "lucide-react";
import { HubShell } from "../HubShell";
import { ModuleTabs } from "@shared/components/ModuleTabs";
import { useFollowups, ddayOf } from "./useFollowups";
import { MonthCalendar } from "./MonthCalendar";
import { FollowupRow, FollowupForm, PrivacyNotice, fmtDate, fmtTime, STAFF_META } from "./parts";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

/* 고객 후속 관리 — 목록(할 일·고객 메모) / 지점 달력(지점 일정·휴가·연수) 탭. */

const TONE = { rose: "text-rose-600", amber: "text-amber-600", im: "text-im-700", slate: "text-slate-600", violet: "text-violet-600", teal: "text-teal-600" };
const isStaffItem = (i) => i.category === "leave" || i.category === "training" || i.category === "branch";

const NAV = [
  { id: "list", label: "목록", icon: List },
  { id: "calendar", label: "지점 달력", icon: CalendarDays },
];

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
  const { items, add, update, remove, toggleDone, markBranchSeen } = useFollowups();
  const [tab, setTab] = useState("list");
  const [query, setQuery] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [picker, setPicker] = useState(null); // { start, end } — 달력에서 고른 날짜/기간
  const [detail, setDetail] = useState(null); // 달력 띠 클릭 시 상세 항목

  useEffect(() => {
    const prev = document.title;
    document.title = "일정 관리 · iM 세일즈메이트";
    markBranchSeen();
    return () => {
      document.title = prev;
    };
  }, [markBranchSeen]);

  const rowProps = { onToggle: toggleDone, onUpdate: update, onRemove: remove, onSearch: (no) => setQuery(no) };

  const q = query.trim();
  const searchResults = useMemo(() => {
    if (!q) return null;
    return items.filter((i) => (i.customerNo || "").includes(q)).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [items, q]);

  const { groups, notes, staffOpen, doneItems, summary } = useMemo(() => {
    const open = items.filter((i) => i.status === "open");
    const todos = open.filter((i) => i.category === "todo");
    const noteList = open.filter((i) => i.category === "note").sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    const staff = open.filter(isStaffItem).sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));
    const dated = todos.filter((i) => i.followUpDate).sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));
    const undated = todos.filter((i) => !i.followUpDate).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    const g = { overdue: [], today: [], week: [], later: [] };
    let overdue = 0, today = 0;
    dated.forEach((i) => {
      const d = ddayOf(i.followUpDate);
      if (d < 0) { g.overdue.push(i); overdue++; }
      else if (d === 0) { g.today.push(i); today++; }
      else if (d <= 7) g.week.push(i);
      else g.later.push(i);
    });
    const done = items.filter((i) => i.category === "todo" && i.status === "done").sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return { groups: { ...g, memo: undated }, notes: noteList, staffOpen: staff, doneItems: done, summary: { overdue, today, openCount: todos.length } };
  }, [items]);

  const hasList =
    groups.overdue.length + groups.today.length + groups.week.length + groups.later.length + groups.memo.length + notes.length > 0;

  return (
    <HubShell wide={tab === "calendar"}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-im-50 text-im-600">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-black leading-tight text-slate-900 md:text-xl">일정 관리</h1>
            <p className="text-[11.5px] text-slate-500">할 일·고객 메모와 지점 일정(지점 일정·휴가·연수)</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {summary.overdue > 0 && (
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-700">지남 {summary.overdue}</span>
          )}
          {summary.today > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">오늘 {summary.today}</span>
          )}
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">할 일 {summary.openCount}</span>
        </div>
      </div>

      <ModuleTabs items={NAV} activeId={tab} onSelect={setTab} accent="im" />

      {/* 검색 */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="고객번호로 검색"
          className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-9 text-[13px] focus:border-im-500 focus:outline-none"
        />
        {q && (
          <button onClick={() => setQuery("")} aria-label="검색 지우기" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {searchResults ? (
        <div className={cn(CARD, "overflow-hidden")}>
          <div className="border-b border-slate-100 px-3.5 py-2 text-[12px] text-slate-600">
            「<span className="font-bold text-slate-900">{q}</span>」 검색 결과 <span className="font-bold text-im-700">{searchResults.length}건</span>
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
          <MonthCalendar items={items} onPickRange={(start, end) => setPicker({ start, end })} onEventClick={setDetail} />
          {staffOpen.length > 0 && <Group title="지점 일정 목록" tone="teal" items={staffOpen} rowProps={rowProps} />}
        </div>
      ) : (
        <div className="space-y-3">
          {/* 빠른 기록 — 할 일·고객 메모 */}
          <div className={cn(CARD, "overflow-hidden")}>
            <div className="flex items-center gap-2 border-b border-slate-100 bg-im-50/50 px-3.5 py-2.5">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-im-600 text-white">
                <PlusCircle className="h-3.5 w-3.5" />
              </span>
              <span className="text-[12.5px] font-bold text-slate-800">빠른 기록</span>
              <span className="text-[11px] text-slate-400">연락일을 비우면 기한 없음으로 저장됩니다</span>
            </div>
            <div className="p-3.5">
              <FollowupForm onAdd={add} allowed={["todo", "note"]} />
            </div>
          </div>

          <Group title="지남" tone="rose" items={groups.overdue} rowProps={rowProps} />
          <Group title="오늘" tone="amber" items={groups.today} rowProps={rowProps} />
          <Group title="이번 주" tone="im" items={groups.week} rowProps={rowProps} />
          <Group title="예정" tone="slate" items={groups.later} rowProps={rowProps} />
          <Group title="기한 없음" tone="slate" items={groups.memo} rowProps={rowProps} />
          <Group title="고객 메모" tone="violet" items={notes} rowProps={rowProps} />

          {!hasList && (
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

      {/* 날짜/기간 선택 → 지점 일정 추가 팝업 */}
      {picker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setPicker(null)}>
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="text-[13px] font-bold text-slate-900">
                지점 일정 추가
                <span className="ml-2 text-[12px] font-semibold text-im-700">
                  {fmtDate(picker.start)}
                  {picker.end !== picker.start ? ` ~ ${fmtDate(picker.end)}` : ""}
                </span>
              </div>
              <button onClick={() => setPicker(null)} aria-label="닫기" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <FollowupForm
                onAdd={(v) => {
                  add(v);
                  setPicker(null);
                }}
                defaultDate={picker.start}
                defaultEnd={picker.end}
                allowed={["branch", "leave", "training"]}
              />
            </div>
          </div>
        </div>
      )}

      {/* 달력 띠 클릭 → 일정 상세 */}
      {detail && (() => {
        const cat = detail.category || "todo";
        const staff = STAFF_META[cat];
        const isStaff = !!staff;
        const isTodo = cat === "todo";
        const badge = isStaff ? staff.label : cat === "note" ? "고객 메모" : "할 일";
        const when = isStaff
          ? `${fmtDate(detail.startDate)}${detail.endDate && detail.endDate !== detail.startDate ? ` ~ ${fmtDate(detail.endDate)}` : ""}${detail.time ? ` · ${fmtTime(detail.time)}` : ""}`
          : detail.followUpDate
          ? fmtDate(detail.followUpDate)
          : "기한 없음";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setDetail(null)}>
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className={cn("inline-flex items-center rounded-sm px-1.5 py-0.5 text-[11px] font-bold", isStaff ? staff.badge : cat === "note" ? "bg-violet-50 text-violet-600" : "bg-im-50 text-im-700")}>
                  {badge}
                </span>
                <button onClick={() => setDetail(null)} aria-label="닫기" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 px-4 py-4">
                <h3 className="text-[15px] font-bold text-slate-900">
                  {isStaff ? detail.staffName || staff.subject : detail.customerNo ? `고객 ${detail.customerNo}` : "고객 메모"}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
                  <span className="font-semibold text-slate-700">{when}</span>
                  {detail.scope === "branch" && <span className="text-teal-600">· 지점 공유</span>}
                  {detail.author && detail.author !== "나" && <span>· 게시 {detail.author}</span>}
                </div>
                {detail.memo && <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700">{detail.memo}</p>}
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
                <div>
                  {isTodo && (
                    <button
                      onClick={() => { toggleDone(detail.id); setDetail(null); }}
                      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-slate-600 hover:border-im-400 hover:text-im-700"
                    >
                      {detail.status === "done" ? "예정으로 되돌리기" : "완료 처리"}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { remove(detail.id); setDetail(null); }}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-rose-600 hover:border-rose-300"
                  >
                    삭제
                  </button>
                  <button onClick={() => setDetail(null)} className="rounded-md bg-slate-900 px-3 py-1.5 text-[12.5px] font-bold text-white hover:bg-slate-700">
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </HubShell>
  );
}
