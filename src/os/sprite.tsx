/**
 * Pixel sprite renderer: each string row is one pixel row, each character a palette key.
 * "." (or any key missing from the palette) is transparent. Runs of the same colour are merged
 * and drawn as one <path> per colour. Rendered with crispEdges so it scales without smoothing.
 */
export type Palette = Record<string, string>;

export function Sprite({
  rows,
  palette,
  scale = 2,
  className,
  label,
}: {
  rows: readonly string[];
  palette: Palette;
  scale?: number;
  className?: string;
  /** When set the sprite is exposed as an image with this accessible name; otherwise aria-hidden. */
  label?: string;
}) {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  // One <path> per colour (each horizontal run is a 1px-high rectangle sub-path). Keeps the
  // DOM and the prerendered HTML small compared to one <rect> per run.
  const paths = new Map<string, string>();
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      const fill = palette[c];
      if (!fill) {
        x++;
        continue;
      }
      let run = 1;
      while (row[x + run] === c) run++;
      paths.set(fill, `${paths.get(fill) ?? ''}M${x} ${y}h${run}v1h-${run}z`);
      x += run;
    }
  });
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      shapeRendering="crispEdges"
      className={className}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true, focusable: false })}
    >
      {Array.from(paths, ([fill, d]) => (
        <path key={fill} d={d} fill={fill} />
      ))}
    </svg>
  );
}
