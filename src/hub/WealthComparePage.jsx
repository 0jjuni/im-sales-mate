import { useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, GitCompare, FileText, Plus, SearchX } from "lucide-react";
import { HubShell } from "./HubShell";
import { PRODUCT_BY_ID, SOLD_RANK, riskMeta, riskName, tradingRules, keyRisks, prospectusUrlOf, KOFIA_DISCLOSURE_URL } from "./data/wealthProducts";
import { genSeries, seriesMetrics, holdingsFor } from "./data/wealthDetail";
import { ETF_HOLDINGS } from "./data/wealthEtfLive";
import { pct, retColor, won, eok, TYPE_CLASS, RISK_CLASS } from "./wealth/ProductDetail";
import { MarketChart } from "./components/MarketChart";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

/* 두 상품을 실제 상세처럼 나란히, 행을 정확히 맞춰 비교하는 전체 페이지.
   숫자 행은 우위(수익률 높은/보수 낮은)를 굵게 강조해 권유 근거로 쓴다. */
export default function WealthComparePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
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
          <Link to="/wealth" className="mt-1 text-[12px] font-bold text-im-700 hover:underline">투자상품 목록으로</Link>
        </div>
      </HubShell>
    );
  }

  const cols = products.map((p) => ({
    p,
    m: seriesMetrics(genSeries(p, "3y")),
    holdings: (p.type === "ETF" && ETF_HOLDINGS[p.id]) || holdingsFor(p),
    rules: tradingRules(p),
    risks: keyRisks(p),
  }));

  const RET_ROWS = [["3개월", "return3m"], ["6개월", "return6m"], ["1년(12개월)", "return1y"], ["3년", "return3y"], ["5년", "return5y"]]
    .filter(([, k]) => products.some((p) => p[k] != null));

  /* 우위 판정용 */
  const bestMax = (k) => Math.max(...products.map((p) => (p[k] == null ? -Infinity : p[k])));
  const bestMinFee = Math.min(...products.map((p) => p.fee));

  const gridCols = { gridTemplateColumns: `7rem repeat(${products.length}, minmax(0, 1fr))` };
  const Row = ({ label, children, className }) => (
    <div className={cn("grid border-b border-slate-100", className)} style={gridCols}>
      <div className="bg-slate-50/70 px-3 py-2 text-[11px] font-semibold text-slate-500">{label}</div>
      {children}
    </div>
  );

  return (
    <HubShell>
      <Link to="/wealth" className="mb-3 inline-flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-3.5 w-3.5" />
        투자상품 목록
      </Link>

      <div className="mb-3 flex items-center gap-1.5">
        <GitCompare className="h-5 w-5 text-im-600" />
        <h1 className="text-xl font-bold tracking-tight text-slate-900">상품 비교 <span className="text-slate-400">({products.length})</span></h1>
      </div>

      <div className={cn(CARD, "overflow-x-auto")}>
        <div className="min-w-[640px]">
          {/* 헤더: 상품명 */}
          <div className="grid border-b-2 border-slate-200" style={gridCols}>
            <div className="bg-white px-3 py-3" />
            {cols.map(({ p }) => (
              <div key={p.id} className="border-l border-slate-100 px-3 py-3">
                <div className="flex items-center gap-1">
                  <span className={cn("rounded px-1 py-0.5 text-[9px] font-bold", TYPE_CLASS[p.type])}>{p.type}</span>
                  <span className={cn("rounded px-1 py-0.5 text-[9px] font-semibold", RISK_CLASS[riskMeta(p.risk).tone])}>{riskName(p.risk)}</span>
                </div>
                <button onClick={() => navigate(`/wealth/${p.id}`)} className="mt-1 block text-left text-[13px] font-bold leading-snug text-slate-900 hover:text-im-700">
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
                  <MarketChart series={genSeries(p, "1y")} label={p.name} width={260} height={110} interactive />
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
                      {isBest && <span className="ml-1 text-[9px] font-bold text-emerald-600">▲우위</span>}
                    </div>
                  );
                })}
              </Row>
            );
          })}

          {/* 변동성·최대낙폭 */}
          <Row label="연 변동성">
            {cols.map(({ p, m }) => (
              <div key={p.id} className="border-l border-slate-100 px-3 py-2 text-[12.5px] font-semibold tabular-nums text-slate-700">{m.vol == null ? "—" : `${m.vol}%`}</div>
            ))}
          </Row>
          <Row label="최대낙폭">
            {cols.map(({ p, m }) => (
              <div key={p.id} className="border-l border-slate-100 px-3 py-2 text-[12.5px] font-semibold tabular-nums text-blue-600">{m.mdd == null ? "—" : `${m.mdd}%`}</div>
            ))}
          </Row>

          {/* 총보수 (낮을수록 우위) */}
          <Row label="총보수(연)">
            {cols.map(({ p }) => {
              const isBest = p.fee === bestMinFee && products.length > 1;
              return (
                <div key={p.id} className={cn("border-l border-slate-100 px-3 py-2 text-[13px] font-bold tabular-nums text-slate-800", isBest && "bg-emerald-50/60")}>
                  {p.fee}%{isBest && <span className="ml-1 text-[9px] font-bold text-emerald-600">▼저비용</span>}
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
          <Row label="당행 판매">
            {cols.map(({ p }) => (
              <div key={p.id} className="border-l border-slate-100 px-3 py-2 text-[12.5px] tabular-nums text-slate-700">{SOLD_RANK[p.id]}위</div>
            ))}
          </Row>

          {/* 편입 종목 */}
          <Row label="편입 종목">
            {cols.map(({ p, holdings }) => (
              <div key={p.id} className="border-l border-slate-100 px-3 py-2">
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

          {/* 매입/환매 */}
          <Row label="매입·환매">
            {cols.map(({ p, rules }) => (
              <div key={p.id} className="border-l border-slate-100 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
                <div><b className="text-slate-500">매입</b> {rules.buy}</div>
                <div><b className="text-slate-500">환매</b> {rules.sell}</div>
                <div><b className="text-slate-500">대금</b> {rules.payout}</div>
              </div>
            ))}
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
          <div className="grid" style={gridCols}>
            <div className="bg-slate-50/70 px-3 py-3" />
            {cols.map(({ p }) => {
              const url = prospectusUrlOf(p);
              return (
                <div key={p.id} className="flex flex-wrap gap-1.5 border-l border-slate-100 px-3 py-3">
                  <button
                    onClick={() => window.open(url || KOFIA_DISCLOSURE_URL, "_blank", "noopener,noreferrer")}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    간이투자설명서
                  </button>
                  <button
                    onClick={() => navigate(`/wealth?tab=customers&enroll=${p.id}`)}
                    className="inline-flex items-center gap-1 rounded-md bg-im-600 px-2.5 py-1.5 text-[11.5px] font-bold text-white hover:bg-im-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    가입
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-slate-400">차트·변동성·최대낙폭은 상품 특성 기반 생성 데모입니다. 「▲우위」는 수익률 최고, 「▼저비용」은 총보수 최저 상품을 표시합니다.</p>
    </HubShell>
  );
}
