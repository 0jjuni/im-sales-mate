import { MarketChart } from "../components/MarketChart";
import { bankField, bankSeries, fundSection, introRows } from "./useBankFund";

const Section = ({id,title,children}) => <section id={`product-${id}`} className="scroll-mt-36 border-t border-slate-200 py-7 first:border-0"><h2 className="mb-5 text-lg font-bold text-slate-900">{title}</h2>{children}</section>;
const Pairs = ({rows}) => <dl className="divide-y divide-slate-100">{rows.map((r,i)=><div key={i} className="grid gap-2 py-3 sm:grid-cols-[140px_minmax(0,1fr)]"><dt className="text-sm font-semibold text-slate-700">{r[0]?.text}</dt><dd className="whitespace-pre-line break-words text-sm leading-7 text-slate-600">{r.slice(1).map(c=>c.text || "—").join(" · ")}</dd></div>)}</dl>;
function SourceTables({section}) {
  if (section.status === "unavailable") return <p className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">수집 당시 이 자료가 열리지 않았습니다. 다른 항목의 자료를 확인해 주세요.</p>;
  const tables=section.tables.filter(t=>!/(조회입력|검색조건)/.test(t.title));
  return <div className="space-y-5"><p className="text-xs leading-6 text-slate-500">{section.headings.filter(h=>/기준일|단위|검색기간/.test(h)).join(" / ")}</p>{tables.map((table,i)=><div key={i} className="overflow-x-auto rounded-lg border border-slate-200" tabIndex={0} aria-label={`${section.name} 표 ${i+1}`}><table className="w-full min-w-[540px] text-left text-xs leading-6"><caption className="bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700">{table.title || `${section.name} ${i+1}`}</caption><tbody>{table.rows.map((row,j)=><tr key={j} className="border-t border-slate-100">{row.map((cell,k)=>{const Tag=cell.header?"th":"td";return <Tag key={k} rowSpan={cell.rowSpan} colSpan={cell.colSpan} className="px-3 py-2 align-top">{cell.text || "—"}</Tag>;})}</tr>)}</tbody></table></div>)}</div>;
}

export function BankFundBody({data}) {
  const series=bankSeries(data);
  const performance=fundSection(data,"성과분석");
  const returns=performance?.tables.find(t=>t.title==="기간누적성과")?.rows.filter(r=>["3개월","6개월","1년","3년","5년"].includes(r[0]?.text)) || [];
  const risks=data.bank.tables.flatMap(t=>t.rows).filter(r=>r.length===2 && /위험$/.test(r[0].text));
  const holding=fundSection(data,"보유내역");
  const stocks=holding?.tables.find(t=>t.title==="보유주식 리스트")?.rows.slice(1).filter(r=>r.length>2 && /^\d/.test(r[1].text)) || [];
  const date=data.retrievedAt.slice(0,10);
  return <div>
    <Section id="summary" title="상품 설명">
      <p className="mb-4 text-xs leading-6 text-slate-500">iM뱅크 상품정보 · {date} 수집본</p>
      <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900">예금자보호법 비보호 · 실적배당 상품 · 원금손실 가능</p>
      <Pairs rows={introRows(data).filter(r=>["상품특징","가입대상","가입금액"].includes(r[0]?.text))}/>
      <h3 className="mb-3 mt-6 font-bold text-slate-800">주요 투자위험</h3>
      {risks.length ? <div className="space-y-3">{risks.map((r,i)=><details key={i} className="rounded-lg border border-slate-200 p-4"><summary className="cursor-pointer text-sm font-semibold">{r[0].text}</summary><p className="mt-3 text-sm leading-7 text-slate-600">{r[1].text}</p></details>)}</div> : <p className="text-sm text-slate-500">상품별 투자위험은 투자설명서를 확인하세요.</p>}
    </Section>
    <Section id="performance" title="기준가와 운용 현황">
      <h3 className="text-sm font-semibold text-slate-700">기준가 추이</h3>
      {series.length>1 ? <><p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{series.at(-1).c.toLocaleString("ko-KR",{minimumFractionDigits:2})}<span className="ml-1 text-sm font-normal text-slate-500">원</span></p><p className="my-3 text-xs leading-6 text-slate-500">{series[0].t} ~ {series.at(-1).t} · 수집한 일별 기준가</p><MarketChart series={series} label={`bank-${data.code}`} width={900} height={280} interactive/><p className="mt-2 text-xs leading-6 text-slate-500">분배금 등을 반영한 투자수익률 차트와는 다를 수 있습니다.</p></> : <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">표시할 기준가 이력이 없습니다.</p>}
      <h3 className="mb-4 mt-7 text-sm font-semibold text-slate-700">기간 수익률</h3>
      {returns.length ? <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3">{returns.map((r,i)=><div key={i}><dt className="text-sm text-slate-500">{r[0].text}</dt><dd className="mt-1 text-xl font-bold tabular-nums">{r[1]?.text && r[1].text!=="-" ? `${r[1].text}%` : "—"}</dd></div>)}</dl> : <p className="text-sm text-slate-500">수익률 자료가 없습니다.</p>}
      <p className="mt-3 text-xs leading-6 text-slate-500">{performance?.headings[0]} · 과거 수익률은 미래 수익을 보장하지 않습니다.</p>
      <h3 className="mb-2 mt-7 text-sm font-semibold text-slate-700">주요 보유종목</h3>
      <p className="mb-3 text-xs leading-6 text-slate-500">{holding?.headings[0]} · 펀드 내 비중</p>
      {stocks.length ? <ul className="divide-y divide-slate-100">{stocks.map((r,i)=><li key={i} className="flex items-center justify-between gap-4 py-3 text-sm"><span className="min-w-0 break-words">{r[0].text}</span><span className="shrink-0 font-semibold tabular-nums">{r[1].text}%</span></li>)}</ul> : <p className="text-sm text-slate-500">표시할 주식 보유종목이 없습니다. 채권·기타자산은 아래 보유내역에서 확인하세요.</p>}
    </Section>
    <Section id="cost" title="비용과 매입·환매">
      <Pairs rows={["수수료","총보수"].map(label=>[{text:label},{text:bankField(data,label)||"확인 필요"}])}/>
      <Pairs rows={introRows(data).filter(r=>!['상품특징','가입대상','가입금액','선취판매수수료','총보수'].includes(r[0]?.text))}/>
      <p className="mt-3 text-xs leading-6 text-slate-500">선택한 클래스의 정보입니다. 기타비용과 적용 조건은 해당 클래스의 투자설명서를 확인하세요.</p>
    </Section>
    <Section id="details" title="상세 자료">
      <div className="space-y-3">{data.sections.filter(s=>s.name!=="차트분석").map(section=><details key={section.name} className="min-w-0 rounded-lg border border-slate-200 p-4"><summary className="cursor-pointer text-sm font-semibold text-slate-800">{section.name}{section.status==="unavailable"?" · 자료 없음":""}</summary><div className="mt-4 min-w-0"><SourceTables section={section}/></div></details>)}</div>
      <p className="mt-4 text-xs leading-6 text-slate-500">출처: iM뱅크 및 연결된 펀드 정보 · {date} 수집. 항목별 기준일은 자료에 표시된 날짜를 확인하세요.</p>
    </Section>
  </div>;
}
