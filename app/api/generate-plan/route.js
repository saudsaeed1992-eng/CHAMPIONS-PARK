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

function parseJSON(rawText) {
  try {
    let cleaned = rawText
      .replace(/```json/gi, '')
      .replace(/```/gi, '')
      .replace(/`/gi, '')
      .trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.substring(start, end + 1));
    }
  } catch (e1) {}
  try {
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(rawText.substring(start, end + 1));
    }
  } catch (e2) {}
  return null;
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
      ? 'Injuries: ' + profile.injuries + '. Avoid aggravating exercises.'
      : 'No injuries.';

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

    const scheduleText = 'Workout: ' + workoutStart + '-' + workoutEnd
      + ', Plan: ' + planWeeks + ' weeks'
      + ', Wake: ' + wakeTime + ', Sleep: ' + sleepTime
      + ', Work: ' + workStart + '-' + workEnd
      + ', Meals/day: ' + mealsPerDay
      + ', Rest: ' + restDays
      + ', Train on: ' + workoutDaysList.join(', ')
      + (dailyRoutine ? ', Routine: ' + dailyRoutine : '')
      + (notes ? ', Notes: ' + notes : '');

    let systemPrompt = '';
    let userPrompt = '';

    if (goal_type === 'weight_loss') {
      const dailyCalories = Math.round(weightKg * 24 * 0.8);
      const proteinGrams = Math.round(weightKg * 1.8);

      systemPrompt = 'You are a fat loss trainer. '
        + languageInstruction
        + ' IMPORTANT: Reply with ONLY a JSON object. No backticks. No markdown. No code fences. Start directly with { and end with }.';

      userPrompt = 'Fat loss plan for: ' + profile.full_name
        + ', Age ' + profile.age + ', ' + profile.gender
        + ', ' + weightKg + 'kg to ' + profile.target_weight + 'kg, ' + profile.height_cm + 'cm. '
        + injuriesText + ' ' + equipmentText + ' ' + scheduleText + '. '
        + 'Calories: ' + dailyCalories + ', Protein: ' + proteinGrams + 'g. '
        + languageInstruction + ' '
        + 'Train ONLY on: ' + workoutDaysList.join(', ') + '. NO training on: ' + restDays + '. '
        + 'Max 4 exercises per day. ' + mealsPerDay + ' meals. Keep notes under 6 words. Keep instructions under 12 words. Day names must be in English. '
        + 'Reply with this JSON structure only:\n'
        + '{"plan_type":"weight_loss",'
        + '"weekly_targets":{"calories_per_day":' + dailyCalories + ',"protein_grams":' + proteinGrams + ',"workout_days":' + workoutDaysPerWeek + ',"daily_steps":8000,"water_liters":2.5},'
        + '"workout_plan":{"weeks":[{"week":1,"days":[{"day":"Monday","name":"Upper Body","emoji":"💪","type":"cardio","duration":"45 min","exercises":[{"name":"Jumping Jacks","sets":"3","reps":"20","rest":"30s","notes":"keep pace steady"}]}]}]},'
        + '"meal_plan":{"daily_calories":' + dailyCalories + ',"meals":[{"meal":"Breakfast","name":"Oats Bowl","calories":400,"protein":"25g","ingredients":["80g oats","200ml milk"],"instructions":"Mix oats with milk and heat"}]},'
        + '"safety_notes":["Stay hydrated"],"motivation_message":"You can do this!"}';

    } else {
      const dailyCalories = Math.round(weightKg * 24 * 1.1);
      const proteinGrams = Math.round(weightKg * 2);

      systemPrompt = 'You are a bodybuilding coach. '
        + languageInstruction
        + ' IMPORTANT: Reply with ONLY a JSON object. No backticks. No markdown. No code fences. Start directly with { and end with }.';

      userPrompt = 'Bodybuilding plan for: ' + profile.full_name
        + ', Age ' + profile.age + ', ' + profile.gender
        + ', ' + weightKg + 'kg to ' + profile.target_weight + 'kg, ' + profile.height_cm + 'cm. '
        + injuriesText + ' ' + equipmentText + ' ' + scheduleText + '. '
        + 'Calories: ' + dailyCalories + ', Protein: ' + proteinGrams + 'g. '
        + languageInstruction + ' '
        + 'Train ONLY on: ' + workoutDaysList.join(', ') + '. NO training on: ' + restDays + '. '
        + 'Use Push/Pull/Legs split. Max 4 exercises per day. ' + mealsPerDay + ' high-protein meals. Keep notes under 6 words. Keep instructions under 12 words. Day names must be in English. '
        + 'Reply with this JSON structure only:\n'
        + '{"plan_type":"bodybuilding",'
        + '"weekly_targets":{"calories_per_day":' + dailyCalories + ',"protein_grams":' + proteinGrams + ',"workout_days":' + workoutDaysPerWeek + ',"daily_steps":6000,"water_liters":3.5},'
        + '"workout_plan":{"weeks":[{"week":1,"days":[{"day":"Monday","name":"Push Day","emoji":"💪","type":"strength","duration":"60 min","exercises":[{"name":"Bench Press","sets":"4","reps":"10","rest":"90s","notes":"control the descent"}]}]}]},'
        + '"meal_plan":{"daily_calories":' + dailyCalories + ',"meals":[{"meal":"Breakfast","name":"Protein Oats","calories":600,"protein":"45g","ingredients":["100g oats","2 eggs","30g protein powder"],"instructions":"Cook oats add eggs and protein"}]},'
        + '"safety_notes":["Warm up before lifting"],"motivation_message":"Build your champion body!"}';
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
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
