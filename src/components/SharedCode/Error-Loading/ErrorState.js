import { FileText } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext'; // Adjust path as needed

export default function ErrorState({ router }) {
  const { theme, isThemeLoaded } = useTheme();
  
  if (!isThemeLoaded) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`} />
    );
  }

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-gray-100 via-white to-gray-100'
      }`}
    >
      <div className="text-center max-w-md">
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${
          isDark
            ? 'bg-gradient-to-br from-red-600/20 to-pink-600/20'
            : 'bg-gradient-to-br from-red-100 to-pink-100'
        }`}>
          <FileText className={`w-8 h-8 ${
            isDark ? 'text-red-400' : 'text-red-500'
          }`} />
        </div>
        
        <h2 className={`text-2xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          Code Not Found
        </h2>
        
        <p className={`mb-6 ${
          isDark ? 'text-slate-400' : 'text-gray-600'
        }`}>
          The shared code you're looking for doesn't exist or has expired.
        </p>
        
        <button
          onClick={() => router.push('/')}
          className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
            isDark
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
          }`}
        >
          Create New Code
        </button>
      </div>
    </div>
  );
}