// src/App.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Header from "./components/layout/Header";

import DrillView from "./components/drill/DrillView";
import About from "./pages/About";
import Admin from "./pages/Admin";

import { useDeckStorage } from "./hooks/useDeckStorage";
import { useBuiltinDecks } from "./hooks/useBuiltinDecks";
import {
  importDeckFromPublishedTabUrl,
  importDeckIndexFromPublishedTabUrl,
} from "./lib/sheetsImport";

const LS_SETTINGS_KEY = "reactcards_settings_v1";

function isSheetDeck(deck) {
  return deck?.source?.type === "google_sheet_tab" && !!deck?.source?.tabUrl;
}

export default function App() {
  // Settings
  const [autoRefreshOnLoad, setAutoRefreshOnLoad] = useState(true);
  const [autoRefreshIntervalMin, setAutoRefreshIntervalMin] = useState(0); // 0 = off

  // Decks persisted via hook
  const [decks, setDecks] = useDeckStorage([]);
  useBuiltinDecks({ decks, setDecks, autoRefresh: autoRefreshOnLoad });

  const [selectedDeckId, setSelectedDeckId] = useState(() => decks[0]?.id ?? null);
  const [search, setSearch] = useState("");

  // Single deck import
  const [importUrl, setImportUrl] = useState("");
  const [importName, setImportName] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [importBusy, setImportBusy] = useState(false);

  // Deck index import
  const [indexUrl, setIndexUrl] = useState("");
  const [indexStatus, setIndexStatus] = useState("");
  const [indexBusy, setIndexBusy] = useState(false);

  // Keep selectedDeckId valid if decks change
  useEffect(() => {
    if (!decks.length) {
      setSelectedDeckId(null);
      return;
    }
    if (selectedDeckId && decks.some((d) => d.id === selectedDeckId)) return;
    setSelectedDeckId(decks[0].id);
  }, [decks, selectedDeckId]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_SETTINGS_KEY,
        JSON.stringify({ autoRefreshOnLoad, autoRefreshIntervalMin })
      );
    } catch {}
  }, [autoRefreshOnLoad, autoRefreshIntervalMin]);

  // Load settings on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_SETTINGS_KEY);
      if (!saved) return;
      const s = JSON.parse(saved);
      if (typeof s.autoRefreshOnLoad === "boolean")
        setAutoRefreshOnLoad(s.autoRefreshOnLoad);
      if (typeof s.autoRefreshIntervalMin === "number")
        setAutoRefreshIntervalMin(s.autoRefreshIntervalMin);
    } catch {}
  }, []);

  const selectedDeck = useMemo(
    () => decks.find((d) => d.id === selectedDeckId) ?? null,
    [decks, selectedDeckId]
  );

  const filteredCards = useMemo(() => {
    if (!selectedDeck) return [];
    const q = search.toLowerCase().trim();
    if (!q) return selectedDeck.cards;
    return selectedDeck.cards.filter(
      (c) => c.question.toLowerCase().includes(q) || c.answer.toLowerCase().includes(q)
    );
  }, [selectedDeck, search]);

  function toggleHidden(cardId) {
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== selectedDeckId) return d;
        const nextHidden = new Set(d.hiddenIds);
        if (nextHidden.has(cardId)) nextHidden.delete(cardId);
        else nextHidden.add(cardId);
        return { ...d, hiddenIds: nextHidden };
      })
    );
  }

  function unhideAll() {
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== selectedDeckId) return d;
        return { ...d, hiddenIds: new Set() };
      })
    );
  }

  function deleteDeck(deckId) {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
  }

  function renameDeck(deckId, newName) {
    const name = String(newName || "").trim();
    if (!name) return;
    setDecks((prev) => prev.map((d) => (d.id === deckId ? { ...d, name } : d)));
  }

  async function refreshDeck(deck) {
    if (!isSheetDeck(deck)) return;

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
          id: d.id,
          name: existingName,
          builtin: !!d.builtin,
          hiddenIds: existingHidden,
          lastSyncAt: Date.now(),
          source: { ...d.source, ...refreshed.source },
        };
      })
    );
  }

  async function refreshAllSheets() {
    const sheetDecks = decks.filter(isSheetDeck);
    for (const d of sheetDecks) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await refreshDeck(d);
      } catch {
        // ignore per-deck refresh errors for now
      }
    }
  }

  // Auto-refresh on load (once)
  const didAutoRefreshRef = useRef(false);
  useEffect(() => {
    if (!autoRefreshOnLoad) return;
    if (didAutoRefreshRef.current) return;
    if (!decks.length) return;

    didAutoRefreshRef.current = true;
    refreshAllSheets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefreshOnLoad, decks.length]);

  // Optional interval refresh
  useEffect(() => {
    if (!autoRefreshIntervalMin || autoRefreshIntervalMin < 1) return;

    const ms = autoRefreshIntervalMin * 60 * 1000;
    const t = setInterval(() => {
      refreshAllSheets();
    }, ms);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefreshIntervalMin, decks.length]);

  async function handleImportDeck() {
    try {
      setImportBusy(true);
      setImportStatus("Importing…");

      const newDeck = await importDeckFromPublishedTabUrl(importUrl, importName);

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

      setSelectedDeckId(newDeck.id);
      setSearch("");
      setImportStatus(`Imported ${newDeck.cards.length} cards ✅`);
      setImportUrl("");
      setImportName("");
    } catch (e) {
      setImportStatus(e?.message || "Import failed.");
    } finally {
      setImportBusy(false);
    }
  }

  async function handleImportIndex() {
    try {
      setIndexBusy(true);
      setIndexStatus("Reading index…");

      const items = await importDeckIndexFromPublishedTabUrl(indexUrl);

      setIndexStatus(`Index found ${items.length} decks. Importing…`);

      for (let i = 0; i < items.length; i++) {
        const { name, url } = items[i];
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

      setIndexStatus("Index import complete ✅");
      setIndexUrl("");
    } catch (e) {
      setIndexStatus(e?.message || "Index import failed.");
    } finally {
      setIndexBusy(false);
    }
  }

  return (
    <div className="app">
      <Header />

      <main className="main">
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />

            <Route
              path="/admin"
              element={
                <Admin
                  importUrl={importUrl}
                  setImportUrl={setImportUrl}
                  importName={importName}
                  setImportName={setImportName}
                  importStatus={importStatus}
                  importBusy={importBusy}
                  onImportDeck={handleImportDeck}
                  indexUrl={indexUrl}
                  setIndexUrl={setIndexUrl}
                  indexStatus={indexStatus}
                  indexBusy={indexBusy}
                  onImportIndex={handleImportIndex}
                  autoRefreshOnLoad={autoRefreshOnLoad}
                  setAutoRefreshOnLoad={setAutoRefreshOnLoad}
                  autoRefreshIntervalMin={autoRefreshIntervalMin}
                  setAutoRefreshIntervalMin={setAutoRefreshIntervalMin}
                  onRefreshNow={refreshAllSheets}
                  decks={decks}
                  selectedDeckId={selectedDeckId}
                  setSelectedDeckId={setSelectedDeckId}
                  onDeleteDeck={deleteDeck}
                  onRenameDeck={renameDeck}
                  onRefreshDeck={refreshDeck}
                  selectedDeck={selectedDeck}
                  search={search}
                  setSearch={setSearch}
                  onUnhideAll={unhideAll}
                  filteredCards={filteredCards}
                  onToggleHidden={toggleHidden}
                />
              }
            />

            <Route
              path="/drill"
              element={
                <DrillView
                  decks={decks}
                  selectedDeckId={selectedDeckId}
                  setSelectedDeckId={setSelectedDeckId}
                  setDecks={setDecks}
                />
              }
            />

            <Route path="/about" element={<About />} />

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
