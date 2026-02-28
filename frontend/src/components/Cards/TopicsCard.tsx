import React from "react";
import WrapperCard from "./WrapperCard";
import { motion } from "framer-motion";

interface TopicsCardProps {
    topics: { name: string; count: number }[];
}

const TopicsCard: React.FC<TopicsCardProps> = ({ topics }) => {
    return (
        <WrapperCard className="bg-gradient-to-bl from-teal-900 to-black">
            <div className="flex flex-col h-full w-full items-center justify-center space-y-8 p-6">
                <h2 className="text-3xl font-bold text-center mb-4">Top Topics</h2>

                <div className="w-full space-y-4">
                    {topics.map((topic, index) => (
                        <motion.div
                            key={topic.name}
                            className="bg-white/10 rounded-lg p-3 flex justify-between items-center"
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <span className="font-semibold capitalize text-lg">{topic.name}</span>
                            <span className="font-bold text-teal-300">{topic.count}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </WrapperCard>
    );
};

export default TopicsCard;
