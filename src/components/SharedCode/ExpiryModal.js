"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Check, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

export default function ExpiryModal({
  isOpen,
  onClose,
  shareId,
  currentExpiry,
  onExpiryUpdate
}) {
  const [selectedExpiry, setSelectedExpiry] = useState(currentExpiry || '1h');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const { theme } = useTheme();

  const expiryOptions = [
    { value: '1m', label: '1 Minute' },
    { value: '1h', label: '1 Hour' },
    { value: '3h', label: '3 Hours' },
    { value: '24h', label: '24 Hours' }
    // { value: '2d', label: '2 Days' },
    // { value: '3d', label: '3 Days' }
  ];

  const handleUpdateExpiry = async () => {
    setIsUpdating(true);
    setUpdateSuccess(false);
    
    try {
      const response = await fetch(`/api/folder/liveAlias/${shareId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresIn: selectedExpiry }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update expiry');
      }

      // Call the update handler with new data
      onExpiryUpdate({
        expiresIn: selectedExpiry,
        expiresAt: data.data.expiresAt
      });

      setUpdateSuccess(true);
      toast.success('Expiry time updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      toast.error(error.message || 'Failed to update expiry time');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  // Theme variables
  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const secondaryTextColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const cardBg = theme === 'dark' ? 'bg-gray-750' : 'bg-white';
  const iconColor = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
  const infoCardBg = theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50';
  const infoCardBorder = theme === 'dark' ? 'border-blue-700/50' : 'border-blue-200';
  const infoCardText = theme === 'dark' ? 'text-blue-300' : 'text-blue-700';
  const successBg = theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600';
  const optionBg = theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200';
  const selectedOptionBg = theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500';

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
                <Clock className={`h-6 w-6 ${iconColor}`} />
              </motion.div>
              <div>
                <motion.h2 
                  className={`text-xl font-bold ${textColor}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Change Expiry Time
                </motion.h2>
                <motion.p 
                  className={`text-sm ${secondaryTextColor}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Update when this session will expire
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
            {/* Expiry Options */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="grid grid-cols-2 gap-3">
                {expiryOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => setSelectedExpiry(option.value)}
                    className={`p-3 rounded-xl transition-all flex flex-col items-center ${
                      selectedExpiry === option.value 
                        ? `${selectedOptionBg} text-white` 
                        : `${optionBg} ${textColor}`
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs opacity-80">
                      {option.value}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Current Selection */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className={`p-3 rounded-xl border ${borderColor} ${cardBg} flex items-center justify-between`}>
                <div className={`${textColor}`}>
                  <div className="text-sm font-medium">Selected Expiry</div>
                  <div className="text-lg">
                    {expiryOptions.find(o => o.value === selectedExpiry)?.label}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full ${
                  theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'
                }`}>
                  {selectedExpiry}
                </div>
              </div>
            </motion.div>

            {/* Success Message */}
            <AnimatePresence>
              {updateSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-4 p-3 rounded-xl flex items-center ${successBg}`}
                >
                  <Check className="h-5 w-5 mr-2" />
                  Expiry time updated successfully!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div 
              className="flex justify-end gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.button
                onClick={onClose}
                className={`px-4 py-2 rounded-xl font-medium ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                } ${textColor}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleUpdateExpiry}
                disabled={isUpdating || updateSuccess}
                className={`px-4 py-2 rounded-xl font-medium text-white ${
                  theme === 'dark' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-400'
                } ${(isUpdating || updateSuccess) ? 'opacity-70 cursor-not-allowed' : ''}`}
                whileHover={!(isUpdating || updateSuccess) ? { scale: 1.02 } : {}}
                whileTap={!(isUpdating || updateSuccess) ? { scale: 0.98 } : {}}
              >
                {isUpdating ? (
                  <span className="flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </span>
                ) : (
                  'Update Expiry'
                )}
              </motion.button>
            </motion.div>

            {/* Info Card */}
            <motion.div 
              className={`mt-4 p-4 rounded-xl border ${infoCardBorder} ${infoCardBg}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className={`text-sm ${infoCardText}`}>
                Changing the expiry time will update when this session automatically closes. 
                All participants will see the new expiration time.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}