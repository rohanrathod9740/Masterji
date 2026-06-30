import { AppointmentStatus } from "@/types";
import { NextRequest, NextResponse } from "next/server";
// see all appointments
// appointments in detail (ai enhanced summary, uploaded docs summary)
// approve delete reschedule appointment

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    void body; // placeholder — full implementation pending
    return NextResponse.json({ success: false, message: "Not implemented" }, { status: 501 });
  } catch {
    return NextResponse.json({ success: false, message: "Bad request" }, { status: 400 });
  }
}






