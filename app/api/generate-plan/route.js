import { NextResponse } from 'next/server';
import anthropic from '@/lib/anthropic';
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
      ? `The user has the following injuries: ${profile.injuries}. Avoid exercises that aggravate these.`
      : 'The user has no reported injuries.';
    const equipmentText = profile.gym_equipment && profile.gym_equipment.length > 0
      ? `Available equipment: ${profile.gym_equipment.join(', ')}.`
      : 'Equipment: bodyweight only.';

    let systemPrompt = '';
    let userPrompt = '';

    if (goal_type === 'weight_loss') {
      const dailyCalories = Math.round(weightKg * 24 * 0.8);
      const proteinGrams = Math.round(weightKg * 1.8);
      systemPrompt = `You are an expert personal trainer specializing in fat loss. Respond with ONLY valid JSON — no markdown, no code fences, no extra text.`;
      userPrompt = `Create a 2-week weight loss plan for:
- Name: ${profile.full_name}, Age: ${profile.age}, Gender: ${profile.gender}
- Weight: ${weightKg}kg, Target: ${profile.target_weight}kg, Height: ${profile.height_cm}cm
- ${injuriesText}
- ${equipmentText}
- 3 workout days/week, cardio-focused, low impact if injuries
- Daily calories: ${dailyCalories}, Protein: ${proteinGrams}g
Return ONLY this JSON structure:
{
  "plan_type": "weight_loss",
  "weekly_targets": { "calories_per_day": ${dailyCalories}, "protein_grams": ${proteinGrams}, "workout_days": 3, "daily_steps": 8000, "water_liters": 2.5 },
  "workout_plan": { "weeks": [{ "week": 1, "days": [{ "day": "Monday", "name": "string", "emoji": "string", "type": "cardio", "duration": "string", "exercises": [{ "name": "string", "sets": "string", "reps": "string", "rest": "string", "notes": "string" }] }] }, { "week": 2, "days": [] }] },
  "meal_plan": { "daily_calories": ${dailyCalories}, "meals": [{ "meal": "Breakfast", "name": "string", "calories": 0, "protein": "string", "ingredients": ["string"], "instructions": "string" }] },
  "safety_notes": ["string"],
  "motivation_message": "string"
}
Generate full 3 workout days for week 1 and week 2, plus 7 meal suggestions. Respond with ONLY the JSON.`;
    } else {
      const dailyCalories = Math.round(weightKg * 24 * 1.1);
      const proteinGrams = Math.round(weightKg * 2);
      systemPrompt = `You are an expert bodybuilding coach. Respond with ONLY valid JSON — no markdown, no code fences, no extra text.`;
      userPrompt = `Create a 2-week bodybuilding plan for:
- Name: ${profile.full_name}, Age: ${profile.age}, Gender: ${profile.gender}
- Weight: ${weightKg}kg, Target: ${profile.target_weight}kg, Height: ${profile.height_cm}cm
- ${injuriesText}
- ${equipmentText}
- 4 workout days/week, Push/Pull/Legs/Upper split, progressive overload
- Daily calories: ${dailyCalories}, Protein: ${p
