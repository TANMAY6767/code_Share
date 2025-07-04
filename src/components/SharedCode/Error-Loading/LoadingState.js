import { Loader2 } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function LoadingState() {
  const { theme, isThemeLoaded } = useTheme();

  if (!isThemeLoaded) return null; // Prevent flicker

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-gray-100 via-white to-gray-100'
      }`}
    >
      <div className="flex flex-col items-center">
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${
            isDark
              ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/20'
              : 'bg-gradient-to-br from-blue-300/20 to-indigo-300/20'
          }`}
        >
          <Loader2
            className={`w-8 h-8 animate-spin ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}
          />
        </div>
        <h2
          className={`text-2xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          Loading your code
        </h2>
        <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
          This might take a moment
        </p>
      </div>
    </div>
  );
}
