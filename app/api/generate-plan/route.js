import { NextResponse } from 'next/server';
import getClient from '@/lib/anthropic';
import supabaseServer from '@/lib/supabaseServer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { profile, goal_type } = body;

    if (!profile || !goal_type) {
      return NextResponse.json({ error: 'Missing profile or goal_type' }, { status: 400 });
    }

    const weightKg = parseFloat(profile.starting_weight) || 80;

    const injuriesText = profile.injuries
      ? 'The user has injuries: ' + profile.injuries + '. Avoid exercises that aggravate these.'
      : 'The user has no reported injuries.';

    const equipmentText = profile.gym_equipment && profile.gym_equipment.length > 0
      ? 'Available equipment: ' + profile.gym_equipment.join(', ') + '.'
      : 'Equipment: bodyweight only.';

    let systemPrompt = '';
    let userPrompt = '';

    if (goal_type === 'weight_loss') {
      const dailyCalories = Math.round(weightKg * 24 * 0.8);
      const proteinGrams = Math.round(weightKg * 1.8);

      systemPrompt = 'You are an expert personal trainer specializing in fat loss. Respond with ONLY valid JSON. No markdown, no code fences, no extra text.';

      userPrompt = 'Create a 2-week weight loss plan.\n'
        + 'Name: ' + profile.full_name + '\n'
        + 'Age: ' + profile.age + '\n'
        + 'Gender: ' + profile.gender + '\n'
        + 'Weight: ' + weightKg + 'kg\n'
        + 'Target: ' + profile.target_weight + 'kg\n'
        + 'Height: ' + profile.height_cm + 'cm\n'
        + injuriesText + '\n'
        + equipmentText + '\n'
        + '3 workout days per week, cardio-focused.\n'
        + 'Daily calories: ' + dailyCalories + '\n'
        + 'Daily protein: ' + proteinGrams + 'g\n'
        + 'Return ONLY valid JSON with this structure:\n'
        + '{"plan_type":"weight_loss","weekly_targets":{"calories_per_day":' + dailyCalories + ',"protein_grams":' + proteinGrams + ',"workout_days":3,"daily_steps":8000,"water_liters":2.5},"workout_plan":{"weeks":[{"week":1,"days":[{"day":"Monday","name":"string","emoji":"string","type":"cardio","duration":"string","exercises":[{"name":"string","sets":"string","reps":"string","rest":"string","notes":"string"}]}]},{"week":2,"days":[]}]},"meal_plan":{"daily_calories":' + dailyCalories + ',"meals":[{"meal":"Breakfast","name":"string","calories":0,"protein":"string","ingredients":["string"],"instructions":"string"}]},"safety_notes":["string"],"motivation_message":"string"}\n'
        + 'Generate 3 workout days for week 1, 3 for week 2, and 7 meals. Respond with ONLY the JSON.';

    } else {
      const dailyCalories = Math.round(weightKg * 24 * 1.1);
      const proteinGrams = Math.round(weightKg * 2);

      systemPrompt = 'You are an expert bodybuilding coach. Respond with ONLY valid JSON. No markdown, no code fences, no extra text.';

      userPrompt = 'Create a 2-week bodybuilding plan.\n'
        + 'Name: ' + profile.full_name + '\n'
        + 'Age: ' + profile.age + '\n'
        + 'Gender: ' + profile.gender + '\n'
        + 'Weight: ' + weightKg + 'kg\n'
        + 'Target: ' + profile.target_weight + 'kg\n'
        + 'Height: ' + profile.height_cm + 'cm\n'
        + injuriesText + '\n'
        + equipmentText + '\n'
        + '4 workout days per week, Push/Pull/Legs/Upper split.\n'
        + 'Daily calories: ' + dailyCalories + '\n'
        + 'Daily protein: ' + proteinGrams + 'g\n'
        + 'Return ONLY valid JSON with this structure:\n'
        + '{"plan_type":"bodybuilding","weekly_targets":{"calories_per_day":' + dailyCalories + ',"protein_grams":' + proteinGrams + ',"workout_days":4,"daily_steps":6000,"water_liters":3.5},"workout_plan":{"weeks":[{"week":1,"days":[{"day":"Monday","name":"string","emoji":"string","type":"strength","duration":"string","exercises":[{"name":"string","sets":"string","reps":"string","rest":"string","notes":"string"}]}]},{"week":2,"days":[]}]},"meal_plan":{"daily_calories":' + dailyCalories + ',"meals":[{"meal":"Breakfast","name":"string","calories":0,"protein":"string","ingredients":["string"],"instructions":"string"}]},"safety_notes":["string"],"motivation_message":"string"}\n'
        + 'Generate 4 workout days for week 1, 4 for week 2 with progressive overload, and 7 meals. Respond with ONLY the JSON.';
    }

    const anthropic = getClient();
const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const rawText = message.content[0].text.trim();

    let planData;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      planData = JSON.parse(cleaned);
    } catch (e) {
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: rawText.substring(0, 200) },
        { status: 500 }
      );
    }

    if (profile.user_id) {
      await supabaseServer.from('ai_plans').insert({
        user_id: profile.user_id,
        plan_type: goal_type,
        plan_content: planData,
      });
    }

    return NextResponse.json({ success: true, plan: planData });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
