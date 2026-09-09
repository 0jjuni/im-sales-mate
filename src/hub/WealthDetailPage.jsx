import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, ArrowLeft, FileText } from "lucide-react";
import { HubShell } from "./HubShell";
import { useWealth } from "./wealth/useWealth";
import { useEtfLive } from "./wealth/useEtfLive";
import { PRODUCT_BY_ID, riskName, classSiblings, prospectusUrlOf, KOFIA_DISCLOSURE_URL } from "./data/wealthProducts";
import { BankFundBody } from "./wealth/BankFundBody";
import { useBankFund, bankField } from "./wealth/useBankFund";
import { ProductDetailBody } from "./wealth/ProductDetail";
import { fundBaseName, classLabel, rememberProduct } from "./wealth/presentation";
import { cn } from "@shared/lib/format";

export default function WealthDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = PRODUCT_BY_ID[id];
  const bank = useBankFund(id);
  const { isWatched, toggleWatch } = useWealth();
  const { quotes, live } = useEtfLive(product?.type === "ETF" ? [product] : []);
  useEffect(() => {
    const prev = document.title;
    document.title = product ? `${product.name} · 투자상품` : "투자상품";
    if(product) rememberProduct(product.id);
    return () => { document.title = prev; };
  },[product]);
  if (!product) return <HubShell><p className="py-10">상품을 찾을 수 없습니다.</p><Link to="/wealth?tab=fund">투자상품 목록으로</Link></HubShell>;
  const siblings=classSiblings(product);
  const prospectus=prospectusUrlOf(product);
  const watched=isWatched(product.id);
  const openProspectus=()=>{ if(prospectus) window.open(prospectus,"_blank","noopener,noreferrer"); };
  return <HubShell>
    <Link to={`/wealth?tab=${product.type==="ETF"?"etf":"fund"}`} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft className="h-4 w-4"/>투자상품 목록</Link>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
      <p className="text-sm font-semibold text-sky-700">{product.company} · {product.category}</p>
      <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{product.type === "펀드" ? fundBaseName(product.name) : product.name}</h1>
      {product.type !== "펀드" && <p className="mt-3 max-w-3xl text-base leading-8 text-slate-700">{product.desc}</p>}
      <p className="mt-3 text-xs leading-6 text-slate-500">선택 클래스 · {classLabel(product)}</p>
      <dl className="mt-6 grid grid-cols-2 gap-5 border-t border-slate-100 pt-5 sm:grid-cols-3"><div><dt className="text-sm text-slate-500">위험등급</dt><dd className="mt-2 font-bold text-slate-900">{bankField(bank.data,"위험등급") || `${product.risk}등급 · ${riskName(product.risk)}`}</dd></div><div><dt className="text-sm text-slate-500">총보수 / 연</dt><dd className="mt-2 font-bold text-slate-900">{bankField(bank.data,"총보수") || `${product.fee}%`}</dd></div><div><dt className="text-sm text-slate-500">환매대금 지급일</dt><dd className="mt-2 text-sm font-semibold text-slate-700"><a href="#product-cost" className="text-sky-700 underline underline-offset-4">매입·환매 조건 보기</a></dd></div></dl>
      {product.type==="펀드"&&<label className="mt-6 block max-w-lg text-sm font-semibold text-slate-700">클래스 선택<select value={product.id} onChange={(e)=>navigate(`/wealth/${e.target.value}`)} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base">{siblings.map(s=><option key={s.id} value={s.id}>{classLabel(s)} · {s.feeClass||"기본"}</option>)}</select></label>}
    </div>
    <nav aria-label="상품 상세 구역" className="sticky top-16 z-10 my-5 grid grid-cols-3 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur">{[["summary","상담 요점"],["cost","비용·환매"],["performance","운용 현황"]].map(([key,label])=><a key={key} href={`#product-${key}`} className="flex min-h-11 items-center justify-center rounded-lg px-1 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-800 sm:text-sm">{label}</a>)}</nav>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white px-5 sm:px-7">{product.type === "펀드" ? bank.data ? <BankFundBody key={product.id} data={bank.data}/> : bank.loading ? <p role="status" className="py-8 text-sm text-slate-500">상품정보를 불러오고 있습니다.</p> : <><p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">{bank.error ? "저장된 상품정보를 불러오지 못했습니다. 새로고침해 주세요." : "현재 수집 목록에 없는 상품입니다. 아래는 기존 카탈로그 정보입니다."}</p><ProductDetailBody key={product.id} product={product} quote={quotes[product.id]} live={live}/></> : <ProductDetailBody key={product.id} product={product} quote={quotes[product.id]} live={live}/>}</div>
      <aside aria-label="상품 상담 도구" className="rounded-xl border border-slate-200 bg-white p-4 lg:sticky lg:top-36">
        <h2 className="mb-3 text-sm font-bold text-slate-900">상담 도구</h2>
        <button onClick={openProspectus} disabled={!prospectus} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-sky-700 px-3 py-3 text-sm font-bold text-white hover:bg-sky-800 disabled:bg-slate-100 disabled:text-slate-500"><FileText className="h-4 w-4"/>{prospectus?"간이투자설명서":"설명서 연결 예정"}</button>
        <p className="my-3 text-xs leading-6 text-slate-500">{prospectus?"이 상품의 PDF 설명서를 엽니다.":"사내 상품별 설명서를 연결할 자리입니다. 현재 예시 PDF는 KB스타코스닥150에 포함되어 있습니다."}</p>
        <button onClick={()=>toggleWatch(product.id)} aria-pressed={watched} className="mb-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"><Star className={cn("h-4 w-4",watched&&"fill-amber-400 text-amber-500")}/>{watched?"관심 등록됨":"관심 등록"}</button>
        <button onClick={()=>navigate(`/wealth?tab=customers&enroll=${product.id}`)} className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">가입 고객 등록</button>
        <p className="mt-3 text-xs leading-6 text-slate-500">선택 클래스 {classLabel(product)}로 관리 목록에 등록합니다. 실제 상품 매수는 진행하지 않습니다.</p>
      </aside>
    </div>
  </HubShell>;
}
