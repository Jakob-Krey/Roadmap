import { Fragment } from "react";
import { itemLink, lanes, phases, roadmap, type Lane, type RoadmapNode } from "../data/roadmap";

const LANE_COLOR: Record<Lane, string> = {
  "Quellen & Daten": "#6366f1",
  "Backend & Website": "#0d9488",
  Wachstum: "#d97706",
  Nutzerbindung: "#db2777",
  Erlös: "#16a34a",
  Erweiterung: "#7c3aed",
};

const byId = new Map(roadmap.map((n) => [n.id, n]));

/** Spalte innerhalb der Phase = längster Abhängigkeitspfad (nur gleiche Phase). */
const levelMemo = new Map<string, number>();
function level(n: RoadmapNode): number {
  const hit = levelMemo.get(n.id);
  if (hit !== undefined) return hit;
  const same = n.dependsOn.map((d) => byId.get(d)!).filter((d) => d.phase === n.phase);
  const v = same.length ? Math.max(...same.map(level)) + 1 : 0;
  levelMemo.set(n.id, v);
  return v;
}

export default function RoadmapView() {
  // Spaltenaufbau je Phase
  let col = 2; // Spalte 1 = Themenstrang
  const phaseCols = phases.map((p) => {
    const items = roadmap.filter((n) => n.phase === p);
    const count = Math.max(...items.map(level)) + 1;
    const start = col;
    col += count;
    const done = items.filter((n) => n.status === "erledigt").length;
    return { phase: p, start, count, done, total: items.length };
  });
  const startOf = Object.fromEntries(phaseCols.map((p) => [p.phase, p.start]));
  const totalCols = col - 1;

  // Karten je Zelle (Themenstrang × Spalte)
  const cells = new Map<string, RoadmapNode[]>();
  for (const n of roadmap) {
    const key = `${lanes.indexOf(n.lane)}:${startOf[n.phase] + level(n)}`;
    cells.set(key, [...(cells.get(key) ?? []), n]);
  }

  return (
    <div className="rm-scroll">
      <div
        className="rm-grid"
        style={{ gridTemplateColumns: `150px repeat(${totalCols - 1}, 260px)` }}
      >
        {phaseCols.map((p) => (
          <div
            key={p.phase}
            className={`rm-phase ${p.phase === "MVP" ? "mvp" : "later"}`}
            style={{ gridColumn: `${p.start} / span ${p.count}`, gridRow: 1 }}
          >
            <strong>{p.phase}</strong>
            <span>
              {p.done} von {p.total} erledigt
            </span>
            <div className="rm-bar">
              <div style={{ width: `${(p.done / p.total) * 100}%` }} />
            </div>
          </div>
        ))}

        {lanes.map((lane, i) => (
          <Fragment key={lane}>
            <div className="rm-band" style={{ gridRow: i + 2, gridColumn: "1 / -1" }} />
            <div
              className="rm-lane"
              style={{ gridRow: i + 2, gridColumn: 1, ["--lane" as string]: LANE_COLOR[lane] }}
            >
              {lane}
            </div>
          </Fragment>
        ))}

        {[...cells.entries()].map(([key, items]) => {
          const [row, column] = key.split(":").map(Number);
          return (
            <div
              key={key}
              className="rm-cell"
              style={{ gridRow: row + 2, gridColumn: column, ["--lane" as string]: LANE_COLOR[lanes[row]] }}
            >
              {items.map((n) => (
                <a
                  key={n.id}
                  className={`rm-card st-${n.status === "offen" ? "open" : n.status === "erledigt" ? "done" : "progress"}`}
                  href={itemLink(n)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="rm-card-head">
                    <span className="rm-title">{n.title}</span>
                    <span className="badge">{n.status}</span>
                  </div>
                  <p>{n.description}</p>
                  {n.dependsOn.length > 0 && (
                    <div className="rm-deps">
                      Benötigt: {n.dependsOn.map((d) => byId.get(d)!.title).join(", ")}
                    </div>
                  )}
                  {n.todoist && (
                    <div className="rm-deps">
                      {n.todoist.completed}/{n.todoist.total} Aufgaben erledigt
                    </div>
                  )}
                </a>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
