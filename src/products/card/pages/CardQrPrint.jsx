import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { QrSvg } from "@utility/components/QrCode";
import { findCard, loadStoredLinks, resolveAdCopy } from "../data/cards";

/* 가입 QR 전표 뷰어 — 새 탭에서 열리는 독립 페이지(앱 네비 없음).
   상품설명서 PDF를 새 탭에서 보고 인쇄하듯, 가입 QR도 이 화면에서 보고 인쇄한다. */

const STAFF = "중산지점 행원 허영준";
const parseUrl = (t) =>
  ((t || "").match(/https?:\/\/[^\s]+/)?.[0] || "").replace(/[)\]>.,、。]+$/, "");

export default function CardQrPrint() {
  const { id } = useParams();
  const card = findCard(id);
  const url = parseUrl(resolveAdCopy(card, loadStoredLinks()));

  const now = new Date();
  const printedAt = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}. ${String(
    now.getDate()
  ).padStart(2, "0")}`;

  useEffect(() => {
    document.title = card ? `${card.name} · 가입 QR` : "가입 QR";
  }, [card]);

  if (!card) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-sm text-slate-500">
        카드를 찾을 수 없습니다.
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-100 p-6 text-center">
        <div className="text-[15px] font-bold text-slate-900">{card.name}</div>
        <p className="max-w-xs text-[13px] leading-relaxed text-slate-500">
          이 카드의 가입 링크가 아직 없습니다. 「가입 QR 발급」에서 eBiz 링크를 불러와 저장하면 여기서 QR 전표를 인쇄할 수 있습니다.
        </p>
        <a
          href={`/card/promo?card=${card.id}`}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-slate-700"
        >
          가입 QR 발급으로
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-100 p-6 print:bg-white print:p-0">
      <div className="w-full max-w-sm">
        {/* 전표 — 인쇄 대상 */}
        <div
          className="mx-auto border border-slate-400 bg-white p-5 text-center"
          style={{ width: "88mm", fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}
        >
          <div className="text-[16px] font-black leading-tight text-slate-900">{card.name}</div>
          <div className="mt-0.5 text-[10px] font-semibold tracking-wide text-slate-500">가입 안내 QR</div>
          <div className="my-3 flex justify-center">
            <QrSvg text={url} size="45mm" logo />
          </div>
          <p className="text-[11px] leading-snug text-slate-700">
            휴대폰 카메라로 QR을 찍으면
            <br />「{card.name}」 가입 화면으로 연결됩니다.
          </p>
          <div className="mt-3 border-t border-slate-300 pt-2 text-[12px] font-bold text-slate-900">{STAFF}</div>
          <div className="mt-0.5 text-[9px] text-slate-400">{printedAt}</div>
        </div>

        {/* 인쇄 버튼 — 화면에만 */}
        <div className="mt-4 flex justify-center print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-slate-700"
          >
            <Printer className="h-4 w-4" />
            인쇄
          </button>
        </div>
      </div>
    </div>
  );
}
