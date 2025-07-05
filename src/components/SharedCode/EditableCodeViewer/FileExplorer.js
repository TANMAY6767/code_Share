'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Folder, FolderOpen, File, ChevronRight, Trash2, Search, GitBranch, Edit, MoreVertical, X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
 const MAX_FILES = 10;
  const MAX_FOLDERS = 7;
const FileItem = ({
  node,
  depth,
  isSelected,
  onFileSelect,
  onToggleFolder,
  onRename,
  onDelete,
  onCreateItem,
  theme,
  expandedFolders,
  renamingNodeId,
  setRenamingNodeId,
  newName,
  setNewName,
  isMobile,
  mobileMenuOpenId,
  setMobileMenuOpenId,
  
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const isRenaming = renamingNodeId === node._id;
  const isExpanded = expandedFolders?.has(node._id);
  const isMobileMenuOpen = mobileMenuOpenId === node._id;

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenuOpenId(null);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, setMobileMenuOpenId]);

  const handleMobileMenuClick = (e) => {
    e.stopPropagation();
    setMobileMenuOpenId(isMobileMenuOpen ? null : node._id);
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    setMobileMenuOpenId(null);
    action();
  };

  const folderActions = [
    {
      label: 'Create File',
      icon: <File className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />,
      action: () => onCreateItem('file', node._id)
    },
    {
      label: 'Create Folder',
      icon: <Folder className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />,
      action: () => onCreateItem('folder', node._id)
    },
    ...(node.isRoot ? [] : [
      {
        label: 'Rename',
        icon: <Edit className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />,
        action: () => {
          setRenamingNodeId(node._id);
          setNewName(node.name);
        }
      },
      {
        label: 'Delete',
        icon: <Trash2 className={`h-3 w-3 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />,
        action: () => onDelete(node._id)
      }
    ])
  ];

  const fileActions = [
    {
      label: 'Rename',
      icon: <Edit className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />,
      action: () => {
        setRenamingNodeId(node._id);
        setNewName(node.name);
      }
    },
    {
      label: 'Delete',
      icon: <Trash2 className={`h-3 w-3 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />,
      action: () => onDelete(node._id)
    }
  ];

  const actions = node.type === 'folder' ? folderActions : fileActions;

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 rounded-md cursor-pointer group ${isSelected
            ? theme === 'dark'
              ? 'bg-blue-900/30 text-blue-300'
              : 'bg-blue-100 text-blue-600'
            : theme === 'dark'
              ? 'hover:bg-gray-700/30 text-gray-300'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => !isRenaming && (node.type === 'file' ? onFileSelect(node) : onToggleFolder(node._id))}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        onContextMenu={e => e.preventDefault()}
      >
        {node.type === 'folder' && (
          <ChevronRight
            className={`h-3 w-3 mr-1 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''
              } ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}
          />
        )}

        <div className="mr-2">
          {node.type === 'folder' ? (
            isExpanded ? (
              <FolderOpen className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
            ) : (
              <Folder className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
            )
          ) : (
            <File className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          )}
        </div>

        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onBlur={() => onRename(node._id, newName)}
            onKeyDown={e => {
              if (e.key === 'Enter') onRename(node._id, newName);
              if (e.key === 'Escape') {
                setRenamingNodeId(null);
                setNewName(node.name);
              }
            }}
            className="flex-1 text-sm bg-transparent border-b border-blue-500 outline-none"
            onClick={e => e.stopPropagation()}
            onFocus={e => e.target.select()}
          />
        ) : (
          <span className="flex-1 text-sm truncate">{node.name}</span>
        )}

        {/* Mobile three-dots menu */}
        {isMobile && (
          <div className="relative ml-2">
            <button
              onClick={handleMobileMenuClick}
              className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600/50' : 'hover:bg-gray-200'
                }`}
            >
              <MoreVertical className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>

            {isMobileMenuOpen && (
              <div
                ref={menuRef}
                className={`absolute right-0 z-10 mt-1 rounded-md shadow-lg min-w-[160px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}
              >
                <div className="py-1">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      className={`flex items-center w-full px-4 py-2 text-sm text-left ${theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700/50'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      onClick={(e) => handleActionClick(e, action.action)}
                    >
                      <span className="mr-2">{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Desktop hover actions */}
        {!isMobile && isHovered && !isRenaming && (
          <div className="flex items-center space-x-1 ml-2">
            {node.type === 'folder' && (
              <>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onCreateItem('file', node._id);
                  }}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600/50' : 'hover:bg-gray-200'
                    }`}
                  title="Add file"
                >
                  <File className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onCreateItem('folder', node._id);
                  }}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600/50' : 'hover:bg-gray-200'
                    }`}
                  title="Add folder"
                >
                  <Folder className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </>
            )}
            {!node.isRoot && (
              <>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setRenamingNodeId(node._id);
                    setNewName(node.name);
                  }}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600/50' : 'hover:bg-gray-200'}`}
                  title="Rename"
                >
                  <Edit className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(node._id);
                  }}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-red-900/30' : 'hover:bg-red-100'}`}
                  title="Delete"
                >
                  <Trash2 className={`h-3 w-3 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {node.type === 'folder' && isExpanded && node.children && (
        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="ml-2 "
          >
            {node.children.map(child => (
              <FileItem
                key={child._id}
                node={child}
                depth={depth + 1}
                isSelected={isSelected}
                onFileSelect={onFileSelect}
                onToggleFolder={onToggleFolder}
                onRename={onRename}
                onDelete={onDelete}
                onCreateItem={onCreateItem}
                theme={theme}
                expandedFolders={expandedFolders}
                renamingNodeId={renamingNodeId}
                setRenamingNodeId={setRenamingNodeId}
                newName={newName}
                setNewName={setNewName}
                isMobile={isMobile}
                mobileMenuOpenId={mobileMenuOpenId}
                setMobileMenuOpenId={setMobileMenuOpenId}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

const FileExplorer = ({
  fileStructure,
  onFileSelect,
  selectedFileId,
  onUpdateFileStructure,
  onSetCurrentFile,
  fileCount, // Add this
  folderCount ,
  canCreateFile,
  canCreateFolder,
  onClose // New prop for closing the sidebar
}) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root-folder']));
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [renamingNodeId, setRenamingNodeId] = useState(null);
  const [newName, setNewName] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpenId, setMobileMenuOpenId] = useState(null);
  const { theme } = useTheme();

  // Detect mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const toggleFolder = useCallback(folderId => {
    setExpandedFolders(prev => {
      const newExpanded = new Set(prev);
      newExpanded.has(folderId) ? newExpanded.delete(folderId) : newExpanded.add(folderId);
      return newExpanded;
    });
  }, []);

  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setMobileMenuOpenId(null);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleCreateItem = useCallback(
  (type, parentId) => {
    // Check file limit
    if (type === 'file' && fileCount >= 10) {
      toast.error('File creation limit reached (max 10 files)');
      return;
    }
    
    // Check folder limit
    if (type === 'folder' && folderCount >= 7) {
      toast.error('Folder creation limit reached (max 7 folders)');
      return;
    }

    const tempId = `temp-${Date.now()}`;

    const newNode = {
      _id: tempId,
      tempId,
      
      name: type === 'file' ? 'new-file.js' : 'new-folder',
      type,
      content: type === 'file' ? '// New file' : '',
      parentId: parentId || null,
      children: type === 'folder' ? [] : undefined,
      isNew: true,
    };

    const updateNodes = nodes =>
      nodes.map(n => {
        if (n._id === parentId) return { ...n, children: [...(n.children || []), newNode] };
        return n.children ? { ...n, children: updateNodes(n.children) } : n;
      });

    if (parentId) {
      onUpdateFileStructure(updateNodes(fileStructure));
      setExpandedFolders(prev => new Set(prev).add(parentId));
    } else {
      onUpdateFileStructure([...fileStructure, newNode]);
    }
      if (type === 'file') {
      onSetCurrentFile(newNode);
    }
    toast.success(`${type === 'file' ? 'File' : 'Folder'} created!`);
  },
   [fileStructure,onSetCurrentFile, onUpdateFileStructure, fileCount, folderCount]
);


  const handleDeleteItem = useCallback(
    nodeId => {
      const deleteRecursive = nodes =>
        nodes
          .filter(n => n._id !== nodeId)
          .map(n => (n.children ? { ...n, children: deleteRecursive(n.children) } : n));

      onUpdateFileStructure(deleteRecursive(fileStructure));
      if (selectedFileId === nodeId) onSetCurrentFile(null);
      toast.success('Item deleted!');
    },
    [fileStructure, selectedFileId, onUpdateFileStructure, onSetCurrentFile]
  );

  const handleRenameNode = useCallback(
    (nodeId, newName) => {
      if (!newName.trim()) {
        toast.error('Name cannot be empty');
        return;
      }

      const updateNode = nodes =>
        nodes.map(n => {
          if (n._id === nodeId) {
            // If this is the currently selected file, update it
            if (selectedFileId === nodeId) {
              onSetCurrentFile({ ...n, name: newName });
            }
            return { ...n, name: newName };
          }
          return n.children ? { ...n, children: updateNode(n.children) } : n;
        });

      onUpdateFileStructure(updateNode(fileStructure));
      setRenamingNodeId(null);
      toast.success('Item renamed successfully!');
    },
    [fileStructure, onUpdateFileStructure, selectedFileId, onSetCurrentFile]
  );
 
  const filteredFiles = useMemo(() => {
    if (!searchTerm) return fileStructure;

    return fileStructure.filter(
      file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.children && file.children.some(child => child.name.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [fileStructure, searchTerm]);

  const ContextMenu = ({ position, items, onClose }) => {
    if (!position) return null;

    return (
      <motion.div
        className={`fixed rounded-lg shadow-lg z-50 min-w-[160px] ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}
        style={{ left: position.x, top: position.y }}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={`px-4 py-2 text-sm transition-all ${item.disabled
                ? theme === 'dark'
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-gray-400 cursor-not-allowed'
                : theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700 cursor-pointer'
                  : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
              }`}
            onClick={() => !item.disabled && item.action() & onClose()}
          >
            {item.label}
          </div>
        ))}
      </motion.div>
    );
  };

  const contextMenuItems = useCallback(
  item => {
    const commonItems = [
      ...(item.isRoot ? [] : [
        {
          label: 'Rename',
          action: () => {
            setRenamingNodeId(item._id);
            setNewName(item.name);
            setContextMenu(null);
          }
        },
        { label: 'Delete', action: () => handleDeleteItem(item._id) }
      ])
    ];

    if (item.isRoot) {
      return [
        { label: 'New File', action: () => handleCreateItem('file', item._id) },
        { label: 'New Folder', action: () => handleCreateItem('folder', item._id) },
        ...commonItems
      ];
    } else if (item.type === 'folder') {
      return [
        { label: 'New File', action: () => handleCreateItem('file', item._id) },
        { label: 'New Folder', action: () => handleCreateItem('folder', item._id) },
        ...commonItems
      ];
    }
    return commonItems;
  },
  [handleCreateItem, handleDeleteItem]
);


  const handleContextMenu = useCallback((e, node) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item: node });
  }, []);

  return (
    <div
      className={`h-full border-r flex flex-col ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}
    >
      <div
        className={`p-3 border-b z-30 backdrop-blur-xl ${theme === 'dark' ? 'border-gray-700 bg-gray-800/90' : 'border-gray-200 bg-white/90'
          }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <GitBranch className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
            <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Explorer
            </h3>
          </div>

          <div className="flex items-center space-x-1">
            {/* Mobile close button */}
            {isMobile && (
              <button
                onClick={onClose}
                className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'}`}
                title="Close Explorer"
              >
                <X className={`h-6 w-6  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            )}

            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'}`}
              title="Search Files"
            >
              <Search className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="relative mt-2">
                <Search
                  className={`absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search files..."
                  className={`w-full pl-8 pr-3 py-1 border rounded text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-transparent ${theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 text-gray-200 placeholder-gray-400'
                      : 'bg-gray-100/50 border-gray-200 text-gray-700 placeholder-gray-500'
                    }`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className={`flex-1 overflow-y-auto p-2 backdrop-blur-xl z-50 ${theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'
          }`}
      >
        {(searchTerm ? filteredFiles : fileStructure).map(file => (
          <FileItem
            key={file._id}
            node={file}
            depth={0}
            isSelected={selectedFileId === file._id}
            onFileSelect={onFileSelect}
            onToggleFolder={toggleFolder}
            onRename={handleRenameNode}
            onDelete={handleDeleteItem}
            onCreateItem={handleCreateItem}
            theme={theme}
            expandedFolders={expandedFolders}
            renamingNodeId={renamingNodeId}
            setRenamingNodeId={setRenamingNodeId}
            newName={newName}
            setNewName={setNewName}
            isMobile={isMobile}
            mobileMenuOpenId={mobileMenuOpenId}
            setMobileMenuOpenId={setMobileMenuOpenId}
          />
        ))}

        {searchTerm && !filteredFiles.length && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No files found</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            position={contextMenu}
            items={contextMenuItems(contextMenu.item)}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileExplorer;