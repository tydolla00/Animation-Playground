"use client";

import { useCallback, useRef, type PointerEvent, type RefObject } from "react";
import {
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

export type MagneticPointerConfig = {
  pullRadius: number;
  pullStrength: number;
  spring: { stiffness: number; damping: number; mass: number };
  /** Ring scale = 1 + min(hypot(sx, sy) / ringScaleDivisor, ringScaleMax) */
  ringScaleDivisor: number;
  ringScaleMax: number;
};

export type MagneticPointerState<T extends HTMLElement> = {
  targetRef: RefObject<T | null>;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  ringScale: MotionValue<number>;
  onPointerMove: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerLeave: () => void;
};

/**
 * Shared magnetic-pull logic: cursor offset → motion values → springs →
 * optional ring scale derived from displacement magnitude.
 */
export function useMagneticPointer<T extends HTMLElement>(
  config: MagneticPointerConfig,
): MagneticPointerState<T> {
  const {
    pullRadius,
    pullStrength,
    spring,
    ringScaleDivisor,
    ringScaleMax,
  } = config;

  const targetRef = useRef<T | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  const ringScale = useTransform([sx, sy] as const, ([vx, vy]) => {
    const r = Math.hypot(vx as number, vy as number);
    return 1 + Math.min(r / ringScaleDivisor, ringScaleMax);
  });

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const el = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < pullRadius) {
        x.set(dx * pullStrength);
        y.set(dy * pullStrength);
      } else {
        x.set(0);
        y.set(0);
      }
    },
    [pullRadius, pullStrength, x, y],
  );

  const onPointerLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    targetRef,
    sx,
    sy,
    ringScale,
    onPointerMove,
    onPointerLeave,
  };
}
