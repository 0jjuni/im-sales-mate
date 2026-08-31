import { CardDeductionGuide } from "../components/CardDeductionGuide";

/* 카드 모듈 「소득공제」 탭 — 신용카드 소득공제 문턱 계산 + 카드 활용 전략. */
export const CardDeduction = () => (
  <div className="space-y-4">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">신용카드 소득공제</h1>
      <p className="mt-1 text-sm text-slate-600">
        고객의 연 총급여로 소득공제 문턱(총급여 25%)을 계산해, 어디까지 신용카드가 유리한지 안내합니다.
      </p>
    </div>

    <CardDeductionGuide ctaTo="/card" ctaLabel="카드 탐색으로" />

    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-[12.5px] leading-relaxed text-slate-600">
      <div className="mb-1 font-bold text-slate-800">한눈에</div>
      <ul className="space-y-1">
        <li>· 공제 대상: 총급여의 <strong className="text-slate-800">25% 초과분</strong>부터</li>
        <li>· 공제율: 신용카드 15% · 체크/현금영수증 30% · 전통시장·대중교통 40%</li>
        <li>· 공제한도: 총급여 7천만원 이하 300만원 / 초과 250만원 (전통시장·대중교통·도서공연 추가한도 별도)</li>
      </ul>
    </div>
  </div>
);
