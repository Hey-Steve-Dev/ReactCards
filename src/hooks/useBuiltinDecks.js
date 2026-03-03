// src/hooks/useBuiltinDecks.js
import { useEffect } from "react";
import { importDeckFromPublishedTabUrl } from "../lib/sheetsImport";
import { BUILTIN_DECK_SOURCES } from "../config/builtinDecks";

function ensureBuiltins(prev) {
  // Start from prev, but ensure no duplicate ids (keep first occurrence)
  const seen = new Set();
  const deduped = [];

  for (const d of prev) {
    const id = String(d?.id ?? "");
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    deduped.push(d);
  }

  // Inject missing built-ins at the top
  for (const b of BUILTIN_DECK_SOURCES) {
    const id = String(b.id);
    if (seen.has(id)) continue;

    deduped.unshift({
      id,
      name: b.name,
      source: { type: "google_sheet_tab", tabUrl: b.tabUrl },
      cards: [],
      hiddenIds: new Set(),
      builtin: true,
      lastSyncAt: 0,
    });

    seen.add(id);
  }

  return deduped;
}

/**
 * Ensures built-in decks always exist.
 * Waits until localStorage hydration is complete to avoid re-injecting
 * built-ins into an empty pre-hydration state.
 */
export function useBuiltinDecks({ setDecks, autoRefresh, hydrated }) {
  // 1) Ensure built-ins exist (once after hydration)
  useEffect(() => {
    if (!hydrated) return;
    if (!BUILTIN_DECK_SOURCES.length) return;

    setDecks((prev) => ensureBuiltins(prev));
  }, [hydrated, setDecks]);

  // 2) Optional: auto refresh built-ins after hydration
  useEffect(() => {
    if (!hydrated) return;
    if (!autoRefresh) return;
    if (!BUILTIN_DECK_SOURCES.length) return;

    let cancelled = false;

    async function refreshBuiltins() {
      for (const b of BUILTIN_DECK_SOURCES) {
        if (cancelled) return;

        try {
          const refreshed = await importDeckFromPublishedTabUrl(b.tabUrl, b.name);
          if (cancelled) return;

          setDecks((prev) => {
            // Map update + final dedupe pass
            const next = prev.map((d) => {
              if (d.id !== b.id) return d;

              return {
                ...d,
                ...refreshed,

                // ✅ never let refreshed change identity
                id: b.id,
                name: b.name, // keep the builtin name as the canonical label
                source: { type: "google_sheet_tab", tabUrl: b.tabUrl },

                builtin: true,

                // ✅ preserve local-only state
                hiddenIds: d.hiddenIds,
                lastSyncAt: Date.now(),
              };
            });

            // Deduplicate just in case something else inserted a duplicate
            const seen = new Set();
            const deduped = [];
            for (const d of next) {
              const id = String(d?.id ?? "");
              if (!id) continue;
              if (seen.has(id)) continue;
              seen.add(id);
              deduped.push(d);
            }
            return deduped;
          });
        } catch {
          // silent fail
        }
      }
    }

    refreshBuiltins();

    return () => {
      cancelled = true;
    };
  }, [hydrated, autoRefresh, setDecks]);
}
