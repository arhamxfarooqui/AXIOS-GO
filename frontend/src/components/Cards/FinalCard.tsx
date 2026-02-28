import React from "react";
import WrapperCard from "./WrapperCard";
import type { CodeforcesUser } from "../../hooks/useWrappedData";


interface FinalCardProps {
    user: CodeforcesUser;
    totalSolved: number;
    maxRank: string;
    activeDays: number;
    year: number | 'all';
}

const FinalCard: React.FC<FinalCardProps> = ({ user, totalSolved, maxRank, activeDays, year }) => {
    return (
        <WrapperCard>
            <div className="flex flex-col h-full w-full items-center justify-between p-8 text-center">

                <div className="mt-8">
                    <p className="tracking-[0.3em] font-light text-sm uppercase text-white/70">Codeforces Wrapped</p>
                    <h1 className="text-5xl font-black text-white mt-2">{year === 'all' ? 'All Time' : year}</h1>
                </div>

                <div className="flex flex-col items-center space-y-4 my-8 relative">
                    <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full"></div>
                    <img
                        src={user.avatar}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full border-2 border-white relative z-10"
                    />
                    <h2 className="text-2xl font-bold relative z-10">@{user.handle}</h2>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold relative z-10 uppercase">{maxRank}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold">{totalSolved}</span>
                        <span className="text-xs text-white/60 uppercase">Problems</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold">{activeDays}</span>
                        <span className="text-xs text-white/60 uppercase">Active Days</span>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-white/50 text-xs">#CodeforcesWrapped</p>
                </div>
            </div>
        </WrapperCard>
    );
};

export default FinalCard;
