export default function ImportIndex({
  indexUrl,
  setIndexUrl,
  indexStatus,
  indexBusy,
  onImportIndex,
}) {
  return (
    <div className="card">
      <h2>Import deck index</h2>
      <div className="muted">
        Index tab columns: <strong>Name</strong>, <strong>URL</strong>. Each row imports a
        deck.
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <input
          className="input"
          type="url"
          placeholder="Paste index tab link"
          value={indexUrl}
          onChange={(e) => setIndexUrl(e.target.value)}
        />
        <button
          className="btn accent"
          type="button"
          onClick={onImportIndex}
          disabled={indexBusy}
        >
          {indexBusy ? "Importing…" : "Import Index"}
        </button>
      </div>

      {indexStatus ? (
        <div className="muted" style={{ marginTop: 10 }}>
          {indexStatus}
        </div>
      ) : null}
    </div>
  );
}
