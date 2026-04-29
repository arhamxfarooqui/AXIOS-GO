import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activePhase, setActivePhase] = useState("phase-0");
    const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

    const generateRoadmap = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8081/api/ai/roadmap', {}, {
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
            setError(err.response?.data?.error || "Failed to generate roadmap. Server-side key missing or exhausted.");
        } finally {
            setLoading(false);
        }
    };

    const toggleWeek = (id: string) => {
        setExpandedWeek(expandedWeek === id ? null : id);
    };

    return (
        <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-xl border border-white/10 group">
            <div className="absolute inset-0 z-0 bg-black/80">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
            </div>

            <div className="relative z-10 w-full h-full flex flex-col p-4 md:p-8 overflow-y-auto custom-scrollbar">

                {!roadmap && !loading && (
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <Card className="w-full max-w-2xl bg-black/60 border-purple-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-cyan-900/10 pointer-events-none" />
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                    <BrainCircuit className="w-8 h-8 text-purple-400" />
                                </div>
                                <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-white to-cyan-300">
                                    Technical Roadmap Architect
                                </CardTitle>
                                <CardDescription className="text-lg text-gray-300">
                                    Forge a custom learning path powered by <span className="text-cyan-400 font-semibold uppercase tracking-widest">DEEPSEEK</span>.
                                    <span className="block text-xs text-gray-500 mt-2 uppercase tracking-tight">Personalized via Shadow Memory</span>
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-4 relative z-10 text-center">
                                <Button
                                    onClick={generateRoadmap}
                                    disabled={loading}
                                    className="h-16 px-12 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105 font-bold text-xl uppercase tracking-widest"
                                >
                                    Initialize Generation
                                </Button>
                                {error && (
                                    <div className="p-3 bg-red-900/40 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center gap-2 backdrop-blur-md">
                                        <span className="flex-shrink-0">⚠️</span> {error}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

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
                            <h3 className="text-2xl font-bold text-white tracking-widest uppercase">Architecting Roadmap</h3>
                            <p className="text-gray-300 max-w-md bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
                                Analyzing Wing stats • Consolidating Shadow Memory • Optimizing Study Path
                            </p>
                        </div>
                    </div>
                )}

                {roadmap && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 relative z-20">
                        <div className="bg-black/60 border border-white/10 p-6 rounded-xl backdrop-blur-md shadow-2xl">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 uppercase tracking-tighter">
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
                                <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 uppercase text-xs tracking-widest" onClick={() => setRoadmap(null)}>
                                    Reset Neural Path
                                </Button>
                            </div>
                        </div>

                        <Tabs value={activePhase} onValueChange={setActivePhase} className="w-full">
                            <div className="mb-6 sticky top-0 z-30 pt-2 pb-4">
                                <TabsList className="bg-black/70 border border-white/20 p-1.5 h-auto flex flex-wrap justify-center gap-2 rounded-full shadow-lg">
                                    {roadmap.phases.map((phase, idx) => (
                                        <TabsTrigger
                                            key={idx}
                                            value={`phase-${idx}`}
                                            className="px-6 py-2 rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 hover:text-gray-200 transition-all border border-transparent uppercase text-xs font-bold"
                                        >
                                            Phase {idx + 1}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            {roadmap.phases.map((phase, idx) => (
                                <TabsContent key={idx} value={`phase-${idx}`} className="mt-0 focus-visible:outline-none space-y-6 pb-20">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-white/10 border rounded-xl p-6 text-center shadow-lg"
                                    >
                                        <div className="flex items-center justify-center gap-3 mb-2">
                                            <Target className="w-6 h-6 text-cyan-400" />
                                            <h3 className="text-xl font-bold text-white uppercase">{phase.phase_name}</h3>
                                        </div>
                                        <p className="text-lg text-gray-200">{phase.goal}</p>
                                    </motion.div>

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
                                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Week</span>
                                                                    <span className="text-2xl font-bold text-white">{week.week}</span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors uppercase tracking-tight">
                                                                        {week.theme}
                                                                    </h4>
                                                                    <p className="text-xs text-gray-500 italic uppercase">
                                                                        {week.goals.length} Strategic Objectives
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
                                                                        <div className="space-y-4">
                                                                            <div>
                                                                                <h5 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">
                                                                                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Objectives
                                                                                </h5>
                                                                                <ul className="space-y-2">
                                                                                    {week.goals.map((g, i) => (
                                                                                        <li key={i} className="flex gap-2 text-sm text-gray-300 pl-2 border-l border-white/10 font-medium">
                                                                                            {g}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <h5 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">
                                                                                <BookOpen className="w-4 h-4 text-cyan-400" /> Resources
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
                                                                                        <span className="text-sm text-gray-300 font-bold uppercase tracking-tight group-hover/link:text-white">{res.title}</span>
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
