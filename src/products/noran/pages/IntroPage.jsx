import {
  Lightbulb,
  Shield,
  Coins,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Phone,
  ChevronRight,
  Building2,
  Calculator,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Gift,
  Heart,
  Plane,
  GraduationCap,
  ChevronDown,
} from "lucide-react";

/* 노란우산공제를 처음 접하는 직원을 위한 한 페이지 스크롤 입문서.
   약관·법령 근거를 명시한 채로 5분 안에 핵심을 잡을 수 있도록 구성.
   본문 → 「용어 풀이」 접히는 탭 → 「근거」 뱃지 → 다음 섹션 흐름 */
export const IntroPage = ({ onNavigate, onOpenArticle }) => {
  return (
    <div className="space-y-14 max-w-3xl">
      {/* 히어로 */}
      <div className="pb-2">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <span className="text-[13px] uppercase tracking-widest text-amber-700 font-bold">
            5분 입문
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-[1.15]">
          노란우산공제,<br />
          한 번에 정리합니다
        </h1>
        <p className="text-lg text-stone-600 mt-5 leading-loose">
          이 페이지만 읽으셔도 고객 응대에 필요한 기본은 다 잡힙니다.<br />
          처음 듣는 단어가 나오면 본문 아래 <strong className="text-stone-800">「용어 풀이」</strong> 박스를 펼쳐 보세요.
        </p>
      </div>

      {/* §1. 제도 정체성 */}
      <Section
        num="1"
        title="노란우산공제는 어떤 제도예요?"
        subtitle="한 줄로 — 소기업·소상공인 대표자를 위한 「퇴직금」 성격의 공제 제도"
      >
        <div className="bg-amber-50/60 border-l-4 border-amber-500 p-6 rounded-r-md space-y-4">
          <p className="text-[15px] text-stone-800 leading-loose">
            <strong className="text-stone-900">운영 주체</strong> — 중소기업중앙회의 공제사업
          </p>
          <p className="text-[15px] text-stone-800 leading-loose">
            <strong className="text-stone-900">본질</strong> — 일반 「적금」이 아니라 「공제」. 사업자가 폐업·사망·노령·재난·질병 등으로 사업을 더 못 하시게 됐을 때, 그동안 모으신 돈을 「퇴직금」처럼 받으시는 구조입니다.
          </p>
          <p className="text-[15px] text-stone-800 leading-loose">
            <strong className="text-stone-900">다른 상품과 차이</strong> — ① 소득공제 ② 공제금 수급권 양도·압류·담보 금지. 적금엔 둘 다 없습니다.
          </p>
        </div>

        <Glossary>
          <Term word="「공제」와 「보험」, 「적금」은 뭐가 달라요?">
            <p><strong>적금</strong>은 약속한 기간 동안 돈을 모으면 이자와 함께 돌려주는 단순 저축 상품입니다.</p>
            <p><strong>보험</strong>은 미리 보험료를 내고 사고·질병 등 위험이 발생하면 보장금을 받는 위험 대비 상품입니다.</p>
            <p><strong>공제</strong>는 동일 직역(소상공인·교직원·군인 등) 사람들이 모여 서로 돕는 상호부조 제도입니다. 적금처럼 돈을 모으되, 정해진 사유(폐업·노령 등)가 발생해야 「공제금」으로 받습니다. 노란우산은 소상공인 대상의 「퇴직금형 공제」입니다.</p>
          </Term>
          <Term word="「수급권」이 뭐예요?">
            <p>공제금을 받을 권리. 이 권리는 다른 사람에게 <strong>양도</strong>(넘기기)·<strong>압류</strong>(채권자가 가져가기)·<strong>담보 제공</strong>(빚 보증으로 잡기)이 모두 법으로 금지되어 있습니다. 채무 문제가 있어도 노란우산 공제금은 빼앗기지 않는다는 의미입니다.</p>
          </Term>
        </Glossary>

        <Refs onOpenArticle={onOpenArticle} items={["중협법 제115조", "중협법 제119조", "조특법 제86조의3"]} />
      </Section>

      {/* §2. 누가 가입 가능? */}
      <Section
        num="2"
        title="누가 가입할 수 있어요?"
        subtitle="소기업·소상공인 대표자만 가능 — 7개 업종은 가입 제한"
        icon={Building2}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="가입 가능">
            <ul className="text-[15px] text-stone-800 space-y-2.5 leading-relaxed">
              <li>· 개인사업자 또는 영리법인 대표자</li>
              <li>· 청약 시점 사업 영위 중</li>
              <li>· 이미 가입한 노란우산이 없을 것</li>
              <li>· 부정수급으로 해지 후 1년 경과</li>
            </ul>
          </Card>
          <Card title="가입 제한 7개 업종" color="red">
            <ul className="text-sm text-stone-800 space-y-2 leading-relaxed">
              <li>· 일반/무도유흥주점업 (56211/56212)</li>
              <li>· 무도장 운영업 (91291)</li>
              <li>· 기타 사행시설 관리·운영업 (91249)</li>
              <li>· 카지노 운영업 (91242)</li>
              <li>· 유사 의료업 (86902)</li>
              <li>· 시각장애인 운영 안 하는 안마원·안마시술소</li>
            </ul>
          </Card>
        </div>
        <p className="text-sm text-stone-700 mt-5 leading-loose">
          부금월액은 <strong className="text-stone-900">월 5만원부터 150만원까지 1만원 단위</strong>로 선택. 매월 자동이체 (2026.7.1 시행 개정으로 신규는 분기납 폐지 · 상한 150만원으로 상향).
        </p>

        <Glossary>
          <Term word="「부금월액」이 뭐예요?">
            <p>고객이 매달 노란우산에 내시는 돈입니다. 5만원~150만원 범위에서 1만원 단위로 자유롭게 선택하실 수 있고, 가입 후에도 사업경영 상황에 맞춰 증액·감액이 가능합니다. 소득이 좋으신 해에는 「추가납입부금」(연 납입한도 내, 10,000원 단위·최저 5만원)으로 소득공제 한도까지 더 채우실 수 있습니다.</p>
          </Term>
          <Term word="「무등록 소상공인」도 가입할 수 있어요?">
            <p>네. 사업자등록증이 없는 노점상·재래시장 상인 등도 「무등록 소상공인 특례」로 가입할 수 있습니다(최근 3개월 사업소득 원천징수영수증 등으로 입증). 다만 사업자등록을 안 하셨기 때문에 <strong>폐업·자연재난·사회재난</strong> 사유는 적용 배제 — <strong>사망·노령</strong> 사유로만 공제금 청구 가능합니다.</p>
          </Term>
        </Glossary>

        <Refs onOpenArticle={onOpenArticle} items={["제5조", "제9조", "제46조"]} />
      </Section>

      {/* §3. 세제 혜택 */}
      <Section
        num="3"
        title="왜 좋아요 ① — 소득공제 (최대 연 600만원)"
        subtitle="사업소득에서 직접 빼주는 세금 혜택"
        icon={Coins}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[15px] border border-stone-200 rounded-md overflow-hidden">
            <thead className="bg-stone-100 border-b-2 border-stone-300">
              <tr className="text-left">
                <th className="px-4 py-3 font-bold text-stone-800">사업·근로소득금액</th>
                <th className="px-4 py-3 font-bold text-stone-800">소득공제 한도</th>
                <th className="px-4 py-3 font-bold text-stone-800 text-right">절세 예시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              <tr className="hover:bg-stone-50/50"><td className="px-4 py-3.5">4천만원 이하</td><td className="px-4 py-3.5 font-bold">600만원</td><td className="px-4 py-3.5 text-right text-emerald-700 font-black">약 99만원</td></tr>
              <tr className="hover:bg-stone-50/50"><td className="px-4 py-3.5">4천만원 초과 ~ 6천만원 이하</td><td className="px-4 py-3.5 font-bold">500만원</td><td className="px-4 py-3.5 text-right text-emerald-700 font-black">약 132만원</td></tr>
              <tr className="hover:bg-stone-50/50"><td className="px-4 py-3.5">6천만원 초과 ~ 1억원 이하</td><td className="px-4 py-3.5 font-bold">400만원</td><td className="px-4 py-3.5 text-right text-emerald-700 font-black">약 154만원</td></tr>
              <tr className="hover:bg-stone-50/50"><td className="px-4 py-3.5">1억원 초과</td><td className="px-4 py-3.5 font-bold">200만원</td><td className="px-4 py-3.5 text-right text-emerald-700 font-black">약 84만원</td></tr>
            </tbody>
          </table>
        </div>
        <div className="bg-amber-50/60 border border-amber-200 rounded-md p-5 mt-5 text-[15px] text-stone-800 leading-loose">
          <strong className="text-stone-900">법인대표는 다릅니다.</strong> 총급여 8천만원 초과(= 근로소득금액 6,625만원 초과) 시 근로소득금액에서 소득공제 불가. 사업소득은 부동산임대업 비중만큼 한도 차감.
        </div>

        <Glossary>
          <Term word="「소득공제」와 「세액공제」, 뭐가 달라요?">
            <p><strong>소득공제</strong>는 「세금을 매기는 기준 소득」을 줄여 주는 것입니다. 예) 사업소득 5,000만원 → 노란우산 600만원 공제 → 과세표준 4,400만원으로 줄어듦.</p>
            <p><strong>세액공제</strong>는 이미 계산된 「세금 자체」를 직접 깎아 주는 것입니다. 예) 연금저축 600만원 세액공제율 13.2% → 79만 2천원이 그냥 세금에서 빠짐.</p>
            <p>노란우산은 「<strong>소득공제</strong>」 — 소득이 높을수록 절세 효과가 커지는 구조입니다.</p>
          </Term>
          <Term word="「한계세율」이 뭐예요? 왜 중요해요?">
            <p>소득세는 누진세입니다. 소득이 늘어날수록 추가되는 1원에 매겨지는 세율이 점점 높아집니다. 그 「추가 1원에 매겨지는 세율」이 한계세율입니다.</p>
            <p>한계세율 예시 (지방소득세 10% 가산):</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>과표 1,400만원 이하 → 6.6%</li>
              <li>1,400~5,000만원 → 16.5%</li>
              <li>5,000~8,800만원 → 26.4%</li>
              <li>8,800만원~1.5억 → 38.5%</li>
              <li>1.5억~3억 → 41.8%</li>
            </ul>
            <p>노란우산 소득공제로 줄어드는 금액 × 한계세율 = 실제 절세액. 즉 <strong>소득이 높은 고객일수록 절세 효과가 큽니다</strong>.</p>
          </Term>
          <Term word="「사업소득금액」과 「총수입금액」이 같은 거예요?">
            <p>다릅니다. <strong>총수입금액</strong>은 매출 그 자체. <strong>사업소득금액</strong>은 매출에서 필요경비를 뺀 금액입니다. 위 표의 4구간 기준은 「사업소득금액」이지 「매출」이 아닙니다.</p>
          </Term>
        </Glossary>

        <Refs onOpenArticle={onOpenArticle} items={["조특법 제86조의3"]} />
        <button
          onClick={() => onNavigate?.("calculator")}
          className="mt-5 inline-flex items-center gap-1.5 text-base text-amber-700 hover:text-amber-800 font-bold"
        >
          <Calculator className="w-4 h-4" />
          내 고객 절세효과 즉시 계산
          <ChevronRight className="w-4 h-4" />
        </button>
      </Section>

      {/* §4. 안전판 */}
      <Section
        num="4"
        title="왜 좋아요 ② — 안전판 (양도·압류·담보 금지)"
        subtitle="일반 적금엔 없는 차별화 요소"
        icon={Shield}
      >
        <div className="space-y-4">
          <div className="bg-emerald-50/50 border-l-4 border-emerald-500 rounded-r-md p-6">
            <p className="text-[15px] text-stone-800 leading-loose">
              <strong className="text-stone-900">공제금 수급권은 양도·압류·담보 제공 모두 금지</strong>. 사업자가 채무·소송에 휘말려도 노란우산 공제금은 안전하게 받으실 수 있습니다.
            </p>
            <p className="text-sm text-stone-600 mt-3 leading-relaxed">
              ※ 단 「행복지킴이 통장」 등 압류방지 통장을 사용하셔야 통장 단계에서도 완전 보호.
            </p>
          </div>
          <div className="bg-blue-50/50 border-l-4 border-blue-500 rounded-r-md p-6">
            <p className="text-[15px] text-stone-800 leading-loose">
              <strong className="text-stone-900">공제계약 대출도 가능</strong> — 해약환급금 범위 내 무담보 대출. 일시적 자금 필요 시 해약 대신 대출로 유지 권장.
            </p>
          </div>
        </div>

        <Glossary>
          <Term word="「공제계약 대출」이 뭐예요?">
            <p>고객이 그동안 납입하신 노란우산 부금을 담보로 받는 대출입니다. 별도 신용평가 없이 해약환급금 범위 내에서 무담보로 가능. 해약하지 않고도 일시 자금을 마련하실 수 있어 「장기 유지 + 단기 자금」 모두 챙기는 선택지입니다.</p>
          </Term>
        </Glossary>

        <Refs onOpenArticle={onOpenArticle} items={["중협법 제119조", "중협법 제121조의2", "제32조"]} />
      </Section>

      {/* §5. 부가 혜택 */}
      <Section
        num="5"
        title="잘 모르시는 분이 많아요 — 부가 혜택"
        subtitle="가입만 해도 자동으로 받는 「숨은 혜택」 3가지"
        icon={Gift}
      >
        <div className="space-y-3">
          <BenefitCard
            icon={Heart}
            title="무료 단체상해보험"
            color="rose"
            tag="자동 가입"
          >
            가입자 누구나 별도 신청 없이 자동 가입. 부금월액의 <strong className="text-rose-700">최대 150배(750만원 ~ 1억 5천만원)</strong>까지 상해 사고 보장. 사망 시 전액 지급.
          </BenefitCard>

          <BenefitCard
            icon={GraduationCap}
            title="복지플러스"
            color="violet"
            tag="가입 후 신청"
          >
            <strong>건강검진</strong>(전국 300개 병원 20~50% 할인) · <strong>여행/숙박</strong>(성수기도 최대 50~70% 할인) · <strong>교육</strong>(창업·경영교육 무료) · <strong>법률·세무·노무 무료 자문</strong> 등 가입자 전용 복지 혜택.
          </BenefitCard>

          <BenefitCard
            icon={Coins}
            title="지자체 가입(희망)장려금"
            color="amber"
            tag="가입 30일 내 신청"
          >
            사업장 소재지 지자체에서 <strong className="text-amber-700">월 1~3만원씩 1년간(최대 12회) 적립</strong>해 공제금 받으실 때 연복리 이자와 함께 지급. 광역·기초 지자체별 지원조건 다름 — 별도 신청서·매출증빙 필요.
          </BenefitCard>
        </div>

        <Glossary>
          <Term word="단체상해보험은 「자동 가입」이라는데, 따로 보험증권 같은 게 있어요?">
            <p>중앙회가 보험사와 단체 협약으로 일괄 가입하기 때문에 개별 보험증권은 발급되지 않습니다. 보험금 청구는 노란우산 콜센터(1666-9988)로 문의하시면 됩니다. 보장 내용은 매년 협약 갱신에 따라 변동될 수 있으니 정확한 보장은 콜센터 안내가 우선.</p>
          </Term>
          <Term word="복지플러스는 어떻게 신청해요?">
            <p>노란우산 홈페이지(8899.or.kr) 또는 모바일 앱에서 가입자 본인 인증 후 「복지플러스」 메뉴에서 제휴 서비스 예약·결제. 사전 등록만 하시면 가입자 ID로 자동 할인 적용됩니다.</p>
          </Term>
          <Term word="지자체 장려금, 모든 지역이 다 있어요?">
            <p>아니요. 광역 17개 + 기초 일부(서울 영등포·동작·도봉·서대문·금천 / 인천 부평·계양·동구·중구 / 경기 광명 / 경남 밀양(B) / 전남 여수(B))만 운영 중. 매년 예산에 따라 변동되며, 일부 지자체는 매출액 3억 이하·부동산임대업 제외 등 추가 조건이 있습니다.</p>
          </Term>
        </Glossary>

        <Refs onOpenArticle={onOpenArticle} items={["가입(희망)장려금"]} />
      </Section>

      {/* §6. 공제사유 */}
      <Section
        num="6"
        title="언제 돈을 받으시나요? — 공제사유 8가지"
        subtitle="이 중 하나가 발생하면 「공제금」 청구"
        icon={ClipboardList}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[15px]">
          {[
            "① 폐업 (개인) / 법인 폐업·해산",
            "② 사망",
            "③ 질병·부상으로 법인대표 퇴임",
            "④ 노령급부 (만 60세 + 부금납부월수 120개월 이상)",
            "⑤ 자연재난 또는 사회재난(특별재난지역 한정)",
            "⑥ 6개월 이상 요양 필요 질병·부상",
            "⑦ 회생절차 개시",
            "⑧ 파산선고",
          ].map((reason, i) => (
            <div key={i} className="flex items-start gap-2.5 p-4 bg-white border border-stone-200 rounded-md hover:border-amber-300 transition-colors">
              <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span className="text-stone-800 leading-relaxed">{reason}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-stone-700 mt-5 leading-loose">
          공제금 = 납부부금 + 별표1 차등지급이율표 적용 (15년간 기준이율 + 0.3%, 이후 단계적 인하).
        </p>

        <Glossary>
          <Term word="「공제금」과 「해약환급금」, 같은 거예요?">
            <p>다릅니다.</p>
            <p><strong>공제금</strong>은 위 8가지 사유 중 하나가 발생해서 받는 돈. 별표1 「차등지급이율표」가 적용되어 가장 유리한 이율.</p>
            <p><strong>해약환급금</strong>은 그 외 임의로 해약하실 때 받는 돈. 별표3 「일반해약환급률표」가 적용되어 단기 해약 시 원금 손실 발생.</p>
          </Term>
          <Term word="「노령급부」가 뭐예요?">
            <p>고객이 만 60세 이상 + 부금납부월수가 120개월(10년) 이상이실 때, 사업을 계속하시더라도 공제금을 청구할 수 있는 사유입니다. 즉 「퇴직금처럼 받기」 — 가장 유리한 사유 중 하나라 고객의 부금 유지 인센티브가 됩니다.</p>
          </Term>
          <Term word="「중간정산」이 가능하다고 하던데?">
            <p>5~8호 사유(자연재난·사회재난·6개월 이상 요양·회생·파산) 발생 시 공제금을 청구하시면, 「가입은 그대로 유지」하면서 일부 자금만 받으실 수 있습니다. 청구 후에도 부금 납입을 계속해서 노령급부 등 다른 사유로 다시 받을 수 있는 옵션이 남습니다.</p>
          </Term>
          <Term word="「기준이율」/「부가지급률」이 뭐예요?">
            <p><strong>기준이율</strong>은 노란우산 공제금·환급금 계산의 기본 이자율. 매 분기 첫 영업일에 중앙회가 정하며 분기마다 변동. 최저보증이율은 가입 후 5년 이하 1.5% / 5년 초과 1.0%.</p>
            <p><strong>부가지급률</strong>은 운용 성과에 따라 매년 가산해 주는 추가 이자율. 매년 중앙회가 결정·공시.</p>
          </Term>
          <Term word="「별표」가 자주 나오는데 뭐예요?">
            <p>약관의 「별표」는 본문에서 표나 산식을 한곳에 정리한 부록입니다. 노란우산 약관은 별표 4개:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>별표1</strong> — 공제금 차등지급이율표 (가장 유리)</li>
              <li><strong>별표2</strong> — 간주해약환급금 지급기준표</li>
              <li><strong>별표3</strong> — 일반해약환급금 지급기준표 (단기 해약 시 손실)</li>
              <li><strong>별표4</strong> — 기타 지급이율표 (청약철회·계약취소·계약무효 시 반환 이율)</li>
            </ul>
          </Term>
        </Glossary>

        <Refs onOpenArticle={onOpenArticle} items={["제17조", "제18조"]} />
      </Section>

      {/* §7. 해약은 손해 */}
      <Section
        num="7"
        title="해약은 손해입니다 — 단정 안내 금지"
        subtitle="단기 해약 시 원금 손실이 발생"
        icon={AlertTriangle}
      >
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md p-6 space-y-4">
          <p className="text-[15px] text-stone-800 leading-loose">
            <strong className="text-red-700">1~3회 납부 후 해약 시 80%, 4~6회 90%, 7~12회 100%만 환급</strong> (별표3 일반해약환급금). 즉 단기에 해약하시면 원금 손실이 발생합니다.
          </p>
          <p className="text-[15px] text-stone-800 leading-loose">
            일시적 사정이신 고객에게는 해약 대신 먼저 다음 대안을 안내해 주세요:
          </p>
          <ul className="text-[15px] text-stone-800 space-y-2 leading-relaxed pl-2">
            <li><strong className="text-stone-900">① 부금납부 중지</strong> — 재해·입원·경영악화 6개월 / 휴업·파산절차·출산 1년</li>
            <li><strong className="text-stone-900">② 부금월액 감액</strong> — 3개월 이상 납입 후 가능</li>
            <li><strong className="text-stone-900">③ 공제계약 대출</strong> — 해약환급금 범위 내 무담보</li>
          </ul>
        </div>

        <Glossary>
          <Term word="「간주해약」 / 「임의해약」 / 「강제해약」, 뭐가 달라요?">
            <p><strong>임의해약</strong> — 계약자가 개인 사정으로 본인이 해약 청구. 가장 흔한 케이스. 별표3 일반해약환급금 적용.</p>
            <p><strong>간주해약</strong> — 법인 전환·배우자/자녀 사업양도·법인대표 퇴임(질병·부상 외) 등으로 사업주 지위가 바뀌어 「해약된 것으로 간주」되는 경우. 별표2 간주해약환급금 적용 (별표3보다 유리).</p>
            <p><strong>강제해약</strong> — 부금 24개월 이상 미납 또는 부정행위 등으로 중앙회가 강제로 해지. 별표3의 80%만 지급 (가장 불리).</p>
          </Term>
          <Term word="「청약철회」 / 「계약취소」 / 「계약무효」, 셋 다 비슷한 거 아닌가요?">
            <p>이름은 비슷하지만 사유와 시점이 다릅니다.</p>
            <p><strong>청약철회</strong> — 청약 후 「30일 이내」 단순 변심 등으로 고객이 철회. 납부한 청약금을 별표4 이율 가산해 반환.</p>
            <p><strong>계약취소</strong> — 「3개월 이내」 약관 미교부·중요내용 미설명·자필서명 누락 시 중앙회 잘못으로 취소. 납부 부금 + 별표4 이율 반환.</p>
            <p><strong>계약무효</strong> — 청약 당시 가입 자격 자체가 없었음이 사후에 밝혀진 경우. 무효이므로 「처음부터 없었던 것」. 단, <strong>소득공제 받은 원금에 기타소득세 16.5%, 이자에 이자소득세 15.4%</strong>가 부과되어 가장 부담 큼.</p>
          </Term>
        </Glossary>

        <Refs onOpenArticle={onOpenArticle} items={["제24조", "제12조", "제7조"]} />
        <button
          onClick={() => onNavigate?.("calculator")}
          className="mt-5 inline-flex items-center gap-1.5 text-base text-amber-700 hover:text-amber-800 font-bold"
        >
          <Calculator className="w-4 h-4" />
          해약환급금 시나리오 계산기
          <ChevronRight className="w-4 h-4" />
        </button>
      </Section>

      {/* §8. 직원이 꼭 기억할 점 */}
      <Section
        num="8"
        title="직원이 꼭 기억할 5가지"
        subtitle="고객 안내 전 체크리스트"
      >
        <div className="space-y-3">
          {[
            { k: "단정 안내 금지", v: "기준이율·부가지급률은 매 분기 변동. 절세액·환급금은 모두 「추정치」. 정확한 금액은 중앙회 시스템 조회로 안내." },
            { k: "가입 제한 업종 확인", v: "한국표준산업분류 코드까지 확인. 사후 무효 판명 시 원금에 기타소득세 16.5% / 이자 15.4% 부과." },
            { k: "자필서명·약관 교부", v: "청약서 자필서명은 본인 직접. 약관 미교부·중요내용 미설명·자필서명 누락 시 3개월 내 계약 취소 가능." },
            { k: "행정정보 공동이용 동의", v: "별지 제61호 동의서 자필서명 시 12종(사업자등록증명·폐업사실증명·소득세액공제확인서 등) 자동 조회. 신분증·청구서만 받아도 OK." },
            { k: "고객 개인정보 금지", v: "본 도구의 시뮬레이션·계산기에는 절대 실제 고객정보 입력 금지. 가상 변수로만 진행." },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-5 bg-white border border-stone-200 rounded-md hover:border-amber-300 transition-colors">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-900 text-white text-sm font-black flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold text-stone-900 mb-1.5">{item.k}</div>
                <div className="text-[15px] text-stone-700 leading-loose">{item.v}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* §9. 다음 단계 */}
      <Section
        num="9"
        title="이제 어디로 가시면 돼요?"
        subtitle="상황별로 추천 메뉴"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NextCard
            icon={MessageSquare}
            title="실제 손님 응대 중"
            desc="상담 시뮬레이터로 단계별 분류"
            onClick={() => onNavigate?.("simulator")}
          />
          <NextCard
            icon={Calculator}
            title="세금 혜택 보여드리기"
            desc="계산기 — 절세액 / 환급금 / 비교"
            onClick={() => onNavigate?.("calculator")}
            highlight
          />
          <NextCard
            icon={ClipboardList}
            title="특정 업무가 막혔을 때"
            desc="업무별 가이드 20개"
            onClick={() => onNavigate?.("guide")}
          />
          <NextCard
            icon={HelpCircle}
            title="짧은 질문 한 건"
            desc="FAQ 60개 검색"
            onClick={() => onNavigate?.("faq")}
          />
        </div>

        <div className="mt-5 p-6 bg-stone-900 text-white rounded-md flex items-center gap-4">
          <Phone className="w-6 h-6 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-widest text-stone-400 font-bold mb-0.5">중앙회 콜센터</div>
            <div className="text-2xl font-black tracking-tight">1666-9988</div>
          </div>
          <a
            href="https://www.8899.or.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-amber-300 hover:text-amber-200 underline font-medium"
          >
            www.8899.or.kr
          </a>
        </div>
      </Section>
    </div>
  );
};

/* 스크롤 섹션 wrapper */
const Section = ({ num, title, subtitle, icon: Icon, children }) => (
  <section className="space-y-5">
    <div className="flex items-start gap-4 border-b-2 border-stone-900 pb-4">
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white text-lg font-black tracking-tight flex-shrink-0">
        {num}
      </span>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-stone-700" />}
          <h2 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight leading-snug">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">{subtitle}</p>
        )}
      </div>
    </div>
    {children}
  </section>
);

const Card = ({ title, color = "stone", children }) => {
  const colors = {
    stone: "bg-stone-50 border-stone-200",
    red: "bg-red-50/40 border-red-200",
    amber: "bg-amber-50/40 border-amber-200",
  };
  return (
    <div className={`${colors[color]} border rounded-md p-5`}>
      <div className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">{title}</div>
      {children}
    </div>
  );
};

const NextCard = ({ icon: Icon, title, desc, onClick, highlight }) => (
  <button
    onClick={onClick}
    className={`group text-left p-5 border rounded-md transition-all ${
      highlight
        ? "bg-amber-50 border-amber-300 hover:border-amber-500"
        : "bg-white border-stone-200 hover:border-stone-400"
    }`}
  >
    <div className="flex items-start gap-3">
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${highlight ? "text-amber-700" : "text-stone-600"}`} />
      <div className="flex-1 min-w-0">
        <div className="text-base font-bold text-stone-900 mb-1">{title}</div>
        <div className="text-sm text-stone-600 leading-relaxed">{desc}</div>
      </div>
      <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1.5 transition-transform group-hover:translate-x-0.5 ${highlight ? "text-amber-700" : "text-stone-400"}`} />
    </div>
  </button>
);

/* 부가 혜택 카드 — §5에서 사용 */
const BenefitCard = ({ icon: Icon, title, color, tag, children }) => {
  const palette = {
    rose: { bg: "bg-rose-50/50", border: "border-rose-300", text: "text-rose-700", tag: "bg-rose-100 text-rose-700" },
    violet: { bg: "bg-violet-50/50", border: "border-violet-300", text: "text-violet-700", tag: "bg-violet-100 text-violet-700" },
    amber: { bg: "bg-amber-50/50", border: "border-amber-300", text: "text-amber-700", tag: "bg-amber-100 text-amber-800" },
  };
  const c = palette[color] || palette.amber;
  return (
    <div className={`${c.bg} ${c.border} border-l-4 rounded-r-md p-5`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${c.text} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-bold text-stone-900">{title}</h3>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${c.tag} px-1.5 py-0.5 rounded-sm`}>
              {tag}
            </span>
          </div>
          <p className="text-[15px] text-stone-800 leading-loose">{children}</p>
        </div>
      </div>
    </div>
  );
};

/* 섹션 하단 근거 조항 모음 — 본문 흐름과 분리해 가독성 확보 */
const Refs = ({ items = [], onOpenArticle }) => {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-4">
      <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold text-stone-500">
        <BookOpen className="w-3 h-3" />
        근거
      </span>
      {items.map((a) => (
        <button
          key={a}
          onClick={() => onOpenArticle?.(a)}
          className="text-xs text-stone-600 hover:text-amber-700 bg-stone-100 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 px-2 py-0.5 rounded-sm transition-colors"
        >
          {a}
        </button>
      ))}
    </div>
  );
};

/* 「용어 풀이」 묶음 — 섹션 본문 끝에 두는 접히는 박스 모음 */
const Glossary = ({ children }) => (
  <div className="mt-5 bg-stone-50 border border-stone-200 rounded-md divide-y divide-stone-200 overflow-hidden">
    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-100/50">
      <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
      <span className="text-[11px] uppercase tracking-wider font-bold text-stone-600">
        용어 풀이
      </span>
    </div>
    {children}
  </div>
);

const Term = ({ word, children }) => (
  <details className="group">
    <summary className="flex items-start gap-2 px-4 py-3 cursor-pointer hover:bg-white text-[14px] text-stone-800 font-semibold list-none">
      <ChevronDown className="w-4 h-4 text-stone-500 flex-shrink-0 mt-0.5 transition-transform group-open:rotate-0 -rotate-90" />
      <span className="flex-1">{word}</span>
    </summary>
    <div className="px-4 pb-4 pl-10 space-y-2 text-[14px] text-stone-700 leading-loose">
      {children}
    </div>
  </details>
);
