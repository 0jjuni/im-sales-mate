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
  if (merchant?.posRegistered === false) return "unregistered";
  if (!merchant?.bank?.trim()) return "unknown";
  if (typeof merchant.isOwnBank === "boolean") return merchant.isOwnBank ? "own" : "other";
  const name=merchant.bank.replace(/\s/g, "").toLowerCase();
  return ["im뱅크", "아이엠뱅크", "대구은행", "dgb대구은행"].includes(name) ? "own" : "other";
}

export function proposalSummary(item, data, products, manual) {
  const product=products.find(p=>p.key===item.key);
  const questions={
    isa:"다른 금융기관에 ISA가 있으신가요? 이 자금은 언제 쓰실 예정인가요?",
    housing:"주택 마련 계획이 있으신가요? 무주택 여부와 소득 조건도 함께 확인할게요.",
    noran:"종합소득세 신고하실 때 세금 부담이 크지 않으셨어요? 노후자금도 마련하면서 소득공제로 세금 부담을 줄일 수 있는 노란우산공제가 있는데, 한번 안내해드릴까요?",
    cardPersonal:"주로 쓰시는 카드와 지출이 많은 항목은 무엇인가요?",
    cardBiz:"사업 경비는 어떤 카드로 결제하고 계신가요?",
    insMonthly:"매월 추가로 납입할 수 있는 금액과 유지 가능한 기간은 어느 정도인가요?",
    insOther:"예금하실 자금 중 일부는 나눠서 오래 두실 여유가 있으실까요? 장기로 두시면 더 높은 금리를 받을 수 있는 상품도 함께 비교해드릴게요. 얼마 정도를 장기간 두실 수 있을까요?",
    nontaxSavings:"다른 금융기관에서 이용 중인 비과세종합저축이 있으신가요?",
  };
  if(product) return {reason:product.remaining?`조회된 추가 납입 여력 ${product.remaining}`:product.held?"당행 보유 상품의 추가 활용 검토":(item.detail||"신규 가입 검토 대상"),question:questions[item.key]||"현재 이용 중인 상품과 자금 사용 계획을 알려주시겠어요?"};
  if(item.tag==="주거래 전환") return {reason:`가맹점 결제계좌 ${data.merchantSettlement?.bank} 이용 중`,question:"가맹점 결제계좌를 당행으로 옮기시면 30만원 상당의 Npay 커넥트 POS 기기를 드리고 있어요. 이번에 결제계좌를 옮겨보시는 건 어떠세요?"};
  if(item.cta?.to==="/pension") return {reason:`${manual.incomeType || "소득 유형"} · 연금계좌 납입 현황 확인`,question:"올해 연금계좌에 납입한 금액이 있나요? 앞으로 꾸준히 납입 가능한 금액은 얼마인가요?"};
  if(item.cta?.to==="/wealth") return {reason:`당행 예금·수신 ${(data.deposits||[]).reduce((sum,d)=>sum+(d.balance||0),0).toLocaleString()}만원`,question:"예정된 지출을 제외하고 투자할 여유자금이 있나요? 투자 경험과 손실 감수 범위도 확인할게요."};
  return {reason:item.detail,question:"현재 이용 목적과 거래 조건을 알려주시겠어요?"};
}
