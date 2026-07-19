/* 지자체 가입(희망)장려금 지원조건 (2026. 1. 1 기준)
   출처: 노란우산 청약서(26.1.1 시행) p.7
   매출 기준: 직전 연도 연매출
   monthlyAmount: 매월 적립되는 장려금
   maxAmount: 가입일로부터 1년간 최대 적립액 (= monthly × 12)
*/

export const INCENTIVE_REGIONS = {
  // 광역 지자체
  광역: [
    { region: "서울시", revenueLimit: "3억원 이하", monthlyAmount: 20000, maxAmount: 240000 },
    { region: "부산시", revenueLimit: "3억원 이하", monthlyAmount: 20000, maxAmount: 240000 },
    { region: "대구시", revenueLimit: "3억원 이하", monthlyAmount: 20000, maxAmount: 240000 },
    { region: "인천시", revenueLimit: "3억원 이하", monthlyAmount: 20000, maxAmount: 240000, note: "'19.1월 이후 가입자 신청 가능" },
    { region: "광주시", revenueLimit: "3억원 이하", monthlyAmount: 20000, maxAmount: 240000 },
    { region: "대전시", revenueLimit: "3억원 이하", monthlyAmount: 30000, maxAmount: 360000 },
    { region: "울산시", revenueLimit: "3억원 이하", monthlyAmount: 10000, maxAmount: 120000 },
    { region: "세종시", revenueLimit: "3억원 이하", monthlyAmount: 20000, maxAmount: 240000 },
    { region: "경기도", revenueLimit: "3억원 이하", monthlyAmount: 10000, maxAmount: 120000 },
    { region: "충청남도 내 시군", revenueLimit: "3억원 이하", monthlyAmount: 30000, maxAmount: 360000 },
    { region: "경상북도", revenueLimit: "3억원 이하", monthlyAmount: 20000, maxAmount: 240000 },
    { region: "제주도", revenueLimit: "3억원 이하", monthlyAmount: 20000, maxAmount: 240000 },
    { region: "전라남도 내 시군", revenueLimit: "3억원 이하", monthlyAmount: 30000, maxAmount: 360000 },
    { region: "경상남도 내 시군", revenueLimit: "3억원 이하", monthlyAmount: 20000, maxAmount: 240000 },
    { region: "강원도 내 시군", revenueLimit: "3억원 이하", monthlyAmount: 10000, maxAmount: 120000 },
    { region: "충청북도 내 시군", revenueLimit: "3억원 이하", monthlyAmount: 10000, maxAmount: 120000 },
    { region: "전라북도 내 시군", revenueLimit: "3억원 이하", monthlyAmount: 20000, maxAmount: 240000 },
  ],
  // 기초 지자체 (광역과 별도 신청 가능 — 단, 동일 사업자 1회 한정)
  기초: [
    { region: "인천 부평", revenueLimit: "3억원 이하", monthlyAmount: 10000, maxAmount: 120000, note: "'25.1.2 이후 가입 소상공인" },
    { region: "인천 계양", revenueLimit: "제한 없음", monthlyAmount: 10000, maxAmount: 120000, note: "'21.1월 이후 가입 소상공인" },
    { region: "인천 동구", revenueLimit: "3억원 이하", monthlyAmount: 20000, maxAmount: 240000, note: "'26.1월 이후 가입 소상공인" },
    { region: "인천 중구", revenueLimit: "3억원 이하", monthlyAmount: 20000, maxAmount: 240000, note: "'21.7월 이후 가입 소상공인" },
    { region: "경기 광명", revenueLimit: "10억원 이하", monthlyAmount: 20000, maxAmount: 240000 },
    { region: "서울 영등포", revenueLimit: "3억원 이하", monthlyAmount: 10000, maxAmount: 120000 },
    { region: "서울 동작구", revenueLimit: "3억원 이하", monthlyAmount: 10000, maxAmount: 120000 },
    { region: "서울 도봉구", revenueLimit: "3억원 이하", monthlyAmount: 10000, maxAmount: 120000 },
    { region: "서울 서대문구", revenueLimit: "3억원 이하", monthlyAmount: 10000, maxAmount: 120000 },
    { region: "서울 금천구", revenueLimit: "3억원 이하", monthlyAmount: 10000, maxAmount: 120000 },
    { region: "경남 밀양(B)", revenueLimit: "3억원 이하", monthlyAmount: 30000, maxAmount: 360000 },
    { region: "전남 여수(B)", revenueLimit: "3억원 이하", monthlyAmount: 10000, maxAmount: 120000, note: "2년 내 임의 해약 시 장려금 미지원" },
  ],
};
