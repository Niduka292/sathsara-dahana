"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import type { SelectionResult } from "@/src/data/dancingCrewResults";
import { downloadResultCard } from "@/src/lib/downloadResultCard";

type DownloadCardButtonProps = {
  result: SelectionResult;
};

export default function DownloadCardButton({ result }: DownloadCardButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setError("");
    try {
      await downloadResultCard(result);
    } catch {
      setError("We could not create the image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-300/30 bg-blue-500/20 px-4 font-cinzel text-[9px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_24px_rgba(59,130,246,0.12)] transition hover:border-blue-200/55 hover:bg-blue-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-wait disabled:opacity-70 min-[390px]:px-5 min-[390px]:text-[10px] min-[390px]:tracking-[0.18em] sm:text-xs"
      >
        {isDownloading ? <LoaderCircle aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin" /> : <Download aria-hidden="true" className="h-4 w-4 shrink-0" />}
        {isDownloading ? "Creating Image" : result.status === "reserve" ? "Download Reserve Card" : "Download Congratulations Card"}
      </button>
      {error ? <p className="mt-3 text-xs text-rose-200/80" role="alert">{error}</p> : null}
    </div>
  );
}

