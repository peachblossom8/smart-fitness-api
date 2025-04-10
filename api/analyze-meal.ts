// /api/analyze-meal.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id, image_base64 } = req.body;
  if (!user_id || !image_base64) return res.status(400).json({ error: 'Missing user_id or image_base64' });

  try {
    const roboflowRes = await fetch('https://serverless.roboflow.com/infer/workflows/smart-fitness/custom-workflow-3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: 'IqOUsGAwYewqeHHiaEzK',
        inputs: {
          image: {
            type: 'base64',
            value: image_base64,
          },
        },
      }),
    });

    const result = await roboflowRes.json();
    console.log('📦 Roboflow result:', result);

    const prediction = result.predictions?.[0];

    const aiResponse = {
      meal_data: prediction?.class || 'Unknown Meal',
      calories: 400, // Optional: map prediction.class → calorie estimate
      health_score: 2, // Optional: assign based on class or confidence
    };

    return res.status(200).json(aiResponse);
  } catch (err: any) {
    return res.status(500).json({ error: 'AI analysis failed', details: err.message });
  }
}
