import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Sidebar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { invoke } from '@tauri-apps/api/core';

// Database paradigm types
type DatabaseParadigm = 'sql' | 'nosql' | 'memory';

// Map object types to appropriate icons with additional paradigm support
const objectIcons: Record<string, string> = {
  'Servers': 'fa-solid fa-server icon-server',
  'Server': 'fa-solid fa-server icon-server',
  'Databases': 'fa-solid fa-database icon-database',
  'Database': 'fa-solid fa-database icon-database',
  'Schemas': 'fa-solid fa-folder icon-schema',
  'Schema': 'fa-solid fa-folder icon-schema',
  'Tables': 'fa-solid fa-table icon-table',
  'Collections': 'fa-solid fa-layer-group icon-collection',
  'KeySpace': 'fa-solid fa-key icon-keyspace',
  'SQL Table': 'fa-solid fa-table icon-sql',
  'NoSQL Collection': 'fa-solid fa-layer-group icon-nosql',
  'Memory Store': 'fa-solid fa-bolt icon-memory',
  'Columns': 'fa-solid fa-list icon-column',
  'Fields': 'fa-solid fa-list-check icon-field',
  'Keys': 'fa-solid fa-key icon-key',
  'Documents': 'fa-solid fa-file-code icon-document', // Changed icon
  'Constraints': 'fa-solid fa-lock icon-constraint',
  'Indexes': 'fa-solid fa-filter icon-index',
  'default': 'fa-solid fa-circle-dot'
};

// Expanded pluralization handling
const pluralToSingular: Record<string, string> = {
  'Indexes': 'Index',
  'Matrices': 'Matrix',
  'Vertices': 'Vertex',
  'Tables': 'Table',
  'Collections': 'Collection',
  'Documents': 'Document',
  'Keys': 'Key'
};

// Updated example data showing multi-paradigm capabilities
const explorerData: TreeNode[] = [
  {
    label: "Servers",
    count: 1,
    children: [
      {
        label: "Local Server",
        children: [
          {
            label: "Databases",
            count: 2,
            children: [
              {
                label: "DB Admin",
                dbType: "hybrid", // <-- use correct union type
                children: [
                  {
                    label: "SQL Tables",
                    paradigm: "sql",
                    count: 2,
                    children: [
                      {
                        label: "users",
                        paradigm: "sql",
                        type: "SQL Table",
                        children: [
                          {
                            label: "Columns",
                            count: 4,
                            children: [
                              { label: "id", type: "Column", dataType: "INT" },
                              { label: "username", type: "Column", dataType: "VARCHAR" },
                              { label: "email", type: "Column", dataType: "VARCHAR" },
                              { label: "created_at", type: "Column", dataType: "TIMESTAMP" }
                            ]
                          },
                          {
                            label: "Constraints",
                            count: 2,
                            children: [
                              { label: "PK_users", type: "Constraint", constraintType: "PRIMARY KEY" },
                              { label: "UQ_email", type: "Constraint", constraintType: "UNIQUE" }
                            ]
                          },
                          {
                            label: "Indexes",
                            count: 1,
                            children: [
                              { label: "IDX_username", type: "Index" }
                            ]
                          }
                        ]
                      },
                      {
                        label: "orders",
                        paradigm: "sql",
                        type: "SQL Table",
                        children: []
                      }
                    ]
                  },
                  {
                    label: "NoSQL Collections",
                    paradigm: "nosql",
                    count: 2,
                    children: [
                      {
                        label: "products",
                        paradigm: "nosql",
                        type: "NoSQL Collection",
                        children: [
                          {
                            label: "Fields",
                            count: 3,
                            children: [
                              { label: "_id", type: "Field", dataType: "ObjectId" },
                              { label: "name", type: "Field", dataType: "String" },
                              { label: "details", type: "Field", dataType: "Object" }
                            ]
                          },
                          {
                            label: "Indexes",
                            count: 1,
                            children: [
                              { label: "IDX_name", type: "Index" }
                            ]
                          }
                        ]
                      },
                      {
                        label: "reviews",
                        paradigm: "nosql",
                        type: "NoSQL Collection",
                        children: []
                      }
                    ]
                  },
                  {
                    label: "Memory Stores",
                    paradigm: "memory",
                    count: 2,
                    children: [
                      {
                        label: "sessions",
                        paradigm: "memory",
                        type: "Memory Store",
                        children: [
                          {
                            label: "Keys",
                            count: 2,
                            children: [
                              { label: "ttl", type: "Key", dataType: "Integer" },
                              { label: "data", type: "Key", dataType: "Hash" }
                            ]
                          }
                        ]
                      },
                      {
                        label: "cache",
                        paradigm: "memory",
                        type: "Memory Store",
                        children: []
                      }
                    ]
                  }
                ]
              },
              {
                label: "Analytics DB",
                dbType: "sql", // <-- use correct union type
                children: []
              }
            ]
          }
        ]
      }
    ]
  }
];

interface TreeNode {
  label: string;
  id?: string;
  count?: number;
  type?: string;
  paradigm?: DatabaseParadigm;
  dbType?: 'sql' | 'nosql' | 'memory' | 'hybrid';
  dataType?: string;
  constraintType?: string;
  children?: TreeNode[];
}

interface ContextMenuItem {
  icon: string;
  label: string;
  action: string;
  danger?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onSelect: (action: string) => void;
  onClose: () => void;
}

// Get appropriate icon for node type with paradigm support
const getNodeIcon = (node: TreeNode): string => {
  const { label, type, paradigm } = node;
  
  if (type && objectIcons[type]) {
    return objectIcons[type];
  }
  
  // Special case for typed tables/collections based on paradigm
  if (paradigm) {
    if (label.toLowerCase().includes('table') || label === 'Tables') {
      return objectIcons['SQL Table'];
    }
    if (label.toLowerCase().includes('collection') || label === 'Collections') {
      return objectIcons['NoSQL Collection'];
    }
    if (label.toLowerCase().includes('store') || label === 'Memory Stores') {
      return objectIcons['Memory Store'];
    }
    
    // Add paradigm-specific icon classes
    if (objectIcons[label]) {
      return `${objectIcons[label]} icon-${paradigm}`;
    }
  }
  
  // Try to find exact match first
  if (objectIcons[label]) {
    return objectIcons[label];
  }
  
  // Try singular/plural variations
  const singularLabel = label.endsWith('s') ? label.slice(0, -1) : label;
  const pluralLabel = label.endsWith('s') ? label : `${label}s`;
  
  if (objectIcons[singularLabel]) {
    return objectIcons[singularLabel];
  }
  
  if (objectIcons[pluralLabel]) {
    return objectIcons[pluralLabel];
  }
  
  return objectIcons.default;
};

// Generate context menu items based on node type and paradigm
const getContextMenuItems = (node: TreeNode): ContextMenuItem[] => {
  const { label, type, dbType } = node; // removed unused 'paradigm'
  const nodeType = type || label;
  
  const common: ContextMenuItem[] = [
    { icon: 'fa-solid fa-rotate', label: 'Refresh', action: 'refresh' }
  ];
  
  // Different options based on node type and paradigm
  switch(nodeType) {
    case 'Servers':
    case 'Server':
      return [
        ...common,
        { icon: 'fa-solid fa-plus', label: 'New Server', action: 'new-server' },
        { icon: 'fa-solid fa-pen-to-square', label: 'Properties', action: 'properties' }
      ];
    
    case 'Databases':
      return [
        ...common,
        { icon: 'fa-solid fa-plus', label: 'New Database', action: 'new-database' }
      ];
    
    case 'Database':
      const dbActions = [
        ...common,
        { icon: 'fa-solid fa-play', label: 'Query Tool', action: 'query-tool' },
        { divider: true } as ContextMenuItem,
        { icon: 'fa-solid fa-pen-to-square', label: 'Properties', action: 'properties' },
        { icon: 'fa-solid fa-trash', label: 'Delete/Drop', action: 'delete', danger: true }
      ];
      
      if (dbType === 'hybrid') {
        dbActions.splice(2, 0, 
          { icon: 'fa-solid fa-plus', label: 'New SQL Table', action: 'new-sql-table' },
          { icon: 'fa-solid fa-plus', label: 'New NoSQL Collection', action: 'new-nosql-collection' },
          { icon: 'fa-solid fa-plus', label: 'New Memory Store', action: 'new-memory-store' }
        );
      }
      return dbActions;
    
    case 'SQL Tables':
      return [
        ...common,
        { icon: 'fa-solid fa-plus', label: 'New SQL Table', action: 'new-sql-table' }
      ];
      
    case 'NoSQL Collections':
      return [
        ...common,
        { icon: 'fa-solid fa-plus', label: 'New NoSQL Collection', action: 'new-nosql-collection' }
      ];
      
    case 'Memory Stores':
      return [
        ...common,
        { icon: 'fa-solid fa-plus', label: 'New Memory Store', action: 'new-memory-store' }
      ];
  
    case 'SQL Table':
      return [
        ...common,
        { icon: 'fa-solid fa-table', label: 'View Data', action: 'view-data' },
        { icon: 'fa-solid fa-code', label: 'View SQL', action: 'view-sql' },
        { icon: 'fa-solid fa-terminal', label: 'NSQL Query', action: 'nsql-query' }, // Added NSQL option
        { icon: 'fa-solid fa-plus', label: 'Add Column', action: 'add-column' },
        { divider: true } as ContextMenuItem,
        { icon: 'fa-solid fa-pen-to-square', label: 'Properties', action: 'properties' },
        { icon: 'fa-solid fa-trash', label: 'Delete/Drop', action: 'delete', danger: true }
      ];
      
    case 'NoSQL Collection':
      return [
        ...common,
        { icon: 'fa-solid fa-table', label: 'View Documents', action: 'view-documents' },
        { icon: 'fa-solid fa-terminal', label: 'NSQL Query', action: 'nsql-query' }, // Added NSQL option
        { icon: 'fa-solid fa-plus', label: 'New Document', action: 'new-document' },
        { icon: 'fa-solid fa-file-code', label: 'Query Builder', action: 'query-builder' }, // Fixed icon
        { divider: true } as ContextMenuItem,
        { icon: 'fa-solid fa-pen-to-square', label: 'Properties', action: 'properties' },
        { icon: 'fa-solid fa-trash', label: 'Delete/Drop', action: 'delete', danger: true }
      ];
      
    case 'Memory Store':
      return [
        ...common,
        { icon: 'fa-solid fa-table', label: 'View Key-Values', action: 'view-key-values' },
        { icon: 'fa-solid fa-terminal', label: 'NSQL Query', action: 'nsql-query' }, // Added NSQL option
        { icon: 'fa-solid fa-plus', label: 'New Key', action: 'new-key' },
        { divider: true } as ContextMenuItem,
        { icon: 'fa-solid fa-clock', label: 'Set TTL', action: 'set-ttl' },
        { icon: 'fa-solid fa-pen-to-square', label: 'Properties', action: 'properties' },
        { icon: 'fa-solid fa-trash', label: 'Delete/Drop', action: 'delete', danger: true }
      ];
      
    default:
      if (nodeType.endsWith('s')) {
        // For plural objects, offer "New" option
        // Handle irregular plurals
        let itemType = pluralToSingular[nodeType] || nodeType.slice(0, -1);
        
        return [
          ...common,
          { icon: 'fa-solid fa-plus', label: `New ${itemType}`, action: `new-${itemType.toLowerCase()}` }
        ];
      } else {
        // For singular objects, offer properties and delete
        return [
          ...common,
          { icon: 'fa-solid fa-pen-to-square', label: 'Properties', action: 'properties' },
          { icon: 'fa-solid fa-trash', label: 'Delete/Drop', action: 'delete', danger: true }
        ];
      }
  }
};

// Context Menu Component
const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onSelect, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Adjust position if needed to keep menu in viewport
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      let adjustedX = x;
      let adjustedY = y;
      
      if (x + rect.width > window.innerWidth) {
        adjustedX = window.innerWidth - rect.width - 5;
      }
      
      if (y + rect.height > window.innerHeight) {
        adjustedY = window.innerHeight - rect.height - 5;
      }
      
      menuRef.current.style.top = `${adjustedY}px`;
      menuRef.current.style.left = `${adjustedX}px`;
    }
    
    // Close on escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [x, y, onClose]);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const menuItems = menuRef.current?.querySelectorAll('.context-menu__item');
    if (!menuItems) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % menuItems.length;
      (menuItems[nextIndex] as HTMLElement).focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = index <= 0 ? menuItems.length - 1 : index - 1;
      (menuItems[prevIndex] as HTMLElement).focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const action = items[index].action;
      onSelect(action);
    }
  };
  
  // Handle click outside to close menu
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);
  
  return (
    <div className="context-menu" ref={menuRef} style={{ top: y, left: x }}>
      {items.map((item, index) => (
        item.divider ? (
          <div key={`divider-${index}`} className="context-menu__divider" />
        ) : (
          <div
            key={item.action}
            className={`context-menu__item ${item.danger ? 'context-menu__item--danger' : ''}`}
            onClick={() => onSelect(item.action)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={0}
            role="menuitem"
          >
            <i className={item.icon}></i>
            {item.label}
          </div>
        )
      ))}
    </div>
  );
};

// Tree Node Component
interface TreeNodeProps {
  node: TreeNode;
  depth: number;
  path: string;
  onContextMenu: (e: React.MouseEvent, node: TreeNode) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string) => void;
  isFiltered?: boolean;
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({ 
  node, 
  depth, 
  path,
  onContextMenu,
  selectedNodeId,
  setSelectedNodeId,
  isFiltered = false
}) => {
  // Use a stable ID instead of random
  const nodeId = node.id || `${path}-${node.label}`;
  // Expand first few levels by default, but limit depth to prevent overwhelming UI
  const [expanded, setExpanded] = useState(depth <= 1 || isFiltered);
  const hasChildren = node.children && node.children.length > 0;
  const iconClass = getNodeIcon(node);
  const isSelected = selectedNodeId === nodeId;
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setExpanded(prev => !prev);
    }
  };
  
  const handleSelect = () => {
    setSelectedNodeId(nodeId);
  };
  
  const handleNodeContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    onContextMenu(e, node);
  };

  // Display type badge for data types or paradigm indicators, but only if not deeply nested
  const renderBadge = () => {
    // Skip badges for deeply nested items to save space
    if (depth > 5) return null;
    
    if (node.dataType) {
      return <span className="node-type-badge">{node.dataType}</span>;
    }
    if (node.paradigm) {
      return <span className={`node-paradigm-badge ${node.paradigm}`}>{node.paradigm}</span>;
    }
    if (node.dbType === 'hybrid') {
      return <span className="node-paradigm-badge hybrid">hybrid</span>;
    }
    return null;
  };
  
  return (
    <li>
      <span 
        className={`tree-node ${isSelected ? 'selected' : ''} ${node.paradigm || ''}`}
        data-depth={depth}
        data-type={node.type || ''}
        data-paradigm={node.paradigm || ''}
        title={node.label + (node.dataType ? ` (${node.dataType})` : '')}
        onClick={handleSelect}
        onContextMenu={handleNodeContextMenu}
      >
        {hasChildren ? (
          <i 
            className={`fa ${expanded ? 'fa-chevron-down' : 'fa-chevron-right'} toggle-icon`}
            onClick={handleToggle}
          />
        ) : (
          <span className="toggle-placeholder" />
        )}
        
        <i className={`node-icon ${iconClass}`} />
        <span className="node-text">{node.label}</span>
        
        {renderBadge()}
        
        {node.count !== undefined && node.count > 0 && (
          <span className="node-count">{node.count}</span>
        )}
      </span>
      
      {hasChildren && (
        <ul className="tree-view" style={{ display: expanded ? 'block' : 'none' }}>
          {node.children?.map((childNode, index) => (
            <TreeNodeComponent
              key={`${nodeId}-${childNode.label}-${index}`}
              node={childNode}
              depth={depth + 1}
              path={`${nodeId}-${index}`}
              onContextMenu={onContextMenu}
              selectedNodeId={selectedNodeId}
              setSelectedNodeId={setSelectedNodeId}
              isFiltered={isFiltered}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// Sidebar Component
const Sidebar: React.FC = () => {
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
    node: TreeNode;
  } | null>(null);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [version, setVersion] = useState<string>('1.0.0');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredData, setFilteredData] = useState<TreeNode[]>(explorerData);
  const [activeParadigm, setActiveParadigm] = useState<'all' | 'sql' | 'nosql' | 'memory'>('all');

  // Fetch version from rust
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await invoke('get_version');
        setVersion(version as string);
      } catch (error) {
        console.error('Error fetching version:', error);
      }
    };
    
    fetchVersion();
  }, []);
  
  // Handle search/filter functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(explorerData);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();

    // Recursive search function
    const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
      const result: TreeNode[] = [];
      
      for (const node of nodes) {
        // Check if this node matches
        const nodeMatches = node.label.toLowerCase().includes(searchTermLower);
        
        // Check if any children match
        const filteredChildren = node.children ? filterNodes(node.children) : [];
        const childrenMatch = filteredChildren.length > 0;
        
        // Include this node if it matches or has matching children
        if (nodeMatches || childrenMatch) {
          result.push({
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : undefined
          });
        }
      }
      
      return result;
    };

    setFilteredData(filterNodes(explorerData));
  }, [searchTerm]);
  
  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault();
    const menuItems = getContextMenuItems(node);
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      items: menuItems,
      node
    });
  }, []);
  
  // Handle context menu action
  const handleContextMenuAction = useCallback((action: string) => {
    if (contextMenu) {
      console.log(`Action: ${action} on ${contextMenu.node.label}`);
      
      // Handle paradigm-specific actions
      switch(action) {
        case 'nsql-query':
          alert(`Opening NSQL query editor for ${contextMenu.node.label} (${contextMenu.node.paradigm || 'hybrid'})`);
          break;
          
        case 'view-data':
        case 'view-documents':
        case 'view-key-values':
          alert(`Viewing data for ${contextMenu.node.label} (${contextMenu.node.paradigm})`);
          break;
          
        case 'new-sql-table':
        case 'new-nosql-collection':
        case 'new-memory-store':
          alert(`Creating new ${action.split('-').slice(1).join(' ')} (${action.split('-')[1]})`);
          break;
        
        // ...existing code...
      }
    }
    // Close the context menu
    setContextMenu(null);
  }, [contextMenu]);
  
  // Handle refresh button
  const handleRefresh = () => {
    console.log('Refreshing object explorer');
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <div className="brand">
          <div className="brand__logo">
            <i className="fa-solid fa-database"></i>
          </div>
          <div className="brand__text">
            <h1>DB Admin</h1>
            <p>v{version}</p>
          </div>
        </div>
      </div>
      
      <div className="sidebar__search">
        <div className="search-input">
          <i className="fa-solid fa-search search-icon"></i>
          <input 
            type="text" 
            placeholder="Search objects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          )}
        </div>
      </div>
      
      <div className="paradigm-selector">
        <button
          className={`paradigm-option${activeParadigm === 'all' ? ' selected' : ''}`}
          data-type="all"
          title="All Paradigms"
          onClick={() => setActiveParadigm('all')}
        >
          <i className="fa-solid fa-database"></i>
          <span>All</span>
        </button>
        <button
          className={`paradigm-option${activeParadigm === 'sql' ? ' selected' : ''}`}
          data-type="sql"
          title="SQL Tables"
          onClick={() => setActiveParadigm('sql')}
        >
          <i className="fa-solid fa-table"></i>
          <span>SQL</span>
        </button>
        <button
          className={`paradigm-option${activeParadigm === 'nosql' ? ' selected' : ''}`}
          data-type="nosql"
          title="NoSQL Collections"
          onClick={() => setActiveParadigm('nosql')}
        >
          <i className="fa-solid fa-layer-group"></i>
          <span>NoSQL</span>
        </button>
        <button
          className={`paradigm-option${activeParadigm === 'memory' ? ' selected' : ''}`}
          data-type="memory"
          title="Memory Stores"
          onClick={() => setActiveParadigm('memory')}
        >
          <i className="fa-solid fa-bolt"></i>
          <span>Memory</span>
        </button>
      </div>
      
      <div className="sidebar__content">
        <div className="explorer-header">
          <h2>Object Explorer</h2>
          <div className="explorer-actions">
            <button className="action-button" onClick={handleRefresh} title="Refresh">
              <i className="fa-solid fa-rotate"></i>
            </button>
            <button className="action-button" title="New Connection">
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
        
        <div className="explorer-body">
          <ul className="tree-view root-tree">
            {filteredData.map((node, index) => (
              <TreeNodeComponent 
                key={`root-${index}`}
                node={node} 
                depth={0}
                path={`root-${index}`}
                onContextMenu={handleContextMenu}
                selectedNodeId={selectedNodeId}
                setSelectedNodeId={setSelectedNodeId}
                isFiltered={searchTerm.length > 0}
              />
            ))}
          </ul>
        </div>
      </div>
      
      <div className="sidebar__footer">
        <div className="connection-status">
          <div className="status-indicator online"></div>
          <span>Connected</span>
        </div>
        <div className="footer-actions">
          <button className="footer-button" title="New Query">
            <i className="fa-solid fa-code"></i>
          </button>
          <button className="footer-button" title="Settings">
            <i className="fa-solid fa-gear"></i>
          </button>
        </div>
      </div>
      
      {/* Render context menu if active */}
      {contextMenu?.show && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          items={contextMenu.items} 
          onSelect={handleContextMenuAction}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default Sidebar;
