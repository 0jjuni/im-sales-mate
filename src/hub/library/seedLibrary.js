/* 지식 라이브러리 시드 — 실제 사내 게시판 톤의 예시 채널과 글.
   사용자가 언급한 실제 운영 형태를 그대로 모델링:
   · 모닝 브리핑(아침 시황)  · 마켓 데일리(전일 등락 카드뉴스)  · WM 코멘트(상담용 시장 의견)
   · 알기 쉬운 세무상식(WM사업부 세무전문위원)

   날짜는 오늘 기준 상대값으로 생성 — 항상 최근 글처럼 보인다.
   채널 아이콘은 이모지 대신 아이콘 키(icon) + 강조색(color)으로 표현(엔터프라이즈 톤).
   post.images = 업로드 이미지(data URL). post.cards = 텍스트형 등락 타일(선택). */

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

/* 마켓 데일리 카드뉴스 예시 이미지 — 실제 업로드처럼 보이도록 SVG를 data URL로 생성.
   업로드 이미지 렌더 경로(post.images)를 시드에서 바로 보여 주기 위한 것. */
const moonshotCardImage = (dateLabel) => {
  const movers = [
    { name: "삼성전자", chg: "+2.1%", up: true, w: 0.62 },
    { name: "SK하이닉스", chg: "+3.4%", up: true, w: 1.0 },
    { name: "현대차", chg: "+1.2%", up: true, w: 0.35 },
    { name: "LG에너지솔루션", chg: "-1.8%", up: false, w: 0.53 },
  ];
  const rows = movers
    .map((m, i) => {
      const y = 296 + i * 104;
      const col = m.up ? "#e11d48" : "#2563eb";
      const barW = Math.round(360 * m.w);
      return `
        <text x='48' y='${y}' fill='#0f172a' font-size='30' font-weight='700'>${m.name}</text>
        <text x='592' y='${y}' fill='${col}' font-size='30' font-weight='800' text-anchor='end'>${m.chg}</text>
        <rect x='48' y='${y + 16}' width='496' height='8' rx='4' fill='#f1f5f9'/>
        <rect x='48' y='${y + 16}' width='${barW}' height='8' rx='4' fill='${col}'/>`;
    })
    .join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='800' viewBox='0 0 640 800' font-family='Pretendard, Noto Sans KR, sans-serif'>
    <rect width='640' height='800' fill='#ffffff'/>
    <rect width='640' height='168' fill='#0f172a'/>
    <circle cx='566' cy='60' r='60' fill='#1e293b'/>
    <text x='48' y='78' fill='#ffffff' font-size='42' font-weight='800'>마켓 데일리</text>
    <text x='48' y='122' fill='#94a3b8' font-size='24' font-weight='600'>${dateLabel} · 전일 시장 등락 요약</text>
    <text x='48' y='236' fill='#0f172a' font-size='26' font-weight='800'>전일 등락 TOP</text>
    ${rows}
    <text x='48' y='756' fill='#cbd5e1' font-size='20' font-weight='700' letter-spacing='2'>MARKET DAILY · iM</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
};

export function buildLibrarySeed() {
  const now = Date.now();
  const d1 = businessDaysAgo(1);
  const d2 = businessDaysAgo(2);

  const channels = [
    {
      id: "ch_morning",
      name: "모닝 브리핑",
      icon: "sunrise",
      color: "amber",
      category: "아침 시황",
      dept: "리서치센터",
      desc: "매일 아침, 간밤 해외증시와 국내 개장 관전 포인트를 한 장으로 정리합니다.",
      author: "리서치센터 강민석 위원",
      subscribers: 141,
      createdAt: now - 120 * DAY,
    },
    {
      id: "ch_moonshot",
      name: "마켓 데일리",
      icon: "trending",
      color: "rose",
      category: "데일리 리포트",
      dept: "WM사업부",
      desc: "전일 시장에서 오른 종목·내린 종목을 카드뉴스로 짧게 정리합니다.",
      author: "WM사업부 오세훈 대리",
      subscribers: 88,
      createdAt: now - 60 * DAY,
    },
    {
      id: "ch_wm",
      name: "WM 코멘트",
      icon: "comment",
      color: "violet",
      category: "WM 코멘트",
      dept: "WM센터",
      desc: "지수 급변·이슈 발생 시 상담에서 바로 쓸 수 있는 해설과 고객 응대 포인트를 올립니다.",
      author: "WM센터 박지영 차장",
      subscribers: 209,
      createdAt: now - 90 * DAY,
    },
    {
      id: "ch_tax",
      name: "알기 쉬운 세무상식",
      icon: "lightbulb",
      color: "teal",
      category: "세무 상식",
      dept: "WM사업부",
      desc: "상담에서 자주 나오는 세무·절세 개념을 창구 직원 눈높이로 쉽게 풀어 드립니다.",
      author: "WM사업부 정세라 세무전문위원",
      subscribers: 173,
      createdAt: now - 75 * DAY,
    },
  ];

  const posts = [
    /* 모닝 브리핑 */
    {
      id: "p_morning_1",
      tags: ["아침시황", "코스피", "미국증시", "환율"],
      channelId: "ch_morning",
      author: "리서치센터 강민석 위원",
      createdAt: d1.getTime(),
      title: `${fmtMD(d1)} 아침 시황 | 美 고용지표 앞두고 관망세`,
      body:
        "<p>간밤 뉴욕증시는 고용지표 발표를 앞두고 <strong>혼조 마감</strong>했습니다(다우 -0.2%, 나스닥 +0.3%). 미 국채 10년물 금리는 소폭 상승, 달러는 강세였습니다.</p>" +
        "<h3>오늘 관전 포인트</h3>" +
        "<ul><li>반도체 업황 회복 기대에 <strong>외국인 순매수</strong>가 이어질지</li>" +
        "<li>원/달러 환율 1,300원대 중반 흐름과 수출주 영향</li>" +
        "<li>오후 발표되는 미 고용지표 경계로 장중 변동성 확대 가능</li></ul>" +
        "<blockquote><strong>창구 팁</strong> — 변동성 국면에서 예금 만기 고객에게는 분할 재예치·ISA 활용을 함께 안내하기 좋습니다.</blockquote>",
    },
    {
      id: "p_morning_2",
      channelId: "ch_morning",
      author: "리서치센터 강민석 위원",
      createdAt: d2.getTime(),
      title: `${fmtMD(d2)} 아침 시황 | 반도체 강세에 코스피 반등`,
      body:
        "<p>전일 코스피는 반도체 대형주 강세에 <strong>+0.9% 반등</strong> 마감했습니다. 외국인이 현·선물 동반 순매수로 지수를 끌어올렸습니다.</p>" +
        "<blockquote><strong>체크</strong> — 2차전지는 차익실현 매물로 약세. 업종별 온도차가 큰 장세이니, 목표수익률 관리 고객은 리밸런싱 시점을 점검해 주세요.</blockquote>",
    },
    /* 마켓 데일리 — 카드뉴스 이미지(업로드형) */
    {
      id: "p_moonshot_img",
      tags: ["카드뉴스", "전일등락", "반도체"],
      channelId: "ch_moonshot",
      author: "WM사업부 오세훈 대리",
      createdAt: d1.getTime() + 4200000,
      title: `${fmtMD(d1)} 마켓 데일리`,
      body:
        "<p>전일 <strong>코스피 +0.4%</strong> / <strong>코스닥 -0.2%</strong>. 반도체가 지수를 끌어올렸습니다. 오늘 등락은 카드뉴스로 정리했습니다.</p>",
      images: [moonshotCardImage(fmtMD(d1))],
    },
    /* 마켓 데일리 — 텍스트형 등락 타일(카드 데이터) */
    {
      id: "p_moonshot_cards",
      channelId: "ch_moonshot",
      author: "WM사업부 오세훈 대리",
      createdAt: d2.getTime() + 3600000,
      title: `${fmtMD(d2)} 마켓 데일리 | 전일 등락 한눈에`,
      body: "<p>반도체는 웃고, 2차전지는 쉬어간 하루였습니다.</p>",
      cards: [
        { name: "삼성전자", change: "+2.1%", dir: "up" },
        { name: "SK하이닉스", change: "+3.4%", dir: "up" },
        { name: "현대차", change: "+1.2%", dir: "up" },
        { name: "LG에너지솔루션", change: "-1.8%", dir: "down" },
        { name: "POSCO홀딩스", change: "-1.2%", dir: "down" },
        { name: "네이버", change: "-0.6%", dir: "down" },
      ],
    },
    /* WM 코멘트 */
    {
      id: "p_wm_1",
      tags: ["WM코멘트", "코스피", "상담응대", "변동성"],
      channelId: "ch_wm",
      author: "WM센터 박지영 차장",
      createdAt: d1.getTime() + 5400000,
      title: `${fmtMD(d1)} 코스피 하락에 대한 의견`,
      body:
        "<p>오늘 장중 코스피가 한때 1% 넘게 밀렸습니다. 배경은 (1) 미 고용지표 경계, (2) 최근 반등에 따른 단기 차익실현이며, <strong>특정 악재라기보다 이벤트 대기 성격의 조정</strong>으로 봅니다.</p>" +
        "<h3>고객 응대 포인트</h3>" +
        "<ul><li><strong>\"왜 떨어졌나\" 문의</strong>: 지표 발표 전 관망세 때문이며 추세 훼손은 아니라고 설명</li>" +
        "<li><strong>불안해하는 고객</strong>: 변동성 국면일수록 분할매수·적립식·ISA(비과세) 활용이 유리함을 안내</li>" +
        "<li><strong>목표수익률 도달 고객</strong>: 일부 차익실현 후 재진입 여력 확보도 하나의 선택지</li></ul>" +
        "<p><em>※ 특정 종목 매수·매도 권유가 아닌 시황 해설입니다. 상담 시 참고로만 활용하세요.</em></p>",
    },
    /* 알기 쉬운 세무상식 */
    {
      id: "p_tax_1",
      tags: ["세무상식", "금융소득종합과세", "절세", "ISA"],
      channelId: "ch_tax",
      author: "WM사업부 정세라 세무전문위원",
      createdAt: d1.getTime() - 2 * 3600000,
      title: "금융소득 종합과세, 3분 정리 | 2,000만원 기준선",
      body:
        "<p>이자·배당을 합한 금융소득이 <strong>연 2,000만원</strong>을 넘으면 그 초과분이 다른 소득과 합산돼 누진세율로 과세됩니다(금융소득 종합과세).</p>" +
        "<h3>창구에서 쉽게 설명하는 법</h3>" +
        "<ul><li>\"2,000만원까지는 15.4%로 끝, 넘으면 다른 소득과 합쳐 세율이 올라갑니다.\"</li>" +
        "<li>대상이 되면 <strong>비과세종합저축·ISA 신규가입이 제한</strong>될 수 있다는 점도 함께 안내</li></ul>" +
        "<blockquote><strong>상담 연결</strong> — 기준에 근접한 고객은 이자 수령 시기 분산, 비과세·분리과세 상품(ISA·저축성보험) 활용을 검토하세요. 고객 진단 화면에서 대상 여부를 바로 확인할 수 있습니다.</blockquote>",
    },
    {
      id: "p_tax_2",
      channelId: "ch_tax",
      author: "WM사업부 정세라 세무전문위원",
      createdAt: d2.getTime() - 3 * 3600000,
      title: "연말정산에서 놓치기 쉬운 인적공제 포인트",
      body:
        "<p>부양가족 인적공제는 <strong>소득요건</strong>(연 소득금액 100만원, 근로소득만 있으면 총급여 500만원 이하)이 핵심입니다.</p>" +
        "<ul><li>따로 사는 부모님도 실제 부양하면 공제 가능(다른 형제가 중복 공제하지 않는지 확인)</li>" +
        "<li>배우자가 중도 퇴사해 총급여 500만원 이하면 배우자 공제 대상</li>" +
        "<li><strong>장애인·경로우대</strong> 추가공제는 놓치기 쉬우니 함께 점검</li></ul>" +
        "<blockquote>상담 중 고객이 물어보면 위 세 가지만 짚어줘도 도움이 됩니다.</blockquote>",
    },
  ];

  /* 기본 구독 — 모닝 브리핑·WM 코멘트·세무상식은 구독한 상태로 시작(구독 피드 체험),
     마켓 데일리는 미구독으로 두어 「둘러보기 → 구독」 흐름을 보여 준다. */
  const subs = ["ch_morning", "ch_wm", "ch_tax"];

  return { channels, posts, subs };
}
