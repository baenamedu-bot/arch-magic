import { ShieldAlert } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="mt-10 rounded-lg border border-border bg-muted/40 px-4 py-3.5 flex items-start gap-3">
      <ShieldAlert
        className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0"
        strokeWidth={2}
      />
      <p className="text-xs text-muted-foreground leading-relaxed text-pretty">
        본 프롬프트로 생성되는 이미지는{" "}
        <span className="text-foreground font-medium">디자인 영감용</span>이며,
        실제 시공·인허가를 위해서는{" "}
        <span className="text-foreground font-medium">
          별도의 설계 검토(건폐율·용적률 등)
        </span>
        가 필요합니다.
      </p>
    </div>
  );
}
