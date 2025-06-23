// app/api/message/route.ts
import { NextResponse } from 'next/server';

let data = { record: { email: "test12@gmail.com" } };

export async function GET() {
  return NextResponse.json({
    status: 200,
    data,
  });
}

export async function POST(request: Request) {
  const req = await request.json();
  data = req;
  console.log("📨 Webhook triggered with payload:", req); // ✅ log here
  return NextResponse.json({
    status: 200,
    data,
    message: "Data has been updated",
  });
}
