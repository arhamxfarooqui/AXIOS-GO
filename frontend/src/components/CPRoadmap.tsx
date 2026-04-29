import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, BookOpen, Star, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface CPRoadmapProps {
    rating: number;
}

interface Resource {
    title: string;
    url: string;
    site: 'CP-Algorithms' | 'GeeksForGeeks' | 'Codeforces' | 'Other';
}

interface Topic {
    name: string;
    resources: Resource[];
}

interface Level {
    name: string;
    minRating: number;
    color: string;
    description: string;
    topics: Topic[];
    tips: string[];
}

const ROADMAP_LEVELS: Level[] = [
    {
        name: "Newbie",
        minRating: 0,
        color: "text-gray-400",
        description: "Focus on implementation, basics of syntax, and simple logic.",
        topics: [
            {
                name: "Basic I/O & Data Types",
                resources: [
                    { title: "C++ Basic Input/Output", url: "https://www.geeksforgeeks.org/basic-input-output-c/", site: "GeeksForGeeks" },
                    { title: "Data Types in C++", url: "https://www.geeksforgeeks.org/c-data-types/", site: "GeeksForGeeks" }
                ]
            },
            {
                name: "Arrays & Strings",
                resources: [
                    { title: "Arrays in C++", url: "https://www.geeksforgeeks.org/arrays-in-c-cpp/", site: "GeeksForGeeks" },
                    { title: "String Handling", url: "https://cp-algorithms.com/string/string-hashing.html", site: "CP-Algorithms" } // General reference
                ]
            },
            {
                name: "Time Complexity (Big O)",
                resources: [
                    { title: "Time Complexity Analysis", url: "https://www.geeksforgeeks.org/time-complexity-and-space-complexity-analysis-of-algorithms/", site: "GeeksForGeeks" },
                    { title: "Big O Notation", url: "https://cp-algorithms.com/", site: "CP-Algorithms" }
                ]
            },
            {
                name: "Basic Sorting",
                resources: [
                    { title: "std::sort C++ STL", url: "https://www.geeksforgeeks.org/sort-c-stl/", site: "GeeksForGeeks" },
                    { title: "Bubble Sort", url: "https://www.geeksforgeeks.org/bubble-sort/", site: "GeeksForGeeks" }
                ]
            }
        ],
        tips: [
            "Solve A and B problems from recent contests.",
            "Participate in Div. 3 or Div. 4 rounds.",
            "Don't obsess over rating, focus on solving count."
        ]
    },
    {
        name: "Pupil",
        minRating: 1200,
        color: "text-green-400",
        description: "Learn standard algorithms and basic math.",
        topics: [
            {
                name: "STL (Vectors, Maps, Sets)",
                resources: [
                    { title: "C++ STL Tutorial", url: "https://www.geeksforgeeks.org/cpp-stl-tutorial/", site: "GeeksForGeeks" },
                    { title: "Power of STL", url: "https://codeforces.com/blog/entry/11080", site: "Codeforces" }
                ]
            },
            {
                name: "Number Theory (GCD, Primes)",
                resources: [
                    { title: "Euclidean Algorithm (GCD)", url: "https://cp-algorithms.com/algebra/euclid-algorithm.html", site: "CP-Algorithms" },
                    { title: "Sieve of Eratosthenes", url: "https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html", site: "CP-Algorithms" }
                ]
            },
            {
                name: "Binary Search",
                resources: [
                    { title: "Binary Search Algorithm", url: "https://cp-algorithms.com/num_methods/binary_search.html", site: "CP-Algorithms" },
                    { title: "Binary Search on Answer", url: "https://www.geeksforgeeks.org/binary-search/", site: "GeeksForGeeks" }
                ]
            },
            {
                name: "Two Pointers",
                resources: [
                    { title: "Two Pointers Method", url: "https://www.geeksforgeeks.org/two-pointers-technique/", site: "GeeksForGeeks" },
                    { title: "Two Pointers Practice", url: "https://usaco.guide/silver/two-pointers?lang=cpp", site: "Other" }
                ]
            }
        ],
        tips: [
            "Start upsolving C problems.",
            "Learn to calculate Prefix Sums.",
            "Practice constructive algorithms."
        ]
    },
    {
        name: "Specialist",
        minRating: 1400,
        color: "text-cyan-400",
        description: "Master standard techniques and start graph theory.",
        topics: [
            {
                name: "DFS & BFS",
                resources: [
                    { title: "Breadth First Search", url: "https://cp-algorithms.com/graph/breadth-first-search.html", site: "CP-Algorithms" },
                    { title: "Depth First Search", url: "https://cp-algorithms.com/graph/depth-first-search.html", site: "CP-Algorithms" }
                ]
            },
            {
                name: "Bit Manipulation",
                resources: [
                    { title: "Bit Manipulation Tricks", url: "https://www.geeksforgeeks.org/bitwise-operators-in-c-cpp/", site: "GeeksForGeeks" },
                    { title: "Bitwise Operations", url: "https://cp-algorithms.com/algebra/bit-manipulation.html", site: "CP-Algorithms" }
                ]
            },
            {
                name: "Disjoint Set Union (DSU)",
                resources: [
                    { title: "Disjoint Set Union", url: "https://cp-algorithms.com/data_structures/disjoint_set_union.html", site: "CP-Algorithms" },
                    { title: "Union Find Algorithm", url: "https://www.geeksforgeeks.org/union-find/", site: "GeeksForGeeks" }
                ]
            }
        ],
        tips: [
            "Solve 1400-1600 rated problems.",
            "Focus on implementation speed.",
            "Don't give up on D problems."
        ]
    },
    {
        name: "Expert",
        minRating: 1600,
        color: "text-blue-400",
        description: "Advanced data structures and complex DP.",
        topics: [
            {
                name: "Dijkstra & Shortest Paths",
                resources: [
                    { title: "Dijkstra Algorithm", url: "https://cp-algorithms.com/graph/dijkstra.html", site: "CP-Algorithms" },
                    { title: "Floyd-Warshall", url: "https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html", site: "CP-Algorithms" }
                ]
            },
            {
                name: "Segment Trees",
                resources: [
                    { title: "Segment Tree", url: "https://cp-algorithms.com/data_structures/segment_tree.html", site: "CP-Algorithms" },
                    { title: "Segment Tree Updates", url: "https://www.geeksforgeeks.org/segment-tree-set-1-sum-of-given-range/", site: "GeeksForGeeks" }
                ]
            },
            {
                name: "Dynamic Programming (DP)",
                resources: [
                    { title: "DP Patterns", url: "https://codeforces.com/blog/entry/67679", site: "Codeforces" },
                    { title: "Knapsack Problem", url: "https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/", site: "GeeksForGeeks" }
                ]
            }
        ],
        tips: [
            "Participate in Div. 2 consistently.",
            "Upsolve problems you missed in contests.",
            "Start looking into max flow."
        ]
    },
    {
        name: "Candidate Master",
        minRating: 1900,
        color: "text-purple-400",
        description: "High-level algorithms and optimization.",
        topics: [
            {
                name: "Flows & Cuts",
                resources: [
                    { title: "Max Flow Min Cut", url: "https://cp-algorithms.com/graph/edmonds_karp.html", site: "CP-Algorithms" },
                    { title: "Dinic's Algorithm", url: "https://cp-algorithms.com/graph/dinic.html", site: "CP-Algorithms" }
                ]
            },
            {
                name: "Game Theory",
                resources: [
                    { title: "Sprague-Grundy Theorem", url: "https://cp-algorithms.com/game_theory/sprague-grundy-nim.html", site: "CP-Algorithms" }
                ]
            }
        ],
        tips: [
            "Aim for Div. 1 eligibility.",
            "Speed solves A-C in under 30 mins.",
            "Optimize strict time limits."
        ]
    }
];

const CPRoadmap: React.FC<CPRoadmapProps> = ({ rating }) => {
    // Current level is the highest level where rating >= minRating
    const currentLevelIndex = useMemo(() => {
        let idx = 0;
        for (let i = 0; i < ROADMAP_LEVELS.length; i++) {
            if (rating >= ROADMAP_LEVELS[i].minRating) {
                idx = i;
            } else {
                break;
            }
        }
        return idx;
    }, [rating]);

    const currentLevel = ROADMAP_LEVELS[currentLevelIndex];
    const nextLevel = ROADMAP_LEVELS[currentLevelIndex + 1];

    // Calculate progress to next level
    const progress = useMemo(() => {
        if (!nextLevel) return 100;
        const range = nextLevel.minRating - currentLevel.minRating;
        const current = rating - currentLevel.minRating;
        return Math.min(100, Math.max(0, (current / range) * 100));
    }, [rating, currentLevel, nextLevel]);

    const [expandedTopic, setExpandedTopic] = useState<number | null>(null);

    return (
        <Card className="h-full border-white/10 bg-black/50 backdrop-blur-md flex flex-col">
            <CardHeader className="pb-3 border-b border-white/10">
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-lg text-white">
                        <BookOpen className="w-5 h-5 text-yellow-400" />
                        CP Roadmap
                    </CardTitle>
                    <div className={`text-sm font-bold ${currentLevel.color} px-3 py-1 rounded-full bg-white/5 border border-white/10`}>
                        {currentLevel.name} ({rating})
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Progress Visual */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Current: {rating}</span>
                        {nextLevel && <span>Target: {nextLevel.minRating} ({nextLevel.name})</span>}
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Topics Grid */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Star className="w-4 h-4 text-cyan-400" /> Key Topics for You
                    </h3>
                    <div className="flex flex-col gap-2">
                        {currentLevel.topics.map((topic, i) => (
                            <div key={i} className="rounded bg-white/5 border border-white/5 overflow-hidden transition-all duration-300">
                                <button
                                    onClick={() => setExpandedTopic(expandedTopic === i ? null : i)}
                                    className="w-full flex items-center justify-between p-3 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className={`w-4 h-4 ${expandedTopic === i ? 'text-green-400' : 'text-green-500/30'}`} />
                                        <span>{topic.name}</span>
                                    </div>
                                    {expandedTopic === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                </button>

                                {expandedTopic === i && (
                                    <div className="bg-black/20 p-3 border-t border-white/5 space-y-2 animate-in slide-in-from-top-2">
                                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Recommended Resources:</p>
                                        {topic.resources.map((res, j) => (
                                            <a
                                                key={j}
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between group p-2 rounded hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${res.site === 'CP-Algorithms' ? 'bg-blue-500' :
                                                            res.site === 'GeeksForGeeks' ? 'bg-green-500' : 'bg-purple-500'
                                                        }`} />
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

                {/* Tips Section */}
                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-4 rounded-lg border border-purple-500/20">
                    <h3 className="text-sm font-semibold text-purple-300 mb-2">Coach's Tips</h3>
                    <ul className="space-y-2">
                        {currentLevel.tips.map((tip, i) => (
                            <li key={i} className="flex gap-2 text-xs text-gray-300">
                                <ArrowRight className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

export default CPRoadmap;
