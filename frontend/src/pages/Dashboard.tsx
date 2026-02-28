import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import axios from 'axios';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AICoach from '@/components/AICoach';
import Analysis from '@/components/Analysis';
import { LayoutDashboard, Sparkles, Bot } from 'lucide-react';

const Dashboard = () => {
    const { user, login } = useAuth();
    const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; msg: string }>({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    const handleRefresh = async () => {
        setLoading(true);
        setStatus({ type: '', msg: '' });
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8081/api/user/refresh', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.user) {
                login(token!, response.data.user);
                setStatus({ type: 'success', msg: 'Stats synced successfully!' });
            }
        } catch (error: any) {
            console.error("Failed to refresh stats", error);
            setStatus({ type: 'error', msg: error.response?.data?.error || "Failed to sync stats. Check your internet or handles." });
        } finally {
            setLoading(false);
            // Clear status after 3 seconds
            setTimeout(() => setStatus({ type: '', msg: '' }), 5000);
        }
    };

    if (!user) return <div className="text-white text-center mt-10">Loading or please login...</div>;

    return (
        <div className="container mx-auto p-4 md:p-6 text-white h-[calc(100vh-80px)] flex flex-col">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                        Hello, {user.name}
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">{user.email}</p>
                </div>
                <div className="flex items-center gap-4">
                    {status.msg && (
                        <span className={`text-sm ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {status.msg}
                        </span>
                    )}
                    <Button
                        onClick={handleRefresh}
                        disabled={loading}
                        variant="outline"
                        className="text-white border-white/20 hover:bg-white/10"
                    >
                        {loading ? "Syncing..." : "Sync Stats"}
                    </Button>
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                <TabsList className="bg-white/5 border border-white/10 w-fit mb-4">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 gap-2">
                        <Sparkles className="w-4 h-4 text-amber-300" /> Analysis
                    </TabsTrigger>
                    <TabsTrigger value="ai-coach" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 gap-2">
                        <Bot className="w-4 h-4 text-blue-300" /> AI Coach
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="flex-1 mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                        {/* Left Column: Stats */}
                        <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 pb-20">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-white/5 border-white/10 text-white">
                                    <CardHeader>
                                        <CardTitle>Codeforces</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold font-mono text-yellow-400">{user.codeforces_rating || "N/A"}</p>
                                        <div className="flex justify-between items-end mt-2">
                                            <p className="text-xs text-gray-400">@{user.codeforces_handle}</p>
                                            <p className="text-sm text-gray-300"><span className="font-bold text-white">{user.total_solved || 0}</span> Solved</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/5 border-white/10 text-white">
                                    <CardHeader>
                                        <CardTitle>GitHub</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold font-mono text-cyan-400">{user.github_repos || 0}</p>
                                        <p className="text-sm text-gray-400">Public Repositories</p>
                                        <p className="text-xs text-gray-400 mt-1">@{user.github_handle}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.kaggle_handle ? (
                                    <Card className="bg-white/5 border-white/10 text-white animate-in fade-in">
                                        <CardHeader>
                                            <CardTitle>Kaggle</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-xl font-bold font-mono text-blue-400">Connected</p>
                                            <p className="text-xs text-gray-400">@{user.kaggle_handle}</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card className="bg-white/5 border-white/10 text-white animate-in fade-in opacity-50">
                                        <CardHeader>
                                            <CardTitle>Kaggle</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-400">Not Linked</p>
                                        </CardContent>
                                    </Card>
                                )}

                                {user.ctf_handle && (
                                    <Card className="bg-white/5 border-white/10 text-white animate-in fade-in">
                                        <CardHeader>
                                            <CardTitle>CTF / InfoSec</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-xl font-bold font-mono text-green-400">Connected</p>
                                            <p className="text-xs text-gray-400">@{user.ctf_handle}</p>
                                        </CardContent>
                                    </Card>
                                )}

                                <Card className="bg-white/5 border-white/10 text-white md:col-span-2">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Your Wings</CardTitle>
                                        <Button variant="ghost" className="text-purple-400 hover:text-purple-300" onClick={() => window.location.href = '/wrapped'}>
                                            View Codeforces Wrapped ✨
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {user.wings && user.wings.length > 0 ? user.wings.map((w: string) => (
                                                <span key={w} className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                                                    {w}
                                                </span>
                                            )) : "No wings selected"}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                    </div>
                </TabsContent>

                <TabsContent value="analysis" className="flex-1 mt-0 h-full">
                    <Analysis />
                </TabsContent>

                <TabsContent value="ai-coach" className="flex-1 mt-0 h-full">
                    <AICoach />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Dashboard;
