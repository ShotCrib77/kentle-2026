"use client";
import { createCodeVerifier, createCodeChallenge } from "../lib/pkce";

export default function Login() {

    const redirToSpotify = async () =>  {
        
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
        const redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI;
        console.log("Client ID:", clientId);
        console.log("Redirect URI:", redirect_uri);
        if (!clientId || !redirect_uri) throw new Error("Missing Spotify client ID or redirect uri in enviroment");
        
        const codeVerifier = createCodeVerifier();
        document.cookie = `code_verifier=${codeVerifier}; path=/; max-age=300; SameSite=Lax`

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
        <main className="bg-bg-black h-screen w-full flex flex-col justify-center items-center">
            <button className="bg-green-500 hover:bg-green-600 cursor-pointer px-8 py-3 rounded-full text-2xl" onClick={redirToSpotify}>Logga in till Spotify</button>
        </main>
    );
}