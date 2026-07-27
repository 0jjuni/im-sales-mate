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
import { PrintReport } from "@shared/components/PrintReport";
import { ISA_PRINT_META } from "../printMeta";
import { cn, formatKRW, formatKRWShort } from "@shared/lib/format";

/* ISA 세제 절세효과 계산기.
   은행 ISA는 예금 예치가 많아 「예금 기준」 모드를 기본으로 한다:
   원금·금리·기간으로 이자를 산정 → ISA 예금 vs 일반 예금의 세부담·세후 실수령을 비교.
   「순이익 직접입력」 모드는 펀드 등 투자상품용(계좌 내 손익통산 후 순이익 직접 입력). */
export const TaxCalculator = () => {
  const [mode, setMode] = useState("deposit"); // deposit | profit
  const [typeId, setTypeId] = useState("general");
  // 예금 모드 입력
  const [principal, setPrincipal] = useState(ISA_DEPOSIT_DEFAULTS.principal);
  const [rate, setRate] = useState(ISA_DEPOSIT_DEFAULTS.rate);
  const [years, setYears] = useState(ISA_DEPOSIT_DEFAULTS.years);
  // 순이익 직접입력 모드
  const [directProfit, setDirectProfit] = useState(4_000_000);

  const type = ISA_TYPES.find((t) => t.id === typeId);
  const isDeposit = mode === "deposit";

  const result = useMemo(() => {
    // 예금 이자: 월단위 복리식, 만기일시지급 (iM뱅크 판매 ISA 정기예금 설명서 기준)
    // 원금 × {(1+이율/12)^n − 1}, n = 경과월수
    const monthlyRate = rate / 100 / 12;
    const interest = principal * (Math.pow(1 + monthlyRate, years * 12) - 1);
    const netProfit = isDeposit ? interest : directProfit;

    const taxFreeLimit = type.taxFreeLimit;
    const taxableInIsa = Math.max(netProfit - taxFreeLimit, 0);
    const isaTax = taxableInIsa * ISA_RULES.isaTaxRate;
    const normalTax = netProfit * ISA_RULES.normalTaxRate;
    const saving = normalTax - isaTax;
    const isaNet = netProfit - isaTax;
    const normalNet = netProfit - normalTax;

    // 예금 모드: 세후 실효 연금리
    const isaEffRate =
      isDeposit && principal > 0 && years > 0 ? (isaNet / principal / years) * 100 : null;
    const normalEffRate =
      isDeposit && principal > 0 && years > 0 ? (normalNet / principal / years) * 100 : null;

    const chartData = isDeposit
      ? [
          { name: "일반예금 세후이자", value: normalNet, fill: "#a8a29e" },
          { name: "ISA예금 세후이자", value: isaNet, fill: "#059669" },
        ]
      : [
          { name: "일반계좌 세금", value: normalTax, fill: "#a8a29e" },
          { name: "ISA 세금", value: isaTax, fill: "#059669" },
          { name: "추정 절세액", value: saving, fill: "#10b981" },
        ];

    return {
      interest,
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
  }, [isDeposit, type, principal, rate, years, directProfit]);

  const generateScript = () => {
    if (isDeposit) {
      return `${type.label} ISA에서 ${formatKRW(principal)}을 연 ${rate.toFixed(
        1
      )}% 예금으로 ${years}년 예치한다고 가정하면(월복리·만기일시지급),
▸ 예상 이자: 약 ${formatKRW(result.interest)}
▸ ISA 예금 세금: 약 ${formatKRW(result.isaTax)} (비과세 한도 ${formatKRW(
        result.taxFreeLimit
      )} 적용, 초과분 9.9%)
▸ 일반 예금이었다면: 약 ${formatKRW(result.normalTax)} (이자소득세 15.4%)
▸ 추정 절세액: 약 ${formatKRW(result.saving)}
▸ 세후 실효금리: ISA 약 ${result.isaEffRate.toFixed(2)}% vs 일반 약 ${result.normalEffRate.toFixed(
        2
      )}%

※ 월복리·가정 금리 기준 추정치이며, 신탁보수 차감 전입니다. 최신 고시금리·요율은 상품설명서로 확인해 주세요.
※ 비과세·분리과세 혜택은 의무가입기간 3년 충족 전제이며, 현행 조특법과 자사 ISA 상품설명서로 확인해 주세요.

— 근거: 조세특례제한법 제91조의18 (개인종합자산관리계좌에 대한 과세특례)`;
    }
    return `${type.label} ISA로 만기까지 계좌 내 순이익(손익통산 후)이 약 ${formatKRW(
      result.netProfit
    )} 발생한다고 가정하면,
▸ 비과세 한도: ${formatKRW(result.taxFreeLimit)} (${type.label})
▸ ISA 예상 세금: 약 ${formatKRW(result.isaTax)} (한도 초과분 ${formatKRW(
      result.taxableInIsa
    )} × 9.9% 분리과세)
▸ 일반계좌였다면: 약 ${formatKRW(result.normalTax)} (이자·배당 15.4% 원천징수)
▸ 추정 절세액: 약 ${formatKRW(result.saving)}

※ 계좌 내 손익통산·비과세·분리과세 혜택은 의무가입기간 3년 충족을 전제로 합니다.
※ 정확한 내용은 현행 조세특례제한법과 자사 ISA 상품설명서로 확인해 주세요.

— 근거: 조세특례제한법 제91조의18 (개인종합자산관리계좌에 대한 과세특례)`;
  };

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
                "flex items-center gap-2.5 p-3 border rounded-md transition-all text-left",
                active
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                  : "bg-white text-stone-700 border-stone-200 hover:border-emerald-400"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold">{m.label}</div>
                <div className={cn("text-[11px]", active ? "text-emerald-100" : "text-stone-500")}>
                  {m.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 print:hidden">
        {/* 입력부 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-stone-200 rounded-md p-5 space-y-4">
            <SectionTitle sub="고객 조건을 입력하세요">입력</SectionTitle>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">ISA 유형</label>
              <div className="grid grid-cols-2 gap-1.5">
                {ISA_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTypeId(t.id)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-sm border transition-colors",
                      typeId === t.id
                        ? "bg-emerald-700 text-white border-emerald-700 font-semibold"
                        : "bg-white text-stone-700 border-stone-300 hover:border-emerald-400"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                비과세 한도 {formatKRWShort(type.taxFreeLimit)} · {type.eligibility}
              </p>
            </div>

            {isDeposit ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    예치금액: {formatKRW(principal)}
                  </label>
                  <input
                    type="range"
                    min="1000000"
                    max="100000000"
                    step="1000000"
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                    <span>100만원</span>
                    <span>5천만원</span>
                    <span>1억원</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    예금 연 금리: {rate.toFixed(1)}%
                  </label>
                  <input
                    type="range"
                    min={ISA_DEPOSIT_DEFAULTS.rateMin}
                    max={ISA_DEPOSIT_DEFAULTS.rateMax}
                    step={ISA_DEPOSIT_DEFAULTS.rateStep}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                    <span>{ISA_DEPOSIT_DEFAULTS.rateMin.toFixed(1)}%</span>
                    <span>{ISA_DEPOSIT_DEFAULTS.rateMax.toFixed(1)}%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">예치 기간</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3].map((y) => (
                      <button
                        key={y}
                        onClick={() => setYears(y)}
                        className={cn(
                          "px-3 py-2 text-sm rounded-sm border transition-colors",
                          years === y
                            ? "bg-emerald-700 text-white border-emerald-700 font-semibold"
                            : "bg-white text-stone-700 border-stone-300 hover:border-emerald-400"
                        )}
                      >
                        {y}년
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1.5">
                    ISA 의무가입기간은 3년입니다. 단리(만기일시지급) 가정.
                  </p>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  예상 순이익 (손익통산 후): {formatKRW(directProfit)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="20000000"
                  step="500000"
                  value={directProfit}
                  onChange={(e) => setDirectProfit(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                  <span>0</span>
                  <span>1천만원</span>
                  <span>2천만원</span>
                </div>
                <input
                  type="number"
                  value={directProfit}
                  min="0"
                  max="20000000"
                  step="500000"
                  onChange={(e) =>
                    setDirectProfit(Math.max(0, Math.min(20000000, Number(e.target.value))))
                  }
                  className="mt-2 w-full px-3 py-2 text-sm border border-stone-300 rounded-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          <div className="bg-blue-50/40 border border-blue-200 rounded-md p-3 text-xs text-stone-700 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline-block mr-1 text-blue-600" />
            {isDeposit
              ? "같은 예금을 ISA 안에서 예치할 때와 일반 예금으로 둘 때의 이자 세금을 비교합니다. 이자는 월복리·만기일시지급(iM뱅크 판매 ISA 정기예금 기준) 가정이며 신탁보수 차감 전입니다. 기본 금리는 설명서 고시(2025.3.7)의 12개월 약정이율 2.8%입니다."
              : "'순이익'은 계좌 내 이익·손실을 통산한 뒤의 금액입니다. 일반계좌는 손실을 인정받지 못하므로, 손실 상품이 있으면 ISA의 실제 절세폭은 더 커집니다."}
          </div>
        </div>

        {/* 결과부 */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border-2 border-emerald-400 rounded-md p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-emerald-700 font-bold mb-1">
                  추정 절세액
                </div>
                <div className="text-4xl font-black text-stone-900 tracking-tight">
                  {formatKRW(result.saving)}
                </div>
                <div className="text-sm text-stone-600 mt-1">
                  {isDeposit ? "일반 예금 대비 세금 절감" : "일반계좌 대비 세부담 절감"}
                </div>
              </div>
              <Percent className="w-10 h-10 text-emerald-500" />
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

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-emerald-200">
              {isDeposit && (
                <div className="col-span-2">
                  <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-0.5">
                    예상 이자 (월복리)
                  </div>
                  <div className="text-base font-bold text-stone-900">
                    {formatKRW(result.interest)}
                    <span className="text-[11px] font-normal text-stone-500 ml-1">
                      {formatKRWShort(principal)} · 연 {rate.toFixed(1)}% · {years}년 · 만기일시지급
                    </span>
                  </div>
                </div>
              )}
              <div>
                <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-0.5">
                  ISA 예상 세금
                </div>
                <div className="text-base font-bold text-emerald-700">
                  {formatKRW(result.isaTax)}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-0.5">
                  {isDeposit ? "일반예금 세금" : "일반계좌 세금"}
                </div>
                <div className="text-base font-bold text-stone-900">
                  {formatKRW(result.normalTax)}
                </div>
              </div>
              {isDeposit ? (
                <div className="col-span-2 bg-emerald-50/70 -mx-2 px-2 py-2 rounded-sm">
                  <div className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold mb-0.5">
                    세후 실효금리 (연)
                  </div>
                  <div className="text-base font-bold text-stone-900">
                    ISA 약 {result.isaEffRate.toFixed(2)}%
                    <span className="text-stone-500 mx-1.5">vs</span>
                    <span className="text-stone-500">일반 약 {result.normalEffRate.toFixed(2)}%</span>
                    <span className="ml-2 text-[12px] font-bold text-emerald-700">
                      +{(result.isaEffRate - result.normalEffRate).toFixed(2)}%p
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-0.5">
                      비과세 한도
                    </div>
                    <div className="text-base font-bold text-stone-900">
                      {formatKRW(result.taxFreeLimit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-0.5">
                      ISA 실효세율
                    </div>
                    <div className="text-base font-bold text-stone-900">
                      {(result.isaEffective * 100).toFixed(1)}%
                      <span className="text-[11px] font-normal text-stone-500 ml-1">vs 일반 15.4%</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-md p-4">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
              {isDeposit ? "세후 실수령 이자 비교" : "세부담 비교"}
            </h4>
            <ResponsiveContainer width="100%" height={isDeposit ? 140 : 180}>
              <BarChart
                data={result.chartData}
                layout="vertical"
                margin={{ left: 0, right: 40, top: 5, bottom: 5 }}
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
                  width={110}
                />
                <Tooltip
                  formatter={(v) => formatKRW(v)}
                  contentStyle={{ fontSize: 12, borderRadius: 4, border: "1px solid #e7e5e4" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {result.chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-emerald-50/40 border border-emerald-200 rounded-md p-4">
            <h4 className="text-sm font-bold text-stone-900 mb-2">
              고객 안내 멘트{" "}
              <span className="text-xs font-normal text-stone-500">(직원 참고용 — 인쇄 안 됨)</span>
            </h4>
            <pre className="text-[12px] leading-relaxed whitespace-pre-wrap font-sans bg-white/70 p-3 rounded-sm border border-emerald-200/60 text-stone-800">
              {generateScript()}
            </pre>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-md p-3 text-xs text-stone-600 leading-relaxed">
            <strong className="text-stone-800">계산 근거:</strong> 조세특례제한법 제91조의18(개인종합자산관리계좌 과세특례) — 비과세 한도(일반형 200만원/서민·농어민형 400만원) + 초과분 9.9% 분리과세, 일반 이자소득 15.4% 원천징수 가정.{" "}
            {isDeposit
              ? "예금 이자는 월복리·만기일시지급(iM뱅크 판매 ISA 정기예금 기준) 가정이며 신탁보수 차감 전입니다. 실제 금리·요율·세법 개정에 따라 달라집니다."
              : "순이익은 손익통산 후 기준이며 실제 세액은 상품 구성·세법 개정에 따라 달라집니다."}
          </div>
        </div>
      </div>

      {/* 인쇄용 */}
      <PrintReport
        title="ISA 세제 절세효과 추정 안내"
        subtitle={
          isDeposit
            ? `${type.label} · 예금 ${formatKRW(principal)} · 연 ${rate.toFixed(1)}% · ${years}년(월복리·만기일시지급) 가정`
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
                { label: "예치금액", value: formatKRW(principal) },
                { label: "예금 연 금리", value: `${rate.toFixed(1)}% (월복리·만기일시지급)` },
                { label: "예치 기간", value: `${years}년` },
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
                  sub: `세후 실수령 이자: ISA ${formatKRW(result.isaNet)} vs 일반 ${formatKRW(result.normalNet)}`,
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
          "만기자금을 60일 내 연금계좌로 전환 시 전환금액의 10%(최대 300만원) 추가 세액공제.",
        ]}
        legalBasis="조세특례제한법 제91조의18 (개인종합자산관리계좌에 대한 과세특례)"
        {...ISA_PRINT_META}
      />
    </div>
  );
};
