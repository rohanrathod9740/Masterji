import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest) {
    try{
        const user = await getCurrentUser();
        if(!user){
            return NextResponse.json({
                message:"You are not authenticated!"
            },{status:401})
        }
        return NextResponse.json(user);
    }
    catch(error)
    {
        console.error("error: ",error)
        return NextResponse.json({
            message:"Internal Server Error. Something went wrong."
        },{status:500})
    }
}