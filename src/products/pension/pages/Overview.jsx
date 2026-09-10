import { Coins, HelpCircle, PiggyBank, CalendarClock, Percent, ArrowRight, FileText, Megaphone } from "lucide-react";
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
  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
      <Icon className="w-3.5 h-3.5 text-violet-600" />
      {label}
    </div>
    <div className="text-lg font-black text-slate-900 leading-tight">{value}</div>
    {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
  </div>
);

export const Overview = ({ onNavigate, incomeType }) => (
  <div className="space-y-6">
    <section className="rounded-xl border border-violet-100 bg-violet-50/50 p-5 sm:p-6">
      <p className="text-sm font-bold text-violet-700">신규·추가 납입 상담</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">노후 준비와 올해 세액공제를 함께</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">“{incomeType === "근로소득자" ? "연말정산" : incomeType === "개인사업자" ? "종합소득세 신고" : "세금 신고"} 때 세금 부담이 있으셨다면 연금으로 준비해보시는 건 어떠세요? 올해 이미 납입하신 금액을 반영해 추가 납입 효과를 계산해드릴게요.”</p>
      <button onClick={()=>onNavigate("calculator")} className="mt-4 min-h-11 rounded-lg bg-violet-700 px-4 py-2 text-sm font-bold text-white">납입액으로 세액공제 계산 →</button>
    </section>
    {/* 세제 요약 */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={Coins}
        label="세액공제 대상 납입한도"
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

    {/* 바로가기 — 홈 대시보드 네비 */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[
        { id: "calculator", icon: Coins, title: "세액공제 계산기", desc: "납입액에 따른 예상 세액공제액 계산" },
        { id: "faq", icon: HelpCircle, title: "자주 묻는 질문", desc: "세액공제·중도해지·연금수령 FAQ" },
        { id: "notices", icon: Megaphone, title: "공지사항", desc: "연금 관련 부서 공지" },
      ].map((n) => {
        const Icon = n.icon;
        return (
          <button
            key={n.id}
            onClick={() => onNavigate(n.id)}
            className="text-left bg-white border border-slate-200 rounded-xl p-4 shadow-sm transition-all hover:border-violet-300 hover:shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <Icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-violet-600 transition-transform group-hover:translate-x-0.5" />
            </div>
            <h3 className="mt-2.5 text-sm font-bold text-slate-900">{n.title}</h3>
            <p className="mt-0.5 text-[12px] text-slate-600 leading-relaxed">{n.desc}</p>
          </button>
        );
      })}
    </div>

    <section id="pension-new" className="scroll-mt-24 rounded-xl border border-slate-200 p-5">
      <h2 className="text-base font-bold text-slate-900">어느 계좌로 준비할까요?</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">{[["자금 사용 계획","노후 전에 쓸 돈은 따로 두고, 중도 인출·해지 조건을 비교하세요."],["운용할 상품","고객이 원하는 운용 방식과 계좌별 편입 가능한 상품을 살펴보세요."],["비용 비교","가입 경로에 따른 계좌 수수료와 편입 상품 비용을 함께 비교하세요."]].map(([title,body])=><div key={title}><h3 className="text-sm font-bold text-violet-800">{title}</h3><p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p></div>)}</div>
    </section>
    {/* 연금저축 vs IRP */}
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60">
        <h2 className="text-sm font-bold text-slate-900">연금저축 vs IRP</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          경쟁 상품이 아니라 세액공제 한도를 함께 채우는 짝입니다
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/40">
              <th className="px-4 py-2 text-left font-bold text-slate-600 w-28">구분</th>
              <th className="px-4 py-2 text-left font-bold text-violet-800">연금저축</th>
              <th className="px-4 py-2 text-left font-bold text-sky-800">IRP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ACCOUNT_COMPARISON.map((row) => (
              <tr key={row.item}>
                <td className="px-4 py-2 font-semibold text-slate-600 align-top">{row.item}</td>
                <td className="px-4 py-2 text-slate-800 align-top">{row.saving}</td>
                <td className="px-4 py-2 text-slate-800 align-top">{row.irp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* ★ 가입 시기 3세대 판별 */}
    <div id="pension-existing" className="scroll-mt-24 bg-white border border-violet-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-violet-200 bg-violet-50/60">
        <h2 className="text-sm font-bold text-slate-900">
          기존 계좌는 가입 시기부터 확인
        </h2>
        <p className="text-[11px] text-slate-600 mt-0.5">
          같은 「연금저축」이라도 가입 시기에 따라 연금수령 시 과세가 달라집니다. 통장 개설일 조회가
          기존 계좌 상담의 출발점입니다.
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {PENSION_GENERATIONS.map((g) => (
          <div key={g.id} className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-violet-800">{g.label}</span>
              <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                {g.period}
              </span>
              <span
                className={
                  g.taxFree
                    ? "rounded-sm bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800"
                    : "rounded-sm bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600"
                }
              >
                수령 시 {g.onWithdrawal}
              </span>
            </div>
            <div className="mt-1 text-[12px] text-slate-600 leading-relaxed">
              납입 시 혜택: {g.benefit}
            </div>
            <div className="mt-0.5 text-[11.5px] text-slate-500 leading-relaxed">{g.note}</div>
          </div>
        ))}
      </div>
    </div>

    <section id="pension-withdrawal" className="scroll-mt-24 rounded-xl border border-slate-200 p-5">
      <h2 className="text-base font-bold text-slate-900">연금 수령 계획</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">“언제부터 매월 얼마씩 받으실 계획인가요? 보유하신 계좌의 가입일과 퇴직금 입금 여부를 함께 살펴보고 수령 조건을 안내해드릴게요.”</p>
      <button onClick={()=>onNavigate("faq")} className="mt-3 min-h-11 rounded-lg border border-violet-200 px-3 py-2 text-sm font-bold text-violet-700">연금 수령·중도해지 FAQ →</button>
    </section>
    {/* 출처 */}
    <details className="border-t border-slate-200 pt-4"><summary className="cursor-pointer text-sm font-semibold text-slate-600">근거 자료</summary>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
        데이터 출처
      </div>
      <ul className="space-y-1">
        {PENSION_SOURCES.map((s, i) => (
          <li key={i} className="text-[11px] text-slate-500 leading-relaxed flex gap-1.5">
            <span className="text-slate-400">·</span>
            {s}
          </li>
        ))}
      </ul>
    </details>
  </div>
);
