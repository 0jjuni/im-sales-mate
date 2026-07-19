/* AI 모닝 시황 브리핑 데이터.
   현재는 더미 데이터. 나중에 구글시트 API로 교체할 때는 fetchMorningBriefing()
   함수 본문만 바꾸면 되도록 fetch 부분을 분리해 두었다.
   카드 컴포넌트는 이 함수의 반환 형태(BriefingShape)에만 의존한다. */

/* 구글시트 연동 시 사용할 엔드포인트 — 확정되면 여기만 설정.
   예: Apps Script 웹앱 URL 또는 Sheets API v4 values 엔드포인트 */
export const BRIEFING_ENDPOINT = null;

/* BriefingShape:
   {
     date: string(YYYY-MM-DD),
     session: string,          // 예: "장 시작 전"
     headline: string,
     summary: string,
     markets: { label, value, change(number, %) }[],
     talkingPoints: string[],  // AI가 뽑아낸 상담 화두
     source: string
   } */
const DUMMY_BRIEFING = {
  date: "2026-07-20",
  session: "장 시작 전",
  headline: "미국 물가 둔화에 위험선호 회복 — 반도체·금융 강세 흐름",
  summary:
    "간밤 뉴욕증시는 6월 소비자물가 둔화로 3대 지수가 동반 상승했습니다. 9월 금리 인하 기대가 확대되며 성장주와 장기채가 강세를 보였고, 국내 증시도 외국인 순매수 전환 기대가 나옵니다.",
  markets: [
    { label: "KOSPI", value: "2,742.10", change: 0.82 },
    { label: "KOSDAQ", value: "845.30", change: 1.14 },
    { label: "S&P 500", value: "5,630.40", change: 0.65 },
    { label: "나스닥", value: "18,420.10", change: 0.98 },
    { label: "USD/KRW", value: "1,352.0", change: -0.35 },
    { label: "WTI", value: "78.20", change: -0.9 },
  ],
  talkingPoints: [
    "미 6월 CPI 3.0%로 예상 하회 — 금리 인하 기대 확대. 성장주·장기채·연금 포트폴리오에 우호적 환경.",
    "반도체 업황 개선 신호로 외국인 순매수 전환 가능성. 관련 테마·ETF 문의에 대비하세요.",
    "원/달러 1,350원대 등락 — 환헤지형 상품 안내 시 환율 변동성을 반드시 함께 설명하세요.",
  ],
  source: "더미 데이터 (구글시트 연동 예정)",
};

/* 시황 브리핑을 가져온다. 성공 시 BriefingShape를 resolve.
   ── 구글시트 연동 시 이 함수 본문만 교체 ──
   const res = await fetch(BRIEFING_ENDPOINT);
   if (!res.ok) throw new Error(`시트 응답 오류: ${res.status}`);
   const rows = await res.json();
   return normalizeBriefing(rows);   // 시트 행 → BriefingShape 변환 함수 별도 작성 */
export async function fetchMorningBriefing() {
  // 네트워크 지연을 흉내내 로딩 UI가 실제로 보이도록 처리(연동 후 제거 가능).
  await new Promise((resolve) => setTimeout(resolve, 450));
  return DUMMY_BRIEFING;
}
