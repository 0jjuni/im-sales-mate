import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Printer } from "lucide-react";

/* 상담 자료 미리보기 모달 — 바로 인쇄창으로 넘기지 않고, 카드 상품설명서처럼
   화면에서 A4 자료를 먼저 보여 준 뒤 「인쇄」로 출력한다.
   열려 있는 동안 html.printing-report를 붙여, 인쇄 시 배경(#root)은 숨고
   body로 포탈된 이 미리보기만 출력된다(index.css @media print). */
export function PrintPreviewModal({ title = "상담 자료 미리보기", onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.classList.add("printing-report");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("printing-report");
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-black/60 print:static print:bg-white"
      onClick={onClose}
    >
      {/* 상단 바 — 인쇄 시 숨김 */}
      <div
        className="flex flex-shrink-0 items-center justify-between gap-3 px-4 py-2.5 print:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 text-[13px] font-semibold text-white">{title}</div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-[13px] font-bold text-slate-900 transition-colors hover:bg-slate-100"
          >
            <Printer className="h-4 w-4" />
            인쇄
          </button>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 미리보기 영역 — A4 폭의 흰 종이. 인쇄 시 그림자·여백 제거 */}
      <div
        className="flex-1 overflow-auto px-3 pb-6 print:overflow-visible print:p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto w-fit max-w-full rounded-sm bg-white shadow-2xl print:mx-0 print:w-auto print:max-w-none print:rounded-none print:shadow-none"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
