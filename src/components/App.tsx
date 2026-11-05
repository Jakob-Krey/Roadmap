import { useEffect, useState } from "react";
import RoadmapView from "./RoadmapView";
import RoadmapFlow from "./RoadmapFlow";
import TechView from "./TechView";
import "./app.css";

const TABS = [
  { id: "roadmap", label: "Roadmap" },
  { id: "abhaengigkeiten", label: "Abhängigkeiten" },
  { id: "technik", label: "Technik" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function fromHash(): TabId {
  const h = window.location.hash.slice(1);
  return TABS.some((t) => t.id === h) ? (h as TabId) : "roadmap";
}

export default function App() {
  const [tab, setTab] = useState<TabId>(fromHash);

  useEffect(() => {
    const on = () => setTab(fromHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  return (
    <div className="app">
      <header className="app-head">
        <h1>
          Familien-Angebote-Finder <small>Projekt-Roadmap</small>
        </h1>
        <nav>
          {TABS.map((t) => (
            <a key={t.id} href={`#${t.id}`} className={t.id === tab ? "on" : ""}>
              {t.label}
            </a>
          ))}
        </nav>
      </header>
      <div className="app-body">
        {tab === "roadmap" && <RoadmapView />}
        {tab === "abhaengigkeiten" && <RoadmapFlow />}
        {tab === "technik" && <TechView />}
      </div>
    </div>
  );
}
