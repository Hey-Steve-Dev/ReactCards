// src/App.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Header from "./components/layout/Header";

import About from "./pages/About";
import Admin from "./pages/Admin";
import Drill from "./pages/Drill";

import { useDeckStorage } from "./hooks/useDeckStorage";
import { useBuiltinDecks } from "./hooks/useBuiltinDecks";
import { useSheetsDeckActions } from "./hooks/useSheetDeckActions";

const LS_SETTINGS_KEY = "reactcards_settings_v1";

export default function App() {
  // Settings
  const [autoRefreshOnLoad, setAutoRefreshOnLoad] = useState(true);
  const [autoRefreshIntervalMin, setAutoRefreshIntervalMin] = useState(0); // 0 = off

  // Decks persisted via hook
  const [decks, setDecks, hydrated] = useDeckStorage([]);
  useBuiltinDecks({ setDecks, autoRefresh: autoRefreshOnLoad, hydrated });
  const { refreshDeck, refreshAllSheets, importSingleDeck, importFromIndex } =
    useSheetsDeckActions({ decks, setDecks });
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

  // Auto-refresh on load (once)
  useEffect(() => {
    if (!autoRefreshIntervalMin || autoRefreshIntervalMin < 1) return;

    const ms = autoRefreshIntervalMin * 60 * 1000;
    const t = setInterval(() => {
      refreshAllSheets();
    }, ms);

    return () => clearInterval(t);
  }, [autoRefreshIntervalMin, decks.length, refreshAllSheets]);

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

      const newDeck = await importSingleDeck({ url: importUrl, name: importName });

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

      const count = await importFromIndex({
        indexUrl,
        onProgress: ({ step, total, name }) => {
          setIndexStatus(`Importing ${step}/${total}: ${name}`);
        },
      });

      setIndexStatus(`Index import complete ✅ (${count} decks)`);
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
                <Drill
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
