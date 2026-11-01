"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Calendar, Orbit, Radio, X } from "lucide-react";
import styles from "./AsteroidNewsPopup.module.css";

// Survives client-side navigation, but resets on a full page refresh.
let newsPopupShown = false;

export default function AsteroidNewsPopup() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dismissButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || newsPopupShown) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let previousOverflow: string | undefined;

    const restoreScroll = () => {
      if (previousOverflow !== undefined) {
        document.body.style.overflow = previousOverflow;
        previousOverflow = undefined;
      }
    };

    const schedulePopup = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (newsPopupShown || dialog.open || !dialog.isConnected) return;
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialog.showModal();
        newsPopupShown = true;
        dismissButtonRef.current?.focus({ preventScroll: true });
      }, 450);
    };

    dialog.addEventListener("close", restoreScroll);
    window.addEventListener("sathsara:intro-complete", schedulePopup);
    // The intro may have finished before this component mounted.
    if (document.documentElement.dataset.introComplete === "true") {
      schedulePopup();
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("sathsara:intro-complete", schedulePopup);
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
      aria-labelledby="asteroid-news-title"
      aria-describedby="asteroid-news-description"
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

        <button
          type="button"
          className={styles.close}
          onClick={dismiss}
          aria-label="Close astronomical bulletin"
        >
          <X aria-hidden="true" size={20} />
        </button>

        <div className={styles.content}>
          <p className={styles.eyebrow}>
            <span /> Astronomical Bulletin
          </p>

          <p className={styles.kicker}>Near-Earth Object Report • October 23</p>
          <h2 id="asteroid-news-title" className={styles.title}>
            Asteroid<br />
            <span>2026 UA1</span>
          </h2>

          <ul className={styles.metrics} aria-label="Encounter telemetry">
            <li>
              <Orbit size={13} aria-hidden="true" /> 221,500 km
            </li>
            <li>
              <Calendar size={13} aria-hidden="true" /> October 23
            </li>
            <li>
              <Radio size={13} aria-hidden="true" /> Sub-Lunar Pass
            </li>
          </ul>

          <div id="asteroid-news-description" className={styles.newsBody}>
            <p>
              Astronomers are reporting the close approach of asteroid{" "}
              <strong className="font-semibold text-white">2026 UA1</strong>, a
              near-Earth object that passed approximately{" "}
              <strong className="font-semibold text-white">
                221,500 kilometres
              </strong>{" "}
              from Earth&apos;s centre on{" "}
              <strong className="font-semibold text-white">October 23</strong>.
              The object passed closer to Earth than the Moon&apos;s average
              orbital distance, drawing attention to the importance of
              monitoring near-Earth asteroids.
            </p>
            <p>
              Available tracking information indicates that the encounter did
              not pose a known impact threat to Earth. Although close approaches
              of this kind are not unprecedented, scientists continue to study
              such objects to improve their understanding of asteroid
              trajectories and the potential risks posed by near-Earth objects.
            </p>

            <div className={styles.anomalyBox}>
              <div className={styles.anomalyHeader}>
                <AlertTriangle size={13} aria-hidden="true" />
                <span>Monitoring Anomaly</span>
              </div>
              <p>
                Several astronomical monitoring systems begin reporting
                unexplained timestamp discrepancies following the encounter.
                Researchers are investigating the irregularities, although no
                connection to the asteroid has been established.
              </p>
            </div>
          </div>

          <button
            ref={dismissButtonRef}
            type="button"
            className={styles.cta}
            onClick={dismiss}
          >
            Acknowledge Bulletin
          </button>
        </div>

        <div className={styles.ticketFooter}>
          <span>Sathsara Dahana</span>
          <span>
            2026 <span aria-hidden="true">✦</span> Astronomical Dispatch
          </span>
        </div>
      </div>
    </dialog>
  );
}
