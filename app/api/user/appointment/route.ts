import { AppointmenStatus } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken } from "@/lib/auth";
// see all appintments
// appointments in detail (ai enhanced summary, uploaded docs summary)
// approve delete reschedule appointment

export async function POST(request:NextRequest){
    try{
        const body = await request.json();
    }
    catch{
    }
}





