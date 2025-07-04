"use client";
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import ShareModal from './Modal/LiveShareModal';
import LoadingState from './Error-Loading/LoadingState';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

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

const LiveEditor = ({ shareId, file, router }) => {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const [fileName, setFileName] = useState(file?.filename || '');
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [lineCharWidth, setLineCharWidth] = useState(4);

  const themeClasses = {
    container: theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-300 text-gray-900',
    editorContainer: 'bg-gray-800 border-gray-700',
    header: 'bg-gray-800 border-gray-700',
    button: {
      base: theme === 'dark' ?
        'bg-gray-700 hover:bg-gray-600 text-gray-200' :
        'bg-gray-200 hover:bg-gray-300 text-gray-700',
    },
    dots: {
      red: 'bg-red-500',
      yellow: 'bg-amber-500',
      green: 'bg-emerald-500'
    },
    badge: theme === 'dark' ?
      'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
      'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setLineCharWidth(2); // Mobile devices
    } else {
      setLineCharWidth(4); // Default
    }
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

  const downloadCode = () => {
    const element = document.createElement('a');
    element.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    element.download = fileName || 'shared-code.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen overflow-x-hidden ${themeClasses.container}`}
    >
      <div className="w-full max-w-full overflow-x-clip">
        {!isConnected && <LoadingState />}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <motion.div
            className="flex flex-wrap justify-end gap-3 mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
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
                  <div>
                    <div className={`px-2 py-0.5 sm:px-3 sm:py-1 text-xs rounded-full border font-mono ${themeClasses.badge}`}>
                      EDITOR
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="h-[400px] sm:h-[500px]">
                    <Editor
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

        {isShareModalOpen && file?.shareId && (
          <ShareModal
            onClose={() => setIsShareModalOpen(false)}
            shareId={file.shareId}
            theme={theme}
          />
        )}
      </div>
    </motion.div>
  );
};

export default LiveEditor;
