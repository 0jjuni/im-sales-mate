import { useState } from "react";
import { PieChart, Calculator } from "lucide-react";
import { riskMeta } from "../data/wealthProducts";
import { DETAIL_PERIODS, genSeries, seriesMetrics, holdingsFor, annualizedReturn, simulateSaving } from "../data/wealthDetail";
import { MarketChart } from "../components/MarketChart";
import { cn } from "@shared/lib/format";

/* 투자상품 표시 공용 헬퍼 — 리스트·상세·비교가 함께 쓴다 */
export const pct = (v) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`);
export const retColor = (v) => (v == null ? "text-slate-400" : v > 0 ? "text-red-500" : v < 0 ? "text-blue-600" : "text-slate-500");
export const won = (m) => `${(m ?? 0).toLocaleString()}만원`;
export const eok = (m) => (m >= 10000 ? `${(m / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}조원` : `${m.toLocaleString()}억원`);
export const TYPE_CLASS = { 펀드: "bg-violet-50 text-violet-700", ETF: "bg-sky-50 text-sky-700", 신탁: "bg-amber-50 text-amber-700" };
export const RISK_CLASS = { rose: "bg-rose-50 text-rose-600", amber: "bg-amber-50 text-amber-700", slate: "bg-slate-100 text-slate-500" };

const MetricCell = ({ label, value, tone }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-center">
    <div className="text-[9.5px] text-slate-400">{label}</div>
    <div className={cn("mt-0.5 text-[14px] font-bold tabular-nums", tone || "text-slate-900")}>{value}</div>
  </div>
);

/* 상세 본문(헤더·가입 버튼 제외) — 차트·지표·구성·수수료·적립식 시뮬레이터 */
export function ProductDetailBody({ product }) {
  const [cp, setCp] = useState("1y");
  const [monthly, setMonthly] = useState("50");
  const [years, setYears] = useState(5);

  const rk = riskMeta(product.risk);
  const hasLongReturns = product.return3y != null || product.return5y != null;
  /* 3·5년 실데이터가 없는 펀드는 해당 기간 차트를 만들지 않는다(허위 추정 방지) */
  const periods = hasLongReturns ? DETAIL_PERIODS : DETAIL_PERIODS.filter((p) => p.key !== "3y" && p.key !== "5y");
  const series = genSeries(product, cp);
  const periodRet = series.length >= 2 ? (series[series.length - 1].c / series[0].c - 1) * 100 : null;
  const m3 = seriesMetrics(genSeries(product, "3y"));
  const holdings = holdingsFor(product);
  const maxW = holdings.length ? holdings[0][1] : 1;
  const annual = annualizedReturn(product);
  const sim = simulateSaving(monthly, years, annual);

  return (
    <div className="space-y-5">
      {/* 수익률 차트 */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setCp(p.key)}
                className={cn(
                  "rounded-md px-2 py-1 text-[11.5px] font-semibold transition-colors",
                  cp === p.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <span className={cn("text-[13px] font-bold tabular-nums", retColor(periodRet))}>기간 {pct(periodRet)}</span>
        </div>
        <div className="w-full overflow-x-auto">
          <MarketChart series={series} label={product.name} width={560} height={180} interactive />
        </div>
      </section>

      {/* 핵심 지표 — 3년·5년 데이터가 있으면(ETF·신탁) 장기, 없으면(펀드) 3·6·12개월 */}
      <section>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">핵심 지표</div>
        <div className="grid grid-cols-3 gap-2">
          {hasLongReturns ? (
            <>
              <MetricCell label="1년 수익률" value={pct(product.return1y)} tone={retColor(product.return1y)} />
              <MetricCell label="3년 수익률" value={pct(product.return3y)} tone={retColor(product.return3y)} />
              <MetricCell label="5년 수익률" value={pct(product.return5y)} tone={retColor(product.return5y)} />
            </>
          ) : (
            <>
              <MetricCell label="3개월 수익률" value={pct(product.return3m)} tone={retColor(product.return3m)} />
              <MetricCell label="6개월 수익률" value={pct(product.return6m)} tone={retColor(product.return6m)} />
              <MetricCell label="12개월 수익률" value={pct(product.return1y)} tone={retColor(product.return1y)} />
            </>
          )}
          <MetricCell label="위험등급" value={rk.label} />
          <MetricCell label="연 변동성" value={m3.vol == null ? "—" : `${m3.vol}%`} />
          <MetricCell label="최대낙폭" value={m3.mdd == null ? "—" : `${m3.mdd}%`} tone="text-blue-600" />
        </div>
      </section>

      {/* 구성 TOP */}
      {holdings.length > 0 && (
        <section>
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <PieChart className="h-3.5 w-3.5" />
            주요 구성 (상위 {holdings.length})
          </div>
          <div className="space-y-1.5">
            {holdings.map(([name, w]) => (
              <div key={name} className="flex items-center gap-2">
                <span className="w-28 flex-shrink-0 truncate text-[12px] text-slate-700">{name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-im-400" style={{ width: `${Math.min(100, (w / maxW) * 100)}%` }} />
                </div>
                <span className="w-12 flex-shrink-0 text-right text-[11.5px] font-semibold tabular-nums text-slate-600">{w}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 수수료 */}
      <section>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">수수료</div>
        <div className="grid grid-cols-3 gap-2">
          <MetricCell label="판매보수(연)" value={`${(product.fee * 0.4).toFixed(2)}%`} />
          <MetricCell label="운용보수(연)" value={`${(product.fee * 0.5).toFixed(2)}%`} />
          <MetricCell label="총보수(연)" value={`${product.fee}%`} />
        </div>
        <p className="mt-1.5 text-[10.5px] text-slate-400">보수 구성은 데모 추정치입니다. 환매수수료·기타비용은 상품설명서 확인.</p>
      </section>

      {/* 적립식 시뮬레이터 */}
      <section className="rounded-xl border border-im-200 bg-im-50/40 p-4">
        <div className="mb-2.5 flex items-center gap-1.5 text-[12.5px] font-bold text-im-800">
          <Calculator className="h-4 w-4" />
          적립식 시뮬레이션
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-slate-500">월 납입(만원)</span>
            <input
              value={monthly}
              onChange={(e) => setMonthly(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              className="w-24 rounded-md border border-slate-300 px-2.5 py-1.5 text-right text-[13px] tabular-nums focus:border-im-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-slate-500">기간</span>
            <select
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[13px] focus:border-im-500 focus:outline-none"
            >
              {[3, 5, 10, 20].map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
          </label>
          <span className="text-[11px] text-slate-500">가정 수익률 <span className="font-bold text-im-700">연 {annual.toFixed(1)}%</span></span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-white px-3 py-2 text-center ring-1 ring-inset ring-slate-100">
            <div className="text-[10px] text-slate-400">원금</div>
            <div className="mt-0.5 text-[14px] font-bold tabular-nums text-slate-800">{won(sim.principal)}</div>
          </div>
          <div className="rounded-lg bg-white px-3 py-2 text-center ring-1 ring-inset ring-im-100">
            <div className="text-[10px] text-slate-400">예상 평가액</div>
            <div className="mt-0.5 text-[15px] font-bold tabular-nums text-im-700">{won(sim.futureValue)}</div>
          </div>
          <div className="rounded-lg bg-white px-3 py-2 text-center ring-1 ring-inset ring-slate-100">
            <div className="text-[10px] text-slate-400">예상 수익</div>
            <div className="mt-0.5 text-[14px] font-bold tabular-nums text-red-500">+{won(sim.gain)}</div>
          </div>
        </div>
        <p className="mt-2 text-[10.5px] leading-relaxed text-slate-400">
          가정 수익률(연 {annual.toFixed(1)}%)이 유지된다고 가정한 단순 추정입니다. 실제 수익은 변동하며 원금손실이 발생할 수 있습니다.
        </p>
      </section>

      <p className="text-[12.5px] leading-relaxed text-slate-600">{product.desc}</p>
    </div>
  );
}
