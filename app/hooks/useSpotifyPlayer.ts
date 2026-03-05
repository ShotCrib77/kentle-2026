"use client";

import { useState, useEffect, useRef } from "react";
import { INITIAL_TIME_LIMIT_MS, GUESS2_TIME_LIMIT_MS, GUESS3_TIME_LIMIT_MS, GUESS3_SEEK_MS, PLAYER_VOLUME } from "../lib/gameConfig";

export default function useSpotifyPlayer() {
    const [startAt, setStartAt] = useState(0);
    const [timeLimit, setTimeLimit] = useState(INITIAL_TIME_LIMIT_MS)
    const [isPaused, setIsPaused] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [deviceId, setDeviceId] = useState("")

    const playerRef = useRef<SpotifyPlayer | null>(null);
    const accessTokenRef = useRef<string | null>(null);
    const posInSongRef = useRef<number>(0);
    const hasLoadedTrack = useRef(false);

    useEffect(() => {
        const scriptId = "spotify-sdk";
        let script: HTMLScriptElement | null = null;

        const init = async () => {
            const res = await fetch("/api/auth/token");
            const { accessToken } = await res.json();
            accessTokenRef.current = accessToken;

            const handlePlayerStateChanged = (state: unknown) => {
                if (!state) return;
                const s = state as { paused: boolean; position: number };
                setIsPaused(s.paused);
                posInSongRef.current = s.position;
            };

            const handleReady = ({ device_id }: { device_id: string }) => {
                setDeviceId(device_id);
                setIsReady(true);

                if (!hasLoadedTrack.current) {
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
                    }).catch(err => console.error('Failed to set active device', err));
                }
            };

            window.onSpotifyWebPlaybackSDKReady = () => {
                const spotifyPlayer = new window.Spotify.Player({
                    name: "Guess The Song Player",
                    getOAuthToken: async (cb: (token: string) => void) => {
                        try {
                            if (!accessTokenRef.current) {
                                const res = await fetch('/api/auth/token');
                                const json = await res.json();
                                accessTokenRef.current = json.accessToken;
                            }
                        } catch (err) {
                            console.error('Failed to refresh access token', err);
                        }
                        cb(accessTokenRef.current ?? "");
                    },
                    volume: PLAYER_VOLUME
                });

                spotifyPlayer.addListener('player_state_changed', handlePlayerStateChanged);
                spotifyPlayer.addListener('ready', handleReady);

                playerRef.current = spotifyPlayer;
                spotifyPlayer.connect().then((success) => {
                    if (success) console.log('The Web Playback SDK connected successfully.');
                    else console.warn('The Web Playback SDK failed to connect.');
                }).catch((err: unknown) => console.error('Player connect error', err));
            };

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
            if (playerRef.current) {
                try {
                    playerRef.current.removeListener('player_state_changed');
                    playerRef.current.removeListener('ready');
                } catch { }
                try {
                    playerRef.current.disconnect();
                } catch { }
            }

            if (script) {
                document.body.removeChild(script);
            }

            try {
                window.onSpotifyWebPlaybackSDKReady = undefined;
            } catch { }
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
            setTimeLimit(GUESS2_TIME_LIMIT_MS);
        } else if (guess === 3) {
            setTimeLimit(GUESS3_TIME_LIMIT_MS);
            playerRef.current.seek(GUESS3_SEEK_MS);
        }
    }

    const togglePlay = async () => {
        if (!playerRef.current) return;
        await playerRef.current.togglePlay()
    }

    const loadTrack = async (trackUri: string, positionMs: number = 0) => {
        hasLoadedTrack.current = true;
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
        setTimeLimit(INITIAL_TIME_LIMIT_MS);
        playerRef.current?.seek(0);
        posInSongRef.current = 0;
    }

    return { isReady, isPaused, timeLimit, posInSongRef, togglePlay, loadTrack, triggerNextGuess, handleNextSongSpotifyPlayer };
}