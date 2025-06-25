// src/components/SharedCode/LiveEditor.js
"use client";

import { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import ShareModal from './Modal/LiveShareModal';
import { toast } from 'sonner';
import Header from './Navbar/HeaderLive';
const LiveEditor = ({ shareId, file, router }) => {
  const [content, setContent] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  // const [editorContent, setEditorContent] = useState(content || '');
  const [fileName, setFileName] = useState(file.filename || '');
  const [expiryTime, setExpiryTime] = useState('1h');
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  useEffect(() => {
    if (!shareId) return;

    const wsUrl = `ws://localhost:${process.env.NEXT_PUBLIC_WS_PORT || 3001}/api/live?shareId=${shareId}`;
    wsRef.current = new WebSocket(wsUrl);

    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'init':
            setContent(message.content || '');
            break;
          case 'content-update':
            setContent(message.content);
            break;
          default:
            console.log('Unhandled message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    wsRef.current.onmessage = handleMessage;

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket closed');
      setIsConnected(false);
    };

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [shareId]);

  const handleChange = (newContent) => {
    setContent(newContent);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'content-update',
        content: newContent
      }));
    }
  };
  const copyCode = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };
  const downloadCode = () => {
    const element = document.createElement('a');
    const fileBlob = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = fileName || 'shared-code.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative">
      <Header
        router={router}
        onShare={() => setIsShareModalOpen(true)}
        onCopy={copyCode}
        onDownload={downloadCode}
        copied={copied}



      />
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {!isConnected && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
                <div className="text-center p-4 bg-yellow-100 rounded-lg border border-yellow-300">
                  <p className="font-medium">Connecting to live editor...</p>
                  <p className="text-sm mt-2">If this persists, refresh the page</p>
                </div>
              </div>
            )}

            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
              <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-amber-500 rounded-full hover:bg-amber-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full hover:bg-emerald-400 transition-colors cursor-pointer"></div>
                  </div>
                  <div className="text-slate-500 font-mono text-sm">~/</div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full border border-indigo-500/30 font-mono">
                    EDITOR
                  </div>

                </div>
              </div>

              <div className="relative">
                <div className="h-[500px]">
                  <Editor
                    height="100%"

                    value={content}
                    onChange={(newValue) => handleChange(newValue)}  // Correct
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      padding: { top: 20 },
                      fontFamily: 'Fira Code, monospace',
                      lineNumbers: 'on',
                      glyphMargin: false,
                      folding: false,
                      lineDecorationsWidth: 10,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: 'all',
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isShareModalOpen && file?.shareId && (
        <ShareModal
          onClose={() => setIsShareModalOpen(false)}
          shareId={file.shareId}
        />
      )}
    </div>
  );
};

export default LiveEditor;