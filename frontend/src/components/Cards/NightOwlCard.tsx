import React from "react";
import WrapperCard from "./WrapperCard";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

interface NightOwlCardProps {
    nightOwlScore: number; // 0 to 1
}

const NightOwlCard: React.FC<NightOwlCardProps> = ({ nightOwlScore }) => {
    const isNightOwl = nightOwlScore > 0.4; // Threshold

    return (
        <WrapperCard className={`bg-gradient-to-br ${isNightOwl ? 'from-indigo-950 to-black' : 'from-orange-400 to-yellow-200'}`}>
            <div className="flex flex-col h-full w-full items-center justify-center text-center p-8 space-y-8">

                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 60 }}
                >
                    {isNightOwl ? (
                        <Moon size={120} className="text-yellow-100 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]" />
                    ) : (
                        <Sun size={120} className="text-orange-600 drop-shadow-2xl" />
                    )}
                </motion.div>

                <div>
                    <h2 className={`text-4xl font-extrabold ${isNightOwl ? 'text-white' : 'text-gray-900'}`}>
                        {isNightOwl ? "Night Owl" : "Early Bird"}
                    </h2>
                    <p className={`mt-4 text-xl ${isNightOwl ? 'text-indigo-200' : 'text-gray-800'}`}>
                        {isNightOwl
                            ? "You code while the world sleeps."
                            : "You tackle bugs with the morning light."}
                    </p>
                </div>

                <div className={`text-sm ${isNightOwl ? 'text-gray-500' : 'text-gray-700'}`}>
                    {(nightOwlScore * 100).toFixed(0)}% of your submissions were late at night.
                </div>
            </div>
        </WrapperCard>
    );
};

export default NightOwlCard;
