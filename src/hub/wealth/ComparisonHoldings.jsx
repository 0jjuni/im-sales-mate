import { useBankFund } from "./useBankFund";
import { fundHighlights } from "./fundHighlightData";
import { ShareRows } from "./FundHighlights.jsx";

export function ComparisonHoldings({product}) {
  const bank=useBankFund(product.id);
  if(bank.loading)return <p className="text-xs text-slate-500">보유종목을 불러오고 있습니다.</p>;
  if(!bank.data)return <p className="text-xs text-slate-500">수집된 보유종목 자료가 없습니다.</p>;
  const info=fundHighlights(bank.data);
  return <div className="space-y-4"><p className="text-xs leading-6 text-slate-500">{info.holdingDate ? `${info.holdingDate} 기준 · 펀드 내 비중` : "기준일 자료 없음"}</p>{[{label:"주식",rows:info.stocks},{label:"채권",rows:info.bonds}].filter(g=>g.rows.length).map(g=><div key={g.label}><h3 className="mb-3 text-xs font-bold text-slate-700">{g.label}</h3><ShareRows rows={g.rows} limit={5}/></div>)}{!info.stocks.length&&!info.bonds.length&&<p className="text-xs text-slate-500">표시할 주식·채권 보유종목이 없습니다.</p>}</div>;
}
