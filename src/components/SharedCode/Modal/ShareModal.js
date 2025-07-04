import React, { useState, useEffect } from 'react';
import { faTimes, faCopy, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { X, Copy, Link as LinkIcon } from 'lucide-react';

const ShareModal = ({ onClose, shareId }) => {
  const [defaultUrl, setDefaultUrl] = useState(`${process.env.NEXT_PUBLIC_BASE_URL}/${shareId}`);
  const [customUrl, setCustomUrl] = useState(`${process.env.NEXT_PUBLIC_BASE_URL}/`);
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

  const slug = new URL(customUrl).pathname.replace(/^\//, '');



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

  const defaultAlias = shareId; // because default URL = ${process.env.NEXT_PUBLIC_BASE_URL}0/shareId
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
    setCustomUrl(`${process.env.NEXT_PUBLIC_BASE_URL}/${slug}`);

    setTimeout(() => {
      window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl">
      <div className="bg-slate-800/80 backdrop-blur-2xl rounded-2xl border border-slate-700/50 w-full max-w-2xl mx-4 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-white">Share Your Code</h2>
          <button
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Default URL</h3>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  id="defaultUrl"
                  readOnly
                  className="flex-1 px-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  value={defaultUrl}
                />
                <button
                  className="p-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all"
                  onClick={() => copyUrl('defaultUrl')}
                >
                  <Copy className="w-4 h-4" />
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
                  className="flex-1 px-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  value={customUrl}
                  onChange={(e) => {
                    const base = `${process.env.NEXT_PUBLIC_BASE_URL}/`;
                    const inputValue = e.target.value;

                    if (!inputValue.startsWith(base)) return;
                    const alias = inputValue.slice(base.length).replace(/\s/g, '');
                    setCustomUrl(`${base}${alias}`);
                  }}
                />
                <button
                  className="p-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all"
                  onClick={() => copyUrl('customUrl')}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <small className="block text-slate-400 text-sm">
                Custom URLs must contain only letters, numbers, and hyphens
              </small>
              {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
              {success && <div className="text-emerald-400 text-sm mt-1">{success}</div>}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-slate-700/50">
            <button
              className={`px-4 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-cyan-500/20 ${
                isLoading ? 'opacity-70 pointer-events-none' : ''
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
                  <LinkIcon className="w-4 h-4" />
                  Generate Link
                </>
              )}
            </button>
            <button
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;