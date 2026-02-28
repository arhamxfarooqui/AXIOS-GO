import AICoach from '@/components/AICoach';
import AIRoadmap from '@/components/AIRoadmap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Map } from 'lucide-react';

const AILab = () => {
    return (
        <div className="container mx-auto p-4 md:p-6 text-white min-h-[calc(100vh-80px)] flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-amber-400 animate-in fade-in slide-in-from-left-4">
                    AI Research Lab
                </h1>
                <p className="text-gray-400 text-sm">
                    Connect an API Key to experiment with Gemini models.
                </p>
            </div>

            <Tabs defaultValue="coach" className="flex-1 w-full max-w-5xl mx-auto flex flex-col">
                <TabsList className="bg-white/5 border border-white/10 self-center mb-6">
                    <TabsTrigger value="coach" className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400">
                        <Bot className="w-4 h-4" /> AI Assistant
                    </TabsTrigger>
                    <TabsTrigger value="roadmap" className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400">
                        <Map className="w-4 h-4" /> Roadmap Generator
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="coach" className="flex-1 shadow-2xl shadow-purple-900/20 rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    <AICoach />
                </TabsContent>

                <TabsContent value="roadmap" className="flex-1 shadow-2xl shadow-purple-900/20 rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 bg-black/40 border border-white/5 p-4">
                    <AIRoadmap />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AILab;
