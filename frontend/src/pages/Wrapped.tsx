import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWrappedData } from "../hooks/useWrappedData";
import WrappedCarousel from "../components/WrappedCarousel";
import { motion } from "framer-motion";
import WrappedBackground from "../components/3d/WrappedBackground";

const Wrapped = () => {
    const { user } = useAuth();

    const [inputHandle, setInputHandle] = useState(user?.codeforces_handle || "");
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

    // We only fetch when they hit "Go"
    const [config, setConfig] = useState<{ handle: string, year: number | 'all' } | null>(null);

    const { data, loading, error } = useWrappedData(config?.handle, config?.year);

    // Import dynamically? No, standard import is fine.
    // We need to import WrappedBackground at top, let's assume it's imported now.
    // Wait, I need to add the import statement too. I'll do that in a separate block or verify if I can do it here.
    // I will replace the whole return block.

    const handleGo = () => {
        if (inputHandle) {
            setConfig({ handle: inputHandle, year: selectedYear });
        }
    };

    if (!config) {
        return (
            <div className="min-h-screen relative flex items-center justify-center bg-[#020617] text-white overflow-hidden">
                <WrappedBackground />

                <div className="z-10 p-8 text-center space-y-8 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl max-w-lg w-full">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                            Wrapped
                        </h1>
                        <p className="text-gray-300 text-lg">Your Competitive Programming Year in Review</p>
                    </div>

                    <div className="flex flex-col gap-4 text-left">
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400 ml-1">Codeforces Handle</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 placeholder:text-gray-600"
                                placeholder="Enter handle..."
                                value={inputHandle}
                                onChange={(e) => setInputHandle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-gray-400 ml-1">Select Year</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[2025, 2024, 'all'].map((y) => (
                                    <button
                                        key={y}
                                        onClick={() => setSelectedYear(y as number | 'all')}
                                        className={`py-2 rounded-lg text-sm font-semibold transition-all duration-200 border ${selectedYear === y
                                            ? 'bg-green-600 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {y === 'all' ? 'All Time' : y}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-[1.02]"
                            onClick={handleGo}
                        >
                            Generate Wrapped 🚀
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white relative">
                <WrappedBackground />
                <div className="z-10 flex flex-col items-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-16 h-16 border-t-4 border-b-4 border-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                    />
                    <p className="mt-6 text-xl font-mono animate-pulse text-green-400">Crunching the data matrix...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white relative">
                <WrappedBackground />
                <div className="z-10 text-center p-8 bg-black/50 backdrop-blur-xl rounded-2xl border border-red-500/30">
                    <h1 className="text-3xl font-bold text-red-500 mb-2">System Failure</h1>
                    <p className="text-gray-300 mb-6">{error || "Could not load data"}</p>
                    <button
                        className="bg-white/10 hover:bg-white/20 py-2 px-6 rounded-lg transition"
                        onClick={() => setConfig(null)}
                    >
                        Return to Base
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center overflow-hidden font-sans relative">
            <WrappedBackground />
            <div className="z-10 w-full h-full flex items-center justify-center">
                <WrappedCarousel data={data} year={config?.year || 'all'} />
            </div>
        </div>
    );
};

export default Wrapped;
