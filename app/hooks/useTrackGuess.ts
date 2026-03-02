"use client";

import { useEffect, useState } from "react";

interface InputField {
  id: number;
  value: string;
  readOnly: boolean;
  submited: boolean;
}

export default function useTrackGuess(loadTrack: (uri: string) => void, triggerNextGuess: (guess: number) => void, handleNextSongSpotifyPlayer: () => void) {
    const [inputStates, setInputStates] = useState<InputField[]>([
        {id: 1, value: "", readOnly: false, submited: false},
        {id: 2, value: "", readOnly: true, submited: false},
        {id: 3, value: "", readOnly: true, submited: false},
        {id: 4, value: "", readOnly: true, submited: false}
    ]);
    const [currentGuess, setCurrentGuess] = useState(1);

    const [currentTrack, setCurrentTrack] = useState<null | SpotifyTrack>(null);
    const [tracks, setTracks] = useState<SpotifyTrack[]>([])
    const [trackIndex, setTrackIndex] = useState(0)

    const [currentRound, setCurrentRound] = useState(1)
    const [points, setPoints] = useState(0);
    const [hasWon, setHasWon] = useState(false);
    const [roundFinished, setRoundFinished] = useState(false)

    const shuffleTracks = (tracks: SpotifyTrack[]) => [...tracks].sort(() => Math.random() - 0.5);
    
    const handleChange = (id: number, newValue: string) => {
        setInputStates(prev => prev.map(f => f.id === id ? { ...f, value: newValue } : f));
    };

    useEffect(() => {
        const fetchPlaylist = async () => {
            const resToken = await fetch("/api/auth/token");
            const { accessToken } = await resToken.json();

            const resTracks = await fetch('https://api.spotify.com/v1/playlists/6y6UPhLSKetBIV1aiqxSNS/tracks', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const data = await resTracks.json();
            const shuffled = shuffleTracks(data.items.map((item: SpotifyPlaylistItem) => item.track));
            setTracks(shuffled);
        };

        fetchPlaylist();
    }, []);

    const nextTrack = () => {
        if (!tracks.length) return;
        if (trackIndex >= tracks.length) {
            console.warn('nextTrack: trackIndex out of bounds');
            return;
        }
        const track = tracks[trackIndex];
        setCurrentTrack(track);
        console.log("Track URI", track.uri);
        loadTrack(track.uri);
        setTrackIndex(prev => prev + 1);
    }

    const handleNextSong = () => {
        nextTrack();
        setCurrentGuess(1);
        setHasWon(false);
        setRoundFinished(false);
        setCurrentRound(prev => prev + 1);
        setInputStates([
            {id: 1, value: "", readOnly: false, submited: false},
            {id: 2, value: "", readOnly: true, submited: false},
            {id: 3, value: "", readOnly: true, submited: false},
            {id: 4, value: "", readOnly: true, submited: false}
        ]);

        handleNextSongSpotifyPlayer();
    }

    const handleResetGame = () => {
        handleNextSong();
        setPoints(0);
        setCurrentRound(1);
    }


    const submitGuess = (id: number) => {
        const input = inputStates.find((input) => input.id === id);
        
        if (!input || !input.value.trim()) return;
        console.log("Input value, current track", input.value, currentTrack?.name);

        if (input.value.toLowerCase().trim() === currentTrack?.name.toLowerCase()) {
            setPoints(prev => prev + (5 - input.id) * 1000);
            setHasWon(true);
            setRoundFinished(true);
            setInputStates(prev => prev.map(f => f.id === id ? { ...f, readOnly: true, submited: true } : f));
        } else {
            // Setting the inputs to readonly after a guess has been submited
            setInputStates(prev => prev.map(f => {
                if (f.id === id) return { ...f, readOnly: true, submited: true };
                if (f.id === id + 1) return { ...f, readOnly: false };
                return f;
            }));
            
            // Handle time limits and position in song with useSpotifyPlayer hook
            triggerNextGuess(currentGuess);


            // Logic for changing current Guess
            if (currentGuess < 4) { 
                setCurrentGuess(prev => prev + 1);
            } else { 
                setRoundFinished(true);
            }
        }
    }
    

    return { inputStates, currentRound, currentGuess, points, tracks, currentTrack, hasWon, roundFinished, handleChange, submitGuess, nextTrack, handleNextSong, handleResetGame};
}