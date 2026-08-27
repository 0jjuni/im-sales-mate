import { Link } from "react-router-dom";
import { Star, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import { useWealth } from "../wealth/useWealth";
import { PRODUCTS, PRODUCT_BY_ID } from "../data/wealthProducts";
import { pct, retColor } from "../wealth/ProductDetail";
import { cn } from "@shared/lib/format";

/* 홈 투자상품 위젯 — 카운트(허영 지표) 대신 「지금 챙길 고객」과 「제안할 상품」 중심.
   목표 도달 = 수익실현·재투자 상담 기회 / 손실 = 케어 연락. */
const ALERT = {
  target: { badge: "목표 도달", cls: "bg-im-100 text-im-700", action: "수익실현·재투자 제안" },
  loss: { badge: "손실 경고", cls: "bg-rose-100 text-rose-700", action: "손실 케어 연락" },
};

export function WealthCard() {
  const { watchlist, enrollments } = useWealth();
  const alerts = enrollments.filter((e) => e.alert !== "progress");
  const watched = watchlist.map((id) => PRODUCT_BY_ID[id]).filter(Boolean);
  const list = (watched.length ? watched : [...PRODUCTS].sort((a, b) => b.sold - a.sold)).slice(0, 3);

  return (
    <div>
      {/* 지금 챙길 고객 */}
      {alerts.length > 0 ? (
        <div>
          <div className="mb-1.5 text-[11px] font-bold text-slate-500">지금 챙길 고객 {alerts.length}</div>
          <ul className="space-y-1.5">
            {alerts.slice(0, 4).map((e) => (
              <li key={e.id}>
                <Link
                  to="/wealth?tab=customers"
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-slate-50",
                    e.alert === "loss" ? "border-rose-100 bg-rose-50/30" : "border-im-100 bg-im-50/30"
                  )}
                >
                  <span className={cn("flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold", ALERT[e.alert].cls)}>{ALERT[e.alert].badge}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[12px] font-bold tabular-nums text-slate-800">{e.customerNo}</span>
                      <span className={cn("text-[11px] font-bold tabular-nums", retColor(e.currentReturn))}>{pct(e.currentReturn)}</span>
                    </div>
                    <div className="truncate text-[11px] text-slate-500">{e.product?.name}</div>
                  </div>
                  <span className="hidden flex-shrink-0 text-[11px] font-semibold text-slate-400 sm:block">{ALERT[e.alert].action} →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-[12px] text-slate-500">
          <CheckCircle2 className="h-4 w-4 text-im-500" />
          지금 챙길 알림이 없습니다.
        </div>
      )}

      {/* 제안할 상품 */}
      <div className="mt-3">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
          {watched.length ? <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> : <TrendingUp className="h-3 w-3" />}
          {watched.length ? "관심 상품" : "이번 주 인기 상품"}
        </div>
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
          {list.map((p) => (
            <li key={p.id}>
              <Link to={`/wealth/${p.id}`} className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-slate-50">
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-slate-800">{p.name}</span>
                <span className="flex-shrink-0 text-[10px] text-slate-400">1년</span>
                <span className={cn("w-14 flex-shrink-0 text-right text-[12px] font-bold tabular-nums", retColor(p.return1y))}>{pct(p.return1y)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Link to="/wealth" className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-bold text-im-700 hover:underline">
        투자상품 전체 보기
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
