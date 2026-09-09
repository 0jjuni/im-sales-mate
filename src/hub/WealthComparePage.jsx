import { PrintPreviewModal } from "@shared/components/PrintPreviewModal";
import { ComparisonHoldings } from "./wealth/ComparisonHoldings";
import { FundDocumentButtons } from "./wealth/ProspectusButton";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, GitCompare, Plus, SearchX, Printer } from "lucide-react";
import { HubShell } from "./HubShell";
import { PRODUCT_BY_ID, SOLD_RANK, riskMeta, riskName, keyRisks } from "./data/wealthProducts";
import { genSeries } from "./data/wealthDetail";
import { ETF_HOLDINGS } from "./data/wealthEtfLive";
import { pct, retColor, eok, TYPE_CLASS, RISK_CLASS } from "./wealth/ProductDetail";
import { MarketChart } from "./components/MarketChart";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

/* 두 상품을 실제 상세처럼 나란히, 행을 정확히 맞춰 비교하는 전체 페이지.
   숫자 행은 우위(수익률 높은/보수 낮은)를 굵게 강조해 권유 근거로 쓴다. */
export default function WealthComparePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [printOpen, setPrintOpen] = useState(false);
  const ids = (params.get("ids") || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);
  const products = ids.map((id) => PRODUCT_BY_ID[id]).filter(Boolean);

  useEffect(() => {
    const prev = document.title;
    document.title = "상품 비교 · 투자상품";
    return () => { document.title = prev; };
  }, []);

  if (products.length < 2) {
    return (
      <HubShell>
        <div className={cn(CARD, "flex flex-col items-center gap-2 px-5 py-16 text-center")}>
          <SearchX className="h-7 w-7 text-slate-300" />
          <p className="text-[13px] font-semibold text-slate-600">비교할 상품이 부족합니다(2개 이상 선택).</p>
          <Link to="/wealth" className="mt-1 text-[12px] font-bold text-sky-700 hover:underline">투자상품 목록으로</Link>
        </div>
      </HubShell>
    );
  }

  const cols = products.map((p) => ({
    p,
    
    holdings: (p.type === "ETF" && ETF_HOLDINGS[p.id]) || [],
    risks: keyRisks(p),
  }));

  const RET_ROWS = [["3개월", "return3m"], ["6개월", "return6m"], ["1년(12개월)", "return1y"], ["3년", "return3y"], ["5년", "return5y"]]
    .filter(([, k]) => products.some((p) => p[k] != null));

  /* 우위 판정용 */
  const bestMax = (k) => Math.max(...products.map((p) => (p[k] == null ? -Infinity : p[k])));
  const bestMinFee = Math.min(...products.map((p) => p.fee));

  const gridCols = { gridTemplateColumns: `7rem repeat(${products.length}, minmax(0, 1fr))` };
  const Row = ({ label, children, className }) => (
    <div className={cn("comparison-row grid border-b border-slate-100", className)} style={gridCols}>
      <div className="bg-slate-50/70 px-3 py-2 text-[11px] font-semibold text-slate-500">{label}</div>
      {children}
    </div>
  );

  const comparison = <>
      <div className={cn(CARD, "overflow-x-auto")}>
        <div className="min-w-[640px]">
          {/* 헤더: 상품명 */}
          <div className="comparison-row grid border-b-2 border-slate-200" style={gridCols}>
            <div className="bg-white px-3 py-3" />
            {cols.map(({ p }) => (
              <div key={p.id} className="border-l border-slate-100 px-3 py-3">
                <div className="flex items-center gap-1">
                  <span className={cn("rounded px-1 py-0.5 text-[9px] font-bold", TYPE_CLASS[p.type])}>{p.type}</span>
                  <span className={cn("rounded px-1 py-0.5 text-[9px] font-semibold", RISK_CLASS[riskMeta(p.risk).tone])}>{riskName(p.risk)}</span>
                </div>
                <button onClick={() => navigate(`/wealth/${p.id}`)} className="mt-1 block text-left text-[13px] font-bold leading-snug text-slate-900 hover:text-sky-700">
                  {p.name}
                </button>
                <div className="mt-0.5 text-[10.5px] text-slate-400">{p.company} · {p.category}</div>
              </div>
            ))}
          </div>

          {/* 차트 */}
          <Row label="추이(1년)">
            {cols.map(({ p }) => (
              <div key={p.id} className="border-l border-slate-100 px-2 py-2">
                <div className="overflow-x-auto">
                  <p className="mb-2 text-xs text-slate-500">예시 데이터 · 1년 추이</p><MarketChart series={genSeries(p, "1y")} label={`${p.name} 예시`} width={260} height={110} interactive />
                </div>
              </div>
            ))}
          </Row>

          {/* 기준가 */}
          {products.some((p) => p.nav != null) && (
            <Row label="기준가">
              {cols.map(({ p }) => (
                <div key={p.id} className="border-l border-slate-100 px-3 py-2 text-[13px] font-bold tabular-nums text-slate-800">
                  {p.nav == null ? "—" : p.nav.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              ))}
            </Row>
          )}

          {/* 수익률 */}
          {RET_ROWS.map(([label, k]) => {
            const best = bestMax(k);
            return (
              <Row key={k} label={`${label} 수익률`}>
                {cols.map(({ p }) => {
                  const v = p[k];
                  const isBest = v != null && v === best && products.length > 1;
                  return (
                    <div key={p.id} className={cn("border-l border-slate-100 px-3 py-2 text-[13px] font-bold tabular-nums", retColor(v), isBest && "bg-emerald-50/60")}>
                      {pct(v)}
                      {isBest && <span className="ml-1 text-[9px] font-bold text-emerald-600">높은 값</span>}
                    </div>
                  );
                })}
              </Row>
            );
          })}

          {/* 총보수 (낮을수록 우위) */}
          <Row label="총보수(연)">
            {cols.map(({ p }) => {
              const isBest = p.fee === bestMinFee && products.length > 1;
              return (
                <div key={p.id} className={cn("border-l border-slate-100 px-3 py-2 text-[13px] font-bold tabular-nums text-slate-800", isBest && "bg-emerald-50/60")}>
                  {p.fee}%{isBest && <span className="ml-1 text-[9px] font-bold text-emerald-600">낮은 보수</span>}
                </div>
              );
            })}
          </Row>

          {/* 순자산·판매순위 */}
          <Row label="순자산">
            {cols.map(({ p }) => (
              <div key={p.id} className="border-l border-slate-100 px-3 py-2 text-[12.5px] tabular-nums text-slate-700">{p.aum == null ? "—" : eok(p.aum)}</div>
            ))}
          </Row>
          <Row label="판매순위 예시">
            {cols.map(({ p }) => (
              <div key={p.id} className="border-l border-slate-100 px-3 py-2 text-[12.5px] tabular-nums text-slate-700">{SOLD_RANK[p.id]}위</div>
            ))}
          </Row>

          {/* 편입 종목 */}
          <Row label="투자 대상">
            {cols.map(({ p, holdings }) => (
              <div key={p.id} className="border-l border-slate-100 px-3 py-2">
                <p className="mb-2 text-sm leading-6 text-slate-700">{p.desc}</p>
                {holdings.length > 0 && <p className="mb-2 text-xs text-slate-500">참고용 근사 비중</p>}
                <ul className="space-y-0.5 text-[11px] text-slate-700">
                  {holdings.slice(0, 5).map(([n, w]) => (
                    <li key={n} className="flex justify-between gap-2">
                      <span className="truncate">{n}</span>
                      <span className="flex-shrink-0 tabular-nums text-slate-500">{w}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Row>

          <Row label="주요 보유종목">
            {cols.map(({p})=><div key={p.id} className="min-w-0 border-l border-slate-100 px-3 py-4"><ComparisonHoldings product={p}/></div>)}
          </Row>

          {/* 주요 위험 */}
          <Row label="주요 위험">
            {cols.map(({ p, risks }) => (
              <div key={p.id} className="flex flex-wrap gap-1 border-l border-slate-100 px-3 py-2">
                {risks.map(([t]) => (
                  <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{t}</span>
                ))}
              </div>
            ))}
          </Row>

          {/* 액션 */}
          <div className="comparison-actions grid" style={gridCols}>
            <div className="bg-slate-50/70 px-3 py-3" />
            {cols.map(({ p }) => {
              return (
                <div key={p.id} className="flex flex-wrap gap-1.5 border-l border-slate-100 px-3 py-3">
                  <FundDocumentButtons product={p} className="inline-flex min-h-11 items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"/>
                  <button
                    onClick={() => navigate(`/wealth?tab=customers&enroll=${p.id}`)}
                    className="inline-flex items-center gap-1 rounded-md bg-sky-600 px-2.5 py-1.5 text-[11.5px] font-bold text-white hover:bg-sky-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    고객 등록
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-slate-400">차트는 예시 데이터입니다. 높은 값은 표시된 수익률 중 최고값, 낮은 보수는 총보수 중 최저값입니다. 상품 추천을 뜻하지 않습니다.</p>
  </>;

  return (
    <HubShell>
      <Link to="/wealth" className="mb-3 inline-flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-3.5 w-3.5" />
        투자상품 목록
      </Link>

      <div className="mb-3 flex items-center gap-1.5">
        <GitCompare className="h-5 w-5 text-sky-600" />
        <h1 className="text-xl font-bold tracking-tight text-slate-900">상품 비교 <span className="text-slate-400">({products.length})</span></h1>
      </div>

      <button onClick={()=>setPrintOpen(true)} className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-sky-700 bg-white px-4 py-2 text-sm font-bold text-sky-700"><Printer className="h-4 w-4"/>상담자료 인쇄</button>
      {comparison}
      {printOpen && <PrintPreviewModal title="상품 비교 인쇄 미리보기" onClose={()=>setPrintOpen(false)}><section className="comparison-print p-5"><h1 className="mb-4 text-xl font-bold text-slate-900">상품 비교 <span className="text-slate-400">({products.length})</span></h1>{comparison}</section></PrintPreviewModal>}
    </HubShell>
  );
}
