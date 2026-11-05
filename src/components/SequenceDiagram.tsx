import { seqMessages, seqParticipants } from "../data/architecture";

const W = 1100;
const COL = W / seqParticipants.length;
const HEAD_H = 56;
const TOP = 96;
const STEP = 72;

const xOf = (id: string) => COL * (seqParticipants.findIndex((p) => p.id === id) + 0.5);

/** UML-Sequenzdiagramm, aus den Daten in architecture.ts gezeichnet. */
export default function SequenceDiagram() {
  const H = TOP + seqMessages.length * STEP + 10;
  return (
    <svg className="seq" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Sequenzdiagramm der Suchanfrage">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="currentColor" />
        </marker>
      </defs>

      {seqParticipants.map((p) => (
        <g key={p.id}>
          <line className="seq-life" x1={xOf(p.id)} x2={xOf(p.id)} y1={HEAD_H} y2={H} />
          <rect className="seq-head" x={xOf(p.id) - 90} y={0} width={180} height={HEAD_H} rx={10} />
          <text className="seq-name" x={xOf(p.id)} y={24} textAnchor="middle">{p.label}</text>
          <text className="seq-sub" x={xOf(p.id)} y={43} textAnchor="middle">{p.sub}</text>
        </g>
      ))}

      {seqMessages.map((m, i) => {
        const y = TOP + i * STEP;
        const x1 = xOf(m.from);
        const x2 = xOf(m.to);
        const self = m.from === m.to;
        return (
          <g key={i} className={m.reply ? "seq-reply" : "seq-call"}>
            <text className="seq-num" x={12} y={y + 4}>{i + 1}</text>
            {self ? (
              <>
                <path d={`M${x1} ${y - 8} h46 v30 h-46`} fill="none" markerEnd="url(#arr)" />
                <text className="seq-label" x={x1 + 56} y={y + 4}>{m.label}</text>
                {m.note && <text className="seq-note" x={x1 + 56} y={y + 22}>{m.note}</text>}
              </>
            ) : (
              <>
                <line x1={x1} x2={x2} y1={y} y2={y} markerEnd="url(#arr)" />
                <text className="seq-label" x={(x1 + x2) / 2} y={y - 10} textAnchor="middle">{m.label}</text>
                {m.note && <text className="seq-note" x={(x1 + x2) / 2} y={y + 18} textAnchor="middle">{m.note}</text>}
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
