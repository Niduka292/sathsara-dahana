export type LightshowDesign = "radial" | "grid" | "storm";

export type LightshowEffect =
  | "portal"
  | "warp"
  | "bass_drop"
  | "chorus"
  | "idle";

export interface LightshowState {
  design: LightshowDesign;
  effect: LightshowEffect;
  energy: number;
  bassEnergy: number;
  beat: boolean;
  active: boolean;
  updatedAt: number;
}

export interface LightshowMeta {
  audienceCount: number;
}

export const DEFAULT_LIGHTSHOW_STATE: LightshowState = {
  design: "radial",
  effect: "idle",
  energy: 0,
  bassEnergy: 0,
  beat: false,
  active: false,
  updatedAt: 0,
};

export interface DesignPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export const DESIGN_PALETTES: Record<LightshowDesign, DesignPalette> = {
  radial: {
    primary: "#E0AAFF",
    secondary: "#9D4EDD",
    accent: "#FFFFFF",
    background: "#000000",
  },
  grid: {
    primary: "#FF6010",
    secondary: "#3A0A00",
    accent: "#FFFBE0",
    background: "#000000",
  },
  storm: {
    primary: "#1D9E75",
    secondary: "#EF9F27",
    accent: "#FFFBE0",
    background: "#000000",
  },
};

export type OperatorDesignLabel = "Supernova" | "Hex Bloom" | "Plasma Veins";

export const OPERATOR_DESIGN_TO_STATE: Record<OperatorDesignLabel, LightshowDesign> = {
  "Supernova": "radial",
  "Hex Bloom": "grid",
  "Plasma Veins": "storm",
};

export const STATE_DESIGN_TO_OPERATOR: Record<LightshowDesign, OperatorDesignLabel> = {
  radial: "Supernova",
  grid: "Hex Bloom",
  storm: "Plasma Veins",
};

export function normalizeDesign(value: unknown): LightshowDesign {
  if (value === "radial" || value === "grid" || value === "storm") {
    return value;
  }
  if (
    value === "romance" ||
    value === "calm" ||
    value === "pulse" ||
    value === "ember" ||
    value === "past"
  ) {
    return "radial";
  }
  if (
    value === "wave" ||
    value === "surge" ||
    value === "energetic" ||
    value === "neon" ||
    value === "present"
  ) {
    return "grid";
  }
  if (
    value === "flash" ||
    value === "sync" ||
    value === "flashlight" ||
    value === "violet" ||
    value === "future"
  ) {
    return "storm";
  }
  return "radial";
}

/** @deprecated Use LightshowDesign */
export type LightshowEra = LightshowDesign;
