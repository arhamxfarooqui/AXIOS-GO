import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import HeroScene from "@/components/3d/HeroScene";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Code2, Terminal, Cpu, Globe, Database, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            {/* Hero Section */}
            <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 z-0 opacity-60">
                    <HeroScene />
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-0 pointer-events-none" />

                <div className="z-10 text-center max-w-4xl px-4 animate-in fade-in zoom-in duration-1000">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md text-purple-300 text-sm font-mono tracking-wider">
                        SYSTEM ONLINE // V2.0.4
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-600">
                        AXIOS
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
                        The centralized technical nexus for elite developers. <br />
                        <span className="text-purple-400 font-medium">Compete. Innovate. Dominate.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {isAuthenticated ? (
                            <Link to="/dashboard">
                                <Button size="lg" className="h-14 px-8 text-lg bg-white text-black hover:bg-gray-200 border-none rounded-full font-bold transition-all hover:scale-105">
                                    Access Terminal <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/register">
                                    <Button size="lg" className="h-14 px-8 text-lg bg-purple-600 hover:bg-purple-700 text-white border-none rounded-full font-bold shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all hover:scale-105">
                                        Initialize Protocol
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-white/20 hover:bg-white/10 text-white rounded-full transition-all">
                                        System Login
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Grid ("Crowded" Section) */}
            <div className="container mx-auto px-6 py-24 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={<Terminal className="w-8 h-8 text-purple-400" />}
                        title="Competitive Programming"
                        description="Regular contests, algorithmic challenges, and global leaderboards to sharpen your logic."
                    />
                    <FeatureCard
                        icon={<Code2 className="w-8 h-8 text-cyan-400" />}
                        title="Web Development"
                        description="Full-stack workshops, hackathons, and real-world projects using modern frameworks."
                    />
                    <FeatureCard
                        icon={<Cpu className="w-8 h-8 text-green-400" />}
                        title="Machine Learning"
                        description="Dive into neural networks, AI models, and data science competitions."
                    />
                    <FeatureCard
                        icon={<Globe className="w-8 h-8 text-blue-400" />}
                        title="Open Source"
                        description="Contribute to real projects, learn Git, and be part of the global FOSS community."
                    />
                    <FeatureCard
                        icon={<Database className="w-8 h-8 text-yellow-400" />}
                        title="System Design"
                        description="Architecture deep dives, scalability discussions, and backend engineering."
                    />
                    <FeatureCard
                        icon={<Layers className="w-8 h-8 text-pink-400" />}
                        title="App Development"
                        description="Native and cross-platform mobile application development tracks."
                    />
                </div>
            </div>

            {/* Stats / Tech Stack Bar */}
            <div className="border-t border-white/10 bg-black/50 backdrop-blur-md">
                <div className="container mx-auto px-6 py-12">
                    <div className="flex flex-wrap justify-between items-center gap-8 text-gray-500 font-mono text-sm uppercase tracking-widest">
                        <span>Go (Gin) Backend</span>
                        <span>PostgreSQL DB</span>
                        <span>React + Vite</span>
                        <span>Three.js Visuals</span>
                        <span>Kubernetes Ready</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-300 group cursor-default">
        <CardHeader>
            <div className="mb-4 p-3 bg-black/30 w-fit rounded-lg border border-white/5 group-hover:border-purple-500/30 transition-colors">
                {icon}
            </div>
            <CardTitle className="text-xl text-white font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-gray-400 leading-relaxed">
                {description}
            </p>
        </CardContent>
    </Card>
);

export default Home;
