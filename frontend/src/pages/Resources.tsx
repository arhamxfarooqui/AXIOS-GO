import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WING_DATA } from '@/components/StaticRoadmap';
import { BookOpen, CheckCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const Resources = () => {
    // State to track which wing card is expanded
    const [expandedWing, setExpandedWing] = useState<string | null>(null);
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

    const toggleWing = (wingName: string) => {
        if (expandedWing === wingName) {
            setExpandedWing(null);
        } else {
            setExpandedWing(wingName);
            setExpandedTopic(null); // Reset topic expansion when switching wings
        }
    };

    const toggleTopic = (e: React.MouseEvent, topicName: string) => {
        e.stopPropagation(); // Prevent closing the wing card
        setExpandedTopic(expandedTopic === topicName ? null : topicName);
    };

    return (
        <div className="container mx-auto p-4 md:p-6 min-h-screen pb-20">
            <div className="text-center mb-10 space-y-2">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 animate-in fade-in slide-in-from-top-4">
                    Resource Library
                </h1>
                <p className="text-gray-400 animate-in fade-in slide-in-from-top-4 delay-100">
                    Comprehensive roadmaps and curated resources for every technical wing.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
                {Object.entries(WING_DATA).map(([wingName, data], index) => {
                    const isExpanded = expandedWing === wingName;

                    return (
                        <Card
                            key={wingName}
                            className={`bg-white/5 border-white/10 overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-purple-500/50 bg-white/10' : 'hover:bg-white/10'}`}
                        >
                            <div
                                onClick={() => toggleWing(wingName)}
                                className="cursor-pointer p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${data.color}`}>
                                        {data.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{wingName}</h3>
                                        <p className="text-sm text-gray-400">{data.description}</p>
                                    </div>
                                </div>
                                <div className="text-gray-500">
                                    {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                                </div>
                            </div>

                            {/* Detailed Roadmap Content */}
                            {isExpanded && (
                                <div className="border-t border-white/10 bg-black/20 p-6 animate-in slide-in-from-top-2 fade-in">
                                    <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                        <BookOpen className="w-4 h-4 text-purple-400" />
                                        Complete Learning Path
                                    </h4>

                                    <div className="grid gap-3">
                                        {data.topics.map((topic, i) => {
                                            const isTopicExpanded = expandedTopic === `${wingName}-${topic.name}`;

                                            return (
                                                <div key={i} className="rounded-lg bg-white/5 border border-white/5 overflow-hidden">
                                                    <button
                                                        onClick={(e) => toggleTopic(e, `${wingName}-${topic.name}`)}
                                                        className="w-full flex items-center justify-between p-3 text-sm text-gray-200 hover:bg-white/10 transition-colors text-left"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <CheckCircle className={`w-4 h-4 ${isTopicExpanded ? data.color : 'text-gray-500/50'}`} />
                                                            <span className="font-medium">{topic.name}</span>
                                                        </div>
                                                        {isTopicExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                                    </button>

                                                    {isTopicExpanded && (
                                                        <div className="bg-black/40 p-3 border-t border-white/5 space-y-2 animate-in slide-in-from-top-1">
                                                            {topic.resources.map((res, j) => (
                                                                <a
                                                                    key={j}
                                                                    href={res.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center justify-between group p-2 rounded hover:bg-white/10 transition-colors ml-7 border-l-2 border-white/5 pl-3"
                                                                >
                                                                    <span className="text-xs text-cyan-300 group-hover:text-cyan-200 transition-colors">
                                                                        {res.title}
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] uppercase text-gray-500 border border-white/10 px-1.5 rounded bg-black/50">
                                                                            {res.type}
                                                                        </span>
                                                                        <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-white transition-all" />
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default Resources;
