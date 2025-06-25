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
    <>
      <style>{styles}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md mx-4 mac-open">
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Lock className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-semibold text-white">Read-Only Warning</h2>
            </div>
            <button 
              className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
              onClick={onCancel}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6">
            <p className="text-gray-300 mb-6">
              You'll not be able to edit this file in future once it is saved, To have access of the file please Login.
            </p>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontAskAgain}
                  onChange={(e) => onDontAskAgainChange(e.target.checked)}
                  className="h-4 w-4 text-indigo-500 rounded focus:ring-indigo-500 focus:ring-offset-gray-800 focus:ring-offset-2"
                />
                <span className="text-gray-300">Don't ask me again</span>
              </label>
              
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center gap-2 transition-colors"
                >
                  Confirm
                </button>
                <button 
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReadOnlyWarning;