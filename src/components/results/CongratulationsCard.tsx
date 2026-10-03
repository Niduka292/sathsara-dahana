"use client";

import { forwardRef } from "react";
import Image from "next/image";
import DahanaLogo from "@/assets/dahana-logo-no-bg.png";
import type { SelectionResult } from "@/src/data/dancingCrewResults";
import { articleForRole, getResultHighlight } from "@/src/lib/resultPresentation";
import styles from "./CongratulationsCard.module.css";

type CongratulationsCardProps = {
  result: SelectionResult;
};

const stars = [
  [15, 17, 0.32], [79, 13, 0.25], [29, 26, 0.4], [34, 29, 0.22],
  [27, 33, 0.3], [69, 27, 0.45], [74, 31, 0.2], [72, 38, 0.28],
  [24, 44, 0.34], [29, 48, 0.18], [77, 49, 0.4], [71, 53, 0.23],
  [34, 62, 0.3], [62, 65, 0.2], [25, 76, 0.35], [33, 78, 0.22],
  [39, 81, 0.45], [48, 84, 0.2], [59, 80, 0.32], [65, 83, 0.18],
  [72, 78, 0.4], [79, 86, 0.24],
] as const;

const clockHours = [
  ["XII", 47, 10], ["III", 88, 47], ["VI", 54, 88], ["IX", 12, 54],
] as const;

const CongratulationsCard = forwardRef<HTMLDivElement, CongratulationsCardProps>(function CongratulationsCard(
  { result },
  ref,
) {
  const isReserve = result.status === "reserve";
  const isInstrumental = result.category === "instrumental";
  const role = getResultHighlight(result);
  const categoryLabel = result.category === "singing" ? "Singing" : result.category === "dancing" ? "Dancing" : "Instrumental";

  return (
    <div
      ref={ref}
      className={`${styles.card} ${isReserve ? styles.reserve : ""}`}
      data-result-card
      data-category={result.category}
      data-long-name={result.name.length > 45 || undefined}
      data-long-role={role.length > 20 || undefined}
      aria-label={`${categoryLabel} result card for ${result.name}`}
    >
      <div className={styles.nebula} aria-hidden="true" />
      <div className={styles.texture} aria-hidden="true" />
      <div className={styles.titleHalo} aria-hidden="true" />
      <div className={styles.stars} aria-hidden="true">
        {stars.map(([left, top, size], index) => (
          <span key={index} style={{ left: `${left}%`, top: `${top}%`, width: `${size}cqw`, height: `${size}cqw` }} />
        ))}
      </div>

      <div className={styles.portal} aria-hidden="true">
        <span className={styles.portalOuter} />
        <span className={styles.portalClock} />
        <span className={styles.portalOrbitOne} />
        <span className={styles.portalOrbitTwo} />
        <span className={styles.portalCore} />
        <span className={styles.fractureSegment} />
        {clockHours.map(([hour, left, top]) => (
          <span key={hour} className={styles.clockHour} style={{ left: `${left}%`, top: `${top}%` }}>{hour}</span>
        ))}
      </div>
      <div className={styles.timeEcho} aria-hidden="true" />

      <svg className={styles.trails} viewBox="0 0 1080 1350" preserveAspectRatio="none" aria-hidden="true">
        <path d="M117 686 C271 644 348 718 522 690 S812 637 962 677" fill="none" stroke="#a8b7d5" strokeWidth="1" opacity="0.1" />
        <path d="M127 680 C281 638 358 712 532 684 S822 631 972 671" fill="none" stroke="#afcee9" strokeWidth="1.5" opacity="0.35" />
        <path d="M138 674 C292 632 369 706 543 678 S833 625 983 665" fill="none" stroke="#a3d8ef" strokeWidth="1" opacity="0.15" />
        <circle cx="282" cy="669" r="2" fill="#d5e7ff" opacity="0.48" />
        <circle cx="773" cy="660" r="1.5" fill="#d5e7ff" opacity="0.37" />
      </svg>

      <svg className={styles.landscape} viewBox="0 0 1080 1350" preserveAspectRatio="none" aria-hidden="true">
        <path d="M123 963 C324 905 483 1024 704 961 S893 927 968 935" fill="none" stroke="#8cafdc" strokeWidth="1.4" opacity="0.21" />
        <path d="M62 1047 C284 963 469 1107 735 1028 S919 1005 1018 982" fill="none" stroke="#aecbe6" strokeWidth="1.8" opacity="0.4" />
        <path d="M101 1057 C314 976 489 1119 751 1040 S906 1020 957 1016" fill="none" stroke="#91bbd6" strokeWidth="1" opacity="0.15" />
        <path d="M184 1111 C400 1056 553 1168 825 1093" fill="none" stroke="#a9b8db" strokeWidth="1.2" opacity="0.24" />
        <path d="M135 1190 C362 1118 663 1230 946 1147" fill="none" stroke="#8db6d9" strokeWidth="1" opacity="0.18" />

        <path d="M165 1090 L222 1090 Q232 1090 237 1082 L243 1097 L250 1078 L257 1104 L264 1083 Q272 1091 282 1090 C345 1089 379 1076 424 1080 L591 1080 C710 1080 744 1112 910 1064" fill="none" stroke="#c1deed" strokeWidth="1.7" opacity="0.38" />
        <path d="M390 1072 Q421 1069 446 1072 L596 1072 M407 1088 L592 1088 M426 1096 L574 1096" fill="none" stroke="#b8c9e1" strokeWidth="1" opacity={isInstrumental ? "0.3" : "0.14"} />
        <path d="M498 1087 L498 1067 Q509 1071 510 1079 M553 1079 L553 1060" fill="none" stroke="#d2dcec" strokeWidth="1.5" opacity="0.25" />
        <ellipse cx="495" cy="1087" rx="4" ry="2.7" fill="#d2dcec" opacity="0.25" />
        <ellipse cx="550" cy="1079" rx="4" ry="2.7" fill="#d2dcec" opacity="0.25" />

        {result.category === "dancing" ? (
          <path d="M196 1150 C319 1166 377 1015 558 1033 S756 1139 884 1095" fill="none" stroke="#abc7e3" strokeWidth="1.4" opacity="0.24" />
        ) : result.category === "singing" ? (
          <path d="M307 1114 Q321 1114 326 1108 L333 1120 L340 1100 L347 1127 L354 1105 L361 1119 L368 1111 Q377 1114 393 1114" fill="none" stroke="#c0dceb" strokeWidth="1.3" opacity="0.32" />
        ) : null}
        <circle cx="342" cy="1040" r="2" fill="#d7e5f4" opacity="0.6" />
        <circle cx="333" cy="1044" r="1.7" fill="#adc4e3" opacity="0.16" />
        <circle cx="352" cy="1037" r="1.5" fill="#bfe5f2" opacity="0.24" />
        <circle cx="756" cy="1095" r="1.7" fill="#e0d5b7" opacity="0.43" />
      </svg>

      <div className={styles.reflection} aria-hidden="true" />
      <div className={styles.mist} aria-hidden="true" />

      <div className={styles.frame} aria-hidden="true" />
      <div className={styles.innerFrame} aria-hidden="true" />
      <i className={`${styles.corner} ${styles.cornerTopLeft}`} aria-hidden="true" />
      <i className={`${styles.corner} ${styles.cornerTopRight}`} aria-hidden="true" />
      <i className={`${styles.corner} ${styles.cornerBottomLeft}`} aria-hidden="true" />
      <i className={`${styles.corner} ${styles.cornerBottomRight}`} aria-hidden="true" />

      <div className={styles.content}>
        <header className={styles.eventHeader}>
          <Image
            src={DahanaLogo}
            alt="Sathsara Dahana logo"
            className={styles.eventLogo}
            loading="eager"
            unoptimized
          />
          <p className={styles.eventName}>Sathsara Dahana</p>
          <p className={styles.year}>2026</p>
          <div className={styles.divider}><span>✦</span></div>
          <p className={styles.tagline}>A Musical Journey Through Time</p>
        </header>

        <main className={styles.mainContent}>
          <p className={styles.eyebrow}>{isReserve ? "Reserve Performer" : "Official Selection"}</p>
          <h2 id="result-modal-title" className={styles.congratulations}>
            {isReserve ? "Your Journey Continues" : "Congratulations"}
          </h2>
          <p id="result-modal-description" className={styles.selectionLine}>
            {isReserve
              ? "Your performance stood out to us"
              : isInstrumental
                ? `You have been selected as ${articleForRole(role)}`
                : "You have been selected for the"}
          </p>

          <div className={styles.roleRow}>
            <span />
            <p className={styles.role}>{role}</p>
            <span />
          </div>

          <p className={styles.orchestraLine}>
            {isReserve
              ? "Reserve Performers · Sathsara Dahana 2026"
              : isInstrumental
                ? "In the Sathsara Dahana 2026 Orchestra"
                : "Sathsara Dahana 2026"}
          </p>

          <section className={styles.namePanel} aria-label="Participant name">
            <p className={styles.participantName}>{result.name}</p>
          </section>

          <section className={styles.indexPanel} aria-label="Index number">
            <p className={styles.panelLabel}>Index Number</p>
            <p className={styles.indexNumber}>{result.indexNumber}</p>
          </section>

          {isReserve ? (
            <p className={styles.reserveNote}>You have been placed on our Reserve Performers list and may be considered for future opportunities.</p>
          ) : null}
        </main>

      </div>
    </div>
  );
});

export default CongratulationsCard;
