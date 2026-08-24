import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Printer, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MarketChart } from "./MarketChart";
import { PrintReport } from "@shared/components/PrintReport";
import { cn } from "@shared/lib/format";

/* 마켓 지표 상세 — 셀 클릭 시 열린다. 큰 추이 차트 + 요약 통계 + PB 관점 메모.
   「인쇄」는 고객 상담자료(A4)로 출력. 대시보드 전체가 함께 인쇄되지 않도록
   PrintReport를 body로 포탈하고, 인쇄 동안 html.printing-market으로 #root를 숨긴다
   (규칙: src/index.css @media print). */

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
  // 주가지수(KOSPI·KOSDAQ·S&P 500·나스닥)
  if (dir === "up") return "증시가 상승했습니다. 위험 선호가 개선되는 국면에서 ISA·펀드 등 투자형 상담 여지가 있으나, 추격매수 권유로 읽히지 않게 주의하세요.";
  if (dir === "down") return "증시가 조정받았습니다. 변동성에 민감한 고객에게는 예적금·ISA 등 안정형 대안을 함께 제시하세요.";
  return "증시가 보합권입니다. 지표 방향보다 고객 성향에 맞춘 자산 배분 관점으로 접근하세요.";
};

export function MarketDetailModal({ market, asOf, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    /* 인쇄가 끝나면(또는 취소) 대시보드를 다시 보이게 한다 */
    const cleanup = () => document.documentElement.classList.remove("printing-market");
    window.addEventListener("afterprint", cleanup);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("afterprint", cleanup);
      cleanup();
    };
  }, [onClose]);

  if (!market) return null;

  const { label, value, change, series } = market;
  const flat = change === 0;
  const up = change > 0;
  const vals = Array.isArray(series) ? series.map((d) => d.c) : [];
  const hi = vals.length ? Math.max(...vals) : null;
  const lo = vals.length ? Math.min(...vals) : null;
  const asOfText = fmtAsOf(asOf);
  const note = pbNote(label, change);
  const changeText = `${up ? "+" : ""}${change.toFixed(2)}%`;

  const handlePrint = () => {
    document.documentElement.classList.add("printing-market");
    /* 렌더 반영 후 인쇄 (일부 브라우저에서 클래스 적용 타이밍 보정) */
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
          className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
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
              {asOfText && <div className="mt-0.5 text-[11px] text-slate-400">{asOfText} 종가 기준 · 최근 10거래일</div>}
            </div>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="flex-shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 차트 */}
          <div className="px-5 py-4">
            <div className="w-full overflow-x-auto">
              <MarketChart series={series} label={label} width={480} height={160} />
            </div>

            {/* 요약 통계 */}
            {hi != null && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Stat title="전일 대비" value={changeText} tone={flat ? "flat" : up ? "up" : "down"} />
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

      {/* 인쇄 전용 A4 상담자료 — body로 포탈해 대시보드(#root)와 분리 */}
      {createPortal(
        <PrintReport
          title={`${label} 시황 브리핑`}
          subtitle={`${asOfText ? `${asOfText} 종가 기준 · ` : ""}최근 10거래일 추이`}
          disclaimer={
            "본 자료는 공개된 시장 지표를 요약한 내부 참고용입니다. 지수·환율·금리는 실시간 변동하며, 특정 종목·상품의 투자권유가 아닙니다. 상담 시 최신 시세를 다시 확인해 주세요."
          }
          inputs={[
            { label: "지표", value: label },
            { label: "기준일시", value: asOfText || "-" },
            { label: "데이터 구간", value: "최근 10거래일 (일별 종가)" },
          ]}
          results={[
            { label: "종가", value: value, emphasis: true },
            { label: "전일 대비", value: changeText },
            ...(hi != null ? [{ label: "기간 최고 / 최저", value: `${num(hi)} / ${num(lo)}` }] : []),
          ]}
          chart={<MarketChart series={series} label={label} width={500} height={170} />}
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
