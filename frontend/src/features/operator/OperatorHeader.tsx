import type { ReactNode } from "react";
import kadaGoLogo from "@/assets/ab63915e-4a2e-4c2e-87d3-7e3f12ff3cdb-removebg-preview.png";

export default function OperatorHeader({ title, subtitle, onBack, right }: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <header className="shrink-0 border-b border-black/10 bg-white px-4 pt-4 pb-3">
      <div className="flex items-center gap-3">
        {onBack && (
          <button type="button" onClick={onBack} aria-label="Back"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/5 transition-opacity active:opacity-70">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D1828" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
        )}
        <img src={kadaGoLogo} alt="KadaGo" className="w-[38px] shrink-0" />
        <div className="min-w-0 flex-1">
          <h1 className="text-[14px] font-black leading-tight text-[#0D1828]">{title}</h1>
          {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
