/* AI 모닝 브리핑 데이터 — 마켓 보드(지표) + 오늘 아침 필수 뉴스.
   지표는 실시간 조회(marketQuotes)로, 뉴스는 아래 BRIEFING.news에 정리해 둔다.
   화면 컴포넌트(MarketBoard·MorningNews)는 fetchMorningBriefing()의 반환 형태에만 의존한다.

   뉴스는 현재 사람이 갱신하는 주간 브리핑이다. 자동 수집으로 바꿀 때는
   fetchMorningBriefing() 본문에서 news만 교체하면 된다. */

import { fetchMarketQuotes } from "./marketQuotes";

/* 자동 수집 연동 — Apps Script 웹앱 /exec URL. 비우면(null) 아래 BRIEFING 목업 사용.
   dev(vite)는 CORS 때문에 공개 프록시(corsproxy) 경유, 배포는 api/briefing.js 서버리스 경유.
   URL을 바꾸면 api/briefing.js의 값도 함께 고칠 것. 설정: docs/morning-briefing/SETUP.md */
export const BRIEFING_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzYG7r1vMmMyLp0jquvndWvHhLx9lnf0ZWTSGUthJzNYhUNMF4tstYEiytT8DQbX6-dEQ/exec";

const DEV_PROXY = "https://corsproxy.io/?url=";
const briefingFetchUrl = () =>
  import.meta.env.DEV ? DEV_PROXY + encodeURIComponent(BRIEFING_ENDPOINT) : "/api/briefing";

/* 시트가 날짜를 Date로 자동변환해 긴 문자열로 올 수 있어 yyyy-mm-dd로 정규화 */
const normalizeDate = (v) => {
  const d = new Date(v);
  if (isNaN(d)) return BRIEFING.date;
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/* BriefingShape:
   {
     date: string(YYYY-MM-DD),
     session: string,                  // 예: "장 시작 전"
     markets: { label, value, change(number, %) }[],
     news: {
       id: string,
       importance: "high" | "normal", // high = 필수(오늘 반드시 인지), normal = 체크
       category: string,              // 금리 · 대출규제 · 세제 · 퇴직연금 …
       headline: string,
       summary: string,               // 1~2문장 사실 요약
       pbNote: string,                // 상담 포인트 — 고객 응대에 갖는 의미
       source: string                 // 출처 · 시점
     }[]
   } */
const BRIEFING = {
  date: "2026-07-31",
  session: "이번 주 주요 이슈",
  /* 실시간 조회 실패 시에만 쓰이는 대체 표시값 */
  markets: [
    { label: "KOSPI", value: "—", change: 0 },
    { label: "KOSDAQ", value: "—", change: 0 },
    { label: "S&P 500", value: "—", change: 0 },
    { label: "나스닥", value: "—", change: 0 },
    { label: "USD/KRW", value: "—", change: 0 },
    { label: "미 국채 10년", value: "—", change: 0 },
  ],
  news: [
    {
      id: "n1",
      importance: "high",
      category: "금리",
      headline: "한국은행 기준금리 2.75%로 인상 — 금통위원 전원 찬성",
      summary:
        "7월 16일 금융통화위원회가 기준금리를 연 2.50%에서 2.75%로 0.25%p 올렸습니다. 물가 상승 압력이 이어지는 가운데 가계부채와 수도권 주택가격 오름세를 함께 고려한 결정으로, 인상 의견은 만장일치였습니다.",
      pbNote:
        "예금 만기 고객의 재예치 상담이 늘어날 시점입니다. 변동금리 대출을 쓰는 고객은 다음 금리 변동일에 이자가 얼마나 오르는지부터 물어볼 수 있으니, 상환 부담 변화를 숫자로 보여 주세요.",
      source: "한국은행 금통위 · 7월 16일",
    },
    {
      id: "n2",
      importance: "high",
      category: "대출규제",
      headline: "스트레스 DSR 3단계 시행 중 — 지역별 적용 단계가 다릅니다",
      summary:
        "수도권과 규제지역 주택담보대출에는 스트레스 DSR 3단계가 적용되고, 지방 주담대는 부동산 경기를 고려해 2단계 유예가 이어졌습니다. DSR 한도는 1금융권 40%, 2금융권 50%입니다.",
      pbNote:
        "같은 소득이라도 담보 물건 소재지에 따라 한도가 달라집니다. 한도를 먼저 말하지 말고 물건 소재지와 적용 단계를 확인한 뒤 산출하세요.",
      source: "금융위원회 가계부채 관리방안",
    },
    {
      id: "n3",
      importance: "normal",
      category: "대출규제",
      headline: "가계대출 총량 목표 1.5% — 하반기 취급 여력 축소",
      summary:
        "올해 가계대출 증가율 목표가 1.5%로 제시되면서 은행권 취급 여력이 상반기보다 빠듯해졌습니다. DSR 소득 산정 시 성과급처럼 변동이 큰 소득을 3년 평균으로 보는 방안도 검토되고 있습니다.",
      pbNote:
        "실행 시기를 미루면 조건이 나아질 것이라고 안내하지 마세요. 성과급 비중이 큰 고객은 소득 산정 기준이 바뀔 수 있다는 점만 사실대로 알리고, 확정 전 사항임을 덧붙이면 됩니다.",
      source: "금융당국 가계부채 점검회의",
    },
    {
      id: "n4",
      importance: "normal",
      category: "퇴직연금",
      headline: "퇴직연금 도입 단계적 의무화 시동 — 기금형 도입도 추진",
      summary:
        "퇴직연금 도입을 사업장 규모에 따라 단계적으로 의무화하는 작업이 7월부터 본격화됐습니다. 수익률을 끌어올리기 위한 기금형 퇴직연금 도입과 연금 형태 수령 확대도 함께 추진됩니다.",
      pbNote:
        "사업장 고객이 도입 시기와 절차를 물어볼 수 있습니다. IRP 계좌만 먼저 열어 두려는 개인 고객에게는 연금계좌 모듈의 세액공제 계산기로 올해 환급액을 계산해 보여 주세요.",
      source: "고용노동부 · 금융위원회",
    },
    {
      id: "n5",
      importance: "normal",
      category: "세제",
      headline: "세법개정 논의에 ISA 한도 확대 거론 — 아직 확정 전",
      summary:
        "세법개정 논의 과정에서 ISA 납입한도와 비과세 한도를 늘리는 방안이 거론되고 있습니다. 정부안 확정과 국회 통과를 거쳐야 하므로 현재 적용 한도는 종전과 같습니다.",
      pbNote:
        "확대를 전제로 안내하면 안 됩니다. 지금 가입해도 한도가 늘면 그때부터 적용된다는 정도로만 설명하고, 확정 여부는 국회 통과 후 안내한다고 선을 그으세요.",
      source: "세법개정 논의 · 확정 전",
    },
  ],
};

/* 엔드포인트에서 발행된 뉴스를 가져온다. 없거나 형태가 어긋나면 null → 목업으로 후퇴.
   창구에 쓰이는 정보라, 형태 검증에 실패하면 조용히 목업을 쓰는 편이 안전하다. */
async function fetchLiveNews() {
  if (!BRIEFING_ENDPOINT) return null;
  try {
    const res = await fetch(briefingFetchUrl(), { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const news = data?.news;
    if (!Array.isArray(news) || news.length === 0) return null;
    /* 각 항목이 최소 형태(headline·summary)를 갖췄는지 확인 — 부분 손상 방지 */
    if (!news.every((n) => n && n.headline && n.summary)) return null;
    return {
      date: normalizeDate(data.date),
      session: data.session ?? BRIEFING.session,
      news,
    };
  } catch {
    return null;
  }
}

/* 브리핑을 가져온다. 성공 시 BriefingShape를 resolve.
   지표는 실시간 조회, 뉴스는 엔드포인트(있으면) 또는 목업. 어느 쪽이 실패해도 나머지는 보인다. */
export async function fetchMorningBriefing() {
  const [quotes, live] = await Promise.all([
    fetchMarketQuotes().catch(() => null),
    fetchLiveNews(),
  ]);

  const base = live
    ? { ...BRIEFING, date: live.date, session: live.session, news: live.news }
    : BRIEFING;

  if (!quotes) {
    return { ...base, marketsLive: false };
  }

  return {
    ...base,
    markets: quotes.markets,
    marketsLive: true,
    marketsAsOf: quotes.asOf,
  };
}
