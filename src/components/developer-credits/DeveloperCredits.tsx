"use client";

import { ArrowRight } from "lucide-react";
import { Dialog } from "radix-ui";
import DeveloperModal from "./DeveloperModal";
import styles from "./DeveloperCredits.module.css";

export default function DeveloperCredits() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className={styles.button}>
        <span className={styles.label}>Designed &amp; Developed by</span>
        <span className={styles.team}>Web Development Team</span>
        <ArrowRight size={13} className={styles.arrow} aria-hidden="true" />
      </Dialog.Trigger>
      <DeveloperModal />
    </Dialog.Root>
  );
}
