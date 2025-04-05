import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { user_id, friend_id } = req.body;

    if (!user_id || !friend_id) {
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

    return res.status(200).json({ message: 'Friend request sent' });

  } catch (err) {
    console.error('❌ Function crashed:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
