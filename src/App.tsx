import { useState } from "react";
import "./App.css";
import Layout from "./layouts/Layout";
import { useTheme } from "./contexts/ThemeContext";

function App() {
  const { isDarkMode, toggleTheme, themeLoaded } = useTheme();
  const [activeQueryType, setActiveQueryType] = useState('nsql');
  const [activePage, setActivePage] = useState('explorer');

  // Render appropriate content based on active page
  const renderPageContent = () => {
    switch(activePage) {
      case 'explorer':
        return (
          <>
            <header className="content-header">
              <div className="breadcrumb">
                <span>Database Explorer</span>
              </div>
              <div className="header-actions">
                <button className="theme-toggle" onClick={toggleTheme}>
                  <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>
                <div className="query-type-selector">
                  <button 
                    className={`query-type-btn ${activeQueryType === 'nsql' ? 'active' : ''}`} 
                    data-type="nsql"
                    onClick={() => setActiveQueryType('nsql')}
                  >
                    <i className="fas fa-terminal"></i>
                    <span className="btn-text">NSQL</span>
                  </button>
                  <button 
                    className={`query-type-btn ${activeQueryType === 'sql' ? 'active' : ''}`} 
                    data-type="sql"
                    onClick={() => setActiveQueryType('sql')}
                  >
                    <i className="fas fa-code"></i>
                    <span className="btn-text">SQL</span>
                  </button>
                  <button 
                    className={`query-type-btn ${activeQueryType === 'nosql' ? 'active' : ''}`} 
                    data-type="nosql"
                    onClick={() => setActiveQueryType('nosql')}
                  >
                    <i className="fas fa-file-code"></i>
                    <span className="btn-text">NoSQL</span>
                  </button>
                </div>
                <button className="btn-primary">
                  <i className="fas fa-plus"></i>
                  <span className="btn-text">New Query</span>
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
          </>
        );
        
      case 'query':
        return (
          <>
            <header className="content-header">
              <div className="breadcrumb">
                <span>Query Editor</span>
              </div>
              <div className="header-actions">
                <button className="theme-toggle" onClick={toggleTheme}>
                  <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>
                <button className="btn-primary">
                  <i className="fas fa-play"></i>
                  <span className="btn-text">Run Query</span>
                </button>
              </div>
            </header>
            <div className="content-body">
              <div className="query-editor-placeholder">
                <i className="fa-solid fa-code"></i>
                <p>Query editor interface coming soon</p>
              </div>
            </div>
          </>
        );
        
      default:
        return (
          <>
            <header className="content-header">
              <div className="breadcrumb">
                <span>{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</span>
              </div>
              <div className="header-actions">
                <button className="theme-toggle" onClick={toggleTheme}>
                  <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>
              </div>
            </header>
            <div className="content-body">
              <div className="page-content">
                <h1>{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h1>
                <p>This page is under construction</p>
              </div>
            </div>
          </>
        );
    }
  };

  // Show a loading indicator if theme hasn't loaded yet
  if (!themeLoaded) {
    return <div className="theme-loading">Loading application...</div>;
  }

  return (
    <Layout 
      activePage={activePage} 
      setActivePage={setActivePage} 
      isDarkMode={isDarkMode}
    >
      {renderPageContent()}
    </Layout>
  );
}

export default App;
