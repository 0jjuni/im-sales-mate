import { counselPriorities, proposalSummary, relevantProduct, settlementStatus } from "./data/diagnosisCounsel";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  UserRound,
  Building2,
  AlertTriangle,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Layers,
  Info,
  BadgePercent,
  MessageSquareText,
  Megaphone,
  CalendarClock,
  CreditCard,
  X,
  Landmark,
  Sparkles,
  Split,
} from "lucide-react";
import { HubShell } from "./HubShell";
import { CardDeductionGuide } from "@card/components/CardDeductionGuide";
import { queryEligibility } from "@card/data/cardEligibility";
import { useFollowups } from "./followups/useFollowups";
import { FollowupRow } from "./followups/parts";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";
import {
  queryGrossTax,
  deriveStrategy,
  viewProduct,
  targetGuidance,
  SOURCES,
  PRODUCT_STATE,
  INCOME_TYPES,
  NONTAX_QUALS,
  SAMPLE_CUSTOMERS,
  EXCLUDED_PRODUCTS,
  DISADVANTAGES,
  STRATEGY_FRAME,
} from "./data/grossTax";

/* 금융소득 종합과세 관리 — 고객번호 하나로 통합 조회 + 맞춤 절세 전략.
   지금은 0192-1·0192-8·노란우산 등 여러 화면에서 따로 봐야 하는 정보를 여기로 통합한다. */

const STATE_CLASS = {
  im: { card: "border-im-200 bg-im-50/40", badge: "bg-im-100 text-im-700" },
  amber: { card: "border-amber-200 bg-amber-50/50", badge: "bg-amber-100 text-amber-800" },
  rose: { card: "border-rose-200 bg-rose-50/50", badge: "bg-rose-100 text-rose-700" },
  slate: { card: "border-slate-200 bg-white", badge: "bg-slate-100 text-slate-600" },
  prompt: { card: "border-dashed border-slate-300 bg-slate-50/60", badge: "bg-slate-100 text-slate-500" },
};

/* 종합과세 대상 판정 배너 */
const VerdictBanner = ({ data }) => {
  const j = data.jonghap;
  const pct = Math.min(100, Math.round((j.financialIncome / j.threshold) * 100));
  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-[16px] font-bold text-slate-900">고객 {data.customerNo}</span>
              <span className="text-[12px] text-slate-500">{data.age}</span>
            </div>
            <div className="mt-0.5 font-mono text-[12px] tabular-nums text-slate-400">{data.customerNo}</div>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-bold",
            j.isTarget ? "bg-rose-100 text-rose-700" : "bg-im-100 text-im-700"
          )}
        >
          {j.isTarget ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          {j.taxYear}년 {j.isTarget ? "종합과세 대상" : "비대상"}
        </span>
      </div>

      <div className="grid gap-4 px-5 py-4 sm:grid-cols-3">
        {/* 금융소득 vs 기준 */}
        <div className="sm:col-span-2">
          <div className="flex items-baseline justify-between text-[12px]">
            <span className="text-slate-500">당해 금융소득 (이자·배당 합산)</span>
            <span className="tabular-nums text-slate-400">기준 {j.threshold.toLocaleString()}만원</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={cn("text-[24px] font-bold tabular-nums", j.isTarget ? "text-rose-600" : "text-slate-900")}>
              {j.financialIncome.toLocaleString()}
            </span>
            <span className="text-[13px] text-slate-500">만원</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full", j.isTarget ? "bg-rose-500" : pct > 80 ? "bg-amber-400" : "bg-im-500")}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            기준 대비 {pct}%{!j.isTarget && pct > 80 && " · 기준 근접, 시기 분산 관리 필요"}
          </div>
        </div>

        {/* 관할 세무서 */}
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Building2 className="h-3.5 w-3.5" />
            소득 관할 세무서
          </div>
          <div className="mt-1 text-[15px] font-bold text-slate-900">{j.taxOffice}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">종합소득세 신고 시 관할</div>
        </div>
      </div>

      {/* 직전 3년 이력 + 가입 제한 */}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3">
        <span className="text-[11px] font-semibold text-slate-400">직전 3년 이력</span>
        {j.history.map((h) => (
          <span
            key={h.year}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums",
              h.isTarget ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"
            )}
          >
            {h.year} {h.isTarget ? "대상" : "비대상"}
          </span>
        ))}
        {j.restrictedByHistory && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-100">
            <AlertTriangle className="h-3 w-3" />
            비과세종합저축·ISA 가입/연장 제한
          </span>
        )}
      </div>
    </div>
  );
};

/* 각 상품이 상태 판단에 필요로 하는 확인 항목 — 상단에서 한꺼번에 캐묻지 않고
   그 상품 카드에서 필요한 것만 인라인으로 물어본다. 채우면 사라진다(전역 manual 공유). */
const PRODUCT_MANUAL_NEEDS = {
  nontaxSavings: ["nontaxQual"],
};
const FIELD_LABEL = {
  incomeType: "소득 유형",
  homeless: "무주택 세대주",
  salaryUnder7000: "총급여 7천만원 이하",
  nontaxQual: "비과세종합저축 자격",
};

const ManualControl = ({ field, manual, set }) => {
  if (field === "incomeType")
    return (
      <div className="flex flex-wrap gap-1">
        {INCOME_TYPES.map((t) => (
          <SegBtn key={t} active={manual.incomeType === t} onClick={() => set("incomeType", t)}>
            {t}
          </SegBtn>
        ))}
      </div>
    );
  if (field === "homeless") return <YesNo value={manual.homeless} onChange={(v) => set("homeless", v)} />;
  if (field === "salaryUnder7000") return <YesNo value={manual.salaryUnder7000} onChange={(v) => set("salaryUnder7000", v)} />;
  if (field === "nontaxQual")
    return (
      <select
        value={manual.nontaxQual ?? ""}
        onChange={(e) => set("nontaxQual", e.target.value || null)}
        className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 focus:border-im-500 focus:outline-none"
      >
        <option value="">선택</option>
        {NONTAX_QUALS.map((q) => (
          <option key={q} value={q}>
            {q}
          </option>
        ))}
      </select>
    );
  return null;
};

/* 상담 중 확인한 값 표시·수정 — 확인란은 답하면 인라인에서 사라지지만,
   여기 요약 칩으로 남겨 언제든 변경·지울 수 있게 한다(지우면 원래 질문이 다시 나타남). */
const CONFIRM_FIELDS = ["incomeType", "homeless", "salaryUnder7000", "nontaxQual"];
const confirmDisplay = (f, v) => {
  if (v == null) return null;
  if (f === "homeless" || f === "salaryUnder7000") return v ? "예" : "아니오";
  return v;
};

const ConfirmedChips = ({ manual, onChange }) => {
  const [editing, setEditing] = useState(null);
  const set = (k, v) => onChange({ ...manual, [k]: v });
  const answered = CONFIRM_FIELDS.filter((f) => manual[f] != null);
  if (answered.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
        <MessageSquareText className="h-3 w-3" />
        상담에 적용한 항목
        <span className="font-normal text-slate-400">잘못 골랐다면 변경·지우기로 수정하세요</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {answered.map((f) =>
          editing === f ? (
            <div key={f} className="flex flex-wrap items-center gap-2 rounded-lg border border-im-300 bg-white px-2.5 py-2">
              <span className="text-[11px] font-semibold text-slate-500">{FIELD_LABEL[f]}</span>
              <ManualControl
                field={f}
                manual={manual}
                set={(k, v) => {
                  set(k, v);
                  setEditing(null);
                }}
              />
              <button onClick={() => setEditing(null)} className="rounded px-1.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600">
                취소
              </button>
            </div>
          ) : (
            <div key={f} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1 pl-2.5 pr-1.5">
              <span className="text-[11px] text-slate-500">{FIELD_LABEL[f]}</span>
              <span className="text-[12px] font-bold text-slate-800">{confirmDisplay(f, manual[f])}</span>
              <button onClick={() => setEditing(f)} className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-im-600 hover:bg-im-50">
                변경
              </button>
              <button onClick={() => set(f, null)} aria-label="지우기" className="rounded p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-500">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const COUNSEL_STATUS = {
  propose: { label: "제안 가능", frame: "border-im-300 bg-im-50/30", badge: "bg-im-700 text-white" },
  check: { label: "추가 확인 필요", frame: "border-amber-300 bg-amber-50/30", badge: "bg-amber-100 text-amber-900" },
  restricted: { label: "신규·연장 제한", frame: "border-rose-300 bg-rose-50/30", badge: "bg-rose-700 text-white" },
  excluded: { label: "권유 대상 아님", frame: "border-slate-300 bg-slate-50", badge: "bg-slate-200 text-slate-700" },
  held: { label: "유지 관리", frame: "border-slate-200 bg-white", badge: "bg-slate-100 text-slate-600" },
};
function productCounselStatus(p, manual, restricted) {
  if(p.state === "restricted" || (p.key === "nontaxSavings" && restricted && !p.held)) return COUNSEL_STATUS.restricted;
  if(p.state === "none") return COUNSEL_STATUS.excluded;
  if(p.state === "unknown" || (p.key === "housing" && !p.held && (manual.homeless == null || manual.salaryUnder7000 == null))) return COUNSEL_STATUS.check;
  return ["recommend", "available"].includes(p.state) ? COUNSEL_STATUS.propose : COUNSEL_STATUS.held;
}

const ProductCard = ({ product, manual, onManual, compact = false }) => {
  const src = SOURCES[product.key];
  const set = (k, v) => onManual({ ...manual, [k]: v });
  const needs = (PRODUCT_MANUAL_NEEDS[product.key] || []).filter((f) => manual[f] == null);
  const st = PRODUCT_STATE[product.state];
  const cls = STATE_CLASS[st.tone];
  const sell = st.sell;
  const metrics = needs.length ? [] : (product.metrics || []).filter(m => !compact || !["혜택", "미보유"].includes(m.label));
  if (compact) {
    const primary = metrics.find(m=>m.strong) || metrics[0];
    const secondary = metrics.filter(m=>m!==primary);
    const emptyCard = ["cardPersonal", "cardBiz"].includes(product.key) && product.held === false;
    return <div className="mt-4 border-t border-slate-100 pt-4">
      {needs.length ? <div><p className="mb-3 text-sm font-semibold text-slate-600">가입 자격 확인</p>{needs.map(f=><div key={f}><ManualControl field={f} manual={manual} set={set}/></div>)}</div> : emptyCard ? <><p className="text-sm text-slate-500">당행 보유 카드</p><p className="mt-1 text-2xl font-bold text-slate-900">0개</p><p className="mt-3 text-sm text-slate-500">타행 카드 보유 여부는 별도 확인</p></> : <>
        {primary&&<><p className="text-sm text-slate-500">{primary.label}</p><p className="mt-1 break-words text-2xl font-bold leading-8 text-slate-900">{primary.value}</p></>}
        {!primary&&<p className="text-lg font-semibold text-slate-700">{st.label}</p>}
        {secondary.length>0&&<dl className="mt-3 space-y-2">{secondary.map((m,i)=><div key={i} className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm"><dt className="text-slate-500">{m.label}</dt><dd className="font-semibold text-slate-800">{m.value}</dd></div>)}</dl>}
        {product.cards?.length>0&&<ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">{product.cards.map((c,i)=><li key={i} className="flex flex-wrap justify-between gap-1 text-sm"><span className="font-medium text-slate-700">{c.name}</span><span className="font-semibold text-slate-800">월 {c.monthly.toLocaleString()}만원</span></li>)}</ul>}
      </>}
    </div>;
  }
  const hero = metrics.find((m) => m.strong);
  const rest = metrics.filter((m) => !m.strong);
  return (
    <div className={compact ? "border-t border-slate-100 pt-3" : cn("rounded-xl border p-4", cls.card, sell && "ring-1 ring-im-200")}>
      {!compact && <>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[14px] font-bold text-slate-900">{src.label}</h3>
        <div className="flex flex-shrink-0 items-center gap-1">
          {sell && <span className="rounded bg-im-600 px-1.5 py-0.5 text-[10px] font-bold text-white">권유</span>}
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", cls.badge)}>{st.label}</span>
        </div>
      </div>
      </>}

      {hero && (!compact || !product.remaining) && (
        <div className="mt-3">
          <div className="text-[11px] text-slate-500">{hero.label}</div>
          <div className={cn("text-[20px] font-bold leading-tight tabular-nums", sell ? "text-im-700" : "text-slate-900")}>
            {hero.value}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <dl className="mt-2 space-y-1">
          {rest.map((m, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-[12px]">
              <dt className="text-slate-500">{m.label}</dt>
              <dd className="tabular-nums font-semibold text-slate-800">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {product.cards && product.cards.length > 0 && (
        <ul className="mt-2 space-y-1 border-t border-slate-200/70 pt-2">
          {product.cards.map((c, i) => (
            <li key={i} className="flex items-center justify-between gap-2 text-[12px]">
              <span className="min-w-0 truncate text-slate-700">
                <span className="font-semibold">{c.name}</span>
                <span className="ml-1 text-[10px] text-slate-400">{c.brand} · {c.type}</span>
              </span>
              <span className="flex-shrink-0 tabular-nums font-semibold text-slate-800">월 {c.monthly.toLocaleString()}만원</span>
            </li>
          ))}
        </ul>
      )}

      {product.note && !compact && (
        <p className="mt-2 border-t border-slate-200/70 pt-2 text-[11.5px] leading-relaxed text-slate-500">
          {product.note}
        </p>
      )}

      {needs.length > 0 && (
        <div className="mt-2.5 space-y-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <MessageSquareText className="h-3 w-3" />
            고객에게 확인
          </div>
          {needs.map((f) => (
            <div key={f}>
              <div className="mb-1 text-[11px] font-semibold text-slate-600">{FIELD_LABEL[f]}</div>
              <ManualControl field={f} manual={manual} set={set} />
            </div>
          ))}
        </div>
      )}

      {/* 개인 신용카드 보유·활용 중이면 소득공제 계산을 여기서 바로 */}

      {product.cta && !compact && (
        <Link
          to={product.cta.to}
          className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-im-600 px-2.5 py-1.5 text-[11.5px] font-bold text-white transition-colors hover:bg-im-700"
        >
          {product.cta.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
};

const STRATEGY_KIND = {
  warn: { wrap: "border-amber-200 bg-amber-50/60", icon: AlertTriangle, iconColor: "text-amber-600", tag: "bg-amber-100 text-amber-800" },
  action: { wrap: "border-slate-200 bg-white", icon: ArrowRight, iconColor: "text-im-600", tag: "bg-im-100 text-im-700" },
  sell: { wrap: "border-im-300 bg-im-50/70 ring-1 ring-inset ring-im-100", icon: BadgePercent, iconColor: "text-im-600", tag: "bg-im-600 text-white" },
  ok: { wrap: "border-im-200 bg-im-50/50", icon: Check, iconColor: "text-im-600", tag: "bg-im-100 text-im-700" },
  prompt: { wrap: "border-dashed border-slate-300 bg-slate-50/60", icon: Info, iconColor: "text-slate-400", tag: "bg-slate-100 text-slate-500" },
};

const StrategyItem = ({ item, children }) => {
  const k = STRATEGY_KIND[item.kind] || STRATEGY_KIND.action;
  const Icon = k.icon;
  return (
    <li className={cn("flex gap-3 rounded-xl border p-3.5", k.wrap)}>
      <Icon className={cn("mt-0.5 h-4 w-4 flex-shrink-0", k.iconColor)} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0 sm:flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", k.tag)}>{item.tag}</span>
              <h4 className="text-[13.5px] font-bold text-slate-900">{item.title}</h4>
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{item.detail}</p>
          </div>
          {item.cta && (
            <Link
              to={item.cta.to}
              className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-im-300 bg-white px-4 py-2.5 text-[13px] font-bold text-im-700 shadow-sm transition-colors hover:border-im-400 hover:bg-im-50 sm:self-auto"
            >
              {item.cta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        {children}
      </div>
    </li>
  );
};

const SegBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={cn(
      "rounded-md border px-3 py-1.5 text-[12px] font-semibold transition-colors",
      active ? "border-im-500 bg-im-500 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
    )}
  >
    {children}
  </button>
);

const YesNo = ({ value, onChange }) => (
  <div className="flex gap-1">
    <SegBtn active={value === true} onClick={() => onChange(true)}>예</SegBtn>
    <SegBtn active={value === false} onClick={() => onChange(false)}>아니오</SegBtn>
  </div>
);

const ManualField = ({ label, hint, children }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-baseline gap-1.5">
      <span className="text-[12.5px] font-semibold text-slate-700">{label}</span>
      {hint && <span className="text-[11px] font-normal text-slate-400">{hint}</span>}
    </div>
    {children}
  </div>
);

/* 상담 시 확인하는 값 — 소득 유형·무주택 세대주·비과세종합저축 자격 */
const ManualPanel = ({ manual, onChange, autoIncome = false }) => {
  const set = (k, v) => onChange({ ...manual, [k]: v });
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="mb-2.5 flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
        <MessageSquareText className="h-3.5 w-3.5" />
        고객에게 확인
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        <ManualField label="소득 유형" hint={autoIncome ? "노란우산 보유 → 개인사업자 자동 분류" : "노란우산·연금·기업카드 자격 판단"}>
          <div className="flex flex-wrap gap-1">
            {INCOME_TYPES.map((t) => (
              <SegBtn key={t} active={manual.incomeType === t} onClick={() => set("incomeType", t)}>
                {t}
              </SegBtn>
            ))}
          </div>
        </ManualField>
        <ManualField label="무주택 세대주" hint="주택청약 소득공제 대상 판단">
          <YesNo value={manual.homeless} onChange={(v) => set("homeless", v)} />
        </ManualField>
        <ManualField label="총급여 7천만원 이하" hint="청약·카드 소득공제 한도 판단">
          <YesNo value={manual.salaryUnder7000} onChange={(v) => set("salaryUnder7000", v)} />
        </ManualField>
        <ManualField label="비과세종합저축 자격" hint="비과세종합저축 가입 대상 판단">
          <select
            value={manual.nontaxQual ?? ""}
            onChange={(e) => set("nontaxQual", e.target.value || null)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 focus:border-im-500 focus:outline-none"
          >
            <option value="">선택</option>
            {NONTAX_QUALS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </ManualField>
      </div>
    </div>
  );
};

const SectionTitle = ({ icon: Icon, children, sub }) => (
  <div className="mb-3 flex items-center gap-2.5">
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-im-50 text-im-600">
      <Icon className="h-[17px] w-[17px]" />
    </div>
    <div>
      <h2 className="text-[16px] font-bold tracking-tight text-slate-900">{children}</h2>
      {sub && <p className="text-[11.5px] text-slate-500">{sub}</p>}
    </div>
  </div>
);

/* 고객 메모 — 이 고객에게 남긴 메모·할 일을 진단 화면에서 바로 남기고 확인한다.
   개인 메모(나만 보기)·지점 공유 메모를 그 자리에서 추가하고, 일정 관리와 그대로 연동된다. */
function CustomerFollowups({ no }) {
  const { items, add, toggleDone, update, remove } = useFollowups();
  const [memo, setMemo] = useState("");
  const [scope, setScope] = useState("mine"); // mine | branch
  const mine = items
    .filter((i) => i.customerNo === no && (i.category === "todo" || i.category === "note"))
    .sort((a, b) => {
      const rank = (i) => (i.category === "note" ? 2 : i.status === "done" ? 3 : 0);
      return rank(a) - rank(b) || (a.followUpDate || "").localeCompare(b.followUpDate || "") || (b.createdAt ?? 0) - (a.createdAt ?? 0);
    });

  const submit = () => {
    const t = memo.trim();
    if (!t) return;
    add({ category: "note", scope, customerNo: no, memo: t });
    setMemo("");
  };

  return (
    <section>
      <SectionTitle icon={MessageSquareText} sub="이 고객에게 남긴 메모·할 일 (일정 관리와 연동)">
        고객 메모
      </SectionTitle>

      {/* 빠른 메모 추가 — 개인/지점 공유 */}
      <div className={cn(CARD, "mb-3 space-y-2.5 p-3")}>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          rows={2}
          placeholder="이 고객 관련 메모를 남기세요 (상담 내용·특이사항 등)"
          className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-[13px] leading-relaxed focus:border-im-500 focus:outline-none"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <SegBtn active={scope === "mine"} onClick={() => setScope("mine")}>나만 보기</SegBtn>
            <SegBtn active={scope === "branch"} onClick={() => setScope("branch")}>지점 공유</SegBtn>
          </div>
          <button
            onClick={submit}
            disabled={!memo.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-im-600 px-3.5 py-1.5 text-[12.5px] font-bold text-white transition-colors hover:bg-im-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            메모 추가
          </button>
        </div>
        <p className="text-[11px] text-slate-400">개인정보(이름·연락처)는 남기지 마세요. 고객번호 {no} 기준으로 기록됩니다.</p>
      </div>

      {mine.length === 0 ? (
        <div className={cn(CARD, "flex flex-wrap items-center justify-between gap-2 px-4 py-3")}>
          <span className="text-[12.5px] text-slate-500">아직 이 고객으로 남긴 메모·할 일이 없습니다. 위에서 첫 메모를 남겨 보세요.</span>
          <Link to="/followups" className="inline-flex items-center gap-1 text-[12px] font-semibold text-im-700 hover:underline">
            일정 관리 열기 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className={cn(CARD, "overflow-hidden")}>
          <ul className="divide-y divide-slate-100 py-1">
            {mine.map((item) => (
              <FollowupRow key={item.id} item={item} onToggle={toggleDone} onUpdate={update} onRemove={remove} />
            ))}
          </ul>
          <Link
            to="/followups"
            className="block border-t border-slate-100 px-3 py-2 text-center text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-im-700"
          >
            일정 관리에서 전체 보기·추가 →
          </Link>
        </div>
      )}
    </section>
  );
}

/* 예금·수신 만기 관리 — 고객이 보유한 정기예금·적금의 금리·만기를 관리하고,
   만기 임박 자금은 저축성보험(비과세) 등 다른 상품으로 이전 상담을 연결한다. */
const NEAR_DAYS = 30; // 만기 임박 기준(일)

const matDateStr = (days) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};
const ddayLabel = (days) => (days < 0 ? `만기 지남 ${-days}일` : days === 0 ? "오늘 만기" : `D-${days}`);

function DepositSection({ data }) {
  const deposits = data.deposits || [];
  if (deposits.length === 0) return null;
  const rows = [...deposits].sort((a, b) => a.maturityInDays - b.maturityInDays);
  const near = rows.filter((d) => d.maturityInDays <= NEAR_DAYS);
  const nearTotal = near.reduce((s, d) => s + (d.balance || 0), 0);
  const restricted = data.jonghap.isTarget || data.jonghap.restrictedByHistory;
  const total = rows.reduce((s, d) => s + (d.balance || 0), 0);
  const [horizon, setHorizon] = useState(null); // 만기 자금 예치 가능 기간: short/mid/long

  return (
    <section>
      <SectionTitle icon={Landmark} sub="정기예금·적금 만기·금리·만기처리를 관리하고, 만기 임박 자금은 예치 기간에 맞는 상품으로 연계하세요">
        예금·수신 만기 관리
      </SectionTitle>
      <div className={cn(CARD, "overflow-hidden")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-400">
                <th className="px-4 py-2.5 font-semibold">상품</th>
                <th className="px-4 py-2.5 text-right font-semibold">잔액</th>
                <th className="px-4 py-2.5 text-right font-semibold">금리</th>
                <th className="px-4 py-2.5 text-right font-semibold">만기일</th>
                <th className="px-4 py-2.5 text-right font-semibold">잔여기간</th>
                <th className="px-4 py-2.5 text-right font-semibold">만기처리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((d, i) => {
                const isNear = d.maturityInDays <= NEAR_DAYS;
                const autoRoll = d.maturityAction === "자동재예치";
                return (
                  <tr key={i} className={cn(isNear && "bg-amber-50/40")}>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[13px] font-bold text-slate-800">{d.name || d.type}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{d.type}</span>
                        {isNear && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">만기 임박</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-[13px] font-semibold tabular-nums text-slate-900">
                      {d.balance.toLocaleString()}만원
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-[12.5px] tabular-nums text-slate-600">{d.rate.toFixed(1)}%</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-[12.5px] tabular-nums text-slate-600">{matDateStr(d.maturityInDays)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <span
                        className={cn(
                          "inline-block rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                          isNear ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {ddayLabel(d.maturityInDays)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <span
                        className={cn(
                          "inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold",
                          autoRoll && isNear ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"
                        )}
                        title={autoRoll && isNear ? "만기 임박 · 자동재예치 예정, 적용 금리와 고객 의사 확인" : undefined}
                      >
                        {d.maturityAction || "미지정"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50/70 text-[12px]">
                <td className="px-4 py-2.5 font-semibold text-slate-500">합계 {rows.length}건</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right font-bold tabular-nums text-slate-900">{total.toLocaleString()}만원</td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          </table>
        </div>

        {near.length > 0 && (
          <div className="border-t border-slate-100 bg-im-50/40 px-4 py-3.5">
            <div className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-im-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] leading-relaxed text-slate-700">
                  <span className="font-bold text-im-700">
                    만기 임박 {near.length}건 · 합계 {nearTotal.toLocaleString()}만원
                  </span>{" "}
                  — 만기 후 이 자금을 <b className="text-slate-800">얼마나 더 둘 수 있는지</b> 확인해 예치 기간에 맞는 상품으로 이전하세요.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    ["short", "3년 미만"],
                    ["mid", "3~5년"],
                    ["long", "5년 이상"],
                  ].map(([k, l]) => (
                    <SegBtn key={k} active={horizon === k} onClick={() => setHorizon(k)}>
                      {l}
                    </SegBtn>
                  ))}
                </div>
                {horizon && <MaturityAdvice horizon={horizon} restricted={restricted} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* 만기 자금 예치 기간별 이전 상품 안내 — 3~5년→ISA, 5년+ (해약 없이)→저축성보험(10년 비과세). */
function MaturityAdvice({ horizon, restricted }) {
  let title, detail, cta;
  if (horizon === "short") {
    title = "단기 — 절세 상품보다 유동성·금리 우선";
    detail =
      "ISA(의무 3년)·저축성보험(10년) 모두 의무보유기간이 있어 3년 미만 자금엔 부적합합니다. 특판 정기예금 재예치나 파킹형 상품으로 금리를 비교해 관리하세요.";
  } else if (horizon === "mid") {
    if (restricted) {
      title = "3~5년 — ISA 신규가입 제한 고객, 분리과세 상품으로 대체";
      detail =
        "종합과세 대상·이력으로 ISA 신규가입이 제한됩니다. 분리과세형 상품(채권·ELS 등)이나 만기 자금을 나눠 담는 방식으로 과세 이자를 낮추도록 설계하세요.";
    } else {
      title = "3~5년 — ISA로 이전";
      detail =
        "의무보유 3년인 ISA가 적합합니다. 서민형은 순이익 400만원까지 비과세, 초과분도 9.9% 분리과세라 만기 자금의 예치처로 유리합니다.";
      cta = { to: "/isa", label: "ISA 상담 시작" };
    }
  } else {
    title = "5년 이상 (해약 없이) — 저축성보험으로 이전";
    detail =
      "계약 10년 이상 유지 시 보험차익이 비과세되는 일시납 저축성보험이 적합합니다. 장기간 해약하지 않을 자금이라면 과세되는 예금 이자를 비과세 구조로 돌릴 수 있습니다.";
  }
  return (
    <div className="mt-2.5 rounded-lg border border-im-200 bg-white p-3">
      <p className="text-[12.5px] font-bold text-im-700">{title}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{detail}</p>
      {cta && (
        <Link
          to={cta.to}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-im-300 bg-white px-3 py-1.5 text-[12px] font-bold text-im-700 transition-colors hover:border-im-400 hover:bg-im-50"
        >
          {cta.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

/* 신용카드 발급 요건 — 넥스피아 4개 요건으로 「이 요건으로 발급 가능한지」만 표시.
   실제 발급은 계정계 종합 심사 기준이며, 여기선 요건별 가능/불가만 보여 준다. */
function CardEligibilitySection({ no, embedded = false, bare = false }) {
  const e = queryEligibility(no);
  if (!e) return null;
  const inner = (
      <div className={cn(CARD, "overflow-hidden")}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <span className="text-[12.5px] font-semibold text-slate-500">발급 요건 조회 (4종)</span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-bold",
              e.eligible ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            )}
          >
            {e.eligible ? <ShieldCheck className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            {e.eligible ? `발급 가능 · ${e.metCount}개 충족` : "충족 요건 없음"}
          </span>
        </div>
        <ul className="divide-y divide-slate-100">
          {e.requirements.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-5 py-3">
              <span
                className={cn(
                  "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
                  r.met ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-300"
                )}
              >
                {r.met ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-slate-900">{r.name}</div>
                <div className="mt-0.5 text-[11px] text-slate-400">{r.criteria}</div>
              </div>
              <span
                className={cn(
                  "flex-shrink-0 rounded px-2 py-0.5 text-[11.5px] font-bold",
                  r.met ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                )}
              >
                {r.met ? "가능" : "불가"}
              </span>
            </li>
          ))}
        </ul>
      </div>
  );

  if (bare) return inner;

  if (embedded)
    return (
      <div className="mt-4">
        <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[12.5px] font-bold text-slate-600">
          <CreditCard className="h-3.5 w-3.5 text-slate-500" /> 개인 신용카드 발급 요건
        </div>
        {inner}
      </div>
    );

  return (
    <section>
      <SectionTitle icon={CreditCard} sub="요건별 발급 가능 여부">
        개인 신용카드 발급 요건
      </SectionTitle>
      {inner}
    </section>
  );
}

/* 참고 자료 — 접이식 */
const ReferenceGuide = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-5 py-3.5 text-left hover:bg-slate-50"
      >
        <span className="flex items-center gap-2.5">
          <Info className="h-4 w-4 text-slate-400" />
          <span className="text-[14px] font-bold text-slate-900">참고: 종합과세 제외 상품 · 불이익 · 절세 전략</span>
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>

      {open && (
        <div className="space-y-6 border-t border-slate-100 px-5 py-5">
          {/* 제외 상품 */}
          <section>
            <h3 className="mb-2 text-[13px] font-bold text-slate-800">종합과세에서 제외되는 비과세·분리과세 상품</h3>
            <ul className="space-y-1.5">
              {EXCLUDED_PRODUCTS.map((p, i) => (
                <li key={i} className="flex gap-2 text-[12.5px]">
                  <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-im-100 text-[9px] font-bold text-im-700">
                    {i + 1}
                  </span>
                  <span>
                    <span className="font-semibold text-slate-800">{p.name}</span>
                    <span className="text-slate-500">: {p.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* 불이익 */}
          <section>
            <h3 className="mb-2 text-[13px] font-bold text-slate-800">금융소득 종합과세 시 불이익</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {DISADVANTAGES.map((d, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
                  <div className="text-[12.5px] font-bold text-slate-800">{d.title}</div>
                  <div className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{d.detail}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 절세 전략 프레임 */}
          <section>
            <h3 className="mb-2 text-[13px] font-bold text-slate-800">절세 전략 프레임</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {STRATEGY_FRAME.products.map((p) => (
                <div key={p.type} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <span className="w-16 flex-shrink-0 rounded bg-slate-200 px-1.5 py-0.5 text-center text-[11px] font-bold text-slate-600">
                    {p.type}
                  </span>
                  <span className="text-[12.5px] font-semibold text-im-700">{p.items}</span>
                </div>
              ))}
            </div>
            <ul className="mt-3 space-y-1.5">
              {STRATEGY_FRAME.dispersion.map((d, i) => (
                <li key={i} className="flex gap-2 text-[12.5px]">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-im-500" />
                  <span>
                    <span className="font-semibold text-slate-800">{d.title}</span>
                    <span className="text-slate-500"> : {d.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};

/* 종합과세 대상 고객에게 상담 시 반드시 안내할 사항 */
const GuidanceForTarget = ({ data }) => (
  <div className="overflow-hidden rounded-xl border border-rose-200 bg-rose-50/40">
    <div className="flex items-center gap-2 border-b border-rose-100 px-5 py-3">
      <Megaphone className="h-4 w-4 flex-shrink-0 text-rose-600" />
      <h2 className="text-[14px] font-bold text-rose-800">고객에게 안내할 사항</h2>
      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">종합과세 대상</span>
    </div>
    <ul className="divide-y divide-rose-100/70">
      {targetGuidance(data).map((g, i) => (
        <li key={i} className="flex gap-2.5 px-5 py-2.5">
          <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-[9px] font-bold text-rose-700">
            {i + 1}
          </span>
          <div className="min-w-0">
            <div className="text-[12.5px] font-bold text-slate-800">{g.title}</div>
            <div className="mt-0.5 text-[11.5px] leading-relaxed text-slate-600">{g.detail}</div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

/* 타행 가맹점 결제계좌 — 당행 상품은 아니지만 '지금 이용 중'인 현황이라 활용 현황에 함께 노출.
   당행 전환 유치 대상임을 표시(아래 맞춤 제안과 연결). */
function MerchantSettlementCard({ m }) {
  const state=settlementStatus(m);
  const status=state==="other"?COUNSEL_STATUS.propose:state==="own"?COUNSEL_STATUS.held:state==="unregistered"?COUNSEL_STATUS.excluded:COUNSEL_STATUS.check;
  const label={own:"당행 이용 중",other:"타행 이용 중",unknown:"조회 정보 누락",unregistered:"POS 미등록"}[state];
  return <div className={cn("h-full min-h-[210px] rounded-xl border p-4",status.frame)}><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-base font-bold text-slate-900">가맹점 결제계좌</h3><span className={cn("rounded px-2 py-1 text-xs font-bold",status.badge)}>{state==="other"?"당행 전환 제안 가능":status.label}</span></div><p className="mt-2 text-xs text-slate-500">{label}</p><div className="mt-4 border-t border-slate-100 pt-4"><p className="text-sm text-slate-500">현재 카드매출 결제은행</p><p className="mt-1 text-2xl font-bold leading-8 text-slate-800">{state==="unregistered"?"등록 계좌 없음":m?.bank||"조회 필요"}</p></div></div>;
}

/* 조회 결과 뷰 — 전략은 deriveStrategy(사실)로 도출, A4 상담자료 인쇄 포함 */
function ResultView({ data }) {
  const j = data.jonghap;
  /* 소득 유형 자동 분류: 노란우산(소기업·소상공인 전용) 보유 또는 가맹점 결제계좌 보유 = 개인사업자,
     그다음 카드 발급 요건의 '급여 소득자'가 충족되면 = 근로소득자(급여 입금 확인됨).
     둘 다 아니면 미확인으로 두고 상담하며 채운다. */
  const noranHeld = data.products.some((p) => p.key === "noran" && p.held);
  const hasMerchant = !!data.merchantSettlement?.bank;
  const salaryEarner = queryEligibility(data.customerNo)?.requirements.find((r) => r.id === "salary")?.met;
  const autoIncome = noranHeld || hasMerchant ? "개인사업자" : salaryEarner ? "근로소득자" : null;
  const initialManual = { incomeType: autoIncome, homeless: null, salaryUnder7000: null, nontaxQual: null };
  const [manual, setManual] = useState(initialManual);
  useEffect(() => setManual(initialManual), [data.customerNo]); // eslint-disable-line react-hooks/exhaustive-deps
  /* 상품설명서(PDF)·발급요건 확인은 카드를 키우지 않고 팝업으로. {kind:'pdf'|'card'|'housing', url?, title} */
  const [modal, setModal] = useState(null);
  useEffect(() => { if (!modal) return; const onKey = (e) => e.key === "Escape" && setModal(null); window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [modal]);

  const restricted = j.isTarget || j.restrictedByHistory;
  const products = data.products.filter(p=>relevantProduct(p, manual.incomeType)).map((p) => viewProduct(p, manual, restricted));
  const strategy = deriveStrategy(data, manual);
  const priorities = counselPriorities(data, products);
  /* 전략을 성격별로 분리해 각 섹션에 배치(진단→상단, 제안→상품 옆, 분산→하단) */
  const strat = {
    진단: strategy.filter((s) => s.group === "진단"),
    제안: strategy.filter((s) => s.group === "제안"),
    분산: strategy.filter((s) => s.group === "분산"),
  };

  return (
    <div className="space-y-6">
      {/* 1) 진단 — 판정·유의 */}
      <VerdictBanner data={data} />

      {j.isTarget && <GuidanceForTarget data={data} />}

      <section className="rounded-xl border border-im-200 bg-im-50/40 p-4 sm:p-5">
        <h2 className="text-base font-bold text-slate-900">먼저 확인할 상담</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{priorities.map((item,i)=><article key={item.key} className="rounded-lg border border-im-100 bg-white p-4"><h3 className="text-sm font-bold text-slate-900">{i+1}. {item.title}</h3><p className="mt-2 text-xs leading-6 text-slate-500">조회 결과 · {item.fact}</p><p className="mt-3 text-sm font-semibold leading-6 text-im-800">“{item.question}”</p><a href={item.href} className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-im-700">{item.action} →</a></article>)}</div>
      </section>
      <ConfirmedChips manual={manual} onChange={setManual} />

      {strat.진단.length > 0 && (
        <ol className="space-y-2">
          {strat.진단.map((s, i) => (
            <StrategyItem key={i} item={s}>
              {s.manualField === "incomeType" && (
                <div className="mt-2">
                  <ManualControl field="incomeType" manual={manual} set={(k, v) => setManual({ ...manual, [k]: v })} />
                </div>
              )}
            </StrategyItem>
          ))}
        </ol>
      )}

      {/* 2) 보유 현황 — 실제 활용 중인 상품 + 예금·수신 */}
      <section id="diagnosis-products" className="scroll-mt-24">
        <SectionTitle icon={Layers} sub="당행 조회 결과 · 타행 가입 여부와 합산 납입액은 상담 시 확인">
          상품 활용 현황
        </SectionTitle>
        <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">{products.map(p=>{const status=productCounselStatus(p,manual,restricted);return <article key={p.key} className={cn("h-full min-h-[210px] rounded-xl border p-4",status.frame)}><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-base font-bold text-slate-800">{SOURCES[p.key].label.replace(" 가입 여부", "")}</h3><span className={cn("rounded px-2 py-1 text-xs font-bold",status.badge)}>{status.label}</span></div><p className="mt-2 text-xs text-slate-500">{p.held===true||p.state==="active"||p.state==="available"?"당행 보유 중":p.held===false||p.state==="recommend"?"당행 미보유":"보유·가입 상태는 아래 조회 결과 참고"}</p><ProductCard product={p} manual={manual} onManual={setManual} compact/></article>;})}

          {manual.incomeType === "개인사업자" && <MerchantSettlementCard m={data.merchantSettlement}/>}
        </div>
      </section>

      <div id="diagnosis-deposits" className="scroll-mt-24"><DepositSection data={data} /></div>

      {/* 3) 핵심 — 맞춤 상품 제안 (판매 기회 + 신용카드 발급 요건) */}
      <section id="diagnosis-proposals" className="scroll-mt-24">
        <SectionTitle icon={Sparkles}>맞춤 상품 제안</SectionTitle>
        {strat.제안.length > 0 ? <div className="grid items-stretch gap-4 lg:grid-cols-2">
          {strat.제안.map((item,i)=>{
            const summary=proposalSummary(item,data,products,manual);
            const product=products.find(p=>p.key===item.key);
            const status=product?productCounselStatus(product,manual,restricted):COUNSEL_STATUS.check;
            /* '제안 가능'은 제안 목록에 오른 시점에서 당연하므로 배지 생략, 행동이 필요한 상태(추가 확인 필요·제한 등)만 표기 */
            const showBadge=item.tag!=="주거래 전환"&&status.label!=="제안 가능";
            const title=item.title.replace(" 신규 가입 검토", "").replace(/ 납입 여력\(.*\) 활용/, " 추가 납입").replace("가맹점 카드매출 입금계좌 당행 전환", "가맹점 결제계좌 전환");
            const btn="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50";
            const cta=item.cta&&<Link to={item.cta.to} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-im-700 px-4 py-2 text-sm font-bold text-white">{item.cta.label}<ArrowRight className="h-4 w-4"/></Link>;
            /* 주택청약(근로소득자)은 소득공제 요건 확인을 별도 버튼 대신 우상단 상태 배지 클릭으로 연다 */
            const confirmAction = item.key==="housing" && manual.incomeType==="근로소득자" ? () => setModal({kind:"housing",title:"주택청약 소득공제 요건 확인"}) : null;
            const head=(<div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="inline-block rounded-full bg-im-50 px-2.5 py-0.5 text-[11px] font-bold text-im-700">{item.tag}</span>
                <h3 className="mt-2 text-lg font-bold leading-7 text-slate-900">{title}</h3>
                <p className="mt-1 text-[13px] leading-6 text-slate-500">{summary.reason}</p>
              </div>
              {showBadge && (confirmAction
                ? <button type="button" onClick={confirmAction} title="소득공제 요건 확인" className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold transition hover:brightness-95",status.badge)}>{status.label}</button>
                : <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",status.badge)}>{status.label}</span>)}
            </div>);
            const question=(<div className="mt-3 rounded-lg border-l-[3px] border-im-200 bg-slate-50/70 px-3.5 py-2.5">
              <p className="text-[11px] font-semibold text-slate-400">상담 질문</p>
              <p className="mt-0.5 text-sm leading-6 text-slate-800">“{summary.question}”</p>
            </div>);
            /* 개인 신용카드는 한 줄(2칸) 폭 — 왼쪽 제안, 오른쪽에 발급 요건 인라인, 소득공제 계산은 팝업 버튼 */
            if(item.key==="cardPersonal") return <article key={`${item.key||item.tag}-${i}`} className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="flex min-w-0 flex-col">
                  {head}{question}
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                    {cta}
                    <button type="button" onClick={()=>setModal({kind:"deduction",title:"신용카드 소득공제 계산"})} className={btn}>소득공제 계산</button>
                  </div>
                </div>
                <div className="min-w-0"><CardEligibilitySection no={data.customerNo} bare/></div>
              </div>
            </article>;
            return <article key={`${item.key||item.tag}-${i}`} className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5">
              {head}{question}
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                {cta}
                {item.key==="housing"&&<button type="button" onClick={()=>setModal({kind:"pdf",url:"/promo/housing.pdf",title:"주택청약종합저축 상품설명서"})} className={btn}>주택청약종합저축 설명서</button>}
                {item.key==="housing"&&<button type="button" onClick={()=>setModal({kind:"pdf",url:"/promo/housing-cheongnyeon.pdf",title:"청년 주택드림 청약통장 상품설명서"})} className={btn}>청년 주택드림 설명서</button>}
              </div>
            </article>;
          })}
        </div> : <div className={cn(CARD,"p-5 text-sm text-slate-500")}>현재 조건에 맞는 추가 제안이 없습니다.</div>}

      </section>

      {/* 4) 소득 분산 · 이연 */}
      {strat.분산.length > 0 && (
        <section>
          <SectionTitle icon={Split} sub="종합과세 대상·근접·이력 고객의 소득 분산·과세 이연 방법">
            소득 분산 · 이연
          </SectionTitle>
          <ol className="space-y-2">
            {strat.분산.map((s, i) => (
              <StrategyItem key={i} item={s} />
            ))}
          </ol>
        </section>
      )}

      {/* 5) 참고 — 이 고객 메모·자료 */}
      <CustomerFollowups no={data.customerNo} />

      <ReferenceGuide />

      <p className="text-[11px] leading-relaxed text-slate-400">
        본 화면은 내부 조회 데이터를 통합해 상담을 돕는 참고 자료입니다(데모, 표시 데이터는 예시). 실제 과세 여부·한도·세액은
        소득 전체와 세법 개정에 따라 달라지며, 신고·납부는 관할세무서·홈택스 기준으로 확인해야 합니다. 특정 상품의 투자권유가 아닙니다.
      </p>

      {/* 상품설명서(PDF) 뷰어 · 발급요건/소득공제 확인 팝업 — 바로 다운로드가 아니라 먼저 띄워주고, PDF는 뷰어에서 저장·인쇄 선택 */}
      {modal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 print:hidden" onClick={() => setModal(null)}>
          <div className={cn("flex max-h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl", modal.kind === "pdf" ? "h-full max-w-4xl" : modal.kind === "deduction" ? "max-w-lg" : "max-w-md")} onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
              <div className="truncate text-[14px] font-bold text-slate-900">{modal.title}</div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {modal.kind === "pdf" && <a href={modal.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-semibold text-slate-600 hover:border-slate-400">새 탭</a>}
                <button onClick={() => setModal(null)} aria-label="닫기" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
              </div>
            </div>
            {modal.kind === "pdf"
              ? <iframe src={modal.url} title={modal.title} className="h-full w-full flex-1" />
              : <div className="overflow-auto p-5">
                  {modal.kind === "housing" && <div className="space-y-4">{["homeless", "salaryUnder7000"].map(f => <div key={f}><p className="mb-2 text-sm font-semibold text-slate-700">{FIELD_LABEL[f]}</p><ManualControl field={f} manual={manual} set={(k, v) => setManual({ ...manual, [k]: v })} /></div>)}</div>}
                  {modal.kind === "deduction" && <CardDeductionGuide />}
                </div>}
          </div>
        </div>, document.body)}

    </div>
  );
}

export default function GrossTaxPage() {
  const [params] = useSearchParams();
  const [input, setInput] = useState("");
  const [result, setResult] = useState(undefined); // undefined=미조회, null=결과없음, obj=조회됨
  const [queriedNo, setQueriedNo] = useState("");

  useEffect(() => {
    const prev = document.title;
    document.title = "고객 종합 진단 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  /* 홈 대시보드 등에서 ?no= 로 넘어오면 바로 조회 */
  useEffect(() => {
    const no = (params.get("no") || "").replace(/\D/g, "");
    if (no.length === 9) {
      setInput(no);
      setQueriedNo(no);
      setResult(queryGrossTax(no));
    }
  }, [params]);

  const runQuery = (no) => {
    const clean = (no ?? input).replace(/\D/g, "");
    setQueriedNo(clean);
    setResult(queryGrossTax(clean));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    runQuery();
  };

  return (
    <HubShell>
      {/* 헤더 + 통합 의도 */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">고객 종합 진단</h1>
        </div>
        <p className="mt-1 text-[13px] text-slate-500">
          고객번호로 종합과세 여부·재무 상태를 진단하고, 미보유 상품을 상담으로 연결합니다.
        </p>
      </div>

      {/* 조회 입력 */}
      <form onSubmit={onSubmit} className={cn(CARD, "mb-5 flex flex-wrap items-center gap-2 p-3")}>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/\D/g, "").slice(0, 9))}
            inputMode="numeric"
            maxLength={9}
            placeholder="고객번호 9자리 입력"
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-[14px] tabular-nums focus:border-im-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={input.length !== 9}
          className="flex-shrink-0 rounded-md bg-im-600 px-5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-im-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          통합 조회
        </button>
      </form>

      {/* 결과 */}
      {result === undefined ? (
        <IdleState onPick={(no) => { setInput(no); runQuery(no); }} />
      ) : result === null ? (
        <NotFound no={queriedNo} onPick={(no) => { setInput(no); runQuery(no); }} />
      ) : (
        <ResultView key={result.customerNo} data={result} />
      )}
    </HubShell>
  );
}

/* 미조회 상태 — 통합 취지 + 대표 고객번호로 바로 체험 */
const IdleState = ({ onPick }) => (
  <div className="space-y-5">
    <div className={cn(CARD, "flex flex-col items-center gap-3 px-5 py-10 text-center")}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-im-50 text-im-600">
        <Layers className="h-6 w-6" />
      </div>
      <p className="text-[14px] font-semibold text-slate-700">고객번호 9자리를 입력하세요</p>
      <p className="max-w-md text-[12.5px] leading-relaxed text-slate-400">
        종합과세 대상 여부 · 당행 절세상품 현황 · 절세 전략을 확인합니다.
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[11px] text-slate-400">예시 고객:</span>
        {SAMPLE_CUSTOMERS.map((c) => (
          <button
            key={c.customerNo}
            onClick={() => onPick(c.customerNo)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:border-im-300 hover:text-im-700"
          >
            <span className="font-mono tabular-nums">{c.customerNo}</span>
            <span className="text-[10px] font-medium text-slate-400">{c.tag}</span>
          </button>
        ))}
      </div>
    </div>

    <ReferenceGuide />
  </div>
);

const NotFound = ({ no, onPick }) => (
  <div className={cn(CARD, "flex flex-col items-center gap-2 px-5 py-12 text-center")}>
    <Search className="h-7 w-7 text-slate-300" />
    <p className="text-[13px] font-semibold text-slate-600">
      <span className="font-mono tabular-nums">{no}</span> · 조회 결과가 없습니다
    </p>
    <p className="max-w-sm text-[12px] leading-relaxed text-slate-400">
      데모에는 대표 고객만 등록돼 있습니다. 아래 예시 번호로 확인해 보세요.
    </p>
    <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
      {SAMPLE_CUSTOMERS.map((c) => (
        <button
          key={c.customerNo}
          onClick={() => onPick(c.customerNo)}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-im-300 hover:text-im-700"
        >
          <span className="font-mono tabular-nums">{c.customerNo}</span>
          <span className="text-[10px] font-medium text-slate-400">{c.tag}</span>
        </button>
      ))}
    </div>
  </div>
);
