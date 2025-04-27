import React from 'react';
import './NavigationSidebar.css';

interface NavigationSidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ activePage, setActivePage }) => {
  const navItems = [
    { id: 'explorer', icon: 'fa-solid fa-database', label: 'Explorer' },
    { id: 'query', icon: 'fa-solid fa-code', label: 'Query' },
    { id: 'admin', icon: 'fa-solid fa-gear', label: 'Admin' },
    { id: 'monitoring', icon: 'fa-solid fa-chart-line', label: 'Monitoring' },
    { id: 'users', icon: 'fa-solid fa-users', label: 'Users' }
  ];

  return (
    <div className="nav-sidebar">
      <div className="nav-sidebar__logo">
        <i className="fa-solid fa-database"></i>
      </div>
      
      <div className="nav-sidebar__items">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-sidebar__item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
            title={item.label}
          >
            <i className={item.icon}></i>
            <span className="nav-item-tooltip">{item.label}</span>
          </button>
        ))}
      </div>
      
      <div className="nav-sidebar__bottom">
        <button className="nav-sidebar__item" title="Settings">
          <i className="fa-solid fa-sliders"></i>
          <span className="nav-item-tooltip">Settings</span>
        </button>
        <button className="nav-sidebar__item" title="Help">
          <i className="fa-solid fa-circle-question"></i>
          <span className="nav-item-tooltip">Help</span>
        </button>
      </div>
    </div>
  );
};

export default NavigationSidebar;
