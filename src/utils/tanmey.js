'use client';
import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Loader2, Share2, Copy, Code, Download, ArrowLeft, FileText, Palette, Calendar, Check } from 'lucide-react';
import { toast } from 'sonner';
import Editor from '@monaco-editor/react';

export default function SharedCodeViewer() {
  const { shareId } = useParams();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [fileName, setFileName] = useState('');
  const [type, setType] = useState('editable');
  const [ws, setWs] = useState(null);
  
  const LANGUAGES = [
    'javascript', 'typescript', 'html', 'css', 'python',
    'java', 'cpp', 'csharp', 'php', 'ruby', 'go',
    'rust', 'swift', 'kotlin'
  ];
  
  const TYPE = [
    'editable', 'read-only'
  ];

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        const res = await fetch(`/api/folder/share/${shareId}`, { 
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();
        
        if (!data.success || !data.data) {
          throw new Error('Code not found');
        }

        setFile(data.data);
        setFileName(data.data.filename || '');
        setLanguage(data.data.language || 'javascript');
        setType(data.data.type || 'editable');
      } catch (err) {
        setError(true);
        toast.error('Failed to load shared code');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) fetchSharedFile();
  }, [shareId]);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!file || file.type !== 'editable') return;

    const websocket = new WebSocket(`wss://your-api-domain.com/api/ws/${shareId}`);
    setWs(websocket);

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'content_update') {
        setFile(prev => ({ ...prev, content: data.content }));
      } else if (data.type === 'metadata_update') {
        setFile(prev => ({ ...prev, ...data.metadata }));
        if (data.metadata.filename) setFileName(data.metadata.filename);
        if (data.metadata.language) setLanguage(data.metadata.language);
        if (data.metadata.type) setType(data.metadata.type);
      }
    };

    return () => {
      if (websocket) websocket.close();
    };
  }, [file, shareId]);

  const updateContentInDatabase = async (newContent) => {
    try {
      const res = await fetch(`/api/folder/share/${shareId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newContent,
          filename: fileName,
          language,
          type
        })
      });

      if (!res.ok) throw new Error('Failed to update');

      // Broadcast update to other clients via WebSocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'content_update',
          content: newContent
        }));
      }
    } catch (err) {
      toast.error('Failed to save changes');
    }
  };

  const updateMetadataInDatabase = async () => {
    try {
      const res = await fetch(`/api/folder/share/${shareId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: file.content,
          filename: fileName,
          language,
          type
        })
      });

      if (!res.ok) throw new Error('Failed to update');

      // Broadcast update to other clients via WebSocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'metadata_update',
          metadata: {
            filename: fileName,
            language,
            type
          }
        }));
      }

      toast.success('Changes saved!');
    } catch (err) {
      toast.error('Failed to save changes');
    }
  };

  const handleContentChange = (value) => {
    setFile(prev => ({ ...prev, content: value }));
    // Debounce the database update to avoid too many requests
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updateContentInDatabase(value);
    }, 1000);
  };

  let debounceTimer;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading your code</h2>
          <p className="text-slate-400">This might take a moment</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Code Not Found</h2>
          <p className="text-slate-400 mb-6">The shared code you're looking for doesn't exist or has expired.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Create New Code
          </button>
        </div>
      </div>
    );
  }

  if (file.type === "editable") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Create New Code
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
              <button
                onClick={updateMetadataInDatabase}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>

          {/* Code Container */}
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
            <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <label className="text-sm font-medium text-slate-300">File Name</label>
                  </div>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter file name (optional)"
                    className="w-full px-3 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-colors"
                  />
                </div>
                
                <div className="w-full sm:w-48">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-slate-400" />
                    <label className="text-sm font-medium text-slate-300">Language</label>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-colors"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <label className="text-sm font-medium text-slate-300">Type</label>
                    </div>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-colors"
                    >
                      {TYPE.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Display */}
            <div className="p-6">
              <div className="h-[500px]">
                <Editor
                  height="100%"
                  language={language}
                  value={file.content}
                  onChange={handleContentChange}
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

            {/* Code Stats */}
            <div className="bg-slate-700 px-6 py-4 border-t border-slate-600">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <div>
                  {file.content.length} characters • {file.content.split('\n').length} lines
                </div>
                <div className="hidden sm:block">
                  {file.type}
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
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
      </div>
    );
  } else {
    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Create New Code
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
          </div>
        </div>

        {/* Code Container */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          {/* Code Info Header */}
          <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <h1 className="text-xl font-bold text-white">{file.filename || 'Untitled'}</h1>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <span>{file.language}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{file.createdAt ? formatDate(file.createdAt) : 'Shared via CodeShare Pro'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={copyCode}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </button>
                
                <button
                  onClick={downloadCode}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Code Display */}
          <div className="p-6">
            <div className="bg-slate-900 rounded-lg border border-slate-600 overflow-hidden">
               <code className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                {file.content}
              </code> 
            </div>
          </div>

          {/* Code Stats */}
          <div className="bg-slate-700 px-6 py-4 border-t border-slate-600">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <div>
                {file.content.length} characters • {file.content.split('\n').length} lines
              </div>
              <div className="hidden sm:block">
                {file.type}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
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
    </div>
  );
  }
}