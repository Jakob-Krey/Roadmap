# Roadmap – Familien-Angebote-Finder

Visuelle Projekt-Roadmap als statische Website (Astro + React Flow + elkjs).
Live: https://jakob-krey.github.io/Roadmap/

## Entwicklung

```bash
npm install
npm run dev
```

## Inhalte pflegen

Alles steht in `src/data/roadmap.ts`. Pro Knoten: `id`, `title`, `description`,
`status` (`offen` | `in Arbeit` | `erledigt`), `phase`, `dependsOn` (Liste von ids)
und optional `link`. Kanten entstehen aus `dependsOn`, Positionen berechnet elkjs.

## Vorbereitet: Todoist-Sync

Knoten haben optional `todoistProjectId` und `todoist` (Fortschritt + offene
Aufgaben). Eine spätere Action ruft stündlich die Todoist-API ab (Token als
GitHub Secret, nie im Frontend) und schreibt diese Felder.
