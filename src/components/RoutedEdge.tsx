import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from "@xyflow/react";
import type { RoutedEdgeData } from "../lib/layout";

const R = 12; // Eckenradius

/** Polylinie mit abgerundeten Ecken */
function toPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], b = pts[i], c = pts[i + 1];
    const l1 = Math.hypot(b.x - a.x, b.y - a.y);
    const l2 = Math.hypot(c.x - b.x, c.y - b.y);
    const r = Math.min(R, l1 / 2, l2 / 2);
    const p1 = { x: b.x - ((b.x - a.x) / l1) * r, y: b.y - ((b.y - a.y) / l1) * r };
    const p2 = { x: b.x + ((c.x - b.x) / l2) * r, y: b.y + ((c.y - b.y) / l2) * r };
    d += ` L${p1.x} ${p1.y} Q${b.x} ${b.y} ${p2.x} ${p2.y}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L${last.x} ${last.y}`;
}

/** Mitte des längsten Teilstücks, falls ELK keine Label-Position liefert */
function longestMid(pts: { x: number; y: number }[]) {
  let best = { len: -1, x: pts[0].x, y: pts[0].y };
  for (let i = 1; i < pts.length; i++) {
    const len = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (len > best.len) best = { len, x: (pts[i].x + pts[i - 1].x) / 2, y: (pts[i].y + pts[i - 1].y) / 2 };
  }
  return best;
}

export default function RoutedEdge({ id, data, style, markerEnd, label, labelStyle }: EdgeProps) {
  const pts = (data as RoutedEdgeData | undefined)?.points;
  if (!pts || pts.length < 2) return null;
  const pos = (data as RoutedEdgeData).labelPos ?? longestMid(pts);
  return (
    <>
      <BaseEdge id={id} path={toPath(pts)} style={style} markerEnd={markerEnd} />
      {typeof label === "string" && (
        <EdgeLabelRenderer>
          <div
            className="edge-label nodrag nopan"
            style={{ transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`, ...(labelStyle as object) }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
