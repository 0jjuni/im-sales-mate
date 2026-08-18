import { useState, useMemo } from "react";
import { Briefcase, TrendingUp, AlertTriangle, Sparkles, Printer } from "lucide-react";
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
import { SalesScript } from "@shared/components/SalesScript";
import { PENSION_PRINT_META } from "../printMeta";
import { cn, formatKRW, formatKRWShort } from "@shared/lib/format";

/* 연금계좌 세액공제 계산기 — IRP 중심.
   은행 창구에서 「납입」 상담이 일어나는 상품은 IRP다. 연금저축신탁은 2018년
   판매중단이라 신규 납입 권유 대상이 아니고, 고객이 타사(증권사 연금저축펀드 등)에
   이미 납입 중인 금액은 「우리가 권유할 대상」이 아니라 900만원 한도를 깎아먹는 변수다.

   그래서 입력은 ① 기존 연금저축 납입액(타사 포함) → ② IRP 납입액 순으로 받고,
   연금저축이 600만원을 넘으면 초과분이 공제에서 빠진다는 사실을 IRP 유치 화법
   ("그 금액을 IRP로 돌리시면 얼마 더 받습니다")으로 전환해 제시한다. */

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

    /* 연금저축 600만원 초과분을 IRP로 옮겼을 때 — IRP 유치 화법의 근거.
       연금저축은 600만원까지만 인정되므로, 초과분을 IRP로 돌리면 합산 900만원
       한도 안에서 추가 공제를 받을 수 있다. */
    const savingExcess = Math.max(pensionSaving - CREDIT_RULES.pensionSavingLimit, 0);
    const optSaving = Math.min(totalPaid, CREDIT_RULES.pensionSavingLimit);
    const optIrp = Math.min(totalPaid - optSaving, CREDIT_RULES.totalLimit - optSaving);
    const optEligible = optSaving + optIrp;
    const optCredit = optEligible * rate;
    const reallocGain = optCredit - credit; // 초과분을 IRP로 옮겨 더 받는 금액
    const moveToIrp = Math.max(optIrp - irp, 0); // IRP로 옮길 금액 = 유치 가능액

    /* 한도(900만원)를 모두 채웠을 때 */
    const maxCredit = CREDIT_RULES.totalLimit * rate;
    const roomToLimit = CREDIT_RULES.totalLimit - optEligible; // 추가 납입 여지
    const roomGain = maxCredit - optCredit;

    /* 납입액 대비 실제 환급률 — 배분이 어긋나면 공제율보다 떨어진다 */
    const effectiveRate = totalPaid > 0 ? credit / totalPaid : 0;

    const chartData = [{ name: "현재", value: credit, fill: "#a8a29e" }];
    if (reallocGain > 0)
      chartData.push({ name: "초과분 IRP 이동", value: optCredit, fill: "#8b5cf6" });
    if (roomGain > 0)
      chartData.push({ name: "IRP 한도까지", value: maxCredit, fill: "#6d28d9" });

    return {
      rate,
      savingEligible,
      irpEligible,
      eligible,
      credit,
      totalPaid,
      wasted,
      savingExcess,
      optSaving,
      optIrp,
      optCredit,
      reallocGain,
      moveToIrp,
      maxCredit,
      roomToLimit,
      roomGain,
      effectiveRate,
      chartData,
      overContribution: Math.max(totalPaid - CREDIT_RULES.contributionLimit, 0),
    };
  }, [income, threshold, pensionSaving, irp]);

  /* 고객에게 실제로 할 수 있는 말. 상황에 따라 첫 마디가 달라진다.
     ① 한도 초과분이 있으면 그 손해부터 짚는다(IRP 유치 기회)
     ② 여유가 있으면 얼마 더 넣으면 얼마 받는지
     ③ 이미 최적이면 확인해 드린다 */
  const script = useMemo(() => {
    const common = [
      {
        q: "중간에 해지하면 어떻게 돼요?",
        a: "그동안 공제받으신 금액과 운용수익에 16.5%가 부과됩니다. 공제받을 때 13.2%를 적용받으셨다면 돌려받은 것보다 더 내실 수도 있습니다. 그래서 연금으로 쓸 자금만 넣으시는 게 좋습니다.",
      },
      {
        q: "돈이 급하게 필요해지면요?",
        a: "연금저축은 계좌를 유지한 채로 필요한 금액만 빼실 수 있고 담보대출도 가능합니다. IRP는 법에서 정한 사유가 아니면 전액 해지해야 하니, 유동성이 걱정되시면 연금저축 쪽 비중을 두시는 게 낫습니다.",
      },
      {
        q: "연금 받을 때 세금은 얼마예요?",
        a: "만 55세 이후에 연금으로 받으시면 3.3%에서 5.5% 사이입니다. 늦게 받으실수록 세율이 낮아지고, 한 해에 1,500만원을 넘기지 않게 나눠 받으시면 그 낮은 세율로 끝납니다.",
      },
    ];

    if (result.reallocGain > 0) {
      return {
        opening: `지금 연금저축에 ${formatKRW(
          pensionSaving
        )}을 넣고 계신데, 그중 ${formatKRW(result.savingExcess)}은 공제를 못 받고 계십니다.`,
        detail: [
          "연금저축은 단독으로 600만원까지만 인정되고, IRP를 합쳐야 900만원까지 됩니다. 같은 금액인데 나눠 넣지 않아서 공제가 빠지고 있는 겁니다.",
          `그 ${formatKRW(result.moveToIrp)}을 IRP로 옮기시면 환급액이 ${formatKRW(
            result.credit
          )}에서 ${formatKRW(result.optCredit)}으로, ${formatKRW(
            result.reallocGain
          )} 늘어납니다.`,
          "저희 IRP는 비대면으로 여시면 수수료가 없습니다. 오늘 계좌만 만들어 두시고 다음 납입부터 나눠 넣으셔도 됩니다.",
        ],
        objections: [
          {
            q: "이미 넣은 건 어떻게 되나요?",
            a: "올해 이미 연금저축에 넣으신 금액은 그대로입니다. 한도를 넘은 부분은 나중에 인출할 때 세금이 붙지 않으니 손해는 아니지만, 공제는 못 받습니다. 남은 기간 납입분을 IRP로 돌리시면 그만큼 공제를 챙기실 수 있습니다.",
          },
          ...common,
        ],
      };
    }

    if (result.roomToLimit > 0) {
      return {
        opening: `지금 납입액으로 연말정산 때 ${formatKRW(
          result.credit
        )} 정도 돌려받으시는데, 한도까지 여유가 ${formatKRW(result.roomToLimit)} 남았습니다.`,
        detail: [
          `그 금액을 IRP에 더 넣으시면 ${formatKRW(
            result.roomGain
          )}을 추가로 돌려받으십니다. 월로 나누면 ${formatKRWShort(
            result.roomToLimit / 12
          )}쯤 됩니다.`,
          "저희 IRP는 비대면으로 여시면 수수료가 없습니다.",
        ],
        objections: common,
      };
    }

    return {
      opening: `지금 납입액이면 연말정산 때 ${formatKRW(
        result.credit
      )}을 돌려받으십니다. 세액공제 한도를 다 채우고 계십니다.`,
      detail: [
        "더 넣으셔도 공제는 늘지 않습니다. 다만 한도를 넘긴 금액은 나중에 연금으로 받으실 때 세금이 붙지 않으니, 노후 자금을 더 쌓을 목적이면 추가 납입도 손해는 아닙니다.",
      ],
      objections: common,
    };
  }, [result, pensionSaving]);

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
                "flex items-center gap-2.5 p-3 border rounded-xl transition-all text-left",
                active
                  ? "bg-violet-700 text-white border-violet-700 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-violet-400"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold">{m.label}</div>
                <div className={cn("text-[11px]", active ? "text-violet-100" : "text-slate-500")}>
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
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
            <SectionTitle sub="고객 조건을 입력하세요">입력</SectionTitle>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>1천만원</span>
                <span>1억원</span>
                <span>1억 5천만원</span>
              </div>
              <div
                className={cn(
                  "mt-2 rounded-sm px-2.5 py-1.5 text-[11.5px] font-semibold",
                  income <= threshold
                    ? "bg-violet-50 text-violet-800"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                공제율 {(result.rate * 100).toFixed(1)}% 적용 —{" "}
                {income <= threshold
                  ? `${formatKRWShort(threshold)} 이하`
                  : `${formatKRWShort(threshold)} 초과`}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                기존 연금저축 연 납입액: {formatKRW(pensionSaving)}
                <span className="ml-1 font-normal text-slate-500">
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
                className="w-full accent-slate-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>0</span>
                <span className="font-semibold text-slate-600">공제한도 600만원</span>
                <span>900만원</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                타사 연금저축(증권사 펀드 등) 포함. 900만원 한도를 함께 쓰므로 먼저 확인하세요.
              </p>
            </div>

            <div className="rounded-xl border-2 border-violet-200 bg-violet-50/40 p-3">
              <label className="block text-xs font-bold text-violet-900 mb-1.5">
                IRP 연 납입액: {formatKRW(irp)}
                <span className="ml-1 font-normal text-slate-500">
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
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>0</span>
                <span className="font-semibold text-violet-700">
                  공제 여지 {formatKRWShort(CREDIT_RULES.totalLimit - result.savingEligible)}
                </span>
              </div>
            </div>

            <div className="rounded-sm bg-slate-50 border border-slate-200 px-3 py-2 text-[11.5px] text-slate-600 leading-relaxed">
              총 납입 <strong className="text-slate-900">{formatKRW(result.totalPaid)}</strong> (월{" "}
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
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <SectionTitle sub="연말정산 시 환급 예상액">추정 결과</SectionTitle>

            <div className="mt-3 rounded-xl bg-violet-50/50 border-2 border-violet-300 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-violet-700 mb-1">
                예상 환급액
              </div>
              <div className="text-3xl font-black text-slate-900 tabular-nums">
                {formatKRW(result.credit)}
              </div>
              <div className="text-[12px] text-slate-600 mt-1">
                공제대상 {formatKRW(result.eligible)} × {(result.rate * 100).toFixed(1)}%
                {result.totalPaid > 0 && (
                  <> · 납입액 대비 실효 {(result.effectiveRate * 100).toFixed(1)}%</>
                )}
              </div>

              <button
                onClick={() => window.print()}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors"
                title="이 결과 전체를 디스클레이머·입력 조건 포함하여 인쇄"
              >
                <Printer className="w-4 h-4" />
                <span>상담 자료 인쇄</span>
                <span className="text-[11px] font-normal text-slate-300 hidden sm:inline">
                  PDF 저장 가능 · 디스클레이머·입력 조건 포함
                </span>
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded-sm border border-slate-200 px-3 py-2">
                <div className="text-slate-500">연금저축 공제대상</div>
                <div className="font-bold text-slate-900 tabular-nums">
                  {formatKRW(result.savingEligible)}
                </div>
                <div className="text-[10.5px] text-slate-400">한도 600만원</div>
              </div>
              <div className="rounded-sm border border-slate-200 px-3 py-2">
                <div className="text-slate-500">IRP 공제대상</div>
                <div className="font-bold text-slate-900 tabular-nums">
                  {formatKRW(result.irpEligible)}
                </div>
                <div className="text-[10.5px] text-slate-400">
                  합산 900만원 중 잔여분
                </div>
              </div>
            </div>

            {result.wasted > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-sm border border-rose-200 bg-rose-50/60 px-3 py-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
                <div className="text-[12px] leading-relaxed text-slate-800">
                  <strong className="text-rose-800">
                    {formatKRW(result.wasted)}은 세액공제를 받지 못합니다.
                  </strong>{" "}
                  {result.reallocGain > 0
                    ? "연금저축은 단독으로 600만원까지만 공제되기 때문입니다. 초과분을 IRP로 옮기면 공제받을 수 있습니다."
                    : "합산 세액공제 한도(900만원)를 초과한 금액입니다. (납입 자체는 연 1,800만원까지 가능하며, 초과 납입분은 나중에 인출할 때 과세되지 않습니다.)"}
                </div>
              </div>
            )}

            {/* 최적화 제안 — 이 계산기의 핵심 */}
            {(result.reallocGain > 0 || result.roomToLimit > 0) && (
              <div className="mt-3 rounded-xl border-2 border-violet-300 bg-violet-50/50 p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-4 w-4 text-violet-700" />
                  <span className="text-[12px] font-bold text-violet-900">
                    IRP 권유 포인트
                  </span>
                </div>
                <ul className="space-y-1.5 text-[12.5px] leading-relaxed text-slate-800">
                  {result.reallocGain > 0 && (
                    <li className="flex gap-2">
                      <span className="text-violet-600 mt-1 text-[9px] flex-shrink-0">●</span>
                      <span>
                        연금저축 <strong>{formatKRW(result.savingExcess)}</strong>이 공제 한도를
                        넘습니다. 이 중 <strong>{formatKRW(result.moveToIrp)}</strong>을{" "}
                        <strong className="text-violet-800">IRP로 옮기시면</strong> 환급액이{" "}
                        <strong className="text-violet-800">{formatKRW(result.optCredit)}</strong>
                        으로 늘어납니다 (
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
                        <strong className="text-violet-800">IRP에</strong>{" "}
                        <strong>{formatKRW(result.roomToLimit)}</strong> (월{" "}
                        {formatKRWShort(result.roomToLimit / 12)}) 더 납입하시면{" "}
                        <strong className="text-violet-800">
                          +{formatKRW(result.roomGain)}
                        </strong>
                        을 추가로 환급받습니다.
                      </span>
                    </li>
                  )}
                  <li className="flex gap-2 pt-0.5 border-t border-violet-200/70 mt-1">
                    <span className="text-violet-600 mt-1 text-[9px] flex-shrink-0">●</span>
                    <span className="text-[11.5px] text-slate-600">
                      iM뱅크 IRP는 <strong>비대면 신규가입 시 수수료 면제</strong>(운용관리·자산관리),
                      연금 수령 신청 시 운용관리수수료 0.01%p 감면입니다.
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {result.reallocGain === 0 && result.roomToLimit === 0 && result.totalPaid > 0 && (
              <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50/40 px-3 py-2.5 text-[12.5px] text-violet-900">
                ✓ 세액공제 한도(900만원)를 최적으로 활용하고 계십니다. 최대 환급액{" "}
                <strong>{formatKRW(result.maxCredit)}</strong>.
              </div>
            )}
          </div>

          {result.chartData.length > 1 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
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

          <SalesScript accent="violet" {...script} />

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">근거</strong> 소득세법 제59조의3. 연금저축 600만원, 합산 900만원 한도.
            공제율 16.5%(총급여 5,500만원 이하) / 13.2%. 실제 공제액은 산출세액 범위 내에서 적용됩니다.
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
                ? `연금저축 한도 초과분 ${formatKRW(result.moveToIrp)}을 IRP로 옮기면 ${formatKRW(result.optCredit)}까지 가능`
                : result.roomToLimit > 0
                ? `IRP에 ${formatKRW(result.roomToLimit)} 추가 납입 시 ${formatKRW(result.maxCredit)}까지 가능`
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
