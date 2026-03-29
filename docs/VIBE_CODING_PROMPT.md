# 바이브코딩 지시 내용

> AI에게 프로토타입 제작을 지시한 프롬프트입니다.
> AI의 응답은 제외하고, 사용자가 입력한 지시만 포함합니다.

---

## Day 1 — 프로젝트 셋업 + API + 기본 UI

### 1. 프로젝트 시작

```
PlayMaker AI라는 웹앱을 만들어줘.
모바일 게임 스크린샷을 올리면 AI가 분석해서 플레이어블 광고(HTML 미니게임)를 자동으로 만들어주는 도구야.

기술은 Next.js + TypeScript + Tailwind CSS + shadcn/ui 사용하고,
AI는 Claude API만 쓸 거야 (Anthropic SDK). 다른 AI API는 과금 안 돼 있어.
배포는 Vercel 무료 플랜으로 할 거고, 별도 백엔드 서버 없이 Next.js API Routes로 해결해줘.

모든 프론트엔드 코드에 한국어 주석을 상세하게 달아줘. 내가 프론트엔드에 약해서 주석 없으면 이해가 어려워.
```

### 2. 전체 플로우 설계

```
전체 플로우는 하나의 페이지에서 step 상태로 관리해줘.

흐름은 이래:
1. 사용자가 게임 이름, 장르, 스크린샷(최대 3장), 핵심 메카닉, 광고 톤을 입력
2. AI가 스크린샷을 분석해서 색상 팔레트, 스타일, 핵심 인터랙션 추출
3. 분석 결과 기반으로 광고 훅 시나리오 3개(A/B/C) 생성
4. 사용자가 훅 하나 선택하면 HTML 플레이어블 광고 코드 생성
5. iframe으로 미리보기 + .html 다운로드

장르는 러너/퍼즐/머지/아이들/탭 5개 지원하고,
광고 톤은 긴장감/귀여움/성취감/유머 4개 중 선택.
```

### 3. API 설계

```
API는 3개야. 전부 Streaming으로 해줘.
Vercel 무료 플랜이 서버리스 타임아웃 60초인데, Claude 응답이 30~90초 걸릴 수 있으니까
Streaming이면 토큰 흐르는 동안 연결 끊기지 않아서 타임아웃 회피 가능해.

1. POST /api/analyze
   - 스크린샷(base64)을 Claude Vision(Sonnet)으로 분석
   - 색상 팔레트, 스타일, 인터랙션, 오브젝트, 분위기를 JSON으로 반환

2. POST /api/hooks
   - 분석 결과를 받아서 Claude Haiku로 훅 시나리오 3개 생성
   - Haiku 쓰는 이유는 카피 생성이라 빠르고 저렴한 모델이면 충분

3. POST /api/generate
   - 분석 결과 + 선택한 훅을 받아서 Claude Sonnet으로 HTML 코드 생성
   - 단일 HTML 파일, 외부 CDN 없이 완결, 모바일 터치 지원
   - max_tokens 8192로 넉넉하게
```

### 4. 프롬프트 템플릿

```
lib/prompts.ts에 장르별 프롬프트 템플릿을 만들어줘.
프롬프트 품질이 결과의 70%라서 여기가 제일 중요해.

분석용 프롬프트: "모바일 게임 UA 전문 분석가" 역할 부여, JSON만 응답하게 제한

훅 생성 프롬프트: "하이퍼캐주얼 광고 크리에이티브 디렉터" 역할,
톤별로 다른 가이드 줘 (긴장감이면 위기감/타이머, 귀여움이면 밝은색감/보상 등)

HTML 생성 프롬프트: "플레이어블 광고 전문 HTML5 게임 개발자" 역할,
장르별로 인터랙션 가이드를 미리 정의해둬:
- 러너: Canvas 2D, 탭 점프, 자동 달리기
- 퍼즐: DOM 그리드, 드래그/탭 매칭
- 머지: DOM 그리드, 드래그 합성
- 아이들: 탭 연타, 숫자 증가
- 탭: 빠른 연타, 프로그레스 바

필수 조건: 단일 HTML, 외부 의존 없음, 320x480 기준, 15초 후 CTA 버튼,
"TAP TO START" 오버레이, 터치 이벤트는 touchstart/touchend 사용
```

### 5. Streaming 파싱

```
클라이언트에서 Streaming 응답을 파싱하는 유틸리티 만들어줘.

readStream 함수:
- fetch 응답의 ReadableStream을 읽어서 텍스트로 변환
- Anthropic SSE 형식(data: {JSON}) 파싱
- content_block_delta 이벤트에서 delta.text 추출
- onPartial 콜백으로 실시간 텍스트 전달해서 UI 업데이트

extractJSON 함수:
- Claude가 JSON 앞뒤에 텍스트 붙이는 경우 대비해서 { }만 파싱

extractHTML 함수:
- ```html 코드블록에서 HTML 추출
```

### 6. UI 컴포넌트

```
컴포넌트 4개 만들어줘. shadcn/ui 컴포넌트 활용해서.

1. upload-form: 게임 정보 입력 폼
   - react-dropzone으로 스크린샷 드래그앤드롭
   - 이미지 FileReader로 base64 변환
   - 업로드된 이미지 미리보기 3열, 호버시 삭제 버튼
   - 장르/톤은 Select 드롭다운, 2열 나란히 배치
   - 필수 입력 누락 시 버튼 disabled

2. analysis-card: 분석 결과 카드
   - 색상 팔레트는 동그란 원 + HEX 코드
   - 오브젝트는 Badge 태그
   - 나머지는 텍스트

3. hook-selector: 훅 3개 카드
   - A=파랑, B=초록, C=보라로 색 구분
   - 시나리오 + CTA 미리보기 + "이 훅으로 생성" 버튼
   - 모바일 1열, 데스크탑 3열

4. ad-preview: 미리보기 + 다운로드
   - iframe srcDoc으로 HTML 렌더링
   - 모바일(320x480) / 데스크탑 탭 전환
   - .html 다운로드 버튼 (Blob)
   - 다시 만들기 버튼
   - 파일 크기 표시
```

### 7. 빌드 확인

```
npm run build 에러 없는지 확인해줘.
.env.local이 .gitignore에 포함되어 있는지도 체크하고,
.env.local.example 파일도 만들어둬.
```

### 8. README 작성

```
README.md를 최대한 상세하게 작성해줘.
제목, 구현목적, 아키텍처, 사용기술, 구동방법 포함하고
API 명세, 프로젝트 구조, 비용 예상도 넣어줘.
```

---

## Day 2 — 프롬프트 튜닝 + UI 개선

### 9. 프롬프트 아키텍처 리팩토링

```
지금 프롬프트 구조에 문제가 있어.
훅 시나리오를 아무리 잘 써도 getGeneratePrompt에서 GENRE_INTERACTION_GUIDE가 너무 강해서
결과물이 다 비슷하게 나와. 훅 시나리오가 사실상 무시되고 있어.

이렇게 바꿔줘:

1. HookScenario 타입에 gameplay_modifier와 visual_modifier 필드를 추가해.
   - AI가 훅 시나리오 짤 때 "이 시나리오를 코드로 구현하려면 장르 규칙을 어떻게 변경해야 하는지"를
     구체적으로 작성하게 유도하는 거야.

2. getHooksPrompt에서 AI 역할을 "크리에이티브 디렉터 + 테크니컬 기획자"로 바꾸고,
   JSON에 gameplay_modifier, visual_modifier 필드를 필수로 넣어줘.

3. getGeneratePrompt를 System Prompt + User Prompt로 분리해.
   - System: 역할, 코딩 표준, 레퍼런스 코드 패턴, 장르 가이드 (기본 뼈대)
   - User: OVERRIDES 섹션 (modifier가 장르 가이드보다 우선), 게임 정보, 출력 지시

4. generate API에서 hook 객체를 통째로 넘기도록 변경.
   hookText = JSON.stringify(hook) 대신 hook 객체 그대로 전달.

5. Extended Thinking 켜줘. budget_tokens: 4096.
   max_tokens도 16384로 올려.
```

### 10. 레퍼런스 코드 패턴 추가

```
System Prompt에 레퍼런스 코드 패턴 5개를 추가해줘.
AI가 이 패턴을 빌딩 블록처럼 가져다 쓰도록.

1. Delta Time 게임 루프 — requestAnimationFrame + dt 계산
2. 터치/마우스 입력 정규화 — canvas 좌표 변환, 터치+마우스 동시 지원
3. 스코어 팝업 애니메이션 — 점수 텍스트가 위로 떠오르며 사라짐
4. 화면 흔들림 효과 — ctx.translate로 랜덤 흔들림, 감쇠
5. 파티클 시스템 — 방사형 파티클, 생명주기 관리

그리고 "흔한 실수 방지" 섹션도 넣어줘:
- 단색 사각형으로만 그리지 말고 arc, 그라데이션, 디테일 추가
- 매 프레임 clearRect 호출
- setInterval 대신 rAF
- 하드코딩 좌표 대신 비율 기반
- 터치만 처리하고 마우스 빠뜨리지 않기
- 배경 단색 금지, 그라데이션 필수
- 게임 오버 후 CTA 오버레이 필수
```

### 11. 장르 확장

```
장르 2개 추가해줘: shooting(슈팅), rpg(RPG).

shooting 가이드:
- 화면 하단 플레이어 기체, 자동 총알 발사
- 탭/드래그로 좌우 이동
- 적이 위에서 내려옴, 총알 맞추면 점수
- 적과 충돌하면 게임 오버

rpg 가이드:
- 플레이어와 적이 마주보는 구도
- ATTACK, SKILL 버튼
- 탭하면 데미지 숫자 팝업
- 적 체력바 감소, 0이면 다음 적

types.ts의 GameGenre 타입, GENRE_LABELS, GENRE_INTERACTION_GUIDE 전부 업데이트해줘.
```

### 12. User Prompt 품질 강화

```
User Prompt에 구체적인 품질 요구사항 추가해줘:

인터랙션:
- 유저 입력에 0.1초 내 시각적 피드백
- 점수/콤보 시스템 (스코어 팝업 패턴 활용)
- 성공 시 화면 흔들림+파티클, 실패 시 빨간 번쩍임
- 화면에 항상 움직이는 요소 (배경 스크롤, 파티클 등)
- 시간 따라 난이도 상승 (초반 5초는 천천히)

게임 속도:
- 전체 플레이 타임 30초 (15초는 너무 짧음)
- 오브젝트 이동 속도: 화면 폭의 1~2%/프레임으로 시작
- 장애물 등장 간격: 초반 1.5초 → 후반 0.8초

비주얼:
- 캐릭터/오브젝트를 Canvas 도형으로 정성껏
- 그라데이션 배경 필수
- 점수/메시지 텍스트 중앙 정렬, 그림자 효과
- 수치의 시각적 표현: 스코어 증가 시 작은 오브젝트들이 바글바글 뭉쳐서 다중 렌더링

필수 구조:
1. "TAP TO PLAY" 오버레이
2. 30초 게임 플레이
3. CTA 오버레이 (반투명 + 큰 버튼)
4. CTA 클릭 시 console.log("CTA_CLICKED")
```

### 13. UI/UX 개선

```
로딩 화면 개선해줘:
- animate-pulse 대신 시간 기반 프로그레스 바 구현
- 퍼센트 숫자 표시 (0% → 100%)
- 분석 중 / 훅 설계 중 / 광고 생성 중 단계별 메시지 전환
- 100% 도달 후 0.6초 대기 후 다음 단계로 전환
- 스트리밍 텍스트 영역 넓고 높게 (max-w-2xl, max-h-80/96)

ad-preview 개선해줘:
- "다시 플레이" 버튼 추가 (iframe key 리마운트로 게임 재시작)
- iframe에 allow-pointer-lock, autoplay, fullscreen 권한 추가

upload-form 개선해줘:
- 카드 헤더 아래에 안내 문구 추가
- 핵심 메카닉 입력란 아래에 힌트 텍스트
- 미입력 필드 안내 메시지 (제출 버튼 아래)

analyze API 수정:
- base64 data URL에서 실제 MIME 타입 추출 (jpeg, webp 등 지원)
- 에러 시 Claude API 원본 에러 메시지 포함

stream.ts 파서 수정:
- toReadableStream()은 SSE가 아니라 줄바꿈 구분 JSON 라인 형식
- SSE 파서에서 JSON 라인 파서로 변경

미사용 framer-motion 패키지 제거해줘.
```

### 14. 모델 변경

```
claude.ts의 SONNET 모델을 "claude-sonnet-4-5"로 변경해줘.
HAIKU는 "claude-haiku-4-5-20251001" 유지.
```
