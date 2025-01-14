import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaBolt,
  FaHome,
  FaUsers,
  FaCog,
  FaTools,
  FaChartBar,
  FaBell,
  FaCogs
} from 'react-icons/fa';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <FaBolt /> Geradores De Qualidade
      </div>
      <nav>
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/">
              <FaHome /> <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/customers">
              <FaUsers /> <span>Clientes</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/generators">
              <FaCog /> <span>Geradores</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/maintenance">
              <FaTools /> <span>Manutenção</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports">
              <FaChartBar /> <span>Relatórios</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/notifications">
              <FaBell /> <span>Notificações</span>
            </NavLink>
          </li>

        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;