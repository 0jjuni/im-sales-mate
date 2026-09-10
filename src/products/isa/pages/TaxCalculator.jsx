import { MobileResult } from "@shared/components/MobileResult";
import { useState, useMemo } from "react";
import { Percent, Info, Printer, PiggyBank, LineChart } from "lucide-react";
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
import { ISA_TYPES, ISA_RULES, ISA_DEPOSIT_DEFAULTS } from "../data/isa";
import { SectionTitle } from "@shared/components/SectionTitle";
import { NumberSync } from "@shared/components/NumberSync";
import { PrintReport } from "@shared/components/PrintReport";
import { PrintPreviewModal } from "@shared/components/PrintPreviewModal";
import { SalesScript } from "@shared/components/SalesScript";
import { ISA_PRINT_META } from "../printMeta";
import { cn, formatKRW, formatKRWShort } from "@shared/lib/format";

/* ISA 세제 절세효과 계산기.
   은행 ISA는 예금 예치가 많아 「예금 기준」 모드를 기본으로 한다:
   원금·금리·기간으로 이자를 산정 → ISA 예금 vs 일반 예금의 세부담·세후 수익 (원금 제외)을 비교.
   「순이익 직접입력」 모드는 펀드 등 투자상품용(계좌 내 손익통산 후 순이익 직접 입력). */
export const TaxCalculator = () => {
  const [showPrint, setShowPrint] = useState(false);
  const [mode, setMode] = useState("deposit"); // deposit | profit
  const [typeId, setTypeId] = useState("general");
  // 예금 모드 입력 — 적립식(매년 납입) / 거치식(목돈을 정기예금으로 예치) 선택
  const [depositStyle, setDepositStyle] = useState("recurring"); // recurring | lump
  const [annual, setAnnual] = useState(ISA_RULES.annualLimit); // 적립식: 연 납입액(연 2천 한도)
  const [lump, setLump] = useState(ISA_RULES.annualLimit); // 거치식: 예치 목돈
  const [rate, setRate] = useState(ISA_DEPOSIT_DEFAULTS.rate);
  const [years, setYears] = useState(ISA_DEPOSIT_DEFAULTS.years);
  // 순이익 직접입력 모드
  const [directProfit, setDirectProfit] = useState(4_000_000);

  const type = ISA_TYPES.find((t) => t.id === typeId);
  const isDeposit = mode === "deposit";
  const isLump = isDeposit && depositStyle === "lump";

  const result = useMemo(() => {
    // 예금(적립식): 연 납입액을 매년 초 넣고 월복리로 만기까지 굴린다.
    // ISA는 연 2,000만원·총 1억원 한도라, 목돈 일시납이 아니라 매년 납입을 반영한다.
    const monthlyRate = rate / 100 / 12;
    let totalContributed = 0;
    let interest = 0;
    let wonYears = 0; // 원금×예치연수 합 — 실효금리 연환산용
    if (isLump) {
      // 거치식: 목돈을 정기예금으로 넣고 만기까지 그대로 굴린다(신규 첫 예치 = 연 2천 한도 내)
      totalContributed = Math.min(lump, ISA_RULES.annualLimit);
      interest = totalContributed * (Math.pow(1 + monthlyRate, years * 12) - 1);
      wonYears = totalContributed * years;
    } else {
      // 적립식: 연 납입액을 매년 초 넣고, 각 회차가 만기까지 남은 기간만큼 굴러간다
      for (let k = 0; k < years; k++) {
        const room = ISA_RULES.totalLimit - totalContributed;
        const c = Math.max(Math.min(annual, room), 0);
        if (c <= 0) break;
        totalContributed += c;
        interest += c * (Math.pow(1 + monthlyRate, (years - k) * 12) - 1);
        wonYears += c * (years - k);
      }
    }
    const netProfit = isDeposit ? interest : directProfit;

    const taxFreeLimit = type.taxFreeLimit;
    const taxableInIsa = Math.max(netProfit - taxFreeLimit, 0);
    const isaTax = taxableInIsa * ISA_RULES.isaTaxRate;
    const normalTax = netProfit * ISA_RULES.normalTaxRate;
    const saving = normalTax - isaTax;
    const isaNet = netProfit - isaTax;
    const normalNet = netProfit - normalTax;

    // 세후 실효 연금리 — 적립식은 납입 시점이 달라, 원금×예치연수(wonYears)로 연환산
    const isaEffRate = isDeposit && wonYears > 0 ? (isaNet / wonYears) * 100 : null;
    const normalEffRate = isDeposit && wonYears > 0 ? (normalNet / wonYears) * 100 : null;

    const chartData = isDeposit
      ? [
          { name: "일반예금 세후이자", value: normalNet, fill: "#94a3b8" },
          { name: "ISA예금 세후이자", value: isaNet, fill: "#c026d3" },
        ]
      : [
          { name: "일반계좌 세금", value: normalTax, fill: "#94a3b8" },
          { name: "ISA 세금", value: isaTax, fill: "#c026d3" },
          { name: "추정 절세액", value: saving, fill: "#d946ef" },
        ];

    return {
      interest,
      totalContributed,
      netProfit,
      taxFreeLimit,
      taxableInIsa,
      isaTax,
      normalTax,
      saving,
      isaNet,
      normalNet,
      isaEffRate,
      normalEffRate,
      isaEffective: netProfit > 0 ? isaTax / netProfit : 0,
      chartData,
    };
  }, [isDeposit, isLump, type, annual, lump, rate, years, directProfit]);

  /* 고객에게 실제로 할 수 있는 말. 예금 모드는 「같은 예금인데 세금이 다르다」가 핵심. */
  const script = useMemo(() => {
    const common = [
      {
        q: "3년 안에 깨면 어떻게 돼요?",
        a: "그때까지 감면받은 세금을 다시 내셔야 합니다. 다만 그동안 넣으신 원금 범위 안에서 빼시는 건 해지로 보지 않으니, 돈이 필요해지시면 해지 대신 인출을 먼저 검토하시면 됩니다.",
      },
      {
        q: "만기 되면 어떻게 되나요?",
        a: "만기 3개월 전부터 연장하실 수 있고, 연장하지 않으시면 현금으로 지급됩니다. 연금계좌로 옮기시면 옮긴 금액의 10%, 최대 300만원까지 세액공제 대상 납입한도가 추가됩니다. 실제 공제액은 해당 공제율을 적용해 계산합니다.",
      },
      {
        q: "누구나 가입할 수 있어요?",
        a: "만 19세 이상이면 되고, 근로소득이 있으면 15세부터도 됩니다. 다만 최근 3년 안에 금융소득종합과세 대상이 되신 적이 있으면 가입이 안 됩니다. 전 금융회사 통틀어 한 사람이 하나만 만들 수 있습니다.",
      },
    ];

    if (isDeposit) {
      return {
        opening: isLump
          ? `${formatKRW(lump)}을 ${years}년 정기예금으로 넣으셔도, ISA로 하시면 세금 ${formatKRW(
              result.saving
            )}을 안 내십니다.`
          : `연 ${formatKRW(annual)}씩 ${years}년(총 ${formatKRW(
              result.totalContributed
            )})을 예치하셔도, ISA로 하시면 세금 ${formatKRW(result.saving)}을 안 내십니다.`,
        detail: [
          `일반 예금은 이자에서 15.4%를 떼지만 ISA는 ${formatKRW(
            result.taxFreeLimit
          )}까지 세금이 없습니다. 그래서 손에 들어오는 이자가 ${formatKRW(
            result.normalNet
          )}에서 ${formatKRW(result.isaNet)}으로 늘어납니다.`,
          `금리로 바꿔 말씀드리면, 표면금리는 같은 ${rate.toFixed(
            1
          )}%인데 세금을 떼고 나면 실제로는 ${result.isaEffRate.toFixed(
            2
          )}%를 받으시는 셈입니다. 일반 예금은 ${result.normalEffRate.toFixed(2)}%입니다.`,
          "대신 3년은 유지하셔야 이 혜택이 유지됩니다. 그 안에 해지하시면 감면받은 세금을 다시 내셔야 합니다.",
        ],
        objections: [
          {
            q: "예금 금리는 일반 예금과 같아요?",
            a: "상품마다 다릅니다. ISA 안에 넣는 예금은 별도로 고시된 금리를 적용하고, 신탁형은 신탁보수가 따로 있습니다. 그래서 금리와 보수를 함께 보고 비교하셔야 정확합니다.",
          },
          ...common,
        ],
      };
    }

    return {
      opening: `이익이 ${formatKRW(
        result.netProfit
      )} 나셨다고 보면, 일반계좌에서는 세금이 ${formatKRW(
        result.normalTax
      )}인데 ISA에서는 ${formatKRW(result.isaTax)}입니다.`,
      detail: [
        `${formatKRW(
          result.taxFreeLimit
        )}까지는 세금이 없고 넘는 부분만 9.9%로 끝납니다. 일반계좌처럼 다른 소득과 합쳐서 세금을 매기지 않습니다.`,
        "ISA는 계좌 안의 손실과 이익을 합쳐 계산합니다. 일반계좌는 손실을 인정하지 않아서, 여러 상품을 함께 운용하실수록 차이가 커집니다.",
      ],
      objections: common,
    };
  }, [isDeposit, isLump, result, annual, lump, years, rate, type]);

  return (
    <div className="space-y-5">
      {/* 모드 토글 */}
      <div className="grid grid-cols-2 gap-2 print:hidden">
        {[
          { id: "deposit", label: "예금 기준", icon: PiggyBank, sub: "원금·금리·기간으로 비교" },
          { id: "profit", label: "순이익 직접입력", icon: LineChart, sub: "펀드 등 투자상품" },
        ].map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "flex items-center gap-2.5 p-3 border rounded-xl transition-all text-left",
                active
                  ? "bg-fuchsia-700 text-white border-fuchsia-700 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-fuchsia-400"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold">{m.label}</div>
                <div className={cn("text-[11px]", active ? "text-fuchsia-100" : "text-slate-500")}>
                  {m.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 print:hidden lg:items-start">
        {/* 입력부 */}
        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
            <SectionTitle sub="고객 조건을 입력하세요">입력</SectionTitle>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ISA 유형</label>
              <div className="grid grid-cols-2 gap-1.5">
                {ISA_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTypeId(t.id)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-sm border transition-colors",
                      typeId === t.id
                        ? "bg-fuchsia-700 text-white border-fuchsia-700 font-semibold"
                        : "bg-white text-slate-700 border-slate-300 hover:border-fuchsia-400"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                비과세 한도 {formatKRWShort(type.taxFreeLimit)} · {type.eligibility}
              </p>
            </div>

            {isDeposit ? (
              <>
                {/* 납입 방식 — 매년 적립 vs 목돈 거치 */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "recurring", label: "매년 납입", sub: "연 2천만원씩 적립" },
                    { id: "lump", label: "목돈 거치", sub: "정기예금으로 예치" },
                  ].map((o) => {
                    const active = depositStyle === o.id;
                    return (
                      <button
                        key={o.id}
                        onClick={() => setDepositStyle(o.id)}
                        className={cn(
                          "rounded-xl border p-2.5 text-left transition-all",
                          active
                            ? "bg-fuchsia-700 text-white border-fuchsia-700 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-fuchsia-400"
                        )}
                      >
                        <div className="text-[13px] font-bold">{o.label}</div>
                        <div className={cn("text-[11px]", active ? "text-fuchsia-100" : "text-slate-500")}>{o.sub}</div>
                      </button>
                    );
                  })}
                </div>

                {isLump ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      예치 목돈: {formatKRW(lump)}
                      <span className="ml-1 font-normal text-slate-400">연 2천만원 한도</span>
                    </label>
                    <input
                      type="range"
                      min="1000000"
                      max={ISA_RULES.annualLimit}
                      step="1000000"
                      value={lump}
                      onChange={(e) => setLump(Number(e.target.value))}
                      className="w-full accent-fuchsia-600"
                    />
                    <NumberSync label="예치 목돈" value={lump} onChange={setLump} min={1000000} max={ISA_RULES.annualLimit} step={1000000} accent="fuchsia" suffix="원" />
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>100만원</span>
                      <span>1천만원</span>
                      <span>2천만원</span>
                    </div>
                    <div className="mt-1.5 rounded-sm bg-fuchsia-50 px-2.5 py-1.5 text-[11.5px] font-semibold text-fuchsia-800">
                      {formatKRW(result.totalContributed)}을 {years}년 정기예금 거치 · 첫해 납입한도 2천만원 내
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      연 납입액: {formatKRW(annual)}
                      <span className="ml-1 font-normal text-slate-400">연 2천만원 한도</span>
                    </label>
                    <input
                      type="range"
                      min="1000000"
                      max={ISA_RULES.annualLimit}
                      step="1000000"
                      value={annual}
                      onChange={(e) => setAnnual(Number(e.target.value))}
                      className="w-full accent-fuchsia-600"
                    />
                    <NumberSync label="연 납입액" value={annual} onChange={setAnnual} min={1000000} max={ISA_RULES.annualLimit} step={1000000} accent="fuchsia" suffix="원" />
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>100만원</span>
                      <span>1천만원</span>
                      <span>2천만원</span>
                    </div>
                    <div className="mt-1.5 rounded-sm bg-fuchsia-50 px-2.5 py-1.5 text-[11.5px] font-semibold text-fuchsia-800">
                      {years}년간 총 {formatKRW(result.totalContributed)} 납입 (총 1억원 한도)
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    예금 연 금리: {rate.toFixed(1)}%
                  </label>
                  <input
                    type="range"
                    min={ISA_DEPOSIT_DEFAULTS.rateMin}
                    max={ISA_DEPOSIT_DEFAULTS.rateMax}
                    step={ISA_DEPOSIT_DEFAULTS.rateStep}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full accent-fuchsia-600"
                  />
                  <NumberSync label="예금 연 금리" value={rate} onChange={setRate} min={ISA_DEPOSIT_DEFAULTS.rateMin} max={ISA_DEPOSIT_DEFAULTS.rateMax} step={ISA_DEPOSIT_DEFAULTS.rateStep} accent="fuchsia" suffix="%" />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>{ISA_DEPOSIT_DEFAULTS.rateMin.toFixed(1)}%</span>
                    <span>{ISA_DEPOSIT_DEFAULTS.rateMax.toFixed(1)}%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    예치 기간
                    <span className="ml-1 font-normal text-slate-400">의무가입 3년 이상</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[3, 4, 5].map((y) => (
                      <button
                        key={y}
                        onClick={() => setYears(y)}
                        className={cn(
                          "px-3 py-2 text-sm rounded-sm border transition-colors",
                          years === y
                            ? "bg-fuchsia-700 text-white border-fuchsia-700 font-semibold"
                            : "bg-white text-slate-700 border-slate-300 hover:border-fuchsia-400"
                        )}
                      >
                        {y}년
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    ISA 의무가입기간은 3년입니다(3년 경과 전 해지 시 세제 혜택 소멸). 월복리·만기일시지급 가정.
                  </p>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  예상 순이익 (손익통산 후): {formatKRW(directProfit)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="20000000"
                  step="500000"
                  value={directProfit}
                  onChange={(e) => setDirectProfit(Number(e.target.value))}
                  className="w-full accent-fuchsia-600"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>0</span>
                  <span>1천만원</span>
                  <span>2천만원</span>
                </div>
                <NumberSync value={directProfit} onChange={setDirectProfit} min={0} max={20000000} step={10000} suffix="원" label="예상 순이익" />
              </div>
            )}
          </div>

          <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline-block mr-1 text-blue-600" />
            {isDeposit
              ? "같은 예금을 ISA 안에서 예치할 때와 일반 예금으로 둘 때의 이자 세금을 비교합니다. 이자는 월복리·만기일시지급(iM뱅크 판매 ISA 정기예금 기준) 가정이며 신탁보수 차감 전입니다. 기본 금리는 설명서 고시(2025.3.7)의 12개월 약정이율 2.8%입니다."
              : "'순이익'은 계좌 내 이익·손실을 통산한 뒤의 금액입니다. 일반계좌는 손실을 인정받지 못하므로, 손실 상품이 있으면 ISA의 실제 절세폭은 더 커집니다."}
          </div>
        </div>

        {/* 결과부 */}
        <div id="isa-result" className="lg:col-span-3 space-y-4 scroll-mt-24">
          {/* 핵심 결과 — 추정 절세액 */}
          <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50/60 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-700">
                  추정 절세액 · {isDeposit ? "일반 예금 대비" : "일반계좌 대비"}
                </div>
                <div className="mt-1 text-[30px] sm:text-[38px] font-black leading-none tracking-tight text-fuchsia-700">
                  {formatKRW(result.saving)}
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                  {isDeposit
                    ? "같은 예금인데, ISA로 넣으면 세금을 이만큼 아낍니다."
                    : "같은 이익인데, ISA에서는 세부담이 이만큼 줄어듭니다."}
                </p>
              </div>
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-fuchsia-600 text-white shadow-sm">
                <Percent className="h-5 w-5" />
              </div>
            </div>
          </div>

          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{isDeposit ? `계산 가정: 연 ${rate}% 동일 금리 · ${years}년 유지 · 월복리 · 만기 과세 · 신탁보수 차감 전. 실제 상품의 금리와 보수에 따라 결과가 달라집니다.` : "과세 대상 수익을 같은 금액으로 가정한 간편 비교입니다. 상품별 과세 여부와 일반계좌의 손실 처리 차이는 반영하지 않습니다."}</p>
          {/* 일반 vs ISA — 나란히 비교 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-[12px] font-bold text-slate-500">
                {isDeposit ? "일반 예금" : "일반계좌"}
              </div>
              <div className="mt-3 space-y-2.5">
                <div>
                  <div className="text-[11px] text-slate-400">세금</div>
                  <div className="text-[19px] font-bold tabular-nums text-slate-900">
                    {formatKRW(result.normalTax)}
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-2.5">
                  <div className="text-[11px] text-slate-400">세후 수익 (원금 제외)</div>
                  <div className="text-[14px] font-semibold tabular-nums text-slate-600">
                    {formatKRW(result.normalNet)}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-xl border-2 border-fuchsia-400 bg-white p-4 shadow-sm">
              <span className="absolute -top-2 left-4 rounded-full bg-fuchsia-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
                {result.saving > 0 ? "추정 절세" : "세부담 동일"}
              </span>
              <div className="text-[12px] font-bold text-fuchsia-700">
                ISA {isDeposit ? "예금" : "계좌"}
              </div>
              <div className="mt-3 space-y-2.5">
                <div>
                  <div className="text-[11px] text-slate-400">세금</div>
                  <div className="text-[19px] font-bold tabular-nums text-fuchsia-700">
                    {formatKRW(result.isaTax)}
                  </div>
                </div>
                <div className="border-t border-fuchsia-100 pt-2.5">
                  <div className="text-[11px] text-slate-400">세후 수익 (원금 제외)</div>
                  <div className="text-[14px] font-semibold tabular-nums text-slate-900">
                    {formatKRW(result.isaNet)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 부가 지표 */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {isDeposit ? (
              <>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12px] text-slate-500">
                    예상 이자
                    <span className="ml-1 text-[11px] text-slate-400">
                      {isLump
                        ? `${formatKRWShort(lump)} 거치 · ${years}년`
                        : `연 ${formatKRWShort(annual)} × ${years}년`}{" "}
                      · 연 {rate.toFixed(1)}% · 월복리
                    </span>
                  </span>
                  <span className="flex-shrink-0 text-[15px] font-bold tabular-nums text-slate-900">
                    {formatKRW(result.interest)}
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 border-t border-slate-100 pt-3">
                  <span className="text-[12px] text-slate-500">세후 실효금리 (연)</span>
                  <span className="text-[13.5px] font-bold tabular-nums">
                    <span className="text-fuchsia-700">ISA {result.isaEffRate.toFixed(2)}%</span>
                    <span className="mx-1 text-slate-400">vs</span>
                    <span className="text-slate-500">일반 {result.normalEffRate.toFixed(2)}%</span>
                    <span className="ml-1.5 rounded bg-fuchsia-100 px-1.5 py-0.5 text-[12px] text-fuchsia-700">
                      +{(result.isaEffRate - result.normalEffRate).toFixed(2)}%p
                    </span>
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12px] text-slate-500">비과세 한도</span>
                  <span className="text-[15px] font-bold tabular-nums text-slate-900">
                    {formatKRW(result.taxFreeLimit)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2 border-t border-slate-100 pt-3">
                  <span className="text-[12px] text-slate-500">ISA 실효세율</span>
                  <span className="text-[13.5px] font-bold tabular-nums text-slate-900">
                    {(result.isaEffective * 100).toFixed(1)}%
                    <span className="ml-1.5 text-[12px] font-normal text-slate-500">vs 일반 15.4%</span>
                  </span>
                </div>
              </>
            )}
          </div>

          {/* 인쇄 — 바로 인쇄창으로 넘기지 않고 미리보기 모달을 먼저 연다 */}
          <button
            onClick={() => setShowPrint(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-sm transition-all hover:shadow-md"
            title="상담 자료를 미리 보고 인쇄합니다"
          >
            <Printer className="w-4 h-4" />
            <span>상담 자료 인쇄</span>
          </button>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              {isDeposit ? "세후 이자 비교" : "세부담 비교"}
            </h4>
            <ResponsiveContainer width="100%" height={isDeposit ? 140 : 180}>
              <BarChart
                data={result.chartData}
                layout="vertical"
                margin={{ left: 0, right: 40, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatKRWShort(v)}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#334155" }}
                  width={110}
                />
                <Tooltip
                  formatter={(v) => formatKRW(v)}
                  contentStyle={{ fontSize: 12, borderRadius: 4, border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {result.chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <SalesScript accent="fuchsia" {...script} />

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">근거</strong> 조세특례제한법 제91조의18. 비과세 한도(일반형 200만원 / 서민·농어민형 400만원) 초과분 9.9% 분리과세, 일반 이자소득 15.4% 가정.{" "}
            {isDeposit
              ? "예금 이자는 월복리·만기일시지급(iM뱅크 판매 ISA 정기예금 기준) 가정이며 신탁보수 차감 전입니다. 실제 금리·요율·세법 개정에 따라 달라집니다."
              : "순이익은 손익통산 후 기준이며 실제 세액은 상품 구성·세법 개정에 따라 달라집니다."}
          </div>
        </div>
      </div>

      {/* 상담 자료 미리보기 → 인쇄 */}
      <MobileResult amount={result.saving} label="추정 절세액" targetId="isa-result" />

      {showPrint && (
        <PrintPreviewModal onClose={() => setShowPrint(false)}>
      <PrintReport
        preview
        slip
        title="ISA 세제 절세효과 추정 안내"
        subtitle={
          isDeposit
            ? isLump
              ? `${type.label} · ${formatKRW(lump)} ${years}년 거치 · 연 ${rate.toFixed(1)}% 가정`
              : `${type.label} · 연 ${formatKRW(annual)} × ${years}년(총 ${formatKRW(result.totalContributed)}) · 연 ${rate.toFixed(1)}% 가정`
            : `${type.label} · 계좌 내 순이익(손익통산 후) ${formatKRW(result.netProfit)} 가정`
        }
        disclaimer={
          isDeposit
            ? `본 절세액은 월복리·가정 금리 기준 추정치이며 신탁보수 차감 전입니다. 실제 상품 금리·요율·세법 개정에 따라 달라집니다.\n비과세·분리과세 혜택은 의무가입기간(3년) 충족을 전제로 하며, 3년 경과 전 해지 시 일반과세로 추징됩니다.\n정확한 내용은 현행 조세특례제한법과 자사 ISA 상품설명서로 확인해 주세요.`
            : `본 절세액은 추정치이며 계좌 내 상품 구성·운용성과·시점·세법 개정에 따라 실제 세액은 달라집니다.\n비과세·분리과세 혜택은 의무가입기간(3년) 충족을 전제로 하며, 3년 경과 전 해지 시 일반과세로 추징됩니다.\n정확한 내용은 현행 조세특례제한법과 자사 ISA 상품설명서로 확인해 주세요.`
        }
        inputs={
          isDeposit
            ? [
                { label: "ISA 유형", value: type.label },
                isLump
                  ? { label: "예치 목돈", value: `${formatKRW(lump)} (${years}년 거치)` }
                  : { label: "연 납입액", value: `${formatKRW(annual)} × ${years}년` },
                { label: "총 납입액", value: formatKRW(result.totalContributed) },
                { label: "예금 연 금리", value: `${rate.toFixed(1)}% (월복리)` },
                { label: "비과세 한도", value: formatKRW(result.taxFreeLimit) },
              ]
            : [
                { label: "ISA 유형", value: type.label },
                { label: "예상 순이익(손익통산 후)", value: formatKRW(result.netProfit) },
                { label: "비과세 한도", value: formatKRW(result.taxFreeLimit) },
              ]
        }
        results={
          isDeposit
            ? [
                { label: "예상 이자 (월복리·만기일시지급)", value: formatKRW(result.interest) },
                {
                  label: "ISA 예금 세금",
                  value: formatKRW(result.isaTax),
                  sub: `비과세 한도 초과분 ${formatKRW(result.taxableInIsa)} × 9.9%`,
                },
                {
                  label: "일반 예금이었다면 (세금)",
                  value: formatKRW(result.normalTax),
                  sub: "이자소득세 15.4%",
                },
                {
                  label: "세후 실효금리 (연)",
                  value: `ISA ${result.isaEffRate.toFixed(2)}% vs 일반 ${result.normalEffRate.toFixed(2)}%`,
                  sub: `ISA가 약 ${(result.isaEffRate - result.normalEffRate).toFixed(2)}%p 유리`,
                },
                {
                  label: "추정 절세액",
                  value: formatKRW(result.saving),
                  emphasis: true,
                  sub: `세후 수익 (원금 제외) 이자: ISA ${formatKRW(result.isaNet)} vs 일반 ${formatKRW(result.normalNet)}`,
                },
              ]
            : [
                {
                  label: "ISA 예상 세금",
                  value: formatKRW(result.isaTax),
                  sub: `한도 초과분 ${formatKRW(result.taxableInIsa)} × 9.9% 분리과세`,
                },
                {
                  label: "일반계좌였다면 (세금)",
                  value: formatKRW(result.normalTax),
                  sub: "이자·배당 15.4% 원천징수 가정",
                },
                {
                  label: "추정 절세액",
                  value: formatKRW(result.saving),
                  emphasis: true,
                  sub: `ISA 실효세율 약 ${(result.isaEffective * 100).toFixed(1)}% vs 일반 15.4%`,
                },
              ]
        }
        notes={[
          "추정 절세액 = 일반계좌 세금 − ISA 세금. ISA는 비과세 한도까지 0%, 초과분만 9.9% 분리과세.",
          isDeposit
            ? "예금 이자는 월복리(원금×{(1+이율/12)^경과월수−1}), 만기일시지급 가정입니다(iM뱅크 판매 ISA 정기예금 기준). 신탁형 신탁보수는 미반영이며(요율은 자사 상품설명서 확인), 중도해지·우대금리 조건은 실제 상품 약관을 따릅니다."
            : "ISA는 계좌 내 이익·손실을 통산한 순이익에만 과세됩니다. 손실 상품이 있으면 일반계좌 대비 절세폭이 더 커집니다.",
          "비과세 한도: 일반형 200만원 / 서민형·농어민형 400만원.",
          "납입한도 연 2,000만원·총 1억원, 의무가입기간 3년. 3년 경과 전 해지 시 세제 혜택 소멸.",
          "만기자금을 60일 내 연금계좌로 전환 시 전환금액의 10%(최대 300만원)만큼 세액공제 대상 납입한도 추가. 실제 공제액은 해당 공제율 적용.",
        ]}
        legalBasis="조세특례제한법 제91조의18 (개인종합자산관리계좌에 대한 과세특례)"
        {...ISA_PRINT_META}
      />
        </PrintPreviewModal>
      )}
    </div>
  );
};
