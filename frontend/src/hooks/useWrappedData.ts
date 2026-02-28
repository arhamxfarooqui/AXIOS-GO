import { useState, useEffect } from "react";

export interface CodeforcesUser {
    handle: string;
    rating: number;
    maxRating: number;
    rank: string;
    maxRank: string;
    avatar: string;
    titlePhoto: string;
}

export interface Submission {
    id: number;
    contestId: number;
    creationTimeSeconds: number;
    relativeTimeSeconds: number;
    problem: {
        contestId: number;
        index: string;
        name: string;
        type: string;
        points: number;
        rating: number;
        tags: string[];
    };
    author: {
        contestId: number;
        members: { handle: string }[];
        participantType: string;
        ghost: boolean;
        startTimeSeconds: number;
    };
    programmingLanguage: string;
    verdict: string;
    testset: string;
    passedTestCount: number;
    timeConsumedMillis: number;
    memoryConsumedBytes: number;
}

export interface RatingChange {
    contestId: number;
    contestName: string;
    handle: string;
    rank: number;
    ratingUpdateTimeSeconds: number;
    oldRating: number;
    newRating: number;
}

export interface WrappedData {
    user: CodeforcesUser;
    ratings: RatingChange[];
    submissions: Submission[];
    stats: {
        totalSolved: number;
        activeDays: number;
        maxStreak: number;
        bestRank: number;
        languageStats: { name: string; count: number }[];
        topicStats: { name: string; count: number }[];
        difficultyStats: { easy: number; medium: number; hard: number }; // Easy < 1200, Med 1200-1900, Hard > 1900
        practiceRatingDistribution: { rating: number; count: number }[];
        totalSubmissions: number;
        bestContest: RatingChange | null;
        totalRatingGain: number;
        nightOwlScore: number; // 0-1, based on submissions between 10PM and 4AM
    };
}

export const useWrappedData = (handle: string | undefined, year: number | 'all' = 'all') => {
    const [data, setData] = useState<WrappedData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!handle) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [userRes, ratingRes, statusRes] = await Promise.all([
                    fetch(`https://codeforces.com/api/user.info?handles=${handle}`),
                    fetch(`https://codeforces.com/api/user.rating?handle=${handle}`),
                    fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=5000`)
                ]);

                if (!userRes.ok || !ratingRes.ok || !statusRes.ok) {
                    throw new Error("Failed to fetch data from Codeforces");
                }

                const userData = await userRes.json();
                const ratingData = await ratingRes.json();
                const statusData = await statusRes.json();

                if (userData.status !== "OK" || ratingData.status !== "OK" || statusData.status !== "OK") {
                    throw new Error("Codeforces API error");
                }

                const rawSubmissions = statusData.result as Submission[];
                const rawRatings = ratingData.result as RatingChange[];

                // Filter by Year
                let submissions = rawSubmissions;
                let ratings = rawRatings;

                if (year !== 'all') {
                    const startOfYear = new Date(year, 0, 1).getTime() / 1000;
                    const endOfYear = new Date(year + 1, 0, 1).getTime() / 1000;

                    submissions = rawSubmissions.filter(s => s.creationTimeSeconds >= startOfYear && s.creationTimeSeconds < endOfYear);
                    ratings = rawRatings.filter(r => r.ratingUpdateTimeSeconds >= startOfYear && r.ratingUpdateTimeSeconds < endOfYear);
                }

                // Process Stats
                const solvedProblems = new Set<string>();
                const activeDates = new Set<string>();
                let easy = 0, medium = 0, hard = 0;
                const languageMap = new Map<string, number>();
                const topicMap = new Map<string, number>();
                const practiceRatingMap = new Map<number, number>();
                let nightSubmissions = 0;

                submissions.forEach(sub => {
                    if (sub.verdict === "OK") {
                        const probId = `${sub.problem.contestId}-${sub.problem.index}`;
                        if (!solvedProblems.has(probId)) {
                            solvedProblems.add(probId);

                            // Difficulty
                            const rating = sub.problem.rating;
                            if (rating) {
                                if (rating < 1200) easy++;
                                else if (rating < 1900) medium++;
                                else hard++;

                                const roundedRating = Math.floor(rating / 100) * 100;
                                practiceRatingMap.set(roundedRating, (practiceRatingMap.get(roundedRating) || 0) + 1);
                            }

                            // Topics
                            sub.problem.tags.forEach(tag => {
                                topicMap.set(tag, (topicMap.get(tag) || 0) + 1);
                            });
                        }
                    }

                    // Activity (regardless of verdict)
                    const date = new Date(sub.creationTimeSeconds * 1000);
                    activeDates.add(date.toDateString());

                    // Language
                    languageMap.set(sub.programmingLanguage, (languageMap.get(sub.programmingLanguage) || 0) + 1);

                    // Night Owl (10PM - 4AM)
                    const hours = date.getHours();
                    if (hours >= 22 || hours < 4) {
                        nightSubmissions++;
                    }
                });

                const languageStats = Array.from(languageMap.entries())
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                const topicStats = Array.from(topicMap.entries())
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                const practiceRatingDistribution = Array.from(practiceRatingMap.entries())
                    .map(([rating, count]) => ({ rating, count }))
                    .sort((a, b) => a.rating - b.rating);

                // Best contest (Max Rating Increase)
                let bestContest = null;
                let maxGain = -Infinity;
                let totalRatingGain = 0;

                ratings.forEach(r => {
                    const gain = r.newRating - r.oldRating;
                    totalRatingGain += gain;
                    if (gain > maxGain) {
                        maxGain = gain;
                        bestContest = r;
                    }
                });

                setData({
                    user: userData.result[0],
                    ratings,
                    submissions,
                    stats: {
                        totalSolved: solvedProblems.size,
                        activeDays: activeDates.size,
                        maxStreak: 0, // TODO: calculate max streak
                        bestRank: ratings.length > 0 ? Math.min(...ratings.map(r => r.rank)) : 0,
                        languageStats,
                        topicStats,
                        difficultyStats: { easy, medium, hard },
                        practiceRatingDistribution,
                        totalSubmissions: submissions.length,
                        bestContest,
                        totalRatingGain,
                        nightOwlScore: submissions.length > 0 ? nightSubmissions / submissions.length : 0
                    }
                });

            } catch (err: any) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [handle, year]);

    return { data, loading, error };
};
