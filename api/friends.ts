import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
  console.log('🔵 Function started');

  try {
    if (req.method !== 'POST') {
      console.log('🔴 Invalid method:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { user_id, friend_id } = req.body;
    console.log('🟢 Received body:', { user_id, friend_id });

    if (!user_id || !friend_id) {
      console.log('🔴 Missing required fields');
      return res.status(400).json({ error: 'Missing user_id or friend_id' });
    }

    const { error } = await supabase.from('friends').insert({
      user_id,
      friend_id,
      status: 'pending',
    });

    if (error) {
      console.error('❌ Supabase insert error:', JSON.stringify(error, null, 2));
      return res.status(500).json({ error: 'Failed to send friend request', details: error.message });
    }

    console.log('✅ Friend request inserted');
    return res.status(200).json({ message: 'Friend request sent' });

  } catch (err) {
    console.error('❌ Function crashed:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}