import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Printer } from "lucide-react";

/* 상담 자료 미리보기 모달 — 바로 인쇄창으로 넘기지 않고, 카드 상품설명서처럼
   화면에서 A4 자료를 먼저 보여 준 뒤 「인쇄」로 출력한다.
   열려 있는 동안 html.printing-report를 붙여, 인쇄 시 배경(#root)은 숨고
   body로 포탈된 이 미리보기만 출력된다(index.css @media print). */
export function PrintPreviewModal({ title = "상담 자료 미리보기", onClose, children }) {
  const viewportRef = useRef(null);
  const paperRef = useRef(null);
  const [fit, setFit] = useState(true);
  const [scale, setScale] = useState(1);
  const [paperWidth, setPaperWidth] = useState(794);
  useLayoutEffect(() => {
    const slip = paperRef.current?.querySelector(".print-slip");
    const width = slip ? slip.getBoundingClientRect().width : 794;
    setPaperWidth(width);
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / width)));
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.classList.add("printing-report");
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("printing-report");
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog" aria-modal="true" aria-label={title}
      className="fixed inset-0 z-[60] flex flex-col bg-black/60 print:static print:bg-white"
      onClick={onClose}
    >
      {/* 상단 바 — 인쇄 시 숨김 */}
      <div
        className="preview-toolbar flex flex-shrink-0 flex-wrap items-center justify-between gap-2 px-3 py-2.5 print:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 text-[13px] font-semibold text-white">{title}</div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button type="button" onClick={() => setFit(v => !v)} className="rounded-lg border border-white/40 px-3 py-2 text-sm text-white">{fit ? "원본 크기" : "화면에 맞춤"}</button>
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
        ref={viewportRef}
        className="min-h-0 flex-1 overflow-auto overscroll-contain px-3 pb-6 print:overflow-visible print:p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={paperRef}
          style={{ "--preview-scale": fit ? scale : 1, "--preview-width": `${paperWidth}px` }}
          className="preview-paper mx-auto rounded-sm bg-white shadow-2xl print:mx-0 print:rounded-none print:shadow-none"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
