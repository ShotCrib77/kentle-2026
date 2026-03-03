"use client";

import useSpotifyPlayer from "../hooks/useSpotifyPlayer";
import useTrackGuess from "../hooks/useTrackGuess";
import { useEffect, useState } from "react";
import Image from "next/image";
import PlayButton from "../components/PlayButton";
import { Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FEEDBACK_TEXTS } from "../lib/gameConfig";

export default function Play() {
    const { isReady, isPaused, timeLimit, posInSongRef, togglePlay, loadTrack, triggerNextGuess, handleNextSongSpotifyPlayer } = useSpotifyPlayer();
    const { inputStates, currentRound, currentGuess, points, tracks, currentTrack, hasWon, roundFinished, handleChange, submitGuess, nextTrack, handleNextSong, handleResetGame } = useTrackGuess(loadTrack, triggerNextGuess, handleNextSongSpotifyPlayer);

    const [viewResults, setViewResults] = useState(false);
    const [trackNames, setTrackNames] = useState<string[]>([])

    useEffect(() => {
        const getAllTrackNames = (tracks: SpotifyTrack[]) => {
            const names: string[] = []
            tracks.forEach((track) => names.push(track.name))
            return names;
        }

        if (isReady && tracks.length) {
            nextTrack();

            setTrackNames(getAllTrackNames(tracks));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, tracks.length]);

    const dataListSongs = inputStates[currentGuess - 1].value.length >= 3 ? trackNames.filter(name => name.toLowerCase().includes(inputStates[currentGuess - 1].value.toLowerCase())) : []

    return (
        <main className="bg-bg-black min-h-screen w-full flex flex-col justify-center items-center p-16">
            {!isReady ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
                <section className="bg-bg-black flex flex-col justify-center items-center w-fit h-fit">
                    <div className="flex items-center gap-3 mb-2">
                        {/* Segmented progress bar */}
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: 5 }, (_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                i < currentRound
                                    ? "w-10 bg-amber-500"
                                    : "w-8 bg-neutral-600"
                                }`}
                            />
                            ))}
                        </div>
                        {/* Step counter */}
                        <span className="text-lg font-medium text-amber-500/80 tabular-nums">
                            {currentRound}/5
                        </span>
                    </div>
                    <motion.div
                        key={`art-${currentRound}-${currentGuess > 2 ? "show" : "hide"}`}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="relative"
                    >
                        {currentGuess > 2 ? (
                            <div className="w-52 h-52 lg:w-64 lg:h-64 rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border">
                                <Image
                                    src={currentTrack!.album.images[0].url}
                                    alt={`Cover for ${currentTrack?.album.name}`}
                                    className="w-full h-full object-cover"
                                    fill
                                />
                            </div>
                        ) : (
                            <div className="w-52 h-52 lg:w-64 lg:h-64 bg-background rounded-2xl border border-border flex flex-col justify-center items-center gap-3 shadow-xl">
                                <Music className="w-12 h-12 text-muted-foreground/40" />
                            </div>
                        )}
                    </motion.div>

                    <PlayButton timeLimit={timeLimit} posInSongRef={posInSongRef} isPaused={isPaused} togglePlay={togglePlay}/>

                    <div className="flex flex-col gap-3 w-82">
                        {inputStates.map(({ id, value, readOnly, submited }) => (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: id * 0.05 }}
                                className="flex flex-col items-center gap-1.5"
                            >
                                <div className="relative w-full">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-heading text-muted-foreground/50 w-5 text-center pointer-events-none select-none">
                                        {id}
                                    </span>
                                    <input
                                        type="text"
                                        list="song-suggestions"
                                        value={value}
                                        disabled={readOnly}
                                        placeholder={!readOnly ? "Skriv din gissning..." : ""}
                                        readOnly={readOnly}
                                        onChange={(e) => handleChange(id, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") submitGuess(id);
                                        }}
                                        className={`bg-[#262626] w-full h-12 rounded-xl pl-10 pr-10 text-center font-body text-base outline-none transition-all duration-200 ${
                                            hasWon && id === currentGuess
                                                ? "bg-green-500/20 text-green-400 border-2 border-green-500/40 font-semibold"
                                                : submited
                                                ? "bg-secondary text-muted-foreground border border-border"
                                                : readOnly
                                                ? "bg-secondary/50 text-muted-foreground/30 border border-border/50"
                                                : "text-foreground border-2 border-primary/40 focus:border-primary shadow-md shadow-primary/5"
                                        }`}
                                    />
                                </div>
                                <AnimatePresence>
                                    {submited && !(hasWon && id === currentGuess) && id !== 4 && (
                                        <motion.span
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="text-primary text-sm font-heading"
                                        >
                                            {FEEDBACK_TEXTS[id - 1]}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                    <datalist id="song-suggestions">
                        {dataListSongs.map((name) => (
                            <option key={name} value={name} />
                        ))}
                    </datalist>

                    {roundFinished && 
                        <div className="flex flex-col justify-center items-center text-center mt-8 gap-4 bg-white/5 rounded-2xl p-6 w-full max-w-md mx-auto">
                            {!hasWon && (
                                <span className="text-white text-xl font-bold">Rätt Svar: {currentTrack?.name}</span>
                            )}

                            {currentRound != 5 ? (
                                <div className="flex flex-col">
                                    <span className="text-white text-xl font-bold">Poäng: {points}</span>

                                    <button
                                        className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-2 rounded-full mt-2 cursor-pointer"
                                        onClick={handleNextSong}
                                    >
                                        Nästa låt!
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-2 rounded-full mt-2 cursor-pointer"
                                    onClick={() => setViewResults(true)}
                                >
                                    Se resultat!
                                </button>
                            )}

                        </div>
                    }
                    {viewResults && 
                        <div>
                            <div
                                className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                                onClick={() => {}}
                            />

                            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-[#111111] rounded-lg p-12 lg:p-20 shadow-2xl flex flex-col z-10">
                                <div className="flex flex-col justify-center items-center">
                                    <span className="text-lg">Poäng:</span> 
                                    <span className="text-3xl">{points}</span>
                                </div>

                                <button
                                    className="mt-4 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors px-6 py-2 rounded-full cursor-pointer"
                                    onClick={() => { handleResetGame(); setViewResults(false); }}
                                >
                                    Spela igen
                                </button>
                            </div>
                        </div>
                    
                    }

                </section>
            )}        
        </main>
    );
}