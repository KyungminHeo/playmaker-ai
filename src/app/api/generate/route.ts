/**
 * POST /api/generate — HTML 플레이어블 광고 코드 생성 API
 *
 * 분석 결과 + 훅 시나리오 → 단일 HTML 플레이어블 광고 코드 생성.
 * Sonnet 모델 사용 (코드 생성 품질 최상위).
 * Streaming 필수 — 30~90초 소요 가능.
 */
import { NextRequest } from "next/server";
import anthropic, { MODELS } from "@/lib/claude";
import { getGenerateSystemPrompt, getGenerateUserPrompt } from "@/lib/prompts";
import { GameGenre, AdTone, HookScenario } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { gameName, genre, analysis, hook, tone } = await req.json();
    const analysisText = JSON.stringify(analysis, null, 2);

    const stream = anthropic.messages.stream({
      model: MODELS.SONNET,
      max_tokens: 16384,
      thinking: {
        type: "enabled",
        budget_tokens: 4096,
      },
      system: getGenerateSystemPrompt(genre as GameGenre),
      messages: [
        {
          role: "user",
          content: getGenerateUserPrompt(
            gameName,
            genre as GameGenre,
            analysisText,
            hook as HookScenario,
            tone as AdTone
          ),
        },
      ],
    });

    return new Response(stream.toReadableStream(), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (error) {
    console.error("Generate API error:", error);
    return Response.json({ error: "광고 코드 생성에 실패했습니다." }, { status: 500 });
  }
}
