// src/components/layout/Header.jsx
import { NavLink } from "react-router-dom";

export default function Header() {
  const linkClass = ({ isActive }) => `tab-btn ${isActive ? "is-active" : ""}`;

  return (
    <header className="header">
      <div className="container">
        <div className="topbar">
          <div className="brand">
            <div className="logo" aria-hidden="true" />
            ReactCards
          </div>

          <nav className="nav">
            <NavLink to="/admin" className={linkClass} style={{ textDecoration: "none" }}>
              Admin
            </NavLink>

            <NavLink to="/drill" className={linkClass} style={{ textDecoration: "none" }}>
              Drill
            </NavLink>

            <NavLink to="/about" className={linkClass} style={{ textDecoration: "none" }}>
              About
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
