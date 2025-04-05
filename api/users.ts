import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, name, email, age, sex, weight_kg } = req.body;

  if (!id || !name || !email || !age || !sex || !weight_kg) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { error } = await supabase
    .from('users')
    .upsert(
      { id, name, email, age, sex, weight_kg, created_at: new Date().toISOString() },
      { onConflict: ['id'] }
    );

  if (error) {
    console.error('❌ User upsert error:', error);
    return res.status(500).json({ error: 'Failed to save user', details: error.message });
  }

  return res.status(200).json({ message: 'User profile saved' });
}