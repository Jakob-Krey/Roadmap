/**
 * Sprungmarken in die Notion-Seite.
 *
 * Notion verlinkt Blöcke über `#<block-id>` an der Seiten-URL. Die Block-IDs
 * sind über die Notion-MCP-Schnittstelle nicht lesbar. So trägst du sie ein:
 *  1. In Notion den Abschnitt (Überschrift) mit der Maus anfahren, auf das
 *     Sechs-Punkte-Symbol (⋮⋮) klicken → "Link zum Block kopieren".
 *  2. Den Teil nach dem `#` unten als `blockId` einfügen.
 * Solange `blockId` fehlt, öffnet der Link die Seite am Anfang.
 */
export const NOTION_PAGE =
  "https://app.notion.com/p/40de8923052e8149b1f3e641678ed9d1";

export interface NotionSection {
  title: string;
  /** Block-ID aus "Link zum Block kopieren" (der Teil nach dem #) */
  blockId?: string;
}

export const notionSections = {
  idee: { title: "Idee" },
  mvp: { title: "Grundkonzept MVP" },
  quellen: { title: "Quellen & Vertrauen" },
  datenschema: { title: "Datenschema (Entwurf)" },
  qualitaet: { title: "Qualität & Sicherheit" },
  nutzergewinnung: { title: "Nutzergewinnung (MVP)" },
  architektur: { title: "Architektur (Hybrid)" },
  techstack: { title: "Tech-Stack (Entwurf)" },
  hosting: { title: "Hosting & Backend" },
  nachMvp: { title: "Roadmap nach dem MVP" },
  ki: { title: "KI-Einbindung" },
  monetarisierung: { title: "Monetarisierung (nach dem MVP)" },
} satisfies Record<string, NotionSection>;

export type SectionKey = keyof typeof notionSections;

export function notionUrl(key?: SectionKey): string {
  if (!key) return NOTION_PAGE;
  const id = (notionSections[key] as NotionSection).blockId;
  return id ? `${NOTION_PAGE}#${id.replace(/-/g, "")}` : NOTION_PAGE;
}
