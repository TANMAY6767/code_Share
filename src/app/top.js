'use client';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
    Code2, Share2, Zap, Shield,
    Sparkles, ArrowRight, Loader,
    Cast
} from 'lucide-react'; // Added Cast icon
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext'; // FIXED path
const slogans = [
    "Why wait to commit? Just share it.",
    "No forks, no fuss — just fast code sharing.",
    "Old tools take minutes. CodeUrl takes milliseconds.",
    "Instant links. Zero overhead. Welcome to modern code sharing.",
    "Because code shouldn’t take a pull request to share.",
    "The future of code sharing doesn’t come with setup steps.",
    "Code sharing that doesn’t need a README.",
    "No repos. No clones. Just clean code — instantly.",
    "You write it. We link it. The old way can keep syncing."
];
export default function HomePage() {
    const [isCreating, setIsCreating] = useState(false);
    const [isLiveSharing, setIsLiveSharing] = useState(false);
    const router = useRouter();
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % slogans.length);
        }, 7000); // 7 seconds
        return () => clearInterval(interval);
    }, []);
    // Use the theme context
    const { theme, isThemeLoaded } = useTheme();

    if (!isThemeLoaded) {
        return (
            <div className={`min-h-screen transition-all duration-500 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`} />
        );
    }

    const handleLiveShare = async () => {
        setIsLiveSharing(true);
        try {
            const response = await fetch('/api/folder/LiveSave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: 'LiveProject',
                    language: 'javascript',
                    type: 'editable',
                    content: '// Start coding live...'
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to start live share');

            const url = `${window.location.origin}/live/${data.data.shareId}`;

            // ✅ Safe Clipboard Copy for All Devices
            try {
                if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                    await navigator.clipboard.writeText(url);
                } else {
                    // ✅ Fallback for iOS/Safari/Older Android
                    const textarea = document.createElement('textarea');
                    textarea.value = url;
                    textarea.style.position = 'fixed'; // Prevent scrolling to bottom
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.focus();
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                }

                toast.success('Live share link copied to clipboard!');
            } catch (err) {
                console.error('Clipboard copy failed:', err);
                toast.success('Live share link is ready! You can manually copy it from the URL bar.');
            }

            router.push(url);
        } catch (error) {
            toast.error(`Failed to start live share: ${error.message}`);
        } finally {
            setIsLiveSharing(false);
        }
    };



    const handleCreateProject = async () => {
        setIsCreating(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'MyProject',
                    type: 'editable',
                    expiresIn: '1h'
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create project');

            router.push(`/${data.data.slug}`);
        } catch (error) {
            toast.error(`Failed to create project: ${error.message}`);
        } finally {
            setIsCreating(false);
        }
    };

    const features = [
        {
            icon: Code2,
            title: 'VS Code Experience',
            description: 'Professional code editor with syntax highlighting and file management'
        },
        {
            icon: Share2,
            title: 'Live Collaboration',
            description: 'Real-time code sharing and collaborative editing with your team'
        },
        {
            icon: Zap,
            title: 'Instant Deployment',
            description: 'Deploy and share your projects instantly with a single click'
        },
        {
            icon: Shield,
            title: 'Secure & Private',
            description: 'Enterprise-grade security for your code and collaborative sessions'
        }
    ];

    return (
        <div className={`min-h-screen bg-gradient-to-br ${theme === 'dark'
            ? 'from-gray-900 via-gray-900 to-blue-900'
            : 'from-gray-50 via-white to-blue-50'
            }`}>
            <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="mb-8"
                        >
                            <div className="h-[100px] sm:h-auto flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    <motion.h1
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.6 }}
                                        className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center"
                                    >
                                        <span className={`block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent`}>
                                            {slogans[index]}
                                        </span>
                                    </motion.h1>
                                </AnimatePresence>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold mb-6">
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    Code.
                                </span>
                                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}> Share.</span>
                                <br />
                                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Collaborate.</span>
                            </h1>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
                        >
                            <button
                                onClick={handleCreateProject}
                                disabled={isCreating}
                                className="group inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 px-6 py-3 text-lg"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Code2 className="w-5 h-5 mr-2" />
                                        Create Project & Share
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleLiveShare}
                                disabled={isLiveSharing || isCreating}
                                className={`group inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed border px-6 py-3 text-lg ${theme === 'dark'
                                    ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'
                                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {isLiveSharing ? (
                                    <>
                                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                                        Creating Live Session...
                                    </>
                                ) : (
                                    <>
                                        <Cast className="w-5 h-5 mr-2" />
                                        Live Project Sharing
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </motion.div>

                        {/* Demo Preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="relative max-w-5xl mx-auto"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
                            <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                                <div className="flex items-center px-4 py-3 bg-gray-800">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 text-center text-gray-400 text-sm">
                                        CodeUrl Editor - main.tsx
                                    </div>
                                </div>
                                <div className="p-6 text-left font-mono text-sm">
                                    <div className="text-purple-400">import</div>
                                    <div className="text-blue-400 ml-4">React</div>
                                    <div className="text-green-400 ml-4">from 'react';</div>
                                    <br />
                                    <div className="text-purple-400">const</div>
                                    <div className="text-yellow-400 ml-4">{'App = () => ('}</div>
                                    <div className="text-gray-300 ml-8">{'<div className="welcome">'}</div>
                                    <div className="text-gray-300 ml-12">Welcome to CodeUrl!</div>
                                    <div className="text-gray-300 ml-8">{'</div>'}</div>
                                    <div className="text-yellow-400 ml-4">{');'}</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={`py-20 px-4 sm:px-6 lg:px-8 backdrop-blur-sm ${theme === 'dark'
                ? 'bg-gray-800/50'
                : 'bg-white/50'
                }`}>
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className={`text-4xl font-bold mb-4 ${theme === 'dark'
                            ? 'text-white'
                            : 'text-gray-900'
                            }`}>
                            Why Choose CodeUrl?
                        </h2>
                        <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark'
                            ? 'text-gray-300'
                            : 'text-gray-600'
                            }`}>
                            Everything you need to code, collaborate, and deploy in one powerful platform
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={`rounded-xl shadow-md p-6 h-full text-center transition-all hover:shadow-lg ${theme === 'dark'
                                    ? 'bg-gray-800'
                                    : 'bg-white'
                                    }`}
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4">
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark'
                                    ? 'text-white'
                                    : 'text-gray-900'
                                    }`}>
                                    {feature.title}
                                </h3>
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className={`text-4xl font-bold mb-4 ${theme === 'dark'
                            ? 'text-white'
                            : 'text-gray-900'
                            }`}>
                            Ready to Start Coding?
                        </h2>
                        <p className={`text-xl mb-8 ${theme === 'dark'
                            ? 'text-gray-300'
                            : 'text-gray-600'
                            }`}>
                            Join thousands of developers already using CodeUrl to build amazing projects
                        </p>
                        <button
                            onClick={handleCreateProject}
                            disabled={isCreating}
                            className="inline-flex items-center justify-center rounded-md text-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 px-8 py-4"
                        >
                            {isCreating ? (
                                <>
                                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                                    Creating Project...
                                </>
                            ) : (
                                <>
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}                        