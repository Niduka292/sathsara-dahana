import { toBlob } from "html-to-image";
import type { SelectionResult } from "@/src/data/dancingCrewResults";
import { getDownloadFilename } from "@/src/lib/resultPresentation";

const EXPORT_WIDTH = 1080;

async function waitForCardAssets(card: HTMLElement) {
  await document.fonts.ready;
  const images = Array.from(card.querySelectorAll("img"));
  await Promise.all(images.map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => resolve(), { once: true });
    });
  }));
}

function isAppleMobileDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

async function shareOnAppleMobile(blob: Blob, filename: string) {
  if (!isAppleMobileDevice() || typeof navigator.share !== "function") return false;

  const file = new File([blob], filename, { type: "image/png" });
  if (typeof navigator.canShare === "function" && !navigator.canShare({ files: [file] })) return false;

  try {
    await navigator.share({
      files: [file],
      title: "Sathsara Dahana 2026 Result Card",
    });
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return true;
    return false;
  }
}

export async function downloadResultCard(card: HTMLElement, result: SelectionResult) {
  await waitForCardAssets(card);
  card.dataset.exporting = "true";

  let blob: Blob | null = null;
  try {
    const renderWidth = card.offsetWidth;
    const renderHeight = card.offsetHeight;
    if (!renderWidth || !renderHeight) throw new Error("The result card has no renderable dimensions.");

    blob = await toBlob(card, {
      width: renderWidth,
      height: renderHeight,
      pixelRatio: EXPORT_WIDTH / renderWidth,
      cacheBust: true,
      backgroundColor: "#020914",
      style: {
        animation: "none",
        transition: "none",
        transform: "none",
      },
    });
  } finally {
    delete card.dataset.exporting;
  }

  if (!blob) throw new Error("The result card could not be generated.");

  const filename = getDownloadFilename(result);
  if (await shareOnAppleMobile(blob, filename)) return;

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}
