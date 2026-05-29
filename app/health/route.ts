import { checkDbConnection } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const isConnected = await checkDbConnection();
    if(!isConnected){
        return NextResponse.json(
            {
                message:"Database connection failed"
            },
            {status:503}
        )
    }

    return NextResponse.json(
        {message:"Database connected successfully!"},
        {status:200}
    )
    
}