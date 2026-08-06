import { DESIGN_PALETTES, type DesignPalette, type LightshowDesign } from "./types";

export function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (channel: number) =>
    Math.round(channel).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function lerpColor(from: string, to: string, t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  return rgbToHex(
    r1 + (r2 - r1) * clamped,
    g1 + (g2 - g1) * clamped,
    b1 + (b2 - b1) * clamped,
  );
}

export function interpolateDesignPalette(
  fromDesign: LightshowDesign,
  toDesign: LightshowDesign,
  progress: number,
): DesignPalette {
  const from = DESIGN_PALETTES[fromDesign];
  const to = DESIGN_PALETTES[toDesign];
  return {
    primary: lerpColor(from.primary, to.primary, progress),
    secondary: lerpColor(from.secondary, to.secondary, progress),
    accent: lerpColor(from.accent, to.accent, progress),
    background: lerpColor(from.background, to.background, progress),
  };
}

export function applyDesignCssVariables(
  element: HTMLElement,
  palette: DesignPalette,
) {
  element.style.setProperty("--show-primary", palette.primary);
  element.style.setProperty("--show-secondary", palette.secondary);
  element.style.setProperty("--show-accent", palette.accent);
  element.style.setProperty("--show-background", palette.background);
}
