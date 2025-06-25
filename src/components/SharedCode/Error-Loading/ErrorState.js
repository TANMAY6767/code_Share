import { FileText } from 'lucide-react';

export default function ErrorState({ router }) {
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