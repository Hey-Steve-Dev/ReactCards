// src/hooks/useSheetsDeckActions.js
import { useCallback } from "react";
import {
  importDeckFromPublishedTabUrl,
  importDeckIndexFromPublishedTabUrl,
} from "../lib/sheetsImport";

function isSheetDeck(deck) {
  return deck?.source?.type === "google_sheet_tab" && !!deck?.source?.tabUrl;
}

/**
 * Centralizes all Google Sheets-related deck actions:
 * - import one deck
 * - import from index
 * - refresh one deck
 * - refresh all sheet decks
 *
 * Keeps "hiddenIds" intact when updating decks.
 */
export function useSheetsDeckActions({ decks, setDecks }) {
  const refreshDeck = useCallback(
    async (deck) => {
      if (!isSheetDeck(deck)) return null;

      const existingHidden = deck.hiddenIds ?? new Set();
      const existingName = deck.name;

      const refreshed = await importDeckFromPublishedTabUrl(
        deck.source.tabUrl,
        existingName
      );

      setDecks((prev) =>
        prev.map((d) => {
          if (d.id !== deck.id) return d;
          return {
            ...d,
            ...refreshed,
            id: d.id, // preserve id (built-ins/custom)
            name: existingName,
            builtin: !!d.builtin,
            hiddenIds: existingHidden, // keep user progress
            lastSyncAt: Date.now(),
            source: { ...d.source, ...refreshed.source },
          };
        })
      );

      return refreshed;
    },
    [setDecks]
  );

  const refreshAllSheets = useCallback(async () => {
    const sheetDecks = decks.filter(isSheetDeck);
    for (const d of sheetDecks) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await refreshDeck(d);
      } catch {
        // ignore per-deck refresh errors for now
      }
    }
  }, [decks, refreshDeck]);

  const importSingleDeck = useCallback(
    async ({ url, name }) => {
      const newDeck = await importDeckFromPublishedTabUrl(url, name);

      setDecks((prev) => {
        const exists = prev.some((d) => d.id === newDeck.id);
        return exists
          ? prev.map((d) =>
              d.id === newDeck.id
                ? { ...newDeck, hiddenIds: d.hiddenIds, lastSyncAt: Date.now() }
                : d
            )
          : [{ ...newDeck, lastSyncAt: Date.now() }, ...prev];
      });

      return newDeck;
    },
    [setDecks]
  );

  const importFromIndex = useCallback(
    async ({ indexUrl, onProgress }) => {
      const items = await importDeckIndexFromPublishedTabUrl(indexUrl);

      for (let i = 0; i < items.length; i++) {
        const { name, url } = items[i];
        if (onProgress) onProgress({ step: i + 1, total: items.length, name });

        // eslint-disable-next-line no-await-in-loop
        const d = await importDeckFromPublishedTabUrl(url, name);

        setDecks((prev) => {
          const exists = prev.some((x) => x.id === d.id);
          return exists
            ? prev.map((x) =>
                x.id === d.id
                  ? { ...d, hiddenIds: x.hiddenIds, lastSyncAt: Date.now() }
                  : x
              )
            : [{ ...d, lastSyncAt: Date.now() }, ...prev];
        });
      }

      return items.length;
    },
    [setDecks]
  );

  return {
    refreshDeck,
    refreshAllSheets,
    importSingleDeck,
    importFromIndex,
  };
}
