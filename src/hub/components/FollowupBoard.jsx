import { useState } from "react";
import {
  UserRound,
  CalendarClock,
  Plus,
  Check,
  RotateCcw,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { useFollowups, ddayOf } from "../followups/useFollowups";
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

/* D-day 배지 — 지남(빨강)/오늘(호박)/임박(민트)/예정(슬레이트)/날짜없음 */
const DdayBadge = ({ date }) => {
  const d = ddayOf(date);
  if (d === null) {
    return (
      <span className="inline-flex items-center rounded-sm bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
        날짜 미정
      </span>
    );
  }
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

const FollowupRow = ({ item, onToggle, onRemove }) => {
  const done = item.status === "done";
  return (
    <li className={cn("flex gap-3 px-3 py-2.5", done && "opacity-55")}>
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

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {!done && <DdayBadge date={item.followUpDate} />}
          <span className="inline-flex items-center gap-1 text-[12px] font-bold text-slate-900">
            <UserRound className="h-3 w-3 text-slate-400" />
            {item.customerNo || "(번호 미기재)"}
          </span>
          {item.followUpDate && (
            <span className="text-[11px] text-slate-400">· {fmtDate(item.followUpDate)}</span>
          )}
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
  const { openItems, doneItems, summary, add, remove, toggleDone } = useFollowups();
  const [tab, setTab] = useState("open"); // open | done
  const [customerNo, setCustomerNo] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState("");
  const [products, setProducts] = useState([]);

  const canAdd = memo.trim().length > 0 || customerNo.trim().length > 0;

  const toggleProduct = (id) =>
    setProducts((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const submit = () => {
    if (!canAdd) return;
    add({ customerNo, memo, followUpDate: date, products });
    setCustomerNo("");
    setMemo("");
    setDate("");
    setProducts([]);
  };

  const list = tab === "open" ? openItems : doneItems;

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      {/* 요약 바 */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2.5">
        <CalendarClock className="h-4 w-4 text-im-600" />
        <span className="text-[12px] font-semibold text-slate-700">후속 연락</span>
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
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={customerNo}
            onChange={(e) => setCustomerNo(e.target.value)}
            placeholder="고객번호(관리번호)"
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-[13px] focus:border-im-500 focus:outline-none sm:w-40"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            title="후속 연락일(선택)"
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-[13px] text-slate-600 focus:border-im-500 focus:outline-none sm:w-40"
          />
        </div>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          rows={2}
          placeholder="메모 (예: 방카 만기자금 12/3 나오면 재예치 상담 원함 / 오늘 시간없어 나중에 연락 요청)"
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
            className="inline-flex items-center gap-1 rounded-md bg-im-600 px-3.5 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-im-700 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            기록
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex items-center gap-1 px-3 pt-2">
        {[
          { id: "open", label: `예정 ${openItems.length}` },
          { id: "done", label: `완료 ${doneItems.length}` },
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
      </div>

      {/* 목록 */}
      {list.length === 0 ? (
        <div className="px-3 py-6 text-center text-[12px] text-slate-400">
          {tab === "open"
            ? "예정된 후속 연락이 없습니다. 상담 중 나온 약속을 위에 기록해 두세요."
            : "완료된 항목이 없습니다."}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 py-1">
          {list.map((item) => (
            <FollowupRow key={item.id} item={item} onToggle={toggleDone} onRemove={remove} />
          ))}
        </ul>
      )}

      {/* 개인정보 안내 */}
      <div className="flex items-start gap-1.5 border-t border-slate-100 bg-amber-50/40 px-3 py-2 text-[10.5px] leading-relaxed text-stone-600">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
        <span>
          고객번호(관리번호)와 메모만 기록하세요. <strong>이름·주민번호·연락처 등 개인정보 입력 금지.</strong> 현재는 이 브라우저에만 저장되는 데모 기능으로, 실서비스에서는 직원 계정 인증·서버 저장·접근통제가 적용됩니다.
        </span>
      </div>
    </div>
  );
}
