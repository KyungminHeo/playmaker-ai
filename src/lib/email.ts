/**
 * Resend 이메일 발송 유틸리티
 *
 * 광고 생성 완료 시 알림 이메일 발송에 사용.
 * Resend 무료 티어: 하루 100통, 월 3,000통.
 */
import { Resend } from "resend";

// Resend 클라이언트 싱글턴
const resend = new Resend(process.env.RESEND_API_KEY);

// 알림 이메일에 담길 데이터 타입
export interface NotifyPayload {
  gameName: string;        // 게임 이름
  genre: string;           // 장르
  tone: string;            // 광고 톤
  generationTime: string;  // 생성 소요 시간 (예: "45.2초")
  userAgent: string;       // 브라우저/OS 정보
  ip: string;              // 클라이언트 IP
}

/**
 * 생성 완료 알림 이메일 발송
 *
 * Resend 무료 플랜은 발신자가 onboarding@resend.dev 로 고정됨.
 * 커스텀 도메인 연결 시 자유롭게 변경 가능.
 */
export async function sendNotification(payload: NotifyPayload) {
  const { gameName, genre, tone, generationTime, userAgent, ip } = payload;

  // 한국 시간(KST)으로 생성 시각 표시
  const timestamp = new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const { data, error } = await resend.emails.send({
    from: "PlayMaker AI <onboarding@resend.dev>",
    to: "rusemia@gmail.com",
    subject: `[PlayMaker AI] 광고 생성 완료 — ${gameName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 16px; color: #111;">PlayMaker AI 생성 완료</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 8px; color: #666; width: 120px;">게임 이름</td>
            <td style="padding: 10px 8px; font-weight: 600;">${gameName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 8px; color: #666;">장르</td>
            <td style="padding: 10px 8px; font-weight: 600;">${genre}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 8px; color: #666;">톤</td>
            <td style="padding: 10px 8px; font-weight: 600;">${tone}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 8px; color: #666;">생성 시간</td>
            <td style="padding: 10px 8px; font-weight: 600;">${generationTime}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 8px; color: #666;">생성 시각</td>
            <td style="padding: 10px 8px;">${timestamp}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 8px; color: #666;">IP</td>
            <td style="padding: 10px 8px;">${ip}</td>
          </tr>
          <tr>
            <td style="padding: 10px 8px; color: #666;">브라우저</td>
            <td style="padding: 10px 8px; font-size: 12px; color: #888;">${userAgent}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; font-size: 12px; color: #aaa;">이 메일은 PlayMaker AI에서 자동 발송되었습니다.</p>
      </div>
    `,
  });

  if (error) {
    console.error("이메일 발송 실패:", error);
    throw error;
  }

  return data;
}
