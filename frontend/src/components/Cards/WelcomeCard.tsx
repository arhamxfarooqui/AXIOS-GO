import React from "react";
import WrapperCard from "./WrapperCard";
import type { CodeforcesUser } from "../../hooks/useWrappedData";
import { motion } from "framer-motion";

interface WelcomeCardProps {
    user: CodeforcesUser;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ user }) => {
    return (
        <WrapperCard>
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <img
                        src={user.titlePhoto || user.avatar}
                        alt="Avatar"
                        className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] object-cover"
                    />
                </motion.div>

                <motion.h1
                    className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Hi, {user.handle}!
                </motion.h1>

                <motion.p
                    className="text-xl text-gray-300"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    Ready to see your 2024* Unwrapped?
                </motion.p>

                <motion.div
                    className="mt-8 text-sm text-gray-400 italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    *Based on your all-time analytics
                </motion.div>
            </div>
        </WrapperCard>
    );
};

export default WelcomeCard;
