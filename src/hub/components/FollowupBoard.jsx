import { useMemo, useState } from "react";
import {
  UserRound,
  CalendarClock,
  Plus,
  Check,
  Copy,
  RotateCcw,
  Trash2,
  ShieldAlert,
  StickyNote,
  Search,
  X,
} from "lucide-react";
import { useFollowups, ddayOf } from "../followups/useFollowups";
import { FollowupCalendar } from "./FollowupCalendar";
import { cn } from "@shared/lib/format";

/* 권유 상품 태그 — 다중선택. 색은 각 상품 아이덴티티(모듈 accent)와 맞춘다.
   on: 폼에서 선택된 칩, chip: 목록에 표시되는 작은 칩. (Tailwind 정적 클래스) */
const PRODUCT_TAGS = [
  { id: "noran", label: "노란우산", on: "bg-amber-500 text-white border-amber-500", chip: "bg-amber-100 text-amber-800" },
  { id: "isa", label: "ISA", on: "bg-emerald-600 text-white border-emerald-600", chip: "bg-emerald-100 text-emerald-800" },
  { id: "pension", label: "연금저축", on: "bg-violet-600 text-white border-violet-600", chip: "bg-violet-100 text-violet-800" },
  { id: "irp", label: "IRP", on: "bg-sky-600 text-white border-sky-600", chip: "bg-sky-100 text-sky-800" },
  { id: "deposit", label: "예금", on: "bg-slate-600 text-white border-slate-600", chip: "bg-slate-200 text-slate-700" },
  { id: "banca", label: "방카", on: "bg-rose-500 text-white border-rose-500", chip: "bg-rose-100 text-rose-700" },
  { id: "fund", label: "펀드", on: "bg-indigo-600 text-white border-indigo-600", chip: "bg-indigo-100 text-indigo-800" },
];
const PRODUCT_BY_ID = Object.fromEntries(PRODUCT_TAGS.map((p) => [p.id, p]));

const fmtDate = (iso) => {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d)) return iso;
  const day = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}.${d.getDate()}(${day})`;
};

/* D-day 배지 — 지남(빨강)/오늘(호박)/임박(민트)/예정(슬레이트) */
const DdayBadge = ({ date }) => {
  const d = ddayOf(date);
  if (d === null) return null;
  let label;
  let cls;
  if (d < 0) {
    label = `지남 ${Math.abs(d)}일`;
    cls = "bg-rose-100 text-rose-700";
  } else if (d === 0) {
    label = "오늘";
    cls = "bg-amber-100 text-amber-800";
  } else if (d <= 7) {
    label = `D-${d}`;
    cls = "bg-im-100 text-im-700";
  } else {
    label = `D-${d}`;
    cls = "bg-slate-100 text-slate-600";
  }
  return (
    <span className={cn("inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold tabular-nums", cls)}>
      {label}
    </span>
  );
};

const ProductChips = ({ ids }) =>
  (ids || []).length === 0 ? null : (
    <span className="inline-flex flex-wrap gap-1">
      {ids.map((id) => {
        const p = PRODUCT_BY_ID[id];
        if (!p) return null;
        return (
          <span key={id} className={cn("rounded-sm px-1.5 py-0.5 text-[9px] font-bold", p.chip)}>
            {p.label}
          </span>
        );
      })}
    </span>
  );

/* 고객번호 — 클릭하면 복사. 번호 전체를 항상 표시한다 */
const CustomerNo = ({ no, onSearch }) => {
  const [copied, setCopied] = useState(false);
  if (!no) {
    return <span className="text-[12px] font-semibold text-slate-400">(번호 미기재)</span>;
  }
  const copy = () => {
    navigator.clipboard?.writeText(no);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <span className="inline-flex items-center gap-0.5">
      <button
        onClick={onSearch ? () => onSearch(no) : undefined}
        title={onSearch ? "이 고객의 기록 모두 보기" : undefined}
        className={cn(
          "inline-flex items-center gap-1 text-[12px] font-bold tabular-nums text-slate-900",
          onSearch && "hover:text-im-700 hover:underline"
        )}
      >
        <UserRound className="h-3 w-3 flex-shrink-0 text-slate-400" />
        {no}
      </button>
      <button
        onClick={copy}
        title="고객번호 복사"
        className={cn(
          "rounded p-0.5 transition-colors",
          copied ? "text-im-600" : "text-slate-300 hover:bg-slate-100 hover:text-slate-500"
        )}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>
    </span>
  );
};

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/* 기준일(연락일이 있으면 그 날, 없으면 오늘)에서 n일 뒤 */
const shiftDate = (iso, days) => {
  const base = iso ? new Date(`${iso}T00:00:00`) : new Date();
  if (isNaN(base)) return null;
  base.setDate(base.getDate() + days);
  return toISO(base);
};

/* 연락일 — 누르면 미루기 패널이 열린다.
   창구에서 가장 잦은 조작이 「다음에 다시 연락」이라 +1주·+1개월을 한 번에 누를 수 있게 하고,
   날짜를 못 잡는 건은 「기한 없음」으로 남겨 둔다. */
const DateControl = ({ item, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const set = (followUpDate) => {
    onUpdate(item.id, { followUpDate });
    setOpen(false);
  };

  return (
    <span className="relative inline-flex">
      <button
        onClick={() => setOpen((v) => !v)}
        title="연락일 변경"
        className={cn(
          "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] transition-colors",
          open ? "bg-im-50 text-im-700" : "text-slate-500 hover:bg-slate-100 hover:text-im-700"
        )}
      >
        <CalendarClock className="h-3 w-3" />
        {item.followUpDate ? fmtDate(item.followUpDate) : "기한 없음"}
      </button>

      {open && (
        <>
          {/* 바깥을 눌러 닫기 */}
          <span className="fixed inset-0 z-20" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute left-0 top-full z-30 mt-1 w-52 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
            <div className="mb-1.5 grid grid-cols-3 gap-1">
              {[
                { label: "내일", days: 1 },
                { label: "+1주", days: 7 },
                { label: "+1개월", days: 30 },
              ].map((q) => (
                <button
                  key={q.label}
                  onClick={() => set(shiftDate(item.followUpDate, q.days))}
                  className="rounded-sm border border-slate-200 px-1.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-im-400 hover:text-im-700"
                >
                  {q.label}
                </button>
              ))}
            </div>
            <input
              type="date"
              value={item.followUpDate ?? ""}
              onChange={(e) => set(e.target.value || null)}
              className="w-full rounded-sm border border-slate-300 px-2 py-1 text-[11px] text-slate-600 focus:border-im-500 focus:outline-none"
            />
            <button
              onClick={() => set(null)}
              className="mt-1.5 w-full rounded-sm px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100"
            >
              기한 없음으로 두기
            </button>
          </div>
        </>
      )}
    </span>
  );
};

const FollowupRow = ({ item, onToggle, onUpdate, onRemove, onSearch }) => {
  const isNote = item.type === "note";
  const done = !isNote && item.status === "done";
  return (
    <li className={cn("flex gap-3 px-3 py-2.5", done && "opacity-55")}>
      {isNote ? (
        <span
          title="고객 메모"
          className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-500"
        >
          <StickyNote className="h-3 w-3" />
        </span>
      ) : (
        <button
          onClick={() => onToggle(item.id)}
          title={done ? "예정으로 되돌리기" : "완료 처리"}
          className={cn(
            "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-colors",
            done
              ? "border-im-500 bg-im-500 text-white"
              : "border-slate-300 text-transparent hover:border-im-400"
          )}
        >
          <Check className="h-3 w-3" />
        </button>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {isNote && (
            <span className="inline-flex items-center rounded-sm bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-600">
              고객 메모
            </span>
          )}
          {!isNote && !done && <DdayBadge date={item.followUpDate} />}
          {!isNote && done && (
            <span className="inline-flex items-center rounded-sm bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
              완료
            </span>
          )}
          <CustomerNo no={item.customerNo} onSearch={onSearch} />
          {!isNote && <DateControl item={item} onUpdate={onUpdate} />}
          <ProductChips ids={item.products} />
        </div>
        <p className={cn("mt-0.5 whitespace-pre-wrap break-words text-[12.5px] leading-relaxed text-slate-700", done && "line-through")}>
          {item.memo}
        </p>
      </div>

      <div className="flex flex-shrink-0 items-start gap-0.5">
        {done && (
          <button
            onClick={() => onToggle(item.id)}
            title="예정으로 되돌리기"
            className="rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={() => onRemove(item.id)}
          title="삭제"
          className="rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
};

export function FollowupBoard() {
  const { items, openItems, doneItems, noteItems, summary, add, update, remove, toggleDone } =
    useFollowups();
  const [tab, setTab] = useState("open"); // open | done | note
  const [entryType, setEntryType] = useState("followup"); // followup | note
  const [customerNo, setCustomerNo] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState("");
  const [noDeadline, setNoDeadline] = useState(false); // 날짜를 못 잡는 건도 예정으로 등록
  const [products, setProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // 캘린더에서 고른 날짜(ISO) — 목록 필터
  const [query, setQuery] = useState(""); // 고객번호 검색어

  const isNoteEntry = entryType === "note";
  /* 고객 메모는 나중에 고객번호로 다시 찾는 게 목적이라 번호가 필수 */
  const canAdd = isNoteEntry
    ? customerNo.trim().length > 0 && memo.trim().length > 0
    : memo.trim().length > 0 || customerNo.trim().length > 0;

  const toggleProduct = (id) =>
    setProducts((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const submit = () => {
    if (!canAdd) return;
    add({
      customerNo,
      memo,
      followUpDate: noDeadline ? null : date,
      products,
      type: entryType,
    });
    setCustomerNo("");
    setMemo("");
    setDate("");
    setNoDeadline(false);
    setProducts([]);
  };

  /* 캘린더 날짜 선택 — 같은 날짜 재클릭 시 해제. 선택하면 새 메모 연락일도 채운다 */
  const handleSelectDate = (iso) => {
    setSelectedDate((prev) => {
      const next = prev === iso ? null : iso;
      setDate(next ?? "");
      if (next) setNoDeadline(false);
      return next;
    });
  };

  /* 고객번호 검색 — 후속 연락·고객 메모를 가리지 않고 그 고객의 기록 전부 */
  const q = query.trim();
  const searchResults = useMemo(() => {
    if (!q) return null;
    const matched = items.filter((i) => (i.customerNo || "").includes(q));
    const rank = (i) => (i.type === "note" ? 0 : i.status === "open" ? 1 : 2);
    return matched.sort(
      (a, b) => rank(a) - rank(b) || (b.createdAt ?? 0) - (a.createdAt ?? 0)
    );
  }, [items, q]);

  const searchFor = (no) => setQuery(no);

  const baseList = tab === "open" ? openItems : tab === "done" ? doneItems : noteItems;
  /* 날짜 필터는 연락일이 있는 후속 연락 탭에만 적용 */
  const list =
    selectedDate && tab !== "note"
      ? baseList.filter((i) => i.followUpDate === selectedDate)
      : baseList;

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      {/* 요약 바 */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2.5">
        <CalendarClock className="h-4 w-4 text-im-600" />
        <span className="text-[12px] font-semibold text-slate-700">후속 연락 · 고객 메모</span>
        {summary.overdue > 0 && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
            지남 {summary.overdue}
          </span>
        )}
        {summary.today > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            오늘 {summary.today}
          </span>
        )}
        {summary.soon > 0 && (
          <span className="rounded-full bg-im-100 px-2 py-0.5 text-[10px] font-bold text-im-700">
            7일 내 {summary.soon}
          </span>
        )}
        <span className="ml-auto text-[11px] text-slate-400">예정 {summary.openCount}건</span>
      </div>

      {/* 입력 폼 */}
      <div className="space-y-2 border-b border-slate-100 bg-slate-50/50 p-3">
        {/* 기록 유형 — 후속 연락 / 고객 메모 */}
        <div className="flex items-center gap-1">
          {[
            { id: "followup", label: "후속 연락", icon: CalendarClock },
            { id: "note", label: "고객 메모", icon: StickyNote },
          ].map((t) => {
            const Icon = t.icon;
            const on = entryType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setEntryType(t.id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  on
                    ? t.id === "note"
                      ? "bg-violet-600 text-white"
                      : "bg-im-600 text-white"
                    : "bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:text-slate-700"
                )}
              >
                <Icon className="h-3 w-3" />
                {t.label}
              </button>
            );
          })}
          {isNoteEntry && (
            <span className="text-[10px] text-slate-400">
              나만 보는 메모 — 얼굴은 아는데 기억이 안 나는 고객, 번호로 다시 찾아보세요
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={customerNo}
            onChange={(e) => setCustomerNo(e.target.value)}
            placeholder={isNoteEntry ? "고객번호 — 필수" : "고객번호"}
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-[13px] focus:border-im-500 focus:outline-none sm:w-44"
          />
          {!isNoteEntry && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={noDeadline}
                title="후속 연락일"
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-[13px] text-slate-600 focus:border-im-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 sm:w-40"
              />
              {/* 날짜를 못 잡는 건도 예정으로 남겨 둘 수 있게 */}
              <label className="inline-flex flex-shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap text-[12px] text-slate-600">
                <input
                  type="checkbox"
                  checked={noDeadline}
                  onChange={(e) => {
                    setNoDeadline(e.target.checked);
                    if (e.target.checked) setDate("");
                  }}
                  className="h-3.5 w-3.5 accent-im-600"
                />
                기한 없음
              </label>
            </div>
          )}
        </div>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          rows={2}
          placeholder={
            isNoteEntry
              ? "이 고객에 대해 기억해 둘 내용 (예: 부부가 함께 방문하는 단골 / 매장 확장 준비 중 / 겸양어 선호)"
              : "메모 (예: 방카 만기자금 12/3 나오면 재예치 상담 원함 / 오늘 시간없어 나중에 연락 요청)"
          }
          className="w-full resize-y rounded-md border border-slate-300 px-2.5 py-1.5 text-[13px] leading-relaxed focus:border-im-500 focus:outline-none"
        />
        {/* 권유 상품 (다중선택) */}
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            권유 상품 <span className="font-medium normal-case">(선택 · 복수 가능)</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {PRODUCT_TAGS.map((p) => {
              const on = products.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
                    on ? p.on : "border-slate-300 bg-white text-slate-500 hover:border-slate-400"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={submit}
            disabled={!canAdd}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-3.5 py-1.5 text-[12px] font-bold text-white transition-colors disabled:opacity-40",
              isNoteEntry ? "bg-violet-600 hover:bg-violet-700" : "bg-im-600 hover:bg-im-700"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            기록
          </button>
        </div>
      </div>

      {/* 캘린더 + 목록 — 데스크톱은 좌우, 모바일은 상하 */}
      <div className="md:flex">
        <div className="border-b border-slate-100 p-3 md:w-64 md:flex-shrink-0 md:border-b-0 md:border-r">
          <FollowupCalendar
            items={items}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        </div>

        <div className="min-w-0 flex-1">
          {/* 고객번호 검색 — 후속 연락·고객 메모 통합 조회 */}
          <div className="px-3 pt-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="고객번호로 검색 — 이 고객에게 남긴 후속 연락·고객 메모 전부"
                className="w-full rounded-md border border-slate-200 py-1.5 pl-8 pr-8 text-[12px] focus:border-im-500 focus:outline-none"
              />
              {q && (
                <button
                  onClick={() => setQuery("")}
                  title="검색 지우기"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {searchResults ? (
            /* 검색 모드 — 탭 무시하고 해당 고객의 모든 기록 */
            <>
              <div className="px-3 pt-2 text-[11px] text-slate-500">
                「<span className="font-bold text-slate-800">{q}</span>」 검색 결과{" "}
                <span className="font-bold text-im-700">{searchResults.length}건</span>
                {searchResults.length > 0 && " — 고객 메모 · 예정 · 완료 순"}
              </div>
              {searchResults.length === 0 ? (
                <div className="px-3 py-6 text-center text-[12px] text-slate-400">
                  이 고객번호로 남긴 기록이 없습니다.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 py-1">
                  {searchResults.map((item) => (
                    <FollowupRow
                      key={item.id}
                      item={item}
                      onToggle={toggleDone}
                      onUpdate={update}
                      onRemove={remove}
                    />
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              {/* 탭 + 날짜 필터 */}
              <div className="flex flex-wrap items-center gap-1 px-3 pt-2">
                {[
                  { id: "open", label: `예정 ${openItems.length}` },
                  { id: "done", label: `완료 ${doneItems.length}` },
                  { id: "note", label: `고객 메모 ${noteItems.length}` },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[12px] font-semibold transition-colors",
                      tab === t.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
                {selectedDate && tab !== "note" && (
                  <button
                    onClick={() => handleSelectDate(selectedDate)}
                    title="날짜 필터 해제"
                    className="inline-flex items-center gap-1 rounded-full bg-im-50 px-2.5 py-1 text-[11px] font-semibold text-im-700 transition-colors hover:bg-im-100"
                  >
                    {fmtDate(selectedDate)}
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* 목록 */}
              {list.length === 0 ? (
                <div className="px-3 py-6 text-center text-[12px] text-slate-400">
                  {selectedDate && tab !== "note"
                    ? `${fmtDate(selectedDate)}에 잡힌 ${tab === "open" ? "예정" : "완료"} 메모가 없습니다.`
                    : tab === "open"
                    ? "예정된 후속 연락이 없습니다. 상담 중 나온 약속을 위에 기록해 두세요."
                    : tab === "done"
                    ? "완료된 항목이 없습니다."
                    : "고객 메모가 없습니다. 얼굴은 아는데 기억이 가물가물한 고객 — 다음에 알아볼 수 있게 나만의 메모를 남겨 보세요."}
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 py-1">
                  {list.map((item) => (
                    <FollowupRow
                      key={item.id}
                      item={item}
                      onToggle={toggleDone}
                      onUpdate={update}
                      onRemove={remove}
                      onSearch={searchFor}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>

      {/* 개인정보 안내 */}
      <div className="flex items-start gap-1.5 border-t border-slate-100 bg-amber-50/40 px-3 py-2 text-[10.5px] leading-relaxed text-slate-600">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
        <span>
          고객번호와 메모만 기록하세요. <strong>이름·주민번호·연락처 등 개인정보 입력 금지.</strong> 현재는 이 브라우저에만 저장되는 데모 기능으로, 실서비스에서는 직원 계정 인증·서버 저장·접근통제가 적용됩니다.
        </span>
      </div>
    </div>
  );
}
