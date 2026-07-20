# iM 세일즈메이트 (iM SalesMate)

> **모든 창구에 숙련 PB 한 명씩, 상담 옆자리를 지키는 AI 세일즈 파트너**
> 서비스명·부제는 `src/hub/HubShell.jsx`의 `HUB_NAME`/`HUB_SUBTITLE` 상수에서 관리합니다.

고객 상담 중 옆에 띄워놓고 바로 참고하는 **영업점 직원용 실시간 상담 보조 플랫폼**입니다.
허브(대시보드)를 중심으로 상품마다 동일한 템플릿의 **상품 모듈**이 붙는 구조라, 신상품이 나와도 빠르게 확장할 수 있습니다. 1호 모듈로 **노란우산공제**가 구현되어 있습니다.

## 화면 구성

| 영역 | 내용 |
|---|---|
| **허브 대시보드** (`/`) | 내 도구(개인화 런처) · 상품 상담 · 마켓 보드 · AI 모닝 브리핑(아침 필수 뉴스) · PB 지식 라이브러리 — 기본 순서는 실행 도구 위, 시황 아래 |
| **노란우산공제 모듈** (`/noran/*`) | 5분 입문 · 상담 시뮬레이터(세일즈 코치) · 세일즈 계산기 3종 · 업무별 가이드 20건 · FAQ 60건 · 구비서류 체크리스트(11개 사유) · 고객 전달용 인쇄 |

### 대시보드 개인화

- **내 도구**: 모듈 안의 계산기·시뮬레이터 등을 대시보드에 등록(핀)해 바로 진입. 등록은 ① 모듈 화면 우상단 「대시보드에 고정」 버튼, ② 허브 「도구 추가」 → 도구 라이브러리 양쪽에서 가능. 카드 드래그로 순서 변경.
- **섹션 편집**: 상단바 「대시보드 편집」 → 섹션 드래그로 순서 변경, 눈 아이콘으로 표시/숨김, 「기본값 복원」.
- **최근 사용**: 도구 화면에 진입하면 자동 기록되어 내 도구 아래에 표시(최대 5개 노출).
- 저장은 현재 **localStorage**(브라우저별). 실서비스 전환 시 [저장소 어댑터](#2-개인화-저장소를-서버로-전환)만 교체하면 됩니다.

## 기술 스택

- React 18 + Vite 5, react-router-dom 6 (경로 기반 라우팅, `vercel.json` SPA rewrite)
- Tailwind CSS 3 — 허브는 iM뱅크 민트(`im-*` 커스텀 팔레트), 모듈은 각자 아이덴티티 컬러(노란우산 = amber)
- dnd-kit (대시보드 드래그 정렬), Recharts (계산기 차트), lucide-react (아이콘)

## 디렉터리 구조

```
src/
  App.jsx                  # 루트 라우터 (/ → 허브, /noran/* → 모듈)
  hub/                     # 플랫폼 허브 (iM뱅크 민트 테마)
    HubShell.jsx           # 상단바 셸 · HUB_NAME 상수
    HubHome.jsx            # 대시보드 (섹션 프레임워크 + 편집 모드)
    sections.js            # 대시보드 섹션 정의 (개인화 기준 목록)
    components/            # MarketBoard · MorningNews · MyTools · ToolLibrary · ProductGrid · KnowledgeLibrary
    data/                  # morningBriefing(구글시트 교체 지점) · products · knowledge
    hooks/                 # useMorningBriefing
    personalization/       # storage(어댑터) · PersonalizationContext · PinToolButton
    registry/              # toolRegistry(도구 집계) · toolPresentation(아이콘·컬러 맵)
  products/
    noran/                 # 노란우산공제 모듈 (amber 테마)
      NoranApp.jsx         # 모듈 셸 (사이드바 + 내부 라우팅)
      tools.js             # ★ 도구 매니페스트 — 허브에 노출할 도구 선언
      pages/  components/  data/
  shared/                  # 범용 컴포넌트·유틸 (CopyButton · WarningBox · format 등)
```

경로 별칭: `@hub` `@noran` `@shared` (`vite.config.js`)

## 확장 가이드

### 1. 새 상품 모듈 추가 (예: ISA)

1. `src/products/isa/` 생성 — `IsaApp.jsx`(모듈 셸) + `pages/` `data/` (노란우산 구조 복제)
2. `src/App.jsx`에 라우트 추가: `<Route path="/isa/*" element={<IsaApp />} />`
3. `src/hub/data/products.js`의 해당 항목을 `status: "coming"` → `"active"` + `to: "/isa"` 로 변경
4. **도구 등록**: `src/products/isa/tools.js` 매니페스트 작성 → `src/hub/registry/toolRegistry.js`의 `MODULE_MANIFESTS`에 한 줄 추가
   - 도구 `id`는 `"모듈id.도구id"` 형식의 전역 유일 키 — **사용자 저장소(핀·최근 사용)에 기록되므로 한번 배포하면 변경 금지**
   - 새 아이콘을 쓰면 `toolRegistry` 옆 `toolPresentation.js`의 `TOOL_ICONS`에 추가
5. 모듈 셸에서 핀·최근 사용 연동: `findToolByPath`로 현재 화면의 도구를 역조회해 `PinToolButton` 노출 + `recordToolVisit` 호출 (NoranApp.jsx 참고)

### 2. 개인화 저장소를 서버로 전환

`src/hub/personalization/storage.js`가 유일한 저장 지점입니다. `load()/save()/clear()` 세 함수의 구현만 직원 계정별 API 호출로 교체하면 Context·컴포넌트는 수정 없이 동작합니다. 스키마 변경 시 `SCHEMA_VERSION`을 올리고 `migrate()`에 변환을 추가하세요.

### 3. 모닝 브리핑을 구글시트로 연동

`src/hub/data/morningBriefing.js`의 `fetchMorningBriefing()` 본문만 교체합니다.
파이프라인(제안서 기준): Apps Script 시간 트리거 → GOOGLEFINANCE·뉴스 수집 → Gemini API 요약 → 구글시트 적재 → 이 함수가 fetch. 시트 스키마는 파일 상단의 `BriefingShape` 주석(뉴스: `importance / category / headline / summary / pbNote / source`)을 따르면 됩니다.

### 4. 브랜딩 (로고·iM뱅크 CI)

- **세일즈메이트 마크**: `src/hub/components/SalesMateMark.jsx` (말풍선 + 상승 화살표, 민트/라임). 파비콘 `public/favicon.svg`와 동일 도안 — 수정 시 두 파일을 함께.
- **iM뱅크 로고**: 현재는 헤더 우측에 텍스트 표기(`HubShell.jsx`의 `BankMark`). 공식 CI 파일을 확보하면 `public/im-bank-logo.svg`로 넣고 `BankMark`를 `<img src="/im-bank-logo.svg" alt="iM뱅크" className="h-5" />` 형태로 교체하면 됩니다. 공식 아트워크를 임의로 그려 넣지 말 것(CI 가이드 위반).

### 5. 대시보드 섹션 추가

`src/hub/sections.js`에 섹션 등록 → `HubHome.jsx`의 `renderSection()`에 렌더러 추가. 순서·숨김은 자동으로 개인화에 편입됩니다(기존 사용자 저장분에는 새 섹션이 맨 뒤에 자동 병합). 섹션 라벨은 은행원 언어로 — 내부 용어(모듈 등) 노출 금지.

## 로드맵

- [ ] 마켓 보드 지표 선택·순서 개인화 (현재는 고정 6종)
- [ ] 개인화 서버 저장 (직원 계정 연동) — 어댑터 교체
- [ ] 모닝 브리핑 구글시트 파이프라인 연결
- [ ] 최근 조회 FAQ 대시보드 표시
- [ ] PB 지식 라이브러리 상세 콘텐츠·검색
- [ ] 2호 모듈 ISA → 연금저축·IRP → 예·적금 → 펀드 → 방카슈랑스 (제도 변경이 잦고 문의 많은 상품 우선)

## 노란우산공제 모듈 데이터 출처

- 소기업·소상공인공제 약관 (2026. 7. 1 시행 — 부금월액 상한 150만원 상향, 분기납 폐지, 추가납입부금 신설)
- 소기업·소상공인공제 운용요강 (2026. 1. 1 시행)
- 조세특례제한법 (법률 2025. 7. 1 시행 / 시행령·시행규칙 2026. 2. 27 시행)
- 중소기업협동조합법 (제121조의2 소멸시효 2026. 6. 3 시행)
- 노란우산 청약서 (2026. 1. 1 시행) — 가입 안내 / 핵심설명서 / 개인정보 동의서 / 가입(희망)장려금
- 별지 제61호 「행정정보 공동이용 사전동의서」 (2025. 7. 1 시행)
- 노란우산공제 공식 홈페이지 (www.8899.or.kr)

## 로컬 실행 · 배포

```bash
npm install
npm run dev     # 개발 서버
npm run build   # dist/ 생성 → Vercel 등 정적 호스팅 배포
```

## 주의사항

- 본 도구는 직원 안내 보조용 — 공제금·환급금·세금·대출한도는 단정 안내 금지, 중앙회 시스템 조회 결과로 안내
- 시황·브리핑은 내부 참고용이며 특정 종목·상품의 투자권유가 아님
- 기준이율·부가지급률은 매 분기 변동, 법령 개정 시 콘텐츠 업데이트 필요
- 고객 개인정보 입력 금지 — 모든 시뮬레이션은 가상 변수로만 진행
