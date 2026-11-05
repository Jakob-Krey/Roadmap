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
import { archEdges, archNodes, details, flowKinds, layers, pipelineSteps } from "../data/architecture";
import { notionUrl } from "../data/notion";
import AutoFlow from "./AutoFlow";
import { PhaseGroup } from "./RoadmapCard";
import SequenceDiagram from "./SequenceDiagram";
import { useState } from "react";

type TechData = { item: (typeof archNodes)[number] } & Record<string, unknown>;

function TechCard({ data }: NodeProps<Node<TechData>>) {
  const { item } = data;
  return (
    <div className={`card tech ${item.phase === "nach MVP" ? "later" : ""}`}>
      <Handle type="target" position={Position.Top} isConnectable={false} />
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
        <div className="tech-tag">
          [{item.kind}
          {item.kind === "Container" ? `: ${item.tech}` : ""}]
        </div>
        {item.kind !== "Container" && <div className="tech-sub">{item.tech}</div>}
        <p className="card-desc">{item.description}</p>
      </a>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </div>
  );
}

const nodeTypes = { tech: TechCard, phase: PhaseGroup };
const LAYOUT = { layerSpacing: 70, nodeSpacing: 60, direction: "DOWN" as const };

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
      style: { stroke: k.color, strokeWidth: 2, strokeDasharray: k.dashed ? "6 4" : undefined },
      labelStyle: { fontSize: 12, color: k.color, fontWeight: 600 },
      markerEnd: { type: MarkerType.ArrowClosed, color: k.color },
    };
  });
  return { nodes: [...groups, ...cards], edges };
}

const VIEWS = [
  { id: "system", label: "Systemüberblick", hint: "C4-Containerdiagramm: wer redet mit wem" },
  { id: "suche", label: "Ablauf: Suche", hint: "Sequenzdiagramm: was passiert bei einer Suchanfrage" },
  { id: "pipeline", label: "Ablauf: Pipeline", hint: "Datenfluss: wie die Angebote nachts in die DB kommen" },
] as const;

function Pipeline() {
  return (
    <ol className="pipe">
      {pipelineSteps.map((s, i) => (
        <li key={s.title} className="pipe-step">
          <div className="pipe-n">{i + 1}</div>
          <h4>{s.title}</h4>
          <div className="tech-tag">{s.tech}</div>
          <dl>
            <dt>Eingabe</dt>
            <dd>{s.input}</dd>
            <dt>Ergebnis</dt>
            <dd>{s.output}</dd>
          </dl>
          {s.branch && <div className="pipe-branch">{s.branch}</div>}
        </li>
      ))}
    </ol>
  );
}

export default function TechView() {
  const graph = useMemo(buildGraph, []);
  const [view, setView] = useState<(typeof VIEWS)[number]["id"]>("system");
  const current = VIEWS.find((v) => v.id === view)!;
  return (
    <div className="tech-page">
      <div className="subtabs">
        {VIEWS.map((v) => (
          <button key={v.id} className={v.id === view ? "on" : ""} onClick={() => setView(v.id)}>
            {v.label}
          </button>
        ))}
        <span className="subhint">{current.hint}</span>
      </div>

      {view === "system" && (
        <section className="tech-diagram">
          <AutoFlow
            nodes={graph.nodes}
            edges={graph.edges}
            nodeTypes={nodeTypes}
            layout={LAYOUT}
            minimap={false}
            minimapColor={(n) => (n.type === "tech" ? "#6366f1" : "transparent")}
          >
            <Panel position="top-left" className="legend">
              {(Object.keys(flowKinds) as (keyof typeof flowKinds)[]).filter((k) => archEdges.some((e) => e.kind === k)).map((k) => (
                <i key={k} className={flowKinds[k].dashed ? "dashed" : ""} style={{ ["--c" as string]: flowKinds[k].color }}>
                  {flowKinds[k].label}
                </i>
              ))}
            </Panel>
          </AutoFlow>
        </section>
      )}
      {view === "suche" && (
        <section className="tech-plain">
          <SequenceDiagram />
        </section>
      )}
      {view === "pipeline" && (
        <section className="tech-plain">
          <Pipeline />
        </section>
      )}

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
