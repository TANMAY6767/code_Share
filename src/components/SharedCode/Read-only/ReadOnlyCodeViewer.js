'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import Header from '../Navbar/Header';
import { Editor } from '@monaco-editor/react';
import { FileText, Palette, Check, Calendar,Code, Copy,Share2, Download } from "lucide-react";
import { formatDate } from '../utils';

export default function ReadOnlyCodeViewer({ file, router }) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const language = file.language || 'javascript';
  const fileName = file.filename || '';
  const editorContent = file.content || '';

  const copyCode = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const fileBlob = new Blob([file.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = file.filename || 'shared-code.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative pb-20">
      <Header 
        router={router} 
        onCopyLink={copyToClipboard}
        onCopy={copyCode}
        onDownload={downloadCode}
        copied={copied}
        linkCopied={linkCopied}
        readOnly
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* <div className="grid lg:grid-cols-4 gap-6"> */}
        <div className="w-full">
          <div className="lg:col-span-3">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
              <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  </div>
                  <div className="text-slate-500 font-mono text-sm">~/</div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full border border-indigo-500/30 font-mono">
                    VIEW ONLY
                  </div>
                  <span className="text-slate-400 text-sm font-mono">
                    {fileName || 'untitled'}.{language === 'javascript' ? 'js' : language}
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="h-[500px]">
                  <Editor
                    height="100%"
                    language={language}
                    value={editorContent}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
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
        <div className="mt-8 text-center">
            <p className="text-slate-400 mb-4">Want to share your own code?</p>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Create New Code Share
            </button>
          </div>
      </div>
    
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Easy Sharing</h3>
            <p className="text-slate-400 text-sm">Generate shareable links instantly with just one click</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Code className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Multi-Language</h3>
            <p className="text-slate-400 text-sm">Support for all popular programming languages</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Instant Access</h3>
            <p className="text-slate-400 text-sm">No registration required, start sharing immediately</p>
          </div>
        </div>
    </div>
  );
}