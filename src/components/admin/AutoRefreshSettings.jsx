export default function AutoRefreshSettings({
  autoRefreshOnLoad,
  setAutoRefreshOnLoad,
  autoRefreshIntervalMin,
  setAutoRefreshIntervalMin,
  onRefreshNow,
}) {
  return (
    <div className="card">
      <h2>Auto-refresh</h2>

      <label className="muted" style={{ display: "block", marginTop: 8 }}>
        <input
          type="checkbox"
          checked={autoRefreshOnLoad}
          onChange={(e) => setAutoRefreshOnLoad(e.target.checked)}
          style={{ marginRight: 8 }}
        />
        Refresh all sheet decks on load
      </label>

      <div className="row" style={{ marginTop: 12 }}>
        <input
          className="input"
          type="number"
          min="0"
          step="1"
          value={autoRefreshIntervalMin}
          onChange={(e) => setAutoRefreshIntervalMin(Number(e.target.value))}
          placeholder="0"
          title="0 = off"
        />
        <button className="btn" type="button" onClick={onRefreshNow}>
          Refresh Now
        </button>
      </div>

      <div className="muted" style={{ marginTop: 8 }}>
        Interval minutes (0 = off). Refresh keeps your hidden cards.
      </div>
    </div>
  );
}
