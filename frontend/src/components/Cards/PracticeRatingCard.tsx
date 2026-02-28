import React from "react";
import WrapperCard from "./WrapperCard";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts";

interface PracticeRatingCardProps {
    distribution: { rating: number; count: number }[];
}

const PracticeRatingCard: React.FC<PracticeRatingCardProps> = ({ distribution }) => {
    return (
        <WrapperCard className="bg-gradient-to-t from-emerald-900 to-black">
            <div className="flex flex-col h-full w-full justify-between py-8">
                <h2 className="text-2xl font-bold text-center mb-4">Practice Difficulty</h2>

                <div className="flex-1 w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={distribution}>
                            <XAxis dataKey="rating" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                contentStyle={{ backgroundColor: "#064e3b", border: "none", color: "#fff" }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {distribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.rating >= 1900 ? '#f87171' : entry.rating >= 1200 ? '#fbbf24' : '#4ade80'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </WrapperCard>
    );
};

export default PracticeRatingCard;
