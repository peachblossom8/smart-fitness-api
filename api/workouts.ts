import { supabase } from '../lib/supabaseClient';

const MET = {
  low: 4.0,
  medium: 6.0,
  high: 8.0,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, type, duration_min, intensity, weight_kg } = req.body;

  const met = MET[intensity] || 6.0;
  const calories = met * weight_kg * duration_min * 0.0175;
  const points = Math.floor(calories / 5);

  // Insert workout
  const { error: workoutError } = await supabase.from('workouts').insert({
    user_id,
    type,
    duration_min,
    intensity,
    calories_burned: calories,
    points_earned: points,
    created_at: new Date().toISOString(),
  });

  if (workoutError) {
    console.error('Workout insert error:', workoutError);
    return res.status(500).json({ error: 'Failed to save workout' });
  }

  // Get total points
  const { data: totalPointsData, error: totalPointsError } = await supabase
    .from('workouts')
    .select('points_earned')
    .eq('user_id', user_id);

  if (totalPointsError) {
    return res.status(500).json({ error: 'Failed to fetch points' });
  }

  const totalPoints = totalPointsData.reduce((sum, w) => sum + w.points_earned, 0);

  const rank =
    totalPoints >= 5000 ? 'Titan' :
    totalPoints >= 3000 ? 'Diamond' :
    totalPoints >= 2000 ? 'Platinum' :
    totalPoints >= 1000 ? 'Gold' :
    totalPoints >= 500 ? 'Silver' : 'Bronze';

  // Upsert rank
  const { error: rankError } = await supabase.from('ranks').upsert({
    user_id,
    total_points: totalPoints,
    current_rank: rank,
    last_updated: new Date().toISOString(),
  });

  if (rankError) {
    console.error('Rank upsert error:', rankError);
    return res.status(500).json({ error: 'Failed to update rank' });
  }

  return res.status(200).json({ calories, points, rank });
}
