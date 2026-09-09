/* FAQ 저장소 — 담당 부서 직원이 상품별 FAQ를 직접 관리한다.
   공지사항과 동일하게 데모에서는 localStorage에 저장한다(이 브라우저 안에서만 유지).
   실배포 시 이 어댑터를 백엔드 API로 교체한다.

   faq = { id, moduleId, q, a, ref }
   - ISA·연금: 이 스토어가 곧 그 모듈의 FAQ(기존 상수에서 시드).
   - 노란우산: 약관 기반 FAQ는 코드에 그대로 두고, 이 스토어는 '부서 FAQ'(부서 추가분)로만 쓴다. */

import { ISA_FAQS } from "@isa/data/isa";
import { PENSION_FAQS } from "@pension/data/pension";

/* FAQ를 제공하는 모듈(관리자 화면·표시 대상) */
export const FAQ_MODULES = ["noran", "isa", "pension", "wealth"];

const KEY = "salesbridge.faqs.v2";

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
  {
    id: "wealth-faq-1",
    moduleId: "wealth",
    q: "펀드는 언제 매입 기준가가 확정되나요?",
    a: "신청 시점 기준가가 아니라 다음 영업일 기준가로 매입됩니다. 국내 주식형은 보통 T+1(당일 오후 3시 30분 이후 신청은 T+2), 해외형은 T+2 전후로 확정됩니다. 그래서 신청 직후에는 「기준가 대기」로 표시됩니다.",
    ref: "상품별 투자설명서",
  },
  {
    id: "wealth-faq-2",
    moduleId: "wealth",
    q: "ETF와 펀드는 뭐가 다른가요?",
    a: "ETF는 거래소에서 실시간 현재가로 즉시 사고팝니다(매매수수료). 펀드는 하루 한 번 산정되는 기준가로 매매하고 판매보수가 붙습니다. 실시간 시세·소액 분산은 ETF, 자동 분산·정기 적립은 펀드가 편합니다.",
    ref: "",
  },
  {
    id: "wealth-faq-3",
    moduleId: "wealth",
    q: "고객 투자성향보다 위험등급이 높은 상품도 가입되나요?",
    a: "적합성 원칙상 고객 성향 등급 이하(더 안전한) 상품만 권유합니다. 성향을 초과하는 상품은 부적합 안내 후 고객이 원할 때 별도 확인 절차를 거쳐야 합니다. 목록의 투자성향 필터로 판매 가능 등급만 볼 수 있습니다.",
    ref: "금융투자상품 적합성 원칙",
  },
  {
    id: "wealth-faq-4",
    moduleId: "wealth",
    q: "환매하면 대금은 언제 들어오나요?",
    a: "환매도 기준가 확정 후 지급되며, 국내형은 보통 T+3~4영업일, 해외형은 T+5~8영업일이 걸립니다. 상품 유형·운용사에 따라 다르니 투자설명서의 환매 지급일을 확인하세요.",
    ref: "상품별 투자설명서",
  },
  {
    id: "wealth-faq-5",
    moduleId: "wealth",
    q: "ISA 계좌 안에서도 이 상품을 살 수 있나요?",
    a: "신탁형 ISA에 편입 가능한 상품에 한해 ISA 계좌로 매수할 수 있고, 이 경우 계좌 내 손익통산·비과세·분리과세 혜택이 적용됩니다. 편입 가능 여부는 상품 상세에서 확인하세요.",
    ref: "조특법 §91의18",
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
