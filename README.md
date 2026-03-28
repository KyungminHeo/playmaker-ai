# PlayMaker AI — 플레이어블 광고 자동 생성기

> 게임 스크린샷 3장으로 10분 만에 플레이어블 광고를 만드는 AI 도구

---

## 1. 프로젝트 소개

PlayMaker AI는 모바일 게임의 **플레이어블 광고(Playable Ad)**를 AI로 자동 생성하는 웹 애플리케이션입니다.

기존에 플레이어블 광고를 제작하려면 외주 업체에 의뢰하여 **1~2주의 시간**과 **300~500만원의 비용**이 필요했습니다.
PlayMaker AI는 이 과정을 **10분, 0원**으로 줄입니다.

### 핵심 가치

| 기존 방식 | PlayMaker AI |
|---|---|
| 기획서 작성 → 외주 전달 → 시안 검토 → 수정 2~3회 → 최종 납품 | 스크린샷 업로드 → AI 분석 → 훅 선택 → 광고 생성 |
| 평균 10영업일 | **10분** |
| 300~500만원 | **0원** (API 비용 ~$0.05/회) |
| A/B 테스트 버전 추가 시 비용 2배 | 훅 시나리오 3개 동시 생성 |

---

## 2. 구현 목적

슈퍼센트 AI 애플리케이션 엔지니어 과제전형 프로토타입입니다.

### 해결하려는 문제

- **대상 사용자**: UA 마케터, 게임 프로듀서, 인디 개발자
- **문제**: 하이퍼캐주얼 게임은 수명이 짧아 광고 제작 속도가 곧 매출인데, 플레이어블 광고 제작이 느리고 비쌈
- **해결**: AI가 스크린샷을 분석하고, 광고 훅 시나리오를 설계하고, HTML 플레이어블 광고 코드를 자동 생성

### User Flow

```
Step 1  게임 정보 입력
        ├─ 게임 이름
        ├─ 장르 선택 (러너/퍼즐/머지/아이들/탭)
        ├─ 스크린샷 2~3장 업로드
        ├─ 핵심 메카닉 설명
        └─ 광고 톤 선택 (긴장감/귀여움/성취감/유머)

Step 2  AI 분석 (자동)
        ├─ 게임 스타일 분석
        ├─ 색상 팔레트 추출
        └─ 핵심 인터랙션 정의

Step 3  광고 훅 시나리오 선택
        ├─ 훅 A: "실패 유도형"
        ├─ 훅 B: "성공 과시형"
        └─ 훅 C: "선택 딜레마형"

Step 4  플레이어블 광고 미리보기 + 다운로드
        ├─ iframe 실시간 플레이 테스트
        ├─ 모바일/데스크탑 뷰 전환
        └─ .html 파일 다운로드 → Meta/AppLovin/Unity Ads 업로드 가능
```

---

## 3. 아키텍처

### 시스템 구조

별도 API 서버 없이 Next.js API Routes가 백엔드 역할을 수행합니다.
모든 API 엔드포인트는 **Streaming 응답**을 사용하여 Vercel 서버리스 타임아웃(60초)을 회피합니다.

```
┌─ Client (Next.js) ────────────────────────────────┐
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐   │
│  │ 입력 폼   │→│ 분석 결과 │→│ 미리보기/다운   │   │
│  │ Page      │  │ Page     │  │ Page           │   │
│  └──────────┘  └────▲─────┘  └──────▲─────────┘   │
│       │              │ stream        │ stream      │
└───────┼──────────────┼──────────────┼─────────────┘
        │              │              │
        ▼              │              │
┌─ API Routes (Serverless + Streaming) ─────────────┐
│                                                    │
│  POST /api/analyze   → Claude Vision  → stream ────┘
│  POST /api/hooks     → Claude Haiku   → stream ──┘
│  POST /api/generate  → Claude Sonnet  → stream
│                                                    │
└────────────────────┬──────────────────────────────┘
                     │
                     ▼
┌─ Claude API (Anthropic) ──────────────────────────┐
│                                                    │
│  ┌─────────────────┐  ┌────────────────────────┐  │
│  │ Sonnet 4.6      │  │ Haiku 4.5              │  │
│  │ - Vision 분석   │  │ - 훅 카피 생성          │  │
│  │ - HTML 코드생성  │  │ - CTA 텍스트           │  │
│  │ (stream mode)   │  │ (stream mode)          │  │
│  └─────────────────┘  └────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

### 데이터 흐름

```
[스크린샷] ──base64──→ /api/analyze (Sonnet Vision, stream)
                        → { palette, style, interaction, objects, mood }

[분석결과] ──────────→ /api/hooks (Haiku, stream)
                        → { hookA, hookB, hookC }

[분석+훅] ───────────→ /api/generate (Sonnet, stream)
                        → HTML 플레이어블 광고 코드 (단일 파일)

[HTML] ──────────────→ iframe 미리보기 + .html 다운로드
```

### 왜 별도 API 서버가 없는가

| 고려 사항 | 판단 |
|---|---|
| DB 필요? | 없음 — 상태 저장 불필요, 클라이언트 메모리에 보관 |
| 백그라운드 잡? | 없음 — 요청-응답 사이클 내에서 완료 |
| 무거운 연산? | 없음 — Claude API가 처리, 서버는 중계만 |
| 타임아웃 문제? | **Streaming으로 해결** — 토큰이 흐르는 동안 연결 유지 |

---

## 4. 사용 기술

### 프레임워크 & 언어

| 기술 | 버전 | 역할 |
|---|---|---|
| **Next.js** | 16 (App Router) | 프론트엔드 + 백엔드(API Routes) 통합 프레임워크 |
| **TypeScript** | 5.9 | 타입 안정성, 프론트/백엔드 타입 공유 |
| **React** | 19 | UI 컴포넌트 렌더링 |
| **Tailwind CSS** | 4.2 | 유틸리티 기반 스타일링 |

### AI

| 기술 | 역할 |
|---|---|
| **Claude Sonnet 4.6** | 스크린샷 Vision 분석 + HTML/CSS/JS 코드 생성 |
| **Claude Haiku 4.5** | 광고 훅 카피 + CTA 텍스트 생성 (빠르고 저렴) |
| **@anthropic-ai/sdk** | Anthropic 공식 TypeScript SDK |

### UI 라이브러리

| 기술 | 역할 |
|---|---|
| **shadcn/ui** | Card, Tabs, Badge, Select 등 UI 컴포넌트 |
| **Lucide React** | 아이콘 (Upload, Download, Gamepad 등) |
| **react-dropzone** | 스크린샷 드래그앤드롭 업로드 |
| **Framer Motion** | 로딩 애니메이션 |

### 인프라

| 기술 | 역할 |
|---|---|
| **Vercel** | Next.js 네이티브 호스팅, 무료 배포 |
| **GitHub** | 소스 코드 관리 |

---

## 5. 구동 방법

### 사전 요구사항

- **Node.js** 20 이상
- **npm** 9 이상
- **Anthropic API Key** ([console.anthropic.com](https://console.anthropic.com)에서 발급)

### 설치

```bash
# 1. 저장소 클론
git clone https://github.com/KyungminHeo/playmaker-ai.git
cd playmaker-ai

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 실제 API 키 입력:
# ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 개발 서버 실행

```bash
npm run dev
# → http://localhost:3000 에서 확인
```

### 프로덕션 빌드

```bash
npm run build   # 빌드
npm run start   # 프로덕션 서버 실행
```

### Vercel 배포

```bash
# Vercel CLI로 배포
npx vercel

# 또는 GitHub 연결 후 자동 배포
# vercel.com → Import Git Repository → 환경변수에 ANTHROPIC_API_KEY 추가
```

### 환경변수

| 변수명 | 필수 | 설명 |
|---|---|---|
| `ANTHROPIC_API_KEY` | O | Anthropic API 키 (sk-ant-...) |

> `.env.local` 파일은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.

---

## 6. 프로젝트 구조

```
playmaker-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 메인 페이지 (전체 플로우 관리)
│   │   ├── layout.tsx                  # 루트 레이아웃
│   │   ├── globals.css                 # 전역 스타일 (Tailwind v4)
│   │   └── api/
│   │       ├── analyze/route.ts        # 스크린샷 분석 API (Claude Vision)
│   │       ├── hooks/route.ts          # 훅 시나리오 생성 API (Claude Haiku)
│   │       └── generate/route.ts       # HTML 광고 생성 API (Claude Sonnet)
│   ├── components/
│   │   ├── upload-form.tsx             # 게임 정보 입력 폼
│   │   ├── analysis-card.tsx           # 분석 결과 표시 카드
│   │   ├── hook-selector.tsx           # 훅 A/B/C 선택 카드
│   │   ├── ad-preview.tsx              # iframe 미리보기 + 다운로드
│   │   └── ui/                         # shadcn/ui 컴포넌트
│   └── lib/
│       ├── claude.ts                   # Anthropic SDK 클라이언트
│       ├── prompts.ts                  # 장르별 프롬프트 템플릿
│       ├── stream.ts                   # Streaming 응답 파싱 유틸리티
│       ├── types.ts                    # 공통 타입 정의
│       └── utils.ts                    # shadcn cn() 유틸리티
├── docs/
│   └── PROJECT_PLAN.md                 # 프로젝트 기획 전체 문서
├── CLAUDE.md                           # Claude Code 에이전트 가이드
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── .env.local                          # API 키 (gitignore 대상)
```

---

## 7. API 명세

### POST /api/analyze

스크린샷을 Claude Vision으로 분석하여 게임의 시각적 특성을 추출합니다.

**Request Body:**
```json
{
  "gameName": "Monster Run",
  "genre": "runner",
  "mechanic": "탭하면 점프",
  "screenshots": ["data:image/png;base64,..."]
}
```

**Response (Streaming → JSON):**
```json
{
  "palette": ["#FF6B35", "#004E89", "#FFFFFF"],
  "style": "카툰, 밝은 톤, 둥근 캐릭터",
  "coreInteraction": "탭하여 점프, 장애물 회피",
  "keyObjects": ["캐릭터", "장애물", "코인"],
  "mood": "밝고 경쾌함"
}
```

### POST /api/hooks

분석 결과 기반으로 광고 훅 시나리오 3가지를 생성합니다.

**Request Body:**
```json
{
  "gameName": "Monster Run",
  "genre": "runner",
  "analysis": { ... },
  "tone": "tension"
}
```

**Response (Streaming → JSON):**
```json
{
  "hooks": [
    {
      "id": "A",
      "type": "실패 유도형",
      "scenario": "캐릭터가 거대한 벽 앞에서 멈춤...",
      "cta": "You can do better! Play Now",
      "duration": 15
    },
    { "id": "B", ... },
    { "id": "C", ... }
  ]
}
```

### POST /api/generate

분석 결과 + 훅 시나리오를 바탕으로 HTML 플레이어블 광고를 생성합니다.

**Request Body:**
```json
{
  "gameName": "Monster Run",
  "genre": "runner",
  "analysis": { ... },
  "hook": { "id": "A", ... },
  "tone": "tension"
}
```

**Response (Streaming → HTML):**

```html
<!DOCTYPE html>
<html>
  <!-- 단일 파일, 외부 의존 없음, 모바일 터치 지원 -->
  <!-- 15초 미니게임 → CTA 버튼 -->
</html>
```

---

## 8. 지원 장르 & 프롬프트 템플릿

| 장르 | 핵심 인터랙션 | 구현 방식 |
|---|---|---|
| **러너** | 탭 점프, 장애물 회피, 코인 수집 | Canvas 2D + requestAnimationFrame |
| **퍼즐** | 드래그/탭으로 피스 이동, 매칭 | DOM 그리드 + CSS 애니메이션 |
| **머지** | 같은 아이템 드래그하여 합성 | DOM 그리드 + 드래그앤드롭 |
| **아이들** | 탭으로 숫자 증가, 업그레이드 | DOM + CSS 애니메이션 |
| **탭** | 빠른 연타, 프로그레스 바 | DOM + CSS transition |

---

## 9. 비용 예상

| 항목 | 비용 |
|---|---|
| Vercel 호스팅 | $0 (Hobby 무료) |
| Claude Sonnet (분석+생성) | ~$0.02~0.05 / 1회 |
| Claude Haiku (훅 생성) | ~$0.001 / 1회 |
| **1회 전체 플로우** | **~$0.05** |
| **100회 테스트 기준** | **~$5** |

---

## 10. 라이선스

이 프로젝트는 슈퍼센트 AI 애플리케이션 엔지니어 채용 과제를 위해 제작되었습니다.
