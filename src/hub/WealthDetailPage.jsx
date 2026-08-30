import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, ArrowLeft, Plus, SearchX, FileText } from "lucide-react";
import { HubShell } from "./HubShell";
import { useWealth } from "./wealth/useWealth";
import { useEtfLive } from "./wealth/useEtfLive";
import { PRODUCT_BY_ID, SOLD_RANK, prospectusUrlOf, KOFIA_DISCLOSURE_URL } from "./data/wealthProducts";
import { ProductDetailBody, TYPE_CLASS, eok } from "./wealth/ProductDetail";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

export default function WealthDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isWatched, toggleWatch } = useWealth();
  const product = PRODUCT_BY_ID[id];

  useEffect(() => {
    const prev = document.title;
    document.title = product ? `${product.name} · 투자상품` : "투자상품";
    return () => {
      document.title = prev;
    };
  }, [product]);

  /* ETF면 실시간 시세 폴링(훅은 항상 호출 — 조건은 인자로) */
  const { quotes, live } = useEtfLive(product && product.type === "ETF" ? [product] : []);

  if (!product) {
    return (
      <HubShell>
        <div className={cn(CARD, "flex flex-col items-center gap-2 px-5 py-16 text-center")}>
          <SearchX className="h-7 w-7 text-slate-300" />
          <p className="text-[13px] font-semibold text-slate-600">상품을 찾을 수 없습니다.</p>
          <Link to="/wealth" className="mt-1 text-[12px] font-bold text-im-700 hover:underline">
            투자상품 목록으로
          </Link>
        </div>
      </HubShell>
    );
  }

  const watched = isWatched(product.id);
  const rank = SOLD_RANK[product.id];

  /* 간이투자설명서 — 상품별 실제 PDF를 새 탭으로 연다. 없으면 협회 전자공시로 안내 */
  const prospectus = prospectusUrlOf(product);
  const openProspectus = () => window.open(prospectus || KOFIA_DISCLOSURE_URL, "_blank", "noopener,noreferrer");

  return (
    <HubShell>
      <Link to="/wealth" className="mb-3 inline-flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-3.5 w-3.5" />
        투자상품 목록
      </Link>

      <div className={cn(CARD, "overflow-hidden")}>
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", TYPE_CLASS[product.type])}>{product.type}</span>
              <span className="text-[11px] text-slate-400">{product.category}</span>
              <span className="rounded bg-im-50 px-1.5 py-0.5 text-[10px] font-bold text-im-700">당행 판매 {rank}위</span>
            </div>
            <h1 className="mt-1 text-[18px] font-bold tracking-tight text-slate-900">{product.name}</h1>
            <div className="mt-0.5 text-[11px] text-slate-400">
              {[
                product.company || null,
                product.assetType
                  ? `${product.assetType}${product.feeClass ? ` · 수수료${product.feeClass}` : ""}`
                  : null,
                product.nav != null
                  ? `기준가 ${product.nav.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${
                      product.navChg != null ? ` (${product.navChg > 0 ? "+" : ""}${product.navChg})` : ""
                    }`
                  : null,
                product.since ? `설정 ${product.since}` : null,
                product.aum != null ? `순자산 ${eok(product.aum)}` : null,
                `총보수 연 ${product.fee}%`,
                `누적 판매 ${product.sold.toLocaleString()}건`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          <button
            onClick={() => toggleWatch(product.id)}
            aria-label="관심"
            className={cn("flex-shrink-0 rounded-md p-2", watched ? "text-amber-400 hover:bg-amber-50" : "text-slate-300 hover:bg-slate-100")}
          >
            <Star className={cn("h-5 w-5", watched && "fill-amber-400")} />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-5 py-5">
          <ProductDetailBody product={product} quote={quotes[product.id]} live={live} />
        </div>

        {/* 액션 */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
          <button
            onClick={openProspectus}
            title={prospectus ? "간이투자설명서 PDF 열기" : "협회 전자공시(dis.kofia.or.kr)에서 조회"}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50"
          >
            <FileText className="h-4 w-4" />
            간이투자설명서{prospectus ? "" : " 조회"}
          </button>
          <button
            onClick={() => navigate(`/wealth?tab=customers&enroll=${product.id}`)}
            className="inline-flex items-center gap-1 rounded-md bg-im-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-im-700"
          >
            <Plus className="h-4 w-4" />
            고객 가입
          </button>
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
        {prospectus
          ? "「간이투자설명서」 버튼은 해당 상품의 실제 간이투자설명서 PDF를 엽니다. 차트·지표는 데모 생성값이며, 정확한 내용은 간이투자설명서·집합투자규약을 확인하세요."
          : "이 상품의 간이투자설명서는 데모에 포함돼 있지 않아 「조회」 시 협회 전자공시(dis.kofia.or.kr)로 이동합니다. 실서비스에서는 사내 시스템에서 상품별 PDF를 바로 엽니다."}
      </p>
    </HubShell>
  );
}
