
"use client";

import { geographicDistribution } from "@/lib/data";

export default function GeographicDistributionMap() {
    return (
        <div className="h-[250px] w-full bg-blue-100 rounded-lg relative overflow-hidden">
            <div 
                className="absolute bg-blue-200 w-full h-full"
                style={{
                    clipPath: "polygon(0% 60%, 15% 55%, 30% 65%, 45% 60%, 60% 70%, 75% 65%, 90% 75%, 100% 70%, 100% 100%, 0% 100%)"
                }}
            />
            {geographicDistribution.map((point) => (
                 <div
                 key={point.name}
                 className="absolute w-2 h-2 bg-red-500 rounded-full"
                 style={{ left: `${point.x}px`, top: `${point.y}px` }}
                 title={point.name}
               />
            ))}
        </div>
    )
}
