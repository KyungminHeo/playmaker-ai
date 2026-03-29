/**
 * PlayMaker AI 공통 타입 정의
 * 모든 API 요청/응답과 컴포넌트에서 사용하는 타입을 한곳에서 관리
 */

// ============================================================
// 게임 장르 — 입력 폼의 장르 선택 드롭다운에 사용
// ============================================================
export type GameGenre = "runner" | "puzzle" | "merge" | "idle" | "tap" | "shooting" | "rpg";

// 장르 한글 레이블 매핑 (UI 표시용)
export const GENRE_LABELS: Record<GameGenre, string> = {
  runner: "러너",
  puzzle: "퍼즐",
  merge: "머지",
  idle: "아이들",
  tap: "탭",
  shooting: "슈팅",
  rpg: "RPG",
};

// ============================================================
// 광고 톤 — 플레이어블 광고의 감성/분위기 결정
// ============================================================
export type AdTone = "tension" | "cute" | "achievement" | "humor";

export const TONE_LABELS: Record<AdTone, string> = {
  tension: "긴장감",
  cute: "귀여움",
  achievement: "성취감",
  humor: "유머",
};

// ============================================================
// 입력 폼 데이터 — 사용자가 작성하는 게임 정보 전체
// ============================================================
export interface GameInput {
  gameName: string;           // 게임 이름
  genre: GameGenre;           // 장르
  screenshots: string[];      // 스크린샷 base64 문자열 배열 (최대 3장)
  mechanic: string;           // 핵심 메카닉 설명 (예: "화면 탭하면 캐릭터가 점프")
  tone: AdTone;               // 광고 톤/감성
}

// ============================================================
// 분석 결과 — /api/analyze 응답
// Claude Vision이 스크린샷을 보고 추출한 게임 정보
// ============================================================
export interface AnalysisResult {
  palette: string[];          // 주요 색상 HEX 코드 배열 (예: ["#FF6B35", "#004E89"])
  style: string;              // 시각 스타일 설명 (예: "카툰, 밝은 톤, 둥근 캐릭터")
  coreInteraction: string;    // 핵심 인터랙션 (예: "탭하여 점프, 장애물 회피")
  keyObjects: string[];       // 주요 오브젝트 목록 (예: ["캐릭터", "장애물", "코인"])
  mood: string;               // 전체 분위기 (예: "밝고 경쾌함")
}

// ============================================================
// 훅 시나리오 — /api/hooks 응답
// 광고의 첫 3초를 결정하는 훅 전략 3가지
// ============================================================
export interface HookScenario {
  id: "A" | "B" | "C";       // 훅 식별자
  type: string;               // 훅 유형 (예: "실패 유도형", "성공 과시형")
  scenario: string;           // 상세 시나리오 설명
  gameplay_modifier?: string; // AI가 스스로 작성하는 핵심 로직 덮어쓰기 지시
  visual_modifier?: string;   // AI가 스스로 작성하는 비주얼 덮어쓰기 지시
  cta: string;                // Call-to-Action 문구 (예: "Play Now!")
  duration: number;           // 광고 재생 시간 (초)
}

// ============================================================
// 생성 결과 — /api/generate 응답
// 최종 생성된 HTML 플레이어블 광고 코드
// ============================================================
export interface GenerateResult {
  hookId: string;             // 어떤 훅 기반으로 생성했는지
  html: string;               // 전체 HTML 코드 (단일 파일, 외부 의존 없음)
  metadata: {
    fileSize: string;         // 파일 크기 (예: "45KB")
    estimatedLoadTime: string; // 예상 로딩 시간
    touchSupported: boolean;  // 모바일 터치 지원 여부
  };
}
