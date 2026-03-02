export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="header">
      <div className="container">
        <div className="topbar">
          <div className="brand">
            <div className="logo" aria-hidden="true" />
            ReactCards
          </div>

          <nav className="nav">
            <button
              className={`tab-btn ${activeTab === "admin" ? "is-active" : ""}`}
              type="button"
              onClick={() => setActiveTab("admin")}
            >
              Admin
            </button>

            <button
              className={`tab-btn ${activeTab === "drill" ? "is-active" : ""}`}
              type="button"
              onClick={() => setActiveTab("drill")}
            >
              Drill
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
