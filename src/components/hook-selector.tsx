/**
 * HookSelector — 광고 훅 시나리오 선택 컴포넌트
 *
 * AI가 생성한 3개의 훅(A/B/C)을 카드로 보여주고 선택하면 광고 생성 시작.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import { HookScenario } from "@/lib/types";

interface HookSelectorProps {
  hooks: HookScenario[];
  onSelect: (hook: HookScenario) => void;
}

// 훅별 색상 — A/B/C 시각 구분용
const HOOK_COLORS: Record<string, string> = {
  A: "bg-blue-500/10 text-blue-600 border-blue-200",
  B: "bg-green-500/10 text-green-600 border-green-200",
  C: "bg-purple-500/10 text-purple-600 border-purple-200",
};

export default function HookSelector({ hooks, onSelect }: HookSelectorProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5" />
        광고 훅 시나리오를 선택하세요
      </h2>

      {/* 모바일: 1열, 데스크탑: 3열 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hooks.map((hook) => (
          <Card key={hook.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={HOOK_COLORS[hook.id] || ""}>
                  훅 {hook.id}
                </Badge>
              </div>
              <CardTitle className="text-base">{hook.type}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {hook.scenario}
              </p>

              {/* CTA 미리보기 */}
              <div className="bg-muted rounded-md p-2 text-center">
                <span className="text-xs text-muted-foreground">CTA 미리보기</span>
                <p className="text-sm font-medium mt-1">{hook.cta}</p>
              </div>

              <Button onClick={() => onSelect(hook)} className="w-full" variant="outline">
                이 훅으로 생성
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
