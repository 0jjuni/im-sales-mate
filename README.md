# iM 세일즈메이트 (iM SalesMate)

> **모든 창구에 숙련 PB 한 명씩, 상담 옆자리를 지키는 AI 세일즈 파트너**
> 서비스명·부제는 `src/hub/HubShell.jsx`의 `HUB_NAME`/`HUB_SUBTITLE` 상수에서 관리합니다.

**영업점 직원용 실시간 상담 보조 플랫폼**입니다. 사용자는 PB가 아니라 PB 없는 창구를 지키는 일반 직원이고, 경험이 쌓일 때까지 옆에서 받쳐 주는 보조바퀴 역할을 합니다. 고객이 앞에 있을 때는 옆에 띄워놓고 고객 진단·FAQ·계산 결과를 바로 꺼내 쓰고, 고객이 없는 시간에는 몰랐던 제도·세제를 짧게 읽어 둡니다.

허브(대시보드)를 중심으로 상품마다 동일한 템플릿의 **상품 모듈**이 붙는 구조라, 현장 요구가 생기면 화면을 새로 만들지 않고 내용만 더해 확장합니다. 상담의 시작점은 **고객 종합 진단**(`/tax`) — 고객번호 하나로 종합과세·재무 상태를 진단하고 미보유 상품을 판매 기회로 연결하는 상담 허브입니다.

**배포**: https://im-sales-mate.vercel.app/

## 화면 구성

| 영역 | 경로 | 내용 |
|---|---|---|
| **허브 대시보드** | `/` | 고객 진단 빠른조회(최상단 히어로) · 마켓 보드(실시간) · 내 도구 · 상품 상담 · 보조 도구 · 부서 공지 · 일정 관리 위젯 · 모닝 브리핑 · 지식 라이브러리 구독 피드. 섹션 순서·표시는 개인화 |
| **고객 종합 진단** | `/tax` | 고객번호 통합조회 → 종합과세 판정·재무 진단 + 규칙 엔진 절세·판매 제안(활용 현황/맞춤 제안/소득 분산) · 예금·수신 만기 관리 · 신용카드 발급 요건·소득공제 · A4 상담자료 인쇄 |
| **투자상품 모듈** | `/wealth/*` | 펀드·ETF·신탁 탭 · 실펀드 카탈로그(저/중/고위험) · ETF 실시간 시세(Yahoo) · 상품 상세·비교 · 내 가입고객 관리 · 상품 공지 |
| **노란우산공제 모듈** | `/noran/*` | 5분 입문 · 상담 시뮬레이터(세일즈 코치) · 계산기 3종 · 업무별 가이드 · FAQ · 지급사유별 구비서류 체크리스트 · 상담 자료 인쇄 · 공지 |
| **ISA 모듈** | `/isa/*` | 세제 한눈에 · ISA 예금 절세 비교 계산기 · FAQ · 공지 (조특법 §91의18 + 신탁형 약관 근거) |
| **연금계좌 모듈** | `/pension/*` | 세제 한눈에 · 세액공제 계산기(연금저축+IRP 900만원 합산) · 가입 시기별 과세 판별 · FAQ · 공지 |
| **카드 모듈** | `/card/*` | 카드 탐색·상세 · 가입 QR(eBiz 링크→QR+심의필 A4) · 신용카드 소득공제 · 공지 (발급 요건은 고객 진단 안에서) |
| **보조 도구** | `/tools/*` | 영문 이름·주소 변환기 · QR코드 생성기 · 도구 요청 게시판 — 변환 결과는 전표(148mm) 인쇄 |
| **뉴스** | `/news` | 창구에 영향을 줄 뉴스·시황 전용 2단 레이아웃(필터+뉴스 리스트 / 시황·일정 사이드) |
| **지식 라이브러리** | `/library` | 현업 담당자 자율 게시판(에브리타임식) — 채널 개설·구독·발행, 리치 에디터 |
| **일정 관리** | `/followups` | 할 일·고객 메모·지점 일정 · 목록/지점 달력 탭 · 나만 보기/지점 공유 |
| **관리자** | `/admin` | 부서 공지·FAQ·카드·도구 요청 상태 관리(localStorage 데모) |

### 모듈의 체급

모든 상품이 노란우산처럼 깊을 필요는 없다. 상품 성격에 따라 규모를 달리한다.

- **풀 모듈**(노란우산): 가이드·FAQ·시뮬레이터가 갖춰진 작업 공간.
- **얇은 모듈**(ISA·연금계좌): 세제 계산기 + 세제 요약 + FAQ 중심. 계좌형 상품은 단일 약관이 없고 세제·비교가 핵심이라 이 형태가 자연스럽다. 연금저축과 IRP는 세액공제 한도 900만원을 공유하므로 「연금계좌」 하나로 묶었다.
- **탐색 모듈**(투자상품·카드): 카탈로그 + 상세 + 비교/QR 중심. 종류가 많고 자주 바뀌므로 데이터(카탈로그)만 갈아끼운다.
- **도구 모음**(보조 도구): 상품에 매이지 않는 창구 공통 도구. 변환 결과를 통장프린터 대신 전표 형태로 인쇄한다.

### 고객 종합 진단 (상담 허브)

고객번호 9자리로 **당행 보유 기준** 통합조회 → 이 고객이 어떻게 절세하는지 진단하고, 미보유 상품을 판매 기회로 연결한다. 파일: `src/hub/GrossTaxPage.jsx`, 규칙·데이터 `src/hub/data/grossTax.js`, 홈 빠른조회 카드 `src/hub/components/GrossTaxCard.jsx`.

- **규칙 엔진**: `deriveStrategy(data, manual)`이 사실에서 제안을 결정론적으로 도출(하드코딩 아님) — 진단/제안/분산 3그룹. `viewProduct()`가 소득유형·자격·종합과세 제한을 결합해 상품 상태(활용 중/권유/제한)를 파생.
- **소득 유형 자동 분류**: 노란우산 보유 또는 가맹점 결제계좌 보유 = 개인사업자, 카드 발급 요건의 급여 소득자 충족 = 근로소득자. 자동으로 못 잡으면 「상담 중 확인한 항목」 칩에서 선택(변경·지우기로 언제든 수정).
- **예금·수신 만기 관리**: 정기예금·적금의 잔액·금리·만기일·잔여기간·만기처리(자동해지/자동재예치/미지정) 표. 만기 임박(D-30) + 자동재예치는 상단 진단에 경고. 만기 자금은 예치 가능 기간(3년 미만/3~5년/5년 이상)에 따라 유동성·ISA·저축성보험(10년 비과세)으로 분기 안내.
- **맞춤 상품 제안**: 개인 신용카드 권유 안에 발급 요건(넥스피아 4요건 가능/불가)·소득공제 계산을 함께 노출. 여유 예금 자금은 투자상품(펀드·ETF·신탁) 분산, 개인사업자 타행 가맹점 결제계좌는 당행 전환(주거래 유치) 제안.
- **A4 상담자료 인쇄**: `PrintReport` body 포탈로 격리 출력.

### 투자상품 모듈

펀드·ETF·신탁을 탭으로 나눈 탐색 모듈(`src/hub/WealthPage.jsx` 외 `Wealth*`, 데이터 `data/wealth*`).

- 실펀드 카탈로그를 저·중·고위험으로 분리(`wealthFundsLowRisk/MidRisk/HighRisk.js`).
- **ETF 실시간 시세**: Yahoo Finance(`.KS`)로 조회(`useEtfLive.js`, `data/wealthEtfLive.js`). 세일즈 문구 대신 고객 설명 포인트 중심.
- 상품 상세(`/wealth/:id`)·비교(`/wealth/compare`), 내 가입고객 관리(`?tab=customers`), 상품 공지(`?tab=notices`). 홈 위젯 `WealthCard`.

### 지식 라이브러리 · 뉴스 · 알림

- **지식 라이브러리**(`/library`): 에브리타임식 자율 게시판. 누구나 채널을 개설하고(아이콘+색상/이미지), 구독하고, 리치 에디터로 발행. 시드 채널(모닝 브리핑·마켓 데일리·WM 코멘트·알기 쉬운 세무상식). 홈 위젯은 구독 채널 실시간 피드(네이버 블로그식 카드). 에디터는 Tiptap 기반(`library/RichEditor.jsx`, lazy 로드), 저장 `library/libraryStore.js`.
- **뉴스**(`/news`): 홈 모닝 브리핑 위젯을 그대로 옮기지 않고 읽기용 전용 2단 레이아웃으로 재구성(필터+뉴스 카드 / 시황·다가오는 일정 사이드).
- **부서별 공지**: 부서↔상품 레지스트리로 상품 페이지 공지 바(`ModuleNoticeBoard`)·홈 부서 공지 위젯을 채우고, `/admin`에서 편집.
- **알림 벨**(`components/NotificationBell.jsx`): 우상단 벨 — 구독 채널 새 글 + 지점 공유 일정. 읽으면 흐려지고 배지 감소.

### 대시보드 개인화

- **내 도구**: 계산기·시뮬레이터·상품 화면을 대시보드에 핀 등록해 바로 진입. 모듈 화면 우상단 「대시보드에 고정」 또는 허브 「도구 추가」. 카드 드래그로 순서 변경.
- **섹션 편집**: 상단바 「대시보드 편집」 → 드래그 정렬, 눈 아이콘으로 표시/숨김, 기본값 복원. 처음 누르면 사용법 안내(`EditGuide`)가 한 번 뜬다.
- **최근 사용**: 도구 진입 시 자동 기록, 내 도구 아래 노출.
- 기본 순서·핀은 `personalization/storage.js`의 `DEFAULT_STATE`. 저장은 **localStorage**(브라우저별). 서버 전환은 [저장소 어댑터](#2-저장소를-서버로-전환)만 교체.

### 일정 관리

상담 중 나온 약속을 고객번호·연락일로 기록하고, 지점 단위 일정(휴가·연수)도 함께 본다. 개인 PC 스티커 메모의 문제(초기화 시 소실, 미설치 PC에서 사용 불가, 담당자 부재 시 인계 불가)를 대신한다.

- 허브에는 요약 위젯(임박 건 미리보기 + 빠른 기록 + 지점 공유 알림), 관리는 `/followups`에서 목록/지점 달력 탭으로.
- **월 달력**: 스팬 바를 끌어 다른 날짜로 이동(dnd-kit). 미루기 패널 병행.
- **공유 범위**: 기록마다 「나만 보기 / 지점 공유」 선택. 데모에서는 표시만, 실서비스에서 지점 단위 접근통제를 붙인다.
- **개인정보 원칙**: 고객번호와 메모만. 이름·주민번호·연락처 입력 금지(UI에 명시).

### 마켓 보드 · 모닝 브리핑

- **마켓 보드**: Yahoo Finance chart API(corsproxy 경유)로 KOSPI·KOSDAQ·S&P500·나스닥·USD/KRW·미 국채 10년 시세를 실시간 조회(`data/marketQuotes.js`). 조회 실패 시 대체 표시로 후퇴.
- **모닝 브리핑 뉴스**: 공개된 발표·보도를 요약한 주간 브리핑(`data/morningBriefing.js`). 사실 요약(summary)과 상담 포인트(pbNote)를 분리, 확정 전 사항은 단정 안내를 막는 문구로 작성.

### 인쇄물 두 가지

- **상담 자료 인쇄**(`@shared/components/PrintReport`): 계산기·고객 진단 결과를 A4 한 장으로. **직원 상담용** — 고객 교부 자료로 쓰려면 준법감시인 심의 필요(`printMeta.js`에 `complianceReviewNo` 자리).
- **전표 인쇄**(`@utility/components/UtilitySlip`): 보조 도구 결과를 148mm 전표로. 카드 가입 QR도 심의필 문구와 함께 A4 인쇄(`@card/pages/CardQrPrint`).

## 기술 스택

- React 18 + Vite 5, react-router-dom 6 (SPA rewrite: `vercel.json`)
- Tailwind CSS 3 — 허브는 iM뱅크 민트(`im-*` 팔레트), 모듈별 아이덴티티(노란우산 amber · ISA emerald · 연금 violet · 카드 slate · 보조도구 sky)
- dnd-kit (대시보드 정렬 + 달력 드래그), Recharts (차트), lucide-react (아이콘), qrcode (QR 생성), Tiptap (지식 라이브러리 리치 에디터)
- 외부 시세: Yahoo Finance chart API (마켓 보드 지표 + 투자상품 ETF), corsproxy 경유

## 디렉터리 구조

```
src/
  App.jsx                  # 루트 라우터
  hub/
    HubShell.jsx           # 상단바 셸 · HUB_NAME 상수 · wide 옵션
    HubHome.jsx            # 대시보드 (섹션 프레임워크 + 편집 모드)
    GrossTaxPage.jsx       # 고객 종합 진단(/tax)
    WealthPage/DetailPage/ComparePage.jsx  # 투자상품(/wealth)
    NewsPage.jsx  LibraryPage.jsx  AdminPage.jsx  SearchPage.jsx
    sections.js            # 대시보드 섹션 정의
    components/            # MarketBoard · MorningNews · MyTools · ToolLibrary
                           # ProductGrid · UtilityGrid · WealthCard · GrossTaxCard
                           # KnowledgeLibrary/LibraryBoard · NotificationBell
                           # NoticeManager · FaqManager · CardManager · ToolRequestManager
                           # FollowupBoard(허브 위젯) · EditGuide · IMSymbol
    library/               # libraryStore · seedLibrary · useLibrary · channelStyle
                           # RichEditor(Tiptap, lazy) · richtext.css
    wealth/                # useWealth · useEtfLive · ProductDetail · tools
    notifications/         # useNotifications
    followups/             # FollowupsPage(/followups) · MonthCalendar · parts · storage
    data/                  # marketQuotes · morningBriefing · economicCalendar
                           # grossTax(진단 규칙·데이터) · wealth*(투자상품) · products · knowledge
    hooks/                 # useMorningBriefing
    personalization/       # storage(어댑터) · PersonalizationContext · PinToolButton
    registry/              # toolRegistry(도구 집계) · toolPresentation(아이콘·컬러 맵)
  products/
    noran/                 # 노란우산공제 (풀 모듈, amber)
    isa/                   # ISA (얇은 모듈, emerald)
    pension/               # 연금계좌 = 연금저축+IRP (얇은 모듈, violet)
    card/                  # 카드 (탐색 모듈)
      CardApp.jsx  tools.js  pages/(CardCatalog·CardDetail·PromoHandout·CardQrPrint
                            ·CardDeduction·CardEligibility)  data/(cards·cardBenefits·cardEligibility)
    utility/               # 보조 도구 (sky)
      UtilityApp.jsx  tools.js
      pages/               # NameRomanizer · AddressConverter · QrConverter · ToolRequestBoard
      components/          # UtilitySlip(전표 서식) · QrCode(SVG 벡터 QR)
      lib/  data/          # hangul·address 변환 엔진 · surnames · toolRequests
  shared/                  # CopyButton · WarningBox · SectionTitle · SourceBadge
                           # PrintReport · SalesScript · ModuleNoticeBoard · HubLink · format
                           # data/(notices · faqs)
```

경로 별칭: `@hub` `@shared` `@noran` `@isa` `@pension` `@card` `@utility` (`vite.config.js`)

## 확장 가이드

### 1. 새 상품 모듈 추가

얇은 모듈은 ISA(`src/products/isa/`)·연금계좌(`src/products/pension/`), 탐색 모듈은 카드(`src/products/card/`)가 실제 예시다.

1. `src/products/<id>/` 생성 — `<Id>App.jsx`(모듈 셸) + `pages/` `data/`. 셸은 기존 모듈 복제가 가장 빠르다(사이드바 + splat 라우팅 + 핀/최근사용 + HubLink + 인쇄 클래스 포함).
2. `vite.config.js`에 `@<id>` 별칭 → `src/App.jsx`에 `<Route path="/<id>/*" …/>`
3. `src/hub/data/products.js` 항목을 `status: "active"` + `to: "/<id>"` 로.
4. **도구 등록**: `src/products/<id>/tools.js` 매니페스트 작성 → `toolRegistry.js`의 `MODULE_MANIFESTS`에 한 줄 추가.
   - 도구 `id`는 `"모듈id.도구id"` 전역 유일 키 — **사용자 저장소에 기록되므로 배포 후 변경 금지**
   - 새 아이콘은 `toolPresentation.js`의 `TOOL_ICONS`에 추가
5. 셸에서 `findToolByPath`로 현재 도구 역조회 → `PinToolButton` 노출 + `recordToolVisit` 호출.
6. 인쇄가 있으면 `@shared/components/PrintReport` + 모듈 `printMeta.js` 주입. 공지 바가 필요하면 `ModuleNoticeBoard`.

**세제 데이터 소싱(계좌형)**: ① 법령 원문(law.go.kr) ② iM뱅크 자사 상품설명서 ③ 협회 비교공시 순. `data/isa.js`·`data/pension.js`처럼 세제 상수를 한 파일에 모으고 근거 조문 주석을 붙인다.

### 2. 저장소를 서버로 전환

어댑터마다 `load()/save()/clear()` 구현만 직원 계정별 API로 교체하면 Context·컴포넌트는 수정 없이 동작한다. 현재 localStorage 키(`salesbridge.*`): `dashboard`(개인화) · `followups`/`followups.branch`(일정) · `notices`/`faqs`(공지·FAQ) · `library.*`(라이브러리 채널·글·구독) · `notif.read`(읽은 알림) · `tools.requests`(도구 요청) · `card.custom`/`card.links`/`card.favs`(카드) · `wealth`/`market`(투자·시세 캐시).

- `src/hub/personalization/storage.js` — 대시보드 개인화
- `src/hub/followups/storage.js` — 일정 관리. **지점 공유(scope: "branch")는 서버 전환 시 지점 코드 기준 조회·권한 분리를 여기에.**
- 라이브러리·공지·도구 요청은 각 `*Store`/매니저에서 같은 방식으로 교체.

스키마 변경 시 `SCHEMA_VERSION`을 올리고 `migrate()`에 변환 추가.

### 3. 모닝 브리핑·시세 자동화

- **시세**: 이미 실시간(`data/marketQuotes.js`·투자상품 `useEtfLive.js`). 프록시(corsproxy.io)가 막히면 `PROXY` 상수만 교체.
- **뉴스**: `data/morningBriefing.js`를 수동 갱신 중. 자동화(제안서 기준): Apps Script 트리거 → 수집 → Gemini 요약 → 시트 적재 → `fetchMorningBriefing()` fetch.

### 4. 브랜딩 (로고·iM뱅크 CI)

- 브랜드 락업: `HubShell.jsx`의 `Brand` — iM CI 심볼 + 워드마크. 로고 클릭 = 허브 복귀.
- iM CI 심볼: `src/hub/components/IMSymbol.jsx`(공식 CI 벡터 재현본). 파비콘 `public/favicon.svg`, OG 썸네일 `public/og-image.png`와 동일 도안이므로 수정 시 함께. 대외 노출 전 CI 가이드 검수 필요.
- 링크 미리보기: OG·트위터 카드 태그는 `index.html`, 썸네일 `public/og-image.png`(1200×630).

### 5. 대시보드 섹션 / 보조 도구 추가

- **섹션**: `src/hub/sections.js` 등록 → `HubHome.jsx`의 `renderSection()`에 렌더러 → `DEFAULT_STATE.sectionOrder`에 기본 위치. 기존 저장분엔 맨 뒤 자동 병합(`reconcileOrder`). 섹션 라벨은 은행원 언어로(내부 용어 노출 금지).
- **보조 도구**: `src/products/utility/pages/`에 페이지 추가 → `UtilityApp.jsx` 렌더 분기 → `tools.js` 매니페스트. 전표 인쇄는 `UtilitySlip`에 `title/rows/note`(+`figure`)를 넘긴다.

## 로드맵

- [x] 노란우산공제 풀 모듈
- [x] ISA·연금계좌 얇은 모듈
- [x] 카드 모듈 — 탐색·상세·가입 QR(심의필)·소득공제, 발급 요건은 고객 진단 안으로
- [x] 투자상품 모듈 — 펀드·ETF·신탁, ETF 실시간 시세, 상세·비교·가입고객 관리
- [x] 고객 종합 진단 — 종합과세 판정 + 규칙 엔진 제안 + 예금 만기 관리 + A4 인쇄
- [x] 보조 도구 — 영문 이름·주소 변환기, QR코드 생성기, 도구 요청 게시판, 전표 인쇄
- [x] 일정 관리 — 목록/지점 달력, 스팬 드래그, 나만/지점 공유
- [x] 지식 라이브러리 — 자율 채널·구독·리치 에디터 발행
- [x] 부서별 공지 + 우상단 알림 벨
- [x] 마켓 보드 실시간 시세, 뉴스 전용 화면
- [ ] 모닝 브리핑 뉴스 자동 수집·요약 파이프라인
- [ ] 개인화·일정·라이브러리·공지 서버 저장 (직원 계정 + 지점 공유 실동작)
- [ ] 고객 진단 계정계 API 연동 (현재 대표 고객 목업)
- [ ] 마켓 보드 지표 선택·순서 개인화 (현재 고정 6종)
- [ ] 이후 방카슈랑스 등 (제도 변경 잦고 문의 많은 상품 우선)

## 데이터 출처

**노란우산공제** — 소기업·소상공인공제 약관·운용요강 · 조세특례제한법 · 중소기업협동조합법 · 청약서 · 행정정보 공동이용 사전동의서 · 공식 홈페이지(www.8899.or.kr)

**ISA** — 조세특례제한법 제91조의18 · iM뱅크 ISA 신탁형 약관 · 예금자보호법(한도 1억원)

**연금계좌** — 소득세법 제59조의3(세액공제)·부칙(가입 시기별 과세) · 근로자퇴직급여보장법 · iM뱅크 IRP 상품설명서

**고객 종합 진단** — 소득세법(금융소득 종합과세 기준 2,000만원) · 조세특례제한법(비과세종합저축 §88의2, ISA) · 주택청약·저축성보험 비과세 요건 · 카드 발급 요건(넥스피아 4요건). *조회 데이터는 대표 고객 목업, 실서비스는 계정계 API로 교체.*

**투자상품** — iM뱅크 펀드·신탁 상품 라인업 · ETF 시세 Yahoo Finance

**보조 도구** — 국어의 로마자 표기법(문화체육관광부 고시) · 도로명주소법 시행규칙 · 여권 성씨 관용 표기

## 로컬 실행 · 배포

```bash
npm install
npm run dev     # 개발 서버 (.claude/launch.json: noran-dev, :5173)
npm run build   # dist/ 생성 → Vercel 정적 호스팅
```

## 주의사항

- 본 도구는 직원 안내 보조용 — 공제금·환급금·세금·대출한도는 단정 안내 금지, 원장 시스템 조회 결과로 안내
- 고객 진단·계산기 인쇄물은 직원 상담용 — 고객 교부 자료로 쓰려면 준법감시인 심의 후 심의필 번호 표기 필요
- 시황·브리핑·투자상품 정보는 내부 참고용이며 특정 종목·상품의 투자권유가 아님
- 영문 이름은 여권 표기가, 영문 주소는 도로명주소 안내시스템 조회 결과가 기준 — 변환 결과는 후보로만 사용
- 기준이율·부가지급률·세제는 매 분기·법령 개정 시 변동, 콘텐츠 업데이트 필요
- 고객 개인정보 입력 금지 — 계산·시뮬레이션은 가상 변수, 진단·일정은 고객번호와 메모만
