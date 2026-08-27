import { Link } from "react-router-dom";
import { Star, Users, Bell, ArrowRight } from "lucide-react";
import { useWealth } from "../wealth/useWealth";
import { PRODUCTS, PRODUCT_BY_ID } from "../data/wealthProducts";
import { pct, retColor } from "../wealth/ProductDetail";
import { cn } from "@shared/lib/format";

/* 홈 대시보드용 투자상품 위젯 — 관심·가입·알림 요약 + 관심/인기 상품 바로가기 */
const ALERT_CLS = { target: "bg-im-100 text-im-700", loss: "bg-rose-100 text-rose-700" };
const ALERT_LABEL = { target: "목표 도달", loss: "손실 경고" };

const Stat = ({ label, value, tone }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">
    <div className="text-[10px] font-semibold text-slate-400">{label}</div>
    <div className={cn("mt-0.5 text-[16px] font-bold tabular-nums", tone === "alert" ? "text-rose-600" : "text-slate-900")}>{value}</div>
  </div>
);

export function WealthCard() {
  const { watchlist, enrollments } = useWealth();
  const alerts = enrollments.filter((e) => e.alert !== "progress");
  const watched = watchlist.map((id) => PRODUCT_BY_ID[id]).filter(Boolean);
  const list = (watched.length ? watched : [...PRODUCTS].sort((a, b) => b.sold - a.sold)).slice(0, 3);
  const listTitle = watched.length ? "관심 상품" : "인기 상품 TOP";

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="관심" value={watchlist.length} />
        <Stat label="가입 고객" value={enrollments.length} />
        <Stat label="알림" value={alerts.length} tone={alerts.length > 0 ? "alert" : "none"} />
      </div>

      {alerts.length > 0 && (
        <div className="mt-3 rounded-lg border border-rose-100 bg-rose-50/40 p-2.5">
          <div className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-rose-700">
            <Bell className="h-3 w-3" />
            확인할 알림 {alerts.length}건
          </div>
          <ul className="space-y-1">
            {alerts.slice(0, 3).map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-[12px]">
                <span className="font-mono font-bold tabular-nums text-slate-700">{e.customerNo}</span>
                <span className="min-w-0 flex-1 truncate text-slate-500">{e.product?.name}</span>
                <span className={cn("flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold", ALERT_CLS[e.alert])}>{ALERT_LABEL[e.alert]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          {watched.length ? <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> : <Users className="h-3 w-3" />}
          {listTitle}
        </div>
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
          {list.map((p) => (
            <li key={p.id}>
              <Link to={`/wealth/${p.id}`} className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-slate-50">
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-slate-800">{p.name}</span>
                <span className={cn("flex-shrink-0 text-[12px] font-bold tabular-nums", retColor(p.return1y))}>{pct(p.return1y)}</span>
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
