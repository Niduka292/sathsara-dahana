"use client";

import { ArrowRight } from "lucide-react";
import { Dialog } from "radix-ui";
import DeveloperModal from "./DeveloperModal";
import styles from "./DeveloperCredits.module.css";

export default function DeveloperCredits() {
  return (
    <Dialog.Root>
      <div className={styles.credit}>
        <p className={styles.creditLabel}>Designed &amp; Developed by</p>
        <Dialog.Trigger className={styles.trigger}>
          <span>Web Development Team</span>
          <ArrowRight size={15} aria-hidden="true" />
        </Dialog.Trigger>
      </div>
      <DeveloperModal />
    </Dialog.Root>
  );
}
