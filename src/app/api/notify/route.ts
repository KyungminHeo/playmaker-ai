/**
 * POST /api/notify — 생성 완료 이메일 알림 API
 *
 * 클라이언트에서 HTML 생성이 완료된 뒤 호출.
 * 게임 정보 + 클라이언트 메타 정보를 이메일로 발송.
 * 실패해도 사용자 플로우에 영향 없음 (fire-and-forget).
 */
import { NextRequest } from "next/server";
import { sendNotification } from "@/lib/email";
import { GENRE_LABELS, TONE_LABELS, GameGenre, AdTone } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { gameName, genre, tone, generationTime, userAgent } = await req.json();

    // IP 추출 — Vercel/프록시 환경에서는 x-forwarded-for, 로컬에서는 fallback
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

    await sendNotification({
      gameName,
      genre: GENRE_LABELS[genre as GameGenre] || genre,
      tone: TONE_LABELS[tone as AdTone] || tone,
      generationTime,
      userAgent: userAgent || "unknown",
      ip,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Notify API error:", error);
    // 이메일 실패는 사용자 경험에 영향 주지 않도록 200 반환
    return Response.json({ ok: false, error: "이메일 발송 실패" }, { status: 200 });
  }
}
