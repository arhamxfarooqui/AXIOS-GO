// Placeholder for Heatmap to save time or use a minimal version if library overkill. 
// Using basic grid for now or react-calendar-heatmap styles manually if complex.
// Actually, I installed `react-activity-calendar`. Let's use it.

import React from "react";
import WrapperCard from "./WrapperCard";
import { ActivityCalendar } from 'react-activity-calendar';
import type { Submission } from "../../hooks/useWrappedData";

interface ActivityHeatmapCardProps {
    submissions: Submission[];
}

const ActivityHeatmapCard: React.FC<ActivityHeatmapCardProps> = ({ submissions }) => {
    // Process submissions into { date: 'YYYY-MM-DD', count: number, level: 0-4 }

    const dataMap = new Map<string, number>();
    submissions.forEach(sub => {
        const date = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
        dataMap.set(date, (dataMap.get(date) || 0) + 1);
    });

    // Fill last year
    // For visual purposes, let's just show the last 6 months to fit mobile/card
    const today = new Date();
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - 6);

    const CalendarData = Array.from(dataMap.entries())
        .filter(([date]) => new Date(date) >= startDate)
        .map(([date, count]) => {
            let level = 0;
            if (count > 0) level = 1;
            if (count > 2) level = 2;
            if (count > 5) level = 3;
            if (count > 10) level = 4;
            return { date, count, level };
        })
        .sort((a, b) => a.date.localeCompare(b.date));

    // Pad missing dates? react-activity-calendar handles this if we pass block margin? 
    // Actually it needs continuous data? No, it handles sparse.

    return (
        <WrapperCard>
            <div className="flex flex-col h-full w-full justify-center items-center overflow-hidden p-2">
                <h2 className="text-2xl font-bold mb-8 text-green-400">Consistency is Key</h2>

                <div className="scale-75 origin-center sm:scale-90">
                    <ActivityCalendar
                        data={CalendarData}
                        labels={{
                            legend: {
                                less: 'Less',
                                more: 'More',
                            },
                        }}
                        theme={{
                            light: ['#f0f0f0', '#c4edde', '#7ac7c4', '#f73859', '#384259'],
                            dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'], // GitHub dark themeish
                        }}
                        blockSize={12}
                        blockMargin={4}
                    />
                </div>
            </div>
        </WrapperCard>
    );
};

export default ActivityHeatmapCard;
