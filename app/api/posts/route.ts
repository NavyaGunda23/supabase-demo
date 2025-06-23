// app/api/message/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://csmnfsxynsvswaqrhhuj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbW5mc3h5bnN2c3dhcXJoaHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjgzNTQsImV4cCI6MjA2NTkwNDM1NH0.pUTc3YD6VYHRJObwk0UYgADWTxeFKgRF-D03BWEeOk0';
const supabase = createClient(supabaseUrl, supabaseKey);

// let webhookData = { record: { email: "test12@gmail.com" } };

const posts = [
  { id: 1, name: "First post", description: "Hello world" },
  { id: 2, name: "Second post", description: "More content here" },
];


export async function GET() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: posts });
}

export async function POST(request: Request) {
  const body = await request.json();
  console.log("testing data",request)


  const { name, description } = body;

    const { data, error } = await supabase
      .from('posts')
      .insert([{ name, description }]);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
}
