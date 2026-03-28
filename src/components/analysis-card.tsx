/**
 * AnalysisCard — AI 분석 결과 표시 컴포넌트
 *
 * 색상 팔레트, 시각 스타일, 핵심 인터랙션, 주요 오브젝트, 분위기를 카드로 표시.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Sparkles } from "lucide-react";
import { AnalysisResult } from "@/lib/types";

interface AnalysisCardProps {
  analysis: AnalysisResult;
}

export default function AnalysisCard({ analysis }: AnalysisCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5" />
          AI 분석 결과
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 색상 팔레트 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">색상 팔레트</span>
          </div>
          <div className="flex gap-2">
            {analysis.palette.map((color, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: color }} />
                <span className="text-xs text-muted-foreground">{color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 스타일 */}
        <div>
          <span className="text-sm font-medium">스타일</span>
          <p className="text-sm text-muted-foreground mt-1">{analysis.style}</p>
        </div>

        {/* 핵심 인터랙션 */}
        <div>
          <span className="text-sm font-medium">핵심 인터랙션</span>
          <p className="text-sm text-muted-foreground mt-1">{analysis.coreInteraction}</p>
        </div>

        {/* 주요 오브젝트 (뱃지 태그) */}
        <div>
          <span className="text-sm font-medium">주요 오브젝트</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {analysis.keyObjects.map((obj, i) => (
              <Badge key={i} variant="secondary">{obj}</Badge>
            ))}
          </div>
        </div>

        {/* 분위기 */}
        <div>
          <span className="text-sm font-medium">분위기</span>
          <p className="text-sm text-muted-foreground mt-1">{analysis.mood}</p>
        </div>
      </CardContent>
    </Card>
  );
}
