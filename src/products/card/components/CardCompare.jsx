import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { findCard } from "../data/cards";
import { CARD_BENEFIT } from "../data/cardBenefits";

const conditionSections = card => (CARD_BENEFIT[card.id]?.sections || []).filter(s => /조건|기준|전월|실적|한도|유의|제외|부가서비스/.test(s.title) || s.items.some(i => /전월|실적|할인한도|할인 한도|적립한도|적립 한도|제외/.test(JSON.stringify(i))));
function SectionContent({section}) {
  return <section className="mt-4"><h4 className="text-sm font-bold text-slate-800">{section.title}</h4><div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-600">{section.items.map((item,i)=> item.k === "table" ? <div key={i} className="overflow-x-auto"><table className="w-full border-collapse text-xs"><thead><tr>{item.head?.map((h,j)=><th key={j} className="border border-slate-200 bg-slate-50 p-2 text-left">{h}</th>)}</tr></thead><tbody>{item.rows?.map((row,j)=><tr key={j}>{row.map((cell,k)=><td key={k} className="border border-slate-200 p-2 align-top">{cell}</td>)}</tr>)}</tbody></table></div> : <p key={i} className={item.k === "h" ? "font-semibold text-slate-800" : ""}>{item.t}</p>)}</div></section>;
}
export function CardConditions({card}) {
  const sections=conditionSections(card);
  return <div className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-base font-bold text-rose-800">혜택 적용 조건 · 실적 · 한도</h3>{sections.length ? sections.map((section,i)=><SectionContent key={i} section={section}/>) : <p className="mt-2 text-sm text-slate-500">등록된 상세 조건이 없습니다. 상품설명서에서 확인하세요.</p>}</div>;
}
export function CardCompare({ids,onClose}) {
  const ref=useRef(null);
  useEffect(()=>{const previous=document.activeElement;const overflow=document.body.style.overflow;document.body.style.overflow="hidden";ref.current?.focus();const key=e=>{if(e.key==="Escape")onClose();if(e.key==="Tab"){const elements=ref.current?.querySelectorAll('button,[href],[tabindex="0"]');if(!elements?.length)return;const first=elements[0],last=elements[elements.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};document.addEventListener("keydown",key);return()=>{document.body.style.overflow=overflow;document.removeEventListener("keydown",key);previous?.focus();};},[]);
  const cards=ids.map(findCard).filter(Boolean);
  return createPortal(<div className="fixed inset-0 z-50 bg-black/50 p-3 sm:p-6" onClick={onClose}><div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label="두 카드 비교" className="mx-auto flex max-h-full max-w-6xl flex-col rounded-xl bg-white shadow-xl" onClick={e=>e.stopPropagation()}><header className="flex items-center justify-between border-b p-4"><h2 className="font-bold">두 카드 비교</h2><button onClick={onClose} className="min-h-11 px-3 text-sm font-semibold">닫기</button></header><div className="overflow-auto p-4"><div className="grid grid-cols-2 gap-3">{cards.map(card=><article key={card.id} className="min-w-0"><h3 className="text-base font-bold text-slate-900">{card.name}</h3><p className="mt-3 text-xs text-slate-500">연회비</p><p className="text-sm font-semibold">{CARD_BENEFIT[card.id]?.fee||card.annualFee||"상품설명서 확인"}</p><p className="mt-4 text-xs text-slate-500">주요 혜택</p><p className="mt-1 text-sm leading-relaxed">{CARD_BENEFIT[card.id]?.summary||card.blurb}</p><div className="mt-4"><CardConditions card={card}/></div></article>)}</div></div></div></div>,document.body);
}
