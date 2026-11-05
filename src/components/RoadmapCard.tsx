import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { itemLink, type RoadmapNode, type Status } from "../data/roadmap";

export type CardData = { item: RoadmapNode } & Record<string, unknown>;
export type CardNode = Node<CardData, "card">;

const STATUS_CLASS: Record<Status, string> = {
  offen: "st-open",
  "in Arbeit": "st-progress",
  erledigt: "st-done",
};

export default function RoadmapCard({ data }: NodeProps<CardNode>) {
  const { item } = data;
  const body = (
    <>
      <div className="card-head">
        <span className="card-title">{item.title}</span>
        <span className="badge">{item.status}</span>
      </div>
      <p className="card-desc">{item.description}</p>
      {item.todoist && (
        <div className="card-progress">
          {item.todoist.completed}/{item.todoist.total} Aufgaben erledigt
        </div>
      )}
    </>
  );

  return (
    <div className={`card ${STATUS_CLASS[item.status]}`}>
      <Handle type="target" position={Position.Left} isConnectable={false} />
      {itemLink(item) ? (
        <a
          className="card-link nodrag nopan"
          href={itemLink(item)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {body}
        </a>
      ) : (
        <div className="card-link">{body}</div>
      )}
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </div>
  );
}

export type PhaseNode = Node<{ label: string }, "phase">;

export function PhaseGroup({ data }: NodeProps<PhaseNode>) {
  return <div className="phase-label">{data.label}</div>;
}
