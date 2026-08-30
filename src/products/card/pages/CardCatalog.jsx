import { Link } from "react-router-dom";
import { CreditCard, ArrowRight } from "lucide-react";
import { CARDS } from "../data/cards";
import { CARD_INTERACTIVE } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

/* 카드 탐색 — 발급 가능한 카드 목록. 클릭하면 상세로 이동해 가입 안내문을 만든다. */
export const CardCatalog = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">카드 탐색</h1>
        <p className="mt-1 text-sm text-slate-600">
          고객에게 권유할 카드를 고르면, 가입 링크 QR과 심의필 문구가 담긴 안내문을 바로 인쇄할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <Link
            key={c.id}
            to={`/card/${c.id}`}
            className={cn(CARD_INTERACTIVE, "flex flex-col p-5 hover:border-rose-300")}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-transform group-hover:scale-105">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                {c.brand}
              </span>
            </div>
            <h3 className="mt-3.5 text-[15px] font-bold text-slate-900">{c.name}</h3>
            <p className="mt-0.5 text-[12px] font-semibold text-rose-600">{c.benefit}</p>
            {c.benefitNote && <p className="text-[11px] text-slate-500">{c.benefitNote}</p>}

            {c.highlights?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {c.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[10.5px] text-slate-600 ring-1 ring-inset ring-slate-100"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center gap-1 text-[13px] font-semibold text-rose-600">
              상세 · 안내문 만들기
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
