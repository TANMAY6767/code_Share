'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Palette, Calendar, Share2, Copy, Check, Download, FileText, ArrowLeft, Lock, Unlock, Terminal, Zap } from 'lucide-react';
import { toast } from 'sonner';
import Editor from '@monaco-editor/react';
import ShareModal from '../../../components/ShareModal';

const LANGUAGES = [
  'javascript', 'typescript', 'html', 'css', 'python',
  'java', 'cpp', 'csharp', 'php', 'ruby', 'go',
  'rust', 'swift', 'kotlin'
];

const LANGUAGE_COLORS = {
  javascript: 'text-yellow-500',
  typescript: 'text-blue-500',
  html: 'text-orange-500',
  css: 'text-blue-400',
  python: 'text-green-500',
  java: 'text-red-500',
  cpp: 'text-indigo-500',
  csharp: 'text-purple-500',
  php: 'text-violet-700',
  ruby: 'text-pink-500',
  go: 'text-cyan-600',
  rust: 'text-orange-700',
  swift: 'text-red-400',
  kotlin: 'text-purple-400'
};

const EXPIRY_OPTIONS = [
  { value: '1h', label: '1 Hour', price: 'FREE', color: 'text-green-400' },
  { value: '24h', label: '24 Hours', price: 'FREE', color: 'text-green-400' },
  { value: '2d', label: '2 Days', price: 'PRO', color: 'text-yellow-400' },
  { value: '3d', label: '3 Days', price: 'PRO', color: 'text-yellow-400' },
];

export default function SharedCodeViewer() {
  const { shareId } = useParams();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkcopied, setLinkCopied] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [fileName, setFileName] = useState('');
  const [type, setType] = useState('editable');
  const [editorContent, setEditorContent] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [expiryTime, setExpiryTime] = useState('1h');

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        const res = await fetch(`/api/folder/share/${shareId}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        if (!data.success || !data.data) {
          throw new Error('Code not found');
        }

        setFile(data.data);
        setLanguage(data.data.language || 'javascript');
        setFileName(data.data.filename || '');
        setType(data.data.type || 'editable');
        setEditorContent(data.data.content || '');
      } catch (err) {
        setError(true);
        toast.error('Failed to load shared code');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) fetchSharedFile();
  }, [shareId]);

  const saveFile = async () => {
    try {
      const res = await fetch(`/api/folder/done/${shareId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: fileName,
          language,
          content: editorContent,
          type
        })
      });

      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();

      if (!data.success) throw new Error('Failed to save file');

      toast.success('File saved successfully!');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      toast.error('Failed to save file');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const fileBlob = new Blob([file.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = file.filename || 'shared-code.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-xl flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading your code</h2>
          <p className="text-slate-400">This might take a moment</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600/20 to-pink-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Code Not Found</h2>
          <p className="text-slate-400 mb-6">The shared code you're looking for doesn't exist or has expired.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-lg transition-colors"
          >
            Create New Code
          </button>
        </div>
      </div>
    );
  }

  if (file.type === "editable") {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 relative">
        <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 text-slate-400 hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-700 group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center space-x-3">
                <Terminal className="h-6 w-6 text-indigo-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                  CodeShare
                </span>
                <div className="text-slate-500 font-mono text-sm">/ editor</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={copyCode}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </>
                )}
              </button>

              <button
                onClick={downloadCode}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={saveFile}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all duration-200 ${isSaved
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-indigo-500 hover:bg-indigo-400 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                  }`}
              >
                <Check className="h-4 w-4" />
                <span>{isSaved ? 'SAVED!' : 'SAVE'}</span>
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
              >
                <Share2 className="h-4 w-4" />
                <span>SHARE</span>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          <div className="grid lg:grid-cols-4 gap-6">


            <div className="lg:col-span-3">
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
                <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors cursor-pointer"></div>
                      <div className="w-3 h-3 bg-amber-500 rounded-full hover:bg-amber-400 transition-colors cursor-pointer"></div>
                      <div className="w-3 h-3 bg-emerald-500 rounded-full hover:bg-emerald-400 transition-colors cursor-pointer"></div>
                    </div>
                    <div className="text-slate-500 font-mono text-sm">~/</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full border border-indigo-500/30 font-mono">
                      EDITOR
                    </div>
                    <span className="text-slate-400 text-sm font-mono">
                      {fileName || 'untitled'}.{language === 'javascript' ? 'js' : language}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <div className="h-[500px]">
                    <Editor
                      height="100%"
                      language={language}
                      value={editorContent}
                      onChange={(value) => setEditorContent(value || '')}
                      theme="vs-dark"
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
                </div>
              </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center font-mono">
                  <FileText className="h-5 w-5 mr-2 text-indigo-400" />
                  FILE CONFIG
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-3 font-mono">
                      {'>'} FILENAME
                    </label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="awesome-code.js"
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-3 font-mono">
                      {'>'} LANGUAGE
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono transition-all"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang} className="bg-slate-800">
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 text-xs font-mono">
                      <span className="text-slate-500">selected: </span>
                      <span className={LANGUAGE_COLORS[language] || 'text-gray-500'}>
                        {language.charAt(0).toUpperCase() + language.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-3 font-mono">
                      {'>'} ACCESS TYPE
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="codeType"
                          value="editable"
                          checked={type === 'editable'}
                          onChange={(e) => setType(e.target.value)}
                          className="text-indigo-500"
                        />
                        <Unlock className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="text-white font-mono">READ & WRITE</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="codeType"
                          value="read-only"
                          checked={type === 'read-only'}
                          onChange={(e) => setType(e.target.value)}
                          className="text-indigo-500"
                        />
                        <Lock className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="text-white font-mono">READ ONLY</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-3 font-mono flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-purple-400" />
                      {'>'} EXPIRY TIME
                    </label>
                    <div className="space-y-3">
                      {EXPIRY_OPTIONS.map((option) => (
                        <label key={option.value} className="flex items-center justify-between cursor-pointer group">
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="expiryTime"
                              value={option.value}
                              checked={expiryTime === option.value}
                              onChange={(e) => setExpiryTime(e.target.value)}
                              className="text-indigo-500"
                            />
                            <span className="text-white font-mono">{option.label}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded font-bold font-mono ${option.price === 'FREE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                            {option.price}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center font-mono">
                  <Zap className="h-5 w-5 mr-2 text-amber-400" />
                  STATS
                </h3>
                <div className="space-y-3 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lines:</span>
                    <span className="text-indigo-400">{editorContent.split('\n').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chars:</span>
                    <span className="text-purple-400">{editorContent.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Size:</span>
                    <span className="text-emerald-400">{(editorContent.length / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isShareModalOpen && file?.shareId && (
          <ShareModal
            onClose={() => setIsShareModalOpen(false)}
            shareId={file.shareId}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 text-slate-400 hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-700 group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center space-x-3">
              <Terminal className="h-6 w-6 text-indigo-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                CodeShare
              </span>
              <div className="text-slate-500 font-mono text-sm">/ editor</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">





            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <Share2 className="h-4 w-4" />
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid   gap-6">
          {/* Header */}



          {/* Code Container */}
          <div className="bg-slate-800/70 rounded-2xl shadow-2xl border border-slate-700/70 overflow-hidden backdrop-blur-sm">
            {/* Code Info Header */}
            <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-600/50">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <h1 className="text-xl font-bold text-white">{file.filename || 'Untitled'}</h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      <span>{file.language}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{file.createdAt ? formatDate(file.createdAt) : 'Shared via CodeShare Pro'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyCode}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </>
                    )}
                  </button>

                  <button
                    onClick={downloadCode}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Code Display */}
            <div className="p-6">
              <div className="bg-slate-900/50 rounded-lg border border-slate-600/50 overflow-hidden">
                <div className="max-h-[70vh] overflow-y-auto"> {/* Added fixed height and vertical scroll */}
                  <pre className="p-4 overflow-x-auto">
                    <code className={`text-green-400 font-mono text-sm whitespace-pre-wrap language-${file.language}`}>
                      {file.content}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Code Stats */}
            <div className="bg-slate-700/50 px-6 py-4 border-t border-slate-600/50">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <div>
                  {file.content.length} characters • {file.content.split('\n').length} lines
                </div>
                <div className="hidden sm:block">
                  {file.type}
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}

        </div>
      </div>
    </div>
  );
}