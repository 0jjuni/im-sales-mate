/* 세일즈 코치 카드 — 시뮬레이터에서 토글로 표시 */
export const CoachCard = ({ coachTip }) => {
  if (!coachTip) return null;
  return (
    <div className="bg-gradient-to-br from-purple-50 to-amber-50 border border-purple-200 rounded-md overflow-hidden">
      <div className="bg-purple-900/90 px-4 py-2 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-amber-300 rounded-full animate-pulse" />
        <span className="text-[10px] uppercase tracking-widest text-purple-100 font-bold">
          Sales Coach
        </span>
        <span className="text-[10px] text-purple-200">상담 가이드 모드</span>
      </div>
      <div className="p-4 space-y-3">
        {coachTip.tip && (
          <div className="flex gap-2.5">
            <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-sm">
              💡
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-0.5">
                Sales Tip
              </div>
              <p className="text-sm text-stone-800 leading-relaxed">
                {coachTip.tip}
              </p>
            </div>
          </div>
        )}
        {coachTip.mention && (
          <div className="flex gap-2.5">
            <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-sm">
              🗣️
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-0.5">
                Recommended Mention
              </div>
              <div className="bg-white/70 border border-emerald-200/60 rounded-sm px-3 py-2 italic text-sm text-stone-800 leading-relaxed">
                "{coachTip.mention}"
              </div>
            </div>
          </div>
        )}
        {coachTip.caution && (
          <div className="flex gap-2.5">
            <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-sm">
              ⚠
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-red-700 mb-0.5">
                Watch Out
              </div>
              <p className="text-sm text-stone-800 leading-relaxed">
                {coachTip.caution}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
