import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import supabaseServer from '@/lib/supabaseServer';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Language instruction map — tells Claude what language to generate content in
const LANGUAGE_INSTRUCTIONS = {
  en: 'Generate ALL content in English.',
  ar: 'Generate ALL meal names, ingredient names, exercise notes, workout names, and instructions in Arabic (العربية). Keep exercise names in English but translate notes and descriptions to Arabic.',
  ku: 'Generate ALL meal names, ingredient names, exercise notes, workout names, and instructions in Kurdish Sorani (کوردی سۆرانی). Keep exercise names in English but translate notes and descriptions to Kurdish Sorani.',
  tr: 'Generate ALL meal names, ingredient names, exercise notes, workout names, and instructions in Turkish (Türkçe). Keep exercise names in English but translate notes and descriptions to Turkish.',
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { profile, goal_type } = body;

    if (!profile || !goal_type) {
      return NextResponse.json({ error: 'Missing profile or goal_type' }, { status: 400 });
    }

    // Get language — from profile, body, or default to English
    const language = body.language || profile.language || 'en';
    const languageInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;

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

      systemPrompt = 'You are an expert personal trainer specializing in fat loss. '
        + languageInstruction
        + ' Respond with ONLY valid JSON. No markdown, no code fences, no extra text before or after the JSON.';

      userPrompt = 'Create a ' + planWeeks + '-week weight loss plan.\n'
        + 'Name: ' + profile.full_name + '\n'
        + 'Age: ' + profile.age + '\n'
        + 'Gender: ' + profile.gender + '\n'
        + 'Weight: ' + weightKg + 'kg, Target: ' + profile.target_weight + 'kg, Height: ' + profile.height_cm + 'cm\n'
        + injuriesText + '\n'
        + equipmentText + '\n'
        + scheduleText + '\n'
        + 'Daily calories: ' + dailyCalories + ', Protein: ' + proteinGrams + 'g\n\n'
        + 'LANGUAGE REQUIREMENT: ' + languageInstruction + '\n\n'
        + 'CRITICAL REQUIREMENTS:\n'
        + '- Generate exactly ' + planWeeks + ' weeks of workouts\n'
        + '- Each week must have workouts ONLY on: ' + workoutDaysList.join(', ') + '\n'
        + '- NO workouts on rest days: ' + restDays + '\n'
        + '- Schedule workouts within the ' + workoutStart + ' to ' + workoutEnd + ' window\n'
        + '- Generate ' + mealsPerDay + ' meal suggestions total (one per day rotating)\n'
        + '- Progressive intensity increase each week\n\n'
        + 'IMPORTANT: Keep exercise notes under 8 words. Keep meal instructions under 15 words. Be very concise.\n'
        + 'IMPORTANT: Day names in the JSON must stay in English (Monday, Tuesday etc) for system compatibility.\n\n'
        + 'Return ONLY valid JSON, no markdown, no code fences:\n'
        + '{"plan_type":"weight_loss","weekly_targets":{"calories_per_day":' + dailyCalories + ',"protein_grams":' + proteinGrams + ',"workout_days":' + workoutDaysPerWeek + ',"daily_steps":8000,"water_liters":2.5},"workout_plan":{"weeks":[{"week":1,"days":[{"day":"Monday","name":"string","emoji":"string","type":"cardio","duration":"string","exercises":[{"name":"string","sets":"string","reps":"string","rest":"string","notes":"string"}]}]}]},"meal_plan":{"daily_calories":' + dailyCalories + ',"meals":[{"meal":"Breakfast","name":"string","calories":0,"protein":"string","ingredients":["string"],"instructions":"string"}]},"safety_notes":["string"],"motivation_message":"string"}\n\n'
        + 'Generate ' + planWeeks + ' weeks, workouts ONLY on ' + workoutDaysList.join(', ') + '. Max 4 exercises per day. ' + mealsPerDay + ' meals total. Short notes. JSON only.';

    } else {
      const dailyCalories = Math.round(weightKg * 24 * 1.1);
      const proteinGrams = Math.round(weightKg * 2);

      systemPrompt = 'You are an expert bodybuilding coach. '
        + languageInstruction
        + ' Respond with ONLY valid JSON. No markdown, no code fences, no extra text before or after the JSON.';

      userPrompt = 'Create a ' + planWeeks + '-week bodybuilding plan.\n'
        + 'Name: ' + profile.full_name + '\n'
        + 'Age: ' + profile.age + '\n'
        + 'Gender: ' + profile.gender + '\n'
        + 'Weight: ' + weightKg + 'kg, Target: ' + profile.target_weight + 'kg, Height: ' + profile.height_cm + 'cm\n'
        + injuriesText + '\n'
        + equipmentText + '\n'
        + scheduleText + '\n'
        + 'Daily calories: ' + dailyCalories + ', Protein: ' + proteinGrams + 'g\n\n'
        + 'LANGUAGE REQUIREMENT: ' + languageInstruction + '\n\n'
        + 'CRITICAL REQUIREMENTS:\n'
        + '- Generate exactly ' + planWeeks + ' weeks of workouts\n'
        + '- Each week must have workouts ONLY on: ' + workoutDaysList.join(', ') + '\n'
        + '- NO workouts on rest days: ' + restDays + '\n'
        + '- Schedule workouts within the ' + workoutStart + ' to ' + workoutEnd + ' window\n'
        + '- Use Push/Pull/Legs/Upper split across the available workout days\n'
        + '- Generate ' + mealsPerDay + ' high-protein meal suggestions total\n'
        + '- Apply progressive overload in week 2 onwards\n\n'
        + 'IMPORTANT: Keep exercise notes under 8 words. Keep meal instructions under 15 words. Be very concise.\n'
        + 'IMPORTANT: Day names in the JSON must stay in English (Monday, Tuesday etc) for system compatibility.\n\n'
        + 'Return ONLY valid JSON, no markdown, no code fences:\n'
        + '{"plan_type":"bodybuilding","weekly_targets":{"calories_per_day":' + dailyCalories + ',"protein_grams":' + proteinGrams + ',"workout_days":' + workoutDaysPerWeek + ',"daily_steps":6000,"water_liters":3.5},"workout_plan":{"weeks":[{"week":1,"days":[{"day":"Monday","name":"string","emoji":"string","type":"strength","duration":"string","exercises":[{"name":"string","sets":"string","reps":"string","rest":"string","notes":"string"}]}]}]},"meal_plan":{"daily_calories":' + dailyCalories + ',"meals":[{"meal":"Breakfast","name":"string","calories":0,"protein":"string","ingredients":["string"],"instructions":"string"}]},"safety_notes":["string"],"motivation_message":"string"}\n\n'
        + 'Generate ' + planWeeks + ' weeks, workouts ONLY on ' + workoutDaysList.join(', ') + '. Max 4 exercises per day. ' + mealsPerDay + ' meals total. Short notes. JSON only.';
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const rawText = message.content[0].text.trim();

let planData;
try {
  // Strip markdown code fences if present
  let cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // Extract JSON object
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('No JSON found in response');
  }
  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  planData = JSON.parse(cleaned);
} catch (e) {
  try {
    const lines = rawText.split('\n').filter(l => !l.startsWith('```'));
    const joined = lines.join('\n');
    const s = joined.indexOf('{');
    const en = joined.lastIndexOf('}');
    planData = JSON.parse(joined.substring(s, en + 1));
  } catch (e2) {
   return NextResponse.json(
      { error: 'Failed to parse AI response', raw: rawText.substring(0, 200) },
      { status: 500 }
    );
  }
}
    if (profile.user_id) {
      await supabaseServer.from('ai_plans').insert({
        user_id: profile.user_id,
        plan_type: goal_type,
        plan_content: planData,
        language: language,
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
