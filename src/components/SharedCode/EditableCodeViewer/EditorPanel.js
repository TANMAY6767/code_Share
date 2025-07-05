// EditorPanel.js
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Share2, 
  Maximize2, 
  Minimize2,
  Eye,
  Code2,
  Zap,
  GitBranch,
  Clock,
  Copy,
  Download,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function CodeEditor({ 
  language, 
  editorContent, 
  onChange, 
  currentFile,
  dirty,
  theme = 'vs-dark',
  onSave,
  saveStatus,
  lastSavedTime
}) {
  const editorRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [isTyping, setIsTyping] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const appTheme = useTheme();
    const [lineCharWidth, setLineCharWidth] = useState(4);
  useEffect(() => {
    setWordCount(editorContent.split(/\s+/).filter(word => word.length > 0).length);
  }, [editorContent]);

  const defineThemes = (monaco) => {
    monaco.editor.defineTheme('my-dark-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1f2937',
        'editor.lineHighlightBackground': '#374151',
      }
    });

    monaco.editor.defineTheme('my-light-theme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#f9fafb',
        'editor.lineHighlightBackground': '#f3f4f6',
      }
    });
  };
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setLineCharWidth(2); // Mobile devices
    } else {
      setLineCharWidth(4); // Default
    }
  }, []);
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    defineThemes(monaco);
    
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column
      });
    });
    
    editor.onKeyDown(() => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    });
  };

  const handleEditorChange = (value) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  const getLanguageColor = (lang) => {
    const colors = {
      javascript: { light: 'text-yellow-500', dark: 'text-yellow-400' },
      typescript: { light: 'text-blue-500', dark: 'text-blue-400' },
      python: { light: 'text-green-500', dark: 'text-green-400' },
      html: { light: 'text-orange-500', dark: 'text-orange-400' },
      css: { light: 'text-purple-500', dark: 'text-purple-400' },
      json: { light: 'text-gray-600', dark: 'text-gray-400' },
      markdown: { light: 'text-indigo-500', dark: 'text-indigo-400' }
    };
    
    const color = colors[lang] || { light: 'text-gray-600', dark: 'text-gray-400' };
    return appTheme?.theme === 'dark' ? color.dark : color.light;
  };

  const Button = ({ children, variant = 'ghost', size = 'sm', className = '', disabled = false, ...props }) => {
    const baseClasses = {
      ghost: appTheme?.theme === 'dark'
        ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      danger: 'bg-red-500 text-white hover:bg-red-600'
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };
    
    return (
      <button
        className={`rounded-lg transition-all flex items-center ${baseClasses[variant]} ${sizeClasses[size]} ${className} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  };

  const handleCopyCode = async () => {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(editorContent);
    } else {
      // Fallback for older mobile browsers
      const textarea = document.createElement('textarea');
      textarea.value = editorContent;
      textarea.style.position = 'fixed'; // Avoid scrolling to bottom
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  } catch (err) {
    console.error("Copy failed:", err);
    alert("Copy failed. Please try manually.");
  }
};


  const handleDownloadFile = () => {
    const blob = new Blob([editorContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile?.name || 'code.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      className={`flex flex-col relative ${
        appTheme?.theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-white'
      } ${isFullscreen ? 'fixed inset-0 ' : 'h-full'}`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>

      {/* Futuristic Header */}
      <motion.div
        className={`relative backdrop-blur-xl border-b shadow-2xl ${
          appTheme?.theme === 'dark'
            ? 'bg-gray-800/90 border-gray-700/50'
            : 'bg-white/90 border-gray-200/50'
        }`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between p-4 ">
          {/* Left Section - Window Controls & File Info */}
          <div className="flex items-center space-x-2 sm:space-x-6">
            <motion.div 
              className="hidden sm:flex items-center space-x-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <motion.div 
                className="w-3 h-3 bg-red-500 rounded-full cursor-pointer hover:bg-red-400 transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
              <motion.div 
                className="w-3 h-3 bg-yellow-500 rounded-full cursor-pointer hover:bg-yellow-400 transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
              <motion.div 
                className="w-3 h-3 bg-green-500 rounded-full cursor-pointer hover:bg-green-400 transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-1 sm:space-x-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className={`flex items-center space-x-2 px-2 sm:px-3 py-1 rounded sm:rounded-lg border ${
                appTheme?.theme === 'dark'
                  ? 'bg-gray-700/50 border-gray-600/50'
                  : 'bg-gray-100/50 border-gray-200/50'
              }`}>
                <Code2 className={`h-4 w-4 ${
                  appTheme?.theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                }`} />
                <span className={`text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-[200px] ${
                  appTheme?.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {currentFile?.name || 'untitled.txt'}
                </span>
                {isTyping && (
                  <motion.div
                    className={`w-2 h-2 rounded-full ${
                      appTheme?.theme === 'dark' ? 'bg-green-400' : 'bg-green-500'
                    }`}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
              
              <div className={`px-2 py-1 text-xs rounded-full border ${getLanguageColor(language)} border-current/30 bg-current/10 hidden sm:block`}>
                {language.toUpperCase()}
              </div>
            </motion.div>
          </div>
          
          {/* Right Section - Action Buttons */}
          <motion.div 
            className="flex items-center space-x-1 sm:space-x-2"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onSave}
                disabled={saveStatus === 'saving' || !dirty}
                className={`
                  ${saveStatus === 'saving' ? 'opacity-75 cursor-not-allowed' : ''}
                  ${
                    dirty 
                      ? appTheme?.theme === 'dark'
                        ? 'hover:text-green-400 hover:bg-green-400/10'
                        : 'hover:text-green-600 hover:bg-green-50'
                      : ''
                  }
                `}
              >
                {saveStatus === 'saving' ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-1 sm:mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">Saving...</span>
                  </span>
                ) : (
                  <>
                    <Save className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleCopyCode}
                className={
                  appTheme?.theme === 'dark'
                    ? 'hover:text-purple-400 hover:bg-purple-400/10'
                    : 'hover:text-purple-600 hover:bg-purple-50'
                }
              >
                <Copy className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleDownloadFile}
                className={
                  appTheme?.theme === 'dark'
                    ? 'hover:text-blue-400 hover:bg-blue-400/10'
                    : 'hover:text-blue-600 hover:bg-blue-50'
                }
              >
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </motion.div>
            
            
            
            <div className={`w-px h-6 mx-1 sm:mx-2 ${
              appTheme?.theme === 'dark' ? 'bg-gray-600/50' : 'bg-gray-300'
            }`} />
            
            <motion.button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-2 rounded-lg transition-colors  ${
                appTheme?.theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </motion.button>
          </motion.div>
        </div>

        {/* Secondary Header - Stats */}
        <motion.div 
          className={`px-2 sm:px-4 py-2 flex items-center justify-between text-xs border-t ${
            appTheme?.theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700/30'
              : 'bg-gray-50/50 border-gray-200/30'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-2 sm:space-x-6">
            <div className={`flex items-center space-x-2 ${
              appTheme?.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <GitBranch className="h-3 w-3" />
              <span className="hidden sm:inline">main</span>
            </div>
          </div>
          
          <div className={`flex items-center space-x-1 sm:space-x-4 ${
            appTheme?.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <span>{(editorContent.length / 1024).toFixed(2)} KB</span>
            <span className="hidden sm:inline">{wordCount} words</span>
            <span>{editorContent.length} chars</span>
            <span>{editorContent.split('\n').length} lines</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Editor Content */}
      <div className="flex-1 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Editor
            beforeMount={defineThemes}
            height="100%"
            language={language}
            value={editorContent}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            loading={<div className="text-gray-500 p-4">Loading editor...</div>}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              folding: true,
              autoIndent: 'full',
              formatOnPaste: true,
              formatOnType: true,
              automaticLayout: true,
                        glyphMargin: false,
                        lineNumbersMinChars: lineCharWidth,
            }}
             key={currentFile?.permanentId || currentFile?.id || currentFile?.name || 'editor'}

            theme={appTheme?.theme === 'dark' ? 'my-dark-theme' : 'my-light-theme'}
          />
        </motion.div>
      </div>

      {/* Enhanced Status Bar */}
      <motion.div 
        className={`px-2 sm:px-4 py-2 backdrop-blur-sm border-t flex items-center justify-between text-xs relative z-10 ${
          appTheme?.theme === 'dark'
            ? 'bg-gray-800/90 border-gray-700/50 text-gray-400'
            : 'bg-white/90 border-gray-200/50 text-gray-600'
        }`}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex items-center space-x-2 sm:space-x-6">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              appTheme?.theme === 'dark' ? 'bg-green-400' : 'bg-green-500'
            }`} />
            <span className="hidden sm:inline">Line {cursorPosition.line}, Column {cursorPosition.column}</span>
            <span className="sm:hidden">Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
          </motion.div>
          
          <div className="flex items-center space-x-2">
            <Zap className={`h-3 w-3 ${
              appTheme?.theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
            }`} />
            <span className="capitalize hidden sm:inline">{language}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-6">
          <motion.div 
            className="flex items-center space-x-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className={`w-2 h-2 rounded-full ${
              appTheme?.theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
            }`} />
            <span className="hidden sm:inline">Live</span>
          </motion.div>
          
          <span className="hidden sm:inline">{editorContent.length} chars</span>
          <span>{editorContent.split('\n').length} lines</span>
          <span>{(editorContent.length / 1024).toFixed(2)} KB</span>
        </div>
      </motion.div>
    </motion.div>
  );
}