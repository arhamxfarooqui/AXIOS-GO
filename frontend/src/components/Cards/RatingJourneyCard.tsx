import React from "react";
import WrapperCard from "./WrapperCard";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts";
import type { RatingChange } from "../../hooks/useWrappedData";

interface RatingJourneyCardProps {
    ratings: RatingChange[];
}

const RatingJourneyCard: React.FC<RatingJourneyCardProps> = ({ ratings }) => {
    // Filter to last year potentially, or just show all. Let's show last 20 contests or last year.
    // To make it look nice, let's take the last 20 data points if array is large.
    const data = ratings.length > 30 ? ratings.slice(ratings.length - 30) : ratings;

    return (
        <WrapperCard className="bg-gradient-to-r from-slate-900 to-slate-800">
            <div className="flex flex-col h-full w-full justify-between py-10">
                <h2 className="text-3xl font-bold text-center mb-4">Your Rating Journey</h2>

                <div className="flex-1 w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis dataKey="contestId" hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
                                itemStyle={{ color: "#fff" }}
                                labelStyle={{ display: "none" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="newRating"
                                stroke="#3b82f6"
                                strokeWidth={4}
                                dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <p className="text-center text-gray-400 mt-4 text-sm">Last {data.length} contests</p>
            </div>
        </WrapperCard>
    );
};

export default RatingJourneyCard;
