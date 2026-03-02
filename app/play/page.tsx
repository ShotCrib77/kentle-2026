"use client";

import useSpotifyPlayer from "../hooks/useSpotifyPlayer";
import useTrackGuess from "../hooks/useTrackGuess";
import { useEffect, useState } from "react";
import Image from "next/image";
import PlayButton from "../components/PlayButton";

const feedbackTextArray = ["+20 Sekunder", "Albumbild!", "Refräng och +30 Sekunder" ]

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
        <main className="bg-bg-black min-h-screen w-full flex flex-col justify-center items-center">
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
                    {currentGuess > 2 ? (
                        <div className="relative w-52 h-52 lg:w-64 lg:h-64 xl:w-72 xl:h-72">
                            <Image src={currentTrack!.album.images[0].url} alt={`Cover image for ${currentTrack?.album.name}`} fill />
                        </div>
                    ) : (
                        <span className="w-52 h-52 lg:w-64 lg:h-64 xl:w-72 xl:h-72 bg-zinc-400 rounded flex justify-center items-center text-center text-6xl">?</span>
                    )}

                    <PlayButton timeLimit={timeLimit} posInSongRef={posInSongRef} isPaused={isPaused} togglePlay={togglePlay}/>

                    <div className="flex flex-col gap-4">
                        {inputStates.map(({id, value, readOnly, submited}) => (
                            <div key={id} className="flex flex-col gap-2 justify-center items-center">
                                <input 
                                    type="text"
                                    list="song-suggestions"
                                    value={value}
                                    disabled={readOnly}
                                    placeholder={!readOnly ? "Enter your guess..." : ""}
                                    readOnly={readOnly}
                                    onChange={(e) => handleChange(id, e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") submitGuess(id);
                                    }}
                                    className={`w-72 lg:w-80 xl:w-92 h-12 rounded-xl outline-0 text-black px-4 text-xl text-center overflow-x-scroll ${hasWon && id === currentGuess ? "bg-green-400" : submited ? "bg-[#B8B8B8]" : "bg-white"}`}
                                />

                                {submited && !(hasWon && id === currentGuess ) && id !== 4 && (
                                    <span className="text-orange-400 text-md py-1">
                                        {feedbackTextArray[id - 1]}
                                    </span>
                                )}
                            </div>
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

                            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-[#111111] rounded-lg p-20 shadow-2xl flex flex-col ">
                                <div className="flex flex-col justify-center items-center">
                                    <span className="text-lg">Total poäng:</span> 
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