/**
 * 장르별 프롬프트 템플릿
 *
 * 프롬프트 품질이 생성 결과의 70%를 결정한다.
 * 각 장르의 핵심 메카닉과 인터랙션 패턴을 미리 정의해두고,
 * Claude에게 "이 틀 안에서" 생성하도록 유도하여 안정적인 품질 확보.
 */

import { GameGenre, AdTone } from "./types";

// ============================================================
// /api/analyze 용 프롬프트 — 스크린샷 분석
// ============================================================
export function getAnalyzePrompt(gameName: string, genre: string, mechanic: string): string {
  return `당신은 모바일 게임 UA(User Acquisition) 전문 분석가입니다.

아래 게임의 스크린샷을 분석하여 플레이어블 광고 제작에 필요한 핵심 정보를 추출하세요.

게임 정보:
- 게임 이름: ${gameName}
- 장르: ${genre}
- 핵심 메카닉: ${mechanic}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:
{
  "palette": ["#HEX1", "#HEX2", "#HEX3"],
  "style": "시각 스타일 한 줄 설명",
  "coreInteraction": "핵심 인터랙션 한 줄 설명",
  "keyObjects": ["오브젝트1", "오브젝트2", "오브젝트3"],
  "mood": "전체 분위기 한 줄 설명"
}`;
}

// ============================================================
// /api/hooks 용 프롬프트 — 광고 훅 시나리오 3개 생성
// ============================================================
export function getHooksPrompt(
  gameName: string,
  genre: string,
  analysis: string,
  tone: AdTone
): string {
  const toneGuide: Record<AdTone, string> = {
    tension: "긴박한 상황, 위기감, 타이머, 체력바 등을 활용",
    cute: "귀여운 캐릭터, 밝은 색감, 보상 애니메이션 강조",
    achievement: "숫자 폭발, 레벨업, 콤보, 화려한 이펙트 강조",
    humor: "예상 밖 반전, 과장된 실패, 코미디 요소 활용",
  };

  return `당신은 하이퍼캐주얼 모바일 게임 광고 크리에이티브 디렉터입니다.

게임 정보:
- 게임: ${gameName}
- 장르: ${genre}
- 분석 결과: ${analysis}
- 원하는 톤: ${toneGuide[tone]}

이 게임의 플레이어블 광고를 위한 "훅 시나리오" 3가지를 설계하세요.
각 훅은 첫 3초 안에 유저의 관심을 끌어야 합니다.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "hooks": [
    {
      "id": "A",
      "type": "훅 유형 이름 (예: 실패 유도형)",
      "scenario": "15초 광고 전체 시나리오를 3~4문장으로 구체적으로 서술",
      "cta": "영어 CTA 문구 (예: Play Now!)",
      "duration": 15
    },
    {
      "id": "B",
      "type": "훅 유형 이름",
      "scenario": "시나리오 서술",
      "cta": "CTA 문구",
      "duration": 15
    },
    {
      "id": "C",
      "type": "훅 유형 이름",
      "scenario": "시나리오 서술",
      "cta": "CTA 문구",
      "duration": 15
    }
  ]
}`;
}

// ============================================================
// /api/generate 용 프롬프트 — HTML 플레이어블 광고 코드 생성
// ============================================================

const GENRE_INTERACTION_GUIDE: Record<GameGenre, string> = {
  runner: `
    - 캐릭터가 자동으로 앞으로 달림 (좌→우 또는 아래→위)
    - 탭하면 점프 또는 슬라이드
    - 장애물이 등장하고 부딪히면 게임 오버
    - 코인/아이템 수집 시 점수 증가
    - Canvas 2D로 구현, requestAnimationFrame 루프`,
  puzzle: `
    - 그리드 기반 퍼즐 (3x3 ~ 5x5)
    - 드래그 또는 탭으로 피스 이동/회전/매칭
    - 매칭 성공 시 이펙트 + 점수
    - 제한 시간 또는 이동 횟수 제한
    - DOM 기반 그리드 + CSS 애니메이션으로 구현`,
  merge: `
    - 같은 아이템 2개를 드래그하여 합치면 상위 아이템 생성
    - 그리드 위에 아이템 배치
    - 합성 시 화려한 이펙트
    - DOM 기반 그리드 + 드래그앤드롭으로 구현`,
  idle: `
    - 화면 탭하면 숫자(돈/점수)가 증가
    - 연타할수록 이펙트가 화려해짐
    - 자동 수입 업그레이드 버튼
    - 큰 숫자 표시 (1K, 1M 등 포맷)
    - DOM 기반 + CSS 애니메이션으로 구현`,
  tap: `
    - 빠르게 탭하여 목표 달성
    - 탭 할 때마다 시각 피드백 (크기 변화, 색상 변화, 파티클)
    - 프로그레스 바가 차오름
    - 목표 달성 시 폭발 이펙트
    - DOM 기반 + CSS transition으로 구현`,
};

export function getGeneratePrompt(
  gameName: string,
  genre: GameGenre,
  analysis: string,
  hook: string,
  tone: AdTone
): string {
  return `당신은 플레이어블 광고 전문 HTML5 게임 개발자입니다.

아래 정보를 바탕으로 15초짜리 플레이어블 광고를 HTML/CSS/JavaScript 단일 파일로 생성하세요.

게임 정보:
- 게임: ${gameName}
- 장르: ${genre}
- 분석 결과: ${analysis}
- 훅 시나리오: ${hook}

장르별 인터랙션 가이드:
${GENRE_INTERACTION_GUIDE[genre]}

필수 요구사항:
1. 단일 HTML 파일 (외부 CDN/라이브러리 의존 없음)
2. 모바일 터치 + 데스크탑 마우스 모두 지원
3. 뷰포트: 320x480 기준 (세로 모드), 반응형
4. 15초 플레이 후 CTA 버튼 등장
5. 로딩 시간 최소화 (인라인 SVG/CSS로 그래픽 표현)
6. 분석된 색상 팔레트를 그대로 사용
7. 시작 시 "TAP TO START" 오버레이
8. CTA 버튼 클릭 시 console.log("CTA_CLICKED") 호출

코드 품질 요구사항:
- 깔끔한 CSS 애니메이션 사용
- 60fps 유지를 위한 최적화
- 터치 이벤트: touchstart/touchend 사용 (click은 300ms 딜레이)

HTML 코드만 출력하세요. \`\`\`html 코드블록으로 감싸세요. 설명은 포함하지 마세요.`;
}
