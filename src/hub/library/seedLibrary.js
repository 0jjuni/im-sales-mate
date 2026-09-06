/* 지식 라이브러리 시드 — 실제 사내 게시판 톤의 예시 채널 3개와 글.
   사용자가 언급한 실제 운영 형태를 그대로 모델링:
   · 모닝 브리핑(아침 시황)  · 문샷 데일리(전일 등락 카드뉴스)  · WM 코멘트(상담용 시장 의견)

   날짜는 오늘 기준 상대값으로 생성 — 항상 최근 글처럼 보인다.
   post.cards = 카드뉴스형 등락 타일(선택). post.images = 업로드 이미지(선택, 시드는 미사용). */

const DAY = 86400000;

/* 오늘 이전 n번째 영업일(주말 제외). 서로 다른 날이 겹치지 않게 강하게 뒤로 센다. */
const businessDaysAgo = (n) => {
  const d = new Date();
  d.setHours(8, 0, 0, 0);
  let count = 0;
  while (count < n) {
    d.setDate(d.getDate() - 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) count += 1;
  }
  return d;
};

const fmtMD = (d) => `${d.getMonth() + 1}월 ${d.getDate()}일`;

export function buildLibrarySeed() {
  const now = Date.now();

  const channels = [
    {
      id: "ch_morning",
      name: "모닝 브리핑",
      emoji: "☀️",
      category: "아침 시황",
      desc: "매일 아침, 간밤 해외증시와 국내 개장 관전 포인트를 한 장으로 정리합니다.",
      author: "리서치센터 강민석 위원",
      subscribers: 142,
      createdAt: now - 120 * DAY,
    },
    {
      id: "ch_moonshot",
      name: "문샷 데일리",
      emoji: "🚀",
      category: "데일리 리포트",
      desc: "전일 시장에서 오른 종목·내린 종목을 카드뉴스로 짧게 정리합니다. (문상현 과장)",
      author: "문상현 과장",
      subscribers: 88,
      createdAt: now - 60 * DAY,
    },
    {
      id: "ch_wm",
      name: "WM 코멘트",
      emoji: "💬",
      category: "WM 코멘트",
      desc: "지수 급변·이슈 발생 시 상담에서 바로 쓸 수 있는 해설과 고객 응대 포인트를 올립니다.",
      author: "WM센터 박지영 차장",
      subscribers: 210,
      createdAt: now - 90 * DAY,
    },
  ];

  /* 글 — dRel(평일 기준 며칠 전)로 날짜 생성, 제목·본문에 그 날짜를 반영 */
  const d1 = businessDaysAgo(1);
  const d2 = businessDaysAgo(2);

  const posts = [
    /* 모닝 브리핑 */
    {
      id: "p_morning_1",
      channelId: "ch_morning",
      author: "리서치센터 강민석 위원",
      createdAt: d1.getTime(),
      title: `${fmtMD(d1)} 아침 시황 | 美 고용지표 앞두고 관망세`,
      body:
        "간밤 뉴욕증시는 고용지표 발표를 앞두고 혼조 마감했습니다(다우 -0.2%, 나스닥 +0.3%). 미 국채 10년물 금리는 소폭 상승, 달러는 강세였습니다.\n\n" +
        "[오늘 관전 포인트]\n" +
        "· 반도체 업황 회복 기대에 외국인 순매수가 이어질지\n" +
        "· 원/달러 환율 1,300원대 중반 흐름과 수출주 영향\n" +
        "· 오후 발표되는 미 고용지표 경계로 장중 변동성 확대 가능\n\n" +
        "[창구 팁] 변동성 국면에서 예금 만기 고객에게는 분할 재예치·ISA 활용을 함께 안내하기 좋습니다.",
    },
    {
      id: "p_morning_2",
      channelId: "ch_morning",
      author: "리서치센터 강민석 위원",
      createdAt: d2.getTime(),
      title: `${fmtMD(d2)} 아침 시황 | 반도체 강세에 코스피 반등`,
      body:
        "전일 코스피는 반도체 대형주 강세에 +0.9% 반등 마감했습니다. 외국인이 현·선물 동반 순매수로 지수를 끌어올렸습니다.\n\n" +
        "[체크] 2차전지는 차익실현 매물로 약세. 업종별 온도차가 큰 장세이니, 목표수익률 관리 고객은 리밸런싱 시점을 점검해 주세요.",
    },
    /* 문샷 데일리 — 카드뉴스형 등락 타일 */
    {
      id: "p_moonshot_1",
      channelId: "ch_moonshot",
      author: "문상현 과장",
      createdAt: d1.getTime() + 3600000,
      title: `${fmtMD(d1)} 문샷 데일리 | 전일 등락 한눈에`,
      body: "전일 코스피 +0.4% / 코스닥 -0.2%. 반도체는 웃고, 2차전지는 쉬어간 하루였습니다.",
      cards: [
        { name: "삼성전자", change: "+2.1%", dir: "up" },
        { name: "SK하이닉스", change: "+3.4%", dir: "up" },
        { name: "현대차", change: "+1.2%", dir: "up" },
        { name: "LG에너지솔루션", change: "-1.8%", dir: "down" },
        { name: "POSCO홀딩스", change: "-1.2%", dir: "down" },
        { name: "네이버", change: "-0.6%", dir: "down" },
      ],
    },
    /* WM 코멘트 — 상담용 해설 */
    {
      id: "p_wm_1",
      channelId: "ch_wm",
      author: "WM센터 박지영 차장",
      createdAt: d1.getTime() + 5400000,
      title: `${fmtMD(d1)} 코스피 하락에 대한 의견`,
      body:
        "오늘 장중 코스피가 한때 1% 넘게 밀렸습니다. 배경은 (1) 미 고용지표 경계, (2) 최근 반등에 따른 단기 차익실현이며, 특정 악재라기보다 이벤트 대기 성격의 조정으로 봅니다.\n\n" +
        "[고객 응대 포인트]\n" +
        "· \"왜 떨어졌나\" 문의: 지표 발표 전 관망세 때문이며 추세 훼손은 아니라고 설명\n" +
        "· 불안해하는 고객: 변동성 국면일수록 분할매수·적립식·ISA(비과세) 활용이 유리함을 안내\n" +
        "· 목표수익률 도달 고객: 일부 차익실현 후 재진입 여력 확보도 하나의 선택지\n\n" +
        "※ 특정 종목 매수·매도 권유가 아닌 시황 해설입니다. 상담 시 참고로만 활용하세요.",
    },
  ];

  /* 기본 구독 — 모닝 브리핑·WM 코멘트는 구독한 상태로 시작(구독 피드 체험),
     문샷 데일리는 미구독으로 두어 「둘러보기 → 구독」 흐름을 보여 준다. */
  const subs = ["ch_morning", "ch_wm"];

  return { channels, posts, subs };
}
