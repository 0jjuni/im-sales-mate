/* 카드 상품 카탈로그 — 카드 탐색·상세·가입 안내문의 공통 소스.

   카드 이미지는 public/promo/cards/*.webp 로 저장해 두고 image 필드로 참조한다.

   필드
   - id: URL·저장소 식별자(이미지 파일명 기준, 배포 후 변경 금지)
   - name: 카드명
   - issuer: 발급사 표기(예: iM뱅크)
   - type: "credit"(신용) | "check"(체크) — 카탈로그 상단 탭 필터
   - image: 카드 이미지 경로
   - maxBenefit: "최대 OO만원 혜택" 배지(선택)
   - benefits: [{ label, value }] 대표 혜택 2~3개(카탈로그 요약 컬럼)
   - annualFee / spendReq / note: 연회비·전월실적·부가표기(선택)
   - ebizLink: eBiz 가입 링크(고객이 타고 들어가면 담당 직원 실적) — eBiz에서 별도 발급
   - prospectusUrl: 상품설명서 PDF 경로(선택)
   - adCopy: 심의필 광고 문구 전문(안내문 인쇄용) — 원문 그대로 보존. 없으면 안내문 비활성.

   ※ 대표 혜택·연회비·adCopy·가입 링크는 카드별로 채워 넣는다(현재는 세븐카드만 완비). */

export const CARD_MODULE = { id: "card", name: "카드", accent: "rose" };

/* 대상 구분 — 개인 / 기업(개인사업자·법인) */
export const SEGMENTS = [
  { id: "personal", label: "개인" },
  { id: "biz", label: "기업" },
];

export const CARD_TYPES = [
  { id: "credit", label: "신용카드" },
  { id: "check", label: "체크카드" },
];
export const typeLabel = (t) => CARD_TYPES.find((x) => x.id === t)?.label ?? "카드";

const IMG = (f) => `/promo/cards/${f}`;

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

/* 완비 카드 — 대표 혜택·연회비·adCopy·가입 링크까지 채워진 카드 */
const SEVEN = {
  id: "im-seven-cashback",
  name: "iM 세븐 캐쉬백 카드",
  issuer: "iM뱅크",
  type: "credit",
  segment: "personal",
  image: IMG("im-seven-cashback.webp"),
  blurb: "3만원 이상 일시불 이용 시 7% 할인",
  tags: ["어디서나 할인"],
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
};

/* 카탈로그 나열 순서 — [이미지파일, 카드명, 신용/체크].
   세븐카드는 위 SEVEN(완비)로 대체된다. 나머지는 이미지·이름만 우선 등록. */
const CATALOG = [
  ["im-travel.webp", "iM 트래블 카드", "credit"],
  ["im-kpass.webp", "iM K-패스 카드", "credit"],
  ["im-living.webp", "iM LIVING카드", "credit"],
  ["im-anygreen.webp", "iM 어디로든 그린카드", "credit"],
  ["im-skypass-silver.webp", "iM 스카이패스 카드 V2 Silver", "credit"],
  ["im-skypass-gold.webp", "iM 스카이패스 카드 V2 Gold", "credit"],
  ["im-i.webp", "iM i 카드", "credit"],
  ["im-untact.webp", "iM UntacT 카드", "credit"],
  ["im-green-v2.webp", "그린카드 v2", "credit"],
  ["im-seven-cashback.webp", "iM 세븐 캐쉬백 카드", "credit"],
  ["im-greit.webp", "GREiT(그래잇)카드", "credit"],
  ["im-shopping.webp", "iM 쇼핑카드", "credit"],
  ["im-petlove.webp", "iM Pet Love 카드", "credit"],
  ["im-one.webp", "iM ONE 카드", "credit"],
  ["im-daebaek-black.webp", "대백-iM뱅크 카드 (블랙)", "credit"],
  ["im-daebaek-purple.webp", "대백-iM뱅크 카드 (퍼플)", "credit"],
  ["im-hipass.webp", "후불 하이패스카드", "credit"],
  ["im-dandi-credit.webp", "단디카드", "credit"],
  ["im-hd-mpoint.webp", "iM뱅크-현대카드M", "credit"],
  ["tictoc-pass.png", "TicToc카드(PASS형)", "credit"],
  ["tictoc-allday.png", "TicToc카드(ALL DAY형)", "credit"],
  ["happy-credit.png", "국민행복카드 신용카드", "credit"],
  ["imc-kpass.webp", "iM K-패스 체크카드", "check"],
  ["imc-a.webp", "iM A 체크카드", "check"],
  ["imc-z.webp", "iM Z 체크카드", "check"],
  ["imc-bujamile.webp", "부자되세요 더마일리지 체크카드", "check"],
  ["imc-ddokdi.webp", "똑디체크카드", "check"],
  ["imc-new-hyundai.webp", "NEW 현대백화점 체크카드", "check"],
  ["imc-kakaopay.webp", "iM 카카오페이 체크카드", "check"],
  ["imc-happy-check.webp", "국민행복카드 체크카드", "check"],
  ["imc-daebaek-plus.webp", "대백 플러스 체크카드", "check"],
  ["imc-master-young.webp", "Master Y+(영플러스) 체크카드", "check"],
  ["imc-hyundai-dept.webp", "iM 현대백화점 체크카드", "check"],
  ["imc-young.webp", "Y+(영플러스) 체크카드", "check"],
  ["imc-happypoint.webp", "iM 해피포인트 체크카드", "check"],
  ["imc-dandi.webp", "단디체크카드", "check"],
];

/* iM뱅크 홈페이지 기준 카드 태그 마스터(표시·검색 순서 고정) */
export const ALL_TAGS = [
  "온라인쇼핑", "배달앱", "편의점", "커피", "이동통신", "어디서나 할인", "어디서나 적립",
  "외식", "영화", "대중교통", "주유", "대형마트", "백화점", "간편결제", "스트리밍",
  "반려동물", "아파트 관리비", "항공 마일리지", "공항라운지", "전기차/수소차",
];

/* 카드별 한 줄 혜택(blurb) + 태그 — iM뱅크 홈페이지 기준.
   미기재 카드는 blurb "" / tags [] 로 남는다(추후 보강). */
const INFO = {
  "im-i": { blurb: "온라인쇼핑·배달앱·커피·편의점·이동통신 10% 할인", tags: ["온라인쇼핑", "배달앱", "편의점", "커피", "이동통신"] },
  "im-kpass": { blurb: "K-패스 혜택에 대중교통 10% 추가할인까지", tags: ["배달앱", "편의점", "커피", "이동통신", "영화", "대중교통", "스트리밍"] },
  "im-skypass-silver": { blurb: "1천원당 대한항공 1마일리지 적립", tags: ["항공 마일리지"] },
  "im-skypass-gold": { blurb: "1천원당 대한항공 최대 2마일리지 적립에 공항라운지 무료까지", tags: ["항공 마일리지", "공항라운지"] },
  "im-travel": { blurb: "해외 여행 필수템", tags: ["배달앱", "스트리밍", "공항라운지"] },
  "im-untact": { blurb: "언택트 전용 할인 혜택", tags: ["배달앱", "간편결제", "스트리밍"] },
  "im-petlove": { blurb: "반려동물병원 20%, 반려동물 업종 10% 할인", tags: ["외식", "대형마트", "반려동물"] },
  "im-green-v2": { blurb: "대중교통 최대 20% 에코머니 적립", tags: ["온라인쇼핑", "어디서나 적립", "영화", "대중교통"] },
  "im-one": { blurb: "전월 실적 없이 TOP포인트 적립", tags: ["어디서나 적립", "외식", "영화"] },
  "im-shopping": { blurb: "최대 10% 쇼핑 할인", tags: ["온라인쇼핑", "편의점", "커피", "대형마트", "백화점"] },
  "im-hipass": { blurb: "후불하이패스 전용 카드", tags: [] },
  "im-living": { blurb: "생활비 할인 혜택", tags: ["온라인쇼핑", "배달앱", "대형마트", "아파트 관리비"] },
  "im-greit": { blurb: "결제금액에 따라 iM뱅크 결제계좌 캐시백", tags: ["커피", "주유", "대형마트"] },
  "im-dandi-credit": { blurb: "대형마트·백화점·학원 5% 할인", tags: ["주유", "대형마트"] },
  "im-anygreen": { blurb: "전기차 충전 최대 40% 에코머니 적립", tags: ["어디서나 적립", "전기차/수소차"] },
  "im-hd-mpoint": { blurb: "전 가맹점 1.5% M포인트 적립", tags: ["온라인쇼핑", "어디서나 적립", "외식"] },
  "im-daebaek-black": { blurb: "대구백화점 5% 할인", tags: ["커피", "외식", "백화점"] },
  "im-daebaek-purple": { blurb: "대구백화점 5% 할인", tags: ["커피", "외식", "백화점"] },
  "tictoc-pass": { blurb: "대중교통 할인 혜택", tags: ["배달앱", "커피", "어디서나 할인", "외식", "주유", "백화점", "반려동물", "항공 마일리지"] },
  "tictoc-allday": { blurb: "시간대별 할인 혜택", tags: ["배달앱", "커피", "어디서나 할인", "외식", "주유", "백화점", "항공 마일리지", "공항라운지"] },
  "happy-credit": { blurb: "다양한 국가 바우처를 국민행복카드 하나로", tags: ["온라인쇼핑", "외식", "대중교통"] },

  // 체크카드
  "imc-kpass": { blurb: "K-패스 혜택에 대중교통 10% 추가할인까지", tags: ["편의점", "커피", "이동통신", "영화"] },
  "imc-a": { blurb: "온라인쇼핑·배달앱·편의점 5% 할인", tags: ["온라인쇼핑", "배달앱", "편의점"] },
  "imc-ddokdi": { blurb: "커피·영화·편의점·이동통신·잡화 5% 할인", tags: ["편의점", "커피", "이동통신", "영화"] },
  "imc-master-young": { blurb: "해외가맹점 이용 가능한 Y+체크카드", tags: ["편의점", "커피", "외식", "영화"] },
  "imc-z": { blurb: "조건없이 쓸 때마다 0.2% 할인", tags: ["어디서나 할인"] },
  "imc-kakaopay": { blurb: "카카오페이 이용금액 15% 할인", tags: ["온라인쇼핑", "편의점", "간편결제"] },
  "imc-dandi": { blurb: "아웃백·VIPS 10% 할인", tags: ["외식", "주유"] },
  "imc-happy-check": { blurb: "다양한 국가 바우처를 국민행복카드 하나로", tags: ["온라인쇼핑", "외식"] },
  "imc-young": { blurb: "스타벅스 20% 할인", tags: ["편의점", "커피", "외식", "영화"] },

  // 기업(개인사업자·법인) 신용
  "im-biz-soho": { blurb: "개인사업자를 위한 전월 실적 조건 없는 사업지원 서비스", tags: [] },
  "im-biz-plus": { blurb: "법인/개인사업자에 최적화된 혜택", tags: [] },
  "im-giup": { blurb: "중소기업의 든든한 동반자", tags: ["편의점", "이동통신"] },
  "im-special-ev": { blurb: "안전한 충전도 특별한 적립도 한번에", tags: ["전기차/수소차"] },
  "im-special-point": { blurb: "심플한 사용도 특별한 적립도 한번에", tags: ["어디서나 적립"] },
  "im-pharmco-cashback": { blurb: "의약품 구입대금 결제 시 1% 캐쉬백", tags: [] },
  "im-biz-skypass": { blurb: "비즈니스 성공도, 마일리지 적립도 한번에", tags: ["항공 마일리지"] },
  "im-special-oil": { blurb: "안전한 주유도 특별한 적립도 한번에", tags: ["주유"] },
  "im-autobill": { blurb: "스마트한 경비관리는 오토빌카드", tags: [] },
  "im-pharmco-point": { blurb: "의약품 구입대금 결제 시 1% 포인트", tags: [] },
  "im-biz-skypass-corp": { blurb: "비즈니스 성공도, 마일리지 적립도 한번에 (법인크레딧)", tags: ["항공 마일리지"] },
  "im-soho": { blurb: "1% 캐시백·부가세 환급·주유·쇼핑 할인까지", tags: ["어디서나 할인", "대중교통", "백화점", "항공 마일리지"] },

  // 기업 체크
  "imc-goodluck-soho": { blurb: "사업 필수업종에서 포인트 적립을 한번에", tags: [] },
  "imc-cashback-corp": { blurb: "심플한 사용, 간편한 캐시백을 한번에", tags: [] },
  "imc-biz-point": { blurb: "비즈니스 성공을 위한 기업 체크카드", tags: ["편의점"] },
  "imc-biz-autobill": { blurb: "스마트한 경비관리는 오토빌체크카드", tags: [] },
  "imc-green-biz": { blurb: "당신의 녹색실천! 그린카드가 기억합니다", tags: ["편의점", "간편결제"] },
};

/* 대표 혜택 컬럼 — 목록 중앙에 [라벨 / 값] 2~3개로 노출(카드고릴라식).
   상품설명서 대표혜택을 요약. 미기재 카드는 blurb 한 줄로 대체된다. */
const BENEFITS = {
  "im-travel": [{ label: "일상·여행", value: "5~10% 청구할인" }, { label: "공항라운지", value: "무료 이용" }, { label: "해외 수수료", value: "면제" }],
  "im-kpass": [{ label: "대중교통", value: "10% 할인" }, { label: "생활업종", value: "5% 할인" }],
  "im-living": [{ label: "생활요금", value: "10% 할인" }, { label: "스트리밍", value: "30% 할인" }],
  "im-anygreen": [{ label: "전기·수소차 충전", value: "20~40% 적립" }, { label: "모빌리티·대중교통", value: "10% 적립" }],
  "im-skypass-silver": [{ label: "대한항공", value: "1천원당 1마일" }],
  "im-skypass-gold": [{ label: "대한항공", value: "1천원당 최대 2마일" }, { label: "공항라운지", value: "무료 이용" }],
  "im-i": [{ label: "5개 영역", value: "10% 청구할인" }],
  "im-untact": [{ label: "간편결제·배달앱", value: "10% 할인" }, { label: "스트리밍", value: "30% 할인" }],
  "im-green-v2": [{ label: "대중교통", value: "최대 20% 적립" }, { label: "생활·영화", value: "5% 적립" }],
  "im-greit": [{ label: "주유·마트·커피", value: "할인" }, { label: "캐시백", value: "결제계좌 입금" }],
  "im-shopping": [{ label: "쇼핑", value: "최대 10% 할인" }, { label: "영화", value: "할인" }],
  "im-petlove": [{ label: "동물병원", value: "20% 할인" }, { label: "반려업종", value: "10% 할인" }],
  "im-one": [{ label: "전 가맹점", value: "TOP포인트 적립" }, { label: "전월실적", value: "조건 없음" }],
  "im-daebaek-black": [{ label: "대구백화점", value: "우대 서비스" }, { label: "생활", value: "대백포인트" }],
  "im-daebaek-purple": [{ label: "대구백화점", value: "우대 서비스" }, { label: "생활", value: "대백포인트" }],
  "im-hipass": [{ label: "고속도로 통행료", value: "자동 결제" }, { label: "출퇴근", value: "20~50% 할인" }],
  "im-dandi-credit": [{ label: "평상시 모드", value: "생활 할인" }, { label: "세이브 모드", value: "최대 70만원" }],
  "im-hd-mpoint": [{ label: "전 가맹점", value: "1.5% M포인트" }],
  "tictoc-pass": [{ label: "시간대별", value: "10% 할인" }, { label: "대중교통", value: "할인" }],
  "tictoc-allday": [{ label: "시간대별", value: "10% 할인" }, { label: "대중교통", value: "할인" }],
  "happy-credit": [{ label: "정부 바우처", value: "통합 지원" }],
};

/* 연회비 — iM뱅크 상품설명서(마크다운) 기준. 행에 "연회비 "가 앞에 붙는다. */
const FEE = {
  "im-travel": "국내전용 14,000원 / 겸용 15,000원",
  "im-kpass": "5,000원",
  "im-living": "10,000원",
  "im-anygreen": "15,000원",
  "im-skypass-silver": "19,000원",
  "im-skypass-gold": "35,000원",
  "im-i": "10,000원",
  "im-untact": "10,000원",
  "im-green-v2": "국내전용 10,000원 / 겸용 12,000원",
  "im-greit": "국내전용 10,000원 / 겸용 15,000원",
  "im-shopping": "국내전용 5,000원 / 겸용 8,000원",
  "im-petlove": "국내전용 15,000원 / 겸용 17,000원",
  "im-one": "국내전용 2,000원 / 겸용 5,000원",
  "im-daebaek-black": "국내전용 2,000원 / 겸용 5,000원",
  "im-daebaek-purple": "국내전용 2,000원 / 겸용 5,000원",
  "im-hipass": "2,000원 (국내전용)",
  "tictoc-pass": "국내전용 2,000원 / 겸용 5,000원",
  "tictoc-allday": "국내전용 2,000원 / 겸용 5,000원",
  "happy-credit": "면제",
};

/* 상품설명서 PDF를 로컬에 저장해 둔 카드 — public/promo/cards/<id>.pdf */
const HAS_PDF = new Set([
  // 신용
  "im-travel", "im-kpass", "im-anygreen", "im-skypass-silver", "im-skypass-gold",
  "im-i", "im-untact", "im-one", "im-living", "im-green-v2", "im-greit",
  "im-shopping", "im-petlove", "im-daebaek-black", "im-daebaek-purple",
  "im-dandi-credit", "im-hipass", "tictoc-pass", "tictoc-allday", "happy-credit",
  // 체크
  "imc-kpass", "imc-a", "imc-z", "imc-kakaopay", "imc-bujamile", "imc-ddokdi",
  "imc-new-hyundai", "imc-daebaek-plus", "imc-master-young", "imc-hyundai-dept",
  "imc-young", "imc-happypoint", "imc-dandi", "imc-happy-check",
  // 기업 신용
  "im-biz-soho", "im-biz-plus", "im-giup", "im-special-ev", "im-special-point",
  "im-pharmco-cashback", "im-biz-skypass", "im-special-oil", "im-autobill",
  "im-pharmco-point", "im-biz-skypass-corp", "im-soho",
  // 기업 체크
  "imc-goodluck-soho", "imc-cashback-corp", "imc-biz-point", "imc-biz-autobill", "imc-green-biz",
]);

/* 기업(개인사업자·법인) 카드 — 신용. [이미지파일, 카드명, 신용/체크] */
const BIZ_CATALOG = [
  ["im-biz-soho.png", "iM biz 소호(SOHO)카드", "credit"],
  ["im-biz-plus.png", "iM BIZ+카드", "credit"],
  ["im-giup.png", "iM 氣UP!카드", "credit"],
  ["im-special-ev.png", "iM Special EV카드", "credit"],
  ["im-special-point.png", "iM Special POINT카드", "credit"],
  ["im-pharmco-cashback.png", "의약품결제전용 팜코카드(캐쉬백형)", "credit"],
  ["im-biz-skypass.png", "biz SKYPASS카드", "credit"],
  ["im-special-oil.png", "iM Special OIL카드", "credit"],
  ["im-autobill.png", "iM AUTOBILL카드", "credit"],
  ["im-pharmco-point.png", "의약품결제전용 팜코카드(포인트형)", "credit"],
  ["im-biz-skypass-corp.png", "biz SKYPASS카드(법인크레딧)", "credit"],
  ["im-soho.png", "iM SOHO 카드", "credit"],
  // 기업 체크
  ["imc-goodluck-soho.png", "GOODLUCK SOHO 체크카드", "check"],
  ["imc-cashback-corp.png", "iM CASHBACK CORPORATE 체크카드", "check"],
  ["imc-biz-point.png", "iM biz POINT 카드", "check"],
  ["imc-biz-autobill.png", "iM AUTOBILL 체크카드", "check"],
  ["imc-green-biz.png", "그린기업체크카드", "check"],
];

const toCard = (segment) => ([file, name, type]) => {
  const id = file.replace(/\.(webp|png|jpg|jpeg)$/i, "");
  if (id === "im-seven-cashback") return SEVEN;
  const info = INFO[id] || {};
  return {
    id,
    name,
    issuer: "iM뱅크",
    segment,
    type,
    image: IMG(file),
    blurb: info.blurb || "",
    tags: info.tags || [],
    maxBenefit: "",
    benefits: BENEFITS[id] || [],
    annualFee: FEE[id] || "",
    spendReq: "",
    note: "",
    ebizLink: "",
    prospectusUrl: HAS_PDF.has(id) ? `/promo/cards/${id}.pdf` : "",
    adCopy: "",
  };
};

export const CARDS = [
  ...CATALOG.map(toCard("personal")),
  ...BIZ_CATALOG.map(toCard("biz")),
];

export const findCard = (id) => CARDS.find((c) => c.id === id) ?? null;

/* eBiz에서 불러와 저장한 가입 링크/문구 — 브라우저 로컬(직원 개인)에 보관.
   cards.js(adCopy)에 없는 카드도 한 번 저장하면 다음부터 자동으로 불러온다. */
export const STORED_LINKS_KEY = "salesbridge.card.links";
export const loadStoredLinks = () => {
  try {
    return JSON.parse(localStorage.getItem(STORED_LINKS_KEY) || "{}");
  } catch {
    return {};
  }
};
export const saveStoredLink = (id, text) => {
  const m = loadStoredLinks();
  m[id] = text;
  try {
    localStorage.setItem(STORED_LINKS_KEY, JSON.stringify(m));
  } catch {
    /* 저장 불가(프라이빗 모드 등) */
  }
  return m;
};
/* 카드의 유효 가입 문구 — 코드 등록(adCopy) 우선, 없으면 저장된 링크 */
export const resolveAdCopy = (card, stored = {}) =>
  (card && (card.adCopy || stored[card.id])) || "";
