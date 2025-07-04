'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Folder, FolderOpen, File, ChevronRight, Search, GitBranch, X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const FileItem = ({
  node,
  depth,
  isSelected,
  onFileSelect,
  onToggleFolder,
  theme,
  expandedFolders,
  isMobile,
}) => {
  const isExpanded = expandedFolders?.has(node._id);

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
        onClick={() => node.type === 'file' ? onFileSelect(node) : onToggleFolder(node._id)}
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

        <span className="flex-1 text-sm truncate">{node.name}</span>
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
                theme={theme}
                expandedFolders={expandedFolders}
                isMobile={isMobile}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

const ReadOnlyFileExplorer = ({
  fileStructure,
  onFileSelect,
  selectedFileId,
  onClose
}) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root-folder']));
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  const filterTree = useCallback((nodes, term) => {
    if (!term) return nodes;

    return nodes
      .map(node => ({ ...node })) // Shallow clone to avoid mutation
      .filter(node => {
        const nameMatch = node.name.toLowerCase().includes(term.toLowerCase());
        let hasMatchingChildren = false;

        if (node.children && node.children.length > 0) {
          // Recursively filter children
          node.children = filterTree(node.children, term);
          hasMatchingChildren = node.children.length > 0;
        }

        return nameMatch || hasMatchingChildren;
      });
  }, []);
  
  const filteredFiles = useMemo(() => {
    if (!searchTerm) return fileStructure;

    return fileStructure.filter(
      file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.children && file.children.some(child => child.name.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [fileStructure, searchTerm]);

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
            theme={theme}
            expandedFolders={expandedFolders}
            isMobile={isMobile}
          />
        ))}

        {searchTerm && !filteredFiles.length && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No files found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadOnlyFileExplorer;