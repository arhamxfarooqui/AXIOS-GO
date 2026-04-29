import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { Send, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AICoachProps {
    wing?: string;
}

const AICoach = ({ wing = "general" }: AICoachProps) => {
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'assistant', 
            content: wing === 'dev' 
                ? "Hello! I'm your Architect. Ask me about system design, code reviews, or backend architecture!" 
                : wing === 'cp' 
                    ? "Hello! I'm your CodeSensei. Ask me about algorithms or competitive programming strategy!"
                    : "Hello! I'm your AI Coach. How can I help you today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const personaMapping: any = {
        'cp': 'Logic Engine (CodeSensei)',
        'dev': 'Architect (Dev Wing)',
        'ml': 'Concept Lab (Scout)',
        'general': 'Axios Core'
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8081/api/ai/codesensei', {
                message: userMsg,
                wing: wing
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
        } catch (error: any) {
            console.error("Chat Error", error);
            const errMsg = error.response?.data?.error || "Error connecting to Coach.";
            setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errMsg}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-[600px] w-full max-w-4xl mx-auto shadow-2xl bg-black/60 border-purple-500/20 backdrop-blur-md">
            <CardHeader className="bg-purple-900/10 border-b border-white/10 py-4">
                <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg border border-white/5">
                        <Bot className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-white to-cyan-300 font-bold uppercase tracking-tight">
                            {personaMapping[wing] || personaMapping['general']}
                        </span>
                        <span className="block text-[10px] font-normal text-gray-500 mt-0.5 uppercase">Neural Core Online</span>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.role === 'user'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                                : 'bg-white/10 text-gray-100 rounded-bl-none border border-white/5'
                                }`}
                        >
                            <div className="prose prose-invert prose-sm max-w-none break-words">
                                <ReactMarkdown
                                    components={{
                                        code: ({ node, inline, className, children, ...props }: any) => {
                                            return inline ? (
                                                <code className="bg-black/30 px-1.5 py-0.5 rounded text-purple-200 font-mono text-xs" {...props}>
                                                    {children}
                                                </code>
                                            ) : (
                                                <div className="bg-black/50 p-3 rounded-lg my-2 overflow-x-auto border border-white/5">
                                                    <code className="text-gray-300 font-mono text-xs block" {...props}>
                                                        {children}
                                                    </code>
                                                </div>
                                            )
                                        }
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                        <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-bl-none flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                            <span className="text-xs text-gray-400 font-medium italic">Generating nudge...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </CardContent>

            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex gap-2">
                    <Input
                        placeholder={wing === 'dev' ? "Ask about Go concurrency, React state, or paste a code snippet..." : "Ask about graph problems, DP strategy, or your stats..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="bg-white/5 border-white/10 text-white focus:ring-purple-500/50 backdrop-blur-sm"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default AICoach;
