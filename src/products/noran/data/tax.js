/* 소득 구간별 소득공제 한도와 추정 한계세율
   - 한도: 조세특례제한법 제86조의3 제1항 (법률 2025.7.1 시행 / 시행령 2026.2.27)
   - 한계세율: 종합소득세율표 + 지방소득세 10% 가산
   - 한계세율은 단일 추정치 — 다른 소득·공제 합산 결과에 따라 달라질 수 있음
   - 법인대표자 특례: 총급여 8천만원 초과(= 근로소득금액 6,625만원 초과) 시 근로소득금액에서 소득공제 불가
     (TaxSavingCalculator에서 salaryOver80m 체크박스로 차단) */
export const INCOME_BRACKETS = [
  {
    id: "under_40m",
    label: "4천만원 이하",
    rangeText: "사업(근로)소득금액 4천만원 이하",
    deductionLimit: 6_000_000,
    marginalRate: 0.165, // 15% + 지방세 1.5%
    rateLabel: "15% + 지방세",
  },
  {
    id: "40m_60m",
    label: "4천만원 초과 ~ 6천만원 이하",
    rangeText: "사업(근로)소득금액 4천만원 초과 6천만원 이하",
    deductionLimit: 5_000_000,
    marginalRate: 0.264, // 24% + 지방세 2.4%
    rateLabel: "24% + 지방세",
  },
  {
    id: "60m_100m",
    label: "6천만원 초과 ~ 1억원 이하",
    rangeText: "사업(근로)소득금액 6천만원 초과 1억원 이하",
    deductionLimit: 4_000_000,
    marginalRate: 0.385, // 35% + 지방세 3.5%
    rateLabel: "35% + 지방세",
  },
  {
    id: "over_100m",
    label: "1억원 초과",
    rangeText: "사업(근로)소득금액 1억원 초과",
    deductionLimit: 2_000_000,
    marginalRate: 0.418, // 38% + 지방세 3.8%
    rateLabel: "38% + 지방세",
  },
];

/* 별표3 일반해약환급금 지급기준표 — 부금납부월수별 환급률
   환급금 = 납부원금 × baseRate + 적립이자 × interestShare
   [2026.7.1 개정 반영]
   · 주4: 납부부금 = 부금월액 + 추가납입부금 (제14조의2 신설)
   · 주5: 부금납부월수 6회 이하 시점에 납입된 추가납입부금은 해약 시 100.0%로 반환
   · 지급률·이자율 수치 자체는 26.1.1 → 26.7.1 개정에서 변동 없음 */
export const REFUND_TABLE_GENERAL = [
  { from: 1, to: 3, baseRate: 0.8, interestShare: 0, label: "1~3회: 80%" },
  { from: 4, to: 6, baseRate: 0.9, interestShare: 0, label: "4~6회: 90%" },
  { from: 7, to: 12, baseRate: 1.0, interestShare: 0, label: "7~12회: 100%" },
  { from: 13, to: 24, baseRate: 1.0, interestShare: 0.1, label: "13~24회: 100% + 이자 10%" },
  { from: 25, to: 36, baseRate: 1.0, interestShare: 0.2, label: "25~36회: 100% + 이자 20%" },
  { from: 37, to: 60, baseRate: 1.0, interestShare: 0.3, label: "37~60회: 100% + 이자 30%" },
  { from: 61, to: 72, baseRate: 1.0, interestShare: 0.4, label: "61~72회: 100% + 이자 40%" },
  { from: 73, to: 120, baseRate: 1.0, interestShare: 0.5, label: "73~120회: 100% + 이자 50%" },
  { from: 121, to: 180, baseRate: 1.0, interestShare: 0.7, label: "121~180회: 100% + 이자 70%" },
  { from: 181, to: 240, baseRate: 1.0, interestShare: 0.8, label: "181~240회: 100% + 이자 80%" },
  { from: 241, to: 9999, baseRate: 1.0, interestShare: 0.95, label: "241회 이상: 100% + 이자 95%" },
];

/* 간주해약 환급기준 — 별표2 */
export const REFUND_TABLE_DEEMED = [
  { from: 1, to: 12, label: "1~12회: 납부부금 (이자 미부리)", calcType: "principal" },
  {
    from: 13,
    to: 36,
    label: "13~36회: 100% + 지급이자의 70%",
    calcType: "principal_plus",
    interestShare: 0.7,
  },
  {
    from: 37,
    to: 9999,
    label: "37회 이상: 기준이율 부리적립 전액",
    calcType: "full_compound",
  },
];

