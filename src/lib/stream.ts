/**
 * Claude Streaming 응답 파싱 유틸리티
 *
 * Anthropic SDK의 Streaming 응답은 SSE(Server-Sent Events) 형식으로 전달됨.
 * 이 유틸리티는 SSE 스트림을 읽어서 텍스트 토큰을 하나씩 추출하고,
 * 콜백 함수로 실시간 업데이트를 전달.
 */

/**
 * Streaming 응답에서 텍스트를 실시간으로 읽어오는 함수
 *
 * @param response - fetch()의 응답 (Streaming)
 * @param onPartial - 토큰이 올 때마다 호출되는 콜백 (현재까지 누적된 텍스트 전달)
 * @returns 완성된 전체 텍스트
 */
export async function readStream(
  response: Response,
  onPartial?: (text: string) => void
): Promise<string> {
  if (!response.body) {
    return response.text();
  }

  const reader = response.body.getReader();     // ReadableStream 리더
  const decoder = new TextDecoder();             // 바이트 → 문자열 디코더
  let accumulated = "";                          // 누적 텍스트
  let buffer = "";                               // 미처리 버퍼

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // toReadableStream()은 줄바꿈 구분 JSON 형식으로 출력
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // 마지막 미완성 줄은 버퍼에 보관

    for (const line of lines) {
      if (!line.trim()) continue; // 빈 줄 무시
      try {
        const data = JSON.parse(line);
        // "content_block_delta" 이벤트에서 실제 텍스트 토큰 추출
        if (data.type === "content_block_delta" && data.delta?.text) {
          accumulated += data.delta.text;
          onPartial?.(accumulated); // UI 실시간 업데이트
        }
      } catch {
        // JSON 파싱 실패 무시 (다른 이벤트 타입)
      }
    }
  }

  return accumulated;
}

/**
 * Claude가 JSON 문자열 값 안에 리터럴 줄바꿈/탭을 넣는 경우 수정
 * JSON spec상 문자열 내부의 리터럴 제어 문자는 \n, \t 등으로 이스케이프해야 함
 */
function sanitizeJSON(raw: string): string {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      result += ch;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }
    // 문자열 내부의 리터럴 제어 문자 → 이스케이프 시퀀스로 교체
    if (inString) {
      if (ch === "\n") { result += "\\n"; continue; }
      if (ch === "\r") { result += "\\r"; continue; }
      if (ch === "\t") { result += "\\t"; continue; }
    }
    result += ch;
  }
  return result;
}

/**
 * Claude 응답에서 JSON 추출
 * Claude가 JSON 앞뒤에 텍스트를 붙이거나 문자열 내부에 리터럴 줄바꿈을 넣는 경우 대비
 */
export function extractJSON<T>(text: string): T {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return JSON.parse(sanitizeJSON(codeBlockMatch[1].trim()));
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    return JSON.parse(sanitizeJSON(text.slice(start, end + 1)));
  }

  throw new Error("응답에서 JSON을 찾을 수 없습니다.");
}

/**
 * Claude 응답에서 HTML 코드 추출
 * ```html ... ``` 코드블록에서 HTML을 꺼냄
 */
export function extractHTML(text: string): string {
  const match = text.match(/```html\s*([\s\S]*?)```/);
  if (match) {
    return match[1].trim();
  }

  if (text.includes("<!DOCTYPE") || text.includes("<html")) {
    return text.trim();
  }

  throw new Error("응답에서 HTML 코드를 찾을 수 없습니다.");
}
