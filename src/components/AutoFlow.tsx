import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./roadmap.css";
import { layoutGraph, type LayoutOptions } from "../lib/layout";
import RoutedEdge from "./RoutedEdge";

const edgeTypes = { routed: RoutedEdge };

interface Props {
  nodes: Node[];
  edges: Edge[];
  nodeTypes: NodeTypes;
  layout?: LayoutOptions;
  minimapColor?: (n: Node) => string;
  minimap?: boolean;
  children?: ReactNode;
}

function Inner({ nodes: initialNodes, edges: initialEdges, nodeTypes, layout, minimapColor, minimap = true, children }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const measured = useNodesInitialized();
  const { fitView } = useReactFlow();
  const [ready, setReady] = useState(false);
  const started = useRef(false);

  // Erst rendern + messen (Kartenhöhe hängt vom umbrochenen Text ab),
  // dann mit elkjs positionieren.
  useEffect(() => {
    if (!measured || started.current) return;
    started.current = true;
    layoutGraph(nodes, edges, layout).then((laidOut) => {
      setNodes(laidOut.nodes);
      setEdges(laidOut.edges);
      setReady(true);
      // Erst nach dem nächsten Render einpassen, wenn React Flow die neuen
      // Positionen und Gruppengrößen kennt.
      setTimeout(() => fitView({ padding: 0.1 }), 80);
    });
  }, [measured, nodes, edges, layout, setNodes, setEdges, fitView]);

  return (
    <div className="flow-wrap" style={{ visibility: ready ? "visible" : "hidden" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
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
        {minimap && <MiniMap pannable zoomable nodeColor={minimapColor} />}
        {children}
      </ReactFlow>
    </div>
  );
}

export default function AutoFlow(props: Props) {
  return (
    <ReactFlowProvider>
      <Inner {...props} />
    </ReactFlowProvider>
  );
}
