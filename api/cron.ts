export default async function handler(req: any, res: any) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return res.status(500).json({ error: 'Supabase credentials missing' });
  }

  // The URL of the deployed Supabase Edge Function
  const functionUrl = `${supabaseUrl}/functions/v1/send-appointment-notifications`;

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Supabase function failed: ${errorText}` });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, message: 'Cron executed', data });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch', details: err.message });
  }
}
