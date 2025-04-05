import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const path = Array.isArray(req.query.path) ? req.query.path[0] : req.query.path;

  if (path === 'request') {
    const { user_id, friend_id } = req.body;

    const { error } = await supabase.from('friends').insert({
      user_id,
      friend_id,
      status: 'pending',
    });

    if (error) {
      return res.status(500).json({ error: 'Failed to send friend request' });
    }

    return res.status(200).json({ message: 'Friend request sent' });
  }

  if (path === 'accept') {
    const { user_id, friend_id } = req.body;

    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .match({ user_id, friend_id });

    if (error) {
      return res.status(500).json({ error: 'Failed to accept friend request' });
    }

    return res.status(200).json({ message: 'Friend request accepted' });
  }

  return res.status(400).json({ error: 'Invalid path' });
}
