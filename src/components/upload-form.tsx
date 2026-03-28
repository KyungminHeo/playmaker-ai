/**
 * UploadForm — 게임 정보 입력 폼 컴포넌트
 *
 * 사용자 입력: 게임 이름, 장르, 스크린샷(드래그앤드롭), 메카닉 설명, 광고 톤
 * 제출 시 부모(page.tsx)의 handleSubmit 호출.
 */
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  GameInput, GameGenre, AdTone, GENRE_LABELS, TONE_LABELS,
} from "@/lib/types";

interface UploadFormProps {
  onSubmit: (input: GameInput) => void;
}

export default function UploadForm({ onSubmit }: UploadFormProps) {
  // 각 입력 필드의 상태
  const [gameName, setGameName] = useState("");
  const [genre, setGenre] = useState<GameGenre>("runner");
  const [screenshots, setScreenshots] = useState<string[]>([]);  // base64 배열
  const [mechanic, setMechanic] = useState("");
  const [tone, setTone] = useState<AdTone>("tension");

  // 스크린샷 드래그앤드롭 처리
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remaining = 3 - screenshots.length; // 최대 3장 제한
      const filesToProcess = acceptedFiles.slice(0, remaining);

      filesToProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setScreenshots((prev) => [...prev, base64]);
        };
        reader.readAsDataURL(file); // 파일 → base64 변환
      });
    },
    [screenshots.length]
  );

  // react-dropzone 훅 설정
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 3,
    disabled: screenshots.length >= 3,
  });

  // 스크린샷 삭제
  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 페이지 새로고침 방지
    if (!gameName || screenshots.length === 0 || !mechanic) return;
    onSubmit({ gameName, genre, screenshots, mechanic, tone });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5" />
          게임 정보 입력
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 게임 이름 */}
          <div className="space-y-2">
            <Label htmlFor="gameName">게임 이름</Label>
            <Input
              id="gameName"
              placeholder="예: Monster Run"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              required
            />
          </div>

          {/* 장르 + 톤 (2열 그리드) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>장르</Label>
              <Select value={genre} onValueChange={(v) => setGenre(v as GameGenre)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(GENRE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>광고 톤</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as AdTone)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TONE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 스크린샷 업로드 (드래그앤드롭) */}
          <div className="space-y-2">
            <Label>스크린샷 (최대 3장)</Label>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
                ${screenshots.length >= 3 ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-sm">이미지를 여기에 놓으세요</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  클릭하거나 이미지를 드래그하세요 ({screenshots.length}/3)
                </p>
              )}
            </div>

            {/* 업로드된 스크린샷 미리보기 */}
            {screenshots.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {screenshots.map((src, i) => (
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`스크린샷 ${i + 1}`}
                      className="rounded-lg border aspect-video object-cover w-full"
                    />
                    {/* 호버 시 삭제 버튼 표시 */}
                    <button
                      type="button"
                      onClick={() => removeScreenshot(i)}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 핵심 메카닉 설명 */}
          <div className="space-y-2">
            <Label htmlFor="mechanic">핵심 메카닉</Label>
            <Textarea
              id="mechanic"
              placeholder="예: 화면을 탭하면 캐릭터가 점프하여 장애물을 피합니다."
              value={mechanic}
              onChange={(e) => setMechanic(e.target.value)}
              required
              rows={3}
            />
          </div>

          {/* 제출 버튼 */}
          <Button
            type="submit"
            className="w-full"
            disabled={!gameName || screenshots.length === 0 || !mechanic}
          >
            AI 분석 시작
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
