import React, { useState, useEffect } from 'react';
import { faTimes, faCopy, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ShareModal = ({ onClose, shareId }) => {
  const [defaultUrl, setDefaultUrl] = useState(`http://localhost:3000/${shareId}`);
  const [customUrl, setCustomUrl] = useState('http://localhost:3000/');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  // macOS-style animation for closing
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match this with the animation duration
  };

  const copyUrl = (id) => {
    const urlToCopy = id === 'defaultUrl' ? defaultUrl : customUrl;
    if (!urlToCopy) {
      setError('No URL to copy');
      return;
    }

    navigator.clipboard.writeText(urlToCopy)
      .then(() => {
        setSuccess('URL copied to clipboard!');
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch(() => {
        setError('Failed to copy URL');
        setTimeout(() => setError(''), 3000);
      });
  };

  const generateShareLink = async () => {
  setError('');
  setSuccess('');

  const slug = customUrl.trim().replace(/^http:\/\/localhost:3000\//, '');

  if (!slug) {
    setError('Please enter a custom URL');
    return;
  }

  const isValid = /^[a-zA-Z0-9-]+$/.test(slug);
  if (!isValid) {
    setError('Custom URL must contain only letters, numbers, and hyphens');
    return;
  }

  if (slug.length < 5) {
    setError('Alias must be at least 5 characters long');
    return;
  }

  if (slug.length > 20) {
    setError('Alias must not exceed 20 characters');
    return;
  }

  const defaultAlias = shareId; // because default URL = http://localhost:3000/shareId
  if (slug === defaultAlias) {
    setError('Custom alias cannot be the same as the default alias');
    return;
  }

  setIsLoading(true);

  try {
    const res = await fetch(`/api/folder/alias/${shareId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alias: slug }),
    });

    const data = await res.json();
    setIsLoading(false);

    if (!data.success) {
      setError(data.message || 'Something went wrong');
      return;
    }

    setSuccess('Custom URL generated successfully!');
    setCustomUrl(`http://localhost:3000/${slug}`);

    setTimeout(() => {
      window.location.href = `http://localhost:3000/${slug}`;
    }, 1000);
  } catch (err) {
    setIsLoading(false);
    setError('Failed to generate link');
  }
};


  // Add these styles to your global CSS or style tag
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
        <div
          className={`bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl mx-4 ${isClosing ? 'mac-close' : 'mac-open'
            }`}
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Share Your Code</h2>
            <button
              className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
              onClick={handleClose}
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>
          </div>

          <div className="p-8">
            <div className="space-y-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Default URL</h3>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    id="defaultUrl"
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-900 text-white border-2 border-gray-700 rounded-md font-mono text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    value={defaultUrl}
                    onChange={(e) => setDefaultUrl(e.target.value)}
                  />
                  <button
                    className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm transition-colors"
                    onClick={() => copyUrl('defaultUrl')}
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Custom URL</h3>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    id="customUrl"
                    placeholder="Enter custom URL slug"
                    className="flex-1 px-4 py-3 bg-gray-900 text-white border-2 border-gray-700 rounded-md font-mono text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    value={customUrl}
                    onChange={(e) => {
                      const base = "http://localhost:3000/";
                      const inputValue = e.target.value;

                      // Prevent deleting base
                      if (!inputValue.startsWith(base)) return;

                      // Extract alias part only
                      const alias = inputValue.slice(base.length).replace(/\s/g, '');
                      setCustomUrl(`${base}${alias}`);
                    }}
                  />
                  <button
                    className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm transition-colors"
                    onClick={() => copyUrl('customUrl')}
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
                <small className="block text-gray-400 text-sm">
                  Custom URLs must be unique and contain only letters, numbers, and hyphens
                </small>
                {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
                {success && <div className="text-green-400 text-sm mt-1">{success}</div>}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-gray-700">
              <button
                className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center gap-2 transition-colors ${isLoading ? 'opacity-70 pointer-events-none' : ''
                  }`}
                onClick={generateShareLink}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faLink} />
                    Generate Link
                  </>
                )}
              </button>
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareModal;