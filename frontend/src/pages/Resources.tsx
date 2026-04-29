import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, BookOpen, ExternalLink, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Resource {
    ID: number;
    title: string;
    link: string;
    subject: string;
    difficulty_level: string;
    upvotes: number;
    wing_id: string;
}

const WINGS = [
    { id: 'all', name: 'All Resources' },
    { id: 'cp', name: 'Competitive Programming' },
    { id: 'dev', name: 'Web Development' },
    { id: 'ml', name: 'Machine Learning' },
    { id: 'sec', name: 'InfoSec' }
];

const Resources = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                let url = 'http://localhost:8081/api/public/resources';
                if (filter !== 'all') {
                    // Match mapping used in leaderboard or exact wing_id
                    const wingMapping: any = {
                        'cp': 'Competitive Programming',
                        'dev': 'Web Development',
                        'ml': 'Machine Learning',
                        'sec': 'InfoSec'
                    };
                    url += `?wing=${wingMapping[filter] || filter}`;
                }
                const response = await axios.get(url);
                setResources(response.data);
            } catch (err) {
                console.error("Failed to fetch resources", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, [filter]);

    return (
        <div className="container mx-auto p-6 min-h-screen pt-24">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Resource Library</h1>
                    <p className="text-gray-400 text-sm">Curated roadmaps and materials across all domains.</p>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
                    <Filter className="w-4 h-4 text-purple-400 ml-2" />
                    <Select onValueChange={setFilter} defaultValue="all">
                        <SelectTrigger className="w-[180px] bg-transparent border-none text-white focus:ring-0">
                            <SelectValue placeholder="Filter by Wing" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0c0c1d] border-white/10 text-white">
                            {WINGS.map(w => (
                                <SelectItem key={w.id} value={w.id} className="focus:bg-purple-600 focus:text-white">
                                    {w.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 bg-white/5 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.length > 0 ? (
                        resources.map(res => (
                            <Card key={res.ID} className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-all group overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                                            {res.subject}
                                        </Badge>
                                        <span className="text-[10px] uppercase text-gray-500 font-mono">{res.difficulty_level}</span>
                                    </div>
                                    <CardTitle className="text-lg text-white group-hover:text-purple-400 transition-colors leading-tight">
                                        {res.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mt-4">
                                        <a href={res.link} target="_blank" rel="noopener noreferrer" 
                                           className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                                            <ExternalLink className="w-3 h-3" />
                                            View Content
                                        </a>
                                        <Button variant="ghost" size="sm" className="h-8 gap-2 text-gray-400 hover:text-white hover:bg-white/5">
                                            <ThumbsUp className="w-3 h-3" />
                                            {res.upvotes || 0}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                            <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500">No resources found for this wing yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Resources;
