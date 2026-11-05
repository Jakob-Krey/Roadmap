import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk-api";
import type { Edge, Node } from "@xyflow/react";

const elk = new ELK();

const GROUP_PADDING = { top: 60, left: 36, bottom: 48, right: 36 };

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

export interface RoutedEdgeData extends Record<string, unknown> {
  /** Vom ELK berechneter Linienverlauf in Flow-Koordinaten */
  points: { x: number; y: number }[];
  /** Position der Beschriftung (Mitte) */
  labelPos?: { x: number; y: number };
}

export async function layoutGraph(
  nodes: Node[],
  edges: Edge[],
  opts: LayoutOptions = {},
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const groups = nodes.filter((n) => n.type === "phase");
  const cards = nodes.filter((n) => n.type !== "phase");

  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": opts.direction ?? "RIGHT",
      "elk.hierarchyHandling": "INCLUDE_CHILDREN",
      "elk.edgeRouting": "ORTHOGONAL",
      // Linienpunkte in Koordinaten der Wurzel statt relativ zur Gruppe
      "org.eclipse.elk.json.edgeCoords": "ROOT",
      "elk.spacing.nodeNode": String(opts.nodeSpacing ?? 32),
      "elk.layered.spacing.nodeNodeBetweenLayers": String(opts.layerSpacing ?? 90),
      "elk.layered.spacing.edgeNodeBetweenLayers": "36",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.crossingMinimization.semiInteractive": "true",
      ...(opts.partitions ? { "elk.partitioning.activate": "true" } : {}),
    },
    children: groups.map((g) => ({
      id: g.id,
      layoutOptions: {
        // Abstände gelten sonst nur zwischen den Gruppen, nicht darin
        "elk.spacing.nodeNode": String(opts.nodeSpacing ?? 32),
        "elk.layered.spacing.nodeNodeBetweenLayers": String(opts.layerSpacing ?? 90),
        "elk.layered.spacing.edgeNodeBetweenLayers": "36",
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
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
      // Platz für die Beschriftung reservieren, damit sie nichts überdeckt
      labels:
        typeof e.label === "string"
          ? [{ text: e.label, width: e.label.length * 6.8 + 20, height: 24 }]
          : [],
    })),
  };

  const result: ElkNode = await elk.layout(graph as ElkNode);

  const pos = new Map<string, { x: number; y: number; w: number; h: number }>();
  for (const g of result.children ?? []) {
    pos.set(g.id, { x: g.x ?? 0, y: g.y ?? 0, w: g.width ?? 0, h: g.height ?? 0 });
    for (const c of g.children ?? []) {
      pos.set(c.id, { x: c.x ?? 0, y: c.y ?? 0, w: c.width ?? 0, h: c.height ?? 0 });
    }
  }

  const laidNodes = nodes.map((n) => {
    const p = pos.get(n.id);
    if (!p) return n;
    return n.type === "phase"
      ? { ...n, position: { x: p.x, y: p.y }, style: { ...n.style, width: p.w, height: p.h } }
      : { ...n, position: { x: p.x, y: p.y } };
  });

  const routed = new Map<string, RoutedEdgeData>();
  for (const e of (result.edges ?? []) as ElkExtendedEdge[]) {
    const sec = e.sections?.[0];
    if (!sec) continue;
    const points = [sec.startPoint, ...(sec.bendPoints ?? []), sec.endPoint];
    const label = e.labels?.[0];
    routed.set(e.id, {
      points,
      labelPos:
        label && label.x !== undefined && label.y !== undefined
          ? { x: label.x + (label.width ?? 0) / 2, y: label.y + (label.height ?? 0) / 2 }
          : undefined,
    });
  }
  const laidEdges = edges.map((e) => ({ ...e, type: "routed", data: routed.get(e.id) }));

  return { nodes: laidNodes, edges: laidEdges };
}
