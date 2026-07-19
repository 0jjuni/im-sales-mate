/* AI 모닝 브리핑 데이터 — 마켓 보드(지표) + 오늘 아침 필수 뉴스.
   현재는 더미 데이터. 구글시트 API로 교체할 때는 fetchMorningBriefing()
   함수 본문만 바꾸면 되도록 fetch 부분을 분리해 두었다.
   화면 컴포넌트(MarketBoard·MorningNews)는 이 함수의 반환 형태에만 의존한다. */

/* 구글시트 연동 시 사용할 엔드포인트 — 확정되면 여기만 설정.
   예: Apps Script 웹앱 URL 또는 Sheets API v4 values 엔드포인트 */
export const BRIEFING_ENDPOINT = null;

/* BriefingShape:
   {
     date: string(YYYY-MM-DD),
     session: string,                  // 예: "장 시작 전"
     markets: { label, value, change(number, %) }[],
     news: {
       id: string,
       importance: "high" | "normal", // high = 필수(오늘 반드시 인지), normal = 체크
       category: string,              // 금리 · 대출규제 · 세제 · 환율 · 업계 …
       headline: string,
       summary: string,               // 1~2문장 사실 요약
       pbNote: string,                // 상담 포인트 — 고객 응대에 갖는 의미
       source: string                 // 출처 · 시각
     }[]
   } */
const DUMMY_BRIEFING = {
  date: "2026-07-20",
  session: "장 시작 전",
  markets: [
    { label: "KOSPI", value: "2,742.10", change: 0.82 },
    { label: "KOSDAQ", value: "845.30", change: 1.14 },
    { label: "S&P 500", value: "5,630.40", change: 0.65 },
    { label: "나스닥", value: "18,420.10", change: 0.98 },
    { label: "USD/KRW", value: "1,352.0", change: -0.35 },
    { label: "국고채 3년", value: "2.84%", change: -0.02 },
  ],
  news: [
    {
      id: "n1",
      importance: "high",
      category: "금리",
      headline: "미 6월 CPI 3.0% 예상 하회 — 9월 금리 인하 기대 급부상",
      summary:
        "간밤 발표된 미국 6월 소비자물가가 예상을 밑돌며 연준의 9월 인하 확률이 80%대로 올라섰습니다. 미 국채 금리는 전 구간 하락했습니다.",
      pbNote:
        "예금 만기 도래 고객 재예치 상담 시 금리 하락 가능성을 함께 안내하세요. 장기 확정금리 상품·채권형 관심 문의가 늘 수 있습니다.",
      source: "연합인포맥스 · 07:10",
    },
    {
      id: "n2",
      importance: "high",
      category: "대출규제",
      headline: "스트레스 DSR 3단계 다음 달 시행 — 한도 축소 본격화",
      summary:
        "금융당국이 다음 달부터 스트레스 DSR 3단계를 예정대로 시행한다고 밝혔습니다. 변동금리 주담대 한도가 추가로 줄어듭니다.",
      pbNote:
        "이번 주 주담대·전세대출 한도 문의가 몰릴 수 있습니다. 시행 전후 한도 차이를 수치로 준비해 두세요.",
      source: "금융위 보도자료 · 06:40",
    },
    {
      id: "n3",
      importance: "normal",
      category: "세제",
      headline: "이번 주 세법개정안 발표 — ISA 한도 확대·연금 과세 손질 거론",
      summary:
        "기획재정부가 이번 주 세법개정안을 발표합니다. ISA 납입한도 확대와 연금소득 분리과세 기준 상향이 거론되고 있습니다.",
      pbNote:
        "확정 전 사항입니다. 고객에게는 「국회 통과 후 확정」 화법으로 단정 안내를 피하세요.",
      source: "기재부 출입기자단 · 어제 18:30",
    },
    {
      id: "n4",
      importance: "normal",
      category: "환율",
      headline: "원/달러 1,350원대 등락 — 반기 배당 역송금 수요 겹쳐",
      summary:
        "달러 약세에도 외국인 배당 역송금 수요로 원화 강세 폭은 제한되고 있습니다. 주중 1,340~1,360원 등락 전망이 우세합니다.",
      pbNote:
        "환전·해외송금 타이밍 문의에 대비하세요. 환헤지형 상품 안내 시 변동성 설명은 필수입니다.",
      source: "서울외환시장 · 07:00",
    },
    {
      id: "n5",
      importance: "normal",
      category: "업계",
      headline: "퇴직연금 실물이전 경쟁 심화 — 은행권 수수료 인하 릴레이",
      summary:
        "실물이전 제도 시행 이후 은행·증권사 간 IRP 유치 경쟁이 이어지며 수수료 인하와 이전 이벤트가 확대되고 있습니다.",
      pbNote:
        "IRP 타사 이전 문의가 늘고 있습니다. 자행 유지 강점(수수료·운용라인업)을 한 장으로 정리해 두면 좋습니다.",
      source: "금융권 종합 · 어제 17:20",
    },
  ],
};

/* 브리핑을 가져온다. 성공 시 BriefingShape를 resolve.
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
