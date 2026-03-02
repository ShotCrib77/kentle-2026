import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    
    if (!accessToken) {
        return NextResponse.json({ error: "Missing access token" }, { status: 400 });
    }

    return NextResponse.json({ accessToken: accessToken }, {status: 200})
}
