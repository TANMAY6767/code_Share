'use client';
import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Code, Share2, Plus, X, FileText } from 'lucide-react';

export default function CodeSharingApp() {
  const [files, setFiles] = useState([
    { id: 1, name: 'script.js', language: 'javascript', code: '// Your JavaScript code here' },
    { id: 2, name: 'style.css', language: 'css', code: '/* Your CSS here */' },
    { id: 3, name: 'index.html', language: 'html', code: '<!-- Your HTML here -->' }
  ]);
  const [activeFile, setActiveFile] = useState(1);
  const [shareUrl, setShareUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const editorRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
  ];

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  function handleCodeChange(value) {
    setFiles(files.map(file => 
      file.id === activeFile ? { ...file, code: value } : file
    ));
  }

  function addNewFile() {
    const newId = files.length > 0 ? Math.max(...files.map(f => f.id)) + 1 : 1;
    setFiles([...files, {
      id: newId,
      name: `file-${newId}.js`,
      language: 'javascript',
      code: '// New file'
    }]);
    setActiveFile(newId);
  }

  function removeFile(id) {
    if (files.length <= 1) return;
    setFiles(files.filter(file => file.id !== id));
    if (activeFile === id) {
      setActiveFile(files[0].id);
    }
  }

  function changeLanguage(id, language) {
    setFiles(files.map(file => 
      file.id === id ? { ...file, language } : file
    ));
  }

  function generateShareUrl() {
    // In a real app, you would send the code to your backend
    // and get a unique URL. For demo, we'll just create a mock URL
    const randomId = Math.random().toString(36).substring(2, 9);
    const url = `${window.location.origin}/share/${randomId}`;
    setShareUrl(url);
    return url;
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(shareUrl || generateShareUrl());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">CodeShare</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={generateShareUrl}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
            {shareUrl && (
              <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
                <span className="text-sm text-gray-600 mr-2">{shareUrl}</span>
                <button onClick={copyToClipboard} className="text-gray-500 hover:text-gray-700">
                  <Copy className="h-4 w-4" />
                </button>
                {isCopied && <span className="ml-2 text-xs text-green-600">Copied!</span>}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* File Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 flex items-center overflow-x-auto">
          <div className="flex space-x-1">
            {files.map(file => (
              <div
                key={file.id}
                className={`flex items-center px-3 py-2 text-sm border-b-2 ${activeFile === file.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <button
                  onClick={() => setActiveFile(file.id)}
                  className="flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {file.name}
                </button>
                {files.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addNewFile}
            className="ml-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="bg-white px-4 py-2 border-b border-gray-200">
          <select
            value={files.find(f => f.id === activeFile)?.language || 'javascript'}
            onChange={(e) => changeLanguage(activeFile, e.target.value)}
            className="text-sm border border-gray-300 rounded px-3 py-1"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={files.find(f => f.id === activeFile)?.language || 'javascript'}
            value={files.find(f => f.id === activeFile)?.code || ''}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}