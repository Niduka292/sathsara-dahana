"use client";

import { useEffect } from "react";
import {
  useBeatDetection,
  type AudioInputDevice,
} from "@/hooks/useBeatDetection";
import type { LightshowDesign } from "@/lib/lightshow/types";

interface BeatDetectorProps {
  enabled: boolean;
  design: LightshowDesign;
  hexBloomColor?: string;
  manualEnergy: number;
  manualMode: boolean;
  active: boolean;
  deviceId?: string;
  inputGain?: number;
  noiseGate?: number;
  monitorAudio?: boolean;
  onEnergyChange?: (
    energy: number,
    bassEnergy: number,
    pitchClass: number,   // 0–11  (C=0 … B=11); -1 when no pitch detected
    pitchHeight: number,  // 0–1   (low → high), smoothed
    leftEnergy: number,   // 0–100 stereo Left
    rightEnergy: number,  // 0–100 stereo Right
    channelCount: number, // detected hardware channel count
  ) => void;
  onError?: (message: string | null) => void;
  onDevicesChange?: (
    devices: AudioInputDevice[],
    activeDeviceLabel: string | null,
    refreshDevices: (requestPermission?: boolean) => Promise<void>,
  ) => void;
}

export default function BeatDetector({
  enabled,
  design,
  hexBloomColor,
  manualEnergy,
  manualMode,
  active,
  deviceId,
  inputGain,
  noiseGate,
  monitorAudio,
  onEnergyChange,
  onError,
  onDevicesChange,
}: BeatDetectorProps) {
  const {
    lastEnergy,
    lastBassEnergy,
    lastLeftEnergy,
    lastRightEnergy,
    lastPitchClass,
    lastPitchHeight,
    channelCount,
    error,
    devices,
    activeDeviceLabel,
    refreshDevices,
  } = useBeatDetection({
    enabled,
    design,
    hexBloomColor,
    manualEnergy,
    manualMode,
    active,
    deviceId,
    inputGain,
    noiseGate,
    monitorAudio,
  });

  useEffect(() => {
    onDevicesChange?.(devices, activeDeviceLabel, refreshDevices);
  }, [devices, activeDeviceLabel, refreshDevices, onDevicesChange]);

  useEffect(() => {
    onEnergyChange?.(
      lastEnergy,
      lastBassEnergy,
      lastPitchClass,
      lastPitchHeight,
      lastLeftEnergy,
      lastRightEnergy,
      channelCount,
    );
  }, [
    lastEnergy,
    lastBassEnergy,
    lastPitchClass,
    lastPitchHeight,
    lastLeftEnergy,
    lastRightEnergy,
    channelCount,
    onEnergyChange,
  ]);

  useEffect(() => {
    onError?.(error);
  }, [error, onError]);

  return null;
}
