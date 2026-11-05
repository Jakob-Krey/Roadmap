import { useMemo } from "react";
import {
  Handle,
  MarkerType,
  Panel,
  Position,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { archEdges, archNodes, columns, details, flowKinds, layers } from "../data/architecture";
import { notionUrl } from "../data/notion";
import AutoFlow from "./AutoFlow";
import { PhaseGroup } from "./RoadmapCard";

type TechData = { item: (typeof archNodes)[number] } & Record<string, unknown>;

function TechCard({ data }: NodeProps<Node<TechData>>) {
  const { item } = data;
  return (
    <div className={`card tech ${item.phase === "nach MVP" ? "later" : ""}`}>
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <a
        className="card-link nodrag nopan"
        href={notionUrl(item.section)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="card-head">
          <span className="card-title">{item.title}</span>
          {item.phase === "nach MVP" && <span className="badge">nach MVP</span>}
        </div>
        <div className="tech-tag">{item.tech}</div>
        <p className="card-desc">{item.description}</p>
      </a>
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </div>
  );
}

const nodeTypes = { tech: TechCard, phase: PhaseGroup };
const LAYOUT = { layerSpacing: 150, nodeSpacing: 28, partitions: columns };

function buildGraph(): { nodes: Node[]; edges: Edge[] } {
  const used = layers.filter((l) => archNodes.some((n) => n.layer === l));
  const groups: Node[] = used.map((l) => ({
    id: `layer:${l}`,
    type: "phase",
    position: { x: 0, y: 0 },
    data: { label: l },
    selectable: false,
    draggable: false,
  }));
  const cards: Node[] = archNodes.map((item) => ({
    id: item.id,
    type: "tech",
    parentId: `layer:${item.layer}`,
    position: { x: 0, y: 0 },
    data: { item },
    draggable: false,
  }));
  const edges: Edge[] = archEdges.map((e) => {
    const k = flowKinds[e.kind];
    return {
      id: `${e.from}->${e.to}`,
      source: e.from,
      target: e.to,
      label: e.label,
      type: "smoothstep",
      style: { stroke: k.color, strokeWidth: 2, strokeDasharray: k.dashed ? "6 4" : undefined },
      labelStyle: { fontSize: 11, fill: k.color, fontWeight: 600 },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
      markerEnd: { type: MarkerType.ArrowClosed, color: k.color },
    };
  });
  return { nodes: [...groups, ...cards], edges };
}

export default function TechView() {
  const graph = useMemo(buildGraph, []);
  return (
    <div className="tech-page">
      <section className="tech-diagram">
        <AutoFlow
          nodes={graph.nodes}
          edges={graph.edges}
          nodeTypes={nodeTypes}
          layout={LAYOUT}
          minimapColor={(n) => (n.type === "tech" ? "#6366f1" : "transparent")}
        >
          <Panel position="top-left" className="legend">
            {(Object.keys(flowKinds) as (keyof typeof flowKinds)[]).map((k) => (
              <i key={k} className={flowKinds[k].dashed ? "dashed" : ""} style={{ ["--c" as string]: flowKinds[k].color }}>
                {flowKinds[k].label}
              </i>
            ))}
          </Panel>
        </AutoFlow>
      </section>

      <section className="details">
        {details.map((d) => (
          <article key={d.id} className="detail">
            <h3>
              {d.title}
              {d.badge && <span className="pill">{d.badge}</span>}
            </h3>
            {d.intro && <p>{d.intro}</p>}
            {d.code && <pre>{d.code}</pre>}
            {d.items && (
              <ul>
                {d.items.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            {d.section && (
              <a href={notionUrl(d.section)} target="_blank" rel="noopener noreferrer">
                In Notion lesen →
              </a>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
