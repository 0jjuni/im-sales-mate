import { useState } from "react";
import { AlertTriangle, Coins, TrendingDown, Scale } from "lucide-react";
import { CalculatorDisclaimer } from "../../components/CalculatorDisclaimer";
import { TaxSavingCalculator } from "./TaxSavingCalculator";
import { RefundSimulator } from "./RefundSimulator";
import { ProductCompare } from "./ProductCompare";
import { cn } from "@shared/lib/format";

/* 계산기 페이지 (탭 컨테이너).
   탭은 URL(/noran/calculator/:tab)로 제어된다 — 개별 계산기를 허브 「내 도구」에
   등록하고 딥링크로 바로 진입할 수 있게 하기 위함. (NoranApp이 activeTab을 내려줌) */
export const CalculatorPage = ({ onOpenArticle, activeTab = "tax", onTabChange }) => {
  const [accepted, setAccepted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const tabs = [
    {
      id: "tax",
      label: "소득공제 절세효과",
      icon: Coins,
      description: "월 부금월액 기준 연간 추정 절세액",
      sales: "★★★★★",
    },
    {
      id: "refund",
      label: "해약환급금 시나리오",
      icon: TrendingDown,
      description: "해약 시점별 환급금 추정 + 유지 시 비교",
      sales: "★★★★",
    },
    {
      id: "compare",
      label: "상품 비교",
      icon: Scale,
      description: "노란우산 vs 적금 vs 연금저축 추정 비교",
      sales: "★★★★",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
            세일즈 보조 계산기
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            소득공제 절세효과·해약환급금·상품 비교 추정치를 즉시 계산합니다.
          </p>
        </div>
        {!accepted && (
          <button
            onClick={() => setShowDisclaimer(true)}
            className="text-xs text-stone-600 hover:text-stone-900 underline"
          >
            사용 안내 다시 보기
          </button>
        )}
      </div>

      <div className="bg-amber-50/60 border-l-4 border-amber-500 px-4 py-2.5 rounded-r-sm flex items-start gap-2 print:hidden">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-stone-800 leading-relaxed">
          본 계산기 결과는 모두 <strong>추정치</strong>입니다. 실제 절세액·환급금·이율은 다른 공제 항목, 시점, 세법 개정에 따라 달라집니다. 정확한 금액은 중앙회 시스템 조회 + 세무 전문가 상담을 권해 주세요.
        </p>
      </div>

      {/* 탭 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 print:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={cn(
                "text-left p-4 border rounded-md transition-all",
                isActive
                  ? "bg-stone-900 text-white border-stone-900 shadow-md"
                  : "bg-white border-stone-200 text-stone-700 hover:border-stone-400"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5" />
                <span
                  className={cn(
                    "text-[10px] font-bold tracking-wider",
                    isActive ? "text-amber-300" : "text-amber-600"
                  )}
                >
                  {tab.sales}
                </span>
              </div>
              <div
                className={cn(
                  "text-sm font-bold",
                  isActive ? "text-white" : "text-stone-900"
                )}
              >
                {tab.label}
              </div>
              <div
                className={cn(
                  "text-xs mt-1 leading-relaxed",
                  isActive ? "text-stone-300" : "text-stone-500"
                )}
              >
                {tab.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* 활성 계산기 — 사용 안내 동의 후에만 노출 (ISA 계산기와 동일한 게이트) */}
      {accepted ? (
        <div>
          {activeTab === "tax" && <TaxSavingCalculator onOpenArticle={onOpenArticle} />}
          {activeTab === "refund" && <RefundSimulator onOpenArticle={onOpenArticle} />}
          {activeTab === "compare" && <ProductCompare />}
        </div>
      ) : (
        <div className="border-2 border-dashed border-stone-300 rounded-md p-8 text-center print:hidden">
          <p className="text-sm text-stone-500">
            계산기는 사용 안내 확인 후 이용할 수 있습니다.
          </p>
          <button
            onClick={() => setShowDisclaimer(true)}
            className="mt-3 px-4 py-2 text-sm bg-stone-900 text-white hover:bg-stone-800 rounded-sm font-semibold"
          >
            사용 안내 보기
          </button>
        </div>
      )}

      {!accepted && showDisclaimer && (
        <CalculatorDisclaimer
          onAccept={() => {
            setAccepted(true);
            setShowDisclaimer(false);
          }}
          onClose={() => setShowDisclaimer(false)}
        />
      )}
    </div>
  );
};
