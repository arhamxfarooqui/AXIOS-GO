import React from "react";
import { motion } from "framer-motion";

interface WrapperCardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const WrapperCard: React.FC<WrapperCardProps> = ({ children, className = "", style = {} }) => {
    return (
        <motion.div
            className={`w-full h-full bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 relative overflow-hidden text-white ${className}`}
            style={style}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {/* Background elements (optional subtle noise or shapes) */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>

            <div className="relative z-10 w-full h-full flex flex-col">
                {children}
            </div>
        </motion.div>
    );
};

export default WrapperCard;
