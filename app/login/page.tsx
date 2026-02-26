"use client";
import { createCodeVerifier, createCodeChallenge } from "../lib/pkce";

export default function Login() {

    const redirToSpotify = async () =>  {
        
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
        const redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI;
        if (!clientId || !redirect_uri) throw new Error("Missing Spotify client ID or redirect uri in enviroment");
        
        const codeVerifier = createCodeVerifier();

        console.log("angry bird")
        document.cookie = `code_verifier=${codeVerifier}; path=/; max-age=300; SameSite=Lax`
        console.log("muu")
        
        const codeChallange = await createCodeChallenge(codeVerifier);
        const scope = "streaming user-read-email user-read-private"

        const params = new URLSearchParams({
            response_type: "code",
            client_id: clientId,
            scope: scope,
            redirect_uri: redirect_uri,
            code_challenge: codeChallange,
            code_challenge_method: "S256"
        });

        window.location.href = `https://accounts.spotify.com/authorize?${params}` 
    }

    return (
        <main>
            <button onClick={redirToSpotify}>Login to Spotify</button>
        </main>
    );
}