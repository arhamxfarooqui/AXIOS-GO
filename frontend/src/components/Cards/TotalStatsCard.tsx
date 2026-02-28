import React from "react";
import WrapperCard from "./WrapperCard";
import { motion } from "framer-motion";

interface TotalStatsCardProps {
    solved: number;
    activeDays: number;
    totalSubmissions: number;
}

const StatItem = ({ label, value, delay }: { label: string, value: number, delay: number }) => (
    <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <span className="text-5xl font-bold text-white mb-2">{value}</span>
        <span className="text-gray-400 uppercase tracking-widest text-sm">{label}</span>
    </motion.div>
);

const TotalStatsCard: React.FC<TotalStatsCardProps> = ({ solved, activeDays, totalSubmissions }) => {
    return (
        <WrapperCard>
            <div className="flex flex-col justify-center h-full space-y-12">
                <motion.h2
                    className="text-3xl font-bold text-center mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    You've been busy!
                </motion.h2>

                <div className="flex flex-col space-y-8">
                    <StatItem label="Problems Solved" value={solved} delay={0.2} />
                    <StatItem label="Active Days" value={activeDays} delay={0.4} />
                    <StatItem label="Total Submissions" value={totalSubmissions} delay={0.6} />
                </div>
            </div>
        </WrapperCard>
    );
};

export default TotalStatsCard;
