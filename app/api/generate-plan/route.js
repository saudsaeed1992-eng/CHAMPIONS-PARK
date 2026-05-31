import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import supabaseServer from '@/lib/supabaseServer';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    const schedule = profile.schedule || {};
    const workoutStart = schedule.workout_start || '07:00';
    const workoutEnd = schedule.workout_end || '08:00';
    const planStartDate = schedule.plan_start_date || new Date().toISOString().split('T')[0];
    const planEndDate = schedule.plan_end_date || '';
    const wakeTime = schedule.wake_time || '06:00';
    const sleepTime = schedule.sleep_time || '23:00';
    const workStart = schedule.work_start || '09:00';
    const workEnd = schedule.work_end || '17:00';
    const mealsPerDay = schedule.meals_per_day || '3';
    const restDays = schedule.rest_days && schedule.rest_days.length > 0
      ? schedule.rest_days.join(', ')
      : 'Saturday, Sunday';
    const dailyRoutine = schedule.daily_routine || '';
    const notes = schedule.notes || '';

    const planDays = planStartDate && planEndDate
      ? Math.ceil((new Date(planEndDate) - new Date(planStartDate)) / (1000 * 60 * 60 * 24))
      : 14;
    const planWeeks = Math.max(2, Math.ceil(planDays / 7));

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const restDaysList = restDays.split(',').map(d => d.trim());
    const workoutDaysList = daysOfWeek.filter(d => !restDaysList.includes(d));
    const workoutDaysPerWeek = workoutDaysList.length;

    const scheduleText = 'Schedule details:\n'
      + '- Workout time window: ' + workoutStart + ' to ' + workoutEnd + '\n'
      + '- Plan duration: ' + planStartDate + ' to ' + (planEndDate || 'ongoing') + ' (' + planDays + ' days / ' + planWeeks + ' weeks)\n'
      + '- Wake up time: ' + wakeTime + '\n'
      + '- Sleep time: ' + sleepTime + '\n'
      + '- Work/school hours: ' + workStart + ' to ' + workEnd + '\n'
      + '- Meals per day: ' + mealsPerDay + '\n'
      + '- Rest days: ' + restDays + '\n'
      + '- Workout days: ' + workoutDaysList.join(', ') + ' (' + workoutDaysPerWeek + ' days per week)\n'
      + (dailyRoutine ? '- Daily routine: ' + dailyRoutine + '\n' : '')
      + (notes ? '- Additional notes: ' + notes + '\n' : '');

    let systemPrompt = '';
    let userPrompt = '';

    if (goal_type === 'weight_loss') {
      const dailyCalories = Math.round(weightKg * 24 * 0.8);
      const proteinGrams = Math.round(weightKg * 1.8);

      systemPrompt = 'You are an expert personal trainer specializing in fat loss. Respond with ONLY valid JSON. No markdown, no code fences, no extra text before or after the JSON.';

      userPrompt = 'Create a ' + planWeeks + '-week weight loss plan.\n'
        + 'Name: ' + profile.full_name + '\n'
        + 'Age: ' + profile.age + '\n'
        + 'Gender: ' + profile.gender + '\n'
        + 'Weight: ' + weightKg + 'kg, Target: ' + profile.target_weight + 'kg, Height: ' + profile.height_cm + 'cm\n'
        + injuriesText + '\n'
        + equipmentText + '\n'
        + scheduleText + '\n'
        + 'Daily calories: ' + dailyCalories + ', Protein: ' + proteinGrams + 'g\n\n'
        + 'CRITICAL REQUIREMENTS:\n'
        + '- Generate exactly ' + planWeeks + ' weeks of workouts\n'
        + '- Each week must have workouts ONLY on: ' + workoutDaysList.join(', ') + '\n'
        + '- NO workouts on rest days: ' + restDays + '\n'
        + '- Schedule workouts within the ' + workoutStart + ' to ' + workoutEnd + ' window\n'
        + '- Generate ' + mealsPerDay + ' meal suggestions total (one per day rotating)\n'
        + '- Progressive intensity increase each week\n\n'
        + 'Return ONLY this JSON structure, no other text:\n'
        + '{"plan_type":"weight_loss","weekly_targets":{"calories_per_day":' + dailyCalories + ',"protein_grams":' + proteinGrams + ',"workout_days":' + workoutDaysPerWeek + ',"daily_steps":8000,"water_liters":2.5},"workout_plan":{"weeks":[{"week":1,"days":[{"day":"Monday","name":"string","emoji":"string","type":"cardio","duration":"string","exercises":[{"name":"string","sets":"string","reps":"string","rest":"string","notes":"string"}]}]}]},"meal_plan":{"daily_calories":' + dailyCalories + ',"meals":[{"meal":"Breakfast","name":"string","calories":0,"protein":"string","ingredients":["string"],"instructions":"string"}]},"safety_notes":["string"],"motivation_message":"string"}\n\n'
        + 'Generate all ' + planWeeks + ' weeks with workouts only on ' + workoutDaysList.join(', ') + '. Generate ' + mealsPerDay + ' varied meals. Respond with ONLY the JSON object.';

    } else {
      const dailyCalories = Math.round(weightKg * 24 * 1.1);
      const proteinGrams = Math.round(weightKg * 2);

      systemPrompt = 'You are an expert bodybuilding coach. Respond with ONLY valid JSON. No markdown, no code fences, no extra text before or after the JSON.';

      userPrompt = 'Create a ' + planWeeks + '-week bodybuilding plan.\n'
        + 'Name: ' + profile.full_name + '\n'
        + 'Age: ' + profile.age + '\n'
        + 'Gender: ' + profile.gender + '\n'
        + 'Weight: ' + weightKg + 'kg, Target: ' + profile.target_weight + 'kg, Height: ' + profile.height_cm + 'cm\n'
        + injuriesText + '\n'
        + equipmentText + '\n'
        + scheduleText + '\n'
        + 'Daily calories: ' + dailyCalories + ', Protein: ' + proteinGrams + 'g\n\n'
        + 'CRITICAL REQUIREMENTS:\n'
        + '- Generate exactly ' + planWeeks + ' weeks of workouts\n'
        + '- Each week must have workouts ONLY on: ' + workoutDaysList.join(', ') + '\n'
        + '- NO workouts on rest days: ' + restDays + '\n'
        + '- Schedule workouts within the ' + workoutStart + ' to ' + workoutEnd + ' window\n'
        + '- Use Push/Pull/Legs/Upper split across the available workout days\n'
        + '- Generate ' + mealsPerDay + ' high-protein meal suggestions total\n'
        + '- Apply progressive overload in week 2 onwards\n\n'
        + 'Return ONLY this JSON structure, no other text:\n'
        + '{"plan_type":"bodybuilding","weekly_targets":{"calories_per_day":' + dailyCalories + ',"protein_grams":' + proteinGrams + ',"workout_days":' + workoutDaysPerWeek + ',"daily_steps":6000,"water_liters":3.5},"workout_plan":{"weeks":[{"week":1,"days":[{"day":"Monday","name":"string","emoji":"string","type":"strength","duration":"string","exercises":[{"name":"string","sets":"string","reps":"string","rest":"string","notes":"string"}]}]}]},"meal_plan":{"daily_calories":' + dailyCalories + ',"meals":[{"meal":"Breakfast","name":"string","calories":0,"protein":"string","ingredients":["string"],"instructions":"string"}]},"safety_notes":["string"],"motivation_message":"string"}\n\n'
        + 'Generate all ' + planWeeks + ' weeks with workouts only on ' + workoutDaysList.join(', ') + '. Generate ' + mealsPerDay + ' varied high-protein meals. Respond with ONLY the JSON object.';
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const rawText = message.content[0].text.trim();

    let planData;
    try {
      const jsonStart = rawText.indexOf('{');
      const jsonEnd = rawText.lastIndexOf('}');
      const cleaned = rawText.substring(jsonStart, jsonEnd + 1);
      planData = JSON.parse(cleaned);
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse AI response', raw: rawText.substring(0, 200) }, { status: 500 });
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
