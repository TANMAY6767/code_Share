// LiveShareModal.js
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, X, Globe, Check, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

export default function LiveShareModal({
  isOpen,
  onClose,
  shareId
}) {
  const [defaultUrl, setDefaultUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [slugError, setSlugError] = useState('');
  const [slugSuccess, setSlugSuccess] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { theme } = useTheme();
  
  // Set URLs on open
  useEffect(() => {
    if (isOpen) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://codeurl.dev';
      setDefaultUrl(`${baseUrl}/live/${shareId}`);
      setCustomSlug('');
      setSlugError('');
      setSlugSuccess('');
    }
  }, [isOpen, shareId]);

  const copyToClipboard = (url) => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(url).then(() => {
          toast.success('URL copied to clipboard!');
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        }).catch((err) => {
          console.error('Clipboard API failed:', err);
          fallbackCopy(url);
        });
      } else {
        fallbackCopy(url);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      fallbackCopy(url);
    }

    function fallbackCopy(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (success) {
        toast.success('URL copied to clipboard!');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        toast.error('Copy failed. Please try manually.');
      }
    }
  };

  const generateShareLink = async () => {
    setSlugError('');
    setSlugSuccess('');

    if (!customSlug) {
      setSlugError('Please enter a custom URL');
      return;
    }

    const isValid = /^[a-zA-Z0-9-]+$/.test(customSlug);
    if (!isValid) {
      setSlugError('Custom URL must contain only letters, numbers, and hyphens');
      return;
    }

    if (customSlug.length < 5) {
      setSlugError('Alias must be at least 5 characters long');
      return;
    }

    if (customSlug.length > 20) {
      setSlugError('Alias must not exceed 20 characters');
      return;
    }

    if (customSlug === shareId) {
      setSlugError('Custom alias cannot be the same as the default alias');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/folder/liveAlias/${shareId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias: customSlug }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!data.success) {
        setSlugError(data.message || 'Something went wrong');
        return;
      }

      setSlugSuccess('Custom URL generated successfully!');
      
      // Redirect to new URL after delay
      setTimeout(() => {
        window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/live/${customSlug}`;
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      setSlugError('Failed to generate link');
    }
  };

  if (!isOpen) return null;

  // Theme variables
  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const secondaryTextColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const inputBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50';
  const cardBg = theme === 'dark' ? 'bg-gray-750' : 'bg-white';
  const iconColor = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
  const infoCardBg = theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50';
  const infoCardBorder = theme === 'dark' ? 'border-blue-700/50' : 'border-blue-200';
  const infoCardText = theme === 'dark' ? 'text-blue-300' : 'text-blue-700';
  const errorBg = theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600';
  const successBg = theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <div 
          className="fixed inset-0" 
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300 
          }}
          className={`relative w-full max-w-md ${bgColor} rounded-2xl shadow-2xl border ${borderColor} overflow-hidden z-10`}
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className={`absolute -top-10 -left-10 w-64 h-64 rounded-full blur-3xl ${
                theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-500/5'
              }`}
              animate={{
                x: [0, 20, 0],
                y: [0, -15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className={`absolute -bottom-10 -right-10 w-72 h-72 rounded-full blur-3xl ${
                theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-500/5'
              }`}
              animate={{
                x: [0, -15, 0],
                y: [0, 20, 0],
                scale: [1, 0.9, 1],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          {/* Header */}
          <div className={`flex items-center justify-between p-5 border-b ${borderColor}`}>
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'}`}
                whileHover={{ rotate: 15 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Globe className={`h-6 w-6 ${iconColor}`} />
              </motion.div>
              <div>
                <motion.h2 
                  className={`text-xl font-bold ${textColor}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Share Live Session
                </motion.h2>
                <motion.p 
                  className={`text-sm ${secondaryTextColor}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Create a custom URL for your live collaboration
                </motion.p>
              </div>
            </motion.div>
            <motion.button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700/50 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Default URL Section */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className={`block text-sm font-medium mb-2 ${secondaryTextColor}`}>
                Default URL
              </label>
              <div className={`flex items-center justify-between ${inputBg} px-4 py-3 rounded-xl border ${borderColor}`}>
                <div className={`truncate ${textColor}`}>
                  {defaultUrl}
                </div>
                <motion.button
                  onClick={() => copyToClipboard(defaultUrl)}
                  className={`p-2 rounded-lg ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className={`h-4 w-4 ${secondaryTextColor}`} />
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Custom Alias Section */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className={`block text-sm font-medium mb-2 ${secondaryTextColor}`}>
                Custom Alias
              </label>
              <div className="flex flex-col space-y-3">
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${secondaryTextColor}`}>
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => {
                      // Extract only the slug part
                      const inputValue = e.target.value;
                      const base = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://codeurl.dev'}/live/`;
                      
                      // If user pastes full URL, extract the slug
                      if (inputValue.includes(base)) {
                        setCustomSlug(inputValue.replace(base, ''));
                      } else {
                        // Allow only valid characters
                        const sanitized = inputValue.replace(/[^a-zA-Z0-9-]/g, '');
                        setCustomSlug(sanitized);
                      }
                    }}
                    className={`w-full pl-10 pr-3 py-3 border ${borderColor} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBg} ${textColor}`}
                    placeholder="your-custom-alias"
                  />
                </div>
                
                <motion.button
                  onClick={generateShareLink}
                  disabled={isLoading}
                  className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${
                    isLoading 
                      ? 'opacity-70 cursor-not-allowed' 
                      : 'hover:opacity-90'
                  } ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  }`}
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4" />
                      <span>Generate Custom Link</span>
                    </>
                  )}
                </motion.button>
              </div>
              
              <p className={`text-xs mt-2 ${secondaryTextColor}`}>
                Alias must be 5-20 characters, letters, numbers, and hyphens only
              </p>

              {/* Status Messages */}
              <AnimatePresence>
                {slugError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`text-xs mt-2 p-2 rounded-lg ${errorBg}`}
                  >
                    {slugError}
                  </motion.div>
                )}

                {slugSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`text-xs mt-2 p-2 rounded-lg flex items-center ${successBg}`}
                  >
                    <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                    {slugSuccess}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Info Card */}
            <motion.div 
              className={`p-4 rounded-xl border ${infoCardBorder} ${infoCardBg}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <p className={`text-sm ${infoCardText}`}>
                After generating, you'll be redirected to your new custom URL. Share this link with others to collaborate in real-time!
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}