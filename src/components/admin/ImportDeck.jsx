export default function ImportDeck({
  importUrl,
  setImportUrl,
  importName,
  setImportName,
  importStatus,
  importBusy,
  onImport,
}) {
  return (
    <div className="card">
      <h2>Import deck (Google Sheets)</h2>
      <div className="muted">
        Paste a publicly viewable Sheets link. Columns:{" "}
        <strong>Question</strong>, <strong>Answer</strong>. (If gid is missing, we
        default to the first tab.)
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <input
          className="input"
          type="url"
          placeholder="https://docs.google.com/spreadsheets/d/.../edit"
          value={importUrl}
          onChange={(e) => setImportUrl(e.target.value)}
        />
      </div>

      <div className="row" style={{ marginTop: 10 }}>
        <input
          className="input"
          type="text"
          placeholder="Deck name (optional)"
          value={importName}
          onChange={(e) => setImportName(e.target.value)}
        />
        <button
          className="btn primary"
          type="button"
          onClick={onImport}
          disabled={importBusy}
        >
          {importBusy ? "Importing…" : "Import"}
        </button>
      </div>

      {importStatus ? (
        <div className="muted" style={{ marginTop: 10 }}>
          {importStatus}
        </div>
      ) : null}
    </div>
  );
}