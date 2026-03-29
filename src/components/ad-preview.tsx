/**
 * AdPreview — 플레이어블 광고 미리보기 + 다운로드 컴포넌트
 *
 * 생성된 HTML을 iframe으로 렌더링하고 .html 파일 다운로드 제공.
 * 모바일(320x480) / 데스크탑(전체) 뷰 전환 지원.
 */
"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, RotateCcw, Smartphone, Monitor, Play } from "lucide-react";

interface AdPreviewProps {
  html: string;           // 생성된 HTML 코드
  gameName: string;       // 다운로드 파일명에 사용
  onReset: () => void;    // 다시 만들기
}

export default function AdPreview({ html, gameName, onReset }: AdPreviewProps) {
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0); // key 변경으로 iframe 리로드

  // 게임 다시 시작 — iframe을 리마운트하여 처음부터 재실행
  const handleReplay = () => setIframeKey((k) => k + 1);

  // HTML 파일 다운로드
  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${gameName}-playable-ad.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* 상단 버튼 */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">플레이어블 광고 미리보기</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReplay}>
            <Play className="w-4 h-4 mr-1" />
            다시 플레이
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            새로 만들기
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1" />
            다운로드
          </Button>
        </div>
      </div>

      {/* 미리보기 영역 */}
      <Card>
        <CardHeader className="pb-2">
          <Tabs defaultValue="mobile" onValueChange={(v) => setViewMode(v as "mobile" | "desktop")}>
            <TabsList>
              <TabsTrigger value="mobile" className="flex items-center gap-1">
                <Smartphone className="w-4 h-4" /> 모바일
              </TabsTrigger>
              <TabsTrigger value="desktop" className="flex items-center gap-1">
                <Monitor className="w-4 h-4" /> 데스크탑
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center bg-muted rounded-lg p-4">
            {/*
             * srcdoc: HTML 문자열을 iframe에 직접 렌더링 (URL 불필요)
             * sandbox: JS 실행 허용, 동일 출처 허용
             */}
            <iframe
              key={iframeKey}
              ref={iframeRef}
              srcDoc={html}
              className={`border rounded-lg bg-white ${
                viewMode === "mobile" ? "w-[320px] h-[480px]" : "w-full h-[480px]"
              }`}
              title="플레이어블 광고 미리보기"
              sandbox="allow-scripts allow-same-origin allow-pointer-lock"
              allow="autoplay; fullscreen"
              tabIndex={0}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            파일 크기: {(new Blob([html]).size / 1024).toFixed(1)} KB
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
