import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Loader2, BrainCircuit, Target,
    BookOpen, Lightbulb, CheckCircle2, ChevronDown, ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
interface Week {
    week: number;
    theme: string;
    goals: string[];
    resources: { title: string; url: string; }[];
    tips?: string;
}

interface Phase {
    phase_name: string;
    goal: string;
    weeks: Week[];
}

interface RoadmapResponse {
    current_level: string;
    summary: string;
    phases: Phase[];
}

const AIRoadmap = () => {
    const [apiKey, setApiKey] = useState(localStorage.getItem('hf_token') || '');
    const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activePhase, setActivePhase] = useState("phase-0");
    const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

    const generateRoadmap = async () => {
        if (!apiKey) {
            setError("Hugging Face Token is required");
            return;
        }
        setLoading(true);
        setError('');

        try {
            localStorage.setItem('hf_token', apiKey);
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8081/api/ai/roadmap', {
                api_key: apiKey
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let data = response.data;
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.error("Failed to parse JSON", e);
                    throw new Error("AI returned invalid format. Please try again.");
                }
            }
            // Basic validation
            if (!data.phases || !Array.isArray(data.phases)) {
                if (data.weeks) {
                    data.phases = [{ phase_name: "Phase 1: Foundation", goal: "Generated Plan", weeks: data.weeks }];
                } else {
                    throw new Error("Invalid roadmap structure received.");
                }
            }

            setRoadmap(data);
            setActivePhase("phase-0");

        } catch (err: any) {
            console.error("Roadmap generation failed", err);
            setError(err.response?.data?.error || "Failed to generate roadmap. Please check your API usage or try again.");
        } finally {
            setLoading(false);
        }
    };

    const toggleWeek = (id: string) => {
        setExpandedWeek(expandedWeek === id ? null : id);
    };

    return (
        <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-xl border border-white/10 group">
            {/* 3D Background removed to prevent WebGL crashes */}
            <div className="absolute inset-0 z-0 bg-black/80">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
            </div>

            <div className="relative z-10 w-full h-full flex flex-col p-4 md:p-8 overflow-y-auto custom-scrollbar">

                {/* --- Input Section --- */}
                {!roadmap && (
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <Card className="w-full max-w-2xl bg-black/60 border-purple-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-cyan-900/10 pointer-events-none" />
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                    <BrainCircuit className="w-8 h-8 text-purple-400" />
                                </div>
                                <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-white to-cyan-300">
                                    Competitive Programming Architect
                                </CardTitle>
                                <CardDescription className="text-lg text-gray-300">
                                    Let <span className="text-yellow-400 font-semibold">Llama 3</span> forge your path to Grandmaster.
                                    <span className="block text-sm text-gray-400 mt-2">Specialized in Graphs, DP, and Math.</span>
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-4 relative z-10">
                                <div className="flex gap-3">
                                    <Input
                                        type="password"
                                        placeholder="Paste Hugging Face Access Token"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="bg-black/80 border-white/20 text-white h-12 text-lg focus:ring-purple-500/50 backdrop-blur-md placeholder:text-gray-600"
                                    />
                                    <Button
                                        onClick={generateRoadmap}
                                        disabled={loading}
                                        className="h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate"}
                                    </Button>
                                </div>
                                {error && (
                                    <div className="p-3 bg-red-900/40 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center gap-2 backdrop-blur-md">
                                        <span className="flex-shrink-0">⚠️</span> {error}
                                    </div>
                                )}
                                <div className="flex justify-between text-xs text-gray-500 px-1">
                                    <span>Powered by Llama 3 (8B Instruct)</span>
                                    <span>Secure Local Storage</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* --- Loading State --- */}
                {loading && !roadmap && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700">
                        <div className="relative w-32 h-32">
                            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 border-4 border-t-purple-500 border-r-transparent border-b-cyan-500 border-l-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <BrainCircuit className="w-10 h-10 text-purple-400 animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-white tracking-widest uppercase">Analyzing Profile</h3>
                            <p className="text-gray-300 max-w-md bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
                                Checking graph algorithms • Calculating DP capability • Optimizing Study Path
                            </p>
                        </div>
                    </div>
                )}

                {/* --- Results Display --- */}
                {roadmap && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 relative z-20">

                        {/* Top Summary Header */}
                        <div className="bg-black/60 border border-white/10 p-6 rounded-xl backdrop-blur-md shadow-2xl">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                                            Strategic Roadmap
                                        </h2>
                                        <Badge variant="outline" className="border-purple-500 text-purple-300 bg-purple-500/20 uppercase tracking-widest text-xs px-3 py-1">
                                            {roadmap.current_level}
                                        </Badge>
                                    </div>
                                    <p className="text-gray-300 italic max-w-3xl border-l-2 border-purple-500 pl-4">
                                        "{roadmap.summary}"
                                    </p>
                                </div>
                                <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10" onClick={() => setRoadmap(null)}>
                                    New Search
                                </Button>
                            </div>
                        </div>

                        {/* Phase Tabs */}
                        <Tabs value={activePhase} onValueChange={setActivePhase} className="w-full">
                            <div className="mb-6 sticky top-0 z-30 pt-2 pb-4 bg-transparent backdrop-blur-[2px]">
                                <TabsList className="bg-black/70 border border-white/20 p-1.5 h-auto flex flex-wrap justify-center gap-2 rounded-full shadow-lg">
                                    {roadmap.phases.map((phase, idx) => (
                                        <TabsTrigger
                                            key={idx}
                                            value={`phase-${idx}`}
                                            className="px-6 py-2 rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 hover:text-gray-200 transition-all border border-transparent"
                                        >
                                            <span className="font-bold">Phase {idx + 1}</span>: {phase.phase_name.split(':')[0]}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            {roadmap.phases.map((phase, idx) => (
                                <TabsContent key={idx} value={`phase-${idx}`} className="mt-0 focus-visible:outline-none space-y-6 pb-20">

                                    {/* Phase Goal Banner */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-white/10 border rounded-xl p-6 text-center shadow-lg"
                                    >
                                        <div className="flex items-center justify-center gap-3 mb-2">
                                            <Target className="w-6 h-6 text-cyan-400" />
                                            <h3 className="text-xl font-bold text-white">Phase Objective</h3>
                                        </div>
                                        <p className="text-lg text-gray-200">{phase.goal}</p>
                                    </motion.div>

                                    {/* Weeks Grid */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {phase.weeks.map((week, wIdx) => {
                                            const isExpanded = expandedWeek === `p${idx}-w${wIdx}`;
                                            return (
                                                <motion.div
                                                    key={wIdx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: wIdx * 0.1 }}
                                                >
                                                    <Card className={`bg-black/60 border-white/10 hover:border-purple-500/50 transition-all duration-300 overflow-hidden ${isExpanded ? 'border-purple-500/50 bg-black/80' : ''}`}>
                                                        <div
                                                            className="p-5 cursor-pointer flex items-center justify-between"
                                                            onClick={() => toggleWeek(`p${idx}-w${wIdx}`)}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-white/10">
                                                                    <span className="text-xs text-gray-400 font-bold uppercase">Week</span>
                                                                    <span className="text-2xl font-bold text-white">{week.week}</span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                                                                        {week.theme}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-400 line-clamp-1">
                                                                        {week.goals.length} Goals • {week.resources.length} Resources
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className={`p-2 rounded-full bg-white/5 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-purple-500/20 text-purple-300' : 'text-gray-400'}`}>
                                                                <ChevronDown className="w-5 h-5" />
                                                            </div>
                                                        </div>

                                                        <AnimatePresence>
                                                            {isExpanded && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="border-t border-white/10 bg-black/20"
                                                                >
                                                                    <div className="p-5 grid md:grid-cols-2 gap-6">
                                                                        {/* Left: Goals & Tips */}
                                                                        <div className="space-y-4">
                                                                            <div>
                                                                                <h5 className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase mb-3">
                                                                                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Key Objectives
                                                                                </h5>
                                                                                <ul className="space-y-2">
                                                                                    {week.goals.map((g, i) => (
                                                                                        <li key={i} className="flex gap-2 text-sm text-gray-300 pl-2 border-l border-white/10">
                                                                                            {g}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>

                                                                            {week.tips && (
                                                                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3">
                                                                                    <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                                                                    <div>
                                                                                        <p className="text-xs font-bold text-yellow-500 uppercase mb-1">Pro Tip</p>
                                                                                        <p className="text-sm text-yellow-200/90 italic">{week.tips}</p>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Right: Resources */}
                                                                        <div>
                                                                            <h5 className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase mb-3">
                                                                                <BookOpen className="w-4 h-4 text-cyan-400" /> Learning Resources
                                                                            </h5>
                                                                            <div className="space-y-2">
                                                                                {week.resources.map((res, i) => (
                                                                                    <a
                                                                                        key={i}
                                                                                        href={res.url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all group/link"
                                                                                    >
                                                                                        <span className="text-sm text-gray-300 font-medium group-hover/link:text-white">{res.title}</span>
                                                                                        <ExternalLink className="w-3 h-3 text-gray-500 group-hover/link:text-cyan-400" />
                                                                                    </a>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </Card>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIRoadmap;
