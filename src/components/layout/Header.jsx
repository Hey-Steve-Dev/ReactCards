// src/components/layout/Header.jsx
import { NavLink } from "react-router-dom";
import logo from "../../assets/icon.png"; // <-- adjust filename if needed

export default function Header() {
  const linkClass = ({ isActive }) => `tab-btn ${isActive ? "is-active" : ""}`;

  return (
    <header className="header">
      <div className="container">
        <div className="topbar">
          <div className="brand">
            <img src={logo} alt="App icon" className="brand-logo" />
            Flashcards
          </div>

          <nav className="nav">
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>

            <NavLink to="/drill" className={linkClass}>
              Drill
            </NavLink>

            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
