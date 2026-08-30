import { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, FileText } from "lucide-react";
import { CARDS, CARD_TYPES } from "../data/cards";
import { cn } from "@shared/lib/format";

/* 카드 탐색 — 카드고릴라식 가로 리스트.
   상단 신용/체크 탭으로 거르고, 각 행에 카드 이미지·대표 혜택·연회비/실적·자세히 보기. */

const CardThumb = ({ card }) => {
  if (card.image) {
    return (
      <img
        src={card.image}
        alt={card.name}
        className="h-[68px] w-[104px] flex-shrink-0 rounded-lg object-contain"
      />
    );
  }
  /* 이미지 미등록 시 카드 형태 플레이스홀더 */
  return (
    <div className="flex h-[68px] w-[104px] flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
      <CreditCard className="h-6 w-6" />
    </div>
  );
};

const CardRow = ({ card }) => (
  <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
    <CardThumb card={card} />

    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h3 className="text-[15px] font-bold text-slate-900">{card.name}</h3>
        <span className="text-[12px] text-slate-400">{card.issuer}</span>
      </div>

      {card.maxBenefit && (
        <span className="mt-1.5 inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[11.5px] font-bold text-amber-700">
          {card.maxBenefit}
        </span>
      )}

      {card.benefits?.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1.5">
          {card.benefits.map((b, i) => (
            <div key={i} className="min-w-0">
              <div className="text-[11px] text-slate-400">{b.label}</div>
              <div className="text-[13.5px] font-bold text-slate-800">{b.value}</div>
            </div>
          ))}
        </div>
      )}

      {(card.annualFee || card.spendReq || card.note) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-slate-400">
          {card.annualFee && <span>연회비 {card.annualFee}</span>}
          {card.spendReq && <span>{card.spendReq}</span>}
          {card.note && <span className="text-slate-500">{card.note}</span>}
        </div>
      )}
    </div>

    <div className="flex flex-shrink-0 items-center gap-2 sm:flex-col sm:items-end">
      <Link
        to={`/card/${card.id}`}
        className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-slate-700"
      >
        자세히 보기
      </Link>
      {card.prospectusUrl && (
        <a
          href={card.prospectusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-500 transition-colors hover:text-rose-700"
        >
          <FileText className="h-3.5 w-3.5" />
          상품설명서
        </a>
      )}
    </div>
  </div>
);

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

      {/* 신용/체크 탭 */}
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
