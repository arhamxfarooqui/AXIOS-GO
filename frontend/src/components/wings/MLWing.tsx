import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Resource {
    ID: number;
    title: string;
    link: string;
    subject: string;
    difficulty_level: string;
}

const MLWing = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCuration = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get('http://localhost:8081/api/wings/ml/curate', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResources(response.data.resources || []);
            } catch (err) {
                console.error("ML curation error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCuration();
    }, []);

    if (loading) return <div className="text-blue-400 animate-pulse">Curating Personalized ML Materials...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">🧠 Targeted Research Curation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.length > 0 ? (
                    resources.map(res => (
                        <Card key={res.ID} className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-all">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                                        {res.subject}
                                    </Badge>
                                    <span className="text-[10px] text-gray-500 uppercase">{res.difficulty_level}</span>
                                </div>
                                <CardTitle className="text-xl text-white mt-2">{res.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <a href={res.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">
                                    Explore Resource →
                                </a>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="col-span-full bg-white/5 border-dashed border-white/10">
                        <CardContent className="py-12 text-center text-gray-500">
                            No curated materials found for your current profile. Explore the global resources page!
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default MLWing;
