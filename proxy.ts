import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
    const spotifyToken = req.cookies.get("access_token")?.value;

    if (!spotifyToken) {
        console.log("NO SPOTIFY_TOKEN!!!!")
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: ["/play"]
}