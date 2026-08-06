"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function LightshowJoinPage() {
  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/lightshow`);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030308] px-6 py-10 text-white">
      <div className="w-full max-w-3xl text-center">
        <p className="font-[family-name:var(--font-orbitron)] text-xs uppercase tracking-[0.45em] text-blue-300/75">
          Sathsara Dahana · Light Sync
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-orbitron)] text-4xl uppercase tracking-[0.16em] md:text-5xl">
          Join The Light Show
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
          Scan to sync your phone screen with the live performance.
        </p>

        <div className="mx-auto mt-10 inline-flex rounded-3xl border border-blue-400/20 bg-white p-6 shadow-[0_0_60px_rgba(59,130,246,0.25)]">
          {joinUrl ? (
            <QRCodeSVG
              value={joinUrl}
              size={280}
              bgColor="#FFFFFF"
              fgColor="#030308"
              level="M"
              includeMargin
            />
          ) : (
            <div className="flex h-[280px] w-[280px] items-center justify-center bg-white text-black/40">
              Loading QR...
            </div>
          )}
        </div>

        <p className="mt-8 break-all font-[family-name:var(--font-orbitron)] text-lg uppercase tracking-[0.12em] text-blue-100 md:text-2xl">
          {joinUrl || "/lightshow"}
        </p>
        <p className="mt-4 text-sm text-white/45">
          Raise your brightness after joining.
        </p>
      </div>
    </div>
  );
}
