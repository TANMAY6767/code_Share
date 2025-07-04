// hooks/useScrollbarStyle.js
import { useEffect } from 'react';

export default function useScrollbarStyle(theme) {
  useEffect(() => {
    const styleId = 'custom-scrollbar-style';
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    const scrollbarStyles = theme === 'dark' 
      ? `
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #4b5563 !important; /* gray-600 */
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #6b7280 !important; /* gray-500 */
        }
      `
      : `
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #d1d5db !important; /* gray-300 */
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #9ca3af !important; /* gray-400 */
        }
      `;
      
    styleElement.innerHTML = `
      .scrollbar-custom {
        scrollbar-width: thin;
      }
      .scrollbar-custom::-webkit-scrollbar {
        width: 8px;
      }
      .scrollbar-custom::-webkit-scrollbar-track {
        background: transparent;
      }
      ${scrollbarStyles}
    `;
    
    return () => {
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, [theme]);
}