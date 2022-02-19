export const MATCH = '+';
export const NO_MATCH = '-';
export const CONTAINED = '?';

export function isWin(match) {
  return match.every(field => field === MATCH);
}