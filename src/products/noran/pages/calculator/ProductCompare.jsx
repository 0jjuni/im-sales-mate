import { useState, useMemo } from "react";
import {
  Info,
  Printer,
  Sparkles,
  Shield,
  Coins,
  PiggyBank,
  Heart,
  Lock,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { INCOME_BRACKETS } from "../../data/tax";
import { SectionTitle } from "@shared/components/SectionTitle";
import { SalesScript } from "@shared/components/SalesScript";
import { cn, formatKRW, formatKRWShort } from "@shared/lib/format";

/* 공통 적립식 미래가치 — RefundSimulator와 같은 공식
   매월 P씩 N개월 납입 → 연단위 복리, 매월 평균 6개월 추가 적립 보정 (√(1+r) 가산) */
const compoundFV = (monthly, months, annualRatePct) => {
  if (months === 0) return 0;
  const r = annualRatePct / 100;
  const years = months / 12;
  if (r === 0) return monthly * months;
  return monthly * 12 * (Math.pow(1 + r, years) - 1) / r * Math.sqrt(1 + r);
};

/* 별표1 폐업·사망공제금 차등지급이율 — 15년간 +0.3%, 이후 단계적 인하 (단순화: 평균 +0.15%) */
const closureBonusRate = (months) => (months / 12 <= 15 ? 0.3 : 0.15);

/* 일반 적금: 단리 (매월 납입분별 잔여기간 단리)
   총 이자 = P × r × N(N+1) / (2×12) */
const simpleSavingsFV = (monthly, months, annualRatePct) => {
  const r = annualRatePct / 100;
  const principal = monthly * months;
  if (r === 0) return principal;
  const interest = (monthly * r * months * (months + 1)) / (2 * 12);
  return principal + interest;
};

/* C. 상품 비교 계산기 (가입 시 안내 톤 — RefundSimulator와 일관) */
export const ProductCompare = ({ onOpenArticle }) => {
  const [monthlyAmount, setMonthlyAmount] = useState(300000);
  const [years, setYears] = useState(10);
  const [bracketId, setBracketId] = useState("40m_60m");
  const [yumamRate, setYumamRate] = useState(3.0);
  const [savingsRate, setSavingsRate] = useState(3.5);
  const [pensionRate, setPensionRate] = useState(3.5);
  const [withIncentive, setWithIncentive] = useState(true);
  const [incentiveMonthly, setIncentiveMonthly] = useState(20000); // 월 적립 장려금 (지자체 평균)

  const bracket = INCOME_BRACKETS.find((b) => b.id === bracketId);

  const result = useMemo(() => {
    const months = years * 12;
    const annualPayment = monthlyAmount * 12;
    const totalPrincipal = monthlyAmount * months;

    /* === 노란우산공제 — 2개 시나리오 동시 표시 === */
    // (a) 폐업·법인해산·사망공제금 — 별표1 차등지급이율 +0.3% (가장 유리)
    // (b) 노령급부 도달 — 별표1 기준이율 부리적립 (만 60세 + 120개월 충족)
    // 별표1 1~6회 납부는 납부부금만 (이자 미부리). 슬라이더가 1년~이라 항상 7회 이상.
    const yumamClosureRefund = months <= 6
      ? monthlyAmount * months
      : compoundFV(monthlyAmount, months, yumamRate + closureBonusRate(months));
    const yumamNorengRefund = months <= 6
      ? monthlyAmount * months
      : compoundFV(monthlyAmount, months, yumamRate);
    const isNorengEligible = months >= 120;
    // 소득공제 절세액 누적 (가입 단계에서 매년 받는 절세이므로 세전 합계에 포함)
    const yumamDeduction = Math.min(annualPayment, bracket.deductionLimit);
    const yumamTaxSavingAnnual = yumamDeduction * bracket.marginalRate;
    const yumamTaxSavingTotal = yumamTaxSavingAnnual * years;

    /* === 가입(희망)장려금 === */
    // 1년만 적립 (가입일로부터 12회) — 그 후 공제금 수령 시까지 연복리 부리
    const incentiveYears = withIncentive ? years : 0;
    let incentiveTotal = 0;
    if (withIncentive) {
      // 첫 1년간 매월 적립
      const incentivePrincipal = incentiveMonthly * 12;
      // 그 후 가입기간 - 1년 동안 yumamRate 연복리 부리
      const remainingYears = Math.max(0, years - 1);
      const r = yumamRate / 100;
      incentiveTotal = r === 0
        ? incentivePrincipal
        : incentivePrincipal * Math.pow(1 + r, remainingYears);
      // 임의해약(노령급부 조건 미충족) 시 장려금 미지급 가능성 있음 — 단순화: 노령급부 가정 시만 포함
      if (!isNorengEligible) incentiveTotal = incentiveTotal * 0.5; // 미지급 위험 반영
    }

    /* === 일반 적금 === */
    const savingsFV = simpleSavingsFV(monthlyAmount, months, savingsRate);

    /* === 연금저축 === */
    // 한도 600만원 — 사업/근로소득금액 ≤ 4천만(혹은 종합 4,500만 / 총급여 5,500만 이하)이면 16.5%, 외 13.2%
    const pensionCreditRate = bracket.id === "under_40m" ? 0.165 : 0.132;
    const pensionAnnualLimit = 6_000_000;
    const pensionDeduction = Math.min(annualPayment, pensionAnnualLimit);
    const pensionTaxSavingAnnual = pensionDeduction * pensionCreditRate;
    const pensionTaxSavingTotal = pensionTaxSavingAnnual * years;
    const pensionFV = compoundFV(monthlyAmount, months, pensionRate);

    /* === 총 혜택 합계 (세전 만기액 + 누적 절세액·세액공제 + 장려금)
       수령 시 과세는 변수가 많아 본 시뮬에서 별도 차감하지 않음 */
    const yumamClosureTotal = yumamClosureRefund + yumamTaxSavingTotal + incentiveTotal;
    const yumamNorengTotal = yumamNorengRefund + yumamTaxSavingTotal + incentiveTotal;
    const savingsTotal = savingsFV;
    const pensionTotal = pensionFV + pensionTaxSavingTotal;

    const products = [
      {
        key: "yumam-closure",
        name: "노란우산 (폐업·사망 시)",
        icon: Shield,
        color: "amber",
        principal: totalPrincipal,
        fv: yumamClosureRefund,
        taxNote: "수령 시 퇴직소득세 별도 (근속·환산급여공제로 변동)",
        taxSaving: yumamTaxSavingTotal,
        taxSavingLabel: "소득공제 절세액",
        incentive: incentiveTotal,
        total: yumamClosureTotal,
        scenario: "별표1 차등지급이율 (15년간 기준이율 +0.3%) — 가장 유리한 사유",
        warning: false,
      },
      {
        key: "yumam-noreng",
        name: "노란우산 (노령급부 도달 시)",
        icon: Shield,
        color: "amber",
        principal: totalPrincipal,
        fv: yumamNorengRefund,
        taxNote: "수령 시 퇴직소득세 별도",
        taxSaving: yumamTaxSavingTotal,
        taxSavingLabel: "소득공제 절세액",
        incentive: incentiveTotal,
        total: yumamNorengTotal,
        scenario: isNorengEligible
          ? "별표1 기준이율 부리적립 · 만 60세 + 120개월 충족 가정"
          : "⚠ 가입기간 10년 미만 — 노령급부 조건 미충족 (참고용 추정만)",
        warning: !isNorengEligible,
      },
      {
        key: "savings",
        name: "일반 적금",
        icon: PiggyBank,
        color: "stone",
        principal: totalPrincipal,
        fv: savingsFV,
        taxNote: "수령 시 이자소득세 15.4% 원천징수 (적용 후 실수령 별도)",
        taxSaving: 0,
        taxSavingLabel: "절세 혜택 없음",
        incentive: 0,
        total: savingsTotal,
        scenario: "단리 이자 산정 (매월 납입분별 잔여기간 단리)",
        warning: false,
      },
      {
        key: "pension",
        name: "연금저축",
        icon: Calendar,
        color: "blue",
        principal: totalPrincipal,
        fv: pensionFV,
        taxNote: "만 55세+ 수령 시 연금소득세 / 중도해지 시 기타소득세 16.5%",
        taxSaving: pensionTaxSavingTotal,
        taxSavingLabel: `세액공제 (${(pensionCreditRate * 100).toFixed(1)}%, 한도 600만)`,
        incentive: 0,
        total: pensionTotal,
        scenario: "만 55세+ 연금 수령 가정",
        warning: false,
      },
    ];

    const best = products.reduce((m, p) => (p.total > m.total ? p : m), products[0]);

    return {
      months,
      totalPrincipal,
      isNorengEligible,
      products,
      best,
      pensionCreditRate,
    };
  }, [
    monthlyAmount,
    years,
    bracketId,
    yumamRate,
    savingsRate,
    pensionRate,
    withIncentive,
    incentiveMonthly,
    bracket,
  ]);

  const chartData = result.products.map((p) => ({
    name: p.name.replace("노란우산 (", "").replace(")", ""),
    "이자수익": Math.max(0, p.fv - p.principal),
    절세액: p.taxSaving,
    장려금: p.incentive,
  }));

  /* 고객에게 실제로 할 수 있는 말. 이 계산기는 「적금이랑 뭐가 다르냐」에 답하는 자리.
     금액 차이만 말하면 이율 가정 싸움이 되므로, 노란우산만 가진 혜택으로 넘어가야 한다. */
  const script = useMemo(() => {
    const savings = result.products.find((p) => p.key === "savings");
    const gap = savings ? result.best.total - savings.total : 0;

    return {
      opening: `월 ${formatKRW(monthlyAmount)}씩 ${years}년을 넣으시면, 적금보다 ${formatKRW(
        gap
      )} 정도 더 받으시는 것으로 나옵니다.`,
      detail: [
        `총 ${formatKRW(
          result.totalPrincipal
        )}을 넣으시는 건 같은데, 노란우산은 넣는 동안 소득공제로 ${formatKRW(
          result.best.taxSaving
        )}을 돌려받으시기 때문입니다. 적금은 이자에서 세금을 떼고 끝입니다.`,
        "그런데 금액보다 중요한 차이가 있습니다. 노란우산은 법으로 압류가 금지돼 있어서, 사업이 어려워져도 이 돈은 지킬 수 있습니다. 적금은 그렇지 않습니다.",
        "그리고 가입만 하시면 상해보험이 자동으로 따라붙고, 급할 때는 해약하지 않고 대출로 쓰실 수 있습니다.",
      ],
      objections: [
        {
          q: "적금 금리가 더 높은데요?",
          a: "이자만 보면 그럴 수 있습니다. 다만 노란우산은 이자 외에 넣는 단계에서 소득공제를 받으시는 구조라, 둘을 합쳐서 봐야 비교가 됩니다. 지금 화면이 그 합계를 비교한 것입니다.",
        },
        {
          q: "연금저축과는 뭐가 달라요?",
          a: "연금저축은 만 55세 이후에 연금으로 받는 상품이고, 노란우산은 폐업이나 사망 같은 사유가 생겼을 때 받는 상품입니다. 목적이 다릅니다. 둘은 한도가 따로라 같이 하셔도 각각 공제를 받으실 수 있습니다.",
        },
        {
          q: "중간에 깨면 손해라던데요?",
          a: "초기에 해약하시면 낸 돈보다 적게 나오는 건 맞습니다. 그래서 급할 때는 해약 대신 공제계약대출을 쓰시면 됩니다. 계약을 유지한 채로 자금을 쓰실 수 있어서 그동안 받은 공제를 토해내지 않습니다.",
        },
      ],
    };
  }, [result, monthlyAmount, years]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 print:hidden">
        {/* 입력부 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
            <SectionTitle sub="고객의 가입 조건을 입력하세요">입력</SectionTitle>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                월 납입액: {formatKRW(monthlyAmount)}
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
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                가입기간: {years}년
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              {!result.isNorengEligible && (
                <div className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50/60 border border-amber-200 rounded-sm p-2">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>가입기간 10년 미만은 노란우산 노령급부 조건 미충족. 임의해약(별표3) 시 환급률 낮음.</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                소득금액 구간 (절세 계산용)
              </label>
              <select
                value={bracketId}
                onChange={(e) => setBracketId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-amber-500"
              >
                {INCOME_BRACKETS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                연금저축 세액공제율 자동 분기: 4천만 이하 16.5%, 그 외 13.2%
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                가정 이율
              </div>
              <div>
                <label className="block text-xs text-slate-700 mb-1">
                  노란우산공제: {yumamRate.toFixed(1)}%
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={yumamRate}
                  onChange={(e) => setYumamRate(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-700 mb-1">
                  일반 적금: {savingsRate.toFixed(1)}%
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="6.0"
                  step="0.1"
                  value={savingsRate}
                  onChange={(e) => setSavingsRate(Number(e.target.value))}
                  className="w-full accent-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-700 mb-1">
                  연금저축: {pensionRate.toFixed(1)}%
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="6.0"
                  step="0.1"
                  value={pensionRate}
                  onChange={(e) => setPensionRate(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 p-3 bg-amber-50/40 border border-amber-200 rounded-sm cursor-pointer">
              <input
                type="checkbox"
                checked={withIncentive}
                onChange={(e) => setWithIncentive(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-amber-600"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900">
                  지자체 가입(희망)장려금 포함
                </div>
                <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  월 {formatKRW(incentiveMonthly)} × 1년 적립 후 연복리. 임의해약 시 미지급/감액 위험.
                </div>
                {withIncentive && (
                  <input
                    type="range"
                    min="10000"
                    max="30000"
                    step="10000"
                    value={incentiveMonthly}
                    onChange={(e) => {
                      e.stopPropagation();
                      setIncentiveMonthly(Number(e.target.value));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full mt-2 accent-amber-600"
                  />
                )}
              </div>
            </label>
          </div>

          <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline-block mr-1 text-blue-600" />
            노란우산공제·연금저축은 연단위 복리 적립식 + 매월 평균 6개월 추가 적립 보정. 적금은 매월 단리. 모든 결과는 세전 추정치이며 ±5~10% 편차 가능.
          </div>
        </div>

        {/* 결과부 */}
        <div className="lg:col-span-3 space-y-4">
          {/* 헤더 — 입력 요약 */}
          <div className="bg-slate-900 text-white rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
              가입 조건
            </div>
            <div className="text-sm text-slate-300">
              월 <strong className="text-white">{formatKRW(monthlyAmount)}</strong> × {years}년 = 총 납부원금{" "}
              <strong className="text-amber-300">{formatKRW(result.totalPrincipal)}</strong>
            </div>
          </div>

          {/* 상품별 카드 3종 */}
          <div className="space-y-2.5">
            {result.products.map((p) => (
              <ProductCard
                key={p.key}
                data={p}
                isBest={p.key === result.best.key}
              />
            ))}
          </div>

          {/* 인쇄 */}
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>상담 자료 인쇄</span>
            <span className="text-[11px] font-normal text-slate-300 hidden sm:inline">
              PDF 저장 가능 · 비교표 + 디스클레이머 포함
            </span>
          </button>

          {/* 차트 — 원금 제외, 순 혜택만 비교 (세전 기준) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              {years}년 후 순 혜택 비교 (원금 제외 · 세전 기준)
            </h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#44403c" }} interval={0} angle={-12} textAnchor="end" height={70} />
                <YAxis tickFormatter={(v) => formatKRWShort(v)} tick={{ fontSize: 10, fill: "#78716c" }} />
                <Tooltip formatter={(v) => formatKRW(v)} contentStyle={{ fontSize: 12, borderRadius: 4, border: "1px solid #e7e5e4" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="이자수익" stackId="a" fill="#f59e0b" />
                <Bar dataKey="절세액" stackId="a" fill="#10b981" />
                <Bar dataKey="장려금" stackId="a" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              원금은 모든 상품 동일하므로 제외. 막대 높이 = 「이자수익 + 절세액 + 장려금」 (세전). 수령 시 과세 별도.
            </p>
          </div>

          {/* 노란우산 차별점 카드 */}
          <div className="bg-amber-50/40 border border-amber-200 rounded-xl p-4">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              노란우산만의 차별점 (수치 외 영업 포인트)
            </h4>
            <div className="space-y-2 text-xs">
              <DiffRow icon={Lock} title="공제금 수급권 보호">
                양도·압류·담보 금지 (중협법 §119). 채무·소송 위험 자산 보호.
              </DiffRow>
              <DiffRow icon={Coins} title="공제계약 대출">
                해약환급금 범위 내 무담보 대출. 일시 자금 시 해약 대신 유지 가능.
              </DiffRow>
              <DiffRow icon={Heart} title="무료 단체상해보험">
                자동 가입. 월부금의 최대 150배 (750만~1.5억) 상해 보장.
              </DiffRow>
              <DiffRow icon={Calendar} title="복지플러스">
                건강검진 20~50% 할인 / 여행·숙박 50~70% 할인 / 무료 경영교육·법무·세무 자문.
              </DiffRow>
            </div>
          </div>

          {/* 수령 단계 비교 표 */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              수령 단계·과세 비교
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-2 px-1 font-bold text-slate-600">항목</th>
                    <th className="py-2 px-2 font-bold text-amber-700">노란우산</th>
                    <th className="py-2 px-2 font-bold text-slate-600">적금</th>
                    <th className="py-2 px-2 font-bold text-blue-700">연금저축</th>
                  </tr>
                </thead>
                <tbody className="text-slate-800">
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-1 font-semibold">수령 시기</td>
                    <td className="py-2 px-2">사유 발생 시</td>
                    <td className="py-2 px-2">만기 일시금</td>
                    <td className="py-2 px-2">만 55세+ 연금</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-1 font-semibold">정상 과세</td>
                    <td className="py-2 px-2">퇴직소득세 (5~15%)</td>
                    <td className="py-2 px-2">이자소득세 15.4%</td>
                    <td className="py-2 px-2">연금소득세 3.3~5.5%</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-1 font-semibold">중도해지 과세</td>
                    <td className="py-2 px-2">기타소득세 16.5%</td>
                    <td className="py-2 px-2">동일</td>
                    <td className="py-2 px-2 text-red-600 font-semibold">기타소득세 16.5% ⚠</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-1 font-semibold">압류 보호</td>
                    <td className="py-2 px-2 text-emerald-700 font-bold">✓ 양도·압류·담보 금지</td>
                    <td className="py-2 px-2 text-slate-500">없음</td>
                    <td className="py-2 px-2 text-slate-500">없음</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-1 font-semibold">담보 대출</td>
                    <td className="py-2 px-2 text-emerald-700 font-bold">✓ 무담보</td>
                    <td className="py-2 px-2 text-slate-500">예적금담보 가능</td>
                    <td className="py-2 px-2 text-slate-500">제한적</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <SalesScript accent="amber" {...script} />

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">계산 가정:</strong> 노란우산 만기 = 노령급부 도달(만 60세+120개월)·별표1 기준이율 부리적립. 퇴직소득세 8.8% 추정(실제 5~15%). 연금저축 = 적립식 미래가치, 세액공제율은 소득구간 분기, 연금소득세 5.5% 추정. 적금 = 매월 단리, 이자소득세 15.4%. 가입(희망)장려금은 첫 1년 적립 후 가정이율 복리. 모두 추정치이며 실제 상품의 약관·이율·수령 단계 과세는 직접 확인 필요.
          </div>
        </div>
      </div>

      {/* 인쇄용 — 2페이지 양식 (페이지 1: 비교표 + 차트 / 페이지 2: 차별점 + 수령단계) */}
      <ProductComparePrint
        monthlyAmount={monthlyAmount}
        years={years}
        bracket={bracket}
        yumamRate={yumamRate}
        savingsRate={savingsRate}
        pensionRate={pensionRate}
        withIncentive={withIncentive}
        incentiveMonthly={incentiveMonthly}
        result={result}
        chartData={chartData}
      />
    </div>
  );
};

/* 상품별 카드 — RefundSimulator의 CaseCard 스타일 */
const ProductCard = ({ data, isBest }) => {
  const palette = {
    amber: { bg: "bg-amber-50/50", border: "border-amber-300", accent: "text-amber-700" },
    stone: { bg: "bg-slate-50", border: "border-slate-200", accent: "text-slate-600" },
    blue: { bg: "bg-blue-50/40", border: "border-blue-300", accent: "text-blue-700" },
  };
  const c = palette[data.color] || palette.stone;
  const Icon = data.icon;

  return (
    <div
      className={cn(
        "border-2 rounded-xl p-4 transition-colors",
        isBest ? "bg-emerald-50 border-emerald-400" : `${c.bg} ${c.border}`
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", isBest ? "text-emerald-700" : c.accent)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <h4 className="text-base font-bold text-slate-900">{data.name}</h4>
              {isBest && (
                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-sm">
                  <Sparkles className="w-2.5 h-2.5" />
                  가장 유리
                </span>
              )}
              {data.warning && (
                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-red-700 bg-red-100 border border-red-300 px-1.5 py-0.5 rounded-sm">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  조건 미충족
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">{data.scenario}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/70">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
            만기 적립금 (세전)
          </div>
          <div className="text-lg font-black text-slate-900 tracking-tight">
            {formatKRW(data.fv)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
            {data.taxSavingLabel}
          </div>
          <div className={cn("text-lg font-black tracking-tight", data.taxSaving > 0 ? "text-emerald-700" : "text-slate-400")}>
            {data.taxSaving > 0 ? formatKRW(data.taxSaving) : "—"}
          </div>
        </div>
        {data.incentive > 0 && (
          <div className="col-span-2 pt-3 border-t border-slate-200/70">
            <div className="text-[10px] uppercase tracking-wider text-violet-700 font-bold mb-0.5">
              가입(희망)장려금 적립
            </div>
            <div className="text-base font-bold text-violet-700">
              {formatKRW(data.incentive)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-baseline justify-between gap-3">
        <span className="text-xs text-slate-600">총 혜택 합계 (세전 + 절세 + 장려)</span>
        <span className={cn("text-xl font-black tracking-tight", isBest ? "text-emerald-700" : "text-slate-900")}>
          {formatKRW(data.total)}
        </span>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 leading-relaxed">
        <span className="font-semibold text-slate-700">수령 시 과세:</span> {data.taxNote}
      </div>
    </div>
  );
};

const DiffRow = ({ icon: Icon, title, children }) => (
  <div className="flex items-start gap-2.5">
    <Icon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <span className="font-bold text-slate-900">{title}</span>
      <span className="text-slate-700"> — {children}</span>
    </div>
  </div>
);

/* ProductCompare 전용 인쇄 양식 — 2페이지 구조
   페이지 1: 가입 조건 + 4컬럼 비교 표 + 차트
   페이지 2: 차별점 + 수령 단계 + 디스클레이머·법령 근거 */
const ProductComparePrint = ({
  monthlyAmount,
  years,
  bracket,
  yumamRate,
  savingsRate,
  pensionRate,
  withIncentive,
  incentiveMonthly,
  result,
  chartData,
}) => {
  const now = new Date();
  const printedAt = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}. ${String(now.getDate()).padStart(2, "0")}. ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const totalPctBest = (((result.best.total - result.totalPrincipal) / result.totalPrincipal) * 100).toFixed(1);

  return (
    <div
      className="hidden print:block print-report bg-white text-slate-900"
      style={{ fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}
      aria-hidden="true"
    >
      {/* ===== 페이지 1 ===== */}
      <div style={{ pageBreakAfter: "always" }}>
        <div className="px-2 py-2 max-w-4xl mx-auto leading-snug">
          {/* 헤더 */}
          <div className="border-b-2 border-slate-900 pb-2 mb-3">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                {/* uppercase를 적용하면 「iM뱅크」가 「IM뱅크」로 출력된다 */}
                <div className="text-[9px] tracking-widest text-slate-500 font-bold">
                  노란우산공제 상담 자료 · iM뱅크
                </div>
                <h1 className="text-base font-black text-slate-900 mt-0.5 leading-tight">
                  가입 시 상품 비교 안내
                </h1>
                <p className="text-[11px] text-slate-700 mt-0.5">
                  노란우산공제 vs 일반 적금 vs 연금저축 · 월 {formatKRW(monthlyAmount)} × {years}년
                </p>
              </div>
              <div className="text-right text-[9px] text-slate-500 leading-snug flex-shrink-0">
                <div>인쇄일시: {printedAt}</div>
                <div>page 1 / 2</div>
                <div className="mt-1.5">상담 점포 · 담당자</div>
                <div className="ml-auto mt-0.5 h-3 w-28 border-b border-slate-400" />
              </div>
            </div>
          </div>

          {/* 디스클레이머 (간략) */}
          <div className="border border-amber-600 bg-amber-50 rounded-sm p-2 mb-3 break-inside-avoid">
            <div className="flex items-start gap-1.5">
              <span className="text-sm leading-none mt-0.5">⚠</span>
              <div className="flex-1 text-[10px] text-slate-900 leading-snug">
                <strong className="text-amber-900">본 안내는 추정치이며 모두 세전 기준입니다.</strong> 수령 시 과세(상품별로 퇴직소득세 / 이자소득세 15.4% / 연금소득세)는 가입자 다른 소득·근속·소득공제 등에 따라 변수가 많아 별도 차감하지 않았습니다. 정확한 실수령액은 중앙회 시스템(1666-9988) + 세무 전문가 상담으로 확인해 주세요.
                {!result.isNorengEligible && (
                  <span className="block mt-1 text-amber-900">
                    ⚠ 가입기간 10년 미만 — 노란우산 노령급부 조건 미충족
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 입력 조건 — 한 줄 압축 */}
          <section className="mb-3 break-inside-avoid">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-0.5 mb-1.5">
              가입 조건
            </h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10.5px]">
              <PRow label="월 납입액" value={formatKRW(monthlyAmount)} />
              <PRow label="가입(투자) 기간" value={`${years}년`} />
              <PRow label="소득금액 구간" value={bracket.rangeText} />
              <PRow label="가정 이율 (노란우산)" value={`${yumamRate.toFixed(1)}% 연복리`} />
              <PRow label="가정 이율 (적금)" value={`${savingsRate.toFixed(1)}% 단리`} />
              <PRow
                label="가정 이율 (연금저축)"
                value={`${pensionRate.toFixed(1)}% (세액공제 ${(result.pensionCreditRate * 100).toFixed(1)}%)`}
              />
              {withIncentive && (
                <PRow
                  label="가입장려금"
                  value={`월 ${formatKRW(incentiveMonthly)} × 12회 + 연복리`}
                />
              )}
              <PRow label="총 납부 원금" value={formatKRW(result.totalPrincipal)} emphasis />
            </div>
          </section>

          {/* 4컬럼 비교 표 */}
          <section className="mb-3 break-inside-avoid">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-0.5 mb-1.5">
              상품별 비교 (모두 세전 기준 — 수령 시 과세 별도)
            </h2>
            <table className="w-full text-[10px] border border-slate-300">
              <thead className="bg-slate-100 border-b-2 border-slate-400">
                <tr>
                  <th className="px-1.5 py-1 text-left font-bold text-slate-700 w-1/5">항목</th>
                  {result.products.map((p) => (
                    <th
                      key={p.key}
                      className={cn(
                        "px-1.5 py-1 text-right font-bold leading-tight",
                        p.key === result.best.key
                          ? "bg-amber-100 text-amber-900"
                          : "text-slate-700"
                      )}
                    >
                      {p.name}
                      {p.key === result.best.key && <span className="block text-[8px] mt-0.5">★ 가장 유리</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-1.5 py-1 text-slate-600 font-semibold">만기 적립금 (세전)</td>
                  {result.products.map((p) => (
                    <td
                      key={p.key}
                      className={cn(
                        "px-1.5 py-1 text-right tabular-nums",
                        p.key === result.best.key ? "bg-amber-50 font-bold text-amber-900" : "text-slate-900"
                      )}
                    >
                      {formatKRW(p.fv)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-1.5 py-1 text-slate-600 font-semibold">절세·세액공제</td>
                  {result.products.map((p) => (
                    <td
                      key={p.key}
                      className={cn(
                        "px-1.5 py-1 text-right tabular-nums",
                        p.key === result.best.key ? "bg-amber-50" : "",
                        p.taxSaving === 0 ? "text-slate-400" : "text-emerald-700 font-semibold"
                      )}
                    >
                      {p.taxSaving > 0 ? formatKRW(p.taxSaving) : "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-1.5 py-1 text-slate-600 font-semibold">가입장려금</td>
                  {result.products.map((p) => (
                    <td
                      key={p.key}
                      className={cn(
                        "px-1.5 py-1 text-right tabular-nums",
                        p.key === result.best.key ? "bg-amber-50" : "",
                        p.incentive === 0 ? "text-slate-400" : "text-violet-700 font-semibold"
                      )}
                    >
                      {p.incentive > 0 ? formatKRW(p.incentive) : "—"}
                    </td>
                  ))}
                </tr>
                <tr className="border-t-2 border-slate-400 bg-slate-50">
                  <td className="px-1.5 py-1.5 text-slate-700 font-bold">총 혜택 합계</td>
                  {result.products.map((p) => (
                    <td
                      key={p.key}
                      className={cn(
                        "px-1.5 py-1.5 text-right tabular-nums font-black",
                        p.key === result.best.key
                          ? "bg-amber-200 text-amber-900 text-[12px]"
                          : "text-slate-900"
                      )}
                    >
                      {formatKRW(p.total)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-1.5 py-0.5 text-slate-500 text-[8.5px]">원금 대비</td>
                  {result.products.map((p) => {
                    const pct = (((p.total - result.totalPrincipal) / result.totalPrincipal) * 100).toFixed(1);
                    return (
                      <td
                        key={p.key}
                        className={cn(
                          "px-1.5 py-0.5 text-right text-[9px] tabular-nums",
                          p.key === result.best.key ? "bg-amber-50 font-bold" : "",
                          p.total < result.totalPrincipal ? "text-red-600" : "text-emerald-700"
                        )}
                      >
                        {p.total >= result.totalPrincipal ? "+" : ""}{pct}%
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="px-1.5 py-1 text-slate-500 align-top text-[8.5px]">시나리오</td>
                  {result.products.map((p) => (
                    <td
                      key={p.key}
                      className={cn(
                        "px-1.5 py-1 text-[8.5px] text-slate-600 leading-tight",
                        p.key === result.best.key ? "bg-amber-50" : ""
                      )}
                    >
                      {p.scenario}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-1.5 py-1 text-slate-500 align-top text-[8.5px]">수령 시 과세</td>
                  {result.products.map((p) => (
                    <td
                      key={p.key}
                      className={cn(
                        "px-1.5 py-1 text-[8.5px] text-slate-600 leading-tight",
                        p.key === result.best.key ? "bg-amber-50" : ""
                      )}
                    >
                      {p.taxNote}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <p className="text-[10px] text-amber-900 font-bold mt-1.5 leading-snug">
              💡 가장 유리한 상품 (세전): 「{result.best.name}」 — 총 혜택 약 {formatKRW(result.best.total)}{" "}
              (납부원금 대비 +{totalPctBest}%)
            </p>
          </section>

          {/* 차트 */}
          <section className="break-inside-avoid">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-0.5 mb-1.5">
              순 혜택 시각 비교 (원금 제외 · 세전)
            </h2>
            <div className="flex justify-center">
              <BarChart
                width={560}
                height={170}
                data={chartData}
                margin={{ top: 5, right: 15, bottom: 25, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "#44403c" }}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                />
                <YAxis
                  tickFormatter={(v) => formatKRWShort(v)}
                  tick={{ fontSize: 8, fill: "#78716c" }}
                  width={55}
                />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Bar dataKey="이자수익" stackId="a" fill="#f59e0b" />
                <Bar dataKey="절세액" stackId="a" fill="#10b981" />
                <Bar dataKey="장려금" stackId="a" fill="#8b5cf6" />
              </BarChart>
            </div>
          </section>
        </div>
      </div>

      {/* ===== 페이지 2 ===== */}
      <div>
        <div className="px-2 py-2 max-w-4xl mx-auto leading-snug">
          {/* 헤더 (간략) */}
          <div className="border-b-2 border-slate-900 pb-2 mb-3">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <div className="text-[9px] tracking-widest text-slate-500 font-bold">
                  노란우산공제 상담 자료 · iM뱅크
                </div>
                <h1 className="text-base font-black text-slate-900 mt-0.5 leading-tight">
                  노란우산만의 차별점 · 수령 단계 비교
                </h1>
              </div>
              <div className="text-right text-[9px] text-slate-500 leading-snug flex-shrink-0">
                <div>인쇄일시: {printedAt}</div>
                <div>page 2 / 2</div>
              </div>
            </div>
          </div>

          {/* 차별점 4종 */}
          <section className="mb-3 break-inside-avoid">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-0.5 mb-1.5">
              노란우산만의 차별점 (수치 외 영업 포인트)
            </h2>
            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <PrintDiff title="공제금 수급권 보호">
                양도·압류·담보 모두 금지 (중협법 §119). 채무·소송 위험에서 자산 보호.
              </PrintDiff>
              <PrintDiff title="공제계약 대출">
                해약환급금 범위 내 무담보. 일시 자금 시 해약 대신 유지 가능.
              </PrintDiff>
              <PrintDiff title="무료 단체상해보험">
                자동 가입. 월부금 최대 150배 (750만 ~ 1.5억) 상해 보장.
              </PrintDiff>
              <PrintDiff title="복지플러스">
                건강검진 20~50% 할인 · 여행 50~70% 할인 · 무료 경영·세무·법무 자문.
              </PrintDiff>
            </div>
          </section>

          {/* 수령 단계 비교 표 */}
          <section className="mb-3 break-inside-avoid">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-0.5 mb-1.5">
              수령 단계 · 과세 · 보호 비교
            </h2>
            <table className="w-full text-[10px] border border-slate-300">
              <thead className="bg-slate-100 border-b-2 border-slate-400">
                <tr>
                  <th className="px-1.5 py-1 text-left font-bold text-slate-700">항목</th>
                  <th className="px-1.5 py-1 text-left font-bold text-amber-700">노란우산</th>
                  <th className="px-1.5 py-1 text-left font-bold text-slate-700">일반 적금</th>
                  <th className="px-1.5 py-1 text-left font-bold text-blue-700">연금저축</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr>
                  <td className="px-1.5 py-1 font-semibold">수령 시기</td>
                  <td className="px-1.5 py-1">사유 발생 시</td>
                  <td className="px-1.5 py-1">만기 일시금</td>
                  <td className="px-1.5 py-1">만 55세+ 연금</td>
                </tr>
                <tr>
                  <td className="px-1.5 py-1 font-semibold">정상 과세</td>
                  <td className="px-1.5 py-1">퇴직소득세 (5~15%)</td>
                  <td className="px-1.5 py-1">이자소득세 15.4%</td>
                  <td className="px-1.5 py-1">연금소득세 3.3~5.5%</td>
                </tr>
                <tr>
                  <td className="px-1.5 py-1 font-semibold">중도해지 과세</td>
                  <td className="px-1.5 py-1">기타소득세 16.5%</td>
                  <td className="px-1.5 py-1">동일</td>
                  <td className="px-1.5 py-1 text-red-600 font-semibold">기타소득세 16.5% ⚠</td>
                </tr>
                <tr>
                  <td className="px-1.5 py-1 font-semibold">압류 보호</td>
                  <td className="px-1.5 py-1 text-emerald-700 font-bold">✓ 양도·압류·담보 금지</td>
                  <td className="px-1.5 py-1 text-slate-500">없음</td>
                  <td className="px-1.5 py-1 text-slate-500">없음</td>
                </tr>
                <tr>
                  <td className="px-1.5 py-1 font-semibold">담보 대출</td>
                  <td className="px-1.5 py-1 text-emerald-700 font-bold">✓ 무담보</td>
                  <td className="px-1.5 py-1 text-slate-500">예적금담보 가능</td>
                  <td className="px-1.5 py-1 text-slate-500">제한적</td>
                </tr>
                <tr>
                  <td className="px-1.5 py-1 font-semibold">소득공제·세액공제</td>
                  <td className="px-1.5 py-1 text-emerald-700 font-bold">소득공제 최대 600만</td>
                  <td className="px-1.5 py-1 text-slate-500">없음</td>
                  <td className="px-1.5 py-1 text-emerald-700">세액공제 13.2~16.5%</td>
                </tr>
                <tr>
                  <td className="px-1.5 py-1 font-semibold">부가서비스</td>
                  <td className="px-1.5 py-1 text-emerald-700 font-bold">단체상해보험 + 복지플러스</td>
                  <td className="px-1.5 py-1 text-slate-500">없음</td>
                  <td className="px-1.5 py-1 text-slate-500">없음</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 상세 디스클레이머·법령 근거 */}
          <section className="mb-3 break-inside-avoid text-[10px] text-slate-800 leading-snug space-y-1">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-0.5 mb-1.5">
              참고 사항
            </h2>
            <p>
              · 모든 금액은 <strong>세전 기준</strong>입니다. 수령 시 과세는 상품별로 다르며 (퇴직소득세 / 이자소득세 / 연금소득세), 가입자의 다른 소득·근속·소득공제 등에 따라 변수가 많아 본 시뮬에서는 별도 차감하지 않았습니다.
            </p>
            <p>
              · 노란우산 = 폐업·법인해산·사망공제금 가정 시 별표1 차등지급이율(15년간 기준이율 +0.3%) 적용. 수령 시 퇴직소득세 별도.
            </p>
            <p>
              · 노란우산 노령급부 도달 시 = 별표1 기준이율 부리적립 (가산 없음). 수령 시 퇴직소득세 별도.
            </p>
            <p>
              · 적금 = 매월 단리 (P × r × N(N+1)/(2×12)). 수령 시 이자소득세 15.4% 원천징수.
            </p>
            <p>
              · 연금저축 = 적립식 미래가치. 만 55세+ 연금 수령 시 연금소득세 / 중도 해지 시 기타소득세 16.5%.
            </p>
            <p>
              · 가입(희망)장려금은 가입일로부터 1년간(최대 12회) 월별 적립 후 수령 시까지 연복리 부리. 임의해약 시 미지급/감액 위험.
            </p>
            <p>
              · 적금·연금저축 이율은 상품·시점에 따라 상이하므로 실제 가입 상품의 약관·이율을 직접 확인해야 합니다.
            </p>
          </section>

          {/* 푸터 */}
          <div className="border-t-2 border-slate-900 pt-1.5 mt-2 text-[9.5px] text-slate-700 leading-snug space-y-0.5 break-inside-avoid">
            <p>
              <strong className="text-slate-900">법령 근거:</strong> 조세특례제한법 제86조의3 · 중소기업협동조합법 제115조·제119조 · 약관 별표1·별표2·별표3
            </p>
            <p>
              <strong className="text-slate-900">출처:</strong> 소기업·소상공인공제 약관(2026.7.1 시행), 조세특례제한법(법률 2025.7.1 시행 / 시행령 2026.2.27 시행), 중소기업협동조합법(제121조의2 2026.6.3 시행)
            </p>
            <p>
              <strong className="text-slate-900">문의:</strong> 중소기업중앙회 노란우산공제 1666-9988 · https://www.8899.or.kr/
            </p>
            <p className="text-slate-500 mt-1">
              본 자료는 iM뱅크 영업점 직원이 고객 상담 시 참고용으로 제공하는 추정 안내입니다. 실제 공제금·환급금·세액·이율은 다른 소득공제 항목, 추가 소득, 시점, 세법 개정, 분기별 기준이율 변동 등에 따라 달라질 수 있으니 정확한 금액은 중앙회 시스템 조회 결과로 확인해 주시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PRow = ({ label, value, emphasis }) => (
  <>
    <div className={cn("text-slate-600", emphasis && "font-bold text-slate-900")}>{label}</div>
    <div className={cn("text-right text-slate-900 font-semibold tabular-nums", emphasis && "text-amber-900 font-black")}>
      {value}
    </div>
  </>
);

const PrintDiff = ({ title, children }) => (
  <div className="border border-amber-300 bg-amber-50/50 rounded-sm p-2">
    <div className="font-bold text-amber-900 mb-0.5">{title}</div>
    <div className="text-slate-700 leading-snug">{children}</div>
  </div>
);
