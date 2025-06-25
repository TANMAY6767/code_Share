import { ArrowLeft, Copy, Check, Download, Share2, Terminal, Save, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReadOnlyWarning from '../Modal/ReadOnlyWarning';
export default function Header({ 
  router, 
  onShare, 
  onCopy, 
  onDownload, 
  onSave, 
  onCopyLink, 
  saveStatus,  
  copied, 
  
  linkCopied,
  readOnly,
  fileType // Add fileType to props
}) {
  
  const [showReadOnlyWarning, setShowReadOnlyWarning] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);




  const handleSave = async () => {
    setSaveStatus({ state: 'saving', justSaved: false });
    try {
      await onSave();
      
      // Only show saved state for editable files
      if (fileType === 'editable') {
        setSaveStatus({ state: 'saved', justSaved: true });
      }
    } catch (error) {
      setSaveStatus({ state: 'idle', justSaved: false });
    }
  };

 
//   const handleClick = async () => {
//   setShowReadOnlyWarning(true);
//   await handleSave(); // wait if async
//   onShare();          // call after save
// };
  return (
    
    <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-4">
      
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side logo and back button */}
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

        {/* Right side action buttons */}
        <div className="flex items-center space-x-3">
          {!readOnly && (
            <>
              <button
                onClick={onCopy}
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
                onClick={onDownload}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              
              {/* Save button with state management */}
              <button
  onClick={onSave}
  disabled={saveStatus === 'saving' || saveStatus === 'saved'}
  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all duration-200 min-w-[100px] justify-center ${
    saveStatus === 'saved'
      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
      : saveStatus === 'saving'
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
      : 'bg-indigo-500 hover:bg-indigo-400 text-white hover:shadow-lg hover:shadow-indigo-500/25'
  }`}
>
  {saveStatus === 'saving' ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : saveStatus === 'saved' ? (
    <Check className="h-4 w-4" />
  ) : (
    <Save className="h-4 w-4" />
  )}
  <span>
    {saveStatus === 'saving' ? 'SAVING...' : 
     saveStatus === 'saved' ? 'SAVED!' : 'SAVE'}
  </span>
</button>
            </>
          )}

          {/* Share/Copy Link button */}
          {readOnly ? (
            <>
            <button
                onClick={onCopy}
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
                onClick={onDownload}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            <button
              onClick={onCopyLink}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <Share2 className="h-4 w-4" />
              <span>{linkCopied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            </>
            

          ) : (
            <button
              onClick={onShare}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <Share2 className="h-4 w-4" />
              <span>SHARE</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}