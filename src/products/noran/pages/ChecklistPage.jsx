import { useState } from "react";
import { REASON_DOCUMENTS } from "../data/guides";
import { SourceBadge } from "@shared/components/SourceBadge";
import { WarningBox } from "@shared/components/WarningBox";
import { cn } from "@shared/lib/format";

export const ChecklistPage = ({ onOpenArticle, initialReason }) => {
  const [activeReason, setActiveReason] = useState(
    initialReason && REASON_DOCUMENTS[initialReason] ? initialReason : "closure"
  );
  const [checked, setChecked] = useState({});

  const reason = REASON_DOCUMENTS[activeReason];

  const toggleCheck = (idx) => {
    setChecked((prev) => ({ ...prev, [`${activeReason}-${idx}`]: !prev[`${activeReason}-${idx}`] }));
  };

  const handleReasonChange = (key) => {
    setActiveReason(key);
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold">Document Checklist</span>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight mt-1">구비서류 체크리스트</h1>
        <p className="text-sm text-stone-600 mt-1">사유별 필요 서류를 확인하고 상담 중 체크하세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">사유 선택</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
            {Object.entries(REASON_DOCUMENTS).map(([key, r]) => (
              <button
                key={key}
                onClick={() => handleReasonChange(key)}
                className={cn(
                  "w-full text-left px-3 py-2.5 text-sm rounded-sm transition-colors",
                  activeReason === key
                    ? "bg-stone-900 text-white font-semibold"
                    : "bg-white border border-stone-200 text-stone-700 hover:border-stone-400"
                )}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-stone-200 rounded-md p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-stone-900">{reason.name}</h2>
              <SourceBadge articles={reason.sourceReference.articles} onClick={onOpenArticle} />
            </div>
            <p className="text-xs text-stone-500 mb-4">상담 중 체크박스로 진행 상황을 표시하세요.</p>

            {reason.docs.some((d) => d.autoLookup) && (
              <div className="mb-4 flex items-start gap-2 p-3 bg-blue-50/60 border border-blue-200 rounded-sm">
                <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded-sm flex-shrink-0 mt-0.5">
                  자동조회
                </span>
                <p className="text-xs text-stone-700 leading-relaxed flex-1">
                  별지 제61호{" "}
                  <button
                    onClick={() => onOpenArticle?.("행정정보 공동이용")}
                    className="text-blue-700 hover:text-blue-800 underline font-medium"
                  >
                    「행정정보 공동이용 사전동의서」(전자정부법 §36, 12종)
                  </button>{" "}
                  자필서명 시 국세청 연계로 자동 조회 — 고객이 별도로 가져오지 않으셔도 됩니다.
                </p>
              </div>
            )}

            <div className="space-y-2">
              {reason.docs.map((doc, idx) => {
                const key = `${activeReason}-${idx}`;
                const isChecked = checked[key];
                return (
                  <label
                    key={idx}
                    className={cn(
                      "flex items-start gap-3 p-3 border rounded-sm cursor-pointer transition-colors",
                      isChecked
                        ? "bg-amber-50/40 border-amber-300"
                        : "bg-white border-stone-200 hover:border-stone-400"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={!!isChecked}
                      onChange={() => toggleCheck(idx)}
                      className="mt-0.5 w-4 h-4 accent-amber-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className={cn("text-sm font-semibold", isChecked && "line-through text-stone-500")}>
                          {doc.name}
                        </span>
                        {doc.required && (
                          <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded-sm">
                            필수
                          </span>
                        )}
                        {!doc.required && (
                          <span className="text-[10px] font-bold uppercase text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-sm">
                            권장
                          </span>
                        )}
                        {doc.autoLookup && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              onOpenArticle?.("행정정보 공동이용");
                            }}
                            className="text-[10px] font-bold uppercase text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded-sm transition-colors"
                            title="행정정보 공동이용 동의 시 국세청 연계로 자동 조회 가능"
                          >
                            자동조회
                          </button>
                        )}
                      </div>
                      {doc.note && (
                        <p className="text-xs text-stone-500 leading-relaxed">{doc.note}</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <WarningBox items={reason.staffWarning} />
        </div>
      </div>
    </div>
  );
};
