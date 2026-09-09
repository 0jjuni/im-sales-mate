# iM 세일즈메이트 — 에이전트 공용 가이드

이 파일은 이 repo에서 일하는 AI 도구가 세션 시작 시 자동으로 읽는 공용 문서다.
Codex CLI는 `AGENTS.md`를, Claude Code는 `CLAUDE.md`(이 파일을 임포트)를 읽는다.
**진실의 원천은 이 파일 하나다.** 규칙이 바뀌면 여기만 고친다.

## 이 프로젝트
- iM AX 챌린지 2026 제출용 **영업점 세일즈 보조 데모**. 은행 창구 행원이 고객 상담에 쓰는 내부 도구.
- 스택: React 18 + Vite 5 + Tailwind 3 + react-router-dom 6.
- 배포: https://im-sales-mate.vercel.app/
- 제안서는 이미 제출 완료. **이후 작업은 데모 개선만**이고, 제안서에 반영할 필요 없다.
- 평가 축(개선 시 의식): 실용성 · 완성도 · 기대효과 · 혁신성 · 사업화 확장 가능성.

## 절대 규칙
1. **커밋에 Co-Authored-By / 도구 서명 트레일러 절대 넣지 않는다.** (Claude·Codex 서명 모두)
2. **eBiz·Toss 등 시크릿/키 하드코딩 금지.**
3. **결정이 필요한 질문은 "대답부터 하고 구현".** 임의로 방향 정해 밀지 않는다.
4. **변경마다 커밋 + 푸시.** 한 번에 몰아서 하지 않는다.
5. **AI 슬롭·자기설명형 문구 금지.** ("본 도구는 ~을 제공합니다" 류, 근거 없는 정밀 수치, em-dash 남발 등)
6. **고객 개인정보(이름/전화/주민번호) 금지.** 데모 예시는 **고객번호 + 메모**만.

## 협업 방식 (Claude + Codex 함께)
- 둘 다 **전체 작업을 할 수 있다.** 영역 제한 없음 — 사용자가 그때그때 한 명씩 따로 지시한다.
- 두 도구는 **같은 작업 폴더·같은 로컬 git repo를 공유**한다. 그래서 한쪽이 저장한 파일 변경도, 커밋(HEAD)도 상대에게 즉시 보인다. **서로 동기화하려고 `git pull` 할 필요 없다** — pull은 다른 PC·CI 등 외부에서 원격에 올라온 커밋을 받을 때만 의미 있다(이 세팅엔 해당 없음).
- 실시간 메시지는 못 주고받으니 조율 단위는 "커밋"이다:
  1. **완결된 단위로 자주 `git commit`.** 반쯤 된 상태로 오래 두지 않는다(상대가 그 위에서 일하기 어렵다).
  2. **`git push`는 원격 백업 + Vercel 배포용**이니 커밋 후 함께 한다.
  3. **같은 파일을 동시에 편집하지 않는다.** 시작할 때 `git status`에 내가 만들지 않은 미커밋 변경이 보이면, 그건 상대가 작업 중인 것 → 그 파일은 건드리지 말고, 내 것으로 커밋하지도 말고, 사용자에게 알린다.
- 겹치는 파일을 부득이 수정했다면 커밋 메시지에 무엇을·왜 바꿨는지 남긴다.

## 개발 / 빌드
- **`npm run build`가 검증의 진실의 원천.** 통과하면 소스는 정상이다.
- HMR이 stale 상태로 유령 에러(이미 지운 변수 참조 등)를 낼 때가 있다. 소스가 깨끗하고 build가 통과하면 그건 HMR 잔상 → dev 서버 재시작으로 해결. 유령 에러 잡겠다고 소스 헤집지 말 것.
- 환경: Windows / PowerShell. (PPT 생성 시 POWERPNT 잠금은 `Get-Process POWERPNT | Stop-Process -Force`)
- 로컬 Node 20이라 skills CLI 자동설치 불가 → 스킬은 수동 설치.

## 아키텍처 핵심
- Path alias: `@hub @shared @noran @isa @pension @card @utility`.
- 모듈 구조: 각 `<Module>App.jsx` 셸 + splat 라우팅 + `ModuleTabs`(underline 탭, 모바일은 `<select>`). 각 모듈 첫 탭 라벨은 **"홈"**으로 통일, ISA/연금/투자상품 홈은 계산기·FAQ·공지 바로가기 대시보드.
- **색(accent) 맵**: 노란=amber, 연금=violet, 투자상품=sky, 보조도구=im. 색을 바꾸면 한 곳이 아니라 `products.js` / `tools.js` / `toolPresentation.js`(TOOL_ACCENT) / ProductGrid ACCENT 등 **색 설정 표면 전부**를 같이 맞춰야 한다. Tailwind는 정적 클래스라 accent map으로 관리.
- **인쇄 시스템**:
  - `PrintReport`(shared) — `preview`, `slip` prop. `slip`이면 148mm 고객 교부용 전표(핵심 결과·전제·짧은 주의만).
  - `PrintPreviewModal`(shared) — 바로 인쇄창 띄우지 말고 **미리보기 먼저**. body로 portal, `html.printing-report`로 `#root` 숨김(`@media print`).
- **계산기 규칙**:
  - ISA: 연 2천/총 1억 한도, 의무가입 3년 강제. 적립식/거치식 분기(거치식 상한 연 2천). 불가능 시나리오 입력 차단.
  - 연금 IRP: 소득금액은 '기준소득 이하/초과' 체크로 공제율만 결정(금액 입력 아님).
  - 계산기 진입 시 강제 디스클레이머 게이트 없음(우상단 "사용 안내" 버튼으로만).
  - 재무 표현 정확히: "세액공제액"≠"환급액", "세후 수익(원금 제외)" 등. 소득공제는 환급이 아님.
  - 모바일 결과: `@shared/components/MobileResult` sticky 바(`targetId`로 결과부 스크롤).

## 설치된 스킬
- **im-not-ai / humanize-korean** — 한글 "AI 티" 제거. 고객 노출 문구·상담 화법·README·발표자료를 새로 쓰거나 크게 고칠 때 적용. 짧은 UI 라벨은 생략 가능.
  - Claude Code 설치: `/plugin marketplace add epoko77-ai/im-not-ai` → `/plugin install humanize-korean@im-not-ai` (또는 clone 후 `./install.sh`).
  - 도구가 플러그인을 못 쓰면, 저장소의 `references/ai-tell-taxonomy.md`(AI 티 A~J 분류)를 직접 읽어 원칙을 적용한다.
- **디자인(taste)** — 새 프론트 화면 만들 때만 참고. AI-퍼플 그라디언트 금지, 액센트 1색 통일, radius 스케일 하나 고정, 버튼 대비(a11y) 확인.
- **pptx(pptxgenjs)** — 발표자료는 `scratchpad/gen_ppt2.js`에서 생성, PowerPoint COM으로 렌더/검수.

## 근거 자료
- 노란우산 약관·운용요강·중협법·조특법·자산운용·리스크관리·IPS 7종 PDF(사용자 Downloads). 콘텐츠는 여기 근거.
- 행정정보 공동이용 자동조회 6종(2020.9 시행 운영 정책)도 반영 대상.
