import { useRef } from "react";
import { createPortal } from "react-dom";
import { FileText } from "lucide-react";
import { prospectusUrlOf } from "../data/wealthProducts";

export function ProspectusButton({product,className, documentType="간이투자설명서"}) {
  const dialog=useRef(null);
  const open=()=>{const url=documentType === "간이투자설명서" ? prospectusUrlOf(product) : null;if(url)window.open(url,"_blank","noopener,noreferrer");else dialog.current.showModal();};
  return <><button type="button" onClick={open} className={className}><FileText className="h-4 w-4 shrink-0"/>{documentType}</button>{createPortal(<dialog ref={dialog} aria-label={`${documentType} 추가 예정`} className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border-0 bg-white p-6 shadow-2xl backdrop:bg-slate-900/40"><h2 className="text-lg font-bold text-slate-900">{documentType} 추가 예정</h2><p className="mt-3 text-sm leading-7 text-slate-600">이 상품의 {documentType} 자료는 아직 등록되지 않았습니다.</p><button type="button" autoFocus onClick={()=>dialog.current.close()} className="mt-5 min-h-11 w-full rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold text-white">확인</button></dialog>,document.body)}</>;
}

export function FundDocumentButtons({product,className}) {
  return <>{["간이투자설명서", "투자설명서", "자산운용보고서"].map(documentType=><ProspectusButton key={documentType} product={product} documentType={documentType} className={className}/>)}</>;
}
