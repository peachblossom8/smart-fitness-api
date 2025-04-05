import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
  console.log('📥 /api/users hit');

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, name, email, age, sex, weight_kg } = req.body;

  console.log('📄 Body:', { id, name, email, age, sex, weight_kg });

  if (!id || !name || !email || !age || !sex || !weight_kg) {
    console.log('⚠️ Missing fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { error } = await (supabase as any)
  .from('users')
  .upsert(
    { id, name, email, age, sex, weight_kg, created_at: new Date().toISOString() },
    { onConflict: ['id'] }
  );

  if (error) {
    console.error('❌ Supabase upsert error:', error);
    return res.status(500).json({ error: 'Failed to save user', details: error.message });
  }

  console.log('✅ User saved!');
  return res.status(200).json({ message: 'User profile saved' });
}
