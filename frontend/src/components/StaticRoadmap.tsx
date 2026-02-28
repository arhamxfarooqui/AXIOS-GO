import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, BookOpen, Star, ChevronDown, ChevronUp, ExternalLink, Code, Database, Globe, Lock, Terminal } from 'lucide-react';

interface StaticRoadmapProps {
    wing: string;
}

interface Resource {
    title: string;
    url: string;
    type: 'Video' | 'Article' | 'Course' | 'Doc';
}

interface Topic {
    name: string;
    resources: Resource[];
}

interface WingData {
    color: string;
    icon: React.ReactNode;
    description: string;
    topics: Topic[];
}

export const WING_DATA: Record<string, WingData> = {
    "Web Development": {
        color: "text-orange-400",
        icon: <Globe className="w-5 h-5 text-orange-400" />,
        description: "Master the MERN stack and modern web technologies.",
        topics: [
            {
                name: "HTML5 & CSS3 Basics",
                resources: [
                    { title: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/", type: "Doc" },
                    { title: "CSS Flexbox Guide", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", type: "Article" }
                ]
            },
            {
                name: "JavaScript (ES6+)",
                resources: [
                    { title: "JavaScript.info", url: "https://javascript.info/", type: "Doc" },
                    { title: "Namaste JavaScript", url: "https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP", type: "Video" }
                ]
            },
            {
                name: "React.js Framework",
                resources: [
                    { title: "React Official Docs", url: "https://react.dev/learn", type: "Doc" },
                    { title: "Redux Toolkit", url: "https://redux-toolkit.js.org/", type: "Doc" }
                ]
            },
            {
                name: "Backend (Node.js/Express)",
                resources: [
                    { title: "Node.js Crash Course", url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4", type: "Video" },
                    { title: "Express.js Guide", url: "https://expressjs.com/", type: "Doc" }
                ]
            },
            {
                name: "Database (MongoDB/SQL)",
                resources: [
                    { title: "MongoDB University", url: "https://learn.mongodb.com/", type: "Course" },
                    { title: "SQLBolt", url: "https://sqlbolt.com/", type: "Course" }
                ]
            }
        ]
    },
    "App Development": {
        color: "text-blue-400",
        icon: <Code className="w-5 h-5 text-blue-400" />,
        description: "Build cross-platform mobile apps using Flutter or React Native.",
        topics: [
            {
                name: "Dart Programming",
                resources: [
                    { title: "Dart Language Tour", url: "https://dart.dev/guides/language/language-tour", type: "Doc" }
                ]
            },
            {
                name: "Flutter Basics",
                resources: [
                    { title: "Flutter Widget Catalog", url: "https://docs.flutter.dev/ui/widgets", type: "Doc" },
                    { title: "Flutter Crash Course", url: "https://www.youtube.com/watch?v=x0uinJvhNxI", type: "Video" }
                ]
            },
            {
                name: "State Management (Provider/Riverpod)",
                resources: [
                    { title: "Flutter State Management", url: "https://docs.flutter.dev/data-and-backend/state-mgmt/options", type: "Article" }
                ]
            },
            {
                name: "API Integration",
                resources: [
                    { title: "Networking in Flutter", url: "https://docs.flutter.dev/cookbook/networking/fetch-data", type: "Doc" }
                ]
            }
        ]
    },
    "Machine Learning": {
        color: "text-green-400",
        icon: <Database className="w-5 h-5 text-green-400" />,
        description: "From Python basics to Deep Learning models.",
        topics: [
            {
                name: "Python for Data Science",
                resources: [
                    { title: "Real Python", url: "https://realpython.com/", type: "Article" },
                    { title: "NumPy & Pandas Docs", url: "https://pandas.pydata.org/docs/", type: "Doc" }
                ]
            },
            {
                name: "Machine Learning Concepts",
                resources: [
                    { title: "Andrew Ng's ML Course", url: "https://www.coursera.org/learn/machine-learning", type: "Course" },
                    { title: "Scikit-Learn Docs", url: "https://scikit-learn.org/stable/", type: "Doc" }
                ]
            },
            {
                name: "Deep Learning & Neural Networks",
                resources: [
                    { title: "Fast.ai", url: "https://www.fast.ai/", type: "Course" },
                    { title: "PyTorch Tutorials", url: "https://pytorch.org/tutorials/", type: "Doc" }
                ]
            },
            {
                name: "Kaggle Competitions",
                resources: [
                    { title: "Kaggle Learn", url: "https://www.kaggle.com/learn", type: "Course" },
                    { title: "Getting Started with Kaggle", url: "https://www.kaggle.com/docs/competitions", type: "Article" }
                ]
            }
        ]
    },
    "InfoSec": {
        color: "text-red-400",
        icon: <Lock className="w-5 h-5 text-red-400" />,
        description: "Cybersecurity, CTFs, and Ethical Hacking.",
        topics: [
            {
                name: "Linux & Networking Basics",
                resources: [
                    { title: "OverTheWire: Bandit", url: "https://overthewire.org/wargames/bandit/", type: "Course" },
                    { title: "Network+ Guide", url: "https://www.professormesser.com/network-plus/n10-008/n10-008-video/n10-008-training-course/", type: "Video" }
                ]
            },
            {
                name: "Web Security (OWASP Top 10)",
                resources: [
                    { title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", type: "Doc" },
                    { title: "PortSwigger Academy", url: "https://portswigger.net/web-security", type: "Course" }
                ]
            },
            {
                name: "CTF Practice",
                resources: [
                    { title: "PicoCTF", url: "https://picoctf.org/", type: "Course" },
                    { title: "HackTheBox Starting Point", url: "https://app.hackthebox.com/starting-point", type: "Course" }
                ]
            },
            {
                name: "Binary Exploitation & RE",
                resources: [
                    { title: "Nightmare (Reverse Engineering)", url: "https://guyinatuxedo.github.io/", type: "Doc" }
                ]
            }
        ]
    },
    "FOSS": {
        color: "text-yellow-400",
        icon: <Terminal className="w-5 h-5 text-yellow-400" />,
        description: "Open Source contributions and Git mastery.",
        topics: [
            {
                name: "Git & GitHub Mastery",
                resources: [
                    { title: "Git Book", url: "https://git-scm.com/book/en/v2", type: "Doc" },
                    { title: "GitHub Flow", url: "https://docs.github.com/en/get-started/using-github/github-flow", type: "Doc" }
                ]
            },
            {
                name: "First Contributions",
                resources: [
                    { title: "Good First Issues", url: "https://goodfirstissue.dev/", type: "Article" },
                    { title: "First Contributions Repo", url: "https://github.com/firstcontributions/first-contributions", type: "Doc" }
                ]
            },
            {
                name: "Linux System Administration",
                resources: [
                    { title: "Linux Journey", url: "https://linuxjourney.com/", type: "Course" }
                ]
            }
        ]
    }
};

const StaticRoadmap: React.FC<StaticRoadmapProps> = ({ wing }) => {
    const data = WING_DATA[wing];
    const [expandedTopic, setExpandedTopic] = useState<number | null>(null);

    // Default fallback if wing data missing
    if (!data) return (
        <Card className="h-full border-white/10 bg-black/50 backdrop-blur-md">
            <CardContent className="p-6 text-center text-gray-500">
                Roadmap coming soon for {wing}.
            </CardContent>
        </Card>
    );

    return (
        <Card className="h-full border-white/10 bg-black/50 backdrop-blur-md flex flex-col">
            <CardHeader className="pb-3 border-b border-white/10">
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-lg text-white">
                        {data.icon}
                        {wing} Roadmap
                    </CardTitle>
                </div>
                <p className="text-xs text-gray-400 italic mt-1">{data.description}</p>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Topics Grid */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Star className="w-4 h-4 text-cyan-400" /> Learning Path
                    </h3>
                    <div className="flex flex-col gap-2">
                        {data.topics.map((topic, i) => (
                            <div key={i} className="rounded bg-white/5 border border-white/5 overflow-hidden transition-all duration-300">
                                <button
                                    onClick={() => setExpandedTopic(expandedTopic === i ? null : i)}
                                    className="w-full flex items-center justify-between p-3 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className={`w-4 h-4 ${expandedTopic === i ? 'text-' + data.color.split('-')[1] : 'text-gray-500/50'}`} />
                                        <span>{topic.name}</span>
                                    </div>
                                    {expandedTopic === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                </button>

                                {expandedTopic === i && (
                                    <div className="bg-black/20 p-3 border-t border-white/5 space-y-2 animate-in slide-in-from-top-2">
                                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Resources:</p>
                                        {topic.resources.map((res, j) => (
                                            <a
                                                key={j}
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between group p-2 rounded hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-3 h-3 text-gray-500" />
                                                    <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{res.title}</span>
                                                </div>
                                                <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};

export default StaticRoadmap;
