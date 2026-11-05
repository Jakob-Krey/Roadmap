import { useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./roadmap.css";
import { phases, roadmap, roadmapEdges } from "../data/roadmap";
import { layoutNodes } from "../lib/layout";
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

function Flow() {
  const initial = useMemo(buildGraph, []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, , onEdgesChange] = useEdgesState(initial.edges);
  const measured = useNodesInitialized();
  const { fitView } = useReactFlow();
  const [ready, setReady] = useState(false);
  const started = useRef(false);

  // Erst rendern + messen (Kartenhöhe hängt vom umbrochenen Text ab),
  // dann mit elkjs positionieren.
  useEffect(() => {
    if (!measured || started.current) return;
    started.current = true;
    layoutNodes(nodes, edges).then((laidOut) => {
      setNodes(laidOut);
      setReady(true);
      requestAnimationFrame(() => fitView({ padding: 0.1 }));
    });
  }, [measured, nodes, edges, setNodes, fitView]);

  return (
    <div className="flow-wrap" style={{ visibility: ready ? "visible" : "hidden" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        colorMode="system"
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) =>
            n.type === "card"
              ? STATUS_COLOR[(n.data as { item: { status: keyof typeof STATUS_COLOR } }).item.status]
              : "transparent"
          }
        />
        <Panel position="top-left" className="legend">
          <strong>Familien-Angebote-Finder</strong>
          <span>
            {(Object.keys(STATUS_COLOR) as (keyof typeof STATUS_COLOR)[]).map((s) => (
              <i key={s} style={{ ["--c" as string]: STATUS_COLOR[s] }}>
                {s}
              </i>
            ))}
          </span>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function RoadmapFlow() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
