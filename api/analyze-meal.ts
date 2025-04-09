// /api/analyze-meal.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id, image_base64 } = req.body;
  if (!user_id || !image_base64) return res.status(400).json({ error: 'Missing user_id or image_base64' });

  try {
    const roboflowRes = await fetch('https://detect.roboflow.com/food-identifier-l0fli/3?api_key=IqOUsGAwYewqeHHiaEzK', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `image=${encodeURIComponent(`data:image/jpeg;base64,${image_base64}`)}`
    });

    const result = await roboflowRes.json();

    console.log('📦 Roboflow result:', result);

    // Mock fallback response
    const aiResponse = {
      meal_data: result.predictions?.[0]?.class || 'Unknown Meal',
      calories: 400,
      health_score: 2
    };

    return res.status(200).json(aiResponse);
  } catch (err: any) {
    return res.status(500).json({ error: 'AI analysis failed', details: err.message });
  }
}
