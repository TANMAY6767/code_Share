import { Loader2 } from 'lucide-react';

export default function LoadingState() {
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