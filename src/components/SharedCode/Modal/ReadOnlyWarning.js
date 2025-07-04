import { Lock, X } from 'lucide-react';

const ReadOnlyWarning = ({ 
  onConfirm, 
  onCancel,
  onDontAskAgainChange,
  dontAskAgain
}) => {
  const styles = `
    @keyframes macOpen {
      0% {
        transform: scale(0.8) translateY(20px);
        opacity: 0;
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes macClose {
      0% {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(0.8) translateY(20px);
        opacity: 0;
      }
    }
    
    .mac-open {
      animation: macOpen 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    
    .mac-close {
      animation: macClose 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards;
    }
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl">
      <div className="bg-slate-800/80 backdrop-blur-2xl rounded-2xl border border-slate-700/50 w-full max-w-md mx-4 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <Lock className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-semibold text-white">Read-Only Warning</h2>
          </div>
          <button 
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
            onClick={onCancel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-slate-300 mb-6">
            This file will become read-only after saving. To maintain editing access, please log in.
          </p>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dontAskAgain}
                onChange={(e) => onDontAskAgainChange(e.target.checked)}
                className="h-4 w-4 text-indigo-500 rounded focus:ring-indigo-500 focus:ring-offset-slate-800 focus:ring-offset-2 bg-slate-700/50 border-slate-600"
              />
              <span className="text-slate-300">Don't ask me again</span>
            </label>
            
            <div className="flex justify-end gap-4 pt-6 border-t border-slate-700/50">
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-indigo-500/20"
              >
                Confirm
              </button>
              <button 
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadOnlyWarning;