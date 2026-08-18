import { useEffect } from "react";
import { X } from "lucide-react";
import { ARTICLES } from "../data/articles";
import { cn } from "@shared/lib/format";

export const ArticleModal = ({ articleNo, onClose }) => {
  /* 열려 있을 때만 Escape로 닫기 (훅은 조기 return보다 앞에) */
  useEffect(() => {
    if (!articleNo) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [articleNo, onClose]);

  if (!articleNo) return null;
  const article = ARTICLES[articleNo] || {
    title: "외부 법령 또는 내부 규정",
    section: "약관 외 출처",
  };
  const isExternal =
    articleNo.includes("중협법") ||
    articleNo.includes("조특법") ||
    articleNo.includes("운용요강") ||
    articleNo.includes("자산운용") ||
    articleNo.includes("리스크관리") ||
    articleNo.includes("IPS") ||
    articleNo.includes("행정정보") ||
    articleNo.includes("가입(희망)장려금");

  const hasContent =
    article.summary || (article.keyPoints && article.keyPoints.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${articleNo} ${article.title}`}
        className="bg-white max-w-lg w-full max-h-[85vh] flex flex-col rounded-xl shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-4 border-b border-slate-200 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-500">{article.section}</div>
            <h3 className="text-lg font-bold text-slate-900">
              {articleNo} {article.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-sm flex-shrink-0 ml-2"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {hasContent ? (
            <>
              {article.summary && (
                <div
                  className={cn(
                    "border rounded-sm p-3",
                    isExternal
                      ? "bg-blue-50/40 border-blue-200"
                      : "bg-amber-50/40 border-amber-200"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base leading-none">📌</span>
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wider font-bold",
                        isExternal ? "text-blue-900" : "text-amber-900"
                      )}
                    >
                      한 줄 요약
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              )}

              {article.keyPoints && article.keyPoints.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-base leading-none">📋</span>
                    <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-700">
                      핵심 내용
                    </h4>
                  </div>
                  <ul className="space-y-1.5">
                    {article.keyPoints.map((point, i) => (
                      <li
                        key={i}
                        className="text-sm text-slate-800 leading-relaxed flex gap-2"
                      >
                        <span className="text-amber-600 mt-1 text-[10px] flex-shrink-0">
                          ●
                        </span>
                        <span className="flex-1">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div
              className={cn(
                "border rounded-sm p-4 text-sm text-slate-700 leading-relaxed",
                isExternal
                  ? "bg-blue-50/40 border-blue-200"
                  : "bg-amber-50/40 border-amber-200"
              )}
            >
              본 화면은 직원 안내용 요약입니다.{" "}
              {isExternal
                ? "정확한 조항은 해당 법령·시행령·내부 규정 원문을 직접 참조하시기 바랍니다."
                : `정확한 조항 원문은 첨부된 약관 책자(2026. 7. 1 시행) ${articleNo} ${article.title}를 직접 참조하시기 바랍니다.`}
            </div>
          )}

          <div className="text-[11px] text-slate-500 leading-relaxed space-y-1 pt-3 border-t border-slate-100">
            <p>
              ⚠ 본 화면은 직원 안내용 요약입니다. 정확한 조항 원문은 약관
              책자(2026.7.1 시행) 또는 해당 법령·시행령·내부 규정을 직접 참조해
              주세요.
            </p>
            <p>📞 중소기업중앙회 노란우산공제 1666-9988</p>
          </div>
        </div>
      </div>
    </div>
  );
};
