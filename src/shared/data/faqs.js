/* FAQ 저장소 — 담당 부서 직원이 상품별 FAQ를 직접 관리한다.
   공지사항과 동일하게 데모에서는 localStorage에 저장한다(이 브라우저 안에서만 유지).
   실배포 시 이 어댑터를 백엔드 API로 교체한다.

   faq = { id, moduleId, q, a, ref }
   - ISA·연금: 이 스토어가 곧 그 모듈의 FAQ(기존 상수에서 시드).
   - 노란우산: 약관 기반 FAQ는 코드에 그대로 두고, 이 스토어는 '부서 FAQ'(부서 추가분)로만 쓴다. */

import { ISA_FAQS } from "@isa/data/isa";
import { PENSION_FAQS } from "@pension/data/pension";

/* FAQ를 제공하는 모듈(관리자 화면·표시 대상) */
export const FAQ_MODULES = ["noran", "isa", "pension"];

const KEY = "salesbridge.faqs";

const SEED = [
  ...ISA_FAQS.map((f, i) => ({ id: `isa-faq-${i + 1}`, moduleId: "isa", q: f.q, a: f.a, ref: f.ref || "" })),
  ...PENSION_FAQS.map((f, i) => ({ id: `pension-faq-${i + 1}`, moduleId: "pension", q: f.q, a: f.a, ref: f.ref || "" })),
  {
    id: "noran-faq-1",
    moduleId: "noran",
    q: "공동이용 동의 시 자동 조회되는 서류는 무엇인가요?",
    a: "행정정보 공동이용에 동의하면 폐업사실증명 등 일부 서류가 자동 조회되어 창구 제출 서류가 줄어듭니다. 상담 시 동의 여부를 먼저 확인하세요.",
    ref: "운영 정책(2020.9 시행)",
  },
];

const canStore = () => typeof window !== "undefined" && !!window.localStorage;

const read = () => {
  if (!canStore()) return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED;
  } catch {
    return SEED;
  }
};

const write = (list) => {
  if (!canStore()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* 데모에서 저장 실패는 조용히 무시 */
  }
};

export const loadFaqs = () => read();

export const faqsForModule = (moduleId) => read().filter((f) => f.moduleId === moduleId);

const uid = () => `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const addFaq = ({ moduleId, q, a, ref = "" }) => {
  const next = [{ id: uid(), moduleId, q: q.trim(), a: a.trim(), ref: ref.trim() }, ...read()];
  write(next);
  return next;
};

export const updateFaq = (id, patch) => {
  const next = read().map((f) => (f.id === id ? { ...f, ...patch } : f));
  write(next);
  return next;
};

export const removeFaq = (id) => {
  const next = read().filter((f) => f.id !== id);
  write(next);
  return next;
};

export const resetFaqs = () => {
  write(SEED);
  return SEED;
};
