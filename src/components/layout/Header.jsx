// src/components/layout/Header.jsx
import { NavLink, Link } from "react-router-dom";
import logo from "../../assets/icon.png";

export default function Header() {
  const linkClass = ({ isActive }) => `tab-btn ${isActive ? "is-active" : ""}`;

  return (
    <header className="header">
      <div className="container">
        <div className="topbar">
          <Link to="/" className="brand">
            <img src={logo} alt="App icon" className="brand-logo" />
            ReactCards
          </Link>

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
