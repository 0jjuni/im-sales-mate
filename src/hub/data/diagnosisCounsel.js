// 상담 순서는 고객번호가 아닌 조회 결과로만 정한다.
export function counselPriorities(data, products) {
  const items = [];
  const j = data.jonghap;
  if (j.isTarget || j.restrictedByHistory) items.push({key:"restriction", title:"가입 제한부터 확인", fact:`${j.taxYear}년 ${j.isTarget ? "종합과세 대상" : "비대상"} · 직전 과세기간 대상 이력 ${j.restrictedByHistory ? "있음" : "없음"}`, question:"보유 계좌의 만기·연장 계획이 있으신가요?", action:"제한 상품은 신규 제안에서 제외하고 보유 계좌 처리 조건 확인", href:"#diagnosis-products"});
  const due = (data.deposits || []).filter(d=>Number.isFinite(d.maturityInDays)&&d.maturityInDays>=0&&d.maturityInDays<=30);
  if(due.length) items.push({key:"maturity",title:"다가오는 만기자금 상담",fact:`30일 이내 만기 ${due.length}건 · ${due.reduce((sum,d)=>sum+(d.balance||0),0).toLocaleString()}만원 · 가장 빠른 만기 D-${Math.min(...due.map(d=>d.maturityInDays))}`,question:"만기 후 이 자금을 언제, 어떤 용도로 쓰실 예정인가요?",action:"사용 시점과 자동재예치 의사를 확인한 뒤 상품 비교",href:"#diagnosis-deposits"});
  const available=products.filter(p=>p.state==="available" && p.remaining);
  if(available.length) items.push({key:"capacity",title:"보유 상품의 추가 활용 검토",fact:`추가 납입 여력이 조회된 상품 ${available.length}건`,question:"추가 납입 후에도 생활비와 예정 지출에 여유가 있으신가요?",action:"상품별 납입 조건과 유지 기간 확인",href:"#diagnosis-products"});
  if(!items.length) items.push({key:"needs",title:"자금 목적부터 확인",fact:`당행 상품 ${products.length}종 조회`,question:"지금 가장 필요한 것은 목돈 마련, 노후 준비, 지출 관리 중 무엇인가요?",action:"고객 목적에 맞는 제안부터 선택",href:"#diagnosis-proposals"});
  return items.slice(0,2);
}
export function counselQuestion(item) {
  if(item.key==="isa") return "타행 ISA 보유 여부와 자금 사용 시점, 가입 유형을 확인하세요.";
  if(item.key==="housing") return "주택 마련 계획과 소득공제 요건을 확인하세요.";
  if(item.key==="noran") return "사업 현황과 매월 납입 가능한 금액을 확인하세요.";
  if(item.key?.startsWith("card")) return "주로 쓰는 카드와 월 지출 항목을 확인하세요.";
  if(item.key?.startsWith("ins")) return "장기 유지 가능 여부와 타행 계약을 포함한 납입 현황을 확인하세요.";
  if(item.cta?.to==="/pension") return "기존 연금계좌 납입액과 장기 유지 가능 여부를 확인하세요.";
  if(item.cta?.to==="/wealth") return "자금 사용 시점, 투자 경험과 손실 감수 범위를 확인하세요.";
  return "고객의 이용 목적과 현재 거래 조건을 확인한 뒤 제안하세요.";
}

export function relevantProduct(product, incomeType) {
  return incomeType !== "근로소득자" || !["noran", "cardBiz"].includes(product.key);
}
export function settlementStatus(merchant) {
  if (!merchant?.bank?.trim()) return "unknown";
  if (typeof merchant.isOwnBank === "boolean") return merchant.isOwnBank ? "own" : "other";
  const name=merchant.bank.replace(/\s/g, "").toLowerCase();
  return ["im뱅크", "아이엠뱅크", "대구은행", "dgb대구은행"].includes(name) ? "own" : "other";
}
