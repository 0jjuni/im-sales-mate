import { useState } from "react";
import { Link } from "react-router-dom";
import { riskName, classSiblings, keyRisks, DEPOSIT_NOTE } from "../data/wealthProducts";
import { genSeries, simulateSaving } from "../data/wealthDetail";
import { etfCustomerPoints, ETF_HOLDINGS } from "../data/wealthEtfLive";
import { MarketChart } from "../components/MarketChart";
import { classLabel } from "./presentation";
import { cn } from "@shared/lib/format";

export const pct = (v) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`);
export const retColor = (v) => (v == null ? "text-slate-400" : v > 0 ? "text-red-500" : v < 0 ? "text-blue-600" : "text-slate-500");
export const won = (m) => `${(m ?? 0).toLocaleString()}만원`;
export const eok = (m) => (m >= 10000 ? `${(m / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}조원` : `${m.toLocaleString()}억원`);
export const TYPE_CLASS = { 펀드: "bg-violet-50 text-violet-700", ETF: "bg-sky-50 text-sky-700", 신탁: "bg-amber-50 text-amber-700" };
export const RISK_CLASS = { rose: "bg-rose-50 text-rose-600", amber: "bg-amber-50 text-amber-700", slate: "bg-slate-100 text-slate-500" };

const Section = ({ id, title, children }) => <section id={id} className="scroll-mt-36 border-t border-slate-200 py-7 first:border-0"><h2 className="mb-5 text-lg font-bold text-slate-900">{title}</h2>{children}</section>;
const Metric = ({ label, value, tone }) => <div className="min-w-0"><dt className="text-sm text-slate-500">{label}</dt><dd className={cn("mt-2 text-xl font-bold tabular-nums", tone || "text-slate-900")}>{value}</dd></div>;

export function ProductDetailBody({ product, quote, live }) {
  const [period, setPeriod] = useState("1y");
  const [monthly, setMonthly] = useState("50");
  const [years, setYears] = useState(5);
  const [assumed, setAssumed] = useState("0");
  const isEtf = product.type === "ETF";
  const siblings = classSiblings(product);
  const periods = [{ key: "6m", label: "6개월", ret: product.return6m }, { key: "1y", label: "1년", ret: product.return1y }, { key: "3y", label: "3년", ret: product.return3y }, { key: "5y", label: "5년", ret: product.return5y }].filter((p) => p.ret != null);
  const selected = periods.find((p) => p.key === period) || periods[0];
  const annual = Number(assumed);
  const valid = assumed.trim() !== "" && Number.isFinite(annual) && annual > -100 && annual <= 100 && monthly !== "";
  const sim = valid ? simulateSaving(monthly, years, annual) : null;
  const holdings = isEtf ? ETF_HOLDINGS[product.id] : null;
  return <div>
    <Section id="product-summary" title="상담 전에 확인할 내용">
      <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold leading-relaxed text-amber-900">{DEPOSIT_NOTE}</p>
      <ul className="mt-5 space-y-4">{keyRisks(product).map(([title, detail]) => <li key={title}><h3 className="text-sm font-bold text-slate-800">{title}</h3><p className="mt-1 text-sm leading-7 text-slate-600">{detail}</p></li>)}</ul>
      <p className="mt-4 text-xs leading-6 text-slate-500">상품 유형에 따른 확인 항목입니다. 상품별 위험과 가입 조건은 투자설명서를 확인하세요.</p>
      {isEtf && <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">{etfCustomerPoints(product).map((point) => <li key={point}>{point}</li>)}</ul>}
    </Section>
    <Section id="product-performance" title="수익률과 투자 대상">
      {isEtf && <div className="mb-6 rounded-lg bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm text-slate-600">현재가</span><span className="text-xs text-slate-500">{live ? "Yahoo · 약 15분 지연" : quote?.price != null ? "모의 시세" : "시세 연결 대기"}</span></div><div className="mt-2 text-2xl font-bold">{quote?.price != null ? `${quote.price.toLocaleString()}원` : "현재가를 불러오지 못했어요"}</div><p className={cn("mt-1 text-sm",retColor(quote?.changePct))}>{pct(quote?.changePct)}</p></div>}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">{[["3개월",product.return3m],["6개월",product.return6m],["1년",product.return1y],["3년",product.return3y],["5년",product.return5y]].filter(([,v])=>v!=null).map(([label,value])=><Metric key={label} label={`${label} 수익률`} value={pct(value)} tone={retColor(value)}/>)}</dl>
      <p className="mt-4 text-xs leading-6 text-slate-500">저장된 카탈로그 수익률입니다. 기준일이 등록되지 않아 최신 값은 상품 공시에서 확인해야 합니다. 과거 수익률은 미래 수익을 보장하지 않습니다.</p>
      {selected && <details className="mt-5 rounded-lg border border-slate-200 p-4"><summary className="cursor-pointer text-sm font-semibold text-slate-700">예시 차트 보기</summary><p className="my-3 text-sm leading-6 text-slate-600">실제 기준가 이력이 아닙니다. 저장된 기간 수익률을 끝점에 적용한 설명용 생성 차트입니다.</p><div className="mb-3 flex flex-wrap gap-2">{periods.map((p)=><button key={p.key} aria-pressed={selected.key===p.key} onClick={()=>setPeriod(p.key)} className={cn("min-h-11 rounded-lg px-4 text-sm font-semibold",selected.key===p.key?"bg-sky-700 text-white":"bg-slate-100 text-slate-600")}>{p.label}</button>)}</div><p className="mb-2 text-sm text-slate-600">시작값 1,000으로 환산한 예시 · 기간 수익률 {pct(selected.ret)}</p><MarketChart series={genSeries(product, selected.key)} label={`${product.name} 예시`} width={900} height={280} interactive /></details>}
      <h3 className="mt-7 text-sm font-bold text-slate-800">투자 대상</h3><p className="mt-2 text-base leading-7 text-slate-700">{product.desc}</p>
      {holdings?.length > 0 ? <><ul className="mt-4 divide-y divide-slate-100">{holdings.map(([name,weight])=><li key={name} className="flex justify-between gap-3 py-3 text-sm"><span>{name}</span><span className="font-semibold tabular-nums">{weight}%</span></li>)}</ul><p className="text-xs leading-6 text-slate-500">참고용 근사 비중입니다. 최신 구성은 운용사 공시를 확인하세요.</p></> : <p className="mt-3 text-sm text-slate-500">편입 종목별 비중은 최신 운용보고서에서 확인하세요.</p>}
    </Section>
    <Section id="product-cost" title="클래스별 비용과 환매">
      <dl className="grid grid-cols-2 gap-5"><Metric label="선택 클래스" value={classLabel(product)}/><Metric label="총보수 / 연" value={product.fee == null ? "확인 필요" : `${product.fee}%`}/></dl>
      <p className="mt-4 text-sm leading-7 text-slate-600">총보수 외에 판매수수료와 기타비용이 발생할 수 있습니다. 비용의 세부 구성과 적용 조건은 해당 클래스의 투자설명서를 확인하세요.</p>
      {siblings.length>1 && <div className="mt-5"><p className="mb-3 text-sm font-semibold text-slate-800">다른 클래스 선택</p><div className="grid gap-3 sm:grid-cols-2">{siblings.map((s)=><Link key={s.id} to={`/wealth/${s.id}`} aria-current={s.id===product.id?"page":undefined} className={cn("rounded-xl border p-4",s.id===product.id?"border-sky-600 bg-sky-50":"border-slate-200 hover:border-sky-400")}><div className="flex justify-between gap-2 text-sm font-bold"><span>{classLabel(s)} · {s.feeClass || "비용 확인"}</span><span>{s.id===product.id?"선택됨":"보기"}</span></div><div className="mt-2 text-sm text-slate-600">총보수 연 {s.fee}%</div></Link>)}</div><p className="mt-3 text-xs leading-6 text-slate-500">클래스를 바꾸면 수익률·보수·고객 등록 대상도 함께 바뀝니다. 보유기간에 따른 총비용은 선취수수료까지 확인한 뒤 비교하세요.</p></div>}
      <h3 className="mt-7 text-sm font-bold text-slate-800">매입·환매 확인</h3><p className="mt-2 text-sm leading-7 text-slate-600">신청 마감시간, 적용 기준가, 환매대금 지급일, 환매수수료를 상품별 투자설명서에서 확인하세요. 현재 카탈로그에는 상품별 일정이 등록되어 있지 않습니다.</p>
    </Section>
    <Section id="product-calculator" title="적립식 계산">
      <p className="mb-5 text-sm leading-7 text-slate-600">가정 수익률을 직접 입력해 보세요. 초기값은 0%이며 상품의 예상 수익률을 뜻하지 않습니다. 손실 가정도 입력할 수 있습니다.</p>
      <div className="grid gap-4 sm:grid-cols-3"><label className="text-sm font-medium text-slate-700">월 납입액 (만원)<input className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-base" inputMode="numeric" value={monthly} onChange={(e)=>setMonthly(e.target.value.replace(/\D/g,"").slice(0,4))}/></label><label className="text-sm font-medium text-slate-700">납입기간<select className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base" value={years} onChange={(e)=>setYears(Number(e.target.value))}>{[3,5,10,20].map(y=><option key={y} value={y}>{y}년</option>)}</select></label><label className="text-sm font-medium text-slate-700">가정 수익률 (연 %)<input className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-base" type="number" step="0.1" min="-99.9" max="100" value={assumed} onChange={(e)=>setAssumed(e.target.value)} aria-invalid={!valid}/></label></div>
      {sim ? <dl aria-live="polite" className="mt-6 grid gap-5 rounded-xl bg-sky-50 p-5 sm:grid-cols-3"><Metric label="납입 원금" value={won(sim.principal)}/><Metric label="가정 평가액" value={won(sim.futureValue)}/><Metric label="가정 손익" value={`${sim.gain>0?"+":""}${won(sim.gain)}`} tone={retColor(sim.gain)}/></dl> : <p role="status" className="mt-4 text-sm text-rose-700">납입액과 연 수익률을 입력하세요. 수익률은 -100% 초과, 100% 이하로 입력할 수 있습니다.</p>}
      <p className="mt-4 text-xs leading-6 text-slate-500">매월 말 납입하고 같은 수익률이 유지된다는 가정입니다. 세금·수수료·보수를 별도로 차감하지 않은 계산으로 실제 결과와 다를 수 있습니다.</p>
    </Section>
  </div>;
}
