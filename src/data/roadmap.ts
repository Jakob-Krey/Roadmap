/**
 * Datenquelle der Roadmap. Positionen werden NICHT hier gepflegt:
 * das Layout berechnet elkjs zur Laufzeit aus den Abhängigkeiten.
 */

export type Status = "offen" | "in Arbeit" | "erledigt";
export type Phase = "MVP" | "nach MVP";
/** Themenstrang: bestimmt die Zeile in der Roadmap-Ansicht */
export type Lane =
  | "Quellen & Daten"
  | "Backend & Website"
  | "Wachstum"
  | "Nutzerbindung"
  | "Erlös"
  | "Erweiterung";

/**
 * Wird später von einer GitHub Action (stündlich, Todoist-API, Token als
 * GitHub Secret) befüllt. Heute noch ungenutzt.
 */
export interface TodoistProgress {
  /** Anzahl erledigter Aufgaben im verknüpften Todoist-Projekt */
  completed: number;
  /** Gesamtzahl der Aufgaben (erledigt + offen) */
  total: number;
  /** Offene Aufgaben (nur Titel + Link, keine sensiblen Details) */
  openTasks: { id: string; content: string; url: string }[];
  /** ISO-Zeitstempel des letzten Syncs */
  syncedAt: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  status: Status;
  phase: Phase;
  /** ids der Knoten, von denen dieser Knoten abhängt (erzeugt Kanten) */
  dependsOn: string[];
  lane: Lane;
  /** Abschnitt der Notion-Seite (siehe notion.ts); daraus entsteht der Link */
  section?: SectionKey;
  /** Expliziter Link (z. B. Todoist), überschreibt `section` */
  link?: string;
  /** Vorbereitet: Todoist-Projekt-ID für den späteren Fortschritts-Sync */
  todoistProjectId?: string;
  /** Vorbereitet: vom Sync geschriebener Fortschritt */
  todoist?: TodoistProgress;
}

import { notionUrl, type SectionKey } from "./notion";

export const phases: Phase[] = ["MVP", "nach MVP"];
export const lanes: Lane[] = [
  "Quellen & Daten",
  "Backend & Website",
  "Wachstum",
  "Nutzerbindung",
  "Erlös",
  "Erweiterung",
];

/** Link, der beim Klick auf die Karte geöffnet wird */
export const itemLink = (n: RoadmapNode) => n.link ?? notionUrl(n.section);

export const roadmap: RoadmapNode[] = [
  // ───────────── MVP ─────────────
  {
    id: "quellen",
    title: "Quellenprüfung",
    description:
      "Nur manuell geprüfte Quellen werden gecrawlt: Seite (robots.txt, Nutzungsbedingungen) und Anbieter (Verein, städtische Einrichtung, bekannter Träger).",
    status: "offen",
    phase: "MVP",
    dependsOn: [],
    lane: "Quellen & Daten",
    section: "quellen",
  },
  {
    id: "crawler",
    title: "Crawler mit Crawl4AI",
    description:
      "Python-Skript, nächtlich per GitHub Actions: wandelt die geprüften Seiten in sauberen Text um, PDFs zuerst per Textextraktion.",
    status: "offen",
    phase: "MVP",
    dependsOn: ["quellen"],
    lane: "Quellen & Daten",
    section: "architektur",
  },
  {
    id: "hash",
    title: "Hash-Änderungsprüfung",
    description:
      "Pro Seite wird ein Hash gespeichert. Ohne Änderung gibt es keinen KI-Aufruf, das spart Kosten.",
    status: "offen",
    phase: "MVP",
    dependsOn: ["crawler"],
    lane: "Quellen & Daten",
    section: "architektur",
  },
  {
    id: "db",
    title: "Supabase-DB",
    description:
      "Postgres in Frankfurt (Free Tier) mit dem Datenschema: Alter von/bis, Ort, Termin mit Zeitzone, stabile Angebots-ID, Quelle und Zeitstempel.",
    status: "offen",
    phase: "MVP",
    dependsOn: [],
    lane: "Backend & Website",
    section: "techstack",
  },
  {
    id: "extraktion",
    title: "KI-Extraktion",
    description:
      "Günstiges Modell extrahiert per Structured Output die Schemafelder aus neuen oder geänderten Seiten und speichert sie in der DB.",
    status: "offen",
    phase: "MVP",
    dependsOn: ["hash", "db"],
    lane: "Quellen & Daten",
    section: "ki",
  },
  {
    id: "edge",
    title: "Edge Function mit Rate-Limit",
    description:
      "Nimmt Alter und Ort entgegen, fragt die DB ab, lässt die KI zusammenfassen. API-Key bleibt serverseitig, Rate-Limit pro IP und Ausgabelimit.",
    status: "offen",
    phase: "MVP",
    dependsOn: ["db"],
    lane: "Backend & Website",
    section: "hosting",
  },
  {
    id: "frontend",
    title: "Astro-Frontend",
    description:
      "Statischer Build mit Eingabe von Alter und Ort. Jedes Angebot mit Quelle, Datum der letzten Aktualisierung und „Angaben ohne Gewähr“.",
    status: "offen",
    phase: "MVP",
    dependsOn: ["edge", "extraktion"],
    lane: "Backend & Website",
    section: "mvp",
  },
  {
    id: "nutzer",
    title: "Nutzergewinnung",
    description:
      "Eltern-Gruppen (WhatsApp, Facebook, nebenan.de), Flyer in Kitas und Bibliothek, Kooperation mit gelisteten Anbietern.",
    status: "offen",
    phase: "MVP",
    dependsOn: ["frontend"],
    lane: "Wachstum",
    section: "nutzergewinnung",
  },
  {
    id: "analytics",
    title: "Analytics",
    description:
      "Traffic und Klicks messen, um zu prüfen, ob überhaupt Nachfrage entsteht. Voraussetzung für alle Erlös-Entscheidungen.",
    status: "offen",
    phase: "MVP",
    dependsOn: ["frontend"],
    lane: "Wachstum",
    section: "nutzergewinnung",
  },

  // ───────────── nach MVP ─────────────
  {
    id: "mail",
    title: "Mail & Double-Opt-in",
    description:
      "Optionale Anmeldung mit Mailadresse. Idee: Geburtsmonat und -jahr statt Alter speichern. AV-Verträge werden hier Pflicht.",
    status: "offen",
    phase: "nach MVP",
    dependsOn: ["analytics"],
    lane: "Nutzerbindung",
    section: "nachMvp",
  },
  {
    id: "newsletter",
    title: "Newsletter",
    description:
      "Neue Angebote fürs eigene Kind, Rhythmus wählbar: wöchentlich, alle 2 Wochen oder monatlich. Nutzt dieselbe Zusammenfassungslogik.",
    status: "offen",
    phase: "nach MVP",
    dependsOn: ["mail"],
    lane: "Nutzerbindung",
    section: "nachMvp",
  },
  {
    id: "ics",
    title: "Kalender-Export (ICS)",
    description:
      "Button „Zum Kalender hinzufügen“ pro Angebot: ICS beim Build erzeugt, dazu Google-Kalender-Link. Regelmäßige Kurse als RRULE.",
    status: "offen",
    phase: "nach MVP",
    dependsOn: ["frontend"],
    lane: "Nutzerbindung",
    section: "nachMvp",
  },
  {
    id: "erloes-featured",
    title: "Erlösmodell 1: Hervorgehobene Einträge",
    description:
      "Lokale Anbieter zahlen für Platzierung oben, Logo und Fotos. Klar als „Anzeige“ gekennzeichnet, nur bei passendem Alter.",
    status: "offen",
    phase: "nach MVP",
    dependsOn: ["analytics"],
    lane: "Erlös",
    section: "monetarisierung",
  },
  {
    id: "erloes-sponsoring",
    title: "Erlösmodell 2: Newsletter-Sponsoring",
    description:
      "Sponsoring nach Altersgruppe und Region. Interessant ab einigen hundert bis tausend Abonnenten pro Region.",
    status: "offen",
    phase: "nach MVP",
    dependsOn: ["erloes-featured", "newsletter"],
    lane: "Erlös",
    section: "monetarisierung",
  },
  {
    id: "erloes-display",
    title: "Erlösmodell 3: Display-Werbung",
    description:
      "Nur nachrangig (z. B. AdSense): geringer Ertrag bei lokalem Traffic, Cookie-Banner nötig, kostet Vertrauen.",
    status: "offen",
    phase: "nach MVP",
    dependsOn: ["erloes-sponsoring"],
    lane: "Erlös",
    section: "monetarisierung",
  },
  {
    id: "jugend",
    title: "Jugendliche 13–16",
    description:
      "Fokus auf Ferienfreizeiten, Camps, Nachhilfe und Sprachreisen. Offen: gleiche Website oder eigenes Jugend-Frontend.",
    status: "offen",
    phase: "nach MVP",
    dependsOn: ["frontend"],
    lane: "Erweiterung",
    section: "nachMvp",
  },
  {
    id: "staedte",
    title: "Weitere Ruhrgebietsstädte",
    description:
      "Essen, Duisburg, Oberhausen … Gleiche Technik, der Aufwand liegt in Quellenprüfung und Anbietergewinnung pro Stadt.",
    status: "offen",
    phase: "nach MVP",
    dependsOn: ["analytics", "quellen"],
    lane: "Erweiterung",
    section: "nachMvp",
  },
];

/** Kanten werden ausschließlich aus den Abhängigkeiten erzeugt. */
export const roadmapEdges = roadmap.flatMap((n) =>
  n.dependsOn.map((dep) => ({ id: `${dep}->${n.id}`, source: dep, target: n.id })),
);
