"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import LiveShareModal from './Modal/LiveShareModal';
import LoadingState from './Error-Loading/LoadingState';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import ExpiryModal from "./ExpiryModal"

const CopyIcon = ({ theme }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
    stroke={theme === 'dark' ? '#e2e8f0' : '#1e293b'}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const DownloadIcon = ({ theme }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
    stroke={theme === 'dark' ? '#e2e8f0' : '#1e293b'}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ShareIcon = ({ theme }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
    stroke={theme === 'dark' ? '#e2e8f0' : '#1e293b'}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

// Countdown Components
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

const ExpiryCountdown = ({ expiresAt, theme }) => {
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
      return theme === 'dark' ? 'text-red-400' : 'text-red-500';
    }

    const totalHours = timeLeft.days * 24 + timeLeft.hours;
    if (totalHours > 24) return theme === 'dark' ? 'text-green-400' : 'text-green-500';
    if (totalHours > 1) return theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500';
    return theme === 'dark' ? 'text-red-400' : 'text-red-500';
  };

  if (!expiresAt) return null;

  return (
    <div className="flex items-center">
      {timeLeft.expired ? (
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

const LiveEditor = ({ shareId, file: initialFile, router }) => {
  const { theme } = useTheme();
  const [file, setFile] = useState(initialFile);
  const [content, setContent] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const [fileName, setFileName] = useState(file?.filename || '');
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);

  const [lineCharWidth, setLineCharWidth] = useState(4);
  const [language, setLanguage] = useState('javascript');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const LANGUAGE_MAP = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    css: 'css',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    cs: 'csharp',
    php: 'php',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    swift: 'swift',
    kt: 'kotlin',
    md: 'markdown',
    json: 'json',
    yml: 'yaml',
    yaml: 'yaml',
    xml: 'xml',
    sh: 'shell',
    txt: 'plaintext'
  };
  const SUPPORTED_LANGUAGES = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' },
    { id: 'csharp', name: 'C#' },
    { id: 'php', name: 'PHP' },
    { id: 'ruby', name: 'Ruby' },
    { id: 'go', name: 'Go' },
    { id: 'rust', name: 'Rust' },
    { id: 'swift', name: 'Swift' },
    { id: 'kotlin', name: 'Kotlin' },
    { id: 'markdown', name: 'Markdown' },
    { id: 'json', name: 'JSON' },
    { id: 'yaml', name: 'YAML' },
    { id: 'xml', name: 'XML' },
    { id: 'shell', name: 'Shell' },
    { id: 'plaintext', name: 'Plain Text' }
  ];
  const themeClasses = {
    container: theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-300 text-gray-900',
    editorContainer: 'bg-gray-800 border-gray-700',
    header: 'bg-gray-800 border-gray-700',
    button: {
      base: theme === 'dark' ?
        'bg-gray-700 hover:bg-gray-600 text-gray-200' :
        'bg-gray-200 hover:bg-gray-300 text-gray-700',
    },
    dropdown: theme === 'dark' ?
      'bg-gray-700 text-gray-200 hover:bg-gray-600' :
      'bg-gray-200 text-gray-700 hover:bg-gray-300',
    dots: {
      red: 'bg-red-500',
      yellow: 'bg-amber-500',
      green: 'bg-emerald-500'
    },
    badge: theme === 'dark' ?
      'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
      'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
  };
  const ChangeExpiryIcon = ({ theme }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
      stroke={theme === 'dark' ? '#e2e8f0' : '#1e293b'}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  const LanguageIcon = ({ theme }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
      stroke={theme === 'dark' ? '#e2e8f0' : '#1e293b'}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setLineCharWidth(2); // Mobile devices
    } else {
      setLineCharWidth(4); // Default
    }
  }, []);
  useEffect(() => {
    if (fileName) {
      const extension = fileName.split('.').pop();
      const detectedLang = LANGUAGE_MAP[extension] || 'plaintext';
      setLanguage(detectedLang);
    }
  }, [fileName]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!shareId) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?shareId=${shareId}`;
    wsRef.current = new WebSocket(wsUrl);

    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case 'init':
            setContent(message.content || '');
            break;
          case 'content-update':
            setContent(message.content);
            break;
          default:
            console.log('Unhandled message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    wsRef.current.onopen = () => setIsConnected(true);
    wsRef.current.onmessage = handleMessage;
    wsRef.current.onerror = (error) => console.error('WebSocket error:', error);
    wsRef.current.onclose = () => setIsConnected(false);

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [shareId]);

  const handleChange = (newContent) => {
    setContent(newContent);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'content-update',
        content: newContent
      }));
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };
  const handleLanguageChange = (newLanguage) => {
    // If it's an event object, get the value from target
    const lang = typeof newLanguage === 'string'
      ? newLanguage
      : newLanguage.target.value;

    setLanguage(lang);

    // Update filename to match language if it doesn't have an extension
    if (!fileName.includes('.')) {
      const defaultExtensions = {
        javascript: 'script.js',
        typescript: 'script.ts',
        html: 'index.html',
        css: 'styles.css',
        python: 'script.py',
        java: 'Main.java',
        cpp: 'program.cpp',
        csharp: 'Program.cs',
        php: 'script.php',
        ruby: 'script.rb',
        go: 'main.go',
        rust: 'main.rs',
        swift: 'main.swift',
        kotlin: 'Main.kt',
        markdown: 'document.md',
        json: 'data.json',
        yaml: 'config.yaml',
        xml: 'data.xml',
        shell: 'script.sh',
        plaintext: 'file.txt'
      };

      setFileName(defaultExtensions[lang] || 'file.txt');
    }
  };
  const downloadCode = () => {
    const element = document.createElement('a');
    element.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    element.download = fileName || 'shared-code.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  const handleExpiryUpdate = (newExpiryData) => {
    setFile(prev => ({
      ...prev,
      expiresIn: newExpiryData.expiresIn,
      expiresAt: newExpiryData.expiresAt
    }));
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen overflow-x-hidden ${themeClasses.container}`}
    >
      {/* Full-screen loading overlay */}
      {!isConnected && (
        <div className="fixed inset-0 z-50 w-screen h-screen">
          <LoadingState />
        </div>
      )}

      {/* Main content */}
      {isConnected && (
        <div className="w-full max-w-full overflow-x-clip">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <motion.div
              className="flex flex-wrap justify-end gap-3 mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Language Selector */}
              <div className="relative" ref={dropdownRef}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                >
                  <LanguageIcon theme={theme} />
                  <span className="text-sm sm:text-base">
                    {SUPPORTED_LANGUAGES.find(lang => lang.id === language)?.name}
                  </span>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.div>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute z-10 mt-1 w-full rounded-lg shadow-lg ${theme === 'dark'
                        ? 'bg-gray-700 text-gray-200'
                        : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                      <div className="py-1 max-h-60 overflow-y-auto">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <div
                            key={lang.id}
                            onClick={() => {
                              handleLanguageChange(lang.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`px-4 py-2 cursor-pointer text-sm sm:text-base ${language === lang.id
                              ? (theme === 'dark'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-indigo-500 text-white')
                              : (theme === 'dark'
                                ? 'hover:bg-gray-600'
                                : 'hover:bg-gray-300')
                              }`}
                          >
                            {lang.name}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpiryModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${themeClasses.button.base}`}
              >
                <ChangeExpiryIcon theme={theme} />
                <span className="text-sm sm:text-base">Change Expiry</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyCode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${themeClasses.button.base}`}
              >
                <CopyIcon theme={theme} />
                <span className="text-sm sm:text-base">{copied ? 'Copied!' : 'Copy Code'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadCode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${themeClasses.button.base}`}
              >
                <DownloadIcon theme={theme} />
                <span className="text-sm sm:text-base">Download</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsShareModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${themeClasses.button.base}`}
              >
                <ShareIcon theme={theme} />
                <span className="text-sm sm:text-base">Share</span>
              </motion.button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="lg:col-span-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className={`rounded-xl border overflow-hidden shadow-2xl ${themeClasses.editorContainer}`}
                >
                  <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between ${themeClasses.header}`}>
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-2">
                        <div className={`w-3 h-3 rounded-full ${themeClasses.dots.red}`}></div>
                        <div className={`w-3 h-3 rounded-full ${themeClasses.dots.yellow}`}></div>
                        <div className={`w-3 h-3 rounded-full ${themeClasses.dots.green}`}></div>
                      </div>
                      <div className="font-mono text-xs sm:text-sm opacity-75">~/</div>
                    </div>

                    {/* Added expiry counter here */}
                    <div className="flex items-center space-x-3">
                      {file?.expiresAt && (
                        <div className="flex items-center text-xs sm:text-sm">
                          <ExpiryCountdown expiresAt={file.expiresAt} theme={theme} />
                        </div>
                      )}
                      <div>
                        <div className={`px-2 py-0.5 sm:px-3 sm:py-1 text-xs rounded-full border font-mono ${themeClasses.badge}`}>
                          EDITOR
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="h-[400px] sm:h-[500px]">
                      <Editor
                        language={language}
                        height="100%"
                        value={content}
                        onChange={handleChange}
                        theme={theme === 'dark' ? 'vs-dark' : 'light'}
                        options={{
                          fontSize: 14,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          padding: { top: 20 },
                          fontFamily: 'Fira Code, monospace',
                          lineNumbers: 'on',
                          automaticLayout: true,
                          glyphMargin: false,
                          lineNumbersMinChars: lineCharWidth,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isShareModalOpen && file?.shareId && (
        <LiveShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          shareId={file.shareId}
        />
      )}
      {isExpiryModalOpen && (
        <ExpiryModal
          isOpen={isExpiryModalOpen}
          onClose={() => setIsExpiryModalOpen(false)}
          shareId={file.shareId}
          currentExpiry={file.expiresIn}
          onExpiryUpdate={handleExpiryUpdate} // Pass the callback
        />
      )}
    </motion.div>
  );
};

export default LiveEditor;