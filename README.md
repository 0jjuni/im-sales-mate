# iM 세일즈메이트 (iM SalesMate)

> **모든 창구에 숙련 PB 한 명씩, 상담 옆자리를 지키는 AI 세일즈 파트너**
> 서비스명·부제는 `src/hub/HubShell.jsx`의 `HUB_NAME`/`HUB_SUBTITLE` 상수에서 관리합니다.

**영업점 직원용 실시간 상담 보조 플랫폼**입니다. 사용자는 PB가 아니라 PB 없는 창구를 지키는 일반 직원이고, 경험이 쌓일 때까지 옆에서 받쳐 주는 보조바퀴 역할을 합니다. 고객이 앞에 있을 때는 옆에 띄워놓고 FAQ·계산 결과를 바로 꺼내 쓰고, 고객이 없는 시간에는 몰랐던 제도·세제를 짧게 읽어 둡니다.

허브(대시보드)를 중심으로 상품마다 동일한 템플릿의 **상품 모듈**이 붙는 구조라, 현장 요구가 생기면 화면을 새로 만들지 않고 내용만 더해 확장합니다.

**배포**: https://im-sales-mate.vercel.app/

## 화면 구성

| 영역 | 경로 | 내용 |
|---|---|---|
| **허브 대시보드** | `/` | 마켓 보드(실시간) · 내 도구 · 상품 상담 · 보조 도구 · 고객 후속 관리 위젯 · AI 모닝 브리핑 · PB 지식 라이브러리. 섹션 순서·표시는 개인화 |
| **노란우산공제 모듈** | `/noran/*` | 5분 입문 · 상담 시뮬레이터(세일즈 코치) · 계산기 3종 · 업무별 가이드 20건 · FAQ 61건 · 지급사유 11종별 구비서류 체크리스트 · 상담 자료 인쇄 |
| **ISA 모듈** | `/isa/*` | 세제 한눈에 · ISA 예금 절세 비교 계산기 · FAQ 17건 (조특법 제91조의18 + 신탁형 약관 2024.7.15 근거) |
| **연금계좌 모듈** | `/pension/*` | 세제 한눈에 · 세액공제 계산기(연금저축+IRP 900만원 합산, 초과분 IRP 이체 제안) · 가입 시기별 과세 판별(3세대) · FAQ 13건 |
| **보조 도구** | `/tools/*` | 영문 이름 변환기 · 영문 주소 변환기 · 링크 QR 변환기 — 결과는 전표(148mm) 인쇄 |
| **고객 후속 관리** | `/followups` | 월 달력(띠 드래그로 날짜 이동) · 고객번호 검색 · 나만 보기/지점 공유 · 고객 메모 |

### 모듈의 체급

모든 상품이 노란우산처럼 깊을 필요는 없다. 상품 성격에 따라 규모를 달리한다.

- **풀 모듈**(노란우산): 가이드·FAQ·시뮬레이터가 갖춰진 작업 공간.
- **얇은 모듈**(ISA·연금계좌): 세제 계산기 + 세제 요약 + FAQ 중심. 계좌형 상품은 단일 약관이 없고 세제·비교가 핵심이라 이 형태가 자연스럽다. 연금저축과 IRP는 세액공제 한도 900만원을 공유하므로 「연금계좌」 하나로 묶었다.
- **도구 모음**(보조 도구): 상품에 매이지 않는 창구 공통 도구. 변환 결과를 통장프린터 대신 전표 형태로 인쇄한다.

### 대시보드 개인화

- **내 도구**: 계산기·시뮬레이터를 대시보드에 핀 등록해 바로 진입. 모듈 화면 우상단 「대시보드에 고정」 또는 허브 「도구 추가」. 카드 드래그로 순서 변경.
- **섹션 편집**: 상단바 「대시보드 편집」 → 드래그 정렬, 눈 아이콘으로 표시/숨김, 기본값 복원. 처음 누르면 사용법 안내(`EditGuide`)가 한 번 뜬다.
- **최근 사용**: 도구 진입 시 자동 기록, 내 도구 아래 최대 5개 노출.
- 기본 순서: 마켓 보드 → 내 도구 → 상품 상담 → 보조 도구 → 고객 후속 관리 → 모닝 브리핑 → 지식 라이브러리 (`personalization/storage.js`의 `DEFAULT_STATE`).
- 저장은 **localStorage**(브라우저별). 서버 전환은 [저장소 어댑터](#2-저장소를-서버로-전환)만 교체.

### 고객 후속 관리

상담 중 나온 약속을 고객번호·연락일로 기록한다. 개인 PC 스티커 메모의 세 가지 문제(초기화 시 소실, 미설치 PC에서 사용 불가, 담당자 부재 시 인계 불가)를 대신하는 자리다.

- 허브에는 요약 위젯(임박 건 미리보기 + 빠른 기록), 관리는 `/followups` 전체 화면에서.
- **월 달력**: 칸 안의 띠를 끌어 다른 날짜로 이동(dnd-kit). 「내일/+1주/+1개월/기한 없음」 미루기 패널 병행.
- **공유 범위**: 기록마다 「나만 보기 / 지점 공유」 선택. 데모에서는 표시만 되고, 실서비스에서 지점 단위 접근통제를 붙인다.
- **개인정보 원칙**: 고객번호와 메모만. 이름·주민번호·연락처 입력 금지(UI에 명시).

### 마켓 보드 · 모닝 브리핑

- **마켓 보드**: Yahoo Finance chart API(corsproxy 경유)로 KOSPI·KOSDAQ·S&P500·나스닥·USD/KRW·미 국채 10년 시세를 실시간 조회. 전일 종가 대비는 일별 종가 배열의 마지막 두 값으로 계산(`data/marketQuotes.js`). 조회 실패 시 대체 표시로 후퇴.
- **모닝 브리핑 뉴스**: 공개된 발표·보도를 요약한 주간 브리핑(`data/morningBriefing.js`의 `BRIEFING.news`를 사람이 갱신). 각 뉴스는 사실 요약(summary)과 상담 포인트(pbNote)를 분리. 확정 전 사항은 단정 안내를 막는 문구로 작성.

### 인쇄물 두 가지

- **상담 자료 인쇄**(`@shared/components/PrintReport`): 계산기 결과를 A4 한 장으로. 그래프·비교표·디스클레이머 포함. **직원 상담용** — 고객 교부 자료로 쓰려면 준법감시인 심의 필요(서식 확정 후 심의 전제, `printMeta.js`에 `complianceReviewNo` 자리 있음).
- **전표 인쇄**(`@utility/components/UtilitySlip`): 보조 도구 결과를 148mm 전표로. 점선 테두리, 작성일·담당자 기재란. `figure`로 QR 등 그림 삽입 가능.

## 기술 스택

- React 18 + Vite 5, react-router-dom 6 (SPA rewrite: `vercel.json`)
- Tailwind CSS 3 — 허브는 iM뱅크 민트(`im-*` 팔레트), 모듈별 아이덴티티(노란우산 amber · ISA emerald · 연금 violet · 보조도구 sky)
- dnd-kit (대시보드 정렬 + 달력 드래그), Recharts (계산기 차트), lucide-react (아이콘), qrcode (QR 생성)

## 디렉터리 구조

```
src/
  App.jsx                  # 루트 라우터
  hub/
    HubShell.jsx           # 상단바 셸 · HUB_NAME 상수 · wide 옵션(달력 화면용)
    HubHome.jsx            # 대시보드 (섹션 프레임워크 + 편집 모드)
    sections.js            # 대시보드 섹션 정의 (개인화 기준 목록)
    components/            # MarketBoard · MorningNews · MyTools · ToolLibrary
                           # ProductGrid · UtilityGrid · KnowledgeLibrary
                           # FollowupBoard(허브 위젯) · EditGuide · IMSymbol
    followups/             # FollowupsPage(/followups) · MonthCalendar · parts(공유 부품)
                           # useFollowups(훅) · storage(어댑터)
    data/                  # marketQuotes(실시간 시세) · morningBriefing(뉴스)
                           # products · knowledge
    hooks/                 # useMorningBriefing
    personalization/       # storage(어댑터) · PersonalizationContext · PinToolButton
    registry/              # toolRegistry(도구 집계) · toolPresentation(아이콘·컬러 맵)
  products/
    noran/                 # 노란우산공제 (풀 모듈, amber)
      NoranApp.jsx  tools.js  printMeta.js  pages/  components/  data/
    isa/                   # ISA (얇은 모듈, emerald)
      IsaApp.jsx  tools.js  printMeta.js  pages/  data/isa.js
    pension/               # 연금계좌 = 연금저축+IRP (얇은 모듈, violet)
      PensionApp.jsx  tools.js  printMeta.js  pages/  data/pension.js
    utility/               # 보조 도구 (sky)
      UtilityApp.jsx  tools.js
      pages/               # NameRomanizer · AddressConverter · QrConverter
      components/          # UtilitySlip(전표 서식) · QrCode(SVG 벡터 QR)
      lib/                 # hangul(로마자 표기 엔진) · address(도로명주소 변환)
      data/surnames.js     # 성씨 여권 관용 표기 85종 + 복성
  shared/                  # CopyButton · WarningBox · SectionTitle · SourceBadge
                           # PrintReport · SalesScript(고객 안내 멘트) · HubLink · format
```

경로 별칭: `@hub` `@shared` `@noran` `@isa` `@pension` `@utility` (`vite.config.js`)

## 확장 가이드

### 1. 새 상품 모듈 추가

얇은 모듈은 ISA(`src/products/isa/`)·연금계좌(`src/products/pension/`)가 실제 예시다.

1. `src/products/<id>/` 생성 — `<Id>App.jsx`(모듈 셸) + `pages/` `data/`. 셸은 기존 모듈 복제가 가장 빠르다(사이드바 + splat 라우팅 + 핀/최근사용 + HubLink + 인쇄 클래스가 이미 들어있음).
2. `vite.config.js`에 `@<id>` 별칭 → `src/App.jsx`에 `<Route path="/<id>/*" …/>`
3. `src/hub/data/products.js` 항목을 `status: "active"` + `to: "/<id>"` 로.
4. **도구 등록**: `src/products/<id>/tools.js` 매니페스트 작성 → `toolRegistry.js`의 `MODULE_MANIFESTS`에 한 줄 추가.
   - 도구 `id`는 `"모듈id.도구id"` 전역 유일 키 — **사용자 저장소에 기록되므로 배포 후 변경 금지**
   - 새 아이콘은 `toolPresentation.js`의 `TOOL_ICONS`에 추가
5. 셸에서 `findToolByPath`로 현재 도구 역조회 → `PinToolButton` 노출 + `recordToolVisit` 호출.
6. 인쇄가 있으면 `@shared/components/PrintReport` + 모듈 `printMeta.js` 주입. 인쇄 트리거는 `window.print()` 버튼을 잊지 말 것.

**세제 데이터 소싱(계좌형)**: ① 법령 원문(law.go.kr) ② iM뱅크 자사 상품설명서 ③ 협회 비교공시 순. `data/isa.js`·`data/pension.js`처럼 세제 상수를 한 파일에 모으고 근거 조문 주석을 붙인다. 세법 개정 시 그 파일만 고치면 전 화면에 반영된다.

### 2. 저장소를 서버로 전환

어댑터가 두 개다. 각각 `load()/save()/clear()` 구현만 직원 계정별 API로 교체하면 Context·컴포넌트는 수정 없이 동작한다.

- `src/hub/personalization/storage.js` — 대시보드 개인화 (`salesbridge.dashboard`)
- `src/hub/followups/storage.js` — 고객 후속 관리 (`salesbridge.followups`). **지점 공유(scope: "branch")는 서버 전환 시 지점 코드 기준 조회·권한 분리를 여기에 붙인다.**

스키마 변경 시 `SCHEMA_VERSION`을 올리고 `migrate()`에 변환 추가.

### 3. 모닝 브리핑 자동화

- **시세**: 이미 실시간(`data/marketQuotes.js`). 프록시(corsproxy.io)가 막히면 자체 프록시로 `PROXY` 상수만 교체.
- **뉴스**: `data/morningBriefing.js`의 `BRIEFING.news`를 수동 갱신 중. 자동화 파이프라인(제안서 기준): Apps Script 시간 트리거 → 뉴스 수집 → Gemini API 요약 → 구글시트 적재 → `fetchMorningBriefing()`이 fetch. 스키마는 파일 상단 `BriefingShape` 주석을 따른다.

### 4. 브랜딩 (로고·iM뱅크 CI)

- 브랜드 락업: `HubShell.jsx`의 `Brand` — iM CI 심볼 + 워드마크 좌우조합. 로고 클릭 = 허브 복귀.
- iM CI 심볼: `src/hub/components/IMSymbol.jsx` — 공식 CI의 **벡터 재현본**. 파비콘 `public/favicon.svg`, OG 썸네일 `public/og-image.png`와 동일 도안이므로 수정 시 함께. 원본 CI 벡터를 확보하면 교체 권장, 대외 노출 전 CI 가이드 검수 필요.
- 링크 미리보기: OG·트위터 카드 태그는 `index.html`, 썸네일은 `public/og-image.png`(1200×630). 이미지를 바꾸면 [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 캐시 초기화.

### 5. 대시보드 섹션 추가

`src/hub/sections.js`에 등록 → `HubHome.jsx`의 `renderSection()`에 렌더러 추가 → `personalization/storage.js`의 `DEFAULT_STATE.sectionOrder`에 기본 위치 지정. 기존 사용자 저장분에는 새 섹션이 맨 뒤에 자동 병합된다(`reconcileOrder`). 섹션 라벨은 은행원 언어로 — 내부 용어(모듈 등) 노출 금지.

### 6. 보조 도구 추가

`src/products/utility/`에 페이지 추가 → `UtilityApp.jsx`의 `NAV_ITEMS`·렌더 분기 → `tools.js` 매니페스트. 전표 인쇄가 필요하면 `UtilitySlip`에 `title/rows/note`(+ 그림은 `figure`)를 넘기고 `window.print()` 버튼을 단다.

## 로드맵

- [x] 노란우산공제 풀 모듈
- [x] ISA 얇은 모듈 (신탁형 약관 반영, 예금자보호 1억원 기준)
- [x] 연금계좌(연금저축+IRP) 얇은 모듈 — 한도 초과분 IRP 이체 제안
- [x] 보조 도구 — 영문 이름·주소 변환기, 링크 QR 변환기, 전표 인쇄
- [x] 고객 후속 관리 — 월 달력·드래그 이동·고객번호 검색·나만/지점 공유
- [x] 마켓 보드 실시간 시세 (Yahoo via proxy)
- [x] 모닝 브리핑 실제 뉴스 (주간 수동 갱신)
- [x] 대시보드 편집 튜토리얼, 링크 미리보기(OG)
- [ ] 모닝 브리핑 뉴스 자동 수집·요약 파이프라인
- [ ] 개인화·후속 관리 서버 저장 (직원 계정 + 지점 공유 실동작)
- [ ] 마켓 보드 지표 선택·순서 개인화 (현재 고정 6종)
- [ ] PB 지식 라이브러리 상세 콘텐츠·검색
- [ ] 이후 예·적금 → 펀드 → 방카슈랑스 (제도 변경 잦고 문의 많은 상품 우선)

## 데이터 출처

**노란우산공제** — 소기업·소상공인공제 약관(2026.7.1 시행, 부금월액 상한 150만원·분기납 폐지·추가납입부금 신설) · 운용요강(2026.1.1) · 조세특례제한법 · 중소기업협동조합법(제121조의2 소멸시효) · 청약서(2026.1.1) · 행정정보 공동이용 사전동의서 · 공식 홈페이지(www.8899.or.kr)

**ISA** — 조세특례제한법 제91조의18 · iM뱅크 ISA 신탁형 약관(2024.7.15) · 예금자보호법(2025.9.1 한도 1억원)

**연금계좌** — 소득세법 제59조의3(세액공제) · 소득세법 부칙(가입 시기별 과세) · 근로자퇴직급여보장법 · iM뱅크 IRP 상품설명서·수수료 공시

**보조 도구** — 국어의 로마자 표기법(문화체육관광부 고시) · 도로명주소법 시행규칙 로마자 표기 방법 · 여권 성씨 관용 표기

## 로컬 실행 · 배포

```bash
npm install
npm run dev     # 개발 서버 (.claude/launch.json: noran-dev, :5173)
npm run build   # dist/ 생성 → Vercel 정적 호스팅
```

## 주의사항

- 본 도구는 직원 안내 보조용 — 공제금·환급금·세금·대출한도는 단정 안내 금지, 원장 시스템 조회 결과로 안내
- 계산기 인쇄물은 직원 상담용 — 고객 교부 자료로 쓰려면 준법감시인 심의 후 심의필 번호 표기 필요
- 시황·브리핑은 내부 참고용이며 특정 종목·상품의 투자권유가 아님
- 영문 이름은 여권 표기가, 영문 주소는 도로명주소 안내시스템 조회 결과가 기준 — 변환 결과는 후보로만 사용
- 기준이율·부가지급률은 매 분기 변동, 법령 개정 시 콘텐츠 업데이트 필요
- 고객 개인정보 입력 금지 — 계산·시뮬레이션은 가상 변수, 후속 관리는 고객번호와 메모만
