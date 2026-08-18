/* 허브 대시보드 표면 토큰 — 모서리·테두리·그림자 일관성 락(shape / elevation lock).
   허브의 모든 콘텐츠 카드가 같은 재질 언어를 쓰도록 한 곳에서만 정의한다.
   여기만 고치면 대시보드 전 섹션의 카드 질감이 한 번에 바뀐다.

   규칙
   · 콘텐츠 카드   = rounded-xl
   · 작은 배지·칩  = rounded-md
   · 인터랙티브 pill = rounded-full
   그림자는 순수 검정 대신 옅게(정지) / 민트 색조(호버)로 깔아 프리미엄 깊이감을 낸다.
   호버 시 테두리 색(민트·모듈색)은 각 컴포넌트에서 덧붙인다. */

/** 정적 카드 — 클릭 대상이 아님 */
export const CARD =
  "rounded-xl border border-slate-200 bg-white shadow-sm";

/** 클릭 가능한 카드 — 호버 시 살짝 떠오르며 민트 색조 그림자가 깔린다 */
export const CARD_INTERACTIVE =
  "group rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 " +
  "hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(6,161,137,0.28)]";
