/**
 * POST /api/hooks — 광고 훅 시나리오 생성 API
 *
 * 분석 결과 기반으로 훅 시나리오 3가지(A/B/C) 생성.
 * Haiku 모델 사용 (빠르고 저렴). Streaming 응답.
 */
import { NextRequest } from "next/server";
import anthropic, { MODELS } from "@/lib/claude";
import { getHooksPrompt } from "@/lib/prompts";
import { AdTone } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { gameName, genre, analysis, tone } = await req.json();
    const analysisText = JSON.stringify(analysis, null, 2);

    const stream = anthropic.messages.stream({
      model: MODELS.HAIKU,
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: getHooksPrompt(gameName, genre, analysisText, tone as AdTone),
        },
      ],
    });

    return new Response(stream.toReadableStream(), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (error) {
    console.error("Hooks API error:", error);
    return Response.json({ error: "훅 시나리오 생성에 실패했습니다." }, { status: 500 });
  }
}
