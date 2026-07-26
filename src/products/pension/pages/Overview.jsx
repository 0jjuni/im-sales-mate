import { Coins, HelpCircle, PiggyBank, CalendarClock, Percent, ArrowRight, FileText } from "lucide-react";
import {
  CREDIT_RULES,
  WITHDRAWAL_RULES,
  PENSION_GENERATIONS,
  ACCOUNT_COMPARISON,
  PENSION_META,
  PENSION_SOURCES,
} from "../data/pension";
import { formatKRWShort } from "@shared/lib/format";

/* 연금계좌 개요 — 세제 한눈에 + 가입 시기 3세대 판별 + 연금저축/IRP 비교.
   3세대 판별표가 이 페이지의 핵심: 같은 「연금저축」이라도 가입 시기에 따라
   연금수령 시 과세가 완전히 달라지므로 창구에서 가장 먼저 확인해야 한다. */
const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="bg-white border border-stone-200 rounded-md p-4">
    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
      <Icon className="w-3.5 h-3.5 text-violet-600" />
      {label}
    </div>
    <div className="text-lg font-black text-stone-900 leading-tight">{value}</div>
    {sub && <div className="text-[11px] text-stone-500 mt-0.5">{sub}</div>}
  </div>
);

export const Overview = ({ onNavigate }) => (
  <div className="space-y-6">
    <div>
      <span className="text-xs uppercase tracking-widest text-violet-700 font-semibold">
        연금계좌 · 연금저축 + IRP
      </span>
      <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight mt-1">
        세제 한눈에
      </h1>
      <p className="text-sm text-stone-600 mt-1">
        {PENSION_META.lawRef} 기준 · {PENSION_META.verifiedNote}
      </p>
    </div>

    <div className="bg-amber-50/60 border-l-4 border-amber-500 px-4 py-2.5 rounded-r-sm text-xs text-stone-800 leading-relaxed">
      <strong>데모 모듈입니다.</strong> 세제는 소득세법, 수수료·상품 조건은 iM뱅크 공시자료(개인형IRP
      수수료율·연금저축신탁 핵심설명서)를 반영했습니다. 판매 중인 연금저축보험·펀드 라인업 등 나머지
      자사 상품 조건은 자료 확보 후 채워집니다.
    </div>

    {/* 세제 요약 */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={Coins}
        label="세액공제 한도"
        value={`합산 ${formatKRWShort(CREDIT_RULES.totalLimit)}`}
        sub={`연금저축 단독 ${formatKRWShort(CREDIT_RULES.pensionSavingLimit)}`}
      />
      <StatCard
        icon={Percent}
        label="공제율"
        value="16.5% / 13.2%"
        sub={`총급여 ${formatKRWShort(CREDIT_RULES.salaryThreshold)} 이하 / 초과`}
      />
      <StatCard
        icon={PiggyBank}
        label="납입한도"
        value={`연 ${formatKRWShort(CREDIT_RULES.contributionLimit)}`}
        sub="연금저축 + IRP 합산"
      />
      <StatCard
        icon={CalendarClock}
        label="연금수령 요건"
        value={`만 ${WITHDRAWAL_RULES.minAge}세 · ${WITHDRAWAL_RULES.minYears}년`}
        sub="연금소득세 3.3~5.5%"
      />
    </div>

    {/* ★ 가입 시기 3세대 판별 */}
    <div className="bg-white border-2 border-violet-300 rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-violet-200 bg-violet-50/60">
        <h2 className="text-sm font-bold text-stone-900">
          ★ 가입 시기부터 확인하세요 — 세금이 완전히 다릅니다
        </h2>
        <p className="text-[11px] text-stone-600 mt-0.5">
          같은 「연금저축」이라도 가입 시기에 따라 연금수령 시 과세가 달라집니다. 통장 개설일 조회가
          상담의 출발점입니다.
        </p>
      </div>
      <div className="divide-y divide-stone-100">
        {PENSION_GENERATIONS.map((g) => (
          <div key={g.id} className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-violet-800">{g.label}</span>
              <span className="text-[11px] font-semibold text-stone-500 tabular-nums">
                {g.period}
              </span>
              <span
                className={
                  g.taxFree
                    ? "rounded-sm bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800"
                    : "rounded-sm bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-600"
                }
              >
                수령 시 {g.onWithdrawal}
              </span>
            </div>
            <div className="mt-1 text-[12px] text-stone-600 leading-relaxed">
              납입 시 혜택: {g.benefit}
            </div>
            <div className="mt-0.5 text-[11.5px] text-stone-500 leading-relaxed">{g.note}</div>
          </div>
        ))}
      </div>
    </div>

    {/* 계산기 유도 */}
    <button
      onClick={() => onNavigate("calculator")}
      className="w-full text-left bg-gradient-to-br from-violet-50 via-white to-violet-50 border-2 border-violet-300 rounded-md p-5 hover:border-violet-400 transition-colors group"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-700 mb-1">
            <Coins className="w-3.5 h-3.5" />
            세일즈 계산기
          </div>
          <h3 className="text-base font-bold text-stone-900">
            "연말정산 때 얼마나 돌려받나요?" 즉시 계산
          </h3>
          <p className="text-[12px] text-stone-600 mt-1">
            소득과 납입액을 넣으면 환급액이 바로 나옵니다. 타사 연금저축이 600만원을 넘으면 초과분을
            IRP로 옮길 때의 추가 환급액까지 제시합니다.
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-violet-600 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>

    {/* 연금저축 vs IRP */}
    <div className="bg-white border border-stone-200 rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 bg-stone-50/60">
        <h2 className="text-sm font-bold text-stone-900">연금저축 vs IRP</h2>
        <p className="text-[11px] text-stone-500 mt-0.5">
          경쟁 상품이 아니라 세액공제 한도를 함께 채우는 짝입니다
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/40">
              <th className="px-4 py-2 text-left font-bold text-stone-600 w-28">구분</th>
              <th className="px-4 py-2 text-left font-bold text-violet-800">연금저축</th>
              <th className="px-4 py-2 text-left font-bold text-sky-800">IRP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {ACCOUNT_COMPARISON.map((row) => (
              <tr key={row.item}>
                <td className="px-4 py-2 font-semibold text-stone-600 align-top">{row.item}</td>
                <td className="px-4 py-2 text-stone-800 align-top">{row.saving}</td>
                <td className="px-4 py-2 text-stone-800 align-top">{row.irp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* 자사 상품 자리 placeholder */}
    <div className="border-2 border-dashed border-stone-300 rounded-md p-5 text-center">
      <FileText className="w-6 h-6 text-stone-300 mx-auto mb-2" />
      <div className="text-sm font-semibold text-stone-500">
        자사 연금저축·IRP 상품 조건 (일부 준비 중)
      </div>
      <p className="text-[12px] text-stone-500 mt-1 leading-relaxed">
        개인형IRP 수수료율·연금저축신탁 조건은 반영됨. 판매 중인 연금저축보험 공시이율, IRP
        원리금보장상품 라인업, 연금수령개시 신청 업무 절차는 자료 확보 후 보강.
      </p>
    </div>

    <button
      onClick={() => onNavigate("faq")}
      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-violet-700 hover:text-violet-800"
    >
      <HelpCircle className="w-4 h-4" />
      자주 묻는 질문 보기
    </button>

    {/* 출처 */}
    <div className="border-t border-stone-200 pt-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
        데이터 출처
      </div>
      <ul className="space-y-1">
        {PENSION_SOURCES.map((s, i) => (
          <li key={i} className="text-[11px] text-stone-500 leading-relaxed flex gap-1.5">
            <span className="text-stone-400">·</span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  </div>
);
