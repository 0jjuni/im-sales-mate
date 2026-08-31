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

    {/* 소득공제 기본 — 정의 리스트로 정돈 */}
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-[15px] font-bold text-slate-900">소득공제 기본</h2>
      <dl className="mt-3 divide-y divide-slate-100">
        {[
          ["공제 대상", "총급여의 25%를 초과해 사용한 금액"],
          ["공제율", "신용 15% · 체크/현금영수증 30% · 전통시장·대중교통 40%"],
          ["연 공제한도", "총급여 7천만원 이하 300만원 / 초과 250만원"],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
            <dt className="w-28 flex-shrink-0 text-[12.5px] font-bold text-slate-500">{k}</dt>
            <dd className="text-[13.5px] text-slate-800">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 border-t border-slate-100 pt-2 text-[11.5px] text-slate-400">
        전통시장·대중교통·도서공연 사용분은 위 한도와 별도로 추가 공제됩니다.
      </p>
    </div>

    <CardDeductionGuide ctaTo="/card" ctaLabel="카드 탐색으로" />
  </div>
);
