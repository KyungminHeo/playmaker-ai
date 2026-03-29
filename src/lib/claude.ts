/**
 * Anthropic Claude API 클라이언트 초기화
 * 서버 사이드(API Route)에서만 사용 — 클라이언트에서 직접 호출 금지
 */
import Anthropic from "@anthropic-ai/sdk";

// 싱글턴 패턴: 여러 API Route에서 동일한 클라이언트 인스턴스 재사용
// ANTHROPIC_API_KEY는 .env.local에서 자동으로 읽힘
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default anthropic;

// 모델 상수 — 어떤 작업에 어떤 모델을 쓸지 한곳에서 관리
export const MODELS = {
  // Sonnet: Vision 분석 + HTML 코드 생성 (고성능)
  SONNET: "claude-sonnet-4-5",
  // Haiku: 훅 카피/CTA 생성 (빠르고 저렴)
  HAIKU: "claude-haiku-4-5-20251001",
} as const;
