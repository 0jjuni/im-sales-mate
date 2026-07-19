import { useState } from "react";
import { CheckSquare, ChevronRight } from "lucide-react";
import { REASON_DOCUMENTS } from "../data/guides";
import { cn } from "@shared/lib/format";

/* 시뮬레이터 결과 페이지 등에서 사용. 단일 사유면 바로 표시,
   복수 사유면 사용자가 선택. "전체 체크리스트로 이동" 버튼 포함. */
export const ChecklistPreview = ({ reasonKeys = [], onGoToChecklist }) => {
  const validKeys = reasonKeys.filter((k) => REASON_DOCUMENTS[k]);
  const [selected, setSelected] = useState(validKeys[0] || null);

  if (validKeys.length === 0 || !selected) return null;

  const reason = REASON_DOCUMENTS[selected];
  const required = reason.docs.filter((d) => d.required);
  const optional = reason.docs.filter((d) => !d.required);

  return (
    <div className="bg-white border border-stone-200 rounded-md p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-amber-600" />
          <h3 className="text-[15px] font-bold text-stone-900 tracking-tight">
            구비서류 미리보기
          </h3>
        </div>
        <button
          onClick={() => onGoToChecklist?.(selected)}
          className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 flex-shrink-0"
        >
          전체 체크리스트
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* 복수 사유 — 탭 */}
      {validKeys.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b border-stone-100">
          {validKeys.map((k) => (
            <button
              key={k}
              onClick={() => setSelected(k)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-sm transition-colors",
                selected === k
                  ? "bg-stone-900 text-white font-semibold"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              )}
            >
              {REASON_DOCUMENTS[k].name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        {required.map((doc, i) => (
          <div
            key={`req-${i}`}
            className="flex items-start gap-2 text-sm text-stone-800"
          >
            <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded-sm flex-shrink-0 mt-0.5">
              필수
            </span>
            <span className="leading-relaxed flex-1">
              {doc.name}
              {doc.autoLookup && (
                <span
                  className="ml-1.5 text-[9px] font-bold uppercase text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded-sm align-middle"
                  title="행정정보 공동이용 동의 시 자동 조회 가능"
                >
                  자동조회
                </span>
              )}
            </span>
          </div>
        ))}
        {optional.length > 0 && (
          <div className="pt-1.5 mt-1.5 border-t border-stone-100 space-y-1.5">
            {optional.map((doc, i) => (
              <div
                key={`opt-${i}`}
                className="flex items-start gap-2 text-xs text-stone-600"
              >
                <span className="text-[10px] font-bold uppercase text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-sm flex-shrink-0 mt-0.5">
                  권장
                </span>
                <span className="leading-relaxed flex-1">
                  {doc.name}
                  {doc.autoLookup && (
                    <span
                      className="ml-1.5 text-[9px] font-bold uppercase text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded-sm align-middle"
                      title="행정정보 공동이용 동의 시 자동 조회 가능"
                    >
                      자동조회
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] text-stone-500 mt-3 pt-3 border-t border-stone-100 leading-relaxed">
        💡 체크박스로 진행 상황을 표시하시려면 우측 상단의 「전체 체크리스트」를 클릭하세요.
      </p>
    </div>
  );
};
