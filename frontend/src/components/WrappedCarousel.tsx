import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { WrappedData } from "../hooks/useWrappedData";

// Import all cards
import WelcomeCard from "./Cards/WelcomeCard";
import PercentileCard from "./Cards/PercentileCard";
import TotalStatsCard from "./Cards/TotalStatsCard";
import RatingJourneyCard from "./Cards/RatingJourneyCard";
import PracticeRatingCard from "./Cards/PracticeRatingCard";
import ProblemDifficultyCard from "./Cards/ProblemDifficultyCard";
import TopicsCard from "./Cards/TopicsCard";
import LanguageCard from "./Cards/LanguageCard";
import NightOwlCard from "./Cards/NightOwlCard";
import BestContestCard from "./Cards/BestContestCard";
import ActivityHeatmapCard from "./Cards/ActivityHeatmapCard";
import FinalCard from "./Cards/FinalCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WrappedCarouselProps {
    data: WrappedData;
    year: number | 'all';
}

const WrappedCarousel: React.FC<WrappedCarouselProps> = ({ data, year }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const slides = [
        <WelcomeCard key="welcome" user={data.user} />,
        <PercentileCard key="percentile" rank={data.user.rank} maxRank={data.user.maxRank} rating={data.user.rating} />,
        <TotalStatsCard key="total" solved={data.stats.totalSolved} activeDays={data.stats.activeDays} totalSubmissions={data.stats.totalSubmissions} />,
        <RatingJourneyCard key="journey" ratings={data.ratings} />,
        <PracticeRatingCard key="practice" distribution={data.stats.practiceRatingDistribution} />,
        <ProblemDifficultyCard key="difficulty" easy={data.stats.difficultyStats.easy} medium={data.stats.difficultyStats.medium} hard={data.stats.difficultyStats.hard} />,
        <TopicsCard key="topics" topics={data.stats.topicStats} />,
        <LanguageCard key="language" languages={data.stats.languageStats} />,
        <ActivityHeatmapCard key="heatmap" submissions={data.submissions} />,
        <NightOwlCard key="nightowl" nightOwlScore={data.stats.nightOwlScore} />,
        ...(data.stats.bestContest ? [<BestContestCard key="best" contest={data.stats.bestContest} />] : []),
        <FinalCard key="final" user={data.user} totalSolved={data.stats.totalSolved} maxRank={data.user.maxRank} activeDays={data.stats.activeDays} year={year} />,
    ];

    const nextSlide = () => {
        if (currentIndex < slides.length - 1) setCurrentIndex(prev => prev + 1);
    };

    const prevSlide = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center py-10">
            {/* Progress Bar - Placed above with margin */}
            <div className="w-full max-w-5xl flex justify-center space-x-2 px-4 mb-8 cursor-pointer">
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${idx <= currentIndex ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-gray-800'}`}
                    />
                ))}
            </div>

            <div className="flex items-center justify-center w-full max-w-7xl relative px-12">
                {/* Navigation Controls - Centered Vertically */}
                <button
                    onClick={prevSlide}
                    className={`absolute left-0 z-50 p-4 rounded-full bg-slate-900/50 hover:bg-slate-800 border border-slate-700 backdrop-blur-md transition-all ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:scale-110'}`}
                >
                    <ChevronLeft size={32} className="text-gray-300" />
                </button>

                {/* Slides Area */}
                <div className="w-full max-w-5xl h-[60vh] relative perspective-[1000px]">
                    <AnimatePresence mode="wait">
                        {slides[currentIndex]}
                    </AnimatePresence>
                </div>

                <button
                    onClick={nextSlide}
                    className={`absolute right-0 z-50 p-4 rounded-full bg-slate-900/50 hover:bg-slate-800 border border-slate-700 backdrop-blur-md transition-all ${currentIndex === slides.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:scale-110'}`}
                >
                    <ChevronRight size={32} className="text-gray-300" />
                </button>
            </div>

            <p className="mt-6 text-gray-500 text-sm">Use arrow keys or click buttons to navigate</p>
        </div>
    );
};

export default WrappedCarousel;
