// The Lodestar / Vega mark: a gold eight-pointed star.
import { palette } from "../theme";

export default function StarMark({ size = 28, color = palette.star, className = "" }) {
  const cx = size / 2;
  const cy = size / 2;
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? size / 2 : size / 5;
    const a = (Math.PI / 8) * i - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden="true">
      <polygon points={pts.join(" ")} fill={color} />
    </svg>
  );
}
