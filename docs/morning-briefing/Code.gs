/**
 * iM 세일즈메이트 — AI 모닝 브리핑 자동화 (Google Apps Script)
 *
 * 흐름:
 *   RSS 수집 → Gemini 요약 → 시트에 status="draft"로 적재
 *   → (담당자가 시트에서 검수 후 status="published"로 변경)
 *   → doGet 웹앱이 published 행만 JSON으로 서빙 → 프론트가 fetch
 *
 * 시트 1행(헤더)은 정확히 이 순서여야 한다:
 *   id | date | status | importance | category | headline | summary | pbNote | source | sourceUrl
 *
 * 설치는 같은 폴더의 SETUP.md 참고.
 */

// ── 설정 ─────────────────────────────────────────────────────
const SHEET_NAME = 'briefing';
const GEMINI_MODEL = 'gemini-2.0-flash';   // 무료 티어. 필요 시 gemini-1.5-flash 등으로 교체
const MAX_ITEMS_PER_RUN = 8;               // 한 번에 요약할 최대 뉴스 수(무료 쿼터 보호)
const TZ = 'Asia/Seoul';

/* 뉴스 소스 — 기본은 Google News RSS(키워드 검색, 무료·안정적).
   더 높은 신뢰가 필요하면 한국은행·금융위 보도자료 RSS로 교체(SETUP.md 참고). */
function googleNewsRss_(query) {
  return 'https://news.google.com/rss/search?q=' + encodeURIComponent(query) + '&hl=ko&gl=KR&ceid=KR:ko';
}
const RSS_FEEDS = [
  { name: '금리',     url: googleNewsRss_('한국은행 기준금리 금통위') },
  { name: '대출규제', url: googleNewsRss_('DSR 가계대출 규제') },
  { name: '세제',     url: googleNewsRss_('세법개정 ISA 연금저축 세액공제') },
  { name: '퇴직연금', url: googleNewsRss_('퇴직연금 IRP 의무화') },
];

// ── 유틸 ─────────────────────────────────────────────────────
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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

  let items = [];
  for (const feed of RSS_FEEDS) {
    try {
      items = items.concat(parseRss_(feed));
    } catch (e) {
      Logger.log('RSS 실패 [' + feed.name + '] ' + e);
    }
  }

  items = items
    .filter((it) => it.link && !seen.has(it.link))
    .sort((a, b) => (b.pubDate || 0) - (a.pubDate || 0))
    .slice(0, MAX_ITEMS_PER_RUN);

  const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  let added = 0;

  for (const it of items) {
    try {
      const ai = summarizeWithGemini_(it);
      if (!ai || !ai.summary) continue;
      sh.appendRow([
        'auto_' + Utilities.getUuid().slice(0, 8),
        today,
        'draft',                       // 담당자 검수 전까지는 노출 안 됨
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
    } catch (e) {
      Logger.log('요약 실패: ' + e);
    }
  }
  Logger.log('draft ' + added + '건 추가');
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
    return {
      title: get('title'),
      link: get('link'),
      description: get('description'),
      pubDate: pub ? new Date(pub).getTime() : 0,
      source: feed.name,
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
    '- category: [금리, 대출규제, 세제, 퇴직연금, 부동산, 예금·수신, 기타] 중 하나.',
    '- importance: 창구에서 오늘 반드시 인지해야 하면 "high", 아니면 "normal".',
    '- headline: 25자 내외 한 줄. 원문 제목을 그대로 복사하지 말고 다듬어라.',
    '- 원문 문장을 그대로 옮기지 말고 재작성하라(저작권).',
    '- 광고·홍보성·개별 종목 추천 뉴스이면 importance는 "normal"보다 낮게 두지 말고, 대신 summary에 "참고" 톤으로.',
    '',
    '출력: {"importance":"high|normal","category":"","headline":"","summary":"","pbNote":""}',
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
function doGet() {
  const sh = getSheet_();
  const rows = sh.getDataRange().getValues();
  rows.shift(); // 헤더 제거

  const published = rows.filter((r) => String(r[2]).trim() === 'published' && r[5]);

  const news = published.map((r) => ({
    id: String(r[0]),
    importance: String(r[3]) === 'high' ? 'high' : 'normal',
    category: String(r[4]),
    headline: String(r[5]),
    summary: String(r[6]),
    pbNote: String(r[7]),
    source: String(r[8]),
  }));

  const dates = published.map((r) => String(r[1])).filter(Boolean).sort();
  const date = dates.length ? dates[dates.length - 1] : Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');

  const payload = { date: date, session: '오늘의 브리핑', news: news };
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
