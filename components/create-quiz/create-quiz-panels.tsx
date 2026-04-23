"use client";

import { useState } from "react";
import { FileText, Sparkles, Upload, Link2, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { NeonButton } from "@/components/shared/neon-button";

/** Large left panel — textarea for pasting raw content with a live word
 *  counter and a "Clean Formatting" helper button. */
export function PasteTextPanel() {
  const [text, setText] = useState("");
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  return (
    <GlassCard className="flex flex-col rounded-2xl p-6 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
          <FileText className="h-6 w-6 text-[#F8ACFF]" />
          Paste Text
        </h2>
        <span className="rounded-full border border-[#7030EF] bg-[#7030EF]/10 px-3 py-1 font-['Space_Grotesk'] text-[11px] font-medium text-[#7030EF]">
          {wordCount} / 10,000 words
        </span>
      </div>

      <textarea
        className="min-h-[300px] grow resize-y rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-[#E2E2E2] placeholder-[#CBC3D8]/50 outline-none transition focus:border-[#DB1FFF] focus:ring-1 focus:ring-[#DB1FFF]"
        placeholder="Paste your article, study notes, or raw content here. The AI will extract key concepts to build your quiz..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-['Space_Grotesk'] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#CBC3D8] transition hover:bg-white/10 hover:text-white"
        >
          <Sparkles className="h-4 w-4" />
          Clean Formatting
        </button>
      </div>
    </GlassCard>
  );
}

/** Drop-zone card for uploading a PDF, DOCX, or TXT file. */
export function FileUploadPanel() {
  return (
    <GlassCard className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#DB1FFF]/50 bg-[#DB1FFF]/5 p-6 text-center transition hover:border-[#DB1FFF] hover:bg-[#DB1FFF]/10 hover:shadow-[inset_0_0_20px_rgba(219,31,255,0.2)]">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#DB1FFF]/20">
        <Upload className="h-10 w-10 text-[#DB1FFF]" />
      </div>
      <h3 className="mb-2 font-['Space_Grotesk'] text-xl font-semibold text-white">
        Upload Document
      </h3>
      <p className="mb-4 text-sm text-[#CBC3D8]">
        PDF, DOCX, or TXT (Max 10MB)
      </p>
      <NeonButton
        variant="outline"
        className="rounded-full px-6 py-2 text-[11px]"
      >
        Browse Files
      </NeonButton>
    </GlassCard>
  );
}

/** Input for importing content from a web URL. */
export function UrlImportPanel() {
  const [url, setUrl] = useState("");

  return (
    <GlassCard className="rounded-2xl p-6">
      <h3 className="mb-4 flex items-center gap-2 font-['Space_Grotesk'] text-xl font-semibold text-white">
        <Link2 className="h-5 w-5 text-[#F8ACFF]" />
        Import from URL
      </h3>
      <div className="relative">
        <input
          type="url"
          className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-4 pr-12 text-sm text-[#E2E2E2] placeholder-[#CBC3D8]/50 outline-none transition focus:border-[#DB1FFF] focus:ring-1 focus:ring-[#DB1FFF]"
          placeholder="https://example.com/article"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-[#7030EF] text-white transition hover:bg-[#7030EF]/80"
          aria-label="Import URL"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </GlassCard>
  );
}
