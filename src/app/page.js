'use client';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Sparkles } from 'lucide-react';
import Head from 'next/head';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faPlus, faBroadcastTower, faBolt, faShieldAlt, faUsers, faMobileAlt } from '@fortawesome/free-solid-svg-icons';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] }); 
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

export default function CodeEditor() {
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello World!");');
  const [fileName, setFileName] = useState('Untitled');
  const [isSharing, setIsSharing] = useState(false);
  const [isLiveSharing, setIsLiveSharing] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [type, setType] = useState('editable');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const editorRef = useRef(null);
  const urlRef = useRef(null);
  const [typedCode, setTypedCode] = useState('');
  
  const fullCode = `function greetDeveloper() {
  const message = "Hello, CodeUrl! 👋";
  console.log(message);
  return message;
}

// Share your code instantly
const result = greetDeveloper();`;

  useEffect(() => {
    if (code !== '// Write your code here\nconsole.log("Hello World!");') {
      setShareUrl('');
    }
  }, [code]);

  useEffect(() => {
    const timer = setTimeout(() => {
      let i = 0;
      const typeWriter = () => {
        if (i < fullCode.length) {
          setTypedCode(fullCode.substring(0, i + 1));
          i++;
          setTimeout(typeWriter, 50);
        }
      };
      typeWriter();
    }, 1000);

    return () => clearTimeout(timer);
  }, [fullCode]);

  const handleShare = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before sharing!');
      return;
    }

    setIsSharing(true);
    try {
      const response = await fetch('/api/folder/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: fileName.trim() || 'Untitled',
          language,
          type,
          content: code,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to share');

      const url = `${window.location.origin}/${data.data.shareId}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);

      toast.success('Shareable link copied to clipboard!');
      window.location.href = url;
    } catch (error) {
      toast.error(`Failed to share: ${error.message}`);
    } finally {
      setIsSharing(false);
    }
  };

  const handleLiveShare = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before sharing!');
      return;
    }

    setIsLiveSharing(true);
    try {
      const response = await fetch('/api/folder/LiveSave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: fileName.trim() || 'Untitled',
          language,
          type,
          content: code,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to share');

      const url = `${window.location.origin}/live/${data.data.shareId}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);

      toast.success('Live share link copied to clipboard!');
      window.location.href = url;
    } catch (error) {
      toast.error(`Failed to start live share: ${error.message}`);
    } finally {
      setIsLiveSharing(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 ${inter.className}`}>
      <Head>
        <title>CodeUrl - Share Your Code Instantly</title>
        <meta name="description" content="Create, share, and collaborate on code snippets with developers worldwide." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-7xl mx-auto px-5">
        <nav className="flex justify-between items-center py-4 mb-8">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <FontAwesomeIcon icon={faCode} className="text-indigo-500 text-3xl" />
            <span>CodeUrl</span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#" className="text-slate-400 hover:text-indigo-500 font-medium transition-colors">About</a>
            <a href="#" className="text-slate-400 hover:text-indigo-500 font-medium transition-colors">Features</a>
            <a href="#" className="text-slate-400 hover:text-indigo-500 font-medium transition-colors">Contact</a>
          </div>
        </nav>

        <main className="grid md:grid-cols-2 gap-16 items-center min-h-[70vh] mb-16">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Share Your Code <br />
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Instantly
              </span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed">
              Create, share, and collaborate on code snippets with developers worldwide.
              Fast, secure, and developer-friendly.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleShare}
                disabled={isSharing || isLiveSharing || !code.trim()}
                className="group flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSharing ? (
                  <>
                    <FontAwesomeIcon icon={faPlus} className="animate-spin" />
                    Creating Your Snippet...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                    Create & Share Code
                    <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
              
              <button
                onClick={handleLiveShare}
                disabled={isLiveSharing || isSharing || !code.trim()}
                className="group flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLiveSharing ? (
                  <>
                    <FontAwesomeIcon icon={faPlus} className="animate-spin" />
                    Creating Live Session...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faBroadcastTower} className="group-hover:animate-pulse" />
                    Live Code Sharing
                    <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <div className="w-full max-w-lg bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
              <div className="flex items-center px-4 py-3 bg-slate-700 border-b border-slate-600">
                <div className="flex gap-2 mr-4">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                </div>
                <span className="text-sm text-slate-400 font-mono">example.js</span>
              </div>
              <div className="p-6">
                <pre className="m-0">
                  <code className={`text-sm leading-relaxed ${jetbrainsMono.className}`}>
                    {typedCode}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </main>

        <section className="py-16 text-center">
          <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Why Choose CodeShare?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-indigo-500 hover:-translate-y-2 hover:shadow-xl transition-all">
              <FontAwesomeIcon icon={faBolt} className="text-indigo-500 text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-slate-400">Create and share code snippets in seconds</p>
            </div>
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-indigo-500 hover:-translate-y-2 hover:shadow-xl transition-all">
              <FontAwesomeIcon icon={faShieldAlt} className="text-indigo-500 text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure</h3>
              <p className="text-slate-400">Your code is encrypted and secure</p>
            </div>
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-indigo-500 hover:-translate-y-2 hover:shadow-xl transition-all">
              <FontAwesomeIcon icon={faUsers} className="text-indigo-500 text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Collaborative</h3>
              <p className="text-slate-400">Real-time collaboration with team members</p>
            </div>
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-indigo-500 hover:-translate-y-2 hover:shadow-xl transition-all">
              <FontAwesomeIcon icon={faMobileAlt} className="text-indigo-500 text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Responsive</h3>
              <p className="text-slate-400">Works perfectly on all devices</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}