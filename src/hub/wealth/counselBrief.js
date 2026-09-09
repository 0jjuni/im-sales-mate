// Explanations are selected only when the bank lists the corresponding risk.
// The original risk wording remains available beside each explanation.
export function riskBrief(title, original) {
  if (/원본.*손실|원금.*손실/.test(title)) return "원금이 보장되지 않아 투자금의 일부 또는 전부를 잃을 수 있습니다.";
  if (/집중투자|집중위험|포트폴리오.*집중/.test(title)) return "특정 업종이나 자산에 투자가 몰려 있어, 해당 시장이 부진하면 손실이 커질 수 있습니다.";
  if (/환율|환위험/.test(title)) return "투자자산의 가격 외에 환율 변동도 수익과 손실에 영향을 줍니다.";
  if (/유동성/.test(title)) return "보유자산을 원하는 때에 팔기 어려우면 환매가 지연되거나 불리한 가격에 매각될 수 있습니다.";
  if (/시장위험.*개별위험/.test(title)) return "시장 상황이나 투자한 기업의 실적·신용상태가 나빠지면 펀드 가치가 떨어질 수 있습니다.";
  if (/신용|거래상대방/.test(title)) return "투자한 기업이나 거래상대방의 신용이 나빠지거나 채무를 갚지 못하면 손실이 생길 수 있습니다.";
  if (/금리/.test(title)) return "금리가 변하면 보유 채권의 가격이 달라져 펀드 가치에도 영향을 줍니다.";
  return original.split(/(?<=다\.)\s+/)[0];
}

export const conditionLines = text => text.replace(/(\d{1,2}시(?:\s*\d{1,2}분)?\s*(?:이전|이후))/g, "\n$1").trim();
