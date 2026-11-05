import { useMemo } from "react";
import { MarkerType, Panel, type Edge, type Node } from "@xyflow/react";
import { phases, roadmap, roadmapEdges } from "../data/roadmap";
import AutoFlow from "./AutoFlow";
import RoadmapCard, { PhaseGroup } from "./RoadmapCard";

const nodeTypes = { card: RoadmapCard, phase: PhaseGroup };
const STATUS_COLOR = { offen: "#94a3b8", "in Arbeit": "#f59e0b", erledigt: "#22c55e" } as const;

function buildGraph(): { nodes: Node[]; edges: Edge[] } {
  // Gruppen müssen vor ihren Kindern im Array stehen.
  const groups: Node[] = phases.map((p) => ({
    id: `phase:${p}`,
    type: "phase",
    position: { x: 0, y: 0 },
    data: { label: p },
    selectable: false,
    draggable: false,
  }));
  const cards: Node[] = roadmap.map((item) => ({
    id: item.id,
    type: "card",
    parentId: `phase:${item.phase}`,
    position: { x: 0, y: 0 },
    data: { item },
    draggable: false,
  }));
  const edges: Edge[] = roadmapEdges.map((e) => ({
    ...e,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed },
  }));
  return { nodes: [...groups, ...cards], edges };
}

/** Abhängigkeits-Graph: zeigt, was woran hängt. */
export default function RoadmapFlow() {
  const graph = useMemo(buildGraph, []);
  return (
    <AutoFlow
      nodes={graph.nodes}
      edges={graph.edges}
      nodeTypes={nodeTypes}
      minimapColor={(n) =>
        n.type === "card"
          ? STATUS_COLOR[(n.data as { item: { status: keyof typeof STATUS_COLOR } }).item.status]
          : "transparent"
      }
    >
      <Panel position="top-left" className="legend">
        <span>
          {(Object.keys(STATUS_COLOR) as (keyof typeof STATUS_COLOR)[]).map((s) => (
            <i key={s} style={{ ["--c" as string]: STATUS_COLOR[s] }}>
              {s}
            </i>
          ))}
        </span>
      </Panel>
    </AutoFlow>
  );
}
