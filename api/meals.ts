import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, image_url, calories, health_score, meal_data } = req.body;

  const { error } = await supabase.from('meals').insert({
    user_id,
    image_url,
    calories,
    health_score,
    meal_data,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Failed to save meal', details: error.message });
  }

  return res.status(200).json({ message: 'Meal saved successfully' });
}