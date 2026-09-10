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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 sm:p-6 print:static print:block print:bg-white print:p-0"
      onClick={onClose}
    >
      {/* 카드 상품설명서 뷰어와 동일한 룩 — 가운데 흰 패널 + 상단 툴바 + 회색 배경 위 전표 */}
      <div
        className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 툴바 — 인쇄 시 숨김 */}
        <div className="preview-toolbar flex flex-shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5 print:hidden">
          <div className="min-w-0">
            <div className="truncate text-[14px] font-bold text-slate-900">{title}</div>
            <div className="text-[11px] text-slate-500">상담 자료</div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <button type="button" onClick={() => setFit(v => !v)} className="rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-semibold text-slate-600 hover:border-slate-400">{fit ? "원본 크기" : "화면에 맞춤"}</button>
            <button
              type="button"
              onClick={() => window.print()}
              title="인쇄 또는 '대상: PDF로 저장'"
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-slate-800"
            >
              <Printer className="h-3.5 w-3.5" />
              인쇄 · PDF 저장
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 미리보기 영역 — 회색 배경 위 전표. 인쇄 시 배경·여백·그림자 제거 */}
        <div
          ref={viewportRef}
          className="min-h-0 flex-1 overflow-auto overscroll-contain bg-slate-100 p-4 print:overflow-visible print:bg-white print:p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={paperRef}
            style={{ "--preview-scale": fit ? scale : 1, "--preview-width": `${paperWidth}px` }}
            className="preview-paper mx-auto rounded-sm bg-white shadow-lg print:mx-0 print:rounded-none print:shadow-none"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
