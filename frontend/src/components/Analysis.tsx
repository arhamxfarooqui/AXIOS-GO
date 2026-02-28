import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { Sparkles, RefreshCw, Trophy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Analysis = () => {
    const [analysis, setAnalysis] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAnalysis = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8081/api/ai/analysis', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalysis(response.data.analysis);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate analysis.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, []);

    return (
        <div className="relative w-full h-[600px] overflow-hidden rounded-xl">
            {/* Background removed to fix WebGL crashes */}

            <div className="absolute inset-0 z-10 p-6 flex items-center justify-center">
                <Card className="w-full max-w-4xl h-full bg-black/60 border-purple-500/30 backdrop-blur-xl shadow-2xl flex flex-col">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-purple-900/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
                                <Trophy className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Profile Analysis & Motivation</h2>
                                <p className="text-xs text-purple-300">Powered by Llama 3 • Axios Mentor</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchAnalysis}
                            disabled={loading}
                            className="bg-white/5 border-white/10 text-purple-300 hover:bg-white/10 hover:text-white"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>

                    <CardContent className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse" />
                                    <Sparkles className="w-12 h-12 text-purple-400 animate-bounce" />
                                </div>
                                <h3 className="text-lg font-medium text-white">Analyzing your stats...</h3>
                                <p className="text-sm text-gray-400">Reviewing Codeforces tags, difficulty curves, and GitHub repos.</p>
                            </div>
                        ) : error ? (
                            <div className="h-full flex items-center justify-center text-red-400">
                                <p>⚠️ {error}</p>
                            </div>
                        ) : (
                            <div className="prose prose-invert prose-lg max-w-none">
                                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 rounded-2xl border border-white/5 shadow-inner">
                                    <ReactMarkdown
                                        components={{
                                            strong: ({ children }) => <span className="text-amber-300 font-bold">{children}</span>,
                                            li: ({ children }) => <li className="text-gray-200 my-1">{children}</li>,
                                            p: ({ children }) => <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
                                        }}
                                    >
                                        {analysis}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Analysis;
