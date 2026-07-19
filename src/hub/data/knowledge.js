/* PB 지식 라이브러리 — 3개 카테고리 + 샘플 콘텐츠.
   현재는 껍데기(입구)와 샘플 항목만. 상세 페이지/검색은 이후 확장.
   items[].to 가 있으면 링크, 없으면 "준비 중"으로 표시. */
export const KNOWLEDGE = [
  {
    id: "tax",
    name: "세무 지식",
    desc: "금융상품 과세·절세 실무",
    icon: "Receipt",
    items: [
      { title: "금융소득 종합과세 2,000만원 기준선", tag: "과세" },
      { title: "ISA 순소득 200만원 비과세·초과분 9.9% 분리과세", tag: "절세" },
      { title: "연금계좌 세액공제 한도(연 900만원) 정리", tag: "연금" },
    ],
  },
  {
    id: "regulation",
    name: "판매 규제",
    desc: "금소법·적합성 원칙",
    icon: "Scale",
    items: [
      { title: "금융소비자보호법 6대 판매원칙", tag: "금소법" },
      { title: "적합성·적정성 원칙 상담 체크포인트", tag: "적합성" },
      { title: "설명의무 이행·녹취 대상 상품 구분", tag: "설명의무" },
    ],
  },
  {
    id: "glossary",
    name: "용어 사전",
    desc: "상담 필수 용어 풀이",
    icon: "BookMarked",
    items: [
      { title: "부가지급률 · 기준이율", tag: "공제" },
      { title: "손익통산 · 이월결손금", tag: "세무" },
      { title: "TDF · 글라이드패스", tag: "투자" },
    ],
  },
];
