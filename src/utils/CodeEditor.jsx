import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Share, ArrowLeft, FileText, Clock, Lock, Unlock, Terminal, Zap } from 'lucide-react';
import ShareModal from '../components/ShareModal';

const CodeEditor: React.FC = () => {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [codeType, setCodeType] = useState('read-write');
  const [expiryTime, setExpiryTime] = useState('1h');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const languages = [
    { value: 'javascript', label: 'JavaScript', color: 'text-yellow-400' },
    { value: 'typescript', label: 'TypeScript', color: 'text-blue-400' },
    { value: 'python', label: 'Python', color: 'text-green-400' },
    { value: 'java', label: 'Java', color: 'text-red-400' },
    { value: 'cpp', label: 'C++', color: 'text-purple-400' },
    { value: 'html', label: 'HTML', color: 'text-orange-400' },
    { value: 'css', label: 'CSS', color: 'text-cyan-400' },
    { value: 'json', label: 'JSON', color: 'text-pink-400' },
  ];

  const expiryOptions = [
    { value: '1h', label: '1 Hour', price: 'FREE', color: 'text-green-400' },
    { value: '24h', label: '24 Hours', price: 'FREE', color: 'text-green-400' },
    { value: '2d', label: '2 Days', price: 'PRO', color: 'text-yellow-400' },
    { value: '3d', label: '3 Days', price: 'PRO', color: 'text-yellow-400' },
  ];

  const handleSave = () => {
    if (!fileName.trim() || !code.trim()) {
      alert('Please enter both filename and code');
      return;
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleShare = () => {
    if (!fileName.trim() || !code.trim()) {
      alert('Please save your code first');
      return;
    }
    setIsShareModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
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
              onClick={saveFile}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all duration-200 ${isSaved
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-indigo-500 hover:bg-indigo-400 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                }`}
            >
              <Save className="h-4 w-4" />
              <span>{isSaved ? 'SAVED!' : 'SAVE'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <Share className="h-4 w-4" />
              <span>SHARE</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Settings Panel */}
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
                      <option key={lang.value} value={lang.value} className="bg-slate-800">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 text-xs font-mono">
                    <span className="text-slate-500">selected: </span>
                    <span className={languages.find(l => l.value === language)?.color}>
                      {languages.find(l => l.value === language)?.label}
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
                        checked={type === 'read-write'}
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
                    <Clock className="h-4 w-4 mr-2 text-purple-400" />
                    {'>'} EXPIRY TIME
                  </label>
                  <div className="space-y-3">
                    {expiryOptions.map((option) => (
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

            {/* Stats */}
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center font-mono">
                <Zap className="h-5 w-5 mr-2 text-amber-400" />
                STATS
              </h3>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Lines:</span>
                  <span className="text-indigo-400">{code.split('\n').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chars:</span>
                  <span className="text-purple-400">{code.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Size:</span>
                  <span className="text-emerald-400">{(code.length / 1024).toFixed(2)} KB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Code Editor */}
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

                {/* Line numbers overlay effect */}
                
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        fileName={fileName}
        language={language}
      />
    </div>
  );
};

export default CodeEditor;