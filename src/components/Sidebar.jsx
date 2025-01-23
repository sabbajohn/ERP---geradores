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
  FaUserCog,
  FaCalendarAlt,
  FaBoxes
} from 'react-icons/fa';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <FaBolt /> DSG Locações
      </div>
      <nav>
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/dashboard" exact>
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
            <NavLink to="/calendar">
              <FaCalendarAlt /> <span>Calendário</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports">
              <FaChartBar /> <span>Atendimentos</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/notifications">
              <FaBell /> <span>Notificações</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/technicians">
              <FaUserCog /> <span>Técnicos</span>
            </NavLink>
          </li>
          <li><NavLink to="/inventory">
            <FaBoxes /> <span>Estoque</span>
          </NavLink></li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
