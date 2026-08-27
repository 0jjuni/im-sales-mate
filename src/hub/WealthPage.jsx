import { useEffect, useMemo, useState } from "react";
import { Star, TrendingUp, Search, Bell, Target, Trash2, Plus, LineChart, Users, X, ArrowUpDown } from "lucide-react";
import { HubShell } from "./HubShell";
import { useWealth } from "./wealth/useWealth";
import { PRODUCTS, PRODUCT_TYPES, PRODUCT_BY_ID, SOLD_RANK, riskMeta } from "./data/wealthProducts";
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
const won = (m) => `${m.toLocaleString()}만원`;
const eok = (m) => (m >= 10000 ? `${(m / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}조원` : `${m.toLocaleString()}억원`);

const SORTS = [
  { key: "sold", label: "인기순" },
  { key: "return1y", label: "1년 수익률" },
  { key: "return3y", label: "3년 수익률" },
  { key: "fee", label: "보수 낮은순" },
  { key: "risk", label: "위험 낮은순" },
];

const sortProducts = (list, key) => {
  const arr = [...list];
  if (key === "sold") arr.sort((a, b) => b.sold - a.sold);
  else if (key === "fee") arr.sort((a, b) => a.fee - b.fee);
  else if (key === "risk") arr.sort((a, b) => b.risk - a.risk); // 6=낮은위험 먼저
  else arr.sort((a, b) => (b[key] ?? -999) - (a[key] ?? -999));
  return arr;
};

/* ── 상품 리스트 행(밀집) ── */
const ProductRow = ({ product, rank, watched, onWatch, onDetail, onEnroll }) => {
  const rk = riskMeta(product.risk);
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5 last:border-b-0 hover:bg-slate-50">
      <span
        className={cn(
          "w-6 flex-shrink-0 text-center text-[12px] font-bold tabular-nums",
          rank <= 3 ? "text-im-600" : "text-slate-400"
        )}
      >
        {rank}
      </span>

      <button onClick={() => onDetail(product)} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-1.5">
          <span className={cn("rounded px-1 py-0.5 text-[9px] font-bold", TYPE_CLASS[product.type])}>{product.type}</span>
          <span className="truncate text-[13px] font-bold text-slate-900">{product.name}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-slate-400">
          <span>{product.category}</span>
          <span className={cn("rounded px-1 py-0.5 font-semibold", RISK_CLASS[rk.tone])}>{rk.label}</span>
        </div>
      </button>

      <div className="w-16 flex-shrink-0 text-right">
        <div className={cn("text-[14px] font-bold tabular-nums", retColor(product.return1y))}>{pct(product.return1y)}</div>
        <div className="text-[9px] text-slate-400">1년</div>
      </div>
      <div className="hidden w-14 flex-shrink-0 text-right sm:block">
        <div className={cn("text-[12px] font-semibold tabular-nums", retColor(product.return3y))}>{pct(product.return3y)}</div>
        <div className="text-[9px] text-slate-400">3년</div>
      </div>
      <div className="hidden w-12 flex-shrink-0 text-right md:block">
        <div className="text-[12px] font-semibold tabular-nums text-slate-600">{product.fee}%</div>
        <div className="text-[9px] text-slate-400">보수</div>
      </div>

      <button
        onClick={() => onWatch(product.id)}
        aria-label="관심"
        className={cn("flex-shrink-0 rounded p-1.5 transition-colors", watched ? "text-amber-400" : "text-slate-300 hover:text-slate-400")}
      >
        <Star className={cn("h-4 w-4", watched && "fill-amber-400")} />
      </button>
      <button
        onClick={() => onEnroll(product.id)}
        className="hidden flex-shrink-0 rounded-md bg-im-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-im-700 sm:block"
      >
        가입
      </button>
    </div>
  );
};

/* ── 상품 상세 모달 ── */
const ProductDetailModal = ({ product, watched, onWatch, onEnroll, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!product) return null;
  const rk = riskMeta(product.risk);
  const rank = SOLD_RANK[product.id];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", TYPE_CLASS[product.type])}>{product.type}</span>
              <span className="text-[11px] text-slate-400">{product.category}</span>
              <span className="rounded bg-im-50 px-1.5 py-0.5 text-[10px] font-bold text-im-700">당행 판매 {rank}위</span>
            </div>
            <h3 className="mt-1 text-[16px] font-bold text-slate-900">{product.name}</h3>
            <div className="mt-0.5 text-[11px] text-slate-400">{product.company} · 설정 {product.since}</div>
          </div>
          <button
            onClick={() => onWatch(product.id)}
            aria-label="관심"
            className={cn("flex-shrink-0 rounded-md p-1.5", watched ? "text-amber-400 hover:bg-amber-50" : "text-slate-300 hover:bg-slate-100")}
          >
            <Star className={cn("h-5 w-5", watched && "fill-amber-400")} />
          </button>
        </div>

        <div className="px-5 py-4">
          {/* 수익률 */}
          <div className="grid grid-cols-3 gap-2">
            {[
              ["1년", product.return1y],
              ["3년", product.return3y],
              ["5년", product.return5y],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">
                <div className="text-[10px] text-slate-400">{k} 수익률</div>
                <div className={cn("mt-0.5 text-[15px] font-bold tabular-nums", retColor(v))}>{pct(v)}</div>
              </div>
            ))}
          </div>

          {/* 상세 지표 */}
          <dl className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {[
              ["위험등급", rk.full],
              ["총보수(연)", `${product.fee}%`],
              ["순자산(설정액)", eok(product.aum)],
              ["운용·발행", product.company],
              ["당행 누적 판매", `${product.sold.toLocaleString()}건 (${rank}위)`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-2 px-3 py-2 text-[12.5px]">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-semibold text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-3 text-[12.5px] leading-relaxed text-slate-600">{product.desc}</p>
          <p className="mt-2 text-[10.5px] leading-relaxed text-slate-400">
            데모 데이터 — 실제 수익률·보수·조건은 (간이)투자설명서·집합투자규약을 확인하세요. 과거 수익률은 미래를 보장하지 않습니다.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
          <button onClick={onClose} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:border-slate-400">
            닫기
          </button>
          <button
            onClick={() => onEnroll(product.id)}
            className="inline-flex items-center gap-1 rounded-md bg-im-600 px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-im-700"
          >
            <Plus className="h-3.5 w-3.5" />
            고객 가입
          </button>
        </div>
      </div>
    </div>
  );
};

const ALERT_META = {
  target: { label: "목표 도달", cls: "bg-im-100 text-im-700" },
  loss: { label: "손실 경고", cls: "bg-rose-100 text-rose-700" },
  progress: { label: "진행 중", cls: "bg-slate-100 text-slate-500" },
};

const EnrollmentRow = ({ e, onTarget, onRemove }) => {
  const a = ALERT_META[e.alert];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-100 px-3 py-3 last:border-b-0">
      <div className="min-w-[8rem] flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[12px] font-bold tabular-nums text-slate-800">{e.customerNo}</span>
          <span className={cn("rounded px-1 py-0.5 text-[9px] font-bold", a.cls)}>{a.label}</span>
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
      <button onClick={() => onRemove(e.id)} aria-label="삭제" className="rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

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
        <input value={customerNo} onChange={(e) => setCustomerNo(e.target.value.replace(/\D/g, "").slice(0, 9))} inputMode="numeric" maxLength={9} placeholder="9자리" className="w-28 rounded-md border border-slate-300 px-2.5 py-1.5 text-[13px] tabular-nums focus:border-im-500 focus:outline-none" />
      </label>
      <label className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[10px] font-semibold text-slate-500">상품</span>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[13px] focus:border-im-500 focus:outline-none">
          {PRODUCTS.map((p) => (
            <option key={p.id} value={p.id}>[{p.type}] {p.name}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-slate-500">가입금액(만원)</span>
        <input value={principal} onChange={(e) => setPrincipal(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="1000" className="w-24 rounded-md border border-slate-300 px-2.5 py-1.5 text-[13px] tabular-nums focus:border-im-500 focus:outline-none" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-slate-500">목표수익률</span>
        <input value={target} onChange={(e) => setTarget(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className="w-16 rounded-md border border-slate-300 px-2.5 py-1.5 text-right text-[13px] tabular-nums focus:border-im-500 focus:outline-none" />
      </label>
      <button type="submit" disabled={!canSubmit} className="rounded-md bg-im-600 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-im-700 disabled:cursor-not-allowed disabled:opacity-40">
        가입 추가
      </button>
    </form>
  );
};

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

export default function WealthPage() {
  const { isWatched, toggleWatch, watchlist, enrollments, enroll, removeEnroll, setTarget } = useWealth();
  const [tab, setTab] = useState("catalog");
  const [typeFilter, setTypeFilter] = useState("전체");
  const [watchOnly, setWatchOnly] = useState(false);
  const [sort, setSort] = useState("sold");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);
  const [presetProduct, setPresetProduct] = useState(null);

  useEffect(() => {
    const prev = document.title;
    document.title = "투자상품 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = PRODUCTS.filter(
      (p) =>
        (typeFilter === "전체" || p.type === typeFilter) &&
        (!watchOnly || watchlist.includes(p.id)) &&
        (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.company.toLowerCase().includes(q))
    );
    return sortProducts(filtered, sort);
  }, [typeFilter, watchOnly, watchlist, sort, query]);

  const totals = useMemo(() => {
    const value = enrollments.reduce((s, e) => s + e.currentValue, 0);
    const principal = enrollments.reduce((s, e) => s + e.principal, 0);
    const alerts = enrollments.filter((e) => e.alert !== "progress").length;
    return { value, principal, alerts };
  }, [enrollments]);

  const goEnroll = (productId) => {
    setPresetProduct(productId);
    setDetail(null);
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
        <p className="mt-1 text-[13px] text-slate-500">펀드·ETF·신탁을 검색·비교하고, 가입 고객의 목표수익률·알림을 관리합니다.</p>
      </div>

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
          {/* 검색 */}
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="상품명·카테고리·운용사 검색"
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-[13px] focus:border-im-500 focus:outline-none"
            />
          </div>

          {/* 필터 + 정렬 */}
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
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-semibold transition-colors",
                watchOnly ? "bg-amber-400 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900"
              )}
            >
              <Star className={cn("h-3 w-3", watchOnly && "fill-white")} />
              관심만
            </button>

            <label className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-slate-500">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[12px] font-semibold text-slate-700 focus:border-im-500 focus:outline-none">
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* 리스트 */}
          <div className={cn(CARD, "overflow-hidden")}>
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="w-6 text-center">{sort === "sold" ? "순위" : "#"}</span>
              <span className="flex-1">상품</span>
              <span className="w-16 text-right">1년</span>
              <span className="hidden w-14 text-right sm:block">3년</span>
              <span className="hidden w-12 text-right md:block">보수</span>
              <span className="w-[3.9rem]" />
            </div>
            {products.length === 0 ? (
              <p className="px-3 py-12 text-center text-[13px] text-slate-400">
                {watchOnly ? "관심 등록한 상품이 없습니다." : "검색 결과가 없습니다."}
              </p>
            ) : (
              products.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  rank={SOLD_RANK[p.id]}
                  watched={isWatched(p.id)}
                  onWatch={toggleWatch}
                  onDetail={setDetail}
                  onEnroll={goEnroll}
                />
              ))
            )}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            순위는 당행 누적 판매건수 기준(데모). 수익률·보수는 예시이며 과거 성과는 미래를 보장하지 않습니다.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <SummaryStat label="가입 건수" value={`${enrollments.length}건`} icon={Users} />
            <SummaryStat label="총 평가금액" value={won(totals.value)} icon={TrendingUp} sub={`원금 ${won(totals.principal)}`} />
            <SummaryStat label="알림" value={`${totals.alerts}건`} icon={Bell} tone={totals.alerts > 0 ? "alert" : "none"} />
          </div>

          <div className={cn(CARD, "p-4")}>
            <div className="mb-3 flex items-center gap-1.5 text-[12.5px] font-bold text-slate-700">
              <Plus className="h-4 w-4 text-im-600" />
              가입 고객 추가
            </div>
            <EnrollForm presetProductId={presetProduct} onAdd={enroll} />
          </div>

          <div className={cn(CARD, "overflow-hidden")}>
            <div className="border-b border-slate-100 px-3 py-2.5 text-[13px] font-bold text-slate-900">
              가입 고객 <span className="ml-1 text-[11px] font-medium text-slate-400">{enrollments.length}건</span>
            </div>
            {enrollments.length === 0 ? (
              <p className="px-3 py-10 text-center text-[12.5px] text-slate-400">가입 고객이 없습니다. 위에서 추가하세요.</p>
            ) : (
              enrollments.map((e) => <EnrollmentRow key={e.id} e={e} onTarget={setTarget} onRemove={removeEnroll} />)
            )}
          </div>
          <p className="text-[11px] text-slate-400">평가금액·수익률은 데모 추정치입니다. 목표 도달·손실(-10% 이하) 시 알림으로 표시됩니다.</p>
        </section>
      )}

      {detail && (
        <ProductDetailModal
          product={detail}
          watched={isWatched(detail.id)}
          onWatch={toggleWatch}
          onEnroll={goEnroll}
          onClose={() => setDetail(null)}
        />
      )}
    </HubShell>
  );
}
