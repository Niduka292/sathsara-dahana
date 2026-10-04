"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import DeveloperCard from "./DeveloperCard";
import { developers } from "./developers";
import styles from "./DeveloperCredits.module.css";

export default function DeveloperModal() {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className={styles.overlay} />
      <Dialog.Content className={styles.modal}>
        <div className={styles.toolbar}>
          <Dialog.Close className={styles.close} aria-label="Close developer credits">
            <X size={20} aria-hidden="true" />
          </Dialog.Close>
        </div>
        <div className={styles.scrollArea}>
          <header className={styles.header}>
            <p className={styles.eyebrow}><span aria-hidden="true" />THE CREATORS<span aria-hidden="true" /></p>
            <Dialog.Title className={styles.title}>Web Development Team</Dialog.Title>
            <Dialog.Description className={styles.subtitle}>
              The team behind the digital experience of Sathsara Dahana 2026.
            </Dialog.Description>
          </header>
          <ul className={styles.grid} data-count={developers.length} aria-label="Web development team members">
            {developers.map((developer) => (
              <li key={developer.id} className={styles.gridItem}>
                <DeveloperCard developer={developer} />
              </li>
            ))}
          </ul>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
