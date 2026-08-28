export type PartKey = "decks" | "trucks" | "wheels" | "grips";

export const DECK_LEN = 3.2;
export const KICK_START = 0.95;
export const KICK_H = 0.34;
export const CONCAVE = 0.05;
export const DECK_THICK = 0.036;
export const TAPER = 0.5;
export const WAIST = 0.045;

export interface PartLabel {
  key: PartKey;
  name: string;
  price: number;
}

export interface BoardConfig {
  deckWidth: number;
  deckImage: string | null;
  axleLen: number;
  wheelRadius: number;
  wheelColor: string;
  hasGrip: boolean;
  exploded: boolean;
  autoRotate: boolean;
  showGraphic: boolean;
  resetKey: number;
  labels: PartLabel[];
}