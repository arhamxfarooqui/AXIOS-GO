import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CPRoadmap from './CPRoadmap';
import StaticRoadmap from './StaticRoadmap';

interface WingRoadmapsProps {
    wings: string[];
    cpRating: number;
}

const WingRoadmaps: React.FC<WingRoadmapsProps> = ({ wings, cpRating }) => {
    // Ensure CP is always available or handled if missing (though it's mandatory in registration)
    const availableWings = wings && wings.length > 0 ? wings : ["Competitive Programming"];
    const [activeTab, setActiveTab] = useState(availableWings[0]);

    return (
        <div className="h-full flex flex-col">
            <Tabs defaultValue={availableWings[0]} className="h-full flex flex-col w-full" onValueChange={setActiveTab}>
                {availableWings.length > 1 && (
                    <div className="px-1 pb-2">
                        <TabsList className="bg-white/5 border border-white/10 w-full justify-start overflow-x-auto no-scrollbar">
                            {availableWings.map(wing => (
                                <TabsTrigger
                                    key={wing}
                                    value={wing}
                                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 text-xs px-3 py-1.5 h-7"
                                >
                                    {wing}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                )}

                <div className="flex-1 overflow-hidden">
                    {availableWings.map(wing => (
                        <TabsContent key={wing} value={wing} className="h-full mt-0 border-none p-0 outline-none data-[state=inactive]:hidden">
                            {wing === "Competitive Programming" ? (
                                <CPRoadmap rating={cpRating} />
                            ) : (
                                <StaticRoadmap wing={wing} />
                            )}
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
};

export default WingRoadmaps;
