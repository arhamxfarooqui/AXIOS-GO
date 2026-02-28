import React from "react";
import WrapperCard from "./WrapperCard";
import type { RatingChange } from "../../hooks/useWrappedData";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface BestContestCardProps {
    contest: RatingChange | null;
}

const BestContestCard: React.FC<BestContestCardProps> = ({ contest }) => {
    if (!contest) return null;

    const gain = contest.newRating - contest.oldRating;

    return (
        <WrapperCard className="bg-gradient-to-b from-yellow-700 to-black">
            <div className="flex flex-col h-full w-full items-center justify-center p-6 text-center space-y-8">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring' }}
                >
                    <Trophy size={80} className="text-yellow-400 drop-shadow-lg" />
                </motion.div>

                <h2 className="text-2xl font-bold text-yellow-100">Best Performance</h2>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white leading-tight">{contest.contestName}</h3>
                    <motion.div
                        className="text-6xl font-extrabold text-green-400"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                    >
                        +{gain}
                    </motion.div>
                    <p className="text-gray-400">Rating skyrocketed to <span className="text-white font-bold">{contest.newRating}</span></p>
                </div>
            </div>
        </WrapperCard>
    );
};

export default BestContestCard;
