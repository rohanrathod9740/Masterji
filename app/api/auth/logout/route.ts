import { NextResponse } from "next/server"
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
    try {
        // Verify user is authenticated before logout
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        // Create response with success message
        const response = NextResponse.json(
            { message: "User logged out successfully" },
            { status: 200 }
        );

        // Clear the token cookie with multiple security measures:
        // 1. Set empty value
        // 2. Set maxAge to 0 (immediate expiration)
        // 3. Set expires to past date (Jan 1, 1970)
        response.cookies.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            expires: new Date(0), // Set to epoch (Jan 1, 1970)
            path: "/", // Ensure cookie is cleared across all paths
        });

        return response;
    } catch (error) {
        console.error("Logout error:", error);
        // Still clear the cookie even if getCurrentUser fails
        const response = NextResponse.json(
            { message: "Logout completed" },
            { status: 200 }
        );
        response.cookies.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            expires: new Date(0),
            path: "/",
        });
        return response;
    }
}