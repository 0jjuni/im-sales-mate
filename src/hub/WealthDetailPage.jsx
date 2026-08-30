import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, ArrowLeft, Plus, SearchX, Printer } from "lucide-react";
import { HubShell } from "./HubShell";
import { useWealth } from "./wealth/useWealth";
import { useEtfLive } from "./wealth/useEtfLive";
import { PRODUCT_BY_ID, SOLD_RANK, riskName, tradingRules, classSiblings, keyRisks, DEPOSIT_NOTE } from "./data/wealthProducts";
import { holdingsFor } from "./data/wealthDetail";
import { ETF_HOLDINGS } from "./data/wealthEtfLive";
import { ProductDetailBody, TYPE_CLASS, eok } from "./wealth/ProductDetail";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

/* ── 간이투자설명서(요약) 인쇄 양식 — 화면 숨김, window.print() 시에만 노출 ── */
const pctP = (v) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`);
const PSection = ({ title, children }) => (
  <section className="mb-2.5 break-inside-avoid">
    <h2 className="mb-1 border-b border-slate-300 pb-0.5 text-[10px] font-black uppercase tracking-wider text-slate-700">{title}</h2>
    {children}
  </section>
);
const PKV = ({ rows }) => (
  <table className="w-full text-[10.5px]">
    <tbody>
      {rows.map(([k, v]) => (
        <tr key={k} className="border-b border-slate-100 last:border-b-0">
          <td className="w-1/3 py-0.5 pr-2 align-top text-slate-600">{k}</td>
          <td className="py-0.5 font-semibold text-slate-900">{v}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

function FundSummaryPrint({ product }) {
  const isEtf = product.type === "ETF";
  const rules = tradingRules(product);
  const risks = keyRisks(product);
  const sib = classSiblings(product);
  const holdings = (isEtf && ETF_HOLDINGS[product.id]) || holdingsFor(product);
  const now = new Date();
  const dateStr = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}. ${String(now.getDate()).padStart(2, "0")}`;
  const perf = isEtf
    ? [["1년", product.return1y], ["3년", product.return3y], ["5년", product.return5y]]
    : [["3개월", product.return3m], ["6개월", product.return6m], ["12개월", product.return1y]];

  return (
    <div className="hidden bg-white text-slate-900 print:block" style={{ fontFamily: "'Noto Sans KR', system-ui, sans-serif" }} aria-hidden="true">
      <div className="mx-auto max-w-3xl px-3 py-3 leading-snug">
        <div className="mb-3 border-b-2 border-slate-900 pb-2">
          <div className="flex items-baseline justify-between">
            <div className="text-[9px] font-bold tracking-widest text-slate-500">간이투자설명서 (요약) · iM뱅크</div>
            <div className="text-[9px] text-slate-500">작성기준일 {dateStr}</div>
          </div>
          <h1 className="mt-1 text-[16px] font-black leading-tight">{product.name}</h1>
          <div className="mt-0.5 text-[10.5px] text-slate-700">
            {[product.company, product.assetType || product.type, `위험등급 ${product.risk}등급 ${riskName(product.risk)}`].filter(Boolean).join(" · ")}
          </div>
        </div>

        <div className="mb-3 border border-amber-600 bg-amber-50 p-2 text-[10.5px] font-semibold text-amber-900">
          ⚠ {DEPOSIT_NOTE}. 과거 수익률은 미래 수익을 보장하지 않으며, 자세한 내용은 (간이)투자설명서·집합투자규약을 확인하세요.
        </div>

        <PSection title="상품 개요">
          <PKV rows={[
            ["상품유형", `${product.type}${product.assetType ? ` (${product.assetType})` : ""}`],
            ["투자대상/분류", product.category],
            ...(product.nav != null ? [["기준가", product.nav.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })]] : []),
            ["총보수(연)", `${product.fee}%`],
            ["당행 판매순위", `${SOLD_RANK[product.id]}위`],
          ]} />
        </PSection>

        <PSection title="투자실적 (수익률)">
          <PKV rows={perf.map(([k, v]) => [k, pctP(v)])} />
        </PSection>

        {holdings.length > 0 && (
          <PSection title={`${isEtf ? "편입 종목" : "주요 구성"} (상위 ${holdings.length})`}>
            <PKV rows={holdings.map(([n, w]) => [n, `${w}%`])} />
          </PSection>
        )}

        <PSection title="매입 · 환매">
          <PKV rows={[["매입", rules.buy], ["환매", rules.sell], ["대금 지급", rules.payout], ["환매수수료", rules.fee]]} />
        </PSection>

        {sib.length > 1 && (
          <PSection title="클래스 비교">
            <PKV rows={sib.map((s) => [s.feeClass === "선취" ? "선취(A)" : "미징구(C)", `총보수 연 ${s.fee}%`])} />
          </PSection>
        )}

        <PSection title="주요 투자위험">
          <ul className="space-y-0.5 text-[10.5px] text-slate-800">
            {risks.map(([t, d]) => (
              <li key={t} className="flex gap-1.5">
                <span className="flex-shrink-0 text-slate-500">·</span>
                <span><b>{t}</b> — {d}</span>
              </li>
            ))}
          </ul>
        </PSection>

        <div className="mt-2 border-t-2 border-slate-900 pt-1.5 text-[9px] leading-snug text-slate-600">
          <p>본 자료는 iM뱅크 영업점 상담용 요약이며, 투자 판단 전 반드시 정식 (간이)투자설명서와 집합투자규약을 확인하세요. 수치는 데모 추정치를 포함합니다.</p>
          <p className="mt-1">상담 점포 · 담당자: __________________</p>
        </div>
      </div>
    </div>
  );
}

export default function WealthDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isWatched, toggleWatch } = useWealth();
  const product = PRODUCT_BY_ID[id];

  useEffect(() => {
    const prev = document.title;
    document.title = product ? `${product.name} · 투자상품` : "투자상품";
    return () => {
      document.title = prev;
    };
  }, [product]);

  /* ETF면 실시간 시세 폴링(훅은 항상 호출 — 조건은 인자로) */
  const { quotes, live } = useEtfLive(product && product.type === "ETF" ? [product] : []);

  if (!product) {
    return (
      <HubShell>
        <div className={cn(CARD, "flex flex-col items-center gap-2 px-5 py-16 text-center")}>
          <SearchX className="h-7 w-7 text-slate-300" />
          <p className="text-[13px] font-semibold text-slate-600">상품을 찾을 수 없습니다.</p>
          <Link to="/wealth" className="mt-1 text-[12px] font-bold text-im-700 hover:underline">
            투자상품 목록으로
          </Link>
        </div>
      </HubShell>
    );
  }

  const watched = isWatched(product.id);
  const rank = SOLD_RANK[product.id];

  /* 간이투자설명서 인쇄 — 인쇄 동안 #root 숨기고 포탈된 양식만 출력(html.printing-market) */
  const printSummary = () => {
    document.documentElement.classList.add("printing-market");
    const done = () => {
      document.documentElement.classList.remove("printing-market");
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    setTimeout(() => window.print(), 30);
  };

  return (
    <HubShell>
      <Link to="/wealth" className="mb-3 inline-flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-3.5 w-3.5" />
        투자상품 목록
      </Link>

      <div className={cn(CARD, "overflow-hidden")}>
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", TYPE_CLASS[product.type])}>{product.type}</span>
              <span className="text-[11px] text-slate-400">{product.category}</span>
              <span className="rounded bg-im-50 px-1.5 py-0.5 text-[10px] font-bold text-im-700">당행 판매 {rank}위</span>
            </div>
            <h1 className="mt-1 text-[18px] font-bold tracking-tight text-slate-900">{product.name}</h1>
            <div className="mt-0.5 text-[11px] text-slate-400">
              {[
                product.company || null,
                product.assetType
                  ? `${product.assetType}${product.feeClass ? ` · 수수료${product.feeClass}` : ""}`
                  : null,
                product.nav != null
                  ? `기준가 ${product.nav.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${
                      product.navChg != null ? ` (${product.navChg > 0 ? "+" : ""}${product.navChg})` : ""
                    }`
                  : null,
                product.since ? `설정 ${product.since}` : null,
                product.aum != null ? `순자산 ${eok(product.aum)}` : null,
                `총보수 연 ${product.fee}%`,
                `누적 판매 ${product.sold.toLocaleString()}건`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          <button
            onClick={() => toggleWatch(product.id)}
            aria-label="관심"
            className={cn("flex-shrink-0 rounded-md p-2", watched ? "text-amber-400 hover:bg-amber-50" : "text-slate-300 hover:bg-slate-100")}
          >
            <Star className={cn("h-5 w-5", watched && "fill-amber-400")} />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-5 py-5">
          <ProductDetailBody product={product} quote={quotes[product.id]} live={live} />
        </div>

        {/* 액션 */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
          <button
            onClick={printSummary}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            간이투자설명서 인쇄
          </button>
          <button
            onClick={() => navigate(`/wealth?tab=customers&enroll=${product.id}`)}
            className="inline-flex items-center gap-1 rounded-md bg-im-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-im-700"
          >
            <Plus className="h-4 w-4" />
            고객 가입
          </button>
        </div>
      </div>

      {createPortal(<FundSummaryPrint product={product} />, document.body)}

      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
        차트·구성종목·지표는 상품 특성에서 생성한 데모입니다. 실제 수익률·보수·조건은 (간이)투자설명서·집합투자규약을 확인하세요. 과거 수익률은 미래를 보장하지 않습니다.
      </p>
    </HubShell>
  );
}
