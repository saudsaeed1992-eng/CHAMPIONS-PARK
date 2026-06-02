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
      ? 'Injuries: ' + profile.injuries + '. Avoid these.'
      : 'No injuries.';

    const equipmentText = profile.gym_equipment && profile.gym_equipment.length > 0
      ? 'Equipment: ' + profile.gym_equipment.join(', ') + '.'
      : 'Bodyweight only.';

    const schedule = profile.schedule || {};
    const workoutStart = schedule.workout_start || '07:00';
    const workoutEnd = schedule.workout_end || '08:00';
    const planStartDate = schedule.plan_start_date || new Date().toISOString().split('T')[0];
    const planEndDate = schedule.plan_end_date || '';
    const mealsPerDay = parseInt(schedule.meals_per_day) || 3;
    const restDays = schedule.rest_days && schedule.rest_days.length > 0
      ? schedule.rest_days.join(', ') : 'Saturday, Sunday';

    const planDays = planStartDate && planEndDate
      ? Math.ceil((new Date(planEndDate) - new Date(planStartDate)) / (1000 * 60 * 60 * 24))
      : 14;
    const planWeeks = Math.max(2, Math.ceil(planDays / 7));

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const restDaysList = restDays.split(',').map(d => d.trim());
    const workoutDaysList = daysOfWeek.filter(d => !restDaysList.includes(d));
    const workoutDaysPerWeek = workoutDaysList.length;

    // Build weeks array for the prompt
    const weeksArray = [];
    for (let w = 1; w <= planWeeks; w++) {
      const days = workoutDaysList.map(day => ({
        day,
        name: 'Workout',
        emoji: '💪',
        type: goal_type === 'weight_loss' ? 'cardio' : 'strength',
        duration: workoutStart + '-' + workoutEnd,
        exercises: []
      }));
      weeksArray.push({ week: w, days });
    }

    const mealsArray = [];
    const mealNames = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout'];
    for (let m = 0; m < mealsPerDay; m++) {
      mealsArray.push({
        meal: mealNames[m] || 'Meal ' + (m + 1),
        name: '',
        calories: 0,
        protein: '',
        ingredients: [],
        instructions: ''
      });
    }

    if (goal_type === 'weight_loss') {
      const dailyCalories = Math.round(weightKg * 24 * 0.8);
      const proteinGrams = Math.round(weightKg * 1.8);

      const systemPrompt = 'You are a fat loss trainer. ' + languageInstruction + ' Reply with ONLY raw JSON. No backticks. No markdown. Start with { end with }.';

      const userPrompt = 'Create ' + planWeeks + '-week fat loss plan. '
        + profile.full_name + ', ' + profile.age + 'y, ' + profile.gender + ', '
        + weightKg + 'kg->' + profile.target_weight + 'kg, ' + profile.height_cm + 'cm. '
        + injuriesText + ' ' + equipmentText
        + ' Train: ' + workoutDaysList.join(',') + '. Rest: ' + restDays + '.'
        + ' ' + dailyCalories + 'cal, ' + proteinGrams + 'g protein.'
        + ' ' + languageInstruction
        + ' Rules: 3 exercises/day max, notes under 5 words, instructions under 10 words, day names in English only.'
        + '\n\nJSON:\n'
        + '{"plan_type":"weight_loss","weekly_targets":{"calories_per_day":' + dailyCalories + ',"protein_grams":' + proteinGrams + ',"workout_days":' + workoutDaysPerWeek + ',"daily_steps":8000,"water_liters":2.5},'
        + '"workout_plan":{"weeks":' + JSON.stringify(weeksArray) + '},'
        + '"meal_plan":{"daily_calories":' + dailyCalories + ',"meals":' + JSON.stringify(mealsArray) + '},'
        + '"safety_notes":[],"motivation_message":""}';

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
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

    } else {
      const dailyCalories = Math.round(weightKg * 24 * 1.1);
      const proteinGrams = Math.round(weightKg * 2);

      const systemPrompt = 'You are a bodybuilding coach. ' + languageInstruction + ' Reply with ONLY raw JSON. No backticks. No markdown. Start with { end with }.';

      const userPrompt = 'Create ' + planWeeks + '-week bodybuilding plan. '
        + profile.full_name + ', ' + profile.age + 'y, ' + profile.gender + ', '
        + weightKg + 'kg->' + profile.target_weight + 'kg, ' + profile.height_cm + 'cm. '
        + injuriesText + ' ' + equipmentText
        + ' Train: ' + workoutDaysList.join(',') + '. Rest: ' + restDays + '.'
        + ' ' + dailyCalories + 'cal, ' + proteinGrams + 'g protein.'
        + ' ' + languageInstruction
        + ' Rules: Push/Pull/Legs split, 3 exercises/day max, notes under 5 words, instructions under 10 words, day names in English only.'
        + '\n\nJSON:\n'
        + '{"plan_type":"bodybuilding","weekly_targets":{"calories_per_day":' + dailyCalories + ',"protein_grams":' + proteinGrams + ',"workout_days":' + workoutDaysPerWeek + ',"daily_steps":6000,"water_liters":3.5},'
        + '"workout_plan":{"weeks":' + JSON.stringify(weeksArray) + '},'
        + '"meal_plan":{"daily_calories":' + dailyCalories + ',"meals":' + JSON.stringify(mealsArray) + '},'
        + '"safety_notes":[],"motivation_message":""}';

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
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
    }

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
