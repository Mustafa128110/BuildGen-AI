export function snapToGrid(value: number, enabled: boolean, gridSize = 10) {
  return enabled ? Math.round(value / gridSize) * gridSize : value;
}
export const pxToMeters = (px: number) => (px / 50).toFixed(2);
export const calculateAreaM2 = (widthPx: number, heightPx: number) => ((widthPx / 50) * (heightPx / 50)).toFixed(1);
