import { useState } from "react";
import { Printer } from "lucide-react";
import { PrintPreviewModal } from "@shared/components/PrintPreviewModal";
import { PRODUCT_BY_ID } from "../data/wealthProducts";
import catalogue from "../../../public/data/wealth-bank/catalogue-map.json";
import { bankField, introField } from "./useBankFund";
import { fundHighlights } from "./fundHighlightData";
import { fundBaseName, classLabel } from "./presentation";
import { riskBrief } from "./counselBrief";

function Sheet({product,data}) {
  const info=data?fundHighlights(data):null;
  const risks=data?.bank.tables.flatMap(t=>t.rows).filter(r=>r.length===2&&/위험$/.test(r[0].text))||[];
  const fields=[["투자 대상",bankField(data,"투자대상")||product.desc],["수수료",bankField(data,"수수료")],["총보수",bankField(data,"총보수")],["가입금액",introField(data,"가입금액")],["매입 기준",introField(data,"매입기준일")],["환매 기준",introField(data,"환매기준일")]].filter(([,value])=>value);
  return <article className="wealth-print-sheet print-report bg-white p-8 text-slate-900" style={{width:794,fontSize:12,lineHeight:1.65}}>
    <p className="text-xs font-semibold text-sky-700">iM 세일즈메이트 · 투자상품 상담자료</p><h1 className="mt-3 text-xl font-bold leading-8">{fundBaseName(product.name)}</h1><p className="mt-1 text-xs text-slate-500">{product.company} · 클래스 {classLabel(product)} · {bankField(data,"위험등급") || `${product.risk}등급`}</p>
    <p className="my-4 rounded-lg bg-amber-50 p-3 font-semibold">예금자보호 대상이 아니며 원금 손실이 발생할 수 있습니다.</p>
    {!data&&<p className="mb-3 text-xs">수집된 상세 자료가 없어 기존 카탈로그 설명만 표시했습니다.</p>}
    <dl>{fields.map(([label,value])=><div key={label} className="grid grid-cols-[100px_1fr] gap-3 border-b border-slate-200 py-2"><dt className="font-semibold">{label}</dt><dd className="whitespace-pre-line">{value}</dd></div>)}</dl>
    <h2 className="mb-2 mt-5 text-sm font-bold">주요 투자위험</h2><ul className="space-y-2">{risks.map((r,i)=><li key={i}><b>{r[0].text}</b> · {riskBrief(r[0].text,r[1].text)}</li>)}</ul>
    {info&&<><div className="mt-5 grid grid-cols-2 gap-6">{[{label:"주요 주식 보유종목",rows:info.stocks},{label:"주요 채권 보유종목",rows:info.bonds}].filter(g=>g.rows.length).map(g=><div key={g.label}><h2 className="mb-2 text-sm font-bold">{g.label}</h2>{g.rows.slice(0,5).map(r=><div key={r.name} className="flex justify-between gap-3 border-b border-slate-100 py-1"><span>{r.name}</span><b className="shrink-0">{r.display}%</b></div>)}</div>)}</div><p className="mt-2 text-xs text-slate-500">보유종목: {info.holdingDate || "자료 없음"} 기준 · 펀드 내 비중</p></>}
    <footer className="mt-5 border-t border-slate-300 pt-3 text-xs leading-5 text-slate-500">출처: iM뱅크 및 연결된 펀드 정보{data?` · ${data.retrievedAt.slice(0,10)} 수집본`:" · 기존 카탈로그"}<br/>상담 참고자료이며 간이투자설명서를 대신하지 않습니다. 실제 가입 전 최신 설명서와 비용·환매 조건을 확인하세요.</footer>
  </article>;
}

export function WealthPrintButton({ids,label="상담자료 인쇄"}) {
  const [sheets,setSheets]=useState(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState(false);
  const products=[...new Set(ids)].map(id=>PRODUCT_BY_ID[id]).filter(Boolean);
  const open=async()=>{setBusy(true);setError(false);try{const loaded=await Promise.all(products.map(async product=>{const code=catalogue.mapping[product.id];if(!code)return {product,data:null};const response=await fetch(`/data/wealth-bank/${code}.json`);if(!response.ok)throw Error('load');const data=await response.json();if(data.code!==code)throw Error('code');return {product,data};}));setSheets(loaded);}catch{setError(true);}finally{setBusy(false);}};
  return <><button type="button" onClick={open} disabled={busy||!products.length} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-sky-700 bg-white px-4 py-2 text-sm font-bold text-sky-700 disabled:opacity-50"><Printer className="h-4 w-4"/>{busy?"자료 준비 중…":label}</button>{error&&<p role="alert" className="mt-2 text-xs text-rose-700">자료를 불러오지 못했습니다. 다시 눌러 주세요.</p>}{sheets&&<PrintPreviewModal title={`상담자료 미리보기 · ${sheets.length}개 상품`} onClose={()=>setSheets(null)}>{sheets.map(sheet=><Sheet key={sheet.product.id} {...sheet}/>)}</PrintPreviewModal>}</>;
}
