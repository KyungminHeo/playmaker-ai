/**
 * POST /api/analyze — 스크린샷 분석 API
 *
 * Claude Vision(Sonnet)에 스크린샷을 보내서 게임의 시각적 특성을 분석.
 * Streaming 응답으로 Vercel 타임아웃을 회피.
 */
import { NextRequest } from "next/server";
import anthropic, { MODELS } from "@/lib/claude";
import { getAnalyzePrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { gameName, genre, mechanic, screenshots } = await req.json();

    // 스크린샷을 Claude Vision 형식으로 변환
    // data URL에서 실제 mime type을 추출 (image/png, image/jpeg 등)
    const imageContent = screenshots.map((base64: string) => {
      const mimeMatch = base64.match(/^data:(image\/\w+);base64,/);
      const mediaType = mimeMatch ? mimeMatch[1] : "image/png";
      return {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType as "image/png" | "image/jpeg" | "image/gif" | "image/webp",
          data: base64.replace(/^data:image\/\w+;base64,/, ""),
        },
      };
    });

    const stream = anthropic.messages.stream({
      model: MODELS.SONNET,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            ...imageContent,
            { type: "text", text: getAnalyzePrompt(gameName, genre, mechanic) },
          ],
        },
      ],
    });

    return new Response(stream.toReadableStream(), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (error: unknown) {
    const err = error as { status?: number; error?: { error?: { message?: string } }; message?: string };
    console.error("Analyze API error:", err.status, err.error?.error?.message || err.message);
    const msg = err.error?.error?.message || err.message || "스크린샷 분석에 실패했습니다.";
    return Response.json({ error: msg }, { status: err.status || 500 });
  }
}
