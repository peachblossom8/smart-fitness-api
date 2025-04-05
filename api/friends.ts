import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
  const path = Array.isArray(req.query.path) ? req.query.path[0] : req.query.path;

  console.log('📍 PATH =', path);
  const { user_id, friend_id } = req.body;
  console.log('📩 BODY =', { user_id, friend_id });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!user_id || !friend_id) {
    return res.status(400).json({ error: 'Missing user_id or friend_id' });
  }

  if (path === 'request') {
    const { error } = await supabase.from('friends').insert({
      user_id,
      friend_id,
      status: 'pending',
    });

    if (error) {
      console.error('❌ Insert error:', error);
      return res.status(500).json({ error: 'Insert failed' });
    }

    return res.status(200).json({ message: 'Friend request sent' });
  }

  if (path === 'accept') {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .match({ user_id, friend_id });

    if (error) {
      console.error('❌ Accept error:', error);
      return res.status(500).json({ error: 'Accept failed' });
    }

    return res.status(200).json({ message: 'Friend request accepted' });
  }

  return res.status(400).json({ error: 'Invalid path' });
}