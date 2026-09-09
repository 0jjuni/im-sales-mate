import { WealthPrintButton } from "./wealth/WealthPrintButton";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Star, TrendingUp, Search, Bell, Target, Trash2, Plus, Layers, CandlestickChart, LineChart, Users, ArrowUpDown, GitCompare, X, Sparkles, Clock, ShieldAlert, UserCheck, Flame, Globe, Megaphone, Home, ArrowRight, HelpCircle, ChevronDown, Settings2 } from "lucide-react";
import { HubShell } from "./HubShell";
import { Sparkline, MarketChart } from "./components/MarketChart";
import { groupFunds, fundBaseName, classLabel, readRecent } from "./wealth/presentation";
import { useWealth } from "./wealth/useWealth";
import { useEtfLive } from "./wealth/useEtfLive";
import { PRODUCTS, SOLD_RANK, riskMeta, riskName, pricingOf } from "./data/wealthProducts";
import { genSeries } from "./data/wealthDetail";
import { pct, retColor, won, TYPE_CLASS, RISK_CLASS } from "./wealth/ProductDetail";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";
import { ModuleNoticeBoard } from "@shared/components/ModuleNoticeBoard";
import { ModuleTabs } from "@shared/components/ModuleTabs";
import { noticesForModule } from "@shared/data/notices";
import { faqsForModule } from "@shared/data/faqs";

/* 위험등급 필터 버튼 색 — riskMeta tone(rose/amber/slate)에 맞춤 */
const RISK_ACTIVE = {
  rose: "bg-rose-500 text-white",
  amber: "bg-amber-500 text-white",
  slate: "bg-slate-600 text-white",
};
const RISK_DOT = {
  rose: "bg-rose-400",
  amber: "bg-amber-400",
  slate: "bg-slate-400",
};

const SORTS = [
  { key: "sold", label: "판매순 예시" },
  { key: "return1y", label: "12개월 수익률" },
  { key: "return6m", label: "6개월 수익률" },
  { key: "return3m", label: "3개월 수익률" },
  { key: "fee", label: "보수 낮은순" },
  { key: "risk", label: "위험 낮은순" },
];

/* 발견 테마 — 클릭 시 조건에 맞는 상품만 큐레이션 */
const THEMES = [
  { key: "us", label: "미국주식", match: (p) => /미국/.test(p.category + p.name) },
  { key: "dividend", label: "고배당·월지급", match: (p) => p.category.includes("배당") },
  { key: "stable", label: "위험 4~6등급", match: (p) => p.risk >= 4 },
  { key: "growth", label: "성장·테마", match: (p) => p.risk <= 2 || p.category.includes("테마") || p.category.includes("신흥") },
  { key: "domestic", label: "국내주식", match: (p) => p.category.includes("국내주식") },
  { key: "bond", label: "채권", match: (p) => /채권|MMF/.test(p.category) },
];

/* 투자성향 → 판매 가능 위험등급 (iM 금융투자상품 투자위험지도 기준).
   성향 등급 이하(더 안전한) 상품은 모두 매수 가능 = 적합성 원칙.
   공격투자형1 / 적극투자형2 / 위험중립형3 / 안정추구형4 / 안정형5 등급까지. */
const INVESTOR_TYPES = [
  { key: "공격투자형", risks: [1, 2, 3, 4, 5, 6] },
  { key: "적극투자형", risks: [2, 3, 4, 5, 6] },
  { key: "위험중립형", risks: [3, 4, 5, 6] },
  { key: "안정추구형", risks: [4, 5, 6] },
  { key: "안정형", risks: [5, 6] },
];
const investorRisksOf = (t) => INVESTOR_TYPES.find((x) => x.key === t)?.risks ?? null;

/* 지역·자산 필터 — 카테고리 문자열로 판정 */
const REGIONS = [
  { key: "미국", match: (p) => /미국/.test(p.category) },
  { key: "중국", match: (p) => /중국/.test(p.category) },
  { key: "국내", match: (p) => /국내/.test(p.category) },
  { key: "유럽", match: (p) => /유럽/.test(p.category) },
  { key: "일본", match: (p) => /일본/.test(p.category) },
  { key: "신흥", match: (p) => /신흥/.test(p.category) },
  { key: "채권", match: (p) => /채권|MMF/.test(p.category) },
  { key: "금·원자재", match: (p) => /금|원자재/.test(p.category) },
  { key: "리츠", match: (p) => /리츠/.test(p.category) },
];

/* 인기 태그(실제 iM 데이터) — 빠른 필터 */
const POPULAR_TAGS = ["판매상위", "수익률상위", "신상품"];

const sortProducts = (list, key) => {
  const arr = [...list];
  if (key === "sold") arr.sort((a, b) => b.sold - a.sold);
  else if (key === "fee") arr.sort((a, b) => a.fee - b.fee);
  else if (key === "risk") arr.sort((a, b) => b.risk - a.risk);
  else arr.sort((a, b) => (b[key] ?? -999) - (a[key] ?? -999));
  return arr;
};

const ProductRow = ({ product, rank, watched, onWatch, onDetail, onEnroll, onChart, inCompare, onCompare, compareFull }) => {
  const rk = riskMeta(product.risk);
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5 last:border-b-0 hover:bg-slate-50">
      <input
        type="checkbox"
        checked={inCompare}
        disabled={!inCompare && compareFull}
        onChange={() => onCompare(product.id)}
        aria-label={`${product.name} 비교 담기`}
        className="h-3.5 w-3.5 flex-shrink-0 accent-sky-600 disabled:opacity-30"
      />
      <span className={cn("hidden w-6 flex-shrink-0 text-center sm:block text-[12px] font-bold tabular-nums", rank <= 3 ? "text-sky-600" : "text-slate-400")}>
        {rank}
      </span>

      <button onClick={() => onDetail(product.id)} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-1.5">
          <span className={cn("hidden shrink-0 rounded px-1 py-0.5 text-[9px] sm:inline font-bold", TYPE_CLASS[product.type])}>{product.type}</span>
          <span className="break-words text-[15px] font-bold leading-6 text-slate-900">{fundBaseName(product.name)}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span>{product.category}</span>
          <span>{product.classes?.length || 1}개 클래스 · 표시 {classLabel(product)}</span>
          <span className={cn("rounded px-1 py-0.5 font-semibold", RISK_CLASS[rk.tone])}>{riskName(product.risk)}</span>
        </div>
        <span className="mt-3 flex items-center justify-between gap-2 text-sm sm:hidden"><span className="text-slate-500">12개월 수익률</span><span className={cn("font-bold tabular-nums",retColor(product.return1y))}>{pct(product.return1y)}</span></span>
      </button>

      <div className="hidden w-14 flex-shrink-0 text-right lg:block">
        <div className={cn("text-[12px] font-semibold tabular-nums", retColor(product.return3m))}>{pct(product.return3m)}</div>
        <div className="text-[9px] text-slate-400">3개월</div>
      </div>
      <div className="hidden w-14 flex-shrink-0 text-right sm:block">
        <div className={cn("text-[12px] font-semibold tabular-nums", retColor(product.return6m))}>{pct(product.return6m)}</div>
        <div className="text-[9px] text-slate-400">6개월</div>
      </div>
      <div className="hidden w-16 flex-shrink-0 text-right sm:block">
        <div className={cn("text-[14px] font-bold tabular-nums", retColor(product.return1y))}>{pct(product.return1y)}</div>
        <div className="text-[9px] text-slate-400">12개월</div>
      </div>
      <button onClick={() => onChart(product)} title="예시 차트 보기" className="hidden w-[52px] shrink-0 sm:block"><Sparkline series={genSeries(product,"6m")} width={52} height={22}/><span className="text-[10px] text-slate-500">예시</span></button>
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

    </div>
  );
};

const wonPrice = (v) => (v == null ? "—" : `${v.toLocaleString("ko-KR")}원`);

/* ETF 행 — 실시간 현재가·등락·미니차트 중심(펀드 행과 성격이 다르다) */
const EtfRow = ({ product, rank, quote, watched, onWatch, onDetail, onEnroll, onChart, inCompare, onCompare, compareFull }) => {
  const rk = riskMeta(product.risk);
  const chg = quote?.changePct;
  return (<>
    <div className="flex items-start gap-3 border-b border-slate-100 px-3 py-4 sm:hidden">
      <input type="checkbox" checked={inCompare} disabled={!inCompare && compareFull} onChange={()=>onCompare(product.id)} aria-label={`${product.name} 비교 담기`} className="mt-1 h-4 w-4 shrink-0 accent-sky-700"/>
      <button onClick={()=>onDetail(product.id)} className="min-w-0 flex-1 text-left"><span className="block text-base font-bold leading-6 text-slate-900">{product.name}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{product.category} · {riskName(product.risk)}</span><span className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="text-base font-bold tabular-nums">{wonPrice(quote?.price)}</span><span className={cn("text-sm font-semibold tabular-nums",retColor(chg))}>{pct(chg)}</span></span></button>
      <button onClick={()=>onWatch(product.id)} aria-label="관심" className="-mr-1 rounded-lg p-2"><Star className={cn("h-4 w-4",watched?"fill-amber-400 text-amber-500":"text-slate-300")}/></button>
    </div>
    <div className="hidden items-center gap-2 border-b border-slate-100 px-3 py-2.5 last:border-b-0 hover:bg-slate-50 sm:flex">
      <input
        type="checkbox"
        checked={inCompare}
        disabled={!inCompare && compareFull}
        onChange={() => onCompare(product.id)}
        title="비교 담기"
        className="h-3.5 w-3.5 flex-shrink-0 accent-sky-600 disabled:opacity-30"
      />
      <span className={cn("w-6 flex-shrink-0 text-center text-[12px] font-bold tabular-nums", rank <= 3 ? "text-sky-600" : "text-slate-400")}>{rank}</span>

      <button onClick={() => onDetail(product.id)} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-1.5">
          <span className={cn("shrink-0 rounded px-1 py-0.5 text-[9px] font-bold", TYPE_CLASS[product.type])}>{product.type}</span>
          <span className="break-words text-[15px] font-bold leading-6 text-slate-900">{product.name}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-slate-400">
          <span>{product.category}</span>
          <span className={cn("rounded px-1 py-0.5 font-semibold", RISK_CLASS[rk.tone])}>{riskName(product.risk)}</span>
        </div>
      </button>

      <div className="w-20 flex-shrink-0 text-right">
        <div className="text-[13px] font-bold tabular-nums text-slate-900">{wonPrice(quote?.price)}</div>
        <div className="text-[9px] text-slate-400">현재가</div>
      </div>
      <div className="w-16 flex-shrink-0 text-right">
        <div className={cn("text-[13px] font-bold tabular-nums", retColor(chg))}>{chg == null ? "—" : `${chg > 0 ? "+" : ""}${chg.toFixed(2)}%`}</div>
        <div className="text-[9px] text-slate-400">등락</div>
      </div>
      <button
        onClick={() => onChart(product)}
        title="추이 그래프 보기"
        className="hidden w-[52px] flex-shrink-0 rounded p-0.5 hover:bg-slate-100 sm:block"
      >
        <Sparkline series={quote?.series} width={52} height={22} />
      </button>
      <div className="hidden w-12 flex-shrink-0 text-right md:block">
        <div className="text-[12px] font-semibold tabular-nums text-slate-600">{product.fee}%</div>
        <div className="text-[9px] text-slate-400">보수</div>
      </div>

      <button onClick={() => onWatch(product.id)} aria-label="관심" className={cn("flex-shrink-0 rounded p-1.5 transition-colors", watched ? "text-amber-400" : "text-slate-300 hover:text-slate-400")}>
        <Star className={cn("h-4 w-4", watched && "fill-amber-400")} />
      </button>
      <button onClick={() => onEnroll(product.id)} className="hidden flex-shrink-0 rounded-md bg-sky-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-sky-700 sm:block">
        고객 등록
      </button>
    </div></>
  );
};

/* ── 추이 그래프 모달 (리스트의 추이 클릭 시) ── */
const CHART_PERIODS = [["1m", "1개월"], ["6m", "6개월"], ["1y", "1년"]];
const ChartModal = ({ product, onClose }) => {
  const [p, setP] = useState("1y");
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const series = genSeries(product, p);
  const ret = series.length >= 2 ? (series[series.length - 1].c / series[0].c - 1) * 100 : null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="mobile-dialog-panel w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
          <div className="min-w-0">
            <span className={cn("shrink-0 rounded px-1 py-0.5 text-[9px] font-bold", TYPE_CLASS[product.type])}>{product.type}</span>
            <span className="ml-1.5 text-[14px] font-bold text-slate-900">{product.name}</span>
          </div>
          <button onClick={onClose} aria-label="닫기" className="flex-shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex gap-1">
              {CHART_PERIODS.map(([k, l]) => (
                <button key={k} onClick={() => setP(k)} className={cn("rounded-md px-2 py-1 text-[11.5px] font-semibold transition-colors", p === k ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100")}>
                  {l}
                </button>
              ))}
            </div>
            <span className={cn("text-[13px] font-bold tabular-nums", retColor(ret))}>기간 {pct(ret)}</span>
          </div>
          <div className="w-full overflow-x-auto">
            <MarketChart series={series} label={product.name} width={480} height={180} interactive />
          </div>
          <p className="mt-2 text-[10.5px] text-slate-400">추이는 상품 특성 기반 생성 데모입니다.</p>
        </div>
      </div>
    </div>
  );
};

const ALERT_META = {
  target: { label: "목표 도달", cls: "bg-sky-100 text-sky-700" },
  loss: { label: "손실 경고", cls: "bg-rose-100 text-rose-700" },
  progress: { label: "진행 중", cls: "bg-slate-100 text-slate-500" },
  pending: { label: "기준가 대기", cls: "bg-amber-100 text-amber-700" },
};

const nav = (v) => (v == null ? "—" : v.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const mdShort = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  return `${dt.getMonth() + 1}.${dt.getDate()}`;
};
const dDays = (d) => Math.max(0, Math.ceil(((d instanceof Date ? d : new Date(d)).getTime() - Date.now()) / 86400000));

const EnrollmentRow = ({ e, onTarget, onRemove }) => {
  const a = ALERT_META[e.alert];
  const pending = e.status === "대기";
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-100 px-3 py-3 last:border-b-0">
      <div className="min-w-[9rem] flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[12px] font-bold tabular-nums text-slate-800">{e.customerNo}</span>
          <span className={cn("rounded px-1 py-0.5 text-[9px] font-bold", a.cls)}>{a.label}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-[12px] text-slate-600">
          {e.product?.name ?? "(상품 없음)"}
          {e.pricing && <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-semibold text-slate-500">{e.pricing.chip}</span>}
        </div>
        <div className="text-[10px] text-slate-400">
          신청 {e.joinedAt} · {won(e.principal)}
          {!pending && e.entryNav != null && (
            <> · {e.pricing?.priceLabel ?? "매입가"} {nav(e.entryNav)}{e.units != null && ` · ${e.units.toLocaleString()}좌`}</>
          )}
        </div>
      </div>
      {pending ? (
        <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700">
          <Clock className="h-3.5 w-3.5" />
          매입가 확정 {mdShort(e.confirmAt)} (D-{dDays(e.confirmAt)})
        </div>
      ) : (
        <>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">현재 기준가</div>
            <div className="text-[13px] font-bold tabular-nums text-slate-900">{nav(e.nowNav)}</div>
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
            <input type="number" value={e.targetReturn} onChange={(ev) => onTarget(e.id, ev.target.value)} className="w-14 rounded border border-slate-300 px-1.5 py-1 text-right text-[12px] tabular-nums focus:border-sky-500 focus:outline-none" />
            %
          </label>
        </>
      )}
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
  const [pquery, setPquery] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (presetProductId) setProductId(presetProductId);
  }, [presetProductId]);
  const selected = PRODUCTS.find((p) => p.id === productId);
  const pricing = pricingOf(selected);
  const matches = pquery.trim()
    ? PRODUCTS.filter((p) => `${p.name} ${p.category} ${p.company}`.toLowerCase().includes(pquery.trim().toLowerCase())).slice(0, 8)
    : [];
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
        <input value={customerNo} onChange={(e) => setCustomerNo(e.target.value.replace(/\D/g, "").slice(0, 9))} inputMode="numeric" maxLength={9} placeholder="9자리" className="w-28 rounded-md border border-slate-300 px-2.5 py-1.5 text-[13px] tabular-nums focus:border-sky-500 focus:outline-none" />
      </label>
      <div className="relative flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[10px] font-semibold text-slate-500">상품 (검색)</span>
        <input
          value={open ? pquery : selected ? `[${selected.type}] ${selected.name}` : ""}
          onChange={(e) => { setPquery(e.target.value); setOpen(true); }}
          onFocus={() => { setPquery(""); setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder="상품명·운용사 검색"
          className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[13px] focus:border-sky-500 focus:outline-none"
        />
        {open && matches.length > 0 && (
          <ul className="absolute left-0 top-full z-30 mt-1 max-h-72 w-[24rem] max-w-[85vw] overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
            {matches.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onMouseDown={() => { setProductId(p.id); setOpen(false); setPquery(""); }}
                  className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left hover:bg-slate-50"
                >
                  <span className={cn("flex-shrink-0 rounded px-1 py-0.5 text-[9px] font-bold", TYPE_CLASS[p.type])}>{p.type}</span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-slate-800">{p.name}</span>
                  <span className="flex-shrink-0 text-[10px] text-slate-400">{p.company}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {open && pquery.trim() && matches.length === 0 && (
          <div className="absolute left-0 top-full z-30 mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-400 shadow-lg">검색 결과 없음</div>
        )}
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-slate-500">가입금액(만원)</span>
        <input value={principal} onChange={(e) => setPrincipal(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="1000" className="w-24 rounded-md border border-slate-300 px-2.5 py-1.5 text-[13px] tabular-nums focus:border-sky-500 focus:outline-none" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-slate-500">목표수익률</span>
        <input value={target} onChange={(e) => setTarget(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className="w-16 rounded-md border border-slate-300 px-2.5 py-1.5 text-right text-[13px] tabular-nums focus:border-sky-500 focus:outline-none" />
      </label>
      <button type="submit" disabled={!canSubmit} className="rounded-md bg-sky-600 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40">
        가입 추가
      </button>
      {pricing.note && (
        <p className="flex w-full items-center gap-1.5 text-[11px] text-slate-500">
          <span className={cn("rounded px-1.5 py-0.5 text-[9.5px] font-bold", TYPE_CLASS[selected?.type] ?? "bg-slate-100 text-slate-500")}>{pricing.chip}</span>
          {pricing.note}
        </p>
      )}
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

/* 투자상품 FAQ — 매입·환매·적합성 등 상담 문답. 담당 부서가 /admin에서 관리(공용 FAQ 스토어). */
const WealthFaq = () => {
  const [query, setQuery] = useState("");
  const [openIdx, setOpenIdx] = useState(0);
  const items = faqsForModule("wealth");
  const filtered = items.filter((f) => f.q.includes(query) || f.a.includes(query));
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-[13px] text-slate-500">매입 기준가·환매·적합성 등 상담 문답 · 담당 부서가 직접 관리</p>
        <Link
          to="/admin?mode=faq"
          className="inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
        >
          <Settings2 className="h-3.5 w-3.5" />
          FAQ 관리
        </Link>
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="질문 검색 (예: 기준가, 환매, ETF, 적합성)"
          className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-[13px] focus:border-sky-500 focus:outline-none"
        />
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && <div className="py-8 text-center text-[13px] text-slate-400">검색 결과가 없습니다.</div>}
        {filtered.map((f, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={f.id} className={cn(CARD, "overflow-hidden")}>
              <button onClick={() => setOpenIdx(isOpen ? -1 : i)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50">
                <span className="text-[13.5px] font-semibold text-slate-900">{f.q}</span>
                <ChevronDown className={cn("h-4 w-4 flex-shrink-0 text-slate-400 transition-transform", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 px-4 pb-3.5 pt-0.5">
                  <p className="text-[13px] leading-relaxed text-slate-700">{f.a}</p>
                  {f.ref && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-sm border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">{f.ref}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default function WealthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isWatched, toggleWatch, watchlist, enrollments, enroll, removeEnroll, setTarget } = useWealth();
  const [tab, setTab] = useState("home");
  const [recentIds] = useState(readRecent);
  const [visibleCount, setVisibleCount] = useState(30);
  const [riskFilter, setRiskFilter] = useState("전체");
  const [investorType, setInvestorType] = useState("전체");
  const [tagFilter, setTagFilter] = useState(null);
  const [region, setRegion] = useState(null);
  const [theme, setTheme] = useState(null);
  const [watchOnly, setWatchOnly] = useState(false);
  const [sort, setSort] = useState("sold");
  const [query, setQuery] = useState("");
  const [compare, setCompare] = useState([]);
  const [presetProduct, setPresetProduct] = useState(null);
  const [chartProduct, setChartProduct] = useState(null);

  useEffect(() => {
    const prev = document.title;
    document.title = "투자상품 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  /* 상세에서 '고객 가입' 등으로 넘어오면 고객 탭 + 상품 프리셋. ?tab=fund/etf/trust도 지원 */
  useEffect(() => {
    const t = params.get("tab");
    if (["home", "customers", "fund", "etf", "faq", "notices"].includes(t)) setTab(t);
    const en = params.get("enroll");
    if (en) setPresetProduct(en);
  }, [params]);

  /* 상품 유형별 탭 — 펀드·ETF는 성격이 달라 분리(신탁은 제외) */
  const PRODUCT_TABS = [
    { id: "fund", type: "펀드", label: "펀드", icon: Layers },
    { id: "etf", type: "ETF", label: "ETF", icon: CandlestickChart },
  ];
  const isCustomers = tab === "customers";
  const catalogType = (PRODUCT_TABS.find((t) => t.id === tab) || PRODUCT_TABS[0]).type;

  /* 현재 탭(상품 유형)에 존재하는 위험등급만 필터로 노출(오름차순) */
  const riskGrades = useMemo(
    () => [...new Set(PRODUCTS.filter((p) => p.type === catalogType).map((p) => p.risk))].sort((a, b) => a - b),
    [catalogType]
  );

  /* 탭(상품 유형)을 바꾸면 그 유형에 없는 필터가 남아 빈 목록이 되지 않도록 초기화 */
  useEffect(() => {
    setRiskFilter("전체");
    setTagFilter(null);
  }, [tab]);

  useEffect(() => { setVisibleCount(30); }, [tab, query, riskFilter, investorType, tagFilter, region, theme, watchOnly, sort]);

  const investorRisks = investorRisksOf(investorType);
  /* 현재 유형에 실제 존재하는 인기 태그만 칩으로 노출(펀드에만 태그 있음) */
  const availableTags = useMemo(() => {
    const set = new Set();
    for (const p of PRODUCTS) if (p.type === catalogType && Array.isArray(p.tags)) p.tags.forEach((t) => set.add(t));
    return POPULAR_TAGS.filter((t) => set.has(t));
  }, [catalogType]);

  const themeObj = THEMES.find((t) => t.key === theme);
  const regionObj = REGIONS.find((r) => r.key === region);
  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = PRODUCTS.filter(
      (p) =>
        p.type === catalogType &&
        (riskFilter === "전체" || p.risk === riskFilter) &&
        (!investorRisks || investorRisks.includes(p.risk)) &&
        (!tagFilter || (Array.isArray(p.tags) && p.tags.includes(tagFilter))) &&
        (!regionObj || regionObj.match(p)) &&
        (!themeObj || themeObj.match(p)) &&
        (!watchOnly || watchlist.includes(p.id)) &&
        (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.company.toLowerCase().includes(q))
    );
    const ordered = sortProducts(filtered, sort);
    return catalogType === "펀드" ? groupFunds(ordered) : ordered;
  }, [catalogType, riskFilter, investorRisks, tagFilter, regionObj, themeObj, watchOnly, watchlist, sort, query]);

  /* ETF 탭에서만 실시간 시세 폴링(토스 프록시 → 실패 시 모의) */
  const isEtf = tab === "etf";
  const { quotes: etfQuotes, live: etfLive } = useEtfLive(isEtf ? products : []);

  const totals = useMemo(() => {
    const value = enrollments.reduce((s, e) => s + e.currentValue, 0);
    const principal = enrollments.reduce((s, e) => s + e.principal, 0);
    const alerts = enrollments.filter((e) => e.alert === "target" || e.alert === "loss").length;
    const pending = enrollments.filter((e) => e.status === "대기").length;
    return { value, principal, alerts, pending };
  }, [enrollments]);

  const toggleCompare = (id) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]));

  const goDetail = (id) => navigate(`/wealth/${id}`);
  const goEnroll = (id) => {
    setPresetProduct(id);
    setTab("customers");
  };

  const anyFilter = theme || region || tagFilter || investorType !== "전체" || riskFilter !== "전체" || watchOnly || query.trim();
  const resetFilters = () => {
    setTheme(null);
    setRegion(null);
    setTagFilter(null);
    setInvestorType("전체");
    setRiskFilter("전체");
    setWatchOnly(false);
    setQuery("");
  };

  const TABS = [
    { id: "home", label: "홈", icon: Home },
    ...PRODUCT_TABS.map((t) => ({ ...t, count: groupFunds(PRODUCTS.filter((p) => p.type === t.type)).length })),
    { id: "customers", label: "내 가입고객 관리", icon: Users, count: enrollments.length },
    { id: "faq", label: "FAQ", icon: HelpCircle, count: faqsForModule("wealth").length },
    { id: "notices", label: "공지사항", icon: Megaphone, count: noticesForModule("wealth").length },
  ];

  return (
    <HubShell>
      <div className="mb-4 flex flex-wrap justify-end gap-2"><WealthPrintButton ids={compare.length ? compare : watchlist} label={compare.length ? "선택상품 상담자료 인쇄" : "관심상품 상담자료 인쇄"}/></div>
      {/* 모듈 헤더 — 다른 모듈과 통일(아이콘 사각형 + 제목) */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
          <LineChart className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[17px] font-black leading-tight text-slate-900 md:text-xl">투자상품</h1>
          <p className="text-[11px] text-slate-500">펀드·ETF를 찾고 상담 내용을 확인하세요</p>
        </div>
      </div>

      <ModuleTabs items={TABS} activeId={tab} onSelect={setTab} accent="sky" />

      {tab === "home" ? (
        <section className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {[{title:"관심상품", ids:watchlist, empty:"상품의 별표를 누르면 여기에 모입니다."}, {title:"최근 본 상품", ids:recentIds, empty:"펀드나 ETF 상세를 열면 최근 본 상품이 남습니다."}].map(({title,ids,empty}) => <div key={title} className={cn(CARD,"p-5")}><h2 className="mb-3 text-base font-bold text-slate-900">{title}</h2>{ids.filter(id=>PRODUCTS.some(p=>p.id===id)).length ? ids.slice(0,6).map(id=>PRODUCTS.find(p=>p.id===id)).filter(Boolean).map(p=><button key={p.id} onClick={()=>goDetail(p.id)} className="flex min-h-14 w-full items-center justify-between gap-3 border-t border-slate-100 py-3 text-left"><span className="min-w-0"><span className="block text-sm font-semibold text-slate-800">{fundBaseName(p.name)}</span><span className="mt-1 block text-xs text-slate-500">{p.category} · {classLabel(p)}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-sky-700"/></button>):<p className="py-4 text-sm leading-7 text-slate-500">{empty}</p>}</div>)}
          </div>
          <button onClick={()=>setTab("customers")} className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 p-5 text-left"><span><span className="block text-base font-bold text-slate-900">확인할 고객 알림 {totals.alerts}건</span><span className="mt-1 block text-sm text-slate-600">목표수익률 도달·손실 알림 확인 · 데모 평가액 기준</span></span><span className="text-sm font-semibold text-sky-800">가입고객 관리 열기</span></button>
          {/* 스탯 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <SummaryStat label="전체 상품" value={`${PRODUCTS.length}개`} icon={Layers} />
            <SummaryStat label="내 관심" value={`${watchlist.length}개`} icon={Star} />
            <SummaryStat label="가입 고객" value={`${enrollments.length}건`} icon={Users} />
          </div>
          {/* 바로가기 */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { id: "fund", icon: Layers, title: "펀드", desc: `${groupFunds(PRODUCTS.filter((p) => p.type === "펀드")).length}개 펀드 · 클래스 묶음` },
              { id: "etf", icon: CandlestickChart, title: "ETF", desc: "시세·상품 정보" },
              { id: "customers", icon: Users, title: "내 가입고객 관리", desc: "목표수익률·알림" },
              { id: "faq", icon: HelpCircle, title: "FAQ", desc: "매입·환매·적합성 문답" },
            ].map((n) => {
              const Icon = n.icon;
              return (
                <button key={n.id} onClick={() => setTab(n.id)} className={cn(CARD, "group p-4 text-left transition-all hover:border-sky-300 hover:shadow-md")}>
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-sky-600 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <h3 className="mt-2.5 text-[13.5px] font-bold text-slate-900">{n.title}</h3>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{n.desc}</p>
                </button>
              );
            })}
          </div>
          {/* 인기 상품 */}
          <div className={cn(CARD, "overflow-hidden")}>
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
              <span className="text-[13px] font-bold text-slate-900">
                판매순 예시 <span className="ml-1 text-[11px] font-medium text-slate-400">데모 기준</span>
              </span>
              <button onClick={() => setTab("fund")} className="text-[11.5px] font-semibold text-sky-600 hover:text-sky-700">
                전체 보기
              </button>
            </div>
            {groupFunds([...PRODUCTS].sort((a, b) => b.sold - a.sold)).slice(0, 5).map((p, i) => (
              <button key={p.id} onClick={() => goDetail(p.id)} className="flex w-full items-center gap-2 border-b border-slate-100 px-4 py-2.5 text-left last:border-b-0 hover:bg-slate-50">
                <span className={cn("w-5 flex-shrink-0 text-center text-[12px] font-bold tabular-nums", i < 3 ? "text-sky-600" : "text-slate-400")}>{i + 1}</span>
                <span className={cn("flex-shrink-0 rounded px-1 py-0.5 text-[9px] font-bold", TYPE_CLASS[p.type])}>{p.type}</span>
                <span className="min-w-0 flex-1 break-words text-[13px] font-semibold leading-6 text-slate-900">{fundBaseName(p.name)}</span>
                <span className={cn("flex-shrink-0 text-[13px] font-bold tabular-nums", retColor(p.return1y))}>{pct(p.return1y)}</span>
              </button>
            ))}
          </div>
        </section>
      ) : tab === "faq" ? (
        <WealthFaq />
      ) : tab === "notices" ? (
        <ModuleNoticeBoard moduleId="wealth" />
      ) : !isCustomers ? (
        <section>
          {/* 검색 */}
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="상품명·카테고리·운용사 검색" className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-[13px] focus:border-sky-500 focus:outline-none" />
          </div>

          {/* 검색 조건 — 검색창 바로 아래 한 곳에 모음 */}
          <div className="mb-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
            {/* 투자성향(적합성) */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex w-[4.75rem] flex-shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-bold text-slate-400">
                <UserCheck className="h-3 w-3" />
                투자성향
              </span>
              {["전체", ...INVESTOR_TYPES.map((t) => t.key)].map((k) => (
                <button
                  key={k}
                  onClick={() => setInvestorType(k)}
                  className={cn("rounded-md px-2.5 py-1 text-[12px] font-semibold transition-colors", investorType === k ? "bg-sky-700 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900")}
                >
                  {k}
                </button>
              ))}
              {investorType !== "전체" && <span className="text-[10.5px] text-slate-400">판매 가능 등급만 표시</span>}
            </div>

            {/* 지역·자산 */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex w-[4.75rem] flex-shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-bold text-slate-400">
                <Globe className="h-3 w-3" />
                지역·자산
              </span>
              {REGIONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRegion((cur) => (cur === r.key ? null : r.key))}
                  className={cn("rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors", region === r.key ? "bg-sky-600 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900")}
                >
                  {r.key}
                </button>
              ))}
            </div>

            <div>
              <div className="space-y-3 py-2">
            {/* 인기 태그(펀드) */}
            {availableTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex w-[4.75rem] flex-shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-bold text-slate-400">
                  <Flame className="h-3 w-3" />
                  인기
                </span>
                {availableTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTagFilter((cur) => (cur === t ? null : t))}
                    className={cn("rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors", tagFilter === t ? "bg-rose-500 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900")}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex w-[4.75rem] flex-shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-bold text-slate-400">
                <Sparkles className="h-3 w-3" />
                테마
              </span>
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTheme((cur) => (cur === t.key ? null : t.key))}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors",
                    theme === t.key ? "bg-sky-600 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {/* 위험등급 */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex w-[4.75rem] flex-shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-bold text-slate-400">
                <ShieldAlert className="h-3 w-3" />
                위험등급
              </span>
              <button
                onClick={() => setRiskFilter("전체")}
                className={cn("rounded-md px-2.5 py-1 text-[12px] font-semibold transition-colors", riskFilter === "전체" ? "bg-slate-800 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900")}
              >
                전체
              </button>
              {riskGrades.map((g) => {
                const rk = riskMeta(g);
                const on = riskFilter === g;
                const name = riskName(g);
                const blocked = investorRisks && !investorRisks.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => setRiskFilter(on ? "전체" : g)}
                    disabled={blocked}
                    title={blocked ? `${rk.full} · 현재 투자성향으로는 판매 불가` : rk.full}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-semibold transition-colors",
                      blocked ? "cursor-not-allowed bg-white text-slate-300 line-through ring-1 ring-inset ring-slate-100" : on ? RISK_ACTIVE[rk.tone] : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", blocked ? "bg-slate-200" : on ? "bg-white/80" : RISK_DOT[rk.tone])} />
                    {name}
                  </button>
                );
              })}
            </div>
              </div>
            </div>
          </div>

          {anyFilter && <div className="mb-3 flex flex-wrap gap-2" aria-label="선택한 검색 조건">{[
            [investorType !== "전체" && investorType, () => setInvestorType("전체")],
            [region, () => setRegion(null)], [themeObj?.label, () => setTheme(null)],
            [tagFilter, () => setTagFilter(null)], [riskFilter !== "전체" && riskName(riskFilter), () => setRiskFilter("전체")],
          ].filter(([label]) => label).map(([label, clear]) => <button key={label} onClick={clear} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-50 px-3 text-sm text-sky-800" aria-label={`${label} 필터 해제`}>{label}<X className="h-3 w-3"/></button>)}</div>}
          {/* 관심만 + 정렬 */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setWatchOnly((v) => !v)}
              className={cn("inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-semibold transition-colors", watchOnly ? "bg-amber-400 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900")}
            >
              <Star className={cn("h-3 w-3", watchOnly && "fill-white")} />
              관심만
            </button>
            <span className="text-[11px] text-slate-400 tabular-nums">{products.length}개</span>
            {anyFilter && (
              <button onClick={resetFilters} className="text-[11.5px] font-semibold text-slate-400 hover:text-slate-700">
                필터 초기화
              </button>
            )}
            <label className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-slate-500">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[12px] font-semibold text-slate-700 focus:border-sky-500 focus:outline-none">
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* ETF 실시간 뱃지 */}
          {isEtf && (
            <div className="mb-2 flex items-center gap-1.5 text-[11px]">
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold", etfLive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                <span className={cn("h-1.5 w-1.5 rounded-full", etfLive ? "animate-pulse bg-emerald-500" : "bg-slate-400")} />
                {etfLive ? "시세 조회" : "모의 시세"}
              </span>
              <span className="text-slate-400">
                {etfLive ? "사내 시세 · 조회 전용" : "내부망 데모 · 로컬 예시 데이터"}
              </span>
            </div>
          )}

          {/* 리스트 */}
          <div className={cn(CARD, "overflow-hidden")}>
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="w-3.5" />
              <span className="w-6 text-center">{sort === "sold" ? "순위" : "#"}</span>
              <span className="flex-1">상품</span>
              {isEtf ? (
                <>
                  <span className="hidden w-20 text-right sm:block">현재가</span>
                  <span className="hidden w-16 text-right sm:block">등락</span>
                  <span className="hidden w-[52px] text-center sm:block">추이</span>
                  <span className="hidden w-12 text-right md:block">보수</span>
                </>
              ) : (
                <>
                  <span className="hidden w-14 text-right lg:block">3개월</span>
                  <span className="hidden w-14 text-right sm:block">6개월</span>
                  <span className="hidden w-16 text-right sm:block">12개월</span>
                  <span className="hidden w-[52px] text-center sm:block">예시 추이</span>
                  <span className="hidden w-12 text-right md:block">보수</span>
                </>
              )}
              <span className="w-[3.9rem]" />
            </div>
            {products.length === 0 ? (
              <p className="px-3 py-12 text-center text-[13px] text-slate-400">{watchOnly ? "관심 등록한 상품이 없습니다." : "검색 결과가 없습니다."}</p>
            ) : (
              products.slice(0, visibleCount).map((p) =>
                isEtf ? (
                  <EtfRow
                    key={p.id}
                    product={p}
                    rank={SOLD_RANK[p.id]}
                    quote={etfQuotes[p.id]}
                    watched={isWatched(p.id)}
                    onWatch={toggleWatch}
                    onDetail={goDetail}
                    onEnroll={goEnroll}
                    onChart={setChartProduct}
                    inCompare={compare.includes(p.id)}
                    onCompare={toggleCompare}
                    compareFull={compare.length >= 3}
                  />
                ) : (
                  <ProductRow
                    key={p.id}
                    product={p}
                    rank={SOLD_RANK[p.id]}
                    watched={isWatched(p.id)}
                    onWatch={toggleWatch}
                    onDetail={goDetail}
                    onEnroll={goEnroll}
                    onChart={setChartProduct}
                    inCompare={compare.includes(p.id)}
                    onCompare={toggleCompare}
                    compareFull={compare.length >= 3}
                  />
                )
              )
            )}
          </div>
          {products.length > visibleCount && <button onClick={()=>setVisibleCount(n=>n+30)} className="mt-4 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">상품 더 보기 · {visibleCount}/{products.length}</button>}
          <p className="mt-2 text-[11px] text-slate-400">
            {isEtf ? "시세 연결 상태는 위 표시를 확인하세요. 판매순위는 데모 예시이며 왼쪽 체크로 최대 3개까지 비교할 수 있습니다." : "펀드별로 묶어 표시합니다. 수익률·보수·비교는 각 행에 표시된 클래스 기준이며, 검색과 정렬에 따라 표시 클래스가 달라집니다. 판매순위는 데모 예시입니다."}
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SummaryStat label="가입 건수" value={`${enrollments.length}건`} icon={Users} />
            <SummaryStat label="총 평가금액" value={won(totals.value)} icon={TrendingUp} sub={`원금 ${won(totals.principal)}`} />
            <SummaryStat label="알림" value={`${totals.alerts}건`} icon={Bell} tone={totals.alerts > 0 ? "alert" : "none"} sub={totals.pending > 0 ? `기준가 대기 ${totals.pending}건` : null} />
          </div>
          <div className={cn(CARD, "p-4")}>
            <div className="mb-3 flex items-center gap-1.5 text-[12.5px] font-bold text-slate-700">
              <Plus className="h-4 w-4 text-sky-600" />
              가입 고객 등록
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
          <p className="text-[11px] text-slate-400">매입가는 상품 유형별 기준가 확정 방식(ETF 실시간 체결 · 펀드 T+1~2 · 신탁 설정일)을 반영합니다. 확정 전에는 「기준가 대기」로, 확정 후에는 매입 기준가 대비 보유기간 수익률로 계산합니다. 기준가·평가금액은 데모 추정치입니다.</p>
        </section>
      )}

      {/* 비교 담기 스티키 바 */}
      {!isCustomers && compare.length > 0 && (
        <div className="sticky bottom-4 mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur">
          <span className="text-[12px] font-bold text-slate-700">비교 담기 {compare.length}/3</span>
          <div className="flex flex-wrap gap-1">
            {compare.map((id) => {
              const p = PRODUCTS.find((x) => x.id === id);
              return (
                <span key={id} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {p.name}
                  <button onClick={() => toggleCompare(id)} aria-label="빼기" className="text-slate-400 hover:text-slate-600">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setCompare([])} className="text-[11px] font-semibold text-slate-400 hover:text-slate-600">전체 해제</button>
            <button
              onClick={() => navigate(`/wealth/compare?ids=${compare.join(",")}`)}
              disabled={compare.length < 2}
              className="inline-flex items-center gap-1 rounded-md bg-sky-600 px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-sky-700 disabled:opacity-40"
            >
              <GitCompare className="h-3.5 w-3.5" />
              비교하기
            </button>
          </div>
        </div>
      )}

      {chartProduct && <ChartModal product={chartProduct} onClose={() => setChartProduct(null)} />}
    </HubShell>
  );
}
