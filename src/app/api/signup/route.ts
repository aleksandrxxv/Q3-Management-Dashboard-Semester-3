import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // TODO: Save user in DB
  console.log("New user created:", email);

  return NextResponse.json({ success: true });
}
