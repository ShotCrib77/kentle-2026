"use client";

import { useState, useEffect, useRef } from "react";

export default function useSpotifyPlayer() {
    const [startAt, setStartAt] = useState(0);
    const [timeLimit, setTimeLimit] = useState(10 * 1000)
    const [isPaused, setIsPaused] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [deviceId, setDeviceId] = useState("")

    const playerRef = useRef<SpotifyPlayer | null>(null);
    const accessTokenRef = useRef<string | null>(null);
    const posInSongRef = useRef<number>(0);

    useEffect(() => {
        const scriptId = "spotify-sdk";
        let script: HTMLScriptElement | null = null;

        const init = async () => {
            const res = await fetch("/api/auth/token");
            const { accessToken } = await res.json();
            accessTokenRef.current = accessToken;

            window.onSpotifyWebPlaybackSDKReady = () => {
                const spotifyPlayer = new window.Spotify.Player({
                    name: "Guess The Song Player",
                    getOAuthToken: (cb) => { cb(accessTokenRef.current ?? ""); },
                    volume: 0.25
                });

                spotifyPlayer.addListener("player_state_changed", (state) => {
                    if (!state) return;
                    setIsPaused(state.paused);
                    posInSongRef.current = state.position;
                });

                spotifyPlayer.addListener("ready", ({ device_id }) => {
                    setDeviceId(device_id)
                    setIsReady(true);

                    fetch('https://api.spotify.com/v1/me/player', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessTokenRef.current}`
                        },
                        body: JSON.stringify({
                            device_ids: [device_id],
                            play: false
                        })
                    });
                });

                playerRef.current = spotifyPlayer;
                spotifyPlayer.connect().then(success => {
                    if (success) {
                        console.log("The Web Playback SDK connected successfully.")
                    }
                });
            };

            // Check if Spotify script tag already initialized  
            if (!document.getElementById(scriptId)) {
                script = document.createElement("script");
                script.src = "https://sdk.scdn.co/spotify-player.js";
                script.id = scriptId;
                script.async = true;
                document.body.appendChild(script);
            }
        };

        init();

        return () => {
            playerRef.current?.disconnect();
            if (script) {
                document.body.removeChild(script);
            }
        };
    }, []);
    
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(async () => {
            const state = await playerRef.current?.getCurrentState()
            if (!state) return;
            posInSongRef.current = state.position;

            if (posInSongRef.current >= timeLimit) {
                playerRef.current?.pause();
                posInSongRef.current = startAt;
                playerRef.current?.seek(startAt); 
            }
        }, 500);

        return () => clearInterval(interval);
    }, [isPaused, timeLimit, startAt]);

    const triggerNextGuess = (guess: number) => {
        if (!playerRef.current) return;

        playerRef.current.pause();

        if (guess === 1) {
            setTimeLimit(30 * 1000)
        } else if (guess === 3) {
            playerRef.current.seek(60 * 1000);
            setStartAt(60 * 1000)
            setTimeLimit(60 * 1000 * 2);
        }
    }

    const togglePlay = async () => {
        if (!playerRef.current) return;
        await playerRef.current.togglePlay()
    }

    const loadTrack = async (trackUri: string, positionMs: number = 0) => {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessTokenRef.current}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uris: [trackUri],
                position_ms: positionMs
            })
        });
    }

    const handleNextSongSpotifyPlayer = () => {
        playerRef.current?.pause()
        setStartAt(0);
        setTimeLimit(10 * 1000);
        playerRef.current?.seek(0);
        posInSongRef.current = 0;
    }

    return { isReady, isPaused, timeLimit, posInSongRef, togglePlay, loadTrack, triggerNextGuess, handleNextSongSpotifyPlayer };
}