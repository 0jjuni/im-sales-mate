import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { SIMULATOR_TREE, SIMULATOR_RESULTS } from "../data/simulator";
import { CoachCard } from "../components/CoachCard";
import { SourceBadge } from "@shared/components/SourceBadge";
import { WarningBox } from "@shared/components/WarningBox";
import { SectionTitle } from "@shared/components/SectionTitle";
import { CopyButton } from "@shared/components/CopyButton";
import { ChecklistPreview } from "../components/ChecklistPreview";
import { cn } from "@shared/lib/format";

/* initialNode가 SIMULATOR_TREE에 있고 root가 아니면 해당 노드로 바로 진입 */
const buildInitialPath = (initialNode) =>
  initialNode && initialNode !== "root" && SIMULATOR_TREE[initialNode]
    ? ["root", initialNode]
    : ["root"];

export const SimulatorPage = ({ onOpenArticle, onGoToChecklist, initialNode }) => {
  const [path, setPath] = useState(() => buildInitialPath(initialNode));
  const [resultId, setResultId] = useState(null);
  const [coachMode, setCoachMode] = useState(false);

  /* URL hash 변경(예: 대시보드에서 다른 카테고리 카드 클릭, 브라우저 뒤로가기)에 따라 경로 재설정 */
  useEffect(() => {
    setPath(buildInitialPath(initialNode));
    setResultId(null);
  }, [initialNode]);

  const currentNodeId = path[path.length - 1];
  const currentNode = SIMULATOR_TREE[currentNodeId];

  const handleOption = (opt) => {
    if (opt.result) {
      setResultId(opt.result);
    } else if (opt.next) {
      setPath([...path, opt.next]);
    }
  };

  const handleReset = () => {
    setPath(["root"]);
    setResultId(null);
  };

  const handleBack = () => {
    if (resultId) {
      setResultId(null);
      return;
    }
    if (path.length > 1) {
      setPath(path.slice(0, -1));
    }
  };

  const result = resultId ? SIMULATOR_RESULTS[resultId] : null;
  const activeCoachTip = result?.coachTip || currentNode?.coachTip;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
            상담 시뮬레이터
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            고객 상황을 단계별로 분류해 적합한 안내 흐름을 추천합니다.
          </p>
        </div>

        {/* 코치 모드 토글 */}
        <button
          onClick={() => setCoachMode(!coachMode)}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-md border transition-all flex-shrink-0",
            coachMode
              ? "bg-purple-900 border-purple-900 text-white shadow-sm"
              : "bg-white border-stone-300 text-stone-700 hover:border-purple-400 hover:bg-purple-50/30"
          )}
          title="단계별 세일즈 팁과 추천 멘트를 표시합니다"
        >
          <div className="relative">
            <div
              className={cn(
                "w-8 h-4 rounded-full transition-colors",
                coachMode ? "bg-amber-400" : "bg-stone-300"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform",
                  coachMode ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </div>
          </div>
          <div className="text-left">
            <div className="text-xs font-bold leading-tight">세일즈 코치</div>
            <div
              className={cn(
                "text-[10px] leading-tight",
                coachMode ? "text-purple-200" : "text-stone-500"
              )}
            >
              {coachMode ? "ON · 팁·멘트 표시" : "OFF · 베테랑 모드"}
            </div>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-stone-500">진행 단계:</span>
        {path.map((p, i) => (
          <React.Fragment key={i}>
            <span
              className={cn(
                "px-2 py-0.5 rounded-sm",
                i === path.length - 1 && !result
                  ? "bg-amber-100 text-amber-900 font-semibold"
                  : "bg-stone-100 text-stone-600"
              )}
            >
              {i + 1}단계
            </span>
            {i < path.length - 1 && (
              <ChevronRight className="w-3 h-3 text-stone-400" />
            )}
          </React.Fragment>
        ))}
        {result && (
          <>
            <ChevronRight className="w-3 h-3 text-stone-400" />
            <span className="px-2 py-0.5 rounded-sm bg-amber-100 text-amber-900 font-semibold">
              결과
            </span>
          </>
        )}
      </div>

      {/* 분기 단계 — 질문 + 옵션 + (옵션) 코치카드 */}
      {!result && currentNode && (
        <div
          className={cn(
            "grid gap-4",
            coachMode && activeCoachTip ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"
          )}
        >
          <div
            className={cn(
              "bg-white border border-stone-200 rounded-md p-6",
              coachMode && activeCoachTip ? "lg:col-span-2" : ""
            )}
          >
            <h2 className="text-lg font-bold text-stone-900 mb-4">
              {currentNode.question}
            </h2>
            <div className="space-y-2">
              {currentNode.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOption(opt)}
                  className="w-full text-left px-4 py-3 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-400 rounded-sm transition-colors flex items-center justify-between group"
                >
                  <span className="text-sm font-medium text-stone-800">
                    {opt.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
          {coachMode && activeCoachTip && (
            <div>
              <CoachCard coachTip={activeCoachTip} />
            </div>
          )}
        </div>
      )}

      {/* 결과 단계 */}
      {result && (
        <div className="space-y-4">
          <div className="bg-white border-2 border-amber-400 rounded-md p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-amber-700 font-bold mb-1">
                  상담 결과
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-stone-900">
                  {result.title}
                </h2>
              </div>
              <SourceBadge
                articles={result.sourceReference.articles}
                onClick={onOpenArticle}
              />
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              {result.summary}
            </p>
          </div>

          {coachMode && activeCoachTip && (
            <CoachCard coachTip={activeCoachTip} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-stone-200 rounded-md p-5">
                <SectionTitle>다음 단계</SectionTitle>
                <ol className="space-y-2">
                  {result.nextSteps.map((step, i) => (
                    <li key={i} className="text-sm text-stone-800 flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-amber-100 text-amber-800 rounded-full text-[11px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-amber-50/40 border border-amber-200 rounded-md p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-bold text-stone-900">
                    고객 안내 문구
                  </h3>
                  <CopyButton text={result.customerScript} />
                </div>
                <p className="text-sm text-stone-800 leading-relaxed bg-white/70 p-3 rounded-sm border border-amber-200/60">
                  {result.customerScript}
                </p>
              </div>

              {result.reasonKeys && result.reasonKeys.length > 0 && (
                <ChecklistPreview
                  reasonKeys={result.reasonKeys}
                  onGoToChecklist={onGoToChecklist}
                />
              )}
            </div>
            <WarningBox items={result.staffWarning} />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm border border-stone-300 bg-white hover:bg-stone-50 rounded-sm"
            >
              ← 이전 단계로
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm bg-stone-900 text-white hover:bg-stone-800 rounded-sm"
            >
              새 상담 시작
            </button>
          </div>
        </div>
      )}

      {!result && path.length > 1 && (
        <button
          onClick={handleBack}
          className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1"
        >
          ← 이전 단계로
        </button>
      )}
    </div>
  );
};
