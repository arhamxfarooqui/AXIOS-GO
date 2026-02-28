import React from "react";
import WrapperCard from "./WrapperCard";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface ProblemDifficultyCardProps {
    easy: number;
    medium: number;
    hard: number;
}

const ProblemDifficultyCard: React.FC<ProblemDifficultyCardProps> = ({ easy, medium, hard }) => {
    const data = [
        { name: 'Easy', value: easy },
        { name: 'Medium', value: medium },
        { name: 'Hard', value: hard },
    ];

    const COLORS = ['#4ade80', '#fbbf24', '#f87171']; // Green, Amber, Red

    return (
        <WrapperCard className="bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="flex flex-col h-full w-full items-center justify-center space-y-8">
                <h2 className="text-3xl font-bold text-center">Problem Difficulty</h2>

                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="text-center">
                    <p className="text-gray-400">You love pushing your limits!</p>
                </div>
            </div>
        </WrapperCard>
    );
};

export default ProblemDifficultyCard;
