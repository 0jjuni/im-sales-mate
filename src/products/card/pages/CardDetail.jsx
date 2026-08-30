import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CreditCard, QrCode, FileText, ArrowLeft } from "lucide-react";
import { findCard, typeLabel } from "../data/cards";

/* 카드 이미지 — 파일이 없으면 플레이스홀더로 대체 */
const CardArt = ({ card }) => {
  const [err, setErr] = useState(false);
  if (card.image && !err) {
    return (
      <img
        src={card.image}
        alt={card.name}
        onError={() => setErr(true)}
        className="h-[112px] w-[172px] flex-shrink-0 self-center rounded-xl object-contain sm:self-start"
      />
    );
  }
  return (
    <div className="flex h-[112px] w-[172px] flex-shrink-0 items-center justify-center self-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 sm:self-start">
      <CreditCard className="h-9 w-9" />
    </div>
  );
};

/* 카드 상세 — 대표 혜택·연회비 요약 + 「가입 안내문 만들기」로 바로 연결. */
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
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <CardArt card={card} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-black tracking-tight text-slate-900">{card.name}</h1>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                {card.issuer}
              </span>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">
                {typeLabel(card.type)}
              </span>
            </div>
            {card.maxBenefit && (
              <span className="mt-2 inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[12px] font-bold text-amber-700">
                {card.maxBenefit}
              </span>
            )}

            {card.blurb && (
              <p className="mt-2 text-[16px] font-bold leading-snug text-slate-900">{card.blurb}</p>
            )}

            {card.benefits?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
                {card.benefits.map((b, i) => (
                  <div key={i}>
                    <div className="text-[11px] text-slate-400">{b.label}</div>
                    <div className="text-[15px] font-bold text-slate-900">{b.value}</div>
                  </div>
                ))}
              </div>
            )}

            {card.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {card.tags.map((t) => (
                  <span key={t} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11.5px] text-slate-600">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
          {card.annualFee && (
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">연회비</dt>
              <dd className="mt-0.5 text-[13.5px] text-slate-800">{card.annualFee}</dd>
            </div>
          )}
          {card.spendReq && (
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">전월실적</dt>
              <dd className="mt-0.5 text-[13.5px] text-slate-800">{card.spendReq}</dd>
            </div>
          )}
        </dl>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={() => navigate(`/card/promo?card=${card.id}`)}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-slate-700"
          >
            <QrCode className="h-4 w-4" />
            가입 QR 만들기
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

      <p className="text-[11.5px] leading-relaxed text-slate-500">
        「가입 QR 만들기」를 누르면 eBiz에서 이 카드의 가입 링크를 불러와 QR 전표로 만듭니다. 인쇄해 고객에게 바로 건네실 수 있습니다.
      </p>
    </div>
  );
};
