export const INITIAL_TIME_LIMIT_MS = 15_000;
export const GUESS2_SEEK_MS        = 15_000;
export const GUESS2_TIME_LIMIT_MS  = 30_000;
export const GUESS3_SEEK_MS        = 30_000;
export const GUESS3_TIME_LIMIT_MS  = 90_000;
export const PLAYER_VOLUME         = 0.25;

export const FEEDBACK_TEXTS = [
  `+${(GUESS2_TIME_LIMIT_MS - INITIAL_TIME_LIMIT_MS) / 1000} Sekunder`,
  "Albumbild!",
  `+${(GUESS3_TIME_LIMIT_MS - GUESS2_TIME_LIMIT_MS) / 1000} Sekunder`,
];