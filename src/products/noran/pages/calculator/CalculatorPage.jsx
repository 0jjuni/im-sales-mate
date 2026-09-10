import { useState } from "react";
import { AlertTriangle, Coins, TrendingDown } from "lucide-react";
import { CalculatorDisclaimer } from "../../components/CalculatorDisclaimer";
import { TaxSavingCalculator } from "./TaxSavingCalculator";
import { RefundSimulator } from "./RefundSimulator";
import { ProductCompare } from "./ProductCompare";
import { cn } from "@shared/lib/format";

/* 계산기 페이지 (탭 컨테이너).
   탭은 URL(/noran/calculator/:tab)로 제어된다 — 개별 계산기를 허브 「내 도구」에
   등록하고 딥링크로 바로 진입할 수 있게 하기 위함. (NoranApp이 activeTab을 내려줌) */
export const CalculatorPage = ({ onOpenArticle, activeTab = "tax", onTabChange }) => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  /* 상품 비교(compare)는 탭에서 숨김 — 라우트/렌더(/noran/calculator/compare)와 컴포넌트는 유지해 필요 시 되살릴 수 있게 둔다. */
  const tabs = [
    {
      id: "tax",
      label: "소득공제 절세효과",
      icon: Coins,
      description: "월 부금월액 기준 연간 추정 절세액",
    },
    {
      id: "refund",
      label: "해약환급금 시나리오",
      icon: TrendingDown,
      description: "해약 시점별 환급금 추정 + 유지 시 비교",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            세일즈 보조 계산기
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            소득공제 절세효과·해약환급금 추정치를 즉시 계산합니다.
          </p>
        </div>
        <button
          onClick={() => setShowDisclaimer(true)}
          className="shrink-0 whitespace-nowrap text-sm text-slate-600 hover:text-slate-900 underline"
        >
          사용 안내
        </button>
      </div>

      <div className="bg-amber-50/60 border-l-4 border-amber-500 px-4 py-2.5 rounded-r-sm flex items-start gap-2 print:hidden">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-800 leading-relaxed">
          본 계산기 결과는 모두 <strong>추정치</strong>입니다. 실제 절세액·환급금·이율은 다른 공제 항목, 시점, 세법 개정에 따라 달라집니다. 정확한 금액은 중앙회 시스템 조회 + 세무 전문가 상담을 권해 주세요.
        </p>
      </div>

      {/* 탭 */}
      <div className="grid grid-cols-2 gap-2 print:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              aria-pressed={isActive}
              onClick={() => onTabChange?.(tab.id)}
              className={cn(
                "text-left p-3 border rounded-xl transition-all",
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5" />
              </div>
              <div
                className={cn(
                  "text-sm font-bold break-keep",
                  isActive ? "text-white" : "text-slate-900"
                )}
              >
                {tab.label}
              </div>
              <div
                className={cn(
                  "hidden sm:block text-sm mt-1 leading-relaxed",
                  isActive ? "text-slate-300" : "text-slate-500"
                )}
              >
                {tab.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* 활성 계산기 */}
      <div>
        {activeTab === "tax" && <TaxSavingCalculator onOpenArticle={onOpenArticle} />}
        {activeTab === "refund" && <RefundSimulator onOpenArticle={onOpenArticle} />}
        {activeTab === "compare" && <ProductCompare />}
      </div>

      {showDisclaimer && (
        <CalculatorDisclaimer
          onAccept={() => setShowDisclaimer(false)}
          onClose={() => setShowDisclaimer(false)}
        />
      )}
    </div>
  );
};
