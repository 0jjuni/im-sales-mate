import { useState } from "react";
import {
  UserRound,
  CalendarClock,
  Plus,
  Check,
  Copy,
  RotateCcw,
  Trash2,
  StickyNote,
  Lock,
  Users,
  Plane,
  GraduationCap,
  Building2,
} from "lucide-react";
import { ddayOf } from "./useFollowups";
import { cn } from "@shared/lib/format";

/* 고객 후속 관리 화면들이 공유하는 표시 부품.
   허브의 요약 위젯(FollowupBoard)과 전체 화면(FollowupsPage)이 함께 쓴다. */

/* 권유 상품 태그 — 색은 각 상품 아이덴티티와 맞춘다 (Tailwind 정적 클래스) */
export const PRODUCT_TAGS = [
  { id: "noran", label: "노란우산", on: "bg-amber-500 text-white border-amber-500", chip: "bg-amber-100 text-amber-800" },
  { id: "isa", label: "ISA", on: "bg-fuchsia-600 text-white border-fuchsia-600", chip: "bg-fuchsia-100 text-fuchsia-800" },
  { id: "pension", label: "연금저축", on: "bg-violet-600 text-white border-violet-600", chip: "bg-violet-100 text-violet-800" },
  { id: "irp", label: "IRP", on: "bg-sky-600 text-white border-sky-600", chip: "bg-sky-100 text-sky-800" },
  { id: "deposit", label: "예금", on: "bg-slate-600 text-white border-slate-600", chip: "bg-slate-200 text-slate-700" },
  { id: "banca", label: "방카", on: "bg-rose-500 text-white border-rose-500", chip: "bg-rose-100 text-rose-700" },
  { id: "fund", label: "펀드", on: "bg-indigo-600 text-white border-indigo-600", chip: "bg-indigo-100 text-indigo-800" },
];
const PRODUCT_BY_ID = Object.fromEntries(PRODUCT_TAGS.map((p) => [p.id, p]));

/* 공유 범위 — 나만 보는 기록과 지점이 함께 보는 기록을 나눈다.
   창구를 비운 사이 다른 직원이 그 고객을 응대하는 일이 잦아, 「이 건은 누가 받아도
   같은 안내가 나가야 하는 건」을 지점 공유로 올린다. */
export const SCOPES = [
  { id: "mine", label: "나만 보기", icon: Lock, on: "bg-slate-700 text-white" },
  { id: "branch", label: "지점 공유", icon: Users, on: "bg-teal-600 text-white" },
];

export const isShared = (item) => item?.scope === "branch";

export const ScopeBadge = ({ item }) =>
  !isShared(item) ? null : (
    <span
      title="지점 공유 — 같은 지점 직원이 함께 봅니다"
      className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500"
    >
      <Users className="h-2.5 w-2.5" />
      지점 공유
    </span>
  );

export const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const fmtDate = (iso) => {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d)) return iso;
  const day = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}.${d.getDate()}(${day})`;
};

/* 기준일(연락일이 있으면 그 날, 없으면 오늘)에서 n일 뒤 */
const shiftDate = (iso, days) => {
  const base = iso ? new Date(`${iso}T00:00:00`) : new Date();
  if (isNaN(base)) return null;
  base.setDate(base.getDate() + days);
  return toISO(base);
};

/* D-day 배지 — 지남(빨강)/오늘(호박)/임박(민트)/예정(슬레이트) */
export const DdayBadge = ({ date }) => {
  const d = ddayOf(date);
  if (d === null) return null;
  let label;
  let cls;
  if (d < 0) {
    label = `지남 ${Math.abs(d)}일`;
    cls = "text-rose-600";
  } else if (d === 0) {
    label = "오늘";
    cls = "text-amber-600";
  } else {
    label = `D-${d}`;
    cls = "text-slate-400";
  }
  return <span className={cn("text-[10px] font-bold tabular-nums", cls)}>{label}</span>;
};

export const ProductChips = ({ ids }) =>
  (ids || []).length === 0 ? null : (
    <span className="inline-flex flex-wrap gap-1">
      {ids.map((id) => {
        const p = PRODUCT_BY_ID[id];
        if (!p) return null;
        return (
          <span
            key={id}
            className="rounded-sm border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500"
          >
            {p.label}
          </span>
        );
      })}
    </span>
  );

/* 고객번호 — 번호를 누르면 그 고객 기록 검색, 옆 아이콘으로 복사 */
export const CustomerNo = ({ no, onSearch }) => {
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

/* 연락일 — 누르면 미루기 패널. 창구에서 가장 잦은 조작이 「다음에 다시 연락」이다 */
export const DateControl = ({ item, onUpdate }) => {
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

/* 지점 일정(휴가·연수·지점 일정) 표시 메타 */
export const STAFF_META = {
  leave: { label: "휴가 계획", subject: "담당자", icon: Plane, badge: "bg-teal-50 text-teal-700", dot: "bg-teal-50 text-teal-500" },
  training: { label: "연수 계획", subject: "담당자", icon: GraduationCap, badge: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-50 text-indigo-500" },
  branch: { label: "지점 일정", subject: "제목", icon: Building2, badge: "bg-sky-50 text-sky-700", dot: "bg-sky-50 text-sky-500" },
};

export const FollowupRow = ({
  item,
  onToggle,
  onUpdate,
  onRemove,
  onSearch,
  compact,
  highlight,
}) => {
  const cat = item.category || "todo";
  const isStaff = cat === "leave" || cat === "training" || cat === "branch";
  const isNote = cat === "note";
  const done = cat === "todo" && item.status === "done";
  const staff = STAFF_META[cat];
  const StaffIcon = staff?.icon;
  return (
    <li
      className={cn(
        "flex gap-3 px-3 py-2.5",
        done && "opacity-55",
        /* 달력에서 고른 날짜의 건을 목록에서 찾기 쉽게 */
        highlight && "bg-im-50/70"
      )}
    >
      {isStaff ? (
        <span className={cn("mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full", staff.dot)}>
          <StaffIcon className="h-3 w-3" />
        </span>
      ) : isNote ? (
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
          {isStaff ? (
            <>
              <span className={cn("inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold", staff.badge)}>
                {staff.label}
              </span>
              <span className="text-[12.5px] font-bold text-slate-900">{item.staffName || staff.subject}</span>
              {item.startDate && (
                <span className="text-[11px] font-semibold tabular-nums text-slate-500">
                  {fmtDate(item.startDate)}
                  {item.endDate && item.endDate !== item.startDate ? ` ~ ${fmtDate(item.endDate)}` : ""}
                </span>
              )}
              <ScopeBadge item={item} />
            </>
          ) : (
            <>
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
              <ScopeBadge item={item} />
              <CustomerNo no={item.customerNo} onSearch={onSearch} />
              {!isNote && onUpdate && <DateControl item={item} onUpdate={onUpdate} />}
            </>
          )}
        </div>
        <p
          className={cn(
            "mt-0.5 whitespace-pre-wrap break-words text-[12.5px] leading-relaxed text-slate-700",
            done && "line-through",
            compact && "line-clamp-2"
          )}
        >
          {item.memo}
        </p>
      </div>

      {onRemove && (
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
      )}
    </li>
  );
};

/* 기록 유형 — 할 일 / 고객 메모 / 휴가 계획 / 연수 계획.
   할 일=날짜·완료 있는 후속 연락, 고객 메모=기억용(날짜·완료 없음),
   휴가·연수 계획=담당자·기간의 지점 공유 일정. */
const CATS = [
  { id: "todo", label: "할 일", icon: CalendarClock },
  { id: "note", label: "고객 메모", icon: StickyNote },
  { id: "branch", label: "지점 일정", icon: Building2 },
  { id: "leave", label: "휴가 계획", icon: Plane },
  { id: "training", label: "연수 계획", icon: GraduationCap },
];

/* 한 번 클릭으로 달력이 바로 열리게(브라우저 지원 시). 세그먼트 직접 입력도 그대로 됨. */
const openPicker = (e) => e.currentTarget.showPicker?.();

const DateField = ({ value, onChange, className }) => (
  <input
    type="date"
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    onClick={openPicker}
    onFocus={openPicker}
    className={cn(
      "rounded-md border border-slate-300 px-2.5 py-1.5 text-[13px] text-slate-700 focus:border-im-500 focus:outline-none",
      className
    )}
  />
);

export const FollowupForm = ({ onAdd, defaultDate = "", allowed }) => {
  const cats = allowed ? CATS.filter((c) => allowed.includes(c.id)) : CATS;
  const [cat, setCat] = useState(cats[0]?.id ?? "todo");
  const [customerNo, setCustomerNo] = useState("");
  const [staffName, setStaffName] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(defaultDate); // 할 일 연락일(선택)
  const [startDate, setStartDate] = useState(defaultDate);
  const [endDate, setEndDate] = useState(defaultDate);
  const [shared, setShared] = useState(false);

  /* 달력에서 날짜를 고르면 폼에 반영(할 일 연락일·휴가/연수 시작일) */
  const [lastDefault, setLastDefault] = useState(defaultDate);
  if (defaultDate !== lastDefault) {
    setLastDefault(defaultDate);
    setDate(defaultDate);
    setStartDate(defaultDate);
    if (defaultDate && (!endDate || endDate < defaultDate)) setEndDate(defaultDate);
  }

  const isStaff = cat === "leave" || cat === "training" || cat === "branch";
  const isNote = cat === "note";
  const subjectLabel = cat === "branch" ? "일정 제목" : "담당자 이름";
  const canAdd = isStaff
    ? staffName.trim().length > 0 && !!startDate
    : memo.trim().length > 0 || customerNo.trim().length > 0;

  const submit = () => {
    if (!canAdd) return;
    onAdd({
      category: cat,
      customerNo: isStaff ? "" : customerNo,
      staffName: isStaff ? staffName : "",
      memo,
      followUpDate: cat === "todo" ? date || null : null,
      startDate: isStaff ? startDate : null,
      endDate: isStaff ? endDate || startDate : null,
      scope: shared ? "branch" : "mine",
    });
    setCustomerNo("");
    setStaffName("");
    setMemo("");
    setDate(defaultDate);
    setStartDate(defaultDate);
    setEndDate(defaultDate);
    /* 유형·공유 설정은 유지 */
  };

  return (
    <div className="space-y-2.5">
      {/* 유형 선택 */}
      <div className="flex flex-wrap gap-1">
        {cats.map((c) => {
          const Icon = c.icon;
          const on = cat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-semibold transition-colors",
                on ? "bg-slate-900 text-white" : "bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:text-slate-800"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {c.label}
            </button>
          );
        })}
      </div>

      {isStaff ? (
        /* 지점 일정/휴가/연수 — 제목(담당자) + 기간(시작~종료), 지점 공유 고정 */
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            placeholder={subjectLabel}
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-[13px] focus:border-im-500 focus:outline-none sm:w-36"
          />
          <div className="flex items-center gap-1.5">
            <DateField value={startDate} onChange={setStartDate} className="w-full sm:w-36" />
            <span className="text-[12px] text-slate-400">~</span>
            <DateField
              value={endDate}
              onChange={(v) => setEndDate(v < startDate ? startDate : v)}
              className="w-full sm:w-36"
            />
          </div>
          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-teal-600">
            <Users className="h-3 w-3" /> 지점 공유
          </span>
        </div>
      ) : (
        /* 할 일 / 고객 메모 — 고객번호 + (할 일만) 연락일 */
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={customerNo}
            onChange={(e) => setCustomerNo(e.target.value.replace(/\D/g, "").slice(0, 9))}
            inputMode="numeric"
            maxLength={9}
            placeholder="고객번호 9자리 (선택)"
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-[13px] tabular-nums focus:border-im-500 focus:outline-none sm:w-44"
          />
          {!isNote && (
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-slate-500">연락일</span>
              <DateField value={date} onChange={setDate} className="w-full sm:w-40" />
              {date && (
                <button
                  type="button"
                  onClick={() => setDate("")}
                  className="flex-shrink-0 rounded-md px-2 py-1 text-[11.5px] font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  지우기
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        rows={2}
        placeholder={
          isStaff
            ? "메모 (선택 · 예: 오전 반차 / 본점 집합교육)"
            : isNote
            ? "기억할 고객 특징 (예: 매장 확장 준비 중)"
            : "메모 (예: 방카 만기자금 재예치 상담)"
        }
        className="w-full resize-y rounded-md border border-slate-300 px-2.5 py-1.5 text-[13px] leading-relaxed focus:border-im-500 focus:outline-none"
      />

      <div className="flex items-center justify-between">
        {isStaff ? (
          <span className="text-[11px] text-slate-400">지점 전원이 함께 봅니다</span>
        ) : (
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] text-slate-600">
            <input
              type="checkbox"
              checked={shared}
              onChange={(e) => setShared(e.target.checked)}
              className="h-3.5 w-3.5 accent-teal-600"
            />
            <Users className="h-3.5 w-3.5 text-teal-600" /> 지점 공유
            <span className="text-[11px] text-slate-400">(같은 지점 직원이 함께 봅니다)</span>
          </label>
        )}
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
  );
};

export const PrivacyNotice = () => (
  <p className="text-[10.5px] leading-relaxed text-slate-600">
    고객번호·메모만 기록 · <strong>이름·주민번호·연락처 등 개인정보 입력 금지.</strong>
  </p>
);
