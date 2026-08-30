import { Link, useParams, useNavigate } from "react-router-dom";
import { CreditCard, Megaphone, FileText, ArrowLeft } from "lucide-react";
import { findCard } from "../data/cards";
import { cn } from "@shared/lib/format";

/* 카드 상세 — 핵심 혜택·연회비 요약 + 「가입 안내문 만들기」로 바로 연결. */
export const CardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const card = findCard(id);

  if (!card) {
    return (
      <div className="space-y-4">
        <Link to="/card" className="inline-flex items-center gap-1 text-[13px] font-semibold text-rose-600">
          <ArrowLeft className="h-4 w-4" /> 카드 탐색으로
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          카드를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link to="/card" className="inline-flex items-center gap-1 text-[13px] font-semibold text-rose-600 hover:text-rose-700">
        <ArrowLeft className="h-4 w-4" /> 카드 탐색으로
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <CreditCard className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-black tracking-tight text-slate-900">{card.name}</h1>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                {card.brand}
              </span>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">
                {card.category}
              </span>
            </div>
            {card.tagline && <p className="mt-1 text-[13px] text-slate-500">{card.tagline}</p>}
            <p className="mt-2 text-[16px] font-bold text-rose-600">{card.benefit}</p>
            {card.benefitNote && <p className="text-[12px] text-slate-500">{card.benefitNote}</p>}
          </div>
        </div>

        <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
          {card.annualFee && (
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">연회비</dt>
              <dd className="mt-0.5 text-[13.5px] text-slate-800">{card.annualFee}</dd>
            </div>
          )}
          {card.highlights?.length > 0 && (
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">요약</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {card.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-600 ring-1 ring-inset ring-slate-100"
                  >
                    {h}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={() => navigate(`/card/promo?card=${card.id}`)}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-slate-700"
          >
            <Megaphone className="h-4 w-4" />
            가입 안내문 만들기
          </button>
          {card.prospectusUrl && (
            <a
              href={card.prospectusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3.5 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:border-rose-400 hover:text-rose-700"
            >
              <FileText className="h-4 w-4" />
              상품설명서
            </a>
          )}
        </div>
      </div>

      <p className={cn("text-[11.5px] leading-relaxed text-slate-500")}>
        「가입 안내문 만들기」를 누르면 이 카드의 eBiz 가입 링크(QR)와 심의필 광고 문구가 자동으로 채워집니다.
        인쇄해 고객에게 바로 건네거나, 필요하면 문구를 수정할 수 있습니다.
      </p>
    </div>
  );
};
