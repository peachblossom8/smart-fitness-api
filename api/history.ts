import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user_id = req.query.user_id as string;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    // Fetch meals
    const { data: meals, error: mealError } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user_id);

    // Fetch workouts
    const { data: workouts, error: workoutError } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user_id);

    if (mealError || workoutError) {
      console.error('❌ Supabase errors:', mealError, workoutError);
      return res.status(500).json({ error: 'Failed to fetch history' });
    }

    // Combine + sort
    const history = [
      ...meals.map((m) => ({ type: 'meal', ...m })),
      ...workouts.map((w) => ({ type: 'workout', ...w })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return res.status(200).json(history);

  } catch (err) {
    console.error('❌ Server crash:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}