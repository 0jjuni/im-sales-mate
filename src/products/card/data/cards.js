/* 카드 상품 카탈로그 — 카드 탐색·상세·가입 안내문의 공통 소스.
   항목만 추가하면 카탈로그·상세·안내문 카드 선택에 자동 반영된다.

   필드
   - id: URL·저장소 식별자(배포 후 변경 금지)
   - name: 카드명
   - issuer: 발급사 표기(예: iM뱅크)
   - type: "credit"(신용) | "check"(체크) — 카탈로그 상단 탭 필터
   - image: 카드 이미지 경로(선택, 없으면 플레이스홀더)
   - maxBenefit: "최대 OO만원 혜택" 배지(선택)
   - benefits: [{ label, value }] 대표 혜택 2~3개(카탈로그 요약 컬럼)
   - annualFee: 연회비 안내
   - spendReq: 전월실적 조건(예: 전월 30만원 이상)
   - note: 부가 표기(예: 온라인발급 전용) — 선택
   - ebizLink: eBiz 가입 링크(고객이 타고 들어가면 담당 직원 실적)
   - prospectusUrl: 상품설명서 PDF 경로(선택)
   - adCopy: 심의필 광고 문구 전문(안내문 인쇄용) — 원문 그대로 보존
*/

export const CARD_MODULE = { id: "card", name: "카드", accent: "rose" };

export const CARD_TYPES = [
  { id: "credit", label: "신용카드" },
  { id: "check", label: "체크카드" },
];
export const typeLabel = (t) => CARD_TYPES.find((x) => x.id === t)?.label ?? "카드";

const SEVEN_AD_COPY = `심플한 카드를 찾는다면?
국내 및 해외가맹점 7% 청구할인 (단, 전월실적 30만원 이상)

■ "iM세븐캐쉬백카드" 상품가입
☞ https://mbanking.imbank.co.kr/com_ebz_mbs_00001.act?svcId=com_ebz_sbs_30020_0001&sms_seqno=3030011781

[반드시 확인하세요]
- 연회비 : BC(국내전용) 1만원, Master(해외겸용) 1만 2천원
※ 상환능력에 비해 신용카드 사용액이 과도할 경우, 귀하의 개인신용평점이 하락할 수 있습니다.
※ 개인신용평점 하락 시 금융거래와 관련된 불이익이 발생할 수 있습니다.
※ 일정기간 납부 대금을 연체할 경우, 모든 납부 대금을 변제할 의무가 발생할 수 있습니다.
※ 연체이자율 : 회원별 · 이용상품별 『정상이자율 + 3%p , 최고 연 20%』
- 카드 신청 전 상품설명서와 약관을 반드시 읽어보시기 바랍니다.
- 신용카드 발급이 부적정한 경우(연체금 보유, 신용점수 낮음 등)카드발급이 제한될 수 있습니다.
- 카드이용대금과 이에 수반되는 모든 수수료를 지정된 대금 결제일에 상환합니다.
- 금융소비자는 금융소비자보호법 제19조 제1항에 따라 해당상품 또는 서비스에 대하여 설명을 받을 권리가 있으며, 그 설명을 듣고 내용을 충분히 이해한 후 거래하시기 바랍니다.

- 자세한 사항은 iM뱅크 고객센터(☎1566-5050)로 문의 부탁드립니다.
- 이 광고는 법령 및 은행의 내부통제 기준에 따른 광고 관련 절차를 준수하여 작성되었습니다.

[준법감시인 심의필 제26-92호(2026.02.01~2027.01.31)]
[여신금융협회 심의필 제2026-C1f-00960호(2026.02.01~2027.01.31)]`;

export const CARDS = [
  {
    id: "seven-cashback",
    name: "iM세븐캐쉬백카드",
    issuer: "iM뱅크",
    type: "credit",
    image: "",
    maxBenefit: "",
    benefits: [
      { label: "국내·해외 가맹점", value: "7% 청구할인" },
      { label: "실적 조건", value: "전월 30만원↑" },
    ],
    annualFee: "BC(국내전용) 1만원 / Master(해외겸용) 1만 2천원",
    spendReq: "전월 30만원 이상",
    note: "",
    ebizLink:
      "https://mbanking.imbank.co.kr/com_ebz_mbs_00001.act?svcId=com_ebz_sbs_30020_0001&sms_seqno=3030011781",
    prospectusUrl: "/promo/im-seven-cashback.pdf#page=5",
    adCopy: SEVEN_AD_COPY,
  },
];

export const findCard = (id) => CARDS.find((c) => c.id === id) ?? null;
