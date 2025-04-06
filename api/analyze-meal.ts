import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../lib/supabaseClient';

type AnalyzeMealBody = {
  user_id: string;
  image_base64: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 Received POST request to /api/analyze-meal');
  console.log('📦 Body:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, image_base64 } = req.body as AnalyzeMealBody;

  if (!user_id || !image_base64) {
    return res.status(400).json({ error: 'Missing user_id or image_base64' });
  }

  try {
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
      console.error('❌ Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save meal', details: error.message });
    }

    return res.status(200).json(aiResponse);
  } catch (err: any) {
    console.error('AI analysis failed:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
