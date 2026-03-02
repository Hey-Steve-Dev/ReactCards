// src/pages/Admin.jsx
import ImportDeck from "../components/admin/ImportDeck";
import ImportIndex from "../components/admin/ImportIndex";
import AutoRefreshSettings from "../components/admin/AutoRefreshSettings";
import DeckList from "../components/admin/DeckList";
import AdminDeckView from "../components/admin/AdminDeckView";

export default function Admin({
  // import deck
  importUrl,
  setImportUrl,
  importName,
  setImportName,
  importStatus,
  importBusy,
  onImportDeck,

  // import index
  indexUrl,
  setIndexUrl,
  indexStatus,
  indexBusy,
  onImportIndex,

  // refresh settings
  autoRefreshOnLoad,
  setAutoRefreshOnLoad,
  autoRefreshIntervalMin,
  setAutoRefreshIntervalMin,
  onRefreshNow,

  // decks
  decks,
  selectedDeckId,
  setSelectedDeckId,
  onDeleteDeck,
  onRenameDeck,
  onRefreshDeck,

  // cards panel
  selectedDeck,
  search,
  setSearch,
  onUnhideAll,
  filteredCards,
  onToggleHidden,
}) {
  return (
    <section className="admin-layout">
      <aside className="stack">
        <ImportDeck
          importUrl={importUrl}
          setImportUrl={setImportUrl}
          importName={importName}
          setImportName={setImportName}
          importStatus={importStatus}
          importBusy={importBusy}
          onImport={onImportDeck}
        />

        <ImportIndex
          indexUrl={indexUrl}
          setIndexUrl={setIndexUrl}
          indexStatus={indexStatus}
          indexBusy={indexBusy}
          onImportIndex={onImportIndex}
        />

        <AutoRefreshSettings
          autoRefreshOnLoad={autoRefreshOnLoad}
          setAutoRefreshOnLoad={setAutoRefreshOnLoad}
          autoRefreshIntervalMin={autoRefreshIntervalMin}
          setAutoRefreshIntervalMin={setAutoRefreshIntervalMin}
          onRefreshNow={onRefreshNow}
        />

        <DeckList
          decks={decks}
          selectedDeckId={selectedDeckId}
          onSelectDeck={setSelectedDeckId}
          onDeleteDeck={onDeleteDeck}
          onRenameDeck={onRenameDeck}
          onRefreshDeck={onRefreshDeck}
        />
      </aside>

      <AdminDeckView
        selectedDeck={selectedDeck}
        search={search}
        setSearch={setSearch}
        onUnhideAll={onUnhideAll}
        filteredCards={filteredCards}
        onToggleHidden={onToggleHidden}
      />
    </section>
  );
}
