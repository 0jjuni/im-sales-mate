import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X, Printer, ExternalLink, DownloadCloud } from "lucide-react";
import { QrSvg } from "@utility/components/QrCode";
import { loadStoredLinks, resolveAdCopy } from "../data/cards";

/* 카드 모달 — 상품설명서(PDF 뷰어)·가입 QR(전표)을 새 탭이 아니라 화면 위에 띄운다. */

const STAFF = "중산지점 행원 허영준";
const parseUrl = (t) =>
  ((t || "").match(/https?:\/\/[^\s]+/)?.[0] || "").replace(/[)\]>.,、。]+$/, "");

const useEscClose = (onClose) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
};

/* 상품설명서 — PDF를 iframe으로 화면에 보여준다(다운로드 아님). */
export function PdfViewerModal({ card, onClose }) {
  useEscClose(onClose);
  if (!card?.prospectusUrl) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/60 p-3 sm:p-6 print:hidden"
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
          <div className="min-w-0">
            <div className="truncate text-[14px] font-bold text-slate-900">{card.name}</div>
            <div className="text-[11px] text-slate-500">상품설명서</div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <a
              href={card.prospectusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-semibold text-slate-600 hover:border-slate-400"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              새 탭
            </a>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <iframe src={card.prospectusUrl} title={`${card.name} 상품설명서`} className="h-full w-full flex-1" />
      </div>
    </div>,
    document.body
  );
}

const Slip = ({ card, url }) => {
  const now = new Date();
  const printedAt = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}. ${String(
    now.getDate()
  ).padStart(2, "0")}`;
  return (
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
  );
};

/* 가입 QR — 전표를 화면 위에 띄우고, 인쇄 버튼으로 출력(전표만 인쇄). */
export function QrSlipModal({ card, onClose }) {
  const navigate = useNavigate();
  useEscClose(onClose);
  useEffect(() => {
    const cleanup = () => document.documentElement.classList.remove("printing-promo");
    window.addEventListener("afterprint", cleanup);
    return () => {
      window.removeEventListener("afterprint", cleanup);
      cleanup();
    };
  }, []);

  if (!card) return null;
  const url = parseUrl(resolveAdCopy(card, loadStoredLinks()));

  const handlePrint = () => {
    document.documentElement.classList.add("printing-promo");
    setTimeout(() => window.print(), 30);
  };

  return createPortal(
    <>
      {/* 화면 오버레이 — 인쇄 시에는 숨김 */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:hidden"
        onClick={onClose}
      >
        <div className="w-full max-w-sm rounded-xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
          {url ? (
            <>
              <Slip card={card} url={url} />
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-slate-700"
                >
                  <Printer className="h-4 w-4" />
                  인쇄
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:border-slate-400"
                >
                  닫기
                </button>
              </div>
            </>
          ) : (
            <div className="py-6 text-center">
              <div className="text-[15px] font-bold text-slate-900">{card.name}</div>
              <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-slate-500">
                이 카드의 가입 링크가 아직 없습니다. eBiz에서 링크를 불러와 저장하면 QR 전표를 인쇄할 수 있습니다.
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <button
                  onClick={() => navigate(`/card/promo?card=${card.id}`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-slate-700"
                >
                  <DownloadCloud className="h-4 w-4" />
                  불러오기
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-600 hover:border-slate-400"
                >
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 인쇄 전용 전표 — 화면엔 숨김. printing-promo가 #root를 숨기므로 이것만 출력된다. */}
      {url && (
        <div className="hidden print:block" aria-hidden="true">
          <Slip card={card} url={url} />
        </div>
      )}
    </>,
    document.body
  );
}
