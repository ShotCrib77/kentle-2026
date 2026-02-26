import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    
    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get("code_verifier")?.value;
    
    if (!code || !codeVerifier) {
        return NextResponse.json({ error: "Missing code or code verifier" }, { status: 400 });
    }

    const client_id = process.env.NEXT_PUBLIC_CLIENT_ID;
    const redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI;

    if (!client_id || !redirect_uri) { return NextResponse.json({ error: "Missing redirect uri or client id in enviroment" }, { status: 500 })}

    const spotifyRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST", 
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams ({
            code: code,
            code_verifier: codeVerifier,
            redirect_uri: redirect_uri,
            grant_type: "authorization_code",
            client_id: client_id
        })
    })

    if (!spotifyRes.ok) {
        const error = await spotifyRes.json();
        console.error("Spotify token error", error)
        return NextResponse.json({ erorr: "Failed to get token from Spotify" }, { status: 500 })
    }

    const { access_token, refresh_token, expires_in } = await spotifyRes.json();

    cookieStore.set("access_token", access_token, { httpOnly: true, maxAge: expires_in });
    cookieStore.set("refresh_token", refresh_token, { httpOnly: true });

    return NextResponse.redirect(new URL("/play", process.env.NEXT_PUBLIC_REDIRECT_URI));    
}
