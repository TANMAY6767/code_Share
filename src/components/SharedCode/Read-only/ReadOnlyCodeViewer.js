// EditableCodeViewer.js
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, FolderDown, Crown, Code2, Settings, Menu, X } from 'lucide-react';
import FileExplorer from './FileExplorer';
import CodeEditor from './EditorPanel';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useTheme } from '../../../contexts/ThemeContext';
import useMediaQuery from '../../../hooks/useMediaQuery';

const LANGUAGE_MAP = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'css',
  sass: 'css',
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  h: 'cpp',
  hpp: 'cpp',
  cs: 'csharp',
  php: 'php',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  swift: 'swift',
  kt: 'kotlin',
  kts: 'kotlin',
  md: 'markdown',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  sh: 'shell',
  bat: 'bat',
  ps1: 'powershell',
};
const CountdownDigit = ({ value, colorClass }) => (
  <div className="relative w-4 overflow-hidden text-center">
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        className={`block font-mono font-medium ${colorClass}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  </div>
);

const CountdownSegment = ({ value, label, colorClass, visible = true }) => {
  if (!visible) return null;

  return (
    <div className="flex items-baseline">
      <CountdownDigit value={value.toString().padStart(2, '0')} colorClass={colorClass} />
      <span className={`text-xs ${colorClass}`}>{label}</span>
    </div>
  );
};

const AnimatedCountdown = ({ expiresAt, appTheme, isMobile }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!expiresAt) {
        return { expired: false, days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const now = new Date();
      const expirationDate = new Date(expiresAt);
      const diff = expirationDate - now;

      if (diff <= 0) {
        return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        expired: false
      };
    };

    const update = () => setTimeLeft(calculateTimeLeft());
    update();
    const intervalId = setInterval(update, 1000);

    return () => clearInterval(intervalId);
  }, [expiresAt]);

  const getColorClass = () => {
    if (timeLeft.expired) {
      return appTheme === 'dark' ? 'text-red-400' : 'text-red-500';
    }

    const totalHours = timeLeft.days * 24 + timeLeft.hours;
    if (totalHours > 24) return appTheme === 'dark' ? 'text-green-400' : 'text-green-500';
    if (totalHours > 1) return appTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-500';
    return appTheme === 'dark' ? 'text-red-400' : 'text-red-500';
  };

  // Simplified countdown for mobile
  if (isMobile && expiresAt) {
    return timeLeft.expired ? (
      <motion.span
        className={getColorClass()}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500 }}
      >
        Expired
      </motion.span>
    ) : (
      <div className="flex items-center space-x-1">
        {timeLeft.days > 0 && (
          <span className={`text-xs ${getColorClass()}`}>
            {timeLeft.days}d
          </span>
        )}
        <span className={`text-xs ${getColorClass()}`}>
          {timeLeft.hours}h
        </span>
        <span className={`text-xs ${getColorClass()}`}>
          {timeLeft.minutes}m
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {!expiresAt ? (
        <span className={appTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
          Never expires
        </span>
      ) : timeLeft.expired ? (
        <motion.span
          className={getColorClass()}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          Expired
        </motion.span>
      ) : (
        <div className="flex items-center space-x-1">
          <CountdownSegment
            value={timeLeft.days}
            label="d"
            colorClass={getColorClass()}
            visible={timeLeft.days > 0}
          />
          <CountdownSegment
            value={timeLeft.hours}
            label="h"
            colorClass={getColorClass()}
          />
          <CountdownSegment
            value={timeLeft.minutes}
            label="m"
            colorClass={getColorClass()}
          />
          <div className="flex items-baseline">
            <CountdownDigit value={timeLeft.seconds.toString().padStart(2, '0')} colorClass={getColorClass()} />
            <span className={`text-xs ${getColorClass()}`}>s</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default function EditableCodeViewer({ file, router }) {
  const [language, setLanguage] = useState('javascript');
  const [editorContent, setEditorContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [originalStructure, setOriginalStructure] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [projectName, setProjectName] = useState(file.project?.name || "Project");
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [idMap, setIdMap] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileCount, setFileCount] = useState(0);
  const [folderCount, setFolderCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [projectSettings, setProjectSettings] = useState({
    name: file.project?.name || "Project",
    type: file.project?.type || "",
    slug: file.project?.slug,
    expireIn: file.project?.expireIn || "1h",
    expiresAt: file.project?.expiresAt


  });

  // Create root folder with file structure
  const [fileStructure, setFileStructure] = useState(() => {
    const rootFolder = {
      _id: "root-folder",
      name: projectName,
      type: "folder",
      isRoot: true,
      children: file.fileStructure || [],
    };
    return [rootFolder];
  });

  const { theme: appTheme } = useTheme();

  // Initialize original structure
  useEffect(() => {
    if (originalStructure.length === 0 && fileStructure.length > 0) {
      setOriginalStructure(JSON.parse(JSON.stringify(fileStructure)));
    }

    // Count files and folders
    let fileTotal = 0;
    let folderTotal = 0;

    const countItems = (nodes) => {
      if (!nodes || !Array.isArray(nodes)) return;

      nodes.forEach(node => {
        if (node.type === 'file') {
          fileTotal++;
        } else {
          folderTotal++;
          if (node.children) {
            countItems(node.children);
          }
        }
      });
    };

    countItems(fileStructure[0].children || []);
    setFileCount(fileTotal);
    setFolderCount(folderTotal);
  }, [fileStructure, originalStructure]);

  // Find first file on initial load
  useEffect(() => {
    if (!currentFile && fileStructure.length > 0 && fileStructure[0].children) {
      const firstFile = findFirstFile(fileStructure[0].children);
      if (firstFile) {
        setCurrentFile(firstFile);
        setEditorContent(firstFile.content || '');
      }
    }
  }, [fileStructure, currentFile]);

  // Update editor content when current file changes
  useEffect(() => {
    if (currentFile) {
      setEditorContent(currentFile.content || '');
      setLanguage(getLanguageFromFilename(currentFile.name));
    }
  }, [currentFile]);

  // Helper function to find first file in structure
  const findFirstFile = useCallback((items) => {
    for (const item of items) {
      if (item.type === 'file') {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = findFirstFile(item.children);
        if (found) return found;
      }
    }
    return null;
  }, []);
  const downloadProjectAsZip = useCallback(() => {
    const zip = new JSZip();

    // Helper function to add files to ZIP
    const addFilesToZip = (node, path = '') => {
      const currentPath = path ? `${path}/${node.name}` : node.name;

      if (node.type === 'file') {
        zip.file(currentPath, node.content || '');
      } else if (node.type === 'folder' && node.children) {
        node.children.forEach(child => {
          addFilesToZip(child, currentPath);
        });
      }
    };

    // Start from the root folder
    if (fileStructure.length > 0) {
      const root = fileStructure[0];
      if (root.type === 'folder') {
        // Create a folder for the project
        root.children.forEach(child => {
          addFilesToZip(child, projectSettings.name);
        });
      }
    }

    // Generate the ZIP file
    zip.generateAsync({ type: 'blob' }).then(blob => {
      saveAs(blob, `${projectSettings.name}.zip`);
      toast.success('Project downloaded successfully!');
    });
  }, [fileStructure, projectSettings.name]);
  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    setCurrentFile(file);
    setSelectedFile(file);
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile]);

  // Get language from filename
  const getLanguageFromFilename = useCallback((filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return LANGUAGE_MAP[extension] || 'plaintext';
  }, []);

  // Update file content when editor changes
  const handleEditorChange = useCallback((value) => {
    setEditorContent(value);
    setDirty(true);

    if (currentFile) {
      const updateContent = (nodes) => {
        return nodes.map(node => {
          if (node._id === currentFile._id) {
            return { ...node, content: value };
          }
          if (node.children) {
            return { ...node, children: updateContent(node.children) };
          }
          return node;
        });
      };

      const newStructure = [...fileStructure];
      newStructure[0].children = updateContent(fileStructure[0].children);
      setFileStructure(newStructure);
    }
  }, [currentFile, fileStructure]);

  // Update file structure
  const handleUpdateFileStructure = useCallback((newStructure) => {
    setFileStructure(newStructure);
    setDirty(true);
  }, []);

  // Save changes to backend
  const saveChanges = async () => {
    if (!file?.project?.slug) {
      toast.error('Project slug missing');
      return;
    }
    if (!dirty) return;

    setSaveStatus('saving');

    try {
      // Flatten structures for diffing
      const currentFlat = flattenTree(fileStructure[0].children || []);
      const originalFlat = flattenTree(originalStructure[0].children || []);

      // Compute changes
      const created = [];
      const updated = [];
      const deleted = [];

      // Find created and updated nodes
      currentFlat.forEach(node => {
        const isNew = node.tempId || !originalFlat.some(n => n._id === node._id);

        if (isNew) {
          created.push({
            tempId: node.tempId,
            name: node.name,
            type: node.type,
            content: node.content || '',
            parentId: node.parentId
          });
        } else {
          const originalNode = originalFlat.find(n => n._id === node._id);
          if (originalNode && (
            node.name !== originalNode.name ||
            node.content !== originalNode.content
          )) {
            updated.push({
              _id: node._id,
              name: node.name,
              content: node.content || ''
            });
          }
        }
      });

      // Find deleted nodes (only real IDs, not temp ones)
      originalFlat.forEach(node => {
        if (!node._id.startsWith('temp-') &&
          !currentFlat.some(n => n._id === node._id)) {
          deleted.push(node._id);
        }
      });

      // Send changes to backend
      const response = await fetch(`/api/projects/${file.project.slug}/structure`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ created, updated, deleted })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save');
      }

      const data = await response.json();
      if (!data.success) throw new Error('Failed to save project');

      // Update frontend with real IDs from backend
      if (data.data?.idMapping) {
        const newIdMap = { ...idMap, ...data.data.idMapping };
        setIdMap(newIdMap);

        const updateIds = (nodes) => {
          return nodes.map(node => {
            const newNode = { ...node };

            // Replace temp ID with real ID
            if (newNode.tempId && newIdMap[newNode.tempId]) {
              newNode._id = newIdMap[newNode.tempId];
              delete newNode.tempId;
              delete newNode.isNew;
            }

            // Update parent IDs
            if (newNode.parentId && newIdMap[newNode.parentId]) {
              newNode.parentId = newIdMap[newNode.parentId];
            }

            // Process children
            if (newNode.children) {
              newNode.children = updateIds(newNode.children);
            }

            return newNode;
          });
        };

        const newStructure = [...fileStructure];
        newStructure[0].children = updateIds(newStructure[0].children);
        setFileStructure(newStructure);

        // Update current file if needed
        if (currentFile?.tempId && newIdMap[currentFile.tempId]) {
          setCurrentFile(prev => ({
            ...prev,
            _id: newIdMap[prev.tempId],
            tempId: undefined
          }));
        }
      }

      toast.success('Project saved successfully!');
      setDirty(false);
      setOriginalStructure(JSON.parse(JSON.stringify(fileStructure)));
    } catch (err) {
      toast.error(err.message || 'Failed to save project');
      console.error(err);
    } finally {
      setSaveStatus('idle');
    }
  };

  const flattenTree = (nodes, parentId = null) => {
    return nodes.reduce((acc, node) => {
      const { children, ...nodeData } = node;
      const flatNode = { ...nodeData, parentId };

      acc.push(flatNode);

      if (children && children.length > 0) {
        acc.push(...flattenTree(children, node._id));
      }

      return acc;
    }, []);
  };

  const canCreateFile = true;
  const canCreateFolder = true;



  return (
    <>
      <main
        className={`min-h-screen flex flex-col relative overflow-hidden ${appTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-white'
          }`}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl ${appTheme === 'dark'
              ? 'bg-blue-500/10'
              : 'bg-blue-500/5'
              }`}
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className={`absolute top-3/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${appTheme === 'dark'
              ? 'bg-purple-500/10'
              : 'bg-purple-500/5'
              }`}
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Usage Warning for Free Plan */}
        {/* <AnimatePresence>
          {true && (
            <motion.div
              className={`backdrop-blur-sm border-b px-6 py-3 relative z-10 ${appTheme === 'dark'
                ? 'bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-amber-500/30 text-amber-200'
                : 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200 text-amber-600'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown className={`h-5 w-5 ${appTheme === 'dark'
                    ? 'text-amber-400'
                    : 'text-amber-600'
                    }`} />
                  <p className={`text-sm ${appTheme === 'dark'
                    ? 'text-amber-400'
                    : 'text-amber-800'
                    }`}>
                    <span className="font-semibold">Free Plan:</span> {fileCount}/3 files, {folderCount}/2 folders used
                  </p>
                </div>
                <motion.button
                  onClick={() => router.push('/pricing')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${appTheme === 'dark'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="h-4 w-4 mr-2 inline" />
                  Upgrade to Pro
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence> */}

        {/* Project Header */}
        <motion.div
          className={`backdrop-blur-xl border-b px-4 sm:px-6 py-4 relative z-10 ${appTheme === 'dark'
            ? 'bg-gray-800/90 border-gray-700/50'
            : 'bg-white/90 border-gray-200/50'
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">

              <motion.div
                className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Code2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </motion.div>

              <div className="max-w-[40vw] sm:max-w-none overflow-hidden">
                <motion.h1
                  className={`text-lg sm:text-xl font-bold truncate ${appTheme === 'dark'
                    ? 'text-white'
                    : 'text-gray-900'
                    }`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {projectSettings.name}
                </motion.h1>
                <div className="flex items-center space-x-1 sm:space-x-3 mt-1 flex-wrap">
                  <motion.span
                    className={`px-2 py-1 text-xs rounded-full border ${appTheme === 'dark'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {projectSettings.type.toUpperCase()}
                  </motion.span>
                  {projectSettings.isPublic && (
                    <motion.span
                      className={`px-2 py-1 text-xs rounded-full border ${appTheme === 'dark'
                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                        : 'bg-green-100 text-green-700 border-green-200'
                        }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      PUBLIC
                    </motion.span>
                  )}
                  <motion.div
                    className="flex items-center space-x-1 text-xs"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className={`w-2 h-2 rounded-full ${appTheme === 'dark'
                      ? 'bg-green-400'
                      : 'bg-green-500'
                      }`} />
                    <span className={appTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      Live
                    </span>
                    <span className="ml-1 sm:ml-2">
                      <AnimatedCountdown
                        expiresAt={projectSettings.expiresAt}
                        appTheme={appTheme}
                        isMobile={isMobile}
                      />
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-4">
              {isMobile && (
                <motion.button
                  onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                  className={`p-2 sm:px-4 sm:py-2 text-sm rounded-lg transition-all flex items-center space-x-2 ${appTheme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                
              >
                  {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.button>
              )}
              <motion.button
                onClick={downloadProjectAsZip}
                className={`p-4 sm:px-4 sm:py-2 text-sm rounded-lg transition-all flex items-center space-x-2 ${appTheme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Download Project"
              >
                <FolderDown className="w-4 h-4" />
                <span className="hidden sm:inline">Download Project</span>
              </motion.button>


            </div>
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col overflow-hidden relative z-40">
          <div className="flex flex-1 min-h-0">
            {/* File Explorer Panel */}
            <AnimatePresence>
              {(mobileSidebarOpen || !isMobile) && (
                <motion.div
                  className={`w-80 flex-shrink-0 ${isMobile ? 'fixed inset-0 z-50' : 'z-10'}`}
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={isMobile ? { x: -300, opacity: 0 } : undefined}
                  transition={{ duration: 0.6, ease: isMobile ? "easeInOut" : "easeOut" }}
                >
                  <FileExplorer
                    fileStructure={fileStructure}
                    onFileSelect={handleFileSelect}
                    selectedFileId={currentFile?._id}
                    slug={file.project?.slug}
                    projectName={projectName}
                    onUpdateFileStructure={handleUpdateFileStructure}
                    onSetCurrentFile={setCurrentFile}
                    canCreateFile={canCreateFile}
                    canCreateFolder={canCreateFolder}
                    onClose={() => setMobileSidebarOpen(false)} // Add this line
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Editor Panel */}
            <div className="flex-1">
              {currentFile ? (
                <motion.div
                  key={currentFile._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <CodeEditor
                    language={language}
                    editorContent={editorContent}
                    onChange={handleEditorChange}
                    currentFile={currentFile}
                    dirty={dirty}
                    theme={projectSettings.theme}
                    onSave={saveChanges}
                    saveStatus={saveStatus}
                  />
                </motion.div>
              ) : (
                <motion.div
                  className="h-full flex items-center justify-center relative overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {/* Welcome Screen Background */}
                  <div className="absolute inset-0">
                    <motion.div
                      className={`absolute top-1/3 left-1/3 w-32 h-32 rounded-full blur-2xl ${appTheme === 'dark'
                        ? 'bg-blue-500/20'
                        : 'bg-blue-500/10'
                        }`}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <motion.div
                      className={`absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full blur-2xl ${appTheme === 'dark'
                        ? 'bg-purple-500/20'
                        : 'bg-purple-500/10'
                        }`}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 0.7, 0.4],
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    />
                  </div>

                  <div className="text-center relative z-10 px-4">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                      className="text-8xl mb-6"
                    >
                      🚀
                    </motion.div>

                    <motion.h3
                      className={`text-3xl font-bold  mb-4 ${appTheme === 'dark'
                        ? 'text-white'
                        : 'text-gray-900'
                        }`}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      Welcome to the Future of Coding
                    </motion.h3>

                    <motion.p
                      className={`mb-8 text-lg max-w-md mx-auto ${appTheme === 'dark'
                        ? 'text-gray-300'
                        : 'text-gray-600'
                        }`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      {isMobile ? (
                        'Tap the menu button to browse files'
                      ) : (
                        'Select a file from the explorer to start coding with our advanced editor'
                      )}
                    </motion.p>

                    <motion.div
                      className="space-y-4"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.1 }}
                    >
                      <motion.button

                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2 mx-auto"
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Zap className="h-5 w-5" />
                        <span>Configure Project</span>
                      </motion.button>

                      {isMobile && (
                        <motion.button
                          onClick={() => setMobileSidebarOpen(true)}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2 mx-auto"
                          whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Menu className="h-5 w-5" />
                          <span>Browse Files</span>
                        </motion.button>
                      )}

                      <motion.p
                        className={`text-sm ${appTheme === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-500'
                          }`}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {isMobile ? 'Swipe from left to open file explorer' : 'Or select a file to start editing'}
                      </motion.p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>



    </>
  );
}