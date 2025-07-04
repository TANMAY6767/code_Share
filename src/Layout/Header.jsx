'use client';
import { motion } from 'framer-motion';
import { Code2,Rabbit, Moon, Sun, User, LogOut, Settings, Info } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-20 backdrop-blur-xl border-b ${
        theme === 'dark'
          ? 'bg-gray-900/80 border-gray-800'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-y-2 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
  <motion.div
    whileHover={{ scale: 1.15 }} // slightly bigger
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
  >
    <Rabbit className="h-6 w-6 text-white" />
  </motion.div>
  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
    CodeUrl
  </span>
</Link>


          {/* Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap justify-end">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`} />
              ) : (
                <Sun className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`} />
              )}
            </motion.button>

            {/* Authenticated User */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-blue-400'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Dashboard
                </Link>

                {/* Profile Dropdown */}
                <div className="relative group">
                  <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-800'
                      : 'hover:bg-gray-100'
                  }`}>
                    <User className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm font-medium truncate max-w-[100px] ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {user?.name}
                    </span>
                  </button>
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border transition-all duration-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="py-1">
                      <Link
                        href="/settings"
                        className={`flex items-center px-4 py-2 text-sm ${
                          theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className={`flex items-center w-full px-4 py-2 text-sm ${
                          theme === 'dark'
                            ? 'text-red-500 hover:bg-gray-700'
                            : 'text-red-600 hover:bg-gray-100'
                        }`}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 flex-wrap">
                {/* Login */}
                <div className="relative inline-block group">
                  <button
                    disabled
                    className={`px-3 py-2 text-sm font-medium transition-colors pointer-events-none ${
                      theme === 'dark'
                        ? 'text-gray-500'
                        : 'text-gray-400'
                    }`}
                  >
                    Login
                  </button>
                  <div className="absolute invisible opacity-0 group-hover:visible group-hover:opacity-100 top-full left-1/2 -translate-x-1/2 mt-3 w-72 transition-all duration-300 ease-out transform group-hover:translate-y-0 translate-y-2 z-50">
                    <TooltipContent theme={theme} />
                  </div>
                </div>

                {/* Sign Up */}
                <div className="relative inline-block group">
                  <button
                    disabled
                    className="px-3 py-2 text-sm font-medium bg-blue-600/60 text-white/60 rounded-lg pointer-events-none"
                  >
                    Sign Up
                  </button>
                  <div className="absolute invisible opacity-0 group-hover:visible group-hover:opacity-100 top-full left-1/2 -translate-x-1/2 mt-3 w-72 transition-all duration-300 ease-out transform group-hover:translate-y-0 translate-y-2 z-50">
                    <TooltipContent theme={theme} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

// Reusable Tooltip
const TooltipContent = ({ theme }) => (
  <div
    className={`relative p-4 rounded-2xl border backdrop-blur-md shadow-[0_0_30px_rgba(79,70,229,0.15)] ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-white/10'
        : 'bg-gradient-to-br from-white/95 to-gray-100/95 border-gray-300'
    }`}
  >
    <div className="flex items-center gap-3 mb-2">
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full ${
          theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'
        }`}
      >
        <Info className={`h-4 w-4 ${
          theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
        }`} />
      </div>
      <h3 className={`text-sm font-semibold ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}>
        Notice
      </h3>
    </div>
    <p className={`text-sm ${
      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
    }`}>
      CodeUrl is still in development
    </p>
    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${
      theme === 'dark'
        ? 'from-indigo-500/10 to-purple-500/10'
        : 'from-indigo-100/50 to-purple-100/50'
    } blur-xl opacity-50`}></div>
    <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-t border-l ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-white/10'
        : 'bg-gradient-to-br from-white/95 to-gray-100/95 border-gray-300'
    }`}></div>
  </div>
);

export default Header;
