/**
 * PlayMaker AI 메인 페이지
 *
 * 전체 플로우가 하나의 페이지에서 단계별로 진행:
 * Step 1: 게임 정보 입력 (폼)
 * Step 2: AI 분석 중 (로딩 + 스트리밍 미리보기)
 * Step 3: 훅 시나리오 선택
 * Step 4: 플레이어블 광고 미리보기 + 다운로드
 *
 * 각 단계는 step 상태값으로 전환되며,
 * API 호출은 모두 Streaming으로 처리.
 */
"use client"; // 이 컴포넌트는 브라우저에서 실행됨 (상태 관리, 이벤트 핸들링 필요)

import { useState } from "react";
import UploadForm from "@/components/upload-form";
import AnalysisCard from "@/components/analysis-card";
import HookSelector from "@/components/hook-selector";
import AdPreview from "@/components/ad-preview";
import { AnalysisResult, HookScenario, GameInput } from "@/lib/types";
import { readStream, extractJSON, extractHTML } from "@/lib/stream";

// 현재 진행 단계를 나타내는 타입
type Step = "input" | "analyzing" | "hooks" | "generating" | "preview";

export default function Home() {
  // ============================================================
  // 상태(State) 관리
  // ============================================================
  const [step, setStep] = useState<Step>("input");         // 현재 단계
  const [gameInput, setGameInput] = useState<GameInput | null>(null); // 사용자 입력 데이터
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null); // 분석 결과
  const [hooks, setHooks] = useState<HookScenario[]>([]);  // 훅 시나리오 3개
  const [generatedHTML, setGeneratedHTML] = useState("");   // 생성된 광고 HTML
  const [streamText, setStreamText] = useState("");         // Streaming 진행 상태 텍스트
  const [error, setError] = useState<string | null>(null);  // 에러 메시지

  // ============================================================
  // Step 1 → Step 2: 게임 정보 제출 → 스크린샷 분석 시작
  // ============================================================
  const handleSubmit = async (input: GameInput) => {
    setGameInput(input);       // 입력 데이터 저장 (나중에 generate에서 재사용)
    setStep("analyzing");      // 로딩 화면으로 전환
    setError(null);
    setStreamText("");

    try {
      // ---- 1단계: 스크린샷 분석 (/api/analyze) ----
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!analyzeRes.ok) throw new Error("분석 API 호출 실패");

      // Streaming으로 응답 수신 — setStreamText 콜백으로 실시간 UI 업데이트
      const analyzeText = await readStream(analyzeRes, setStreamText);
      // 응답 텍스트에서 JSON 부분만 추출 → AnalysisResult 타입으로 파싱
      const analysisData = extractJSON<AnalysisResult>(analyzeText);
      setAnalysis(analysisData);

      // ---- 2단계: 훅 시나리오 생성 (/api/hooks) ----
      setStreamText(""); // 스트리밍 텍스트 초기화 (새 단계 시작)
      const hooksRes = await fetch("/api/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameName: input.gameName,
          genre: input.genre,
          analysis: analysisData,  // 방금 받은 분석 결과 전달
          tone: input.tone,
        }),
      });

      if (!hooksRes.ok) throw new Error("훅 생성 API 호출 실패");

      const hooksText = await readStream(hooksRes, setStreamText);
      const hooksData = extractJSON<{ hooks: HookScenario[] }>(hooksText);
      setHooks(hooksData.hooks);
      setStep("hooks"); // 훅 선택 단계로 전환
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 에러가 발생했습니다.");
      setStep("input"); // 에러 발생 시 입력 화면으로 복귀
    }
  };

  // ============================================================
  // Step 3 → Step 4: 훅 선택 → HTML 광고 코드 생성
  // ============================================================
  const handleHookSelect = async (hook: HookScenario) => {
    if (!gameInput || !analysis) return; // 이전 데이터가 없으면 무시

    setStep("generating");    // 생성 중 로딩 화면
    setError(null);
    setStreamText("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameName: gameInput.gameName,
          genre: gameInput.genre,
          analysis,           // 분석 결과
          hook,               // 선택한 훅 시나리오
          tone: gameInput.tone,
        }),
      });

      if (!res.ok) throw new Error("광고 생성 API 호출 실패");

      // Streaming으로 코드 수신 — 코드가 길어서 30~90초 소요 가능
      const genText = await readStream(res, setStreamText);
      // 응답에서 ```html ... ``` 코드블록 추출
      const html = extractHTML(genText);
      setGeneratedHTML(html);
      setStep("preview"); // 미리보기 단계로 전환
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 에러가 발생했습니다.");
      setStep("hooks"); // 에러 시 훅 선택 단계로 복귀
    }
  };

  // ============================================================
  // 처음부터 다시 시작 (모든 상태 초기화)
  // ============================================================
  const handleReset = () => {
    setStep("input");
    setGameInput(null);
    setAnalysis(null);
    setHooks([]);
    setGeneratedHTML("");
    setStreamText("");
    setError(null);
  };

  // ============================================================
  // 렌더링 — 현재 step에 따라 다른 컴포넌트를 조건부 표시
  // ============================================================
  return (
    /*
     * min-h-screen: 최소 높이를 화면 전체로
     * bg-background: CSS 변수 --background 색상
     * p-4 md:p-8: 패딩 — 모바일 1rem, 데스크탑(768px+) 2rem
     */
    <main className="min-h-screen bg-background p-4 md:p-8">
      {/* max-w-4xl: 최대 너비 896px, mx-auto: 좌우 가운데 정렬 */}
      <div className="max-w-4xl mx-auto">

        {/* ========== 상단 헤더 ========== */}
        <header className="mb-8 text-center">
          {/* text-3xl: 1.875rem, font-bold: 700 굵기, tracking-tight: 좁은 자간 */}
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            PlayMaker AI
          </h1>
          {/* text-muted-foreground: --muted-foreground 색상 (회색 텍스트) */}
          <p className="text-muted-foreground">
            게임 스크린샷으로 10분 만에 플레이어블 광고 생성
          </p>
        </header>

        {/* ========== 에러 메시지 (있을 때만 표시) ========== */}
        {error && (
          /*
           * bg-destructive/10: 빨간색 배경 10% 투명도
           * text-destructive: 빨간색 텍스트
           * rounded-lg: 둥근 모서리 0.5rem
           */
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* ========== Step 1: 게임 정보 입력 폼 ========== */}
        {step === "input" && <UploadForm onSubmit={handleSubmit} />}

        {/* ========== Step 2: AI 분석 중 (로딩 상태) ========== */}
        {step === "analyzing" && (
          <div className="text-center py-16">
            {/* animate-pulse: 1초 주기로 투명도가 변하는 애니메이션 */}
            <div className="animate-pulse text-lg font-medium mb-4">
              AI가 게임을 분석하고 있습니다...
            </div>
            {/* Streaming 텍스트 실시간 표시 */}
            {streamText && (
              <pre className="text-xs text-muted-foreground max-w-lg mx-auto text-left bg-muted p-4 rounded-lg overflow-auto max-h-48">
                {streamText}
              </pre>
            )}
          </div>
        )}

        {/* ========== Step 3: 분석 결과 + 훅 시나리오 선택 ========== */}
        {step === "hooks" && analysis && (
          /* space-y-6: 자식 요소들 사이 세로 간격 1.5rem */
          <div className="space-y-6">
            <AnalysisCard analysis={analysis} />
            <HookSelector hooks={hooks} onSelect={handleHookSelect} />
          </div>
        )}

        {/* ========== Step 4-1: 광고 코드 생성 중 ========== */}
        {step === "generating" && (
          <div className="text-center py-16">
            <div className="animate-pulse text-lg font-medium mb-4">
              플레이어블 광고를 생성하고 있습니다...
            </div>
            {streamText && (
              <pre className="text-xs text-muted-foreground max-w-lg mx-auto text-left bg-muted p-4 rounded-lg overflow-auto max-h-48">
                {streamText.slice(-500)}
              </pre>
            )}
          </div>
        )}

        {/* ========== Step 4-2: 미리보기 + 다운로드 ========== */}
        {step === "preview" && (
          <AdPreview
            html={generatedHTML}
            gameName={gameInput?.gameName || "ad"}
            onReset={handleReset}
          />
        )}
      </div>
    </main>
  );
}
