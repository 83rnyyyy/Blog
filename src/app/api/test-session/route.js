import { NextResponse } from "next/server";
import { getAuthSession } from "@/utils/auth";

export async function GET() {
  const session = await getAuthSession();
  
  console.log("TEST SESSION:", session);
  
  return NextResponse.json({
    session,
    hasSession: !!session,
    user: session?.user || null,
    email: session?.user?.email || null,
  });
}