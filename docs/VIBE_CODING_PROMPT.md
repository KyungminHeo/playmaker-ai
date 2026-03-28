# 바이브코딩 지시 내용

> AI에게 프로토타입 제작을 지시한 프롬프트입니다.
> AI의 응답은 제외하고, 사용자가 입력한 지시만 포함합니다.

---

## 1. 프로젝트 시작

```
PlayMaker AI라는 웹앱을 만들어줘.
모바일 게임 스크린샷을 올리면 AI가 분석해서 플레이어블 광고(HTML 미니게임)를 자동으로 만들어주는 도구야.

기술은 Next.js + TypeScript + Tailwind CSS + shadcn/ui 사용하고,
AI는 Claude API만 쓸 거야 (Anthropic SDK). 다른 AI API는 과금 안 돼 있어.
배포는 Vercel 무료 플랜으로 할 거고, 별도 백엔드 서버 없이 Next.js API Routes로 해결해줘.

모든 프론트엔드 코드에 한국어 주석을 상세하게 달아줘. 내가 프론트엔드에 약해서 주석 없으면 이해가 어려워.
```

---

## 2. 전체 플로우 설계

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

---

## 3. API 설계

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

---

## 4. 프롬프트 템플릿

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

---

## 5. Streaming 파싱

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

---

## 6. UI 컴포넌트

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

---

## 7. 빌드 확인

```
npm run build 에러 없는지 확인해줘.
.env.local이 .gitignore에 포함되어 있는지도 체크하고,
.env.local.example 파일도 만들어둬.
```

---

## 8. README 작성

```
README.md를 최대한 상세하게 작성해줘.
제목, 구현목적, 아키텍처, 사용기술, 구동방법 포함하고
API 명세, 프로젝트 구조, 비용 예상도 넣어줘.
```
