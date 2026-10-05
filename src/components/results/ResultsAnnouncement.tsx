"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, AudioLines, MicVocal, Music2, X } from "lucide-react";
import { useResultsRelease } from "@/hooks/useResultsRelease";
import { RESULTS_RELEASE_LABEL } from "@/src/lib/resultsRelease";
import styles from "./ResultsAnnouncement.module.css";
import CountdownSeconds from "./CountdownSeconds";

// Survives client-side navigation, but resets on a full page refresh.
let announcementShown = false;

export default function ResultsAnnouncement() {
  const { released, countdown } = useResultsRelease();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const resultsLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || announcementShown) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let previousOverflow: string | undefined;

    const restoreScroll = () => {
      if (previousOverflow !== undefined) {
        document.body.style.overflow = previousOverflow;
        previousOverflow = undefined;
      }
    };

    const scheduleAnnouncement = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (announcementShown || dialog.open || !dialog.isConnected) return;
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialog.showModal();
        announcementShown = true;
        resultsLinkRef.current?.focus({ preventScroll: true });
      }, 450);
    };

    dialog.addEventListener("close", restoreScroll);
    window.addEventListener("sathsara:intro-complete", scheduleAnnouncement);
    // The intro may have finished before this component mounted.
    if (document.documentElement.dataset.introComplete === "true") {
      scheduleAnnouncement();
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("sathsara:intro-complete", scheduleAnnouncement);
      dialog.removeEventListener("close", restoreScroll);
      dialog.close();
      restoreScroll();
    };
  }, []);

  const dismiss = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="results-announcement-title"
      aria-describedby="results-announcement-description"
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div className={styles.card}>
        <div aria-hidden="true" className={styles.spotlights} />
        <div aria-hidden="true" className={styles.clock}>
          <div className={styles.clockTicks} />
          <span className={styles.twelve}>XII</span>
          <span className={styles.three}>III</span>
          <span className={styles.six}>VI</span>
          <span className={styles.nine}>IX</span>
          <div className={styles.hourHand} />
          <div className={styles.minuteHand} />
          <div className={styles.clockPin} />
        </div>
        <button type="button" className={styles.close} onClick={dismiss} aria-label="Close results announcement">
          <X aria-hidden="true" size={20} />
        </button>

        <div className={styles.content}>
          <p className={styles.eyebrow}><span /> {released ? "The wait is over" : "The wait is almost over"}</p>

          <p className={styles.kicker}>{released ? "Your moment is here." : RESULTS_RELEASE_LABEL}</p>
          <h2 id="results-announcement-title" className={styles.title}>
            Results<br /><span>{released ? "are out!" : "are coming soon!"}</span>
          </h2>
          <p id="results-announcement-description" className={styles.description}>
            {released
              ? "The spotlight is calling. Check the Sathsara Dahana 2026 selection results and discover your next stage."
              : "The Sathsara Dahana 2026 selection results will be revealed soon. Stay tuned — your moment is almost here."}
          </p>

          {!released && (
            <p role="timer" aria-label="Time until results release" className="mt-4 font-cinzel text-sm tabular-nums tracking-wider text-[#fcd88b]">
              {countdown ? (
                <>
                  {`${String(countdown.days).padStart(2, "0")}d : ${String(countdown.hours).padStart(2, "0")}h : ${String(countdown.minutes).padStart(2, "0")}m : `}
                  <CountdownSeconds value={countdown.seconds} />s
                </>
              ) : "—d : —h : —m : —s"}
            </p>
          )}

          <ul className={styles.categories} aria-label="Result categories">
            <li><AudioLines size={14} aria-hidden="true" /> Dancing</li>
            <li><MicVocal size={14} aria-hidden="true" /> Singing</li>
            <li><Music2 size={14} aria-hidden="true" /> Instrumental</li>
          </ul>

          <Link ref={resultsLinkRef} href="/results" className={styles.cta} onClick={dismiss}>
            View results <ArrowUpRight size={21} aria-hidden="true" />
          </Link>
          <button type="button" className={styles.later} onClick={dismiss}>I&apos;ll explore first</button>
        </div>

        <div className={styles.ticketFooter}>
          <span>Sathsara Dahana</span>
          <span>2026 <span aria-hidden="true">✦</span> Selection results</span>
        </div>
      </div>
    </dialog>
  );
}
