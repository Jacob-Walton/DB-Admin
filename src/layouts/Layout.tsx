import React from 'react';
import NavigationSidebar from '../components/NavigationSidebar';
import Sidebar from '../components/Sidebar';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  isDarkMode: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activePage, 
  setActivePage, 
  isDarkMode 
}) => {
  // Only show object explorer on the explorer page
  const showObjectExplorer = activePage === 'explorer';
  
  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`}>
      {/* Left navigation sidebar */}
      <NavigationSidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
      />
      
      {/* Main content area with conditional object explorer */}
      <div className={`main-content ${showObjectExplorer ? 'with-explorer' : ''}`}>
        {showObjectExplorer && <Sidebar />}
        
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
