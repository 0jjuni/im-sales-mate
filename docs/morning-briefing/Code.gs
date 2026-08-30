/**
 * iM 세일즈메이트 — AI 모닝 브리핑 자동화 (Google Apps Script)
 *
 * 흐름(자동 노출):
 *   RSS 수집 → Gemini 요약 → 시트에 status="published"로 바로 적재(AUTO_PUBLISH=true)
 *   → doGet 웹앱이 최근 30일 published 행을 JSON으로 서빙 → 프론트가 fetch
 *   (사람 검수를 원하면 AUTO_PUBLISH=false로 두고 시트에서 draft→published 로 변경)
 *
 * 매일 자동 실행: createDailyTrigger() 를 한 번 실행하면 매일 07시 collectAndDraft 가 돈다.
 * 중복 방지: sourceUrl(링크) + headline(제목 정규화) 이중 체크. 오래된 행은 RETAIN_DAYS로 정리.
 *
 * 시트 1행(헤더)은 정확히 이 순서여야 한다:
 *   id | date | status | importance | category | headline | summary | pbNote | source | sourceUrl
 *
 * 설치는 같은 폴더의 SETUP.md 참고. (요약에 GEMINI_API_KEY 스크립트 속성 필요)
 */

// ── 설정 ─────────────────────────────────────────────────────
const SHEET_NAME = 'briefing';
const GEMINI_MODEL = 'gemini-3.6-flash';   // 모델은 단종될 수 있음. 404 뜨면 에러 메시지가 알려주는 최신명으로 교체
const MAX_ITEMS_PER_RUN = 12;              // 한 번에 요약할 최대 뉴스 수(무료 쿼터 보호)
const MAX_PER_FEED = 2;                     // 피드(주제)별 최대 — 한 주제가 브리핑을 독점하지 않게
const CUTOFF_DAYS = 5;                      // 최근 며칠 내 기사만 (오래된 뉴스 배제)
const AUTO_PUBLISH = true;                  // true면 검수 없이 바로 노출(status=published). 사람 검수를 쓰려면 false.
const RETAIN_DAYS = 45;                     // 시트에서 이보다 오래된 행은 자동 정리(무한 누적 방지)
const TZ = 'Asia/Seoul';

/* 뉴스 소스 — 기본은 Google News RSS(키워드 검색, 무료·안정적).
   더 높은 신뢰가 필요하면 한국은행·금융위 보도자료 RSS로 교체(SETUP.md 참고). */
function googleNewsRss_(query) {
  return 'https://news.google.com/rss/search?q=' + encodeURIComponent(query) + '&hl=ko&gl=KR&ceid=KR:ko';
}
const RSS_FEEDS = [
  /* 1차 출처(규제기관 보도자료) — 사실관계 정확. 한글이 깨지면 인코딩 이슈이므로
     parseRss_의 getContentText()를 getContentText('EUC-KR')로 바꿔 본다.
     피드 파싱이 실패해도 collectAndDraft가 해당 피드만 건너뛰므로 나머지는 정상 동작. */
  { name: '금융위 보도자료', url: 'https://www.fsc.go.kr/about/fsc_bbs_rss/?fid=0111' },
  // 참고: 한국은행은 RSS 대신 뉴스레터만 제공(https://www.bok.or.kr, menuNo=200172),
  //       기획재정부는 국문 RSS가 불명확하고 영문 RSS만 확인됨
  //       (http://english.moef.go.kr/pc/engmosfrss.do?boardCd=N0001).

  /* 보조 소스: Google News 키워드 검색(무료·안정적, 건수 많음). 창구 관심 주제 위주. */
  { name: '금리',      url: googleNewsRss_('한국은행 기준금리 금통위') },
  { name: '대출규제',  url: googleNewsRss_('DSR 가계대출 규제') },
  { name: '세제',      url: googleNewsRss_('세법개정 ISA 연금저축 세액공제') },
  { name: '퇴직연금',  url: googleNewsRss_('퇴직연금 IRP 의무화') },
  { name: '예금·수신', url: googleNewsRss_('예금 금리 특판 수신') },
  { name: '부동산',    url: googleNewsRss_('부동산 정책 주택시장') },
  { name: '투자·펀드', url: googleNewsRss_('펀드 ETF 증시 투자') },
  { name: '상속증여',  url: googleNewsRss_('상속세 증여세 절세') },
];

// ── 유틸 ─────────────────────────────────────────────────────
function getSheet_() {
  /* 시트에 연결된(bound) 스크립트면 getActiveSpreadsheet()가 시트를 준다.
     독립(standalone) 스크립트면 null이므로, 스크립트 속성 SPREADSHEET_ID로 연다. */
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!id) {
      throw new Error(
        '시트에 연결돼 있지 않습니다. 시트의 [확장 프로그램 → Apps Script]로 만들거나, ' +
        '스크립트 속성 SPREADSHEET_ID에 시트 ID(시트 URL의 /d/ 와 /edit 사이 문자열)를 넣으세요.'
      );
    }
    ss = SpreadsheetApp.openById(id);
  }
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['id', 'date', 'status', 'importance', 'category', 'headline', 'summary', 'pbNote', 'source', 'sourceUrl']);
  }
  return sh;
}

function apiKey_() {
  const k = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!k) throw new Error('스크립트 속성 GEMINI_API_KEY 가 없습니다. (프로젝트 설정 → 스크립트 속성)');
  return k;
}

function stripTags_(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

// ── ① 수집 + 요약 → draft 적재 (시간 트리거로 실행) ───────────
function collectAndDraft() {
  const sh = getSheet_();
  const lastRow = sh.getLastRow();

  // sourceUrl(10번째 열) 기준 중복 방지
  const seen = new Set(
    lastRow > 1 ? sh.getRange(2, 10, lastRow - 1, 1).getValues().flat().filter(String) : []
  );
  // headline(6번째 열) 정규화 기준 중복 방지 — 같은 내용이 다른 링크로 들어오는 것 차단
  const seenTitles = new Set(
    lastRow > 1 ? sh.getRange(2, 6, lastRow - 1, 1).getValues().flat().map(normalizeTitle_).filter(Boolean) : []
  );

  const cutoff = Date.now() - CUTOFF_DAYS * 86400000;
  let items = [];
  for (const feed of RSS_FEEDS) {
    try {
      const fresh = parseRss_(feed)
        .filter((it) => it.link && !seen.has(it.link) && (it.pubDate === 0 || it.pubDate >= cutoff))
        .sort((a, b) => (b.pubDate || 0) - (a.pubDate || 0))
        .slice(0, MAX_PER_FEED); // 주제별 상한 — 한 주제 독점 방지
      items = items.concat(fresh);
    } catch (e) {
      Logger.log('RSS 실패 [' + feed.name + '] ' + e);
    }
  }

  items = items
    .sort((a, b) => (b.pubDate || 0) - (a.pubDate || 0))
    .slice(0, MAX_ITEMS_PER_RUN);

  const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  let added = 0;

  for (const it of items) {
    try {
      const ai = summarizeWithGemini_(it);
      if (!ai || ai.importance === 'skip' || !ai.summary) continue; // 막연·부적합은 건너뜀
      const tkey = normalizeTitle_(ai.headline || it.title);
      if (tkey && seenTitles.has(tkey)) continue; // 같은 내용(제목) 중복 방지
      const reportedAt = it.pubDate
        ? Utilities.formatDate(new Date(it.pubDate), TZ, 'yyyy-MM-dd')
        : today; // 보도 날짜(기사 pubDate). 없으면 수집일
      sh.appendRow([
        'auto_' + Utilities.getUuid().slice(0, 8),
        reportedAt,
        AUTO_PUBLISH ? 'published' : 'draft', // AUTO_PUBLISH=true면 검수 없이 바로 노출
        ai.importance === 'high' ? 'high' : 'normal',
        ai.category || '기타',
        ai.headline || it.title,
        ai.summary,
        ai.pbNote || '',
        it.source || '',
        it.link || '',
      ]);
      added++;
      seen.add(it.link);
      if (tkey) seenTitles.add(tkey);
    } catch (e) {
      Logger.log('요약 실패: ' + e);
    }
  }
  purgeOld_(sh); // 오래된 행 정리(무한 누적 방지)
  Logger.log((AUTO_PUBLISH ? 'published ' : 'draft ') + added + '건 추가');
}

/* 제목 정규화 — 공백·문장부호·「…- 언론사」 꼬리표 제거해 같은 내용을 같은 키로 */
function normalizeTitle_(s) {
  return String(s || '')
    .replace(/\s*-\s*[^-]+$/, '')                 // 구글뉴스 "제목 - 언론사" 꼬리 제거
    .replace(/[\s·.,()[\]"'‘’“”\-–—…!?%]/g, '')   // 공백·문장부호 제거
    .toLowerCase();
}

/* RETAIN_DAYS보다 오래된 행 삭제(아래에서 위로 지워 인덱스 밀림 방지) */
function purgeOld_(sh) {
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;
  const cutoff = Utilities.formatDate(new Date(Date.now() - RETAIN_DAYS * 86400000), TZ, 'yyyy-MM-dd');
  const dates = sh.getRange(2, 2, lastRow - 1, 1).getValues().flat();
  for (let i = dates.length - 1; i >= 0; i--) {
    const d = dates[i] instanceof Date ? Utilities.formatDate(dates[i], TZ, 'yyyy-MM-dd') : String(dates[i]).trim();
    if (d && d < cutoff) sh.deleteRow(i + 2);
  }
}

// ── 트리거 설치 — 매일 아침 자동 수집 ────────────────────────
/* 한 번만 실행하면 매일 07:00(±)에 collectAndDraft가 자동 실행된다.
   중복 설치 방지를 위해 기존 트리거를 지우고 새로 만든다. */
function createDailyTrigger() {
  deleteDailyTriggers();
  ScriptApp.newTrigger('collectAndDraft').timeBased().atHour(7).everyDays(1).inTimezone(TZ).create();
  Logger.log('매일 07시 트리거 설치 완료');
}
function deleteDailyTriggers() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'collectAndDraft')
    .forEach((t) => ScriptApp.deleteTrigger(t));
}

// ── RSS 파싱 (XmlService) ────────────────────────────────────
function parseRss_(feed) {
  const resp = UrlFetchApp.fetch(feed.url, { muteHttpExceptions: true });
  if (resp.getResponseCode() !== 200) throw new Error('HTTP ' + resp.getResponseCode());
  const doc = XmlService.parse(resp.getContentText());
  const root = doc.getRootElement();
  const channel = root.getChild('channel');
  const items = channel ? channel.getChildren('item') : root.getChildren('item');
  return items.map((item) => {
    const get = (t) => { const c = item.getChild(t); return c ? c.getText() : ''; };
    const pub = get('pubDate');
    const title = get('title');
    const srcEl = item.getChild('source'); // Google News RSS는 <source>에 언론사명
    let outlet = srcEl ? srcEl.getText() : '';
    if (!outlet) {
      // Google News 제목은 "제목 - 언론사" 형식 → 끝의 언론사만 추출
      const parts = title.split(' - ');
      if (parts.length > 1) outlet = parts[parts.length - 1].trim();
    }
    return {
      title: title,
      link: get('link'),
      description: get('description'),
      pubDate: pub ? new Date(pub).getTime() : 0,
      source: outlet || feed.name, // 실제 언론사(없으면 피드명)
    };
  });
}

// ── ③ Gemini 요약 (사실/해석 분리 + 컴플라이언스 제약) ────────
function summarizeWithGemini_(item) {
  const prompt = [
    '너는 은행 영업점 직원용 아침 브리핑을 만드는 보조자다.',
    '아래 뉴스를 바탕으로 JSON 객체 하나만 출력한다. 마크다운·설명 없이 순수 JSON만.',
    '',
    '규칙(반드시 지킬 것):',
    '- summary: 1~2문장 사실 요약, 존댓말. 수치·날짜는 원문에 명시된 것만 인용하고, 없으면 쓰지 마라. 추측·과장 금지.',
    '- pbNote: 이 소식이 창구 상담에서 갖는 의미 1~2문장. 단정적 안내 금지. 확정 전 사안이면 "확정 전"임을 밝혀라.',
    '- category: [금리, 대출규제, 세제, 퇴직연금, 부동산, 예금·수신, 투자·펀드, 상속증여, 기타] 중 하나.',
    '- importance: 창구에서 오늘 반드시 인지해야 하면 "high", 아니면 "normal".',
    '- headline: 25자 내외 한 줄. 원문 제목을 그대로 복사하지 말고 다듬어라.',
    '- 원문 문장을 그대로 옮기지 말고 재작성하라(저작권).',
    '- 구체적 사실(수치·주체·시점·시행일)이 없이 "관심이 쏠린다 / 전망이 갈린다" 수준으로 막연하면, importance를 "skip"으로 하고 나머지 필드는 비워라. 억지로 요약을 지어내지 마라.',
    '- 확정된 정책·수치·시행일이 담긴 뉴스만 "high". 단순 관측·전망·기대·개별 기관(증권사·IB) 예측은 "normal".',
    '- 광고·홍보·개별 종목 추천이면 "skip".',
    '',
    '출력: {"importance":"high|normal|skip","category":"","headline":"","summary":"","pbNote":""}',
    '',
    '제목: ' + item.title,
    '내용: ' + stripTags_(item.description).slice(0, 1500),
  ].join('\n');

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent?key=' + apiKey_();
  const resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
    }),
  });
  if (resp.getResponseCode() !== 200) {
    Logger.log('Gemini 오류 ' + resp.getResponseCode() + ': ' + resp.getContentText());
    return null;
  }
  const json = JSON.parse(resp.getContentText());
  const text = json.candidates && json.candidates[0] &&
    json.candidates[0].content && json.candidates[0].content.parts[0].text;
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    Logger.log('JSON 파싱 실패: ' + text);
    return null;
  }
}

// ── ⑥ 웹앱: published 행만 BriefingShape JSON으로 서빙 ────────
function doGet(e) {
  /* 접근토큰(선택) — 스크립트 속성 ACCESS_TOKEN을 넣으면 ?token=값 이 일치해야 응답한다.
     ⚠ 프론트 번들에 노출되므로 완전한 보안은 아니고, 캐주얼 접근·크롤링 차단 수준.
     실서비스의 진짜 접근통제는 자체 서버 프록시로 해야 한다. */
  const required = PropertiesService.getScriptProperties().getProperty('ACCESS_TOKEN');
  if (required) {
    const provided = e && e.parameter && e.parameter.token;
    if (provided !== required) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  const sh = getSheet_();
  const rows = sh.getDataRange().getValues();
  rows.shift(); // 헤더 제거

  /* 시트가 날짜를 Date로 자동변환할 수 있어 yyyy-MM-dd 문자열로 정규화 */
  const norm = (v) => (v instanceof Date ? Utilities.formatDate(v, TZ, 'yyyy-MM-dd') : String(v).trim());

  /* 최근 30일치 발행분만 최신순으로. 프론트가 이 중 최근 7일을 기본 노출하고 나머지는 접는다.
     항목마다 보도 날짜(date)·출처(source)·원문 링크(sourceUrl)를 함께 내보낸다. */
  const cutoff = Utilities.formatDate(new Date(Date.now() - 30 * 86400000), TZ, 'yyyy-MM-dd');
  const news = rows
    .filter((r) => String(r[2]).trim() === 'published' && r[5])
    .map((r) => ({
      id: String(r[0]),
      date: norm(r[1]),
      importance: String(r[3]) === 'high' ? 'high' : 'normal',
      category: String(r[4]),
      headline: String(r[5]),
      summary: String(r[6]),
      pbNote: String(r[7]),
      source: String(r[8]),
      sourceUrl: String(r[9]),
    }))
    .filter((n) => n.date >= cutoff)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const date = news.length ? news[0].date : Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');

  const payload = { date: date, session: '오늘의 브리핑', news: news };
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
