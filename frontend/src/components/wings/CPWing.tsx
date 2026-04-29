import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Target, Trophy, Zap, 
    RefreshCw, Brain, 
    ExternalLink, Code,
    ChevronRight, Info, Clock
} from 'lucide-react';
import AICoach from '@/components/AICoach';

interface UpsolveTask {
    ID: number;
    problem_url: string;
    problem_name: string;
    contest_id: number;
    rating: number;
    tags: string;
    status: string;
}

interface MockProblem {
    id: string;
    name: string;
    rating: number;
    tags: string[];
    url: string;
}

const CPWing = () => {
    const [tasks, setTasks] = useState<UpsolveTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [mockRating, setMockRating] = useState<string>('1200');
    const [mockProblems, setMockProblems] = useState<MockProblem[]>([]);
    const [mockLoading, setMockLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    
    // Timer States
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        // Task 3: Auto-sync on mount (login sync)
        handleSync(true);
        
        // Restore timer from localStorage
        const storedEndTime = localStorage.getItem('cp_contest_end');
        if (storedEndTime) {
            const remaining = Math.floor((parseInt(storedEndTime) - Date.now()) / 1000);
            if (remaining > 0) {
                setTimeLeft(remaining);
            } else {
                localStorage.removeItem('cp_contest_end');
            }
        }
    }, []);

    // Timer Interval
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev !== null && prev > 0) return prev - 1;
                return 0;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSync = async (silent = false) => {
        if (!silent) setSyncing(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post('http://localhost:8081/api/wings/cp/sync', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data);
        } catch (err) {
            console.error("Sync failed", err);
        } finally {
            setSyncing(false);
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`http://localhost:8081/api/wings/cp/upsolves/${id}/status`, 
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTasks(tasks.filter(t => t.ID !== id));
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    const generateMock = async () => {
        setMockLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post('http://localhost:8081/api/wings/cp/mock', 
                { rating: parseInt(mockRating) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const problems = response.data.problems.map((p: any) => ({
                id: `${p.contestId}${p.index}`,
                name: p.name,
                rating: p.rating,
                tags: p.tags,
                url: `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`
            }));

            setMockProblems(problems);
            
            // Task 4: Start Timer (2 hours)
            const duration = 7200;
            const endTime = Date.now() + duration * 1000;
            localStorage.setItem('cp_contest_end', endTime.toString());
            setTimeLeft(duration);

        } catch (err) {
            console.error("Mock generation failed", err);
            alert("Failed to generate mock. Check API or balance.");
        } finally {
            setMockLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[calc(100vh-100px)]">
            
            {/* Left Column: Toolkit (2/3 width on LG) */}
            <div className="lg:col-span-2 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Section 1: Upsolve Queue */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Zap className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Upsolve Queue</h2>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Targeted conceptual growth</p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={syncing}
                            onClick={() => handleSync()}
                            className="bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-purple-600/20 transition-all gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-purple-400' : ''}`} />
                            <span className="hidden md:inline">{syncing ? "Syncing..." : "Force Sync Stats"}</span>
                        </Button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-32 bg-white/5 animate-pulse rounded-xl border border-white/5" />
                            ))}
                        </div>
                    ) : tasks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tasks.map(task => (
                                <Card key={task.ID} className="bg-slate-900/40 border-white/10 hover:border-purple-500/50 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                                        <Trophy className="w-12 h-12 text-purple-500 -mr-4 -mt-4 rotate-12" />
                                    </div>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg text-purple-200 group-hover:text-white transition-colors">
                                                <a href={task.problem_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                                                    {task.problem_name}
                                                    <ExternalLink className="w-3 h-3 opacity-50" />
                                                </a>
                                            </CardTitle>
                                            <Badge variant="outline" className="border-purple-500/50 text-purple-400 font-mono">
                                                {task.rating > 0 ? task.rating : "Unrated"}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {task.tags.replace(/[\[\]"]/g, '').split(',').map(tag => (
                                                <span key={tag} className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase font-medium">
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                            <Button 
                                                size="sm" 
                                                className="flex-1 bg-purple-600/20 text-purple-400 border border-purple-600/30 hover:bg-purple-600/40 h-8 text-xs uppercase font-bold"
                                                onClick={() => updateStatus(task.ID, "solved")}
                                            >
                                                Solved
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                className="flex-1 border-white/10 text-gray-500 hover:text-white h-8 text-xs uppercase font-bold"
                                                onClick={() => updateStatus(task.ID, "skipped")}
                                            >
                                                Skip
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center bg-slate-900/20 border border-dashed border-white/10 rounded-xl">
                            <Info className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
                            <p className="text-gray-500 font-medium">No pending upsolves. Your queue is clean! ✨</p>
                        </div>
                    )}
                </div>

                {/* Section 2: Virtual Mock Contest */}
                <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-cyan-600 to-purple-600" />
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-cyan-500/10 rounded-lg">
                                    <Target className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-white uppercase tracking-tight">Virtual Mock Generator</CardTitle>
                                    <CardDescription className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Forge a simulated contest environment</CardDescription>
                                </div>
                            </div>
                            
                            {/* Task 4: Timer UI */}
                            {timeLeft !== null && timeLeft > 0 && (
                                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg animate-pulse">
                                    <Clock className="w-4 h-4 text-red-400" />
                                    <span className="font-mono text-xl font-bold text-red-400">{formatTime(timeLeft)}</span>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-3 max-w-sm">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block tracking-widest">Target Rating</label>
                                <Input 
                                    type="number" 
                                    value={mockRating}
                                    onChange={(e) => setMockRating(e.target.value)}
                                    placeholder="e.g. 1500"
                                    className="bg-black/40 border-white/10 text-white h-10 font-mono"
                                />
                            </div>
                            <Button 
                                onClick={generateMock}
                                disabled={mockLoading}
                                className="self-end h-10 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold uppercase tracking-widest text-xs px-6 transition-all active:scale-95"
                            >
                                {mockLoading ? "Forging..." : "Generate Mock"}
                            </Button>
                        </div>

                        {mockProblems.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                {mockProblems.map((prob, i) => (
                                    <a 
                                        key={prob.id} 
                                        href={prob.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="group p-4 bg-black/40 border border-white/5 rounded-xl hover:border-cyan-500/50 transition-all flex justify-between items-center"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:text-cyan-400 transition-colors">
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-200 group-hover:text-white">{prob.name}</h4>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-[10px] text-cyan-400 font-mono">★ {prob.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: CodeSensei Chat (1/3 width on LG) */}
            <div className="lg:col-span-1 h-full flex flex-col min-h-[600px]">
                <div className="flex items-center gap-3 mb-4 bg-slate-900/30 p-4 rounded-xl border border-white/5">
                    <div className="relative">
                        <Brain className="w-6 h-6 text-purple-400" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#030014] animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest">CodeSensei</h2>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Neural Logic Engine Online</p>
                    </div>
                </div>
                
                <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
                    <AICoach wing="cp" />
                </div>

                <div className="mt-4 p-4 bg-slate-900/20 border border-white/5 rounded-xl flex items-center gap-3">
                    <Code className="w-4 h-4 text-gray-600" />
                    <p className="text-[10px] text-gray-500 uppercase tracking-tight leading-relaxed">
                        Paste failed submissions or ask about edge cases. CodeSensei uses the <span className="text-purple-400">DeepSeek-R1</span> logic engine to nudge you towards the fix.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CPWing;
