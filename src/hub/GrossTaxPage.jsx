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
  Printer,
  BadgePercent,
  MessageSquareText,
  Megaphone,
} from "lucide-react";
import { HubShell } from "./HubShell";
import { CardDeductionGuide } from "@card/components/CardDeductionGuide";
import { PrintReport } from "@shared/components/PrintReport";
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
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-bold text-slate-900">{data.name}</span>
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
            기준 대비 {pct}%{!j.isTarget && pct > 80 && " · 기준 근접 — 시기 분산으로 관리 필요"}
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

const ProductCard = ({ product }) => {
  const src = SOURCES[product.key];
  const st = PRODUCT_STATE[product.state];
  const cls = STATE_CLASS[st.tone];
  const sell = st.sell;
  const metrics = product.metrics || [];
  const hero = metrics.find((m) => m.strong);
  const rest = metrics.filter((m) => !m.strong);
  return (
    <div className={cn("rounded-xl border p-4", cls.card, sell && "ring-1 ring-im-200")}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[14px] font-bold text-slate-900">{src.label}</h3>
        <div className="flex flex-shrink-0 items-center gap-1">
          {sell && <span className="rounded bg-im-600 px-1.5 py-0.5 text-[10px] font-bold text-white">권유</span>}
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", cls.badge)}>{st.label}</span>
        </div>
      </div>

      {hero && (
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

      {product.note && (
        <p className="mt-2 border-t border-slate-200/70 pt-2 text-[11.5px] leading-relaxed text-slate-500">
          {product.note}
        </p>
      )}

      {product.cta && (
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

const StrategyItem = ({ item }) => {
  const k = STRATEGY_KIND[item.kind] || STRATEGY_KIND.action;
  const Icon = k.icon;
  return (
    <li className={cn("flex gap-3 rounded-xl border p-3.5", k.wrap)}>
      <Icon className={cn("mt-0.5 h-4 w-4 flex-shrink-0", k.iconColor)} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", k.tag)}>{item.tag}</span>
          <h4 className="text-[13.5px] font-bold text-slate-900">{item.title}</h4>
        </div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{item.detail}</p>
        {item.cta && (
          <Link
            to={item.cta.to}
            className="mt-2 inline-flex items-center gap-1 rounded-md border border-im-300 bg-white px-2.5 py-1 text-[11.5px] font-bold text-im-700 transition-colors hover:bg-im-50"
          >
            {item.cta.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
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

const ManualField = ({ label, children }) => (
  <div className="flex items-center gap-2">
    <span className="text-[12.5px] font-semibold text-slate-700">{label}</span>
    {children}
  </div>
);

/* 상담 시 확인하는 값 — 소득 유형·무주택 세대주·비과세종합저축 자격 */
const ManualPanel = ({ manual, onChange }) => {
  const set = (k, v) => onChange({ ...manual, [k]: v });
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="mb-2.5 flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
        <MessageSquareText className="h-3.5 w-3.5" />
        고객에게 확인
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <ManualField label="소득 유형">
          <div className="flex flex-wrap gap-1">
            {INCOME_TYPES.map((t) => (
              <SegBtn key={t} active={manual.incomeType === t} onClick={() => set("incomeType", t)}>
                {t}
              </SegBtn>
            ))}
          </div>
        </ManualField>
        <ManualField label="무주택 세대주">
          <YesNo value={manual.homeless} onChange={(v) => set("homeless", v)} />
        </ManualField>
        <ManualField label="총급여 7천만원 이하">
          <YesNo value={manual.salaryUnder7000} onChange={(v) => set("salaryUnder7000", v)} />
        </ManualField>
        <ManualField label="비과세종합저축 자격">
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
          <span className="text-[14px] font-bold text-slate-900">참고 — 종합과세 제외 상품 · 불이익 · 절세 전략 프레임</span>
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
                    <span className="text-slate-500"> — {p.detail}</span>
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

/* 전략 그룹 — 가독성을 위해 소제목으로 묶는다 */
const STRATEGY_GROUPS = [
  { key: "진단", label: "진단 · 유의" },
  { key: "제안", label: "상품 제안 (판매)" },
  { key: "분산", label: "소득 분산 · 이연" },
];

/* 조회 결과 뷰 — 전략은 deriveStrategy(사실)로 도출, A4 상담자료 인쇄 포함 */
function ResultView({ data }) {
  const j = data.jonghap;
  /* 값을 미리 고정하지 않고 미확인으로 시작 — 상담하며 채운다 */
  const blankManual = { incomeType: null, homeless: null, salaryUnder7000: null, nontaxQual: null };
  const [manual, setManual] = useState(blankManual);
  useEffect(() => setManual(blankManual), [data.customerNo]);

  const restricted = j.isTarget || j.restrictedByHistory;
  const products = data.products.map((p) => viewProduct(p, manual, restricted));
  /* 권유 대상(판매 기회)을 앞쪽에 모아 상담 시 먼저 보이게 */
  const sortedProducts = [...products].sort(
    (a, b) => (PRODUCT_STATE[b.state].sell ? 1 : 0) - (PRODUCT_STATE[a.state].sell ? 1 : 0)
  );
  const strategy = deriveStrategy(data, manual);

  useEffect(() => {
    const cleanup = () => document.documentElement.classList.remove("printing-market");
    window.addEventListener("afterprint", cleanup);
    return () => {
      window.removeEventListener("afterprint", cleanup);
      cleanup();
    };
  }, []);

  const handlePrint = () => {
    document.documentElement.classList.add("printing-market");
    setTimeout(() => window.print(), 30);
  };

  return (
    <div className="space-y-6">
      <ManualPanel manual={manual} onChange={setManual} />

      <div className="flex justify-end">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-slate-800"
        >
          <Printer className="h-3.5 w-3.5" />
          A4 상담자료 인쇄
        </button>
      </div>

      <VerdictBanner data={data} />

      {j.isTarget && <GuidanceForTarget data={data} />}

      <section>
        <SectionTitle icon={Layers} sub="당행 보유 기준">
          절세 상품 활용 현황
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedProducts.map((p) => (
            <ProductCard key={p.key} product={p} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle icon={ShieldCheck}>맞춤 절세 전략 · 상품 제안</SectionTitle>
        <div className="space-y-4">
          {STRATEGY_GROUPS.map((g) => {
            const rows = strategy.filter((s) => s.group === g.key);
            if (rows.length === 0) return null;
            return (
              <div key={g.key}>
                <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {g.label}
                </div>
                <ol className="space-y-2">
                  {rows.map((s, i) => (
                    <StrategyItem key={i} item={s} />
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SectionTitle icon={BadgePercent} sub="대략적인 총급여로 소득공제 문턱을 계산해 카드 권유로 연결">
          신용카드 소득공제 · 카드 권유
        </SectionTitle>
        <CardDeductionGuide />
      </section>

      <ReferenceGuide />

      <p className="text-[11px] leading-relaxed text-slate-400">
        본 화면은 내부 조회 데이터를 통합해 상담을 돕는 참고 자료입니다(데모 — 표시 데이터는 예시). 실제 과세 여부·한도·세액은
        소득 전체와 세법 개정에 따라 달라지며, 신고·납부는 관할세무서·홈택스 기준으로 확인해야 합니다. 특정 상품의 투자권유가 아닙니다.
      </p>

      {/* 인쇄 전용 A4 — body로 포탈해 대시보드(#root)와 분리 (html.printing-market 격리) */}
      {createPortal(
        <PrintReport
          title={`금융소득 종합과세 진단 · ${data.name}`}
          subtitle={`${data.customerNo} · ${data.age} · ${manual.incomeType || "소득유형 미확인"} · ${j.taxYear}년 기준`}
          disclaimer="본 자료는 당행 보유 기준 내부 조회를 통합한 상담 참고용입니다(데모 — 표시 데이터는 예시). 타행 가입분은 조회되지 않으며, 실제 과세 여부·한도·세액은 소득 전체와 세법 개정에 따라 달라집니다. 신고·납부는 관할세무서·홈택스 기준으로 확인해야 하며, 특정 상품의 투자권유가 아닙니다."
          inputs={[
            { label: "고객번호", value: data.customerNo },
            { label: "연령", value: data.age },
            { label: "소득 유형", value: manual.incomeType || "미확인" },
            { label: "무주택 세대주", value: manual.homeless == null ? "미확인" : manual.homeless ? "예" : "아니오" },
            { label: "총급여 7천만원 이하", value: manual.salaryUnder7000 == null ? "미확인" : manual.salaryUnder7000 ? "예" : "아니오" },
            { label: "비과세종합저축 자격", value: manual.nontaxQual || "미확인" },
            { label: "기준 연도", value: `${j.taxYear}년` },
            {
              label: "직전 3년 이력",
              value: j.history.map((h) => `${h.year} ${h.isTarget ? "대상" : "비대상"}`).join(" · "),
            },
          ]}
          results={[
            { label: "종합과세 대상 여부", value: j.isTarget ? "대상" : "비대상", emphasis: true },
            {
              label: "당해 금융소득 / 기준",
              value: `${j.financialIncome.toLocaleString()}만원 / ${j.threshold.toLocaleString()}만원`,
            },
            { label: "소득 관할 세무서", value: j.taxOffice },
            ...(j.restrictedByHistory
              ? [{ label: "가입 제한", value: "비과세종합저축·ISA 신규가입·연장 제한" }]
              : []),
            ...products.map((p) => {
              const hero = (p.metrics || []).find((m) => m.strong) || (p.metrics || [])[0];
              return {
                label: SOURCES[p.key]?.label ?? p.key,
                value: `${PRODUCT_STATE[p.state].label}${hero ? ` · ${hero.label} ${hero.value}` : ""}`,
              };
            }),
          ]}
          notes={strategy.map((s) => `[${s.tag}] ${s.title} — ${s.detail}`)}
          legalBasis="소득세법 제14조·제62조(금융소득 종합과세) · 조세특례제한법(비과세종합저축·ISA)"
          sourceLine="당행 내부 조회 통합(0192-8·0192-1·0192-74/75 · ISA/주택청약/노란우산 가입여부) — 데모, 실서비스 시 실제 조회로 대체"
          brandLabel="iM 세일즈메이트 · 종합과세 진단자료 · iM뱅크"
          accent="amber"
        />,
        document.body
      )}
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
    document.title = "금융소득 종합과세 관리 · iM 세일즈메이트";
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">금융소득 종합과세 관리</h1>
        </div>
        <p className="mt-1 text-[13px] text-slate-500">
          고객번호로 종합과세 대상 여부와 당행 절세상품을 조회합니다.
          <span className="text-slate-400"> · 당행 보유 기준(타행 조회 불가)</span>
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
        <ResultView data={result} />
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
      <span className="font-mono tabular-nums">{no}</span> — 조회 결과가 없습니다
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
