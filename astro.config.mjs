// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// Der Repo-Name auf GitHub ist "Roadmap" (GitHub Pages unterscheidet bei
// Projektseiten Groß-/Kleinschreibung im Pfad).
export default defineConfig({
  site: "https://jakob-krey.github.io",
  base: "/Roadmap",
  integrations: [react()],
});
