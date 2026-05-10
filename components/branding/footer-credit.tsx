import { BRAND } from "./brand-constants";

export function FooterCredit() {
  return (
    <footer className="mt-20 border-t border-border bg-muted/30">
      <div className="container max-w-6xl py-7">
        <p className="text-center text-xs text-muted-foreground tracking-tightish">
          Powered by{" "}
          <span className="font-medium text-foreground">{BRAND.studio}</span>
          <span className="mx-1.5 text-muted-foreground/50">·</span>
          제작:{" "}
          <span className="font-medium text-foreground">{BRAND.creator}</span>
          <span className="mx-1.5 text-muted-foreground/50">·</span>
          <a
            href={BRAND.website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {BRAND.websiteLabel}
          </a>
        </p>
      </div>
    </footer>
  );
}
