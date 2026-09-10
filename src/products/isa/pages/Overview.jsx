import { Percent, HelpCircle, PiggyBank, CalendarClock, Wallet, ArrowRight, FileText, Megaphone } from "lucide-react";
import { ISA_TYPES, ISA_RULES, ISA_ELIGIBILITY_NOTES, ISA_META, ISA_SOURCES } from "../data/isa";
import { formatKRWShort } from "@shared/lib/format";

/* ISA 개요 — 세제 한눈에 요약 + 가입 자격 확인 포인트 + 자사 상품 자리(placeholder).
   조특법 근거의 세제 정보 중심. 상세 상품 조건은 자사 자료 확보 후 채운다. */
const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
      <Icon className="w-3.5 h-3.5 text-fuchsia-600" />
      {label}
    </div>
    <div className="text-lg font-black text-slate-900 leading-tight">{value}</div>
    {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
  </div>
);

export const Overview = ({ onNavigate }) => (
  <div className="space-y-6">
    <section className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/50 p-5 sm:p-6">
      <p className="text-sm font-bold text-fuchsia-700">예금 상담에서 ISA까지</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">같은 수익이라도 세금 차이를 비교해보세요</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">“예금하실 자금 중 여유 있게 두실 금액이 있다면, ISA로 운용할 때 세금을 얼마나 줄일 수 있는지 함께 계산해드릴까요?”</p>
      <button onClick={()=>onNavigate("calculator")} className="mt-4 min-h-11 rounded-lg bg-fuchsia-700 px-4 py-2 text-sm font-bold text-white">고객 금액으로 절세액 비교 →</button>
      <p className="mt-3 text-xs text-slate-500">같은 금리 가정의 세금 비교 · 신탁보수 차감 전</p>
    </section>
    {/* 세제 요약 스탯 */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={PiggyBank}
        label="납입한도"
        value={`연 ${formatKRWShort(ISA_RULES.annualLimit)}`}
        sub={`총 ${formatKRWShort(ISA_RULES.totalLimit)} · 미납입분 이월`}
      />
      <StatCard
        icon={CalendarClock}
        label="의무가입기간"
        value={`${ISA_RULES.minYears}년`}
        sub="경과 전 해지 시 혜택 소멸"
      />
      <StatCard
        icon={Percent}
        label="분리과세율"
        value="9.9%"
        sub="비과세 한도 초과분 (지방세 포함)"
      />
      <StatCard
        icon={Wallet}
        label="연금 전환"
        value="공제 대상 한도 추가"
        sub={`전환금액의 10% · 최대 ${formatKRWShort(ISA_RULES.pensionRolloverCap)}에 공제율 적용`}
      />
    </div>

    {/* 유형별 비과세 한도 */}
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60">
        <h2 className="text-sm font-bold text-slate-900">유형별 비과세 한도</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">계좌 내 손익통산 후 순이익 기준</p>
      </div>
      <div className="divide-y divide-slate-100">
        {ISA_TYPES.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="flex-shrink-0 w-28 text-sm font-bold text-fuchsia-700">{t.label}</div>
            <div className="flex-shrink-0 text-base font-black text-slate-900 tabular-nums">
              {formatKRWShort(t.taxFreeLimit)}
            </div>
            <div className="flex-1 text-[11px] text-slate-500 leading-snug">{t.eligibility}</div>
          </div>
        ))}
      </div>
    </div>

    {/* 바로가기 — 홈 대시보드 네비 */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[
        { id: "calculator", icon: Percent, title: "세제 절세 계산기", desc: "ISA vs 일반 예금 절세액 즉시 계산" },
        { id: "faq", icon: HelpCircle, title: "자주 묻는 질문", desc: "가입 자격·중도해지·만기 FAQ" },
        { id: "notices", icon: Megaphone, title: "공지사항", desc: "ISA 관련 부서 공지" },
      ].map((n) => {
        const Icon = n.icon;
        return (
          <button
            key={n.id}
            onClick={() => onNavigate(n.id)}
            className="text-left bg-white border border-slate-200 rounded-xl p-4 shadow-sm transition-all hover:border-fuchsia-300 hover:shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-700">
                <Icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-fuchsia-600 transition-transform group-hover:translate-x-0.5" />
            </div>
            <h3 className="mt-2.5 text-sm font-bold text-slate-900">{n.title}</h3>
            <p className="mt-0.5 text-[12px] text-slate-600 leading-relaxed">{n.desc}</p>
          </button>
        );
      })}
    </div>

    {/* 가입 자격 확인 포인트 */}
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900 mb-2">상담 시 확인 포인트</h2>
      <ul className="space-y-1.5">
        {ISA_ELIGIBILITY_NOTES.map((n, i) => (
          <li key={i} className="flex gap-2 text-[13px] text-slate-700 leading-relaxed">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-fuchsia-500" />
            {n}
          </li>
        ))}
      </ul>
    </div>

    {/* 출처 */}
    <details className="border-t border-slate-200 pt-4"><summary className="cursor-pointer text-sm font-semibold text-slate-600">근거 자료</summary>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
        데이터 출처
      </div>
      <ul className="space-y-1">
        {ISA_SOURCES.map((s, i) => (
          <li key={i} className="text-[11px] text-slate-500 leading-relaxed flex gap-1.5">
            <span className="text-slate-300">·</span>
            {s}
          </li>
        ))}
      </ul>
    </details>
  </div>
);
