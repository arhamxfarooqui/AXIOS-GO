import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
    Github, Shield, Rocket, 
    Search, GitPullRequest, 
    Terminal, Brain, Loader2,
    CheckCircle2, AlertCircle,
    FileText, Sparkles, Briefcase
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AICoach from '@/components/AICoach';

interface GitHubIssue {
    title: string;
    url: string;
    repo_name: string;
}

interface ProjectHealth {
    name: string;
    health: {
        score: number;
        has_readme: boolean;
        active_last_30: boolean;
        issue_ratio: number;
    }
}

const DevWing = () => {
    const [issues, setIssues] = useState<GitHubIssue[]>([]);
    const [healths, setHealths] = useState<ProjectHealth[]>([]);
    const [loading, setLoading] = useState(true);
    const [hydrationError, setHydrationError] = useState<string | null>(null);

    // PR Review State
    const [prUrl, setPrUrl] = useState('');
    const [prLoading, setPrLoading] = useState(false);
    const [reviewResult, setReviewResult] = useState<string | null>(null);
    const [auditError, setAuditError] = useState<string | null>(null);

    // Resume Generator State
    const [resumeRepoUrl, setResumeRepoUrl] = useState('');
    const [resumeLoading, setResumeLoading] = useState(false);
    const [resumeResult, setResumeResult] = useState<string | null>(null);
    const [resumeError, setResumeError] = useState<string | null>(null);

    useEffect(() => {
        // Task 1: The Spinner Hard-Failsafe
        let isMounted = true;
        const failsafe = setTimeout(() => {
            if (isMounted) setLoading(false);
        }, 10000);

        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                
                const [healthRes, issuesRes] = await Promise.allSettled([
                    axios.get('http://localhost:8081/api/wings/dev/health', { headers }),
                    axios.get('http://localhost:8081/api/wings/dev/first-issues', { headers })
                ]);
                
                if (healthRes.status === 'fulfilled') {
                    setHealths(healthRes.value.data);
                } else {
                    const msg = (healthRes.reason as any).response?.data?.error || "Health sync failed";
                    setHydrationError(msg);
                }

                if (issuesRes.status === 'fulfilled') {
                    setIssues(issuesRes.value.data);
                }
            } catch (err) {
                console.error("Hydration failure", err);
                setHydrationError("System ecosystem sync failed. Please check network.");
            } finally {
                clearTimeout(failsafe);
                if (isMounted) setLoading(false);
            }
        };
        
        fetchData();
        return () => { isMounted = false; };
    }, []);

    const runPrAudit = async () => {
        if (!prUrl) return;
        setPrLoading(true);
        setAuditError(null);
        setReviewResult(null);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post('http://localhost:8081/api/wings/dev/review', 
                { pr_url: prUrl },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReviewResult(response.data.review);
        } catch (err: any) {
            console.error("PR Review failed", err);
            const msg = err.response?.data?.error || "Failed to audit PR. Check URL format.";
            setAuditError(msg);
        } finally {
            setPrLoading(false);
        }
    };

    const generateResumeBullets = async () => {
        if (!resumeRepoUrl) return;
        setResumeLoading(true);
        setResumeError(null);
        setResumeResult(null);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post('http://localhost:8081/api/wings/dev/resume', 
                { repo_url: resumeRepoUrl },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResumeResult(response.data.bullets);
        } catch (err: any) {
            console.error("Resume generation failed", err);
            const msg = err.response?.data?.error || "Failed to generate bullets. Check repo URL.";
            setResumeError(msg);
        } finally {
            setResumeLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-cyan-400 font-mono animate-pulse uppercase tracking-widest text-[10px]">Scanning GitHub Ecosystem...</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[calc(100vh-100px)]">
            
            {/* Left/Main Column: Toolkit (2/3 width on LG) */}
            <div className="lg:col-span-2 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Health Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                            <div className="p-2 bg-cyan-500/10 rounded-lg">
                                <Shield className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Repo Health Audit</h2>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">System integrity scan</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {healths.length > 0 ? (
                                healths.map((h, i) => (
                                    <Card key={i} className="bg-slate-900/40 border-white/10 hover:border-cyan-500/50 transition-all group">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base text-cyan-200 truncate group-hover:text-white">{h.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between text-[10px] mb-1">
                                                        <span className="text-gray-500 uppercase font-bold">Integrity Score</span>
                                                        <span className="text-cyan-400 font-mono">{h.health.score}%</span>
                                                    </div>
                                                    <Progress value={h.health.score} className="h-1 bg-white/5" indicatorClassName="bg-cyan-500" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge variant="outline" className={`text-[9px] border-none ${h.health.has_readme ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                                                        {h.health.has_readme ? <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> : <AlertCircle className="w-2.5 h-2.5 mr-1" />}
                                                        README
                                                    </Badge>
                                                    <Badge variant="outline" className={`text-[9px] border-none ${h.health.active_last_30 ? "bg-blue-500/10 text-blue-400" : "bg-gray-500/10 text-gray-500"}`}>
                                                        {h.health.active_last_30 ? "Active" : "Stale"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="p-8 border border-dashed border-white/10 rounded-xl text-center bg-slate-900/20">
                                    <Github className="w-6 h-6 mx-auto mb-2 opacity-20 text-cyan-400" />
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-relaxed">
                                        {hydrationError || "No active repositories detected. Ensure your GitHub handle is linked in settings."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Automated PR Review Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <GitPullRequest className="w-5 h-5 text-purple-400" />
                                </div>
                                <h2 className="text-base font-bold text-white uppercase tracking-tight">PR Review</h2>
                            </div>

                            <Card className="bg-slate-900/40 border-white/10 relative overflow-hidden">
                                <CardContent className="pt-6 space-y-4">
                                    <Input 
                                        placeholder="Paste GitHub PR URL..."
                                        value={prUrl}
                                        onChange={(e) => setPrUrl(e.target.value)}
                                        className="bg-black/40 border-white/10 text-xs font-mono text-white h-9"
                                    />
                                    <Button 
                                        onClick={runPrAudit}
                                        disabled={prLoading || !prUrl}
                                        className="w-full bg-purple-600/80 hover:bg-purple-600 text-white font-bold uppercase tracking-widest text-[9px] h-9 gap-2"
                                    >
                                        {prLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Terminal className="w-3 h-3" />}
                                        Run AI Audit
                                    </Button>
                                    {auditError && <p className="text-[9px] text-red-400 font-bold uppercase">{auditError}</p>}
                                    {reviewResult && (
                                        <div className="mt-4 p-3 bg-black/60 rounded-lg border border-purple-500/20 max-h-[200px] overflow-y-auto custom-scrollbar">
                                            <div className="prose prose-invert prose-xs max-w-none">
                                                <ReactMarkdown>{reviewResult}</ReactMarkdown>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Task 4: Resume Bullet Generator Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <Briefcase className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h2 className="text-base font-bold text-white uppercase tracking-tight">Resume Points</h2>
                            </div>

                            <Card className="bg-slate-900/40 border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-5">
                                    <Sparkles className="w-8 h-8 text-emerald-400" />
                                </div>
                                <CardContent className="pt-6 space-y-4">
                                    <Input 
                                        placeholder="Paste Repo URL (e.g. AXIOS-GO)..."
                                        value={resumeRepoUrl}
                                        onChange={(e) => setResumeRepoUrl(e.target.value)}
                                        className="bg-black/40 border-white/10 text-xs font-mono text-white h-9"
                                    />
                                    <Button 
                                        onClick={generateResumeBullets}
                                        disabled={resumeLoading || !resumeRepoUrl}
                                        className="w-full bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold uppercase tracking-widest text-[9px] h-9 gap-2"
                                    >
                                        {resumeLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                        Generate STAR Bullets
                                    </Button>
                                    {resumeError && <p className="text-[9px] text-red-400 font-bold uppercase">{resumeError}</p>}
                                    {resumeResult && (
                                        <div className="mt-4 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 max-h-[300px] overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                                                <Briefcase className="w-3 h-3 text-emerald-400" />
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">STAR Method Points</span>
                                            </div>
                                            <div className="prose prose-invert prose-xs max-w-none prose-p:my-1">
                                                <ReactMarkdown>{resumeResult}</ReactMarkdown>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Open Source Entry Points */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Rocket className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Open Source Entry Points</h2>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Good first issues matched to your stack</p>
                            </div>
                        </div>
                        <Badge className="bg-orange-600/20 text-orange-400 border border-orange-600/30 font-mono text-[10px]">LIVE SYNC</Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {issues.length > 0 ? (
                            issues.map((issue, i) => (
                                <a key={i} href={issue.url} target="_blank" rel="noopener noreferrer" 
                                   className="group flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-xl bg-slate-900/30 border border-white/5 hover:border-orange-500/30 hover:bg-white/5 transition-all gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] text-orange-400/70 font-bold uppercase tracking-widest">{issue.repo_name}</span>
                                            <span className="w-1 h-1 bg-gray-700 rounded-full" />
                                            <Github className="w-3 h-3 text-gray-600" />
                                        </div>
                                        <h3 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{issue.title}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="text-[10px] font-mono text-orange-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span>Contribute</span>
                                            <Search className="w-3 h-3" />
                                        </div>
                                    </div>
                                </a>
                            ))
                        ) : (
                            <div className="p-12 border border-dashed border-white/10 rounded-xl text-center text-gray-600 bg-slate-900/20">
                                <Search className="w-6 h-6 mx-auto mb-2 opacity-20" />
                                <p className="text-[10px] uppercase font-bold tracking-widest">No active entry points found. Refreshing ecosystem...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: AI Architect Coach */}
            <div className="lg:col-span-1 h-full flex flex-col min-h-[600px]">
                <div className="flex items-center gap-3 mb-4 bg-slate-900/30 p-4 rounded-xl border border-white/5">
                    <div className="relative">
                        <Brain className="w-6 h-6 text-cyan-400" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#030014] animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest">Architect</h2>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">System Reasoning Engine Online</p>
                    </div>
                </div>
                
                <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
                    <AICoach wing="dev" />
                </div>

                <div className="mt-4 p-4 bg-slate-900/20 border border-white/5 rounded-xl flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-gray-600" />
                    <p className="text-[10px] text-gray-500 uppercase tracking-tight leading-relaxed">
                        Architect specialized in Go concurrency, React patterns, and distributed systems. <span className="text-cyan-400 font-mono">/help</span> for commands.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DevWing;
