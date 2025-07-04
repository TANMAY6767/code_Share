// ProjectSettings.js
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  X,
  Save,
  Globe,
  Code,
  Menu,
  Copy,
  Trash,
  Calendar,
  FileText,
  Lock
} from 'lucide-react';
import { useEffect, useState } from 'react';
import useMediaQuery from '../../../hooks/useMediaQuery.js';
import useScrollbarStyle from '../../../hooks/useScrollbarStyle.js';
import { useTheme } from '../../../contexts/ThemeContext.jsx';
import { toast } from 'sonner';

export default function ProjectSettings({
  isOpen,
  onClose,
  projectData,
  onSave
}) {
  const [activeTab, setActiveTab] = useState('general');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { theme, isThemeLoaded } = useTheme();
  const [formData, setFormData] = useState({ ...projectData });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const getMillisecondsFromOption = (option) => {
    switch (option) {
      case '1m': return 60000;
      case '1h': return 3600000;
      case '24h': return 86400000;
      case '2d': return 2 * 86400000;
      case '3d': return 3 * 86400000;
      default: return 0;
    }
  };
  useScrollbarStyle(theme);
  if (!isThemeLoaded) return null;

  // Theme variables
  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const secondaryTextColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const cardBg = theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50';
  const hoverBg = theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100';
  const iconColor = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
  const dangerText = theme === 'dark' ? 'text-red-400' : 'text-red-600';

  const projectTypes = [
    { value: 'editable', label: 'Editable Project', icon: Globe },
    { value: 'read-only', label: 'Read only Project', icon: Code },
  ];

  const expirationOptions = [
    { value: '1m', label: '1 Minute' },
    { value: '1h', label: '1 Hour' },
    { value: '24h', label: '1 Day' },
    { value: '2d', label: '2 Days', pro: true },
    { value: '3d', label: '3 Days', pro: true },
  ];

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'advance', label: 'Advance', icon: Lock },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      let newData = { ...prev };

      if (field === 'expiresIn') {
        // Calculate new expiration time immediately
        const milliseconds = getMillisecondsFromOption(value);
        const newExpiresAt = new Date(Date.now() + milliseconds).toISOString();
        newData = { ...prev, expiresIn: value, expiresAt: newExpiresAt };
      } else {
        newData = { ...prev, [field]: value };
      }

      setHasChanges(JSON.stringify(newData) !== JSON.stringify(projectData));
      return newData;
    });
  };
  const computeExpiresIn = (expiresIn) => {
    // Just return the expiresIn value if it exists
    return expiresIn; // Default to 1 hour if not specified
  };
  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      setIsSaving(true);
      const changes = {};

      // SPECIAL HANDLING FOR EXPIRATION
      if (formData.expiresIn !== projectData.expiresIn) {
        // Only send expiresAt, not expiresIn
        changes.expiresAt = formData.expiresAt;
      }

      // Handle other fields
      Object.keys(formData).forEach(key => {
        // Skip expiresIn and expiresAt since we handled them above
        if (key === 'expiresIn' || key === 'expiresAt') return;

        if (formData[key] !== projectData[key]) {
          changes[key] = formData[key];
        }
      });

      const response = await fetch(`/api/projects/${formData.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes)
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to save project settings');

      onSave(formData);
      onClose();
      toast.success('Project settings saved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to save project settings');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setShowMobileSidebar(false);
      setHasChanges(false);
    } else {
      setFormData(projectData); // No need for default value
    }
  }, [isOpen, projectData]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('URL copied to clipboard!'))
      .catch(() => toast.error('Failed to copy URL'));
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/projects/${formData.slug}`, { method: 'DELETE' });
      const data = await response.json();

      if (!data.success) throw new Error(data.message || 'Failed to delete project');

      toast.success('Project deleted successfully');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error(error.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300
          }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full ${isMobile ? 'h-full' : 'max-w-4xl max-h-[90vh]'} rounded-2xl shadow-2xl overflow-hidden z-10 ${bgColor} border ${borderColor}`}
        >
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className={`absolute -top-10 -left-10 w-64 h-64 rounded-full blur-3xl ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-500/5'}`}
              animate={{
                x: [0, 20, 0],
                y: [0, -15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className={`absolute -bottom-10 -right-10 w-72 h-72 rounded-full blur-3xl ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-500/5'}`}
              animate={{
                x: [0, -15, 0],
                y: [0, 20, 0],
                scale: [1, 0.9, 1],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Header */}
          <motion.div
            className={`flex items-center justify-between p-5 border-b ${borderColor}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-3">
              <motion.div
                className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'}`}
                whileHover={{ rotate: 15 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Settings className={`h-6 w-6 ${iconColor}`} />
              </motion.div>
              <div>
                <h2 className={`text-xl font-bold ${textColor}`}>
                  Project Settings
                </h2>
                <p className={`text-sm ${secondaryTextColor}`}>
                  Configure your project settings
                </p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${hoverBg}`}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className={`h-5 w-5 ${secondaryTextColor}`} />
            </motion.button>
          </motion.div>

          <div className={`flex ${isMobile ? 'h-[calc(100%-200px)]' : 'h-[calc(90vh-190px)]'}`}>
            {/* Sidebar - Desktop */}
            {!isMobile && (
              <motion.div
                className={`w-64 border-r p-4 ${borderColor}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors 
                        ${activeTab === tab.id
                          ? (theme === 'dark'
                            ? 'bg-blue-900/50 text-blue-300'
                            : 'bg-blue-100 text-blue-700')
                          : (theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700/50'
                            : 'text-gray-700 hover:bg-gray-100')
                        }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="font-medium">{tab.label}</span>
                    </motion.button>
                  ))}
                </nav>
              </motion.div>
            )}

            {/* Sidebar - Mobile */}
            <AnimatePresence>
              {isMobile && showMobileSidebar && (
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`absolute inset-y-0 left-0 w-64 z-10 border-r ${borderColor} ${bgColor}`}
                >
                  <div className="p-4">
                    <nav className="space-y-2">
                      {tabs.map((tab) => (
                        <motion.button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setShowMobileSidebar(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors 
                            ${activeTab === tab.id
                              ? (theme === 'dark'
                                ? 'bg-blue-900/50 text-blue-300'
                                : 'bg-blue-100 text-blue-700')
                              : (theme === 'dark'
                                ? 'text-gray-300 hover:bg-gray-700/50'
                                : 'text-gray-700 hover:bg-gray-100')
                            }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <tab.icon className="h-4 w-4" />
                          <span className="font-medium">{tab.label}</span>
                        </motion.button>
                      ))}
                    </nav>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <div
              className={`flex-1 p-5 overflow-y-auto scrollbar-custom ${isMobile && showMobileSidebar ? 'opacity-50 pointer-events-none' : ''
                }`}
            >
              {activeTab === 'general' && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Project Name */}
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className={`block text-sm font-medium mb-2 ${secondaryTextColor}`}>
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border ${borderColor} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${cardBg} ${textColor}`}
                      placeholder="My Awesome Project"
                    />
                  </motion.div>

                  {/* Project Type */}
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className={`block text-sm font-medium mb-2 ${secondaryTextColor}`}>
                      Project Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {projectTypes.map((type) => (
                        <motion.button
                          key={type.value}
                          onClick={() => handleInputChange('type', type.value)}
                          className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors 
                            ${formData.type === type.value
                              ? (theme === 'dark'
                                ? 'border-blue-500 bg-blue-900/20'
                                : 'border-blue-500 bg-blue-50')
                              : (theme === 'dark'
                                ? 'border-gray-600 hover:border-gray-500'
                                : 'border-gray-200 hover:border-gray-300')
                            }`}
                          whileHover={{ y: -5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <type.icon className={`h-5 w-5 ${formData.type === type.value ? iconColor : secondaryTextColor}`} />
                          <span className={`text-sm font-medium ${formData.type === type.value ? textColor : secondaryTextColor}`}>
                            {type.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>

                    {formData.type === 'read-only' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`mt-3 p-4 rounded-xl text-sm ${theme === 'dark' ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700'}`}
                      >
                        ⚠️ You will lose the ability to edit this project in the future
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Expiration Time */}
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className={`block text-sm font-medium mb-2 ${secondaryTextColor} flex items-center`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Expiration Time
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {expirationOptions.map(option => (
                        <motion.button
                          key={option.value}
                          onClick={() => !option.pro && handleInputChange('expiresIn', option.value)}
                          disabled={option.pro}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-colors 
      ${formData.expiresIn === option.value  // Direct comparison
                              ? (theme === 'dark'
                                ? 'border-blue-500 bg-blue-900/30'
                                : 'border-blue-500 bg-blue-100 text-black')
                              : (theme === 'dark'
                                ? 'border-gray-600 hover:border-gray-400'
                                : 'border-gray-200 hover:border-gray-300 text-black')
                            }
      ${option.pro
                              ? (theme === 'dark'
                                ? 'bg-gray-800/60 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-500 cursor-not-allowed')
                              : 'cursor-pointer'}`}
                          whileHover={!option.pro ? { y: -5 } : {}}
                          whileTap={!option.pro ? { scale: 0.98 } : {}}
                        >
                          <span className={`font-medium text-sm ${option.pro ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : ''}`}>
                            {option.label}
                          </span>
                          {option.pro && (
                            <span className={`mt-1 text-xs px-2 py-0.5 rounded-full ${theme === 'dark'
                              ? 'bg-yellow-600/30 text-yellow-300'  // Better contrast in dark mode
                              : 'bg-yellow-500/20 text-yellow-700'
                              }`}>
                              Pro Feature
                            </span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Project URL */}
                  {/* <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label className={`block text-sm font-medium mb-2 ${secondaryTextColor}`}>
                      Project URL
                    </label>
                    <div className={`flex items-center justify-between ${cardBg} px-4 py-3 rounded-xl border ${borderColor}`}>
                      <div className={`truncate max-w-[70%] ${textColor}`}>
                        {`${process.env.NEXT_PUBLIC_BASE_URL || 'https://codeurl.dev'}/share/${formData.slug}`}
                      </div>
                      <motion.button
                        onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://codeurl.dev'}/share/${formData.slug}`)}
                        className={`p-2 rounded-lg ${hoverBg}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Copy className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div> */}
                </motion.div>
              )}

              {activeTab === 'advance' && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Danger Zone */}
                  <motion.div
                    className="pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className={`text-xl font-semibold mb-4 ${dangerText} flex items-center space-x-2`}>
                      <Lock className="h-5 w-5" />
                      <span>Danger Zone</span>
                    </h3>

                    {/* Delete Project */}
                    <motion.div
                      className={`p-5 rounded-xl border ${theme === 'dark' ? 'border-red-800/50 bg-red-900/10' : 'border-red-200 bg-red-50'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                            Delete this project
                          </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                            Once deleted, this project cannot be recovered. All files will be permanently removed.
                          </p>
                        </div>
                        <motion.button
                          onClick={handleDeleteProject}
                          disabled={isDeleting}
                          className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 
                            ${theme === 'dark'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-red-500 hover:bg-red-600 text-white'}
                            ${isDeleting ? 'opacity-70 cursor-not-allowed' : ''}`}
                          whileHover={!isDeleting ? { scale: 1.05 } : {}}
                          whileTap={!isDeleting ? { scale: 0.95 } : {}}
                        >
                          <Trash className="h-4 w-4" />
                          <span>{isDeleting ? 'Deleting...' : 'Delete Project'}</span>
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Export Project */}
                    <motion.div
                      className={`p-5 rounded-xl border ${theme === 'dark' ? 'border-amber-800/50 bg-amber-900/10' : 'border-amber-200 bg-amber-50'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
                            Export Project
                          </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
                            Download a ZIP archive of your project files.
                          </p>
                        </div>
                        <motion.button
                          className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 
                            ${theme === 'dark'
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FileText className="h-4 w-4" />
                          <span>Export as ZIP</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer */}
          <motion.div
            className={`flex items-center justify-between p-5 border-t ${borderColor}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className={`text-sm ${secondaryTextColor}`}>
              {hasChanges ? (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2"
                >
                  <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-green-500' : 'bg-green-600'} animate-pulse`} />
                  <span>Unsaved changes</span>
                </motion.div>
              ) : (
                <span>No changes to save</span>
              )}
            </div>
            <div className="flex space-x-3">
              <motion.button
                onClick={onClose}
                className={`px-4 py-2.5 border ${borderColor} rounded-xl transition-colors font-medium ${textColor} ${hoverBg}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={`px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${!hasChanges || isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
                  }`}
                whileHover={!isSaving && hasChanges ? { scale: 1.05 } : {}}
                whileTap={!isSaving && hasChanges ? { scale: 0.95 } : {}}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
{!isMobile && <span>Save Changes</span>}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}