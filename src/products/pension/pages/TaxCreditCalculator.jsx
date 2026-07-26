import { useState, useMemo } from "react";
import { Wallet, Briefcase, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
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
import { CREDIT_RULES } from "../data/pension";
import { SectionTitle } from "@shared/components/SectionTitle";
import { PrintReport } from "@shared/components/PrintReport";
import { PENSION_PRINT_META } from "../printMeta";
import { cn, formatKRW, formatKRWShort } from "@shared/lib/format";

/* 연금계좌 세액공제 계산기.
   연금저축과 IRP는 세액공제 한도를 공유한다 — 연금저축 단독 600만원,
   두 계좌 합산 900만원. 이 구조 때문에 「연금저축에만 900만원」을 넣으면
   300만원이 공제에서 빠진다. 이 계산기의 핵심은 그 손해를 눈에 보이게 하고
   같은 돈으로 얼마나 더 받을 수 있는지(배분 최적화·잔여 한도)를 즉시 제시하는 것. */

const SLIDER_MAX = 9_000_000;
const SLIDER_STEP = 100_000;

export const TaxCreditCalculator = () => {
  const [incomeType, setIncomeType] = useState("salary"); // salary | comprehensive
  const [income, setIncome] = useState(50_000_000);
  const [pensionSaving, setPensionSaving] = useState(6_000_000);
  const [irp, setIrp] = useState(3_000_000);

  const isSalary = incomeType === "salary";
  const threshold = isSalary
    ? CREDIT_RULES.salaryThreshold
    : CREDIT_RULES.comprehensiveThreshold;

  const result = useMemo(() => {
    const rate = income <= threshold ? CREDIT_RULES.highRate : CREDIT_RULES.lowRate;

    /* 현재 납입 기준 공제 — 연금저축은 600만원까지만 인정,
       IRP는 합산 900만원에서 연금저축 인정분을 뺀 나머지까지 인정 */
    const savingEligible = Math.min(pensionSaving, CREDIT_RULES.pensionSavingLimit);
    const irpEligible = Math.min(irp, CREDIT_RULES.totalLimit - savingEligible);
    const eligible = savingEligible + irpEligible;
    const credit = eligible * rate;

    const totalPaid = pensionSaving + irp;
    const wasted = totalPaid - eligible; // 넣었지만 공제 못 받는 금액

    /* 같은 총액을 최적 배분했을 때 — 연금저축을 600만원까지만 쓰고 나머지는 IRP로 */
    const optSaving = Math.min(totalPaid, CREDIT_RULES.pensionSavingLimit);
    const optIrp = Math.min(totalPaid - optSaving, CREDIT_RULES.totalLimit - optSaving);
    const optEligible = optSaving + optIrp;
    const optCredit = optEligible * rate;
    const reallocGain = optCredit - credit; // 배분만 바꿔서 더 받는 금액

    /* 한도(900만원)를 모두 채웠을 때 */
    const maxCredit = CREDIT_RULES.totalLimit * rate;
    const roomToLimit = CREDIT_RULES.totalLimit - optEligible; // 추가 납입 여지
    const roomGain = maxCredit - optCredit;

    /* 납입액 대비 실제 환급률 — 배분이 어긋나면 공제율보다 떨어진다 */
    const effectiveRate = totalPaid > 0 ? credit / totalPaid : 0;

    const chartData = [{ name: "현재 납입", value: credit, fill: "#a8a29e" }];
    if (reallocGain > 0)
      chartData.push({ name: "배분만 조정", value: optCredit, fill: "#8b5cf6" });
    if (roomGain > 0)
      chartData.push({ name: "한도 900만 채움", value: maxCredit, fill: "#6d28d9" });

    return {
      rate,
      savingEligible,
      irpEligible,
      eligible,
      credit,
      totalPaid,
      wasted,
      optSaving,
      optIrp,
      optCredit,
      reallocGain,
      maxCredit,
      roomToLimit,
      roomGain,
      effectiveRate,
      chartData,
      overContribution: Math.max(totalPaid - CREDIT_RULES.contributionLimit, 0),
    };
  }, [income, threshold, pensionSaving, irp]);

  const generateScript = () =>
    `연금저축 ${formatKRW(pensionSaving)} + IRP ${formatKRW(irp)}, 총 ${formatKRW(
      result.totalPaid
    )}을 납입하시는 경우(${isSalary ? "총급여" : "종합소득금액"} ${formatKRW(income)} 기준),
▸ 세액공제 대상액: ${formatKRW(result.eligible)} (연금저축 ${formatKRW(
      result.savingEligible
    )} + IRP ${formatKRW(result.irpEligible)})
▸ 적용 공제율: ${(result.rate * 100).toFixed(1)}%
▸ 예상 환급액: 약 ${formatKRW(result.credit)}${
      result.reallocGain > 0
        ? `

⚠ 같은 금액이라도 연금저축 ${formatKRW(result.optSaving)} + IRP ${formatKRW(
            result.optIrp
          )}로 나눠 넣으시면 약 ${formatKRW(
            result.optCredit
          )}까지 공제받으실 수 있습니다 (약 ${formatKRW(result.reallocGain)} 추가).`
        : ""
    }${
      result.roomToLimit > 0
        ? `

▸ 세액공제 한도(900만원)까지 ${formatKRW(
            result.roomToLimit
          )} 더 납입하시면 약 ${formatKRW(result.roomGain)}을 추가로 환급받으실 수 있습니다.`
        : ""
    }

※ 연금저축은 단독 600만원, 연금저축+IRP 합산 900만원까지 세액공제됩니다.
※ 중도해지 시 세액공제 받은 금액과 운용수익에 기타소득세 16.5%가 부과되어, 환급받은 금액보다 더 납부하게 될 수 있습니다.
※ 실제 공제액은 산출세액 범위 내에서 적용되며, 다른 공제 항목·세법 개정에 따라 달라집니다.

— 근거: 소득세법 제59조의3 (연금계좌세액공제)`;

  return (
    <div className="space-y-5">
      {/* 소득 유형 */}
      <div className="grid grid-cols-2 gap-2 print:hidden">
        {[
          { id: "salary", label: "근로소득만", icon: Briefcase, sub: "총급여 5,500만원 기준" },
          {
            id: "comprehensive",
            label: "종합소득",
            icon: TrendingUp,
            sub: "종합소득금액 4,500만원 기준",
          },
        ].map((m) => {
          const Icon = m.icon;
          const active = incomeType === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setIncomeType(m.id)}
              className={cn(
                "flex items-center gap-2.5 p-3 border rounded-md transition-all text-left",
                active
                  ? "bg-violet-700 text-white border-violet-700 shadow-sm"
                  : "bg-white text-stone-700 border-stone-200 hover:border-violet-400"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold">{m.label}</div>
                <div className={cn("text-[11px]", active ? "text-violet-100" : "text-stone-500")}>
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
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {isSalary ? "총급여" : "종합소득금액"}: {formatKRW(income)}
              </label>
              <input
                type="range"
                min="10000000"
                max="150000000"
                step="1000000"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full accent-violet-600"
              />
              <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                <span>1천만원</span>
                <span>1억원</span>
                <span>1억 5천만원</span>
              </div>
              <div
                className={cn(
                  "mt-2 rounded-sm px-2.5 py-1.5 text-[11.5px] font-semibold",
                  income <= threshold
                    ? "bg-violet-50 text-violet-800"
                    : "bg-stone-100 text-stone-600"
                )}
              >
                공제율 {(result.rate * 100).toFixed(1)}% 적용 —{" "}
                {income <= threshold
                  ? `${formatKRWShort(threshold)} 이하`
                  : `${formatKRWShort(threshold)} 초과`}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                연금저축 연 납입액: {formatKRW(pensionSaving)}
                <span className="ml-1 font-normal text-stone-500">
                  (월 {formatKRWShort(pensionSaving / 12)})
                </span>
              </label>
              <input
                type="range"
                min="0"
                max={SLIDER_MAX}
                step={SLIDER_STEP}
                value={pensionSaving}
                onChange={(e) => setPensionSaving(Number(e.target.value))}
                className="w-full accent-violet-600"
              />
              <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                <span>0</span>
                <span className="font-semibold text-violet-700">공제한도 600만원</span>
                <span>900만원</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                IRP 연 납입액: {formatKRW(irp)}
                <span className="ml-1 font-normal text-stone-500">
                  (월 {formatKRWShort(irp / 12)})
                </span>
              </label>
              <input
                type="range"
                min="0"
                max={SLIDER_MAX}
                step={SLIDER_STEP}
                value={irp}
                onChange={(e) => setIrp(Number(e.target.value))}
                className="w-full accent-violet-600"
              />
              <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                <span>0</span>
                <span>합산 900만원까지 공제</span>
              </div>
            </div>

            <div className="rounded-sm bg-stone-50 border border-stone-200 px-3 py-2 text-[11.5px] text-stone-600 leading-relaxed">
              총 납입 <strong className="text-stone-900">{formatKRW(result.totalPaid)}</strong> (월{" "}
              {formatKRWShort(result.totalPaid / 12)})
              {result.overContribution > 0 && (
                <div className="mt-1 text-rose-700 font-semibold">
                  ⚠ 연간 납입한도(1,800만원)를 {formatKRW(result.overContribution)} 초과했습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 결과부 */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-stone-200 rounded-md p-5">
            <SectionTitle sub="연말정산 시 환급 예상액">추정 결과</SectionTitle>

            <div className="mt-3 rounded-md bg-gradient-to-br from-violet-50 to-white border-2 border-violet-300 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-violet-700 mb-1">
                예상 환급액
              </div>
              <div className="text-3xl font-black text-stone-900 tabular-nums">
                {formatKRW(result.credit)}
              </div>
              <div className="text-[12px] text-stone-600 mt-1">
                공제대상 {formatKRW(result.eligible)} × {(result.rate * 100).toFixed(1)}%
                {result.totalPaid > 0 && (
                  <> · 납입액 대비 실효 {(result.effectiveRate * 100).toFixed(1)}%</>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded-sm border border-stone-200 px-3 py-2">
                <div className="text-stone-500">연금저축 공제대상</div>
                <div className="font-bold text-stone-900 tabular-nums">
                  {formatKRW(result.savingEligible)}
                </div>
                <div className="text-[10.5px] text-stone-400">한도 600만원</div>
              </div>
              <div className="rounded-sm border border-stone-200 px-3 py-2">
                <div className="text-stone-500">IRP 공제대상</div>
                <div className="font-bold text-stone-900 tabular-nums">
                  {formatKRW(result.irpEligible)}
                </div>
                <div className="text-[10.5px] text-stone-400">
                  합산 900만원 중 잔여분
                </div>
              </div>
            </div>

            {result.wasted > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-sm border border-rose-200 bg-rose-50/60 px-3 py-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
                <div className="text-[12px] leading-relaxed text-stone-800">
                  <strong className="text-rose-800">
                    {formatKRW(result.wasted)}은 세액공제를 받지 못합니다.
                  </strong>{" "}
                  {result.reallocGain > 0
                    ? "연금저축은 단독 600만원까지만 공제되기 때문입니다. 아래 제안대로 나눠 넣으면 공제받을 수 있습니다."
                    : "합산 세액공제 한도(900만원)를 초과한 금액입니다. (납입 자체는 연 1,800만원까지 가능하며, 초과 납입분은 나중에 인출할 때 과세되지 않습니다.)"}
                </div>
              </div>
            )}

            {/* 최적화 제안 — 이 계산기의 핵심 */}
            {(result.reallocGain > 0 || result.roomToLimit > 0) && (
              <div className="mt-3 rounded-md border-2 border-violet-300 bg-violet-50/50 p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-4 w-4 text-violet-700" />
                  <span className="text-[12px] font-bold text-violet-900">
                    이렇게 하시면 더 받으실 수 있습니다
                  </span>
                </div>
                <ul className="space-y-1.5 text-[12.5px] leading-relaxed text-stone-800">
                  {result.reallocGain > 0 && (
                    <li className="flex gap-2">
                      <span className="text-violet-600 mt-1 text-[9px] flex-shrink-0">●</span>
                      <span>
                        같은 <strong>{formatKRW(result.totalPaid)}</strong>을 연금저축{" "}
                        <strong>{formatKRW(result.optSaving)}</strong> + IRP{" "}
                        <strong>{formatKRW(result.optIrp)}</strong>로 나누면 환급액이{" "}
                        <strong className="text-violet-800">
                          {formatKRW(result.optCredit)}
                        </strong>
                        로 늘어납니다 (
                        <strong className="text-violet-800">
                          +{formatKRW(result.reallocGain)}
                        </strong>
                        ).
                      </span>
                    </li>
                  )}
                  {result.roomToLimit > 0 && (
                    <li className="flex gap-2">
                      <span className="text-violet-600 mt-1 text-[9px] flex-shrink-0">●</span>
                      <span>
                        세액공제 한도까지 <strong>{formatKRW(result.roomToLimit)}</strong> (월{" "}
                        {formatKRWShort(result.roomToLimit / 12)}) 더 납입하시면{" "}
                        <strong className="text-violet-800">
                          +{formatKRW(result.roomGain)}
                        </strong>
                        을 추가로 환급받습니다.
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {result.reallocGain === 0 && result.roomToLimit === 0 && result.totalPaid > 0 && (
              <div className="mt-3 rounded-md border border-violet-200 bg-violet-50/40 px-3 py-2.5 text-[12.5px] text-violet-900">
                ✓ 세액공제 한도(900만원)를 최적으로 활용하고 계십니다. 최대 환급액{" "}
                <strong>{formatKRW(result.maxCredit)}</strong>.
              </div>
            )}
          </div>

          {result.chartData.length > 1 && (
            <div className="bg-white border border-stone-200 rounded-md p-4">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                환급액 비교
              </h4>
              <ResponsiveContainer width="100%" height={150}>
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
          )}

          <div className="bg-violet-50/40 border border-violet-200 rounded-md p-4">
            <h4 className="text-sm font-bold text-stone-900 mb-2">
              고객 안내 멘트{" "}
              <span className="text-xs font-normal text-stone-500">(직원 참고용 — 인쇄 안 됨)</span>
            </h4>
            <pre className="text-[12px] leading-relaxed whitespace-pre-wrap font-sans bg-white/70 p-3 rounded-sm border border-violet-200/60 text-stone-800">
              {generateScript()}
            </pre>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-md p-3 text-xs text-stone-600 leading-relaxed">
            <strong className="text-stone-800">계산 근거:</strong> 소득세법 제59조의3(연금계좌세액공제)
            — 연금저축 단독 600만원, 연금저축+IRP 합산 900만원 한도. 공제율은 총급여 5,500만원(종합소득금액
            4,500만원) 이하 16.5%, 초과 13.2%(지방소득세 포함). 실제 공제액은 산출세액 범위 내에서
            적용되며, 다른 공제 항목·세법 개정에 따라 달라집니다.
          </div>
        </div>
      </div>

      {/* 인쇄용 */}
      <PrintReport
        title="연금계좌 세액공제 추정 안내"
        subtitle={`${isSalary ? "총급여" : "종합소득금액"} ${formatKRW(income)} · 연금저축 ${formatKRW(
          pensionSaving
        )} + IRP ${formatKRW(irp)} 납입 가정`}
        disclaimer={`본 환급액은 추정치입니다. 실제 세액공제는 산출세액 범위 내에서 적용되며, 다른 소득공제·세액공제 항목과 세법 개정에 따라 달라집니다.\n중도해지 시 세액공제 받은 금액과 운용수익에 기타소득세 16.5%가 부과되어, 환급받은 금액보다 더 납부하게 될 수 있습니다.\n정확한 내용은 현행 소득세법과 자사 상품설명서로 확인해 주세요.`}
        inputs={[
          { label: isSalary ? "총급여" : "종합소득금액", value: formatKRW(income) },
          { label: "연금저축 연 납입액", value: formatKRW(pensionSaving) },
          { label: "IRP 연 납입액", value: formatKRW(irp) },
          { label: "총 납입액", value: `${formatKRW(result.totalPaid)} (월 ${formatKRWShort(result.totalPaid / 12)})` },
          { label: "적용 공제율", value: `${(result.rate * 100).toFixed(1)}% (지방소득세 포함)` },
        ]}
        results={[
          {
            label: "연금저축 공제대상액",
            value: formatKRW(result.savingEligible),
            sub: "단독 한도 600만원",
          },
          {
            label: "IRP 공제대상액",
            value: formatKRW(result.irpEligible),
            sub: "합산 한도 900만원 중 잔여분",
          },
          {
            label: "세액공제 대상액 합계",
            value: formatKRW(result.eligible),
            sub: result.wasted > 0 ? `공제 제외 ${formatKRW(result.wasted)}` : undefined,
          },
          {
            label: "예상 환급액",
            value: formatKRW(result.credit),
            emphasis: true,
            sub:
              result.reallocGain > 0
                ? `연금저축 ${formatKRW(result.optSaving)} + IRP ${formatKRW(result.optIrp)}로 배분 시 ${formatKRW(result.optCredit)}까지 가능`
                : result.roomToLimit > 0
                ? `한도까지 ${formatKRW(result.roomToLimit)} 추가 납입 시 ${formatKRW(result.maxCredit)}까지 가능`
                : "세액공제 한도 최대 활용",
          },
        ]}
        notes={[
          "연금저축은 단독 600만원까지, 연금저축과 IRP를 합쳐 900만원까지 세액공제됩니다. 연금저축에만 900만원을 납입하면 300만원은 공제 대상에서 제외됩니다.",
          "공제율은 총급여 5,500만원(근로소득만 있는 경우) 또는 종합소득금액 4,500만원 이하면 16.5%, 초과하면 13.2%입니다(지방소득세 포함).",
          "두 계좌 합산 연간 납입한도는 1,800만원입니다. 세액공제 한도를 넘는 납입분은 나중에 인출할 때 과세되지 않습니다(과세제외금액).",
          "만 55세 이후 + 가입 후 5년 경과 시 연금수령을 개시할 수 있으며, 연금소득세는 수령 연령에 따라 3.3~5.5%입니다.",
          "중도해지 시 기타소득세 16.5%가 부과됩니다. 특히 공제율 13.2%를 적용받은 경우 환급액보다 추징액이 커질 수 있습니다.",
        ]}
        legalBasis="소득세법 제59조의3 (연금계좌세액공제) · 소득세법 시행령 제40조의2 (연금수령 요건)"
        {...PENSION_PRINT_META}
      />
    </div>
  );
};
