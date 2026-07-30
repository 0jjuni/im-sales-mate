import { useState, useMemo } from "react";
import { AlertTriangle, Coins, Info, Printer } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { INCOME_BRACKETS } from "../../data/tax";
import { SectionTitle } from "@shared/components/SectionTitle";
import { PrintReport } from "@shared/components/PrintReport";
import { SalesScript } from "@shared/components/SalesScript";
import { NORAN_PRINT_META } from "../../printMeta";
import { cn, formatKRW, formatKRWShort } from "@shared/lib/format";

/* A. 소득공제 절세효과 계산기 */
export const TaxSavingCalculator = ({ onOpenArticle }) => {
  const [businessType, setBusinessType] = useState("individual"); // individual | corp_rep
  const [bracketId, setBracketId] = useState("40m_60m");
  const [salaryOver80m, setSalaryOver80m] = useState(false);
  const [monthlyAmount, setMonthlyAmount] = useState(300000);

  const bracket = INCOME_BRACKETS.find((b) => b.id === bracketId);

  const result = useMemo(() => {
    const annualPayment = monthlyAmount * 12;
    let deductionLimit = bracket.deductionLimit;
    let isBlocked = false;
    let blockedReason = "";

    if (businessType === "corp_rep" && salaryOver80m) {
      deductionLimit = 0;
      isBlocked = true;
      blockedReason =
        "법인대표 총급여 8천만원 초과 시 근로소득금액에서 소득공제 불가";
    }

    const actualDeduction = Math.min(annualPayment, deductionLimit);
    const taxSaving = actualDeduction * bracket.marginalRate;
    const monthlyTaxSaving = taxSaving / 12;

    return {
      annualPayment,
      deductionLimit,
      actualDeduction,
      marginalRate: bracket.marginalRate,
      rateLabel: bracket.rateLabel,
      taxSaving,
      monthlyTaxSaving,
      isBlocked,
      blockedReason,
      // 시각화용 데이터
      chartData: [
        { name: "연 납입액", value: annualPayment, fill: "#92400e" },
        { name: "공제 한도", value: deductionLimit, fill: "#d97706" },
        { name: "실제 공제액", value: actualDeduction, fill: "#f59e0b" },
        { name: "추정 절세액", value: taxSaving, fill: "#10b981" },
      ],
    };
  }, [businessType, bracketId, salaryOver80m, monthlyAmount, bracket]);

  /* 고객에게 실제로 할 수 있는 말. 계산 결과 나열은 화면·인쇄물에 이미 있으므로
     여기서는 체감되는 표현과 되묻는 질문 대응만 담는다. */
  const script = useMemo(() => {
    if (result.isBlocked) {
      return {
        opening: `${result.blockedReason} 이 지위로는 소득공제를 받으실 수 없습니다.`,
        detail: [
          "개인사업자 지위로 가입이 가능한지 함께 확인해 보시겠어요? 조건이 맞으면 그쪽으로 검토해 보실 수 있습니다.",
        ],
        objections: [
          {
            q: "그럼 가입 자체가 안 되나요?",
            a: "가입은 가능하지만 소득공제 혜택이 적용되지 않습니다. 공제금 지급이나 압류 금지 같은 다른 혜택은 그대로 받으실 수 있어서, 목적에 따라 판단하시면 됩니다.",
          },
        ],
      };
    }

    /* 실부담 = 월 납입액에서 월 환산 절세액을 뺀 금액 */
    const netMonthly = monthlyAmount - result.monthlyTaxSaving;

    return {
      opening: `월 ${formatKRW(monthlyAmount)}씩 넣으시면 연말정산 때 해마다 ${formatKRW(
        result.taxSaving
      )} 정도를 돌려받으십니다.`,
      detail: [
        `월로 나눠 보면 ${formatKRW(
          result.monthlyTaxSaving
        )}쯤 되니까, 실제 부담은 ${formatKRW(netMonthly)} 정도로 ${formatKRW(
          monthlyAmount
        )}을 저축하시는 셈입니다.`,
        "다만 초기에 해약하시면 낸 돈보다 적게 나올 수 있습니다. 오래 유지하실 수 있는 금액으로 시작하시는 편이 좋습니다.",
      ],
      objections: [
        {
          q: "중간에 해약하면 어떻게 돼요?",
          a: "가입 초기에는 낸 돈보다 적게 돌려받게 됩니다. 그리고 그동안 받으신 소득공제만큼 세금을 다시 내셔야 합니다. 그래서 여유 자금으로 시작하시는 걸 권합니다. 해약환급금 계산기에서 시점별로 얼마가 나오는지 바로 보여드릴 수 있습니다.",
        },
        {
          q: "지금은 형편이 안 되는데 나중에 하면 안 돼요?",
          a: "부금액은 나중에 올리실 수 있으니 낮은 금액으로 시작하셔도 됩니다. 소득공제는 그해 납입한 금액에만 적용되니, 시작이 늦어지면 그만큼 공제 기회가 지나갑니다.",
        },
        {
          q: "적금이랑 뭐가 달라요?",
          a: "적금은 이자에 세금을 떼지만, 노란우산은 넣는 단계에서 소득공제를 받습니다. 그리고 폐업이나 사망 같은 사유가 생겼을 때 공제금이 나오고, 법으로 압류가 금지돼 있어 사업이 어려워져도 보호됩니다. 상품 비교 계산기에서 금액으로 비교해 드릴 수 있습니다.",
        },
      ],
    };
  }, [result, monthlyAmount]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 print:hidden">
        {/* 입력부 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-stone-200 rounded-md p-5 space-y-4">
            <SectionTitle sub="고객 정보를 입력하세요">입력</SectionTitle>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                사업자 유형
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "individual", label: "개인사업자" },
                  { id: "corp_rep", label: "법인대표" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setBusinessType(t.id)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-sm border transition-colors",
                      businessType === t.id
                        ? "bg-stone-900 text-white border-stone-900 font-semibold"
                        : "bg-white text-stone-700 border-stone-300 hover:border-stone-400"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                소득금액 구간
              </label>
              <select
                value={bracketId}
                onChange={(e) => setBracketId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-sm focus:outline-none focus:border-amber-500"
              >
                {INCOME_BRACKETS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label} (한도 {formatKRWShort(b.deductionLimit)})
                  </option>
                ))}
              </select>
            </div>

            {businessType === "corp_rep" && (
              <label className="flex items-start gap-2 p-3 bg-amber-50/40 border border-amber-200 rounded-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={salaryOver80m}
                  onChange={(e) => setSalaryOver80m(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-amber-600"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-stone-900">
                    총급여 8천만원 초과 (= 근로소득금액 6,625만원 초과)
                  </div>
                  <div className="text-xs text-stone-600 mt-0.5">
                    체크 시 근로소득금액 공제 불가 (조특법 제86조의3 제1항). 청약서 핵심설명서의 법인대표 4구간 표 기준 6,625만원 분기점과 동일.
                  </div>
                </div>
              </label>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                부금월액: {formatKRW(monthlyAmount)}
              </label>
              <input
                type="range"
                min="50000"
                max="1500000"
                step="10000"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                <span>5만원</span>
                <span>75만원</span>
                <span>150만원</span>
              </div>
              <input
                type="number"
                value={monthlyAmount}
                min="50000"
                max="1500000"
                step="10000"
                onChange={(e) =>
                  setMonthlyAmount(
                    Math.max(50000, Math.min(1500000, Number(e.target.value)))
                  )
                }
                className="mt-2 w-full px-3 py-2 text-sm border border-stone-300 rounded-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="bg-blue-50/40 border border-blue-200 rounded-md p-3 text-xs text-stone-700 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline-block mr-1 text-blue-600" />
            한계세율은 추정치입니다. 다른 소득·공제 합산 결과에 따라 실제 적용세율은 달라질 수 있습니다.
          </div>
        </div>

        {/* 결과부 */}
        <div className="lg:col-span-3 space-y-4">
          {result.isBlocked ? (
            <div className="bg-red-50 border-2 border-red-300 rounded-md p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-1">
                    소득공제 불가
                  </h3>
                  <p className="text-sm text-stone-800 leading-relaxed">
                    {result.blockedReason}
                  </p>
                  <p className="text-xs text-stone-600 mt-2">
                    개인사업자 지위로 가입하시는 경우 사업소득 기준 공제 적용 가능 여부 별도 확인 필요.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50 border-2 border-amber-400 rounded-md p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-amber-700 font-bold mb-1">
                      추정 절세액
                    </div>
                    <div className="text-4xl font-black text-stone-900 tracking-tight">
                      {formatKRW(result.taxSaving)}
                      <span className="text-base font-normal text-stone-500 ml-1">
                        /년
                      </span>
                    </div>
                    <div className="text-sm text-stone-600 mt-1">
                      월 평균 약 {formatKRW(result.monthlyTaxSaving)}
                    </div>
                  </div>
                  <Coins className="w-10 h-10 text-amber-500" />
                </div>

                <button
                  onClick={() => window.print()}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-md font-semibold transition-colors"
                  title="이 결과 전체를 디스클레이머·입력 조건 포함하여 인쇄"
                >
                  <Printer className="w-4 h-4" />
                  <span>상담 자료 인쇄</span>
                  <span className="text-[11px] font-normal text-stone-300 hidden sm:inline">
                    PDF 저장 가능 · 디스클레이머·입력 조건 포함
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-amber-200">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-0.5">
                      연 납입액
                    </div>
                    <div className="text-base font-bold text-stone-900">
                      {formatKRW(result.annualPayment)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-0.5">
                      소득공제 한도
                    </div>
                    <div className="text-base font-bold text-stone-900">
                      {formatKRW(result.deductionLimit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-0.5">
                      실제 공제액
                    </div>
                    <div className="text-base font-bold text-stone-900">
                      {formatKRW(result.actualDeduction)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-0.5">
                      추정 한계세율
                    </div>
                    <div className="text-base font-bold text-stone-900">
                      {(result.marginalRate * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-md p-4">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                  금액 비교
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={result.chartData}
                    layout="vertical"
                    margin={{ left: 0, right: 30, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => formatKRWShort(v)}
                      tick={{ fontSize: 10, fill: "#78716c" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#44403c" }}
                      width={75}
                    />
                    <Tooltip
                      formatter={(v) => formatKRW(v)}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 4,
                        border: "1px solid #e7e5e4",
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {result.chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <SalesScript accent="amber" {...script} />
            </>
          )}

          <div className="bg-stone-50 border border-stone-200 rounded-md p-3 text-xs text-stone-600 leading-relaxed">
            <strong className="text-stone-800">계산 근거:</strong>{" "}
            <button
              onClick={() => onOpenArticle("조특법 제86조의3")}
              className="text-amber-700 hover:text-amber-800 underline"
            >
              조세특례제한법 제86조의3
            </button>
            (소득공제 한도) + 종합소득세율표(2025년 기준) + 지방소득세 10% 가산. 한계세율은 단순 추정치이며 실제 적용세율과 다를 수 있습니다.
          </div>
        </div>
      </div>

      {/* 인쇄용 — 화면에는 숨김, window.print() 호출 시에만 노출 */}
      {!result.isBlocked && (
        <PrintReport
          title="소득공제 절세효과 추정 안내"
          subtitle="노란우산공제 가입에 따른 연간 추정 절세액"
          disclaimer={`본 절세액은 추정치이며, 다른 소득공제 항목, 추가 소득, 종합소득세율 변경 등에 따라 실제 절세액은 달라질 수 있습니다.\n적용 한계세율은 단일 추정치로 다른 소득·공제 합산 결과에 따라 달라질 수 있습니다.\n정확한 절세효과는 세무 전문가 또는 국세청 상담을 권해 드립니다.`}
          inputs={[
            {
              label: "사업자 유형",
              value: businessType === "individual" ? "개인사업자" : "법인대표",
            },
            { label: "소득금액 구간", value: bracket.rangeText },
            ...(businessType === "corp_rep"
              ? [
                  {
                    label: "총급여 8천만원 초과",
                    value: salaryOver80m
                      ? "예 (근로소득금액 공제 불가)"
                      : "아니오",
                  },
                ]
              : []),
            { label: "월 부금월액", value: formatKRW(monthlyAmount) },
          ]}
          results={[
            { label: "연 납입액", value: formatKRW(result.annualPayment) },
            {
              label: "적용 가능 소득공제 한도",
              value: formatKRW(result.deductionLimit),
              sub: bracket.rangeText,
            },
            {
              label: "실제 소득공제액",
              value: formatKRW(result.actualDeduction),
            },
            {
              label: "추정 한계세율",
              value: `${(result.marginalRate * 100).toFixed(1)}%`,
              sub: bracket.rateLabel,
            },
            {
              label: "추정 절세액 (연)",
              value: formatKRW(result.taxSaving),
              emphasis: true,
              sub: `월 평균 약 ${formatKRW(result.monthlyTaxSaving)}`,
            },
          ]}
          notes={[
            "추정 절세액 = 실제 소득공제액 × 추정 한계세율 (지방소득세 포함)",
            "한계세율은 종합소득세율표(2025년 기준)에 지방소득세 10%를 가산한 단순 추정치입니다.",
            "다른 소득공제·세액공제 항목, 추가 소득 발생 시 실제 절세액은 변동될 수 있습니다.",
            "법인대표 총급여 8천만원 초과 시 근로소득금액에서 소득공제를 받으실 수 없습니다.",
            "부동산임대업소득자는 본 공제 대상에서 제외됩니다.",
          ]}
          legalBasis="조세특례제한법 제86조의3 (소기업·소상공인 공제부금에 대한 소득공제)"
          {...NORAN_PRINT_META}
        />
      )}
    </div>
  );
};
