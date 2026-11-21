/**
 * Constantes de movimento portadas do clone (docs/clone-analysis.md §2).
 * Os mesmos valores existem como CSS custom properties em src/styles/_tokens.scss.
 */
export const DUR_S = 0.4;
export const DUR_M = 0.8;
export const DUR_L = 1.2;
export const STAGGER = 0.1;
export const DELAY_REVEAL = 0.3;

/** Breakpoint "desktop" do clone: pins, scroll horizontal e parallax pesado só a partir daqui. */
export const DESKTOP_BP = 992;
export const DESKTOP_MQ = `(min-width: ${DESKTOP_BP}px)`;
export const MOBILE_MQ = `(max-width: ${DESKTOP_BP - 1}px)`;
export const POINTER_FINE_MQ = '(hover: hover) and (pointer: fine)';
export const REDUCED_MOTION_MQ = '(prefers-reduced-motion: reduce)';

/** Easings nomeados do clone (cubic-bezier), registrados com CustomEase. */
export const EASES = {
  InOut: '0.75,0,0.25,1',
  Out: '0.25,1,0.5,1',
  In: '0.5,0,0.75,0',
  Ease: '0.25,0.1,0.25,1',
  Write: '0.333,0,0.667,1',
  diveIn: '0.6,0,0,1',
  horScroll: '0.25,0,0.75,1',
} as const;

export type EaseName = keyof typeof EASES;

/** Duração total do loader CSS (keyframes em loader.component.scss). */
export const INTRO_DURATION_MS = 1500;

/** Easing do Lenis no clone: expo-out. */
export const lenisEasing = (t: number): number => Math.min(1, 1.001 - Math.pow(2, -10 * t));
