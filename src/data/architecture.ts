import type { Phase } from "./roadmap";
import type { SectionKey } from "./notion";

/**
 * Technische Übersicht. Wie bei der Roadmap gilt: keine Positionen,
 * das Layout berechnet elkjs aus `layer` und den Kanten.
 */

export interface ArchNode {
  id: string;
  layer: string;
  /** C4-Typ */
  kind: "Person" | "Externes System" | "Container";
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
  nightly: { label: "Nächtliche Pipeline", color: "#6366f1" },
  request: { label: "Suchanfrage der Eltern", color: "#0d9488" },
  build: { label: "Build & Deployment", color: "#64748b", dashed: true },
  later: { label: "Nach dem MVP", color: "#d97706", dashed: true },
};

/** Reihenfolge = Reihenfolge der Gruppen im Diagramm */
export const layers = ["Personen", "Familien-Angebote-Finder (System)", "Externe Systeme"];

export const archNodes: ArchNode[] = [
  {
    id: "user",
    layer: "Personen",
    kind: "Person",
    title: "Eltern",
    tech: "Browser",
    description: "Geben Alter des Kindes und Wohnort ein. Keine Registrierung im MVP.",
    phase: "MVP",
    section: "mvp",
  },
  {
    id: "src",
    layer: "Externe Systeme",
    kind: "Externes System",
    title: "Geprüfte Quellen",
    tech: "Websites, PDFs",
    description:
      "Nur manuell geprüfte Seiten von Vereinen, Kommunen und Trägern (robots.txt und Nutzungsbedingungen vorab geprüft).",
    phase: "MVP",
    section: "quellen",
  },
  {
    id: "llm",
    layer: "Externe Systeme",
    kind: "Externes System",
    title: "Claude Haiku",
    tech: "Anthropic API, Pay-per-Use",
    description:
      "Kleines, günstiges Modell für zwei Aufgaben: Extraktion (nachts) und Zusammenfassung (bei der Suche). Ausgabelimit gesetzt.",
    phase: "MVP",
    section: "ki",
  },
  {
    id: "mail",
    layer: "Externe Systeme",
    kind: "Externes System",
    title: "Mail-Dienst",
    tech: "z. B. Brevo",
    description:
      "Versendet Double-Opt-in und Newsletter. AV-Vertrag wird ab hier Pflicht.",
    phase: "nach MVP",
    section: "nachMvp",
  },
  {
    id: "site",
    layer: "Familien-Angebote-Finder (System)",
    kind: "Container",
    title: "Astro-Frontend",
    tech: "Astro, statisch, All-Inkl",
    description:
      "Eingabe von Alter und Ort, Anzeige von Zusammenfassung und Angeboten mit Quelle, Datum und „Angaben ohne Gewähr“. Build per GitHub Action, Upload per FTP zu All-Inkl. Später mit ICS-Dateien.",
    phase: "MVP",
    section: "mvp",
  },
  {
    id: "edge",
    layer: "Familien-Angebote-Finder (System)",
    kind: "Container",
    title: "Edge Function",
    tech: "TypeScript, Supabase",
    description:
      "Prüft Eingabe und Rate-Limit, fragt die DB, ruft die KI und liefert die Zusammenfassung. Der API-Key bleibt serverseitig.",
    phase: "MVP",
    section: "hosting",
  },
  {
    id: "db",
    layer: "Familien-Angebote-Finder (System)",
    kind: "Container",
    title: "Datenbank",
    tech: "Postgres, Supabase Frankfurt",
    description:
      "Angebote mit Quelle und Zeitstempel sowie Seiten-Hashes. Abfragen nach Altersbereich und Ort, später PostGIS.",
    phase: "MVP",
    section: "techstack",
  },
  {
    id: "pipeline",
    layer: "Familien-Angebote-Finder (System)",
    kind: "Container",
    title: "Nächtliche Pipeline",
    tech: "Python, Crawl4AI, GitHub Actions",
    description:
      "Ruft die Quellen ab, prüft per Hash auf Änderungen, extrahiert per KI und speichert. Ablauf siehe Tab „Pipeline“.",
    phase: "MVP",
    section: "architektur",
  },
];

/** Beschriftung nach C4: Beschreibung [Protokoll] */
export const archEdges: ArchEdge[] = [
  { from: "user", to: "site", label: "Sucht Angebote [HTTPS]", kind: "request" },
  { from: "site", to: "edge", label: "Fragt an [HTTPS, JSON]", kind: "request" },
  { from: "edge", to: "db", label: "Liest Angebote [SQL]", kind: "request" },
  { from: "edge", to: "llm", label: "Lässt zusammenfassen [HTTPS]", kind: "request" },
  { from: "pipeline", to: "src", label: "Ruft Seiten ab [HTTPS]", kind: "nightly" },
  { from: "pipeline", to: "llm", label: "Extrahiert Daten [HTTPS]", kind: "nightly" },
  { from: "pipeline", to: "db", label: "Speichert Angebote [SQL]", kind: "nightly" },
  { from: "edge", to: "mail", label: "Versand, Double-Opt-in [API]", kind: "later" },
];

/* ───────────── Ablauf: Suche (Sequenzdiagramm) ───────────── */

export const seqParticipants = [
  { id: "user", label: "Eltern", sub: "Browser" },
  { id: "site", label: "Astro-Frontend", sub: "statisch" },
  { id: "edge", label: "Edge Function", sub: "Supabase" },
  { id: "db", label: "Datenbank", sub: "Postgres" },
  { id: "llm", label: "Claude Haiku", sub: "Anthropic API" },
];

export interface SeqMessage {
  from: string;
  to: string;
  label: string;
  note?: string;
  reply?: boolean;
}

export const seqMessages: SeqMessage[] = [
  { from: "user", to: "site", label: "Alter + Ort eingeben" },
  { from: "site", to: "edge", label: "POST /suche", note: "{ alter, ort }" },
  { from: "edge", to: "edge", label: "Prüfen", note: "Eingabe, Rate-Limit pro IP" },
  { from: "edge", to: "db", label: "Angebote abfragen", note: "Alter von/bis, Ort, nicht abgelaufen" },
  { from: "db", to: "edge", label: "Datensätze + Quelle", reply: true },
  { from: "edge", to: "llm", label: "Zusammenfassen", note: "nur diese Datensätze" },
  { from: "llm", to: "edge", label: "Kurztext für Eltern", reply: true },
  { from: "edge", to: "site", label: "Text + Angebote", note: "Cache pro Alter+Ort ca. 1 Tag", reply: true },
  { from: "site", to: "user", label: "Anzeige", note: "mit Quelle, „Angaben ohne Gewähr“", reply: true },
];

/* ───────────── Ablauf: nächtliche Pipeline ───────────── */

export interface PipelineStep {
  title: string;
  tech: string;
  input: string;
  output: string;
  branch?: string;
}

export const pipelineSteps: PipelineStep[] = [
  {
    title: "Abrufen",
    tech: "Crawl4AI, nächtlicher Cronjob",
    input: "Liste der geprüften Quell-URLs",
    output: "Sauberer Text pro Seite (PDFs: zuerst Text extrahieren)",
  },
  {
    title: "Änderung prüfen",
    tech: "Hash pro Seite",
    input: "Text und gespeicherter Hash",
    output: "Seite neu oder geändert",
    branch: "Unverändert: Ende, kein KI-Aufruf (spart Kosten)",
  },
  {
    title: "Extrahieren",
    tech: "Claude Haiku, Structured Output",
    input: "Text der neuen oder geänderten Seite",
    output: "Datensatz nach Schema (Alter, Ort, Termin mit Zeitzone, Kosten …)",
  },
  {
    title: "Speichern",
    tech: "Supabase Postgres",
    input: "Datensatz",
    output: "Angebot mit stabiler ID, Quelle und Zeitstempel; neuer Hash",
  },
  {
    title: "Aufräumen",
    tech: "SQL, nächtlich",
    input: "Bestehende Angebote",
    output: "Abgelaufene Termine ausgeblendet oder gelöscht",
  },
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
