import { Link } from "react-router-dom";
import icon from "../assets/icon.png";

function SplashFeature({ title, text, pill, delay = 0 }) {
  return (
    <article
      className="splash-card"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="pill">{pill}</span>
          <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
        </div>
        <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
          {text}
        </p>
      </div>
    </article>
  );
}

export default function Splash() {
  return (
    <main className="splash-page">
      <style>{`
        @keyframes splashIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes splashGlow {
          0% { opacity: .55; transform: scale(1); }
          100% { opacity: .9; transform: scale(1.03); }
        }

        .splash-page {
          width: 100%;
        }

        .splash-shell {
          position: relative;
          overflow: hidden;
          border-radius: 22px;
          padding: 20px;
          border: 1px solid var(--border);
          background: var(--panel-strong);
          box-shadow: var(--shadow);
        }

        .splash-shell::before {
          content: "";
          position: absolute;
          inset: -90px;
          background:
            radial-gradient(520px 260px at 15% 20%, rgba(111,123,255,.32), transparent 60%),
            radial-gradient(520px 260px at 85% 20%, rgba(0,214,199,.24), transparent 60%),
            radial-gradient(620px 320px at 55% 100%, rgba(255,154,122,.20), transparent 70%);
          filter: blur(10px);
          animation: splashGlow 1800ms ease-in-out infinite alternate;
          pointer-events: none;
        }

        .splash-shell > * {
          position: relative;
        }

        .splash-hero {
          display: grid;
          gap: 18px;
          align-items: center;
        }

        @media (min-width: 900px) {
          .splash-hero {
            grid-template-columns: 1.1fr .9fr;
            gap: 22px;
          }
        }

        .splash-copy-wrap {
          animation: splashIn 500ms ease forwards;
        }

        .splash-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.14);
          color: var(--text);
          font-weight: 800;
          font-size: 12px;
          letter-spacing: .2px;
          box-shadow: 0 10px 22px rgba(0,0,0,.16);
        }

        .splash-title {
          margin: 0;
          font-size: clamp(2.2rem, 5vw, 4rem);
          line-height: .95;
          letter-spacing: -0.03em;
        }

        .splash-sub {
          margin: 0;
          max-width: 58ch;
          line-height: 1.7;
          font-size: 1rem;
        }

        .splash-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 4px;
        }

        .splash-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 160px;
          padding: 12px 18px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 900;
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            background 180ms ease,
            border-color 180ms ease;
        }

        .splash-btn:hover {
          transform: translateY(-1px);
        }

        .splash-btn-primary {
          color: #fff;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          box-shadow: 0 14px 26px rgba(0,0,0,.22);
          border: 1px solid transparent;
        }

        .splash-btn-secondary {
          color: var(--text);
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.15);
          box-shadow: 0 10px 22px rgba(0,0,0,.14);
        }

        .splash-visual {
          min-width: 0;
          animation: splashIn 620ms ease forwards;
        }

        .splash-visual-card {
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 18px;
          background: rgba(255,255,255,.08);
          box-shadow: 0 12px 28px rgba(0,0,0,.18);
        }

        .splash-logo-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 14px;
        }

        .splash-logo-orb {
          width: 120px;
          height: 120px;
          border-radius: 28px;
          display: grid;
          place-items: center;
          background:
            linear-gradient(135deg, rgba(111,123,255,.28), rgba(0,214,199,.18));
          border: 1px solid rgba(255,255,255,.14);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.08),
            0 18px 30px rgba(0,0,0,.20);
          backdrop-filter: blur(10px);
        }

        .splash-logo {
          width: 64px;
          height: 64px;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 8px 18px rgba(0,0,0,.18));
        }

        .splash-mini-stack {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }

        .splash-mini-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 16px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
        }

        .splash-mini-label {
          font-weight: 800;
          font-size: 14px;
        }

        .splash-mini-value {
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
          text-align: right;
        }

        .splash-features {
          display: grid;
          gap: 12px;
          margin-top: 16px;
        }

        @media (min-width: 760px) {
          .splash-features {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        .splash-card {
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 16px;
          background: rgba(255,255,255,.09);
          box-shadow: 0 10px 22px rgba(0,0,0,.16);
          opacity: 0;
          transform: translateY(10px);
          animation: splashIn 520ms ease forwards;
        }
      `}</style>

      <section className="splash-shell">
        <div className="splash-hero">
          <div className="splash-copy-wrap">
            <div className="splash-badge">
              Fast study. Clean interface. No account needed.
            </div>

            <h1 className="splash-title" style={{ marginTop: 14 }}>
              ReactCards
            </h1>

            <p className="muted splash-sub" style={{ marginTop: 14 }}>
              Turn a published Google Sheet into a clean flashcard deck in seconds. Build,
              import, organize, and drill cards in a lightweight study app that stays out
              of your way.
            </p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              <span className="pill">Google Sheets</span>
              <span className="pill">Local storage</span>
              <span className="pill">No login</span>
              <span className="pill">Totally free</span>
            </div>

            <div className="splash-actions">
              <Link to="/admin" className="splash-btn splash-btn-primary">
                Open Admin
              </Link>
              <Link to="/drill" className="splash-btn splash-btn-secondary">
                Start Drilling
              </Link>
            </div>
          </div>

          <div className="splash-visual">
            <div className="splash-visual-card">
              <div className="splash-logo-wrap">
                <div className="splash-logo-orb">
                  <img src={icon} alt="ReactCards icon" className="splash-logo" />
                </div>
              </div>

              <div style={{ textAlign: "center", marginBottom: 10 }}>
                <div style={{ fontWeight: 900, fontSize: 18 }}>
                  Study flow at a glance
                </div>
                <div className="muted" style={{ marginTop: 6, lineHeight: 1.6 }}>
                  Import a sheet, drill your cards, and keep progress saved in your
                  browser.
                </div>
              </div>

              <div className="splash-mini-stack">
                <div className="splash-mini-row">
                  <div className="splash-mini-label">1. Import a deck</div>
                  <div className="splash-mini-value">Sheet → Cards</div>
                </div>
                <div className="splash-mini-row">
                  <div className="splash-mini-label">2. Drill fast</div>
                  <div className="splash-mini-value">Question / Answer</div>
                </div>
                <div className="splash-mini-row">
                  <div className="splash-mini-label">3. Hide what you know</div>
                  <div className="splash-mini-value">Saved locally</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="splash-features">
          <SplashFeature
            delay={80}
            pill="Import"
            title="Create decks quickly"
            text="Paste a published Google Sheet link and turn rows into study cards with almost no setup."
          />
          <SplashFeature
            delay={160}
            pill="Drill"
            title="Study without clutter"
            text="Move through cards in a clean drill flow built for speed, focus, and repeat practice."
          />
          <SplashFeature
            delay={240}
            pill="Progress"
            title="Keep what matters local"
            text="Hidden-card progress stays in your browser, so your study state is there when you come back."
          />
        </section>
      </section>
    </main>
  );
}
