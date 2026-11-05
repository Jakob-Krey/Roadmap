import type { Phase } from "./roadmap";
import type { SectionKey } from "./notion";

/**
 * Technische Übersicht. Wie bei der Roadmap gilt: keine Positionen,
 * das Layout berechnet elkjs aus `layer` und den Kanten.
 */

export interface ArchNode {
  id: string;
  layer: string;
  title: string;
  /** Technologie in Kurzform, wird als Badge gezeigt */
  tech: string;
  description: string;
  phase: Phase;
  section?: SectionKey;
}

export type FlowKind = "nightly" | "request" | "build" | "later";

export interface ArchEdge {
  from: string;
  to: string;
  label: string;
  kind: FlowKind;
}

export const flowKinds: Record<FlowKind, { label: string; color: string; dashed?: boolean }> = {
  nightly: { label: "Nächtliche Datenpipeline", color: "#6366f1" },
  request: { label: "Suchanfrage einer Mutter/eines Vaters", color: "#0d9488" },
  build: { label: "Build & Deployment", color: "#64748b", dashed: true },
  later: { label: "Nach dem MVP", color: "#d97706", dashed: true },
};

/** Reihenfolge = Reihenfolge der Gruppen im Diagramm */
export const layers = [
  "Quellen",
  "GitHub Actions (nachts)",
  "KI-Anbieter",
  "Supabase (Frankfurt)",
  "Website",
  "Nutzer",
  "Mail (nach MVP)",
];

export const archNodes: ArchNode[] = [
  {
    id: "src",
    layer: "Quellen",
    title: "Geprüfte Quellen",
    tech: "Websites · PDFs",
    description:
      "Nur manuell geprüfte Seiten von Vereinen, Kommunen und Trägern (robots.txt und Nutzungsbedingungen vorab geprüft).",
    phase: "MVP",
    section: "quellen",
  },
  {
    id: "crawl",
    layer: "GitHub Actions (nachts)",
    title: "Crawler",
    tech: "Python · Crawl4AI",
    description:
      "Läuft nächtlich per Cronjob und wandelt Seiten in sauberen Text um. PDFs: zuerst Text extrahieren.",
    phase: "MVP",
    section: "architektur",
  },
  {
    id: "hash",
    layer: "GitHub Actions (nachts)",
    title: "Änderungsprüfung",
    tech: "Hash pro Seite",
    description:
      "Der Hash jeder Seite wird gespeichert. Ohne Änderung gibt es keinen KI-Aufruf, das spart Kosten.",
    phase: "MVP",
    section: "architektur",
  },
  {
    id: "extract",
    layer: "GitHub Actions (nachts)",
    title: "KI-Extraktion",
    tech: "Structured Output",
    description:
      "Macht aus dem Text neuer oder geänderter Seiten Datensätze nach Schema. Feste Selektoren pro Seite sind nicht nötig.",
    phase: "MVP",
    section: "ki",
  },
  {
    id: "deploy",
    layer: "GitHub Actions (nachts)",
    title: "Build & Deploy",
    tech: "Astro-Build · FTP",
    description:
      "Baut die statische Seite und lädt sie per FTP oder GitHub Action zu All-Inkl hoch.",
    phase: "MVP",
    section: "hosting",
  },
  {
    id: "llm",
    layer: "KI-Anbieter",
    title: "Claude Haiku (API)",
    tech: "Anthropic API · Pay-per-Use",
    description:
      "Kleines, günstiges Modell für zwei Aufgaben: Extraktion (nachts) und Zusammenfassung (bei der Suche). Ausgabelimit ist gesetzt.",
    phase: "MVP",
    section: "ki",
  },
  {
    id: "db",
    layer: "Supabase (Frankfurt)",
    title: "Datenbank",
    tech: "Postgres · Free Tier",
    description:
      "Angebote mit Quelle und Zeitstempel, Hashes, Altersbereich- und Ortsabfragen. Später PostGIS für Umkreissuche. Liefert beim Build auch die Daten für ICS-Dateien.",
    phase: "MVP",
    section: "techstack",
  },
  {
    id: "edge",
    layer: "Supabase (Frankfurt)",
    title: "Edge Function",
    tech: "TypeScript · Rate-Limit",
    description:
      "Nimmt Alter und Ort entgegen, fragt die DB, ruft die KI und gibt die Zusammenfassung zurück. Der API-Key bleibt serverseitig.",
    phase: "MVP",
    section: "hosting",
  },
  {
    id: "site",
    layer: "Website",
    title: "Astro-Frontend",
    tech: "Astro (statisch) · All-Inkl",
    description:
      "Eingabe von Alter und Ort, danach Zusammenfassung und Angebote, jeweils mit Quelle, Aktualisierungsdatum und „Angaben ohne Gewähr“.",
    phase: "MVP",
    section: "mvp",
  },
  {
    id: "ics",
    layer: "Website",
    title: "ICS-Kalenderexport",
    tech: "beim Astro-Build",
    description:
      "Pro Angebot eine ICS-Datei, dazu Google-Kalender-Link. Stabile Angebots-ID als UID, regelmäßige Kurse als RRULE.",
    phase: "nach MVP",
    section: "nachMvp",
  },
  {
    id: "user",
    layer: "Nutzer",
    title: "Eltern",
    tech: "Browser",
    description: "Geben Alter des Kindes und Wohnort ein. Keine Registrierung im MVP.",
    phase: "MVP",
    section: "mvp",
  },
  {
    id: "mail",
    layer: "Mail (nach MVP)",
    title: "Mail & Newsletter",
    tech: "z. B. Brevo · Double-Opt-in",
    description:
      "Optionale Anmeldung, Rhythmus wählbar. Nutzt dieselbe Zusammenfassungslogik. AV-Verträge werden ab hier Pflicht.",
    phase: "nach MVP",
    section: "nachMvp",
  },
];

/** Spalte von links nach rechts (so lesen sich beide Abläufe in einer Richtung) */
export const columns: Record<string, number> = {
  user: 0,
  src: 0,
  crawl: 1,
  hash: 1,
  extract: 1,
  deploy: 1,
  site: 1,
  ics: 1,
  edge: 2,
  db: 2,
  llm: 3,
  mail: 3,
};

export const archEdges: ArchEdge[] = [
  { from: "src", to: "crawl", label: "Abruf", kind: "nightly" },
  { from: "crawl", to: "hash", label: "Seitentext", kind: "nightly" },
  { from: "hash", to: "extract", label: "nur Geändertes", kind: "nightly" },
  { from: "extract", to: "llm", label: "Text → Schema", kind: "nightly" },
  { from: "extract", to: "db", label: "Datensätze", kind: "nightly" },
  { from: "user", to: "site", label: "Alter + Ort", kind: "request" },
  { from: "site", to: "edge", label: "POST", kind: "request" },
  { from: "edge", to: "db", label: "Abfrage", kind: "request" },
  { from: "edge", to: "llm", label: "Zusammenfassung", kind: "request" },
  { from: "deploy", to: "site", label: "Upload", kind: "build" },
  { from: "db", to: "mail", label: "neue Angebote", kind: "later" },
];

/* ───────────── Detailabschnitte unter dem Diagramm ───────────── */

export interface Detail {
  id: string;
  title: string;
  badge?: string;
  intro?: string;
  items?: string[];
  code?: string;
  section?: SectionKey;
}

export const details: Detail[] = [
  {
    id: "ki",
    title: "KI-Einbindung",
    intro: "Zwei getrennte Aufgaben mit einem kleinen, günstigen Modell:",
    items: [
      "Extraktion (nächtlich): Seitentext wird per Structured Output zum Datensatz nach Schema. Nur geänderte Seiten, die Kosten bleiben im Cent-Bereich.",
      "Zusammenfassung (bei der Suche): kurzer, freundlicher Text für Eltern, ausschließlich aus Datensätzen der DB. Keine Halluzinationen, jedes Angebot mit Link zur Quelle.",
      "Zugang über die API (Pay-per-Use, Ausgabelimit). Das Claude-Abo ist für Automatisierung nicht geeignet.",
      "Sparen: Zusammenfassungen pro Alter + Ort etwa 1 Tag cachen. Extraktion optional lokal (Ollama) testen und vergleichen.",
      "Kostenschätzung laut Notion: unter 2 $ pro Monat bei 50 Seiten pro Nacht und 20 Suchen pro Tag.",
    ],
    section: "ki",
  },
  {
    id: "api",
    title: "API-Schnittstelle",
    badge: "Vorschlag, noch nicht in Notion",
    intro:
      "Notion beschreibt nur den Ablauf (Alter + Ort rein, Zusammenfassung raus). Form und Feldnamen sind mein Entwurf zum Diskutieren:",
    code: `POST https://<projekt>.supabase.co/functions/v1/suche
{ "alter": 4, "ort": "Mülheim an der Ruhr" }

200 OK
{
  "zusammenfassung": "Für 4-Jährige gibt es ...",
  "angebote": [{
    "id": "uuid", "titel": "...", "termin": "...",
    "quelle": "https://...", "aktualisiert": "2026-11-04"
  }],
  "hinweis": "Angaben ohne Gewähr"
}
429 Too Many Requests   (Rate-Limit pro IP)`,
    items: [
      "Ablauf der Function: Eingabe prüfen → Rate-Limit → Cache (Alter + Ort) → DB-Abfrage → KI-Zusammenfassung → Antwort.",
      "Das Frontend kennt nur die Function-URL und den öffentlichen Supabase-Schlüssel. Der KI-Key liegt als Secret in Supabase.",
      "Logik schlank und getrennt halten, damit ein Umzug auf Node oder Vercel leicht bleibt.",
    ],
    section: "hosting",
  },
  {
    id: "web",
    title: "Einbindung der Website",
    intro: "Die Website ist ein statischer Astro-Build ohne eigenen Server:",
    items: [
      "Hosting bei All-Inkl (bestehendes Paket), Upload per FTP oder GitHub Action.",
      "Beim Suchen ruft der Browser per fetch die Edge Function auf. Dort laufen Rate-Limit und KI.",
      "Nach dem MVP erzeugt der Build zusätzlich pro Angebot eine ICS-Datei aus den DB-Daten.",
      "Analytics misst Traffic und Klicks. Der Mail-Dienst kommt erst mit dem Newsletter.",
    ],
    section: "hosting",
  },
  {
    id: "sec",
    title: "Qualität, Sicherheit, DSGVO",
    items: [
      "Nur vorab geprüfte Quellen, auch bei zahlenden Anbietern. Bezahlung ersetzt keine Prüfung.",
      "Abgelaufene Termine werden automatisch ausgeblendet oder gelöscht.",
      "Missbrauchsschutz: Rate-Limit pro IP/Nutzer plus Ausgabelimit bei der KI-API.",
      "Keine Personennamen oder Telefonnummern von Ansprechpersonen im Datenschema.",
      "AV-Verträge mit KI-Anbieter, Supabase, Analytics und später dem Mail-Dienst. Im MVP unkritisch (nur Alter und Ort).",
    ],
    section: "qualitaet",
  },
  {
    id: "sync",
    title: "Geplant: Roadmap-Sync mit Todoist",
    badge: "noch nicht umgesetzt",
    items: [
      "Eine GitHub Action holt stündlich per Todoist-API Fortschritt und offene Aufgaben.",
      "Der Token liegt als GitHub Secret, nie im Frontend.",
      "Die Action schreibt in die Roadmap-Daten (Feld `todoist` je Knoten, verknüpft über `todoistProjectId`) und stößt den Build an.",
    ],
  },
];
