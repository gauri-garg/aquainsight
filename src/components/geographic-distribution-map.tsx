
"use client";

import { geographicDistribution } from "@/lib/data";

export default function GeographicDistributionMap() {
    return (
        <div className="h-[200px] w-full bg-blue-100 dark:bg-blue-900/30 rounded-lg relative overflow-hidden border border-blue-200 dark:border-blue-800">
             <div 
                className="absolute bg-blue-200 dark:bg-blue-900/50 w-full h-full"
                style={{
                    clipPath: "polygon(0% 60%, 15% 55%, 30% 65%, 45% 60%, 60% 70%, 75% 65%, 90% 75%, 100% 70%, 100% 100%, 0% 100%)"
                }}
            />
            {geographicDistribution.map((point) => (
                 <div
                 key={point.name}
                 className="absolute w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"
                 style={{ left: `${point.x}%`, top: `${point.y}%` }}
                 title={point.name}
               />
            ))}
        </div>
    )
}
