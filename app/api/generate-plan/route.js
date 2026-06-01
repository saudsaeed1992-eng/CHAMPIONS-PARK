import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import supabaseServer from '@/lib/supabaseServer';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const LANGUAGE_INSTRUCTIONS = {
  en: 'Generate ALL content in English.',
  ar: 'Generate ALL meal names, ingredient names, exercise notes, workout names, and instructions in Arabic (العربية). Keep exercise names in English but translate notes and descriptions to Arabic.',
  ku: 'Generate ALL meal names, ingredient names, exercise notes, workout names, and instructions in Kurdish Sorani (کوردی سۆرانی). Keep exercise names in English but translate notes and descriptions to Kurdish Sorani.',
  tr: 'Generate ALL meal names, ingredient names, exercise notes, workout names, and instructions in Turkish (Türkçe). Keep exercise names in English but translate notes and descriptions to Turkish.',
};

// Robust JSON parser — handles markdown fences and truncation
function parseJSON(rawText) {
  // Method 1: strip all markdown fences then parse
  try {
    let cleaned = rawText
      .replace(/^[\s\S]*?```json\s*/i, '')
      .replace(/^[\s\S]*?```\s*/i, '')
      .replace(/```[\s\S]*$/i, '')
      .trim();
    if (!cleaned.startsWith('{')) {
      const start = cleaned.indexOf('{');
      if (start !== -1) cleaned = cleaned.substring(start);
    }
    const end = cleaned.lastIndexOf('}');
    if (end !== -1) cleaned = cleaned.substring(0, end + 1);
    return JSON.parse(cleaned);
  } catch (e1) {
    // Method 2: extract between first { and last }
    try {
      const start = rawText.indexOf('{');
      const end = rawText.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        return JSON.parse(rawText.substring(start, end + 1));
      }
    } catch (e2) {}
    // Method 3: filter lines then parse
    try {
      const lines = rawText.split('\n').filter(l => !l.trim().startsWith('```'));
      const joined = lines.join('\n');
      const start = joined.indexOf('{');
      const end = joined.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        return JSON.parse(joined.substring(start, end + 1));
      }
    } catch (e3) {}
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { profile, goal_type } = body;

    if (!profile || !goal_type) {
      return NextResponse.json({ error: 'Missing profile or goal_type' }, { status: 400 });
    }

    const language = body.language || profile.language || 'en';
    const languageInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;
    const weightKg = parseFloat(profile.starting_weight) || 80;

    const injuriesText = profile.injuries
      ? 'The user has injuries: ' + profile.injuries + '. Avoid exercises that aggravate these.'
      : 'No reported injuries.';

    const equipmentText = profile.gym_equipment && profile.gym_equipment.length > 0
      ? 'Equipment: ' + profile.gym_equipment.join(', ') + '.'
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
      ? schedule.rest_days.join(', ') : 'Saturday, Sunday';
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

    const scheduleText = 'Workout window: ' + workoutStart + '-' + workoutEnd
      + ' | Plan: ' + planWeeks + ' weeks'
      + ' | Wake: ' + wakeTime + ' Sleep: ' + sleepTime
      + ' | Work: ' + workStart + '-' + workEnd
      + ' | Meals/day: ' + mealsPerDay
      + ' | Rest days: ' + restDays
      + ' | Workout days: ' + workoutDaysList.join(', ')
      + (dailyRoutine ? ' | Routine: ' + dailyRoutine : '')
      + (notes ? ' | Notes: ' + notes : '');

    let systemPrompt = '';
    let userPrompt = '';

    if (goal_type === 'weight_loss') {
      const dailyCalories = Math.round(weightKg * 24 * 0.8);
      const proteinGrams = Math.round(weightKg * 1.8);

      systemPrompt = 'You are an expert fat loss trainer. '
        + languageInstruction
        + ' You MUST respond with ONLY a raw JSON object. Absolutely NO markdown, NO code fences, NO backticks, NO text before or after. Start your response with { and end with }.';

      userPrompt = 'Create a ' + planWeeks + '-week weight loss plan for:\n'
        + profile.full_name + ', Age ' + profile.age + ', ' + profile.gender
        + ', ' + weightKg + 'kg -> ' + profile.target_weight + 'kg, ' + profile.height_cm + 'cm\n'
        + injuriesText + ' ' + equipmentText + '\n'
        + scheduleText + '\n'
        + 'Calories: ' + dailyCalories + '/day, Protein: ' + proteinGrams + 'g\n'
        + 'LANGUAGE: ' + languageInstruction + '\n'
        + 'RULES: Workouts ONLY on ' + workoutDaysList.join(', ') + '. NO workouts on ' + restDays + '. Max 4 exercises/day. ' + mealsPerDay + ' meals. Notes max 6 words. Instructions max 12 words. Day names MUST stay in English.\n\n'
        + 'OUTPUT: Raw JSON only, no markdown:\n'
        + '{"plan_type":"weight_loss","weekly_targets":{"calories_per_day":' + dailyCalories + ',"protein_grams":' + proteinGrams + ',"workout_days":' + workoutDaysPerWeek + ',"daily_steps":8000,"water_liters":2.5},'
        + '"workout_plan":{"weeks":[{"week":1,"days":[{"day":"Monday","name":"string","emoji":"string","type":"cardio","duration":"45 min","exercises":[{"name":"string","sets":"3","reps":"12","rest":"60s","notes":"string"}]}]}]},'
        + '"meal_plan":{"daily_calories":' + dailyCalories + ',"meals":[{"meal":"Breakfast","name":"string","calories":400,"protein":"30g","ingredients":["string"],"instructions":"string"}]},'
        + '"safety_notes":["string"],"motivation_message":"string"}';

    } else {
      const dailyCalories = Math.round(weightKg * 24 * 1.1);
      const proteinGrams = Math.round(weightKg * 2);

      systemPrompt = 'You are an expert bodybuilding coach. '
        + languageInstruction
        + ' You MUST respond with ONLY a raw JSON object. Absolutely NO markdown, NO code fences, NO backticks, NO text before or after. Start your response with { and end with }.';

      userPrompt = 'Create a ' + planWeeks + '-week bodybuilding plan for:\n'
        + profile.full_name + ', Age ' + profile.age + ', ' + profile.gender
        + ', ' + weightKg + 'kg -> ' + profile.target_weight + 'kg, ' + profile.height_cm + 'cm\n'
        + injuriesText + ' ' + equipmentText + '\n'
        + scheduleText + '\n'
        + 'Calories: ' + dailyCalories + '/day, Protein: ' + proteinGrams + 'g\n'
        + 'LANGUAGE: ' + languageInstruction + '\n'
        + 'RULES: Workouts ONLY on ' + workoutDaysList.join(', ') + '. NO workouts on ' + restDays + '. Push/Pull/Legs split. Max 4 exercises/day. ' + mealsPerDay + ' high-protein meals. Notes max 6 words. Instructions max 12 words. Day names MUST stay in English.\n\n'
        + 'OUTPUT: Raw JSON only, no markdown:\n'
        + '{"plan_type":"bodybuilding","weekly_targets":{"calories_per_day":' + dailyCalories + ',"protein_grams":' + proteinGrams + ',"workout_days":' + workoutDaysPerWeek + ',"daily_steps":6000,"water_liters":3.5},'
        + '"workout_plan":{"weeks":[{"week":1,"days":[{"day":"Monday","name":"string","emoji":"string","type":"strength","duration":"60 min","exercises":[{"name":"string","sets":"4","reps":"10","rest":"90s","notes":"string"}]}]}]},'
        + '"meal_plan":{"daily_calories":' + dailyCalories + ',"meals":[{"meal":"Breakfast","name":"string","calories":600,"protein":"50g","ingredients":["string"],"instructions":"string"}]},'
        + '"safety_notes":["string"],"motivation_message":"string"}';
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const rawText = message.content[0].text.trim();

    const planData = parseJSON(rawText);

    if (!planData) {
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: rawText.substring(0, 300) },
        { status: 500 }
      );
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
