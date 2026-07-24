import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="navbar-brand-mark">₿</span>
          Portfolio
        </NavLink>
        <ul className="navbar-links">
          <li>
            <NavLink to="/create" className="navbar-link" activeClassName="is-active">
              Add Holding
            </NavLink>
          </li>
          <li>
            <NavLink to="/user" className="navbar-link" activeClassName="is-active">
              New Cryptocurrency
            </NavLink>
          </li>
        </ul>
      </div>
    </header>
  );
}
