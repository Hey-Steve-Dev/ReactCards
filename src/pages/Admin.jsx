// src/pages/Admin.jsx
import ImportDeck from "../components/admin/ImportDeck";
import ImportIndex from "../components/admin/ImportIndex";
import AutoRefreshSettings from "../components/admin/AutoRefreshSettings";
import DeckList from "../components/admin/DeckList";
import AdminDeckView from "../components/admin/AdminDeckView";

export default function Admin({
  importUrl,
  setImportUrl,
  importName,
  setImportName,
  importStatus,
  importBusy,
  onImportDeck,

  indexUrl,
  setIndexUrl,
  indexStatus,
  indexBusy,
  onImportIndex,

  autoRefreshOnLoad,
  setAutoRefreshOnLoad,
  autoRefreshIntervalMin,
  setAutoRefreshIntervalMin,
  onRefreshNow,

  decks,
  selectedDeckId,
  setSelectedDeckId,
  onDeleteDeck,
  onRenameDeck,
  onRefreshDeck,

  selectedDeck,
  search,
  setSearch,
  onUnhideAll,
  filteredCards,
  onToggleHidden,
}) {
  return (
    <section className="admin-layout admin-layout--grid">
      {/* LEFT: scrollable deck list */}
      <aside className="admin-decks">
        <DeckList
          decks={decks}
          selectedDeckId={selectedDeckId}
          onSelectDeck={setSelectedDeckId}
          onDeleteDeck={onDeleteDeck}
          onRenameDeck={onRenameDeck}
          onRefreshDeck={onRefreshDeck}
        />
      </aside>

      {/* RIGHT: selected deck cards panel */}
      <div className="admin-view">
        <AdminDeckView
          selectedDeck={selectedDeck}
          search={search}
          setSearch={setSearch}
          onUnhideAll={onUnhideAll}
          filteredCards={filteredCards}
          onToggleHidden={onToggleHidden}
        />
      </div>

      {/* BOTTOM: import/refresh tools */}
      <div className="admin-tools">
        <div className="admin-tools-grid">
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
        </div>
      </div>
    </section>
  );
}
