import { useState } from "react";

const DateNote = ({date}) => <p className="mt-1 text-xs text-slate-500">{date ? `${date} 기준` : "기준일 자료 없음"}</p>;

export function FundFacts({info}) {
  return <div className="mt-5">
    <dl className="grid grid-cols-2 gap-3">{info.facts.map(([label,value])=><div key={label} className="min-w-0 rounded-xl border border-slate-200 p-4"><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-2 break-words text-base font-bold leading-6 text-slate-900">{value || "자료 없음"}</dd></div>)}</dl>
    <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs leading-6 text-slate-500"><span>{info.profileDate ? `펀드개요 ${info.profileDate} 기준` : "펀드개요 자료 없음"}</span>{info.familySize && <span>패밀리 운용규모 {info.familySize}</span>}</div>
  </div>;
}

export function ShareRows({rows,limit=5,graph=true}) {
  const [expanded,setExpanded]=useState(false);
  if(!rows.length) return <p className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-500">표시할 비중 자료가 없습니다.</p>;
  const scale=Math.max(100,...rows.map(r=>Math.abs(r.value)));
  return <div>
    <ul className="space-y-4">{(expanded?rows:rows.slice(0,limit)).map((row,i)=><li key={`${row.name}-${i}`}>
      <div className="mb-2 flex items-start justify-between gap-3 text-sm"><span className="min-w-0 break-words leading-6 text-slate-700">{row.name}</span><span className="shrink-0 font-bold tabular-nums leading-6 text-slate-900">{row.display}%</span></div>
      {graph && <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-600" style={{width:`${Math.abs(row.value)/scale*100}%`}}/></div>}
    </li>)}</ul>
    {rows.length>limit && <button type="button" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)} className="mt-4 min-h-11 w-full rounded-lg bg-slate-50 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100">{expanded?"접기":`${rows.length-limit}개 더 보기`}</button>}
  </div>;
}

export function FundComposition({info,view="all"}) {
  const [graph,setGraph]=useState(true);
  const assets=info.assets.filter(r=>r.value!==0).sort((a,b)=>Math.abs(b.value)-Math.abs(a.value));
  const industries=info.industries.filter(r=>r.value!==0).sort((a,b)=>Math.abs(b.value)-Math.abs(a.value));
  return <div className="space-y-5">
    {view !== "holdings" && <div className="grid gap-4 sm:grid-cols-2">
      <div className="min-w-0 rounded-xl border border-slate-200 p-4 sm:p-5"><h3 className="font-bold text-slate-900">어떤 자산에 투자하나요?</h3><DateNote date={info.compositionDate}/><p className="mb-5 mt-2 text-xs leading-6 text-slate-500">펀드 내 비중</p><ShareRows rows={assets}/>{assets.reduce((sum,r)=>sum+r.value,0)>100.1&&<p className="mt-3 text-xs leading-6 text-slate-500">원문에 표시된 비중입니다. 항목 합계가 100%를 넘을 수 있습니다.</p>}</div>
      <div className="min-w-0 rounded-xl border border-slate-200 p-4 sm:p-5"><h3 className="font-bold text-slate-900">주식은 어느 업종에 있나요?</h3><DateNote date={info.industryDate}/><p className="mb-5 mt-2 text-xs leading-6 text-slate-500">보유 주식 내 비중 · 펀드 전체 비중과 다릅니다.</p><ShareRows rows={industries}/></div>
    </div>
    }
    {view !== "allocation" && <>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="pt-2 font-bold text-slate-900">주요 보유종목</h3><DateNote date={info.holdingDate}/></div><div className="flex rounded-lg bg-slate-100 p-1" aria-label="보유종목 표시 방식">{[[true,"비중 그래프"],[false,"목록"]].map(([value,label])=><button key={label} type="button" aria-pressed={graph===value} onClick={()=>setGraph(value)} className={`min-h-11 rounded-md px-3 text-sm font-semibold ${graph===value?"bg-white text-sky-700 shadow-sm":"text-slate-500"}`}>{label}</button>)}</div></div>
    <div className={`grid gap-4 ${info.bonds.length&&info.stocks.length?"sm:grid-cols-2":""}`}>
      {[{name:"주식",rows:info.stocks,count:info.stockCount,top:info.stockTop10},{name:"채권",rows:info.bonds,count:info.bondCount,top:info.bondTop10}].filter(group=>group.rows.length).map(group=><div key={group.name} className="min-w-0 rounded-xl border border-slate-200 p-4 sm:p-5"><div className="mb-5"><h4 className="text-sm font-bold text-slate-900">{group.name} 보유내역</h4><p className="mt-2 text-xs leading-6 text-slate-500">{group.count&&`총 ${group.count.replace(/\s*\([^)]*\)/g, "")}`}{group.top&&` · 상위 10종목 ${group.top.replace(/\s*\([^)]*\)/g, "")}`}</p><p className="mt-1 text-xs text-slate-500">아래 종목별 수치는 펀드 내 비중입니다.</p></div><ShareRows rows={group.rows} graph={graph}/></div>)}
    </div>
    {!info.stocks.length&&!info.bonds.length&&<p className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-500">표시할 주식·채권 보유종목이 없습니다. 기타자산은 근거 자료의 보유내역에서 확인하세요.</p>}
    </>}
  </div>;
}
