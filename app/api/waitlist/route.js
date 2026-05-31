import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, user_id } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const { data: existing } = await supabaseServer
      .from('waitlist')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      const { count } = await supabaseServer
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

      return NextResponse.json({
        success: true,
        already_registered: true,
        position: count || 1,
        total: count || 1,
        message: 'You are already on the waitlist!',
      });
    }

    await supabaseServer.from('waitlist').insert({
      email: email.toLowerCase().trim(),
      user_id: user_id || null,
      notified: false,
    });

    const { count } = await supabaseServer
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    const position = count || 1;

    return NextResponse.json({
      success: true,
      already_registered: false,
      position,
      total: position,
      message: `You're #${position} on the waitlist!`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { count } = await supabaseServer
      .from('waitlist')
      .select('*', { count: 'exact', head: true });
    return NextResponse.json({ total: count || 0 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
