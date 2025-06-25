import { useState, useEffect } from 'react';
import { FileText, Zap, Lock, Unlock, Download } from 'lucide-react';
import { LANGUAGES, EXPIRY_OPTIONS } from '../constants';
import ReadOnlyWarning from '../Modal/ReadOnlyWarning';

export default function ConfigPanel({
  fileName,
  language,
  type,
  expiryTime,
  editorContent,
  onFileNameChange,
  onLanguageChange,
  onTypeChange,
  onExpiryTimeChange
}) {
  const [showReadOnlyWarning, setShowReadOnlyWarning] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  // Check localStorage for user preference on component mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('hideReadOnlyWarning');
    if (savedPreference === 'true') {
      setDontAskAgain(true);
    }

  }, [onTypeChange]);

  const handleTypeChange = (newType) => {
    onTypeChange(newType);
  };

  return (
    <div className="lg:col-span-1 space-y-6 relative">
      {/* Read-only Warning Modal */}
      {/* {showReadOnlyWarning && (
        <ReadOnlyWarning
          onConfirm={handleConfirmReadOnly}
          onCancel={handleCancelReadOnly}
          onDontAskAgainChange={handleDontAskAgainChange}
          dontAskAgain={dontAskAgain}
        />
      )} */}

      {/* Main Config Panel */}
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center font-mono">
          <FileText className="h-5 w-5 mr-2 text-indigo-400" />
          FILE CONFIG
        </h3>

        <div className="space-y-4">
          {/* Filename Input */}
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs font-mono text-slate-400 pointer-events-none">filename</span>
            <input
              type="text"
              value={fileName}
              onChange={(e) => onFileNameChange(e.target.value)}
              placeholder="awesome-code.js"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 pt-6 pb-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono transition-all"
            />
          </div>
          {/* <input
            type="text"
            value={fileName}
            onChange={(e) => onFileNameChange(e.target.value)}
            class="font-sans font-medium text-[0.8vw] text-white bg-[rgb(28,28,30)] 
         shadow-[0_0_0.4vw_rgba(0,0,0,0.5),_0_0_0_0.15vw_transparent] rounded-[0.4vw] 
         border-none outline-none p-[0.4vw] max-w-[190px] transition-all duration-200
         hover:shadow-[0_0_0_0.15vw_rgba(135,207,235,0.186)]
         focus:shadow-[0_0_0_0.15vw_skyblue] "
            placeholder="fileName"></input> */}

          {/* Language Selector */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-2 text-xs font-mono text-slate-400 pointer-events-none">language</span>
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 pt-6 pb-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono transition-all appearance-none"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang} className="bg-slate-800">
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Download Checkbox */}
          {/* <div className="pt-2">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-indigo-500 rounded focus:ring-indigo-500 transition-all"
              />
              <Download className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-white font-mono">DOWNLOAD FILE, ASAP</span>
            </label>
          </div> */}

          {/* Access Type */}
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
                  onChange={(e) => handleTypeChange(e.target.value)}
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
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="text-indigo-500"
                />
                <Lock className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-white font-mono">READ ONLY</span>
              </label>
            </div>
          </div>

          {/* Expiry Time */}
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
                      onChange={(e) => onExpiryTimeChange(e.target.value)}
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

      {/* Stats Panel */}
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
  );
} 