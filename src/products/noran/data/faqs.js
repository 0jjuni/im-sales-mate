export const FAQS = [
  {
    id: "faq-001",
    category: "payment",
    question: "부금월액은 얼마부터 얼마까지 가능한가요?",
    shortAnswer:
      "월 5만원~150만원, 1만원 단위로 선택 가능합니다 (2026.7.1 시행 · 舊 100만원에서 상향). 해당 연도 부금월액을 완납한 경우 연 납입한도 내에서 「추가납입부금」(10,000원 단위·최저 5만원)도 별도 신청 가능합니다.",
    sourceReference: { articles: ["제9조", "제14조의2"] },
  },
  {
    id: "faq-002",
    category: "payment",
    question: "부금을 미리 납부할 수 있나요?",
    shortAnswer: "해당 연도분 6개월분까지 선납 가능. 단, 부금납부월수에는 포함되지 않습니다.",
    sourceReference: { articles: ["제14조"] },
  },
  {
    id: "faq-003",
    category: "payment",
    question: "부금을 24개월 이상 미납하면 어떻게 되나요?",
    shortAnswer: "중앙회가 계약을 강제해지할 수 있습니다. 12개월 이상 연체자는 정상계약 전환 신청 가능.",
    sourceReference: { articles: ["제8조 제2항", "제8조의2"] },
  },
  {
    id: "faq-004",
    category: "claim",
    question: "노령급부는 언제 청구할 수 있나요?",
    shortAnswer: "만 60세 이상 + 부금납부월수 120개월(10년) 이상이면 사업을 계속하셔도 청구 가능합니다.",
    sourceReference: { articles: ["제17조 제1항 제4호"] },
  },
  {
    id: "faq-005",
    category: "claim",
    question: "공제금이 지급되는 사유는 몇 가지인가요?",
    shortAnswer: "8가지: 폐업, 사망, 법인대표 질병·부상 퇴임, 노령급부, 자연재난, 사회재난, 6개월 이상 요양, 회생, 파산.",
    sourceReference: { articles: ["제17조"] },
  },
  {
    id: "faq-006",
    category: "claim",
    question: "공제금은 분할로 받을 수 있나요?",
    shortAnswer: "분할대상 1천만원 이상 + 폐업·법인대표 퇴임 사유 발생일 만 60세 이상인 경우 5/10/15/20년 분할 가능. 사망은 분할 불가.",
    sourceReference: { articles: ["제31조"] },
  },
  {
    id: "faq-007",
    category: "termination",
    question: "단기 해약 시 원금 손실이 있나요?",
    shortAnswer: "있습니다. 1~3회 해약은 80%, 4~6회는 90%만 환급됩니다.",
    sourceReference: { articles: ["별표3"] },
  },
  {
    id: "faq-008",
    category: "termination",
    question: "해약환급금은 어떻게 과세되나요?",
    shortAnswer: "기본은 기타소득. 단, 120개월 이상 가입자가 경영악화로 해지하거나 간주해약 등 특수사유에 해당하면 퇴직소득.",
    sourceReference: { articles: ["안내서 12쪽"] },
  },
  {
    id: "faq-009",
    category: "loan",
    question: "공제계약대출 한도는 어떻게 정해지나요?",
    shortAnswer: "신청일 강제해지 가정 일반해약환급금 - 원천징수예상세액 범위 내. 납부부금 합계액 초과 불가.",
    sourceReference: { articles: ["제37조"] },
  },
  {
    id: "faq-010",
    category: "loan",
    question: "공제계약대출 이자는 얼마인가요?",
    shortAnswer: "일반대출은 기준이율 + 연 3% 범위 내에서 중앙회가 정해 홈페이지에 공지합니다.",
    sourceReference: { articles: ["제39조"] },
  },
  {
    id: "faq-011",
    category: "protection",
    question: "공제금이 압류될 수 있나요?",
    shortAnswer: "공제금 수급권은 법적으로 양도·압류·담보 제공이 금지됩니다. 행복지킴이 통장 활용 권장.",
    sourceReference: { articles: ["제19조"] },
  },
  {
    id: "faq-012",
    category: "enrollment",
    question: "가입 후 청약을 철회할 수 있나요?",
    shortAnswer: "청약일 또는 청약금 납부일로부터 30일 이내 철회 가능합니다.",
    sourceReference: { articles: ["제2조"] },
  },
  {
    id: "faq-013",
    category: "deduction",
    question: "소득공제 한도는 얼마인가요?",
    shortAnswer: "소득금액 4천만원 이하 600만원, ~6천만원 500만원, ~1억원 400만원, 1억원 초과 200만원.",
    sourceReference: { articles: ["안내서 5쪽"] },
  },
  {
    id: "faq-014",
    category: "enrollment",
    question: "가입 제한 업종은 어떤 것이 있나요?",
    shortAnswer: "일반/무도유흥주점업, 무도장, 사행시설, 카지노, 시각장애인 외 안마원·안마시술소.",
    sourceReference: { articles: ["제5조 제2호"] },
  },
  {
    id: "faq-015",
    category: "claim",
    question: "공제금 청구권에 시효가 있나요?",
    shortAnswer:
      "네. 공제금 청구권은 5년간 행사하지 않으면 소멸시효 완성으로 소멸됩니다 (중협법 제121조의2, 2026.6.3 시행). 중앙회 안내·통지 시 시효 중단 효력.",
    sourceReference: { articles: ["중협법 제121조의2"] },
  },
  {
    id: "faq-016",
    category: "termination",
    question: "경영악화로 해지 시 퇴직소득 과세 기준은요?",
    shortAnswer:
      "직전 과세연도 총수입금액이 전 3개 과세연도 평균 대비 100분의 20 이상 감소 (50%가 아님). 법정신고기한 이전 해지 시에는 기준 과세연도가 '전전 과세연도'.",
    sourceReference: { articles: ["조특법 시행령 제80조의3 제5항"] },
  },
  {
    id: "faq-017",
    category: "termination",
    question: "배우자/자녀에게 사업양도하면 폐업 공제금이 나오나요?",
    shortAnswer:
      "아니요. 배우자·자녀 양도는 간주해약(환급금) 처리됩니다. 배우자·자녀 외의 자에게 양도하시면 폐업 공제금 지급 사유로 인정됩니다.",
    sourceReference: {
      articles: ["제8조 제3항", "중협법 시행령 제37조 제1항 제1호"],
    },
  },
  {
    id: "faq-018",
    category: "claim",
    question: "공제금에 1원 미만 단수가 발생하면 어떻게 처리되나요?",
    shortAnswer: "1원 미만 단수는 절사됩니다 (운용요강 제68조).",
    sourceReference: { articles: ["운용요강 제68조"] },
  },
  {
    id: "faq-019",
    category: "termination",
    question: "퇴직소득 과세 적용을 받으려면 어떤 서류가 필요한가요?",
    shortAnswer:
      "「특별해지사유신고서」(조특법 시행규칙 별지 제58호의3서식)를 중소기업중앙회에 제출해야 합니다. 사유 발생일부터 6개월 이내 해지 원칙.",
    sourceReference: {
      articles: [
        "조특법 시행령 제80조의3 제9항",
        "조특법 시행규칙 별지 제58호의3서식",
      ],
    },
  },

  /* === 가입 관련 추가 FAQ === */
  {
    id: "faq-020",
    category: "enrollment",
    question: "여러 사업체를 가지고 있는 대표자도 중복 가입이 가능한가요?",
    shortAnswer:
      "불가합니다. 1개 사업체만 선택하여 가입해야 하며, 선택한 사업체의 폐업·퇴임 등에 한하여만 공제금이 지급됩니다. 가입 후 사업체 변경도 불가.",
    sourceReference: { articles: ["제4조 제1항 제2호"] },
  },
  {
    id: "faq-021",
    category: "enrollment",
    question: "법인대표이면서 개인사업자인 경우 어느 지위로 가입해야 하나요?",
    shortAnswer:
      "지위가 중복되는 경우 어느 하나를 선택해야 합니다. 법인대표는 총급여 8천만원 이하만 근로소득공제 가능, 8천만원 초과 시 공제 불가. 개인사업자는 사업소득에서 공제. 절세효과는 세무 전문가 상담 권유.",
    sourceReference: { articles: ["제4조 제2항", "조특법 제86조의3"] },
  },
  {
    id: "faq-022",
    category: "enrollment",
    question: "사업자등록을 하지 않은 프리랜서도 가입할 수 있나요?",
    shortAnswer:
      "가능합니다. 무등록 소상공인 특례로 최근 3개월 사업소득 원천징수 서류로 가입할 수 있습니다. 단, 사업자등록 미이행 시 폐업·자연재난·사회재난 사유 적용 배제 — 사망·노령 사유로만 공제금 청구 가능.",
    sourceReference: { articles: ["제46조", "제47조", "제48조"] },
  },
  {
    id: "faq-023",
    category: "enrollment",
    question: "가입은 어디서 할 수 있나요?",
    shortAnswer:
      "(1) 중소기업중앙회 본부·지역본부, (2) 시중은행 지점·모바일앱 (iM뱅크 포함), (3) 노란우산공제 홈페이지(공동인증서 로그인) — 직원이 영업점에서 직접 청약서 작성 보조 가능.",
    sourceReference: { articles: ["운용요강 제13조"] },
  },
  {
    id: "faq-024",
    category: "enrollment",
    question: "비영리법인 대표자도 가입할 수 있나요?",
    shortAnswer:
      "불가합니다. 가입대상 법인은 「상법」상 회사나 기타 영리를 목적으로 설립된 법인의 대표자에 한정됩니다.",
    sourceReference: { articles: ["제4조 제2항"] },
  },
  {
    id: "faq-025",
    category: "enrollment",
    question: "공제 가입은 언제 효력이 발생하나요?",
    shortAnswer:
      "중앙회가 청약을 승낙한 경우 청약금을 납부한 날을 계약일로 보며 그 날부터 효력 발생. 중앙회는 청약일부터 30일 이내 승낙·거절 통지하고 승낙 시 공제가입증서 교부.",
    sourceReference: { articles: ["제1조"] },
  },
  {
    id: "faq-026",
    category: "enrollment",
    question: "공동사업자가 사업에서 탈퇴한 경우 어떻게 처리되나요?",
    shortAnswer:
      "공동사업에서 탈퇴한 경우 폐업한 것으로 봅니다 (개인사업자 한정). → 폐업 공제금 청구 가능.",
    sourceReference: { articles: ["운용요강 제29조 제2항"] },
  },
  {
    id: "faq-027",
    category: "enrollment",
    question: "청약서 자필서명은 누가 해야 하나요?",
    shortAnswer:
      "본인이 직접 작성하고 자필서명 또는 날인해야 합니다. 누락 시 청약일로부터 3개월 내 계약 취소 사유에 해당.",
    sourceReference: { articles: ["제6조 제2항"] },
  },
  {
    id: "faq-028",
    category: "enrollment",
    question: "지자체 가입장려금이라는 게 있다고 하던데요?",
    shortAnswer:
      "지자체별로 노란우산 가입자에게 일정 기간 월 1~3만원 등 가입장려금을 지원하는 제도가 있을 수 있습니다. 지자체 정책·예산에 따라 변동되므로 노란우산 홈페이지 또는 해당 지자체 안내 확인 필요.",
    sourceReference: { articles: ["내부 업무 기준 확인 필요"] },
  },

  /* === 납입 관련 추가 FAQ === */
  {
    id: "faq-029",
    category: "payment",
    question: "부금월액을 중간에 변경할 수 있나요?",
    shortAnswer:
      "증액은 신청 시 중앙회가 승낙. 감액은 3개월 이상 납입 후 사업경영 악화 등을 사유로 신청 시 중앙회가 승낙. 노란우산 홈페이지·앱·콜센터로 변경 신청 가능.",
    sourceReference: { articles: ["제11조"] },
  },
  {
    id: "faq-030",
    category: "payment",
    question: "부금 납부일을 바꿀 수 있나요?",
    shortAnswer: "예. 계약자가 부금납부기일을 변경할 수 있습니다.",
    sourceReference: { articles: ["제10조 제3항"] },
  },
  {
    id: "faq-061",
    category: "payment",
    question: "「추가납입부금」이 뭔가요? (2026.7.1 신설)",
    shortAnswer:
      "2026.7.1 시행 신설 제도. 해당 연도의 부금월액을 모두 납입하신 계약자가, 연 납입한도 내에서 부금월액과 별도로 추가 납입할 수 있는 부금입니다. 10,000원 단위, 최저 50,000원. 소득이 좋으신 해에 소득공제 한도(최대 600만원)까지 유연하게 채우실 수 있는 도구입니다. 별표3 주5에 따라 부금납부월수 6회 이하 시점에 납입된 추가납입부금은 해약 시 100.0% 반환.",
    sourceReference: { articles: ["제3조", "제10조", "제14조의2"] },
  },
  {
    id: "faq-031",
    category: "payment",
    question: "월납과 분기납 중 어느 쪽이 유리한가요?",
    shortAnswer:
      "2026.7.1 약관 개정으로 「분기납은 폐지」되었습니다. 신규 가입은 월납만 가능. 시행일 이전에 분기납으로 신청하신 기존 계약자는 부칙 제2조에 따라 종전 규정(분기납)이 유지됩니다. 매월 지정 납부일에 자동이체로 납부하시면 되며, 분할납부는 불가.",
    sourceReference: { articles: ["제10조"] },
  },
  {
    id: "faq-032",
    category: "payment",
    question: "부금납부 중지는 몇 번까지 신청할 수 있나요?",
    shortAnswer:
      "사유별로 가능. 단, 경영악화는 연속 2회·계약기간 중 4회 한도. 재해/입원치료/사회재난은 6개월, 파산절차계속/휴업/출산은 1년 동안 중지 가능.",
    sourceReference: { articles: ["제12조"] },
  },
  {
    id: "faq-033",
    category: "payment",
    question: "12개월 이상 부금을 미납했어요. 어떻게 해야 하나요?",
    shortAnswer:
      "정상계약 전환신청서를 제출하고 부금 1회분을 납부하면 미납이력이 소멸됩니다. 전환 시 부금월액 새로 정할 수 있고 감액도 승낙됨. 24개월 이상 미납 시 강제해지될 수 있어 신속한 처리 권장.",
    sourceReference: { articles: ["제8조의2"] },
  },

  /* === 소득공제 관련 추가 FAQ === */
  {
    id: "faq-034",
    category: "deduction",
    question: "연금저축과 노란우산공제 소득공제를 동시에 받을 수 있나요?",
    shortAnswer:
      "가능합니다. 연금저축 세액공제와 노란우산공제 소득공제는 별개 제도로 중복 적용됩니다. (국세청 안내)",
    sourceReference: { articles: ["조특법 제86조의3"] },
  },
  {
    id: "faq-035",
    category: "deduction",
    question: "부동산임대업소득자도 소득공제를 받을 수 있나요?",
    shortAnswer:
      "받을 수 없습니다. 부동산임대업소득은 소득공제 대상에서 제외됩니다.",
    sourceReference: { articles: ["조특법 제86조의3 제1항", "안내서 5쪽"] },
  },
  {
    id: "faq-036",
    category: "deduction",
    question: "법인대표 총급여가 8천만원을 초과하면 어떻게 되나요?",
    shortAnswer:
      "근로소득금액에서 소득공제를 받을 수 없습니다. (2024.12.31 시행령 개정으로 7천만원 → 8천만원 상향). 단, 동시에 개인사업자 지위라면 사업소득 기준 공제 적용 가능 여부는 별도 확인.",
    sourceReference: { articles: ["조특법 제86조의3 제1항"] },
  },
  {
    id: "faq-037",
    category: "deduction",
    question: "소득공제 신청은 어떻게 하나요?",
    shortAnswer:
      "종합소득세 신고 또는 연말정산 시 「공제부금납입증명서」(시행규칙 별지 제58호의4서식)를 세무서장 또는 원천징수의무자에게 제출. 다음 연도부터는 통장사본으로 갈음 가능.",
    sourceReference: {
      articles: [
        "조특법 시행령 제80조의3 제7항",
        "조특법 시행규칙 별지 제58호의4서식",
      ],
    },
  },

  /* === 공제금 관련 추가 FAQ === */
  {
    id: "faq-038",
    category: "claim",
    question: "사망 공제금은 상속재산에 포함되나요?",
    shortAnswer:
      "상속인의 고유재산으로 봅니다. 따라서 수급권자 대표 또는 법정상속비율에 따라 개별 상속인에게 지급. 수급권자 2인 이상 시 대표자 1인 지정 필수.",
    sourceReference: { articles: ["제19조 제1항", "제28조"] },
  },
  {
    id: "faq-039",
    category: "claim",
    question: "공제금 청구 후 지급까지 얼마나 걸리나요?",
    shortAnswer:
      "서류 접수 후 3영업일 이내 지급. 단, 공제금의 경우 사유 조사·확인이 필요한 때는 접수 후 10영업일 이내. 부금 납부일에는 청구 신청 불가.",
    sourceReference: { articles: ["제30조 제2항"] },
  },
  {
    id: "faq-040",
    category: "claim",
    question: "분할공제금을 일시금으로 다시 청구할 수 있나요?",
    shortAnswer:
      "가능합니다. 분할지급 받는 경우라도 계약자 사망 시 또는 계약자가 직접 청구 시 분할공제금의 일괄지급을 청구할 수 있습니다. (단, 온라인 신청 불가 — 직원 안내 필요)",
    sourceReference: { articles: ["제32조"] },
  },
  {
    id: "faq-041",
    category: "claim",
    question: "공제금에 적용되는 이자는 어떻게 계산되나요?",
    shortAnswer:
      "[2026.7.1 별표4 개정] 공제사유 발생일 다음 날부터 청구일까지: 「기준이율」 (舊 1년 이내 1/2 · 1년 초과 1/4 구분 폐지). 청구일 다음 날부터 지급일까지: 기준이율 + 연 1%. 부칙 제3조에 따라 2026.7.1 이후 지급 신청분부터 신 이율 적용.",
    sourceReference: { articles: ["제30조 제3항", "별표4"] },
  },
  {
    id: "faq-042",
    category: "claim",
    question: "중간정산을 받으면 가입은 어떻게 되나요?",
    shortAnswer:
      "재난·6개월 이상 요양 질병부상·회생·파산 사유에 한해 중간정산 청구 가능하며, 청구 후에도 가입은 그대로 유지됩니다.",
    sourceReference: { articles: ["제17조 제1항 단서"] },
  },

  /* === 해약/환급 관련 추가 FAQ === */
  {
    id: "faq-043",
    category: "termination",
    question: "임의해약하면 세금이 얼마나 나오나요?",
    shortAnswer:
      "기타소득세 16.5%(지방세 포함)가 원천징수됩니다. 단 소득공제 받지 않은 부분은 비과세. 정확한 세액은 단정 불가 — 중앙회 시스템 조회 + 세무 전문가 상담 권유.",
    sourceReference: { articles: ["조특법 제86조의3 제4항"] },
  },
  {
    id: "faq-044",
    category: "termination",
    question: "청약철회와 계약취소는 어떻게 다른가요?",
    shortAnswer:
      "청약철회: 청약일/청약금 납부일로부터 30일 내 자유롭게 철회 가능. 계약취소: 약관 미교부, 중요내용 미설명, 자필서명 누락 중 하나에 해당하는 경우 청약일로부터 3개월 내 가능. 둘 다 청약금/부금에 기준이율 가산하여 반환.",
    sourceReference: { articles: ["제2조", "제6조 제2항"] },
  },
  {
    id: "faq-045",
    category: "termination",
    question: "사업을 계속하면서 부금통산만 따로 신청할 수 있나요?",
    shortAnswer:
      "불가능합니다. 부금통산은 ①폐업, ②법인대표 퇴임, ③현물출자 법인설립 폐업 등 사유 발생 후 1년 6개월 내 새 계약에 가입할 때만 신청 가능. 미납 없을 것 + 공제금/환급금 미수령 조건.",
    sourceReference: { articles: ["제13조"] },
  },
  {
    id: "faq-046",
    category: "termination",
    question: "해지 후 같은 계약을 다시 살릴 수 있나요?",
    shortAnswer:
      "해지된 계약은 복원되지 않습니다. 신규 가입은 가능하지만 기존 부금이 합산되지 않으며, 부정수급 사유 해지 시 1년 미경과자는 재가입도 불가.",
    sourceReference: { articles: ["제5조 제1호", "제8조"] },
  },

  /* === 대출 관련 추가 FAQ === */
  {
    id: "faq-047",
    category: "loan",
    question: "공제계약대출은 신용도에 따라 한도가 달라지나요?",
    shortAnswer:
      "달라지지 않습니다. 무담보·무보증으로 본인의 일반해약환급금에서 원천징수예상세액을 차감한 금액 범위 내(납부부금 합계액 한도) 누구나 동일 조건. 대출이율도 신용도와 무관하게 동일.",
    sourceReference: { articles: ["제34조", "제37조", "제39조"] },
  },
  {
    id: "faq-048",
    category: "loan",
    question: "대출이자는 매번 같나요?",
    shortAnswer:
      "변동 가능합니다. 일반대출은 기준이율 + 연 3% 범위 내에서 중앙회가 정해 홈페이지에 공지. 분기마다 기준이율 변동 시 적용이율도 변동될 수 있음.",
    sourceReference: { articles: ["제25조", "제39조"] },
  },
  {
    id: "faq-049",
    category: "loan",
    question: "기존 대출이 있는데 추가로 또 받을 수 있나요?",
    shortAnswer:
      "기존 대출의 이자가 완납된 경우 추가대출 가능. 기존 일반대출에 추가 일반대출은 합산 신규대출로 처리. 의료·재해·회생·파산대출은 각각 별도로 처리.",
    sourceReference: { articles: ["제38조"] },
  },

  /* === 수급권/부가서비스 관련 추가 FAQ === */
  {
    id: "faq-050",
    category: "protection",
    question: "노란우산공제에 가입하면 상해보험에 자동으로 가입되나요?",
    shortAnswer:
      "내부 업무 기준 확인 필요. 가입자 부가서비스로 무료 단체상해보험을 일정 기간(가입 후 일정 연수) 제공해 온 사례가 있으나, 보장 내용·기간·금액은 시기·약정에 따라 변동. 정확한 현황은 중앙회 1666-9988 또는 노란우산 홈페이지 부가서비스 페이지 확인.",
    sourceReference: { articles: ["내부 업무 기준 확인 필요"] },
  },
  {
    id: "faq-051",
    category: "protection",
    question: "가입자가 이용할 수 있는 휴양시설/복지플러스가 있나요?",
    shortAnswer:
      "노란우산 홈페이지·앱의 「복지플러스」 메뉴에서 회원콘도(알펜시아·한화·대명·롯데 등)·제휴시설·복지몰 등 부가서비스 이용 가능. 회원콘도는 1666-9988(+1번)으로 예약, 제휴시설은 직접 예약 후 회원증 제시. 정확한 운영 현황은 중앙회 확인.",
    sourceReference: { articles: ["내부 업무 기준 확인 필요"] },
  },
  {
    id: "faq-052",
    category: "protection",
    question: "공제계약과 관련해 분쟁이 생기면 어떻게 하나요?",
    shortAnswer:
      "중앙회에 설치된 「소기업·소상공인공제분쟁조정위원회」에 조정을 신청할 수 있습니다. 소송의 경우 중앙회 본점소재지 관할법원이 원칙이나 합의로 변경 가능.",
    sourceReference: { articles: ["제43조", "제44조"] },
  },
  {
    id: "faq-053",
    category: "protection",
    question: "공제금에 대한 정보가 채권자에게 새어나갈 수 있나요?",
    shortAnswer:
      "중앙회는 가입자 자료를 본 법에서 정한 목적 외로 사용하거나 누설할 수 없습니다 (중협법 제118조의4 제3항, 2023.1.3 신설). 위반 시 처벌 대상.",
    sourceReference: { articles: ["중협법 제118조의4 제3항"] },
  },

  /* === 구비서류/기타 추가 FAQ === */
  {
    id: "faq-054",
    category: "documents",
    question: "진단서는 어느 의료기관에서 발급받아야 하나요?",
    shortAnswer:
      "「의료법」 제3조에 따른 국내 병원·의원 또는 이와 동등하다고 인정되는 국외 의료기관에서 발급한 것이어야 합니다.",
    sourceReference: { articles: ["제29조 제2항"] },
  },
  {
    id: "faq-055",
    category: "documents",
    question: "본인이 아닌 대리인이 청구할 수 있나요?",
    shortAnswer:
      "가능합니다. 본인이 아닌 경우 본인의 인감증명서를 추가 제출해야 합니다. 그 외 청구서·신분증·사유 증명서류는 동일하게 필요.",
    sourceReference: { articles: ["제29조 제1항"] },
  },
  {
    id: "faq-056",
    category: "documents",
    question: "주소나 연락처가 변경되면 어떻게 하나요?",
    shortAnswer:
      "지체 없이 중앙회에 변경 사실을 통지해야 합니다. 통지하지 않으면 중앙회에 알린 최종 주소·연락처로 보낸 통지가 도달된 것으로 간주됩니다 — 중요한 안내를 받지 못해 권리행사에 불이익 발생 가능.",
    sourceReference: { articles: ["제27조"] },
  },
  {
    id: "faq-058",
    category: "enrollment",
    question: "지자체 가입장려금은 누가, 얼마나 받을 수 있나요?",
    shortAnswer:
      "지자체 소재 소상공인 신규 가입자가 대상. 광역 지자체는 월 1~3만원(연 12~36만원), 일부 기초 지자체(서울 영등포·동작 등 / 인천 부평 등 / 경남 밀양 / 전남 여수 등)도 별도 신청 가능. 매출 3억 이하 기준이 대다수(경기 광명은 10억). 가입일로부터 1년간 매월 적립되어 공제금 수령 시 연복리 이자와 함께 지급. 자세한 지원조건은 노란우산 홈페이지 공시 확인 필수.",
    sourceReference: { articles: ["가입(희망)장려금"] },
  },
  {
    id: "faq-059",
    category: "enrollment",
    question: "장려금 신청 시기를 놓치면 어떻게 되나요?",
    shortAnswer:
      "가입청약 시 신청하거나 가입일로부터 30일 이내 매출액 증빙서류 제출 필수. 30일 초과 시 지원 불가. 단, 신규창업자는 최초로 매출액 증빙서류가 발급 가능한 시점부터 30일 이내 제출 가능. 예산 소진 시에도 신청 중단될 수 있음.",
    sourceReference: { articles: ["가입(희망)장려금"] },
  },
  {
    id: "faq-060",
    category: "enrollment",
    question: "장려금 받은 후 사업장을 이전하면 어떻게 되나요?",
    shortAnswer:
      "지원기간 중 해당 지자체 외 지역으로 사업장 이전 시 그 시점부터 지원 중단. 강원도의 경우 강원 내 타 기초지자체로 이전 시는 기존 지원 중단 후 변경된 기초지자체에 신청서를 제출하면 다시 지원받을 수 있습니다.",
    sourceReference: { articles: ["가입(희망)장려금"] },
  },
  {
    id: "faq-057",
    category: "documents",
    question: "고객이 안 가져와도 자동으로 조회되는 서류가 있나요?",
    shortAnswer:
      "별지 제61호 「행정정보 공동이용 사전동의서」(전자정부법 §36, 2025.7.1 시행)에 자필서명 받으시면 12종이 국세청·행안부 연계로 자동 조회됩니다: 사업자등록증명 · 부가가치세과세표준증명 · 부가가치세면세사업자 수입금액증명 · 국내거소사실증명 · 주민등록표 등·초본 · 표준재무제표증명(법인/개인) · 폐업사실증명 · 연금보험료 등 소득·세액 공제확인서 · 외국인등록사실증명 · 출입국에 관한 사실증명 · 휴업사실증명. 영업점에서 받으실 서류는 신분증·청구서·사유별 핵심 증빙(진단서·결정문 등)만으로 충분합니다.",
    sourceReference: { articles: ["행정정보 공동이용"] },
  },
];
