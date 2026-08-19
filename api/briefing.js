/* 모닝 브리핑 프록시 (Vercel 서버리스 함수).

   Apps Script 웹앱(익명 배포)이 published 뉴스를 JSON으로 서빙하지만, 브라우저가
   직접 호출하면 CORS로 막힌다(그리고 /exec는 googleusercontent로 302 리다이렉트).
   서버에서 대신 가져와 같은 도메인으로 돌려주면 서드파티 프록시 없이 해결된다.

   Apps Script URL이 바뀌면 src/hub/data/morningBriefing.js의 BRIEFING_ENDPOINT와
   이 값을 함께 고칠 것. (개발 서버(vite)에는 이 함수가 없어 corsproxy로 우회한다) */

const BRIEFING_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzYG7r1vMmMyLp0jquvndWvHhLx9lnf0ZWTSGUthJzNYhUNMF4tstYEiytT8DQbX6-dEQ/exec";

export default async function handler(req, res) {
  try {
    const upstream = await fetch(BRIEFING_ENDPOINT, { redirect: "follow" });
    if (!upstream.ok) {
      res.status(502).json({ error: `upstream ${upstream.status}` });
      return;
    }
    const json = await upstream.json();

    /* 브리핑은 하루 단위라 CDN에 5분 캐시 — Apps Script 호출·쿼터를 아낀다 */
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=1800");
    res.status(200).json(json);
  } catch {
    res.status(502).json({ error: "upstream fetch failed" });
  }
}
