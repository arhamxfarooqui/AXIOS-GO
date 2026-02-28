import React from "react";
import WrapperCard from "./WrapperCard";
import { motion } from "framer-motion";

interface LanguageCardProps {
    languages: { name: string; count: number }[];
}

const LanguageCard: React.FC<LanguageCardProps> = ({ languages }) => {
    const topLang = languages[0];

    return (
        <WrapperCard className="bg-gradient-to-r from-blue-900 to-indigo-900">
            <div className="flex flex-col h-full w-full items-center justify-center space-y-8 text-center">
                <h2 className="text-2xl font-bold text-gray-300">You speak...</h2>

                <motion.div
                    className="text-5xl font-extrabold text-white"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring" }}
                >
                    {topLang ? topLang.name : "Code"}
                </motion.div>

                <div className="w-full max-w-xs space-y-2 mt-8">
                    {languages.slice(1).map((lang, index) => (
                        <div key={lang.name} className="flex justify-between text-gray-400 text-sm border-b border-white/10 pb-1">
                            <span>{lang.name}</span>
                            <span>{lang.count} sub</span>
                        </div>
                    ))}
                </div>
            </div>
        </WrapperCard>
    );
};

export default LanguageCard;
