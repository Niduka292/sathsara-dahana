"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function CountdownSeconds({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const digits = String(value).padStart(2, "0");

  if (reduceMotion) return <span>{digits}</span>;

  return (
    <span className="relative inline-grid w-[2ch] overflow-hidden align-bottom">
      <span className="sr-only">{digits}</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          aria-hidden="true"
          className="col-start-1 row-start-1"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {digits}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
