import { useEffect, useMemo, useState } from "react";
import { Star, TrendingUp, Search, Bell, Target, Trash2, Plus, LineChart, Users } from "lucide-react";
import { HubShell } from "./HubShell";
import { useWealth } from "./wealth/useWealth";
import { PRODUCTS, PRODUCT_TYPES, PRODUCT_BY_ID, riskMeta } from "./data/wealthProducts";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

const RISK_CLASS = {
  rose: "bg-rose-50 text-rose-600",
  amber: "bg-amber-50 text-amber-700",
  slate: "bg-slate-100 text-slate-500",
};

const TYPE_CLASS = {
  펀드: "bg-violet-50 text-violet-700",
  ETF: "bg-sky-50 text-sky-700",
  신탁: "bg-amber-50 text-amber-700",
};

const pct = (v) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`);
const retColor = (v) => (v == null ? "text-slate-400" : v > 0 ? "text-red-500" : v < 0 ? "text-blue-600" : "text-slate-500");
const won = (manwon) => `${manwon.toLocaleString()}만원`;

/* ── 상품 카드 ── */
const ProductCard = ({ product, watched, onWatch, onEnroll }) => {
  const rk = riskMeta(product.risk);
  return (
    <div className={cn(CARD, "flex flex-col p-4")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", TYPE_CLASS[product.type])}>{product.type}</span>
            <span className="text-[10px] text-slate-400">{product.category}</span>
          </div>
          <h3 className="mt-1 text-[14px] font-bold leading-snug text-slate-900">{product.name}</h3>
        </div>
        <button
          onClick={() => onWatch(product.id)}
          title={watched ? "관심 해제" : "관심 등록"}
          aria-label="관심"
          className={cn(
            "flex-shrink-0 rounded-md p-1.5 transition-colors",
            watched ? "text-amber-400 hover:bg-amber-50" : "text-slate-300 hover:bg-slate-100 hover:text-slate-400"
          )}
        >
          <Star className={cn("h-4 w-4", watched && "fill-amber-400")} />
        </button>
      </div>

      <div className="mt-3 flex items-end gap-3">
        <div>
          <div className="text-[10px] text-slate-400">최근 1년</div>
          <div className={cn("text-[20px] font-bold leading-none tabular-nums", retColor(product.return1y))}>
            {pct(product.return1y)}
          </div>
        </div>
        <div className="mb-0.5 text-[11px] text-slate-500">
          3년 <span className={cn("font-semibold tabular-nums", retColor(product.return3y))}>{pct(product.return3y)}</span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", RISK_CLASS[rk.tone])}>{rk.label}</span>
        <span className="text-[10px] text-slate-400">총보수 연 {product.fee}%</span>
      </div>

      <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-slate-500">{product.desc}</p>

      <button
        onClick={() => onEnroll(product.id)}
        className="mt-3 inline-flex items-center justify-center gap-1 rounded-md bg-im-600 px-3 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-im-700"
      >
        <Plus className="h-3.5 w-3.5" />
        고객 가입
      </button>
    </div>
  );
};

const ALERT_META = {
  target: { label: "목표 도달", cls: "bg-im-100 text-im-700" },
  loss: { label: "손실 경고", cls: "bg-rose-100 text-rose-700" },
  progress: { label: "진행 중", cls: "bg-slate-100 text-slate-500" },
};

/* ── 가입 고객 행 ── */
const EnrollmentRow = ({ e, onTarget, onRemove }) => {
  const a = ALERT_META[e.alert];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-100 px-3 py-3 last:border-b-0">
      <div className="min-w-[8rem] flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[12px] font-bold tabular-nums text-slate-800">{e.customerNo}</span>
          <span className={cn("rounded px-1 py-0.5 text-[9px] font-bold", ALERT_META[e.alert].cls)}>{a.label}</span>
        </div>
        <div className="mt-0.5 text-[12px] text-slate-600">{e.product?.name ?? "(상품 없음)"}</div>
        <div className="text-[10px] text-slate-400">가입 {e.joinedAt} · {won(e.principal)}</div>
      </div>

      <div className="text-right">
        <div className="text-[10px] text-slate-400">평가금액</div>
        <div className="text-[13px] font-bold tabular-nums text-slate-900">{won(e.currentValue)}</div>
      </div>

      <div className="text-right">
        <div className="text-[10px] text-slate-400">수익률</div>
        <div className={cn("text-[13px] font-bold tabular-nums", retColor(e.currentReturn))}>{pct(e.currentReturn)}</div>
      </div>

      <label className="flex items-center gap-1 text-[11px] text-slate-500">
        <Target className="h-3 w-3" />
        목표
        <input
          type="number"
          value={e.targetReturn}
          onChange={(ev) => onTarget(e.id, ev.target.value)}
          className="w-14 rounded border border-slate-300 px-1.5 py-1 text-right text-[12px] tabular-nums focus:border-im-500 focus:outline-none"
        />
        %
      </label>

      <button
        onClick={() => onRemove(e.id)}
        aria-label="삭제"
        className="rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

/* ── 가입 폼 ── */
const EnrollForm = ({ presetProductId, onAdd }) => {
  const [customerNo, setCustomerNo] = useState("");
  const [productId, setProductId] = useState(presetProductId || PRODUCTS[0].id);
  const [principal, setPrincipal] = useState("");
  const [target, setTarget] = useState("10");

  useEffect(() => {
    if (presetProductId) setProductId(presetProductId);
  }, [presetProductId]);

  const canSubmit = customerNo.length === 9 && Number(principal) > 0;
  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onAdd({ customerNo, productId, principal, targetReturn: target });
    setCustomerNo("");
    setPrincipal("");
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-slate-500">고객번호</span>
        <input
          value={customerNo}
          onChange={(e) => setCustomerNo(e.target.value.replace(/\D/g, "").slice(0, 9))}
          inputMode="numeric"
          maxLength={9}
          placeholder="9자리"
          className="w-28 rounded-md border border-slate-300 px-2.5 py-1.5 text-[13px] tabular-nums focus:border-im-500 focus:outline-none"
        />
      </label>
      <label className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[10px] font-semibold text-slate-500">상품</span>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[13px] focus:border-im-500 focus:outline-none"
        >
          {PRODUCTS.map((p) => (
            <option key={p.id} value={p.id}>
              [{p.type}] {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-slate-500">가입금액(만원)</span>
        <input
          value={principal}
          onChange={(e) => setPrincipal(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          placeholder="1000"
          className="w-24 rounded-md border border-slate-300 px-2.5 py-1.5 text-[13px] tabular-nums focus:border-im-500 focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-slate-500">목표수익률</span>
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value.replace(/[^\d.]/g, ""))}
          inputMode="decimal"
          className="w-16 rounded-md border border-slate-300 px-2.5 py-1.5 text-right text-[13px] tabular-nums focus:border-im-500 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded-md bg-im-600 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-im-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        가입 추가
      </button>
    </form>
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

export default function WealthPage() {
  const { isWatched, toggleWatch, watchlist, enrollments, enroll, removeEnroll, setTarget } = useWealth();
  const [tab, setTab] = useState("catalog");
  const [typeFilter, setTypeFilter] = useState("전체");
  const [watchOnly, setWatchOnly] = useState(false);
  const [presetProduct, setPresetProduct] = useState(null);

  useEffect(() => {
    const prev = document.title;
    document.title = "투자상품 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  const products = useMemo(
    () =>
      PRODUCTS.filter((p) => (typeFilter === "전체" || p.type === typeFilter) && (!watchOnly || watchlist.includes(p.id))),
    [typeFilter, watchOnly, watchlist]
  );

  const totals = useMemo(() => {
    const value = enrollments.reduce((s, e) => s + e.currentValue, 0);
    const principal = enrollments.reduce((s, e) => s + e.principal, 0);
    const alerts = enrollments.filter((e) => e.alert !== "progress").length;
    return { value, principal, alerts };
  }, [enrollments]);

  const onEnrollFromCatalog = (productId) => {
    setPresetProduct(productId);
    setTab("customers");
  };

  const TABS = [
    { id: "catalog", label: "상품 탐색", icon: LineChart, count: null },
    { id: "customers", label: "내 가입 고객", icon: Users, count: enrollments.length },
  ];

  return (
    <HubShell>
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">투자상품</h1>
        <p className="mt-1 text-[13px] text-slate-500">펀드·ETF·신탁을 탐색하고, 가입 고객의 목표수익률·알림을 관리합니다.</p>
      </div>

      {/* 탭 */}
      <div className="mb-4 flex items-center gap-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
                on ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              {t.count != null && <span className={cn("tabular-nums", on ? "text-slate-300" : "text-slate-400")}>{t.count}</span>}
            </button>
          );
        })}
        {watchlist.length > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500">
            <Star className="h-3 w-3 fill-amber-400" />
            관심 {watchlist.length}
          </span>
        )}
      </div>

      {tab === "catalog" ? (
        <section>
          {/* 필터 */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {["전체", ...PRODUCT_TYPES].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[12px] font-semibold transition-colors",
                  typeFilter === t ? "bg-im-600 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900"
                )}
              >
                {t}
              </button>
            ))}
            <button
              onClick={() => setWatchOnly((v) => !v)}
              className={cn(
                "ml-auto inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-semibold transition-colors",
                watchOnly ? "bg-amber-400 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900"
              )}
            >
              <Star className={cn("h-3 w-3", watchOnly && "fill-white")} />
              관심만
            </button>
          </div>

          {products.length === 0 ? (
            <div className={cn(CARD, "px-5 py-12 text-center text-[13px] text-slate-400")}>
              {watchOnly ? "관심 등록한 상품이 없습니다." : "해당 상품이 없습니다."}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} watched={isWatched(p.id)} onWatch={toggleWatch} onEnroll={onEnrollFromCatalog} />
              ))}
            </div>
          )}
          <p className="mt-3 text-[11px] text-slate-400">
            데모 데이터 — 수익률·보수·위험등급은 예시입니다. 투자 전 (간이)투자설명서·집합투자규약을 확인하세요.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          {/* 요약 */}
          <div className="grid grid-cols-3 gap-3">
            <SummaryStat label="가입 건수" value={`${enrollments.length}건`} icon={Users} />
            <SummaryStat label="총 평가금액" value={won(totals.value)} icon={TrendingUp} sub={`원금 ${won(totals.principal)}`} />
            <SummaryStat label="알림" value={`${totals.alerts}건`} icon={Bell} tone={totals.alerts > 0 ? "alert" : "none"} />
          </div>

          {/* 가입 추가 */}
          <div className={cn(CARD, "p-4")}>
            <div className="mb-3 flex items-center gap-1.5 text-[12.5px] font-bold text-slate-700">
              <Plus className="h-4 w-4 text-im-600" />
              가입 고객 추가
            </div>
            <EnrollForm presetProductId={presetProduct} onAdd={enroll} />
          </div>

          {/* 목록 */}
          <div className={cn(CARD, "overflow-hidden")}>
            <div className="border-b border-slate-100 px-3 py-2.5 text-[13px] font-bold text-slate-900">
              가입 고객 <span className="ml-1 text-[11px] font-medium text-slate-400">{enrollments.length}건</span>
            </div>
            {enrollments.length === 0 ? (
              <p className="px-3 py-10 text-center text-[12.5px] text-slate-400">가입 고객이 없습니다. 위에서 추가하세요.</p>
            ) : (
              <div>
                {enrollments.map((e) => (
                  <EnrollmentRow key={e.id} e={e} onTarget={setTarget} onRemove={removeEnroll} />
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            평가금액·수익률은 데모 추정치입니다. 목표수익률 도달·손실(-10% 이하) 시 알림으로 표시됩니다.
          </p>
        </section>
      )}
    </HubShell>
  );
}

const SummaryStat = ({ label, value, sub, icon: Icon, tone }) => (
  <div className={cn(CARD, "px-4 py-3")}>
    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
      <Icon className={cn("h-3.5 w-3.5", tone === "alert" ? "text-rose-500" : "text-slate-400")} />
      {label}
    </div>
    <div className={cn("mt-1 text-[17px] font-bold tabular-nums", tone === "alert" ? "text-rose-600" : "text-slate-900")}>{value}</div>
    {sub && <div className="mt-0.5 text-[11px] text-slate-400">{sub}</div>}
  </div>
);
