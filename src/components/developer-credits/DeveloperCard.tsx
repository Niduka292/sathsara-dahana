"use client";

import { useState } from "react";
import Image from "next/image";
import { Github, Linkedin, Mail, UserRound } from "lucide-react";
import type { Developer } from "./developers";
import styles from "./DeveloperCredits.module.css";

export default function DeveloperCard({ developer }: { developer: Developer }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const socials = [
    { label: "GitHub", href: developer.github, Icon: Github },
    { label: "LinkedIn", href: developer.linkedin, Icon: Linkedin },
    { label: "Gmail / Email", href: developer.email ? `mailto:${developer.email}` : "", Icon: Mail },
  ];

  return (
    <article className={styles.card}>
      <div className={styles.portraitStage}>
        <div className={styles.portrait}>
          {developer.image && failedImage !== developer.image ? (
            <Image
              src={developer.image}
              alt={`${developer.name} profile photo`}
              fill
              sizes="(max-width: 639px) 132px, 148px"
              loading="lazy"
              className={styles.photo}
              onError={() => setFailedImage(developer.image)}
            />
          ) : (
            <span className={styles.placeholder} role="img" aria-label={`${developer.name} profile photo placeholder`}>
              <UserRound size={42} strokeWidth={1} aria-hidden="true" />
            </span>
          )}
        </div>
      </div>
      <h3 className={styles.name}>{developer.name}</h3>
      <p className={styles.role}>{developer.role}</p>
      <div className={styles.socials}>
        {socials.map(({ label, href, Icon }) => href ? (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer"
            className={styles.social} aria-label={`${developer.name} ${label}`} title={label}>
            <Icon size={18} aria-hidden="true" />
          </a>
        ) : (
          <button key={label} type="button" disabled className={styles.social}
            aria-label={`${developer.name} ${label} link not yet provided`} title={`${label} link not yet provided`}>
            <Icon size={18} aria-hidden="true" />
          </button>
        ))}
      </div>
    </article>
  );
}
