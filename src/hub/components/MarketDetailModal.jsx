import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Printer, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MarketChart } from "./MarketChart";
import { PERIODS, fetchSeries } from "../data/marketQuotes";
import { PrintReport } from "@shared/components/PrintReport";
import { cn } from "@shared/lib/format";

/* 마켓 지표 상세 — 셀 클릭 시 열린다. 기간(10일/1년/5년/10년) 선택 가능한 추이 차트 +
   요약 통계 + PB 관점 메모. 적립식 추천 시 장기 추이를 함께 보여줄 수 있다.
   「인쇄」는 선택 기간 그대로 A4 상담자료로 출력. 대시보드가 함께 인쇄되지 않도록
   PrintReport를 body로 포탈하고 인쇄 동안 html.printing-market으로 #root를 숨긴다. */

const num = (v) => (typeof v === "number" ? v.toLocaleString("ko-KR", { maximumFractionDigits: 2 }) : v);
const fmtAsOf = (d) => {
  if (!d) return null;
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt)) return null;
  return `${dt.getFullYear()}. ${dt.getMonth() + 1}. ${dt.getDate()}`;
};

/* 지표 성격 + 등락 방향 → 창구 상담 관점 한 줄. 규칙 기반(추정) · 투자권유 아님 */
const pbNote = (label, change) => {
  const dir = change > 0.15 ? "up" : change < -0.15 ? "down" : "flat";
  if (label === "USD/KRW") {
    if (dir === "up") return "원화가 약세입니다. 환율에 민감한 수입·유학 자금 고객은 분할 환전을 문의할 수 있고, 안전자산 선호가 커질 수 있습니다.";
    if (dir === "down") return "원화가 강세입니다. 해외송금·수입대금 고객에게 유리한 시점이 될 수 있습니다.";
    return "환율이 보합권입니다. 방향성보다 고객별 자금 스케줄에 맞춰 안내하세요.";
  }
  if (label === "미국 10년물") {
    if (dir === "up") return "시장금리가 상승했습니다. 예금 금리 매력이 부각되니 만기 도래 고객의 재예치 상담에 활용하세요.";
    if (dir === "down") return "시장금리가 하락했습니다. 예금 금리 인하 가능성에 대비해 만기 고객에게 조기 재예치 여지를 안내할 수 있습니다.";
    return "금리가 보합권입니다. 예금·채권형 상품 안내 시 방향성 단정은 피하세요.";
  }
  if (dir === "up") return "증시가 상승했습니다. 위험 선호가 개선되는 국면에서 ISA·펀드 등 투자형 상담 여지가 있으나, 추격매수 권유로 읽히지 않게 주의하세요.";
  if (dir === "down") return "증시가 조정받았습니다. 변동성에 민감한 고객에게는 예적금·ISA 등 안정형 대안을 함께 제시하세요.";
  return "증시가 보합권입니다. 지표 방향보다 고객 성향에 맞춘 자산 배분 관점으로 접근하세요.";
};

export function MarketDetailModal({ market, asOf, onClose }) {
  const [period, setPeriod] = useState("10d");
  const [series, setSeries] = useState(market?.series || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const cleanup = () => document.documentElement.classList.remove("printing-market");
    window.addEventListener("afterprint", cleanup);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("afterprint", cleanup);
      cleanup();
    };
  }, [onClose]);

  /* 고객·지표가 바뀌면 기본(10일)로 리셋 */
  useEffect(() => {
    setPeriod("10d");
    setSeries(market?.series || []);
  }, [market?.symbol]);

  /* 기간 전환 — 10일은 이미 받아둔 시리즈, 그 외는 온디맨드 조회 */
  useEffect(() => {
    if (!market?.symbol) return;
    let alive = true;
    if (period === "10d") {
      setSeries(market.series || []);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchSeries(market.symbol, period)
      .then((s) => {
        if (alive) {
          setSeries(s);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false); // 실패 시 직전 시리즈 유지
      });
    return () => {
      alive = false;
    };
  }, [period, market?.symbol, market?.series]);

  if (!market) return null;

  const { label, value, change } = market;
  const flat = change === 0;
  const up = change > 0;
  const vals = Array.isArray(series) ? series.map((d) => d.c) : [];
  const hi = vals.length ? Math.max(...vals) : null;
  const lo = vals.length ? Math.min(...vals) : null;
  const periodReturn =
    series.length >= 2 ? ((series[series.length - 1].c - series[0].c) / series[0].c) * 100 : null;
  /* 연평균 수익률(CAGR) — 실제 경과기간 기준. 10일 같은 단기 구간을 연환산하면
     과장되므로 경과기간이 약 1년 이상일 때만 산출한다. */
  const elapsedYears =
    series.length >= 2
      ? (new Date(series[series.length - 1].t).getTime() - new Date(series[0].t).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000)
      : 0;
  const cagr =
    elapsedYears >= 0.9 && series[0].c > 0
      ? (Math.pow(series[series.length - 1].c / series[0].c, 1 / elapsedYears) - 1) * 100
      : null;
  const asOfText = fmtAsOf(asOf);
  const note = pbNote(label, change);
  const changeText = `${up ? "+" : ""}${change.toFixed(2)}%`;
  const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? "10일";
  const rangeText = period === "10d" ? "최근 10거래일" : `최근 ${periodLabel}`;
  const canSelect = !!market.symbol;

  const handlePrint = () => {
    document.documentElement.classList.add("printing-market");
    setTimeout(() => window.print(), 30);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${label} 상세`}
          className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="text-[22px] font-bold tabular-nums text-slate-900">{value}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[13px] font-semibold tabular-nums",
                    flat ? "text-slate-400" : up ? "text-red-500" : "text-blue-600"
                  )}
                >
                  {flat ? <Minus className="h-3.5 w-3.5" /> : up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {changeText}
                </span>
              </div>
              {asOfText && <div className="mt-0.5 text-[11px] text-slate-400">{asOfText} 종가 기준 · {rangeText}</div>}
            </div>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="flex-shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 기간 선택 */}
          <div className="flex items-center gap-1 border-b border-slate-100 px-5 py-2.5">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => canSelect && setPeriod(p.key)}
                disabled={!canSelect}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[12px] font-semibold transition-colors disabled:opacity-40",
                  period === p.key
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                )}
              >
                {p.label}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-slate-400">적립식 추천용 장기 추이</span>
          </div>

          {/* 차트 */}
          <div className="px-5 py-4">
            <div className={cn("w-full overflow-x-auto transition-opacity", loading && "opacity-40")}>
              <MarketChart series={series} label={label} width={600} height={200} interactive />
            </div>

            {/* 요약 통계 — 기간 기준. 장기 구간이면 연평균 수익률(CAGR)도 함께 */}
            {hi != null && (
              <div className={cn("mt-3 grid gap-2", cagr != null ? "grid-cols-4" : "grid-cols-3")}>
                <Stat
                  title={`${periodLabel} 수익률`}
                  value={periodReturn == null ? "—" : `${periodReturn > 0 ? "+" : ""}${periodReturn.toFixed(1)}%`}
                  tone={periodReturn == null ? "flat" : periodReturn > 0 ? "up" : periodReturn < 0 ? "down" : "flat"}
                />
                {cagr != null && (
                  <Stat
                    title="연평균 수익률"
                    value={`${cagr > 0 ? "+" : ""}${cagr.toFixed(1)}%`}
                    tone={cagr > 0 ? "up" : cagr < 0 ? "down" : "flat"}
                  />
                )}
                <Stat title="기간 최고" value={num(hi)} />
                <Stat title="기간 최저" value={num(lo)} />
              </div>
            )}

            {/* PB 관점 메모 */}
            <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">상담 포인트</div>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-700">{note}</p>
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
            <span className="text-[10px] text-slate-400">공개 시장 지표 요약 · 투자권유 아님</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:border-slate-400"
              >
                닫기
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-slate-800"
              >
                <Printer className="h-3.5 w-3.5" />
                상담자료 인쇄
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 인쇄 전용 A4 — 선택 기간 그대로 출력. body로 포탈해 대시보드와 분리 */}
      {createPortal(
        <PrintReport
          title={`${label} 시황 브리핑`}
          subtitle={`${asOfText ? `${asOfText} 종가 기준 · ` : ""}${rangeText} 추이`}
          disclaimer={
            "본 자료는 공개된 시장 지표를 요약한 내부 참고용입니다. 지수·환율·금리는 실시간 변동하며, 특정 종목·상품의 투자권유가 아닙니다. 상담 시 최신 시세를 다시 확인해 주세요."
          }
          inputs={[
            { label: "지표", value: label },
            { label: "기준일시", value: asOfText || "-" },
            { label: "데이터 구간", value: rangeText },
          ]}
          results={[
            { label: "종가", value: value, emphasis: true },
            { label: "전일 대비", value: changeText },
            ...(periodReturn != null
              ? [{ label: `${periodLabel} 수익률`, value: `${periodReturn > 0 ? "+" : ""}${periodReturn.toFixed(1)}%` }]
              : []),
            ...(cagr != null
              ? [{ label: "연평균 수익률", value: `${cagr > 0 ? "+" : ""}${cagr.toFixed(1)}%` }]
              : []),
            ...(hi != null ? [{ label: "기간 최고 / 최저", value: `${num(hi)} / ${num(lo)}` }] : []),
          ]}
          chart={<MarketChart series={series} label={label} width={500} height={180} />}
          notes={[note]}
          sourceLine="Yahoo Finance (비공식 시세) · 실서비스 전환 시 정식 시세 소스로 대체"
          brandLabel="iM 세일즈메이트 · 시황 참고자료 · iM뱅크"
        />,
        document.body
      )}
    </>
  );
}

const Stat = ({ title, value, tone }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">
    <div className="text-[10px] font-semibold text-slate-400">{title}</div>
    <div
      className={cn(
        "mt-0.5 text-[13px] font-bold tabular-nums",
        tone === "up" ? "text-red-500" : tone === "down" ? "text-blue-600" : "text-slate-900"
      )}
    >
      {value}
    </div>
  </div>
);
