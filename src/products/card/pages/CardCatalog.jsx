import { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, FileText, Megaphone, Plus } from "lucide-react";
import { CARDS, CARD_TYPES } from "../data/cards";
import { cn } from "@shared/lib/format";

/* 카드 탐색 — 카드고릴라식 가로 리스트.
   상단 신용/체크 탭으로 거르고, 각 행에 카드 이미지·대표 혜택·연회비/실적.
   가입 문구가 등록된 카드는 「가입 안내문」을 바로 출력, 미등록 카드는 등록 후 출력. */

const CardThumb = ({ card }) => {
  if (card.image) {
    return (
      <img
        src={card.image}
        alt={card.name}
        className="h-[116px] w-[92px] flex-shrink-0 rounded-lg object-contain"
      />
    );
  }
  return (
    <div className="flex h-[116px] w-[92px] flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
      <CreditCard className="h-6 w-6" />
    </div>
  );
};

const CardRow = ({ card }) => {
  const ready = !!card.adCopy; // 가입 문구(링크) 등록 여부
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-[0_10px_30px_-16px_rgba(15,23,42,0.25)] sm:flex-row sm:items-center sm:p-5">
      <Link to={`/card/${card.id}`} className="group flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
        <CardThumb card={card} />
        <div className="min-w-0">
          <h3 className="text-[17px] font-bold text-slate-900 group-hover:text-rose-700">{card.name}</h3>

          {card.maxBenefit && (
            <span className="mt-1.5 inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[12px] font-bold text-amber-700">
              {card.maxBenefit}
            </span>
          )}

          {card.benefits?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-7 gap-y-2">
              {card.benefits.map((b, i) => (
                <div key={i} className="min-w-0">
                  <div className="text-[12px] text-slate-400">{b.label}</div>
                  <div className="text-[16px] font-bold text-slate-800">{b.value}</div>
                </div>
              ))}
            </div>
          )}

          {(card.annualFee || card.spendReq || card.note) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-slate-500">
              {card.annualFee && <span>연회비 {card.annualFee}</span>}
              {card.spendReq && <span>{card.spendReq}</span>}
              {card.note && <span className="text-slate-600">{card.note}</span>}
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-shrink-0 items-center gap-2 sm:w-[168px] sm:flex-col sm:items-stretch">
        <Link
          to={`/card/promo?card=${card.id}`}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-bold transition-colors",
            ready
              ? "bg-slate-900 text-white hover:bg-slate-700"
              : "border border-dashed border-slate-300 text-slate-500 hover:border-rose-400 hover:text-rose-700"
          )}
        >
          {ready ? (
            <>
              <Megaphone className="h-4 w-4" />
              가입 안내문
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              가입 안내문 추가
            </>
          )}
        </Link>

        {card.prospectusUrl && (
          <a
            href={card.prospectusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
          >
            <FileText className="h-4 w-4" />
            상품설명서
          </a>
        )}
      </div>
    </div>
  );
};

export const CardCatalog = () => {
  const [type, setType] = useState("credit");
  const list = CARDS.filter((c) => c.type === type);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">카드 탐색</h1>
        <p className="mt-1 text-sm text-slate-600">
          고객에게 권유할 카드를 고르면, 가입 링크 QR과 심의필 문구가 담긴 안내문을 바로 인쇄할 수 있습니다.
        </p>
      </div>

      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
        {CARD_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={cn(
              "rounded-md px-4 py-1.5 text-[13px] font-bold transition-colors",
              type === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length > 0 ? (
        <div className="space-y-3">
          {list.map((c) => (
            <CardRow key={c.id} card={c} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-10 text-center text-[13px] text-slate-500">
          등록된 {type === "credit" ? "신용카드" : "체크카드"}가 아직 없습니다.
        </div>
      )}
    </div>
  );
};
