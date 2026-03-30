/**
 * 장르별 프롬프트 템플릿
 *
 * 프롬프트 품질이 생성 결과의 70%를 결정한다.
 * 각 장르의 핵심 메카닉과 인터랙션 패턴을 미리 정의해두고,
 * Claude에게 "이 틀 안에서" 생성하도록 유도하여 안정적인 품질 확보.
 */

import { GameGenre, AdTone, HookScenario } from "./types";

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
const toneGuide: Record<AdTone, string> = {
  tension: "긴박한 상황, 위기감, 타이머, 체력바 등을 활용",
  cute: "귀여운 캐릭터, 밝은 색감, 보상 애니메이션 강조",
  achievement: "숫자 폭발, 레벨업, 콤보, 화려한 이펙트 강조",
  humor: "예상 밖 반전, 과장된 실패, 코미디 요소 활용",
};

export function getHooksPrompt(
  gameName: string,
  genre: string,
  analysis: string,
  tone: AdTone
): string {

  return `당신은 하이퍼캐주얼 모바일 게임 광고 크리에이티브 디렉터이자 테크니컬 게임 기획자입니다.

게임 정보:
- 게임: ${gameName}
- 장르: ${genre}
- 분석 결과: ${analysis}
- 원하는 톤: ${toneGuide[tone]}

이 게임의 플레이어블 광고를 위한 "훅 시나리오" 3가지를 설계하세요.
각 훅은 첫 3초 안에 유저의 관심을 끌어야 합니다.
단순한 시나리오를 넘어, 이 시나리오를 코드로 구현할 때 장르의 기본 규칙을 어떻게 파괴하고 변경할지(gameplay_modifier, visual_modifier)를 반드시 구체적으로 작성하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "hooks": [
    {
      "id": "A",
      "type": "훅 유형 이름 (예: 실패 유도형)",
      "scenario": "15초 광고 전체 시나리오를 3~4문장으로 구체적으로 서술",
      "gameplay_modifier": "기존 장르 규칙을 무시하고 로직을 어떻게 변경할지 지시 (예: '장애물 속도 2배, 반대로 움직임')",
      "visual_modifier": "기본 비주얼을 어떻게 변경할지 지시 (예: '배경이 붉게 점멸, 캐릭터 크기 2배')",
      "cta": "영어 CTA 문구 (예: Play Now!)",
      "duration": 15
    },
    {
      "id": "B",
      "type": "훅 유형 이름",
      "scenario": "시나리오 서술",
      "gameplay_modifier": "로직 변경 지시",
      "visual_modifier": "비주얼 변경 지시",
      "cta": "CTA 문구",
      "duration": 15
    },
    {
      "id": "C",
      "type": "훅 유형 이름",
      "scenario": "시나리오 서술",
      "gameplay_modifier": "로직 변경 지시",
      "visual_modifier": "비주얼 변경 지시",
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
  shooting: `
    - 플레이어 기체가 화면 하단에 위치하고 자동으로 총알을 위로 발사함
    - 탭하거나 드래그하여 기체를 좌우로 이동
    - 화면 위에서 적들이 내려오고 총알을 맞추면 점수 획득
    - 적과 부딪히면 게임 오버
    - Canvas 2D 또는 DOM 요소의 지속적인 이동으로 구현`,
  rpg: `
    - 화면 중앙에 플레이어 캐릭터와 우측에 적 캐릭터가 마주보는 구도
    - 하단에 [ATTACK] 버튼과 [SKILL] 버튼 존재
    - 탭할 때마다 적에게 데미지 숫자가 튀어오름
    - 공격 시 화려한 이펙트와 함께 적의 체력바가 줄어듦
    - 적 체력이 0이 되면 다음 적으로 교체되며 보상 획득`,
};

// ============================================================
// System Prompt: 역할 + 코딩 표준 + 레퍼런스 패턴 + 장르 가이드
// ============================================================
export function getGenerateSystemPrompt(genre: GameGenre): string {
  return `당신은 플레이어블 광고 전문 HTML5 게임 개발자입니다.
모바일 게임 광고 네트워크(Meta, AppLovin, Unity Ads, Mintegral)에 바로 업로드할 수 있는 **상용 수준**의 플레이어블 광고를 만듭니다.
당신이 만드는 코드는 수백만 유저에게 노출되며, 첫 3초 안에 유저를 사로잡아야 합니다.

## 코딩 표준 (반드시 준수):
- 단일 HTML 파일 (외부 CDN/라이브러리 의존 절대 없음)
- Canvas 2D 기반 렌더링 권장 (복잡한 게임은 Canvas 필수)
- requestAnimationFrame 기반 게임 루프 (setInterval 사용 금지)
- 모바일 터치(touchstart/touchmove/touchend) + 데스크탑 마우스(mousedown/mousemove/mouseup) 모두 지원
- **[필수] canvas와 body에 CSS \`touch-action: none; user-select: none;\` 설정** — 이것이 없으면 모바일에서 터치 이벤트가 브라우저에 의해 가로채여 게임에 전달되지 않음
- **[필수] 이벤트 리스너는 게임 시작 전("TAP TO PLAY" 표시 시점)에 canvas에 등록** — 게임 시작 후가 아님
- 뷰포트: 320x480 기준 (세로 모드), canvas 크기 동적 스케일링
- delta time 기반 물리 업데이트 (프레임 독립적)
- 60fps 유지

## 레퍼런스 코드 패턴 (이 패턴들을 빌딩 블록으로 활용):

### 패턴 1: Delta Time 게임 루프
\`\`\`javascript
let lastTime = 0;
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  update(dt);
  render();
  if (gameState === 'playing') requestAnimationFrame(gameLoop);
}
\`\`\`

### 패턴 2: 터치/마우스 입력 정규화
\`\`\`javascript
// [필수] 터치 입력이 작동하려면 반드시 아래 CSS 설정 필요
canvas.style.touchAction = 'none';   // 브라우저 기본 터치 동작 차단
canvas.style.userSelect = 'none';    // 텍스트 선택 방지
document.body.style.touchAction = 'none';
document.body.style.overflow = 'hidden';  // 스크롤 방지
document.body.style.margin = '0';

function getPos(e) {
  e.preventDefault();  // 기본 동작 차단 (스크롤 등)
  const rect = canvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return {
    x: (t.clientX - rect.left) * (canvas.width / rect.width),
    y: (t.clientY - rect.top) * (canvas.height / rect.height)
  };
}
// 이벤트 리스너는 게임 초기화 시점에 등록 (게임 시작 전)
canvas.addEventListener('touchstart', handler, { passive: false });
canvas.addEventListener('touchmove', handler, { passive: false });
canvas.addEventListener('touchend', handler);
canvas.addEventListener('mousedown', handler);
canvas.addEventListener('mousemove', handler);
canvas.addEventListener('mouseup', handler);
\`\`\`

### 패턴 3: 스코어 팝업 애니메이션
\`\`\`javascript
const popups = [];
function addPopup(x, y, text, color) {
  popups.push({ x, y, text, color, life: 1.0, vy: -120 });
}
// update: p.y += p.vy * dt; p.life -= dt * 1.5;
// render: ctx.globalAlpha = p.life; ctx.font = 'bold 24px sans-serif';
//         ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y);
\`\`\`

### 패턴 4: 화면 흔들림 효과
\`\`\`javascript
let shakeAmount = 0;
function shake(intensity) { shakeAmount = intensity; }
// render 시작: ctx.save(); ctx.translate(
//   (Math.random()-0.5)*shakeAmount, (Math.random()-0.5)*shakeAmount);
// render 끝: ctx.restore(); shakeAmount *= 0.85;
\`\`\`

### 패턴 5: 파티클 시스템
\`\`\`javascript
const particles = [];
function spawnParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 150;
    particles.push({
      x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
      life: 0.5 + Math.random()*0.5, color, size: 2 + Math.random()*4
    });
  }
}
\`\`\`

## 장르별 인터랙션 가이드 (기본 뼈대):
${GENRE_INTERACTION_GUIDE[genre]}

## 흔한 실수 방지 (절대 하지 마세요):
- ❌ 캐릭터/오브젝트를 단색 사각형(fillRect)으로만 그리기 → ✅ arc(), 그라데이션, 눈/입 등 디테일 추가
- ❌ canvas를 매 프레임 clear하지 않기 → ✅ 매 프레임 clearRect(0,0,W,H) 호출
- ❌ setInterval로 게임 루프 돌리기 → ✅ requestAnimationFrame + delta time
- ❌ 하드코딩된 픽셀 좌표 → ✅ canvas.width/height 비율 기반 좌표
- ❌ 터치 이벤트만 처리하고 마우스 이벤트 빠뜨리기 → ✅ 둘 다 처리
- ❌ 배경을 단색으로 채우기 → ✅ 그라데이션 배경 필수
- ❌ 텍스트가 화면 밖으로 넘침 → ✅ 텍스트 중앙 정렬, maxWidth 적용
- ❌ 게임 오버 후 아무 반응 없음 → ✅ 반드시 CTA 오버레이 표시
- ❌ canvas에 touch-action: none 빠뜨리기 → ✅ canvas와 body에 touch-action: none 필수 (없으면 모바일 터치 안 됨!)
- ❌ 이벤트 리스너를 게임 시작 후에 등록 → ✅ 초기화 시점에 canvas에 등록 (TAP TO PLAY 탭도 같은 리스너로 처리)
- ❌ touchmove에 passive: false 빠뜨리기 → ✅ touchstart와 touchmove 모두 { passive: false } 필수
- ❌ getPos에서 e.preventDefault() 빠뜨리기 → ✅ 터치 핸들러에서 반드시 e.preventDefault() 호출`;
}

// ============================================================
// User Prompt: 게임 특화 태스크 (OVERRIDES + 게임 정보 + 출력 지시)
// ============================================================
export function getGenerateUserPrompt(
  gameName: string,
  genre: GameGenre,
  analysis: string,
  hook: HookScenario,
  tone: AdTone
): string {
  return `아래 정보를 바탕으로 플레이어블 광고를 HTML/CSS/JavaScript 단일 파일로 생성하세요.

## 🚨 최우선 적용 사항 (OVERRIDES) 🚨
아래 지침은 '장르별 인터랙션 가이드'나 기본 규칙보다 **무조건 우선**합니다.
기존 규칙을 파괴하더라도 아래 지침을 반드시 최우선으로 코드로 구현하세요:
- [게임플레이 변경 강제 지시]: ${hook.gameplay_modifier || "없음 (기본 장르 가이드라인 따름)"}
- [비주얼 변경 강제 지시]: ${hook.visual_modifier || "없음 (기본 비주얼 가이드라인 따름)"}

## 게임 정보:
- 게임: ${gameName}
- 장르: ${genre}
- 분석 결과: ${analysis}
- 광고 톤/분위기: ${toneGuide[tone]}
- 훅 시나리오: ${hook.scenario}

## 반드시 포함해야 하는 인터랙션:
- **유저 입력에 즉각 반응**: 탭/클릭/드래그 시 0.1초 내에 시각적 피드백 (색상 변화, 크기 변화, 파티클 등)
- **점수/콤보 시스템**: 화면 상단에 점수 표시, 유저 액션마다 점수가 튀어오르는 애니메이션 (레퍼런스 패턴 3 활용)
- **실패/성공 피드백**: 성공 시 화면 흔들림(shake) + 파티클 (레퍼런스 패턴 4, 5 활용), 실패 시 빨간 번쩍임
- **화면에 항상 움직이는 요소**: 배경 스크롤, 파티클, 떠다니는 오브젝트 등으로 화면이 살아있게
- **난이도 상승**: 시간이 지날수록 빨라지되, 초반 5초는 천천히

## 게임 속도 및 타이밍:
- 전체 플레이 타임: **30초** (15초는 너무 짧음)
- 초반 속도는 느리게 (유저가 조작법을 익힐 시간 필요)
- 오브젝트 이동 속도: 화면 폭의 1~2%/프레임으로 시작
- 장애물/아이템 등장 간격: 초반 최소 1.5초, 후반 0.8초까지 줄어듦

## 비주얼 품질 (핵심):
- 캐릭터/오브젝트는 Canvas 도형으로 정성껏 (arc, 그라데이션, 눈/입 등 디테일)
- 그라데이션 배경 필수 (단색 금지)
- 점수/메시지 텍스트: 중앙 정렬, 테두리/그림자 효과, max-width 90%
- ⭐️ **[가장 중요] 수치의 시각적 표현**: 유저 스코어나 군중 숫자 증가 시, 텍스트만이 아닌 Canvas 안에 **실제로 작고 귀여운 오브젝트들이 바글바글하게 뭉쳐서 함께 이동하도록 다중 렌더링**. 숫자가 커지면 군중 무리의 시각적 규모도 커져야 함.

## 필수 구조 (이 순서대로):
1. HTML <style>에 \`* { touch-action: none; user-select: none; } body { margin: 0; overflow: hidden; }\` 포함
2. canvas 생성 직후 이벤트 리스너 등록 (touchstart/touchmove/touchend + mousedown/mousemove/mouseup), passive: false 옵션 필수
3. "TAP TO PLAY" 오버레이 (탭/클릭하면 게임 시작) — canvas 위에 그리거나 별도 div로 구현
4. 30초 게임 플레이
5. 30초 후 CTA 오버레이 (반투명 배경 + 큰 버튼)
6. CTA 버튼 클릭 시 console.log("CTA_CLICKED") 호출

HTML 코드만 출력하세요. \`\`\`html 코드블록으로 감싸세요. 설명이나 주석 외 텍스트는 포함하지 마세요. 반드시 <!DOCTYPE html>로 시작하는 완전한 HTML5 문서여야 합니다.`;
}
