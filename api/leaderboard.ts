// force redeploy 🎯

import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user_id = req.query.user_id as string;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id in query' });
  }

  // Get list of accepted friend IDs
  const { data: friendsData, error: friendsError } = await supabase
    .from('friends')
    .select('friend_id')
    .eq('user_id', user_id)
    .eq('status', 'accepted');

  if (friendsError) {
    console.error('Friends fetch error:', friendsError);
    return res.status(500).json({ error: 'Failed to fetch friends' });
  }

  const friendIds = friendsData.map(f => f.friend_id);
  const allIds = [...friendIds, user_id]; // include self

  // Fetch ranks of all IDs
  const { data: leaderboard, error: leaderboardError } = await supabase
    .from('ranks')
    .select(`
        user_id,
        total_points,
        current_rank,
        ranks_user_id_fkey (
          name
        )
      `)
    .in('user_id', allIds)
    .order('total_points', { ascending: false });

  if (leaderboardError) {
    console.error('Leaderboard fetch error:', leaderboardError);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }

  // Format nicely
  const result = leaderboard.map((entry: any) => ({
    user_id: entry.user_id,
    name: entry.ranks_user_id_fkey?.name || 'Unknown',
    rank: entry.current_rank,
    points: entry.total_points,
  }));  

  return res.status(200).json(result);
}
