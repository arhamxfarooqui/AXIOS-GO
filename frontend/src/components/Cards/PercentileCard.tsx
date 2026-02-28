import React from "react";
import WrapperCard from "./WrapperCard";
import { motion } from "framer-motion";

interface PercentileCardProps {
    rank: string;
    maxRank: string;
    rating: number;
}

// Simple mocking of percentile based on rating for visual flare (Not accurate CF percentiles)
const getPercentileText = (rating: number) => {
    if (rating >= 2400) return "Top 0.1% - Grandmaster Level!";
    if (rating >= 2100) return "Top 1% - Master Status!";
    if (rating >= 1900) return "Top 5% - Keep pushing!";
    if (rating >= 1600) return "Top 15% - Expert coder!";
    if (rating >= 1400) return "Top 30% - Solid foundation!";
    return "On your way up!";
};

const PercentileCard: React.FC<PercentileCardProps> = ({ rank, maxRank, rating }) => {
    return (
        <WrapperCard>
            <div className="flex flex-col items-center justify-center h-full space-y-8 text-center">
                <motion.h2
                    className="text-2xl font-bold text-gray-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    Current Standing
                </motion.h2>

                <motion.div
                    className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 capitalize"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                >
                    {rank}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p className="text-gray-400">Max Rank: <span className="text-white font-bold capitalize">{maxRank}</span></p>
                    <p className="text-gray-400">Rating: <span className="text-white font-bold">{rating}</span></p>
                </motion.div>

                <motion.div
                    className="mt-8 p-4 bg-white/10 rounded-xl"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <p className="text-lg font-semibold text-rose-300">{getPercentileText(rating)}</p>
                </motion.div>
            </div>
        </WrapperCard>
    );
};

export default PercentileCard;
