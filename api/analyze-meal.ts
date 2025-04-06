import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, image_base64 } = req.body;

  if (!user_id || !image_base64) {
    return res.status(400).json({ error: 'Missing user_id or image_base64' });
  }

  try {
    // 🔮 Mock AI Response (replace this with real AI integration later)
    const aiResponse = {
      meal_data: 'Grilled chicken salad with avocado',
      calories: 350,
      health_score: 3,
    };

    const { data, error } = await supabase.from('meals').insert({
      user_id,
      image_url: '[captured]',
      meal_data: aiResponse.meal_data,
      calories: aiResponse.calories,
      health_score: aiResponse.health_score,
    });

    if (error) {
      console.error('DB insert error:', error);
      return res.status(500).json({ error: 'Failed to save meal' });
    }

    return res.status(200).json(aiResponse);
  } catch (err: any) {
    console.error('AI analysis failed:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}