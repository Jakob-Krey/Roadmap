import ELK from "elkjs/lib/elk.bundled.js";
import type { Edge, Node } from "@xyflow/react";

const elk = new ELK();

const GROUP_PADDING = { top: 56, left: 24, bottom: 24, right: 24 };

/**
 * Berechnet Positionen per elkjs (layered, links nach rechts).
 * Knoten mit `parentId` werden innerhalb ihrer Phasen-Gruppe angeordnet;
 * die Größen der Karten kommen aus den im Browser gemessenen Werten.
 */
export interface LayoutOptions {
  /** Abstand zwischen den Spalten (Platz für Kantenbeschriftungen) */
  layerSpacing?: number;
  nodeSpacing?: number;
  direction?: "RIGHT" | "DOWN";
  /** Optional: Knoten-id → Spalte, erzwingt die Reihenfolge von links nach rechts */
  partitions?: Record<string, number>;
}

export async function layoutNodes(
  nodes: Node[],
  edges: Edge[],
  opts: LayoutOptions = {},
): Promise<Node[]> {
  const groups = nodes.filter((n) => n.type === "phase");
  const cards = nodes.filter((n) => n.type !== "phase");

  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": opts.direction ?? "RIGHT",
      "elk.hierarchyHandling": "INCLUDE_CHILDREN",
      "elk.spacing.nodeNode": String(opts.nodeSpacing ?? 32),
      "elk.layered.spacing.nodeNodeBetweenLayers": String(opts.layerSpacing ?? 90),
      "elk.layered.spacing.edgeNodeBetweenLayers": "30",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.crossingMinimization.semiInteractive": "true",
      ...(opts.partitions ? { "elk.partitioning.activate": "true" } : {}),
    },
    children: groups.map((g) => ({
      id: g.id,
      layoutOptions: {
        "elk.padding": `[top=${GROUP_PADDING.top},left=${GROUP_PADDING.left},bottom=${GROUP_PADDING.bottom},right=${GROUP_PADDING.right}]`,
      },
      children: cards
        .filter((c) => c.parentId === g.id)
        .map((c) => ({
          id: c.id,
          width: c.measured?.width ?? 300,
          height: c.measured?.height ?? 140,
          ...(opts.partitions?.[c.id] !== undefined
            ? { layoutOptions: { "elk.partitioning.partition": String(opts.partitions[c.id]) } }
            : {}),
        })),
    })),
    edges: edges.map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
  };

  const result = await elk.layout(graph);

  const pos = new Map<string, { x: number; y: number; w: number; h: number }>();
  for (const g of result.children ?? []) {
    pos.set(g.id, { x: g.x ?? 0, y: g.y ?? 0, w: g.width ?? 0, h: g.height ?? 0 });
    for (const c of g.children ?? []) {
      pos.set(c.id, { x: c.x ?? 0, y: c.y ?? 0, w: c.width ?? 0, h: c.height ?? 0 });
    }
  }

  return nodes.map((n) => {
    const p = pos.get(n.id);
    if (!p) return n;
    return n.type === "phase"
      ? { ...n, position: { x: p.x, y: p.y }, style: { ...n.style, width: p.w, height: p.h } }
      : { ...n, position: { x: p.x, y: p.y } };
  });
}
