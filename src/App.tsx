import { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeQueryType, setActiveQueryType] = useState('nsql');
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark-theme');
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`}>
      <Sidebar />
      <main className="content-area">
        <header className="content-header">
          <div className="breadcrumb">
            <span>Database Explorer</span>
          </div>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleDarkMode}>
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <div className="query-type-selector">
              <button 
                className={`query-type-btn ${activeQueryType === 'nsql' ? 'active' : ''}`} 
                data-type="nsql"
                onClick={() => setActiveQueryType('nsql')}
              >
                <i className="fas fa-terminal"></i>
                <span>NSQL</span>
              </button>
              <button 
                className={`query-type-btn ${activeQueryType === 'sql' ? 'active' : ''}`} 
                data-type="sql"
                onClick={() => setActiveQueryType('sql')}
              >
                <i className="fas fa-code"></i>
                <span>SQL</span>
              </button>
              <button 
                className={`query-type-btn ${activeQueryType === 'nosql' ? 'active' : ''}`} 
                data-type="nosql"
                onClick={() => setActiveQueryType('nosql')}
              >
                <i className="fas fa-file-code"></i>
                <span>NoSQL</span>
              </button>
            </div>
            <button className="btn-primary">
              <i className="fas fa-plus"></i>
              <span>New Query</span>
            </button>
          </div>
        </header>
        <div className="content-body">
          <div className="welcome-banner">
            <h1>Welcome to DB Admin</h1>
            <p>A unified database management system that supports SQL, NoSQL, and in-memory data all in one place, powered by NSQL - a dynamic query language for seamless data access across paradigms.</p>
            <div className="feature-cards">
              <div className="feature-card sql">
                <div className="feature-icon">
                  <i className="fas fa-table"></i>
                </div>
                <h3>SQL Tables</h3>
                <p>Traditional relational tables with schemas, constraints, and SQL queries.</p>
              </div>
              <div className="feature-card nosql">
                <div className="feature-icon">
                  <i className="fas fa-layer-group"></i>
                </div>
                <h3>NoSQL Collections</h3>
                <p>Schema-free document collections for flexible, hierarchical data.</p>
              </div>
              <div className="feature-card memory">
                <div className="feature-icon">
                  <i className="fas fa-bolt"></i>
                </div>
                <h3>Memory Stores</h3>
                <p>Ultra-fast key-value stores with optional TTL for caching and sessions.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
