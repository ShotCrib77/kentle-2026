import { useEffect, useState } from "react";
import { FaPlay, FaPause } from "react-icons/fa";

type PlayButtonProps = {
  timeLimit: number;
  posInSongRef: {current: number};
  isPaused: boolean;
  togglePlay: () => void;
};

export default function PlayButton({ timeLimit, posInSongRef, isPaused, togglePlay }: PlayButtonProps) {
    const [progress, setProgress] = useState<number>(0);

    const size: number = 56;
    const strokeWidth: number = 4;
    const radius: number = (size - strokeWidth) / 2;
    const circumference: number = 2 * Math.PI * radius;

    useEffect(() => {
        let frameId: number;

        const update = (): void => {
        if (timeLimit > 0) {
            const current: number = posInSongRef.current ?? 0;
            const percentage: number = Math.min(current / timeLimit, 1);
            setProgress(percentage);
        }

        frameId = requestAnimationFrame(update);
        };

        frameId = requestAnimationFrame(update);

        return () => cancelAnimationFrame(frameId);
    }, [timeLimit, posInSongRef]);

    const strokeDashoffset: number = circumference * (1 - progress);

    return (
        <div className="relative w-16 h-16 flex items-center justify-center my-6">
            <svg
                width={size}
                height={size}
                className="absolute -rotate-90"
            >
                {/* Track ring */}
                <circle
                stroke="#9a3412"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={radius}
                cx={size / 2}
                cy={size / 2}
                />

                {/* Progress ring */}
                <circle
                stroke="#fb923c"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                className="transition-[stroke-dashoffset] duration-100"
                />
            </svg>

            <button
                onClick={togglePlay}
                className="bg-orange-400 rounded-full w-10 h-10 text-2xl lg:w-12 lg:h-12 lg:text-3xl 
                            flex justify-center items-center cursor-pointer hover:bg-orange-500 z-10"
            >
                {isPaused ? <FaPlay /> : <FaPause />}
            </button>
        </div>
    );
}