import { FAQS } from "@noran/data/faqs";
import { ISA_FAQS } from "@isa/data/isa";
import { PENSION_FAQS } from "@pension/data/pension";

/* 전역 검색 인덱스 — 각 모듈 FAQ를 공통 형태로 모은다.
   { module, to, question, answer, ref }
   결과는 해당 모듈 FAQ 페이지로 링크한다. 소스가 늘면 여기에 매핑만 추가하면 된다. */
const NORAN = FAQS.map((f) => ({
  module: "노란우산",
  to: "/noran/faq",
  question: f.question,
  answer: f.shortAnswer,
  ref: (f.sourceReference?.articles || []).join(" · "),
}));
const ISA = ISA_FAQS.map((f) => ({
  module: "ISA",
  to: "/isa/faq",
  question: f.q,
  answer: f.a,
  ref: f.ref,
}));
const PENSION = PENSION_FAQS.map((f) => ({
  module: "연금",
  to: "/pension/faq",
  question: f.q,
  answer: f.a,
  ref: f.ref,
}));

const INDEX = [...NORAN, ...ISA, ...PENSION];

export const SEARCH_COUNT = INDEX.length;

/* 공백으로 나눈 모든 토큰이 하나라도 걸리면 후보, 질문에 원문이 그대로 있으면 상위로 */
export function searchFaqs(query) {
  const raw = (query || "").trim().toLowerCase();
  if (!raw) return [];
  const terms = raw.split(/\s+/).filter(Boolean);
  return INDEX.map((item) => {
    const hay = `${item.question} ${item.answer} ${item.module}`.toLowerCase();
    const score = terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
    const exact = item.question.toLowerCase().includes(raw);
    return { item, score, exact };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => Number(b.exact) - Number(a.exact) || b.score - a.score)
    .map((r) => r.item);
}
