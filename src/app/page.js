'use client';
import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Share2, Code, FileText, Palette, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

// Supported languages - Monaco supports all of these
const LANGUAGES = [
  'javascript', 'typescript', 'html', 'css', 'python',
  'java', 'cpp', 'csharp', 'php', 'ruby', 'go',
  'rust', 'swift', 'kotlin'
];

export default function CodeEditor() {
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello World!");');
  const [fileName, setFileName] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const editorRef = useRef(null);
  const urlRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  // Clear share URL when code changes
  useEffect(() => {
    if (code !== '// Write your code here\nconsole.log("Hello World!");') {
      setShareUrl('');
    }
  }, [code]);

  const handleShare = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before sharing!');
      return;
    }

    setIsSharing(true);
    try {
      const response = await fetch('/api/folder/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: fileName.trim() || 'Untitled',
          language,
          content: code,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to share');

      const url = `${window.location.origin}/share/${data.data.shareId}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      toast.success('Shareable link copied to clipboard!');
    } catch (error) {
      toast.error(`Failed to share: ${error.message}`);
    } finally {
      setIsSharing(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">CodeUrl.in</h1>
          </div>
          <p className="text-slate-400 text-lg">Write, share, and collaborate on CodeUrl.in</p>
        </div>

        {/* Main Editor Container */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          {/* Share URL Banner - At the top */}
          {shareUrl && (
            <div className="bg-blue-900/30 px-6 py-3 border-b border-blue-700/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0 flex items-center">
                  <div className="bg-blue-600/20 p-2 rounded-lg mr-3">
                    <Share2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div 
                    ref={urlRef}
                    className="text-blue-300 text-sm md:text-base overflow-x-auto whitespace-nowrap scrollbar-hide"
                  >
                    {shareUrl}
                  </div>
                </div>
                
                <button
                  onClick={copyUrl}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <label className="text-sm font-medium text-slate-300">File Name</label>
                </div>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter file name (optional)"
                  className="w-full px-3 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-colors"
                />
              </div>
              
              <div className="w-full sm:w-48">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="w-4 h-4 text-slate-400" />
                  <label className="text-sm font-medium text-slate-300">Language</label>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-colors"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="h-[500px]">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={setCode}
              theme="vs-dark"
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 20 },
                fontFamily: 'Fira Code, monospace',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: false,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                renderLineHighlight: 'all',
                automaticLayout: true,
              }}
            />
          </div>

          {/* Action Bar */}
          <div className="bg-slate-700 px-6 py-4 border-t border-slate-600">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-sm text-slate-400">
                {code.length} characters • {code.split('\n').length} lines
              </div>
              
              <button
                onClick={handleShare}
                disabled={isSharing || !code.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isSharing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Share Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Easy Sharing</h3>
            <p className="text-slate-400 text-sm">Generate shareable links instantly with just one click</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Code className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Multi-Language</h3>
            <p className="text-slate-400 text-sm">Support for all popular programming languages</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Instant Access</h3>
            <p className="text-slate-400 text-sm">No registration required, start sharing immediately</p>
          </div>
        </div>
      </div>
    </div>
  );
}