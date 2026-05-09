"use client";

import { useState } from "react";
import { motion, type MotionValue } from "motion/react";
import {
  type MagneticPointerConfig,
  useMagneticPointer,
} from "./use-magnetic-pointer";

/** Full-screen exhibit tuning */
const DEMO_CONFIG = {
  pullRadius: 140,
  pullStrength: 0.35,
  spring: { stiffness: 220, damping: 22, mass: 0.6 },
  ringScaleDivisor: 600,
  ringScaleMax: 0.08,
} as const satisfies MagneticPointerConfig;

/** Bento tile — snappier spring, tighter pull radius, stronger offset */
const PREVIEW_CONFIG = {
  pullRadius: 110,
  pullStrength: 0.4,
  spring: { stiffness: 280, damping: 24, mass: 0.5 },
  ringScaleDivisor: 400,
  ringScaleMax: 0.06,
} as const satisfies MagneticPointerConfig;

export default function MagneticButton() {
  const [pressed, setPressed] = useState(false);
  const { targetRef, sx, sy, ringScale, onPointerMove, onPointerLeave } =
    useMagneticPointer<HTMLButtonElement>(DEMO_CONFIG);

  return (
    <div
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative min-h-screen w-full grid place-items-center bg-surface text-foreground overflow-hidden"
    >
      <MagnetSpotlight
        gradient="radial-gradient(ellipse 60% 50% at 50% 55%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 75%)"
      />

      <MagnetRings ringScale={ringScale} variant="demo" />

      <motion.button
        ref={targetRef}
        type="button"
        style={{ x: sx, y: sy }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        animate={{ scale: pressed ? 0.97 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className="relative font-serif uppercase tracking-[0.16em] text-[14px] text-foreground border border-foreground px-12 py-5 bg-background/30 backdrop-blur-[1px]"
      >
        Hover Me
      </motion.button>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 font-serif italic text-[15px] text-muted-foreground text-center max-w-md">
        Move your cursor near the button. Notice how it leans toward you, then
        eases back when you withdraw.
      </div>
    </div>
  );
}

/**
 * Tile-sized live preview. Same magnetic math as the full demo via
 * `useMagneticPointer` + `MagnetRings`; centre is a non-interactive `div` so
 * clicks pass through to the parent tile `<Link>`.
 */
export function Preview() {
  const { targetRef, sx, sy, ringScale, onPointerMove, onPointerLeave } =
    useMagneticPointer<HTMLDivElement>(PREVIEW_CONFIG);

  return (
    <div
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative h-full w-full grid place-items-center bg-surface text-foreground overflow-hidden"
    >
      <MagnetSpotlight
        gradient="radial-gradient(ellipse 55% 45% at 50% 55%, color-mix(in oklab, var(--primary) 20%, transparent), transparent 75%)"
      />

      <MagnetRings ringScale={ringScale} variant="preview" />

      <motion.div
        ref={targetRef}
        style={{ x: sx, y: sy }}
        className="relative font-serif uppercase tracking-[0.16em] text-[10px] text-foreground border border-foreground px-6 py-2.5 bg-background/30 backdrop-blur-[1px] pointer-events-none"
      >
        Hover Me
      </motion.div>
    </div>
  );
}

function MagnetSpotlight({ gradient }: { gradient: string }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{ background: gradient }}
    />
  );
}

function MagnetRings({
  ringScale,
  variant,
}: {
  ringScale: MotionValue<number>;
  variant: "demo" | "preview";
}) {
  if (variant === "demo") {
    return (
      <motion.div
        aria-hidden
        style={{ scale: ringScale }}
        className="absolute size-[420px] rounded-full"
      >
        <div className="size-full rounded-full border border-foreground/8" />
        <div className="absolute inset-8 rounded-full border border-foreground/6" />
        <div className="absolute inset-16 rounded-full border border-foreground/4" />
      </motion.div>
    );
  }

  return (
    <motion.div
      aria-hidden
      style={{ scale: ringScale }}
      className="absolute size-[220px] rounded-full"
    >
      <div className="size-full rounded-full border border-foreground/10" />
      <div className="absolute inset-5 rounded-full border border-foreground/8" />
      <div className="absolute inset-10 rounded-full border border-foreground/6" />
    </motion.div>
  );
}
