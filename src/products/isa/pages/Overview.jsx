import { Percent, HelpCircle, PiggyBank, CalendarClock, Wallet, ArrowRight, FileText } from "lucide-react";
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
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
        세제 한눈에
      </h1>
      <p className="text-sm text-slate-600 mt-1">
        {ISA_META.lawRef} 기준 · {ISA_META.verifiedNote}
      </p>
    </div>

    {/* 데모 안내 배너 */}
    <div className="bg-amber-50/60 border-l-4 border-amber-500 px-4 py-2.5 rounded-r-sm text-xs text-slate-800 leading-relaxed">
      <strong>데모 모듈입니다.</strong> 세제는 조세특례제한법, 계약 조건(납입한도·중도해지·부득이한 사유·만기)은 iM뱅크 「개인종합자산관리계좌(신탁형) 약관」(2024.7.15), 예금 조건·금리는 iM뱅크 판매 ISA 정기예금 상품설명서를 반영했습니다. 신탁보수 확정 요율(약관에 요율 공란)·운용 라인업·일임형 조건은 추가 자료 확보 후 채워집니다.
    </div>

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
        value="10% 세액공제"
        sub={`전환금액의 10% (최대 ${formatKRWShort(ISA_RULES.pensionRolloverCap)})`}
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
          <div key={t.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex-shrink-0 w-28 text-sm font-bold text-fuchsia-700">{t.label}</div>
            <div className="flex-shrink-0 text-base font-black text-slate-900 tabular-nums">
              {formatKRWShort(t.taxFreeLimit)}
            </div>
            <div className="flex-1 text-[11px] text-slate-500 leading-snug">{t.eligibility}</div>
          </div>
        ))}
      </div>
    </div>

    {/* 계산기 유도 */}
    <button
      onClick={() => onNavigate("calculator")}
      className="w-full text-left bg-fuchsia-50/50 border border-fuchsia-200 rounded-xl p-5 shadow-sm transition-all hover:border-fuchsia-300 hover:shadow-md group"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-fuchsia-700 mb-1">
            <Percent className="w-3.5 h-3.5" />
            세일즈 계산기
          </div>
          <h3 className="text-base font-bold text-slate-900">
            "일반 예금보다 얼마나 이득?" 절세액 즉시 계산
          </h3>
          <p className="text-[12px] text-slate-600 mt-1">
            예금 원금·금리·기간을 넣으면 ISA 예금 vs 일반 예금의 세후 실수령·실효금리를 비교합니다. (펀드 등은 순이익 직접입력 모드)
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-fuchsia-600 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>

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

    {/* 자사 상품 자리 placeholder */}
    <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center">
      <FileText className="w-6 h-6 text-slate-300 mx-auto mb-2" />
      <div className="text-sm font-semibold text-slate-500">자사 신탁형 ISA 자료 (일부 준비 중)</div>
      <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
        신탁형 약관(계약조건·중도해지·부득이한 사유·만기)과 ISA 정기예금(금리·중도해지·예금자보호)은 반영됨. 신탁보수 확정 요율·운용 상품 라인업·일임형 조건은 추가 자료 확보 후 보강.
      </p>
    </div>

    <button
      onClick={() => onNavigate("faq")}
      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-fuchsia-700 hover:text-fuchsia-800"
    >
      <HelpCircle className="w-4 h-4" />
      자주 묻는 질문 보기
    </button>

    {/* 출처 */}
    <div className="border-t border-slate-200 pt-4">
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
    </div>
  </div>
);
