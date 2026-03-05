/**
 * return a value that has been rounded to a set precision
 */
export const round = (value: number, precision = 3): number =>
  parseFloat(value.toFixed(precision))

/**
 * return a value that has been limited between min & max
 */
export const clamp = (value: number, min = 0, max = 100): number =>
  Math.min(Math.max(value, min), max)

/**
 * return a value that has been re-mapped according to the from/to ranges
 * e.g. adjust(10, 0, 100, 100, 0) = 90
 */
export const adjust = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number => round(toMin + (toMax - toMin) * ((value - fromMin) / (fromMax - fromMin)))
