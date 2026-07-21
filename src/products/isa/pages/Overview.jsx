import { Percent, HelpCircle, PiggyBank, CalendarClock, Wallet, ArrowRight, FileText } from "lucide-react";
import { ISA_TYPES, ISA_RULES, ISA_ELIGIBILITY_NOTES, ISA_META } from "../data/isa";
import { formatKRWShort } from "@shared/lib/format";

/* ISA 개요 — 세제 한눈에 요약 + 가입 자격 확인 포인트 + 자사 상품 자리(placeholder).
   조특법 근거의 세제 정보 중심. 상세 상품 조건은 자사 자료 확보 후 채운다. */
const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="bg-white border border-stone-200 rounded-md p-4">
    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
      <Icon className="w-3.5 h-3.5 text-emerald-600" />
      {label}
    </div>
    <div className="text-lg font-black text-stone-900 leading-tight">{value}</div>
    {sub && <div className="text-[11px] text-stone-500 mt-0.5">{sub}</div>}
  </div>
);

export const Overview = ({ onNavigate }) => (
  <div className="space-y-6">
    <div>
      <span className="text-xs uppercase tracking-widest text-emerald-700 font-semibold">
        ISA · 개인종합자산관리계좌
      </span>
      <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight mt-1">
        세제 한눈에
      </h1>
      <p className="text-sm text-stone-600 mt-1">
        {ISA_META.lawRef} 기준 · {ISA_META.verifiedNote}
      </p>
    </div>

    {/* 데모 안내 배너 */}
    <div className="bg-amber-50/60 border-l-4 border-amber-500 px-4 py-2.5 rounded-r-sm text-xs text-stone-800 leading-relaxed">
      <strong>데모 모듈입니다.</strong> 세제 정보는 조세특례제한법 근거로 구성했으며, 자사 ISA 상품(중개형·신탁형)의 구체적 조건·수수료·운용 라인업은 자사 상품 자료 확보 후 채워집니다.
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
    <div className="bg-white border border-stone-200 rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 bg-stone-50/60">
        <h2 className="text-sm font-bold text-stone-900">유형별 비과세 한도</h2>
        <p className="text-[11px] text-stone-500 mt-0.5">계좌 내 손익통산 후 순이익 기준</p>
      </div>
      <div className="divide-y divide-stone-100">
        {ISA_TYPES.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex-shrink-0 w-24 text-sm font-bold text-emerald-700">{t.label}</div>
            <div className="flex-shrink-0 text-base font-black text-stone-900 tabular-nums">
              {formatKRWShort(t.taxFreeLimit)}
            </div>
            <div className="flex-1 text-[11px] text-stone-500 leading-snug">{t.eligibility}</div>
          </div>
        ))}
      </div>
    </div>

    {/* 계산기 유도 */}
    <button
      onClick={() => onNavigate("calculator")}
      className="w-full text-left bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border-2 border-emerald-300 rounded-md p-5 hover:border-emerald-400 transition-colors group"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
            <Percent className="w-3.5 h-3.5" />
            세일즈 계산기
          </div>
          <h3 className="text-base font-bold text-stone-900">
            "일반 예금보다 얼마나 이득?" 절세액 즉시 계산
          </h3>
          <p className="text-[12px] text-stone-600 mt-1">
            예금 원금·금리·기간을 넣으면 ISA 예금 vs 일반 예금의 세후 실수령·실효금리를 비교합니다. (펀드 등은 순이익 직접입력 모드)
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-emerald-600 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>

    {/* 가입 자격 확인 포인트 */}
    <div className="bg-white border border-stone-200 rounded-md p-4">
      <h2 className="text-sm font-bold text-stone-900 mb-2">상담 시 확인 포인트</h2>
      <ul className="space-y-1.5">
        {ISA_ELIGIBILITY_NOTES.map((n, i) => (
          <li key={i} className="flex gap-2 text-[13px] text-stone-700 leading-relaxed">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-500" />
            {n}
          </li>
        ))}
      </ul>
    </div>

    {/* 자사 상품 자리 placeholder */}
    <div className="border-2 border-dashed border-stone-300 rounded-md p-5 text-center">
      <FileText className="w-6 h-6 text-stone-300 mx-auto mb-2" />
      <div className="text-sm font-semibold text-stone-500">자사 ISA 상품 안내 (준비 중)</div>
      <p className="text-[12px] text-stone-400 mt-1 leading-relaxed">
        iM뱅크 중개형/신탁형 ISA 상품설명서·수수료·운용 라인업이 확보되면 이 자리에 채워집니다.
      </p>
    </div>

    <button
      onClick={() => onNavigate("faq")}
      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-700 hover:text-emerald-800"
    >
      <HelpCircle className="w-4 h-4" />
      자주 묻는 질문 보기
    </button>
  </div>
);
