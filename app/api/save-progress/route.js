import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, weight, steps, date } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const logDate = date || new Date().toISOString().split('T')[0];

    const { data: existing } = await supabaseServer
      .from('progress_logs')
      .select('id')
      .eq('user_id', user_id)
      .eq('log_date', logDate)
      .single();

    if (existing) {
      const updateData = {};
      if (weight) updateData.current_weight = parseFloat(weight);
      if (steps) updateData.daily_steps = parseInt(steps, 10);

      await supabaseServer
        .from('progress_logs')
        .update(updateData)
        .eq('id', existing.id);
    } else {
      const insertData = { user_id, log_date: logDate };
      if (weight) insertData.current_weight = parseFloat(weight);
      if (steps) insertData.daily_steps = parseInt(steps, 10);

      await supabaseServer
        .from('progress_logs')
        .insert(insertData);
    }

    return NextResponse.json({ success: true, message: 'Progress saved!' });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
