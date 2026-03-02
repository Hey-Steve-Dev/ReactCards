import { useEffect } from "react";
import { importDeckFromPublishedTabUrl } from "../lib/sheetsImport";
import { BUILTIN_DECK_SOURCES } from "../config/builtinDecks";

/**
 * Ensures built-in decks always exist.
 * If missing, injects them.
 * If autoRefresh = true, refreshes them on load.
 */
export function useBuiltinDecks({ decks, setDecks, autoRefresh }) {
  useEffect(() => {
    if (!BUILTIN_DECK_SOURCES.length) return;

    setDecks((prev) => {
      const next = [...prev];

      for (const b of BUILTIN_DECK_SOURCES) {
        const exists = next.some((d) => d.id === b.id);

        if (!exists) {
          next.unshift({
            id: b.id,
            name: b.name,
            source: { type: "google_sheet_tab", tabUrl: b.tabUrl },
            cards: [],
            hiddenIds: new Set(),
            builtin: true,
            lastSyncAt: 0,
          });
        }
      }

      return next;
    });
  }, [setDecks]);

  useEffect(() => {
    if (!autoRefresh) return;
    if (!BUILTIN_DECK_SOURCES.length) return;

    async function refreshBuiltins() {
      for (const b of BUILTIN_DECK_SOURCES) {
        try {
          const refreshed = await importDeckFromPublishedTabUrl(b.tabUrl, b.name);

          setDecks((prev) =>
            prev.map((d) =>
              d.id === b.id
                ? {
                    ...d,
                    ...refreshed,
                    builtin: true,
                    hiddenIds: d.hiddenIds,
                    lastSyncAt: Date.now(),
                  }
                : d
            )
          );
        } catch {
          // silent fail for now
        }
      }
    }

    refreshBuiltins();
  }, [autoRefresh, setDecks]);
}
